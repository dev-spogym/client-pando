import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarRange, Clock, Sparkles, Star, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { getInstructorProfile } from '@/lib/memberExperience';
import {
  createLessonBookingRequest,
  getMemberLessonBookingRequests,
  getTrainerLessonBookingRequests,
  type LessonBookingRequestEntry,
} from '@/lib/lessonPlanning';
import { getPreviewTrainerClasses, isPreviewMode } from '@/lib/preview';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { cn, formatDateKo, formatTime } from '@/lib/utils';

interface ScheduleClass {
  id: number;
  title: string;
  type: string;
  staffId: number | null;
  staffName: string;
  startTime: string;
  endTime: string;
  room: string | null;
  capacity: number;
  booked: number;
  member_id: number | null;
}

interface AvailableSlot extends ScheduleClass {
  source: 'existing_slot' | 'free_time';
}

function buildAutomaticFreeSlots(
  schedule: ScheduleClass[],
  trainerId: number,
  trainerName: string
): AvailableSlot[] {
  const now = new Date();
  const slots: AvailableSlot[] = [];
  const businessHours = [9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20];

  for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
    const day = new Date();
    day.setDate(day.getDate() + dayOffset);
    day.setSeconds(0, 0);

    businessHours.forEach((hour) => {
      const start = new Date(day);
      start.setHours(hour, 0, 0, 0);

      const end = new Date(start);
      end.setMinutes(50);

      if (start <= now) return;

      const overlaps = schedule.some((item) => {
        const itemStart = new Date(item.startTime).getTime();
        const itemEnd = new Date(item.endTime).getTime();
        return start.getTime() < itemEnd && end.getTime() > itemStart;
      });

      if (overlaps) return;

      slots.push({
        id: -Math.floor(start.getTime() / 1000),
        title: `${trainerName} PT 요청`,
        type: 'PT',
        staffId: trainerId,
        staffName: trainerName,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        room: '협의 후 지정',
        capacity: 1,
        booked: 0,
        member_id: null,
        source: 'free_time',
      });
    });
  }

  return slots.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
}

