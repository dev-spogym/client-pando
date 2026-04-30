import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, CircleAlert, FileStack, NotebookPen } from 'lucide-react';
import { getTrainerClasses } from '@/lib/mockOperations';
import { formatDateKo, formatTime } from '@/lib/utils';
import { Chip, Card, Badge, EmptyState } from '@/components/ui';

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
          <p className="text-white/80 text-body">MA-211</p>
          <h1 className="text-white text-h2 font-bold mt-1">수업 목록</h1>
          <p className="text-white/70 text-body mt-1">상태별 수업 목록과 누락된 출석/서명 이슈를 빠르게 확인합니다.</p>
        </div>
      </header>

      <div className="px-5 py-4 pb-24 space-y-4">
        {/* 필터 칩 */}
        <div className="flex gap-2">
          {[
            { key: 'all' as const, label: '전체' },
            { key: 'active' as const, label: '진행중/예정' },
            { key: 'completed' as const, label: '완료' },
          ].map((item) => (
            <Chip
              key={item.key}
              active={filter === item.key}
              onClick={() => setFilter(item.key)}
            >
              {item.label}
            </Chip>
          ))}
        </div>

        {/* 바로가기 카드 */}
        <div className="grid grid-cols-3 gap-3">
          <Card variant="soft" padding="md" interactive onClick={() => navigate('/trainer/templates')}>
            <NotebookPen className="w-5 h-5 text-primary" />
            <p className="mt-3 text-body font-semibold">템플릿 관리</p>
          </Card>
          <Card variant="soft" padding="md" interactive onClick={() => navigate('/trainer/penalties')}>
            <CircleAlert className="w-5 h-5 text-state-error" />
            <p className="mt-3 text-body font-semibold">노쇼 / 페널티</p>
          </Card>
          <Card variant="soft" padding="md" interactive onClick={() => navigate('/trainer/certificates')}>
            <FileStack className="w-5 h-5 text-state-info" />
            <p className="mt-3 text-body font-semibold">확인서</p>
          </Card>
        </div>

        <p className="text-caption text-content-tertiary">현재 {filtered.length}건</p>

        {filtered.length === 0 ? (
          <EmptyState size="sm" title="해당하는 수업이 없습니다" />
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <Card
                key={item.id}
                variant="elevated"
                padding="md"
                interactive
                onClick={() => navigate(`/trainer/classes/${item.id}`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge
                        tone={item.type === 'PT' ? 'primary' : item.type === 'GOLF' ? 'success' : 'accent'}
                        variant="soft"
                      >
                        {item.type}
                      </Badge>
                      <Badge tone="neutral" variant="soft">
                        {STATUS_LABELS[item.status]}
                      </Badge>
                    </div>
                    <p className="mt-2 text-body font-semibold">{item.title}</p>
                    <p className="mt-1 text-caption text-content-secondary">
                      {formatDateKo(item.startTime)} · {formatTime(item.startTime)} - {formatTime(item.endTime)} · {item.room}
                    </p>
                    <p className="mt-2 text-caption text-content-tertiary">
                      참여 회원 {item.participants.length}명
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-content-tertiary flex-shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
