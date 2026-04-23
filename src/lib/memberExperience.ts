import type { MemberProfile } from '@/stores/authStore';

export interface OnboardingDraft {
  goals: string[];
  workoutStyle: string;
  painAreas: string[];
  bodyFocus: string;
  preferredDays: string[];
  preferredDuration: string;
  recommendedTitle: string;
  recommendedSummary: string;
  recommendedRoutine: string[];
  completedAt: string | null;
}

export interface WaitlistEntry {
  classId: number;
  title: string;
  type: string;
  staffId: number;
  staffName: string;
  room: string | null;
  startTime: string;
  endTime: string;
  position: number;
  status: 'waiting' | 'promoted' | 'cancelled';
  autoPromoted: boolean;
  createdAt: string;
}

export interface ReservationEntry {
  classId: number;
  title: string;
  type: string;
  staffId?: number | null;
  staffName: string;
  startTime: string;
  endTime: string;
  room: string | null;
  status: 'reserved' | 'completed' | 'cancelled';
  source?: 'class' | 'trainer_request' | 'trainer_assignment';
  createdAt: string;
  completedAt?: string | null;
}

export interface LessonFeedbackEntry {
  classId: number;
  title: string;
  staffName: string;
  rating: number;
  tags: string[];
  comment: string;
  npsScore: number | null;
  createdAt: string;
}

export interface MemberSettings {
  reservationPush: boolean;
  membershipPush: boolean;
  paymentPush: boolean;
  marketingPush: boolean;
  noticePush: boolean;
}

export interface NotificationItem {
  id: string;
  category: 'reservation' | 'membership' | 'reward' | 'notice' | 'system';
  title: string;
  body: string;
  createdAt: string;
  route: string;
  actionLabel: string;
  read: boolean;
}

export interface BadgeStats {
  mileage: number;
  onboardingComplete: boolean;
  feedbackCount: number;
  attendanceCount: number;
  bodyRecordCount: number;
}

export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  condition: string;
  icon: string;
  tone: 'gold' | 'blue' | 'green' | 'rose';
  earned: boolean;
  progressText: string;
}

export interface InstructorProfile {
  id: number;
  name: string;
  careerYears: number;
  intro: string;
  specialties: string[];
  availablePrograms: string[];
  nextSlots: string[];
  rating: number;
  reviewCount: number;
  focusAreas: string[];
}

export interface RenewalPlan {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  badge: string;
  description: string;
  benefits: string[];
}

export interface FmsSection {
  title: string;
  score: number;
  status: 'good' | 'watch' | 'care';
  summary: string;
}

export interface FmsReport {
  totalScore: number;
  postureSummary: string;
  sections: FmsSection[];
  coachComment: string;
}

export type ProductCategory = 'gym' | 'golf' | 'pt' | 'golf_lesson' | 'locker' | 'renewal';
export type PaymentMethod = 'CARD' | 'TRANSFER' | 'NAVERPAY' | 'KAKAOPAY';

export interface ShopProduct {
  id: string;
  name: string;
  category: ProductCategory;
  subtitle: string;
  description: string;
  price: number;
  originalPrice: number;
  durationText: string;
  sessionsText?: string;
  recommended?: boolean;
  paymentNote: string;
  benefits: string[];
  tags: string[];
}

export interface MockPaymentRecord {
  id: string;
  productId: string | null;
  productName: string;
  category: ProductCategory;
  amount: number;
  originalAmount: number;
  mileageUsed: number;
  paymentMethod: PaymentMethod;
  status: 'COMPLETED';
  saleDate: string;
  cardCompany: string | null;
  receiptTitle: string;
  orderMemo: string | null;
}

export interface MemberConsentState {
  serviceTerms: boolean;
  privacyPolicy: boolean;
  thirdPartyData: boolean;
  marketingSms: boolean;
  marketingEmail: boolean;
  marketingPush: boolean;
  serviceAcceptedAt: string | null;
  privacyAcceptedAt: string | null;
  thirdPartyAcceptedAt: string | null;
  updatedAt: string | null;
}

