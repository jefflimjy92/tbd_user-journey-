
// ============================================================
// 더바다 고객여정 운영맵 — Figma Make React 코드 스캐폴드
// 이 코드를 Figma Make 에디터에 붙여넣으면 즉시 프리뷰됩니다.
// ============================================================

import { useState } from "react";

const COLORS = {
  mainSpine: { bg: "#1B4F8A", text: "#FFFFFF" },
  exit:      { bg: "#C0392B", text: "#FFFFFF" },
  goal:      { bg: "#1A7A4A", text: "#FFFFFF" },
  neutral:   { bg: "#FFFFFF", text: "#2C3E50", border: "#CBD5E0" },
  bg:        "#F0F5FB",
  cardBg:    "#FFFFFF",
  arrowMain: "#1B4F8A",
  arrowLoop: "#E67E22",
};

const STAGES = [
  {
    id: "S1", badge: "①", name: "광고",
    nodes: [
      { id: "ad1", label: "무반응",           type: "exit" },
      { id: "ad2", label: "클릭",             type: "neutral" },
      { id: "ad3", label: "저장/공유 후 재방문", type: "neutral" },
      { id: "ad4", label: "댓글/문의 전환",    type: "neutral" },
      { id: "ad5", label: "리타겟팅 재노출",   type: "neutral" },
    ],
  },
  {
    id: "S2", badge: "②", name: "유입",
    nodes: [
      { id: "ui1", label: "랜딩 진입",          type: "neutral" },
      { id: "ui2", label: "유입경로/캠페인 기록", type: "neutral" },
      { id: "ui3", label: "동반신청",            type: "neutral" },
      { id: "ui4", label: "추천인/소개인",        type: "neutral" },
      { id: "ui5", label: "중복 유입",           type: "exit" },
    ],
  },
  {
    id: "S3", badge: "③", name: "조회",
    nodes: [
      { id: "jo1", label: "정보입력 중단",   type: "exit" },
      { id: "jo2", label: "본인인증 성공",   type: "goal" },
      { id: "jo3", label: "본인인증 실패",   type: "exit" },
      { id: "jo4", label: "필수동의 거부",   type: "exit" },
      { id: "jo5", label: "마케팅 미동의",   type: "exit" },
      { id: "jo6", label: "조회 완료",       type: "goal" },
      { id: "jo7", label: "예상 환급금 산출", type: "goal" },
    ],
  },
  {
    id: "S4", badge: "④", name: "상담",
    nodes: [
      { id: "tm1",  label: "1차 TM 완료",    type: "neutral" },
      { id: "tm2",  label: "2차 TM 진행",    type: "neutral" },
      { id: "tm3",  label: "부재",           type: "neutral" },
      { id: "tm4",  label: "장기부재",       type: "exit" },
      { id: "tm5",  label: "재통화 예약",    type: "neutral" },
      { id: "tm6",  label: "관리대상",       type: "neutral" },
      { id: "tm7",  label: "진행불가 ▼",     type: "exit", hasChildren: true },
      { id: "tm7a", label: "∟ 지방대기/특이사항", type: "exit", indent: true },
      { id: "tm7b", label: "∟ 월보험료 7만 미만", type: "exit", indent: true },
      { id: "tm7c", label: "∟ 보험 미납/실효",    type: "exit", indent: true },
      { id: "tm7d", label: "∟ 계약자/납입자 불일치", type: "exit", indent: true },
      { id: "tm7e", label: "∟ 최근3개월 치료/수술", type: "exit", indent: true },
      { id: "tm7f", label: "∟ 현재 상해 치료중",   type: "exit", indent: true },
      { id: "tm7g", label: "∟ 약 용량/종류 변경",  type: "exit", indent: true },
      { id: "tm7h", label: "∟ 중대질환/악화소견",  type: "exit", indent: true },
      { id: "tm7i", label: "∟ 기존 설계사 친인척", type: "exit", indent: true },
      { id: "tm7j", label: "∟ 예외질환 해당",      type: "exit", indent: true },
      { id: "tm8",  label: "진행가능 전환",  type: "goal" },
      { id: "tm9",  label: "영업 인계",      type: "goal" },
      { id: "tm10", label: "민원 방어/클로징", type: "neutral" },
    ],
  },
  {
    id: "S5", badge: "⑤", name: "미팅",
    nodes: [
      { id: "mt1", label: "미팅 예약",        type: "neutral" },
      { id: "mt2", label: "미팅 확정",        type: "goal" },
      { id: "mt3", label: "미팅 취소",        type: "exit" },
      { id: "mt4", label: "미팅전 불가",      type: "exit" },
      { id: "mt5", label: "노쇼",            type: "exit" },
      { id: "mt6", label: "긴급 재배정",      type: "neutral" },
      { id: "mt7", label: "동반/제3자 케이스", type: "neutral" },
      { id: "mt8", label: "미팅 진행 ▼",      type: "goal", hasChildren: true },
      { id: "mt8a", label: "∟ 계약 진행",     type: "goal",    indent: true },
      { id: "mt8b", label: "∟ 계약 보류",     type: "neutral", indent: true },
      { id: "mt8c", label: "∟ 계약 거절",     type: "exit",    indent: true },
      { id: "mt8d", label: "∟ 청구만 진행 →⑥", type: "goal",  indent: true },
      { id: "mt8e", label: "∟ 상담 마무리",   type: "exit",    indent: true },
    ],
  },
  {
    id: "S6", badge: "⑥", name: "청구",
    nodes: [
      { id: "cg1",  label: "서류 인수",          type: "neutral" },
      { id: "cg2",  label: "1차 청구콜",          type: "neutral" },
      { id: "cg3",  label: "수수료 안내",          type: "neutral" },
      { id: "cg4",  label: "지급내역서/보험증권",   type: "neutral" },
      { id: "cg5",  label: "데이터 분석",          type: "neutral" },
      { id: "cg6",  label: "실손 청구불가",        type: "exit" },
      { id: "cg7",  label: "비급여 청구가능",       type: "neutral" },
      { id: "cg8",  label: "종합 청구가능",         type: "neutral" },
      { id: "cg9",  label: "미청구 내역 확정",      type: "goal" },
      { id: "cg10", label: "서류 발급 위탁",        type: "neutral" },
      { id: "cg11", label: "예상 환급금 안내",      type: "neutral" },
      { id: "cg12", label: "고객동의 후 청구접수",   type: "goal" },
      { id: "cg13", label: "서류 누락",            type: "exit" },
      { id: "cg14", label: "발급 지연",            type: "exit" },
    ],
  },
  {
    id: "S7", badge: "⑦", name: "환급",
    nodes: [
      { id: "hg1", label: "지급 완료",           type: "goal" },
      { id: "hg2", label: "감액 지급",           type: "exit" },
      { id: "hg3", label: "부지급",             type: "exit" },
      { id: "hg7", label: "∟ 외부 전문가 대응",  type: "neutral", indent: true },
      { id: "hg4", label: "지급지연 추적 3/5/7일", type: "neutral" },
      { id: "hg5", label: "수수료 최종 안내",     type: "goal" },
      { id: "hg6", label: "부지급/감액 이의검토", type: "neutral" },
    ],
  },
  {
    id: "S8", badge: "⑧", name: "소개",
    nodes: [
      { id: "sg1", label: "지인 소개 요청",       type: "neutral" },
      { id: "sg2", label: "소개 혜택/수수료 면제", type: "neutral" },
      { id: "sg3", label: "소개 거절",           type: "exit" },
      { id: "sg4", label: "소개DB 생성",         type: "goal" },
      { id: "sg5", label: "소개 유입 사전고지",   type: "neutral" },
      { id: "sg6", label: "동일 담당자 재배정",   type: "neutral" },
      { id: "sg7", label: "재유입 성공 ↺②",      type: "goal" },
      { id: "sg8", label: "재유입 실패",         type: "exit" },
    ],
  },
];

