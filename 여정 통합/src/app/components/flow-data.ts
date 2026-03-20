/* ================================================================
   플로우차트 전용 데이터
   - columns: 시간 순서대로 배치 (가로 = 시간)
   - 같은 column 내 노드 = 동시간대 (세로 = 동시)
   - edges: 노드 간 모든 파생 가능한 여정 연결
   ================================================================ */

export interface FlowNode {
  id: string;
  label: string;
  type: "main" | "exit" | "goal" | "neutral";
  stage?: string; // 소속 단계 표시
  hasChildren?: boolean;
  groupLabel?: string;
  children?: FlowNode[];
}

export interface FlowColumn {
  id: string;
  label: string;       // 컬럼 헤더
  stageLabel?: string;  // 소속 대단계
  nodes: FlowNode[];
}

export interface FlowEdge {
  from: string;
  to: string;
  type?: "normal" | "loop" | "skip"; // 일반 / 재유입루프 / 단계건너뛰기
}

export const FLOW_COLUMNS: FlowColumn[] = [
  {
    id: "c0", label: "광고 노출", stageLabel: "① 광고",
    nodes: [
      { id: "f-ad", label: "광고 노출", type: "main" },
    ],
  },
  {
    id: "c1", label: "광고 반응", stageLabel: "① 광고",
    nodes: [
      { id: "f-ad-click", label: "클릭", type: "neutral" },
      { id: "f-ad-save", label: "저장/공유", type: "neutral" },
      { id: "f-ad-comment", label: "댓글/문의 전환", type: "neutral" },
      { id: "f-ad-retarget", label: "리타겟팅 재노출", type: "neutral" },
      { id: "f-ad-noresp", label: "무반응", type: "exit" },
    ],
  },
  {
    id: "c2", label: "유입", stageLabel: "② 유입",
    nodes: [
      { id: "f-ui-landing", label: "랜딩 진입", type: "main" },
      { id: "f-ui-campaign", label: "유입경로 기록", type: "neutral" },
      { id: "f-ui-dual", label: "동반신청", type: "neutral" },
      { id: "f-ui-referrer", label: "추천인/소개인", type: "neutral" },
      { id: "f-ui-dup", label: "중복 유입", type: "exit" },
    ],
  },
  {
    id: "c3", label: "정보 입력", stageLabel: "③ 조회",
    nodes: [
      { id: "f-jo-auth", label: "본인인증 시도", type: "neutral" },
      { id: "f-jo-stop", label: "정보입력 중단", type: "exit" },
    ],
  },
  {
    id: "c4", label: "인증 결과", stageLabel: "③ 조회",
    nodes: [
      { id: "f-jo-success", label: "본인인증 성공", type: "goal" },
      { id: "f-jo-fail", label: "본인인증 실패", type: "exit" },
      { id: "f-jo-deny", label: "필수동의 거부", type: "exit" },
      { id: "f-jo-mkt", label: "마케팅 미동의", type: "neutral" },
    ],
  },
  {
    id: "c5", label: "조회 완료", stageLabel: "③ 조회",
    nodes: [
      { id: "f-jo-done", label: "조회 완료", type: "goal" },
      { id: "f-jo-calc", label: "예상 환급금 산출", type: "goal" },
    ],
  },
  {
    id: "c6", label: "1차 상담", stageLabel: "④ 상담",
    nodes: [
      { id: "f-tm-alarm", label: "담당자 알림톡", type: "neutral" },
      {
        id: "f-tm-1st", label: "1차 TM", type: "main",
        hasChildren: true, groupLabel: "1차 TM – 기초사실 확인",
        children: [
          { id: "f-tm-1st-1", label: "본인여부/이름/거주지/계좌 확인", type: "neutral" },
          { id: "f-tm-1st-2", label: "보상팀 매니저 소개 & 절차 설명", type: "neutral" },
          { id: "f-tm-1st-3", label: "서비스가치 안내 (약제비/수술비/입원비 등)", type: "neutral" },
          { id: "f-tm-1st-4", label: "휴면보험금(12조원) 권리 안내", type: "neutral" },
          { id: "f-tm-1st-5", label: "월보험료 7만↑/미납·실효/계약자=납입자 확인", type: "neutral" },
          { id: "f-tm-1st-6", label: "최근 3개월 치료·수술/상해치료/약변동/중대질환 확인", type: "neutral" },
          { id: "f-tm-1st-7", label: "기존 설계사 관계 확인 (친인척 시 미진행)", type: "neutral" },
          { id: "f-tm-1st-8", label: "보험사 예외질환 체크", type: "neutral" },
          { id: "f-tm-1st-9", label: "진행불가 → 미청구 부존재 안내 종결", type: "exit" },
          { id: "f-tm-1st-10", label: "진행가능 → 추가보상 항목 후킹", type: "goal" },
          { id: "f-tm-1st-11", label: "심평원 진료이력 → 청구누락 가능성 안내", type: "goal" },
        ],
      },
      { id: "f-tm-medical", label: "심평원 병력 확인", type: "neutral" },
      { id: "f-tm-absent", label: "부재", type: "neutral" },
      { id: "f-tm-sms", label: "문자 발송/재연락", type: "neutral" },
      { id: "f-tm-manage", label: "관리대상", type: "neutral" },
    ],
  },
  {
    id: "c7", label: "상담 결과", stageLabel: "④ 상담",
    nodes: [
      {
        id: "f-tm-2nd", label: "2차 TM", type: "neutral",
        hasChildren: true, groupLabel: "2차 TM – 영업팀 미팅 예약",
        children: [
          { id: "f-tm-2nd-1", label: "환급 가능 금액 안내 (감액/증액 조정)", type: "neutral" },
          { id: "f-tm-2nd-2", label: "후불 수수료 10% 안내", type: "neutral" },
          { id: "f-tm-2nd-3", label: "3년환급금 동반신청자 정보 전달", type: "neutral" },
          { id: "f-tm-2nd-4", label: "방문 일시·장소 확정 & DB배분전산 입력", type: "goal" },
        ],
      },
      { id: "f-tm-reserve", label: "재통화 예약", type: "neutral" },
      { id: "f-tm-go", label: "진행가능 전환", type: "goal" },
      { id: "f-tm-sales", label: "영업 인계", type: "goal" },
      { id: "f-tm-civil", label: "민원 방어", type: "neutral" },
      { id: "f-tm-longabs", label: "장기부재 (3일 미수신)", type: "exit" },
      { id: "f-tm-refer", label: "유선 중 소개 발생", type: "goal" },
      {
        id: "f-tm-cancel", label: "본인취소", type: "exit",
        hasChildren: true, groupLabel: "본인취소 사유",
        children: [
          { id: "f-tm-cx1", label: "단순 변심", type: "exit" },
          { id: "f-tm-cx2", label: "환급금 소액 (기대 이하)", type: "exit" },
          { id: "f-tm-cx3", label: "시간/일정 부족", type: "exit" },
          { id: "f-tm-cx4", label: "수수료 부담 (10% 거부감)", type: "exit" },
          { id: "f-tm-cx5", label: "개인정보 제공 우려", type: "exit" },
          { id: "f-tm-cx6", label: "가족/지인 반대", type: "exit" },
          { id: "f-tm-cx7", label: "기존 설계사 관계 유지 희망", type: "exit" },
          { id: "f-tm-cx8", label: "타사 서비스 이용 결정", type: "exit" },
        ],
      },
      {
        id: "f-tm-nogo", label: "진행불가", type: "exit",
        hasChildren: true, groupLabel: "진행불가 세부사유",
        children: [
          { id: "f-tm-n1", label: "지방대기/특이사항", type: "exit" },
          { id: "f-tm-n2", label: "월보험료 7만 미만", type: "exit" },
          { id: "f-tm-n3", label: "보험 미납/실효", type: "exit" },
          { id: "f-tm-n4", label: "계약자 불일치", type: "exit" },
          { id: "f-tm-n5", label: "최근3개월 치료", type: "exit" },
          { id: "f-tm-n6", label: "현재 상해 치료중", type: "exit" },
          { id: "f-tm-n7", label: "약 용량 변경", type: "exit" },
          { id: "f-tm-n8", label: "중대질환/악화", type: "exit" },
          { id: "f-tm-n9", label: "기존 설계사 친인척", type: "exit" },
          { id: "f-tm-n10", label: "예외질환 해당", type: "exit" },
        ],
      },
    ],
  },
  {
    id: "c8", label: "미팅 준비", stageLabel: "⑤ 미팅준비",
    nodes: [
      { id: "f-mt-book", label: "미팅 예약", type: "neutral" },
      { id: "f-mt-reassign", label: "긴급 재배정", type: "neutral" },
      {
        id: "f-mt-3rd", label: "동반/제3자", type: "neutral",
        hasChildren: true, groupLabel: "동반/제3자 유형",
        children: [
          { id: "f-mt-3rd-a", label: "환급서비스 신청 동반자", type: "neutral" },
          { id: "f-mt-3rd-b", label: "미신청 동반자", type: "neutral" },
          { id: "f-mt-3rd-c", label: "미동반 미신청(유선)", type: "neutral" },
          { id: "f-mt-3rd-d", label: "미동반 신청고객(유선)", type: "neutral" },
        ],
      },
      { id: "f-mt-screen", label: "사전 심사/설계", type: "neutral" },
      { id: "f-mt-basiconly", label: "실비만 보유 안내", type: "neutral" },
    ],
  },
  {
    id: "c9", label: "미팅 확정/이탈", stageLabel: "⑤ 미팅준비",
    nodes: [
      { id: "f-mt-confirm", label: "미팅 확정", type: "goal" },
      {
        id: "f-mt-cancel", label: "미팅 취소", type: "exit",
        hasChildren: true, groupLabel: "미팅 취소 사유",
        children: [
          { id: "f-mt-cx1", label: "일정 변경/충돌", type: "exit" },
          { id: "f-mt-cx2", label: "고객 사정 변경", type: "exit" },
          { id: "f-mt-cx3", label: "지역 이동 불가", type: "exit" },
          { id: "f-mt-cx4", label: "관심 소실/무응답", type: "exit" },
          { id: "f-mt-cx5", label: "타사 진행 결정", type: "exit" },
        ],
      },
      {
        id: "f-mt-prefail", label: "미팅전 불가", type: "exit",
        hasChildren: true, groupLabel: "미팅전 불가 사유",
        children: [
          { id: "f-mt-pf1", label: "건강 상태 변화", type: "exit" },
          { id: "f-mt-pf2", label: "보험 상태 변경", type: "exit" },
          { id: "f-mt-pf3", label: "가족/지인 반대", type: "exit" },
          { id: "f-mt-pf4", label: "심사 부적격(인수불가)", type: "exit" },
          { id: "f-mt-pf5", label: "필요 서류 미비", type: "exit" },
        ],
      },
      { id: "f-mt-noshow", label: "노쇼", type: "exit" },
    ],
  },
  {
    id: "c9b", label: "미팅 진행", stageLabel: "⑥ 미팅",
    nodes: [
      { id: "f-mt-consent", label: "보험열람 동의(글로싸인)", type: "goal" },
      { id: "f-mt-start", label: "미팅 시작(녹음/명함/PPT)", type: "neutral" },
      { id: "f-mt-analysis", label: "기존 보험 분석 PT", type: "neutral" },
      { id: "f-mt-proposal", label: "보완 설계 제안", type: "neutral" },
    ],
  },
  {
    id: "c9c", label: "계약 전환 분기", stageLabel: "⑥ 미팅",
    nodes: [
      { id: "f-mt-decision", label: "변동의사 확인", type: "neutral" },
      {
        id: "f-mt-gocontract", label: "계약 진행", type: "goal",
        hasChildren: true, groupLabel: "계약 체결 절차",
        children: [
          { id: "f-mt-payment", label: "총무팀 수납/출금 요청", type: "neutral" },
          { id: "f-mt-docs", label: "필수 서류 서명(청약/동의서)", type: "neutral" },
          { id: "f-mt-collect", label: "서류 징구(위임장/신분증)", type: "neutral" },
        ],
      },
      { id: "f-mt-report", label: "미팅결과 보고", type: "neutral" },
      { id: "f-mt-handoff", label: "청구팀 인계", type: "goal" },
      { id: "f-mt-clova", label: "클로바노트 피드백 요청", type: "neutral" },
      { id: "f-mt-hold", label: "계약 보류", type: "neutral" },
      { id: "f-mt-reject", label: "계약 거절", type: "exit" },
      { id: "f-mt-claimonly", label: "청구만 진행", type: "goal" },
      { id: "f-mt-close", label: "상담 마무리", type: "exit" },
    ],
  },
  {
    id: "c11", label: "청구 준비", stageLabel: "⑦ 청구",
    nodes: [
      { id: "f-cg-doc", label: "서류 인수", type: "neutral" },
      { id: "f-cg-1call", label: "1차 청구콜", type: "neutral" },
      { id: "f-cg-fee", label: "수수료 안내", type: "neutral" },
      { id: "f-cg-req", label: "증권/내역서 요청", type: "neutral" },
    ],
  },
  {
    id: "c12", label: "청구 분석", stageLabel: "⑦ 청구",
    nodes: [
      { id: "f-cg-analysis", label: "데이터 분석", type: "neutral" },
      { id: "f-cg-nonclaim", label: "실손 청구불가", type: "neutral" },
      { id: "f-cg-nonpay", label: "비급여 청구가능", type: "neutral" },
      { id: "f-cg-total", label: "종합 청구가능", type: "neutral" },
    ],
  },
  {
    id: "c13", label: "청구 접수", stageLabel: "⑦ 청구",
    nodes: [
      { id: "f-cg-confirm", label: "미청구 내역 확정", type: "goal" },
      { id: "f-cg-issue", label: "서류 발급 위탁", type: "neutral" },
      { id: "f-cg-estimate", label: "예상 환급금 안내", type: "neutral" },
      { id: "f-cg-submit", label: "고객동의 청구접수", type: "goal" },
      { id: "f-cg-miss", label: "서류 누락", type: "exit" },
      { id: "f-cg-delay", label: "발급 지연", type: "exit" },
    ],
  },
  {
    id: "c14", label: "환급 결과", stageLabel: "⑧ 환급",
    nodes: [
      { id: "f-hg-paid", label: "지급 완료", type: "goal" },
      { id: "f-hg-reduced", label: "감액 지급", type: "goal" },
      {
        id: "f-hg-denied", label: "부지급", type: "neutral",
        hasChildren: true, groupLabel: "부지급 → 소송 전환 프로세스",
        children: [
          { id: "f-hg-d1", label: "부지급 사유 분석", type: "neutral" },
          { id: "f-hg-d2", label: "법무법인 대건 소송 검토 의뢰", type: "neutral" },
          { id: "f-hg-d3", label: "소송 가능성 판단 (승소 전망)", type: "neutral" },
          { id: "f-hg-d4", label: "고객 소송 동의 & 위임", type: "goal" },
          { id: "f-hg-d5", label: "소송 수임 진행", type: "goal" },
          { id: "f-hg-d6", label: "신규 영업기회 전환", type: "goal" },
        ],
      },
      { id: "f-hg-track", label: "지급지연 추적", type: "neutral" },
    ],
  },
  {
    id: "c15", label: "환급 후처리", stageLabel: "⑧ 환급",
    nodes: [
      { id: "f-hg-finalfee", label: "수수료 최종 안내", type: "goal" },
      {
        id: "f-hg-dispute", label: "부지급/감액 이의검토", type: "neutral",
        hasChildren: true, groupLabel: "이의검토 → 소송 전환",
        children: [
          { id: "f-hg-dp1", label: "이의신청 검토", type: "neutral" },
          { id: "f-hg-dp2", label: "법무법인 대건 소송 검토", type: "neutral" },
          { id: "f-hg-dp3", label: "소송 전환 시 신규 영업기회", type: "goal" },
        ],
      },
    ],
  },
  {
    id: "c16", label: "소개 요청", stageLabel: "⑨ 소개",
    nodes: [
      { id: "f-sg-ask", label: "지인 소개 요청", type: "neutral" },
      { id: "f-sg-benefit", label: "소개 혜택 안내", type: "neutral" },
    ],
  },
  {
    id: "c17", label: "소개 결과", stageLabel: "⑨ 소개",
    nodes: [
      { id: "f-sg-db", label: "소개DB 생성", type: "goal" },
      { id: "f-sg-pre", label: "소개 유입 사전고지", type: "neutral" },
      { id: "f-sg-same", label: "동일 담당자 재배정", type: "neutral" },
      { id: "f-sg-ok", label: "재유입 성공 →②", type: "goal" },
      { id: "f-sg-refuse", label: "소개 거절", type: "exit" },
      { id: "f-sg-fail", label: "재유입 실패", type: "exit" },
    ],
  },
];

