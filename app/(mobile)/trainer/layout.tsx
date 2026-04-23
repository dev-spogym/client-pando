'use client';

import PreviewRoleRoute from '@/components/PreviewRoleRoute';

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  return <PreviewRoleRoute allowedRoles={['trainer', 'golf_trainer']} allowAdmin>{children}</PreviewRoleRoute>;
}
