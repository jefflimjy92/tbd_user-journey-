import { useState, useRef, useEffect } from "react";
import {
  X,
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2,
  Palette,
  Type,
  FolderPlus,
  Gauge,
} from "lucide-react";
import type { ExitSeverity, GoalSeverity } from "./journey-data";

export type NodeType = "exit" | "goal" | "neutral" | "main" | "mainSpine";

export interface EditPopoverProps {
  nodeId: string;
  label: string;
  type: NodeType;
  exitSeverity?: ExitSeverity;
  goalSeverity?: GoalSeverity;
  position: { x: number; y: number };
  canMoveUp: boolean;
  canMoveDown: boolean;
  canDelete: boolean;
  canAddSibling: boolean;
  canAddChild: boolean;
  isChild?: boolean;
  onChangeLabel: (id: string, newLabel: string) => void;
  onChangeType: (id: string, newType: NodeType) => void;
  onChangeExitSeverity: (id: string, severity: ExitSeverity) => void;
  onChangeGoalSeverity: (id: string, severity: GoalSeverity) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDelete: (id: string) => void;
  onAddSibling: (id: string) => void;
  onAddChild: (id: string) => void;
  onClose: () => void;
}

const TYPE_OPTIONS: { type: NodeType; label: string; bg: string; text: string }[] = [
  { type: "exit", label: "이탈", bg: "#C0392B", text: "#FFF" },
  { type: "goal", label: "목표", bg: "#1A7A4A", text: "#FFF" },
  { type: "neutral", label: "프로세스", bg: "#F0F4F8", text: "#2C3E50" },
  { type: "main", label: "메인", bg: "#1B4F8A", text: "#FFF" },
];

const EXIT_SEVERITY_OPTIONS: { severity: ExitSeverity; label: string; bg: string; text: string; desc: string }[] = [
  { severity: "critical", label: "치명적", bg: "#7B1818", text: "#FFF", desc: "완전 종결, 복구 불가" },
  { severity: "moderate", label: "중간", bg: "#C0392B", text: "#FFF", desc: "회복 가능성 낮음" },
  { severity: "soft", label: "경미", bg: "#E8705E", text: "#FFF", desc: "일시적, 해결 가능" },
];

const GOAL_SEVERITY_OPTIONS: { severity: GoalSeverity; label: string; bg: string; text: string; desc: string }[] = [
  { severity: "major", label: "핵심", bg: "#0B6E35", text: "#FFF", desc: "주요 전환 포인트" },
  { severity: "moderate", label: "중간", bg: "#1A9A5A", text: "#FFF", desc: "중요 중간 단계" },
  { severity: "minor", label: "초기", bg: "#5BBD8A", text: "#FFF", desc: "부분 진행" },
];

