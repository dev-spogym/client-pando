import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, CalendarDays, MessageSquare, User } from 'lucide-react';
import { cn } from '@/lib/utils';

/** 트레이너 하단 탭 정의 */
const tabs = [
  { path: '/trainer', label: '홈', icon: Home },
  { path: '/trainer/members', label: '회원', icon: Users },
  { path: '/trainer/schedule', label: '일정', icon: CalendarDays },
  { path: '/trainer/feedback', label: '피드백', icon: MessageSquare },
  { path: '/trainer/profile', label: 'MY', icon: User },
];

/** 트레이너 하단 탭바 컴포넌트 */
export default function TrainerTabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  /** 현재 경로가 탭에 해당하는지 확인 */
  const isActive = (path: string) => {
    if (path === '/trainer') return location.pathname === '/trainer';
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
