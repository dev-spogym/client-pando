import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMockMembers } from '@/lib/mockOperations';
import { formatDateKo } from '@/lib/utils';
import { Chip, Card } from '@/components/ui';

export default function FCMembers() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'active' | 'expiring'>('all');
  const members = useMemo(() => getMockMembers().filter((item) => item.assignedFc === '정하늘'), []);

  const filtered = members.filter((member) => {
    if (filter === 'active') return member.status === 'ACTIVE';
    if (filter === 'expiring') return new Date(member.membershipEnd).getTime() < Date.now() + (1000 * 60 * 60 * 24 * 14);
    return true;
  });

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-surface px-5 pt-safe-top pb-4 shadow-sm">
        <div className="pt-4">
          <p className="text-xs text-content-tertiary">MA-420</p>
          <h1 className="text-lg font-bold">담당 회원 목록</h1>
        </div>
      </header>

      <div className="px-5 py-4 pb-24 space-y-4">
        <div className="flex gap-2">
          {[
            { key: 'all' as const, label: '전체' },
            { key: 'active' as const, label: '활성' },
            { key: 'expiring' as const, label: '만료 임박' },
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

        <div className="space-y-3">
          {filtered.map((member) => (
            <button
              key={member.id}
              onClick={() => navigate(`/fc/members/${member.id}`)}
              className="w-full text-left"
            >
              <Card interactive>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{member.name}</p>
                    <p className="mt-1 text-xs text-content-secondary">{member.membershipName}</p>
                    <p className="mt-2 text-xs text-content-tertiary">만료일 {formatDateKo(member.membershipEnd)}</p>
                  </div>
                  <span className="rounded-full bg-surface-secondary px-2 py-1 text-[11px] font-semibold text-content-secondary">
                    {member.status}
                  </span>
                </div>
              </Card>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
