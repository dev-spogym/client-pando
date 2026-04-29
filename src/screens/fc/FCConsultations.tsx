import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { getConsultations } from '@/lib/mockOperations';
import { formatDateKo } from '@/lib/utils';
import { Chip, Card, Button } from '@/components/ui';

export default function FCConsultations() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'completed' | 'no_show'>('all');
  const consultations = getConsultations();

  const filtered = useMemo(() => (
    statusFilter === 'all' ? consultations : consultations.filter((item) => item.status === statusFilter)
  ), [consultations, statusFilter]);

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-surface px-5 pt-safe-top pb-4 shadow-sm">
        <div className="pt-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-content-tertiary">MA-410</p>
            <h1 className="text-lg font-bold">리드 / 상담 예정 목록</h1>
          </div>
          <Button
            size="sm"
            onClick={() => navigate('/fc/leads/new')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            추가
          </Button>
        </div>
      </header>

      <div className="px-5 py-4 pb-24 space-y-4">
        <div className="flex gap-2">
          {[
            { key: 'all' as const, label: '전체' },
            { key: 'scheduled' as const, label: '예정' },
            { key: 'completed' as const, label: '완료' },
            { key: 'no_show' as const, label: '노쇼' },
          ].map((item) => (
            <Chip
              key={item.key}
              size="sm"
              active={statusFilter === item.key}
              onClick={() => setStatusFilter(item.key)}
            >
              {item.label}
            </Chip>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(`/fc/leads/${item.id}`)}
              className="w-full text-left"
            >
              <Card interactive>
                <p className="text-sm font-semibold">{item.memberName}</p>
                <p className="mt-1 text-xs text-content-secondary">{item.type} · {item.channel} · {item.status}</p>
                <p className="mt-2 text-sm text-content-secondary">{item.summary}</p>
                <p className="mt-2 text-xs text-content-tertiary">{formatDateKo(item.scheduledAt)}</p>
              </Card>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
