export type MockMemberStatus = 'ACTIVE' | 'EXPIRED' | 'HOLD' | 'DORMANT';
export type ConsultationStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';
export type ConsultationType = '상담' | 'OT' | '체험' | '재등록상담';
export type ClassStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'pending_member_sign';
export type AttendanceStatus = 'pending' | 'attended' | 'late' | 'no_show';
export type NotificationRole = 'trainer' | 'fc' | 'staff';
export type NotificationCategory = 'reservation' | 'system' | 'expiry' | 'attendance' | 'signature';
export type MemberNoteType = 'general' | 'caution' | 'vip' | 'other';

export interface MockMember {
  id: number;
  name: string;
  phone: string;
  gender: 'M' | 'F';
  birthDate: string;
  status: MockMemberStatus;
  membershipName: string;
  membershipStart: string;
  membershipEnd: string;
  totalSessions: number;
  remainingSessions: number;
  joinDate: string;
  assignedTrainer: string;
  assignedFc: string;
  lockerLabel: string;
  favorite?: boolean;
  programSummary: string;
  attendanceRate: number;
  payments: Array<{ id: string; paidAt: string; product: string; amount: number; method: string }>;
  attendanceHistory: Array<{ id: string; checkInAt: string; checkOutAt: string | null; source: 'qr' | 'staff' }>;
  bodyMetrics: Array<{ id: string; measuredAt: string; weight: number; muscle: number; fat: number; memo: string }>;
  workoutHistory: Array<{ id: string; date: string; title: string; coach: string; memo: string }>;
}

export interface TrainerClassParticipant {
  memberId: number;
  memberName: string;
  attendanceStatus: AttendanceStatus;
  lateMinutes?: number;
  note?: string;
  remainingSessions: number;
}

export interface TrainerClass {
  id: number;
  title: string;
  type: 'PT' | 'GX' | 'GOLF';
  room: string;
  startTime: string;
  endTime: string;
  status: ClassStatus;
  source: 'trainer' | 'member_request';
  templateId: number | null;
  memo: string;
  participants: TrainerClassParticipant[];
}

export interface TrainerTemplate {
  id: number;
  name: string;
  category: 'PT' | 'GX' | 'GOLF';
  durationMinutes: number;
  intensity: 'low' | 'medium' | 'high';
  summary: string;
}

export interface PenaltyRecord {
  id: number;
  classId: number;
  memberId: number;
  memberName: string;
  title: string;
  type: 'NOSHOW' | 'LATE';
  reason: string;
  deductCount: number;
  appliedAt: string;
  status: 'active' | 'waived';
}

export interface Consultation {
  id: number;
  memberId: number | null;
  memberName: string;
  phone: string;
  type: ConsultationType;
  channel: '방문' | '전화' | '카카오톡' | 'SNS';
  scheduledAt: string;
  status: ConsultationStatus;
  result: '등록' | '미등록' | '보류' | null;
  summary: string;
  followUp: string;
}

export interface MemberNote {
  id: number;
  memberId: number;
  authorRole: 'trainer' | 'fc';
  authorName: string;
  content: string;
  type: MemberNoteType;
  createdAt: string;
  updatedAt: string | null;
}

export interface RoleNotification {
  id: number;
  role: NotificationRole;
  title: string;
  body: string;
  category: NotificationCategory;
  createdAt: string;
  read: boolean;
  path?: string;
}

export interface LessonCertificate {
  id: string;
  classId: number;
  title: string;
  memberName: string;
  mode: 'face_to_face' | 'remote';
  trainerSignedAt: string | null;
  memberSignedAt: string | null;
  completedAt: string | null;
  status: 'pending_member_sign' | 'completed';
}

export interface ManualAttendanceRecord {
  id: number;
  memberId: number;
  memberName: string;
  type: '입장' | '퇴장';
  reason: string;
  createdAt: string;
  handledBy: string;
}

export interface RoleSettings {
  pushEnabled: boolean;
  systemEnabled: boolean;
  attendanceEnabled?: boolean;
  reservationEnabled?: boolean;
  consultationEnabled?: boolean;
  expiryEnabled?: boolean;
}

