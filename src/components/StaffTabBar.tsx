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

/** 운영 직원 하단 탭바 */
export default function StaffTabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/staff') return location.pathname === '/staff';
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      aria-label="운영 직원 메뉴"
      className="mobile-fixed-width fixed bottom-0 z-40 bg-surface border-t border-line shadow-tab"
    >
      <div className="flex items-end justify-around tab-bar-safe">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const Icon = tab.icon;

          return (
            <button
              key={tab.path}
              type="button"
              onClick={() => navigate(tab.path)}
              aria-current={active ? 'page' : undefined}
              className="flex flex-col items-center pt-2 pb-1.5 px-3 min-w-[64px]"
            >
              <Icon
                className={cn(
                  'w-[22px] h-[22px] transition-colors ease-out-soft',
                  active ? 'text-primary' : 'text-content-tertiary'
                )}
                strokeWidth={active ? 2.4 : 1.8}
              />
              <span
                className={cn(
                  'text-[10px] mt-1 leading-none transition-colors ease-out-soft',
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