export function EditNodePopover({
  nodeId,
  label,
  type,
  exitSeverity,
  goalSeverity,
  canMoveUp,
  canMoveDown,
  canDelete,
  canAddSibling,
  canAddChild,
  isChild,
  onChangeLabel,
  onChangeType,
  onChangeExitSeverity,
  onChangeGoalSeverity,
  onMoveUp,
  onMoveDown,
  onDelete,
  onAddSibling,
  onAddChild,
  onClose,
}: EditPopoverProps) {
  const [editingLabel, setEditingLabel] = useState(false);
  const [tempLabel, setTempLabel] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingLabel && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingLabel]);

  useEffect(() => {
    setTempLabel(label);
  }, [label]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleLabelSubmit = () => {
    if (tempLabel.trim()) {
      onChangeLabel(nodeId, tempLabel.trim());
    }
    setEditingLabel(false);
  };

  // Filter: if it's a child or sub-item, hide "main" option
  const filteredTypes = isChild
    ? TYPE_OPTIONS.filter((t) => t.type !== "main" && t.type !== "mainSpine")
    : TYPE_OPTIONS;

  const showExitSeverity = type === "exit";
  const showGoalSeverity = type === "goal";

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 z-[9998]"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(2px)",
        }}
        onClick={onClose}
        onMouseDown={(e) => e.stopPropagation()}
      />

      {/* Centered modal */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          ref={modalRef}
          className="pointer-events-auto"
          style={{
            animation: "modalFadeIn 0.2s ease-out",
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <style>{`
            @keyframes modalFadeIn {
              from {
                opacity: 0;
                transform: scale(0.92) translateY(12px);
              }
              to {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }
          `}</style>
          <div
            className="flex flex-col"
            style={{
              background: "white",
              borderRadius: 16,
              boxShadow:
                "0 24px 64px rgba(0,0,0,0.24), 0 0 0 1px rgba(0,0,0,0.08)",
              padding: "20px 24px",
              minWidth: 320,
              maxWidth: 400,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#1E293B",
                  letterSpacing: "0.02em",
                }}
              >
                노드 편집
              </span>
              <button
                onClick={onClose}
                className="flex items-center justify-center cursor-pointer rounded-full hover:bg-gray-100 transition-colors"
                style={{
                  width: 28,
                  height: 28,
                  border: "none",
                  background: "#F1F5F9",
                  color: "#64748B",
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Label */}
            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Type size={12} color="#94A3B8" />
                <span style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>
                  라벨
                </span>
              </div>
              {editingLabel ? (
                <div className="flex items-center gap-1.5">
                  <input
                    ref={inputRef}
                    value={tempLabel}
                    onChange={(e) => setTempLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleLabelSubmit();
                      if (e.key === "Escape") {
                        setTempLabel(label);
                        setEditingLabel(false);
                      }
                    }}
                    onBlur={handleLabelSubmit}
                    className="flex-1"
                    style={{
                      fontSize: 12,
                      padding: "7px 10px",
                      border: "1.5px solid #2563EB",
                      borderRadius: 8,
                      outline: "none",
                      color: "#1E293B",
                      fontWeight: 500,
                    }}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setEditingLabel(true)}
                  className="w-full text-left cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{
                    fontSize: 12,
                    padding: "7px 10px",
                    border: "1px solid #E2E8F0",
                    borderRadius: 8,
                    background: "#F8FAFC",
                    color: "#1E293B",
                    fontWeight: 500,
                  }}
                >
                  {label}
                </button>
              )}
            </div>

            {/* Color/Type */}
            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Palette size={12} color="#94A3B8" />
                <span style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>
                  색상/유형
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {filteredTypes.map((opt) => {
                  const isActive = type === opt.type || (type === "mainSpine" && opt.type === "main");
                  return (
                    <button
                      key={opt.type}
                      onClick={() =>
                        onChangeType(nodeId, opt.type)
                      }
                      className="flex items-center gap-1 cursor-pointer transition-all duration-150"
                      style={{
                        padding: "5px 12px",
                        borderRadius: 12,
                        border: isActive
                          ? "2px solid #2563EB"
                          : "1px solid #E2E8F0",
                        background: opt.bg,
                        color: opt.text,
                        fontSize: 11,
                        fontWeight: isActive ? 700 : 500,
                        boxShadow: isActive
                          ? "0 0 0 2px rgba(37,99,235,0.2)"
                          : "none",
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Exit Severity */}
            {showExitSeverity && (
              <div
                className="mb-4"
                style={{
                  background: "#FEF2F2",
                  borderRadius: 10,
                  padding: "12px 14px",
                  border: "1px solid #FECACA",
                }}
              >
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Gauge size={12} color="#DC2626" />
                  <span style={{ fontSize: 10, color: "#DC2626", fontWeight: 700 }}>
                    이탈 정도
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {EXIT_SEVERITY_OPTIONS.map((opt) => {
                    const isActive = (exitSeverity || "moderate") === opt.severity;
                    return (
                      <button
                        key={opt.severity}
                        onClick={() => onChangeExitSeverity(nodeId, opt.severity)}
                        className="flex items-center gap-2.5 cursor-pointer transition-all duration-150 w-full text-left"
                        style={{
                          padding: "6px 10px",
                          borderRadius: 8,
                          border: isActive
                            ? "2px solid #2563EB"
                            : "1px solid transparent",
                          background: isActive ? "white" : "transparent",
                          boxShadow: isActive
                            ? "0 1px 4px rgba(0,0,0,0.1)"
                            : "none",
                        }}
                      >
                        <span
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 6,
                            background: opt.bg,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <span style={{ color: opt.text, fontSize: 9, fontWeight: 700 }}>✕</span>
                        </span>
                        <span style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 500, color: "#1E293B" }}>
                            {opt.label}
                          </span>
                          <span style={{ fontSize: 9, color: "#94A3B8", fontWeight: 400 }}>
                            {opt.desc}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Goal Severity */}
            {showGoalSeverity && (
              <div
                className="mb-4"
                style={{
                  background: "#F0FDF4",
                  borderRadius: 10,
                  padding: "12px 14px",
                  border: "1px solid #BBF7D0",
                }}
              >
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Gauge size={12} color="#16A34A" />
                  <span style={{ fontSize: 10, color: "#16A34A", fontWeight: 700 }}>
                    달성 정도
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {GOAL_SEVERITY_OPTIONS.map((opt) => {
                    const isActive = (goalSeverity || "moderate") === opt.severity;
                    return (
                      <button
                        key={opt.severity}
                        onClick={() => onChangeGoalSeverity(nodeId, opt.severity)}
                        className="flex items-center gap-2.5 cursor-pointer transition-all duration-150 w-full text-left"
                        style={{
                          padding: "6px 10px",
                          borderRadius: 8,
                          border: isActive
                            ? "2px solid #2563EB"
                            : "1px solid transparent",
                          background: isActive ? "white" : "transparent",
                          boxShadow: isActive
                            ? "0 1px 4px rgba(0,0,0,0.1)"
                            : "none",
                        }}
                      >
                        <span
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 6,
                            background: opt.bg,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <span style={{ color: opt.text, fontSize: 9, fontWeight: 700 }}>✓</span>
                        </span>
                        <span style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 500, color: "#1E293B" }}>
                            {opt.label}
                          </span>
                          <span style={{ fontSize: 9, color: "#94A3B8", fontWeight: 400 }}>
                            {opt.desc}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reorder */}
            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-2">
                <ChevronUp size={12} color="#94A3B8" />
                <span style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>
                  순서 변경
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onMoveUp(nodeId)}
                  disabled={!canMoveUp}
                  className="flex items-center gap-1 cursor-pointer transition-colors"
                  style={{
                    padding: "5px 12px",
                    borderRadius: 8,
                    border: "1px solid #E2E8F0",
                    background: canMoveUp ? "#F1F5F9" : "#F8FAFC",
                    color: canMoveUp ? "#475569" : "#CBD5E0",
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                >
                  <ChevronUp size={13} />위
                </button>
                <button
                  onClick={() => onMoveDown(nodeId)}
                  disabled={!canMoveDown}
                  className="flex items-center gap-1 cursor-pointer transition-colors"
                  style={{
                    padding: "5px 12px",
                    borderRadius: 8,
                    border: "1px solid #E2E8F0",
                    background: canMoveDown ? "#F1F5F9" : "#F8FAFC",
                    color: canMoveDown ? "#475569" : "#CBD5E0",
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                >
                  <ChevronDown size={13} />아래
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3" style={{ borderTop: "1px solid #F1F5F9" }}>
              {canAddSibling && (
                <button
                  onClick={() => onAddSibling(nodeId)}
                  className="flex items-center gap-1 cursor-pointer hover:bg-blue-50 transition-colors"
                  style={{
                    padding: "5px 10px",
                    borderRadius: 8,
                    border: "1px solid #BFDBFE",
                    background: "#EFF6FF",
                    color: "#2563EB",
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                >
                  <Plus size={12} /> 추가
                </button>
              )}
              {canAddChild && (
                <button
                  onClick={() => onAddChild(nodeId)}
                  className="flex items-center gap-1 cursor-pointer hover:bg-green-50 transition-colors"
                  style={{
                    padding: "5px 10px",
                    borderRadius: 8,
                    border: "1px solid #BBF7D0",
                    background: "#F0FDF4",
                    color: "#16A34A",
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                >
                  <FolderPlus size={12} /> 하위 추가
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => {
                    onDelete(nodeId);
                    onClose();
                  }}
                  className="flex items-center gap-1 cursor-pointer hover:bg-red-50 transition-colors ml-auto"
                  style={{
                    padding: "5px 10px",
                    borderRadius: 8,
                    border: "1px solid #FECACA",
                    background: "#FEF2F2",
                    color: "#DC2626",
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                >
                  <Trash2 size={12} /> 삭제
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
