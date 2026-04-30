import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Users,
  Clock,
  MapPin,
  Check,
  Ban,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import {
  appendPreviewTrainerClass,
  getPreviewSearchParam,
  getPreviewTrainerClassesForRange,
  getPreviewTrainerMembers,
  isPreviewMode,
  updatePreviewTrainerClass,
} from '@/lib/preview';
import {
  getTrainerLessonBookingRequests,
  recordLocalLessonCountUsage,
  updateLessonBookingRequestStatus,
  type LessonBookingRequestEntry,
} from '@/lib/lessonPlanning';
import { supabase } from '@/lib/supabase';
import { cn, formatTime } from '@/lib/utils';
import { markReservationCompleted, upsertReservation } from '@/lib/memberExperience';
import { toast } from 'sonner';
import { Button, Badge, Card, EmptyState } from '@/components/ui';

interface ClassItem {
  id: number;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  room: string | null;
  capacity: number;
  booked: number;
  memberId: number | null;
  memberName: string | null;
  lessonStatus: string | null;
}

interface MemberOption {
  id: number;
  name: string;
  membershipType: string | null;
}

/** 트레이너 - 주간 일정 */
export default function TrainerSchedule() {
  const { trainer } = useAuthStore();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [pendingRequests, setPendingRequests] = useState<LessonBookingRequestEntry[]>([]);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
  const [completingClassId, setCompletingClassId] = useState<number | null>(null);
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  const [showModal, setShowModal] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<'PT' | 'GX'>('PT');
  const [formDate, setFormDate] = useState('');
  const [formStartTime, setFormStartTime] = useState('09:00');
  const [formEndTime, setFormEndTime] = useState('10:00');
  const [formRoom, setFormRoom] = useState('');
  const [formCapacity, setFormCapacity] = useState(1);
  const [formMemberId, setFormMemberId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!trainer) return;
    void fetchClasses();
    void fetchMembers();
    refreshPendingRequests();
  }, [trainer, weekStart]);

  useEffect(() => {
    if (!trainer || isPreviewMode() || members.length === 0) return;
    void fetchClasses();
  }, [members]);

  useEffect(() => {
    if (!isPreviewMode()) return;
    if (getPreviewSearchParam('modal') === 'add') {
      setShowModal(true);
    }
  }, []);

  const fetchClasses = async () => {
    if (!trainer) return;

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    if (isPreviewMode()) {
      setClasses(
        getPreviewTrainerClassesForRange(weekStart.toISOString(), weekEnd.toISOString()).map((item) => ({
          id: item.id,
          title: item.title,
          type: item.type,
          startTime: item.startTime,
          endTime: item.endTime,
          room: item.room,
          capacity: item.capacity,
          booked: item.booked,
          memberId: item.memberId ?? null,
          memberName: item.memberName ?? null,
          lessonStatus: item.lessonStatus ?? (item.memberId ? 'reserved' : null),
        }))
      );
      return;
    }

    const { data } = await supabase
      .from('classes')
      .select('id, title, type, startTime, endTime, room, capacity, booked, member_id, lesson_status')
      .eq('branchId', trainer.branchId)
      .eq('staffId', trainer.staffId)
      .gte('startTime', weekStart.toISOString())
      .lt('startTime', weekEnd.toISOString())
      .order('startTime');

    const memberMap = new Map<number, string>(members.map((item) => [item.id, item.name]));
    setClasses(
      (data || []).map((item) => ({
        id: item.id,
        title: item.title,
        type: item.type,
        startTime: item.startTime,
        endTime: item.endTime,
        room: item.room,
        capacity: item.capacity,
        booked: item.booked,
        memberId: item.member_id ?? null,
        memberName: item.member_id ? memberMap.get(item.member_id) ?? null : null,
        lessonStatus: item.lesson_status ?? (item.member_id ? 'reserved' : null),
      }))
    );
  };

  const fetchMembers = async () => {
    if (!trainer) return;

    if (isPreviewMode()) {
      setMembers(
        getPreviewTrainerMembers().map((item) => ({
          id: item.id,
          name: item.name,
          membershipType: item.membershipType,
        }))
      );
      return;
    }

    const { data } = await supabase
      .from('members')
      .select('id, name, membershipType')
      .eq('branchId', trainer.branchId)
      .order('name');

    setMembers((data || []) as MemberOption[]);
  };

  const refreshPendingRequests = () => {
    if (!trainer?.staffId) return;
    setPendingRequests(getTrainerLessonBookingRequests(trainer.staffId, ['pending']));
  };

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
  const dayNames = ['월', '화', '수', '목', '금', '토', '일'];

  const selectedDate = days[selectedDay];
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const dayClasses = classes.filter((c) => c.startTime.startsWith(selectedDateStr));
  const selectedMember = members.find((item) => String(item.id) === formMemberId) || null;

  const weekRequests = useMemo(
    () =>
      pendingRequests.filter((item) => {
        const timestamp = new Date(item.startTime).getTime();
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        return timestamp >= weekStart.getTime() && timestamp < weekEnd.getTime();
      }),
    [pendingRequests, weekStart]
  );

  const openAddModal = () => {
    setFormTitle('');
    setFormType('PT');
    setFormDate(selectedDateStr);
    setFormStartTime('09:00');
    setFormEndTime('10:00');
    setFormRoom('');
    setFormCapacity(1);
    setFormMemberId('');
    setShowModal(true);
  };

  const applyLessonCountUsage = async (
    memberId: number,
    classId: number,
    title: string,
    deductedAt?: string
  ) => {
    if (!trainer) return;

    if (isPreviewMode()) {
      recordLocalLessonCountUsage({
        memberId,
        classId,
        title,
        trainerName: trainer.staffName || trainer.name,
        note: '수업 완료 차감',
        deductedAt,
      });
      return;
    }

    try {
      const { count: existingHistoryCount } = await supabase
        .from('lesson_count_histories')
        .select('id', { count: 'exact', head: true })
        .eq('memberId', memberId)
        .eq('scheduleId', classId);

      if ((existingHistoryCount || 0) > 0) {
        return;
      }

      const { data: counts } = await supabase
        .from('lesson_counts')
        .select('id, totalCount, usedCount')
        .eq('memberId', memberId)
        .order('endDate');

      const target = (counts || []).find((item) => item.usedCount < item.totalCount);
      if (!target) {
        recordLocalLessonCountUsage({
          memberId,
          classId,
          title,
          trainerName: trainer.staffName || trainer.name,
          note: '수업 완료 차감',
          deductedAt,
        });
        return;
      }

      await supabase
        .from('lesson_counts')
        .update({ usedCount: Math.min(target.totalCount, target.usedCount + 1) })
        .eq('id', target.id);

      await supabase.from('lesson_count_histories').insert({
        lessonCountId: target.id,
        memberId,
        scheduleId: classId,
        deductedAt: deductedAt ?? new Date().toISOString(),
        memo: '수업 완료 차감',
      });
    } catch {
      recordLocalLessonCountUsage({
        memberId,
        classId,
        title,
        trainerName: trainer.staffName || trainer.name,
        note: '수업 완료 차감',
        deductedAt,
      });
    }
  };

  const handleCompleteClass = async (cls: ClassItem) => {
    if (!trainer || !cls.memberId || cls.lessonStatus === 'completed') return;

    setCompletingClassId(cls.id);
    const completedAt = new Date().toISOString();

    if (isPreviewMode()) {
      updatePreviewTrainerClass(cls.id, {
        lessonStatus: 'completed',
      });
      markReservationCompleted(cls.memberId, cls.id, completedAt);
      await applyLessonCountUsage(cls.memberId, cls.id, cls.title, completedAt);
      toast.success('수업 완료 처리 후 차감 이력을 반영했습니다.');
      setCompletingClassId(null);
      void fetchClasses();
      return;
    }

    const { error } = await supabase
      .from('classes')
      .update({ lesson_status: 'completed' })
      .eq('id', cls.id);

    if (error) {
      toast.error('수업 완료 처리에 실패했습니다.');
      setCompletingClassId(null);
      return;
    }

    markReservationCompleted(cls.memberId, cls.id, completedAt);
    await applyLessonCountUsage(cls.memberId, cls.id, cls.title, completedAt);
    toast.success('수업 완료 처리 후 차감 이력을 반영했습니다.');
    setCompletingClassId(null);
    await fetchClasses();
  };

  const submitClass = async () => {
    if (!trainer || !formDate) return;
    setSubmitting(true);

    const startTime = `${formDate}T${formStartTime}:00`;
    const endTime = `${formDate}T${formEndTime}:00`;
    const finalTitle = formTitle.trim()
      || (selectedMember ? `${selectedMember.name} ${formType}` : formType === 'PT' ? 'PT 오픈 슬롯' : 'GX 수업');
    const finalCapacity = formType === 'PT' ? 1 : formCapacity;
    const assignedMemberId = selectedMember?.id ?? null;
    const assignedMemberName = selectedMember?.name ?? null;

    if (isPreviewMode()) {
      const createdClass = appendPreviewTrainerClass({
        title: finalTitle,
        type: formType,
        startTime,
        endTime,
        room: formRoom || null,
        capacity: finalCapacity,
        booked: assignedMemberId ? 1 : 0,
        branchId: trainer.branchId,
        staffId: trainer.staffId,
        staffName: trainer.staffName || trainer.name,
        memberId: assignedMemberId,
        memberName: assignedMemberName,
      });

      if (assignedMemberId) {
        upsertReservation(assignedMemberId, {
          classId: createdClass.id,
          title: createdClass.title,
          type: createdClass.type,
          staffId: trainer.staffId,
          staffName: trainer.staffName || trainer.name,
          startTime,
          endTime,
          room: formRoom || null,
          source: 'trainer_assignment',
        });
      }

      toast.success(
        assignedMemberId
          ? '회원이 지정된 수업이 추가되었습니다. 차감은 수업 완료 시 반영됩니다.'
          : '오픈 슬롯이 추가되었습니다.'
      );
      setShowModal(false);
      setSubmitting(false);
      void fetchClasses();
      return;
    }

    const { data, error } = await supabase
      .from('classes')
      .insert({
        title: finalTitle,
        type: formType,
        staffId: trainer.staffId,
        staffName: trainer.staffName || trainer.name,
        startTime,
        endTime,
        room: formRoom || null,
        capacity: finalCapacity,
        booked: assignedMemberId ? 1 : 0,
        branchId: trainer.branchId,
        member_id: assignedMemberId,
      })
      .select('id')
      .single();

    if (error) {
      toast.error('수업 추가에 실패했습니다.');
      setSubmitting(false);
      return;
    }

    if (assignedMemberId && data?.id) {
      upsertReservation(assignedMemberId, {
        classId: data.id,
        title: finalTitle,
        type: formType,
        staffId: trainer.staffId,
        staffName: trainer.staffName || trainer.name,
        startTime,
        endTime,
        room: formRoom || null,
        source: 'trainer_assignment',
      });
    }

    toast.success(
      assignedMemberId
        ? '회원이 지정된 수업이 추가되었습니다. 차감은 수업 완료 시 반영됩니다.'
        : '오픈 슬롯이 추가되었습니다.'
    );
    setShowModal(false);
    setSubmitting(false);
    await fetchClasses();
  };

  const normalizeApprovedLessonTitle = (request: LessonBookingRequestEntry) => {
    if (request.title.includes('요청')) {
      return `${request.memberName} PT`;
    }
    return request.title;
  };

  const handleApproveRequest = async (request: LessonBookingRequestEntry) => {
    if (!trainer) return;
    setProcessingRequestId(request.id);
    const finalTitle = normalizeApprovedLessonTitle(request);
    const normalizedRoom = request.room === '협의 후 지정' ? null : request.room;

    if (isPreviewMode()) {
      const existingClass = classes.find((item) => item.id === request.classId);
      const approvedClassId = existingClass
        ? request.classId
        : appendPreviewTrainerClass({
            title: finalTitle,
            type: request.type,
            startTime: request.startTime,
            endTime: request.endTime,
            room: normalizedRoom,
            capacity: 1,
            booked: 1,
            branchId: trainer.branchId,
            staffId: trainer.staffId,
            staffName: trainer.staffName || trainer.name,
            memberId: request.memberId,
            memberName: request.memberName,
          }).id;

      if (existingClass) {
        updatePreviewTrainerClass(request.classId, {
          title: finalTitle,
          room: normalizedRoom,
          booked: 1,
          memberId: request.memberId,
          memberName: request.memberName,
        });
      }

      updateLessonBookingRequestStatus(request.id, 'approved', '트레이너 승인 완료', {
        classId: approvedClassId,
        title: finalTitle,
        room: normalizedRoom,
      });
      upsertReservation(request.memberId, {
        classId: approvedClassId,
        title: finalTitle,
        type: request.type,
        staffId: request.trainerId,
        staffName: request.trainerName,
        startTime: request.startTime,
        endTime: request.endTime,
        room: normalizedRoom,
        source: 'trainer_request',
      });
      toast.success('예약 요청을 승인했습니다. 차감은 수업 완료 시 반영됩니다.');
      setProcessingRequestId(null);
      refreshPendingRequests();
      void fetchClasses();
      return;
    }

    let approvedClassId = request.classId;
    let approvalError: string | null = null;

    if (request.classId > 0) {
      const { error } = await supabase
        .from('classes')
        .update({
          title: finalTitle,
          room: normalizedRoom,
          booked: 1,
          member_id: request.memberId,
        })
        .eq('id', request.classId);

      if (error) {
        approvalError = error.message;
      }
    } else {
      const { data: insertedClass, error } = await supabase
        .from('classes')
        .insert({
          title: finalTitle,
          type: request.type,
          staffId: trainer.staffId,
          staffName: trainer.staffName || trainer.name,
          startTime: request.startTime,
          endTime: request.endTime,
          room: normalizedRoom,
          capacity: 1,
          booked: 1,
          branchId: trainer.branchId,
          member_id: request.memberId,
        })
        .select('id')
        .single();

      if (error || !insertedClass) {
        approvalError = error?.message || '수업을 생성하지 못했습니다.';
      } else {
        approvedClassId = insertedClass.id;
      }
    }

    if (approvalError) {
      toast.error('요청 승인에 실패했습니다.');
      setProcessingRequestId(null);
      return;
    }

    updateLessonBookingRequestStatus(request.id, 'approved', '트레이너 승인 완료', {
      classId: approvedClassId,
      title: finalTitle,
      room: normalizedRoom,
    });
    upsertReservation(request.memberId, {
      classId: approvedClassId,
      title: finalTitle,
      type: request.type,
      staffId: request.trainerId,
      staffName: request.trainerName,
      startTime: request.startTime,
      endTime: request.endTime,
      room: normalizedRoom,
      source: 'trainer_request',
    });
    toast.success('예약 요청을 승인했습니다. 차감은 수업 완료 시 반영됩니다.');
    setProcessingRequestId(null);
    refreshPendingRequests();
    await fetchClasses();
  };

  const handleRejectRequest = (request: LessonBookingRequestEntry) => {
    setProcessingRequestId(request.id);
    updateLessonBookingRequestStatus(request.id, 'rejected', '트레이너가 요청을 반려함');
    toast.success('예약 요청을 반려했습니다.');
    setProcessingRequestId(null);
    refreshPendingRequests();
  };

  const isToday = (d: Date) => {
    const today = new Date();
    return d.toDateString() === today.toDateString();
  };

  const weekLabel = `${weekStart.getMonth() + 1}월 ${weekStart.getDate()}일 ~ ${days[6].getMonth() + 1}월 ${days[6].getDate()}일`;

  return (
    <div className="pull-to-refresh">
      <header className="bg-gradient-to-br from-teal-600 to-emerald-600 px-5 pt-safe-top pb-4">
        <div className="pt-4 flex items-center justify-between">
          <h1 className="text-white text-h4 font-bold">일정 관리</h1>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openAddModal}
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            수업 추가
          </Button>
        </div>
      </header>

      <div className="px-5 py-4 space-y-4 pb-24">
        {weekRequests.length > 0 && (
          <Card variant="soft" padding="md">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-body font-semibold">승인 대기 요청</p>
                <p className="text-caption text-content-secondary">회원이 스케줄을 보고 보낸 예약 요청입니다.</p>
              </div>
              <Badge tone="warning" variant="soft">{weekRequests.length}건</Badge>
            </div>

            <div className="space-y-3">
              {weekRequests.map((request) => (
                <div key={request.id} className="rounded-card border border-line bg-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-body font-semibold">{request.memberName}</p>
                      <p className="mt-1 text-body text-content">{request.title}</p>
                      <p className="mt-1 text-caption text-content-secondary">
                        {request.startTime.slice(5, 10)} · {formatTime(request.startTime)} - {formatTime(request.endTime)}
                        {request.room ? ` · ${request.room}` : ''}
                      </p>
                    </div>
                    <Badge tone="warning" variant="soft">승인 대기</Badge>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      leftIcon={<Check className="w-4 h-4" />}
                      onClick={() => void handleApproveRequest(request)}
                      disabled={processingRequestId === request.id}
                    >
                      승인
                    </Button>
                    <Button
                      variant="tertiary"
                      size="sm"
                      fullWidth
                      leftIcon={<Ban className="w-4 h-4" />}
                      onClick={() => handleRejectRequest(request)}
                      disabled={processingRequestId === request.id}
                    >
                      반려
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <button onClick={prevWeek} className="p-2 text-content-secondary">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-body font-semibold">{weekLabel}</span>
          <button onClick={nextWeek} className="p-2 text-content-secondary">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => (
            <button
              key={i}
              onClick={() => setSelectedDay(i)}
              className={cn(
                'flex flex-col items-center py-2 rounded-card transition-colors',
                selectedDay === i ? 'bg-primary text-white' : 'text-content-secondary',
                isToday(d) && selectedDay !== i && 'ring-1 ring-primary'
              )}
            >
              <span className="text-[10px]">{dayNames[i]}</span>
              <span className="text-body font-bold mt-0.5">{d.getDate()}</span>
            </button>
          ))}
        </div>

        {dayClasses.length === 0 ? (
          <EmptyState size="sm" title="예정된 수업이 없습니다" />
        ) : (
          <div className="space-y-3">
            {dayClasses.map((cls) => {
              const isOpenPtSlot = cls.type === 'PT' && !cls.memberId && cls.booked === 0;
              const isCompleted = cls.lessonStatus === 'completed';
              const canComplete = Boolean(cls.memberId) && !isCompleted && new Date(cls.endTime) <= new Date();

              return (
                <Card key={cls.id} variant="elevated" padding="md">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-card flex items-center justify-center',
                      cls.type === 'PT' ? 'bg-primary-light' : 'bg-surface-secondary'
                    )}>
                      <span className={cn(
                        'text-caption font-bold',
                        cls.type === 'PT' ? 'text-primary' : 'text-content-secondary'
                      )}>
                        {cls.type}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-body truncate">{cls.title}</p>
                        {cls.type === 'PT' && (
                          <Badge
                            tone={isCompleted ? 'info' : isOpenPtSlot ? 'primary' : 'success'}
                            variant="soft"
                          >
                            {isCompleted ? '수업 완료' : isOpenPtSlot ? '오픈 슬롯' : '회원 배정'}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-caption text-content-secondary">
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                        </span>
                        {cls.room && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" />
                            {cls.room}
                          </span>
                        )}
                      </div>
                      {cls.memberName && (
                        <p className="mt-1 text-caption font-medium text-primary">회원: {cls.memberName}</p>
                      )}
                      {cls.memberId && (
                        <p className="mt-1 text-[11px] text-content-tertiary">
                          차감은 수업 완료 처리 시 반영됩니다.
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-caption text-content-secondary">
                      <Users className="w-3 h-3" />
                      <span>{cls.booked}/{cls.capacity}</span>
                    </div>
                  </div>

                  {cls.memberId && (
                    <div className="mt-3 flex justify-end">
                      <Button
                        variant={isCompleted ? 'secondary' : canComplete ? 'primary' : 'tertiary'}
                        size="sm"
                        onClick={() => void handleCompleteClass(cls)}
                        disabled={!canComplete || completingClassId === cls.id}
                      >
                        {isCompleted
                          ? '완료됨'
                          : completingClassId === cls.id
                            ? '완료 처리 중...'
                            : canComplete
                              ? '수업 완료 처리'
                              : '종료 시간 후 완료 가능'}
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="mobile-bottom-sheet relative bg-surface rounded-t-2xl p-5 pb-10 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h2 className="text-h4 font-bold">수업 추가</h2>
              <button onClick={() => setShowModal(false)} className="text-content-tertiary">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex gap-2">
              {(['PT', 'GX'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setFormType(t);
                    if (t === 'GX') setFormMemberId('');
                  }}
                  className={cn(
                    'flex-1 py-2.5 rounded-card text-body font-medium transition-colors',
                    formType === t ? 'bg-primary text-white' : 'bg-surface-secondary text-content-secondary'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder={formType === 'PT' ? '수업명 (비워두면 기본 제목 사용)' : '수업명'}
              className="w-full px-3 py-3 rounded-input border border-line text-body focus:outline-none focus:border-primary"
            />

            {formType === 'PT' && (
              <div className="space-y-2">
                <label className="text-caption text-content-secondary block">회원 지정</label>
                <select
                  value={formMemberId}
                  onChange={(e) => setFormMemberId(e.target.value)}
                  className="w-full px-3 py-3 rounded-input border border-line text-body focus:outline-none focus:border-primary bg-surface"
                >
                  <option value="">오픈 슬롯으로 등록</option>
                  {members.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}{item.membershipType ? ` · ${item.membershipType}` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-caption text-content-tertiary">
                  회원을 지정하면 승인 없이 즉시 수업 일정이 확정되며, 차감은 수업 완료 시 반영됩니다.
                </p>
              </div>
            )}

            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full px-3 py-3 rounded-input border border-line text-body focus:outline-none focus:border-primary"
            />

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-caption text-content-secondary mb-1 block">시작 시간</label>
                <input
                  type="time"
                  value={formStartTime}
                  onChange={(e) => setFormStartTime(e.target.value)}
                  className="w-full px-3 py-3 rounded-input border border-line text-body focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex-1">
                <label className="text-caption text-content-secondary mb-1 block">종료 시간</label>
                <input
                  type="time"
                  value={formEndTime}
                  onChange={(e) => setFormEndTime(e.target.value)}
                  className="w-full px-3 py-3 rounded-input border border-line text-body focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <input
              type="text"
              value={formRoom}
              onChange={(e) => setFormRoom(e.target.value)}
              placeholder="장소 (선택)"
              className="w-full px-3 py-3 rounded-input border border-line text-body focus:outline-none focus:border-primary"
            />

            {formType === 'GX' && (
              <div>
                <label className="text-caption text-content-secondary mb-1 block">정원</label>
                <input
                  type="number"
                  min={1}
                  value={formCapacity}
                  onChange={(e) => setFormCapacity(Number(e.target.value))}
                  className="w-full px-3 py-3 rounded-input border border-line text-body focus:outline-none focus:border-primary"
                />
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => void submitClass()}
              disabled={submitting || !formDate}
              loading={submitting}
            >
              {submitting
                ? '추가 중...'
                : selectedMember
                  ? `${selectedMember.name} 회원으로 일정 추가`
                  : formType === 'PT'
                    ? '오픈 슬롯 추가'
                    : '수업 추가'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
