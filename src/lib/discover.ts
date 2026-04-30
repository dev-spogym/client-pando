/**
 * 발견/검색 도메인 mock 데이터
 * — 인기 검색어, 이벤트/기획전, 카테고리별 베스트 랭킹
 * — 풍부한 프로덕션 수준 mock (각 10개+).
 */

import { img, MOCK_CENTERS, MOCK_TRAINERS, MOCK_PRODUCTS } from './marketplace';

// ─────────────────────────────────────────────────────────────
// 인기 검색어 (랭킹 + 변동)
// ─────────────────────────────────────────────────────────────

export type RankTrend = 'up' | 'down' | 'same' | 'new';

export interface PopularKeyword {
  rank: number;
  keyword: string;
  /** 변동량 (절대값). new인 경우 0 */
  change: number;
  trend: RankTrend;
}

export const POPULAR_KEYWORDS: PopularKeyword[] = [
  { rank: 1, keyword: '필라테스', change: 2, trend: 'up' },
  { rank: 2, keyword: 'PT 10회', change: 1, trend: 'up' },
  { rank: 3, keyword: '체험권', change: 3, trend: 'down' },
  { rank: 4, keyword: '요가', change: 0, trend: 'same' },
  { rank: 5, keyword: '판교 헬스', change: 0, trend: 'new' },
  { rank: 6, keyword: '골프 입문', change: 1, trend: 'up' },
  { rank: 7, keyword: '바디프로필', change: 2, trend: 'down' },
  { rank: 8, keyword: '스피닝', change: 0, trend: 'same' },
  { rank: 9, keyword: '재활 필라테스', change: 0, trend: 'new' },
  { rank: 10, keyword: '24시간 헬스장', change: 1, trend: 'up' },
];

// ─────────────────────────────────────────────────────────────
// 추천 카테고리 (검색 entry 카드)
// ─────────────────────────────────────────────────────────────

export interface DiscoverCategory {
  id: string;
  label: string;
  emoji: string;
  /** Tailwind background class (그라디언트) */
  bgClass: string;
  searchKeyword: string;
}

export const DISCOVER_CATEGORIES: DiscoverCategory[] = [
  { id: 'fitness', label: '헬스', emoji: '💪', bgClass: 'bg-gradient-to-br from-primary to-primary-dark', searchKeyword: '헬스' },
  { id: 'pt', label: 'PT', emoji: '🏋️', bgClass: 'bg-gradient-to-br from-accent to-accent-dark', searchKeyword: 'PT' },
  { id: 'pilates', label: '필라테스', emoji: '🧘‍♀️', bgClass: 'bg-gradient-to-br from-state-warning to-state-sale', searchKeyword: '필라테스' },
  { id: 'yoga', label: '요가', emoji: '🧘', bgClass: 'bg-gradient-to-br from-state-success to-primary', searchKeyword: '요가' },
  { id: 'golf', label: '골프', emoji: '⛳', bgClass: 'bg-gradient-to-br from-primary-dark to-primary-deep', searchKeyword: '골프' },
];

// ─────────────────────────────────────────────────────────────
// 자동완성 결과
// ─────────────────────────────────────────────────────────────

export type SuggestionType = 'center' | 'trainer' | 'product';

export interface SearchSuggestion {
  type: SuggestionType;
  id: number;
  title: string;
  subtitle: string;
  thumbnailUrl: string;
}

/** 입력어 기준 자동완성 (센터 + 강사 + 상품) */
export function getSuggestions(query: string, limit = 8): SearchSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const centerHits: SearchSuggestion[] = MOCK_CENTERS
    .filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.dong.toLowerCase().includes(q) ||
      c.district.toLowerCase().includes(q),
    )
    .map((c) => ({
      type: 'center' as const,
      id: c.id,
      title: c.name,
      subtitle: `${c.district} ${c.dong} · ${c.distanceKm.toFixed(1)}km`,
      thumbnailUrl: c.thumbnailUrl,
    }));

  const trainerHits: SearchSuggestion[] = MOCK_TRAINERS
    .filter((t) => t.name.toLowerCase().includes(q) || t.centerName.toLowerCase().includes(q))
    .map((t) => ({
      type: 'trainer' as const,
      id: t.id,
      title: t.name,
      subtitle: `${t.centerName} · ${t.specialties.slice(0, 2).join(' · ')}`,
      thumbnailUrl: t.profileUrl,
    }));

  const productHits: SearchSuggestion[] = MOCK_PRODUCTS
    .filter(
      (p) => p.name.toLowerCase().includes(q) || p.productCategory.toLowerCase().includes(q),
    )
    .map((p) => ({
      type: 'product' as const,
      id: p.id,
      title: p.name,
      subtitle: `${p.centerName} · ${p.productCategory}`,
      thumbnailUrl: p.thumbnailUrl,
    }));

  return [...centerHits, ...trainerHits, ...productHits].slice(0, limit);
}

