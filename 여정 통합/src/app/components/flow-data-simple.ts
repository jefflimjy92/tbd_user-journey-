/* ================================================================
   간편 청구 플로우차트 데이터
   ================================================================ */

import type { FlowColumn, FlowEdge } from "./flow-data";

export const FLOW_COLUMNS_SIMPLE: FlowColumn[] = [
  {
    id: "sc-c0", label: "유입", stageLabel: "① 유입",
    nodes: [
      { id: "sf-ui-land", label: "랜딩페이지 진입", type: "main" },
      { id: "sf-ui-app", label: "앱 접속", type: "neutral" },
      { id: "sf-ui-kakao", label: "카카오톡 채널", type: "neutral" },
      { id: "sf-ui-refer", label: "소개 링크 유입", type: "neutral" },
    ],
  },
  {
    id: "sc-c1", label: "유입 결과", stageLabel: "① 유입",
    nodes: [
      { id: "sf-ui-record", label: "유입경로 기록", type: "neutral" },
      { id: "sf-ui-exit", label: "페이지 이탈", type: "exit" },
      { id: "sf-ui-dup", label: "중복 접수", type: "exit" },
    ],
  },
  {
    id: "sc-c2", label: "본인인증", stageLabel: "② 본인인증",
    nodes: [
      { id: "sf-au-phone", label: "휴대폰 본인인증", type: "neutral" },
      { id: "sf-au-ok", label: "본인인증 성공", type: "goal" },
      { id: "sf-au-fail", label: "본인인증 실패", type: "exit" },
    ],
  },
  {
    id: "sc-c3", label: "동의/가입", stageLabel: "② 본인인증",
    nodes: [
      { id: "sf-au-agree", label: "필수동의", type: "neutral" },
      { id: "sf-au-deny", label: "필수동의 거부", type: "exit" },
      { id: "sf-au-mkt", label: "마케팅 동의(선택)", type: "neutral" },
      { id: "sf-au-done", label: "가입 완료", type: "goal" },
    ],
  },
  {
    id: "sc-c4", label: "조회", stageLabel: "③ 조회/분석",
    nodes: [
      { id: "sf-an-ins", label: "보험 가입내역 조회", type: "neutral" },
      { id: "sf-an-med", label: "심평원 진료이력 연동", type: "neutral" },
    ],
  },
  {
    id: "sc-c5", label: "분석 결과", stageLabel: "③ 조회/분석",
    nodes: [
      { id: "sf-an-detect", label: "미청구 항목 탐지", type: "goal" },
      { id: "sf-an-calc", label: "예상 환급금 산출", type: "goal" },
      { id: "sf-an-none", label: "청구 가능 항목 없음", type: "exit" },
      { id: "sf-an-type", label: "청구 유형 분류", type: "neutral",
        hasChildren: true, groupLabel: "청구 가능 유형",
        children: [
          { id: "sf-an-t1", label: "실손보험", type: "neutral" },
          { id: "sf-an-t2", label: "입원/수술", type: "neutral" },
          { id: "sf-an-t3", label: "통원/약제비", type: "neutral" },
          { id: "sf-an-t4", label: "기타 특약", type: "neutral" },
        ],
      },
      { id: "sf-an-agree", label: "청구 진행 동의", type: "goal" },
    ],
  },
  {
    id: "sc-c6", label: "서류 수집", stageLabel: "④ 청구접수",
    nodes: [
      { id: "sf-cl-auto", label: "서류 자동 수집", type: "neutral" },
      { id: "sf-cl-auth", label: "진료기록 열람 위임", type: "neutral" },
      { id: "sf-cl-done", label: "서류 발급 완료", type: "goal" },
      { id: "sf-cl-miss", label: "서류 누락/보완", type: "exit" },
      { id: "sf-cl-delay", label: "발급 지연", type: "exit" },
    ],
  },
  {
    id: "sc-c7", label: "청구 접수", stageLabel: "④ 청구접수",
    nodes: [
      { id: "sf-cl-gen", label: "청구서 자동 생성", type: "neutral" },
      { id: "sf-cl-submit", label: "보험사 접수 완료", type: "goal" },
      { id: "sf-cl-noti", label: "접수 상태 알림", type: "neutral" },
      {
        id: "sf-cl-cancel", label: "본인취소", type: "exit",
        hasChildren: true, groupLabel: "취소 사유",
        children: [
          { id: "sf-cl-cx1", label: "단순 변심", type: "exit" },
          { id: "sf-cl-cx2", label: "환급금 소액", type: "exit" },
          { id: "sf-cl-cx3", label: "수수료 부담", type: "exit" },
          { id: "sf-cl-cx4", label: "타사 이용 결정", type: "exit" },
        ],
      },
    ],
  },
  {
    id: "sc-c8", label: "환급 결과", stageLabel: "⑤ 환급",
    nodes: [
      { id: "sf-hg-paid", label: "지급 완료", type: "goal" },
      { id: "sf-hg-reduced", label: "감액 지급", type: "goal" },
      { id: "sf-hg-denied", label: "부지급", type: "exit" },
      { id: "sf-hg-track", label: "지급지연 추적", type: "neutral" },
      { id: "sf-hg-dispute", label: "이의신청 안내", type: "neutral" },
    ],
  },
  {
    id: "sc-c9", label: "정산/후처리", stageLabel: "⑤ 환급",
    nodes: [
      { id: "sf-hg-fee", label: "수수료 자동 정산", type: "goal" },
      { id: "sf-hg-noti", label: "환급 완료 알림", type: "neutral" },
    ],
  },
  {
    id: "sc-c10", label: "사후관리", stageLabel: "⑥ 사후관리",
    nodes: [
      { id: "sf-fu-survey", label: "만족도 조사", type: "neutral" },
      { id: "sf-fu-extra", label: "추가 청구 알림", type: "neutral" },
      { id: "sf-fu-refer", label: "소개 요청", type: "neutral" },
      { id: "sf-fu-link", label: "소개 링크 생성", type: "goal" },
      { id: "sf-fu-db", label: "소개DB 생성", type: "goal" },
      { id: "sf-fu-reuse", label: "재이용 (추가청구)", type: "goal" },
      { id: "sf-fu-exit", label: "미재이용 이탈", type: "exit" },
    ],
  },
];

