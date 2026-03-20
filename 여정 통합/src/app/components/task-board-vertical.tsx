/* ================================================================
   세로 모드 블루프린트 — 기존 더바다 블루프린트 스타일
   각 단계를 세로로 쌓아 표시하는 뷰
   ================================================================ */

import { useRef, useState, useEffect, useCallback } from "react";
import type { TaskBoardData, TaskCell, TaskLane } from "./task-data";
import { LANE_COLORS, TAG_COLORS } from "./task-data";
import { ChevronDown, ChevronRight, ExternalLink, AlertTriangle, ArrowRightLeft, BarChart3, Pencil, Check, X, Plus, Trash2 } from "lucide-react";

export interface StageHelperSection {
  handoff?: string;
  risk?: string;
  metric?: string;
}

export interface TaskBoardVerticalProps {
  data: TaskBoardData;
  accentColor?: string;
  stageReflected?: string[];
  stageHelpers?: StageHelperSection[];
  editMode?: boolean;
  onDataChange?: (data: TaskBoardData) => void;
  onReflectedChange?: (reflected: string[]) => void;
  onHelpersChange?: (helpers: StageHelperSection[]) => void;
}

/* ─── 인라인 편집 텍스트 ─── */
function EditableText({
  value,
  onChange,
  editMode,
  className = "",
  style = {},
  placeholder = "내용 입력...",
  multiline = false,
}: {
  value: string;
  onChange: (v: string) => void;
  editMode?: boolean;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!editMode) {
    return <span className={className} style={style}>{value}</span>;
  }

  if (editing) {
    const save = () => { onChange(draft); setEditing(false); };
    const cancel = () => { setDraft(value); setEditing(false); };
    const commonProps = {
      value: draft,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(e.target.value),
      onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); save(); } if (e.key === "Escape") cancel(); },
      autoFocus: true,
      className: "w-full rounded border px-1.5 py-0.5 text-slate-800 outline-none focus:ring-2 focus:ring-blue-300",
      style: { fontSize: "inherit", fontWeight: "inherit", ...style, background: "white", borderColor: "#93c5fd" },
      placeholder,
    };
    return (
      <div className="flex items-center gap-1">
        {multiline ? <textarea {...commonProps} rows={2} /> : <input type="text" {...commonProps} />}
        <button onClick={save} className="p-0.5 rounded hover:bg-green-100 cursor-pointer border-none bg-transparent"><Check size={12} className="text-green-600" /></button>
        <button onClick={cancel} className="p-0.5 rounded hover:bg-red-100 cursor-pointer border-none bg-transparent"><X size={12} className="text-red-400" /></button>
      </div>
    );
  }

  return (
    <span
      className={`${className} cursor-pointer hover:bg-blue-50 rounded px-0.5 transition-colors`}
      style={{ ...style, borderBottom: "1px dashed #93c5fd" }}
      onClick={() => { setDraft(value); setEditing(true); }}
      title="클릭하여 편집"
    >
      {value || <span className="text-slate-300 italic">{placeholder}</span>}
    </span>
  );
}

/* ─── 태그 배지 ─── */
function TagBadge({ tag }: { tag: string }) {
  const color = TAG_COLORS[tag] || { bg: "#f1f5f9", text: "#475569" };
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold leading-none"
      style={{ background: color.bg, color: color.text }}
    >
      {tag}
    </span>
  );
}

/* ─── 역할 배지 ─── */
function RoleBadge({ role }: { role: "mgr" | "staff" }) {
  const isMgr = role === "mgr";
  return (
    <span
      className="inline-flex items-center px-1 py-0.5 rounded text-[8px] font-semibold leading-none ml-1"
      style={{
        background: isMgr ? "#dbeafe" : "#dcfce7",
        color: isMgr ? "#1d4ed8" : "#166534",
      }}
    >
      {isMgr ? "관리자" : "실무자"}
    </span>
  );
}

