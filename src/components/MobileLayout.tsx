import { useLocation } from 'react-router-dom';
import { isTrainerRole } from '@/lib/auth';
import { useAuthStore } from '@/stores/authStore';
import BottomTabBar from './BottomTabBar';
import TrainerTabBar from './TrainerTabBar';
import FcTabBar from './FcTabBar';
import StaffTabBar from './StaffTabBar';

/** 탭바를 숨길 경로 목록 */
const HIDE_TAB_PATHS = ['/login', '/register', '/lesson-sign', '/onboarding', '/checkout', '/renewal', '/withdrawal'];

/** 상세 화면 중 탭바를 숨길 prefix */
const HIDE_TAB_PREFIXES = ['/classes/', '/shop/'];

/** 트레이너 탭바를 숨길 경로 */
const HIDE_TRAINER_TAB_PATHS = ['/login', '/register'];
const HIDE_TRAINER_TAB_PREFIXES = ['/trainer/members/', '/trainer/classes/', '/trainer/certificates/'];
const HIDE_FC_TAB_PREFIXES = ['/fc/leads/new', '/fc/leads/', '/fc/members/', '/fc/renewals/new', '/fc/notifications'];
const HIDE_STAFF_TAB_PREFIXES = ['/staff/members/', '/staff/notifications'];

/** 모바일 레이아웃 (헤더 + 탭바) */
export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { userRole } = useAuthStore();

  const isTrainerView = isTrainerRole(userRole);
  const isTrainerPath = location.pathname.startsWith('/trainer');
  const isFcPath = location.pathname.startsWith('/fc');
  const isStaffPath = location.pathname.startsWith('/staff');
  const showTrainerTab = isTrainerPath || (isTrainerView && location.pathname === '/profile');
  const hideTrainerTab = HIDE_TRAINER_TAB_PATHS.some((p) => location.pathname.startsWith(p))
    || HIDE_TRAINER_TAB_PREFIXES.some((p) => location.pathname.startsWith(p));
  const hideFcTab = HIDE_FC_TAB_PREFIXES.some((p) => location.pathname.startsWith(p));
  const hideStaffTab = HIDE_STAFF_TAB_PREFIXES.some((p) => location.pathname.startsWith(p));
  const hideMemberTab = HIDE_TAB_PATHS.some((p) => location.pathname.startsWith(p))
    || HIDE_TAB_PREFIXES.some((p) => location.pathname.startsWith(p));

  const hideTab = isFcPath
    ? hideFcTab
    : isStaffPath
      ? hideStaffTab
      : showTrainerTab
        ? hideTrainerTab
        : hideMemberTab;

  return (
    <div className="mobile-shell flex justify-center bg-surface-secondary md:bg-gray-100">
      <div className="mobile-frame relative flex flex-col bg-surface shadow-none md:shadow-xl">
        <main className={hideTab ? 'mobile-main' : 'mobile-main page-content'}>
          {children}
        </main>
        {!hideTab && (
          isFcPath
            ? <FcTabBar />
            : isStaffPath
              ? <StaffTabBar />
              : showTrainerTab
                ? <TrainerTabBar />
                : <BottomTabBar />
        )}
      </div>
    </div>
  );
}
