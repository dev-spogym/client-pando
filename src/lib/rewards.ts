/**
 * 리워드/멤버십/추천 mock 데이터
 *
 * 회원 활동/리워드 화면 (멤버십 등급, 친구 초대, 활동 이력) 에서 공통으로 사용한다.
 * 실서비스 데이터가 들어오기 전까지 풍부한 더미 데이터를 제공해 UI 검증을 돕는다.
 */

// ─── 멤버십 등급 ─────────────────────────────────────────────

/** 회원 등급 ID */
export type MembershipGradeId = 'BRONZE' | 'SILVER' | 'GOLD' | 'VIP' | 'VVIP';

/** 등급별 메타 정보 */
export interface MembershipGrade {
  id: MembershipGradeId;
  name: string;
  tagline: string;
  /** 누적 이용 금액(원) 진입 임계값 */
  threshold: number;
  /** 등급 대표 색상 */
  color: string;
  /** 등급 카드 그라디언트 (Tailwind 클래스) */
  gradient: string;
  /** 텍스트 강조 색상 (Tailwind 클래스) */
  accentText: string;
  /** 핵심 혜택 한줄 요약 */
  summary: string;
  /** 등급에서 제공되는 모든 혜택 */
  benefits: GradeBenefit[];
}

export interface GradeBenefit {
  title: string;
  description: string;
  /** 혜택 아이콘 식별자 */
  icon: 'discount' | 'inbody' | 'priority' | 'locker' | 'private' | 'manager' | 'review' | 'gift';
}

export const MEMBERSHIP_GRADES: MembershipGrade[] = [
  {
    id: 'BRONZE',
    name: 'BRONZE',
    tagline: '시작하는 단계',
    threshold: 0,
    color: '#CD7F32',
    gradient: 'from-[#8B5A2B] via-[#A06A33] to-[#CD7F32]',
    accentText: 'text-[#CD7F32]',
    summary: '가입 시 자동 부여 · 기본 혜택',
    benefits: [
      { title: '회원 전용 이벤트', description: '월간 추첨 이벤트 자동 응모', icon: 'gift' },
      { title: '센터 시설 이용', description: '헬스장 / 샤워실 자유 이용', icon: 'discount' },
    ],
  },
  {
    id: 'SILVER',
    name: 'SILVER',
    tagline: '꾸준히 운동 중',
    threshold: 500_000,
    color: '#A8A8A8',
    gradient: 'from-[#5A5A5A] via-[#7A7A7A] to-[#B8B8B8]',
    accentText: 'text-[#7A7A7A]',
    summary: '50만원+ · PT 5% 할인 + 후기 추가 적립',
    benefits: [
      { title: 'PT 5% 할인', description: '모든 PT 결제 시 자동 적용', icon: 'discount' },
      { title: '첫 후기 보너스', description: '후기 작성 시 추가 1,000P 적립', icon: 'review' },
      { title: '월간 인바디 1회', description: '체성분 측정 무료 1회 제공', icon: 'inbody' },
    ],
  },
  {
    id: 'GOLD',
    name: 'GOLD',
    tagline: '주요 회원',
    threshold: 1_000_000,
    color: '#D4A017',
    gradient: 'from-[#B8860B] via-[#D4A017] to-[#F1C40F]',
    accentText: 'text-[#B8860B]',
    summary: '100만원+ · PT 10% 할인 + 무료 인바디',
    benefits: [
      { title: 'PT 10% 할인', description: '모든 PT 결제 시 자동 적용', icon: 'discount' },
      { title: '무제한 인바디', description: '체성분 측정 무제한 무료', icon: 'inbody' },
      { title: '리뷰 보너스 2배', description: '후기 작성 시 2,000P 적립', icon: 'review' },
      { title: '시즌 굿즈', description: '분기별 한정 굿즈 제공', icon: 'gift' },
    ],
  },
  {
    id: 'VIP',
    name: 'VIP',
    tagline: '센터의 VIP',
    threshold: 2_500_000,
    color: '#0E7C7B',
    gradient: 'from-primary-deep via-primary-dark to-primary',
    accentText: 'text-primary',
    summary: '250만원+ · PT 15% + 우선 예약 + 전용 락커',
    benefits: [
      { title: 'PT 15% 할인', description: '모든 PT 결제 시 자동 적용', icon: 'discount' },
      { title: '강사 우선 예약', description: '인기 강사 24시간 먼저 예약', icon: 'priority' },
      { title: '전용 락커 무료', description: '연간 전용 락커 무상 제공', icon: 'locker' },
      { title: '인바디 + 식단 분석', description: '월 1회 영양사 1:1 컨설팅', icon: 'inbody' },
      { title: '동반 1인 무료 체험', description: '월 1회 친구와 함께 운동', icon: 'gift' },
    ],
  },
  {
    id: 'VVIP',
    name: 'VVIP',
    tagline: '최상위 멤버십',
    threshold: 5_000_000,
    color: '#063F3E',
    gradient: 'from-primary-deep via-[#0a3d3c] to-[#1f2937]',
    accentText: 'text-primary-deep',
    summary: '500만원+ · 모든 할인 + 프라이빗 룸 + 전담 매니저',
    benefits: [
      { title: '모든 상품 20% 할인', description: 'PT · 그룹 클래스 · 굿즈 모두', icon: 'discount' },
      { title: '프라이빗 트레이닝 룸', description: '개인 룸 시간당 무료 이용', icon: 'private' },
      { title: '전담 매니저 배정', description: '24/7 카카오톡 1:1 매니저', icon: 'manager' },
      { title: '강사 최우선 예약', description: '48시간 먼저 일정 확정 가능', icon: 'priority' },
      { title: '전용 발렛/락커 세트', description: '발렛 + 라운지 + 전용 락커', icon: 'locker' },
      { title: '한정 시즌 선물', description: '연 4회 프리미엄 선물 박스', icon: 'gift' },
    ],
  },
];

