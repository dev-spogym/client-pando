/**
 * 결제/주문 도메인 클라이언트 mock
 *
 * - 결제 옵션 (CheckoutOption): 상품 단건의 강사·시간·시작일·회차 선택
 * - 장바구니 (Cart): 다중 상품 결제 (수량/쿠폰/마일리지)
 * - 주문 (Orders): 결제 + 예약 + 이용 통합 트래킹
 * - 환불 (Refund): 사유/예상 환불액 mock 계산
 * - 결제수단 (PaymentMethods): 등록 카드/페이 관리
 *
 * 모든 영구 저장은 localStorage. supabase 연동은 후속.
 */

import type { MarketProduct, MarketTrainer } from '@/lib/marketplace';

// ─────────────────────────────────────────────────────────────
// localStorage 헬퍼
// ─────────────────────────────────────────────────────────────

const PREFIX = 'orders';
const cartKey = (memberId: number) => `${PREFIX}/cart/${memberId}`;
const ordersKey = (memberId: number) => `${PREFIX}/orders/${memberId}`;
const paymentMethodsKey = (memberId: number) => `${PREFIX}/payment-methods/${memberId}`;

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

// ─────────────────────────────────────────────────────────────
// 옵션 (강사/시간/시작일/회차)
// ─────────────────────────────────────────────────────────────

export interface SessionPlan {
  id: string;
  label: string;
  sessions: number;
  multiplier: number;
}

export const SESSION_PLANS: SessionPlan[] = [
  { id: 'plan-5', label: '5회', sessions: 5, multiplier: 1 },
  { id: 'plan-10', label: '10회', sessions: 10, multiplier: 1.9 },
  { id: 'plan-20', label: '20회', sessions: 20, multiplier: 3.5 },
];

export const TIME_SLOTS = [
  '07:00',
  '09:00',
  '11:00',
  '13:00',
  '15:00',
  '17:00',
  '19:00',
  '21:00',
];

export type WeekdayCode = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export const WEEKDAYS: { code: WeekdayCode; label: string }[] = [
  { code: 'mon', label: '월' },
  { code: 'tue', label: '화' },
  { code: 'wed', label: '수' },
  { code: 'thu', label: '목' },
  { code: 'fri', label: '금' },
  { code: 'sat', label: '토' },
  { code: 'sun', label: '일' },
];

export type StartDateOption = 'today' | 'this-week' | 'next-week';

export const START_DATE_OPTIONS: { id: StartDateOption; label: string; sublabel: string }[] = [
  { id: 'today', label: '오늘 시작', sublabel: '바로 이용 시작' },
  { id: 'this-week', label: '이번 주 시작', sublabel: '주말부터 이용' },
  { id: 'next-week', label: '다음 주부터', sublabel: '천천히 시작' },
];

export interface CheckoutOptionDraft {
  productId: string | number;
  trainerId: number | null;
  weekday: WeekdayCode | null;
  time: string | null;
  startOption: StartDateOption;
  planId: string;
}

// ─────────────────────────────────────────────────────────────
// 장바구니
// ─────────────────────────────────────────────────────────────

export interface CartItem {
  /** UUID-like local id */
  id: string;
  productId: number;
  centerId: number;
  centerName: string;
  productName: string;
  productSubtitle: string;
  thumbnailUrl: string;
  unitPrice: number;
  originalPrice: number;
  quantity: number;
  selected: boolean;
  /** 선택된 옵션 요약 (예: "PT 강사: 김도윤 / 월 09:00 / 10회") */
  optionSummary?: string;
  addedAt: string;
}

export interface CartCoupon {
  id: string;
  name: string;
  discount: number;
  /** 사용 가능 최소 금액 */
  minAmount: number;
}