interface MockOperationsState {
  trainerClasses: TrainerClass[];
  templates: TrainerTemplate[];
  penalties: PenaltyRecord[];
  consultations: Consultation[];
  memberNotes: MemberNote[];
  notifications: RoleNotification[];
  certificates: LessonCertificate[];
  manualAttendance: ManualAttendanceRecord[];
  settings: {
    trainer: RoleSettings;
    fc: RoleSettings;
    staff: RoleSettings;
  };
}

const STORAGE_KEY = 'fitgenie-operations-mock-v1';

function isBrowser() {
  return typeof window !== 'undefined';
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function offsetIso(days: number, hours = 9, minutes = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

const MOCK_MEMBERS: MockMember[] = [
  {
    id: 1201,
    name: '김회원',
    phone: '01012345678',
    gender: 'F',
    birthDate: '1994-05-16',
    status: 'ACTIVE',
    membershipName: 'PT 20회 패키지',
    membershipStart: offsetIso(-28, 9),
    membershipEnd: offsetIso(54, 23, 59),
    totalSessions: 20,
    remainingSessions: 8,
    joinDate: offsetIso(-210, 10),
    assignedTrainer: '박서연',
    assignedFc: '정하늘',
    lockerLabel: 'A-14',
    favorite: true,
    programSummary: '코어 안정화 + 자세 교정 4주 루틴',
    attendanceRate: 88,
    payments: [
      { id: 'pay-1201-1', paidAt: offsetIso(-25, 14), product: 'PT 20회 패키지', amount: 780000, method: '카드' },
      { id: 'pay-1201-2', paidAt: offsetIso(-5, 18), product: '재등록 보충 결제', amount: 120000, method: '네이버페이' },
    ],
    attendanceHistory: [
      { id: 'att-1201-1', checkInAt: offsetIso(-2, 18, 1), checkOutAt: offsetIso(-2, 19, 45), source: 'qr' },
      { id: 'att-1201-2', checkInAt: offsetIso(-5, 7, 55), checkOutAt: offsetIso(-5, 9, 10), source: 'staff' },
    ],
    bodyMetrics: [
      { id: 'body-1201-1', measuredAt: offsetIso(-20, 9), weight: 62.1, muscle: 24.6, fat: 19.8, memo: '기초 체력 양호' },
      { id: 'body-1201-2', measuredAt: offsetIso(-3, 9), weight: 60.8, muscle: 25.1, fat: 18.4, memo: '복부 체지방 감소' },
    ],
    workoutHistory: [
      { id: 'wk-1201-1', date: offsetIso(-2, 18), title: '코어 안정화 PT', coach: '박서연', memo: '플랭크 자세 개선' },
      { id: 'wk-1201-2', date: offsetIso(-7, 10), title: '하체 밸런스 PT', coach: '박서연', memo: '왼발 체중 이동 보완' },
    ],
  },
  {
    id: 1202,
    name: '박민수',
    phone: '01087654321',
    gender: 'M',
    birthDate: '1991-02-04',
    status: 'ACTIVE',
    membershipName: '골프 12회 레슨',
    membershipStart: offsetIso(-60, 11),
    membershipEnd: offsetIso(22, 23, 59),
    totalSessions: 12,
    remainingSessions: 4,
    joinDate: offsetIso(-420, 13),
    assignedTrainer: '윤태수',
    assignedFc: '정하늘',
    lockerLabel: 'B-09',
    programSummary: '골프 스윙 밸런스 + 회전 안정화',
    attendanceRate: 76,
    payments: [
      { id: 'pay-1202-1', paidAt: offsetIso(-55, 12), product: '골프 12회 레슨', amount: 960000, method: '현장카드' },
    ],
    attendanceHistory: [
      { id: 'att-1202-1', checkInAt: offsetIso(-1, 19, 2), checkOutAt: offsetIso(-1, 20, 11), source: 'qr' },
      { id: 'att-1202-2', checkInAt: offsetIso(-9, 20, 4), checkOutAt: offsetIso(-9, 21, 0), source: 'qr' },
    ],
    bodyMetrics: [
      { id: 'body-1202-1', measuredAt: offsetIso(-42, 8), weight: 77.5, muscle: 30.8, fat: 21.6, memo: '회전 가동범위 낮음' },
    ],
    workoutHistory: [
      { id: 'wk-1202-1', date: offsetIso(-1, 19), title: '골프 스윙 레슨', coach: '윤태수', memo: '백스윙 템포 유지' },
    ],
  },
  {
    id: 1203,
    name: '최민아',
    phone: '01023456789',
    gender: 'F',
    birthDate: '1996-10-11',
    status: 'ACTIVE',
    membershipName: 'PT 10회 패키지',
    membershipStart: offsetIso(-12, 10),
    membershipEnd: offsetIso(45, 23, 59),
    totalSessions: 10,
    remainingSessions: 6,
    joinDate: offsetIso(-90, 14),
    assignedTrainer: '박서연',
    assignedFc: '정하늘',
    lockerLabel: 'A-08',
    programSummary: '하체 체력 + 힙 힌지 패턴 학습',
    attendanceRate: 92,
    payments: [{ id: 'pay-1203-1', paidAt: offsetIso(-10, 11), product: 'PT 10회', amount: 430000, method: '카드' }],
    attendanceHistory: [{ id: 'att-1203-1', checkInAt: offsetIso(-3, 20), checkOutAt: offsetIso(-3, 21, 20), source: 'qr' }],
    bodyMetrics: [{ id: 'body-1203-1', measuredAt: offsetIso(-9, 9), weight: 54.2, muscle: 21.8, fat: 16.2, memo: '체지방 안정적' }],
    workoutHistory: [{ id: 'wk-1203-1', date: offsetIso(-3, 20), title: '힙 힌지 PT', coach: '박서연', memo: '덤벨 RDL 도입' }],
  },
  {
    id: 1204,
    name: '정유나',
    phone: '01099887766',
    gender: 'F',
    birthDate: '1989-03-09',
    status: 'EXPIRED',
    membershipName: '헬스 + GX 3개월',
    membershipStart: offsetIso(-120, 9),
    membershipEnd: offsetIso(5, 23, 59),
    totalSessions: 0,
    remainingSessions: 0,
    joinDate: offsetIso(-600, 12),
    assignedTrainer: '김예린',
    assignedFc: '정하늘',
    lockerLabel: '만료 예정',
    programSummary: '재등록 권장 대상',
    attendanceRate: 64,
    payments: [{ id: 'pay-1204-1', paidAt: offsetIso(-110, 17), product: '헬스 + GX 3개월', amount: 390000, method: '현금' }],
    attendanceHistory: [{ id: 'att-1204-1', checkInAt: offsetIso(-4, 18), checkOutAt: offsetIso(-4, 19, 10), source: 'qr' }],
    bodyMetrics: [{ id: 'body-1204-1', measuredAt: offsetIso(-33, 10), weight: 57.4, muscle: 20.3, fat: 18.1, memo: '재측정 필요' }],
    workoutHistory: [{ id: 'wk-1204-1', date: offsetIso(-6, 19), title: '필라테스 GX', coach: '김예린', memo: '복직근 개입 보완' }],
  },
  {
    id: 1205,
    name: '이재원',
    phone: '01011112222',
    gender: 'M',
    birthDate: '1987-08-22',
    status: 'HOLD',
    membershipName: 'PT 20회 패키지',
    membershipStart: offsetIso(-40, 10),
    membershipEnd: offsetIso(80, 23, 59),
    totalSessions: 20,
    remainingSessions: 14,
    joinDate: offsetIso(-310, 12),
    assignedTrainer: '박서연',
    assignedFc: '한지수',
    lockerLabel: '홀딩 7일',
    programSummary: '출장 홀딩 상태',
    attendanceRate: 51,
    payments: [{ id: 'pay-1205-1', paidAt: offsetIso(-35, 15), product: 'PT 20회', amount: 780000, method: '카드' }],
    attendanceHistory: [{ id: 'att-1205-1', checkInAt: offsetIso(-14, 7), checkOutAt: offsetIso(-14, 8, 20), source: 'qr' }],
    bodyMetrics: [{ id: 'body-1205-1', measuredAt: offsetIso(-18, 8), weight: 83.1, muscle: 33.2, fat: 23.4, memo: '출장 복귀 후 재평가 예정' }],
    workoutHistory: [{ id: 'wk-1205-1', date: offsetIso(-15, 7), title: '상체 복합 PT', coach: '박서연', memo: '어깨 가동성 재확인 필요' }],
  },
];

const INITIAL_STATE: MockOperationsState = {
  trainerClasses: [
    {
      id: 8101,
      title: '코어 안정화 PT',
      type: 'PT',
      room: 'PT룸 1',
      startTime: offsetIso(0, 10, 0),
      endTime: offsetIso(0, 10, 50),
      status: 'scheduled',
      source: 'member_request',
      templateId: 301,
      memo: '허리 통증 보완 위주 진행',
      participants: [
        { memberId: 1201, memberName: '김회원', attendanceStatus: 'pending', remainingSessions: 8 },
      ],
    },
    {
      id: 8102,
      title: '하체 밸런스 PT',
      type: 'PT',
      room: 'PT룸 2',
      startTime: offsetIso(1, 14, 0),
      endTime: offsetIso(1, 14, 50),
      status: 'in_progress',
      source: 'trainer',
      templateId: 302,
      memo: '고관절 가동 범위 체크',
      participants: [
        { memberId: 1203, memberName: '최민아', attendanceStatus: 'late', lateMinutes: 8, remainingSessions: 6 },
      ],
    },
    {
      id: 8103,
      title: '골프 회전 안정화 레슨',
      type: 'GOLF',
      room: '골프존 스튜디오',
      startTime: offsetIso(-1, 19, 0),
      endTime: offsetIso(-1, 19, 50),
      status: 'pending_member_sign',
      source: 'trainer',
      templateId: 303,
      memo: '백스윙 리듬 교정',
      participants: [
        { memberId: 1202, memberName: '박민수', attendanceStatus: 'attended', remainingSessions: 4 },
      ],
    },
    {
      id: 8104,
      title: '주말 리커버리 GX',
      type: 'GX',
      room: 'GX룸 A',
      startTime: offsetIso(-2, 11, 0),
      endTime: offsetIso(-2, 11, 50),
      status: 'completed',
      source: 'trainer',
      templateId: null,
      memo: '하체 스트레칭 + 호흡 패턴',
      participants: [
        { memberId: 1204, memberName: '정유나', attendanceStatus: 'no_show', remainingSessions: 0, note: '연락 없이 미참석' },
        { memberId: 1205, memberName: '이재원', attendanceStatus: 'attended', remainingSessions: 14 },
      ],
    },
  ],
  templates: [
    { id: 301, name: '코어 리셋 50분', category: 'PT', durationMinutes: 50, intensity: 'medium', summary: '호흡, 버드독, 데드버그, 사이드 플랭크' },
    { id: 302, name: '하체 밸런스 50분', category: 'PT', durationMinutes: 50, intensity: 'high', summary: '힙 힌지, RDL, 스플릿 스쿼트, 밴드 워크' },
    { id: 303, name: '골프 회전 안정화 50분', category: 'GOLF', durationMinutes: 50, intensity: 'medium', summary: '골반 회전, 백스윙 리듬, 체중 이동 패턴' },
  ],
  penalties: [
    {
      id: 9001,
      classId: 8104,
      memberId: 1204,
      memberName: '정유나',
      title: '주말 리커버리 GX',
      type: 'NOSHOW',
      reason: '연락 없이 미참석',
      deductCount: 1,
      appliedAt: offsetIso(-2, 12, 10),
      status: 'active',
    },
  ],
  consultations: [
    {
      id: 7001,
      memberId: 1201,
      memberName: '김회원',
      phone: '01012345678',
      type: '상담',
      channel: '방문',
      scheduledAt: offsetIso(0, 16, 0),
      status: 'scheduled',
      result: null,
      summary: '잔여 회차 이후 재등록 상담 예정',
      followUp: '패키지 업그레이드 제안 준비',
    },
    {
      id: 7002,
      memberId: 1204,
      memberName: '정유나',
      phone: '01099887766',
      type: '재등록상담',
      channel: '전화',
      scheduledAt: offsetIso(1, 11, 30),
      status: 'scheduled',
      result: null,
      summary: '만료 D-5 재등록 설득',
      followUp: 'GX+헬스 결합 플랜 견적 전달',
    },
    {
      id: 7003,
      memberId: 1205,
      memberName: '이재원',
      phone: '01011112222',
      type: 'OT',
      channel: '카카오톡',
      scheduledAt: offsetIso(-1, 9, 0),
      status: 'completed',
      result: '보류',
      summary: '출장 복귀 일정 확인',
      followUp: '다음 주 화요일 재연락',
    },
  ],
  memberNotes: [
    {
      id: 6001,
      memberId: 1201,
      authorRole: 'trainer',
      authorName: '박서연',
      content: '허리 통증은 오전보다 저녁에 심해짐',
      type: 'caution',
      createdAt: offsetIso(-4, 20),
      updatedAt: null,
    },
    {
      id: 6002,
      memberId: 1204,
      authorRole: 'fc',
      authorName: '정하늘',
      content: '재등록 혜택 문의가 많아 가격표 공유 필요',
      type: 'general',
      createdAt: offsetIso(-1, 10, 30),
      updatedAt: null,
    },
  ],
  notifications: [
    { id: 5001, role: 'trainer', title: '회원 예약 승인 대기', body: '김회원 님이 10:00 PT 슬롯을 요청했습니다.', category: 'reservation', createdAt: offsetIso(0, 8, 40), read: false, path: '/trainer/schedule' },
    { id: 5002, role: 'trainer', title: '노쇼 발생', body: '정유나 회원 노쇼 1건이 기록되었습니다.', category: 'attendance', createdAt: offsetIso(-2, 12, 12), read: false, path: '/trainer/penalties' },
    { id: 5003, role: 'trainer', title: '회원 서명 대기', body: '골프 레슨 쌍방서명 완료가 필요합니다.', category: 'signature', createdAt: offsetIso(-1, 20, 5), read: true, path: '/trainer/certificates' },
    { id: 5101, role: 'fc', title: '만료 임박 회원', body: '정유나 회원 이용권이 D-5 입니다.', category: 'expiry', createdAt: offsetIso(0, 9, 20), read: false, path: '/fc/expiring' },
    { id: 5102, role: 'fc', title: '상담 일정 리마인드', body: '김회원 님 상담이 오늘 16:00에 예정되어 있습니다.', category: 'system', createdAt: offsetIso(0, 8, 55), read: false, path: '/fc/leads' },
    { id: 5201, role: 'staff', title: '수동 출석 요청', body: 'QR 인식 불가 회원 문의가 접수되었습니다.', category: 'attendance', createdAt: offsetIso(0, 7, 45), read: false, path: '/staff/attendance/manual' },
    { id: 5202, role: 'staff', title: '시설 점검', body: '락커 2구역 사용률이 95%입니다.', category: 'system', createdAt: offsetIso(0, 9, 10), read: true, path: '/staff' },
  ],
  certificates: [
    {
      id: 'cert-8103',
      classId: 8103,
      title: '골프 회전 안정화 레슨',
      memberName: '박민수',
      mode: 'remote',
      trainerSignedAt: offsetIso(-1, 19, 55),
      memberSignedAt: null,
      completedAt: null,
      status: 'pending_member_sign',
    },
  ],
  manualAttendance: [
    { id: 4001, memberId: 1201, memberName: '김회원', type: '입장', reason: 'QR 인식 불가', createdAt: offsetIso(-3, 18, 2), handledBy: '데스크 김유리' },
  ],
  settings: {
    trainer: { pushEnabled: true, systemEnabled: true, reservationEnabled: true },
    fc: { pushEnabled: true, systemEnabled: true, consultationEnabled: true, expiryEnabled: true },
    staff: { pushEnabled: true, systemEnabled: true, attendanceEnabled: true },
  },
};

function normalizeMemberNote(raw: Partial<MemberNote>): MemberNote {
  return {
    id: typeof raw.id === 'number' ? raw.id : Date.now(),
    memberId: typeof raw.memberId === 'number' ? raw.memberId : 0,
    authorRole: raw.authorRole === 'trainer' ? 'trainer' : 'fc',
    authorName: raw.authorName || '담당자',
    content: raw.content || '',
    type: raw.type === 'caution' || raw.type === 'vip' || raw.type === 'other' ? raw.type : 'general',
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || null,
  };
}

function readState(): MockOperationsState {
  if (!isBrowser()) return clone(INITIAL_STATE);

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return clone(INITIAL_STATE);
    const parsed = JSON.parse(saved) as Partial<MockOperationsState>;

    return {
      ...clone(INITIAL_STATE),
      ...parsed,
      memberNotes: Array.isArray(parsed.memberNotes)
        ? parsed.memberNotes.map((item) => normalizeMemberNote(item))
        : clone(INITIAL_STATE.memberNotes),
      settings: {
        trainer: {
          ...INITIAL_STATE.settings.trainer,
          ...(parsed.settings?.trainer || {}),
        },
        fc: {
          ...INITIAL_STATE.settings.fc,
          ...(parsed.settings?.fc || {}),
        },
        staff: {
          ...INITIAL_STATE.settings.staff,
          ...(parsed.settings?.staff || {}),
        },
      },
    };
  } catch {
    return clone(INITIAL_STATE);
  }
}

function writeState(state: MockOperationsState) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function mutateState(mutator: (state: MockOperationsState) => MockOperationsState) {
  const next = mutator(readState());
  writeState(next);
  return next;
}

export function getMockMembers() {
  return clone(MOCK_MEMBERS);
}

export function getMockMemberById(memberId: number) {
  return getMockMembers().find((item) => item.id === memberId) || null;
}

export function getTrainerClasses() {
  return readState().trainerClasses.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
}

export function getTrainerClassById(classId: number) {
  return getTrainerClasses().find((item) => item.id === classId) || null;
}

export function updateTrainerClass(nextClass: TrainerClass) {
  return mutateState((state) => ({
    ...state,
    trainerClasses: state.trainerClasses.map((item) => (item.id === nextClass.id ? nextClass : item)),
  }));
}

export function setTrainerClassStatus(classId: number, status: ClassStatus) {
  const current = getTrainerClassById(classId);
  if (!current) return null;
  const nextClass = { ...current, status };
  updateTrainerClass(nextClass);
  return nextClass;
}

export function setTrainerParticipantAttendance(
  classId: number,
  memberId: number,
  attendanceStatus: AttendanceStatus,
  options?: { note?: string; lateMinutes?: number; applyPenalty?: boolean }
) {
  const current = getTrainerClassById(classId);
  if (!current) return null;

  const nextParticipants = current.participants.map((item) => (
    item.memberId === memberId
      ? {
          ...item,
          attendanceStatus,
          note: options?.note ?? item.note,
          lateMinutes: attendanceStatus === 'late' ? (options?.lateMinutes ?? item.lateMinutes ?? 5) : undefined,
        }
      : item
  ));

  updateTrainerClass({ ...current, participants: nextParticipants });

  mutateState((state) => {
    const existingPenalty = state.penalties.find((item) => item.classId === classId && item.memberId === memberId);
    const targetMember = nextParticipants.find((item) => item.memberId === memberId);
    const penalties = state.penalties.filter((item) => !(item.classId === classId && item.memberId === memberId && attendanceStatus !== 'no_show'));

    if (attendanceStatus === 'no_show' && options?.applyPenalty !== false && targetMember) {
      const nextPenalty: PenaltyRecord = {
        id: existingPenalty?.id ?? Date.now(),
        classId,
        memberId,
        memberName: targetMember.memberName,
        title: current.title,
        type: 'NOSHOW',
        reason: options?.note || targetMember.note || '연락 없이 미참석',
        deductCount: 1,
        appliedAt: new Date().toISOString(),
        status: 'active',
      };

      return {
        ...state,
        penalties: [...penalties.filter((item) => item.id !== nextPenalty.id), nextPenalty],
      };
    }

    return { ...state, penalties };
  });

  return getTrainerClassById(classId);
}

export function completeTrainerClass(classId: number) {
  return setTrainerClassStatus(classId, 'completed');
}

export function getTrainerTemplates() {
  return readState().templates;
}

export function addTrainerTemplate(template: Omit<TrainerTemplate, 'id'>) {
  return mutateState((state) => ({
    ...state,
    templates: [...state.templates, { ...template, id: Date.now() }],
  }));
}

export function getTrainerPenalties() {
  return readState().penalties.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
}

export function waivePenalty(penaltyId: number) {
  return mutateState((state) => ({
    ...state,
    penalties: state.penalties.map((item) => (
      item.id === penaltyId ? { ...item, status: 'waived' } : item
    )),
  }));
}

export function getRoleNotifications(role: NotificationRole) {
  return readState().notifications
    .filter((item) => item.role === role)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function markAllNotificationsRead(role: NotificationRole) {
  return mutateState((state) => ({
    ...state,
    notifications: state.notifications.map((item) => (
      item.role === role ? { ...item, read: true } : item
    )),
  }));
}

export function markNotificationRead(notificationId: number) {
  return mutateState((state) => ({
    ...state,
    notifications: state.notifications.map((item) => (
      item.id === notificationId ? { ...item, read: true } : item
    )),
  }));
}

export function getTrainerKpi() {
  const classes = getTrainerClasses();
  const penalties = getTrainerPenalties();
  const total = classes.length;
  const completed = classes.filter((item) => item.status === 'completed').length;
  const noShowCount = penalties.filter((item) => item.type === 'NOSHOW' && item.status === 'active').length;

  return {
    totalClasses: total,
    completedClasses: completed,
    pendingSignatures: readState().certificates.filter((item) => item.status === 'pending_member_sign').length,
    noShowCount,
    completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
    activeMembers: getMockMembers().filter((item) => item.assignedTrainer === '박서연' && item.status === 'ACTIVE').length,
  };
}

export function signTrainerForClass(classId: number, mode: 'face_to_face' | 'remote') {
  const trainerClass = getTrainerClassById(classId);
  if (!trainerClass || trainerClass.participants.length === 0) return null;
  const participant = trainerClass.participants[0];

  mutateState((state) => {
    const existing = state.certificates.find((item) => item.classId === classId);
    const nextCertificate: LessonCertificate = {
      id: existing?.id || `cert-${classId}`,
      classId,
      title: trainerClass.title,
      memberName: participant.memberName,
      mode,
      trainerSignedAt: new Date().toISOString(),
      memberSignedAt: existing?.memberSignedAt || null,
      completedAt: existing?.completedAt || null,
      status: existing?.memberSignedAt ? 'completed' : 'pending_member_sign',
    };

    return {
      ...state,
      trainerClasses: state.trainerClasses.map((item) => (
        item.id === classId ? { ...item, status: existing?.memberSignedAt ? 'completed' : 'pending_member_sign' } : item
      )),
      certificates: [...state.certificates.filter((item) => item.classId !== classId), nextCertificate],
    };
  });

  return getCertificateByClassId(classId);
}

export function signMemberForClass(classId: number) {
  mutateState((state) => {
    const certificate = state.certificates.find((item) => item.classId === classId);
    if (!certificate) return state;

    const completedAt = new Date().toISOString();

    return {
      ...state,
      trainerClasses: state.trainerClasses.map((item) => (
        item.id === classId ? { ...item, status: 'completed' } : item
      )),
      certificates: state.certificates.map((item) => (
        item.classId === classId
          ? {
              ...item,
              memberSignedAt: item.memberSignedAt || completedAt,
              completedAt,
              status: 'completed',
            }
          : item
      )),
    };
  });

  return getCertificateByClassId(classId);
}

export function getCertificates() {
  return readState().certificates.sort((a, b) => {
    const aTime = a.completedAt || a.trainerSignedAt || '';
    const bTime = b.completedAt || b.trainerSignedAt || '';
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });
}

export function getCertificateById(certificateId: string) {
  return getCertificates().find((item) => item.id === certificateId) || null;
}

export function getCertificateByClassId(classId: number) {
  return getCertificates().find((item) => item.classId === classId) || null;
}

export function getConsultations() {
  return readState().consultations.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
}

export function getConsultationById(consultationId: number) {
  return getConsultations().find((item) => item.id === consultationId) || null;
}

export function addConsultation(consultation: Omit<Consultation, 'id'>) {
  return mutateState((state) => ({
    ...state,
    consultations: [...state.consultations, { ...consultation, id: Date.now() }],
  }));
}

export function updateConsultation(consultationId: number, patch: Partial<Consultation>) {
  return mutateState((state) => ({
    ...state,
    consultations: state.consultations.map((item) => (
      item.id === consultationId ? { ...item, ...patch } : item
    )),
  }));
}

export function getExpiringMembers() {
  return getMockMembers()
    .filter((item) => new Date(item.membershipEnd).getTime() > Date.now() - (1000 * 60 * 60 * 24 * 7))
    .sort((a, b) => new Date(a.membershipEnd).getTime() - new Date(b.membershipEnd).getTime());
}

export function getMemberNotes(memberId: number) {
  return readState().memberNotes
    .filter((item) => item.memberId === memberId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getInitialMemberNotes(memberId: number) {
  return clone(INITIAL_STATE.memberNotes)
    .filter((item) => item.memberId === memberId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addMemberNote(
  memberId: number,
  authorRole: 'trainer' | 'fc',
  authorName: string,
  content: string,
  type: MemberNoteType
) {
  return mutateState((state) => ({
    ...state,
    memberNotes: [
      {
        id: Date.now(),
        memberId,
        authorRole,
        authorName,
        content,
        type,
        createdAt: new Date().toISOString(),
        updatedAt: null,
      },
      ...state.memberNotes,
    ],
  }));
}

export function updateMemberNote(noteId: number, patch: Pick<MemberNote, 'content' | 'type'>) {
  return mutateState((state) => ({
    ...state,
    memberNotes: state.memberNotes.map((item) => (
      item.id === noteId
        ? {
            ...item,
            content: patch.content,
            type: patch.type,
            updatedAt: new Date().toISOString(),
          }
        : item
    )),
  }));
}

export function deleteMemberNote(noteId: number) {
  return mutateState((state) => ({
    ...state,
    memberNotes: state.memberNotes.filter((item) => item.id !== noteId),
  }));
}

export function getFcDashboard() {
  const consultations = getConsultations();
  const todayKey = offsetIso(0, 0, 0).split('T')[0];
  const todayConsultations = consultations.filter((item) => item.scheduledAt.startsWith(todayKey));

  return {
    todayConsultationCount: todayConsultations.length,
    assignedMembers: getMockMembers().filter((item) => item.assignedFc === '정하늘').length,
    expiringMembers: getExpiringMembers().filter((item) => item.assignedFc === '정하늘').length,
    newLeads: consultations.filter((item) => item.memberId === null || item.result === null).length,
    todayConsultations,
  };
}

export function getFcKpi() {
  const consultations = getConsultations();
  const completed = consultations.filter((item) => item.status === 'completed');
  const registered = completed.filter((item) => item.result === '등록').length;
  const scheduled = consultations.filter((item) => item.status === 'scheduled').length;

  return {
    conversionRate: completed.length === 0 ? 0 : Math.round((registered / completed.length) * 100),
    totalConsultations: consultations.length,
    completedConsultations: completed.length,
    scheduledConsultations: scheduled,
    holdMembers: getMockMembers().filter((item) => item.status === 'HOLD').length,
  };
}

export function getManualAttendanceRecords() {
  return readState().manualAttendance.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addManualAttendance(record: Omit<ManualAttendanceRecord, 'id' | 'createdAt'>) {
  return mutateState((state) => ({
    ...state,
    manualAttendance: [
      {
        ...record,
        id: Date.now(),
        createdAt: new Date().toISOString(),
      },
      ...state.manualAttendance,
    ],
  }));
}

export function getStaffDashboard() {
  const todayKey = offsetIso(0, 0, 0).split('T')[0];
  const todayAttendance = getMockMembers().flatMap((member) => (
    member.attendanceHistory.filter((record) => record.checkInAt.startsWith(todayKey))
  ));

  return {
    todayAttendanceCount: todayAttendance.length,
    activeVisitors: todayAttendance.filter((item) => !item.checkOutAt).length,
    lockerUsage: { used: 74, total: 96 },
  };
}

export function getStaffSchedules() {
  return getTrainerClasses().map((item) => ({
    id: item.id,
    title: item.title,
    coach: item.type === 'GOLF' ? '윤태수' : '박서연',
    room: item.room,
    startTime: item.startTime,
    endTime: item.endTime,
    status: item.status,
    booked: item.participants.length,
    capacity: item.type === 'GX' ? 20 : 1,
  }));
}

export function getRoleSettings(role: NotificationRole) {
  return readState().settings[role];
}

export function getInitialRoleSettings(role: NotificationRole) {
  return clone(INITIAL_STATE.settings[role]);
}

export function updateRoleSettings(role: NotificationRole, patch: Partial<RoleSettings>) {
  return mutateState((state) => ({
    ...state,
    settings: {
      ...state.settings,
      [role]: {
        ...state.settings[role],
        ...patch,
      },
    },
  }));
}

export function getMockProfile(role: 'trainer' | 'fc' | 'staff') {
  if (role === 'fc') {
    return {
      name: '정하늘',
      title: 'FC',
      subtitle: '회원 전환 관리',
      branch: '강남점',
      email: 'jeong.haneul@spogym.local',
    };
  }

  if (role === 'staff') {
    return {
      name: '김유리',
      title: 'Staff',
      subtitle: '데스크 운영',
      branch: '강남점',
      email: 'kim.yuri@spogym.local',
    };
  }

  return {
    name: '박서연',
    title: 'Trainer',
    subtitle: 'PT · 골프 레슨',
    branch: '강남점',
    email: 'park.seoyeon@spogym.local',
  };
}
