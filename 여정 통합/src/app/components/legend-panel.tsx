import { useState } from "react";
import { COLORS } from "./journey-data";
import { ChevronDown, ChevronUp } from "lucide-react";

export function LegendPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="flex flex-col gap-0"
      style={{
        background: "white",
        borderRadius: 12,
        boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
        padding: open ? "14px 18px" : "0",
        border: "1px solid #E8EEF5",
        minWidth: open ? 180 : "auto",
        transition: "all 0.2s ease",
      }}
    >
      {/* Toggle button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 cursor-pointer"
        style={{
          background: open ? "none" : "white",
          border: "none",
          padding: open ? "0 0 8px 0" : "8px 14px",
          borderRadius: open ? 0 : 12,
          borderBottom: open ? "1px solid #F1F5F9" : "none",
          fontWeight: 700,
          fontSize: 11,
          color: "#475569",
          letterSpacing: "0.08em",
          textTransform: "uppercase" as const,
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <span>범례</span>
        {open ? <ChevronUp size={14} color="#94A3B8" /> : <ChevronDown size={14} color="#94A3B8" />}
      </button>

      {open && (
        <>
          {/* Main spine */}
          <div className="flex items-center gap-2.5 mb-2 mt-2">
            <div
              className="shrink-0"
              style={{
                width: 16,
                height: 16,
                borderRadius: 5,
                backgroundColor: COLORS.mainSpine.bg,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            />
            <span style={{ fontSize: 11, color: "#475569", fontWeight: 500 }}>메인 단계</span>
          </div>

          {/* ── Exit severity section ── */}
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "#94A3B8",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 4,
              marginTop: 4,
            }}
          >
            이탈 정도
          </div>
          {[
            { color: COLORS.exitCritical.bg, label: "치명적 이탈", sub: "복구 불가" },
            { color: COLORS.exit.bg, label: "중간 이탈", sub: "회복 가능성 낮음" },
            { color: COLORS.exitSoft.bg, label: "경미한 이탈", sub: "일시적/해결 가능" },
          ].map(({ color, label, sub }) => (
            <div key={label} className="flex items-center gap-2.5 mb-1">
              <div
                className="shrink-0"
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 5,
                  backgroundColor: color,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              />
              <div className="flex flex-col">
                <span style={{ fontSize: 11, color: "#475569", fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: 8, color: "#94A3B8", fontWeight: 400 }}>{sub}</span>
              </div>
            </div>
          ))}

          {/* ── Goal severity section ── */}
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "#94A3B8",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 4,
              marginTop: 8,
            }}
          >
            달성 정도
          </div>
          {[
            { color: COLORS.goalMajor.bg, label: "핵심 달성", sub: "주요 전환 포인트" },
            { color: COLORS.goal.bg, label: "중간 달성", sub: "중요 중간 단계" },
            { color: COLORS.goalMinor.bg, label: "초기 달성", sub: "부분 진행 마일스톤" },
          ].map(({ color, label, sub }) => (
            <div key={label} className="flex items-center gap-2.5 mb-1">
              <div
                className="shrink-0"
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 5,
                  backgroundColor: color,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              />
              <div className="flex flex-col">
                <span style={{ fontSize: 11, color: "#475569", fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: 8, color: "#94A3B8", fontWeight: 400 }}>{sub}</span>
              </div>
            </div>
          ))}

          {/* Neutral */}
          <div className="flex items-center gap-2.5 mt-2 mb-1">
            <div
              className="shrink-0"
              style={{
                width: 16,
                height: 16,
                borderRadius: 5,
                backgroundColor: COLORS.neutral.bg,
                border: "1.5px solid #CBD5E0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            />
            <span style={{ fontSize: 11, color: "#475569", fontWeight: 500 }}>세부 프로세스</span>
          </div>

          {/* ── Muted section ── */}
          <div
            className="mt-2 pt-2"
            style={{ borderTop: "1px solid #F1F5F9" }}
          >
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: "#94A3B8",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              세부사유 (하위 노드)
            </div>
            {[
              { color: COLORS.exitCriticalMuted.bg, border: COLORS.exitCriticalMuted.border, label: "치명적 이탈" },
              { color: COLORS.exitMuted.bg, border: COLORS.exitMuted.border, label: "중간 이탈" },
              { color: COLORS.exitSoftMuted.bg, border: COLORS.exitSoftMuted.border, label: "경미한 이탈" },
              { color: COLORS.goalMajorMuted.bg, border: COLORS.goalMajorMuted.border, label: "핵심 달성" },
              { color: COLORS.goalMuted.bg, border: COLORS.goalMuted.border, label: "중간 달성" },
              { color: COLORS.goalMinorMuted.bg, border: COLORS.goalMinorMuted.border, label: "초기 달성" },
            ].map(({ color, border, label }) => (
              <div key={label + "-muted"} className="flex items-center gap-2 mb-1">
                <div
                  className="shrink-0"
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 3,
                    backgroundColor: color,
                    border: `1.5px solid ${border}`,
                  }}
                />
                <span style={{ fontSize: 9, color: "#94A3B8", fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>

          {/* ── Arrows ── */}
          <div className="flex items-center gap-2.5 mt-3 pt-2" style={{ borderTop: "1px solid #F1F5F9" }}>
            <div
              className="shrink-0"
              style={{
                width: 16,
                height: 2,
                borderTop: `2.5px dashed ${COLORS.arrowLoop}`,
              }}
            />
            <span style={{ fontSize: 11, color: "#E67E22", fontWeight: 600 }}>재유입 루프</span>
          </div>
          <div className="flex items-center gap-2.5 mt-1.5">
            <div
              className="shrink-0"
              style={{
                width: 16,
                height: 2,
                borderTop: `2.5px solid ${COLORS.arrowMain}`,
              }}
            />
            <span style={{ fontSize: 11, color: "#475569", fontWeight: 500 }}>단계 연결</span>
          </div>
        </>
      )}
    </div>
  );
}