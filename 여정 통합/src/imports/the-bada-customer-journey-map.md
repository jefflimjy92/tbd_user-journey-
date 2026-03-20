더바다 고객여정 운영맵 — Figma Make 마스터 프롬프트
사용법
아래 ---PROMPT START--- 부터 ---PROMPT END--- 사이의 내용 전체를 Figma Make 입력창에 그대로 붙여넣으세요.
---PROMPT START---
Build a beautiful, professional customer journey operational map web app for "더바다 (The Bada)" — a Korean insurance claim recovery service. This is a large-scale operational dashboard diagram, not a simple flowchart.
VISUAL DESIGN SYSTEM
Color Palette

Main Spine Nodes (8 stages): #1B4F8A background, #FFFFFF text, rounded pill shape
Exit / Termination Nodes: #C0392B background, #FFFFFF text
Goal Achievement Nodes: #1A7A4A background, #FFFFFF text
Sub-process Nodes (neutral): #F0F4F8 background, #2C3E50 text, #BDC3C7 border
Background: #F8FAFC
Stage group background: #FFFFFF with subtle drop shadow rgba(0,0,0,0.06)
Main spine arrow color: #1B4F8A
Loop arrow (dotted): #E67E22 dashed line

Typography

Stage titles: 700 weight, 14px, uppercase letter-spacing 0.08em
Node labels: 500 weight, 12px
Sub-node labels: 400 weight, 11px

Node Shape

Main spine stage nodes: 40px height, full border-radius (pill), min-width 120px, bold text
Sub-nodes: 32px height, 8px border-radius, 12px horizontal padding
All nodes have subtle box-shadow: 0 2px 8px rgba(0,0,0,0.10)


LAYOUT STRUCTURE
The diagram is a horizontal left-to-right flow with 8 main stages across the top as a spine, and branches expanding downward from each stage.
Top Row — Main Spine (left → right):
[① 광고] → [② 유입] → [③ 조회] → [④ 상담] → [⑤ 미팅] → [⑥ 청구] → [⑦ 환급] → [⑧ 소개]

Connect each with a thick directional arrow (2px, color #1B4F8A)
Add a dashed orange loop arrow from [⑧ 소개] back to [② 유입] curved above or below the spine with label "재유입 루프"

Below Each Stage — Sub-branches:
Each stage card is a white rounded rectangle container. Inside, the main stage node sits at top center, and branch nodes hang below it with thin #CBD5E0 connector lines.

STAGE-BY-STAGE CONTENT
① 광고 (Advertising)
Main node color: MAIN SPINE BLUE
Sub-nodes (all NEUTRAL gray):

무반응 [EXIT RED]
클릭
저장/공유 후 재방문
댓글/문의 전환
리타겟팅 재노출

② 유입 (Inflow)
Main node color: MAIN SPINE BLUE
Sub-nodes:

랜딩 진입
유입경로/캠페인 기록
동반신청
추천인/소개인
중복 유입 [EXIT RED]

③ 조회 (Inquiry)
Main node color: MAIN SPINE BLUE
Sub-nodes:

정보입력 중단 [EXIT RED]
본인인증 성공 [GOAL GREEN]
본인인증 실패 [EXIT RED]
필수동의 거부 [EXIT RED]
마케팅 미동의 [EXIT RED]
조회 완료 [GOAL GREEN]
예상 환급금 산출 [GOAL GREEN]

④ 상담 (Consultation / TM)
Main node color: MAIN SPINE BLUE
Sub-nodes:

1차 TM 완료
2차 TM 진행
부재
장기부재 [EXIT RED]
재통화 예약
관리대상
진행불가 [EXIT RED]
└─ 지방대기/특이사항 종결 [EXIT RED]
└─ 월보험료 7만 미만 [EXIT RED]
└─ 보험 미납/실효 [EXIT RED]
└─ 계약자/납입자 불일치 [EXIT RED]
└─ 최근 3개월 치료/수술 [EXIT RED]
└─ 현재 상해 치료중 [EXIT RED]
└─ 약 용량/종류 변경 [EXIT RED]
└─ 중대질환/악화소견 [EXIT RED]
└─ 기존 설계사 친인척 [EXIT RED]
└─ 예외질환 해당 [EXIT RED]
진행가능 전환 [GOAL GREEN]
영업 인계 [GOAL GREEN]
민원 방어/클로징

⑤ 미팅 (Meeting)
Main node color: MAIN SPINE BLUE
Sub-nodes:

미팅 예약
미팅 확정 [GOAL GREEN]
미팅 취소 [EXIT RED]
미팅전 불가 [EXIT RED]
노쇼 [EXIT RED]
긴급 재배정
동반/제3자 케이스
미팅 진행 [GOAL GREEN]
└─ 계약 진행 [GOAL GREEN]
└─ 계약 보류
└─ 계약 거절 [EXIT RED]
└─ 청구만 진행 [GOAL GREEN]
└─ 상담 마무리 [EXIT RED]

⑥ 청구 (Claim Processing)
Main node color: MAIN SPINE BLUE
Sub-nodes:

서류 인수
1차 청구콜
수수료 안내
지급내역서/보험증권 요청
데이터 분석
실손 청구불가 항목 [EXIT RED]
비급여 청구가능 항목
종합 청구가능 항목
미청구 내역 확정 [GOAL GREEN]
서류 발급 위탁
예상 환급금 안내
고객동의 후 청구접수 [GOAL GREEN]
서류 누락 [EXIT RED]
발급 지연 [EXIT RED]

⑦ 환급 (Refund)
Main node color: MAIN SPINE BLUE
Sub-nodes:

지급 완료 [GOAL GREEN]
감액 지급 [EXIT RED]
부지급 [EXIT RED]
└─ 외부 전문가 대응 검토
지급지연 추적 (3/5/7일)
수수료 최종 안내 [GOAL GREEN]
부지급/감액 이의검토
└─ 외부 전문가 대응 검토

⑧ 소개 (Referral)
Main node color: MAIN SPINE BLUE
Sub-nodes:

지인 소개 요청
소개 혜택/수수료 면제 안내
소개 거절 [EXIT RED]
소개DB 생성 [GOAL GREEN]
소개 유입 사전고지
동일 담당자 재배정
재유입 성공 [GOAL GREEN] ← dashed orange arrow pointing back to ② 유입
재유입 실패 [EXIT RED]


SPECIAL CONNECTIONS

청구만 진행 (in ⑤ 미팅) → connect with a curved arrow to ⑥ 청구 main node
재유입 성공 (in ⑧ 소개) → connect with a long dashed orange arrow back to ② 유입 main node, labeled "재유입 루프"
Inside ④ 상담: 진행불가 node should have a visible sub-group box around its 10 child nodes, labeled "진행불가 세부사유"


ADDITIONAL UI ELEMENTS
Legend Box (top-right corner)
Small card with:

🔵 메인 단계
🔴 이탈/종결
🟢 목표 달성
⚪ 세부 프로세스




재유입 루프





Stage Badge Numbers
Each main spine node should have a circular badge number (①②③④⑤⑥⑦⑧) on the top-left of the pill.
Stage Group Cards
Each of the 8 stages should be enclosed in a white rounded-rectangle card (border-radius 16px, padding 20px, box-shadow 0 4px 16px rgba(0,0,0,0.08)) with the stage name as a small gray label at the top of the card.

SCROLLING & SIZE

The full diagram should be horizontally scrollable
Minimum total width: 2400px
Each stage column: approximately 240–280px wide
Full height: auto, but aim for 900–1200px to accommodate branches

---PROMPT END---