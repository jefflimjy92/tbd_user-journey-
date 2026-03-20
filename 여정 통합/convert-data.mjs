/**
 * blueprint_data.js → task-data-refund.ts / task-data-simple.ts / task-data-referral.ts 변환
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// blueprint_data.js를 로딩 (let → globalThis에 바인딩)
const blueprintSrc = readFileSync(
  '/Users/joonyounglim/Desktop/CSO_전략기획/더바다_현재버전_패키지_20260320_114806/blueprint_data.js',
  'utf-8'
);

const modifiedSrc = blueprintSrc
  .replace(/^let /gm, 'globalThis.')
  .replace(/^const /gm, 'globalThis.');

const fn = new Function(modifiedSrc);
fn();

const refundData = globalThis.REFUND3Y_V2_DATA;
const easyClaimData = globalThis.EASY_CLAIM_VARIANT_BASE;
const referralData = globalThis.REFERRAL_DIRECT_SALES_DATA;
const referralBase = globalThis.REFERRAL_VARIANT_BASE;
const sourceRoleMap = globalThis.SOURCE_ROLE_MAP || {};

if (!refundData) { console.error('REFUND3Y_V2_DATA를 찾을 수 없습니다'); process.exit(1); }

// ─── 공통 유틸 ───

function escTs(s) {
  return String(s || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

function getRole(title) {
  return sourceRoleMap[title] || 'staff';
}

function inferLaneId(row) {
  const t = String(row?.team_raw || '');
  if (t.includes('상담팀')) return 'cs';
  if (t.includes('영업팀')) return 'sales';
  if (t.includes('청구팀')) return 'claim';
  if (t.includes('CS')) return 'cx';
  if (t.includes('인사')) return 'hr';
  if (t.includes('기획') || t.includes('개발') || t.includes('IT')) return 'it';
  if (t.includes('준법')) return 'legal';
  if (t.includes('운영')) return 'ops';
  return null;
}

function cellToTs(cell) {
  if (!cell || !Array.isArray(cell)) return '{ isEmpty: true }';
  const [title, desc, tags] = cell;
  if (!title || title === '—' || title === '') return '{ isEmpty: true }';
  const parts = [`title: "${escTs(title)}"`, `desc: "${escTs(desc || '')}"`];
  if (tags && tags.length > 0) {
    const tagStrs = tags.map(t => `"${Array.isArray(t) ? t[0] : t}"`);
    parts.push(`tags: [${tagStrs.join(', ')}]`);
  }
  return `{ ${parts.join(', ')} }`;
}

// ─── 범용 생성기 ───

function buildSourceMap(data) {
  const map = {};
  (data.sourceRows || []).forEach(row => {
    const laneId = row.lane_id || inferLaneId(row);
    const stageIdx = row.stage_index;
    if (laneId == null || stageIdx == null || stageIdx < 0) return;
    const key = `${laneId}:${stageIdx}`;
    if (!map[key]) map[key] = [];
    map[key].push(row);
  });
  return map;
}

const PHASE_GROUP_COLORS_POOL = ['#6366F1', '#059669', '#D97706', '#DC2626', '#7C3AED', '#db2777', '#0891b2', '#ca8a04'];

function genPhaseGroups(data) {
  return data.phaseGroups.map(([key, label, span], i) =>
    `    { label: "${label}", color: "${PHASE_GROUP_COLORS_POOL[i] || '#6366F1'}", span: ${span} },`
  ).join('\n');
}

function genPhases(data) {
  let groupIdx = 0, count = 0;
  return data.phases.map(([id, label]) => {
    while (groupIdx < data.phaseGroups.length && count >= data.phaseGroups[groupIdx][2]) { count = 0; groupIdx++; }
    count++;
    return `    { id: "${id}", label: "${label}", groupIdx: ${groupIdx} },`;
  }).join('\n');
}

function genStageReflected(data) {
  return (data.stageReflected || []).map((text, i) =>
    `    /* S${i+1} */ "${escTs(text)}",`
  ).join('\n');
}

function genStageHelpers(data) {
  return (data.stageHelperSections || []).map((helper, i) => {
    if (!helper || typeof helper !== 'object') return `    /* S${i+1} */ {},`;
    const parts = [];
    if (helper.handoff) parts.push(`handoff: "${escTs(helper.handoff)}"`);
    if (helper.risk) parts.push(`risk: "${escTs(helper.risk)}"`);
    if (helper.metric) parts.push(`metric: "${escTs(helper.metric)}"`);
    if (parts.length === 0) return `    /* S${i+1} */ {},`;
    return `    /* S${i+1} */ { ${parts.join(', ')} },`;
  }).join('\n');
}

function genLane(data, sourceMap, laneId, nameKr, nameEn, team, colorId) {
  const cells = data.baselineCells?.[laneId] || [];
  const phaseCount = data.phases.length;

  const cellLines = [];
  for (let i = 0; i < phaseCount; i++) {
    cellLines.push(`        /* S${i+1} */ ${cellToTs(cells[i])},`);
  }

  const sourceLines = [];
  for (let i = 0; i < phaseCount; i++) {
    const key = `${laneId}:${i}`;
    const rows = sourceMap[key];
    if (!rows || rows.length === 0) {
      sourceLines.push(`        /* S${i+1} */ { isEmpty: true },`);
    } else {
      const links = rows.map(r => {
        const label = escTs(r.title || '');
        const url = r.url || '';
        const role = getRole(r.title);
        return `{ label: "${label}", url: "${url}", role: "${role}" as const }`;
      });
      sourceLines.push(`        /* S${i+1} */ { notionLinks: [\n          ${links.join(',\n          ')},\n        ]},`);
    }
  }

  return `    {
      id: "${laneId}", nameKr: "${nameKr}", nameEn: "${nameEn}", team: "${team}", colorId: "${colorId}",
      cells: [
${cellLines.join('\n')}
      ],
      sourceCells: [
${sourceLines.join('\n')}
      ],
    },`;
}

// ─── Lane definitions per variant ───

const ALL_LANE_DEFS = {
  pe:    ['고객 접점',  'Physical Evidence',   '고객 접점', 'pe'],
  ca:    ['고객 행동',  'Customer Action',     '고객 행동', 'ca'],
  cs:    ['상담팀',     'Consulting Team',     'R:상담',    'cs'],
  sales: ['영업팀',     'Sales Team',          'R:영업',    'sales'],
  claim: ['청구팀',     'Claim Team',          'R:청구',    'claim'],
  it:    ['IT 운영',    'Dev/IT Ops',          'S:IT',      'it'],
  legal: ['준법 운영',  'Legal/Compliance',    'S:준법',    'legal'],
  ops:   ['운영 관리',  'Operations Mgmt',     'S:운영',    'ops'],
};

function generateVariant({ data, exportName, reflectedName, helpersName, title, laneDefs, dividers, comment }) {
  const sourceMap = buildSourceMap(data);
  const laneKeys = laneDefs || Object.keys(data.baselineCells || {});

  const lanesTs = laneKeys.map(laneId => {
    const def = ALL_LANE_DEFS[laneId];
    if (!def) return null;
    return genLane(data, sourceMap, laneId, def[0], def[1], def[2], def[3]);
  }).filter(Boolean).join('\n\n');

  const dividersTs = dividers.map(d =>
    `    { afterLaneId: "${d.afterLaneId}", type: "${d.type}", label: "${d.label}" },`
  ).join('\n');

  return `/* ================================================================
   ${comment}
   ================================================================ */

