export const COLORS = {
  mainSpine: { bg: "#1B4F8A", text: "#FFFFFF" },
  // ── Exit severity levels (dark → light) ──
  exitCritical: { bg: "#7B1818", text: "#FFFFFF" },    // 치명적 이탈 (완전 종결, 복구 불가)
  exit: { bg: "#C0392B", text: "#FFFFFF" },             // 중간 이탈 (회복 가능성 낮음)
  exitSoft: { bg: "#E8705E", text: "#FFFFFF" },         // 경미한 이탈 (일시적, 해결 가능)
  // ── Goal achievement levels (high saturation → low saturation) ──
  goalMajor: { bg: "#0B6E35", text: "#FFFFFF" },        // 핵심 달성 (주요 전환 포인트, 최고 채도)
  goal: { bg: "#1A9A5A", text: "#FFFFFF" },              // 중간 달성 (중요 중간 단계)
  goalMinor: { bg: "#5BBD8A", text: "#FFFFFF" },         // 초기 달성 (부분 진행, 낮은 채도)
  // ── Neutral ──
  neutral: { bg: "#F0F4F8", text: "#2C3E50", border: "#CBD5E0" },
  // ── Muted variants for child/detail nodes ──
  exitCriticalMuted: { bg: "#F5D0D0", text: "#6B1515", border: "#D9A0A0" },
  exitMuted: { bg: "#F9E3E0", text: "#922B21", border: "#E8A0A0" },
  exitSoftMuted: { bg: "#FDE8E2", text: "#B84A38", border: "#F0B8A8" },
  goalMajorMuted: { bg: "#C8EDDA", text: "#084D25", border: "#7CC9A0" },
  goalMuted: { bg: "#D8F2E4", text: "#127040", border: "#90D4AC" },
  goalMinorMuted: { bg: "#E6F7EE", text: "#2D8A56", border: "#B0E0C8" },
  neutralMuted: { bg: "#F7F9FB", text: "#64748B", border: "#E2E8F0" },
  // ── General ──
  bg: "#F0F5FB",
  cardBg: "#FFFFFF",
  arrowMain: "#1B4F8A",
  arrowLoop: "#E67E22",
};

export type ExitSeverity = "critical" | "moderate" | "soft";
export type GoalSeverity = "major" | "moderate" | "minor";

export interface JourneyNode {
  id: string;
  label: string;
  type: "exit" | "goal" | "neutral" | "mainSpine";
  exitSeverity?: ExitSeverity;   // critical=치명적, moderate=중간, soft=경미한
  goalSeverity?: GoalSeverity;   // major=핵심, moderate=중간, minor=초기
  indent?: boolean;
  hasChildren?: boolean;
  groupLabel?: string;
  crossLink?: string;
  children?: JourneyNode[];
}

export interface Stage {
  id: string;
  badge: string;
  name: string;
  nameEn: string;
  nodes: JourneyNode[];
}

