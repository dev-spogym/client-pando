import { useNavigate } from 'react-router-dom';
import { getExpiringMembers } from '@/lib/mockOperations';
import { formatDateKo } from '@/lib/utils';
import { Card } from '@/components/ui';

export default function FCExpiringMembers() {
  const navigate = useNavigate();
  const members = getExpiringMembers().filter((item) => item.assignedFc === '정하늘');

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-gradient-to-br from-state-error to-state-warning px-5 pt-safe-top pb-5">
        <div className="pt-4">
          <p className="text-white/80 text-body">MA-430</p>
          <h1 className="text-white text-h2 font-bold mt-1">만료 예정 회원</h1>
        </div>
      </header>

      <div className="px-5 py-4 pb-24 space-y-3">
        {members.map((member) => (
          <button
            key={member.id}
            onClick={() => navigate(`/fc/members/${member.id}`)}
            className="w-full text-left"
          >
            <Card interactive>
              <p className="text-body font-semibold">{member.name}</p>
              <p className="mt-1 text-caption text-content-secondary">{member.membershipName}</p>
              <p className="mt-2 text-body text-state-error">만료일 {formatDateKo(member.membershipEnd)}</p>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