import type { TaskBoardData } from "./task-data";

/* ─── 반영 포인트 ─── */
export const ${reflectedName}: string[] = [
${genStageReflected(data)}
];

/* ─── 보조 구역: 인계 포인트 / 리스크·예외 / 운영지표 ─── */
export interface StageHelperSection {
  handoff?: string;
  risk?: string;
  metric?: string;
}

export const ${helpersName}: StageHelperSection[] = [
${genStageHelpers(data)}
];

export const ${exportName}: TaskBoardData = {
  phaseGroups: [
${genPhaseGroups(data)}
  ],

  phases: [
${genPhases(data)}
  ],

  lanes: [
${lanesTs}
  ],

  dividers: [
${dividersTs}
  ],
};
`;
}

// ════════════════════════════════════════════════
// 1. 3년 환급 (17단계)
// ════════════════════════════════════════════════

const refundOutput = generateVariant({
  data: refundData,
  exportName: 'TASK_DATA_REFUND',
  reflectedName: 'STAGE_REFLECTED',
  helpersName: 'STAGE_HELPER_SECTIONS',
  title: '3년 환급 여정',
  laneDefs: ['pe', 'ca', 'cs', 'sales', 'claim', 'it', 'legal', 'ops'],
  dividers: [
    { afterLaneId: 'ca', type: 'interaction', label: '고객 ↔ 운영 경계' },
    { afterLaneId: 'claim', type: 'visibility', label: '서포트 (IT·준법·운영)' },
  ],
  comment: '3년 환급 여정 — 업무 현황 데이터 (v3 — 현재버전 패키지 통합)\n   REFUND3Y_V2_DATA 17단계 기준',
});

writeFileSync(resolve(__dirname, 'src/app/components/task-data-refund.ts'), refundOutput, 'utf-8');
console.log(`✅ task-data-refund.ts — ${refundData.phases.length}단계, ${(refundData.sourceRows||[]).length} sourceRows`);

// ════════════════════════════════════════════════
// 2. 간편청구 (9단계)
// ════════════════════════════════════════════════

if (easyClaimData) {
  const simpleOutput = generateVariant({
    data: easyClaimData,
    exportName: 'TASK_DATA_SIMPLE',
    reflectedName: 'STAGE_REFLECTED_SIMPLE',
    helpersName: 'STAGE_HELPER_SECTIONS_SIMPLE',
    title: '간편청구 여정',
    laneDefs: ['pe', 'ca', 'sales', 'claim', 'it'],
    dividers: [
      { afterLaneId: 'ca', type: 'interaction', label: '고객 ↔ 운영 경계' },
      { afterLaneId: 'sales', type: 'team', label: '영업 ↔ 청구' },
      { afterLaneId: 'claim', type: 'visibility', label: '서포트 (IT·시스템)' },
    ],
    comment: '간편청구 여정 — 업무 현황 데이터\n   EASY_CLAIM_VARIANT_BASE 9단계 기준',
  });

  writeFileSync(resolve(__dirname, 'src/app/components/task-data-simple.ts'), simpleOutput, 'utf-8');
  console.log(`✅ task-data-simple.ts — ${easyClaimData.phases.length}단계`);
} else {
  console.warn('⚠️ EASY_CLAIM_VARIANT_BASE 없음 — task-data-simple.ts 생략');
}

// ════════════════════════════════════════════════
// 3. 소개 (REFERRAL_DIRECT_SALES_DATA — 14단계)
// ════════════════════════════════════════════════

// 소개는 REFERRAL_VARIANT_BASE (9단계 독자 구조)를 사용
// BLUEPRINT_VARIANTS.referral은 REFERRAL_DIRECT_SALES_DATA(14단계)를 사용하지만
// REFERRAL_VARIANT_BASE가 더 독자적인 소개 전용 데이터를 가지고 있음
// → 여기서는 BLUEPRINT_VARIANTS에서 실제 사용되는 데이터를 사용

const referralActual = referralData || referralBase;

if (referralActual) {
  const referralLanes = Object.keys(referralActual.baselineCells || {});
  console.log('소개 데이터 lanes:', referralLanes, 'phases:', referralActual.phases?.length);

  const referralOutput = generateVariant({
    data: referralActual,
    exportName: 'TASK_DATA_REFERRAL',
    reflectedName: 'STAGE_REFLECTED_REFERRAL',
    helpersName: 'STAGE_HELPER_SECTIONS_REFERRAL',
    title: '소개(가족연동 포함) 여정',
    laneDefs: referralLanes.length > 0 ? referralLanes : ['pe', 'ca', 'sales', 'claim', 'it', 'legal'],
    dividers: [
      { afterLaneId: 'ca', type: 'interaction', label: '고객 ↔ 운영 경계' },
      { afterLaneId: 'claim', type: 'visibility', label: '서포트 (IT·준법)' },
    ],
    comment: '소개(가족연동 포함) 여정 — 업무 현황 데이터\n   REFERRAL_DIRECT_SALES_DATA 기준 (환급 17단계에서 상담·TM 제거)',
  });

  writeFileSync(resolve(__dirname, 'src/app/components/task-data-referral.ts'), referralOutput, 'utf-8');
  console.log(`✅ task-data-referral.ts — ${referralActual.phases.length}단계`);
} else {
  console.warn('⚠️ REFERRAL 데이터 없음 — task-data-referral.ts 생략');
}

console.log('\n🎉 모든 데이터 파일 생성 완료!');