export interface WithdrawalRequest {
  requestedAt: string | null;
  reason: string;
  details: string;
  status: 'none' | 'requested';
}

export interface GolfInstructorSlot {
  id: string;
  instructorId: number;
  instructorName: string;
  lessonName: string;
  dateLabel: string;
  timeLabel: string;
  bayLabel: string;
  price: number;
  available: boolean;
}

export interface GolfCoachBooking {
  id: string;
  instructorId: number;
  instructorName: string;
  lessonName: string;
  dateLabel: string;
  timeLabel: string;
  bayLabel: string;
  price: number;
  status: 'reserved';
  createdAt: string;
}

const DEFAULT_ONBOARDING: OnboardingDraft = {
  goals: [],
  workoutStyle: '',
  painAreas: [],
  bodyFocus: '',
  preferredDays: [],
  preferredDuration: '',
  recommendedTitle: '기본 루틴을 준비해 주세요',
  recommendedSummary: '운동 목적과 현재 상태를 입력하면 첫 루틴을 제안합니다.',
  recommendedRoutine: [],
  completedAt: null,
};

const DEFAULT_SETTINGS: MemberSettings = {
  reservationPush: true,
  membershipPush: true,
  paymentPush: true,
  marketingPush: false,
  noticePush: true,
};

function buildDefaultConsents(): MemberConsentState {
  const now = new Date().toISOString();
  return {
    serviceTerms: true,
    privacyPolicy: true,
    thirdPartyData: true,
    marketingSms: false,
    marketingEmail: false,
    marketingPush: false,
    serviceAcceptedAt: now,
    privacyAcceptedAt: now,
    thirdPartyAcceptedAt: now,
    updatedAt: now,
  };
}

const DEFAULT_WITHDRAWAL_REQUEST: WithdrawalRequest = {
  requestedAt: null,
  reason: '',
  details: '',
  status: 'none',
};

