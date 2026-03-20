import { Navigate } from 'react-router-dom';
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

  // 트레이너/어드민이 아니면 로그인으로 리다이렉트
  if (!trainer || (userRole !== 'trainer' && userRole !== 'admin')) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