/** 누적 이용 금액에 따른 현재 등급 산정 */
export function getCurrentGrade(spend: number): MembershipGrade {
  let current = MEMBERSHIP_GRADES[0];
  for (const grade of MEMBERSHIP_GRADES) {
    if (spend >= grade.threshold) {
      current = grade;
    }
  }
  return current;
}

/** 다음 등급 (없으면 null) */
export function getNextGrade(currentId: MembershipGradeId): MembershipGrade | null {
  const idx = MEMBERSHIP_GRADES.findIndex((g) => g.id === currentId);
  if (idx === -1 || idx === MEMBERSHIP_GRADES.length - 1) return null;
  return MEMBERSHIP_GRADES[idx + 1];
}

/** 다음 등급까지 진척률 (0~100) */
export function getGradeProgress(spend: number, currentId: MembershipGradeId): number {
  const next = getNextGrade(currentId);
  if (!next) return 100;
  const current = MEMBERSHIP_GRADES.find((g) => g.id === currentId)!;
  const span = next.threshold - current.threshold;
  if (span <= 0) return 100;
  const progressed = Math.max(0, spend - current.threshold);
  return Math.min(100, Math.round((progressed / span) * 100));
}

// ─── 추천 / 친구 초대 ─────────────────────────────────────────

export type ReferralStatus = 'registered' | 'paid' | 'reviewed';

export interface ReferralFriend {
  id: number;
  name: string;
  joinedAt: string;
  status: ReferralStatus;
  /** 이 친구로부터 적립받은 누적 금액 */
  rewardAmount: number;
  avatarColor: string;
}

export interface ReferralStep {
  step: 1 | 2 | 3;
  title: string;
  description: string;
  reward: number;
  status: ReferralStatus;
}

export const REFERRAL_STEPS: ReferralStep[] = [
  { step: 1, title: '친구 가입', description: '친구가 회원가입을 완료해요', reward: 5_000, status: 'registered' },
  { step: 2, title: '첫 결제', description: '친구가 첫 이용권을 결제해요', reward: 5_000, status: 'paid' },
  { step: 3, title: '후기 작성', description: '친구가 첫 후기를 남겨요', reward: 3_000, status: 'reviewed' },
];

const FRIEND_COLORS = ['#FDE68A', '#BFDBFE', '#FECACA', '#C7D2FE', '#A7F3D0', '#FBCFE8'];

