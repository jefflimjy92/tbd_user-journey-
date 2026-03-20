#!/usr/bin/env python3
"""
Build a Korean dashboard payload for 더바다 2026 Notion strategy workspace.
"""

from __future__ import annotations

import csv
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "3년 인원 채용 계획.csv"
OUT_PATH = ROOT / "output" / "notion" / "thebada_2026_dashboard_payload.json"


def parse_int(value: str | None) -> int:
    if value is None:
        return 0
    cleaned = value.strip().replace(",", "").replace(" ", "")
    if cleaned in {"", "-", "–"}:
        return 0
    return int(float(cleaned))


def month_to_iso(month_kr: str) -> str:
    m = re.match(r"(\d{2})년\s*(\d{1,2})월", month_kr.strip())
    if not m:
        raise ValueError(f"Unexpected month format: {month_kr}")
    year = 2000 + int(m.group(1))
    month = int(m.group(2))
    return f"{year:04d}-{month:02d}-01"


@dataclass
class MonthRow:
    label: str
    month: str
    현재인원: int
    채용인원: int
    현재콜인원: int
    콜채용인원: int
    청구팀: int
    월납: int
    수익1150: int
    총비용: int
    최종수익: int
    기획개발: str
    액션: str
    비고: str
    손익률: float
    게이트상태: str
    조정채용: int


def build_month_rows(csv_path: Path) -> list[MonthRow]:
    with csv_path.open(encoding="utf-8-sig", newline="") as f:
        rows = [r for r in csv.DictReader(f) if (r.get("년월") or "").startswith("26년")]

    out: list[MonthRow] = []
    for r in rows:
        label = (r.get("년월") or "").strip()
        month = month_to_iso(label)
        planned_hires = parse_int(r.get("채용 인원"))
        rev_1150 = parse_int(r.get("익월 수익(1150%)"))
        final_profit = parse_int(r.get("최종수익(익월)"))
        margin = (final_profit / rev_1150) if rev_1150 else 0.0

        if label in {"26년 2월", "26년 3월", "26년 4월"}:
            gate = "게이트 전"
            adjusted = planned_hires
        elif margin >= 0.05:
            gate = "정상"
            adjusted = planned_hires
        elif margin >= 0.0:
            gate = "주의"
            adjusted = round(planned_hires * 0.5)
        else:
            gate = "위험"
            adjusted = 0

        out.append(
            MonthRow(
                label=label,
                month=month,
                현재인원=parse_int(r.get("현재 인원")),
                채용인원=planned_hires,
                현재콜인원=parse_int(r.get("현재 콜 인원")),
                콜채용인원=parse_int(r.get("콜 채용 인원")),
                청구팀=parse_int(r.get("청구팀")),
                월납=parse_int(r.get(" 월납 ")),
                수익1150=rev_1150,
                총비용=parse_int(r.get("지출 총액")),
                최종수익=final_profit,
                기획개발=(r.get("기획/개발") or "").strip(),
                액션=(r.get("액션") or "").strip(),
                비고=(r.get("비고") or "").strip(),
                손익률=margin,
                게이트상태=gate,
                조정채용=adjusted,
            )
        )
    return out