function NodePill({ label, type, indent }) {
  const color = COLORS[type] || COLORS.neutral;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        backgroundColor: color.bg,
        color: color.text,
        border: type === "neutral" ? `1px solid ${COLORS.neutral.border}` : "none",
        borderRadius: 20,
        padding: "5px 12px",
        fontSize: 11,
        fontWeight: type === "mainSpine" ? 700 : 500,
        whiteSpace: "nowrap",
        boxShadow: "0 2px 6px rgba(0,0,0,0.10)",
        marginLeft: indent ? 16 : 0,
        marginBottom: 4,
        letterSpacing: "0.01em",
        cursor: "default",
      }}
    >
      {label}
    </div>
  );
}

function StageCard({ stage }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div
      style={{
        background: COLORS.cardBg,
        borderRadius: 16,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        padding: "16px 14px",
        minWidth: 210,
        maxWidth: 240,
        display: "flex",
        flexDirection: "column",
        gap: 0,
        border: "1px solid #E8EEF5",
      }}
    >
      {/* Stage Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
          cursor: "pointer",
        }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <div
          style={{
            backgroundColor: COLORS.mainSpine.bg,
            color: COLORS.mainSpine.text,
            borderRadius: 24,
            padding: "6px 16px",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
            boxShadow: "0 2px 8px rgba(27,79,138,0.25)",
          }}
        >
          {stage.badge} {stage.name}
        </div>
        <span style={{ fontSize: 10, color: "#94A3B8", marginLeft: "auto" }}>
          {collapsed ? "▶" : "▼"}
        </span>
      </div>

      {/* Connector line */}
      {!collapsed && (
        <div
          style={{
            width: 1,
            height: 8,
            backgroundColor: "#CBD5E0",
            marginLeft: 28,
            marginBottom: 4,
          }}
        />
      )}

      {/* Sub-nodes */}
      {!collapsed && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {stage.nodes.map((node) => (
            <NodePill
              key={node.id}
              label={node.label}
              type={node.type}
              indent={node.indent}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Arrow({ loop }) {
  if (loop) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 4px",
          color: COLORS.arrowLoop,
          fontSize: 18,
          gap: 2,
        }}
      >
        <span style={{ fontSize: 9, color: COLORS.arrowLoop, fontWeight: 600, whiteSpace: "nowrap" }}>
          재유입
        </span>
        <span>⤴</span>
      </div>
    );
  }
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        color: COLORS.arrowMain,
        fontSize: 20,
        padding: "0 2px",
        flexShrink: 0,
      }}
    >
      →
    </div>
  );
}

