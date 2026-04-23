import { useNavigate } from 'react-router-dom';
import { Bell, CalendarDays, ScanLine, Users } from 'lucide-react';
import { getMockProfile, getStaffDashboard } from '@/lib/mockOperations';
import { useAuthStore } from '@/stores/authStore';

export default function StaffHome() {
  const navigate = useNavigate();
  const trainer = useAuthStore((state) => state.trainer);
  const dashboard = getStaffDashboard();
  const mockProfile = getMockProfile('staff');
  const displayName = trainer?.staffName || trainer?.name || mockProfile.name;
  const branchLabel = trainer ? `지점 ID ${trainer.branchId}` : mockProfile.branch;

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-gradient-to-br from-slate-800 to-slate-600 px-5 pt-safe-top pb-6">
        <div className="pt-4 flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">Staff</p>
            <h1 className="text-white text-xl font-bold">{displayName}</h1>
          </div>
          <button onClick={() => navigate('/staff/notifications')} className="rounded-full bg-white/20 p-2 text-white">
            <Bell className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <SummaryCard label="오늘 출석" value={`${dashboard.todayAttendanceCount}건`} />
          <SummaryCard label="현재 이용중" value={`${dashboard.activeVisitors}명`} />
          <SummaryCard label="락커 사용" value={`${dashboard.lockerUsage.used}/${dashboard.lockerUsage.total}`} />
          <SummaryCard label="지점" value={branchLabel} />
        </div>
      </header>

      <div className="px-5 -mt-2 pb-24 grid grid-cols-3 gap-3">
        <QuickMenu label="회원 조회" icon={<Users className="w-5 h-5 text-slate-700" />} onClick={() => navigate('/staff/members')} />
        <QuickMenu label="수동 출석" icon={<ScanLine className="w-5 h-5 text-state-success" />} onClick={() => navigate('/staff/attendance/manual')} />
        <QuickMenu label="일정 조회" icon={<CalendarDays className="w-5 h-5 text-state-info" />} onClick={() => navigate('/staff/schedule')} />
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
