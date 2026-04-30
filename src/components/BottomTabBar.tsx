import { useNavigate, useLocation } from 'react-router-dom';
import { Home, CalendarCheck, Building2, UserSquare2, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { path: '/', label: '홈', icon: Home, exact: true },
  { path: '/orders', label: '예약', icon: CalendarCheck },
  { path: '/centers', label: '센터', icon: Building2 },
  { path: '/trainers', label: '강사', icon: UserSquare2 },
  { path: '/profile', label: 'MY', icon: User },
];

/** 멤버 하단 탭바 — 마켓플레이스 패턴 5탭 (홈/예약/센터/강사/MY) */
export default function BottomTabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      aria-label="주 메뉴"
      className="mobile-fixed-width fixed bottom-0 z-40 bg-surface border-t border-line shadow-tab"
    >
      <div className="flex items-end justify-around tab-bar-safe">
        {tabs.map((tab) => {
          const active = isActive(tab.path, tab.exact);
          const Icon = tab.icon;

          return (
            <button
              key={tab.path}
              type="button"
              onClick={() => navigate(tab.path)}
              aria-current={active ? 'page' : undefined}
              className="relative flex flex-col items-center pt-2 pb-1.5 px-3 min-w-[64px]"
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
