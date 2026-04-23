import type { MockPaymentRecord, OnboardingDraft } from '@/lib/memberExperience';
import type { MemberProfile, TrainerProfile } from '@/stores/authStore';

export const PREVIEW_MEMBER_ID = 9001;
export const PREVIEW_TRAINER_ID = 9101;

export const PREVIEW_CLASS_IDS = {
  reserved: 101,
  waitlist: 102,
  upcoming: 103,
  feedbackDone: 104,
  feedbackPending: 105,
} as const;

export const PREVIEW_CONTRACT_IDS = {
  active: 501,
  expired: 502,
} as const;

export const PREVIEW_PAYMENT_IDS = {
  gym: 'preview-payment-gym',
  pt: 'preview-payment-pt',
} as const;

function isBrowser() {
  return typeof window !== 'undefined';
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function offsetDate(days: number, hours = 10, minutes = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function toIso(days: number, hours = 10, minutes = 0) {
  return offsetDate(days, hours, minutes).toISOString();
}

function dateKey(days: number) {
  return toIso(days, 12, 0).split('T')[0];
}

export function isPreviewMode() {
  if (!isBrowser()) return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('preview') === '1';
}

export function getPreviewRole() {
  if (!isBrowser()) return 'member';
  const params = new URLSearchParams(window.location.search);
  return params.get('role') === 'trainer' ? 'trainer' : 'member';
}

export function getPreviewSearchParam(name: string) {
  if (!isBrowser()) return null;
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

export function getPreviewMemberProfile(): MemberProfile {
  return {
    id: PREVIEW_MEMBER_ID,
    name: '김회원',
    phone: '01012345678',
    email: 'preview@spogym.app',
    gender: 'F',
    birthDate: '1994-05-16',
    profileImage: null,
    status: 'ACTIVE',
    mileage: 12500,
    branchId: 1,
    membershipType: '헬스장 3개월 + 골프 자유이용',
    membershipStart: toIso(-28, 12),
    membershipExpiry: toIso(17, 12),
    registeredAt: toIso(-180, 12),
  };
}

export function getPreviewTrainerProfile(): TrainerProfile {
  return {
    id: PREVIEW_TRAINER_ID,
    username: 'trainer.preview',
    name: '박서연',
    role: 'TRAINER',
    branchId: 1,
    isActive: true,
    staffId: 301,
    staffName: '박서연',
    staffPhone: '010-5555-1234',
    staffColor: '#0f766e',
  };
}

export function getPreviewClasses() {
  return [
    {
      id: PREVIEW_CLASS_IDS.reserved,
      title: 'PT 코어 리셋',
      type: 'PT',
      staffId: 1,
      staffName: '박서연',
      room: 'PT룸 1',
      startTime: toIso(0, 10, 0),
      endTime: toIso(0, 10, 50),
      capacity: 1,
      booked: 1,
      lesson_status: 'reserved',
    },
    {
      id: PREVIEW_CLASS_IDS.waitlist,
      title: '필라테스 리커버리',
      type: 'GX',
      staffId: 3,
      staffName: '김예린',
      room: 'GX룸 A',
      startTime: toIso(0, 19, 0),
      endTime: toIso(0, 19, 50),
      capacity: 20,
      booked: 20,
      lesson_status: null,
    },
    {
      id: PREVIEW_CLASS_IDS.upcoming,
      title: '모닝 스트레칭',
      type: 'GX',
      staffId: 3,
      staffName: '김예린',
      room: 'GX룸 B',
      startTime: toIso(1, 11, 0),
      endTime: toIso(1, 11, 50),
      capacity: 24,
      booked: 14,
      lesson_status: 'reserved',
    },
    {
      id: PREVIEW_CLASS_IDS.feedbackDone,
      title: '체형 교정 PT',
      type: 'PT',
      staffId: 1,
      staffName: '박서연',
      room: 'PT룸 2',
      startTime: toIso(-2, 18, 0),
      endTime: toIso(-2, 18, 50),
      capacity: 1,
      booked: 1,
      lesson_status: 'completed',
    },
    {
      id: PREVIEW_CLASS_IDS.feedbackPending,
      title: '힙업 서킷',
      type: 'GX',
      staffId: 3,
      staffName: '김예린',
      room: 'GX룸 A',
      startTime: toIso(-5, 19, 30),
      endTime: toIso(-5, 20, 20),
      capacity: 18,
      booked: 15,
      lesson_status: 'completed',
    },
  ];
}

export function getPreviewClassById(id: number) {
  return getPreviewClasses().find((item) => item.id === id) || null;
}

export function getPreviewClassesForDate(date: string, filter: 'ALL' | 'PT' | 'GX') {
  return getPreviewClasses().filter((item) => {
    const sameDate = item.startTime.startsWith(date);
    const sameFilter = filter === 'ALL' || item.type === filter;
    return sameDate && sameFilter;
  });
}

export function getPreviewLessons() {
  return [...getPreviewClasses()].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );
}

export function getPreviewTodayClasses() {
  const today = dateKey(0);
  return getPreviewClasses().filter((item) => item.startTime.startsWith(today));
}

export function getPreviewAttendanceRecords() {
  return [
    {
      id: 1,
      checkInAt: toIso(-1, 10, 5),
      checkOutAt: toIso(-1, 11, 45),
      type: 'GX',
      checkInMethod: 'APP',
    },
    {
      id: 2,
      checkInAt: toIso(-2, 18, 0),
      checkOutAt: toIso(-2, 18, 55),
      type: 'PT',
      checkInMethod: 'APP',
    },
    {
      id: 3,
      checkInAt: toIso(-5, 19, 30),
      checkOutAt: toIso(-5, 20, 20),
      type: 'GX',
      checkInMethod: 'KIOSK',
    },
    {
      id: 4,
      checkInAt: toIso(-8, 10, 20),
      checkOutAt: toIso(-8, 11, 30),
      type: 'REGULAR',
      checkInMethod: 'KIOSK',
    },
    {
      id: 5,
      checkInAt: toIso(-12, 19, 10),
      checkOutAt: toIso(-12, 20, 10),
      type: 'REGULAR',
      checkInMethod: 'APP',
    },
    {
      id: 6,
      checkInAt: toIso(-15, 18, 5),
      checkOutAt: toIso(-15, 19, 0),
      type: 'PT',
      checkInMethod: 'APP',
    },
  ];
}

export function getPreviewBodyRecords() {
  return [
    {
      id: 1,
      date: toIso(-5, 12),
      weight: 67.5,
      muscle: 29.4,
      fat: 12.6,
      fatRate: 18.7,
      bmi: 22.1,
      memo: '체지방률이 안정적으로 감소하고 있습니다.',
    },
    {
      id: 2,
      date: toIso(-36, 12),
      weight: 68.4,
      muscle: 28.8,
      fat: 13.8,
      fatRate: 20.1,
      bmi: 22.5,
      memo: '코어 안정화 루틴 이후 자세 균형이 좋아졌습니다.',
    },
    {
      id: 3,
      date: toIso(-68, 12),
      weight: 69.2,
      muscle: 28.1,
      fat: 14.5,
      fatRate: 20.9,
      bmi: 22.8,
      memo: null,
    },
  ];
}

export function getPreviewNotices() {
  return [
    {
      id: 1,
      title: '5월 연휴 운영시간 안내',
      content: '5월 5일은 10:00부터 18:00까지 단축 운영합니다.',
      author_name: '운영팀',
      is_pinned: true,
      published_at: toIso(-1, 12),
      created_at: toIso(-1, 12),
    },
    {
      id: 2,
      title: '골프 타석 정비 일정 안내',
      content: '4월 27일 13:00부터 15:00까지 일부 타석 사용이 제한됩니다.',
      author_name: '프론트',
      is_pinned: false,
      published_at: toIso(-3, 12),
      created_at: toIso(-3, 12),
    },
    {
      id: 3,
      title: '신규 PT 프로모션 오픈',
      content: 'PT 10회 등록 시 식단 코칭 2주를 추가 제공합니다.',
      author_name: '마케팅팀',
      is_pinned: false,
      published_at: toIso(-6, 12),
      created_at: toIso(-6, 12),
    },
  ];
}

export function getPreviewContracts() {
  return [
    {
      id: PREVIEW_CONTRACT_IDS.active,
      productName: '헬스장 3개월 + 골프 자유이용',
      memberName: '김회원',
      amount: 690000,
      startDate: toIso(-28, 12),
      endDate: toIso(17, 12),
      status: '서명완료',
      signedAt: toIso(-32, 12),
      createdAt: toIso(-35, 12),
    },
    {
      id: PREVIEW_CONTRACT_IDS.expired,
      productName: 'PT 10회 패키지',
      memberName: '김회원',
      amount: 590000,
      startDate: toIso(-120, 12),
      endDate: toIso(-20, 12),
      status: '만료',
      signedAt: toIso(-122, 12),
      createdAt: toIso(-125, 12),
    },
  ];
}

export function getPreviewContractById(id: number) {
  return getPreviewContracts().find((item) => item.id === id) || null;
}

export function getPreviewWorkoutEntries(date: string) {
  const logs: Record<string, Array<{ id: number; category: string; name: string; sets: Array<{ weight: number; reps: number }>; duration: number }>> = {
    [dateKey(0)]: [
      {
        id: 1,
        category: '가슴',
        name: '벤치프레스',
        sets: [
          { weight: 60, reps: 10 },
          { weight: 65, reps: 8 },
          { weight: 65, reps: 8 },
        ],
        duration: 28,
      },
      {
        id: 2,
        category: '등',
        name: '랫풀다운',
        sets: [
          { weight: 45, reps: 12 },
          { weight: 50, reps: 10 },
          { weight: 50, reps: 10 },
        ],
        duration: 22,
      },
    ],
  };

  return logs[date] || [];
}

export function seedPreviewMemberExperience(memberId: number) {
  if (!isBrowser()) return;

  const onboarding: OnboardingDraft = {
    goals: ['체중 감량', '체형 교정'],
    workoutStyle: '밸런스형',
    painAreas: ['어깨', '허리'],
    bodyFocus: '코어 강화',
    preferredDays: ['월', '수', '금'],
    preferredDuration: '45분',
    recommendedTitle: '코어 안정화 스타터 루틴',
    recommendedSummary: '어깨와 허리 부담을 줄이면서 체형을 정리하는 1주 차 루틴입니다.',
    recommendedRoutine: ['밴드 풀어파트 3세트', '데드버그 3세트', '플랭크 40초 3세트', '경사 워킹 15분'],
    completedAt: toIso(-6, 12),
  };

  const reservations = [
    {
      classId: PREVIEW_CLASS_IDS.reserved,
      title: 'PT 코어 리셋',
      type: 'PT',
      staffName: '박서연',
      startTime: toIso(0, 10, 0),
      endTime: toIso(0, 10, 50),
      room: 'PT룸 1',
      status: 'reserved',
      createdAt: toIso(-1, 12),
    },
    {
      classId: PREVIEW_CLASS_IDS.upcoming,
      title: '모닝 스트레칭',
      type: 'GX',
      staffName: '김예린',
      startTime: toIso(1, 11, 0),
      endTime: toIso(1, 11, 50),
      room: 'GX룸 B',
      status: 'reserved',
      createdAt: toIso(-1, 12),
    },
  ];

  const waitlist = [
    {
      classId: PREVIEW_CLASS_IDS.waitlist,
      title: '필라테스 리커버리',
      type: 'GX',
      staffId: 3,
      staffName: '김예린',
      room: 'GX룸 A',
      startTime: toIso(0, 19, 0),
      endTime: toIso(0, 19, 50),
      position: 2,
      status: 'waiting',
      autoPromoted: true,
      createdAt: toIso(-1, 12),
    },
  ];

  const feedback = [
    {
      classId: PREVIEW_CLASS_IDS.feedbackDone,
      title: '체형 교정 PT',
      staffName: '박서연',
      rating: 5,
      tags: ['설명이 쉬워요', '다음에도 듣고 싶어요'],
      comment: '자세 설명이 명확해서 바로 적용하기 좋았습니다.',
      npsScore: 10,
      createdAt: toIso(-2, 21),
    },
  ];

  const payments: MockPaymentRecord[] = [
    {
      id: PREVIEW_PAYMENT_IDS.gym,
      productId: 'golf-1m',
      productName: '골프장 이용권 1개월',
      category: 'golf',
      amount: 186000,
      originalAmount: 189000,
      mileageUsed: 3000,
      paymentMethod: 'CARD',
      status: 'COMPLETED',
      saleDate: toIso(-1, 14),
      cardCompany: '현대카드',
      receiptTitle: '골프장 이용권 1개월',
      orderMemo: '익월 1일부터 이용 시작',
    },
    {
      id: PREVIEW_PAYMENT_IDS.pt,
      productId: 'pt-10',
      productName: 'PT 10회 패키지',
      category: 'pt',
      amount: 590000,
      originalAmount: 590000,
      mileageUsed: 0,
      paymentMethod: 'NAVERPAY',
      status: 'COMPLETED',
      saleDate: toIso(-12, 13),
      cardCompany: '네이버페이',
      receiptTitle: 'PT 10회 패키지',
      orderMemo: null,
    },
  ];

  const settings = {
    reservationPush: true,
    membershipPush: true,
    paymentPush: true,
    marketingPush: false,
    noticePush: true,
  };

  const consents = {
    serviceTerms: true,
    privacyPolicy: true,
    thirdPartyData: true,
    marketingSms: true,
    marketingEmail: false,
    marketingPush: false,
    serviceAcceptedAt: toIso(-180, 12),
    privacyAcceptedAt: toIso(-180, 12),
    thirdPartyAcceptedAt: toIso(-180, 12),
    updatedAt: toIso(-3, 12),
  };

  const golfBookings = [
    {
      id: 'preview-golf-booking-1',
      instructorId: 2,
      instructorName: '이준호',
      lessonName: '드라이버 교정 레슨',
      dateLabel: '내일',
      timeLabel: '19:00 - 19:50',
      bayLabel: 'G-03',
      price: 105000,
      status: 'reserved',
      createdAt: toIso(-1, 12),
    },
  ];

  const workoutLogs = {
    [dateKey(0)]: {
      date: dateKey(0),
      entries: [
        {
          id: 'preview-workout-1',
          category: '가슴',
          name: '벤치프레스',
          sets: [
            { weight: 60, reps: 10 },
            { weight: 65, reps: 8 },
          ],
          duration: 25,
        },
        {
          id: 'preview-workout-2',
          category: '등',
          name: '랫풀다운',
          sets: [
            { weight: 45, reps: 12 },
            { weight: 50, reps: 10 },
          ],
          duration: 20,
        },
      ],
    },
    [dateKey(-2)]: {
      date: dateKey(-2),
      entries: [
        {
          id: 'preview-workout-3',
          category: '하체',
          name: '스쿼트',
          sets: [
            { weight: 80, reps: 8 },
            { weight: 80, reps: 8 },
          ],
          duration: 30,
        },
      ],
    },
  };

  const dietLogs = {
    [dateKey(0)]: {
      date: dateKey(0),
      meals: {
        아침: [
          { id: 'diet-1', name: '그릭요거트 볼', calories: 320, memo: '블루베리 추가' },
        ],
        점심: [
          { id: 'diet-2', name: '닭가슴살 샐러드', calories: 410, memo: '' },
        ],
        저녁: [
          { id: 'diet-3', name: '연어 포케', calories: 560, memo: '현미밥 반 공기' },
        ],
      },
    },
  };

  writeJson(`spogym-onboarding-${memberId}`, onboarding);
  writeJson(`spogym-reservations-${memberId}`, reservations);
  writeJson(`spogym-waitlist-${memberId}`, waitlist);
  writeJson(`spogym-feedback-${memberId}`, feedback);
  writeJson(`spogym-settings-${memberId}`, settings);
  writeJson(`spogym-consents-${memberId}`, consents);
  writeJson(`spogym-withdrawal-${memberId}`, {
    requestedAt: null,
    reason: '',
    details: '',
    status: 'none',
  });
  writeJson(`spogym-payments-${memberId}`, payments);
  writeJson(`spogym-golf-bookings-${memberId}`, golfBookings);
  writeJson('spogym-workout-logs', workoutLogs);
  writeJson('spogym-diet-logs', dietLogs);
}

type PreviewTrainerMember = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  gender: string | null;
  status: string;
  membershipType: string | null;
  membershipExpiry: string | null;
  isFavorite: boolean;
};

type PreviewTrainerClass = {
  id: number;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  room: string | null;
  capacity: number;
  booked: number;
  branchId: number;
  staffId: number | null;
  staffName: string;
};

type PreviewTrainerExerciseLog = {
  id: number;
  memberId: number;
  exerciseName: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  duration: number | null;
  loggedAt: string;
};

type PreviewTrainerBodyComp = {
  id: number;
  memberId: number;
  weight: number | null;
  muscle: number | null;
  fat: number | null;
  fatRate: number | null;
  bmi: number | null;
  createdAt: string;
};

type PreviewTrainerEvaluation = {
  id: number;
  memberId: number;
  staffName: string;
  category: string;
  score: number;
  content: string;
  createdAt: string;
};

type PreviewTrainerMemo = {
  id: number;
  memberId: number;
  content: string;
  author: string;
  createdAt: string;
};

type PreviewTrainerAttendanceMember = {
  memberId: number;
  memberName: string;
};

const PREVIEW_TRAINER_STORAGE = {
  classes: 'spogym-preview-trainer-classes',
  evaluations: 'spogym-preview-trainer-evaluations',
  memos: 'spogym-preview-trainer-memos',
} as const;

function getBasePreviewTrainerMembers(): PreviewTrainerMember[] {
  return [
    {
      id: 1201,
      name: '김지은',
      phone: '01023451234',
      email: 'jieun@example.com',
      gender: 'F',
      status: 'ACTIVE',
      membershipType: 'PT 10회',
      membershipExpiry: toIso(21, 12),
      isFavorite: true,
    },
    {
      id: 1202,
      name: '이현우',
      phone: '01098761234',
      email: 'hyunwoo@example.com',
      gender: 'M',
      status: 'ACTIVE',
      membershipType: '헬스장 자유이용 3개월',
      membershipExpiry: toIso(46, 12),
      isFavorite: false,
    },
    {
      id: 1203,
      name: '최민아',
      phone: '01055551234',
      email: 'mina@example.com',
      gender: 'F',
      status: 'HOLDING',
      membershipType: '골프 레슨 8회',
      membershipExpiry: toIso(12, 12),
      isFavorite: true,
    },
  ];
}

function getBasePreviewTrainerClasses(): PreviewTrainerClass[] {
  const trainer = getPreviewTrainerProfile();
  return [
    {
      id: 2101,
      title: 'PT 코어 리셋',
      type: 'PT',
      startTime: toIso(0, 10, 0),
      endTime: toIso(0, 10, 50),
      room: 'PT룸 1',
      capacity: 1,
      booked: 1,
      branchId: trainer.branchId,
      staffId: trainer.staffId,
      staffName: trainer.staffName || trainer.name,
    },
    {
      id: 2102,
      title: '바른자세 GX',
      type: 'GX',
      startTime: toIso(0, 18, 0),
      endTime: toIso(0, 18, 50),
      room: 'GX룸 A',
      capacity: 12,
      booked: 9,
      branchId: trainer.branchId,
      staffId: trainer.staffId,
      staffName: trainer.staffName || trainer.name,
    },
    {
      id: 2103,
      title: '하체 밸런스 PT',
      type: 'PT',
      startTime: toIso(1, 14, 0),
      endTime: toIso(1, 14, 50),
      room: 'PT룸 2',
      capacity: 1,
      booked: 1,
      branchId: trainer.branchId,
      staffId: trainer.staffId,
      staffName: trainer.staffName || trainer.name,
    },
    {
      id: 2104,
      title: '회복 스트레칭',
      type: 'GX',
      startTime: toIso(2, 19, 0),
      endTime: toIso(2, 19, 50),
      room: 'GX룸 B',
      capacity: 16,
      booked: 11,
      branchId: trainer.branchId,
      staffId: trainer.staffId,
      staffName: trainer.staffName || trainer.name,
    },
    {
      id: 2105,
      title: 'TRX 서킷',
      type: 'GX',
      startTime: toIso(-1, 17, 0),
      endTime: toIso(-1, 17, 50),
      room: 'GX룸 A',
      capacity: 10,
      booked: 8,
      branchId: trainer.branchId,
      staffId: trainer.staffId,
      staffName: trainer.staffName || trainer.name,
    },
  ];
}

function getBasePreviewTrainerAttendanceByClass(): Record<number, PreviewTrainerAttendanceMember[]> {
  const members = getBasePreviewTrainerMembers();
  return {
    2101: [{ memberId: members[0].id, memberName: members[0].name }],
    2102: [
      { memberId: members[1].id, memberName: members[1].name },
      { memberId: members[2].id, memberName: members[2].name },
    ],
    2103: [{ memberId: members[0].id, memberName: members[0].name }],
    2104: [{ memberId: members[2].id, memberName: members[2].name }],
    2105: [
      { memberId: members[0].id, memberName: members[0].name },
      { memberId: members[1].id, memberName: members[1].name },
    ],
  };
}

function getBasePreviewTrainerExerciseLogs(): PreviewTrainerExerciseLog[] {
  return [
    {
      id: 3101,
      memberId: 1201,
      exerciseName: '스쿼트',
      sets: 4,
      reps: 8,
      weight: 60,
      duration: 18,
      loggedAt: toIso(-1, 18, 20),
    },
    {
      id: 3102,
      memberId: 1201,
      exerciseName: '런지',
      sets: 3,
      reps: 12,
      weight: 16,
      duration: 12,
      loggedAt: toIso(-3, 17, 40),
    },
    {
      id: 3103,
      memberId: 1202,
      exerciseName: '랫풀다운',
      sets: 4,
      reps: 10,
      weight: 45,
      duration: 16,
      loggedAt: toIso(-2, 19, 10),
    },
    {
      id: 3104,
      memberId: 1203,
      exerciseName: '골반 안정화 루틴',
      sets: 3,
      reps: 15,
      weight: null,
      duration: 20,
      loggedAt: toIso(-4, 11, 30),
    },
  ];
}

function getBasePreviewTrainerBodyComps(): PreviewTrainerBodyComp[] {
  return [
    {
      id: 4101,
      memberId: 1201,
      weight: 58.2,
      muscle: 23.9,
      fat: 14.6,
      fatRate: 25.1,
      bmi: 21.6,
      createdAt: toIso(-6, 12),
    },
    {
      id: 4102,
      memberId: 1201,
      weight: 59.1,
      muscle: 23.2,
      fat: 15.7,
      fatRate: 26.5,
      bmi: 21.9,
      createdAt: toIso(-36, 12),
    },
    {
      id: 4103,
      memberId: 1202,
      weight: 76.3,
      muscle: 33.4,
      fat: 13.8,
      fatRate: 18.1,
      bmi: 24.3,
      createdAt: toIso(-9, 12),
    },
    {
      id: 4104,
      memberId: 1203,
      weight: 54.6,
      muscle: 21.8,
      fat: 12.4,
      fatRate: 22.7,
      bmi: 20.2,
      createdAt: toIso(-12, 12),
    },
  ];
}

function getBasePreviewTrainerEvaluations(): PreviewTrainerEvaluation[] {
  return [
    {
      id: 5101,
      memberId: 1201,
      staffName: '박서연',
      category: '하체 안정성',
      score: 8,
      content: '스쿼트 가동범위가 좋아졌고 무릎 정렬이 안정적입니다.',
      createdAt: toIso(-2, 20),
    },
    {
      id: 5102,
      memberId: 1202,
      staffName: '박서연',
      category: '상체 밸런스',
      score: 7,
      content: '등 사용 감각은 좋아졌지만 어깨 긴장 완화가 추가로 필요합니다.',
      createdAt: toIso(-4, 18),
    },
  ];
}

function getBasePreviewTrainerMemos(): PreviewTrainerMemo[] {
  return [
    {
      id: 6101,
      memberId: 1201,
      content: '금요일 세션에서는 런지 난도를 한 단계 올려보기.',
      author: '박서연',
      createdAt: toIso(-1, 21),
    },
    {
      id: 6102,
      memberId: 1203,
      content: '허리 민감도 체크 후 골반 안정화 루틴 반복 예정.',
      author: '박서연',
      createdAt: toIso(-3, 14),
    },
  ];
}

export function seedPreviewTrainerExperience(_trainerId: number) {
  if (!isBrowser()) return;

  if (!window.localStorage.getItem(PREVIEW_TRAINER_STORAGE.classes)) {
    writeJson(PREVIEW_TRAINER_STORAGE.classes, []);
  }
  if (!window.localStorage.getItem(PREVIEW_TRAINER_STORAGE.evaluations)) {
    writeJson(PREVIEW_TRAINER_STORAGE.evaluations, []);
  }
  if (!window.localStorage.getItem(PREVIEW_TRAINER_STORAGE.memos)) {
    writeJson(PREVIEW_TRAINER_STORAGE.memos, []);
  }
}

export function getPreviewTrainerMembers() {
  return getBasePreviewTrainerMembers();
}

export function getPreviewTrainerMemberById(memberId: number) {
  return getPreviewTrainerMembers().find((member) => member.id === memberId) || null;
}

export function getPreviewTrainerClasses() {
  const savedClasses = readJson<PreviewTrainerClass[]>(PREVIEW_TRAINER_STORAGE.classes, []);
  return [...getBasePreviewTrainerClasses(), ...savedClasses].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
}

export function getPreviewTrainerClassesForRange(startIso: string, endIso: string) {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();

  return getPreviewTrainerClasses().filter((item) => {
    const timestamp = new Date(item.startTime).getTime();
    return timestamp >= start && timestamp < end;
  });
}

export function appendPreviewTrainerClass(input: Omit<PreviewTrainerClass, 'id'>) {
  const savedClasses = readJson<PreviewTrainerClass[]>(PREVIEW_TRAINER_STORAGE.classes, []);
  const nextClass: PreviewTrainerClass = {
    ...input,
    id: Date.now(),
  };

  writeJson(PREVIEW_TRAINER_STORAGE.classes, [...savedClasses, nextClass]);
  return nextClass;
}

export function getPreviewTrainerTodayAttendanceIds() {
  return [1201, 1202];
}

export function getPreviewTrainerAttendanceMembersByClassId(classId: number) {
  return getBasePreviewTrainerAttendanceByClass()[classId] || [];
}

export function getPreviewTrainerExerciseLogs(memberId: number) {
  return getBasePreviewTrainerExerciseLogs().filter((item) => item.memberId === memberId);
}

export function getPreviewTrainerBodyComps(memberId: number) {
  return getBasePreviewTrainerBodyComps().filter((item) => item.memberId === memberId);
}

export function getPreviewTrainerEvaluations(memberId: number) {
  const savedEvaluations = readJson<PreviewTrainerEvaluation[]>(PREVIEW_TRAINER_STORAGE.evaluations, []);
  return [...getBasePreviewTrainerEvaluations(), ...savedEvaluations]
    .filter((item) => item.memberId === memberId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function appendPreviewTrainerEvaluation(
  input: Omit<PreviewTrainerEvaluation, 'id' | 'createdAt'> & { createdAt?: string }
) {
  const savedEvaluations = readJson<PreviewTrainerEvaluation[]>(PREVIEW_TRAINER_STORAGE.evaluations, []);
  const nextEvaluation: PreviewTrainerEvaluation = {
    ...input,
    id: Date.now(),
    createdAt: input.createdAt || new Date().toISOString(),
  };

  writeJson(PREVIEW_TRAINER_STORAGE.evaluations, [...savedEvaluations, nextEvaluation]);
  return nextEvaluation;
}

export function getPreviewTrainerMemos(memberId: number) {
  const savedMemos = readJson<PreviewTrainerMemo[]>(PREVIEW_TRAINER_STORAGE.memos, []);
  return [...getBasePreviewTrainerMemos(), ...savedMemos]
    .filter((item) => item.memberId === memberId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function appendPreviewTrainerMemo(
  input: Omit<PreviewTrainerMemo, 'id' | 'createdAt'> & { createdAt?: string }
) {
  const savedMemos = readJson<PreviewTrainerMemo[]>(PREVIEW_TRAINER_STORAGE.memos, []);
  const nextMemo: PreviewTrainerMemo = {
    ...input,
    id: Date.now(),
    createdAt: input.createdAt || new Date().toISOString(),
  };

  writeJson(PREVIEW_TRAINER_STORAGE.memos, [...savedMemos, nextMemo]);
  return nextMemo;
}
