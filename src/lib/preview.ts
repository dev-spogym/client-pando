import type { MockPaymentRecord, OnboardingDraft } from '@/lib/memberExperience';
import type { MemberProfile } from '@/stores/authStore';

export const PREVIEW_MEMBER_ID = 9001;

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
