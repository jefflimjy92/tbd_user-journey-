import { useState, useRef, useCallback, useEffect } from "react";
import { COLORS } from "./components/journey-data";
import type { Stage, JourneyNode } from "./components/journey-data";
import { JOURNEY_TYPES, getJourneyType, type JourneyTypeId } from "./components/journey-types";
import { StageCard } from "./components/stage-card";
import type { StageStatus } from "./components/stage-card";
import { LegendPanel } from "./components/legend-panel";
import { TreeFlowchart } from "./components/tree-flowchart";
import { TaskBoard } from "./components/task-board";
import { TaskBoardVertical } from "./components/task-board-vertical";
// stageReflected와 stageHelpers는 이제 journeyMeta에서 가져옴
import { EditNodePopover, type NodeType } from "./components/edit-node-popover";
import type { ExitSeverity, GoalSeverity } from "./components/journey-data";
import type { FlowEdge } from "./components/flow-data";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  ZoomIn, ZoomOut, Maximize2, Move, Info, LayoutGrid, GitBranch,
  ClipboardList, Rows3, Pencil, RotateCcw, Download, Upload,
} from "lucide-react";

type ViewMode = "map" | "tree" | "tasks" | "blueprint";

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.85);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [scrollPos, setScrollPos] = useState({ x: 0, y: 0 });
  const [showInfo, setShowInfo] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [progressMode] = useState(false);
  const [activeStageIdx, setActiveStageIdx] = useState<number | null>(null);
  const [activeFlowNodeId, setActiveFlowNodeId] = useState<string | null>(null);

  const [journeyType, setJourneyType] = useState<JourneyTypeId>(() =>
    (localStorage.getItem("bada-journey-type") as JourneyTypeId) || "refund"
  );
  const journeyMeta = getJourneyType(journeyType);

  const [editMode, setEditMode] = useState(false);

  // ── 블루프린트(업무 상세) 편집 데이터 (localStorage 저장) ──
  function loadTaskDataForType(typeId: JourneyTypeId) {
    const key = `bada-taskdata-${typeId}`;
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
    return null; // canonical 사용
  }
  function loadReflectedForType(typeId: JourneyTypeId) {
    const key = `bada-reflected-${typeId}`;
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
    return null;
  }
  function loadHelpersForType(typeId: JourneyTypeId) {
    const key = `bada-helpers-${typeId}`;
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
    return null;
  }

  const [taskData, setTaskData] = useState(() => loadTaskDataForType(journeyType) || journeyMeta.taskData);
  const [reflected, setReflected] = useState(() => loadReflectedForType(journeyType) || journeyMeta.stageReflected || []);
  const [helpers, setHelpers] = useState(() => loadHelpersForType(journeyType) || journeyMeta.stageHelpers || []);

  useEffect(() => { localStorage.setItem(`bada-taskdata-${journeyType}`, JSON.stringify(taskData)); }, [taskData, journeyType]);
  useEffect(() => { localStorage.setItem(`bada-reflected-${journeyType}`, JSON.stringify(reflected)); }, [reflected, journeyType]);
  useEffect(() => { localStorage.setItem(`bada-helpers-${journeyType}`, JSON.stringify(helpers)); }, [helpers, journeyType]);

  function loadStagesForType(typeId: JourneyTypeId): Stage[] {
    const DATA_VERSION = 13;
    const meta = getJourneyType(typeId);
    const storageKey = `bada-stages-${typeId}`;
    const versionKey = `bada-stages-version-${typeId}`;
    const deletedKey = `bada-deleted-ids-${typeId}`;
    const savedVersion = localStorage.getItem(versionKey);
    const saved = localStorage.getItem(storageKey);
    const deletedIdsRaw = localStorage.getItem(deletedKey);
    const deletedIds = new Set<string>(deletedIdsRaw ? JSON.parse(deletedIdsRaw) : []);
    const CANONICAL = meta.canonicalStages;
    if (saved) {
      const parsed: Stage[] = JSON.parse(saved);
      if (savedVersion !== String(DATA_VERSION)) {
        const savedNodeIds = new Set<string>();
        for (const stage of parsed) {
          const walk = (nodes: JourneyNode[]) => { for (const n of nodes) { savedNodeIds.add(n.id); if (n.children) walk(n.children); } };
          walk(stage.nodes);
        }
        const canonicalNodeMap = new Map<string, JourneyNode>();
        for (const stage of CANONICAL) {
          const walk = (nodes: JourneyNode[], _p?: string) => { for (const n of nodes) { canonicalNodeMap.set(n.id, n); if (n.children) walk(n.children, n.id); } };
          walk(stage.nodes);
        }
        for (const stage of parsed) {
          const cs = CANONICAL.find(s => s.id === stage.id);
          if (!cs) continue;
          for (const cn of cs.nodes) {
            if (!savedNodeIds.has(cn.id) && !deletedIds.has(cn.id)) {
              stage.nodes.push(JSON.parse(JSON.stringify(cn)));
              if (cn.children) for (const cc of cn.children) savedNodeIds.add(cc.id);
              savedNodeIds.add(cn.id);
            }
          }
          for (const n of stage.nodes) {
            const canonical = canonicalNodeMap.get(n.id);
            if (canonical?.children) {
              if (!n.children) n.children = [];
              for (const cc of canonical.children) {
                if (!savedNodeIds.has(cc.id) && !deletedIds.has(cc.id)) {
                  n.children.push(JSON.parse(JSON.stringify(cc)));
                  savedNodeIds.add(cc.id);
                  if (!n.hasChildren) n.hasChildren = true;
                  if (canonical.groupLabel && !n.groupLabel) n.groupLabel = canonical.groupLabel;
                }
              }
            }
          }
        }
        for (const c of CANONICAL) { if (!parsed.find(s => s.id === c.id)) parsed.push(JSON.parse(JSON.stringify(c))); }
        localStorage.setItem(versionKey, String(DATA_VERSION));
      }
      return parsed;
    }
    localStorage.setItem(versionKey, String(DATA_VERSION));
    return JSON.parse(JSON.stringify(CANONICAL));
  }

  useEffect(() => {
    const oldSaved = localStorage.getItem("bada-stages");
    if (oldSaved && !localStorage.getItem("bada-stages-refund")) {
      localStorage.setItem("bada-stages-refund", oldSaved);
      const v = localStorage.getItem("bada-stages-version"); if (v) localStorage.setItem("bada-stages-version-refund", v);
      const d = localStorage.getItem("bada-deleted-ids"); if (d) localStorage.setItem("bada-deleted-ids-refund", d);
      localStorage.removeItem("bada-stages"); localStorage.removeItem("bada-stages-version"); localStorage.removeItem("bada-deleted-ids");
    }
  }, []);

  const [stages, setStages] = useState<Stage[]>(() => loadStagesForType(journeyType));

  // Mutable flow edges (per journey type)
  function loadEdgesForType(typeId: JourneyTypeId): FlowEdge[] {
    const key = `bada-flow-edges-${typeId}`;
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
    return JSON.parse(JSON.stringify(getJourneyType(typeId).flowEdges));
  }
  const [flowEdges, setFlowEdges] = useState<FlowEdge[]>(() => loadEdgesForType(journeyType));
  useEffect(() => { localStorage.setItem(`bada-flow-edges-${journeyType}`, JSON.stringify(flowEdges)); }, [flowEdges, journeyType]);

  const handleEdgeAdd = useCallback((from: string, to: string) => {
    setFlowEdges(prev => [...prev, { from, to, type: "normal" }]);
  }, []);
  const handleEdgeDelete = useCallback((from: string, to: string) => {
    setFlowEdges(prev => prev.filter(e => !(e.from === from && e.to === to)));
  }, []);
  const handleEdgeUpdate = useCallback((oldFrom: string, oldTo: string, newFrom: string, newTo: string) => {
    setFlowEdges(prev => prev.map(e => (e.from === oldFrom && e.to === oldTo) ? { ...e, from: newFrom, to: newTo } : e));
  }, []);
  const handleEdgeTypeChange = useCallback((from: string, to: string, newType: FlowEdge["type"]) => {
    setFlowEdges(prev => prev.map(e => (e.from === from && e.to === to) ? { ...e, type: newType } : e));
  }, []);

  const [editPopover, setEditPopover] = useState<{
    nodeId: string; label: string; type: NodeType; exitSeverity?: ExitSeverity; goalSeverity?: GoalSeverity;
    position: { x: number; y: number }; stageIdx: number; parentNodeId?: string;
  } | null>(null);

  useEffect(() => { localStorage.setItem(`bada-stages-${journeyType}`, JSON.stringify(stages)); }, [stages, journeyType]);

  const switchJourneyType = (newType: JourneyTypeId) => {
    if (newType === journeyType) return;
    const newMeta = getJourneyType(newType);
    setJourneyType(newType); localStorage.setItem("bada-journey-type", newType);
    setStages(loadStagesForType(newType)); setFlowEdges(loadEdgesForType(newType));
    setTaskData(loadTaskDataForType(newType) || newMeta.taskData);
    setReflected(loadReflectedForType(newType) || newMeta.stageReflected || []);
    setHelpers(loadHelpersForType(newType) || newMeta.stageHelpers || []);
    setEditPopover(null); setEditMode(false); setViewMode("map"); setZoom(0.85);
    if (containerRef.current) { containerRef.current.scrollLeft = 0; containerRef.current.scrollTop = 0; }
  };

  const resetData = () => {
    setStages(JSON.parse(JSON.stringify(getJourneyType(journeyType).canonicalStages)));
    setFlowEdges(JSON.parse(JSON.stringify(getJourneyType(journeyType).flowEdges)));
    setTaskData(JSON.parse(JSON.stringify(journeyMeta.taskData)));
    setReflected(JSON.parse(JSON.stringify(journeyMeta.stageReflected || [])));
    setHelpers(JSON.parse(JSON.stringify(journeyMeta.stageHelpers || [])));
    localStorage.removeItem(`bada-stages-${journeyType}`); localStorage.removeItem(`bada-deleted-ids-${journeyType}`); localStorage.removeItem(`bada-flow-edges-${journeyType}`);
    localStorage.removeItem(`bada-taskdata-${journeyType}`); localStorage.removeItem(`bada-reflected-${journeyType}`); localStorage.removeItem(`bada-helpers-${journeyType}`);
    setEditPopover(null);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify({ version: 1, journeyType, exportedAt: new Date().toISOString(), stages, flowEdges }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url;
    a.download = `더바다_${journeyMeta.label}_운영맵_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { try { const d = JSON.parse(ev.target?.result as string); if (d.stages && Array.isArray(d.stages)) { setStages(d.stages); if (d.flowEdges && Array.isArray(d.flowEdges)) setFlowEdges(d.flowEdges); setEditPopover(null); } else alert("올바른 운영맵 JSON 파일이 아닙니다."); } catch { alert("JSON 파일을 읽는 중 오류가 발생했습니다."); } };
    reader.readAsText(file); e.target.value = "";
  };

  const findNodeContext = (nodeId: string) => {
    for (let si = 0; si < stages.length; si++) {
      const stage = stages[si];
      for (let ni = 0; ni < stage.nodes.length; ni++) {
        const node = stage.nodes[ni];
        if (node.id === nodeId) return { stageIdx: si, nodeIdx: ni, node, isChild: false, parentNodeId: undefined, childIdx: -1, siblings: stage.nodes };
        if (node.children) for (let ci = 0; ci < node.children.length; ci++)
          if (node.children[ci].id === nodeId) return { stageIdx: si, nodeIdx: ni, node: node.children[ci], isChild: true, parentNodeId: node.id, childIdx: ci, siblings: node.children };
      }
    }
    return null;
  };

  const handleNodeEdit = (nodeId: string, rect: DOMRect) => {
    const ctx = findNodeContext(nodeId); if (!ctx) return;
    setEditPopover({ nodeId, label: ctx.node.label, type: ctx.node.type as NodeType, exitSeverity: ctx.node.exitSeverity, goalSeverity: ctx.node.goalSeverity, position: { x: rect.left + rect.width / 2, y: rect.bottom }, stageIdx: ctx.stageIdx, parentNodeId: ctx.parentNodeId });
  };

  const updateNode = (nodeId: string, updater: (n: JourneyNode) => void) => {
    setStages(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as Stage[];
      for (const stage of next) for (const node of stage.nodes) {
        if (node.id === nodeId) { updater(node); return next; }
        if (node.children) for (const child of node.children) if (child.id === nodeId) { updater(child); return next; }
      }
      return next;
    });
  };

  const handleChangeLabel = (nodeId: string, v: string) => { updateNode(nodeId, n => { n.label = v; }); if (editPopover?.nodeId === nodeId) setEditPopover(p => p ? { ...p, label: v } : null); };
  const handleChangeType = (nodeId: string, v: NodeType) => { updateNode(nodeId, n => { n.type = v === "main" ? "neutral" : v as JourneyNode["type"]; }); if (editPopover?.nodeId === nodeId) setEditPopover(p => p ? { ...p, type: v } : null); };
  const handleChangeExitSeverity = (nodeId: string, v: ExitSeverity) => { updateNode(nodeId, n => { n.exitSeverity = v; }); if (editPopover?.nodeId === nodeId) setEditPopover(p => p ? { ...p, exitSeverity: v } : null); };
  const handleChangeGoalSeverity = (nodeId: string, v: GoalSeverity) => { updateNode(nodeId, n => { n.goalSeverity = v; }); if (editPopover?.nodeId === nodeId) setEditPopover(p => p ? { ...p, goalSeverity: v } : null); };

  const handleMoveNode = (nodeId: string, dir: "up" | "down") => {
    setStages(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as Stage[];
      for (const stage of next) {
        const idx = stage.nodes.findIndex(n => n.id === nodeId);
        if (idx >= 0) { const s = dir === "up" ? idx - 1 : idx + 1; if (s >= 0 && s < stage.nodes.length) [stage.nodes[idx], stage.nodes[s]] = [stage.nodes[s], stage.nodes[idx]]; return next; }
        for (const node of stage.nodes) if (node.children) { const ci = node.children.findIndex(c => c.id === nodeId); if (ci >= 0) { const s = dir === "up" ? ci - 1 : ci + 1; if (s >= 0 && s < node.children.length) [node.children[ci], node.children[s]] = [node.children[s], node.children[ci]]; return next; } }
      }
      return next;
    });
  };

  const handleDeleteNode = (nodeId: string) => {
    const k = `bada-deleted-ids-${journeyType}`; const raw = localStorage.getItem(k); const ids: string[] = raw ? JSON.parse(raw) : [];
    if (!ids.includes(nodeId)) { ids.push(nodeId); localStorage.setItem(k, JSON.stringify(ids)); }
    setStages(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as Stage[];
      for (const stage of next) {
        const idx = stage.nodes.findIndex(n => n.id === nodeId); if (idx >= 0) { stage.nodes.splice(idx, 1); return next; }
        for (const node of stage.nodes) if (node.children) { const ci = node.children.findIndex(c => c.id === nodeId); if (ci >= 0) { node.children.splice(ci, 1); if (!node.children.length) { node.hasChildren = false; node.children = undefined; node.groupLabel = undefined; } return next; } }
      }
      return next;
    });
  };

  const handleAddSibling = (nodeId: string) => {
    setStages(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as Stage[]; const newId = `new-${Date.now()}`;
      for (const stage of next) { const idx = stage.nodes.findIndex(n => n.id === nodeId); if (idx >= 0) { stage.nodes.splice(idx + 1, 0, { id: newId, label: "새 노드", type: "neutral" }); return next; }
        for (const node of stage.nodes) if (node.children) { const ci = node.children.findIndex(c => c.id === nodeId); if (ci >= 0) { node.children.splice(ci + 1, 0, { id: newId, label: "새 항목", type: "neutral" }); return next; } } }
      return next;
    });
  };

  const handleAddChild = (nodeId: string) => {
    setStages(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as Stage[]; const newId = `new-${Date.now()}`;
      for (const stage of next) { const node = stage.nodes.find(n => n.id === nodeId); if (node) { if (!node.children) { node.children = []; node.hasChildren = true; node.groupLabel = node.groupLabel || "하위 항목"; } node.children.push({ id: newId, label: "새 하위 항목", type: "neutral" }); return next; } }
      return next;
    });
  };

  const handleDndReorder = useCallback((dragNodeId: string, dropNodeId: string, dropPosition: "before" | "after", dragStageId: string, _dropStageId: string, dragParentId?: string, dropParentId?: string) => {
    setStages(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as Stage[]; let draggedNode: JourneyNode | null = null;
      // Remove dragged node
      for (const stage of next) {
        if (!dragParentId && stage.id === dragStageId) { const idx = stage.nodes.findIndex(n => n.id === dragNodeId); if (idx >= 0) { draggedNode = stage.nodes.splice(idx, 1)[0]; break; } }
        for (const node of stage.nodes) if (node.id === (dragParentId || "") && node.children) { const ci = node.children.findIndex(c => c.id === dragNodeId); if (ci >= 0) { draggedNode = node.children.splice(ci, 1)[0]; if (!node.children.length) { node.hasChildren = false; node.children = undefined; node.groupLabel = undefined; } break; } }
        if (draggedNode) break;
      }
      if (!draggedNode) { for (const s of next) { const idx = s.nodes.findIndex(n => n.id === dragNodeId); if (idx >= 0) { draggedNode = s.nodes.splice(idx, 1)[0]; break; } for (const node of s.nodes) if (node.children) { const ci = node.children.findIndex(c => c.id === dragNodeId); if (ci >= 0) { draggedNode = node.children.splice(ci, 1)[0]; if (!node.children.length) { node.hasChildren = false; node.children = undefined; node.groupLabel = undefined; } break; } } if (draggedNode) break; } }
      if (!draggedNode) return prev;
      // Insert at drop position
      for (const stage of next) {
        if (!dropParentId) { const dropIdx = stage.nodes.findIndex(n => n.id === dropNodeId); if (dropIdx >= 0) { stage.nodes.splice(dropPosition === "after" ? dropIdx + 1 : dropIdx, 0, draggedNode); return next; } }
        else { for (const node of stage.nodes) if (node.id === dropParentId && node.children) { const dropIdx = node.children.findIndex(c => c.id === dropNodeId); if (dropIdx >= 0) { node.children.splice(dropPosition === "after" ? dropIdx + 1 : dropIdx, 0, draggedNode); return next; } } }
      }
      return prev;
    });
    setEditPopover(null);
  }, []);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 1.5));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.3));
  const handleFit = () => setZoom(viewMode === "map" ? 0.75 : viewMode === "tasks" ? 0.85 : viewMode === "blueprint" ? 1.0 : 0.45);
  const totalNodes = stages.reduce((acc, s) => acc + s.nodes.reduce((a, n) => a + 1 + (n.children?.length || 0), 0), 0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; const c = containerRef.current; if (!c) return;
    setIsDragging(true); setStartPos({ x: e.clientX, y: e.clientY }); setScrollPos({ x: c.scrollLeft, y: c.scrollTop });
  }, []);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return; const c = containerRef.current; if (!c) return;
    c.scrollLeft = scrollPos.x - (e.clientX - startPos.x); c.scrollTop = scrollPos.y - (e.clientY - startPos.y);
  }, [isDragging, startPos, scrollPos]);
  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) { e.preventDefault(); setZoom(z => Math.min(Math.max(z - e.deltaY * 0.001, 0.3), 1.5)); }
  }, []);
  useEffect(() => { const c = containerRef.current; if (c) { c.addEventListener("wheel", handleWheel, { passive: false }); return () => c.removeEventListener("wheel", handleWheel); } }, [handleWheel]);

  const switchView = (mode: ViewMode) => {
    setViewMode(mode); setZoom(mode === "map" ? 0.85 : mode === "tasks" ? 0.85 : mode === "blueprint" ? 1.0 : 0.55);
    if (containerRef.current) { containerRef.current.scrollLeft = 0; containerRef.current.scrollTop = 0; }
  };

  type ArrowStatus = "traversed" | "entering" | "future" | null;
  function StageArrow({ status }: { status?: ArrowStatus }) {
    const isActive = status === "traversed" || status === "entering";
    return (
      <div className="flex flex-col items-center justify-start shrink-0" style={{ paddingTop: 60, width: 36, opacity: status === "future" ? 0.25 : 1, transition: "opacity 0.3s ease" }}>
        <svg width="36" height="24" viewBox="0 0 36 24" style={{ overflow: "visible" }}>
          <defs>
            <marker id={`ah-${status || "default"}`} markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill={isActive ? "#2563EB" : COLORS.arrowMain} /></marker>
            {isActive && <linearGradient id={`trailGrad-${status}`} x1="0" x2="1" y1="0" y2="0"><stop offset="0%" stopColor="#60A5FA" /><stop offset="100%" stopColor="#2563EB" /></linearGradient>}
          </defs>
          <line x1="0" y1="12" x2="28" y2="12" stroke={isActive ? `url(#trailGrad-${status})` : COLORS.arrowMain} strokeWidth={isActive ? 3.5 : 2.5} markerEnd={`url(#ah-${status || "default"})`} />
          {isActive && <line x1="0" y1="12" x2="28" y2="12" stroke="white" strokeWidth={2} strokeDasharray="6 22" opacity={0.5}><animate attributeName="stroke-dashoffset" from="28" to="0" dur="1s" repeatCount="indefinite" /></line>}
        </svg>
      </div>
    );
  }

  function LoopArrow() {
    return (
      <div className="absolute pointer-events-none" style={{ top: -48, left: 0, right: 0, height: 56 }}>
        <svg width="100%" height="56" viewBox="0 0 2200 56" preserveAspectRatio="none">
          <defs><marker id="loopArrowHead" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto"><polygon points="0 0, 10 4, 0 8" fill={COLORS.arrowLoop} /></marker></defs>
          <path d="M 2100 50 Q 2100 10, 1100 10 Q 300 10, 300 50" fill="none" stroke={COLORS.arrowLoop} strokeWidth="2.5" strokeDasharray="8 4" markerEnd="url(#loopArrowHead)" />
          <text x="1100" y="8" textAnchor="middle" fill={COLORS.arrowLoop} fontSize="11" fontWeight="700" letterSpacing="0.05em">{journeyMeta.loopLabel || "재유입 루프"}</text>
        </svg>
      </div>
    );
  }

  const popoverProps = editPopover ? (() => { const ctx = findNodeContext(editPopover.nodeId); if (!ctx) return null; const { nodeIdx, childIdx, isChild, siblings } = ctx; const idx = isChild ? childIdx : nodeIdx; return { canMoveUp: idx > 0, canMoveDown: idx < siblings.length - 1, canDelete: true, canAddSibling: true, canAddChild: !isChild, isChild }; })() : null;

  const viewTabBtn = (mode: ViewMode, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => switchView(mode)}
      className="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer transition-all duration-150"
      style={{
        border: "none",
        background: viewMode === mode ? "white" : "transparent",
        color: viewMode === mode ? journeyMeta.color : "#94A3B8",
        fontSize: 11, fontWeight: viewMode === mode ? 700 : 500,
        boxShadow: viewMode === mode ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
        borderRadius: viewMode === mode ? 6 : 0, margin: 2,
      }}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <DndProvider backend={HTML5Backend}>
    <div className="relative w-full h-screen overflow-hidden flex flex-col" style={{ backgroundColor: COLORS.bg, fontFamily: "'Noto Sans KR', 'Inter', -apple-system, sans-serif" }}>
      {/* Journey Type Selector */}
      <div className="flex items-center shrink-0 px-5 py-0 z-30" style={{ background: "linear-gradient(90deg, #0F172A, #1E293B)", borderBottom: "1px solid #334155" }}>
        <div className="flex items-center gap-1">
          {JOURNEY_TYPES.map(jt => {
            const isActive = jt.id === journeyType;
            return (
              <button key={jt.id} onClick={() => switchJourneyType(jt.id)} className="flex items-center gap-2 cursor-pointer transition-all duration-200" style={{ padding: "10px 18px", border: "none", borderBottom: isActive ? `3px solid ${jt.color}` : "3px solid transparent", background: isActive ? `${jt.color}15` : "transparent", color: isActive ? "white" : "#94A3B8", fontSize: 12, fontWeight: isActive ? 700 : 500 }}>
                <span style={{ fontSize: 15 }}>{jt.icon}</span><span>{jt.label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex-1" />
        <span style={{ fontSize: 9, color: "#64748B", fontWeight: 500 }}>{journeyMeta.description}</span>
      </div>

      {/* Top Bar */}
      <div className="flex items-center justify-between shrink-0 px-5 py-2.5 z-20" style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #E2E8F0", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center" style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg, ${journeyMeta.color}, ${journeyMeta.color}CC)`, color: "white", fontWeight: 800, fontSize: 13, boxShadow: `0 2px 8px ${journeyMeta.color}50` }}>B</div>
            <div>
              <h1 className="m-0" style={{ fontSize: 15, fontWeight: 800, color: "#1E293B", letterSpacing: "-0.02em", lineHeight: 1.2 }}>더바다 · {journeyMeta.label}</h1>
              <p className="m-0" style={{ fontSize: 10, color: "#94A3B8", fontWeight: 500 }}>The Bada · {stages.length}단계 · {totalNodes}개 노드</p>
            </div>
          </div>
          {/* View Mode Tabs */}
          <div className="flex items-center rounded-lg overflow-hidden ml-4" style={{ border: "1px solid #E2E8F0", background: "#F1F5F9" }}>
            {viewTabBtn("map", <LayoutGrid size={13} />, "운영맵")}
            {viewTabBtn("tree", <GitBranch size={13} />, "플로우차트")}
            {viewTabBtn("tasks", <ClipboardList size={13} />, "업무 현황")}
            {viewTabBtn("blueprint", <Rows3 size={13} />, "업무 상세")}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setEditMode(p => { if (p) setEditPopover(null); return !p; }); }} className="flex items-center gap-1.5 cursor-pointer rounded-lg transition-all duration-200" style={{ height: 32, padding: "0 12px", border: editMode ? "1.5px solid #F59E0B" : "1px solid #E2E8F0", background: editMode ? "linear-gradient(135deg, #F59E0B, #D97706)" : "#F1F5F9", color: editMode ? "white" : "#475569", fontSize: 11, fontWeight: editMode ? 700 : 500, boxShadow: editMode ? "0 2px 10px rgba(245,158,11,0.3)" : "none" }}><Pencil size={13} />{editMode ? "편집 중" : "편집"}</button>
          {editMode && <button onClick={resetData} className="flex items-center gap-1 cursor-pointer rounded-lg" style={{ height: 32, padding: "0 10px", border: "1px solid #FECACA", background: "#FEF2F2", color: "#DC2626", fontSize: 10, fontWeight: 600 }} title="원본 데이터로 초기화"><RotateCcw size={12} />초기화</button>}
          <div className="flex items-center gap-0.5 rounded-lg" style={{ border: "1px solid #E2E8F0", background: "#F1F5F9" }}>
            <button onClick={handleExportJSON} className="flex items-center gap-1 cursor-pointer rounded-l-lg hover:bg-white transition-colors" style={{ height: 32, padding: "0 10px", border: "none", background: "transparent", color: "#475569", fontSize: 10, fontWeight: 600 }} title="JSON 내보내기"><Download size={12} />내보내기</button>
            <div style={{ width: 1, height: 16, background: "#E2E8F0" }} />
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1 cursor-pointer rounded-r-lg hover:bg-white transition-colors" style={{ height: 32, padding: "0 10px", border: "none", background: "transparent", color: "#475569", fontSize: 10, fontWeight: 600 }} title="JSON 가져오기"><Upload size={12} />가져오기</button>
          </div>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          <div className="flex items-center gap-1 rounded-lg px-2 py-1" style={{ background: "#F1F5F9", border: "1px solid #E2E8F0" }}>
            <button onClick={handleZoomOut} className="flex items-center justify-center cursor-pointer rounded hover:bg-white transition-colors" style={{ width: 28, height: 28, border: "none", background: "none", color: "#475569" }}><ZoomOut size={15} /></button>
            <span className="select-none px-2" style={{ fontSize: 11, fontWeight: 600, color: "#475569", minWidth: 38, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
            <button onClick={handleZoomIn} className="flex items-center justify-center cursor-pointer rounded hover:bg-white transition-colors" style={{ width: 28, height: 28, border: "none", background: "none", color: "#475569" }}><ZoomIn size={15} /></button>
            <div style={{ width: 1, height: 16, background: "#E2E8F0", margin: "0 2px" }} />
            <button onClick={handleFit} className="flex items-center justify-center cursor-pointer rounded hover:bg-white transition-colors" style={{ width: 28, height: 28, border: "none", background: "none", color: "#475569" }} title="화면 맞춤"><Maximize2 size={14} /></button>
          </div>
          <button onClick={() => setShowInfo(!showInfo)} className="flex items-center justify-center cursor-pointer rounded-lg transition-colors" style={{ width: 32, height: 32, border: "1px solid #E2E8F0", background: showInfo ? journeyMeta.color : "#F1F5F9", color: showInfo ? "white" : "#475569" }}><Info size={15} /></button>
        </div>
      </div>

      {/* Edit Mode Banner */}
      {editMode && (
        <div className="flex items-center justify-center gap-3 py-2 z-20" style={{ background: "linear-gradient(90deg, #FEF3C7, #FDE68A)", borderBottom: "1px solid #FCD34D" }}>
          <Pencil size={12} color="#92400E" />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#92400E" }}>{(viewMode === "blueprint" || viewMode === "tasks") ? "편집 모드 · 셀을 클릭하여 내용 수정" : `편집 모드 · 노드 드래그로 순서 변경 · 클릭하여 라벨/색상 편집${viewMode === "tree" ? " · 노드 우측 ●에서 드래그하여 화살표 추가 · 화살표 클릭으로 삭제/수정" : ""}`}</span>
          <span style={{ fontSize: 9, color: "#B45309" }}>변경사항은 자동 저장됩니다</span>
        </div>
      )}

      {/* Canvas */}
      {viewMode === "tasks" ? (
        /* 업무 현황: TaskBoard가 직접 스크롤 컨테이너, zoom은 CSS transform으로 적용 */
        <div className="flex-1 relative" style={{ overflow: "auto" }}>
          <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left", minWidth: 3600, transition: "transform 0.15s ease-out" }}>
            <TaskBoard
              data={taskData}
              accentColor={journeyMeta.color}
              stageReflected={reflected}
              stageHelpers={helpers}
              editMode={editMode}
              onDataChange={setTaskData}
              onReflectedChange={setReflected}
              onHelpersChange={setHelpers}
            />
          </div>
        </div>
      ) : (
      <div ref={containerRef} className="flex-1 overflow-auto relative" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} style={{ cursor: viewMode === "blueprint" ? "default" : isDragging ? "grabbing" : "grab" }}>
        <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left", minWidth: viewMode === "map" ? 2900 : viewMode === "blueprint" ? "auto" : 4800, padding: viewMode === "map" ? "80px 40px 60px 40px" : "20px 40px 60px 40px", transition: "transform 0.15s ease-out", position: "relative" }}>

          {viewMode === "map" && (
            <>
              <LoopArrow />
              <div className="flex items-start gap-0 relative">
                {stages.map((stage, i) => {
                  let status: StageStatus = null; let arrowStatus: ArrowStatus = null;
                  if (progressMode && activeStageIdx !== null) { if (i < activeStageIdx) status = "past"; else if (i === activeStageIdx) status = "active"; else status = "future"; if (i < activeStageIdx - 1) arrowStatus = "traversed"; else if (i === activeStageIdx - 1) arrowStatus = "entering"; else if (i >= activeStageIdx) arrowStatus = "future"; }
                  return (<div key={stage.id} className="flex items-start"><StageCard stage={stage} index={i} status={status} onStageClick={progressMode ? idx => setActiveStageIdx(idx) : undefined} editMode={editMode} onNodeEdit={editMode ? handleNodeEdit : undefined} onDndReorder={editMode ? handleDndReorder : undefined} />{i < stages.length - 1 && <StageArrow status={arrowStatus} />}</div>);
                })}
              </div>
              {journeyMeta.crossLinkNote && <div className="mt-4 flex items-center gap-3 pl-4" style={{ fontSize: 10, color: "#94A3B8", fontWeight: 500 }}><span>*</span><span>{journeyMeta.crossLinkNote}</span></div>}
            </>
          )}

          {viewMode === "tree" && (
            <TreeFlowchart flowColumns={journeyMeta.flowColumns} flowEdges={flowEdges} stageColors={journeyMeta.stageColors} progressMode={progressMode} activeNodeId={activeFlowNodeId} onNodeClick={nodeId => setActiveFlowNodeId(nodeId)} activeStageIdx={activeStageIdx} onStageClick={idx => setActiveStageIdx(idx)} editMode={editMode} onFlowNodeEdit={editMode ? (nodeId, sx, sy) => { const ctx = findNodeContext(nodeId); if (ctx) setEditPopover({ nodeId, label: ctx.node.label, type: ctx.node.type as NodeType, exitSeverity: ctx.node.exitSeverity, goalSeverity: ctx.node.goalSeverity, position: { x: sx, y: sy }, stageIdx: ctx.stageIdx, parentNodeId: ctx.parentNodeId }); } : undefined} onEdgeAdd={handleEdgeAdd} onEdgeDelete={handleEdgeDelete} onEdgeUpdate={handleEdgeUpdate} onEdgeTypeChange={handleEdgeTypeChange} />
          )}

          {viewMode === "blueprint" && (
            <TaskBoardVertical
              data={taskData}
              accentColor={journeyMeta.color}
              stageReflected={reflected}
              stageHelpers={helpers}
              editMode={editMode}
              onDataChange={setTaskData}
              onReflectedChange={setReflected}
              onHelpersChange={setHelpers}
            />
          )}
        </div>
      </div>
      )}

      {/* Legend (floating) - only for map/tree */}
      {viewMode !== "tasks" && viewMode !== "blueprint" && <div className="absolute top-24 right-4 z-30"><LegendPanel /></div>}

      {/* Drag hint */}
      {!progressMode && !editMode && viewMode !== "tasks" && viewMode !== "blueprint" && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full px-4 py-2" style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <Move size={13} color="#94A3B8" /><span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500 }}>드래그로 이동 · Ctrl+스크롤로 확대/축소</span>
        </div>
      )}

      {/* Edit Popover */}
      {editMode && editPopover && popoverProps && (
        <EditNodePopover nodeId={editPopover.nodeId} label={editPopover.label} type={editPopover.type} exitSeverity={editPopover.exitSeverity} goalSeverity={editPopover.goalSeverity} position={editPopover.position} canMoveUp={popoverProps.canMoveUp} canMoveDown={popoverProps.canMoveDown} canDelete={popoverProps.canDelete} canAddSibling={popoverProps.canAddSibling} canAddChild={popoverProps.canAddChild} isChild={popoverProps.isChild} onChangeLabel={handleChangeLabel} onChangeType={handleChangeType} onChangeExitSeverity={handleChangeExitSeverity} onChangeGoalSeverity={handleChangeGoalSeverity} onMoveUp={id => handleMoveNode(id, "up")} onMoveDown={id => handleMoveNode(id, "down")} onDelete={handleDeleteNode} onAddSibling={handleAddSibling} onAddChild={handleAddChild} onClose={() => setEditPopover(null)} />
      )}

      {/* Info Panel */}
      {showInfo && (
        <div className="absolute top-24 left-4 z-30" style={{ background: "white", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", padding: "18px 22px", border: "1px solid #E8EEF5", maxWidth: 320 }}>
          <h3 className="m-0 mb-3" style={{ fontSize: 14, fontWeight: 700, color: "#1E293B" }}>{journeyMeta.icon} {journeyMeta.label} 여정 안내</h3>
          <div className="flex flex-col gap-2" style={{ fontSize: 11, color: "#64748B", lineHeight: 1.6 }}>
            <p className="m-0">{journeyMeta.description}</p>
            <div className="flex flex-col gap-1 mt-1">
              <div className="flex items-center gap-2"><span style={{ color: journeyMeta.color, fontWeight: 700 }}>●</span><span><strong>운영맵:</strong> 카드 형태 단계별 노드</span></div>
              <div className="flex items-center gap-2"><span style={{ color: "#2563EB", fontWeight: 700 }}>●</span><span><strong>플로우차트:</strong> 분기 흐름 트리</span></div>
              <div className="flex items-center gap-2"><span style={{ color: "#8b5cf6", fontWeight: 700 }}>●</span><span><strong>업무 현황:</strong> 팀별 업무·Notion 링크</span></div>
            </div>
            <div className="mt-2 pt-2" style={{ borderTop: "1px solid #E2E8F0" }}>
              <p className="m-0" style={{ fontSize: 10, fontWeight: 600, color: "#475569" }}>여정 유형 전환</p>
              {JOURNEY_TYPES.map(jt => (<div key={jt.id} className="flex items-center gap-2 mt-1"><span style={{ fontSize: 12 }}>{jt.icon}</span><span style={{ fontSize: 10, color: "#64748B" }}><strong>{jt.label}</strong> — {jt.description}</span></div>))}
            </div>
          </div>
        </div>
      )}
    </div>
    </DndProvider>
  );
}