// ─────────────────────────────────────────────────────────────
// 이벤트/기획전
// ─────────────────────────────────────────────────────────────

export type EventStatus = 'ongoing' | 'closing' | 'ended';

export interface DiscoverEvent {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  /** 16:9 hero 이미지 */
  heroUrl: string;
  /** 본문 섹션 */
  bodySections: { heading: string; body: string; imageUrl?: string }[];
  /** ISO yyyy-mm-dd */
  startsAt: string;
  endsAt: string;
  /** "참여하기" 클릭 시 이동 경로 */
  ctaPath: string;
  ctaLabel: string;
  /** 적용 상품 ID */
  productIds: number[];
  /** 참여 조건 */
  eligibility: string[];
  /** 유의사항 */
  notice: string[];
  /** 진행 상태 (계산용 reference 날짜 = 2026-04-29) */
  status: EventStatus;
  /** 현재 시점 D-day (음수면 종료, 0=오늘, 양수=남은일) */
  daysLeft: number;
  /** 상시 진행 (마감 없음) */
  isAlways?: boolean;
  badgeLabel?: string;
}

const TODAY = new Date('2026-04-29');

function buildEvent(args: {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  heroSeed: string;
  endsAt: string;
  startsAt: string;
  ctaPath: string;
  ctaLabel: string;
  productIds: number[];
  eligibility: string[];
  notice: string[];
  bodySections: { heading: string; body: string; imageSeed?: string }[];
  status?: EventStatus;
  isAlways?: boolean;
  badgeLabel?: string;
}): DiscoverEvent {
  const end = new Date(args.endsAt);
  const diffMs = end.getTime() - TODAY.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const status: EventStatus = args.status
    ?? (args.isAlways
      ? 'ongoing'
      : daysLeft < 0
      ? 'ended'
      : daysLeft <= 7
      ? 'closing'
      : 'ongoing');

  return {
    id: args.id,
    title: args.title,
    subtitle: args.subtitle,
    description: args.description,
    heroUrl: img(args.heroSeed, 1600, 900),
    bodySections: args.bodySections.map((sec) => ({
      heading: sec.heading,
      body: sec.body,
      imageUrl: sec.imageSeed ? img(sec.imageSeed, 1200, 700) : undefined,
    })),
    startsAt: args.startsAt,
    endsAt: args.endsAt,
    ctaPath: args.ctaPath,
    ctaLabel: args.ctaLabel,
    productIds: args.productIds,
    eligibility: args.eligibility,
    notice: args.notice,
    status,
    daysLeft: args.isAlways ? Number.POSITIVE_INFINITY : daysLeft,
    isAlways: args.isAlways,
    badgeLabel: args.badgeLabel,
  };
}

