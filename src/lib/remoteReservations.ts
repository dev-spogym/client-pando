import { supabase } from '@/lib/supabase';
import type { WaitlistEntry } from '@/lib/memberExperience';
import type { LessonBookingRequestEntry } from '@/lib/lessonPlanning';

export type LessonBookingStatus = 'BOOKED' | 'WAITLIST' | 'PENDING' | 'CANCELLED';

export interface LessonBookingRecord {
  id: number;
  scheduleId: number;
  memberId: number;
  memberName: string | null;
  status: LessonBookingStatus;
  branchId: number | null;
  createdAt: string;
  title?: string | null;
  type?: string | null;
  staffId?: number | null;
  staffName?: string | null;
  room?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  note?: string | null;
}

interface ClassSnapshot {
  id: number;
  title: string;
  type: string;
  staffId: number | null;
  staffName: string;
  room: string | null;
  startTime: string;
  endTime: string;
}

export async function getActiveLessonBooking(memberId: number, classId: number) {
  const { data, error } = await supabase
    .from('lesson_bookings')
    .select('id, scheduleId, memberId, memberName, status, branchId, createdAt')
    .eq('memberId', memberId)
    .eq('scheduleId', classId)
    .in('status', ['BOOKED', 'WAITLIST', 'PENDING'])
    .order('createdAt', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as LessonBookingRecord | null;
}

export async function createLessonBooking(input: {
  memberId: number;
  memberName: string;
  classId: number;
  branchId: number;
  status: Exclude<LessonBookingStatus, 'CANCELLED'>;
  classSnapshot?: ClassSnapshot;
  source?: string;
  note?: string;
}) {
  const existing = await getActiveLessonBooking(input.memberId, input.classId);
  if (existing) return existing;

  const { data, error } = await supabase
    .from('lesson_bookings')
    .insert({
      scheduleId: input.classId,
      memberId: input.memberId,
      memberName: input.memberName,
      branchId: input.branchId,
      status: input.status,
      title: input.classSnapshot?.title ?? null,
      type: input.classSnapshot?.type ?? null,
      staffId: input.classSnapshot?.staffId ?? null,
      staffName: input.classSnapshot?.staffName ?? null,
      room: input.classSnapshot?.room ?? null,
      startTime: input.classSnapshot?.startTime ?? null,
      endTime: input.classSnapshot?.endTime ?? null,
      source: input.source ?? 'member_app',
      note: input.note ?? null,
    })
    .select('id, scheduleId, memberId, memberName, status, branchId, createdAt')
    .single();

  if (error) throw error;
  return data as LessonBookingRecord;
}

export async function cancelLessonBooking(bookingId: number, reason: string) {
  const { error } = await supabase
    .from('lesson_bookings')
    .update({ status: 'CANCELLED', cancelReason: reason })
    .eq('id', bookingId);

  if (error) throw error;
}

export async function getTrainerPendingLessonRequests(trainerId: number): Promise<LessonBookingRequestEntry[]> {
  const { data, error } = await supabase
    .from('lesson_bookings')
    .select('id, scheduleId, memberId, memberName, title, type, staffId, staffName, room, startTime, endTime, createdAt, note')
    .eq('staffId', trainerId)
    .eq('status', 'PENDING')
    .order('startTime', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((item) => ({
    id: `remote-${item.id}`,
    classId: item.scheduleId ?? 0,
    memberId: item.memberId,
    memberName: item.memberName ?? '회원',
    trainerId: item.staffId ?? trainerId,
    trainerName: item.staffName ?? '트레이너',
    title: item.title ?? 'PT 예약 요청',
    type: item.type ?? 'PT',
    startTime: item.startTime ?? item.createdAt,
    endTime: item.endTime ?? item.createdAt,
    room: item.room ?? null,
    status: 'pending',
    source: 'member_request',
    requestedAt: item.createdAt,
    resolvedAt: null,
    note: item.note ?? null,
  }));
}

export async function approveRemoteLessonBooking(
  requestId: string,
  patch: {
    classId: number;
    title: string;
    room: string | null;
  }
) {
  const bookingId = getRemoteBookingId(requestId);
  if (!bookingId) return;

  const { error } = await supabase
    .from('lesson_bookings')
    .update({
      scheduleId: patch.classId,
      title: patch.title,
      room: patch.room,
      status: 'BOOKED',
      resolvedAt: new Date().toISOString(),
    })
    .eq('id', bookingId);

  if (error) throw error;
}

export async function rejectRemoteLessonBooking(requestId: string, reason: string) {
  const bookingId = getRemoteBookingId(requestId);
  if (!bookingId) return;
  await cancelLessonBooking(bookingId, reason);
}

export async function getRemoteWaitlistEntries(memberId: number): Promise<WaitlistEntry[]> {
  const { data: bookings, error } = await supabase
    .from('lesson_bookings')
    .select('id, scheduleId, status, createdAt')
    .eq('memberId', memberId)
    .eq('status', 'WAITLIST')
    .order('createdAt', { ascending: false });

  if (error) throw error;
  if (!bookings?.length) return [];

  const classIds = bookings.map((booking) => booking.scheduleId).filter(Boolean);
  const { data: classes, error: classError } = await supabase
    .from('classes')
    .select('id, title, type, staffId, staffName, room, startTime, endTime')
    .in('id', classIds);

  if (classError) throw classError;

  const classById = new Map<number, ClassSnapshot>(
    (classes ?? []).map((item) => [item.id, item as ClassSnapshot])
  );

  return bookings.flatMap((booking, index) => {
    const cls = classById.get(booking.scheduleId);
    if (!cls) return [];

    return {
      classId: cls.id,
      title: cls.title,
      type: cls.type,
      staffId: cls.staffId ?? 0,
      staffName: cls.staffName,
      room: cls.room,
      startTime: cls.startTime,
      endTime: cls.endTime,
      position: index + 1,
      status: 'waiting' as const,
      autoPromoted: true,
      createdAt: booking.createdAt,
    };
  });
}

function getRemoteBookingId(requestId: string) {
  if (!requestId.startsWith('remote-')) return null;
  const id = Number(requestId.replace('remote-', ''));
  return Number.isFinite(id) ? id : null;
}
