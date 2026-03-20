/* ================================================================
   소개(가족연동 포함) 여정 — 업무 현황 데이터
   REFERRAL_DIRECT_SALES_DATA 기준 (환급 17단계에서 상담·TM 제거)
   ================================================================ */

import type { TaskBoardData } from "./task-data";

/* ─── 반영 포인트 ─── */
export const STAGE_REFLECTED_REFERRAL: string[] = [
    /* S1 */ "광고 유입, 랜딩 첫 진입, 유입경로 추적 집중 / 조회·동의 단계와 분리",
    /* S2 */ "카카오·네이버 간편인증 기반 심평원 조회 / 인증 실패 재시도 / 개인정보 전송 기준 관리",
    /* S3 */ "청구 가능 항목·제외 항목 확인 / 예상 환급액 확인 / 후불 수수료 기준 확인 / 계좌정보·추가정보 입력 / 전자서명 수취 / 청구 신청 완료",
    /* S4 */ "2시간 안에 첫 전화 / 주민번호 유선 인증 및 선심사 / 보상DB·가능DB 미팅 전략 분리 / 빠진 자료 있으면 다음 단계로 못 넘김",
    /* S5 */ "가능DB·보상DB 분기 보상 미팅(정형화 미팅) / 보상담당자 화법 / 동반자 즉시 DB 등록 / 장소별 진행 가이드 / 고연령층 글로싸인 예외 / 현장 APP 연동 보조 / 미팅 종료 직후 Write-back",
    /* S6 */ "팀장 현장 계약 지원 / 승환·청약·서류 지원 / 청구팀 인계 준비",
    /* S7 */ "청구 인계 패키지 접수 / 필수 서류 확인 / 담당자 배정 / 청구 자동화 가능건 우선 처리",
    /* S8 */ "증권 정보 수취 확인 / 실손 정보 입력 / 심평원·홈텍스·건보 데이터 교차 대조 / 기지급 내역 비교·최종 미지급분 확정",
    /* S9 */ "발급표 선전달 → 서류SET 교부 → 완료·폐기 보고의 3단계 운영표 통합 / 발급 지연 자동 알림 / 잔여 서류 폐기 증빙 의무화",
    /* S10 */ "기초자료 취합 / 기지급 대조 / 미청구건 발굴 / 담보 매칭 / 고객 안내 / 보험사 제출",
    /* S11 */ "보상 최종 리포트 / 좋은 케이스 브랜딩 효과 / 예상액↔실지급액 괴리 표준 문구 / 민원 1차 대응",
    /* S12 */ "정산 기준 정리 / 결제 기준 확인 / 후기·불만 확인 / 해결 안 된 불만 다시 확인",
    /* S13 */ "고객별 1회 소개 요청 / 지급 완료 후 48시간 룰 / 가족 연동 / 추천인 코드 저장",
    /* S14 */ "Same-owner 기본 배정 / 소개 전용 우선 큐 / 상담 절차 없이 영업팀 바로 연결 / 3년 환급 영업 구간 합류",
];

/* ─── 보조 구역: 인계 포인트 / 리스크·예외 / 운영지표 ─── */
export interface StageHelperSection {
  handoff?: string;
  risk?: string;
  metric?: string;
}

