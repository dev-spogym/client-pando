'use client';

import { useEffect } from 'react';
import { Toaster } from 'sonner';
import PwaInstallBanner from '@/components/PwaInstallBanner';
import { useAuthStore } from '@/stores/authStore';

export default function Providers({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <>
      {children}
      <PwaInstallBanner />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
    </>
  );
}