export const AVAILABLE_COUPONS: CartCoupon[] = [
  { id: 'coupon-welcome', name: '신규 회원 5,000원 할인', discount: 5000, minAmount: 50000 },
  { id: 'coupon-spring-15', name: '봄맞이 15% 할인 (최대 30,000원)', discount: 30000, minAmount: 200000 },
  { id: 'coupon-pt-20', name: 'PT 패키지 20,000원 할인', discount: 20000, minAmount: 300000 },
];

export function getCart(memberId: number): CartItem[] {
  return safeRead<CartItem[]>(cartKey(memberId), []);
}

export function setCart(memberId: number, items: CartItem[]) {
  safeWrite(cartKey(memberId), items);
}

export function addToCart(memberId: number, item: Omit<CartItem, 'id' | 'addedAt' | 'selected'>) {
  const list = getCart(memberId);
  const existing = list.find((it) => it.productId === item.productId && it.optionSummary === item.optionSummary);

  if (existing) {
    existing.quantity += item.quantity;
    setCart(memberId, [...list]);
    return existing;
  }

  const next: CartItem = {
    ...item,
    id: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    addedAt: new Date().toISOString(),
    selected: true,
  };
  const updated = [next, ...list];
  setCart(memberId, updated);
  return next;
}

export function buildCartItemFromProduct(product: MarketProduct): Omit<CartItem, 'id' | 'addedAt' | 'selected'> {
  return {
    productId: product.id,
    centerId: product.centerId,
    centerName: product.centerName,
    productName: product.name,
    productSubtitle: product.duration,
    thumbnailUrl: product.thumbnailUrl,
    unitPrice: product.price,
    originalPrice: product.originalPrice ?? product.price,
    quantity: 1,
  };
}

/** 추천 쿠폰 (최소 금액을 가장 잘 충족하는 것) */
export function pickBestCoupon(amount: number): CartCoupon | null {
  const eligible = AVAILABLE_COUPONS.filter((c) => amount >= c.minAmount);
  if (eligible.length === 0) return null;
  return eligible.reduce((best, current) => (current.discount > best.discount ? current : best));
}

// ─────────────────────────────────────────────────────────────
// 주문 / 예약 통합 내역
// ─────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'confirmed' | 'in_use' | 'completed' | 'cancelled' | 'refunded';

export type OrderTabFilter = 'all' | 'in_progress' | 'completed' | 'cancelled';

export interface OrderTimelineStep {
  status: OrderStatus;
  label: string;
  description: string;
  timestamp: string | null;
}

export interface OrderItem {
  id: string;
  /** 결제 ID 연결 */
  paymentId: string | null;
  productId: number | null;
  productName: string;
  productSubtitle: string;
  thumbnailUrl: string;
  centerName: string;
  /** 옵션 요약 */
  optionSummary: string;
  /** 강사명 */
  trainerName: string | null;
  /** 회차 (PT의 경우 잔여) */
  totalSessions: number | null;
  remainingSessions: number | null;
  startDate: string;
  amount: number;
  originalAmount: number;
  paymentMethod: 'CARD' | 'TRANSFER' | 'NAVERPAY' | 'KAKAOPAY';
  cardLast4: string | null;
  cardCompany: string | null;
  status: OrderStatus;
  /** 상태 별 timestamp */
  timeline: OrderTimelineStep[];
  paidAt: string;
  createdAt: string;
  reviewWritten: boolean;
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: '결제 접수',
  confirmed: '예약 확정',
  in_use: '이용중',
  completed: '이용 완료',
  cancelled: '취소',
  refunded: '환불 완료',
};

export const STATUS_TONE: Record<OrderStatus, 'primary' | 'success' | 'warning' | 'error' | 'neutral'> = {
  pending: 'warning',
  confirmed: 'primary',
  in_use: 'primary',
  completed: 'success',
  cancelled: 'neutral',
  refunded: 'error',
};

