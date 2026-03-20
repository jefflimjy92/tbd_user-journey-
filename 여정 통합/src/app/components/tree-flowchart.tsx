import { useMemo, useCallback, useState, useRef, useEffect } from "react";
import {
  type FlowColumn,
  type FlowNode,
  type FlowEdge,
} from "./flow-data";
import { COLORS } from "./journey-data";

/* ================================================================
   수평 플로우차트
   - 가로축 = 시간 순서
   - 세로축 = 동시간 (같은 컬럼 내)
   - 하위 노드 간 모든 화살표 연결
   - 세부사유 노드는 부모 아래 접기/펼치기 가능한 하위 그룹으로 표시
   ================================================================ */

/* ─── Constants ─── */
const COL_W = 155;
const COL_GAP = 40;
const NODE_H = 30;
const NODE_GAP = 10;
const CHILD_H = 26;
const CHILD_GAP = 5;
const GROUP_LABEL_H = 20;
const GROUP_PAD_TOP = 6;
const GROUP_PAD_BOTTOM = 8;
const COLLAPSED_BADGE_H = 20;
const TOP_PAD = 80;
const SIDE_PAD = 50;
const STAGE_GROUP_GAP = 36;

/* ─── Node style ─── */
function getNodeFill(type: string, muted = false) {
  if (muted) {
    switch (type) {
      case "exit":
        return { bg: COLORS.exitMuted.bg, text: COLORS.exitMuted.text, border: COLORS.exitMuted.border };
      case "goal":
        return { bg: COLORS.goalMuted.bg, text: COLORS.goalMuted.text, border: COLORS.goalMuted.border };
      default:
        return { bg: "#F7F9FB", text: "#94A3B8", border: "#E2E8F0" };
    }
  }
  switch (type) {
    case "main":
      return { bg: COLORS.mainSpine.bg, text: "#FFF" };
    case "exit":
      return { bg: COLORS.exit.bg, text: "#FFF" };
    case "goal":
      return { bg: COLORS.goal.bg, text: "#FFF" };
    default:
      return { bg: "#FFFFFF", text: "#334155" };
  }
}

/* ─── Precompute positions ─── */
interface NodePos {
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
  node: FlowNode;
  colIdx: number;
  isChild?: boolean;
  parentId?: string;
}

function computeColXOffsets(columns: FlowColumn[]): number[] {
  const offsets: number[] = [];
  let currentX = SIDE_PAD;
  let prevStage = "";

  columns.forEach((col, ci) => {
    const thisStage = col.stageLabel || "";
    if (ci > 0) {
      if (thisStage !== prevStage) currentX += STAGE_GROUP_GAP;
      currentX += COL_GAP;
    }
    offsets.push(currentX);
    currentX += COL_W;
    prevStage = thisStage;
  });

  return offsets;
}

function nodeGroupHeight(node: FlowNode, expanded: boolean): number {
  if (!node.children || node.children.length === 0) return NODE_H;
  if (!expanded) return NODE_H + COLLAPSED_BADGE_H + 4;
  const childrenTotalH =
    GROUP_PAD_TOP +
    GROUP_LABEL_H +
    node.children.length * (CHILD_H + CHILD_GAP) -
    CHILD_GAP +
    GROUP_PAD_BOTTOM;
  return NODE_H + childrenTotalH;
}

function computePositions(columns: FlowColumn[], colXOffsets: number[], expandedNodes: Set<string>): Map<string, NodePos> {
  const map = new Map<string, NodePos>();

  columns.forEach((col, ci) => {
    const x = colXOffsets[ci];
    let currentY = TOP_PAD + 10;

    col.nodes.forEach((node) => {
      const isExpanded = expandedNodes.has(node.id);
      const groupH = nodeGroupHeight(node, isExpanded);

      map.set(node.id, {
        x,
        y: currentY,
        w: COL_W,
        h: NODE_H,
        cx: x + COL_W / 2,
        cy: currentY + NODE_H / 2,
        node,
        colIdx: ci,
      });

      if (node.children && node.children.length > 0) {
        const childStartY = currentY + NODE_H + GROUP_PAD_TOP + GROUP_LABEL_H;
        const childX = x + 6;
        const childW = COL_W - 12;

        node.children.forEach((child, childIdx) => {
          const childY = childStartY + childIdx * (CHILD_H + CHILD_GAP);
          map.set(child.id, {
            x: childX,
            y: isExpanded ? childY : currentY,
            w: childW,
            h: CHILD_H,
            cx: childX + childW / 2,
            cy: isExpanded ? childY + CHILD_H / 2 : currentY + NODE_H / 2,
            node: child,
            colIdx: ci,
            isChild: true,
            parentId: node.id,
          });
        });
      }

      currentY += groupH + NODE_GAP;
    });
  });

  return map;
}

/* ─── Arrow path generator ─── */
function makeArrowPath(
  from: NodePos,
  to: NodePos,
  edge: FlowEdge
): { path: string; color: string; dash: boolean; sameCol: boolean } {
  const isLoop = edge.type === "loop";
  const isSkip = edge.type === "skip";

  let color = "#94A3B8";
  if (isLoop) color = COLORS.arrowLoop;
  else if (isSkip) color = "#6366F1";
  else if (from.node.type === "exit" || to.node.type === "exit") color = "#E8A0A0";
  else if (to.node.type === "goal") color = "#7BC8A0";

  // ── Same column: short vertical center arrow ──
  if (from.colIdx === to.colIdx && !isLoop) {
    const cx = from.cx;
    const y1 = from.y + from.h;    // bottom of source
    const y2 = to.y;               // top of target
    const midY = (y1 + y2) / 2;
    // Small bezier that stays centered
    const path = `M ${cx} ${y1 + 2} C ${cx} ${midY}, ${cx} ${midY}, ${cx} ${y2 - 2}`;
    return { path, color, dash: isSkip, sameCol: true };
  }

  const x1 = from.x + from.w;
  const y1 = from.cy;
  const x2 = to.x;
  const y2 = to.cy;

  // ── Forward (different column) ──
  if (to.colIdx > from.colIdx) {
    const dx = x2 - x1;
    const cp = dx * 0.4;
    const path = `M ${x1} ${y1} C ${x1 + cp} ${y1}, ${x2 - cp} ${y2}, ${x2} ${y2}`;
    return { path, color, dash: isSkip, sameCol: false };
  }

  // ── Backward (loop) ──
  const loopY = Math.min(from.y, to.y) - 30;
  const path = `M ${x1} ${y1} C ${x1 + 30} ${y1}, ${x1 + 30} ${loopY}, ${from.cx} ${loopY} L ${to.cx} ${loopY} C ${x2 - 30} ${loopY}, ${x2 - 30} ${y2}, ${x2} ${y2}`;
  return { path, color, dash: true, sameCol: false };
}

