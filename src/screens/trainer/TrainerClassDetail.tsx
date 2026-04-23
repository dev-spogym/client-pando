import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, CircleAlert, ClipboardCheck, PenSquare } from 'lucide-react';
import { toast } from 'sonner';
import {
  completeTrainerClass,
  getTrainerClassById,
  setTrainerClassStatus,
  setTrainerParticipantAttendance,
  type AttendanceStatus,
} from '@/lib/mockOperations';
import { cn, formatDateKo, formatTime } from '@/lib/utils';

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
      <div className="min-h-screen flex items-center justify-center text-sm text-content-tertiary">
        수업 정보를 찾을 수 없습니다.
      </div>
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
      <header className="bg-surface px-5 pt-safe-top pb-4 shadow-sm">
        <div className="pt-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-content-secondary">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-xs text-content-tertiary">MA-212</p>
            <h1 className="text-lg font-bold">{trainerClass.title}</h1>
          </div>
        </div>
      </header>

      <div className="px-5 py-4 pb-24 space-y-4">
        <section className="rounded-card bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{trainerClass.type} · {trainerClass.room}</p>
              <p className="mt-1 text-xs text-content-secondary">
                {formatDateKo(trainerClass.startTime)} · {formatTime(trainerClass.startTime)} - {formatTime(trainerClass.endTime)}
              </p>
            </div>
            <span className="rounded-full bg-surface-secondary px-3 py-1 text-xs font-semibold text-content-secondary">
              {trainerClass.status}
            </span>
          </div>
          <p className="mt-3 text-sm text-content-secondary">{trainerClass.memo}</p>
        </section>

        <section className="rounded-card bg-surface p-4 shadow-card">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-teal-600" />
            <p className="text-sm font-semibold">출석 체크</p>
          </div>

          <div className="mt-4 space-y-3">
            {trainerClass.participants.map((participant) => (
              <div key={participant.memberId} className="rounded-2xl border border-line bg-surface-secondary p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{participant.memberName}</p>
                    <p className="mt-1 text-xs text-content-tertiary">잔여 {participant.remainingSessions}회</p>
                  </div>
                  <span className="rounded-full bg-surface px-2 py-1 text-[11px] text-content-secondary">
                    {participant.attendanceStatus}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => handleAttendance(participant.memberId, option.key)}
                      className={cn(
                        'rounded-xl px-2 py-2 text-xs font-semibold',
                        participant.attendanceStatus === option.key
                          ? option.key === 'no_show'
                            ? 'bg-state-error text-white'
                            : 'bg-teal-600 text-white'
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
        </section>

        <section className="rounded-card bg-surface p-4 shadow-card space-y-3">
          <div className="flex items-center gap-2">
            <CircleAlert className="w-4 h-4 text-state-warning" />
            <p className="text-sm font-semibold">운영 액션</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleStart}
              disabled={trainerClass.status !== 'scheduled'}
              className="rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
            >
              수업 시작
            </button>
            <button
              onClick={handleComplete}
              className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white"
            >
              {trainerClass.type === 'GOLF' ? '쌍방서명 진행' : '수업 완료'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/trainer/penalties')}
              className="rounded-xl bg-surface-secondary px-4 py-3 text-sm font-semibold text-content-secondary"
            >
              노쇼 / 페널티 보기
            </button>
            <button
              onClick={() => navigate('/trainer/templates')}
              className="rounded-xl bg-surface-secondary px-4 py-3 text-sm font-semibold text-content-secondary"
            >
              템플릿 보기
            </button>
          </div>
        </section>

        <section className="rounded-card bg-surface p-4 shadow-card">
          <div className="flex items-center gap-2">
            <PenSquare className="w-4 h-4 text-state-info" />
            <p className="text-sm font-semibold">기획 반영 상태</p>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-content-secondary">
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 text-teal-600" /> 수업 시작 / 출석 체크 / 완료 처리</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 text-teal-600" /> 노쇼 시 페널티 보드 반영</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 text-teal-600" /> 골프 레슨은 쌍방서명 플로우로 분기</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