function buildTimeline(status: OrderStatus, paidAt: string): OrderTimelineStep[] {
  const ts = (offsetMinutes: number) => {
    const d = new Date(paidAt);
    d.setMinutes(d.getMinutes() + offsetMinutes);
    return d.toISOString();
  };

  const steps: OrderTimelineStep[] = [
    { status: 'pending', label: '결제 완료', description: '결제가 정상 처리되었습니다.', timestamp: paidAt },
    { status: 'confirmed', label: '예약 확정', description: '센터에서 예약을 확정했습니다.', timestamp: null },
    { status: 'in_use', label: '이용 가능', description: '지금부터 이용 가능합니다.', timestamp: null },
    { status: 'completed', label: '이용 완료', description: '이용이 종료되었습니다.', timestamp: null },
  ];

  if (status === 'pending') return steps;

  if (status === 'confirmed' || status === 'in_use' || status === 'completed' || status === 'refunded') {
    steps[1].timestamp = ts(15);
  }
  if (status === 'in_use' || status === 'completed') {
    steps[2].timestamp = ts(60);
  }
  if (status === 'completed') {
    steps[3].timestamp = ts(60 * 24 * 30);
  }

  if (status === 'cancelled' || status === 'refunded') {
    return [
      ...steps.slice(0, 1),
      {
        status,
        label: status === 'refunded' ? '환불 완료' : '주문 취소',
        description: status === 'refunded' ? '환불이 정상 처리되었습니다.' : '주문이 취소되었습니다.',
        timestamp: ts(120),
      },
    ];
  }

  return steps;
}

/** seed mock 주문 (member 기준 첫 진입 시) */
function seedMockOrders(memberId: number): OrderItem[] {
  const now = new Date('2026-04-29T10:00:00.000Z');
  const daysAgo = (n: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return d.toISOString();
  };

  const seed: OrderItem[] = [
    {
      id: `seed-${memberId}-1`,
      paymentId: null,
      productId: null,
      productName: '필라테스 8주 챌린지',
      productSubtitle: '주 2회 / 16회 / 박지민 강사',
      thumbnailUrl: 'https://picsum.photos/seed/order-pilates-8w/600/400',
      centerName: '스포짐 광화문점',
      optionSummary: '박지민 강사 · 월/수 11:00 · 16회',
      trainerName: '박지민',
      totalSessions: 16,
      remainingSessions: 11,
      startDate: daysAgo(20).slice(0, 10),
      amount: 580000,
      originalAmount: 640000,
      paymentMethod: 'CARD',
      cardLast4: '1234',
      cardCompany: '현대카드',
      status: 'in_use',
      timeline: buildTimeline('in_use', daysAgo(21)),
      paidAt: daysAgo(21),
      createdAt: daysAgo(21),
      reviewWritten: false,
    },
    {
      id: `seed-${memberId}-2`,
      paymentId: null,
      productId: null,
      productName: 'PT 10회 패키지',
      productSubtitle: '60일 / 김도윤 강사',
      thumbnailUrl: 'https://picsum.photos/seed/order-pt-10/600/400',
      centerName: '스포짐 광화문점',
      optionSummary: '김도윤 강사 · 화/목 19:00 · 10회',
      trainerName: '김도윤',
      totalSessions: 10,
      remainingSessions: 0,
      startDate: daysAgo(70).slice(0, 10),
      amount: 590000,
      originalAmount: 650000,
      paymentMethod: 'CARD',
      cardLast4: '5678',
      cardCompany: '신한카드',
      status: 'completed',
      timeline: buildTimeline('completed', daysAgo(72)),
      paidAt: daysAgo(72),
      createdAt: daysAgo(72),
      reviewWritten: false,
    },
    {
      id: `seed-${memberId}-3`,
      paymentId: null,
      productId: null,
      productName: '헬스 체험 7일권',
      productSubtitle: '7일 자유이용',
      thumbnailUrl: 'https://picsum.photos/seed/order-trial-7d/600/400',
      centerName: '스포짐 종각점',
      optionSummary: '체험권 · 7일',
      trainerName: null,
      totalSessions: null,
      remainingSessions: null,
      startDate: daysAgo(2).slice(0, 10),
      amount: 9900,
      originalAmount: 19000,
      paymentMethod: 'KAKAOPAY',
      cardLast4: null,
      cardCompany: '카카오페이',
      status: 'confirmed',
      timeline: buildTimeline('confirmed', daysAgo(3)),
      paidAt: daysAgo(3),
      createdAt: daysAgo(3),
      reviewWritten: false,
    },
    {
      id: `seed-${memberId}-4`,
      paymentId: null,
      productId: null,
      productName: '요가 그룹 클래스 1개월',
      productSubtitle: '주 3회 / 4주',
      thumbnailUrl: 'https://picsum.photos/seed/order-yoga-1m/600/400',
      centerName: '스포짐 용산점',
      optionSummary: '조태웅 강사 · 월/수/금 19:00',
      trainerName: '조태웅',
      totalSessions: null,
      remainingSessions: null,
      startDate: daysAgo(90).slice(0, 10),
      amount: 120000,
      originalAmount: 140000,
      paymentMethod: 'CARD',
      cardLast4: '9012',
      cardCompany: '국민카드',
      status: 'cancelled',
      timeline: buildTimeline('cancelled', daysAgo(92)),
      paidAt: daysAgo(92),
      createdAt: daysAgo(92),
      reviewWritten: false,
    },
  ];

  return seed;
}