export const MOCK_EVENTS: DiscoverEvent[] = [
  buildEvent({
    id: 1,
    title: '신규 가입 50% 할인',
    subtitle: '4월 한 달 첫 구매 한정',
    description: '센터 회원권을 처음 구매하시는 분께 절반 가격으로 드려요.',
    heroSeed: 'event-1-hero',
    startsAt: '2026-04-01',
    endsAt: '2026-05-06',
    ctaPath: '/centers',
    ctaLabel: '50% 할인 받으러 가기',
    productIds: MOCK_PRODUCTS.filter((p) => p.productCategory === '이용권').slice(0, 4).map((p) => p.id),
    eligibility: [
      '판도 앱 신규 가입 회원 (가입 30일 이내)',
      '회원권 첫 구매에 한함',
      '한 ID당 1회',
    ],
    notice: [
      '쿠폰 적용 가격은 결제 단계에서 확인 가능합니다.',
      '환불 시 할인분은 차감되어 환급됩니다.',
      '센터 운영 정책에 따라 일부 상품은 제외될 수 있습니다.',
    ],
    bodySections: [
      { heading: '시작이 절반!', body: '판도에서 첫 운동을 결제하면 50% 할인 쿠폰이 자동 적용됩니다. 별도 코드 입력 없이 결제만 진행하시면 돼요.', imageSeed: 'event-1-body-a' },
      { heading: '어떤 상품에 적용되나요?', body: '회원권/이용권 카테고리 상품 4종이 대상입니다. 상품 상세 페이지의 가격 표시를 확인해 보세요.' },
    ],
    badgeLabel: 'BEST',
  }),
  buildEvent({
    id: 2,
    title: '4월 PT 이벤트',
    subtitle: '10회권 결제 시 추가 2회 무료',
    description: 'PT 10회권 결제 회원께 PT 2회를 추가로 드려요.',
    heroSeed: 'event-2-hero',
    startsAt: '2026-04-10',
    endsAt: '2026-05-02',
    ctaPath: '/shop',
    ctaLabel: 'PT 10회권 보러가기',
    productIds: MOCK_PRODUCTS.filter((p) => p.name.includes('PT 10회')).slice(0, 5).map((p) => p.id),
    eligibility: ['전 지점 PT 10회권 결제 회원', '4월 30일까지 결제 완료'],
    notice: [
      '추가 2회는 PT 첫 진행 후 자동 부여됩니다.',
      '환불 시 추가 회차는 자동 소멸됩니다.',
    ],
    bodySections: [
      { heading: '4월에만 만나는 혜택', body: '판도 PT 인기 강사진과 함께 부담 없이 시작해 보세요. 추가 2회로 효과를 직접 체감할 수 있어요.', imageSeed: 'event-2-body-a' },
    ],
    badgeLabel: 'HOT',
  }),
  buildEvent({
    id: 3,
    title: '봄맞이 필라테스 무제한 1+1',
    subtitle: '그룹 50회권 결제 시 1개월 추가',
    description: '필라테스 그룹레슨 50회권에 무제한 1개월을 더 드려요.',
    heroSeed: 'event-3-hero',
    startsAt: '2026-04-15',
    endsAt: '2026-05-11',
    ctaPath: '/shop',
    ctaLabel: '필라테스 50회권 보기',
    productIds: MOCK_PRODUCTS.filter((p) => p.name.includes('필라테스 그룹')).slice(0, 4).map((p) => p.id),
    eligibility: ['필라테스 그룹레슨 50회권 결제 회원'],
    notice: ['무제한 1개월은 마지막 회차 사용일 기준 자동 연장됩니다.'],
    bodySections: [
      { heading: '봄, 다시 시작하기', body: '판도 인기 필라테스 강사진의 그룹레슨을 부담 없이 무제한으로 즐겨보세요.', imageSeed: 'event-3-body-a' },
    ],
  }),
  buildEvent({
    id: 4,
    title: '골프 입문 패키지 특가',
    subtitle: '체험 1회 + 1:1 레슨 4회 199,000원',
    description: '골프 입문자를 위한 4주 입문 패키지를 특가로 드려요.',
    heroSeed: 'event-4-hero',
    startsAt: '2026-04-20',
    endsAt: '2026-05-29',
    ctaPath: '/centers',
    ctaLabel: '골프 입문하기',
    productIds: MOCK_PRODUCTS.filter((p) => p.category === 'golf').slice(0, 4).map((p) => p.id),
    eligibility: ['골프 1:1 레슨 첫 결제 회원', '판교/대치/목동/판교역점 한정'],
    notice: ['체험권은 입문 패키지 구매 후 1회 차감 사용됩니다.'],
    bodySections: [
      { heading: '4주에 7번의 클럽 스윙', body: 'KPGA 정회원 전속 강사가 4주 만에 라운드 가능한 자세를 만들어 드립니다.', imageSeed: 'event-4-body-a' },
    ],
  }),
  buildEvent({
    id: 5,
    title: '친구 추천 1만원 적립',
    subtitle: '추천한 친구가 가입하면 양쪽 다 적립',
    description: '친구를 판도에 초대하고, 양쪽 모두 1만원씩 받아가세요.',
    heroSeed: 'event-5-hero',
    startsAt: '2026-01-01',
    endsAt: '2099-12-31',
    ctaPath: '/coupons',
    ctaLabel: '내 추천코드 보러가기',
    productIds: [],
    eligibility: ['추천 코드를 친구에게 공유한 회원', '추천받은 친구가 신규 가입 + 첫 구매 완료'],
    notice: ['적립금은 첫 구매 결제 후 7일 이내 자동 지급됩니다.', '한 ID당 추천 인원은 무제한입니다.'],
    bodySections: [
      { heading: '함께 운동하면 더 즐거워요', body: '판도를 친구에게 추천하고 양쪽 모두 1만원씩 받으세요. 더 많이 추천할수록 더 많이 적립됩니다.', imageSeed: 'event-5-body-a' },
    ],
    isAlways: true,
    badgeLabel: '상시',
  }),
  buildEvent({
    id: 6,
    title: '주말 그룹 GX 무료 체험',
    subtitle: '토요일 오전 GX 클래스 1회 무료',
    description: '판도 모든 지점의 토요일 오전 GX 클래스 1회를 무료로 제공해 드려요.',
    heroSeed: 'event-6-hero',
    startsAt: '2026-04-25',
    endsAt: '2026-05-31',
    ctaPath: '/centers',
    ctaLabel: '주말 GX 예약하기',
    productIds: MOCK_PRODUCTS.filter((p) => p.category === 'spinning').slice(0, 3).map((p) => p.id),
    eligibility: ['판도 가입 회원', 'GX 첫 체험에 한함'],
    notice: ['해당 시간대에 한해 무료 체험이 가능합니다.', '예약 후 노쇼 시 다음 무료 체험은 제한될 수 있습니다.'],
    bodySections: [
      { heading: '주말 아침의 활기', body: '스피닝, 줌바, 에어로빅까지 — 토요일 오전 90분, GX 스튜디오에서 만나요.', imageSeed: 'event-6-body-a' },
    ],
  }),
  buildEvent({
    id: 7,
    title: '5월 가정의 달 패밀리 PT',
    subtitle: '2인 동반 결제 시 30% 할인',
    description: '가족과 함께하는 PT, 두 분이 함께 결제하면 30% 할인해 드려요.',
    heroSeed: 'event-7-hero',
    startsAt: '2026-05-01',
    endsAt: '2026-05-31',
    ctaPath: '/centers',
    ctaLabel: '패밀리 PT 알아보기',
    productIds: MOCK_PRODUCTS.filter((p) => p.category === 'pt').slice(0, 6).map((p) => p.id),
    eligibility: ['2인 동반 PT 결제', '가족/친구/연인 누구나 가능'],
    notice: ['두 회원 모두 동시 진행되어야 할인 적용 유지됩니다.', '한 분 환불 시 할인 차감 후 환급됩니다.'],
    bodySections: [
      { heading: '함께라서 더 즐거운 운동', body: '5월 한 달, 가족·친구·연인과 함께라면 PT 30% 할인.', imageSeed: 'event-7-body-a' },
    ],
  }),
  buildEvent({
    id: 8,
    title: '재활 필라테스 1:1 무료 상담',
    subtitle: '거북목·허리 통증 회원 우선',
    description: '재활 필라테스 전문 강사와의 1:1 상담을 무료로 제공해 드려요.',
    heroSeed: 'event-8-hero',
    startsAt: '2026-04-22',
    endsAt: '2026-05-15',
    ctaPath: '/trainers',
    ctaLabel: '재활 필라테스 강사 보기',
    productIds: MOCK_PRODUCTS.filter((p) => p.category === 'pilates').slice(0, 5).map((p) => p.id),
    eligibility: ['거북목/허리 통증 등 재활 목적 회원'],
    notice: ['상담은 전화 또는 센터 방문으로 진행됩니다.', '결제 의무는 없으나 상담 후 결제 시 5% 추가 할인.'],
    bodySections: [
      { heading: '몸에 맞는 운동, 몸이 알아요', body: '판도 재활 전문 필라테스 강사진이 1:1로 상담해 드립니다.', imageSeed: 'event-8-body-a' },
    ],
  }),
  buildEvent({
    id: 9,
    title: '신규 오픈 — 스포짐 고덕역점',
    subtitle: '오픈 기념 회원권 25% 할인',
    description: '스포짐 고덕역점 오픈 기념 회원권 전품목 25% 할인.',
    heroSeed: 'event-9-hero',
    startsAt: '2026-04-05',
    endsAt: '2026-04-28',
    ctaPath: '/centers/8',
    ctaLabel: '고덕역점 보러가기',
    productIds: MOCK_PRODUCTS.filter((p) => p.centerId === 8).slice(0, 5).map((p) => p.id),
    eligibility: ['고덕역점 첫 결제 회원'],
    notice: ['종료된 이벤트입니다.'],
    bodySections: [
      { heading: '고덕역점이 새롭게 문을 열었습니다', body: 'PT 1:1 프라이빗 룸과 필라테스 룸을 갖춘 종합 헬스장.', imageSeed: 'event-9-body-a' },
    ],
    status: 'ended',
  }),
  buildEvent({
    id: 10,
    title: '바디프로필 챌린지 8주',
    subtitle: '결제 회원 전원 인바디 무료 + 사진 쿠폰',
    description: '판도 인기 강사진과 함께하는 8주 바디프로필 챌린지.',
    heroSeed: 'event-10-hero',
    startsAt: '2026-05-06',
    endsAt: '2026-06-30',
    ctaPath: '/trainers',
    ctaLabel: '챌린지 강사 보기',
    productIds: MOCK_PRODUCTS.filter((p) => p.category === 'pt' && p.sessions && p.sessions >= 20).slice(0, 5).map((p) => p.id),
    eligibility: ['바디프로필 PT 패키지 결제 회원'],
    notice: ['중도 포기 시 부가 혜택은 환급되지 않습니다.', '사진 쿠폰은 제휴 스튜디오에서 사용 가능.'],
    bodySections: [
      { heading: '인생 사진 한 장의 8주', body: '판도 인기 PT 강사진과 함께 8주 바디프로필을 도전하세요.', imageSeed: 'event-10-body-a' },
    ],
  }),
];

