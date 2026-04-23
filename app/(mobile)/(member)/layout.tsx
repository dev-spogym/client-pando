'use client';

import { useSearchParams } from 'next/navigation';
import PrivateRoute from '@/components/PrivateRoute';
import {
  getPreviewMemberProfile,
  readPreviewMode,
  readPreviewRole,
  seedPreviewMemberExperience,
} from '@/lib/preview';
import { useAuthStore } from '@/stores/authStore';

function syncPreviewMemberSession(searchParams: ReturnType<typeof useSearchParams>) {
  const previewMode = readPreviewMode(searchParams);
  const previewRole = readPreviewRole(searchParams);

  if (!previewMode || previewRole !== 'member') {
    return;
  }

  const state = useAuthStore.getState();
  const previewReady =
    state.userRole === 'member' &&
    state.member !== null &&
    state.sessionSource === 'preview' &&
    state.initialized &&
    !state.loading;

  if (previewReady) {
    return;
  }

  const previewMember = getPreviewMemberProfile();
  seedPreviewMemberExperience(previewMember.id);
  useAuthStore.setState({
    member: previewMember,
    trainer: null,
    userRole: 'member',
    sessionSource: 'preview',
    loading: false,
    initialized: true,
  });
}

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();

  syncPreviewMemberSession(searchParams);

  return <PrivateRoute>{children}</PrivateRoute>;
}
