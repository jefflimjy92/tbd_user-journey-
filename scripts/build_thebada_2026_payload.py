#!/usr/bin/env python3
"""
Build a normalized Notion payload for the 2026 더바다 operations strategy.

Inputs:
  - 3년 인원 채용 계획.csv
  - 주식회사 더바다 사업계획서.docx

Output:
  - output/notion/thebada_2026_strategy_payload.json
"""

from __future__ import annotations

import csv
import json
import re
import zipfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "3년 인원 채용 계획.csv"
DOCX_PATH = ROOT / "주식회사 더바다 사업계획서.docx"
OUTPUT_PATH = ROOT / "output" / "notion" / "thebada_2026_strategy_payload.json"


def parse_int(value: str | None) -> int | None:
    if value is None:
        return None
    cleaned = value.strip().replace(",", "").replace(" ", "")
    if cleaned in {"", "-", "–"}:
        return None
    return int(float(cleaned))


def month_to_iso(month_kr: str) -> str:
    # "26년 2월" -> "2026-02-01"
    m = re.match(r"(\d{2})년\s*(\d{1,2})월", month_kr.strip())
    if not m:
        raise ValueError(f"Unexpected month format: {month_kr}")
    year = 2000 + int(m.group(1))
    month = int(m.group(2))
    return f"{year:04d}-{month:02d}-01"


def extract_docx_text(path: Path) -> str:
    with zipfile.ZipFile(path) as zf:
        xml = zf.read("word/document.xml")
    root = ET.fromstring(xml)
    ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
    texts = [t.text for t in root.findall(".//w:t", ns) if t.text]
    text = " ".join(texts)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def find_snippet(text: str, keyword: str, window: int = 320) -> str:
    idx = text.find(keyword)
    if idx < 0:
        return ""
    start = max(0, idx - 80)
    end = min(len(text), idx + window)
    snippet = text[start:end]
    snippet = re.sub(r"\s+", " ", snippet).strip()
    return snippet


@dataclass
class Row2026:
    label: str
    iso_month: str
    current_headcount: int
    planned_hires: int
    current_call_headcount: int
    call_hires: int
    claims_team: int
    monthly_premium: int
    revenue_1150: int
    total_expense: int
    final_profit: int
    roadmap_dev: str
    roadmap_action: str
    roadmap_note: str
    profit_margin: float
    gate_status: str
    adjusted_hires: int


def build_rows_2026(csv_path: Path) -> list[Row2026]:
    with csv_path.open(encoding="utf-8-sig", newline="") as f:
        raw_rows = list(csv.DictReader(f))

    rows = [r for r in raw_rows if r["년월"].startswith("26년")]
    out: list[Row2026] = []

    for r in rows:
        label = r["년월"].strip()
        planned_hires = parse_int(r["채용 인원"]) or 0
        revenue_1150 = parse_int(r["익월 수익(1150%)"]) or 0
        final_profit = parse_int(r["최종수익(익월)"]) or 0
        margin = (final_profit / revenue_1150) if revenue_1150 else 0.0

        if label in {"26년 2월", "26년 3월", "26년 4월"}:
            gate = "게이트 전"
            adjusted = planned_hires
        else:
            if margin >= 0.05:
                gate = "정상"
                adjusted = planned_hires
            elif margin >= 0.0:
                gate = "주의"
                adjusted = round(planned_hires * 0.5)
            else:
                gate = "위험"
                adjusted = 0

        out.append(
            Row2026(
                label=label,
                iso_month=month_to_iso(label),
                current_headcount=parse_int(r["현재 인원"]) or 0,
                planned_hires=planned_hires,
                current_call_headcount=parse_int(r["현재 콜 인원"]) or 0,
                call_hires=parse_int(r["콜 채용 인원"]) or 0,
                claims_team=parse_int(r["청구팀"]) or 0,
                monthly_premium=parse_int(r[" 월납 "]) or 0,
                revenue_1150=revenue_1150,
                total_expense=parse_int(r["지출 총액"]) or 0,
                final_profit=final_profit,
                roadmap_dev=(r.get("기획/개발") or "").strip(),
                roadmap_action=(r.get("액션") or "").strip(),
                roadmap_note=(r.get("비고") or "").strip(),
                profit_margin=margin,
                gate_status=gate,
                adjusted_hires=adjusted,
            )
        )

    return out