export function getEventById(id: number): DiscoverEvent | undefined {
  return MOCK_EVENTS.find((e) => e.id === id);
}

export function formatEventDday(event: DiscoverEvent): string {
  if (event.isAlways) return '상시';
  if (event.daysLeft < 0) return '종료';
  if (event.daysLeft === 0) return 'D-Day';
  return `D-${event.daysLeft}`;
}

export function formatEventPeriod(event: DiscoverEvent): string {
  return `${event.startsAt.replaceAll('-', '.')} ~ ${event.isAlways ? '상시' : event.endsAt.replaceAll('-', '.')}`;
}

// ─────────────────────────────────────────────────────────────
// BEST 랭킹
// ─────────────────────────────────────────────────────────────

export type BestTab = 'center' | 'trainer' | 'product';
export type BestRegion = '전체' | '강남' | '마포' | '송파' | '판교' | '용산' | '대치' | '목동';

export const BEST_REGIONS: BestRegion[] = ['전체', '강남', '마포', '송파', '판교', '용산', '대치', '목동'];

export type BestCategoryId = 'all' | 'fitness' | 'pt' | 'pilates' | 'yoga' | 'golf';

export const BEST_CATEGORIES: { id: BestCategoryId; label: string; emoji: string }[] = [
  { id: 'all', label: '전체', emoji: '🏆' },
  { id: 'fitness', label: '헬스', emoji: '💪' },
  { id: 'pt', label: 'PT', emoji: '🏋️' },
  { id: 'pilates', label: '필라테스', emoji: '🧘‍♀️' },
  { id: 'yoga', label: '요가', emoji: '🧘' },
  { id: 'golf', label: '골프', emoji: '⛳' },
];