export const SAMPLE_REFERRAL_FRIENDS: ReferralFriend[] = [
  { id: 1, name: '김지훈', joinedAt: '2026-04-12', status: 'reviewed', rewardAmount: 13_000, avatarColor: FRIEND_COLORS[0] },
  { id: 2, name: '이수아', joinedAt: '2026-04-05', status: 'paid', rewardAmount: 10_000, avatarColor: FRIEND_COLORS[1] },
  { id: 3, name: '박서준', joinedAt: '2026-03-28', status: 'paid', rewardAmount: 10_000, avatarColor: FRIEND_COLORS[2] },
  { id: 4, name: '최예린', joinedAt: '2026-03-15', status: 'registered', rewardAmount: 5_000, avatarColor: FRIEND_COLORS[3] },
  { id: 5, name: '정현우', joinedAt: '2026-02-22', status: 'reviewed', rewardAmount: 13_000, avatarColor: FRIEND_COLORS[4] },
];

/** 추천 단계 라벨/색상 */
export function getReferralStatusMeta(status: ReferralStatus) {
  switch (status) {
    case 'registered':
      return { label: '가입 완료', tone: 'neutral' as const };
    case 'paid':
      return { label: '결제 완료', tone: 'primary' as const };
    case 'reviewed':
      return { label: '후기 작성', tone: 'success' as const };
  }
}

// ─── 활동 이력 ────────────────────────────────────────────

export interface ActivityStats {
  totalSpend: number;
  visitCount: number;
  lessonCount: number;
  reviewCount: number;
}

export interface MonthlyVisitPoint {
  month: string;
  visits: number;
}

export interface MonthlyPaymentPoint {
  month: string;
  amount: number;
}

export interface CategoryShare {
  name: string;
  value: number;
  color: string;
}

export interface BestInstructor {
  id: number;
  name: string;
  totalSessions: number;
  rating: number;
  avatarColor: string;
}

export interface FavoriteCenter {
  id: number;
  name: string;
  visitCount: number;
  lastVisitedAt: string;
  area: string;
}

export interface MilestoneBadge {
  id: string;
  title: string;
  description: string;
  earnedAt: string | null;
  icon: 'first-pt' | 'streak-10' | 'review-1' | 'streak-30' | 'big-spender' | 'inviter' | 'early-bird' | 'marathon';
  earned: boolean;
}

export type TimelineAction = 'visit' | 'reservation' | 'payment' | 'review';

export interface TimelineEntry {
  id: string;
  date: string;
  action: TimelineAction;
  title: string;
  meta?: string;
  amount?: number;
}

export const SAMPLE_ACTIVITY_STATS: ActivityStats = {
  totalSpend: 2_150_000,
  visitCount: 86,
  lessonCount: 42,
  reviewCount: 12,
};

export const SAMPLE_MONTHLY_VISITS: MonthlyVisitPoint[] = [
  { month: '5월', visits: 4 },
  { month: '6월', visits: 6 },
  { month: '7월', visits: 8 },
  { month: '8월', visits: 5 },
  { month: '9월', visits: 7 },
  { month: '10월', visits: 9 },
  { month: '11월', visits: 11 },
  { month: '12월', visits: 8 },
  { month: '1월', visits: 6 },
  { month: '2월', visits: 7 },
  { month: '3월', visits: 8 },
  { month: '4월', visits: 7 },
];

export const SAMPLE_MONTHLY_PAYMENTS: MonthlyPaymentPoint[] = [
  { month: '5월', amount: 120_000 },
  { month: '6월', amount: 150_000 },
  { month: '7월', amount: 220_000 },
  { month: '8월', amount: 180_000 },
  { month: '9월', amount: 160_000 },
  { month: '10월', amount: 240_000 },
  { month: '11월', amount: 280_000 },
  { month: '12월', amount: 200_000 },
  { month: '1월', amount: 130_000 },
  { month: '2월', amount: 170_000 },
  { month: '3월', amount: 150_000 },
  { month: '4월', amount: 150_000 },
];

export const SAMPLE_CATEGORY_SHARE: CategoryShare[] = [
  { name: 'PT', value: 38, color: '#0E7C7B' },
  { name: '필라테스', value: 22, color: '#3FB6B2' },
  { name: '요가', value: 14, color: '#10B981' },
  { name: '헬스', value: 18, color: '#F59E0B' },
  { name: '골프', value: 8, color: '#EF4444' },
];

