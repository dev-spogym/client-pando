/**
 * 커뮤니티 / 사회적 신뢰 mock 데이터
 * - 공개 Q&A (회원 ↔ 센터/강사/회원 간 공개 질문답변)
 * - FAQ (자주 묻는 질문)
 * - 신고 내역 (회원이 한 신고)
 *
 * 모든 mock 함수는 동기로 동작 (배포 환경 안정성 확보 — 실 API 연결 시 교체).
 */

// ─────────────────────────────────────────
// Q&A (공개 질문답변)
// ─────────────────────────────────────────

export type QnaCategory = '시설' | '가격' | '강사' | '예약' | '기타';

export const QNA_CATEGORIES: QnaCategory[] = ['시설', '가격', '강사', '예약', '기타'];

export type QnaTab = 'all' | 'answered' | 'pending';

export const QNA_TABS: { id: QnaTab; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'answered', label: '답변완료' },
  { id: 'pending', label: '답변대기' },
];

export type QnaAnswerRole = 'official' | 'trainer' | 'member';

export interface QnaAnswer {
  id: number;
  /** 답변자 표시명 (마스킹 또는 실명) */
  authorName: string;
  /** 답변자 종류 */
  role: QnaAnswerRole;
  /** 답변자 외부 진입 시 사용할 ID (강사·센터일 때) */
  refId?: number;
  /** 답변 본문 */
  body: string;
  /** 작성일자 (YYYY-MM-DD) */
  createdAt: string;
  /** 도움됨 카운트 */
  helpfulCount: number;
}

export interface QnaItem {
  id: number;
  category: QnaCategory;
  /** 질문 제목 */
  title: string;
  /** 질문 본문 */
  body: string;
  /** 작성자 표시명 (마스킹 처리됨) */
  authorName: string;
  /** 익명 작성 여부 */
  anonymous: boolean;
  /** 작성일자 (YYYY-MM-DD) */
  createdAt: string;
  /** 좋아요 카운트 */
  likeCount: number;
  /** 조회수 */
  viewCount: number;
  /** 답변 목록 */
  answers: QnaAnswer[];
}