/** 지역 매칭 (district/dong 부분 일치) */
function matchesRegion(district: string, dong: string, region: BestRegion): boolean {
  if (region === '전체') return true;
  return district.includes(region) || dong.includes(region);
}

export interface RankedCenter {
  rank: number;
  centerId: number;
  name: string;
  category: string;
  district: string;
  dong: string;
  rating: number;
  reviewCount: number;
  thumbnailUrl: string;
  representativePrice: number;
}

export function getBestCenters(category: BestCategoryId, region: BestRegion): RankedCenter[] {
  const filtered = MOCK_CENTERS.filter((c) => {
    const catMatch = category === 'all' ? true : c.category === category || c.subCategories.includes(category);
    const regMatch = matchesRegion(c.district, c.dong, region);
    return catMatch && regMatch;
  });

  const sorted = [...filtered].sort(
    (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
  );

  return sorted.slice(0, 10).map((c, idx) => ({
    rank: idx + 1,
    centerId: c.id,
    name: c.name,
    category: c.category,
    district: c.district,
    dong: c.dong,
    rating: c.rating,
    reviewCount: c.reviewCount,
    thumbnailUrl: c.thumbnailUrl,
    representativePrice: c.representativeProduct.price,
  }));
}

export interface RankedTrainer {
  rank: number;
  trainerId: number;
  name: string;
  centerName: string;
  category: string;
  rating: number;
  reviewCount: number;
  totalLessons: number;
  experienceYears: number;
  profileUrl: string;
}

export function getBestTrainers(category: BestCategoryId, region: BestRegion): RankedTrainer[] {
  const centerIdsInRegion = new Set(
    MOCK_CENTERS.filter((c) => matchesRegion(c.district, c.dong, region)).map((c) => c.id),
  );

  const filtered = MOCK_TRAINERS.filter((t) => {
    const catMatch = category === 'all' ? true : t.category === category;
    const regMatch = region === '전체' ? true : centerIdsInRegion.has(t.centerId);
    return catMatch && regMatch;
  });

  const sorted = [...filtered].sort(
    (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
  );

  return sorted.slice(0, 10).map((t, idx) => ({
    rank: idx + 1,
    trainerId: t.id,
    name: t.name,
    centerName: t.centerName,
    category: t.category,
    rating: t.rating,
    reviewCount: t.reviewCount,
    totalLessons: t.totalLessons,
    experienceYears: t.experienceYears,
    profileUrl: t.profileUrl,
  }));
}

export interface RankedProduct {
  rank: number;
  productId: number;
  name: string;
  centerId: number;
  centerName: string;
  category: string;
  productCategory: string;
  price: number;
  originalPrice?: number;
  thumbnailUrl: string;
  /** 가상의 판매 회원 수 (랭킹 신뢰도 표시용) */
  buyerCount: number;
}

export function getBestProducts(category: BestCategoryId, region: BestRegion): RankedProduct[] {
  const centerIdsInRegion = new Set(
    MOCK_CENTERS.filter((c) => matchesRegion(c.district, c.dong, region)).map((c) => c.id),
  );

  const filtered = MOCK_PRODUCTS.filter((p) => {
    const catMatch = category === 'all' ? true : p.category === category;
    const regMatch = region === '전체' ? true : centerIdsInRegion.has(p.centerId);
    return catMatch && regMatch;
  });

  /** 판매 점수: 할인율 + 가격 역수 + ID 안정 정렬 */
  const sorted = [...filtered].sort((a, b) => {
    const aDisc = a.originalPrice ? a.originalPrice - a.price : 0;
    const bDisc = b.originalPrice ? b.originalPrice - b.price : 0;
    if (bDisc !== aDisc) return bDisc - aDisc;
    return a.price - b.price;
  });

  return sorted.slice(0, 10).map((p, idx) => ({
    rank: idx + 1,
    productId: p.id,
    name: p.name,
    centerId: p.centerId,
    centerName: p.centerName,
    category: p.category,
    productCategory: p.productCategory,
    price: p.price,
    originalPrice: p.originalPrice,
    thumbnailUrl: p.thumbnailUrl,
    buyerCount: 200 - idx * 13,
  }));
}