export const FLOW_EDGES_SIMPLE: FlowEdge[] = [
  // 유입 → 유입결과
  { from: "sf-ui-land", to: "sf-ui-record" },
  { from: "sf-ui-app", to: "sf-ui-record" },
  { from: "sf-ui-kakao", to: "sf-ui-record" },
  { from: "sf-ui-refer", to: "sf-ui-record" },
  { from: "sf-ui-land", to: "sf-ui-exit" },
  { from: "sf-ui-land", to: "sf-ui-dup" },

  // 유입결과 → 본인인증
  { from: "sf-ui-record", to: "sf-au-phone" },
  { from: "sf-au-phone", to: "sf-au-ok" },
  { from: "sf-au-phone", to: "sf-au-fail" },

  // 인증 → 동의
  { from: "sf-au-ok", to: "sf-au-agree" },
  { from: "sf-au-agree", to: "sf-au-done" },
  { from: "sf-au-agree", to: "sf-au-deny" },
  { from: "sf-au-agree", to: "sf-au-mkt" },
  { from: "sf-au-mkt", to: "sf-au-done" },

  // 가입 → 조회
  { from: "sf-au-done", to: "sf-an-ins" },
  { from: "sf-an-ins", to: "sf-an-med" },

  // 조회 → 분석결과
  { from: "sf-an-med", to: "sf-an-detect" },
  { from: "sf-an-med", to: "sf-an-none" },
  { from: "sf-an-detect", to: "sf-an-calc" },
  { from: "sf-an-detect", to: "sf-an-type" },
  { from: "sf-an-calc", to: "sf-an-agree" },

  // 동의 → 서류수집
  { from: "sf-an-agree", to: "sf-cl-auto" },
  { from: "sf-cl-auto", to: "sf-cl-auth" },
  { from: "sf-cl-auth", to: "sf-cl-done" },
  { from: "sf-cl-auth", to: "sf-cl-miss" },
  { from: "sf-cl-auth", to: "sf-cl-delay" },

  // 서류완료 → 청구접수
  { from: "sf-cl-done", to: "sf-cl-gen" },
  { from: "sf-cl-gen", to: "sf-cl-submit" },
  { from: "sf-cl-submit", to: "sf-cl-noti" },
  { from: "sf-cl-gen", to: "sf-cl-cancel" },

  // 접수 → 환급
  { from: "sf-cl-submit", to: "sf-hg-paid" },
  { from: "sf-cl-submit", to: "sf-hg-reduced" },
  { from: "sf-cl-submit", to: "sf-hg-denied" },
  { from: "sf-cl-submit", to: "sf-hg-track" },
  { from: "sf-hg-track", to: "sf-hg-paid" },
  { from: "sf-hg-denied", to: "sf-hg-dispute" },
  { from: "sf-hg-reduced", to: "sf-hg-dispute" },

  // 환급 → 정산
  { from: "sf-hg-paid", to: "sf-hg-fee" },
  { from: "sf-hg-reduced", to: "sf-hg-fee" },
  { from: "sf-hg-fee", to: "sf-hg-noti" },

  // 정산 → 사후관리
  { from: "sf-hg-noti", to: "sf-fu-survey" },
  { from: "sf-hg-noti", to: "sf-fu-refer" },
  { from: "sf-fu-survey", to: "sf-fu-extra" },
  { from: "sf-fu-extra", to: "sf-fu-reuse" },
  { from: "sf-fu-extra", to: "sf-fu-exit" },
  { from: "sf-fu-refer", to: "sf-fu-link" },
  { from: "sf-fu-link", to: "sf-fu-db" },
  { from: "sf-fu-reuse", to: "sf-ui-land", type: "loop" },
  { from: "sf-fu-db", to: "sf-ui-land", type: "loop" },
];

export const STAGE_COLORS_SIMPLE: Record<string, string> = {
  "① 유입": "#2563EB",
  "② 본인인증": "#0891B2",
  "③ 조회/분석": "#059669",
  "④ 청구접수": "#DC2626",
  "⑤ 환급": "#7C3AED",
  "⑥ 사후관리": "#DB2777",
};
