import { useNavigate } from 'react-router-dom';
import { Bell, CalendarClock, CreditCard, Users } from 'lucide-react';
import { getExpiringMembers, getFcDashboard, getMockProfile } from '@/lib/mockOperations';
import { useAuthStore } from '@/stores/authStore';
import { formatDateKo } from '@/lib/utils';

export default function FCHome() {
  const navigate = useNavigate();
  const trainer = useAuthStore((state) => state.trainer);
  const dashboard = getFcDashboard();
  const mockProfile = getMockProfile('fc');
  const displayName = trainer?.staffName || trainer?.name || mockProfile.name;
  const urgentMembers = getExpiringMembers().filter((item) => item.assignedFc === mockProfile.name).slice(0, 3);

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-gradient-to-br from-indigo-600 to-sky-600 px-5 pt-safe-top pb-6">
        <div className="pt-4 flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">FC</p>
            <h1 className="text-white text-xl font-bold">{displayName}</h1>
          </div>
          <button onClick={() => navigate('/fc/notifications')} className="rounded-full bg-white/20 p-2 text-white">
            <Bell className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <SummaryCard label="오늘 상담" value={`${dashboard.todayConsultationCount}건`} />
          <SummaryCard label="담당 회원" value={`${dashboard.assignedMembers}명`} />
          <SummaryCard label="만료 예정" value={`${dashboard.expiringMembers}명`} />
          <SummaryCard label="신규 리드" value={`${dashboard.newLeads}건`} />
        </div>
      </header>

      <div className="px-5 -mt-2 pb-24 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <QuickMenu label="상담 목록" icon={<CalendarClock className="w-5 h-5 text-indigo-600" />} onClick={() => navigate('/fc/leads')} />
          <QuickMenu label="회원 목록" icon={<Users className="w-5 h-5 text-sky-600" />} onClick={() => navigate('/fc/members')} />
          <QuickMenu label="만료 예정" icon={<CreditCard className="w-5 h-5 text-state-error" />} onClick={() => navigate('/fc/expiring')} />
        </div>

        <section className="rounded-card bg-surface p-4 shadow-card">
          <p className="text-sm font-semibold">오늘의 상담 일정</p>
          <div className="mt-3 space-y-2">
            {dashboard.todayConsultations.length === 0 ? (
              <p className="text-sm text-content-tertiary">오늘 예정된 상담이 없습니다.</p>
            ) : dashboard.todayConsultations.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(`/fc/leads/${item.id}`)}
                className="w-full rounded-xl bg-surface-secondary px-3 py-3 text-left"
              >
                <p className="text-sm font-semibold">{item.memberName}</p>
                <p className="mt-1 text-xs text-content-secondary">{item.type} · {item.scheduledAt.slice(11, 16)} · {item.channel}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-card bg-surface p-4 shadow-card">
          <p className="text-sm font-semibold">긴급 알림</p>
          <div className="mt-3 space-y-2">
            {urgentMembers.map((member) => (
              <div key={member.id} className="rounded-xl bg-rose-50 px-3 py-3">
                <p className="text-sm font-semibold text-rose-700">{member.name}</p>
                <p className="mt-1 text-xs text-rose-600">만료일 {formatDateKo(member.membershipEnd)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/20 p-4 text-white">
      <p className="text-xs text-white/70">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

function QuickMenu({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-card bg-surface p-4 text-left shadow-card">
      {icon}
      <p className="mt-3 text-sm font-semibold">{label}</p>
    </button>
  );
}
