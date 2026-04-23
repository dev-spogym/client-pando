import { useEffect, useState } from 'react';
import { ArrowLeft, Clock3, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { cancelWaitlistEntry, getWaitlistEntries, type WaitlistEntry } from '@/lib/memberExperience';
import { cn, formatDateKo, formatTime } from '@/lib/utils';

/** 대기 예약 관리 */
export default function Waitlist() {
  const navigate = useNavigate();
  const { member } = useAuthStore();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);

  useEffect(() => {
    if (!member) return;
    setEntries(getWaitlistEntries(member.id));
  }, [member]);

  if (!member) return null;

  const handleCancel = (classId: number) => {
    cancelWaitlistEntry(member.id, classId);
    setEntries(getWaitlistEntries(member.id));
    toast.success('대기 예약이 취소되었습니다.');
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-surface sticky top-0 z-10 border-b border-line">
        <div className="flex items-center px-4 pt-safe-top h-14">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-content" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-lg">대기 예약 관리</h1>
          <div className="w-6" />
        </div>
      </header>

      <div className="px-4 py-4">
        {entries.length === 0 ? (
          <div className="bg-surface rounded-card shadow-card text-center py-12">
            <Users className="w-12 h-12 text-content-tertiary/30 mx-auto mb-3" />
            <p className="text-content-tertiary text-sm">등록된 대기 예약이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={`${entry.classId}-${entry.createdAt}`} className="bg-surface rounded-card p-4 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{entry.title}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-state-warning/10 text-state-warning font-medium">
                        {entry.status === 'cancelled' ? '취소됨' : `${entry.position}번 대기`}
                      </span>
                    </div>
                    <p className="text-xs text-content-secondary mt-1">{entry.staffName} 강사</p>
                    <div className="mt-2 space-y-1 text-xs text-content-tertiary">
                      <p>{formatDateKo(entry.startTime)} {formatTime(entry.startTime)} - {formatTime(entry.endTime)}</p>
                      <p>{entry.room || '수업 장소 추후 안내'}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={cn(
                      'px-2.5 py-1 rounded-full text-[11px] font-medium',
                      entry.autoPromoted ? 'bg-state-success/10 text-state-success' : 'bg-surface-tertiary text-content-secondary'
                    )}>
                      {entry.autoPromoted ? '자동 확정 ON' : '수동 확인'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-content-tertiary">
                  <span className="flex items-center gap-1">
                    <Clock3 className="w-3.5 h-3.5" />
                    등록일 {formatDateKo(entry.createdAt)}
                  </span>
                  {entry.status !== 'cancelled' && (
                    <button
                      onClick={() => handleCancel(entry.classId)}
                      className="text-state-error font-medium"
                    >
                      대기 취소
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
