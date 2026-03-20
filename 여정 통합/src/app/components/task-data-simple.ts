/* ================================================================
   간편청구 여정 — 업무 현황 데이터
   EASY_CLAIM_VARIANT_BASE 9단계 기준
   ================================================================ */

import type { TaskBoardData } from "./task-data";

/* ─── 반영 포인트 ─── */
export const STAGE_REFLECTED_SIMPLE: string[] = [
    /* S1 */ "간편청구 시작 / 본인·가족 선택 / 서류 유무 확인 / 기본 정보 입력",
    /* S2 */ "본인확인 / A·B·C-1·C-2·D-1·D-2 6개 케이스 확인 / 가족 보험정보 확보 필요 여부 확인",
    /* S3 */ "1차 청구콜 / 직접 제출 또는 서류 대행 후 확보 / 지급내역·보험증권 확보",
    /* S4 */ "확보 자료 기준 1차 정밀 분석 / 기지급 제외 / 청구 가능 항목 정리",
    /* S5 */ "예상 환급금 안내 / 고객 동의 확보 / 청구 확정",
    /* S6 */ "보험사 제출 / 접수 상태 저장",
    /* S7 */ "3·5·7일 지급 추적 / 지급 결과 안내 / 결과 리포트",
    /* S8 */ "놓친 담보 찾기 / 후속 상담 후보 생성",
    /* S9 */ "가족 연결 / 소개 확장 / 재청구 후보 관리",
];

/* ─── 보조 구역: 인계 포인트 / 리스크·예외 / 운영지표 ─── */
export interface StageHelperSection {
  handoff?: string;
  risk?: string;
  metric?: string;
}

export const STAGE_HELPER_SECTIONS_SIMPLE: StageHelperSection[] = [
    /* S1 */ { handoff: "청구 케이스 생성 / 본인·가족 / 서류 유무 태깅", risk: "초기 입력 누락 / 접수 중 이탈 / 가족청구 주체 오인", metric: "접수 완료율 / 초기 이탈률" },
    /* S2 */ { handoff: "A 본인+서류 있음 / B 본인+서류 없음 / C-1 가족+서류 있음+보험정보 있음 / C-2 가족+서류 있음+보험정보 없음 / D-1 가족+서류 없음+보험정보 있음 / D-2 가족+서류 없음+보험정보 없음 확인 / 청구팀 접수 판단 / 영업의 가족 보험정보 확보 진행", risk: "가족 보험정보 미확보 / 본인확인 실패 / 잘못된 케이스 분기", metric: "본인확인 완료율 / 가족 보험정보 확보율 / 분기 정확도" },
    /* S3 */ { handoff: "1차 청구콜 완료 / 직접 제출 또는 서류 대행 후 확보 확정 / 지급내역·보험증권 확보 시작", risk: "가족 보험정보 미확보 / 서류 대행 지연 / 지급내역 미회수", metric: "1차 청구콜 완료율 / 서류 확보율 / 지급내역 회수율" },
    /* S4 */ { handoff: "확보 자료 기준 분석 완료 / 기지급 제외 / 청구 가능 항목 1차 정리", risk: "기지급 제외 누락 / 코드 해석 오류 / 담보 매칭 누락", metric: "1차 분석 완료율 / 재검수 비율 / 청구 가능 항목 정리율" },
    /* S5 */ { handoff: "예상 환급금 안내 / 청구 동의 확보 / 청구 확정", risk: "청구 동의 누락 / 환급금 설명 오류 / 청구 확정 지연", metric: "청구 확정률 / 고객 동의 확보율 / 안내 완료율" },
    /* S6 */ { handoff: "보험사 제출 / 접수 상태 저장", risk: "보험사 채널별 접수 오류 / 제출 서류 누락 / 접수 상태 저장 누락", metric: "보험사 제출 완료율 / 접수 오류율 / 접수 상태 저장률" },
    /* S7 */ { handoff: "지급 완료 처리 / 결과 리포트 발송 / 보장 공백 분석 준비", risk: "지급 지연 / 알림 미수신 / 추가 서류 요청 누락", metric: "3·5·7일 지급 확인율 / 결과 리포트 발송률 / 지급 지연율" },
    /* S8 */ { handoff: "보장 공백 설명 / 후속 상담 후보 생성 / 다음 단계 전환", risk: "보장 공백 설명 실패 / 후속 전환 누락 / 추가 발굴 결과 미전달", metric: "보장 공백 발견율 / 후속 상담 전환율 / 추가 발굴 금액" },
    /* S9 */ { handoff: "가족 연결 / 소개 코드 생성 / 재청구 후보 장기 관리", risk: "가족·소개 정보 누락 / 후속 연결 누락 / 재청구 후보 관리 실패", metric: "가족 연결률 / 소개 확장률 / 재청구 전환율" },
];

