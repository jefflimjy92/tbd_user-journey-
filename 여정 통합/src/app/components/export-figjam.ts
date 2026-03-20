/* ================================================================
   FigJam / Figma 플러그인용 JSON 내보내기
   ─ 노드(스티키 노트), 엣지(커넥터), 섹션(스테이지 그룹) 포함
   ─ Figma Plugin API의 createSticky, createConnector,
     createSection 등에 바로 매핑 가능한 구조
   ================================================================ */

import {
  FLOW_COLUMNS,
  FLOW_EDGES,
  STAGE_COLORS,
  type FlowNode,
} from "./flow-data";
import { COLORS } from "./journey-data";

/* ─── Layout constants (FigJam 좌표계) ─── */
const STICKY_W = 220;
const STICKY_H = 50;
const COL_GAP = 80;
const ROW_GAP = 20;
const STAGE_GAP = 60;
const SECTION_PAD = 30;
const START_X = 100;
const START_Y = 200;

/* ─── Color mapping (FigJam sticky note colors) ─── */
type FigJamColor =
  | "LIGHT_BLUE"
  | "LIGHT_RED"
  | "LIGHT_GREEN"
  | "LIGHT_GRAY"
  | "LIGHT_YELLOW"
  | "LIGHT_ORANGE"
  | "LIGHT_PURPLE";

function nodeTypeToFigJamColor(type: FlowNode["type"]): {
  figJamColor: FigJamColor;
  hex: string;
} {
  switch (type) {
    case "main":
      return { figJamColor: "LIGHT_BLUE", hex: COLORS.mainSpine.bg };
    case "exit":
      return { figJamColor: "LIGHT_RED", hex: COLORS.exit.bg };
    case "goal":
      return { figJamColor: "LIGHT_GREEN", hex: COLORS.goal.bg };
    default:
      return { figJamColor: "LIGHT_GRAY", hex: "#F0F4F8" };
  }
}

function edgeTypeToStyle(type?: string) {
  switch (type) {
    case "loop":
      return {
        strokeColor: COLORS.arrowLoop,
        strokeDash: "DASH",
        label: "루프",
      };
    case "skip":
      return {
        strokeColor: "#6366F1",
        strokeDash: "DASH",
        label: "직행",
      };
    default:
      return {
        strokeColor: "#94A3B8",
        strokeDash: "SOLID",
        label: "",
      };
  }
}

/* ─── Exported types ─── */
export interface FigJamNode {
  id: string;
  label: string;
  type: "main" | "exit" | "goal" | "neutral";
  /** FigJam sticky note color preset */
  figJamColor: FigJamColor;
  /** Hex color for custom rendering */
  fillHex: string;
  textColor: string;
  /** Absolute position in FigJam canvas */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Metadata */
  column: string;
  stageLabel: string;
}

export interface FigJamEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  type: "normal" | "loop" | "skip";
  strokeColor: string;
  strokeDash: "SOLID" | "DASH";
  label: string;
}