function Legend() {
  const items = [
    { type: "mainSpine", label: "메인 단계" },
    { type: "goal",      label: "목표 달성" },
    { type: "exit",      label: "이탈/종결" },
    { type: "neutral",   label: "세부 프로세스" },
  ];
  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        background: "white",
        borderRadius: 12,
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        padding: "12px 16px",
        zIndex: 100,
        border: "1px solid #E8EEF5",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 11, color: "#475569", marginBottom: 8, letterSpacing: "0.06em" }}>
        LEGEND
      </div>
      {items.map(({ type, label }) => {
        const color = COLORS[type];
        return (
          <div key={type} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 4,
                backgroundColor: color.bg,
                border: type === "neutral" ? "1px solid #CBD5E0" : "none",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 11, color: "#475569" }}>{label}</span>
          </div>
        );
      })}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
        <div style={{ width: 14, height: 2, borderTop: `2px dashed ${COLORS.arrowLoop}`, flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: "#475569" }}>재유입 루프</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div
      style={{
        backgroundColor: COLORS.bg,
        minHeight: "100vh",
        padding: "32px 24px 48px",
        fontFamily: "'Pretendard', 'Inter', -apple-system, sans-serif",
      }}
    >
      <Legend />

      {/* Title */}
      <div style={{ marginBottom: 28, maxWidth: 600 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#1E293B",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          더바다 고객여정 운영맵
        </h1>
        <p style={{ fontSize: 12, color: "#64748B", marginTop: 6 }}>
          광고 → 유입 → 조회 → 상담 → 미팅 → 청구 → 환급 → 소개 / 전체 88개 상태 노드
        </p>
      </div>

      {/* Main Stage Row */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 0,
          overflowX: "auto",
          paddingBottom: 24,
          paddingRight: 80,
        }}
      >
        {STAGES.map((stage, i) => (
          <div key={stage.id} style={{ display: "flex", alignItems: "flex-start" }}>
            <StageCard stage={stage} />
            {i < STAGES.length - 1 && <Arrow />}
            {i === STAGES.length - 1 && <Arrow loop />}
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 16 }}>
        * ⑤ 미팅의 '청구만 진행'은 ⑥ 청구로 직행 연결 / ⑧ 소개의 '재유입 성공'은 ② 유입으로 루프 복귀
      </div>
    </div>
  );
}
