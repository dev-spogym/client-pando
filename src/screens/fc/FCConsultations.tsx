import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { getConsultations } from '@/lib/mockOperations';
import { cn, formatDateKo } from '@/lib/utils';

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
          <button
            onClick={() => navigate('/fc/leads/new')}
            className="rounded-full bg-primary p-2 text-white"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="px-5 py-4 pb-24 space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {[
            { key: 'all' as const, label: '전체' },
            { key: 'scheduled' as const, label: '예정' },
            { key: 'completed' as const, label: '완료' },
            { key: 'no_show' as const, label: '노쇼' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setStatusFilter(item.key)}
              className={cn(
                'rounded-xl px-2 py-2 text-xs font-semibold',
                statusFilter === item.key ? 'bg-primary text-white' : 'bg-surface text-content-secondary'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(`/fc/leads/${item.id}`)}
              className="w-full rounded-card bg-surface p-4 text-left shadow-card"
            >
              <p className="text-sm font-semibold">{item.memberName}</p>
              <p className="mt-1 text-xs text-content-secondary">{item.type} · {item.channel} · {item.status}</p>
              <p className="mt-2 text-sm text-content-secondary">{item.summary}</p>
              <p className="mt-2 text-xs text-content-tertiary">{formatDateKo(item.scheduledAt)}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