export interface FigJamSection {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FigJamExport {
  meta: {
    name: string;
    description: string;
    version: string;
    exportedAt: string;
    totalNodes: number;
    totalEdges: number;
    totalSections: number;
  };
  nodes: FigJamNode[];
  edges: FigJamEdge[];
  sections: FigJamSection[];
}

/* ─── Build export data ─── */
export function buildFigJamExport(): FigJamExport {
  const nodes: FigJamNode[] = [];
  const edges: FigJamEdge[] = [];
  const sections: FigJamSection[] = [];

  // ── 1. Compute node positions ──
  let currentX = START_X;
  let prevStage = "";

  // Track stage boundaries for sections
  const stageBounds: Record<
    string,
    { minX: number; maxX: number; minY: number; maxY: number; color: string }
  > = {};

  FLOW_COLUMNS.forEach((col) => {
    const thisStage = col.stageLabel || "";

    // Add extra gap between stage groups
    if (prevStage && thisStage !== prevStage) {
      currentX += STAGE_GAP;
    }

    const colX = currentX;

    col.nodes.forEach((node, ni) => {
      const y = START_Y + ni * (STICKY_H + ROW_GAP);
      const colorInfo = nodeTypeToFigJamColor(node.type);

      nodes.push({
        id: node.id,
        label: node.label,
        type: node.type,
        figJamColor: colorInfo.figJamColor,
        fillHex: colorInfo.hex,
        textColor: node.type === "neutral" ? "#334155" : "#FFFFFF",
        x: colX,
        y,
        width: STICKY_W,
        height: STICKY_H,
        column: col.label,
        stageLabel: thisStage,
      });

      // Also export children nodes
      if (node.children && node.children.length > 0) {
        node.children.forEach((child, ci) => {
          const childY = y + STICKY_H + 10 + ci * (STICKY_H * 0.7 + 10);
          const childColorInfo = nodeTypeToFigJamColor(child.type);
          nodes.push({
            id: child.id,
            label: `  ${child.label}`,
            type: child.type,
            figJamColor: childColorInfo.figJamColor,
            fillHex: childColorInfo.hex,
            textColor: child.type === "neutral" ? "#334155" : "#FFFFFF",
            x: colX + 20,
            y: childY,
            width: STICKY_W - 20,
            height: STICKY_H * 0.7,
            column: col.label,
            stageLabel: thisStage,
          });

          if (thisStage && stageBounds[thisStage]) {
            const b = stageBounds[thisStage];
            b.maxY = Math.max(b.maxY, childY + STICKY_H * 0.7);
          }
        });
      }

      // Update stage bounds
      if (thisStage) {
        if (!stageBounds[thisStage]) {
          stageBounds[thisStage] = {
            minX: colX,
            maxX: colX + STICKY_W,
            minY: y,
            maxY: y + STICKY_H,
            color: STAGE_COLORS[thisStage] || "#94A3B8",
          };
        } else {
          const b = stageBounds[thisStage];
          b.minX = Math.min(b.minX, colX);
          b.maxX = Math.max(b.maxX, colX + STICKY_W);
          b.minY = Math.min(b.minY, y);
          b.maxY = Math.max(b.maxY, y + STICKY_H);
        }
      }
    });

    currentX = colX + STICKY_W + COL_GAP;
    prevStage = thisStage;
  });

  // ── 2. Build sections from stage bounds ──
  Object.entries(stageBounds).forEach(([label, b]) => {
    sections.push({
      id: `section-${label.replace(/\s/g, "-")}`,
      label,
      color: b.color,
      x: b.minX - SECTION_PAD,
      y: b.minY - SECTION_PAD - 40, // extra space for label
      width: b.maxX - b.minX + SECTION_PAD * 2,
      height: b.maxY - b.minY + SECTION_PAD * 2 + 40,
    });
  });

  // ── 3. Build edges ──
  FLOW_EDGES.forEach((edge, i) => {
    const style = edgeTypeToStyle(edge.type);
    edges.push({
      id: `edge-${i}-${edge.from}-${edge.to}`,
      fromNodeId: edge.from,
      toNodeId: edge.to,
      type: (edge.type || "normal") as "normal" | "loop" | "skip",
      strokeColor: style.strokeColor,
      strokeDash: style.strokeDash as "SOLID" | "DASH",
      label: style.label,
    });
  });

  return {
    meta: {
      name: "더바다 고객여정 플로우차트",
      description:
        "온라인 마케팅 고객여정 8단계 전체 플로우 - FigJam 플러그인용 JSON",
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      totalNodes: nodes.length,
      totalEdges: edges.length,
      totalSections: sections.length,
    },
    nodes,
    edges,
    sections,
  };
}

/* ─── Download helper ─── */
export function downloadFigJamJSON() {
  const data = buildFigJamExport();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `더바다-고객여정-figjam-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}