const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: 'gym-1m',
    name: '헬스장 자유이용 1개월',
    category: 'gym',
    subtitle: '가볍게 시작하는 기본 이용권',
    description: '헬스장 일반 이용 회원을 위한 월간 이용권입니다. 러닝머신, 웨이트존, 스트레칭존 이용이 가능합니다.',
    price: 129000,
    originalPrice: 149000,
    durationText: '30일',
    paymentNote: '카드, 계좌이체, 네이버페이 결제 가능',
    benefits: ['헬스장 자유 이용', '출석 배지 미션 포함', '마일리지 1,290P 적립'],
    tags: ['헬스장', '자유이용', '월간'],
  },
  {
    id: 'gym-3m',
    name: '헬스장 자유이용 3개월',
    category: 'gym',
    subtitle: '가장 많이 선택하는 장기 이용권',
    description: '일반 헬스장 회원권을 3개월 단위로 결제하는 플랜입니다.',
    price: 329000,
    originalPrice: 387000,
    durationText: '90일',
    recommended: true,
    paymentNote: '카드, 계좌이체, 네이버페이 결제 가능',
    benefits: ['헬스장 자유 이용', '락커 우선 배정 안내', '마일리지 3,290P 적립'],
    tags: ['헬스장', '장기권', '인기'],
  },
  {
    id: 'golf-1m',
    name: '골프장 이용권 1개월',
    category: 'golf',
    subtitle: '연습 타석 중심 이용권',
    description: '실내 골프 연습 타석을 예약해 이용하는 회원권입니다.',
    price: 189000,
    originalPrice: 219000,
    durationText: '30일',
    paymentNote: '카드, 계좌이체, 네이버페이 결제 가능',
    benefits: ['골프 타석 예약', '주중 저녁 시간 우선 예약', '마일리지 1,890P 적립'],
    tags: ['골프장', '타석이용', '월간'],
  },
  {
    id: 'golf-3m',
    name: '골프장 이용권 3개월',
    category: 'golf',
    subtitle: '골프장 장기 이용 회원권',
    description: '골프장 정규 회원용 3개월 이용권입니다. 타석 예약과 레슨 예약 전용 혜택이 포함됩니다.',
    price: 489000,
    originalPrice: 567000,
    durationText: '90일',
    paymentNote: '카드, 계좌이체, 네이버페이 결제 가능',
    benefits: ['골프 타석 예약', '골프 강사 예약 우선권', '마일리지 4,890P 적립'],
    tags: ['골프장', '장기권', '우선예약'],
  },
  {
    id: 'pt-10',
    name: 'PT 10회 패키지',
    category: 'pt',
    subtitle: '가장 표준적인 개인 트레이닝 패키지',
    description: '기초 체력, 다이어트, 근력 향상을 위한 1:1 개인 PT 패키지입니다.',
    price: 590000,
    originalPrice: 650000,
    durationText: '60일',
    sessionsText: '10회',
    paymentNote: '카드, 계좌이체, 네이버페이, 카카오페이 결제 가능',
    benefits: ['1:1 PT 10회', '운동일지 코칭', '체성분 점검 포함'],
    tags: ['PT', '개인레슨', '10회'],
  },
  {
    id: 'golf-lesson-4',
    name: '골프 레슨 4회 패키지',
    category: 'golf_lesson',
    subtitle: '입문자/교정형 레슨 패키지',
    description: '골프 강사 예약과 함께 사용하는 1:1 골프 레슨 패키지입니다.',
    price: 420000,
    originalPrice: 460000,
    durationText: '45일',
    sessionsText: '4회',
    paymentNote: '카드, 계좌이체, 네이버페이 결제 가능',
    benefits: ['골프 강사 1:1 레슨 4회', '스윙 피드백', '예약 우선권'],
    tags: ['골프', '레슨', '패키지'],
  },
  {
    id: 'renewal-growth',
    name: '재등록 그로스 플랜',
    category: 'renewal',
    subtitle: '회원 유지와 추가 운동을 함께 고려한 플랜',
    description: '기존 회원권 연장과 함께 PT 또는 골프 레슨을 추가로 고려하는 회원용 재등록 플랜입니다.',
    price: 249000,
    originalPrice: 289000,
    durationText: '맞춤',
    paymentNote: '카드, 계좌이체, 네이버페이 결제 가능',
    benefits: ['재등록 전용 혜택', '마일리지 5,000P 적립', '추가 OT 1회'],
    tags: ['재등록', '추천'],
  },
];

const GOLF_INSTRUCTOR_SLOTS: GolfInstructorSlot[] = [
  {
    id: 'golf-slot-1',
    instructorId: 2,
    instructorName: '이준호',
    lessonName: '드라이버 교정 레슨',
    dateLabel: '4월 23일 목요일',
    timeLabel: '19:00 - 19:50',
    bayLabel: 'G-03',
    price: 105000,
    available: true,
  },
  {
    id: 'golf-slot-2',
    instructorId: 2,
    instructorName: '이준호',
    lessonName: '숏게임 집중 레슨',
    dateLabel: '4월 24일 금요일',
    timeLabel: '20:00 - 20:50',
    bayLabel: 'G-05',
    price: 115000,
    available: true,
  },
  {
    id: 'golf-slot-3',
    instructorId: 4,
    instructorName: '정하늘',
    lessonName: '입문자 자세 교정',
    dateLabel: '4월 26일 일요일',
    timeLabel: '11:00 - 11:50',
    bayLabel: 'G-01',
    price: 99000,
    available: true,
  },
];