/* ─── 셀 카드 ─── */
function CellCard({ cell, laneColor, editMode, onUpdate }: { cell: TaskCell; laneColor: string; editMode?: boolean; onUpdate?: (cell: TaskCell) => void }) {
  if (!editMode && (cell.isEmpty || (!cell.title && !cell.notionLinks?.length))) return null;

  const colors = LANE_COLORS[laneColor] || LANE_COLORS.cx;

  return (
    <div
      className="rounded-lg p-3 border transition-all hover:shadow-sm"
      style={{
        background: colors.cellBg,
        borderColor: editMode ? "#93c5fd" : `${colors.teamBg}60`,
        outline: editMode ? "1px dashed #93c5fd" : "none",
      }}
    >
      {(cell.title || editMode) && (
        <EditableText
          value={cell.title || ""}
          onChange={(v) => onUpdate?.({ ...cell, title: v, isEmpty: !v })}
          editMode={editMode}
          className="m-0 text-[12px] font-semibold text-slate-800 leading-snug block"
          placeholder="업무 제목 입력..."
        />
      )}
      {(cell.desc || editMode) && (
        <EditableText
          value={cell.desc || ""}
          onChange={(v) => onUpdate?.({ ...cell, desc: v })}
          editMode={editMode}
          className="m-0 mt-1 text-[10px] text-slate-500 leading-relaxed block"
          placeholder="업무 설명 입력..."
        />
      )}
      {cell.tags && cell.tags.length > 0 && (
        <div className="flex gap-1 mt-1.5">
          {cell.tags.map((t, i) => (
            <TagBadge key={i} tag={t} />
          ))}
        </div>
      )}
      {cell.improvement && (
        <div
          className="mt-2 p-1.5 rounded text-[9px] text-amber-700 leading-snug"
          style={{
            background: "#fefce8",
            border: "1px dashed #fbbf24",
          }}
        >
          💡 {cell.improvement}
        </div>
      )}
    </div>
  );
}

