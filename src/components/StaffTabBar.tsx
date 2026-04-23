import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays, Home, Settings, Users, ScanLine } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { path: '/staff', label: '홈', icon: Home },
  { path: '/staff/members', label: '회원', icon: Users },
  { path: '/staff/attendance/manual', label: '출석', icon: ScanLine },
  { path: '/staff/schedule', label: '일정', icon: CalendarDays },
  { path: '/staff/settings', label: '설정', icon: Settings },
];

export default function StaffTabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/staff') return location.pathname === '/staff';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="mobile-fixed-width fixed bottom-0 z-40 bg-surface border-t border-line">
      <div className="flex items-end justify-around tab-bar-safe">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const Icon = tab.icon;

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center py-2 px-3 min-w-[56px]"
            >
              <Icon className={cn('w-6 h-6 transition-colors', active ? 'text-primary' : 'text-content-tertiary')} />
              <span
                className={cn(
                  'text-[10px] mt-1 transition-colors',
                  active ? 'text-primary font-semibold' : 'text-content-tertiary'
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