export const FLOW_EDGES: FlowEdge[] = [
  // ── ① 광고 노출 → 반응 ──
  { from: "f-ad", to: "f-ad-click" },
  { from: "f-ad", to: "f-ad-save" },
  { from: "f-ad", to: "f-ad-comment" },
  { from: "f-ad", to: "f-ad-retarget" },
  { from: "f-ad", to: "f-ad-noresp" },

  // 광고 반응 → 유입
  { from: "f-ad-click", to: "f-ui-landing" },
  { from: "f-ad-save", to: "f-ui-landing" },
  { from: "f-ad-comment", to: "f-ui-landing" },
  { from: "f-ad-retarget", to: "f-ad", type: "loop" },

  // ── ② 유입 ──
  { from: "f-ui-landing", to: "f-ui-campaign" },
  { from: "f-ui-landing", to: "f-ui-dual" },
  { from: "f-ui-landing", to: "f-ui-referrer" },
  { from: "f-ui-landing", to: "f-ui-dup" },

  // 유입 → 조회
  { from: "f-ui-campaign", to: "f-jo-auth" },
  { from: "f-ui-campaign", to: "f-jo-stop" },
  { from: "f-ui-dual", to: "f-jo-auth" },
  { from: "f-ui-referrer", to: "f-jo-auth" },

  // ── ③ 조회: 인증 ──
  { from: "f-jo-auth", to: "f-jo-success" },
  { from: "f-jo-auth", to: "f-jo-fail" },
  { from: "f-jo-auth", to: "f-jo-deny" },
  { from: "f-jo-auth", to: "f-jo-mkt" },

  // 조회 결과 → 완료
  { from: "f-jo-success", to: "f-jo-done" },
  { from: "f-jo-done", to: "f-jo-calc" },

  // ── ③→④ 조회완료 → 상담 ──
  { from: "f-jo-calc", to: "f-tm-alarm" },
  { from: "f-tm-alarm", to: "f-tm-1st" },
  { from: "f-jo-calc", to: "f-tm-absent" },
  { from: "f-jo-calc", to: "f-tm-manage" },

  // ── ④ 상담 1차 → 결과 ──
  { from: "f-tm-1st", to: "f-tm-medical" },
  { from: "f-tm-medical", to: "f-tm-2nd" },
  { from: "f-tm-medical", to: "f-tm-go" },
  { from: "f-tm-medical", to: "f-tm-nogo" },
  { from: "f-tm-1st", to: "f-tm-civil" },
  { from: "f-tm-1st", to: "f-tm-refer" },
  { from: "f-tm-absent", to: "f-tm-sms" },
  { from: "f-tm-sms", to: "f-tm-reserve" },
  { from: "f-tm-sms", to: "f-tm-longabs" },
  { from: "f-tm-2nd", to: "f-tm-go" },
  { from: "f-tm-2nd", to: "f-tm-nogo" },
  { from: "f-tm-2nd", to: "f-tm-sales" },
  { from: "f-tm-2nd", to: "f-tm-refer" },
  // 본인취소: 1차/2차 TM 어느 시점에서든 고객이 직접 취소 가능
  { from: "f-tm-1st", to: "f-tm-cancel" },
  { from: "f-tm-2nd", to: "f-tm-cancel" },
  { from: "f-tm-reserve", to: "f-tm-1st", type: "loop" },
  { from: "f-tm-manage", to: "f-tm-1st", type: "loop" },

  // 유선 중 소개 → 유입 재순환
  { from: "f-tm-refer", to: "f-ui-landing", type: "loop" },

  // 진행불가 세부사유는 하위항목으로 포함 (별도 엣지 불필요)

  // ── ④→⑤ 진행가능 → 미팅 ──
  { from: "f-tm-go", to: "f-mt-book" },
  { from: "f-tm-go", to: "f-mt-reassign" },
  { from: "f-tm-go", to: "f-mt-3rd" },
  { from: "f-tm-sales", to: "f-mt-book" },

  // ── ⑤ 미팅 준비 → 확정 ──
  { from: "f-mt-book", to: "f-mt-screen" },
  { from: "f-mt-screen", to: "f-mt-basiconly" },
  { from: "f-mt-screen", to: "f-mt-confirm" },
  { from: "f-mt-screen", to: "f-mt-prefail" },
  { from: "f-mt-basiconly", to: "f-mt-confirm" },
  { from: "f-mt-book", to: "f-mt-cancel" },
  { from: "f-mt-reassign", to: "f-mt-confirm" },
  { from: "f-mt-3rd", to: "f-mt-confirm" },

  // 미팅 확정 → 보험열람동의 → 미팅 진행/노쇼
  { from: "f-mt-confirm", to: "f-mt-consent" },
  { from: "f-mt-confirm", to: "f-mt-noshow" },

  // ── 미팅 진행 흐름 (3→4→5단계) ──
  { from: "f-mt-consent", to: "f-mt-start" },
  { from: "f-mt-start", to: "f-mt-analysis" },
  { from: "f-mt-analysis", to: "f-mt-proposal" },
  { from: "f-mt-proposal", to: "f-mt-decision" },

  // ── 계약 전환 분기 (6단계) ──
  // 변동의사 있음 → 계약 진행
  { from: "f-mt-decision", to: "f-mt-gocontract" },
  { from: "f-mt-gocontract", to: "f-mt-payment" },
  { from: "f-mt-payment", to: "f-mt-docs" },
  { from: "f-mt-docs", to: "f-mt-collect" },
  { from: "f-mt-collect", to: "f-mt-report" },
  { from: "f-mt-report", to: "f-mt-handoff" },
  // 변동의사 없음 → 거절 / 보류
  { from: "f-mt-decision", to: "f-mt-reject" },
  { from: "f-mt-decision", to: "f-mt-hold" },
  // 거절 후 → 청구만 진행 / 상담 마무리
  { from: "f-mt-reject", to: "f-mt-claimonly" },
  { from: "f-mt-reject", to: "f-mt-close" },
  // 실패사례 → 클로바노트 피드백
  { from: "f-mt-reject", to: "f-mt-clova" },
  { from: "f-mt-close", to: "f-mt-clova" },
  { from: "f-mt-report", to: "f-mt-clova" },

  // 청구팀 인계 / 청구만 진행 → ⑥ 청구
  { from: "f-mt-handoff", to: "f-cg-doc" },
  { from: "f-mt-claimonly", to: "f-cg-doc", type: "skip" },
  { from: "f-mt-hold", to: "f-mt-book", type: "loop" },

  // ── ⑥ 청구 준비 → 분석 ──
  { from: "f-cg-doc", to: "f-cg-1call" },
  { from: "f-cg-1call", to: "f-cg-fee" },
  { from: "f-cg-1call", to: "f-cg-req" },
  { from: "f-cg-fee", to: "f-cg-analysis" },
  { from: "f-cg-req", to: "f-cg-analysis" },

  // 분석 → 결과
  { from: "f-cg-analysis", to: "f-cg-nonclaim" },
  { from: "f-cg-analysis", to: "f-cg-nonpay" },
  { from: "f-cg-analysis", to: "f-cg-total" },

  // 청구가능 → 접수
  { from: "f-cg-nonpay", to: "f-cg-confirm" },
  { from: "f-cg-total", to: "f-cg-confirm" },
  { from: "f-cg-confirm", to: "f-cg-issue" },
  { from: "f-cg-confirm", to: "f-cg-estimate" },
  { from: "f-cg-issue", to: "f-cg-submit" },
  { from: "f-cg-issue", to: "f-cg-miss" },
  { from: "f-cg-issue", to: "f-cg-delay" },
  { from: "f-cg-estimate", to: "f-cg-submit" },

  // ── ⑥→⑦ 청구접수 → 환급 ──
  { from: "f-cg-submit", to: "f-hg-paid" },
  { from: "f-cg-submit", to: "f-hg-reduced" },
  { from: "f-cg-submit", to: "f-hg-denied" },
  { from: "f-cg-submit", to: "f-hg-track" },

  // 지급지연 → 재확인
  { from: "f-hg-track", to: "f-hg-paid" },
  { from: "f-hg-track", to: "f-hg-reduced" },
  { from: "f-hg-track", to: "f-hg-denied" },

  // ── ⑦ 환급 후처리 ──
  { from: "f-hg-paid", to: "f-hg-finalfee" },
  { from: "f-hg-reduced", to: "f-hg-finalfee" },
  { from: "f-hg-reduced", to: "f-hg-dispute" },
  { from: "f-hg-denied", to: "f-hg-dispute" },

  // ── ⑦→⑧ 환급완료 → 소개 ──
  { from: "f-hg-finalfee", to: "f-sg-ask" },
  { from: "f-hg-finalfee", to: "f-sg-benefit" },

  // ── ⑧ 소개 → 결과 ──
  { from: "f-sg-ask", to: "f-sg-db" },
  { from: "f-sg-ask", to: "f-sg-refuse" },
  { from: "f-sg-benefit", to: "f-sg-db" },
  { from: "f-sg-db", to: "f-sg-pre" },
  { from: "f-sg-db", to: "f-sg-same" },
  { from: "f-sg-pre", to: "f-sg-ok" },
  { from: "f-sg-pre", to: "f-sg-fail" },
  { from: "f-sg-same", to: "f-sg-ok" },

  // 재유입 루프
  { from: "f-sg-ok", to: "f-ui-landing", type: "loop" },
];

/* ─── 단계별 색상 매핑 ─── */
export const STAGE_COLORS: Record<string, string> = {
  "① 광고": "#6366F1",
  "② 유입": "#2563EB",
  "③ 조회": "#0891B2",
  "④ 상담": "#059669",
  "⑤ 미팅준비": "#CA8A04",
  "⑥ 미팅": "#D97706",
  "⑦ 청구": "#DC2626",
  "⑧ 환급": "#7C3AED",
  "⑨ 소개": "#DB2777",
};