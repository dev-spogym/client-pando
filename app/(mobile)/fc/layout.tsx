'use client';

import PreviewRoleRoute from '@/components/PreviewRoleRoute';

export default function FcLayout({ children }: { children: React.ReactNode }) {
  return <PreviewRoleRoute allowedRoles={['fc']}>{children}</PreviewRoleRoute>;
}
