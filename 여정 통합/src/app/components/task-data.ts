/* ================================================================
   업무 현황 공통 타입 정의
   ================================================================ */

export interface NotionLink {
  label: string;
  url: string;
  role?: "mgr" | "staff";
}

export interface TaskCell {
  title?: string;
  desc?: string;
  tags?: ("P0" | "P1" | "핵심")[];
  notionLinks?: NotionLink[];
  isEmpty?: boolean;
  improvement?: string;
}

export interface TaskLane {
  id: string;
  nameKr: string;
  nameEn: string;
  team: string;
  colorId: string;       // "cx" | "cs" | "sales" | "claim" | "it" | "legal" | "ops"
  cells: TaskCell[];      // phases.length 만큼
  sourceCells?: TaskCell[]; // 업무소스 행 (Notion 링크 전용)
}

export interface TaskPhaseGroup {
  label: string;
  color: string;
  span: number;
}

export interface TaskPhase {
  id: string;
  label: string;
  groupIdx: number;
}

export interface TaskDivider {
  afterLaneId: string;
  type: "interaction" | "team" | "visibility" | "internal";
  label: string;
}

export interface TaskBoardData {
  phaseGroups: TaskPhaseGroup[];
  phases: TaskPhase[];
  lanes: TaskLane[];
  dividers: TaskDivider[];
}

/* ─── 레인 색상 시스템 ─── */
export const LANE_COLORS: Record<string, {
  bg: string; cellBg: string; teamBg: string; teamText: string;
}> = {
  cx:    { bg: "#eef2ff", cellBg: "rgba(199,210,254,.18)", teamBg: "#c7d2fe", teamText: "#3730a3" },
  cs:    { bg: "#ecfdf3", cellBg: "rgba(34,197,94,.10)",   teamBg: "#bbf7d0", teamText: "#166534" },
  sales: { bg: "#fff7ed", cellBg: "rgba(249,115,22,.10)",  teamBg: "#fdba74", teamText: "#9a3412" },
  claim: { bg: "#f5f3ff", cellBg: "rgba(124,58,237,.10)",  teamBg: "#ddd6fe", teamText: "#5b21b6" },
  it:    { bg: "#eff6ff", cellBg: "rgba(37,99,235,.10)",   teamBg: "#bfdbfe", teamText: "#1d4ed8" },
  legal: { bg: "#fef2f2", cellBg: "rgba(239,68,68,.10)",   teamBg: "#fecaca", teamText: "#b91c1c" },
  ops:   { bg: "#f0fdfa", cellBg: "rgba(20,184,166,.10)",  teamBg: "#99f6e4", teamText: "#0f766e" },
  pe:    { bg: "#fafbff", cellBg: "rgba(99,102,241,.10)",  teamBg: "#c7d2fe", teamText: "#4338ca" },
  ca:    { bg: "#faf5ff", cellBg: "rgba(168,85,247,.10)",  teamBg: "#e9d5ff", teamText: "#7e22ce" },
  hr:    { bg: "#fdf4ff", cellBg: "rgba(217,70,239,.10)",  teamBg: "#f0abfc", teamText: "#86198f" },
};

export const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  P0:  { bg: "#fee2e2", text: "#dc2626" },
  P1:  { bg: "#fef3c7", text: "#d97706" },
  "핵심": { bg: "#fee2e2", text: "#dc2626" },
};