/** 강사 상세 */
export default function InstructorDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { member } = useAuthStore();
  const instructorId = Number(id || 0);
  const profile = getInstructorProfile(instructorId);

  const [schedule, setSchedule] = useState<ScheduleClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState<number | null>(null);
  const [myRequests, setMyRequests] = useState<LessonBookingRequestEntry[]>([]);
  const [trainerRequests, setTrainerRequests] = useState<LessonBookingRequestEntry[]>([]);

  useEffect(() => {
    if (!member || !instructorId) {
      setMyRequests([]);
      setTrainerRequests([]);
      return;
    }
    setMyRequests(getMemberLessonBookingRequests(member.id));
    setTrainerRequests(getTrainerLessonBookingRequests(instructorId, ['pending', 'approved']));
  }, [member, instructorId]);

  useEffect(() => {
    if (!instructorId) return;
    void fetchSchedule();
  }, [instructorId]);

  const fetchSchedule = async () => {
    setLoading(true);

    if (isPreviewMode()) {
      const previewSchedule = getPreviewTrainerClasses()
        .filter((item) => item.staffId === instructorId && new Date(item.startTime) >= new Date())
        .map((item) => ({
          id: item.id,
          title: item.title,
          type: item.type,
          staffId: item.staffId,
          staffName: item.staffName,
          startTime: item.startTime,
          endTime: item.endTime,
          room: item.room,
          capacity: item.capacity,
          booked: item.booked,
          member_id: item.memberId ?? null,
        }));

      setSchedule(previewSchedule);
      setLoading(false);
      return;
    }

    const rangeEnd = new Date();
    rangeEnd.setDate(rangeEnd.getDate() + 7);

    const { data } = await supabase
      .from('classes')
      .select('id, title, type, staffId, staffName, startTime, endTime, room, capacity, booked, member_id')
      .eq('staffId', instructorId)
      .gte('startTime', new Date().toISOString())
      .lt('startTime', rangeEnd.toISOString())
      .order('startTime')
      .limit(60);

    setSchedule((data || []) as ScheduleClass[]);
    setLoading(false);
  };

  const requestMap = useMemo(() => {
    const nextMap = new Map<number, LessonBookingRequestEntry>();
    myRequests
      .filter((item) => item.trainerId === instructorId)
      .forEach((item) => nextMap.set(item.classId, item));
    return nextMap;
  }, [instructorId, myRequests]);

  const trainerRequestMap = useMemo(() => {
    const nextMap = new Map<string, LessonBookingRequestEntry>();
    trainerRequests.forEach((item) => {
      nextMap.set(`${item.startTime}-${item.endTime}`, item);
    });
    return nextMap;
  }, [trainerRequests]);

  const existingOpenSlots = useMemo<AvailableSlot[]>(
    () =>
      schedule
        .filter((slot) => slot.type === 'PT' && slot.booked < slot.capacity && !slot.member_id)
        .map((slot) => ({ ...slot, source: 'existing_slot' as const })),
    [schedule]
  );

  const automaticFreeSlots = useMemo<AvailableSlot[]>(() => {
    const autoSlots = buildAutomaticFreeSlots(schedule, instructorId, profile.name);
    return autoSlots.filter(
      (slot) => !existingOpenSlots.some((existing) => existing.startTime === slot.startTime && existing.endTime === slot.endTime)
    );
  }, [existingOpenSlots, instructorId, profile.name, schedule]);

  const availableSlots = useMemo(
    () => [...existingOpenSlots, ...automaticFreeSlots].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).slice(0, 12),
    [automaticFreeSlots, existingOpenSlots]
  );

  const occupiedSlots = useMemo(
    () => schedule.filter((slot) => slot.member_id || slot.booked >= slot.capacity || slot.type !== 'PT').slice(0, 4),
    [schedule]
  );

  const handleRequest = (slot: AvailableSlot) => {
    if (!member) {
      toast.error('로그인 후 예약을 요청할 수 있습니다.');
      return;
    }

    const existing = requestMap.get(slot.id);
    if (existing?.status === 'pending') {
      toast.info('이미 승인 대기 중인 예약 요청입니다.');
      return;
    }

    const occupiedByAnotherRequest = trainerRequestMap.get(`${slot.startTime}-${slot.endTime}`);
    if (occupiedByAnotherRequest && occupiedByAnotherRequest.memberId !== member.id) {
      toast.info('이미 다른 회원의 승인 대기 요청이 있는 시간대입니다.');
      return;
    }

    setRequestingId(slot.id);

    const created = createLessonBookingRequest({
      classId: slot.id,
      memberId: member.id,
      memberName: member.name,
      trainerId: slot.staffId ?? instructorId,
      trainerName: slot.staffName,
      title: slot.source === 'free_time' ? `${profile.name} 맞춤 PT 요청` : slot.title,
      type: slot.type,
      startTime: slot.startTime,
      endTime: slot.endTime,
      room: slot.room,
      source: 'member_request',
      note:
        slot.source === 'free_time'
          ? '트레이너 수업이 없는 시간대를 자동 체크해 회원이 요청함'
          : '회원이 트레이너 오픈 슬롯을 보고 예약 요청함',
    });

    setMyRequests(getMemberLessonBookingRequests(member.id));
    setTrainerRequests(getTrainerLessonBookingRequests(instructorId, ['pending', 'approved']));
    setRequestingId(null);

    if (created.status === 'pending') {
      toast.success('예약 요청이 접수되었습니다. 트레이너 승인 후 확정됩니다.');
    } else {
      toast.info('이미 처리된 요청입니다.');
    }
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-surface sticky top-0 z-10 border-b border-line">
        <div className="flex items-center px-4 pt-safe-top h-14">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-content" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-lg">강사 상세</h1>
          <div className="w-6" />
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 pb-24">
        <section className="bg-surface rounded-card p-5 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center">
              <UserRound className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xl font-bold">{profile.name}</p>
              <p className="text-sm text-content-secondary mt-1">경력 {profile.careerYears}년</p>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-1 text-state-warning font-medium">
                  <Star className="w-4 h-4 fill-current" />
                  {profile.rating.toFixed(1)}
                </span>
                <span className="text-content-tertiary">후기 {profile.reviewCount}건</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-content-secondary mt-4 leading-relaxed">{profile.intro}</p>
        </section>

        <section className="bg-primary/8 rounded-card p-4 border border-primary/15">
          <p className="text-sm font-semibold text-primary">회원 예약 요청 방식</p>
          <p className="text-sm text-content-secondary mt-1">
            트레이너 실제 일정에서 수업이 없는 시간대를 자동 체크해 보여주고, 회원은 원하는 시간으로 수업을 요청할 수 있습니다.
          </p>
        </section>

        <section className="bg-surface rounded-card p-5 shadow-card">
          <h2 className="text-sm font-semibold mb-3">전문 분야</h2>
          <div className="flex flex-wrap gap-2">
            {profile.specialties.map((item) => (
              <span key={item} className="px-3 py-1.5 rounded-full bg-primary-light text-primary text-sm font-medium">
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="bg-surface rounded-card p-5 shadow-card">
          <h2 className="text-sm font-semibold mb-3">가능 프로그램</h2>
          <div className="space-y-2">
            {profile.availablePrograms.map((item) => (
              <div key={item} className="bg-surface-secondary rounded-xl px-3 py-3 text-sm text-content-secondary">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface rounded-card p-5 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <CalendarRange className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-semibold">예약 가능 스케줄</h2>
          </div>

          {loading ? (
            <div className="py-6 text-sm text-content-tertiary text-center">가능 시간을 불러오는 중...</div>
          ) : availableSlots.length === 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-content-secondary">
                현재 자동 확인된 빈 시간이 없습니다. 아래 최근 가능 시간과 상담 요청을 참고해 주세요.
              </p>
              {profile.nextSlots.map((item) => (
                <div key={item} className="bg-surface-secondary rounded-xl px-3 py-3 text-sm text-content-secondary">
                  {item}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {availableSlots.map((slot) => {
                const request = requestMap.get(slot.id);
                const isPending = request?.status === 'pending';
                const isApproved = request?.status === 'approved';
                const slotReservedByOther = trainerRequestMap.get(`${slot.startTime}-${slot.endTime}`);
                const blockedByOtherMember = Boolean(slotReservedByOther && slotReservedByOther.memberId !== member?.id);

                return (
                  <div key={slot.id} className="rounded-2xl border border-line bg-surface-secondary p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold">
                            {slot.source === 'free_time' ? `${profile.name} 맞춤 PT 요청` : slot.title}
                          </p>
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                              slot.source === 'free_time'
                                ? 'bg-state-info/10 text-state-info'
                                : 'bg-primary-light text-primary'
                            )}
                          >
                            {slot.source === 'free_time' ? '자동 빈시간' : '등록 슬롯'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-content-secondary">
                          {formatDateKo(slot.startTime)} · {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </p>
                        <p className="mt-1 text-xs text-content-tertiary">
                          {slot.room || '장소 협의'} · 승인형 예약
                        </p>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold',
                          isApproved
                            ? 'bg-state-success/10 text-state-success'
                            : isPending
                              ? 'bg-state-warning/10 text-state-warning'
                              : blockedByOtherMember
                                ? 'bg-surface-tertiary text-content-tertiary'
                              : 'bg-primary-light text-primary'
                        )}
                      >
                        {isApproved ? '예약 확정' : isPending ? '승인 대기' : blockedByOtherMember ? '요청 있음' : '예약 가능'}
                      </span>
                    </div>

                    {slot.source === 'free_time' && (
                      <div className="mt-3 rounded-xl bg-state-info/6 px-3 py-3">
                        <div className="flex items-center gap-2 text-state-info">
                          <Sparkles className="w-4 h-4" />
                          <p className="text-xs font-semibold">트레이너 수업 없음 자동 체크</p>
                        </div>
                        <p className="mt-1 text-xs text-content-secondary">
                          현재 일정 기준으로 겹치는 수업이 없는 시간대입니다.
                        </p>
                      </div>
                    )}

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleRequest(slot)}
                        disabled={isPending || isApproved || blockedByOtherMember || requestingId === slot.id}
                        className={cn(
                          'flex-1 rounded-xl py-3 text-sm font-semibold text-white transition-colors',
                          isPending || isApproved || blockedByOtherMember
                            ? 'bg-surface-tertiary text-content-tertiary'
                            : 'bg-primary active:bg-primary-dark',
                          (isPending || isApproved || blockedByOtherMember) && 'cursor-not-allowed'
                        )}
                      >
                        {requestingId === slot.id
                          ? '요청 중...'
                          : isApproved
                            ? '예약 확정됨'
                            : isPending
                              ? '승인 대기 중'
                              : blockedByOtherMember
                                ? '다른 요청 접수됨'
                              : '이 시간으로 요청하기'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {occupiedSlots.length > 0 && (
          <section className="bg-surface rounded-card p-5 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-content-secondary" />
              <h2 className="text-sm font-semibold">이미 배정된 수업</h2>
            </div>
            <div className="space-y-2">
              {occupiedSlots.map((slot) => (
                <div key={slot.id} className="bg-surface-secondary rounded-xl px-3 py-3">
                  <p className="text-sm font-medium">{slot.title}</p>
                  <p className="mt-1 text-xs text-content-secondary">
                    {formatDateKo(slot.startTime)} · {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="bg-surface rounded-card p-5 shadow-card">
          <h2 className="text-sm font-semibold mb-3">추천 코칭 포인트</h2>
          <div className="flex flex-wrap gap-2">
            {profile.focusAreas.map((item) => (
              <span key={item} className="px-3 py-1.5 rounded-full bg-state-info/10 text-state-info text-sm font-medium">
                {item}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
