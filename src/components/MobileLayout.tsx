import { Outlet, useLocation } from 'react-router-dom';
import BottomTabBar from './BottomTabBar';

/** 탭바를 숨길 경로 목록 */
const HIDE_TAB_PATHS = ['/login', '/register', '/lesson-sign'];

/** 모바일 레이아웃 (헤더 + 탭바) */
export default function MobileLayout() {
  const location = useLocation();
  const hideTab = HIDE_TAB_PATHS.some((p) => location.pathname.startsWith(p));

  return (
    <div className="min-h-screen flex justify-center bg-gray-100">
      <div className="w-full max-w-lg min-h-screen bg-surface relative shadow-xl">
        <main className={hideTab ? '' : 'page-content'}>
          <Outlet />
        </main>
        {!hideTab && <BottomTabBar />}
      </div>
    </div>
  );
}
