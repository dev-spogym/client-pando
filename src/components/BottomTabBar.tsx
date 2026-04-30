import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Building2, UserSquare2, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMarketStore } from '@/stores/marketStore';

const tabs = [
  { path: '/', label: '홈', icon: Home, exact: true },
  { path: '/centers', label: '센터', icon: Building2 },
  { path: '/trainers', label: '강사', icon: UserSquare2 },
  { path: '/scrap', label: '스크랩', icon: Heart, useScrapBadge: true },
  { path: '/profile', label: 'MY', icon: User },
];

/** 멤버 하단 탭바 — 마켓플레이스 패턴 5탭 */
export default function BottomTabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const scrapCount = useMarketStore((s) => s.scraps.length);

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
                fill={active && tab.useScrapBadge ? 'currentColor' : 'none'}
              />
              {tab.useScrapBadge && scrapCount > 0 && (
                <span className="absolute top-1 right-2 min-w-[16px] h-4 px-1 rounded-full bg-state-sale text-white text-[10px] font-bold flex items-center justify-center">
                  {scrapCount > 99 ? '99+' : scrapCount}
                </span>
              )}
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
