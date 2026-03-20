/* ================================================================
   여정 유형 레지스트리
   - 3년 환급 / 간편 청구 / 소개(가족연동 포함)
   ================================================================ */

import { STAGES } from "./journey-data";
import type { Stage } from "./journey-data";
import { STAGES_SIMPLE } from "./journey-data-simple";
import { STAGES_REFERRAL } from "./journey-data-referral";
import { FLOW_COLUMNS, FLOW_EDGES, STAGE_COLORS } from "./flow-data";
import type { FlowColumn, FlowEdge } from "./flow-data";
import { FLOW_COLUMNS_SIMPLE, FLOW_EDGES_SIMPLE, STAGE_COLORS_SIMPLE } from "./flow-data-simple";
import { FLOW_COLUMNS_REFERRAL, FLOW_EDGES_REFERRAL, STAGE_COLORS_REFERRAL } from "./flow-data-referral";
import type { TaskBoardData } from "./task-data";
import { TASK_DATA_REFUND, STAGE_REFLECTED, STAGE_HELPER_SECTIONS } from "./task-data-refund";
import { TASK_DATA_SIMPLE, STAGE_REFLECTED_SIMPLE, STAGE_HELPER_SECTIONS_SIMPLE } from "./task-data-simple";
import { TASK_DATA_REFERRAL, STAGE_REFLECTED_REFERRAL, STAGE_HELPER_SECTIONS_REFERRAL } from "./task-data-referral";
import type { StageHelperSection } from "./task-data-refund";

export type JourneyTypeId = "refund" | "simple" | "referral";

export interface JourneyTypeMeta {
  id: JourneyTypeId;
  label: string;
  labelEn: string;
  description: string;
  icon: string;       // emoji
  color: string;       // primary color for the tab
  stageCount: number;
  canonicalStages: Stage[];
  flowColumns: FlowColumn[];
  flowEdges: FlowEdge[];
  stageColors: Record<string, string>;
  taskData: TaskBoardData;
  stageReflected?: string[];
  stageHelpers?: StageHelperSection[];
  loopLabel?: string;  // label for the loop arrow (if any)
  crossLinkNote?: string; // annotation below the map
}

export const JOURNEY_TYPES: JourneyTypeMeta[] = [
  {
    id: "refund",
    label: "3년 환급",
    labelEn: "3-Year Refund",
    description: "보상팀 TM → 미팅 → 청구 → 환급의 풀 프로세스",
    icon: "💰",
    color: "#1B4F8A",
    stageCount: 9,
    canonicalStages: STAGES,
    flowColumns: FLOW_COLUMNS,
    flowEdges: FLOW_EDGES,
    stageColors: STAGE_COLORS,
    taskData: TASK_DATA_REFUND,
    stageReflected: STAGE_REFLECTED,
    stageHelpers: STAGE_HELPER_SECTIONS,
    loopLabel: "재유입 루프 (⑨ 소개 → ② 유입)",
    crossLinkNote: "⑥ 미팅의 '청구만 진행'은 ⑦ 청구로 직행 | ⑨ 소개의 '재유입 성공'은 ② 유입으로 복귀",
  },
  {
    id: "simple",
    label: "간편 청구",
    labelEn: "Simple Claim",
    description: "온라인 셀프 청구 — 상담/미팅 없이 직접 접수",
    icon: "⚡",
    color: "#059669",
    stageCount: 9,
    canonicalStages: STAGES_SIMPLE,
    flowColumns: FLOW_COLUMNS_SIMPLE,
    flowEdges: FLOW_EDGES_SIMPLE,
    stageColors: STAGE_COLORS_SIMPLE,
    taskData: TASK_DATA_SIMPLE,
    stageReflected: STAGE_REFLECTED_SIMPLE,
    stageHelpers: STAGE_HELPER_SECTIONS_SIMPLE,
    loopLabel: "재이용 루프 (⑥ 사후관리 → ① 유입)",
    crossLinkNote: "⑥ 사후관리의 '재이용/소개DB'는 ① 유입으로 루프 복귀",
  },
  {
    id: "referral",
    label: "소개",
    labelEn: "Referral",
    description: "소개 발생 → 가족연동 → 서비스 전환 바이럴 루프",
    icon: "🤝",
    color: "#7C3AED",
    stageCount: 14,
    canonicalStages: STAGES_REFERRAL,
    flowColumns: FLOW_COLUMNS_REFERRAL,
    flowEdges: FLOW_EDGES_REFERRAL,
    stageColors: STAGE_COLORS_REFERRAL,
    taskData: TASK_DATA_REFERRAL,
    stageReflected: STAGE_REFLECTED_REFERRAL,
    stageHelpers: STAGE_HELPER_SECTIONS_REFERRAL,
    loopLabel: "바이럴 루프 (⑥ 전환/성과 → ① 소개발생)",
    crossLinkNote: "⑥ '2차 소개 발생'은 ① 소개발생으로 바이럴 루프 | 여정 분기에서 3년 환급/간편 청구 여정으로 연결",
  },
];

export function getJourneyType(id: JourneyTypeId): JourneyTypeMeta {
  return JOURNEY_TYPES.find(t => t.id === id)!;
}