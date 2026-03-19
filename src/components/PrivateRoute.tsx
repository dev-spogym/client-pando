import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from './LoadingSpinner';

interface PrivateRouteProps {
  children: React.ReactNode;
}

/** 인증 필요 라우트 래퍼 */
export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { member, loading, initialized } = useAuthStore();

  // 초기화 전이면 로딩 표시
  if (!initialized || loading) {
    return <LoadingSpinner fullScreen text="로딩 중..." />;
  }

  // 미인증이면 로그인으로 리다이렉트
  if (!member) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
