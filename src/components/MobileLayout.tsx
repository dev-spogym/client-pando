import { Outlet, useLocation } from 'react-router-dom';
import BottomTabBar from './BottomTabBar';

/** 탭바를 숨길 경로 목록 */
const HIDE_TAB_PATHS = ['/login', '/register', '/lesson-sign'];

/** 모바일 레이아웃 (헤더 + 탭바) */
export default function MobileLayout() {
  const location = useLocation();
  const hideTab = HIDE_TAB_PATHS.some((p) => location.pathname.startsWith(p));

  return (
    <div className="min-h-screen max-w-lg mx-auto relative">
      <main className={hideTab ? '' : 'page-content'}>
        <Outlet />
      </main>
      {!hideTab && <BottomTabBar />}
    </div>
  );
}
