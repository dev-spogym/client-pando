import { useNavigate, useLocation } from 'react-router-dom';
import { Home, CalendarDays, QrCode, CreditCard, User } from 'lucide-react';
import { cn } from '@/lib/utils';

/** 하단 탭 정의 */
const tabs = [
  { path: '/', label: '홈', icon: Home },
  { path: '/classes', label: '예약', icon: CalendarDays },
  { path: '/qr', label: 'QR', icon: QrCode, isCenter: true },
  { path: '/membership', label: '이용권', icon: CreditCard },
  { path: '/profile', label: 'MY', icon: User },
];

/** 하단 탭바 컴포넌트 */
export default function BottomTabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  /** 현재 경로가 탭에 해당하는지 확인 */
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="mobile-fixed-width fixed bottom-0 z-40 bg-surface border-t border-line">
      <div className="flex items-end justify-around tab-bar-safe">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const Icon = tab.icon;

          // QR 중앙 FAB 버튼
          if (tab.isCenter) {
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="relative -top-4 flex flex-col items-center"
              >
                <div className={cn(
                  'w-14 h-14 rounded-full flex items-center justify-center shadow-lg',
                  'bg-primary text-white active:bg-primary-dark transition-colors'
                )}>
                  <Icon className="w-7 h-7" />
                </div>
                <span className="text-[10px] mt-1 text-content-secondary">{tab.label}</span>
              </button>
            );
          }

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center py-2 px-3 min-w-[56px]"
            >
              <Icon
                className={cn(
                  'w-6 h-6 transition-colors',
                  active ? 'text-primary' : 'text-content-tertiary'
                )}
              />
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