/* ─── 소스 링크 ─── */
function SourceLinks({ cell }: { cell: TaskCell }) {
  if (!cell.notionLinks || cell.notionLinks.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {cell.notionLinks.map((link, i) => (
        <a
          key={i}
          href={link.url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-medium transition-colors hover:opacity-80 no-underline"
          style={{
            background: "#f8fafc",
            color: "#475569",
            border: "1px solid #e2e8f0",
          }}
        >
          <ExternalLink size={9} />
          <span className="max-w-[140px] truncate">{link.label}</span>
          {link.role && <RoleBadge role={link.role} />}
        </a>
      ))}
    </div>
  );
}

/* ─── 구분선 ─── */
function DividerLine({ label, type }: { label: string; type: string }) {
  const color =
    type === "interaction"
      ? "#ef4444"
      : type === "visibility"
        ? "#6366f1"
        : type === "internal"
          ? "#14b8a6"
          : "#f59e0b";

  return (
    <div className="flex items-center gap-3 py-2 px-3">
      <div className="flex-1 border-t-2 border-dashed" style={{ borderColor: `${color}50` }} />
      <span
        className="text-[9px] font-bold uppercase tracking-wider whitespace-nowrap px-2 py-0.5 rounded-full"
        style={{ color, background: `${color}10` }}
      >
        {label}
      </span>
      <div className="flex-1 border-t-2 border-dashed" style={{ borderColor: `${color}50` }} />
    </div>
  );
}

/* ─── 보조 구역 카드 ─── */
function HelperCard({
  icon,
  label,
  text,
  color,
  editMode,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  text: string;
  color: string;
  editMode?: boolean;
  onChange?: (v: string) => void;
}) {
  return (
    <div
      className="flex items-start gap-2 p-2.5 rounded-lg border"
      style={{ background: `${color}08`, borderColor: editMode ? "#93c5fd" : `${color}25` }}
    >
      <div
        className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full mt-0.5"
        style={{ background: `${color}15`, color }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="m-0 text-[9px] font-bold uppercase tracking-wider" style={{ color }}>
          {label}
        </p>
        <EditableText
          value={text}
          onChange={(v) => onChange?.(v)}
          editMode={editMode}
          className="m-0 mt-0.5 text-[10px] text-slate-600 leading-relaxed block"
          placeholder={`${label} 입력...`}
        />
      </div>
    </div>
  );
}

/* ─── 레인 행 (한 단계 내 하나의 팀) ─── */
function LaneRow({ lane, phaseIdx, editMode, onCellUpdate }: { lane: TaskLane; phaseIdx: number; editMode?: boolean; onCellUpdate?: (laneId: string, phaseIdx: number, cell: TaskCell) => void }) {
  const cell = lane.cells[phaseIdx];
  const sourceCell = lane.sourceCells?.[phaseIdx];
  const colors = LANE_COLORS[lane.colorId] || LANE_COLORS.cx;

  const hasContent =
    (cell && !cell.isEmpty && cell.title) ||
    (sourceCell && !sourceCell.isEmpty && sourceCell.notionLinks?.length);

  if (!editMode && !hasContent) return null;

  return (
    <div className="flex gap-3 items-start">
      {/* 팀 배지 */}
      <div className="flex-shrink-0 w-[72px] pt-1">
        <div
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md"
          style={{ background: colors.teamBg, color: colors.teamText }}
        >
          <span className="text-[9px] font-bold whitespace-nowrap">{lane.team}</span>
        </div>
        <p className="m-0 mt-0.5 text-[8px] text-slate-400 font-medium">{lane.nameEn}</p>
      </div>

      {/* 셀 내용 */}
      <div className="flex-1 min-w-0">
        <CellCard
          cell={cell || { isEmpty: true }}
          laneColor={lane.colorId}
          editMode={editMode}
          onUpdate={(updated) => onCellUpdate?.(lane.id, phaseIdx, updated)}
        />
        {sourceCell && !sourceCell.isEmpty && <SourceLinks cell={sourceCell} />}
      </div>
    </div>
  );
}

/* ================================================================
   메인 컴포넌트
   ================================================================ */
export function TaskBoardVertical({
  data,
  accentColor = "#6366f1",
  stageReflected,
  stageHelpers,
  editMode,
  onDataChange,
  onReflectedChange,
  onHelpersChange,
}: TaskBoardVerticalProps) {
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activePhaseIdx, setActivePhaseIdx] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [collapsedStages, setCollapsedStages] = useState<Set<number>>(new Set());

  // 셀 업데이트 콜백
  const handleCellUpdate = useCallback((laneId: string, phaseIdx: number, cell: TaskCell) => {
    if (!onDataChange) return;
    const newData = { ...data, lanes: data.lanes.map(lane => {
      if (lane.id !== laneId) return lane;
      const newCells = [...lane.cells];
      newCells[phaseIdx] = cell;
      return { ...lane, cells: newCells };
    })};
    onDataChange(newData);
  }, [data, onDataChange]);

  // 반영 포인트 업데이트
  const handleReflectedUpdate = useCallback((idx: number, text: string) => {
    if (!onReflectedChange || !stageReflected) return;
    const newReflected = [...stageReflected];
    newReflected[idx] = text;
    onReflectedChange(newReflected);
  }, [stageReflected, onReflectedChange]);

  // 보조 구역 업데이트
  const handleHelperUpdate = useCallback((idx: number, field: keyof StageHelperSection, text: string) => {
    if (!onHelpersChange || !stageHelpers) return;
    const newHelpers = [...stageHelpers];
    newHelpers[idx] = { ...newHelpers[idx], [field]: text };
    onHelpersChange(newHelpers);
  }, [stageHelpers, onHelpersChange]);

  // IntersectionObserver로 현재 보이는 단계 추적
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    stageRefs.current.forEach((el, idx) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActivePhaseIdx(idx);
        },
        { threshold: 0.3 }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [data.phases.length]);

  const scrollToPhase = (idx: number) => {
    stageRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleCollapse = (idx: number) => {
    setCollapsedStages((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // 구분선 위치 맵
  const dividerAfterLane = new Map(data.dividers.map((d) => [d.afterLaneId, d]));

  return (
    <div className="flex flex-col" style={{ minWidth: 600 }}>
      {/* ─── Sticky Header Container ─── */}
      <div
        className="sticky z-20 pb-2"
        style={{ top: -1, background: "#F8FAFC", paddingTop: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
      >
        {/* Phase Group Bar */}
        <div
          className="flex items-stretch rounded-xl overflow-hidden shadow-sm"
          style={{ border: "1px solid #e2e8f0", background: "white" }}
        >
          {data.phaseGroups.map((pg, gi) => {
            const startIdx = data.phaseGroups
              .slice(0, gi)
              .reduce((sum, g) => sum + g.span, 0);
            const isActive =
              activePhaseIdx >= startIdx && activePhaseIdx < startIdx + pg.span;
            return (
              <button
                key={gi}
                onClick={() => scrollToPhase(startIdx)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 cursor-pointer transition-all duration-200 border-none"
                style={{
                  background: isActive ? pg.color : `${pg.color}10`,
                  color: isActive ? "white" : pg.color,
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 11,
                  borderRight:
                    gi < data.phaseGroups.length - 1 ? "1px solid #e2e8f0" : "none",
                }}
              >
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                  style={{
                    background: isActive ? "rgba(255,255,255,0.3)" : `${pg.color}20`,
                    color: isActive ? "white" : pg.color,
                  }}
                >
                  {pg.span}
                </span>
                {pg.label}
              </button>
            );
          })}
        </div>

        {/* Phase Tabs */}
        <div
          className="flex items-center gap-1 pt-3 overflow-x-auto flex-shrink-0"
          style={{ scrollbarWidth: "thin" }}
        >
        {data.phases.map((phase, pi) => {
          const group = data.phaseGroups[phase.groupIdx];
          const isActive = pi === activePhaseIdx;
          return (
            <button
              key={phase.id}
              onClick={() => scrollToPhase(pi)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all duration-150 whitespace-nowrap border-none flex-shrink-0"
              style={{
                background: isActive ? group?.color || accentColor : "#f8fafc",
                color: isActive ? "white" : "#64748b",
                fontSize: 10,
                fontWeight: isActive ? 700 : 500,
                boxShadow: isActive ? `0 2px 8px ${group?.color || accentColor}40` : "none",
                border: isActive ? "none" : "1px solid #e2e8f0",
              }}
            >
              <span className="font-bold">S{pi + 1}</span>
              <span className="max-w-[100px] truncate">{phase.label}</span>
            </button>
          );
        })}
        </div>
      </div>

      {/* ─── Vertical Stages ─── */}
      <div ref={scrollContainerRef} className="flex flex-col gap-4 pb-8">
        {data.phases.map((phase, pi) => {
          const group = data.phaseGroups[phase.groupIdx];
          const groupColor = group?.color || accentColor;
          const reflected = stageReflected?.[pi];
          const helper = stageHelpers?.[pi];
          const isCollapsed = collapsedStages.has(pi);

          return (
            <div
              key={phase.id}
              ref={(el) => { stageRefs.current[pi] = el; }}
              className="rounded-xl border bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md"
              style={{ borderColor: `${groupColor}30` }}
            >
              {/* Stage Header */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
                onClick={() => toggleCollapse(pi)}
                style={{
                  background: `linear-gradient(135deg, ${groupColor}08, ${groupColor}15)`,
                  borderBottom: isCollapsed ? "none" : `1px solid ${groupColor}20`,
                }}
              >
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-white font-extrabold text-sm"
                  style={{
                    background: `linear-gradient(135deg, ${groupColor}, ${groupColor}CC)`,
                    boxShadow: `0 2px 8px ${groupColor}40`,
                  }}
                >
                  {pi + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-slate-800">{phase.label}</span>
                    <span
                      className="px-1.5 py-0.5 rounded-full text-[8px] font-bold"
                      style={{ background: `${groupColor}15`, color: groupColor }}
                    >
                      {group?.label}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium">{phase.id}</span>
                </div>
                <div className="text-slate-400">
                  {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {/* Collapsed → skip body */}
              {!isCollapsed && (
                <div className="px-4 py-3 flex flex-col gap-3">
                  {/* 반영 포인트 */}
                  {(reflected || editMode) && (
                    <div
                      className="flex items-start gap-2 p-2.5 rounded-lg border"
                      style={{
                        background: `${groupColor}06`,
                        borderColor: editMode ? "#93c5fd" : `${groupColor}20`,
                      }}
                    >
                      <span className="text-[10px] flex-shrink-0 mt-0.5" style={{ color: groupColor }}>
                        ✦
                      </span>
                      <div className="flex-1">
                        <p className="m-0 text-[9px] font-bold uppercase tracking-wider" style={{ color: groupColor }}>
                          반영 포인트
                        </p>
                        <EditableText
                          value={reflected || ""}
                          onChange={(v) => handleReflectedUpdate(pi, v)}
                          editMode={editMode}
                          className="m-0 mt-0.5 text-[10px] text-slate-600 leading-relaxed block"
                          placeholder="반영 포인트 입력..."
                        />
                      </div>
                    </div>
                  )}

                  {/* 레인 행들 */}
                  {data.lanes.map((lane) => {
                    const divider = dividerAfterLane.get(lane.id);
                    return (
                      <div key={lane.id}>
                        <LaneRow lane={lane} phaseIdx={pi} editMode={editMode} onCellUpdate={handleCellUpdate} />
                        {divider && <DividerLine label={divider.label} type={divider.type} />}
                      </div>
                    );
                  })}

                  {/* 보조 구역 */}
                  {(editMode || (helper && (helper.handoff || helper.risk || helper.metric))) && (
                    <div className="mt-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {(helper?.handoff || editMode) && (
                        <HelperCard
                          icon={<ArrowRightLeft size={10} />}
                          label="인계 포인트"
                          text={helper?.handoff || ""}
                          color="#3b82f6"
                          editMode={editMode}
                          onChange={(v) => handleHelperUpdate(pi, "handoff", v)}
                        />
                      )}
                      {(helper?.risk || editMode) && (
                        <HelperCard
                          icon={<AlertTriangle size={10} />}
                          label="리스크·예외"
                          text={helper?.risk || ""}
                          color="#f97316"
                          editMode={editMode}
                          onChange={(v) => handleHelperUpdate(pi, "risk", v)}
                        />
                      )}
                      {(helper?.metric || editMode) && (
                        <HelperCard
                          icon={<BarChart3 size={10} />}
                          label="운영지표"
                          text={helper?.metric || ""}
                          color="#22c55e"
                          editMode={editMode}
                          onChange={(v) => handleHelperUpdate(pi, "metric", v)}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-[10px] text-slate-400">
            {data.phaseGroups.length}대 단계 · {data.phases.length}단계 · {data.lanes.length}개 레인
          </p>
        </div>
      </div>
    </div>
  );
}