export const SAMPLE_BEST_INSTRUCTORS: BestInstructor[] = [
  { id: 1, name: '김태형', totalSessions: 28, rating: 4.9, avatarColor: '#CFE6E6' },
  { id: 2, name: '이수민', totalSessions: 9, rating: 4.7, avatarColor: '#FDE68A' },
];

export const SAMPLE_FAVORITE_CENTERS: FavoriteCenter[] = [
  { id: 1, name: '판도 강남점', area: '서울 강남구', visitCount: 52, lastVisitedAt: '2026-04-28' },
  { id: 2, name: '판도 잠실점', area: '서울 송파구', visitCount: 22, lastVisitedAt: '2026-04-15' },
  { id: 3, name: '판도 분당점', area: '경기 성남시', visitCount: 12, lastVisitedAt: '2026-03-30' },
];

export const SAMPLE_BADGES: MilestoneBadge[] = [
  { id: 'first-pt', title: '첫 PT 완주', description: 'PT 1회 완료', icon: 'first-pt', earnedAt: '2025-09-12', earned: true },
  { id: 'streak-10', title: '10회 연속 출석', description: '10일 연속 방문', icon: 'streak-10', earnedAt: '2025-10-04', earned: true },
  { id: 'review-1', title: '첫 후기', description: '첫 리뷰 작성', icon: 'review-1', earnedAt: '2025-10-15', earned: true },
  { id: 'streak-30', title: '한달 개근', description: '30일 연속 출석', icon: 'streak-30', earnedAt: '2025-11-30', earned: true },
  { id: 'big-spender', title: '플래티넘 패밀리', description: '누적 결제 200만원', icon: 'big-spender', earnedAt: '2026-02-10', earned: true },
  { id: 'inviter', title: '친구초대 마스터', description: '친구 5명 초대', icon: 'inviter', earnedAt: '2026-04-12', earned: true },
  { id: 'early-bird', title: '얼리버드', description: '오전 7시 운동 10회', icon: 'early-bird', earnedAt: null, earned: false },
  { id: 'marathon', title: '마라토너', description: '연속 100일 출석', icon: 'marathon', earnedAt: null, earned: false },
];

export const SAMPLE_TIMELINE: TimelineEntry[] = [
  { id: 't1', date: '2026-04-29', action: 'visit', title: '판도 강남점 방문', meta: '오전 7:42' },
  { id: 't2', date: '2026-04-29', action: 'reservation', title: '김태형 강사 PT 예약', meta: '5/2 19:00' },
  { id: 't3', date: '2026-04-28', action: 'review', title: '필라테스 그룹 클래스 후기 작성', meta: '+1,000P' },
  { id: 't4', date: '2026-04-26', action: 'visit', title: '판도 강남점 방문', meta: '오후 6:15' },
  { id: 't5', date: '2026-04-25', action: 'payment', title: 'PT 10회권 결제', meta: '카드', amount: 660_000 },
  { id: 't6', date: '2026-04-23', action: 'visit', title: '판도 잠실점 방문', meta: '오후 8:02' },
  { id: 't7', date: '2026-04-22', action: 'reservation', title: '요가 클래스 예약', meta: '4/24 18:00' },
  { id: 't8', date: '2026-04-20', action: 'payment', title: '단백질 쉐이크 정기배송', meta: '간편결제', amount: 38_000 },
  { id: 't9', date: '2026-04-18', action: 'visit', title: '판도 강남점 방문', meta: '오전 7:55' },
  { id: 't10', date: '2026-04-16', action: 'review', title: '김태형 강사 후기 작성', meta: '+1,000P' },
  { id: 't11', date: '2026-04-12', action: 'payment', title: '굿즈 구매 (요가매트)', meta: '카드', amount: 49_000 },
  { id: 't12', date: '2026-04-08', action: 'visit', title: '판도 분당점 방문', meta: '오후 5:30' },
];

// ─── 신규 회원 빈 상태 ────────────────────────────────────

/** 활동 이력 0건 여부 (신규 회원 EmptyState 분기에 사용) */
export function isNewMemberActivity(stats: ActivityStats) {
  return stats.totalSpend === 0 && stats.visitCount === 0 && stats.lessonCount === 0 && stats.reviewCount === 0;
}
