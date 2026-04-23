'use client';

import TrainerRoute from '@/components/TrainerRoute';

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  return <TrainerRoute>{children}</TrainerRoute>;
}
