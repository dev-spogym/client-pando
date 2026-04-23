'use client';

import { useEffect } from 'react';
import { useSearchParams as useNextSearchParams } from 'next/navigation';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getRoleHomePath, type UserRole } from '@/lib/auth';
import {
  readPreviewMode,
  readPreviewRole,
  type PreviewRole,
} from '@/lib/preview';
import { useAuthStore } from '@/stores/authStore';

interface PreviewRoleRouteProps {
  allowedRoles: Array<PreviewRole | UserRole>;
  allowAdmin?: boolean;
  children: React.ReactNode;
}

export default function PreviewRoleRoute({ allowedRoles, allowAdmin = false, children }: PreviewRoleRouteProps) {
  const searchParams = useNextSearchParams();
  const { member, trainer, userRole, sessionSource, loading, initialized, initialize } = useAuthStore();
  const previewMode = readPreviewMode(searchParams);
  const previewKey = searchParams?.toString() || '';

  useEffect(() => {
    if (previewMode) {
      void initialize();
    }
  }, [initialize, previewKey, previewMode]);

  if (previewMode) {
    const previewRole = readPreviewRole(searchParams);
    const previewAllowed = allowedRoles.includes(previewRole);
    const previewReady = previewRole === 'member'
      ? userRole === 'member' && member !== null && sessionSource === 'preview'
      : userRole === previewRole && trainer !== null && sessionSource === 'preview';

    if (!initialized || loading) {
      return <LoadingSpinner fullScreen text="미리보기 로딩 중..." />;
    }

    if (!previewAllowed) {
      return <Navigate to="/login" replace />;
    }

    if (!previewReady) {
      return <LoadingSpinner fullScreen text="미리보기 로딩 중..." />;
    }

    return <>{children}</>;
  }

  if (!initialized || loading) {
    return <LoadingSpinner fullScreen text="로딩 중..." />;
  }

  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  if (allowAdmin && userRole === 'admin') {
    return <>{children}</>;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to={getRoleHomePath(userRole)} replace />;
  }

  return <>{children}</>;
}