def build_january_backcast(feb: Row2026) -> dict[str, Any]:
    jan_current = feb.current_headcount - feb.planned_hires
    jan_call = feb.current_call_headcount - feb.call_hires
    return {
        "label": "26년 1월",
        "iso_month": "2026-01-01",
        "current_headcount": jan_current,
        "current_call_headcount": jan_call,
        "assumption": "인원지표만 역산. 재무 KPI는 2월부터 집계.",
    }


def strategic_theme(month_label: str) -> str:
    theme_map = {
        "26년 1월": "기반 구축",
        "26년 2월": "확장 시작",
        "26년 3월": "MVP 출시",
        "26년 4월": "전산/GA 준비",
        "26년 5월": "운영 체계 구축",
        "26년 6월": "GA 출범·프로세스 정착",
        "26년 7월": "V2·CRM 고도화",
        "26년 8월": "수도권 확장",
        "26년 9월": "전략 최적화",
        "26년 10월": "제휴 확장",
        "26년 11월": "브랜드 포지셔닝",
        "26년 12월": "연말 안정화",
    }
    return theme_map.get(month_label, "월간 실행")


def roadmap_action_text(row: Row2026) -> str:
    parts = [p for p in [row.roadmap_dev, row.roadmap_action, row.roadmap_note] if p]
    if not parts:
        return "월간 운영 및 KPI 점검"
    return " | ".join(parts)