export const TASK_DATA_SIMPLE: TaskBoardData = {
  phaseGroups: [
    { label: "접수·분기", color: "#6366F1", span: 2 },
    { label: "1차 콜·분석", color: "#059669", span: 2 },
    { label: "청구·지급", color: "#D97706", span: 2 },
    { label: "결과·전환", color: "#DC2626", span: 2 },
    { label: "리텐션 확장", color: "#7C3AED", span: 1 },
  ],

  phases: [
    { id: "S1", label: "접수 시작", groupIdx: 0 },
    { id: "S2", label: "초기 분기·본인확인", groupIdx: 0 },
    { id: "S3", label: "1차 청구콜·서류 확보", groupIdx: 1 },
    { id: "S4", label: "1차 정밀 분석", groupIdx: 1 },
    { id: "S5", label: "고객 안내·청구 확정", groupIdx: 2 },
    { id: "S6", label: "보험사 접수", groupIdx: 2 },
    { id: "S7", label: "지급 추적·결과 안내", groupIdx: 3 },
    { id: "S8", label: "보장 공백 탐지", groupIdx: 3 },
    { id: "S9", label: "리텐션·가족·소개 확장", groupIdx: 4 },
  ],

  lanes: [
    {
      id: "pe", nameKr: "고객 접점", nameEn: "Physical Evidence", team: "고객 접점", colorId: "pe",
      cells: [
        /* S1 */ { title: "간편청구 시작 화면", desc: "본인·가족 선택, 진료정보 입력, 서류 업로드, 전자서명 시작" },
        /* S2 */ { title: "본인확인·가족 정보 확인 화면", desc: "본인확인, 본인·가족 여부, 서류 유무, 가족 보험정보 확보 여부를 함께 확인하는 분기 화면" },
        /* S3 */ { title: "1차 청구콜 및 서류 확보 안내", desc: "1차 청구콜, 지급내역·보험증권 확인, 직접 제출 또는 서류 대행 안내" },
        /* S4 */ { title: "1차 정밀 분석 안내", desc: "확보된 자료를 기준으로 1차 정밀 분석이 진행되는 안내 화면" },
        /* S5 */ { title: "예상 환급금 안내 및 청구 확정", desc: "예상 환급금 안내와 청구 동의, 최종 청구 확정 화면" },
        /* S6 */ { title: "보험사 접수 진행 화면", desc: "보험사별 접수 진행 상태와 제출 완료 흐름 안내" },
        /* S7 */ { title: "지급 상태 안내 및 결과 리포트", desc: "3·5·7일 지급 추적 메시지와 지급 결과 리포트" },
        /* S8 */ { title: "보장 공백 안내", desc: "놓친 담보와 후속 상담 가능성을 안내" },
        /* S9 */ { title: "가족·소개 연결 안내", desc: "가족 연결과 소개 확장 제안" },
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
      ],
    },

    {
      id: "ca", nameKr: "고객 행동", nameEn: "Customer Action", team: "고객 행동", colorId: "ca",
      cells: [
        /* S1 */ { title: "접수 정보 입력", desc: "본인 또는 가족을 선택하고 진료정보, 서류, 전자서명을 입력" },
        /* S2 */ { title: "본인확인 및 분기 진행", desc: "본인확인을 완료하고 6개 케이스로 분기 진행: A 본인+서류 있음 / B 본인+서류 없음 / C-1 가족+서류 있음+보험정보 있음 / C-2 가족+서류 있음+보험정보 없음 / D-1 가족+서류 없음+보험정보 있음 / D-2 가족+서류 없음+보험정보 없음" },
        /* S3 */ { title: "1차 청구콜 응답 및 자료 확보", desc: "1차 청구콜에 응답하고 지급내역·보험증권·추가 서류를 직접 제출하거나 서류 대행에 동의" },
        /* S4 */ { title: "분석 결과 대기", desc: "1차 정밀 분석이 완료되어 청구 가능 항목이 정리되기를 대기" },
        /* S5 */ { title: "예상 환급금 확인 및 청구 확정", desc: "예상 환급금 안내를 듣고 청구 진행에 동의" },
        /* S6 */ { title: "보험사 접수 대기", desc: "보험사 접수 진행 상태를 확인하며 결과를 기다림" },
        /* S7 */ { title: "지급 결과 확인", desc: "지급 여부와 결과 안내를 확인" },
        /* S8 */ { title: "보장 공백 확인", desc: "놓친 담보와 추가 상담 가능 여부를 확인" },
        /* S9 */ { title: "가족·소개 연동 결정", desc: "가족 연결이나 소개 여부를 결정" },
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
      ],
    },

    {
      id: "sales", nameKr: "영업팀", nameEn: "Sales Team", team: "R:영업", colorId: "sales",
      cells: [
        /* S1 */ { title: "간편청구 시작 안내", desc: "기존 고객에게 간편청구 시작을 안내하고 접수를 유도" },
        /* S2 */ { title: "가족 보험정보 확보 확인", desc: "가족청구 케이스(C-2, D-2)에서 가족 보험정보 확보 가능 여부와 추가 동의 필요성을 직접 확인" },
        /* S3 */ { title: "1차 청구콜 및 자료 확보 안내", desc: "1차 청구콜로 서류·지급내역·보험정보 확보를 진행하고, 서류가 없으면 서류 대행 후 확보 경로를 안내" },
        /* S4 */ { title: "분석 결과 설명 준비", desc: "1차 정밀 분석 결과를 고객에게 설명하고 다음 동의를 받을 준비" },
        /* S5 */ { title: "예상 환급금 안내 및 청구 확정", desc: "예상 환급금 안내와 청구 동의를 확인" },
        /* S6 */ { title: "보험사 접수 진행 안내", desc: "보험사 접수 진행 상황을 고객에게 설명" },
        /* S7 */ { title: "지급 안내 및 결과 설명", desc: "지급 추적 과정과 결과를 고객에게 설명" },
        /* S8 */ { title: "보장 공백 설명 및 후속 제안", desc: "놓친 담보와 후속 상담 가능성을 제안" },
        /* S9 */ { title: "가족·소개 확장 제안", desc: "가족 연결과 소개 확장을 제안" },
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
      ],
    },

    {
      id: "claim", nameKr: "청구팀", nameEn: "Claim Team", team: "R:청구", colorId: "claim",
      cells: [
        /* S1 */ { isEmpty: true },
        /* S2 */ { title: "6개 케이스 확인 및 접수 판단", desc: "A 본인+서류 있음 / B 본인+서류 없음 / C-1 가족+서류 있음+보험정보 있음 / C-2 가족+서류 있음+보험정보 없음 / D-1 가족+서류 없음+보험정보 있음 / D-2 가족+서류 없음+보험정보 없음으로 나눠 청구 진행 가능 여부를 판단" },
        /* S3 */ { title: "1차 청구콜 지원 및 서류 기준 확인", desc: "1차 청구콜 기준, 지급내역·보험증권·추가 서류 확인 항목을 정리하고 서류 대행 후 확보 경로를 지원" },
        /* S4 */ { title: "1차 정밀 분석", desc: "확보된 자료를 기준으로 기지급 제외, 미지급 후보, 청구 가능 항목을 1차 정리" },
        /* S5 */ { title: "청구 확정", desc: "최종 청구 항목과 제출 준비 상태를 확정" },
        /* S6 */ { title: "보험사 접수", desc: "최종 청구 항목을 보험사에 제출" },
        /* S7 */ { title: "지급 추적 및 결과 정리", desc: "지급 여부, 반려 여부, 추가 보완 필요 사항을 확인" },
        /* S8 */ { title: "보장 공백 분석 결과 전달", desc: "보장 공백과 추가 발굴 결과를 영업 후속 액션으로 넘김" },
        /* S9 */ { title: "재청구·가족 확장 후보 관리", desc: "재청구와 가족 확장 후보를 장기 관리" },
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
      ],
    },

    {
      id: "it", nameKr: "IT 운영", nameEn: "Dev/IT Ops", team: "S:IT", colorId: "it",
      cells: [
        /* S1 */ { title: "접수 생성 및 초기 태깅", desc: "간편청구 케이스를 생성하고 기본 상태값을 저장" },
        /* S2 */ { title: "6개 케이스 분류 및 상태값 저장", desc: "A 본인+서류 있음 / B 본인+서류 없음 / C-1 가족+서류 있음+보험정보 있음 / C-2 가족+서류 있음+보험정보 없음 / D-1 가족+서류 없음+보험정보 있음 / D-2 가족+서류 없음+보험정보 없음으로 분류하고 상태값을 저장" },
        /* S3 */ { title: "청구콜·서류 확보 상태 추적", desc: "1차 청구콜 결과, 직접 제출, 서류 대행, 지급내역·보험증권 확보 상태를 추적" },
        /* S4 */ { title: "1차 정밀 분석 보조 엔진", desc: "확보된 자료를 기준으로 기지급 제외와 청구 가능 항목 정리를 보조" },
        /* S5 */ { title: "최종 환급금 계산 및 청구서 준비", desc: "최종 환급금 계산과 청구 확정, 제출 준비를 보조" },
        /* S6 */ { title: "보험사 접수 상태 저장", desc: "보험사 제출 결과와 접수 상태를 저장" },
        /* S7 */ { title: "지급 추적 알림 및 결과 리포트", desc: "지급 추적 알림과 결과 리포트를 자동화" },
        /* S8 */ { title: "보장 공백 탐지", desc: "놓친 담보와 후속 상담 후보를 자동으로 탐지" },
        /* S9 */ { title: "리텐션 자동화", desc: "가족 연결과 소개 확장 알림을 자동화" },
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
      ],
    },
  ],

  dividers: [
    { afterLaneId: "ca", type: "interaction", label: "고객 ↔ 운영 경계" },
    { afterLaneId: "sales", type: "team", label: "영업 ↔ 청구" },
    { afterLaneId: "claim", type: "visibility", label: "서포트 (IT·시스템)" },
  ],
};
