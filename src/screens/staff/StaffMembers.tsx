import { useNavigate } from 'react-router-dom';
import { getMockMembers } from '@/lib/mockOperations';
import { Card } from '@/components/ui';

export default function StaffMembers() {
  const navigate = useNavigate();
  const members = getMockMembers();

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-surface px-5 pt-safe-top pb-4 shadow-sm">
        <div className="pt-4">
          <p className="text-xs text-content-tertiary">MA-510</p>
          <h1 className="text-lg font-bold">회원 검색 / 조회</h1>
        </div>
      </header>

      <div className="px-5 py-4 pb-24 space-y-3">
        {members.map((member) => (
          <button
            key={member.id}
            onClick={() => navigate(`/staff/members/${member.id}`)}
            className="w-full text-left"
          >
            <Card interactive>
              <p className="text-sm font-semibold">{member.name}</p>
              <p className="mt-1 text-xs text-content-secondary">{member.phone} · {member.membershipName}</p>
              <p className="mt-2 text-xs text-content-tertiary">상태 {member.status}</p>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