/* ─── BFS path finder ─── */
function buildAdjacency(edges: FlowEdge[]): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  for (const edge of edges) {
    if (edge.type === "loop") continue;
    if (!adj.has(edge.from)) adj.set(edge.from, []);
    adj.get(edge.from)!.push(edge.to);
  }
  return adj;
}

function findPath(adjacency: Map<string, string[]>, startId: string, targetId: string): string[] | null {
  if (startId === targetId) return [startId];
  const visited = new Set<string>();
  const parent = new Map<string, string>();
  const queue = [startId];
  visited.add(startId);

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const neighbors = adjacency.get(curr) || [];
    for (const next of neighbors) {
      if (visited.has(next)) continue;
      visited.add(next);
      parent.set(next, curr);
      if (next === targetId) {
        const path: string[] = [];
        let node: string | undefined = targetId;
        while (node !== undefined) {
          path.unshift(node);
          node = parent.get(node);
        }
        return path;
      }
      queue.push(next);
    }
  }
  return null;
}

function pathEdgeSet(path: string[]): Set<string> {
  const s = new Set<string>();
  for (let i = 0; i < path.length - 1; i++) {
    s.add(`${path[i]}→${path[i + 1]}`);
  }
  return s;
}

function getNodeLabel(columns: FlowColumn[], id: string): string {
  for (const col of columns) {
    for (const n of col.nodes) {
      if (n.id === id) return n.label;
      if (n.children) {
        for (const c of n.children) {
          if (c.id === id) return c.label;
        }
      }
    }
  }
  return id;
}

/* ─── Main Component ─── */
interface TreeFlowchartProps {
  flowColumns?: FlowColumn[];
  flowEdges?: FlowEdge[];
  stageColors?: Record<string, string>;
  progressMode?: boolean;
  activeNodeId?: string | null;
  onNodeClick?: (nodeId: string) => void;
  activeStageIdx?: number | null;
  onStageClick?: (stageIdx: number) => void;
  editMode?: boolean;
  onFlowNodeEdit?: (nodeId: string, screenX: number, screenY: number) => void;
  onEdgeAdd?: (from: string, to: string) => void;
  onEdgeDelete?: (from: string, to: string) => void;
  onEdgeUpdate?: (oldFrom: string, oldTo: string, newFrom: string, newTo: string) => void;
  onEdgeTypeChange?: (from: string, to: string, newType: FlowEdge["type"]) => void;
}

