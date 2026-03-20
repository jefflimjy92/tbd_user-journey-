/* ================================================================
   업무 현황 보드 (서비스 블루프린트 그리드)
   - 가로: 여정 단계 (phase)
   - 세로: 팀별 레인 (lane) + 업무소스 (Notion 링크)
   - Sticky 헤더/라벨, 팀간 구분선
   ================================================================ */

import { useState, useRef, useEffect, useCallback } from "react";
import { ExternalLink, ChevronDown, ChevronRight } from "lucide-react";
import type { TaskBoardData, TaskCell, TaskLane, TaskDivider } from "./task-data";
import { LANE_COLORS, TAG_COLORS } from "./task-data";

interface TaskBoardProps {
  data: TaskBoardData;
  accentColor?: string;
  stageReflected?: string[];
  stageHelpers?: { handoff?: string; risk?: string; metric?: string }[];
  editMode?: boolean;
  onDataChange?: (data: TaskBoardData) => void;
  onReflectedChange?: (reflected: string[]) => void;
  onHelpersChange?: (helpers: { handoff?: string; risk?: string; metric?: string }[]) => void;
}

export function TaskBoard({ data, stageReflected, stageHelpers, editMode, onDataChange, onReflectedChange, onHelpersChange }: TaskBoardProps) {
  const { phaseGroups, phases, lanes, dividers } = data;
  const phaseCount = phases.length;

  // Collapsed lanes
  const [collapsedLanes, setCollapsedLanes] = useState<Set<string>>(new Set());
  const toggleLane = (laneId: string) => {
    setCollapsedLanes(prev => {
      const next = new Set(prev);
      if (next.has(laneId)) next.delete(laneId);
      else next.add(laneId);
      return next;
    });
  };

  // Divider lookup: afterLaneId → divider
  const dividerMap = new Map<string, TaskDivider>();
  for (const d of dividers) dividerMap.set(d.afterLaneId, d);

  // Compute phase group start indices
  const groupStarts = new Set<number>();
  let idx = 0;
  for (const g of phaseGroups) {
    groupStarts.add(idx);
    idx += g.span;
  }

  // Check if stageHelpers has any content
  const hasHelpers = stageHelpers && stageHelpers.some(
    h => h.handoff || h.risk || h.metric
  );

  // ── Edit helpers ──
  const updateCell = useCallback((laneId: string, phaseIdx: number, field: "title" | "desc" | "improvement", value: string) => {
    if (!onDataChange) return;
    const newData = JSON.parse(JSON.stringify(data)) as TaskBoardData;
    const lane = newData.lanes.find(l => l.id === laneId);
    if (!lane) return;
    if (!lane.cells[phaseIdx]) {
      lane.cells[phaseIdx] = { title: "", desc: "", isEmpty: false };
    }
    const cell = lane.cells[phaseIdx];
    if (field === "title") cell.title = value;
    else if (field === "desc") cell.desc = value;
    else if (field === "improvement") cell.improvement = value;
    cell.isEmpty = !cell.title && !cell.desc;
    onDataChange(newData);
  }, [data, onDataChange]);

  const updateReflected = useCallback((phaseIdx: number, value: string) => {
    if (!onReflectedChange || !stageReflected) return;
    const newReflected = [...stageReflected];
    newReflected[phaseIdx] = value;
    onReflectedChange(newReflected);
  }, [stageReflected, onReflectedChange]);

  const updateHelper = useCallback((phaseIdx: number, field: "handoff" | "risk" | "metric", value: string) => {
    if (!onHelpersChange || !stageHelpers) return;
    const newHelpers = stageHelpers.map(h => ({ ...h }));
    if (!newHelpers[phaseIdx]) newHelpers[phaseIdx] = {};
    newHelpers[phaseIdx][field] = value;
    onHelpersChange(newHelpers);
  }, [stageHelpers, onHelpersChange]);

  const addNotionLink = useCallback((laneId: string, phaseIdx: number, label: string, url: string, role?: "mgr" | "staff") => {
    if (!onDataChange) return;
    const newData = JSON.parse(JSON.stringify(data)) as TaskBoardData;
    const lane = newData.lanes.find(l => l.id === laneId);
    if (!lane) return;
    if (!lane.sourceCells) lane.sourceCells = phases.map(() => ({ isEmpty: true }));
    if (!lane.sourceCells[phaseIdx]) lane.sourceCells[phaseIdx] = { isEmpty: true };
    const cell = lane.sourceCells[phaseIdx];
    if (!cell.notionLinks) cell.notionLinks = [];
    cell.notionLinks.push({ label, url, role });
    cell.isEmpty = false;
    onDataChange(newData);
  }, [data, phases, onDataChange]);

  const removeNotionLink = useCallback((laneId: string, phaseIdx: number, linkIdx: number) => {
    if (!onDataChange) return;
    const newData = JSON.parse(JSON.stringify(data)) as TaskBoardData;
    const lane = newData.lanes.find(l => l.id === laneId);
    if (!lane?.sourceCells?.[phaseIdx]?.notionLinks) return;
    lane.sourceCells[phaseIdx].notionLinks!.splice(linkIdx, 1);
    if (lane.sourceCells[phaseIdx].notionLinks!.length === 0) {
      lane.sourceCells[phaseIdx].isEmpty = true;
    }
    onDataChange(newData);
  }, [data, onDataChange]);

  return (
    <div style={{ padding: "0", display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Grid Container — single scroll container for both axes */}
      <div
        style={{
          background: "#fff",
          borderLeft: "1px solid #E8EEF5",
          borderRight: "1px solid #E8EEF5",
          flex: 1,
          overflow: "auto",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `180px repeat(${phaseCount}, minmax(180px, 1fr))`,
            minWidth: 180 + phaseCount * 185,
            position: "relative",
            alignItems: "stretch",
          }}
        >
          {/* ── Row 1: Phase Group Header ── */}
          <div
            style={{
              background: "#080812", color: "#fff",
              borderRight: "1px solid rgba(255,255,255,0.18)",
              borderBottom: "1px solid rgba(255,255,255,0.16)",
              fontSize: 9, fontWeight: 700, letterSpacing: "0.65px",
              display: "flex", alignItems: "center", justifyContent: "center",
              minHeight: 44,
              position: "sticky", top: 0, left: 0, zIndex: 260,
              boxShadow: "2px 0 0 rgba(255,255,255,0.18)",
            }}
          >
            MAIN PHASE
          </div>
          {phaseGroups.map((g, gi) => (
            <div
              key={gi}
              style={{
                gridColumn: `span ${g.span}`,
                background: g.color,
                color: "#fff",
                borderRight: "1px solid rgba(255,255,255,0.16)",
                borderBottom: "1px solid rgba(255,255,255,0.14)",
                borderLeft: "2px solid rgba(255,255,255,0.45)",
                textAlign: "center",
                minHeight: 44,
                padding: "6px 4px",
                display: "flex", flexDirection: "column", justifyContent: "center",
                position: "sticky", top: 0, zIndex: 250,
                fontSize: 10, fontWeight: 600, lineHeight: 1.2,
              }}
            >
              {g.label}
            </div>
          ))}

          {/* ── Row 2: Journey Phase Header ── */}
          <div
            style={{
              background: "#0d0d1a", color: "#fff",
              borderRight: "1px solid rgba(255,255,255,0.18)",
              borderBottom: "1px solid rgba(255,255,255,0.16)",
              fontSize: 10, fontWeight: 700, letterSpacing: "0.6px",
              display: "flex", alignItems: "center", justifyContent: "center",
              minHeight: 56,
              position: "sticky", top: 44, left: 0, zIndex: 240,
              boxShadow: "2px 0 0 rgba(255,255,255,0.18)",
            }}
          >
            JOURNEY PHASE
          </div>
          {phases.map((p, pi) => {
            const group = phaseGroups[p.groupIdx];
            const isGroupStart = groupStarts.has(pi);
            return (
              <div
                key={p.id}
                style={{
                  background: group?.color || "#1a1a2e",
                  color: "#fff",
                  borderRight: "1px solid rgba(255,255,255,0.16)",
                  borderBottom: "1px solid rgba(255,255,255,0.14)",
                  borderLeft: isGroupStart ? "2px solid rgba(255,255,255,0.45)" : undefined,
                  textAlign: "center",
                  minHeight: 56,
                  padding: "8px 6px",
                  display: "flex", flexDirection: "column", justifyContent: "center",
                  position: "sticky", top: 44, zIndex: 230,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.58, marginBottom: 2 }}>
                  {p.id}
                </span>
                <span style={{ fontSize: 10, fontWeight: 600, lineHeight: 1.2, wordBreak: "keep-all" }}>
                  {p.label}
                </span>
              </div>
            );
          })}

          {/* ── Row 2.5: 반영 포인트 행 ── */}
          {stageReflected && stageReflected.length > 0 && (
            <>
              <div
                style={{
                  background: "#fafafa",
                  borderRight: "2px solid rgba(0,0,0,0.06)",
                  borderBottom: "1px solid #ececec",
                  padding: "6px 8px",
                  display: "flex", alignItems: "center",
                  position: "sticky", left: 0, zIndex: 120,
                  boxShadow: "2px 0 0 rgba(0,0,0,0.06)",
                  fontSize: 9, fontWeight: 700, color: "#71717a",
                }}
              >
                반영 포인트
              </div>
              {phases.map((p, pi) => {
                const isGroupStart = groupStarts.has(pi);
                return (
                  <div
                    key={`reflected-${p.id}`}
                    style={{
                      background: "#fafafa",
                      borderRight: "1px solid #f0f0f0",
                      borderBottom: "1px solid #ececec",
                      borderLeft: isGroupStart ? "2px solid #cbd5e1" : undefined,
                      padding: "6px 8px",
                      fontSize: 9,
                      color: "#71717a",
                      lineHeight: 1.4,
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                      alignSelf: "stretch",
                    }}
                  >
                    {editMode ? (
                      <EditableText
                        value={stageReflected[pi] || ""}
                        onChange={(v) => updateReflected(pi, v)}
                        placeholder="반영 포인트 입력..."
                        fontSize={9}
                      />
                    ) : (
                      stageReflected[pi] || ""
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* ── Row 2.6: 인계·리스크·지표 보조 구역 행 ── */}
          {hasHelpers && (
            <>
              <div
                style={{
                  background: "#fafafa",
                  borderRight: "2px solid rgba(0,0,0,0.06)",
                  borderBottom: "1px solid #ececec",
                  padding: "6px 8px",
                  display: "flex", alignItems: "center",
                  position: "sticky", left: 0, zIndex: 120,
                  boxShadow: "2px 0 0 rgba(0,0,0,0.06)",
                  fontSize: 9, fontWeight: 700, color: "#71717a",
                }}
              >
                인계·리스크·지표
              </div>
              {phases.map((p, pi) => {
                const helper = stageHelpers?.[pi];
                const isGroupStart = groupStarts.has(pi);
                return (
                  <div
                    key={`helper-${p.id}`}
                    style={{
                      background: "#fafafa",
                      borderRight: "1px solid #f0f0f0",
                      borderBottom: "1px solid #ececec",
                      borderLeft: isGroupStart ? "2px solid #cbd5e1" : undefined,
                      padding: "6px 8px",
                      alignSelf: "stretch",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 3,
                      alignItems: "flex-start",
                      alignContent: "flex-start",
                    }}
                  >
                    {editMode ? (
                      <div className="flex flex-col gap-1 w-full">
                        <EditableText value={helper?.handoff || ""} onChange={(v) => updateHelper(pi, "handoff", v)} placeholder="인계 포인트" fontSize={8} bgColor="#eff6ff" textColor="#2563eb" />
                        <EditableText value={helper?.risk || ""} onChange={(v) => updateHelper(pi, "risk", v)} placeholder="리스크·예외" fontSize={8} bgColor="#fff7ed" textColor="#c2410c" />
                        <EditableText value={helper?.metric || ""} onChange={(v) => updateHelper(pi, "metric", v)} placeholder="운영지표" fontSize={8} bgColor="#f0fdf4" textColor="#15803d" />
                      </div>
                    ) : (
                      <>
                        {helper?.handoff && (
                          <span style={{ fontSize: 8, fontWeight: 700, borderRadius: 3, padding: "2px 5px", lineHeight: 1.3, background: "#eff6ff", color: "#2563eb" }}>{helper.handoff}</span>
                        )}
                        {helper?.risk && (
                          <span style={{ fontSize: 8, fontWeight: 700, borderRadius: 3, padding: "2px 5px", lineHeight: 1.3, background: "#fff7ed", color: "#c2410c" }}>{helper.risk}</span>
                        )}
                        {helper?.metric && (
                          <span style={{ fontSize: 8, fontWeight: 700, borderRadius: 3, padding: "2px 5px", lineHeight: 1.3, background: "#f0fdf4", color: "#15803d" }}>{helper.metric}</span>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* ── Lane Rows ── */}
          {lanes.map((lane) => {
            const isCollapsed = collapsedLanes.has(lane.id);
            const laneColor = LANE_COLORS[lane.colorId] || LANE_COLORS.cx;
            const divider = dividerMap.get(lane.id);

            return (
              <LaneRows
                key={lane.id}
                lane={lane}
                laneColor={laneColor}
                phases={phases}
                phaseGroups={phaseGroups}
                groupStarts={groupStarts}
                isCollapsed={isCollapsed}
                onToggle={() => toggleLane(lane.id)}
                divider={divider}
                phaseCount={phaseCount}
                editMode={editMode}
                onCellChange={updateCell}
                onAddLink={addNotionLink}
                onRemoveLink={removeNotionLink}
              />
            );
          })}
        </div>
      </div>

      {/* Footer spacer */}
    </div>
  );
}

/* ─── Role Badge Helper ─── */

const ROLE_BADGE: Record<string, { bg: string; color: string; text: string }> = {
  mgr:   { bg: "#eff6ff", color: "#1e40af", text: "관리자" },
  staff: { bg: "#ecfdf5", color: "#065f46", text: "실무자" },
};

/* ─── Lane Row Sub-component ─── */

interface LaneRowsProps {
  lane: TaskLane;
  laneColor: { bg: string; cellBg: string; teamBg: string; teamText: string };
  phases: { id: string; label: string; groupIdx: number }[];
  phaseGroups: { label: string; color: string; span: number }[];
  groupStarts: Set<number>;
  isCollapsed: boolean;
  onToggle: () => void;
  divider?: TaskDivider;
  phaseCount: number;
  editMode?: boolean;
  onCellChange?: (laneId: string, phaseIdx: number, field: "title" | "desc" | "improvement", value: string) => void;
  onAddLink?: (laneId: string, phaseIdx: number, label: string, url: string, role?: "mgr" | "staff") => void;
  onRemoveLink?: (laneId: string, phaseIdx: number, linkIdx: number) => void;
}

function LaneRows({ lane, laneColor, phases, groupStarts, isCollapsed, onToggle, divider, phaseCount, editMode, onCellChange, onAddLink, onRemoveLink }: LaneRowsProps) {
  const hasSourceCells = lane.sourceCells && lane.sourceCells.some(c => !c.isEmpty);

  return (
    <>
      {/* Main Lane Label */}
      <div
        style={{
          background: laneColor.bg,
          borderRight: "2px solid rgba(0,0,0,0.06)",
          borderBottom: "1px solid #ececec",
          padding: "12px 10px",
          display: "flex", flexDirection: "column", justifyContent: "center", gap: 3,
          position: "sticky", left: 0, zIndex: 120,
          boxShadow: "2px 0 0 rgba(0,0,0,0.06)",
          minHeight: isCollapsed ? 44 : 88,
          cursor: "pointer",
          alignSelf: "stretch",
        }}
        onClick={onToggle}
      >
        <div className="flex items-center gap-1.5">
          {isCollapsed ? <ChevronRight size={12} color="#64748b" /> : <ChevronDown size={12} color="#64748b" />}
          <span style={{ fontSize: 12, fontWeight: 700 }}>{lane.nameKr}</span>
        </div>
        {!isCollapsed && (
          <>
            <span style={{ fontSize: 9, color: "#999" }}>{lane.nameEn}</span>
            <span style={{
              fontSize: 9, fontWeight: 600, borderRadius: 4, padding: "2px 6px",
              width: "fit-content", marginTop: 2,
              background: laneColor.teamBg, color: laneColor.teamText,
            }}>
              {lane.team}
            </span>
          </>
        )}
      </div>

      {/* Main Lane Cells */}
      {phases.map((p, pi) => {
        const cell = lane.cells[pi];
        const isGroupStart = groupStarts.has(pi);
        if (isCollapsed) {
          return (
            <div
              key={p.id}
              style={{
                background: laneColor.cellBg,
                borderRight: "1px solid #f0f0f0",
                borderBottom: "1px solid #ececec",
                borderLeft: isGroupStart ? "2px solid #cbd5e1" : undefined,
                minHeight: 44,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, color: "#94a3b8",
                alignSelf: "stretch",
              }}
            >
              {cell && !cell.isEmpty ? "..." : "—"}
            </div>
          );
        }
        return (
          <CellView
            key={p.id}
            cell={cell}
            cellBg={laneColor.cellBg}
            isGroupStart={isGroupStart}
            editMode={editMode}
            onFieldChange={onCellChange ? (field, value) => onCellChange(lane.id, pi, field, value) : undefined}
          />
        );
      })}

      {/* Source Row (Notion links) */}
      {!isCollapsed && (hasSourceCells || editMode) && (
        <>
          <div
            style={{
              background: laneColor.bg,
              borderRight: "2px solid rgba(0,0,0,0.06)",
              borderBottom: "1px solid #ececec",
              borderTop: "1px dashed #cbd5e1",
              padding: "8px 10px",
              display: "flex", flexDirection: "column", justifyContent: "center", gap: 2,
              position: "sticky", left: 0, zIndex: 120,
              boxShadow: "2px 0 0 rgba(0,0,0,0.06)",
              opacity: 0.9,
              minHeight: 50,
              alignSelf: "stretch",
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700 }}>{lane.nameKr}</span>
            <span style={{ fontSize: 9, color: "#999" }}>업무소스</span>
          </div>
          {phases.map((p, pi) => {
            const srcCell = lane.sourceCells?.[pi];
            const isGroupStart = groupStarts.has(pi);
            return (
              <SourceCellView
                key={`src-${p.id}`}
                cell={srcCell}
                cellBg={laneColor.cellBg}
                isGroupStart={isGroupStart}
                editMode={editMode}
                onAddLink={onAddLink ? (label, url, role) => onAddLink(lane.id, pi, label, url, role) : undefined}
                onRemoveLink={onRemoveLink ? (linkIdx) => onRemoveLink(lane.id, pi, linkIdx) : undefined}
              />
            );
          })}
        </>
      )}

      {/* Divider */}
      {divider && (
        <DividerRow divider={divider} phaseCount={phaseCount} />
      )}
    </>
  );
}

/* ─── Cell View ─── */

function CellView({ cell, cellBg, isGroupStart, editMode, onFieldChange }: {
  cell?: TaskCell; cellBg: string; isGroupStart: boolean;
  editMode?: boolean;
  onFieldChange?: (field: "title" | "desc" | "improvement", value: string) => void;
}) {
  if (!cell || cell.isEmpty) {
    if (editMode) {
      return (
        <div style={{
          background: cellBg, borderRight: "1px solid #f0f0f0", borderBottom: "1px solid #ececec",
          borderLeft: isGroupStart ? "2px solid #cbd5e1" : undefined,
          minHeight: 88, padding: "8px", alignSelf: "stretch",
        }}>
          <EditableText value="" onChange={(v) => onFieldChange?.("title", v)} placeholder="제목 입력..." fontSize={10.5} fontWeight={700} />
          <EditableText value="" onChange={(v) => onFieldChange?.("desc", v)} placeholder="설명 입력..." fontSize={9.5} textColor="#555" />
        </div>
      );
    }
    return (
      <div style={{
        background: cellBg, borderRight: "1px solid #f0f0f0", borderBottom: "1px solid #ececec",
        borderLeft: isGroupStart ? "2px solid #cbd5e1" : undefined,
        minHeight: 88, display: "flex", alignItems: "center", justifyContent: "center",
        color: "#b9b9b9", fontStyle: "italic", fontSize: 10, padding: "8px", alignSelf: "stretch",
      }}>
        —
      </div>
    );
  }

  return (
    <div style={{
      background: cellBg, borderRight: "1px solid #f0f0f0", borderBottom: "1px solid #ececec",
      borderLeft: isGroupStart ? "2px solid #cbd5e1" : undefined,
      minHeight: 88, padding: "8px 8px 7px", fontSize: 10, lineHeight: 1.42, alignSelf: "stretch",
    }}>
      {editMode ? (
        <>
          <EditableText value={cell.title || ""} onChange={(v) => onFieldChange?.("title", v)} placeholder="제목" fontSize={10.5} fontWeight={700} />
          <EditableText value={cell.desc || ""} onChange={(v) => onFieldChange?.("desc", v)} placeholder="설명" fontSize={9.5} textColor="#555" />
          <div style={{ marginTop: 4 }}>
            <EditableText value={cell.improvement || ""} onChange={(v) => onFieldChange?.("improvement", v)} placeholder="개선점 (선택)" fontSize={8} bgColor="#fefce8" textColor="#713f12" />
          </div>
        </>
      ) : (
        <>
          {cell.title && (
            <div style={{ fontSize: 10.5, fontWeight: 700, marginBottom: 2, color: "#1a1a2e", lineHeight: 1.35, wordBreak: "break-word", overflowWrap: "anywhere" }}>
              {cell.title}
            </div>
          )}
          {cell.desc && (
            <div style={{ fontSize: 9.5, color: "#555", lineHeight: 1.4, wordBreak: "break-word", overflowWrap: "anywhere" }}>
              {cell.desc}
            </div>
          )}
          {cell.tags && cell.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {cell.tags.map((tag, i) => {
                const tc = TAG_COLORS[tag] || TAG_COLORS.P0;
                return (
                  <span key={i} style={{ fontSize: 8, fontWeight: 700, borderRadius: 3, padding: "1px 4px", lineHeight: 1.3, background: tc.bg, color: tc.text }}>{tag}</span>
                );
              })}
            </div>
          )}
          {cell.improvement && (
            <div style={{ marginTop: 4, background: "#fefce8", border: "1px dashed #fde68a", borderRadius: 4, padding: "3px 5px", fontSize: 8, color: "#713f12", lineHeight: 1.4, wordBreak: "break-word", overflowWrap: "anywhere" }}>
              <span style={{ fontWeight: 700 }}>개선점</span> {cell.improvement}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Source Cell (Notion Links) ─── */

function SourceCellView({ cell, cellBg, isGroupStart, editMode, onAddLink, onRemoveLink }: {
  cell?: TaskCell; cellBg: string; isGroupStart: boolean;
  editMode?: boolean;
  onAddLink?: (label: string, url: string, role?: "mgr" | "staff") => void;
  onRemoveLink?: (linkIdx: number) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newRole, setNewRole] = useState<"mgr" | "staff" | "">("");

  const hasLinks = cell?.notionLinks && cell.notionLinks.length > 0;

  const handleAdd = () => {
    if (newLabel && newUrl && onAddLink) {
      onAddLink(newLabel, newUrl, newRole || undefined);
      setNewLabel("");
      setNewUrl("");
      setNewRole("");
      setAdding(false);
    }
  };

  const baseCellStyle = {
    background: cellBg,
    borderRight: "1px solid #f0f0f0",
    borderBottom: "1px solid #ececec",
    borderTop: "1px dashed #cbd5e1",
    borderLeft: isGroupStart ? "2px solid #cbd5e1" : undefined,
    minHeight: 50,
    alignSelf: "stretch" as const,
  };

  if (!hasLinks && !editMode) {
    return (
      <div style={{ ...baseCellStyle, display: "flex", alignItems: "center", justifyContent: "center", color: "#b9b9b9", fontStyle: "italic", fontSize: 10 }}>
        —
      </div>
    );
  }

  return (
    <div style={{ ...baseCellStyle, padding: "6px 6px" }}>
      {hasLinks && (
        <>
          <div style={{ fontSize: 8, fontWeight: 700, color: "#64748b", marginBottom: 3 }}>업무소스</div>
          <div className="flex flex-wrap gap-1">
            {cell!.notionLinks!.map((link, i) => {
              const roleBadge = link.role ? ROLE_BADGE[link.role] : null;
              return (
                <span key={i} className="inline-flex items-center gap-0.5">
                  {roleBadge && (
                    <span style={{ fontSize: 8, fontWeight: 700, borderRadius: 3, padding: "2px 4px", lineHeight: 1.3, background: roleBadge.bg, color: roleBadge.color, marginRight: 2 }}>
                      {roleBadge.text}
                    </span>
                  )}
                  <a href={link.url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 hover:bg-blue-100 transition-colors"
                    style={{ fontSize: 8, fontWeight: 700, color: "#1d4ed8", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 4, padding: "2px 5px", textDecoration: "none", lineHeight: 1.35, wordBreak: "break-word", overflowWrap: "anywhere", maxWidth: "100%" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={8} style={{ flexShrink: 0 }} />
                    {link.label}
                  </a>
                  {editMode && (
                    <button onClick={() => onRemoveLink?.(i)} style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 3, fontSize: 7, fontWeight: 700, padding: "1px 4px", cursor: "pointer", lineHeight: 1.3 }} title="삭제">✕</button>
                  )}
                </span>
              );
            })}
          </div>
        </>
      )}
      {editMode && !adding && (
        <button
          onClick={() => setAdding(true)}
          style={{ marginTop: hasLinks ? 4 : 0, background: "#eff6ff", color: "#2563eb", border: "1px dashed #93c5fd", borderRadius: 4, fontSize: 8, fontWeight: 600, padding: "3px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}
        >
          <span style={{ fontSize: 10, lineHeight: 1 }}>+</span> 링크 추가
        </button>
      )}
      {editMode && adding && (
        <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 3, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 4, padding: 6 }}>
          <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="링크 이름" style={{ fontSize: 9, border: "1px solid #cbd5e1", borderRadius: 3, padding: "3px 5px", outline: "none", width: "100%" }} />
          <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://notion.so/..." style={{ fontSize: 9, border: "1px solid #cbd5e1", borderRadius: 3, padding: "3px 5px", outline: "none", width: "100%" }} />
          <div className="flex items-center gap-2">
            <select value={newRole} onChange={(e) => setNewRole(e.target.value as "" | "mgr" | "staff")} style={{ fontSize: 9, border: "1px solid #cbd5e1", borderRadius: 3, padding: "2px 4px", flex: 1 }}>
              <option value="">역할 선택 (선택)</option>
              <option value="mgr">관리자</option>
              <option value="staff">실무자</option>
            </select>
            <button onClick={handleAdd} disabled={!newLabel || !newUrl} style={{ fontSize: 8, fontWeight: 700, background: newLabel && newUrl ? "#2563eb" : "#94a3b8", color: "#fff", border: "none", borderRadius: 3, padding: "3px 8px", cursor: newLabel && newUrl ? "pointer" : "default" }}>추가</button>
            <button onClick={() => { setAdding(false); setNewLabel(""); setNewUrl(""); setNewRole(""); }} style={{ fontSize: 8, fontWeight: 700, background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: 3, padding: "3px 8px", cursor: "pointer" }}>취소</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Divider Line ─── */

function DividerRow({ divider, phaseCount }: { divider: TaskDivider; phaseCount: number }) {
  const typeStyles: Record<string, { borderStyle: string; borderColor: string; labelBg: string; labelBorder: string; labelColor: string }> = {
    interaction: { borderStyle: "solid",  borderColor: "#f97316", labelBg: "#fff7ed", labelBorder: "1.2px solid #fdba74", labelColor: "#ea580c" },
    team:        { borderStyle: "dashed", borderColor: "#94a3b8", labelBg: "#f8fafc", labelBorder: "1.2px dashed #94a3b8", labelColor: "#334155" },
    visibility:  { borderStyle: "dashed", borderColor: "#8b5cf6", labelBg: "#faf5ff", labelBorder: "1.2px dashed #c4b5fd", labelColor: "#7c3aed" },
    internal:    { borderStyle: "dotted", borderColor: "#ef4444", labelBg: "#fff1f2", labelBorder: "1.2px dotted #fca5a5", labelColor: "#dc2626" },
  };
  const ts = typeStyles[divider.type] || typeStyles.team;

  return (
    <div
      style={{
        gridColumn: `1 / -1`,
        position: "relative",
        minHeight: 30,
        display: "flex", alignItems: "center",
      }}
    >
      <div
        style={{
          position: "absolute", left: 0, right: 0, top: "50%",
          borderTop: `2px ${ts.borderStyle} ${ts.borderColor}`,
        }}
      />
      <div
        style={{
          position: "relative", margin: "0 auto",
          fontSize: 9, fontWeight: 700, letterSpacing: "1px",
          padding: "3px 10px", borderRadius: 10,
          zIndex: 1, whiteSpace: "nowrap",
          color: ts.labelColor, background: ts.labelBg,
          border: ts.labelBorder,
        }}
      >
        {divider.label}
      </div>
    </div>
  );
}

/* ─── Inline Editable Text ─── */

function EditableText({ value, onChange, placeholder, fontSize = 10, fontWeight, textColor, bgColor }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  fontSize?: number;
  fontWeight?: number;
  textColor?: string;
  bgColor?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setDraft(value); }, [value]);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      ref.current.select();
      // auto-resize
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onChange(draft);
  };

  if (!editing) {
    return (
      <div
        onClick={() => setEditing(true)}
        style={{
          cursor: "text",
          fontSize, fontWeight,
          color: value ? (textColor || "#1a1a2e") : "#aaa",
          background: bgColor || "transparent",
          borderRadius: bgColor ? 3 : 0,
          padding: bgColor ? "2px 5px" : 0,
          lineHeight: 1.4,
          minHeight: fontSize + 6,
          wordBreak: "break-word",
          overflowWrap: "anywhere",
          border: "1px dashed transparent",
          transition: "border-color 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#93c5fd")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
      >
        {value || placeholder || "클릭하여 입력..."}
      </div>
    );
  }

  return (
    <textarea
      ref={ref}
      value={draft}
      onChange={(e) => {
        setDraft(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = e.target.scrollHeight + "px";
      }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Escape") { setDraft(value); setEditing(false); }
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commit(); }
      }}
      placeholder={placeholder}
      style={{
        width: "100%",
        fontSize, fontWeight,
        color: textColor || "#1a1a2e",
        background: bgColor || "#fff",
        border: "1.5px solid #3b82f6",
        borderRadius: 3,
        padding: "2px 4px",
        lineHeight: 1.4,
        resize: "none",
        overflow: "hidden",
        outline: "none",
        fontFamily: "inherit",
      }}
    />
  );
}