export function getOrders(memberId: number): OrderItem[] {
  const stored = safeRead<OrderItem[] | null>(ordersKey(memberId), null);
  if (stored && stored.length > 0) return stored;

  // seed
  const seed = seedMockOrders(memberId);
  safeWrite(ordersKey(memberId), seed);
  return seed;
}

export function getOrder(memberId: number, orderId: string): OrderItem | null {
  return getOrders(memberId).find((o) => o.id === orderId) || null;
}

export function setOrders(memberId: number, list: OrderItem[]) {
  safeWrite(ordersKey(memberId), list);
}

export function updateOrder(memberId: number, orderId: string, patch: Partial<OrderItem>) {
  const list = getOrders(memberId);
  const next = list.map((o) => (o.id === orderId ? { ...o, ...patch } : o));
  setOrders(memberId, next);
  return next.find((o) => o.id === orderId) || null;
}

export function cancelOrder(memberId: number, orderId: string) {
  const order = getOrder(memberId, orderId);
  if (!order) return null;
  return updateOrder(memberId, orderId, {
    status: 'cancelled',
    timeline: buildTimeline('cancelled', order.paidAt),
  });
}

export function refundOrder(memberId: number, orderId: string, refundAmount: number) {
  const order = getOrder(memberId, orderId);
  if (!order) return null;
  return updateOrder(memberId, orderId, {
    status: 'refunded',
    amount: Math.max(0, order.amount - refundAmount),
    timeline: buildTimeline('refunded', order.paidAt),
  });
}

export function createOrderFromCart(
  memberId: number,
  payload: {
    items: CartItem[];
    paymentMethod: OrderItem['paymentMethod'];
    cardLast4: string | null;
    cardCompany: string | null;
    couponDiscount: number;
    mileageUsed: number;
  }
) {
  const list = getOrders(memberId);
  const now = new Date();
  const created: OrderItem[] = payload.items.map((item, index) => {
    const itemTotalOriginal = item.unitPrice * item.quantity;
    // 비례 분배
    const totalOriginal = payload.items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
    const ratio = totalOriginal === 0 ? 0 : itemTotalOriginal / totalOriginal;
    const allocatedDiscount = Math.round((payload.couponDiscount + payload.mileageUsed) * ratio);
    const finalAmount = Math.max(0, itemTotalOriginal - allocatedDiscount);
    const paidAt = new Date(now.getTime() + index).toISOString();

    return {
      id: `order-${Date.now()}-${index}`,
      paymentId: null,
      productId: item.productId,
      productName: item.productName,
      productSubtitle: item.productSubtitle,
      thumbnailUrl: item.thumbnailUrl,
      centerName: item.centerName,
      optionSummary: item.optionSummary || '기본 옵션',
      trainerName: null,
      totalSessions: null,
      remainingSessions: null,
      startDate: now.toISOString().slice(0, 10),
      amount: finalAmount,
      originalAmount: itemTotalOriginal,
      paymentMethod: payload.paymentMethod,
      cardLast4: payload.cardLast4,
      cardCompany: payload.cardCompany,
      status: 'confirmed',
      timeline: buildTimeline('confirmed', paidAt),
      paidAt,
      createdAt: paidAt,
      reviewWritten: false,
    };
  });

  setOrders(memberId, [...created, ...list]);
  return created;
}

