/* ================================================================
   소개(가족연동 포함) 플로우차트 데이터
   ================================================================ */

import type { FlowColumn, FlowEdge } from "./flow-data";

export const FLOW_COLUMNS_REFERRAL: FlowColumn[] = [
  {
    id: "rf-c0", label: "소개 발생", stageLabel: "① 소개발생",
    nodes: [
      { id: "rf-sr-source", label: "소개 발생 경로", type: "main",
        hasChildren: true, groupLabel: "소개 유입 채널",
        children: [
          { id: "rf-sr-s1", label: "유선 상담 중 소개", type: "neutral" },
          { id: "rf-sr-s2", label: "미팅 현장 소개", type: "neutral" },
          { id: "rf-sr-s3", label: "환급 완료 후 소개", type: "neutral" },
          { id: "rf-sr-s4", label: "소개 링크/카카오", type: "neutral" },
          { id: "rf-sr-s5", label: "동반신청 (미팅 동행자)", type: "neutral" },
        ],
      },
    ],
  },
  {
    id: "rf-c1", label: "소개 접수", stageLabel: "① 소개발생",
    nodes: [
      { id: "rf-sr-info", label: "소개인 정보 접수", type: "neutral" },
      { id: "rf-sr-target", label: "피소개인 기본정보 확보", type: "goal" },
      { id: "rf-sr-noti", label: "소개 접수 알림", type: "neutral" },
      { id: "rf-sr-invalid", label: "소개 정보 무효", type: "exit" },
    ],
  },
  {
    id: "rf-c2", label: "소개인 혜택", stageLabel: "② 소개인관리",
    nodes: [
      { id: "rf-rm-benefit", label: "소개인 혜택 안내", type: "neutral" },
      { id: "rf-rm-reward", label: "보상 체계", type: "neutral",
        hasChildren: true, groupLabel: "보상 유형",
        children: [
          { id: "rf-rm-r1", label: "수수료 면제/할인", type: "neutral" },
          { id: "rf-rm-r2", label: "추가 환급금 보너스", type: "neutral" },
          { id: "rf-rm-r3", label: "등급별 혜택", type: "neutral" },
          { id: "rf-rm-r4", label: "가족 동반 할인", type: "neutral" },
        ],
      },
    ],
  },
  {
    id: "rf-c3", label: "소개인 관리", stageLabel: "② 소개인관리",
    nodes: [
      { id: "rf-rm-history", label: "소개인 이력 관리", type: "neutral" },
      { id: "rf-rm-same", label: "동일 담당자 재배정", type: "neutral" },
      { id: "rf-rm-sat", label: "소개인 만족도 확인", type: "goal" },
      { id: "rf-rm-more", label: "추가 소개 유도", type: "neutral" },
    ],
  },
  {
    id: "rf-c4", label: "피소개인 접촉", stageLabel: "③ 피소개인유입",
    nodes: [
      { id: "rf-re-call", label: "피소개인 1차 연락", type: "neutral" },
      { id: "rf-re-check", label: "소개 경위 확인", type: "neutral" },
      { id: "rf-re-guide", label: "서비스 안내", type: "neutral" },
      { id: "rf-re-absent", label: "연락 불가 (부재)", type: "exit" },
    ],
  },
  {
    id: "rf-c5", label: "피소개인 전환", stageLabel: "③ 피소개인유입",
    nodes: [
      { id: "rf-re-auth", label: "본인인증/정보입력", type: "neutral" },
      { id: "rf-re-done", label: "보험 조회 완료", type: "goal" },
      { id: "rf-re-reject", label: "피소개인 거절", type: "exit",
        hasChildren: true, groupLabel: "거절 사유",
        children: [
          { id: "rf-re-rj1", label: "관심 없음", type: "exit" },
          { id: "rf-re-rj2", label: "타사 이용 중", type: "exit" },
          { id: "rf-re-rj3", label: "개인정보 우려", type: "exit" },
          { id: "rf-re-rj4", label: "보험 미가입", type: "exit" },
          { id: "rf-re-rj5", label: "단순 변심", type: "exit" },
        ],
      },
      { id: "rf-re-branch", label: "서비스 유형 분기", type: "goal" },
    ],
  },
  {
    id: "rf-c6", label: "가족 확인", stageLabel: "④ 가족연동",
    nodes: [
      { id: "rf-fl-check", label: "가족관계 확인", type: "neutral" },
      { id: "rf-fl-type", label: "가족 연동 유형", type: "neutral",
        hasChildren: true, groupLabel: "연동 케이스",
        children: [
          { id: "rf-fl-t1", label: "배우자 동반", type: "neutral" },
          { id: "rf-fl-t2", label: "부모님 대리", type: "neutral" },
          { id: "rf-fl-t3", label: "자녀 추가", type: "neutral" },
          { id: "rf-fl-t4", label: "형제/자매 동반", type: "neutral" },
        ],
      },
    ],
  },
  {
    id: "rf-c7", label: "가족 연동 결과", stageLabel: "④ 가족연동",
    nodes: [
      { id: "rf-fl-agree", label: "동의서 징구", type: "neutral" },
      { id: "rf-fl-lookup", label: "가족 보험 통합 조회", type: "goal" },
      { id: "rf-fl-calc", label: "가족 합산 환급금", type: "goal" },
      { id: "rf-fl-deny", label: "가족 연동 거부", type: "exit" },
      { id: "rf-fl-fail", label: "대리청구 부적격", type: "exit" },
    ],
  },
  {
    id: "rf-c8", label: "배정", stageLabel: "⑤ 서비스배정",
    nodes: [
      { id: "rf-as-assign", label: "담당자 배정", type: "neutral" },
      { id: "rf-as-confirm", label: "서비스 유형 확정", type: "neutral" },
      { id: "rf-as-branch", label: "여정 분기", type: "goal",
        hasChildren: true, groupLabel: "서비스별 분기",
        children: [
          { id: "rf-as-b1", label: "3년 환급 진입", type: "goal" },
          { id: "rf-as-b2", label: "간편 청구 진입", type: "goal" },
          { id: "rf-as-b3", label: "가족 통합 청구", type: "goal" },
        ],
      },
      { id: "rf-as-exit", label: "배정 전 이탈", type: "exit" },
    ],
  },
  {
    id: "rf-c9", label: "전환 결과", stageLabel: "⑥ 전환/성과",
    nodes: [
      { id: "rf-cv-done", label: "소개 건 환급 완료", type: "goal" },
      { id: "rf-cv-reward", label: "소개인 보상 지급", type: "goal" },
      { id: "rf-cv-family", label: "가족 연동 환급 완료", type: "goal" },
    ],
  },
  {
    id: "rf-c10", label: "재순환", stageLabel: "⑥ 전환/성과",
    nodes: [
      { id: "rf-cv-viral", label: "2차 소개 발생", type: "goal" },
      { id: "rf-cv-rate", label: "소개 전환율 기록", type: "neutral" },
      { id: "rf-cv-fail", label: "소개 실패 종결", type: "exit" },
      { id: "rf-cv-dormant", label: "장기 미전환 관리", type: "exit" },
    ],
  },
];

