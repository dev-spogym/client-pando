import { Navigate } from 'react-router-dom';
import { getRoleHomePath, isTrainerRole } from '@/lib/auth';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from './LoadingSpinner';

interface TrainerRouteProps {
  children: React.ReactNode;
}

/** 트레이너 전용 라우트 래퍼 */
export default function TrainerRoute({ children }: TrainerRouteProps) {
  const { trainer, userRole, loading, initialized } = useAuthStore();

  // 초기화 전이면 로딩 표시
  if (!initialized || loading) {
    return <LoadingSpinner fullScreen text="로딩 중..." />;
  }

  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  // 트레이너 계열이 아니면 역할별 홈으로 리다이렉트
  if (!trainer || !isTrainerRole(userRole)) {
    return <Navigate to={getRoleHomePath(userRole)} replace />;
  }

  return <>{children}</>;
}
