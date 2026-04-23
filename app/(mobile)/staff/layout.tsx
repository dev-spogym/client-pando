'use client';

import PreviewRoleRoute from '@/components/PreviewRoleRoute';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <PreviewRoleRoute allowedRoles={['staff']}>{children}</PreviewRoleRoute>;
}