export const FLOW_EDGES_REFERRAL: FlowEdge[] = [
  // 소개 발생 → 접수
  { from: "rf-sr-source", to: "rf-sr-info" },
  { from: "rf-sr-info", to: "rf-sr-target" },
  { from: "rf-sr-info", to: "rf-sr-invalid" },
  { from: "rf-sr-target", to: "rf-sr-noti" },

  // 접수 → 소개인 혜택
  { from: "rf-sr-noti", to: "rf-rm-benefit" },
  { from: "rf-rm-benefit", to: "rf-rm-reward" },

  // 소개인 관리
  { from: "rf-rm-benefit", to: "rf-rm-history" },
  { from: "rf-rm-history", to: "rf-rm-same" },
  { from: "rf-rm-history", to: "rf-rm-sat" },
  { from: "rf-rm-sat", to: "rf-rm-more" },

  // 접수 → 피소개인 접촉
  { from: "rf-sr-target", to: "rf-re-call" },
  { from: "rf-re-call", to: "rf-re-check" },
  { from: "rf-re-check", to: "rf-re-guide" },
  { from: "rf-re-call", to: "rf-re-absent" },

  // 피소개인 전환
  { from: "rf-re-guide", to: "rf-re-auth" },
  { from: "rf-re-guide", to: "rf-re-reject" },
  { from: "rf-re-auth", to: "rf-re-done" },
  { from: "rf-re-done", to: "rf-re-branch" },

  // 분기 → 가족 연동
  { from: "rf-re-branch", to: "rf-fl-check" },
  { from: "rf-fl-check", to: "rf-fl-type" },
  { from: "rf-fl-type", to: "rf-fl-agree" },
  { from: "rf-fl-agree", to: "rf-fl-lookup" },
  { from: "rf-fl-lookup", to: "rf-fl-calc" },
  { from: "rf-fl-check", to: "rf-fl-deny" },
  { from: "rf-fl-agree", to: "rf-fl-fail" },

  // 서비스 배정
  { from: "rf-re-branch", to: "rf-as-assign" },
  { from: "rf-fl-calc", to: "rf-as-assign" },
  { from: "rf-as-assign", to: "rf-as-confirm" },
  { from: "rf-as-confirm", to: "rf-as-branch" },
  { from: "rf-as-confirm", to: "rf-as-exit" },

  // 전환 결과
  { from: "rf-as-branch", to: "rf-cv-done" },
  { from: "rf-cv-done", to: "rf-cv-reward" },
  { from: "rf-as-branch", to: "rf-cv-family" },

  // 재순환
  { from: "rf-cv-done", to: "rf-cv-viral" },
  { from: "rf-cv-family", to: "rf-cv-viral" },
  { from: "rf-cv-reward", to: "rf-cv-rate" },
  { from: "rf-cv-viral", to: "rf-sr-source", type: "loop" },
  { from: "rf-as-exit", to: "rf-cv-fail" },
  { from: "rf-re-absent", to: "rf-cv-dormant" },

  // 추가 소개 루프
  { from: "rf-rm-more", to: "rf-sr-source", type: "loop" },
];

export const STAGE_COLORS_REFERRAL: Record<string, string> = {
  "① 소개발생": "#DB2777",
  "② 소개인관리": "#7C3AED",
  "③ 피소개인유입": "#2563EB",
  "④ 가족연동": "#059669",
  "⑤ 서비스배정": "#CA8A04",
  "⑥ 전환/성과": "#DC2626",
};