// ─────────────────────────────────────────────────────────────
// 환불
// ─────────────────────────────────────────────────────────────

export type RefundReason =
  | 'change_of_mind'
  | 'service_dissatisfaction'
  | 'schedule_conflict'
  | 'other';

export const REFUND_REASONS: { id: RefundReason; label: string; description: string }[] = [
  {
    id: 'change_of_mind',
    label: '단순 변심',
    description: '구매 의사가 변경되었습니다.',
  },
  {
    id: 'service_dissatisfaction',
    label: '서비스 불만족',
    description: '시설/강사/품질에 만족하지 않습니다.',
  },
  {
    id: 'schedule_conflict',
    label: '일정 변경 불가',
    description: '예약 일정이 맞지 않습니다.',
  },
  {
    id: 'other',
    label: '기타',
    description: '직접 입력해 주세요.',
  },
];

export interface RefundEstimate {
  /** 환불 비율 (0 ~ 1) */
  ratio: number;
  refundAmount: number;
  policy: string;
}

export function estimateRefund(order: OrderItem): RefundEstimate {
  // 회차 기반 환불
  if (order.totalSessions && order.remainingSessions !== null) {
    const used = order.totalSessions - order.remainingSessions;
    const remainingRatio = order.remainingSessions / order.totalSessions;
    if (used === 0) {
      return {
        ratio: 1,
        refundAmount: order.amount,
        policy: '이용 시작 전 — 100% 환불 가능합니다.',
      };
    }
    const refundAmount = Math.floor(order.amount * remainingRatio);
    return {
      ratio: remainingRatio,
      refundAmount,
      policy: `잔여 회차 ${order.remainingSessions}회 / 총 ${order.totalSessions}회 — 잔여 비율로 환불됩니다.`,
    };
  }

  // 기간제: 결제일 기준
  const daysSincePaid = Math.max(0, Math.floor((Date.now() - new Date(order.paidAt).getTime()) / (1000 * 60 * 60 * 24)));
  if (daysSincePaid <= 7) {
    return {
      ratio: 1,
      refundAmount: order.amount,
      policy: '결제 후 7일 이내 — 100% 환불 가능합니다.',
    };
  }
  if (daysSincePaid <= 30) {
    return {
      ratio: 0.7,
      refundAmount: Math.floor(order.amount * 0.7),
      policy: '결제 후 30일 이내 — 70% 환불 가능합니다.',
    };
  }
  return {
    ratio: 0.3,
    refundAmount: Math.floor(order.amount * 0.3),
    policy: '결제 후 30일 초과 — 위약금 차감 후 30% 환불됩니다.',
  };
}

export function isRefundable(order: OrderItem): boolean {
  return order.status === 'confirmed' || order.status === 'in_use' || order.status === 'pending';
}

export function isCancelable(order: OrderItem): boolean {
  return order.status === 'pending' || order.status === 'confirmed';
}

// ─────────────────────────────────────────────────────────────
// 결제수단 (등록 카드/페이)
// ─────────────────────────────────────────────────────────────

export type PaymentMethodKind = 'card' | 'kakaopay' | 'naverpay';