/** 마스킹 헬퍼 — 가운데를 *로 치환 (예: 김민수 → 김*수) */
function mask(name: string): string {
  if (name.length <= 1) return name;
  if (name.length === 2) return `${name[0]}*`;
  return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}`;
}

export const QNA_LIST: QnaItem[] = [
  {
    id: 1,
    category: '시설',
    title: '여성 전용 운동 공간이 따로 있나요?',
    body: '회사 동료들과 함께 등록하려고 하는데, 여성 전용 공간이 있는지 궁금해요. 샤워실/탈의실 외에 운동 공간도 분리되어 있나요?',
    authorName: mask('김지혜'),
    anonymous: false,
    createdAt: '2026-04-26',
    likeCount: 12,
    viewCount: 184,
    answers: [
      {
        id: 11,
        authorName: '판도 강남점',
        role: 'official',
        refId: 1,
        body: '안녕하세요. 강남점은 2층 전체가 여성 전용으로 운영되며, 샤워실·탈의실·운동 공간 모두 분리되어 있습니다. 24시간 출입 가능하고, 야간에는 여성 매니저가 상주합니다.',
        createdAt: '2026-04-26',
        helpfulCount: 28,
      },
      {
        id: 12,
        authorName: mask('박서연'),
        role: 'member',
        body: '저도 여성 전용 사용 중인데, 정말 쾌적해요. 특히 평일 저녁에도 붐비지 않아서 좋습니다.',
        createdAt: '2026-04-27',
        helpfulCount: 9,
      },
    ],
  },
  {
    id: 2,
    category: '가격',
    title: '단체 할인 가능할까요? 4명 등록 예정입니다.',
    body: '회사 동료 4명이 함께 등록하려고 하는데 단체 할인 정책이 있는지 궁금합니다. 또 3개월 vs 6개월 어느 쪽이 더 합리적인지 알려주세요.',
    authorName: '익명',
    anonymous: true,
    createdAt: '2026-04-25',
    likeCount: 8,
    viewCount: 146,
    answers: [
      {
        id: 21,
        authorName: '판도 강남점',
        role: 'official',
        refId: 1,
        body: '4인 이상 단체 등록 시 1인당 10%, 6인 이상은 15% 할인 적용됩니다. 6개월 등록이 단가 기준으로 가장 합리적이에요. 직접 방문 상담 시 1회 PT 체험을 무료로 드리고 있습니다.',
        createdAt: '2026-04-25',
        helpfulCount: 17,
      },
    ],
  },
  {
    id: 3,
    category: '강사',
    title: '재활 운동 전문 강사 추천 부탁드려요',
    body: '무릎 수술 후 재활 운동이 필요한데, 재활 케이스를 다뤄보신 강사님 추천해주실 수 있을까요? 50대 여성입니다.',
    authorName: mask('이성우'),
    anonymous: false,
    createdAt: '2026-04-24',
    likeCount: 21,
    viewCount: 312,
    answers: [
      {
        id: 31,
        authorName: '최민호 트레이너',
        role: 'trainer',
        refId: 5,
        body: '안녕하세요. 정형외과 재활센터 출신으로 무릎/허리 재활 케이스를 200건 이상 다뤘습니다. 첫 상담은 무료이며, 의료진 소견서가 있으시면 더욱 안전하게 운동 설계가 가능합니다.',
        createdAt: '2026-04-24',
        helpfulCount: 34,
      },
      {
        id: 32,
        authorName: mask('정은지'),
        role: 'member',
        body: '최민호 트레이너님께 6개월째 PT 받고 있는데, 무릎 수술 후 재활을 정말 꼼꼼하게 봐주십니다. 추천드려요.',
        createdAt: '2026-04-25',
        helpfulCount: 19,
      },
      {
        id: 33,
        authorName: '김수진 트레이너',
        role: 'trainer',
        refId: 7,
        body: '필라테스 기반 재활 프로그램도 운영 중입니다. 부담이 적어 50~60대 회원분들이 선호하시는 편이에요. 편하게 문의 주세요.',
        createdAt: '2026-04-26',
        helpfulCount: 12,
      },
    ],
  },
  {
    id: 4,
    category: '예약',
    title: 'GX 프로그램 당일 예약도 가능한가요?',
    body: '갑자기 시간이 비어서 오늘 GX 수업 들으러 가고 싶은데, 당일 예약이 가능한지 궁금해요.',
    authorName: mask('윤하늘'),
    anonymous: false,
    createdAt: '2026-04-23',
    likeCount: 5,
    viewCount: 98,
    answers: [
      {
        id: 41,
        authorName: '판도 강남점',
        role: 'official',
        refId: 1,
        body: '네, 당일 예약 가능합니다. 앱 > 클래스 메뉴에서 시작 30분 전까지 예약 가능하며, 자리가 남아있을 경우 현장 입실도 허용합니다.',
        createdAt: '2026-04-23',
        helpfulCount: 8,
      },
    ],
  },
  {
    id: 5,
    category: '기타',
    title: '운동복 대여는 무료인가요?',
    body: '매번 운동복 챙기기 번거로워서 대여 서비스가 있다면 이용하고 싶어요.',
    authorName: '익명',
    anonymous: true,
    createdAt: '2026-04-22',
    likeCount: 3,
    viewCount: 76,
    answers: [
      {
        id: 51,
        authorName: '판도 강남점',
        role: 'official',
        refId: 1,
        body: '운동복·타올 대여 모두 무료입니다. 락커룸에 비치된 사이즈별 운동복을 자유롭게 사용하시면 됩니다.',
        createdAt: '2026-04-22',
        helpfulCount: 6,
      },
    ],
  },
  {
    id: 6,
    category: '시설',
    title: '주차장 무료 시간 알려주세요',
    body: '운동 다녀오면 보통 1시간 30분 정도 머무는데, 주차 무료 시간이 어떻게 되나요?',
    authorName: mask('한지석'),
    anonymous: false,
    createdAt: '2026-04-21',
    likeCount: 4,
    viewCount: 64,
    answers: [
      {
        id: 61,
        authorName: '판도 강남점',
        role: 'official',
        refId: 1,
        body: '회원은 2시간 무료 주차 가능하며, 추가 시간은 30분당 1,000원입니다. PT 회원은 3시간까지 무료입니다.',
        createdAt: '2026-04-21',
        helpfulCount: 5,
      },
    ],
  },
  {
    id: 7,
    category: '강사',
    title: '바디프로필 준비 PT 추천',
    body: '8월에 바디프로필 촬영 예정입니다. 다이어트와 근비대를 같이 잡아주실 강사님 추천 부탁드려요.',
    authorName: mask('서민지'),
    anonymous: false,
    createdAt: '2026-04-20',
    likeCount: 17,
    viewCount: 223,
    answers: [
      {
        id: 71,
        authorName: '이지훈 트레이너',
        role: 'trainer',
        refId: 3,
        body: '바디프로필 코칭 80건 이상 진행했습니다. 12주 프로그램 + 식단 관리까지 포함이며, 인바디 측정으로 매주 진행도 체크합니다.',
        createdAt: '2026-04-20',
        helpfulCount: 22,
      },
    ],
  },
  {
    id: 8,
    category: '가격',
    title: 'PT 10회권 vs 20회권 어느 쪽이 좋을까요?',
    body: '처음 PT를 시작하려고 하는데 10회 끊고 효과 보면 추가하는게 나을지, 처음부터 20회 가는게 나을지 고민됩니다.',
    authorName: '익명',
    anonymous: true,
    createdAt: '2026-04-19',
    likeCount: 11,
    viewCount: 167,
    answers: [
      {
        id: 81,
        authorName: '최민호 트레이너',
        role: 'trainer',
        refId: 5,
        body: '운동 경험이 적으시다면 10회 + 추가 결정 권장합니다. 대신 20회권이 회당 단가가 15% 저렴하니, 6개월 이상 꾸준히 하실 거면 20회권이 합리적이에요.',
        createdAt: '2026-04-19',
        helpfulCount: 18,
      },
      {
        id: 82,
        authorName: '판도 강남점',
        role: 'official',
        refId: 1,
        body: '현재 신규 회원 대상으로 20회권 결제 시 인바디 6회 무료 + 식단 컨설팅 1회 제공 중입니다.',
        createdAt: '2026-04-19',
        helpfulCount: 9,
      },
    ],
  },
  {
    id: 9,
    category: '예약',
    title: '예약 노쇼하면 패널티가 있나요?',
    body: '직장인이라 일정이 자주 바뀌는데, 노쇼 시 어떤 패널티가 있는지 알려주세요.',
    authorName: mask('조현우'),
    anonymous: false,
    createdAt: '2026-04-18',
    likeCount: 7,
    viewCount: 134,
    answers: [
      {
        id: 91,
        authorName: '판도 강남점',
        role: 'official',
        refId: 1,
        body: '시작 30분 이전 취소는 패널티가 없으며, 30분 이내 취소 또는 노쇼 시 1회권이 차감됩니다. 월 2회까지는 유예 처리됩니다.',
        createdAt: '2026-04-18',
        helpfulCount: 14,
      },
    ],
  },
  {
    id: 10,
    category: '시설',
    title: '샤워실/락커 깨끗한가요?',
    body: '예전 다니던 곳이 너무 노후화되어 있어서 옮길 생각인데, 샤워실/락커 상태가 어떤지 솔직한 후기 부탁드려요.',
    authorName: mask('남지원'),
    anonymous: false,
    createdAt: '2026-04-17',
    likeCount: 9,
    viewCount: 198,
    answers: [
      {
        id: 101,
        authorName: mask('윤서연'),
        role: 'member',
        body: '6개월째 다니고 있는데 매일 청소 들어가서 항상 깔끔합니다. 락커는 신축이라 고장 한 번도 없었어요.',
        createdAt: '2026-04-17',
        helpfulCount: 11,
      },
      {
        id: 102,
        authorName: '판도 강남점',
        role: 'official',
        refId: 1,
        body: '하루 4회 정기 청소 + 매주 일요일 종합 방역을 진행하고 있습니다. 직접 방문 시 시설 투어 가능합니다.',
        createdAt: '2026-04-18',
        helpfulCount: 7,
      },
    ],
  },
  {
    id: 11,
    category: '예약',
    title: '예약 변경/취소 어디서 하나요?',
    body: '앱에서 예약은 했는데, 변경/취소 메뉴가 안 보입니다.',
    authorName: '익명',
    anonymous: true,
    createdAt: '2026-04-16',
    likeCount: 2,
    viewCount: 58,
    answers: [],
  },
  {
    id: 12,
    category: '강사',
    title: '필라테스 신규 강사 분 어떠세요?',
    body: '이번에 새로 오신 김수진 강사님 수업 들어보신 분 후기 부탁드려요.',
    authorName: mask('이연우'),
    anonymous: false,
    createdAt: '2026-04-15',
    likeCount: 13,
    viewCount: 167,
    answers: [
      {
        id: 121,
        authorName: mask('박세라'),
        role: 'member',
        body: '체형 분석을 정말 정확하게 해주셔서 좋았어요. 동작도 차분하게 설명해주셔서 입문자에게 추천합니다.',
        createdAt: '2026-04-16',
        helpfulCount: 15,
      },
    ],
  },
  {
    id: 13,
    category: '가격',
    title: '환불 규정이 어떻게 되나요?',
    body: '6개월 등록 후 사정상 1개월 이용했는데 환불 가능한가요?',
    authorName: '익명',
    anonymous: true,
    createdAt: '2026-04-14',
    likeCount: 6,
    viewCount: 112,
    answers: [
      {
        id: 131,
        authorName: '판도 강남점',
        role: 'official',
        refId: 1,
        body: '소비자보호법에 따라 이용 일수 + 위약금 10%를 제외한 금액을 환불해드립니다. 자세한 사항은 상담실 방문 또는 1:1 문의 부탁드립니다.',
        createdAt: '2026-04-14',
        helpfulCount: 8,
      },
    ],
  },
  {
    id: 14,
    category: '기타',
    title: '인바디는 얼마나 자주 측정하나요?',
    body: '체성분 변화 추적이 중요한 편인데, 인바디 측정 주기와 비용이 궁금합니다.',
    authorName: mask('강도현'),
    anonymous: false,
    createdAt: '2026-04-13',
    likeCount: 4,
    viewCount: 89,
    answers: [
      {
        id: 141,
        authorName: '판도 강남점',
        role: 'official',
        refId: 1,
        body: '회원은 월 2회 무료, 추가 측정은 1회 5,000원입니다. PT 회원은 무제한 무료 이용 가능합니다.',
        createdAt: '2026-04-13',
        helpfulCount: 6,
      },
    ],
  },
  {
    id: 15,
    category: '시설',
    title: '골프 시뮬레이터 사용 시간 제한 있나요?',
    body: '골프 시뮬레이터 이용권 등록했는데, 1회 이용 시간 제한이 있나요?',
    authorName: mask('백승호'),
    anonymous: false,
    createdAt: '2026-04-12',
    likeCount: 3,
    viewCount: 67,
    answers: [
      {
        id: 151,
        authorName: '판도 강남점',
        role: 'official',
        refId: 1,
        body: '1회 예약당 1시간이며, 빈 시간이 있을 경우 30분 단위로 연장 가능합니다. 주말은 예약 1시간 단위로만 운영됩니다.',
        createdAt: '2026-04-12',
        helpfulCount: 4,
      },
    ],
  },
  {
    id: 16,
    category: '기타',
    title: '아이 동반 가능한가요?',
    body: '아이를 잠깐 봐줄 키즈 라운지 같은 게 있는지 궁금합니다.',
    authorName: mask('전혜린'),
    anonymous: false,
    createdAt: '2026-04-11',
    likeCount: 8,
    viewCount: 132,
    answers: [],
  },
];

export function getQnaById(id: number): QnaItem | null {
  return QNA_LIST.find((q) => q.id === id) ?? null;
}

export function filterQna(items: QnaItem[], tab: QnaTab, category: QnaCategory | 'all'): QnaItem[] {
  return items.filter((q) => {
    if (tab === 'answered' && q.answers.length === 0) return false;
    if (tab === 'pending' && q.answers.length > 0) return false;
    if (category !== 'all' && q.category !== category) return false;
    return true;
  });
}

// ─────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────

export type FaqCategory = '이용' | '결제' | '환불' | '예약' | '회원권' | '기타';

export const FAQ_CATEGORIES: FaqCategory[] = ['이용', '결제', '환불', '예약', '회원권', '기타'];

export interface FaqItem {
  id: number;
  category: FaqCategory;
  question: string;
  answer: string;
  /** 도움됨 카운트 */
  helpfulCount: number;
  /** 인기 질문 여부 */
  popular: boolean;
}

export const FAQ_LIST: FaqItem[] = [
  // 이용
  {
    id: 1,
    category: '이용',
    question: '운영 시간이 어떻게 되나요?',
    answer: '판도 강남점은 24시간 운영됩니다. 다만 안내 데스크는 평일 06:00~23:00, 주말 08:00~22:00에 운영되며, 그 외 시간은 무인 운영입니다.',
    helpfulCount: 412,
    popular: true,
  },
  {
    id: 2,
    category: '이용',
    question: '운동복/타올 대여 가능한가요?',
    answer: '네, 운동복과 타올 모두 무료로 대여 가능합니다. 락커룸 입구에 사이즈별로 비치되어 있습니다. 단, 양말과 운동화는 개인 준비가 필요합니다.',
    helpfulCount: 287,
    popular: true,
  },
  {
    id: 3,
    category: '이용',
    question: '주차는 무료인가요?',
    answer: '회원은 2시간 무료 주차가 가능하며, 추가 시간은 30분당 1,000원입니다. PT 회원과 6개월 이상 장기 회원은 3시간까지 무료 주차 가능합니다.',
    helpfulCount: 198,
    popular: false,
  },
  {
    id: 4,
    category: '이용',
    question: '아이를 데려가도 되나요?',
    answer: '안전상 만 14세 미만은 보호자 동반 시에만 입장 가능하며, 운동 시간 동안 별도 라운지에서 대기해야 합니다. 키즈 라운지는 평일 10:00~18:00 운영됩니다.',
    helpfulCount: 134,
    popular: false,
  },
  // 결제
  {
    id: 5,
    category: '결제',
    question: '결제 수단은 어떤 것이 있나요?',
    answer: '신용카드, 체크카드, 계좌이체, 카카오페이, 네이버페이, 토스페이를 지원합니다. 현금 결제 시 영수증을 별도로 요청해 주세요.',
    helpfulCount: 156,
    popular: false,
  },
  {
    id: 6,
    category: '결제',
    question: '할부 결제 가능한가요?',
    answer: '5만원 이상 결제 시 2~12개월 할부가 가능합니다. 무이자 할부는 카드사 프로모션에 따라 변동되니, 결제 전 확인 부탁드립니다.',
    helpfulCount: 121,
    popular: false,
  },
  {
    id: 7,
    category: '결제',
    question: '회원권 구매 시 영수증/세금계산서 받을 수 있나요?',
    answer: '결제 후 자동으로 전자 영수증이 발급되며, 사업자 회원의 경우 세금계산서 발급도 가능합니다. 1:1 문의를 통해 사업자 등록증을 첨부해 주세요.',
    helpfulCount: 89,
    popular: false,
  },
  // 환불
  {
    id: 8,
    category: '환불',
    question: '회원권 환불 규정이 어떻게 되나요?',
    answer: '소비자보호법에 따라 이용한 일수만큼 차감하고, 위약금 10%를 제외한 잔액을 환불해 드립니다. 7일 이내 사용하지 않은 경우 100% 환불됩니다.',
    helpfulCount: 354,
    popular: true,
  },
  {
    id: 9,
    category: '환불',
    question: '환불 신청은 어디서 하나요?',
    answer: '앱 > 1:1 문의 또는 안내 데스크 직접 방문으로 신청 가능합니다. 신청 후 영업일 기준 3~5일 이내 처리되며, 결제 카드로 자동 환불됩니다.',
    helpfulCount: 178,
    popular: false,
  },
  {
    id: 10,
    category: '환불',
    question: 'PT 환불은 어떻게 되나요?',
    answer: '미사용 회차에 한해 환불 가능하며, 위약금 10%가 차감됩니다. 트레이너 변경 후 1회도 사용하지 않은 경우 100% 환불 가능합니다.',
    helpfulCount: 142,
    popular: false,
  },
  // 예약
  {
    id: 11,
    category: '예약',
    question: 'GX/PT 예약은 언제까지 가능한가요?',
    answer: 'GX는 시작 30분 전까지, PT는 24시간 전까지 예약 가능합니다. GX 정원이 마감된 경우 대기열 등록이 가능하며, 자리가 비면 자동 알림이 발송됩니다.',
    helpfulCount: 267,
    popular: true,
  },
  {
    id: 12,
    category: '예약',
    question: '예약 취소 패널티가 있나요?',
    answer: '시작 30분 이전 취소는 패널티가 없으며, 30분 이내 취소 또는 노쇼 시 1회권이 차감됩니다. 월 2회까지는 유예 처리됩니다.',
    helpfulCount: 198,
    popular: false,
  },
  {
    id: 13,
    category: '예약',
    question: '예약 변경은 어떻게 하나요?',
    answer: '앱 > 마이페이지 > 예약 내역에서 변경 가능합니다. 시작 30분 이전까지만 변경 가능하며, 그 이후는 취소 후 재예약만 가능합니다.',
    helpfulCount: 134,
    popular: false,
  },
  // 회원권
  {
    id: 14,
    category: '회원권',
    question: '회원권 양도 가능한가요?',
    answer: '동일 지점 내에서 1회에 한해 양도 가능합니다. 양도 수수료 30,000원이 발생하며, 양도 받는 분도 신규 회원 등록 절차가 필요합니다.',
    helpfulCount: 102,
    popular: false,
  },
  {
    id: 15,
    category: '회원권',
    question: '홀딩(일시정지) 신청 방법은?',
    answer: '앱 > 회원권 > 홀딩 신청 메뉴에서 가능합니다. 1년에 최대 30일까지 분할 사용 가능하며, 7일/14일/30일 단위로 신청할 수 있습니다.',
    helpfulCount: 245,
    popular: true,
  },
  {
    id: 16,
    category: '회원권',
    question: '타 지점 이용 가능한가요?',
    answer: '12개월 이상 회원권은 전국 16개 지점 자유 이용이 가능합니다. 6개월 회원권은 등록 지점만 이용 가능하며, 추가 비용으로 타 지점 이용권 구매 가능합니다.',
    helpfulCount: 156,
    popular: false,
  },
  {
    id: 17,
    category: '회원권',
    question: '회원권 연장 시 할인 받을 수 있나요?',
    answer: '회원권 만료 7일 전부터 만료 후 7일까지 연장 시, 정가의 10% 할인이 자동 적용됩니다. 6개월 이상 연속 회원은 추가 5% 할인이 누적됩니다.',
    helpfulCount: 121,
    popular: false,
  },
  // 기타
  {
    id: 18,
    category: '기타',
    question: '인바디 측정은 무료인가요?',
    answer: '회원은 월 2회 무료 측정 가능하며, 추가 측정은 1회 5,000원입니다. PT 회원과 12개월 이상 회원은 무제한 무료 이용 가능합니다.',
    helpfulCount: 167,
    popular: false,
  },
  {
    id: 19,
    category: '기타',
    question: '개인 운동기구 반입 가능한가요?',
    answer: '소형 보조기구(밴드, 스트랩 등)는 반입 가능하나, 대형 기구나 위생상 문제가 될 수 있는 기구는 제한됩니다. 사전에 안내 데스크로 문의해 주세요.',
    helpfulCount: 78,
    popular: false,
  },
  {
    id: 20,
    category: '기타',
    question: '강사 변경 가능한가요?',
    answer: 'PT 회원은 1회에 한해 트레이너 변경이 무료이며, 추가 변경은 회당 10,000원의 행정 수수료가 발생합니다. 변경 신청은 1:1 문의로 접수해 주세요.',
    helpfulCount: 134,
    popular: false,
  },
];

export function searchFaq(items: FaqItem[], keyword: string, category: FaqCategory | 'all'): FaqItem[] {
  const lowered = keyword.trim().toLowerCase();
  return items.filter((f) => {
    if (category !== 'all' && f.category !== category) return false;
    if (!lowered) return true;
    return (
      f.question.toLowerCase().includes(lowered) ||
      f.answer.toLowerCase().includes(lowered)
    );
  });
}

export function getPopularFaq(items: FaqItem[]): FaqItem[] {
  return items.filter((f) => f.popular).slice(0, 5);
}

// ─────────────────────────────────────────
// 신고 내역 (회원이 한 신고)
// ─────────────────────────────────────────

export type ReportTargetType = '회원' | '리뷰' | 'Q&A' | '메시지';
export type ReportReason = '광고/홍보성 게시물' | '욕설/비방' | '음란/선정성' | '도배/스팸' | '허위정보' | '기타';
export type ReportStatus = '접수' | '검토중' | '처리완료' | '반려';

export const REPORT_REASONS: ReportReason[] = [
  '광고/홍보성 게시물',
  '욕설/비방',
  '음란/선정성',
  '도배/스팸',
  '허위정보',
  '기타',
];

export interface ReportItem {
  id: number;
  /** 신고 대상 종류 */
  targetType: ReportTargetType;
  /** 신고 대상 표시명 (마스킹 또는 발췌) */
  targetLabel: string;
  /** 신고 사유 */
  reason: ReportReason;
  /** 신고 상세 사유 (자유 기재) */
  detail?: string;
  /** 신고 일자 */
  createdAt: string;
  /** 처리 상태 */
  status: ReportStatus;
  /** 운영팀 답변 (있을 때) */
  staffReply?: string;
  /** 처리 완료/반려 일자 */
  resolvedAt?: string;
}

export const REPORT_LIST: ReportItem[] = [
  {
    id: 1,
    targetType: '리뷰',
    targetLabel: '"여기 정말 ○○○이네요…" 리뷰',
    reason: '욕설/비방',
    detail: '강사님을 비하하는 표현이 포함되어 있어 신고합니다.',
    createdAt: '2026-04-26',
    status: '처리완료',
    staffReply: '신고해 주신 게시물을 검토한 결과 커뮤니티 가이드 위반으로 확인되어 비공개 처리되었습니다. 신고에 협조해 주셔서 감사합니다.',
    resolvedAt: '2026-04-27',
  },
  {
    id: 2,
    targetType: 'Q&A',
    targetLabel: '"○○ 보충제 광고 게시" 질문',
    reason: '광고/홍보성 게시물',
    detail: '특정 보충제 브랜드 링크와 할인 코드를 반복 게시 중입니다.',
    createdAt: '2026-04-24',
    status: '검토중',
  },
  {
    id: 3,
    targetType: '메시지',
    targetLabel: '회원 P*** 님과의 1:1 메시지',
    reason: '음란/선정성',
    detail: '부적절한 사진을 전송했습니다.',
    createdAt: '2026-04-22',
    status: '처리완료',
    staffReply: '신고 대상 회원에게 7일 이용 정지 조치되었으며, 재발 시 영구 정지 예정입니다. 불쾌한 경험을 드려 죄송합니다.',
    resolvedAt: '2026-04-23',
  },
  {
    id: 4,
    targetType: '회원',
    targetLabel: '회원 K*** 님 (락커룸 사진 무단 촬영 의심)',
    reason: '기타',
    detail: '락커룸에서 핸드폰을 들고 다니며 사진을 찍는 모습을 목격했습니다.',
    createdAt: '2026-04-20',
    status: '처리완료',
    staffReply: 'CCTV 검토 후 해당 회원과 면담 진행, 경고 조치되었으며 락커룸 휴대폰 사용 금지 안내문을 추가 부착했습니다. 즉시 신고해 주셔서 감사합니다.',
    resolvedAt: '2026-04-21',
  },
  {
    id: 5,
    targetType: 'Q&A',
    targetLabel: '"동일 질문 10회 도배" 질문',
    reason: '도배/스팸',
    createdAt: '2026-04-18',
    status: '처리완료',
    staffReply: '중복 게시물 9건을 일괄 삭제하였으며, 작성자에게 도배 경고 처리 완료했습니다.',
    resolvedAt: '2026-04-19',
  },
  {
    id: 6,
    targetType: '리뷰',
    targetLabel: '"센터에 가본 적도 없으면서…" 리뷰',
    reason: '허위정보',
    detail: '실제 등록 이력이 없는 회원이 별점 1점 리뷰를 작성한 것 같습니다.',
    createdAt: '2026-04-15',
    status: '반려',
    staffReply: '검토 결과 작성자가 1회 체험권을 이용한 이력이 확인되어 정상 리뷰로 판단되었습니다. 다만 사실 관계가 다른 부분은 댓글로 정정 요청해 주세요.',
    resolvedAt: '2026-04-17',
  },
  {
    id: 7,
    targetType: '메시지',
    targetLabel: '강사 J*** 님과의 메시지',
    reason: '광고/홍보성 게시물',
    detail: '본인이 운영하는 외부 사이트 가입 권유를 반복했습니다.',
    createdAt: '2026-04-12',
    status: '접수',
  },
];

export const REPORT_STATUS_TONE: Record<ReportStatus, 'info' | 'warning' | 'success' | 'neutral'> = {
  접수: 'info',
  검토중: 'warning',
  처리완료: 'success',
  반려: 'neutral',
};