export const STAGES: Stage[] = [
  {
    id: "S1", badge: "①", name: "광고", nameEn: "Advertising",
    nodes: [
      // 광고 무반응은 가장 초기 단계 이탈, 비용 낮음
      { id: "ad1", label: "무반응", type: "exit", exitSeverity: "soft" },
      { id: "ad2", label: "클릭", type: "neutral" },
      { id: "ad3", label: "저장/공유 후 재방문", type: "neutral" },
      { id: "ad4", label: "댓글/문의 전환", type: "neutral" },
      { id: "ad5", label: "리타겟팅 재노출", type: "neutral" },
    ],
  },
  {
    id: "S2", badge: "②", name: "유입", nameEn: "Inflow",
    nodes: [
      { id: "ui1", label: "랜딩 진입", type: "neutral" },
      { id: "ui2", label: "유입경로/캠페인 기록", type: "neutral" },
      { id: "ui3", label: "동반신청", type: "neutral" },
      { id: "ui4", label: "추천인/소개인", type: "neutral" },
      // 중복 유입은 실질적 이탈이 아니라 기술적 필터링
      { id: "ui5", label: "중복 유입", type: "exit", exitSeverity: "soft" },
    ],
  },
  {
    id: "S3", badge: "③", name: "조회", nameEn: "Inquiry",
    nodes: [
      // 정보입력 중단: 폼 이탈, 재방문 가능
      { id: "jo1", label: "정보입력 중단", type: "exit", exitSeverity: "soft" },
      // 본인인증 성공: 첫 관문 통과, 아직 초기
      { id: "jo2", label: "본인인증 성공", type: "goal", goalSeverity: "minor" },
      // 본인인증 실패: 구조적 장벽, 재시도 가능하나 마찰 큼
      { id: "jo3", label: "본인인증 실패", type: "exit", exitSeverity: "moderate" },
      // 필수동의 거부: 의도적 거부, 복귀 가능성 낮음
      { id: "jo4", label: "필수동의 거부", type: "exit", exitSeverity: "moderate" },
      // 마케팅 미동의: 서비스 자체 이탈은 아님 (선택적 옵트아웃)
      { id: "jo5", label: "마케팅 미동의", type: "neutral" },
      // 조회 완료: 핵심 데이터 확보, 의미 있는 진전
      { id: "jo6", label: "조회 완료", type: "goal", goalSeverity: "moderate" },
      // 예상 환급금 산출: 고객 관심을 확보하는 핵심 수치
      { id: "jo7", label: "예상 환급금 산출", type: "goal", goalSeverity: "moderate" },
    ],
  },
  {
    id: "S4", badge: "④", name: "상담", nameEn: "Consultation",
    nodes: [
      // [1단계] 담당자 배정 시 고객에게 알림톡 발송 — 첫 접점
      { id: "tm0", label: "담당자 배정 알림톡", type: "neutral" },
      {
        id: "tm1", label: "1차 TM", type: "neutral",
        hasChildren: true, groupLabel: "1차 TM – 기초사실 확인",
        children: [
          { id: "tm1_1", label: "본인여부/이름/거주지/계좌 확인", type: "neutral" },
          { id: "tm1_2", label: "보상팀 매니저 소개 & 절차 설명", type: "neutral" },
          { id: "tm1_3", label: "서비스가치 안내 (약제비/수술비/입원비 등)", type: "neutral" },
          { id: "tm1_4", label: "휴면보험금(12조원) 권리 안내", type: "neutral" },
          { id: "tm1_5", label: "월보험료 7만↑/미납·실효/계약자=납입자 확인", type: "neutral" },
          { id: "tm1_6", label: "최근 3개월 치료·수술/상해치료/약변동/중대질환 확인", type: "neutral" },
          { id: "tm1_7", label: "기존 설계사 관계 확인 (친인척 시 미진행)", type: "neutral" },
          { id: "tm1_8", label: "보험사 예외질환 체크", type: "neutral" },
          { id: "tm1_9", label: "진행불가 → 미청구 부존재 안내 종결", type: "exit", exitSeverity: "moderate" },
          { id: "tm1_10", label: "진행가능 → 추가보상 항목 후킹", type: "goal", goalSeverity: "minor" },
          { id: "tm1_11", label: "심평원 진료이력 언급 → 청구누락 가능성 안내", type: "goal", goalSeverity: "minor" },
        ],
      },
      // [1단계] 심평원 자료 기반 구체적 병력(치료/완치 여부) 확인
      { id: "tm1a", label: "심평원 병력 확인", type: "neutral" },
      {
        id: "tm2", label: "2차 TM", type: "neutral",
        hasChildren: true, groupLabel: "2차 TM – 영업팀 미팅 예약",
        children: [
          { id: "tm2_1", label: "환급 가능 금액 안내 (감액/증액 조정)", type: "neutral" },
          { id: "tm2_2", label: "후불 수수료 10% 안내", type: "neutral" },
          { id: "tm2_3", label: "3년환급금 동반신청자 정보 전달", type: "neutral" },
          { id: "tm2_4", label: "방문 일시·장소 확정 & DB배분전산 입력", type: "goal", goalSeverity: "minor" },
        ],
      },
      { id: "tm3", label: "부재", type: "neutral" },
      // [1단계] 당일 연락 안 되면 문자발송
      { id: "tm3a", label: "문자 발송/재연락", type: "neutral" },
      // [1단계] 하루 경과 → 장기부재, 3일 미수신 → 미팅불가 처리
      { id: "tm4", label: "장기부재 (3일 미수신)", type: "exit", exitSeverity: "moderate" },
      { id: "tm5", label: "재통화 예약", type: "neutral" },
      { id: "tm6", label: "관리대상", type: "neutral" },
      {
        // 진행불가: 구조적 부적격, 최종 종결
        id: "tm7", label: "진행불가", type: "exit", exitSeverity: "critical",
        hasChildren: true, groupLabel: "진행불가 세부사유",
        children: [
          // 구조적/영구적 부적격 → critical
          { id: "tm7a", label: "지방대기/특이사항 종결", type: "exit", exitSeverity: "critical" },
          { id: "tm7b", label: "월보험료 7만 미만", type: "exit", exitSeverity: "critical" },
          { id: "tm7c", label: "보험 미납/실효", type: "exit", exitSeverity: "critical" },
          { id: "tm7d", label: "계약자/납입자 불일치", type: "exit", exitSeverity: "critical" },
          // 시한부 의료 사유 → moderate (시간이 지나면 해소 가능)
          { id: "tm7e", label: "최근 3개월 치료/수술", type: "exit", exitSeverity: "moderate" },
          { id: "tm7f", label: "현재 상해 치료중", type: "exit", exitSeverity: "moderate" },
          // 약 변경은 경미한 사유
          { id: "tm7g", label: "약 용량/종류 변경", type: "exit", exitSeverity: "soft" },
          // 중대질환은 영구적
          { id: "tm7h", label: "중대질환/악화소견", type: "exit", exitSeverity: "critical" },
          // 이해관계 충돌, 해결 어렵지만 의료적 영구성은 아님
          { id: "tm7i", label: "기존 설계사 친인척", type: "exit", exitSeverity: "moderate" },
          { id: "tm7j", label: "예외질환 해당", type: "exit", exitSeverity: "critical" },
        ],
      },
      // 진행가능 전환: 상담→미팅 게이트, 핵심 전환점
      { id: "tm8", label: "진행가능 전환", type: "goal", goalSeverity: "major" },
      // 영업 인계: 중요한 내부 핸드오프
      { id: "tm9", label: "영업 인계", type: "goal", goalSeverity: "moderate" },
      { id: "tm10", label: "민원 방어/클로징", type: "neutral" },
      {
        // 본인취소: 고객 본인 의지에 의한 취소, 진행불가(회사 판단)와 구분
        id: "tm12", label: "본인취소", type: "exit", exitSeverity: "moderate",
        hasChildren: true, groupLabel: "본인취소 사유",
        children: [
          // 경미한 이탈: 재설득/재접근 가능
          { id: "tm12a", label: "단순 변심", type: "exit", exitSeverity: "soft" },
          { id: "tm12b", label: "환급금 소액 (기대 이하)", type: "exit", exitSeverity: "soft" },
          { id: "tm12c", label: "시간/일정 부족", type: "exit", exitSeverity: "soft" },
          // 중간 이탈: 설득 여지 있으나 심리적 저항 큼
          { id: "tm12d", label: "수수료 부담 (10% 거부감)", type: "exit", exitSeverity: "moderate" },
          { id: "tm12e", label: "개인정보 제공 우려", type: "exit", exitSeverity: "moderate" },
          { id: "tm12f", label: "가족/지인 반대", type: "exit", exitSeverity: "moderate" },
          // 치명적 이탈: 구조적 이탈, 복구 극히 어려움
          { id: "tm12g", label: "기존 설계사 관계 유지 희망", type: "exit", exitSeverity: "critical" },
          { id: "tm12h", label: "타사 서비스 이용 결정", type: "exit", exitSeverity: "critical" },
        ],
      },
      // [1단계] 유선콜 중 소개 고객 발생 시 기록 및 관리자 인계
      { id: "tm11", label: "유선 중 소개 발생", type: "goal", goalSeverity: "minor", crossLink: "S2" },
    ],
  },
  {
    id: "S5", badge: "⑤", name: "미팅 사전준비", nameEn: "Pre-Meeting",
    nodes: [
      { id: "mt1", label: "미팅 예약", type: "neutral" },
      // 미팅 준비 단계에서 발생하는 운영 이벤트
      { id: "mt6", label: "긴급 재배정", type: "neutral" },
      {
        // [7단계] 동반/제3자 4가지 케이스
        id: "mt7", label: "동반/제3자 케이스", type: "neutral",
        hasChildren: true, groupLabel: "동반/제3자 유형",
        children: [
          { id: "mt7a", label: "환급서비스 신청 동반자", type: "neutral" },
          { id: "mt7b", label: "미신청 동반자", type: "neutral" },
          { id: "mt7c", label: "미동반 미신청 고객(유선)", type: "neutral" },
          { id: "mt7d", label: "미동반 신청고객(유선)", type: "neutral" },
        ],
      },
      // [2단계] 심평원 기록 + 상담내용 → 보험사 설계매니저 통해 심사
      { id: "mt9", label: "사전 심사/설계 요청", type: "neutral" },
      // [2단계] 실비만 있는 경우 추가 보험가입 제안 → 동의 시 미팅 진행
      { id: "mt10", label: "실비만 보유 안내", type: "neutral" },
      // 미팅 확정: 예약→확정, 중간 마일스톤
      { id: "mt2", label: "미팅 확정", type: "goal", goalSeverity: "minor" },
      {
        // 미팅 취소: 리소스 낭비, 재스케줄링 비용
        id: "mt3", label: "미팅 취소", type: "exit", exitSeverity: "moderate",
        hasChildren: true, groupLabel: "미팅 취소 사유",
        children: [
          // 일정 관련: 재조정 가능
          { id: "mt3a", label: "일정 변경/충돌", type: "exit", exitSeverity: "soft" },
          { id: "mt3b", label: "고객 사정 변경", type: "exit", exitSeverity: "soft" },
          // 지역 불가: 물리적 제약, 해결 어려움
          { id: "mt3c", label: "지역 이동 불가", type: "exit", exitSeverity: "moderate" },
          // 관심 소실: 고객 이탈 의지, 복구 매우 어려움
          { id: "mt3d", label: "관심 소실/무응답", type: "exit", exitSeverity: "critical" },
          // 경쟁사 이동: 완전한 이탈
          { id: "mt3e", label: "타사 진행 결정", type: "exit", exitSeverity: "critical" },
        ],
      },
      {
        // 미팅전 불가: 미팅 자체가 성립 불가
        id: "mt4", label: "미팅전 불가", type: "exit", exitSeverity: "critical",
        hasChildren: true, groupLabel: "미팅전 불가 사유",
        children: [
          { id: "mt4a", label: "건강 상태 변화", type: "exit", exitSeverity: "critical" },
          { id: "mt4b", label: "보험 상태 변경", type: "exit", exitSeverity: "critical" },
          // 주변인 반대: 설득 여지 있음
          { id: "mt4c", label: "가족/지인 반대", type: "exit", exitSeverity: "moderate" },
          // [2단계] 심사결과 인수불가
          { id: "mt4d", label: "심사 부적격 확인(인수불가)", type: "exit", exitSeverity: "critical" },
          // 서류 미비: 보완 가능
          { id: "mt4e", label: "필요 서류 미비", type: "exit", exitSeverity: "soft" },
        ],
      },
      // 노쇼: 담당자 이동 비용 발생, 신뢰 상실
      { id: "mt5", label: "노쇼", type: "exit", exitSeverity: "critical" },
    ],
  },
  {
    id: "S6", badge: "⑥", name: "미팅", nameEn: "Meeting",
    nodes: [
      // ── 미팅 시작 (문서 3단계) ──
      // [3단계] 글로싸인 보험 열람 동의서 — 미팅 시작 후 분석 전 필수 동의
      { id: "mt11", label: "보험 열람 동의(글로싸인)", type: "goal", goalSeverity: "minor" },
      // [3단계] 녹음 시작, 명함 전달, PPT 신뢰 구축, 심평원 자료 상담
      { id: "mt12", label: "미팅 시작(녹음/명함/PPT)", type: "neutral" },
      // ── 기존 보험 분석 (문서 4단계) ──
      // [4단계] 기존 설계 PT → 분위기 조성 → 문제점 지적(갱신형/CI/장기이식 등)
      { id: "mt13", label: "기존 보험 분석 PT", type: "neutral" },
      // ── 보완 설계 제안 (문서 5단계) ──
      // [5단계] 보완 설계 비교 설명 → 담보 강조 → 보험료 효율성 클로징
      { id: "mt14", label: "보완 설계 제안", type: "neutral" },
      {
        // ── 계약 전환 분기 (문서 6단계) ──
        // [6단계] 변동의사 확인 → 계약/거절/청구만/마무리 분기
        id: "mt8", label: "미팅 진행", type: "goal", goalSeverity: "major",
        hasChildren: true, groupLabel: "계약 전환 분기",
        children: [
          // [6단계] 고객 보험 변동의사 확인 — 핵심 의사결정 게이트
          { id: "mt8g", label: "변동의사 확인", type: "neutral" },
          // 계약 진행: 최고 가치 전환
          { id: "mt8a", label: "계약 진행", type: "goal", goalSeverity: "major" },
          // [6단계] 총무팀 수납요청 / 출금 진행
          { id: "mt8h", label: "총무팀 수납/출금 요청", type: "neutral" },
          // [6단계] 이지페이퍼(금소법,비교설명)/완전판매모니터링/글로싸인 대리청구동의서
          { id: "mt8f", label: "필수 서류 서명(청약/동의서)", type: "neutral" },
          // [6단계] 진료기록 열람·사본발급 동의서 + 위임장 자필서명 + 신분증 사본
          { id: "mt8i", label: "서류 징구(진료기록 위임장/신분증)", type: "neutral" },
          // [6단계] 미팅결과보고 방에 성공·실패 사례 공유
          { id: "mt8j", label: "미팅결과 보고", type: "neutral" },
          // [6단계] 서류+신분증 청구팀 관리자 인계 → ⑦청구 연결
          { id: "mt8k", label: "청구팀 인계", type: "goal", goalSeverity: "moderate", crossLink: "S7" },
          // [6단계] 실패사례/신인 → 클로바노트 제출 → 관리자 피드백
          { id: "mt8l", label: "클로바노트 피드백 요청", type: "neutral" },
          { id: "mt8b", label: "계약 보류", type: "neutral" },
        ],
      },
      // 계약 거절: 미팅까지 왔는데 거절, 높은 매몰비용
      {
        id: "mt8c", label: "계약 거절", type: "exit", exitSeverity: "critical",
        hasChildren: true, groupLabel: "거절 후 처리",
        children: [
          // 청구만 진행: 변동의사 없지만 환급 청구는 진행
          { id: "mt8d", label: "청구만 진행 →⑦", type: "goal", goalSeverity: "moderate", crossLink: "S7" },
          // [6단계] 보험 변동의사 없으면 상담 마무리
          { id: "mt8e", label: "상담 마무리", type: "exit", exitSeverity: "moderate" },
        ],
      },
    ],
  },
  {
    id: "S7", badge: "⑦", name: "청구", nameEn: "Claim",
    nodes: [
      { id: "cg1", label: "서류 인수", type: "neutral" },
      { id: "cg2", label: "1차 청구콜", type: "neutral" },
      { id: "cg3", label: "수수료 안내", type: "neutral" },
      { id: "cg4", label: "지급내역서/보험증권 요청", type: "neutral" },
      { id: "cg5", label: "데이터 분석", type: "neutral" },
      // 청구불가 항목: 항목별 필터링 결과이지 고객 이탈이 아님
      { id: "cg6", label: "실손 청구불가 항목", type: "neutral" },
      { id: "cg7", label: "비급여 청구가능 항목", type: "neutral" },
      { id: "cg8", label: "종합 청구가능 항목", type: "neutral" },
      // 미청구 내역 확정: 청구 범위 확정, 의미 있는 중간 단계
      { id: "cg9", label: "미청구 내역 확정", type: "goal", goalSeverity: "moderate" },
      { id: "cg10", label: "서류 발급 위탁", type: "neutral" },
      { id: "cg11", label: "예상 환급금 안내", type: "neutral" },
      // 청구접수: 고객 동의 + 접수 완료, 핵심 전환
      { id: "cg12", label: "고객동의 후 청구접수", type: "goal", goalSeverity: "major" },
      // 서류 누락/발급 지연: 일시적, 보완 가능
      { id: "cg13", label: "서류 누락", type: "exit", exitSeverity: "soft" },
      { id: "cg14", label: "발급 지연", type: "exit", exitSeverity: "soft" },
    ],
  },
  {
    id: "S8", badge: "⑧", name: "환급", nameEn: "Refund",
    nodes: [
      // 지급 완료: 최종 목표 달성!
      { id: "hg1", label: "지급 완료", type: "goal", goalSeverity: "major" },
      // 감액 지급: 금액이 줄었지만 환급이 이루어진 부분 달성
      { id: "hg2", label: "감액 지급", type: "goal", goalSeverity: "minor" },
      {
        // 부지급: 법무법인 대건 소송으로 신규 영업기회 전환 가능
        id: "hg3", label: "부지급", type: "neutral",
        hasChildren: true, groupLabel: "부지급 → 소송 전환 프로세스",
        children: [
          { id: "hg3a", label: "부지급 사유 분석", type: "neutral" },
          { id: "hg3b", label: "법무법인 대건 소송 검토 의뢰", type: "neutral" },
          { id: "hg3c", label: "소송 가능성 판단 (승소 전망)", type: "neutral" },
          { id: "hg3d", label: "고객 소송 동의 & 위임", type: "goal", goalSeverity: "minor" },
          { id: "hg3e", label: "소송 수임 진행", type: "goal", goalSeverity: "moderate" },
          { id: "hg3f", label: "신규 영업기회 전환", type: "goal", goalSeverity: "major" },
        ],
      },
      { id: "hg4", label: "지급지연 추적 (3/5/7일)", type: "neutral" },
      // 수수료 안내: 정산 절차, 중간 단계
      { id: "hg5", label: "수수료 최종 안내", type: "goal", goalSeverity: "minor" },
      {
        id: "hg6", label: "부지급/감액 이의검토", type: "neutral",
        hasChildren: true, groupLabel: "이의검토 → 소송 전환",
        children: [
          { id: "hg6a", label: "이의신청 검토", type: "neutral" },
          { id: "hg6b", label: "법무법인 대건 소송 검토", type: "neutral" },
          { id: "hg6c", label: "소송 전환 시 신규 영업기회", type: "goal", goalSeverity: "moderate" },
        ],
      },
    ],
  },
  {
    id: "S9", badge: "⑨", name: "소개", nameEn: "Referral",
    nodes: [
      { id: "sg1", label: "지인 소개 요청", type: "neutral" },
      { id: "sg2", label: "소개 혜택/수수료 면제 안내", type: "neutral" },
      // 소개 거절: 기존 서비스 완료 후 추가 기회 상실, 경미한 이탈
      { id: "sg3", label: "소개 거절", type: "exit", exitSeverity: "soft" },
      // 소개DB 생성: 새로운 잠재고객 확보
      { id: "sg4", label: "소개DB 생성", type: "goal", goalSeverity: "moderate" },
      { id: "sg5", label: "소개 유입 사전고지", type: "neutral" },
      { id: "sg6", label: "동일 담당자 재배정", type: "neutral" },
      // 재유입 성공: 순환 구조 완성, 최고 가치
      { id: "sg7", label: "재유입 성공", type: "goal", goalSeverity: "major" },
      // 재유입 실패: 순환 끊김, 성장 기회 영구 상실
      { id: "sg8", label: "재유입 실패", type: "exit", exitSeverity: "critical" },
    ],
  },
];