const INSTRUCTOR_PROFILES: Record<number, InstructorProfile> = {
  1: {
    id: 1,
    name: '박서연',
    careerYears: 7,
    intro: '체형 교정과 초보자 PT에 강한 트레이너입니다. 무리하지 않고 루틴을 만드는 데 집중합니다.',
    specialties: ['체형 교정', '초보자 PT', '여성 근력'],
    availablePrograms: ['PT', 'OT1', 'OT2', '기초 GX'],
    nextSlots: ['화 18:00', '목 07:30', '토 10:00'],
    rating: 4.8,
    reviewCount: 128,
    focusAreas: ['골반 정렬', '코어 안정화', '기초 근력'],
  },
  2: {
    id: 2,
    name: '이준호',
    careerYears: 11,
    intro: '드라이버 교정과 숏게임 레슨을 전문으로 합니다. 골프 입문자에게 친절한 피드백을 제공합니다.',
    specialties: ['골프 레슨', '드라이버 교정', '숏게임'],
    availablePrograms: ['골프 레슨', '스윙 분석', '타석 교정'],
    nextSlots: ['수 19:00', '금 20:00', '일 11:00'],
    rating: 4.9,
    reviewCount: 74,
    focusAreas: ['어드레스', '백스윙 궤도', '임팩트 타이밍'],
  },
  3: {
    id: 3,
    name: '김예린',
    careerYears: 5,
    intro: '그룹 수업 운영과 유연성 향상 루틴에 강점이 있습니다. GX 초심자 적응을 돕는 수업을 진행합니다.',
    specialties: ['GX', '스트레칭', '다이어트 프로그램'],
    availablePrograms: ['GX', '필라테스 베이직', '스트레칭 클래스'],
    nextSlots: ['월 19:30', '수 08:00', '금 18:30'],
    rating: 4.7,
    reviewCount: 96,
    focusAreas: ['유연성 향상', '하체 밸런스', '유산소 루틴'],
  },
};