export const STAGE_HELPER_SECTIONS_REFERRAL: StageHelperSection[] = [
    /* S1 */ {},
    /* S2 */ { risk: "카카오·네이버 인증 실패로 심평원 조회 전 이탈 발생 가능 / 본인 명의 휴대폰 없을 경우 조회 불가 / 만14세 미만 조회 불가 / 고유식별정보 전송 구간 고지 누락 시 민원 직결" },
    /* S3 */ { handoff: "청구 신청 완료·계좌정보·추가정보·전자서명 수취 완료 건만 상담팀 전달 / 청구 신청 완료 상태로 DB 생성", risk: "예상 환급액 오인 가능성 / 지방건 미터치로 인한 접수 누락·기회 손실" },
    /* S4 */ { handoff: "상담팀 자료 받기 / 선콜·선심사 결과 반영 / 미팅 전략 정리 / 다음 단계 준비 완료", risk: "설계 확인 답변 지연 / 첫 전화 안 닿아 장기부재 전환 / 상담팀 자료 빠진 채 인계 / 이동시간·동선 꼬임", metric: "자료 준비 완료율 / 빠진 자료로 못 넘긴 비율 / 2시간 안에 첫 전화 완료율 / 설계 확인 응답 속도" },
    /* S5 */ { risk: "보험 및 보험설계 거부감 / 동반자 반대 / 장소별 진행 편차 / 고연령층 글로싸인 이탈 / 고객 단말 대리 조작 리스크 / 현장 결과 수기 기록 누락", metric: "계약율 / 소개율 / APP 가입·연동 성공률 / 상태값 로그 완결률" },
    /* S6 */ { handoff: "계약 결과·서류 상태 즉시 정리 / 청구서류대행 방 전달 / 청구팀 관리자 인계", risk: "승환 입력·청약 권한 오남용 / 필수 서류 누락 / 초회보험료 미납", metric: "계약 체결률 / 현장 서류 완비율" },
    /* S7 */ { handoff: "청구 인계 패키지 접수 / 필수 서류 확인 / 담당자 배정 / 미완비 건 재요청", risk: "자필서명 누락 / 날짜 공란 / 신분증 화질 불량 / 지급내역서·보험증권 미회수 / 대필 진행 리스크", metric: "접수 완료율 / 보완 재요청률 / 접수→담당자 배정 리드타임 / 진행상황 공유 적시율" },
    /* S8 */ { handoff: "미지급건 분류 / 1차 청구 판단 완료 / 추가 확인 필요 건 다음 단계 전달", risk: "실무자 수기 대조 리드타임 증가 / 계산 오류 / 보장 범위가 애매한 담보 해석 오류 / 기지급 내역과 미지급 내역 혼동", metric: "데이터 분석 및 판단 리드타임 / 미청구건 발굴률 / 청구판단서 자동화 일치율" },
    /* S9 */ { handoff: "발급표 선전달 / 서류SET 교부 / 완료·폐기 보고", risk: "병원별 위임 발급 규정 변동에 따른 발급 반려 / 3일 초과 지연 시 고객 불만 / 위탁업체의 민감정보(잔여 서류SET) 파기 누락", metric: "위탁 발급 리드타임 / 발급 지연(3일 초과) 안내율 / 오작성·잔여 문서 폐기 증빙 회수율" },
    /* S10 */ { risk: "수기 대조에 따른 휴먼 에러 및 리드타임 증가 / 보장 범위가 애매한 담보 해석 오류 / 기지급 내역과 미지급 내역의 혼동 / 보험사별 제출 양식·채널 차이 누락", metric: "자동 판정률 / 관리자 재검수 비율 / 건당 분석 시간 / 보험사 반려율" },
    /* S11 */ { handoff: "보상 최종 리포트 발행 / 좋은 케이스는 브랜딩 메시지 전환 / 괴리 건은 표준 문구 적용", risk: "낮은 실지급액 건은 산출 근거·오차 가능성·소액건 면제 기준 설명이 빠지면 민원으로 확대 / 보험사 알림톡 미통지로 인한 추적 지연 / 감액·부지급 방어 누락", metric: "최종 리포트 발행률 / 브랜딩 전환율 / 민원 사전차단율 / 감액·부지급 설명 완료율" },
    /* S12 */ { handoff: "지급 완료 후 48시간 안에 1회 소개 요청 / 추천인 코드·관계·제3자 동의 저장 / Same-owner 연결 준비", risk: "중복 소개 요청 / 제3자 정보 무단 수집 / 혜택 기준 불일치 / 추천인 정보 누락", metric: "소개 생성률 / 가족 연동률 / 48시간 내 요청 완료율 / 추천인 코드 저장률" },
    /* S13 */ { handoff: "소개 전용 우선 큐 진입 / 상담 절차 없이 기존 담당 영업팀 Same-owner 우선 배정 / 3년 환급 영업 구간으로 바로 합류 / 예외 배정 사유 로그 기록", risk: "기존 담당자 배정 누락 / 광고DB와 혼합 운영 / 제3자 정보 무단 수집 / Same-owner 예외 배정 사유 누락", metric: "소개 재유입률 / 소개DB 미팅률 및 계약률 / Same-owner 유지율 / CAC 절감 효과 / LTV 기여도" },
    /* S14 */ {},
];