/* ─── Helper: resolve exit/goal color by severity ─── */
export function getExitColor(severity?: ExitSeverity, muted = false) {
  if (muted) {
    switch (severity) {
      case "critical": return COLORS.exitCriticalMuted;
      case "soft": return COLORS.exitSoftMuted;
      default: return COLORS.exitMuted;
    }
  }
  switch (severity) {
    case "critical": return COLORS.exitCritical;
    case "soft": return COLORS.exitSoft;
    default: return COLORS.exit;
  }
}

export function getGoalColor(severity?: GoalSeverity, muted = false) {
  if (muted) {
    switch (severity) {
      case "major": return COLORS.goalMajorMuted;
      case "minor": return COLORS.goalMinorMuted;
      default: return COLORS.goalMuted;
    }
  }
  switch (severity) {
    case "major": return COLORS.goalMajor;
    case "minor": return COLORS.goalMinor;
    default: return COLORS.goal;
  }
}

export function getNodeColor(node: JourneyNode, muted = false, parentNode?: JourneyNode) {
  // Child nodes with their own explicit type (exit/goal) use their own color
  if (node.type === "exit") return getExitColor(node.exitSeverity, muted);
  if (node.type === "goal") return getGoalColor(node.goalSeverity, muted);
  if (node.type === "mainSpine") return COLORS.mainSpine;
  // Neutral child nodes inherit muted color from parent
  if (muted && parentNode) {
    if (parentNode.type === "exit") return getExitColor(parentNode.exitSeverity, true);
    if (parentNode.type === "goal") return getGoalColor(parentNode.goalSeverity, true);
  }
  return muted ? COLORS.neutralMuted : COLORS.neutral;
}