'use client';

import PrivateRoute from '@/components/PrivateRoute';

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return <PrivateRoute>{children}</PrivateRoute>;
}