function isBrowser() {
  return typeof window !== 'undefined';
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function readArray<T>(key: string): T[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeJson(key: string, value: unknown) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function onboardingKey(memberId: number) {
  return `spogym-onboarding-${memberId}`;
}

function waitlistKey(memberId: number) {
  return `spogym-waitlist-${memberId}`;
}

function reservationKey(memberId: number) {
  return `spogym-reservations-${memberId}`;
}

function feedbackKey(memberId: number) {
  return `spogym-feedback-${memberId}`;
}

function settingsKey(memberId: number) {
  return `spogym-settings-${memberId}`;
}

function notificationReadKey(memberId: number) {
  return `spogym-notification-read-${memberId}`;
}

function paymentsKey(memberId: number) {
  return `spogym-payments-${memberId}`;
}

function consentsKey(memberId: number) {
  return `spogym-consents-${memberId}`;
}

function withdrawalKey(memberId: number) {
  return `spogym-withdrawal-${memberId}`;
}

function golfBookingKey(memberId: number) {
  return `spogym-golf-bookings-${memberId}`;
}

export function loadOnboarding(memberId: number): OnboardingDraft {
  return readJson<OnboardingDraft>(onboardingKey(memberId), DEFAULT_ONBOARDING);
}

export function saveOnboarding(memberId: number, draft: OnboardingDraft) {
  writeJson(onboardingKey(memberId), draft);
}

export function completeOnboarding(memberId: number, draft: OnboardingDraft) {
  saveOnboarding(memberId, {
    ...draft,
    completedAt: new Date().toISOString(),
  });
}

export function isOnboardingComplete(memberId: number) {
  return Boolean(loadOnboarding(memberId).completedAt);
}

export function buildRoutineSuggestion(draft: OnboardingDraft) {
  const focus = draft.goals[0] || '기초 체력';
  const intensity = draft.workoutStyle || '밸런스';
  const bodyFocus = draft.bodyFocus || '전신 적응';
  const routine = [
    `${bodyFocus} 준비 운동 10분`,
    `${focus} 중심 메인 세션 25분`,
    `${intensity} 강도 유산소 15분`,
    '마무리 스트레칭 10분',
  ];

  return {
    title: `${focus} 중심 스타터 루틴`,
    summary: `${bodyFocus}와 ${intensity} 강도를 기준으로 1주 차 루틴을 제안합니다.`,
    routine,
  };
}

export function getReservations(memberId: number) {
  return readArray<ReservationEntry>(reservationKey(memberId))
    .filter((entry) => entry.status === 'reserved')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
}

export function getAllReservations(memberId: number) {
  return readArray<ReservationEntry>(reservationKey(memberId)).sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
}

export function getReservation(memberId: number, classId: number) {
  return getReservations(memberId).find((entry) => entry.classId === classId) || null;
}

export function upsertReservation(memberId: number, entry: Omit<ReservationEntry, 'createdAt' | 'status'>) {
  const list = readArray<ReservationEntry>(reservationKey(memberId)).filter((item) => item.classId !== entry.classId);
  list.push({
    ...entry,
    createdAt: new Date().toISOString(),
    status: 'reserved',
    completedAt: null,
  });
  writeJson(reservationKey(memberId), list);
}

export function markReservationCompleted(memberId: number, classId: number, completedAt?: string) {
  const nextCompletedAt = completedAt ?? new Date().toISOString();
  const list = readArray<ReservationEntry>(reservationKey(memberId)).map((entry) =>
    entry.classId === classId
      ? { ...entry, status: 'completed' as const, completedAt: nextCompletedAt }
      : entry
  );
  writeJson(reservationKey(memberId), list);
}

export function cancelReservation(memberId: number, classId: number) {
  const list = readArray<ReservationEntry>(reservationKey(memberId)).map((entry) =>
    entry.classId === classId && entry.status !== 'completed'
      ? { ...entry, status: 'cancelled' as const }
      : entry
  );
  writeJson(reservationKey(memberId), list);
}

export function getWaitlistEntries(memberId: number) {
  return readArray<WaitlistEntry>(waitlistKey(memberId));
}

export function getWaitlistEntry(memberId: number, classId: number) {
  return getWaitlistEntries(memberId).find((entry) => entry.classId === classId && entry.status !== 'cancelled') || null;
}

export function addWaitlistEntry(memberId: number, entry: Omit<WaitlistEntry, 'createdAt' | 'position' | 'status'>) {
  const list = getWaitlistEntries(memberId);
  const existing = list.find((item) => item.classId === entry.classId && item.status !== 'cancelled');
  if (existing) return existing;

  const waitingCount = list.filter((item) => item.status === 'waiting').length;
  const next: WaitlistEntry = {
    ...entry,
    createdAt: new Date().toISOString(),
    position: waitingCount + 1,
    status: 'waiting',
  };

  writeJson(waitlistKey(memberId), [next, ...list]);
  return next;
}

export function cancelWaitlistEntry(memberId: number, classId: number) {
  const list = getWaitlistEntries(memberId).map((entry) =>
    entry.classId === classId ? { ...entry, status: 'cancelled' as const } : entry
  );
  writeJson(waitlistKey(memberId), list);
}

export function getFeedbackEntries(memberId: number) {
  return readArray<LessonFeedbackEntry>(feedbackKey(memberId));
}

export function getFeedbackByClass(memberId: number, classId: number) {
  return getFeedbackEntries(memberId).find((entry) => entry.classId === classId) || null;
}

export function saveFeedback(memberId: number, entry: LessonFeedbackEntry) {
  const list = getFeedbackEntries(memberId).filter((item) => item.classId !== entry.classId);
  list.unshift(entry);
  writeJson(feedbackKey(memberId), list);
}

export function loadMemberSettings(memberId: number) {
  return readJson<MemberSettings>(settingsKey(memberId), DEFAULT_SETTINGS);
}

export function saveMemberSettings(memberId: number, settings: MemberSettings) {
  writeJson(settingsKey(memberId), settings);
}

function getReadNotificationIds(memberId: number) {
  return readArray<string>(notificationReadKey(memberId));
}

export function markNotificationRead(memberId: number, notificationId: string) {
  const readIds = new Set(getReadNotificationIds(memberId));
  readIds.add(notificationId);
  writeJson(notificationReadKey(memberId), Array.from(readIds));
}

export function getNotificationItems(member: MemberProfile) {
  const onboarding = loadOnboarding(member.id);
  const waitlists = getWaitlistEntries(member.id).filter((entry) => entry.status === 'waiting');
  const readIds = new Set(getReadNotificationIds(member.id));

  const base: NotificationItem[] = [
    {
      id: 'membership-expiry',
      category: 'membership',
      title: '이용권 만료 알림',
      body: member.membershipExpiry
        ? `이용권 만료일은 ${member.membershipExpiry.slice(0, 10)}입니다. 재등록 추천 플랜을 확인해보세요.`
        : '이용권 정보를 확인하고 재등록 플랜을 검토해보세요.',
      createdAt: new Date().toISOString(),
      route: '/renewal',
      actionLabel: '플랜 보기',
      read: readIds.has('membership-expiry'),
    },
    {
      id: 'reward-center',
      category: 'reward',
      title: '마일리지와 배지를 확인해 주세요',
      body: '결제 리워드는 마일리지로 통합 운영되며, 활동 배지는 별도로 수집할 수 있습니다.',
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      route: '/coupons?tab=badge',
      actionLabel: '배지 보기',
      read: readIds.has('reward-center'),
    },
    {
      id: 'notice-center',
      category: 'notice',
      title: '센터 공지와 이벤트를 확인해 주세요',
      body: '휴관, 운영시간 변경, 프로모션은 알림센터와 공지사항에서 함께 확인할 수 있습니다.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      route: '/notices',
      actionLabel: '공지 보기',
      read: readIds.has('notice-center'),
    },
  ];

  if (!onboarding.completedAt) {
    base.unshift({
      id: 'onboarding-pending',
      category: 'system',
      title: '운동 목적과 통증 정보를 입력해 주세요',
      body: '온보딩을 완료하면 첫 루틴 추천과 FMS 요약을 더 정확하게 보여드립니다.',
      createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      route: '/onboarding',
      actionLabel: '온보딩 시작',
      read: readIds.has('onboarding-pending'),
    });
  }

  waitlists.forEach((entry) => {
    const id = `waitlist-${entry.classId}`;
    base.unshift({
      id,
      category: 'reservation',
      title: `${entry.title} 대기 ${entry.position}번`,
      body: `${entry.staffName} 강사 · ${entry.autoPromoted ? '자동 확정 알림 활성화' : '수동 확인 필요'}`,
      createdAt: entry.createdAt,
      route: '/waitlist',
      actionLabel: '대기 현황',
      read: readIds.has(id),
    });
  });

  return base.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getUnreadNotificationCount(member: MemberProfile) {
  return getNotificationItems(member).filter((item) => !item.read).length;
}

export function buildBadgeCollection(stats: BadgeStats): BadgeItem[] {
  const badgeDefinitions = [
    {
      id: 'welcome',
      title: '앱 스타터',
      description: '앱 연동과 첫 로그인 완료',
      condition: '앱 연동 완료',
      icon: 'Sparkles',
      tone: 'gold' as const,
      earned: true,
      progressText: '획득 완료',
    },
    {
      id: 'onboarding',
      title: '목표 설정 완료',
      description: '운동 목적, 성향, 통증 정보를 입력하고 첫 루틴을 생성했습니다.',
      condition: '온보딩 완료',
      icon: 'Target',
      tone: 'blue' as const,
      earned: stats.onboardingComplete,
      progressText: stats.onboardingComplete ? '획득 완료' : '온보딩을 완료해 주세요',
    },
    {
      id: 'feedback',
      title: '피드백 메이커',
      description: '수업 후기 1회 이상 작성',
      condition: '후기 1회',
      icon: 'MessageSquare',
      tone: 'green' as const,
      earned: stats.feedbackCount >= 1,
      progressText: `${Math.min(stats.feedbackCount, 1)}/1 후기`,
    },
    {
      id: 'attendance',
      title: '출석 루키',
      description: '출석 10회를 달성했습니다.',
      condition: '출석 10회',
      icon: 'CalendarCheck',
      tone: 'rose' as const,
      earned: stats.attendanceCount >= 10,
      progressText: `${Math.min(stats.attendanceCount, 10)}/10 출석`,
    },
    {
      id: 'body-report',
      title: '리포트 수집가',
      description: '체성분 또는 FMS 기록 3회 이상 누적',
      condition: '리포트 3회',
      icon: 'LineChart',
      tone: 'blue' as const,
      earned: stats.bodyRecordCount >= 3,
      progressText: `${Math.min(stats.bodyRecordCount, 3)}/3 기록`,
    },
    {
      id: 'mileage',
      title: '마일리지 클럽',
      description: '마일리지 5,000P 이상 보유',
      condition: '마일리지 5,000P',
      icon: 'Coins',
      tone: 'gold' as const,
      earned: stats.mileage >= 5000,
      progressText: `${Math.min(stats.mileage, 5000).toLocaleString()} / 5,000P`,
    },
  ];

  return badgeDefinitions;
}

export function getInstructorProfile(id: number, fallbackName?: string): InstructorProfile {
  return INSTRUCTOR_PROFILES[id] || {
    id,
    name: fallbackName || '담당 강사',
    careerYears: 4,
    intro: '예약 전 확인할 수 있는 기본 프로필입니다. 세부 커리어는 CRM 공개 설정에 따라 확장됩니다.',
    specialties: ['기초 체력', '맞춤 코칭', '수업 운영'],
    availablePrograms: ['PT', 'GX'],
    nextSlots: ['화 18:00', '목 19:00'],
    rating: 4.6,
    reviewCount: 32,
    focusAreas: ['루틴 적응', '운동 습관 형성'],
  };
}

export function getInstructorProfiles(program?: string) {
  const list = Object.values(INSTRUCTOR_PROFILES);
  if (!program) return list;
  return list.filter((item) => item.availablePrograms.includes(program));
}

export function buildRenewalPlans(member: MemberProfile): RenewalPlan[] {
  const baseName = member.membershipType || '회원권';

  return [
    {
      id: 'light',
      name: `${baseName} 라이트`,
      price: 129000,
      originalPrice: 149000,
      badge: '추천',
      description: '현재 이용 패턴을 유지하고 싶은 회원용',
      benefits: ['기존 회원권 연장', '마일리지 2,000P', '출석 배지 가속'],
    },
    {
      id: 'growth',
      name: `${baseName} 그로스`,
      price: 249000,
      originalPrice: 289000,
      badge: '인기',
      description: 'PT/GX를 함께 늘리고 싶은 회원용',
      benefits: ['추가 OT 1회', '마일리지 5,000P', '배지 미션 2개 해금'],
    },
    {
      id: 'signature',
      name: `${baseName} 시그니처`,
      price: 399000,
      originalPrice: 459000,
      badge: '프리미엄',
      description: '장기 회원 유지와 체형 관리 집중형',
      benefits: ['체성분/FMS 점검', '전용 상담', '마일리지 10,000P'],
    },
  ];
}

export function buildFmsReport(memberId: number): FmsReport {
  const onboarding = loadOnboarding(memberId);
  const painAreas = onboarding.painAreas;
  const sections: FmsSection[] = [
    {
      title: '어깨 가동성',
      score: painAreas.includes('어깨') ? 1 : 2,
      status: painAreas.includes('어깨') ? 'care' : 'good',
      summary: painAreas.includes('어깨') ? '좌우 가동 범위 차이가 있어 스트레칭 우선 권장' : '기본 가동 범위 양호',
    },
    {
      title: '고관절 밸런스',
      score: painAreas.includes('허리') ? 1 : 2,
      status: painAreas.includes('허리') ? 'watch' : 'good',
      summary: painAreas.includes('허리') ? '허리 보상 패턴이 있어 코어 안정화 병행 필요' : '기본 정렬 안정적',
    },
    {
      title: '스쿼트 패턴',
      score: onboarding.bodyFocus === '하체 밸런스' ? 2 : 1,
      status: onboarding.bodyFocus === '하체 밸런스' ? 'good' : 'watch',
      summary: onboarding.bodyFocus === '하체 밸런스' ? '무릎 추적 양호, 하체 안정성 우수' : '발목/엉덩이 가동성 확인 필요',
    },
  ];

  const totalScore = sections.reduce((sum, item) => sum + item.score, 0);
  const postureSummary =
    totalScore >= 5 ? '기본 패턴은 양호하나 일부 보상 동작이 있어 준비운동을 강화합니다.' : '통증/체형 정보를 반영해 저강도 적응 루틴부터 시작합니다.';

  return {
    totalScore,
    postureSummary,
    sections,
    coachComment: onboarding.completedAt
      ? '온보딩 설문 기준으로 첫 2주간은 코어 안정화와 가동성 회복에 집중하는 것을 권장합니다.'
      : '온보딩 정보를 입력하면 개인화된 코치 코멘트가 함께 제공됩니다.',
  };
}

export function getShopProducts(category?: ProductCategory | 'all') {
  if (!category || category === 'all') return SHOP_PRODUCTS;
  return SHOP_PRODUCTS.filter((product) => product.category === category);
}

export function getShopProduct(productId: string) {
  return SHOP_PRODUCTS.find((product) => product.id === productId) || null;
}

export function getPaymentMethodOptions() {
  return [
    { id: 'CARD' as const, label: '카드 결제', description: '일반 카드 또는 간편 카드 등록' },
    { id: 'TRANSFER' as const, label: '계좌이체', description: '입금 계좌 안내 후 즉시 완료 화면 제공' },
    { id: 'NAVERPAY' as const, label: '네이버 Pay', description: '네이버페이 결제 화면으로 연결되는 형태의 퍼블리싱' },
    { id: 'KAKAOPAY' as const, label: '카카오 Pay', description: '모바일 간편결제 흐름 퍼블리싱' },
  ];
}

export function getMockPayments(memberId: number) {
  return readArray<MockPaymentRecord>(paymentsKey(memberId));
}

export function getMockPayment(memberId: number, paymentId: string) {
  return getMockPayments(memberId).find((payment) => payment.id === paymentId) || null;
}

export function createMockPayment(
  memberId: number,
  payload: Omit<MockPaymentRecord, 'id' | 'saleDate' | 'status'>
) {
  const next: MockPaymentRecord = {
    ...payload,
    id: `mock-payment-${Date.now()}`,
    saleDate: new Date().toISOString(),
    status: 'COMPLETED',
  };
  const list = [next, ...getMockPayments(memberId)];
  writeJson(paymentsKey(memberId), list);
  return next;
}

export function loadConsentState(memberId: number) {
  return readJson<MemberConsentState>(consentsKey(memberId), buildDefaultConsents());
}

export function saveConsentState(memberId: number, state: MemberConsentState) {
  writeJson(consentsKey(memberId), {
    ...state,
    updatedAt: new Date().toISOString(),
  });
}

export function loadWithdrawalRequest(memberId: number) {
  return readJson<WithdrawalRequest>(withdrawalKey(memberId), DEFAULT_WITHDRAWAL_REQUEST);
}

export function saveWithdrawalRequest(memberId: number, request: WithdrawalRequest) {
  writeJson(withdrawalKey(memberId), request);
}

export function getGolfInstructorSlots() {
  return GOLF_INSTRUCTOR_SLOTS;
}

export function getGolfCoachBookings(memberId: number) {
  return readArray<GolfCoachBooking>(golfBookingKey(memberId));
}

export function createGolfCoachBooking(memberId: number, slot: GolfInstructorSlot) {
  const next: GolfCoachBooking = {
    id: `golf-booking-${Date.now()}`,
    instructorId: slot.instructorId,
    instructorName: slot.instructorName,
    lessonName: slot.lessonName,
    dateLabel: slot.dateLabel,
    timeLabel: slot.timeLabel,
    bayLabel: slot.bayLabel,
    price: slot.price,
    status: 'reserved',
    createdAt: new Date().toISOString(),
  };
  const list = [next, ...getGolfCoachBookings(memberId)];
  writeJson(golfBookingKey(memberId), list);
  return next;
}