export const TASK_DATA_REFERRAL: TaskBoardData = {
  phaseGroups: [
    { label: "채널 유입", color: "#6366F1", span: 3 },
    { label: "미팅·계약", color: "#059669", span: 3 },
    { label: "청구", color: "#D97706", span: 5 },
    { label: "사후관리·재유입", color: "#DC2626", span: 3 },
  ],

  phases: [
    { id: "S1", label: "채널 유입", groupIdx: 0 },
    { id: "S2", label: "조회/인증", groupIdx: 0 },
    { id: "S3", label: "환급금 확인·청구 신청", groupIdx: 0 },
    { id: "S4", label: "사전 분석 및 준비", groupIdx: 1 },
    { id: "S5", label: "미팅 진행 및 진단", groupIdx: 1 },
    { id: "S6", label: "맞춤 계약 및 서류 인계", groupIdx: 1 },
    { id: "S7", label: "청구 접수", groupIdx: 2 },
    { id: "S8", label: "미지급 분석", groupIdx: 2 },
    { id: "S9", label: "서류 발급표", groupIdx: 2 },
    { id: "S10", label: "최종 분석", groupIdx: 2 },
    { id: "S11", label: "청구서 & 지급 확인", groupIdx: 2 },
    { id: "S12", label: "사후관리 및 정산", groupIdx: 3 },
    { id: "S13", label: "소개 생성 / 가족 연동", groupIdx: 3 },
    { id: "S14", label: "소개 재유입 및 성장 루프 완성", groupIdx: 3 },
  ],

  lanes: [
    {
      id: "pe", nameKr: "고객 접점", nameEn: "Physical Evidence", team: "고객 접점", colorId: "pe",
      cells: [
        /* S1 */ { title: "광고 랜딩 페이지", desc: "광고 소재와 연결된 첫 진입 화면 / 서비스 가능성 탐색용 핵심 메시지와 진입 버튼만 노출" },
        /* S2 */ { title: "카카오·네이버 간편인증 및 심평원 조회 화면", desc: "카카오 또는 네이버 간편인증 기반 심평원 데이터 조회 화면 / 인증 진행 상태와 조회 로딩 흐름 노출" },
        /* S3 */ { title: "환급금 확인·청구 신청 화면", desc: "예상 환급액, 청구 가능 항목·제외 항목, 계좌정보 입력, 추가정보 입력, 전자서명 수취, 청구 신청 완료를 단계별로 노출" },
        /* S4 */ { title: "영업담당자 첫 전화 및 담당자 알림톡", desc: "담당자 배정 알림톡과 영업담당자 첫 전화 노출 / 미팅 일시·장소·담당자 정보 확인" },
        /* S5 */ { title: "정형화 PPT / 필수 3종 서류 / 고객 본인 휴대폰", desc: "미청구 12조 후킹 PPT / [위임장·동의서·신분증 사본] 실물 또는 태블릿(글로싸인) / 고객 본인 휴대폰(APP 인증용)" },
        /* S6 */ { title: "이지페이퍼 / 필수 서명 문서", desc: "모바일 청약서 화면, 금소법 비교설명 확인서, 완전판매 확인서 등 필수 서명 문서" },
        /* S7 */ { title: "보험사 팩스 수취", desc: "보험사에서 발송한 지급내역서·보험증권 팩스 수취" },
        /* S8 */ { title: "없음", desc: "이 단계는 청구팀 내부 백오피스에서 진행되는 데이터 분석 구간" },
        /* S9 */ { title: "서류발급 대행 안내 및 위탁 진행표", desc: "고객용 시작·지연 안내 카카오톡 / 고객별 묶음 뒤 지역별(서울은 구 단위, 그 외 지역은 외주업체 기준)로 정리한 서류 발급표와 위탁 진행표 노출" },
        /* S10 */ { title: "청구서 및 보험사 접수증", desc: "원수사별 양식에 맞춘 보험금 청구서 및 팩스·전자문서 송신 완료 화면 노출" },
        /* S11 */ { title: "예상 환급금 안내콜 / 지급 확인 카카오톡", desc: "예상 환급금 안내콜 / 3·5·7일 차 보험금 수령 확인 카카오톡 / 입금 내역 캡처 요청" },
        /* S12 */ { title: "입금 확인 알림톡 / 정산 안내 / 소개 혜택 안내", desc: "입금 확인 알림톡 / 정산 안내(계좌·금액) 카카오톡 / 소개 혜택 안내 이미지 노출" },
        /* S13 */ { title: "소개 요청·가족 연동 안내", desc: "지급 완료 후 48시간 안에 카카오톡 또는 유선콜로 소개 요청 / 가족 연동 안내 / 혜택 기준 안내" },
        /* S14 */ { title: "소개 전용 랜딩·알림톡", desc: "소개 고객 전용 안내 화면 / 추천인 코드 포함 유입 경로 / 기존 담당자 안내 알림톡" },
      ],
      sourceCells: [
        /* S1 */ { isEmpty: true },
        /* S2 */ { isEmpty: true },
        /* S3 */ { isEmpty: true },
        /* S4 */ { isEmpty: true },
        /* S5 */ { isEmpty: true },
        /* S6 */ { isEmpty: true },
        /* S7 */ { isEmpty: true },
        /* S8 */ { isEmpty: true },
        /* S9 */ { isEmpty: true },
        /* S10 */ { isEmpty: true },
        /* S11 */ { isEmpty: true },
        /* S12 */ { isEmpty: true },
        /* S13 */ { isEmpty: true },
        /* S14 */ { isEmpty: true },
      ],
    },

    {
      id: "ca", nameKr: "고객 행동", nameEn: "Customer Action", team: "고객 행동", colorId: "ca",
      cells: [
        /* S1 */ { title: "광고/링크 클릭 후 랜딩 진입", desc: "검색·배너·카카오톡 링크 등으로 랜딩 진입 / 본인인증·조회·동의는 아직 진행하지 않음", tags: ["핵심"] },
        /* S2 */ { title: "카카오·네이버 간편인증 후 심평원 조회", desc: "카카오 또는 네이버 간편인증 완료 후 심평원 데이터 조회 / 실패 시 재시도 또는 재인증" },
        /* S3 */ { title: "청구 가능 항목 확인 후 청구 신청", desc: "청구 가능 항목·제외 항목 확인 / 예상 환급액·후불 수수료 기준·실제 지급액 차이 가능성 인지 / 계좌정보·월보험료·실손보험·직업·지역 입력 / 전자서명 완료 / 청구 신청 완료" },
        /* S4 */ { title: "첫 전화 응답 및 선심사 동의", desc: "알림톡으로 담당자 확인 / 첫 전화에서 미팅 일시 재확인 / 주민번호 인증번호 회신(선심사 동의)" },
        /* S5 */ { title: "분석 경청 및 서류 위임", desc: "휴대폰 인증 동의 / 더바다 APP 가입 및 데이터 스크래핑 동의 / 보장 공백 확인 / 청구 3종 서류 자필 서명" },
        /* S6 */ { title: "맞춤 계약 체결 / 소개 약속", desc: "부족한 담보 보완 계약 수용 및 전자서명 / 보상DB는 지인 소개 약속 진행" },
        /* S7 */ { isEmpty: true },
        /* S8 */ { title: "분석 대기", desc: "1차 청구콜 이후 고객은 본인의 데이터가 분석되고 숨은 환급금이 산출되기를 대기" },
        /* S9 */ { title: "서류 발급 진행 대기", desc: "위탁업체의 의료기록 발급 진행을 대기 / 지연 발생 시 안내 수신 / 발급 완료·폐기 보고 대기" },
        /* S10 */ { title: "보험사 알림톡 수신", desc: "각 보험사로부터 청구 정상 접수 안내 수신" },
        /* S11 */ { title: "최종 청구 동의 및 수령 대기", desc: "최종 예상 환급금 안내 수신 / 청구서 대리 작성 및 안내 번호 변경에 구두 동의 / 지급 완료 시 입금 내역 캡처 전달" },
        /* S12 */ { title: "정산 결제 및 소개 전달", desc: "환급금 입금 내역 캡처 전달 / 정산 수수료 결제 / 만족도에 따라 가족·지인 소개 전달" },
        /* S13 */ { title: "가족·지인 소개 정보 제공", desc: "고객별 1회 요청에 동의하고 가족·지인 연락처·관계·추천인 정보를 전달" },
        /* S14 */ { title: "소개 고객 재유입", desc: "추천인의 신뢰를 바탕으로 전용 링크로 유입 / 일반 광고DB와 다른 우선 경로로 진행 / 상담 절차 없이 영업팀으로 바로 연결" },
      ],
      sourceCells: [
        /* S1 */ { isEmpty: true },
        /* S2 */ { isEmpty: true },
        /* S3 */ { isEmpty: true },
        /* S4 */ { isEmpty: true },
        /* S5 */ { isEmpty: true },
        /* S6 */ { isEmpty: true },
        /* S7 */ { isEmpty: true },
        /* S8 */ { isEmpty: true },
        /* S9 */ { isEmpty: true },
        /* S10 */ { isEmpty: true },
        /* S11 */ { isEmpty: true },
        /* S12 */ { isEmpty: true },
        /* S13 */ { isEmpty: true },
        /* S14 */ { isEmpty: true },
      ],
    },

    {
      id: "sales", nameKr: "영업팀", nameEn: "Sales Team", team: "R:영업", colorId: "sales",
      cells: [
        /* S1 */ { isEmpty: true },
        /* S2 */ { isEmpty: true },
        /* S3 */ { isEmpty: true },
        /* S4 */ { isEmpty: true },
        /* S5 */ { title: "보상 미팅(정형화 미팅)·글로싸인", desc: "보상담당자 관점 설명 / 가능DB·보상DB별 화법 분리 / 글로싸인 동의 절차 일원화 / 거절 대응 코칭 / 현장 APP 연동 보조 / 미팅 종료 직후 Write-back", tags: ["P0"] },
        /* S6 */ { isEmpty: true },
        /* S7 */ { isEmpty: true },
        /* S8 */ { isEmpty: true },
        /* S9 */ { isEmpty: true },
        /* S10 */ { isEmpty: true },
        /* S11 */ { isEmpty: true },
        /* S12 */ { isEmpty: true },
        /* S13 */ { title: "48시간 안 소개 요청", desc: "지급 완료 후 48시간 안에 영업팀이 직접 소개 요청 / 보험 가입 권유 없이 보상 경험 중심으로 가족·지인 연동 제안" },
        /* S14 */ { title: "Same-owner 유지 영업", desc: "기존 담당자 우선 배정 / 상담 절차 없이 영업팀으로 바로 연결 / 3년 환급 본 여정의 영업 구간으로 합류 / 보험 영업 가능 후보군만 빠르게 미팅·계약 연계 / 부재·퇴사 시에만 예외 재배정" },
      ],
      sourceCells: [
        /* S1 */ { notionLinks: [
          { label: "마감 보고·성과 분석", url: "https://www.notion.so/87367306dd264fc7ac4da9f7a42a218b", role: "staff" as const },
        ]},
        /* S2 */ { isEmpty: true },
        /* S3 */ { isEmpty: true },
        /* S4 */ { notionLinks: [
          { label: "DB 수령·유선콜", url: "https://www.notion.so/0b2de1cf498d45b788081c8c12453e45", role: "staff" as const },
          { label: "사전 분석·필터링", url: "https://www.notion.so/587b859fe024452aa9c6dd845f52f3df", role: "staff" as const },
          { label: "일정·DB 최적화", url: "https://www.notion.so/ab6a52ef2333418b92ce1b8fb2078db4", role: "staff" as const },
          { label: "사전 심사·설계 서포트", url: "https://www.notion.so/bcd3d4ed995f4aea85b9d6930abd2c07", role: "staff" as const },
        ]},
        /* S5 */ { notionLinks: [
          { label: "미팅 시작", url: "https://www.notion.so/776d5ccdb52a4ead9f5fab71b56fbf9c", role: "staff" as const },
          { label: "기존 보험 분석", url: "https://www.notion.so/b70d502b8f74442894fbc3e68bb9b4e1", role: "staff" as const },
          { label: "보완 설계·비교 설명", url: "https://www.notion.so/db0ff2683a1f410fa3004d5c4f8fa28c", role: "staff" as const },
          { label: "티어별 실전 코칭", url: "https://www.notion.so/36beb7b25d35471380e93103bbc88ee0", role: "staff" as const },
        ]},
        /* S6 */ { notionLinks: [
          { label: "계약 체결·마무리 보고", url: "https://www.notion.so/9b00a87de15646f7a032b97fffada29c", role: "staff" as const },
          { label: "계약체결 현장 서포트", url: "https://www.notion.so/263233d1a7ed442c9629cc7a04e2e458", role: "staff" as const },
          { label: "클로징 및 청구 인계 (Write-back)", url: "", role: "staff" as const },
        ]},
        /* S7 */ { isEmpty: true },
        /* S8 */ { isEmpty: true },
        /* S9 */ { isEmpty: true },
        /* S10 */ { isEmpty: true },
        /* S11 */ { isEmpty: true },
        /* S12 */ { isEmpty: true },
        /* S13 */ { isEmpty: true },
        /* S14 */ { notionLinks: [
          { label: "48시간 안 소개 요청", url: "", role: "staff" as const },
        ]},
      ],
    },

    {
      id: "claim", nameKr: "청구팀", nameEn: "Claim Team", team: "R:청구", colorId: "claim",
      cells: [
        /* S1 */ { isEmpty: true },
        /* S2 */ { isEmpty: true },
        /* S3 */ { isEmpty: true },
        /* S4 */ { isEmpty: true },
        /* S5 */ { isEmpty: true },
        /* S6 */ { isEmpty: true },
        /* S7 */ { title: "청구팀 접수 및 담당자 배정", desc: "신분증·동의서·위임장·특이사항·지급내역서·보험증권 접수 / 필수 서류 확인 / 담당자 배정 / 구조화 접수 양식 기록" },
        /* S8 */ { title: "미지급 분석 및 청구판단서 작성", desc: "증권 정보 수취 확인 / 실손 정보 입력 / 심평원·홈텍스·건보 데이터 교차 대조 / 기지급 내역 비교 및 최종 미지급분 확정" },
        /* S9 */ { title: "서류 발급 업무위탁", desc: "발급표 선전달 → 서류SET 교부 → 완료·폐기 보고의 3단계 운영표 통합 / 고객별 묶음 뒤 지역별 분류(서울은 구 단위, 그 외 지역은 외주업체 기준) / 방문지 1곳당 서류 3종 준비 기준 운영" },
        /* S10 */ { title: "최종 분석 및 보험사 제출", desc: "기초자료 취합 / 기지급 대조 / 미청구건 발굴 / 담보 매칭 / 고객 안내 / 보험사 제출" },
        /* S11 */ { title: "최종 청구 접수 및 3·5·7일 지급 확인", desc: "예상 환급금 안내 및 대리청구 동의 / 보험사 최종 접수 / 3·5·7일 지급 수동 모니터링 / 부당 감액·부지급 시 방어 및 전문가 연계" },
        /* S12 */ { title: "수수료 정산 및 소개 전환", desc: "지급 확인 및 수수료 정산 / 소액건·소개건 면제 기준 적용 / 부지급·감액 강력 방어 / 지인 소개 수취 및 Same-owner 재배정 연계" },
        /* S13 */ { title: "후속 청구 지원 준비", desc: "추천인 코드·관계·기존 고객 정보를 정리 / 영업 진행 이후 필요한 청구 지원과 후속 접수 연결 준비" },
        /* S14 */ { title: "영업 후 청구 연계 지원", desc: "영업 진행 이후 필요한 보상 이력·청구 지원·후속 접수 연결만 지원 / 소개DB에서 바로 시작하지 않음" },
      ],
      sourceCells: [
        /* S1 */ { notionLinks: [
          { label: "부정기 업무", url: "https://www.notion.so/ea85004350ad401a8ac21e02f88ab5d6", role: "staff" as const },
        ]},
        /* S2 */ { isEmpty: true },
        /* S3 */ { isEmpty: true },
        /* S4 */ { isEmpty: true },
        /* S5 */ { isEmpty: true },
        /* S6 */ { isEmpty: true },
        /* S7 */ { notionLinks: [
          { label: "서류 인수 및 담당자 배정", url: "", role: "staff" as const },
          { label: "인계 서류 1차 검수", url: "", role: "staff" as const },
        ]},
        /* S8 */ { notionLinks: [
          { label: "데이터 분석·미청구건 발굴", url: "https://www.notion.so/7b95b472e9754f918fa0129028213e1d", role: "staff" as const },
          { label: "복잡 케이스 지원 및 교차 검수", url: "https://www.notion.so/73396a3c0fb34bf08d45fcb345b7367a", role: "staff" as const },
        ]},
        /* S9 */ { notionLinks: [
          { label: "발급표 작성 및 고객 안내", url: "https://www.notion.so/dace87cbae62492dace84e5f0efacb23", role: "staff" as const },
          { label: "위탁 전달 및 폐기 감독", url: "https://www.notion.so/d1744e535b9f47c68f6b2f384bfd3421", role: "staff" as const },
        ]},
        /* S10 */ { notionLinks: [
          { label: "OCR 분석 및 청구 접수", url: "https://www.notion.so/6d058d2c8b164fdc80f805afa4830656", role: "staff" as const },
          { label: "복잡 케이스 지원 및 교차 검수", url: "", role: "staff" as const },
        ]},
        /* S11 */ { notionLinks: [
          { label: "최종 검수 및 부지급 방어", url: "", role: "staff" as const },
          { label: "청구 접수 및 3·5·7일 추적", url: "", role: "staff" as const },
        ]},
        /* S12 */ { notionLinks: [
          { label: "정산 및 소개 유도", url: "https://www.notion.so/a80e8cd826624579b0c584020ff9d066", role: "staff" as const },
          { label: "부지급·감액 방어 및 에스컬레이션", url: "", role: "staff" as const },
        ]},
        /* S13 */ { isEmpty: true },
        /* S14 */ { notionLinks: [
          { label: "후속 청구 지원 준비", url: "", role: "staff" as const },
        ]},
      ],
    },

    {
      id: "it", nameKr: "IT 운영", nameEn: "Dev/IT Ops", team: "S:IT", colorId: "it",
      cells: [
        /* S1 */ { title: "유입 경로 및 랜딩 성과 추적", desc: "UTM·referrer·랜딩 URL·소재별 전환 데이터 수집 / 채널 효율과 이후 단계 이탈 추적", tags: ["P0"] },
        /* S2 */ { title: "심평원 데이터 조회 및 연동 처리", desc: "카카오·네이버 인증 이후 심평원 조회 호출 / 응답 상태와 실패 케이스 관리" },
        /* S3 */ { title: "환급금 확인·청구 신청 플로우 처리", desc: "청구 가능 항목 계산 / 청구 제외 항목 분리 / 계좌정보·추가정보 입력 처리 / 전자서명 수취 / 청구 신청 완료 상태 적재" },
        /* S4 */ { title: "빠진 자료 차단 및 상태 연동", desc: "상담팀→영업팀 자료(녹취·심평원·환급예상금·동반자 정보 등) 빠지면 인계 차단 / 배정과 알림톡 발송 단일 전산 통합 / 상태 연동" },
        /* S5 */ { title: "현장 전자서명/동의 일원화", desc: "글로싸인 동의 절차 축소 / APP 연동 로그 기록 / 동반자 신규 DB 즉시 등록 / Write-back 상태값 강제 입력 / 예외적 고객 단말 보조 입력 시 증빙 남김" },
        /* S6 */ { title: "청구 자동화 가능건 활성화", desc: "수취한 전자서명·PDF 자동 작성 / 자동화 가능건부터 우선 처리 / 필수 서류 확인 후 청구팀 알림 발송" },
        /* S7 */ { title: "청구 자동화 가능건 활성화", desc: "수취한 전자서명·PDF 자동 작성 / 자동화 가능건부터 우선 처리 / 구조화 접수 양식·청구팀 알림 발송" },
        /* S8 */ { title: "11단계 필터링 룰 엔진 구동", desc: "결제액과 지급내역서를 대조해 미청구 차액과 해당 병원을 자동 계산" },
        /* S9 */ { title: "단일 접수 마스터 연동", desc: "발급표 전달 / 위탁업체 방문 상태 / 완료·폐기 보고를 단일 접수 마스터에서 실시간 추적 / 고객별·지역별 발급 진행 현황 연동 / 방문지별 서류 3종 자동 생성" },
        /* S10 */ { title: "최종 의료데이터·분석 검수 화면", desc: "발급 단계에서 완료된 OCR 결과를 바탕으로 최종 의료데이터와 분석만 한 화면에서 검수 / 청구판단서·지급내역·담보 매칭 결과를 함께 확인 / 재검수가 필요한 항목만 선별 확인" },
        /* S11 */ { title: "보상 최종 리포트", desc: "보험사별 접수·심사·지급 결과를 최종 리포트로 집계 / 좋은 케이스는 브랜딩 메시지로 전환 / 낮은 실지급액 건은 표준 설명 문구와 연동" },
        /* S12 */ { isEmpty: true },
        /* S13 */ { title: "추천인 코드 저장 및 Same-owner 연결 준비", desc: "추천인 코드·관계·연락처·기존 담당자 정보를 구조화 저장 / 다음 단계 Same-owner 배정을 위한 연결 준비" },
        /* S14 */ { title: "재유입 배정 관리 및 라우팅", desc: "추천인 코드 / 소개 경로 / 가족·지인 구분을 기록하고 기존 담당자에게 자동 배정 / 예외 배정 사유 로그 기록" },
      ],
      sourceCells: [
        /* S1 */ { notionLinks: [
          { label: "인프라·백업·WAF 운영", url: "https://www.notion.so/2806767dc0e348f99ee38d40dd5e29a3", role: "staff" as const },
        ]},
        /* S2 */ { isEmpty: true },
        /* S3 */ { isEmpty: true },
        /* S4 */ { isEmpty: true },
        /* S5 */ { isEmpty: true },
        /* S6 */ { isEmpty: true },
        /* S7 */ { isEmpty: true },
        /* S8 */ { isEmpty: true },
        /* S9 */ { isEmpty: true },
        /* S10 */ { isEmpty: true },
        /* S11 */ { notionLinks: [
          { label: "보험사 접수·지급 상태 수집 자동화", url: "", role: "staff" as const },
        ]},
        /* S12 */ { isEmpty: true },
        /* S13 */ { isEmpty: true },
        /* S14 */ { isEmpty: true },
      ],
    },

    {
      id: "legal", nameKr: "준법 운영", nameEn: "Legal/Compliance", team: "S:준법", colorId: "legal",
      cells: [
        /* S1 */ { isEmpty: true },
        /* S2 */ { title: "본인인증·정보 전송 기준 점검", desc: "고유식별정보·개인정보 처리 적법성 점검 / 인증·전송 구간 고지와 보호 기준 점검" },
        /* S3 */ { title: "금액·신청 고지 문구 점검", desc: "예상 환급액 산출 기준 고지 / 후불 수수료 기준 선제 고지 / 청구 제외 항목 확인 / 실제 지급액 변동 가능성 안내 / 전자서명 수취 고지 / 계좌정보·추가정보 수집 고지 / 마케팅 미동의 고객 영업 차단" },
        /* S4 */ { isEmpty: true },
        /* S5 */ { title: "고객 단말 작성 대행 예외 통제", desc: "고객 단말 대리 조작은 명시적 동의 하 제한적 허용 / 예외 증빙·로그 필수 / 종이 문서 즉시 전자화 또는 현장 파쇄 프로세스 필요", tags: ["Gate"] },
        /* S6 */ { title: "승환 입력·권한 사용 점검", desc: "보상DB 안에서 보험 권유가 섞이지 않게 점검 / 승환계약 허위입력 같은 고위험 관행 관리", tags: ["Gate"] },
        /* S7 */ { isEmpty: true },
        /* S8 */ { title: "청구 판단 기준 점검", desc: "보장 범위가 애매한 담보 해석 기준 / 개인정보 수집 범위 / 계산 로직 검토" },
        /* S9 */ { title: "위탁업체 현장 감사", desc: "고객 신분증이 외부로 반출되는 단계 점검 / 투에이치서비스 개인정보 파기 절차 현장 감사 / 잔여 서류SET 폐기 증빙 관리" },
        /* S10 */ { isEmpty: true },
        /* S11 */ { isEmpty: true },
        /* S12 */ { isEmpty: true },
        /* S13 */ { title: "제3자 정보 제공 동의 점검", desc: "가족·지인 연락처를 받을 때 제3자 정보 제공 동의 스크립트와 로그 점검 / 혜택 기준 안내 문구 점검" },
        /* S14 */ { title: "제3자 정보 및 혜택 기준 점검", desc: "추천인·가족 정보 수집 시 제3자 정보 제공 동의 로그 확인 / 소개 혜택 오남용 점검" },
      ],
      sourceCells: [
        /* S1 */ { notionLinks: [
          { label: "상시 리스크 관리(특별이익·정보 분리)", url: "https://www.notion.so/f231285bbb9d4efd8c812d063e3e4b6b", role: "staff" as const },
          { label: "모니터링·감사(녹취 QA/해피콜/위탁사 점검)", url: "https://www.notion.so/8170afcd53e3433badc69b95f7e1cacd", role: "staff" as const },
          { label: "민원 예방·대응 및 징계 건의", url: "https://www.notion.so/de2f8a960d3642c99016e7c5bbacea28", role: "staff" as const },
          { label: "준법 교육 운영(월 1회)", url: "https://www.notion.so/2fe45f6816ac4ca19ae223b6e00e3cd0", role: "staff" as const },
        ]},
        /* S2 */ { isEmpty: true },
        /* S3 */ { isEmpty: true },
        /* S4 */ { isEmpty: true },
        /* S5 */ { isEmpty: true },
        /* S6 */ { isEmpty: true },
        /* S7 */ { isEmpty: true },
        /* S8 */ { isEmpty: true },
        /* S9 */ { isEmpty: true },
        /* S10 */ { isEmpty: true },
        /* S11 */ { isEmpty: true },
        /* S12 */ { isEmpty: true },
        /* S13 */ { isEmpty: true },
        /* S14 */ { notionLinks: [
          { label: "제3자 정보 제공 동의 점검", url: "", role: "staff" as const },
        ]},
      ],
    },
  ],

  dividers: [
    { afterLaneId: "ca", type: "interaction", label: "고객 ↔ 운영 경계" },
    { afterLaneId: "claim", type: "visibility", label: "서포트 (IT·준법)" },
  ],
};
