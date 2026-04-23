import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Home, Settings, Users, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { path: '/fc', label: '홈', icon: Home },
  { path: '/fc/leads', label: '상담', icon: ClipboardList },
  { path: '/fc/members', label: '회원', icon: Users },
  { path: '/fc/kpi', label: 'KPI', icon: BarChart3 },
  { path: '/fc/settings', label: '설정', icon: Settings },
];

export default function FcTabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/fc') return location.pathname === '/fc';
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
