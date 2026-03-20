/* ================================================================
   소개(가족연동 포함) 고객여정 데이터
   - 기존 고객의 소개/추천 → 피소개인 유입 → 가족연동 → 서비스 전환
   - 6단계: 소개발생 → 소개인관리 → 피소개인유입 → 가족연동 → 서비스배정 → 전환/성과
   ================================================================ */

import type { Stage } from "./journey-data";

export const STAGES_REFERRAL: Stage[] = [
  {
    id: "RF1", badge: "①", name: "소개 발생", nameEn: "Referral Source",
    nodes: [
      {
        id: "rf-sr1", label: "소개 발생 경로", type: "neutral",
        hasChildren: true, groupLabel: "소개 유입 채널",
        children: [
          { id: "rf-sr1a", label: "유선 상담 중 소개", type: "neutral" },
          { id: "rf-sr1b", label: "미팅 현장 소개", type: "neutral" },
          { id: "rf-sr1c", label: "환급 완료 후 소개", type: "neutral" },
          { id: "rf-sr1d", label: "소개 링크/카카오 공유", type: "neutral" },
          { id: "rf-sr1e", label: "동반신청 (미팅 동행자)", type: "neutral" },
        ],
      },
      { id: "rf-sr2", label: "소개인 정보 접수", type: "neutral" },
      { id: "rf-sr3", label: "피소개인 기본정보 확보", type: "goal", goalSeverity: "minor" },
      { id: "rf-sr4", label: "소개 접수 알림 (소개인)", type: "neutral" },
      { id: "rf-sr5", label: "소개 정보 부족/무효", type: "exit", exitSeverity: "soft" },
    ],
  },
  {
    id: "RF2", badge: "②", name: "소개인 관리", nameEn: "Referrer Mgmt",
    nodes: [
      { id: "rf-rm1", label: "소개인 혜택 안내", type: "neutral" },
      {
        id: "rf-rm2", label: "소개 보상 체계", type: "neutral",
        hasChildren: true, groupLabel: "보상 유형",
        children: [
          { id: "rf-rm2a", label: "수수료 면제/할인", type: "neutral" },
          { id: "rf-rm2b", label: "추가 환급금 보너스", type: "neutral" },
          { id: "rf-rm2c", label: "소개 건수별 등급 혜택", type: "neutral" },
          { id: "rf-rm2d", label: "가족 동반 수수료 할인", type: "neutral" },
        ],
      },
      { id: "rf-rm3", label: "소개인 이력 관리", type: "neutral" },
      { id: "rf-rm4", label: "동일 담당자 재배정 요청", type: "neutral" },
      { id: "rf-rm5", label: "소개인 만족도 확인", type: "goal", goalSeverity: "minor" },
      { id: "rf-rm6", label: "소개인 추가 소개 유도", type: "neutral" },
    ],
  },
  {
    id: "RF3", badge: "③", name: "피소개인 유입", nameEn: "Referred Entry",
    nodes: [
      { id: "rf-re1", label: "피소개인 1차 연락 (TM)", type: "neutral" },
      { id: "rf-re2", label: "소개 경위 확인", type: "neutral" },
      { id: "rf-re3", label: "서비스 안내 (소개인 사례 포함)", type: "neutral" },
      { id: "rf-re4", label: "본인인증 / 정보입력", type: "neutral" },
      { id: "rf-re5", label: "보험 조회 완료", type: "goal", goalSeverity: "moderate" },
      { id: "rf-re6", label: "연락 불가 (부재)", type: "exit", exitSeverity: "moderate" },
      {
        id: "rf-re7", label: "피소개인 거절", type: "exit", exitSeverity: "moderate",
        hasChildren: true, groupLabel: "거절 사유",
        children: [
          { id: "rf-re7a", label: "관심 없음", type: "exit", exitSeverity: "moderate" },
          { id: "rf-re7b", label: "이미 타사 이용 중", type: "exit", exitSeverity: "critical" },
          { id: "rf-re7c", label: "개인정보 우려", type: "exit", exitSeverity: "moderate" },
          { id: "rf-re7d", label: "보험 미가입", type: "exit", exitSeverity: "critical" },
          { id: "rf-re7e", label: "단순 변심", type: "exit", exitSeverity: "soft" },
        ],
      },
      { id: "rf-re8", label: "서비스 유형 분기", type: "goal", goalSeverity: "minor" },
    ],
  },
  {
    id: "RF4", badge: "④", name: "가족 연동", nameEn: "Family Link",
    nodes: [
      { id: "rf-fl1", label: "가족관계 확인", type: "neutral" },
      {
        id: "rf-fl2", label: "가족 연동 유형", type: "neutral",
        hasChildren: true, groupLabel: "연동 케이스",
        children: [
          { id: "rf-fl2a", label: "배우자 동반 신청", type: "neutral" },
          { id: "rf-fl2b", label: "부모님 대리 신청", type: "neutral" },
          { id: "rf-fl2c", label: "자녀 추가 연동", type: "neutral" },
          { id: "rf-fl2d", label: "형제/자매 동반", type: "neutral" },
        ],
      },
      { id: "rf-fl3", label: "동의서 징구 (대리청구 위임)", type: "neutral" },
      { id: "rf-fl4", label: "가족 보험 통합 조회", type: "goal", goalSeverity: "moderate" },
      { id: "rf-fl5", label: "가족 합산 환급금 산출", type: "goal", goalSeverity: "major" },
      { id: "rf-fl6", label: "가족 연동 거부", type: "exit", exitSeverity: "moderate" },
      { id: "rf-fl7", label: "대리청구 부적격", type: "exit", exitSeverity: "critical" },
    ],
  },
  {
    id: "RF5", badge: "⑤", name: "서비스 배정", nameEn: "Assignment",
    nodes: [
      { id: "rf-as1", label: "담당자 배정 (소개인 동일 우선)", type: "neutral" },
      { id: "rf-as2", label: "서비스 유형 확정", type: "neutral" },
      {
        id: "rf-as3", label: "여정 분기", type: "goal", goalSeverity: "moderate",
        hasChildren: true, groupLabel: "서비스 유형별 분기",
        children: [
          { id: "rf-as3a", label: "3년 환급 여정 진입", type: "goal", goalSeverity: "major" },
          { id: "rf-as3b", label: "간편 청구 여정 진입", type: "goal", goalSeverity: "major" },
          { id: "rf-as3c", label: "가족 통합 청구 진행", type: "goal", goalSeverity: "major" },
        ],
      },
      { id: "rf-as4", label: "미팅 예약 (3년 환급)", type: "neutral" },
      { id: "rf-as5", label: "온라인 접수 안내 (간편)", type: "neutral" },
      { id: "rf-as6", label: "배정 전 이탈", type: "exit", exitSeverity: "moderate" },
    ],
  },
  {
    id: "RF6", badge: "⑥", name: "전환/성과", nameEn: "Conversion",
    nodes: [
      { id: "rf-cv1", label: "소개 건 환급 완료", type: "goal", goalSeverity: "major" },
      { id: "rf-cv2", label: "소개인 보상 지급", type: "goal", goalSeverity: "moderate" },
      { id: "rf-cv3", label: "가족 연동 환급 완료", type: "goal", goalSeverity: "major" },
      { id: "rf-cv4", label: "2차 소개 발생 (바이럴)", type: "goal", goalSeverity: "major", crossLink: "RF1" },
      { id: "rf-cv5", label: "소개 전환율 기록", type: "neutral" },
      { id: "rf-cv6", label: "소개 실패 종결", type: "exit", exitSeverity: "critical" },
      { id: "rf-cv7", label: "장기 미전환 관리", type: "exit", exitSeverity: "moderate" },
    ],
  },
];
