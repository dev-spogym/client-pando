'use client';

import MobileLayout from '@/components/MobileLayout';

export default function MobileShellLayout({ children }: { children: React.ReactNode }) {
  return <MobileLayout>{children}</MobileLayout>;
}