def build_payload() -> dict[str, Any]:
    rows_2026 = build_rows_2026(CSV_PATH)
    feb = rows_2026[0]
    jan = build_january_backcast(feb)

    total_adjusted_hires = sum(r.adjusted_hires for r in rows_2026)
    year_end_est = jan["current_headcount"] + total_adjusted_hires

    revenue_sum = sum(r.revenue_1150 for r in rows_2026)
    expense_sum = sum(r.total_expense for r in rows_2026)
    final_sum = sum(r.final_profit for r in rows_2026)

    docx_text = extract_docx_text(DOCX_PATH)

    philosophy = find_snippet(docx_text, "사업 철학")
    value_prop = find_snippet(docx_text, "기본 비즈니스 모델")
    revenue_model = find_snippet(docx_text, "수익모델")

    # Derive simple functional org view.
    # Org current baseline uses February real counts (not January backcast) to avoid
    # propagating backcast distortion into functional staffing rows.
    base_product_dev = 2
    dec_product_dev = 5
    dec = rows_2026[-1]
    feb_sales = feb.current_headcount - feb.current_call_headcount - feb.claims_team - base_product_dev
    dec_sales = dec.current_headcount - dec.current_call_headcount - dec.claims_team - dec_product_dev

    org_rows = [
        {
            "function": "영업",
            "current_headcount": feb_sales,
            "target_headcount": dec_sales,
            "manager_role": "영업본부 운영 및 생산성 책임",
            "core_kpi": "월납, 계약고객수, 영업수당 효율",
            "status": "계획",
        },
        {
            "function": "콜",
            "current_headcount": feb.current_call_headcount,
            "target_headcount": dec.current_call_headcount,
            "manager_role": "콜 운영 및 인입-청구 전환율 책임",
            "core_kpi": "콜 처리량, 전환율, 콜러 생산성",
            "status": "계획",
        },
        {
            "function": "청구",
            "current_headcount": 3,
            "target_headcount": dec.claims_team,
            "manager_role": "청구 처리 품질 및 리드타임 책임",
            "core_kpi": "청구건수, 처리시간, 재청구율",
            "status": "계획",
        },
        {
            "function": "기획/개발",
            "current_headcount": base_product_dev,
            "target_headcount": dec_product_dev,
            "manager_role": "청구자동화, CRM, 운영시스템 고도화 책임",
            "core_kpi": "자동화 적용률, 기능 릴리즈 적기율",
            "status": "계획",
        },
    ]

    roadmap_rows = [
        {
            "title": "2026-01",
            "month": "2026-01-01",
            "strategic_theme": strategic_theme("26년 1월"),
            "key_action": "전략 정렬, KPI 기준선 확정, 월간 운영 리듬 세팅",
            "milestone_status": "계획",
            "gate_status": "게이트 전",
        }
    ]

    for row in rows_2026:
        roadmap_rows.append(
            {
                "title": row.iso_month[:7],
                "month": row.iso_month,
                "strategic_theme": strategic_theme(row.label),
                "key_action": roadmap_action_text(row),
                "milestone_status": "계획",
                "gate_status": row.gate_status,
            }
        )

    hiring_rows = [
        {
            "month": "2026-01-01",
            "function": "전체",
            "planned_hires": 0,
            "adjusted_hires": 0,
            "gate_status": "게이트 전",
            "hiring_progress": "계획",
            "budget_impact": 0,
            "note": "1월은 역산 기준월. 채용 KPI는 2월부터 집계.",
        }
    ]
    for row in rows_2026:
        hiring_rows.append(
            {
                "month": row.iso_month,
                "function": "전체",
                "planned_hires": row.planned_hires,
                "adjusted_hires": row.adjusted_hires,
                "gate_status": row.gate_status,
                "hiring_progress": "계획",
                "budget_impact": row.adjusted_hires * 1_000_000,
                "note": "",
            }
        )

    revenue_rows = []
    for row in rows_2026:
        margin = round(row.profit_margin, 6)
        if margin < 0:
            alert = "위험"
        elif margin < 0.05:
            alert = "주의"
        else:
            alert = "안정"
        revenue_rows.append(
            {
                "month": row.iso_month,
                "monthly_premium": row.monthly_premium,
                "revenue_1150": row.revenue_1150,
                "total_expense": row.total_expense,
                "final_profit": row.final_profit,
                "profit_margin_value": margin,
                "alert_flag": alert,
            }
        )

    return {
        "meta": {
            "title": "더바다 2026 운영전략",
            "audience": "경영진 실행관리",
            "period": "2026-01~2026-12",
            "unit": "KRW",
            "assumptions": [
                "수치 기준 원본은 3년 인원 채용 계획.csv",
                "1월은 인원지표만 역산, 재무 KPI는 2월부터 집계",
                "손익 게이트 적용 시작: 2026-05",
                "게이트 기준: 정상>=5%, 주의>=0%, 위험<0%",
                "기본 오너 정책: 대표/CSO 단일 오너",
            ],
        },
        "source_files": {
            "csv": str(CSV_PATH),
            "docx": str(DOCX_PATH),
        },
        "executive_summary": {
            "philosophy": philosophy,
            "value_proposition": value_prop,
            "revenue_model": revenue_model,
        },
        "validation": {
            "january_backcast": jan,
            "expected_gate_windows": {
                "yellow": ["2026-05-01", "2026-06-01", "2026-07-01"],
                "green": [
                    "2026-08-01",
                    "2026-09-01",
                    "2026-10-01",
                    "2026-11-01",
                    "2026-12-01",
                ],
            },
            "sum_revenue_1150_2026": revenue_sum,
            "sum_total_expense_2026": expense_sum,
            "sum_final_profit_2026": final_sum,
            "sum_adjusted_hires_2026": total_adjusted_hires,
            "year_end_headcount_estimate": year_end_est,
            "target_headcount_range": [180, 200],
        },
        "notion_schema": {
            "Roadmap_2026_Monthly": {
                "Title": "title",
                "Month": "date",
                "Strategic_Theme": "select",
                "Key_Action": "rich_text",
                "Milestone_Status": "select",
                "Gate_Status": "select",
                "Owner": "people",
                "Hiring_Link": "relation",
                "Revenue_Link": "relation",
            },
            "Org_Design_2026": {
                "Function": "select",
                "Current_Headcount": "number",
                "Target_Headcount": "number",
                "Manager_Role": "rich_text",
                "Core_KPI": "rich_text",
                "Owner": "people",
                "Status": "select",
            },
            "Hiring_Plan_2026": {
                "Month": "date",
                "Function": "select",
                "Planned_Hires": "number",
                "Adjusted_Hires": "number",
                "Gate_Status": "select",
                "Hiring_Progress": "select",
                "Budget_Impact": "number",
                "Owner": "people",
                "Roadmap_Link": "relation",
            },
            "Revenue_Control_2026": {
                "Month": "date",
                "Monthly_Premium": "number",
                "Revenue_1150": "number",
                "Total_Expense": "number",
                "Final_Profit": "number",
                "Profit_Margin": "formula",
                "Alert_Flag": "select",
                "Owner": "people",
                "Roadmap_Link": "relation",
            },
        },
        "records": {
            "roadmap_rows": roadmap_rows,
            "org_rows": org_rows,
            "hiring_rows": hiring_rows,
            "revenue_rows": revenue_rows,
        },
    }


def main() -> None:
    payload = build_payload()
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PATH.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    print(f"Wrote payload: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