export interface SavedPaymentMethod {
  id: string;
  kind: PaymentMethodKind;
  /** 카드사 또는 페이명 */
  company: string;
  /** 카드: 끝 4자리 / 페이: 연결된 계정 일부 */
  last4: string;
  /** 카드 만료일 (페이는 null) */
  expiry: string | null;
  isDefault: boolean;
  /** 페이 연결 활성화 여부 (페이 한정) */
  enabled: boolean;
}

const DEFAULT_PAYMENT_METHODS: SavedPaymentMethod[] = [
  {
    id: 'pm-visa-1',
    kind: 'card',
    company: '현대카드 M Edition2',
    last4: '1234',
    expiry: '12/27',
    isDefault: true,
    enabled: true,
  },
  {
    id: 'pm-master-2',
    kind: 'card',
    company: '신한카드 더모아',
    last4: '5678',
    expiry: '08/26',
    isDefault: false,
    enabled: true,
  },
  {
    id: 'pm-kb-3',
    kind: 'card',
    company: '국민 노리 체크',
    last4: '9012',
    expiry: '03/28',
    isDefault: false,
    enabled: true,
  },
  {
    id: 'pm-kakaopay',
    kind: 'kakaopay',
    company: '카카오페이',
    last4: '****',
    expiry: null,
    isDefault: false,
    enabled: true,
  },
  {
    id: 'pm-naverpay',
    kind: 'naverpay',
    company: '네이버페이',
    last4: '****',
    expiry: null,
    isDefault: false,
    enabled: false,
  },
];

export function getPaymentMethods(memberId: number): SavedPaymentMethod[] {
  const stored = safeRead<SavedPaymentMethod[] | null>(paymentMethodsKey(memberId), null);
  if (stored && stored.length > 0) return stored;
  safeWrite(paymentMethodsKey(memberId), DEFAULT_PAYMENT_METHODS);
  return DEFAULT_PAYMENT_METHODS;
}

export function setPaymentMethods(memberId: number, list: SavedPaymentMethod[]) {
  safeWrite(paymentMethodsKey(memberId), list);
}

export function updatePaymentMethod(
  memberId: number,
  methodId: string,
  patch: Partial<SavedPaymentMethod>
) {
  const list = getPaymentMethods(memberId);
  const next = list.map((m) => (m.id === methodId ? { ...m, ...patch } : m));
  setPaymentMethods(memberId, next);
  return next;
}

export function setDefaultPaymentMethod(memberId: number, methodId: string) {
  const list = getPaymentMethods(memberId);
  const next = list.map((m) => ({ ...m, isDefault: m.id === methodId }));
  setPaymentMethods(memberId, next);
  return next;
}

export function removePaymentMethod(memberId: number, methodId: string) {
  const list = getPaymentMethods(memberId).filter((m) => m.id !== methodId);
  // 기본 결제 보장
  if (!list.some((m) => m.isDefault) && list[0]) list[0].isDefault = true;
  setPaymentMethods(memberId, list);
  return list;
}

// ─────────────────────────────────────────────────────────────
// 옵션 화면 빌더 (강사 → 옵션 요약)
// ─────────────────────────────────────────────────────────────

export function buildOptionSummary(params: {
  trainer: MarketTrainer | null;
  weekday: WeekdayCode | null;
  time: string | null;
  plan: SessionPlan;
  startOption: StartDateOption;
}): string {
  const parts: string[] = [];
  if (params.trainer) parts.push(`${params.trainer.name} 강사`);
  if (params.weekday && params.time) {
    const wd = WEEKDAYS.find((w) => w.code === params.weekday)?.label || params.weekday;
    parts.push(`${wd} ${params.time}`);
  }
  parts.push(params.plan.label);
  if (params.startOption !== 'today') {
    const start = START_DATE_OPTIONS.find((o) => o.id === params.startOption);
    if (start) parts.push(start.label);
  }
  return parts.join(' · ');
}
