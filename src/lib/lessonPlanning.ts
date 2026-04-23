export type LessonRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LessonBookingRequestEntry {
  id: string;
  classId: number;
  memberId: number;
  memberName: string;
  trainerId: number;
  trainerName: string;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  room: string | null;
  status: LessonRequestStatus;
  source: 'member_request' | 'trainer_assignment';
  requestedAt: string;
  resolvedAt: string | null;
  note: string | null;
}

export interface LessonCountSummary {
  id: string;
  memberId: number;
  productName: string;
  totalCount: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  note: string | null;
}

export interface LessonCountHistoryEntry {
  id: string;
  memberId: number;
  lessonCountId: string;
  classId: number | null;
  title: string;
  trainerName: string | null;
  deductedAt: string;
  note: string | null;
}

const LESSON_REQUESTS_KEY = 'spogym-lesson-booking-requests';

function isBrowser() {
  return typeof window !== 'undefined';
}

function readArray<T>(key: string): T[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T[] : [];
  } catch {
    return [];
  }
}

function writeJson(key: string, value: unknown) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function hasStorageValue(key: string) {
  if (!isBrowser()) return false;
  return window.localStorage.getItem(key) !== null;
}

function mergeById<T extends { id: string }>(existing: T[], defaults: T[]) {
  if (defaults.length === 0) return existing;
  const merged = new Map<string, T>();
  defaults.forEach((item) => merged.set(item.id, item));
  existing.forEach((item) => merged.set(item.id, item));
  return Array.from(merged.values());
}

function lessonCountsKey(memberId: number) {
  return `spogym-lesson-counts-${memberId}`;
}

function lessonCountHistoriesKey(memberId: number) {
  return `spogym-lesson-count-histories-${memberId}`;
}

