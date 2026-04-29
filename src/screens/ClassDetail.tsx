import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, Clock, Dumbbell, MapPin, User, Users } from 'lucide-react';
import { toast } from 'sonner';
import { getPreviewClassById, isPreviewMode, updatePreviewTrainerClass } from '@/lib/preview';
import {
  createLessonBookingRequest,
  getMemberLessonBookingRequests,
  getPendingLessonRequestForClass,
  updateLessonBookingRequestStatus,
  type LessonBookingRequestEntry,
} from '@/lib/lessonPlanning';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import {
  addWaitlistEntry,
  cancelReservation,
  getReservation,
  getWaitlistEntry,
  upsertReservation,
  type WaitlistEntry,
} from '@/lib/memberExperience';
import { cn, formatDateKo, formatTime } from '@/lib/utils';
import { Button, Card, Badge, PageHeader } from '@/components/ui';

interface ClassData {
  id: number;
  title: string;
  type: string;
  staffId: number | null;
  staffName: string;
  room: string | null;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  member_id?: number | null;
}

/** 수업 상세 / 예약 / 취소 페이지 */
export default function ClassDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { member } = useAuthStore();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [reserved, setReserved] = useState(false);
  const [waitlistEntry, setWaitlistEntry] = useState<WaitlistEntry | null>(null);
  const [pendingRequest, setPendingRequest] = useState<LessonBookingRequestEntry | null>(null);

  useEffect(() => {
    if (id) fetchClass();
  }, [id]);

  useEffect(() => {
    if (!member || !classData) return;
    setReserved(Boolean(getReservation(member.id, classData.id)));
    setWaitlistEntry(getWaitlistEntry(member.id, classData.id));
    setPendingRequest(getPendingLessonRequestForClass(member.id, classData.id));
  }, [member, classData]);

  const fetchClass = async () => {
    setLoading(true);

    if (isPreviewMode()) {
      setClassData(id ? getPreviewClassById(Number(id)) : null);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('classes')
      .select('*')
      .eq('id', Number(id))
      .single();

    if (data) setClassData(data);
    setLoading(false);
  };

  const handleReserve = async () => {
    if (!member || !classData) return;
    if (reserved) {
      toast.info('이미 예약된 수업입니다.');
      return;
    }
    if (pendingRequest) {
      toast.info('이미 승인 대기 중인 예약 요청입니다.');
      return;
    }

    setReserving(true);

    if (classData.type === 'PT') {
      const request = createLessonBookingRequest({
        classId: classData.id,
        memberId: member.id,
        memberName: member.name,
        trainerId: classData.staffId ?? 0,
        trainerName: classData.staffName,
        title: classData.title,
        type: classData.type,
        startTime: classData.startTime,
        endTime: classData.endTime,
        room: classData.room,
        source: 'member_request',
        note: '회원이 PT 수업 상세에서 예약 요청함',
      });

      setPendingRequest(request);
      setReserving(false);
      toast.success('예약 요청이 접수되었습니다. 트레이너 승인 후 확정됩니다.');
      return;
    }

    if (isPreviewMode()) {
      upsertReservation(member.id, {
        classId: classData.id,
        title: classData.title,
        type: classData.type,
        staffId: classData.staffId,
        staffName: classData.staffName,
        startTime: classData.startTime,
        endTime: classData.endTime,
        room: classData.room,
      });
      setReserved(true);
      setClassData({ ...classData, booked: Math.min(classData.booked + 1, classData.capacity) });
      setReserving(false);
      toast.success('예약이 완료되었습니다.');
      return;
    }

    try {
      const { error } = await supabase
        .from('classes')
        .update({ booked: classData.booked + 1 })
        .eq('id', classData.id)
        .lt('booked', classData.capacity);

      if (error) {
        toast.error('예약에 실패했습니다. 정원이 찼을 수 있습니다.');
      } else {
        await supabase.from('attendance').insert({
          memberId: member.id,
          memberName: member.name,
          checkInAt: classData.startTime,
          type: classData.type === 'PT' ? 'PT' : 'GX',
          checkInMethod: 'APP',
          branchId: member.branchId,
        });

        upsertReservation(member.id, {
          classId: classData.id,
          title: classData.title,
          type: classData.type,
          staffId: classData.staffId,
          staffName: classData.staffName,
          startTime: classData.startTime,
          endTime: classData.endTime,
          room: classData.room,
        });

        setReserved(true);
        setClassData({ ...classData, booked: classData.booked + 1 });
        toast.success('예약이 완료되었습니다.');
      }
    } catch {
      toast.error('예약 중 오류가 발생했습니다.');
    }

    setReserving(false);
  };

  const handleWaitlist = () => {
    if (!member || !classData) return;
    if (waitlistEntry) {
      navigate('/waitlist');
      return;
    }

    const entry = addWaitlistEntry(member.id, {
      classId: classData.id,
      title: classData.title,
      type: classData.type,
      staffId: classData.staffId ?? 0,
      staffName: classData.staffName,
      room: classData.room,
      startTime: classData.startTime,
      endTime: classData.endTime,
      autoPromoted: true,
    });

    setWaitlistEntry(entry);
    toast.success(`대기 ${entry.position}번으로 등록되었습니다.`);
  };

  const handleCancel = async () => {
    if (!member || !classData) return;

    if (pendingRequest && !reserved) {
      updateLessonBookingRequestStatus(pendingRequest.id, 'cancelled', '회원이 예약 요청을 취소함');
      setPendingRequest(null);
      toast.success('예약 요청이 취소되었습니다.');
      return;
    }

    if (!reserved) return;
    setReserving(true);

    if (isPreviewMode()) {
      cancelReservation(member.id, classData.id);
      if (isApprovalRequired) {
        updatePreviewTrainerClass(classData.id, {
          booked: Math.max(0, classData.booked - 1),
          memberId: null,
          memberName: null,
        });
      }
      const approvedRequest = getMemberLessonBookingRequests(member.id, ['approved']).find((item) => item.classId === classData.id);
      if (approvedRequest) {
        updateLessonBookingRequestStatus(approvedRequest.id, 'cancelled', '회원이 확정 예약을 취소함');
      }
      setReserved(false);
      setClassData({ ...classData, booked: Math.max(0, classData.booked - 1) });
      setReserving(false);
      toast.success('예약이 취소되었습니다.');
      return;
    }

    const { error } = await supabase
      .from('classes')
      .update({
        booked: Math.max(0, classData.booked - 1),
        ...(isApprovalRequired ? { member_id: null } : {}),
      })
      .eq('id', classData.id);

    if (error) {
      toast.error('취소에 실패했습니다.');
    } else {
      cancelReservation(member.id, classData.id);
      const approvedRequest = getMemberLessonBookingRequests(member.id, ['approved']).find((item) => item.classId === classData.id);
      if (approvedRequest) {
        updateLessonBookingRequestStatus(approvedRequest.id, 'cancelled', '회원이 확정 예약을 취소함');
      }
      setReserved(false);
      setClassData({ ...classData, booked: Math.max(0, classData.booked - 1) });
      toast.success('예약이 취소되었습니다.');
    }

    setReserving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center">
        <p className="text-content-tertiary">불러오는 중...</p>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-surface-secondary flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-content-tertiary mb-3" />
        <p className="text-content-tertiary">수업 정보를 찾을 수 없습니다.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate(-1)}>돌아가기</Button>
      </div>
    );
  }

  const isFull = classData.booked >= classData.capacity;
  const remaining = classData.capacity - classData.booked;
  const startDate = new Date(classData.startTime);
  const isPast = startDate < new Date();
  const isApprovalRequired = classData.type === 'PT';

  return (
    <div className="min-h-screen bg-surface-secondary page-with-action">
      <header className={cn('px-4 pt-safe-top pb-6', classData.type === 'PT' ? 'bg-primary' : 'bg-accent')}>
        <div className="flex items-center h-14">
          <button onClick={() => navigate(-1)}>
            <span className="w-10 h-10 inline-flex items-center justify-center rounded-full text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </span>
          </button>
          <h1 className="flex-1 text-center text-h4 text-white pr-6">수업 상세</h1>
        </div>
        <div className="text-center mt-2">
          <div className="w-16 h-16 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-3">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-h1 text-white">{classData.title}</h2>
          <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-body-sm text-white font-medium">
            {classData.type}
          </span>
        </div>
      </header>

      <div className="px-4 -mt-2 space-y-4 pb-32">
        <Card variant="soft" padding="md">
          <h3 className="text-body font-semibold mb-3">수업 정보</h3>
          <div className="space-y-3">
            <InfoRow icon={<Clock className="w-5 h-5 text-content-tertiary" />} label="일시">
              {formatDateKo(classData.startTime)} {formatTime(classData.startTime)} - {formatTime(classData.endTime)}
            </InfoRow>
            <InfoRow icon={<User className="w-5 h-5 text-content-tertiary" />} label="강사">
              {classData.staffName}
            </InfoRow>
            {classData.room && (
              <InfoRow icon={<MapPin className="w-5 h-5 text-content-tertiary" />} label="장소">
                {classData.room}
              </InfoRow>
            )}
            <InfoRow icon={<Users className="w-5 h-5 text-content-tertiary" />} label="정원">
              <span className={cn(isFull && 'text-state-error font-medium')}>
                {classData.booked} / {classData.capacity}명
                {!isFull && <span className="text-state-success ml-2">(잔여 {remaining}석)</span>}
                {isFull && <span className="text-state-error ml-2">(마감)</span>}
              </span>
            </InfoRow>
          </div>
        </Card>

        <Card variant="soft" padding="md" interactive onClick={() => classData.staffId && navigate(`/instructors/${classData.staffId}`)}>
          <p className="text-caption text-content-tertiary">강사 정보 보기</p>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-body-sm font-semibold">{classData.staffName} 강사</p>
              <p className="text-caption text-content-secondary mt-1">전문 분야, 후기 요약, 예약 가능 시간 확인</p>
            </div>
            <span className="text-caption text-primary font-medium">상세 보기</span>
          </div>
        </Card>

        <Card variant="soft" padding="md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-body-sm font-medium">예약 현황</span>
            <span className="text-body-sm text-content-secondary">{Math.round((classData.booked / classData.capacity) * 100)}%</span>
          </div>
          <div className="progress-bar">
            <div
              className={cn(
                'progress-bar-fill',
                isFull ? 'bg-state-error' : classData.booked / classData.capacity > 0.7 ? 'bg-state-warning' : 'bg-state-success'
              )}
              style={{ width: `${(classData.booked / classData.capacity) * 100}%` }}
            />
          </div>
          {reserved && (
            <p className="mt-3 text-caption text-state-success font-medium">
              {isApprovalRequired ? '트레이너 승인이 완료된 수업입니다.' : '내 예약이 확정된 수업입니다.'}
            </p>
          )}
          {pendingRequest && !reserved && (
            <p className="mt-3 text-caption text-state-warning font-medium">현재 트레이너 승인 대기 중입니다.</p>
          )}
        </Card>

        {pendingRequest && !reserved && (
          <Card variant="soft" padding="md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-body font-semibold">예약 요청 상태</h3>
              <Badge tone="warning" size="sm">승인 대기</Badge>
            </div>
            <p className="text-body-sm text-content-secondary">
              트레이너가 스케줄을 확인한 뒤 승인하면 예약이 확정됩니다.
            </p>
          </Card>
        )}

        {(isFull || waitlistEntry) && !isApprovalRequired && (
          <Card variant="soft" padding="md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-body font-semibold">대기 예약 상태</h3>
              {waitlistEntry && (
                <Badge tone="warning" size="sm">{waitlistEntry.position}번 대기</Badge>
              )}
            </div>
            <p className="text-body-sm text-content-secondary">
              {waitlistEntry
                ? '자동 확정 알림이 활성화되어 있습니다. 대기 관리 화면에서 상태를 확인할 수 있습니다.'
                : '정원이 모두 찼다면 대기 예약으로 전환할 수 있습니다.'}
            </p>
          </Card>
        )}
      </div>

      {!isPast && (
        <div className="bottom-action-bar">
          <div className="max-w-lg mx-auto flex gap-3">
            <Button
              variant="tertiary"
              size="xl"
              className="flex-1"
              onClick={() => classData.staffId && navigate(`/instructors/${classData.staffId}`)}
            >
              강사 보기
            </Button>

            {reserved ? (
              <Button
                variant="danger"
                size="xl"
                className="flex-1"
                disabled={reserving}
                loading={reserving}
                onClick={handleCancel}
              >
                예약 취소
              </Button>
            ) : pendingRequest ? (
              <Button
                variant="danger"
                size="xl"
                className="flex-1"
                onClick={handleCancel}
              >
                요청 취소
              </Button>
            ) : !isFull ? (
              <Button
                variant="primary"
                size="xl"
                className="flex-1"
                disabled={reserving}
                loading={reserving}
                onClick={handleReserve}
              >
                {isApprovalRequired ? '예약 요청하기' : '예약하기'}
              </Button>
            ) : isApprovalRequired ? (
              <Button variant="tertiary" size="xl" className="flex-1" disabled>
                마감된 시간입니다
              </Button>
            ) : (
              <Button
                variant="primary"
                size="xl"
                className="flex-1 bg-state-warning hover:bg-state-warning/90"
                onClick={handleWaitlist}
              >
                {waitlistEntry ? '대기 현황 보기' : '대기열 등록'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div className="flex-1">
        <p className="text-caption text-content-tertiary">{label}</p>
        <p className="text-body-sm">{children}</p>
      </div>
    </div>
  );
}
