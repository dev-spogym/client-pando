import { Navigate } from 'react-router-dom';
import { getRoleHomePath, isEmployeeRole } from '@/lib/auth';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from './LoadingSpinner';

interface PrivateRouteProps {
  children: React.ReactNode;
}

/** 인증 필요 라우트 래퍼 */
export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { member, trainer, userRole, loading, initialized } = useAuthStore();

  // 초기화 전이면 로딩 표시
  if (!initialized || loading) {
    return <LoadingSpinner fullScreen text="로딩 중..." />;
  }

  // 미인증이면 로그인으로 리다이렉트
  if (!member && !trainer) {
    return <Navigate to="/login" replace />;
  }

  // 직원이 회원 페이지에 접근하면 역할별 홈으로 리다이렉트
  if (isEmployeeRole(userRole) && !member) {
    return <Navigate to={getRoleHomePath(userRole)} replace />;
  }

  return <>{children}</>;
}
