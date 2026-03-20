/* ================================================================
   간편 청구 고객여정 데이터
   - 상담/미팅 없이 온라인으로 직접 청구하는 간소화 프로세스
   - 6단계: 유입 → 본인인증 → 조회/분석 → 청구접수 → 환급 → 사후관리
   ================================================================ */

import type { Stage } from "./journey-data";

export const STAGES_SIMPLE: Stage[] = [
  {
    id: "SC1", badge: "①", name: "유입", nameEn: "Inflow",
    nodes: [
      { id: "sc-ui1", label: "랜딩페이지 진입", type: "neutral" },
      { id: "sc-ui2", label: "앱 다운로드/접속", type: "neutral" },
      { id: "sc-ui3", label: "카카오톡 채널 유입", type: "neutral" },
      { id: "sc-ui4", label: "소개 링크 유입", type: "neutral", crossLink: "SC6" },
      { id: "sc-ui5", label: "유입경로 기록", type: "neutral" },
      { id: "sc-ui6", label: "이탈 (페이지 이탈)", type: "exit", exitSeverity: "soft" },
      { id: "sc-ui7", label: "중복 접수", type: "exit", exitSeverity: "soft" },
    ],
  },
  {
    id: "SC2", badge: "②", name: "본인인증", nameEn: "Verification",
    nodes: [
      { id: "sc-au1", label: "휴대폰 본인인증", type: "neutral" },
      { id: "sc-au2", label: "본인인증 성공", type: "goal", goalSeverity: "minor" },
      { id: "sc-au3", label: "본인인증 실패", type: "exit", exitSeverity: "moderate" },
      { id: "sc-au4", label: "필수동의 (개인정보/서비스)", type: "neutral" },
      { id: "sc-au5", label: "필수동의 거부", type: "exit", exitSeverity: "moderate" },
      { id: "sc-au6", label: "마케팅 동의 (선택)", type: "neutral" },
      { id: "sc-au7", label: "가입 완료", type: "goal", goalSeverity: "moderate" },
    ],
  },
  {
    id: "SC3", badge: "③", name: "조회/분석", nameEn: "Analysis",
    nodes: [
      { id: "sc-an1", label: "보험 가입내역 자동 조회", type: "neutral" },
      { id: "sc-an2", label: "심평원 진료이력 연동", type: "neutral" },
      { id: "sc-an3", label: "미청구 항목 자동 탐지", type: "goal", goalSeverity: "moderate" },
      { id: "sc-an4", label: "예상 환급금 산출", type: "goal", goalSeverity: "moderate" },
      { id: "sc-an5", label: "청구 가능 항목 없음", type: "exit", exitSeverity: "moderate" },
      {
        id: "sc-an6", label: "청구 유형 분류", type: "neutral",
        hasChildren: true, groupLabel: "청구 가능 유형",
        children: [
          { id: "sc-an6a", label: "실손보험 청구", type: "neutral" },
          { id: "sc-an6b", label: "입원/수술 보험금", type: "neutral" },
          { id: "sc-an6c", label: "통원/약제비", type: "neutral" },
          { id: "sc-an6d", label: "기타 특약 보험금", type: "neutral" },
        ],
      },
      { id: "sc-an7", label: "청구 진행 동의", type: "goal", goalSeverity: "major" },
    ],
  },
  {
    id: "SC4", badge: "④", name: "청구접수", nameEn: "Claim",
    nodes: [
      { id: "sc-cl1", label: "서류 자동 수집 요청", type: "neutral" },
      { id: "sc-cl2", label: "진료기록 열람 위임", type: "neutral" },
      { id: "sc-cl3", label: "서류 발급 완료", type: "goal", goalSeverity: "minor" },
      { id: "sc-cl4", label: "서류 누락/보완 요청", type: "exit", exitSeverity: "soft" },
      { id: "sc-cl5", label: "발급 지연", type: "exit", exitSeverity: "soft" },
      { id: "sc-cl6", label: "청구서 자동 생성", type: "neutral" },
      { id: "sc-cl7", label: "보험사 접수 완료", type: "goal", goalSeverity: "major" },
      { id: "sc-cl8", label: "접수 상태 알림 (카카오톡)", type: "neutral" },
      {
        id: "sc-cl9", label: "본인취소", type: "exit", exitSeverity: "moderate",
        hasChildren: true, groupLabel: "본인취소 사유",
        children: [
          { id: "sc-cl9a", label: "단순 변심", type: "exit", exitSeverity: "soft" },
          { id: "sc-cl9b", label: "환급금 소액", type: "exit", exitSeverity: "soft" },
          { id: "sc-cl9c", label: "수수료 부담", type: "exit", exitSeverity: "moderate" },
          { id: "sc-cl9d", label: "개인정보 우려", type: "exit", exitSeverity: "moderate" },
          { id: "sc-cl9e", label: "타사 이용 결정", type: "exit", exitSeverity: "critical" },
        ],
      },
    ],
  },
  {
    id: "SC5", badge: "⑤", name: "환급", nameEn: "Refund",
    nodes: [
      { id: "sc-hg1", label: "지급 완료", type: "goal", goalSeverity: "major" },
      { id: "sc-hg2", label: "감액 지급", type: "goal", goalSeverity: "minor" },
      { id: "sc-hg3", label: "부지급", type: "exit", exitSeverity: "critical" },
      { id: "sc-hg4", label: "지급지연 추적", type: "neutral" },
      { id: "sc-hg5", label: "이의신청 안내", type: "neutral" },
      { id: "sc-hg6", label: "수수료 자동 정산", type: "goal", goalSeverity: "minor" },
      { id: "sc-hg7", label: "환급 완료 알림", type: "neutral" },
    ],
  },
  {
    id: "SC6", badge: "⑥", name: "사후관리", nameEn: "Follow-up",
    nodes: [
      { id: "sc-fu1", label: "만족도 조사", type: "neutral" },
      { id: "sc-fu2", label: "추가 청구 가능 항목 알림", type: "neutral" },
      { id: "sc-fu3", label: "지인 소개 요청", type: "neutral" },
      { id: "sc-fu4", label: "소개 링크 생성", type: "goal", goalSeverity: "minor" },
      { id: "sc-fu5", label: "소개DB 생성", type: "goal", goalSeverity: "moderate" },
      { id: "sc-fu6", label: "재이용 (추가청구)", type: "goal", goalSeverity: "major" },
      { id: "sc-fu7", label: "이탈 (미재이용)", type: "exit", exitSeverity: "soft" },
    ],
  },
];
