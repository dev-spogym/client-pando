'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Toaster } from 'sonner';
import PwaInstallBanner from '@/components/PwaInstallBanner';
import { useAuthStore } from '@/stores/authStore';

function AuthBootstrap() {
  const initialize = useAuthStore((state) => state.initialize);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams?.toString() || '';

  useEffect(() => {
    void initialize();
  }, [initialize, pathname, searchKey]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <AuthBootstrap />
        {children}
      </Suspense>
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
