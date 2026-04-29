import { useNavigate, useLocation } from 'react-router-dom';
import { Home, CalendarDays, QrCode, CreditCard, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { path: '/', label: '홈', icon: Home },
  { path: '/classes', label: '예약', icon: CalendarDays },
  { path: '/qr', label: 'QR', icon: QrCode, isCenter: true },
  { path: '/membership', label: '이용권', icon: CreditCard },
  { path: '/profile', label: 'MY', icon: User },
];

/** 멤버 하단 탭바 */
export default function BottomTabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      aria-label="주 메뉴"
      className="mobile-fixed-width fixed bottom-0 z-40 bg-surface border-t border-line shadow-tab"
    >
      <div className="flex items-end justify-around tab-bar-safe">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const Icon = tab.icon;

          if (tab.isCenter) {
            return (
              <button
                key={tab.path}
                type="button"
                onClick={() => navigate(tab.path)}
                aria-label={tab.label}
                aria-current={active ? 'page' : undefined}
                className="relative -top-5 flex flex-col items-center"
              >
                <div
                  className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center shadow-fab',
                    'bg-primary text-white active:bg-primary-dark transition-colors ease-out-soft',
                    'ring-4 ring-surface'
                  )}
                >
                  <Icon className="w-7 h-7" strokeWidth={2.2} />
                </div>
                <span className="text-[10px] mt-1 font-medium text-content-secondary">{tab.label}</span>
              </button>
            );
          }

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
