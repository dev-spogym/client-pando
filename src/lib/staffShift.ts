// 스태프 본인 출퇴근 mock 라이브러리 (localStorage 기반)
// MA-500: 본인 기록만 저장·조회 (mock이므로 전체가 본인)

const STORAGE_KEY = 'fitgenie-staff-shift';

// ─── 타입 ─────────────────────────────────────────────────────────────────────

export type ShiftType = '출근' | '퇴근';

export interface ShiftRecord {
  id: string;
  type: ShiftType;
  at: string;       // ISO 8601 타임스탬프
  synced: boolean;  // 근태 시스템 전송 여부
}

// ─── 내부 유틸 ────────────────────────────────────────────────────────────────

/** SSR 안전: window가 없으면 빈 배열 반환 */
function loadAll(): ShiftRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ShiftRecord[]) : [];
  } catch {
    return [];
  }
}

function saveAll(records: ShiftRecord[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

/** 오늘(YYYY-MM-DD) 문자열 */
function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/** 오늘의 기록만 필터 */
function todayRecords(records: ShiftRecord[]): ShiftRecord[] {
  const today = todayStr();
  return records.filter((r) => r.at.startsWith(today));
}

// ─── 공개 API ─────────────────────────────────────────────────────────────────

/**
 * 오늘 출근/퇴근 시각 요약 반환.
 * 기록이 없으면 null.
 */
export function getTodayShift(): { checkInAt: string | null; checkOutAt: string | null } {
  const records = todayRecords(loadAll());
  const checkIn = records.find((r) => r.type === '출근');
  const checkOut = records.find((r) => r.type === '퇴근');
  return {
    checkInAt: checkIn?.at ?? null,
    checkOutAt: checkOut?.at ?? null,
  };
}

/**
 * 전체 본인 기록 반환 (최근순).
 */
export function getShiftRecords(): ShiftRecord[] {
  return [...loadAll()].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );
}

/**
 * 출퇴근 기록 추가.
 * - 이미 오늘 출근 기록이 있는데 다시 출근 요청 → Error
 * - 오늘 출근 기록이 없는데 퇴근 요청 → Error
 * - 이미 오늘 퇴근 기록이 있는데 다시 퇴근 요청 → Error
 */
export function recordShift(type: ShiftType): ShiftRecord {
  const records = loadAll();
  const today = todayRecords(records);

  const alreadyIn = today.some((r) => r.type === '출근');
  const alreadyOut = today.some((r) => r.type === '퇴근');

  if (type === '출근' && alreadyIn) {
    throw new Error('오늘 이미 출근 기록이 있습니다.');
  }
  if (type === '퇴근' && !alreadyIn) {
    throw new Error('출근 기록이 없어 퇴근할 수 없습니다.');
  }
  if (type === '퇴근' && alreadyOut) {
    throw new Error('오늘 이미 퇴근 기록이 있습니다.');
  }

  const newRecord: ShiftRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    at: new Date().toISOString(),
    synced: true, // mock: 즉시 "근태 시스템 전송됨" 처리
  };

  saveAll([...records, newRecord]);
  return newRecord;
}
