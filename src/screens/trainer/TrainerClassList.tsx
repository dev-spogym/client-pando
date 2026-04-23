import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, CircleAlert, FileStack, Filter, NotebookPen } from 'lucide-react';
import { getTrainerClasses } from '@/lib/mockOperations';
import { cn, formatDateKo, formatTime } from '@/lib/utils';

const STATUS_LABELS: Record<string, string> = {
  scheduled: '예정',
  in_progress: '진행중',
  completed: '완료',
  cancelled: '취소',
  no_show: '노쇼',
  pending_member_sign: '회원 서명 대기',
};

export default function TrainerClassList() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const classes = getTrainerClasses();

  const filtered = useMemo(() => {
    if (filter === 'active') {
      return classes.filter((item) => item.status === 'scheduled' || item.status === 'in_progress' || item.status === 'pending_member_sign');
    }
    if (filter === 'completed') {
      return classes.filter((item) => item.status === 'completed');
    }
    return classes;
  }, [classes, filter]);

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-gradient-to-br from-teal-600 to-emerald-600 px-5 pt-safe-top pb-5">
        <div className="pt-4">
          <p className="text-white/80 text-sm">MA-211</p>
          <h1 className="text-white text-xl font-bold mt-1">수업 목록</h1>
          <p className="text-white/70 text-sm mt-1">상태별 수업 목록과 누락된 출석/서명 이슈를 빠르게 확인합니다.</p>
        </div>
      </header>

      <div className="px-5 py-4 pb-24 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: 'all' as const, label: '전체' },
            { key: 'active' as const, label: '진행중/예정' },
            { key: 'completed' as const, label: '완료' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={cn(
                'rounded-xl px-3 py-2 text-sm font-medium',
                filter === item.key ? 'bg-teal-600 text-white' : 'bg-surface text-content-secondary'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => navigate('/trainer/templates')} className="rounded-card bg-surface p-4 text-left shadow-card">
            <NotebookPen className="w-5 h-5 text-teal-600" />
            <p className="mt-3 text-sm font-semibold">템플릿 관리</p>
          </button>
          <button onClick={() => navigate('/trainer/penalties')} className="rounded-card bg-surface p-4 text-left shadow-card">
            <CircleAlert className="w-5 h-5 text-state-error" />
            <p className="mt-3 text-sm font-semibold">노쇼 / 페널티</p>
          </button>
          <button onClick={() => navigate('/trainer/certificates')} className="rounded-card bg-surface p-4 text-left shadow-card">
            <FileStack className="w-5 h-5 text-state-info" />
            <p className="mt-3 text-sm font-semibold">확인서</p>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-content-tertiary">
          <Filter className="w-4 h-4" />
          현재 {filtered.length}건
        </div>

        <div className="space-y-3">
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(`/trainer/classes/${item.id}`)}
              className="w-full rounded-card bg-surface p-4 text-left shadow-card"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                      item.type === 'PT' ? 'bg-teal-50 text-teal-600' : item.type === 'GOLF' ? 'bg-emerald-50 text-emerald-600' : 'bg-primary-light text-primary'
                    )}>
                      {item.type}
                    </span>
                    <span className="rounded-full bg-surface-secondary px-2 py-0.5 text-[11px] text-content-secondary">
                      {STATUS_LABELS[item.status]}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-xs text-content-secondary">
                    {formatDateKo(item.startTime)} · {formatTime(item.startTime)} - {formatTime(item.endTime)} · {item.room}
                  </p>
                  <p className="mt-2 text-xs text-content-tertiary">
                    참여 회원 {item.participants.length}명
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-content-tertiary" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