export function TreeFlowchart({
  flowColumns,
  flowEdges,
  stageColors: stageColorsProp,
  progressMode = false,
  activeNodeId = null,
  onNodeClick,
  activeStageIdx = null,
  onStageClick,
  editMode = false,
  onFlowNodeEdit,
  onEdgeAdd,
  onEdgeDelete,
  onEdgeUpdate,
  onEdgeTypeChange,
}: TreeFlowchartProps) {
  // Use defaults from flow-data if not provided
  const columns = flowColumns!;
  const edges = flowEdges!;
  const stageColorsMap = stageColorsProp || {};

  const colXOffsets = useMemo(() => computeColXOffsets(columns), [columns]);

  // Build stage order dynamically from columns
  const stageOrder = useMemo(() => {
    const order: Record<string, number> = {};
    let idx = 0;
    let prev = "";
    for (const col of columns) {
      const sl = col.stageLabel || "";
      if (sl !== prev) {
        order[sl] = idx++;
        prev = sl;
      }
    }
    return order;
  }, [columns]);

  // Track expanded child groups
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const col of columns) {
      for (const node of col.nodes) {
        if (node.hasChildren && node.children && node.children.length > 0) {
          initial.add(node.id);
        }
      }
    }
    return initial;
  });

  const toggleExpand = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

  const positions = useMemo(
    () => computePositions(columns, colXOffsets, expandedNodes),
    [columns, colXOffsets, expandedNodes]
  );

  // Canvas dimensions
  const lastColX = colXOffsets[colXOffsets.length - 1];
  const totalW = lastColX + COL_W + SIDE_PAD;

  const colHeights = useMemo(() => {
    const heights: number[] = [];
    columns.forEach((col) => {
      let h = TOP_PAD + 10;
      col.nodes.forEach((node) => {
        const isExpanded = expandedNodes.has(node.id);
        h += nodeGroupHeight(node, isExpanded) + NODE_GAP;
      });
      heights.push(h);
    });
    return heights;
  }, [columns, expandedNodes]);

  const totalH = Math.max(...colHeights) + 80;

  // Group columns by stage
  const stageGroups = useMemo(() => {
    const groups: { label: string; startIdx: number; endIdx: number; color: string }[] = [];
    let current = "";
    columns.forEach((col, i) => {
      const sl = col.stageLabel || "";
      if (sl !== current) {
        if (groups.length > 0) groups[groups.length - 1].endIdx = i - 1;
        groups.push({
          label: sl,
          startIdx: i,
          endIdx: i,
          color: stageColorsMap[sl] || "#94A3B8",
        });
        current = sl;
      } else {
        groups[groups.length - 1].endIdx = i;
      }
    });
    return groups;
  }, [columns, stageColorsMap]);

  // BFS adjacency
  const adjacency = useMemo(() => buildAdjacency(edges), [edges]);

  // Find the first node id for BFS start
  const firstNodeId = useMemo(() => {
    if (columns.length > 0 && columns[0].nodes.length > 0) return columns[0].nodes[0].id;
    return "";
  }, [columns]);

  // Progress mode path computation
  const activePath = useMemo(() => {
    if (!progressMode || !activeNodeId || !firstNodeId) return null;
    return findPath(adjacency, firstNodeId, activeNodeId);
  }, [progressMode, activeNodeId, adjacency, firstNodeId]);

  const pathNodeSet = useMemo(() => {
    if (!activePath) return new Set<string>();
    return new Set(activePath);
  }, [activePath]);

  const pathEdges = useMemo(() => {
    if (!activePath) return new Set<string>();
    return pathEdgeSet(activePath);
  }, [activePath]);

  const derivedStageIdx = useMemo(() => {
    if (!progressMode || !activeNodeId) return null;
    for (const col of columns) {
      for (const n of col.nodes) {
        if (n.id === activeNodeId) return stageOrder[col.stageLabel || ""] ?? null;
        if (n.children) {
          for (const c of n.children) {
            if (c.id === activeNodeId) return stageOrder[col.stageLabel || ""] ?? null;
          }
        }
      }
    }
    return null;
  }, [progressMode, activeNodeId, columns, stageOrder]);

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (progressMode && onNodeClick) onNodeClick(nodeId);
    },
    [progressMode, onNodeClick]
  );

  // Total node count for annotations
  const totalNodeCount = useMemo(() => {
    return columns.reduce((s, c) => {
      let count = c.nodes.length;
      c.nodes.forEach(n => { if (n.children) count += n.children.length; });
      return s + count;
    }, 0);
  }, [columns]);

  // ── Edge selection state (cumulative toggle) ──
  const [selectedEdges, setSelectedEdges] = useState<Set<string>>(new Set());

  const toggleEdgeSelection = useCallback((edgeKey: string) => {
    setSelectedEdges(prev => {
      const next = new Set(prev);
      if (next.has(edgeKey)) next.delete(edgeKey);
      else next.add(edgeKey);
      return next;
    });
  }, []);

  // Build incoming/outgoing edge lookup for neighbor expansion
  const edgesByNode = useMemo(() => {
    const incoming = new Map<string, string[]>(); // nodeId → ["X→nodeId", ...]
    const outgoing = new Map<string, string[]>(); // nodeId → ["nodeId→Y", ...]
    for (const edge of edges) {
      const key = `${edge.from}→${edge.to}`;
      if (!incoming.has(edge.to)) incoming.set(edge.to, []);
      incoming.get(edge.to)!.push(key);
      if (!outgoing.has(edge.from)) outgoing.set(edge.from, []);
      outgoing.get(edge.from)!.push(key);
    }
    return { incoming, outgoing };
  }, [edges]);

  // Expand selected edges to include 전(before) / 후(after) neighbor edges
  const expandedEdgeKeys = useMemo(() => {
    const expanded = new Set<string>();
    for (const key of selectedEdges) {
      expanded.add(key);
      const [from, to] = key.split("→");
      // 전 단계: edges coming into `from`
      const inEdges = edgesByNode.incoming.get(from);
      if (inEdges) inEdges.forEach(e => expanded.add(e));
      // 후 단계: edges going out of `to`
      const outEdges = edgesByNode.outgoing.get(to);
      if (outEdges) outEdges.forEach(e => expanded.add(e));
    }
    return expanded;
  }, [selectedEdges, edgesByNode]);

  // Derive highlighted node IDs from expanded edges
  const highlightedNodes = useMemo(() => {
    const nodes = new Set<string>();
    for (const key of expandedEdgeKeys) {
      const [from, to] = key.split("→");
      if (from) nodes.add(from);
      if (to) nodes.add(to);
    }
    return nodes;
  }, [expandedEdgeKeys]);

  const hasEdgeSelection = selectedEdges.size > 0;

  // ── Edge editing state (edit mode only) ──
  const svgRef = useRef<SVGSVGElement>(null);
  const [drawingEdge, setDrawingEdge] = useState<{ fromId: string; mouseX: number; mouseY: number } | null>(null);
  const [hoverNodeId, setHoverNodeId] = useState<string | null>(null);
  const [editingEdge, setEditingEdge] = useState<{ from: string; to: string; screenX: number; screenY: number } | null>(null);
  const [dragEndpoint, setDragEndpoint] = useState<{ edgeFrom: string; edgeTo: string; side: "from" | "to"; mouseX: number; mouseY: number } | null>(null);

  // Convert screen coords to SVG coords
  const screenToSvg = useCallback((screenX: number, screenY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: screenX, y: screenY };
    const pt = svg.createSVGPoint();
    pt.x = screenX;
    pt.y = screenY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: screenX, y: screenY };
    const svgPt = pt.matrixTransform(ctm.inverse());
    return { x: svgPt.x, y: svgPt.y };
  }, []);

  // Find which node a point lands on
  const findNodeAtPoint = useCallback((svgX: number, svgY: number): string | null => {
    for (const [id, pos] of positions.entries()) {
      if (svgX >= pos.x && svgX <= pos.x + pos.w && svgY >= pos.y && svgY <= pos.y + pos.h) {
        return id;
      }
    }
    return null;
  }, [positions]);

  // Edge drawing: mousedown on output port
  const handlePortMouseDown = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const svgPt = screenToSvg(e.clientX, e.clientY);
    setDrawingEdge({ fromId: nodeId, mouseX: svgPt.x, mouseY: svgPt.y });
    setEditingEdge(null);
  }, [screenToSvg]);

  // Endpoint drag: mousedown on endpoint handle
  const handleEndpointMouseDown = useCallback((edgeFrom: string, edgeTo: string, side: "from" | "to", e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const svgPt = screenToSvg(e.clientX, e.clientY);
    setDragEndpoint({ edgeFrom, edgeTo, side, mouseX: svgPt.x, mouseY: svgPt.y });
    setEditingEdge(null);
  }, [screenToSvg]);

  // Global mousemove/mouseup for drawing/dragging
  useEffect(() => {
    if (!editMode) return;
    if (!drawingEdge && !dragEndpoint) return;

    const handleMove = (e: MouseEvent) => {
      const svgPt = screenToSvg(e.clientX, e.clientY);
      if (drawingEdge) {
        setDrawingEdge(prev => prev ? { ...prev, mouseX: svgPt.x, mouseY: svgPt.y } : null);
      }
      if (dragEndpoint) {
        setDragEndpoint(prev => prev ? { ...prev, mouseX: svgPt.x, mouseY: svgPt.y } : null);
      }
      // Hover detection
      const hitNode = findNodeAtPoint(svgPt.x, svgPt.y);
      setHoverNodeId(hitNode);
    };

    const handleUp = (e: MouseEvent) => {
      const svgPt = screenToSvg(e.clientX, e.clientY);
      const targetNode = findNodeAtPoint(svgPt.x, svgPt.y);

      if (drawingEdge && targetNode && targetNode !== drawingEdge.fromId) {
        // Check for duplicate
        const exists = edges.some(ed => ed.from === drawingEdge.fromId && ed.to === targetNode);
        if (!exists && onEdgeAdd) {
          onEdgeAdd(drawingEdge.fromId, targetNode);
        }
      }

      if (dragEndpoint && targetNode) {
        const { edgeFrom, edgeTo, side } = dragEndpoint;
        const anchorNode = side === "from" ? edgeTo : edgeFrom;
        if (targetNode !== anchorNode && onEdgeUpdate) {
          const newFrom = side === "from" ? targetNode : edgeFrom;
          const newTo = side === "to" ? targetNode : edgeTo;
          // Check duplicate
          const exists = edges.some(ed => ed.from === newFrom && ed.to === newTo);
          if (!exists) {
            onEdgeUpdate(edgeFrom, edgeTo, newFrom, newTo);
          }
        }
      }

      setDrawingEdge(null);
      setDragEndpoint(null);
      setHoverNodeId(null);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [editMode, drawingEdge, dragEndpoint, screenToSvg, findNodeAtPoint, edges, onEdgeAdd, onEdgeUpdate]);

  // Click edge in edit mode → show edit popover
  const handleEdgeEditClick = useCallback((edge: FlowEdge, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEdge({ from: edge.from, to: edge.to, screenX: e.clientX, screenY: e.clientY });
  }, []);

  // Close edge edit popover when clicking outside
  useEffect(() => {
    if (!editingEdge) return;
    const close = () => setEditingEdge(null);
    const timer = setTimeout(() => window.addEventListener("mousedown", close), 50);
    return () => { clearTimeout(timer); window.removeEventListener("mousedown", close); };
  }, [editingEdge]);

  return (
    <div style={{ minWidth: totalW + 100, padding: "20px 40px 60px 40px" }}>
      {/* Path info bar */}
      {progressMode && activePath && activePath.length > 1 && (
        <div
          className="mb-3 flex items-center gap-1 flex-wrap px-4 py-2.5 rounded-xl"
          style={{
            background: "linear-gradient(90deg, rgba(37,99,235,0.06), rgba(96,165,250,0.06))",
            border: "1.5px solid rgba(37,99,235,0.15)",
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 700, color: "#2563EB", marginRight: 6 }}>
            경로 추적
          </span>
          {activePath.map((nodeId, pi) => (
            <span key={nodeId} className="flex items-center gap-1">
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full cursor-pointer hover:scale-105 transition-transform"
                onClick={() => handleNodeClick(nodeId)}
                style={{
                  fontSize: 9,
                  fontWeight: pi === activePath.length - 1 ? 700 : 500,
                  background: pi === activePath.length - 1 ? "#2563EB" : "#E0F2FE",
                  color: pi === activePath.length - 1 ? "white" : "#1B4F8A",
                  border: pi === activePath.length - 1 ? "none" : "1px solid #BAE0FC",
                }}
              >
                {getNodeLabel(columns, nodeId)}
              </span>
              {pi < activePath.length - 1 && (
                <svg width="12" height="8" viewBox="0 0 12 8" className="shrink-0">
                  <line x1="0" y1="4" x2="8" y2="4" stroke="#60A5FA" strokeWidth="1.5" />
                  <polygon points="7 1.5, 11 4, 7 6.5" fill="#60A5FA" />
                </svg>
              )}
            </span>
          ))}
          <span style={{ fontSize: 9, color: "#94A3B8", marginLeft: 8 }}>
            ({activePath.length}개 노드 · {activePath.length - 1}개 연결)
          </span>
        </div>
      )}

      {/* Chart */}
      <div
        className="relative rounded-2xl overflow-visible"
        style={{
          background: "#FFFFFF",
          border: "1px solid #E8EEF5",
          boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
        }}
      >
        {/* Floating reset button when edges are selected */}
        {hasEdgeSelection && (
          <button
            onClick={() => setSelectedEdges(new Set())}
            className="absolute cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              top: 12,
              right: 12,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 16px",
              background: "linear-gradient(135deg, #FEF3C7, #FDE68A)",
              borderRadius: 10,
              border: "1.5px solid #F59E0B",
              boxShadow: "0 2px 12px rgba(245,158,11,0.25), 0 0 0 3px rgba(245,158,11,0.08)",
              color: "#92400E",
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "'Noto Sans KR', 'Inter', -apple-system, sans-serif",
            }}
          >
            <span style={{ fontSize: 13, lineHeight: 1 }}>✕</span>
            선택 초기화 ({selectedEdges.size}개)
          </button>
        )}
        <svg
          width={totalW}
          height={totalH}
          viewBox={`0 0 ${totalW} ${totalH}`}
          style={{ display: "block" }}
          ref={svgRef}
        >
          <defs>
            <marker id="fArrow" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
              <polygon points="0 0, 6 2.5, 0 5" fill="#94A3B8" />
            </marker>
            <marker id="fArrowDown" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0, 5 2, 0 4" fill="#94A3B8" />
            </marker>
            <marker id="fArrowDownRed" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0, 5 2, 0 4" fill="#E8A0A0" />
            </marker>
            <marker id="fArrowDownGreen" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0, 5 2, 0 4" fill="#7BC8A0" />
            </marker>
            <marker id="fArrowDownPurple" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0, 5 2, 0 4" fill="#6366F1" />
            </marker>
            <marker id="fArrowRed" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
              <polygon points="0 0, 6 2.5, 0 5" fill="#E8A0A0" />
            </marker>
            <marker id="fArrowGreen" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
              <polygon points="0 0, 6 2.5, 0 5" fill="#7BC8A0" />
            </marker>
            <marker id="fArrowOrange" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
              <polygon points="0 0, 6 2.5, 0 5" fill={COLORS.arrowLoop} />
            </marker>
            <marker id="fArrowPurple" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
              <polygon points="0 0, 6 2.5, 0 5" fill="#6366F1" />
            </marker>
            <marker id="fArrowTrail" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#2563EB" />
            </marker>
            <filter id="nodeShadow" x="-4%" y="-10%" width="108%" height="130%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.08" />
            </filter>
            <filter id="nodeHighlightGlow" x="-20%" y="-30%" width="140%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#F59E0B" floodOpacity="0.5" />
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#F59E0B" floodOpacity="0.3" />
            </filter>
            <marker id="fArrowHighlight" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#F59E0B" />
            </marker>
            <linearGradient id="fcTrailGrad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#93C5FD" stopOpacity={0.3} />
              <stop offset="50%" stopColor="#2563EB" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.3} />
            </linearGradient>
          </defs>

          {/* ── Stage group backgrounds ── */}
          {stageGroups.map((sg) => {
            const x1 = colXOffsets[sg.startIdx] - 10;
            const x2 = colXOffsets[sg.endIdx] + COL_W + 10;
            const sgIdx = stageOrder[sg.label] ?? -1;
            const effectiveStageIdx = derivedStageIdx;
            const isActiveSg = progressMode && effectiveStageIdx !== null && sgIdx === effectiveStageIdx;
            const isPastSg = progressMode && effectiveStageIdx !== null && sgIdx < effectiveStageIdx;
            const isFutureSg = progressMode && effectiveStageIdx !== null && sgIdx > effectiveStageIdx;

            return (
              <g
                key={sg.label}
                style={{
                  opacity: isFutureSg ? 0.25 : isPastSg ? 0.6 : 1,
                  transition: "opacity 0.3s ease",
                }}
              >
                {isActiveSg && (
                  <rect
                    x={x1 - 4} y={4}
                    width={x2 - x1 + 8} height={totalH - 8}
                    rx={14} fill="none"
                    stroke={sg.color} strokeWidth={2.5} strokeOpacity={0.5}
                  />
                )}
                <rect
                  x={x1} y={8}
                  width={x2 - x1} height={totalH - 16}
                  rx={10}
                  fill={sg.color}
                  fillOpacity={isActiveSg ? 0.1 : isFutureSg ? 0.02 : 0.04}
                  stroke={sg.color}
                  strokeOpacity={isActiveSg ? 0.35 : 0.12}
                  strokeWidth={isActiveSg ? 2 : 1}
                />
                <text
                  x={(x1 + x2) / 2} y={24}
                  textAnchor="middle" fill={sg.color}
                  fontSize={10} fontWeight={700} letterSpacing="0.06em"
                >
                  {sg.label}
                </text>
                {isActiveSg && (
                  <>
                    <rect x={(x1 + x2) / 2 - 28} y={32} width={56} height={16} rx={8} fill={sg.color} />
                    <text x={(x1 + x2) / 2} y={42} textAnchor="middle" fill="white" fontSize={8} fontWeight={700}>
                      현재 단계
                    </text>
                  </>
                )}
                {isPastSg && (
                  <>
                    <circle cx={x2 - 4} cy={20} r={8} fill="#10B981" />
                    <text x={x2 - 4} y={24} textAnchor="middle" fill="white" fontSize={9} fontWeight={700}>✓</text>
                  </>
                )}
              </g>
            );
          })}

          {/* ── Column headers ── */}
          {columns.map((col, ci) => {
            const x = colXOffsets[ci];
            let colOpacity = 1;
            if (progressMode && activeNodeId && derivedStageIdx !== null) {
              const colStageIdx = stageOrder[col.stageLabel || ""] ?? -1;
              if (colStageIdx > derivedStageIdx) colOpacity = 0.25;
              else if (colStageIdx < derivedStageIdx) colOpacity = 0.6;
            }
            return (
              <text
                key={col.id}
                x={x + COL_W / 2} y={TOP_PAD - 6}
                textAnchor="middle" fill="#94A3B8"
                fontSize={8.5} fontWeight={600} letterSpacing="0.04em"
                opacity={colOpacity}
              >
                {col.label}
              </text>
            );
          })}

          {/* ── Edges (arrows) ── */}
          {edges.map((edge, i) => {
            const fromP = positions.get(edge.from);
            const toP = positions.get(edge.to);
            if (!fromP || !toP) return null;

            const { path, color, dash, sameCol } = makeArrowPath(fromP, toP, edge);
            const edgeKey = `${edge.from}→${edge.to}`;
            const isDirectlySelected = selectedEdges.has(edgeKey);
            const isNeighbor = !isDirectlySelected && expandedEdgeKeys.has(edgeKey);
            const isAnyHighlight = isDirectlySelected || isNeighbor;

            let edgeOpacity = 0.7;
            const isOnPath = pathEdges.has(edgeKey);

            if (progressMode && activeNodeId) {
              if (isOnPath) {
                edgeOpacity = 0;
              } else {
                edgeOpacity = 0.08;
              }
            }

            // Dim unselected edges when there's an active selection
            if (hasEdgeSelection && !isAnyHighlight) {
              edgeOpacity = Math.min(edgeOpacity, 0.12);
            }

            let markerId = "fArrow";
            if (color === "#E8A0A0") markerId = "fArrowRed";
            else if (color === "#7BC8A0") markerId = "fArrowGreen";
            else if (color === COLORS.arrowLoop) markerId = "fArrowOrange";
            else if (color === "#6366F1") markerId = "fArrowPurple";

            // Use smaller markers for same-column vertical arrows
            if (sameCol) {
              if (color === "#E8A0A0") markerId = "fArrowDownRed";
              else if (color === "#7BC8A0") markerId = "fArrowDownGreen";
              else if (color === "#6366F1") markerId = "fArrowDownPurple";
              else markerId = "fArrowDown";
            }

            // Same-col edges: thinner, more subtle
            const baseWidth = sameCol ? 0.8 : 1.2;
            const selectedWidth = sameCol ? 2 : 2.5;
            const neighborWidth = sameCol ? 1.4 : 1.8;
            const baseOpacity = sameCol ? Math.min(edgeOpacity, 0.45) : edgeOpacity;

            return (
              <g key={`${edge.from}-${edge.to}-${i}`}>
                {/* Invisible wide hitbox for easy clicking */}
                <path
                  d={path}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={sameCol ? 10 : 14}
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    toggleEdgeSelection(edgeKey);
                    if (editMode) handleEdgeEditClick(edge, e);
                  }}
                />
                {/* Directly selected edge: strong glow */}
                {isDirectlySelected && (
                  <path
                    d={path}
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth={sameCol ? 4 : 6}
                    strokeLinecap="round"
                    opacity={0.2}
                    style={{ pointerEvents: "none" }}
                  />
                )}
                {/* Neighbor (전/후 단계) edge: softer glow */}
                {isNeighbor && (
                  <path
                    d={path}
                    fill="none"
                    stroke="#FBBF24"
                    strokeWidth={sameCol ? 3 : 4}
                    strokeLinecap="round"
                    opacity={0.15}
                    style={{ pointerEvents: "none" }}
                  />
                )}
                {/* Visible arrow */}
                <path
                  d={path}
                  fill="none"
                  stroke={isDirectlySelected ? "#F59E0B" : isNeighbor ? "#FBBF24" : color}
                  strokeWidth={isDirectlySelected ? selectedWidth : isNeighbor ? neighborWidth : baseWidth}
                  strokeDasharray={isNeighbor ? "6 3" : dash ? "4 3" : "none"}
                  markerEnd={isAnyHighlight ? "url(#fArrowHighlight)" : `url(#${markerId})`}
                  opacity={isDirectlySelected ? 1 : isNeighbor ? 0.7 : baseOpacity}
                  style={{ transition: "opacity 0.3s ease, stroke 0.3s ease", pointerEvents: "none" }}
                />
              </g>
            );
          })}

          {/* ── Trail edges (progress mode) ── */}
          {progressMode && activePath && activePath.length > 1 &&
            (() => {
              const trailEdges: { from: NodePos; to: NodePos; edge: FlowEdge }[] = [];
              for (let pi = 0; pi < activePath.length - 1; pi++) {
                const fromP = positions.get(activePath[pi]);
                const toP = positions.get(activePath[pi + 1]);
                if (!fromP || !toP) continue;
                const matchEdge = edges.find(
                  (e) => e.from === activePath[pi] && e.to === activePath[pi + 1]
                );
                trailEdges.push({
                  from: fromP,
                  to: toP,
                  edge: matchEdge || { from: activePath[pi], to: activePath[pi + 1] },
                });
              }
              return trailEdges.map((te, i) => {
                const { path } = makeArrowPath(te.from, te.to, te.edge);
                return (
                  <g key={`trail-${i}`}>
                    <path d={path} fill="none" stroke="#2563EB" strokeWidth={8} strokeLinecap="round" opacity={0.1} />
                    <path d={path} fill="none" stroke="#2563EB" strokeWidth={2.5} strokeLinecap="round" markerEnd="url(#fArrowTrail)" opacity={0.8} />
                    <path d={path} fill="none" stroke="white" strokeWidth={1.5} strokeDasharray="5 10" strokeLinecap="round" opacity={0.6}>
                      <animate attributeName="stroke-dashoffset" from="30" to="0" dur="1.5s" repeatCount="indefinite" />
                    </path>
                  </g>
                );
              });
            })()}

          {/* ── Nodes ── */}
          {columns.map((col) =>
            col.nodes.map((node) => {
              const pos = positions.get(node.id);
              if (!pos) return null;
              const fill = getNodeFill(node.type);
              const isNeutral = node.type === "neutral";
              const isOnPath = pathNodeSet.has(node.id);
              const isTarget = node.id === activeNodeId;
              const hasKids = node.hasChildren && node.children && node.children.length > 0;
              const isExpanded = expandedNodes.has(node.id);

              let nodeOpacity = 1;
              if (progressMode && activeNodeId) {
                nodeOpacity = isOnPath ? 1 : 0.15;
              }
              // Dim non-highlighted nodes when edges are selected
              const isHighlighted = highlightedNodes.has(node.id);
              if (hasEdgeSelection && !isHighlighted) {
                nodeOpacity = Math.min(nodeOpacity, 0.18);
              }

              const groupH = nodeGroupHeight(node, isExpanded);

              return (
                <g
                  key={node.id}
                  style={{
                    opacity: nodeOpacity,
                    transition: "opacity 0.3s ease",
                  }}
                >
                  {/* Edge-selection highlight glow */}
                  {isHighlighted && hasEdgeSelection && (
                    <rect
                      x={pos.x - 5} y={pos.y - 5}
                      width={COL_W + 10} height={NODE_H + 10}
                      rx={node.type === "main" ? 18 : 8}
                      fill="none" stroke="#F59E0B" strokeWidth={2.5} opacity={0.7}
                      filter="url(#nodeHighlightGlow)"
                      style={{ pointerEvents: "none" }}
                    />
                  )}

                  {hasKids && (
                    <rect
                      x={pos.x - 3}
                      y={pos.y - 3}
                      width={COL_W + 6}
                      height={groupH + 6}
                      rx={8}
                      fill={node.type === "exit" ? "rgba(192,57,43,0.03)" : "rgba(26,122,74,0.03)"}
                      stroke={node.type === "exit" ? "#E8A0A0" : "#A8D5BA"}
                      strokeWidth={1}
                      strokeDasharray="3 2"
                    />
                  )}

                  {isTarget && (
                    <>
                      <rect
                        x={pos.x - 4} y={pos.y - 4}
                        width={COL_W + 8} height={NODE_H + 8}
                        rx={node.type === "main" ? 17 : 8}
                        fill="none" stroke="#2563EB" strokeWidth={2.5} opacity={0.6}
                      />
                      <rect
                        x={pos.x - 6} y={pos.y - 6}
                        width={COL_W + 12} height={NODE_H + 12}
                        rx={node.type === "main" ? 19 : 10}
                        fill="none" stroke="#2563EB" strokeWidth={1.5} opacity={0.3}
                      >
                        <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
                      </rect>
                    </>
                  )}

                  {isOnPath && !isTarget && (
                    <rect
                      x={pos.x - 2} y={pos.y - 2}
                      width={COL_W + 4} height={NODE_H + 4}
                      rx={node.type === "main" ? 15 : 6}
                      fill="none" stroke="#60A5FA" strokeWidth={1.5} opacity={0.5}
                    />
                  )}

                  <rect
                    x={pos.x} y={pos.y}
                    width={COL_W} height={NODE_H}
                    rx={node.type === "main" ? 13 : 4}
                    fill={fill.bg}
                    stroke={isNeutral ? "#D1D5DB" : "none"}
                    strokeWidth={isNeutral ? 1.2 : 0}
                    filter="url(#nodeShadow)"
                    style={{ cursor: hasKids ? "pointer" : progressMode ? "pointer" : editMode ? "pointer" : "default" }}
                    onClick={(e) => {
                      if (editMode && onFlowNodeEdit) {
                        const svgEl = e.currentTarget;
                        const rect = svgEl.getBoundingClientRect();
                        onFlowNodeEdit(node.id, rect.left + rect.width / 2, rect.bottom);
                        return;
                      }
                      if (hasKids) toggleExpand(node.id);
                      else handleNodeClick(node.id);
                    }}
                  />

                  {editMode && (
                    <rect
                      x={pos.x - 2} y={pos.y - 2}
                      width={COL_W + 4} height={NODE_H + 4}
                      rx={node.type === "main" ? 15 : 6}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth={1.5}
                      strokeDasharray="4 3"
                      opacity={0.6}
                      style={{ pointerEvents: "none" }}
                    />
                  )}

                  {hasKids && (
                    <g
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleExpand(node.id)}
                    >
                      <text
                        x={pos.x + 10}
                        y={pos.y + NODE_H / 2 + 1}
                        dominantBaseline="central"
                        fill={fill.text}
                        fontSize={10}
                        fontWeight={700}
                      >
                        {isExpanded ? "▾" : "▸"}
                      </text>
                    </g>
                  )}

                  <foreignObject
                    x={pos.x + (hasKids ? 18 : 4)}
                    y={pos.y}
                    width={COL_W - (hasKids ? 22 : 8)}
                    height={NODE_H}
                    style={{ pointerEvents: "none", overflow: "hidden" }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: fill.text,
                        fontSize: 9,
                        fontWeight: node.type === "main" ? 700 : 500,
                        letterSpacing: "0.01em",
                        textAlign: "center",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        lineHeight: 1,
                        padding: "0 2px",
                        fontFamily: "'Noto Sans KR', 'Inter', -apple-system, sans-serif",
                      }}
                      title={node.label + (hasKids && !isExpanded ? ` (${node.children!.length})` : "")}
                    >
                      {node.label}
                      {hasKids && !isExpanded ? ` (${node.children!.length})` : ""}
                    </div>
                  </foreignObject>

                  {isTarget && (
                    <>
                      <rect
                        x={pos.x + COL_W / 2 - 18} y={pos.y - 16}
                        width={36} height={14} rx={7} fill="#2563EB"
                      />
                      <text
                        x={pos.x + COL_W / 2} y={pos.y - 8}
                        textAnchor="middle" fill="white" fontSize={7.5} fontWeight={700}
                      >
                        현재
                      </text>
                    </>
                  )}

                  {/* ── Children group ── */}
                  {hasKids && isExpanded && node.children!.map((child, ci) => {
                    const childPos = positions.get(child.id);
                    if (!childPos) return null;
                    const childFill = getNodeFill(child.type, true);
                    const childIsNeutral = child.type === "neutral";
                    const childIsOnPath = pathNodeSet.has(child.id);
                    const childIsTarget = child.id === activeNodeId;

                    return (
                      <g key={child.id}>
                        {ci === 0 && node.groupLabel && (
                          <foreignObject
                            x={pos.x + 4}
                            y={pos.y + NODE_H + GROUP_PAD_TOP}
                            width={COL_W - 8}
                            height={GROUP_LABEL_H}
                            style={{ pointerEvents: "none", overflow: "hidden" }}
                          >
                            <div
                              style={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                color: "#8B9BB5",
                                fontSize: 8.5,
                                fontWeight: 600,
                                letterSpacing: "0.04em",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                fontFamily: "'Noto Sans KR', 'Inter', -apple-system, sans-serif",
                              }}
                              title={node.groupLabel}
                            >
                              ↳ {node.groupLabel}
                            </div>
                          </foreignObject>
                        )}

                        {childIsTarget && (
                          <rect
                            x={childPos.x - 3} y={childPos.y - 3}
                            width={childPos.w + 6} height={CHILD_H + 6}
                            rx={6} fill="none" stroke="#2563EB" strokeWidth={2} opacity={0.6}
                          />
                        )}

                        {childIsOnPath && !childIsTarget && (
                          <rect
                            x={childPos.x - 2} y={childPos.y - 2}
                            width={childPos.w + 4} height={CHILD_H + 4}
                            rx={5} fill="none" stroke="#60A5FA" strokeWidth={1.2} opacity={0.5}
                          />
                        )}

                        <rect
                          x={childPos.x}
                          y={childPos.y}
                          width={childPos.w}
                          height={CHILD_H}
                          rx={4}
                          fill={childFill.bg}
                          stroke={childIsNeutral ? "#D1D5DB" : child.type === "exit" ? (childFill as any).border || COLORS.exitMuted.border : child.type === "goal" ? (childFill as any).border || COLORS.goalMuted.border : "#D1D5DB"}
                          strokeWidth={1}
                          style={{ cursor: progressMode ? "pointer" : "default" }}
                          onClick={() => handleNodeClick(child.id)}
                        />

                        <text
                          x={childPos.x + 8}
                          y={childPos.y + CHILD_H / 2 + 0.5}
                          dominantBaseline="central"
                          fill={childFill.text}
                          fontSize={8}
                          fontWeight={500}
                          style={{ pointerEvents: "none" }}
                        >
                          {child.type === "exit" ? "×" : child.type === "goal" ? "✓" : "·"}
                        </text>

                        <foreignObject
                          x={childPos.x + 16}
                          y={childPos.y}
                          width={childPos.w - 20}
                          height={CHILD_H}
                          style={{ pointerEvents: "none", overflow: "hidden" }}
                        >
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              color: childFill.text,
                              fontSize: 8,
                              fontWeight: 500,
                              letterSpacing: "0.01em",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              lineHeight: 1,
                              fontFamily: "'Noto Sans KR', 'Inter', -apple-system, sans-serif",
                            }}
                            title={child.label}
                          >
                            {child.label}
                          </div>
                        </foreignObject>
                      </g>
                    );
                  })}

                  {/* Collapsed badge */}
                  {hasKids && !isExpanded && (
                    <g
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleExpand(node.id)}
                    >
                      <rect
                        x={pos.x + 4}
                        y={pos.y + NODE_H + 4}
                        width={COL_W - 8}
                        height={COLLAPSED_BADGE_H}
                        rx={4}
                        fill={node.type === "exit" ? "rgba(192,57,43,0.08)" : "rgba(26,122,74,0.08)"}
                        stroke={node.type === "exit" ? "#E8A0A0" : "#A8D5BA"}
                        strokeWidth={0.8}
                        strokeDasharray="2 2"
                      />
                      <foreignObject
                        x={pos.x + 6}
                        y={pos.y + NODE_H + 4}
                        width={COL_W - 12}
                        height={COLLAPSED_BADGE_H}
                        style={{ pointerEvents: "none", overflow: "hidden" }}
                      >
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: node.type === "exit" ? "#C0392B" : "#1A7A4A",
                            fontSize: 8,
                            fontWeight: 600,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontFamily: "'Noto Sans KR', 'Inter', -apple-system, sans-serif",
                          }}
                          title={`${node.groupLabel} (${node.children!.length}개)`}
                        >
                          ▸ {node.groupLabel} ({node.children!.length}개)
                        </div>
                      </foreignObject>
                    </g>
                  )}

                  {/* ── Edit mode: connection ports ── */}
                  {editMode && (
                    <>
                      <circle
                        cx={pos.x + COL_W + 5} cy={pos.cy} r={5}
                        fill={drawingEdge?.fromId === node.id ? "#F59E0B" : "#10B981"}
                        stroke="white" strokeWidth={1.5}
                        style={{ cursor: "crosshair", filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.15))" }}
                        onMouseDown={(e) => handlePortMouseDown(node.id, e)}
                      />
                      <text x={pos.x + COL_W + 5} y={pos.cy + 0.5} textAnchor="middle" dominantBaseline="central" fill="white" fontSize={7} fontWeight={700} style={{ pointerEvents: "none" }}>+</text>
                      {(drawingEdge || dragEndpoint) && (
                        <circle cx={pos.x - 5} cy={pos.cy} r={hoverNodeId === node.id ? 6 : 4}
                          fill={hoverNodeId === node.id ? "#2563EB" : "#94A3B8"}
                          stroke="white" strokeWidth={1.5}
                          opacity={hoverNodeId === node.id ? 1 : 0.5}
                          style={{ pointerEvents: "none", transition: "all 0.15s ease" }}
                        />
                      )}
                      {(drawingEdge || dragEndpoint) && hoverNodeId === node.id && (
                        <rect x={pos.x - 3} y={pos.y - 3} width={COL_W + 6} height={NODE_H + 6} rx={6}
                          fill="none" stroke="#2563EB" strokeWidth={2} strokeDasharray="4 2" opacity={0.8}
                          style={{ pointerEvents: "none" }}
                        />
                      )}
                    </>
                  )}
                </g>
              );
            })
          )}

          {/* ── Edit mode: Drawing line (temp edge) ── */}
          {editMode && drawingEdge && (() => {
            const fromP = positions.get(drawingEdge.fromId);
            if (!fromP) return null;
            const x1 = fromP.x + fromP.w + 5;
            const y1 = fromP.cy;
            const x2 = drawingEdge.mouseX;
            const y2 = drawingEdge.mouseY;
            const cp = Math.abs(x2 - x1) * 0.4;
            return (
              <g style={{ pointerEvents: "none" }}>
                <path d={`M ${x1} ${y1} C ${x1 + cp} ${y1}, ${x2 - cp} ${y2}, ${x2} ${y2}`} fill="none" stroke="#10B981" strokeWidth={2} strokeDasharray="6 4" opacity={0.8} />
                <circle cx={x2} cy={y2} r={4} fill="#10B981" opacity={0.8} />
              </g>
            );
          })()}

          {/* ── Edit mode: Endpoint drag line ── */}
          {editMode && dragEndpoint && (() => {
            const { edgeFrom, edgeTo, side, mouseX, mouseY } = dragEndpoint;
            const anchorId = side === "from" ? edgeTo : edgeFrom;
            const anchorP = positions.get(anchorId);
            if (!anchorP) return null;
            const ax = side === "to" ? anchorP.x + anchorP.w : anchorP.x;
            const ay = anchorP.cy;
            const cp = Math.abs(mouseX - ax) * 0.4;
            return (
              <g style={{ pointerEvents: "none" }}>
                <path d={side === "to"
                  ? `M ${ax} ${ay} C ${ax + cp} ${ay}, ${mouseX - cp} ${mouseY}, ${mouseX} ${mouseY}`
                  : `M ${mouseX} ${mouseY} C ${mouseX + cp} ${mouseY}, ${ax - cp} ${ay}, ${ax} ${ay}`}
                  fill="none" stroke="#F59E0B" strokeWidth={2} strokeDasharray="6 4" opacity={0.8} />
                <circle cx={mouseX} cy={mouseY} r={4} fill="#F59E0B" opacity={0.8} />
              </g>
            );
          })()}

          {/* ── Edit mode: Endpoint drag handles on selected edges ── */}
          {editMode && !drawingEdge && !dragEndpoint && edges.map((edge, i) => {
            const edgeKey = `${edge.from}→${edge.to}`;
            if (!selectedEdges.has(edgeKey)) return null;
            const fromP = positions.get(edge.from);
            const toP = positions.get(edge.to);
            if (!fromP || !toP) return null;
            return (
              <g key={`ep-${i}`}>
                <circle cx={fromP.x + fromP.w} cy={fromP.cy} r={5} fill="#F59E0B" stroke="white" strokeWidth={1.5}
                  style={{ cursor: "grab", filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.2))" }}
                  onMouseDown={(e) => handleEndpointMouseDown(edge.from, edge.to, "from", e)} />
                <circle cx={toP.x} cy={toP.cy} r={5} fill="#F59E0B" stroke="white" strokeWidth={1.5}
                  style={{ cursor: "grab", filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.2))" }}
                  onMouseDown={(e) => handleEndpointMouseDown(edge.from, edge.to, "to", e)} />
              </g>
            );
          })}
        </svg>

        {/* ── Edit mode: Edge edit popover ── */}
        {editMode && editingEdge && (() => {
          const svgEl = svgRef.current;
          if (!svgEl) return null;
          const svgRect = svgEl.getBoundingClientRect();
          const edgeObj = edges.find(e => e.from === editingEdge.from && e.to === editingEdge.to);
          const edgeType = edgeObj?.type || "normal";
          const popX = editingEdge.screenX - svgRect.left;
          const popY = editingEdge.screenY - svgRect.top;
          return (
            <div onMouseDown={(e) => e.stopPropagation()} className="absolute z-20"
              style={{ left: popX, top: popY + 8, background: "white", borderRadius: 10,
                boxShadow: "0 4px 24px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
                padding: "10px 12px", minWidth: 200,
                fontFamily: "'Noto Sans KR', 'Inter', -apple-system, sans-serif" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#1E293B", marginBottom: 8 }}>화살표 편집</div>
              <div style={{ fontSize: 9, color: "#64748B", marginBottom: 6 }}>
                {getNodeLabel(columns, editingEdge.from)} → {getNodeLabel(columns, editingEdge.to)}
              </div>
              <div className="flex gap-1 mb-2">
                {(["normal", "loop", "skip"] as const).map(t => (
                  <button key={t}
                    onClick={() => { if (onEdgeTypeChange) onEdgeTypeChange(editingEdge.from, editingEdge.to, t); }}
                    className="cursor-pointer" style={{
                      padding: "3px 8px", borderRadius: 5,
                      border: edgeType === t ? "1.5px solid #2563EB" : "1px solid #E2E8F0",
                      background: edgeType === t ? "#EFF6FF" : "white",
                      color: edgeType === t ? "#2563EB" : "#64748B",
                      fontSize: 9, fontWeight: edgeType === t ? 700 : 500 }}>
                    {t === "normal" ? "일반" : t === "loop" ? "루프" : "건너뛰기"}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 8, color: "#94A3B8", marginBottom: 6, lineHeight: 1.4 }}>
                엣지 선택 후 양쪽 끝점(●)을 드래그하여 시작/종료 노드 변경
              </div>
              <button onClick={() => {
                  if (onEdgeDelete) onEdgeDelete(editingEdge.from, editingEdge.to);
                  setEditingEdge(null);
                  setSelectedEdges(prev => { const n = new Set(prev); n.delete(`${editingEdge.from}→${editingEdge.to}`); return n; });
                }}
                className="cursor-pointer w-full" style={{
                  padding: "5px 10px", borderRadius: 6, border: "1px solid #FECACA",
                  background: "#FEF2F2", color: "#DC2626", fontSize: 10, fontWeight: 600,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                화살표 삭제
              </button>
            </div>
          );
        })()}
      </div>

      {/* Annotations */}
      <div className="mt-4 flex items-center gap-5 flex-wrap">
        {hasEdgeSelection && (
          <button
            onClick={() => setSelectedEdges(new Set())}
            className="inline-flex items-center gap-2 cursor-pointer transition-all duration-150 hover:scale-[1.02]"
            style={{
              padding: "6px 14px",
              background: "rgba(245,158,11,0.08)",
              borderRadius: 8,
              border: "1.5px solid #F59E0B",
              color: "#D97706",
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            {selectedEdges.size}개 연결 선택 중 (전후 포함 {expandedEdgeKeys.size}개) — 전체 해제
          </button>
        )}
        <div
          className="inline-flex items-center gap-2"
          style={{
            padding: "6px 14px",
            background: "rgba(230,126,34,0.06)",
            borderRadius: 8,
            border: `1.5px dashed ${COLORS.arrowLoop}`,
          }}
        >
          <span style={{ fontSize: 14 }}>↺</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.arrowLoop }}>루프 연결</span>
        </div>
        <div
          className="inline-flex items-center gap-2"
          style={{
            padding: "6px 14px",
            background: "rgba(0,0,0,0.02)",
            borderRadius: 8,
            border: "1px solid #E2E8F0",
          }}
        >
          <span style={{ fontSize: 9, color: "#94A3B8" }}>
            총 {edges.length}개 연결 · {totalNodeCount}개 노드
          </span>
        </div>
      </div>
    </div>
  );
}