export function getLessonBookingRequests() {
  return readArray<LessonBookingRequestEntry>(LESSON_REQUESTS_KEY).sort(
    (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
  );
}

export function getMemberLessonBookingRequests(
  memberId: number,
  statuses?: LessonRequestStatus[]
) {
  return getLessonBookingRequests().filter((item) => {
    if (item.memberId !== memberId) return false;
    if (!statuses || statuses.length === 0) return true;
    return statuses.includes(item.status);
  });
}

export function getTrainerLessonBookingRequests(
  trainerId: number,
  statuses?: LessonRequestStatus[]
) {
  return getLessonBookingRequests().filter((item) => {
    if (item.trainerId !== trainerId) return false;
    if (!statuses || statuses.length === 0) return true;
    return statuses.includes(item.status);
  });
}

export function getPendingLessonRequestForClass(memberId: number, classId: number) {
  return getLessonBookingRequests().find(
    (item) => item.memberId === memberId && item.classId === classId && item.status === 'pending'
  ) || null;
}

export function createLessonBookingRequest(
  input: Omit<LessonBookingRequestEntry, 'id' | 'status' | 'requestedAt' | 'resolvedAt'> & {
    status?: LessonRequestStatus;
    requestedAt?: string;
  }
) {
  const list = getLessonBookingRequests();
  const existing = list.find(
    (item) =>
      item.memberId === input.memberId &&
      item.trainerId === input.trainerId &&
      item.startTime === input.startTime &&
      item.endTime === input.endTime &&
      (item.status === 'pending' || item.status === 'approved')
  );

  if (existing) return existing;

  const next: LessonBookingRequestEntry = {
    ...input,
    id: `lesson-request-${Date.now()}`,
    status: input.status ?? 'pending',
    requestedAt: input.requestedAt ?? new Date().toISOString(),
    resolvedAt: null,
  };

  writeJson(LESSON_REQUESTS_KEY, [next, ...list]);
  return next;
}

export function updateLessonBookingRequestStatus(
  requestId: string,
  status: LessonRequestStatus,
  note?: string | null,
  patch?: Partial<Omit<LessonBookingRequestEntry, 'id' | 'memberId' | 'trainerId' | 'requestedAt'>>
) {
  let updated: LessonBookingRequestEntry | null = null;

  const nextList = getLessonBookingRequests().map((item) => {
    if (item.id !== requestId) return item;

    updated = {
      ...item,
      ...(patch || {}),
      status,
      resolvedAt: status === 'pending' ? null : new Date().toISOString(),
      note: note === undefined ? item.note : note,
    };
    return updated;
  });

  writeJson(LESSON_REQUESTS_KEY, nextList);
  return updated;
}

export function getLocalLessonCounts(memberId: number) {
  return readArray<LessonCountSummary>(lessonCountsKey(memberId)).sort(
    (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
  );
}

export function setLocalLessonCounts(memberId: number, counts: LessonCountSummary[]) {
  writeJson(lessonCountsKey(memberId), counts);
}

export function getLocalLessonCountHistories(memberId: number) {
  return readArray<LessonCountHistoryEntry>(lessonCountHistoriesKey(memberId)).sort(
    (a, b) => new Date(b.deductedAt).getTime() - new Date(a.deductedAt).getTime()
  );
}

export function getLocalLessonCountHistoryByClass(memberId: number, classId: number) {
  return getLocalLessonCountHistories(memberId).find((item) => item.classId === classId) || null;
}

export function setLocalLessonCountHistories(memberId: number, histories: LessonCountHistoryEntry[]) {
  writeJson(lessonCountHistoriesKey(memberId), histories);
}

export function recordLocalLessonCountUsage(input: {
  memberId: number;
  classId: number | null;
  title: string;
  trainerName: string | null;
  note?: string | null;
  deductedAt?: string;
}) {
  const counts = getLocalLessonCounts(input.memberId);
  const existingHistory = input.classId !== null
    ? getLocalLessonCountHistoryByClass(input.memberId, input.classId)
    : null;

  if (existingHistory) {
    return {
      summary: counts.find((item) => item.id === existingHistory.lessonCountId) || null,
      history: existingHistory,
    };
  }

  const targetIndex = counts.findIndex((item) => item.usedCount < item.totalCount);

  if (targetIndex < 0) {
    return null;
  }

  const target = counts[targetIndex];
  const nextSummary: LessonCountSummary = {
    ...target,
    usedCount: Math.min(target.totalCount, target.usedCount + 1),
  };
  const nextCounts = [...counts];
  nextCounts[targetIndex] = nextSummary;
  setLocalLessonCounts(input.memberId, nextCounts);

  const nextHistory: LessonCountHistoryEntry = {
    id: `lesson-count-history-${Date.now()}`,
    memberId: input.memberId,
    lessonCountId: target.id,
    classId: input.classId,
    title: input.title,
    trainerName: input.trainerName,
    deductedAt: input.deductedAt ?? new Date().toISOString(),
    note: input.note ?? null,
  };

  setLocalLessonCountHistories(input.memberId, [nextHistory, ...getLocalLessonCountHistories(input.memberId)]);

  return {
    summary: nextSummary,
    history: nextHistory,
  };
}

export function seedLessonPlanningStorage(input: {
  memberId: number;
  counts: LessonCountSummary[];
  histories: LessonCountHistoryEntry[];
  requests?: LessonBookingRequestEntry[];
}) {
  const countKey = lessonCountsKey(input.memberId);
  if (!hasStorageValue(countKey)) {
    setLocalLessonCounts(input.memberId, input.counts);
  } else if (input.counts.length > 0) {
    writeJson(countKey, mergeById(getLocalLessonCounts(input.memberId), input.counts));
  }

  const historyKey = lessonCountHistoriesKey(input.memberId);
  if (!hasStorageValue(historyKey)) {
    setLocalLessonCountHistories(input.memberId, input.histories);
  } else if (input.histories.length > 0) {
    writeJson(historyKey, mergeById(getLocalLessonCountHistories(input.memberId), input.histories));
  }

  if (!hasStorageValue(LESSON_REQUESTS_KEY)) {
    writeJson(LESSON_REQUESTS_KEY, input.requests ?? []);
  } else if ((input.requests || []).length > 0) {
    writeJson(LESSON_REQUESTS_KEY, mergeById(getLessonBookingRequests(), input.requests || []));
  }
}