def 전략테마(label: str) -> str:
    m = {
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
    return m[label]


def 게이트_채용상태(게이트: str) -> str:
    if 게이트 == "위험":
        return "위험"
    return 게이트


def 반복과제() -> dict[str, list[tuple[str, str, str]]]:
    # (업무유형, 과제명, 업무상세)
    return {
        "영업": [
            ("운영", "파이프라인 점검 및 상위 딜 리뷰", "상위 딜 20건을 점검하고 단계별 병목 및 전환 저해 요인을 정리한다."),
            ("품질", "모집율·완전판매 품질 점검", "모집율과 완전판매 누락 항목을 검토하고 재발 방지 액션을 확정한다."),
            ("확장", "소개DB 전환율 관리", "소개DB 유입 대비 계약 전환율을 분석하고 실패사례 리마인드를 진행한다."),
        ],
        "콜": [
            ("운영", "인입 응답 SLA 점검", "응답 지연 구간을 분석해 당월 SLA 준수율 목표를 유지한다."),
            ("품질", "콜 스크립트 및 녹취 QA", "상담 녹취 샘플을 리뷰하고 스크립트 개선안을 확정한다."),
            ("리스크", "DB배정 정확도·노쇼 재배정 관리", "배정 오류와 노쇼 건을 추적해 재배정 리드타임을 관리한다."),
        ],
        "청구": [
            ("운영", "6단계 청구 프로세스 준수율 점검", "청구 6단계 체크리스트 누락률을 점검하고 보완한다."),
            ("품질", "지급내역 대조·미청구 발굴", "지급내역서와 심평원 데이터를 대조해 미청구 항목을 확정한다."),
            ("리스크", "지연/부지급 건 대응 리뷰", "지연/부지급 사례를 분석해 대응 스크립트와 에스컬레이션 기준을 업데이트한다."),
        ],
        "기획·개발": [
            ("자동화", "월간 릴리즈 캘린더 운영", "당월 기능 릴리즈 일정을 확정하고 이슈 대응 버퍼를 반영한다."),
            ("품질", "장애·데이터 정합성 점검", "핵심 지표 로그와 CRM 데이터 정합성 이슈를 점검한다."),
            ("확장", "자동화 백로그 우선순위 갱신", "수작업 반복 업무를 자동화 후보로 관리하고 우선순위를 갱신한다."),
        ],
    }


def 이벤트_과제_조직(텍스트: str) -> str:
    if any(k in 텍스트 for k in ["청구", "서류"]):
        return "청구"
    if any(k in 텍스트 for k in ["GA", "제휴", "브랜드"]):
        return "영업"
    if any(k in 텍스트 for k in ["콜", "상담", "TM"]):
        return "콜"
    return "기획·개발"


def build_payload() -> dict[str, Any]:
    rows = build_month_rows(CSV_PATH)
    feb = rows[0]
    jan_current = feb.현재인원 - feb.채용인원
    jan_call = feb.현재콜인원 - feb.콜채용인원
    dec = rows[-1]

    sales_current = feb.현재인원 - feb.현재콜인원 - feb.청구팀 - 2
    sales_target = dec.현재인원 - dec.현재콜인원 - dec.청구팀 - 5

    roadmap = [
        {
            "제목": "2026-01",
            "월": "2026-01-01",
            "전략테마": 전략테마("26년 1월"),
            "핵심실행": "전략 정렬, KPI 기준선 확정, 월간 운영 리듬 세팅",
            "마일스톤상태": "계획",
            "게이트상태": "게이트 전",
        }
    ]
    hiring = [
        {
            "제목": "2026-01 채용계획",
            "월": "2026-01-01",
            "기능": "전체",
            "계획채용": 0,
            "조정채용": 0,
            "게이트상태": "게이트 전",
            "채용진행": "계획",
            "예산영향": 0,
        }
    ]
    revenue = []
    tasks = []

    반복 = 반복과제()
    functions = ["영업", "콜", "청구", "기획·개발"]

    for month_index, m in enumerate(["2026-01-01"] + [r.month for r in rows], start=1):
        for team in functions:
            for idx, (업무유형, 과제명, 상세) in enumerate(반복[team], start=1):
                tasks.append(
                    {
                        "과제명": f"{m[:7]} {team} #{idx} {과제명}",
                        "월": m,
                        "조직명": team,
                        "업무유형": 업무유형,
                        "업무상세": 상세,
                        "상태": "계획",
                        "우선순위": "중",
                        "시작일": m,
                        "종료일": m,
                        "완료율": 0,
                        "KPI연결": f"{team} 핵심 KPI 월간 점검",
                        "리스크메모": "",
                    }
                )

    for r in rows:
        핵심실행 = " | ".join([x for x in [r.기획개발, r.액션, r.비고] if x]) or "월간 운영 및 KPI 점검"
        roadmap.append(
            {
                "제목": r.month[:7],
                "월": r.month,
                "전략테마": 전략테마(r.label),
                "핵심실행": 핵심실행,
                "마일스톤상태": "계획",
                "게이트상태": r.게이트상태,
            }
        )

        hiring.append(
            {
                "제목": f"{r.month[:7]} 채용계획",
                "월": r.month,
                "기능": "전체",
                "계획채용": r.채용인원,
                "조정채용": r.조정채용,
                "게이트상태": 게이트_채용상태(r.게이트상태),
                "채용진행": "계획",
                "예산영향": r.조정채용 * 1_000_000,
            }
        )

        revenue.append(
            {
                "제목": f"{r.month[:7]} 매출",
                "월": r.month,
                "월납": r.월납,
                "수익1150": r.수익1150,
                "총비용": r.총비용,
                "최종수익": r.최종수익,
                "경보": "위험" if r.손익률 < 0 else ("주의" if r.손익률 < 0.05 else "안정"),
            }
        )

        if r.기획개발:
            team = 이벤트_과제_조직(r.기획개발)
            tasks.append(
                {
                    "과제명": f"{r.month[:7]} 이벤트 {r.기획개발}",
                    "월": r.month,
                    "조직명": team,
                    "업무유형": "확장" if "제휴" in r.기획개발 or "GA" in r.기획개발 else "자동화",
                    "업무상세": r.기획개발,
                    "상태": "계획",
                    "우선순위": "상",
                    "시작일": r.month,
                    "종료일": r.month,
                    "완료율": 0,
                    "KPI연결": f"{team} 월간 핵심과제",
                    "리스크메모": "",
                }
            )
        if r.액션:
            team = 이벤트_과제_조직(r.액션)
            tasks.append(
                {
                    "과제명": f"{r.month[:7]} 이벤트 {r.액션}",
                    "월": r.month,
                    "조직명": team,
                    "업무유형": "확장",
                    "업무상세": r.액션,
                    "상태": "계획",
                    "우선순위": "상",
                    "시작일": r.month,
                    "종료일": r.month,
                    "완료율": 0,
                    "KPI연결": f"{team} 월간 핵심과제",
                    "리스크메모": r.비고,
                }
            )

    payload: dict[str, Any] = {
        "메타": {
            "페이지명": "더바다 2026 운영전략",
            "기간": "2026-01~2026-12",
            "대상": "경영진 실행관리",
            "단위": "KRW",
        },
        "검증": {
            "1월_역산_현재인원": jan_current,
            "1월_역산_콜인원": jan_call,
            "5_7월_게이트": "주의",
            "8_12월_게이트": "정상",
            "조정채용합계": sum(r.조정채용 for r in rows),
            "연말추정인원": jan_current + sum(r.조정채용 for r in rows),
            "목표범위": "180~200",
            "수익1150합계": sum(r.수익1150 for r in rows),
            "총비용합계": sum(r.총비용 for r in rows),
            "최종수익합계": sum(r.최종수익 for r in rows),
        },
        "조직설계": [
            {
                "조직명": "영업팀",
                "기능": "영업",
                "현재인원": sales_current,
                "목표인원": sales_target,
                "조직역할": "미팅 전환, 보장공백 진단, 계약 전환, 소개DB 창출",
                "핵심KPI": "월납, 계약고객수, 모집율, 소개DB 전환율",
                "상태": "계획",
            },
            {
                "조직명": "콜팀",
                "기능": "콜",
                "현재인원": feb.현재콜인원,
                "목표인원": dec.현재콜인원,
                "조직역할": "인입 TM, 고객정보 확보, 미팅배정, 통화품질 관리",
                "핵심KPI": "응답 SLA, 콜 처리량, 상담 전환율, 노쇼율",
                "상태": "계획",
            },
            {
                "조직명": "청구팀",
                "기능": "청구",
                "현재인원": feb.청구팀,
                "목표인원": dec.청구팀,
                "조직역할": "1차 청구콜, 미청구 발굴, 서류 발급/검수, 청구 접수/사후관리",
                "핵심KPI": "청구 처리건수, 처리 리드타임, 재청구율, 지연건수",
                "상태": "계획",
            },
            {
                "조직명": "기획·개발팀",
                "기능": "기획·개발",
                "현재인원": 2,
                "목표인원": 5,
                "조직역할": "앱/웹/CRM/청구자동화 고도화, 내부 전산/데이터 품질 유지",
                "핵심KPI": "릴리즈 적기율, 자동화 적용률, 장애 재발률, 데이터 정합성",
                "상태": "계획",
            },
        ],
        "로드맵": roadmap,
        "채용계획": hiring,
        "매출관리": revenue,
        "월간실행과제": tasks,
    }
    return payload


def main() -> None:
    payload = build_payload()
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUT_PATH.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    print(f"Wrote payload: {OUT_PATH}")
    print(f"Tasks: {len(payload['월간실행과제'])}")


if __name__ == "__main__":
    main()
