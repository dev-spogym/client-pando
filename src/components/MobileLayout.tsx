import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import BottomTabBar from './BottomTabBar';
import TrainerTabBar from './TrainerTabBar';

/** 탭바를 숨길 경로 목록 */
const HIDE_TAB_PATHS = ['/login', '/register', '/lesson-sign', '/onboarding', '/checkout', '/renewal', '/withdrawal'];

/** 상세 화면 중 탭바를 숨길 prefix */
const HIDE_TAB_PREFIXES = ['/classes/', '/shop/'];

/** 트레이너 탭바를 숨길 경로 */
const HIDE_TRAINER_TAB_PATHS = ['/login', '/register'];

/** 모바일 레이아웃 (헤더 + 탭바) */
export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { userRole } = useAuthStore();

  const isTrainerView = userRole === 'trainer' || userRole === 'admin';
  const isTrainerPath = location.pathname.startsWith('/trainer');

  // 탭바 숨김 여부
  const hideTab = isTrainerView
    ? HIDE_TRAINER_TAB_PATHS.some((p) => location.pathname.startsWith(p))
      || (location.pathname.startsWith('/trainer/members/') && location.pathname.split('/').length > 3)
    : HIDE_TAB_PATHS.some((p) => location.pathname.startsWith(p))
      || HIDE_TAB_PREFIXES.some((p) => location.pathname.startsWith(p));

  // 트레이너 경로이거나 트레이너 역할이면 트레이너 탭바
  const showTrainerTab = isTrainerView && (isTrainerPath || location.pathname === '/profile');

  return (
    <div className="mobile-shell flex justify-center bg-surface-secondary md:bg-gray-100">
      <div className="mobile-frame relative flex flex-col bg-surface shadow-none md:shadow-xl">
        <main className={hideTab ? 'mobile-main' : 'mobile-main page-content'}>
          {children}
        </main>
        {!hideTab && (showTrainerTab ? <TrainerTabBar /> : <BottomTabBar />)}
      </div>
    </div>
  );
}
