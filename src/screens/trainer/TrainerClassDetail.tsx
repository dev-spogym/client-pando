import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, CircleAlert, ClipboardCheck, PenSquare } from 'lucide-react';
import { toast } from 'sonner';
import {
  completeTrainerClass,
  getTrainerClassById,
  setTrainerClassStatus,
  setTrainerParticipantAttendance,
  type AttendanceStatus,
} from '@/lib/mockOperations';
import { cn, formatDateKo, formatTime } from '@/lib/utils';
import { PageHeader, Button, Card, Badge, EmptyState } from '@/components/ui';

const STATUS_OPTIONS: Array<{ key: AttendanceStatus; label: string }> = [
  { key: 'attended', label: '참석' },
  { key: 'late', label: '지각' },
  { key: 'no_show', label: '노쇼' },
];

export default function TrainerClassDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const classId = Number(id);
  const [version, setVersion] = useState(0);

  const trainerClass = useMemo(() => getTrainerClassById(classId), [classId, version]);

  if (!trainerClass) {
    return (
      <EmptyState title="수업 정보를 찾을 수 없습니다" />
    );
  }

  const refresh = () => setVersion((value) => value + 1);

  const handleStart = () => {
    setTrainerClassStatus(trainerClass.id, 'in_progress');
    toast.success('수업을 시작 처리했습니다.');
    refresh();
  };

  const handleAttendance = (memberId: number, status: AttendanceStatus) => {
    setTrainerParticipantAttendance(trainerClass.id, memberId, status, {
      applyPenalty: status === 'no_show',
      note: status === 'no_show' ? '연락 없이 미참석' : status === 'late' ? '지각 8분' : '정상 참여',
      lateMinutes: status === 'late' ? 8 : undefined,
    });
    toast.success(status === 'no_show' ? '노쇼와 페널티를 기록했습니다.' : '출석 상태를 저장했습니다.');
    refresh();
  };

  const handleComplete = () => {
    if (trainerClass.type === 'GOLF') {
      navigate(`/trainer/classes/${trainerClass.id}/signature`);
      return;
    }

    completeTrainerClass(trainerClass.id);
    toast.success('수업을 완료 처리했습니다.');
    refresh();
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <PageHeader
        showBack
        onBack={() => navigate(-1)}
        title={trainerClass.title}
        subtitle="MA-212"
      />

      <div className="px-5 py-4 pb-24 space-y-4">
        <Card variant="elevated" padding="md">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{trainerClass.type} · {trainerClass.room}</p>
              <p className="mt-1 text-xs text-content-secondary">
                {formatDateKo(trainerClass.startTime)} · {formatTime(trainerClass.startTime)} - {formatTime(trainerClass.endTime)}
              </p>
            </div>
            <Badge tone="neutral" variant="soft">{trainerClass.status}</Badge>
          </div>
          <p className="mt-3 text-sm text-content-secondary">{trainerClass.memo}</p>
        </Card>

        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardCheck className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold">출석 체크</p>
          </div>

          <div className="space-y-3">
            {trainerClass.participants.map((participant) => (
              <div key={participant.memberId} className="rounded-card border border-line bg-surface-secondary p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{participant.memberName}</p>
                    <p className="mt-1 text-xs text-content-tertiary">잔여 {participant.remainingSessions}회</p>
                  </div>
                  <Badge tone="neutral" variant="soft">{participant.attendanceStatus}</Badge>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => handleAttendance(participant.memberId, option.key)}
                      className={cn(
                        'rounded-card px-2 py-2 text-xs font-semibold',
                        participant.attendanceStatus === option.key
                          ? option.key === 'no_show'
                            ? 'bg-state-error text-white'
                            : 'bg-primary text-white'
                          : 'bg-surface text-content-secondary'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {participant.note ? (
                  <p className="mt-2 text-xs text-content-tertiary">{participant.note}</p>
                ) : null}
              </div>
            ))}
          </div>
        </Card>

        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-2 mb-3">
            <CircleAlert className="w-4 h-4 text-state-warning" />
            <p className="text-sm font-semibold">운영 액션</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={handleStart}
              disabled={trainerClass.status !== 'scheduled'}
            >
              수업 시작
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={handleComplete}
            >
              {trainerClass.type === 'GOLF' ? '쌍방서명 진행' : '수업 완료'}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Button
              variant="tertiary"
              size="md"
              onClick={() => navigate('/trainer/penalties')}
            >
              노쇼 / 페널티 보기
            </Button>
            <Button
              variant="tertiary"
              size="md"
              onClick={() => navigate('/trainer/templates')}
            >
              템플릿 보기
            </Button>
          </div>
        </Card>

        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-2 mb-3">
            <PenSquare className="w-4 h-4 text-state-info" />
            <p className="text-sm font-semibold">기획 반영 상태</p>
          </div>
          <ul className="space-y-2 text-sm text-content-secondary">
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 text-primary" /> 수업 시작 / 출석 체크 / 완료 처리</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 text-primary" /> 노쇼 시 페널티 보드 반영</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 text-primary" /> 골프 레슨은 쌍방서명 플로우로 분기</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
