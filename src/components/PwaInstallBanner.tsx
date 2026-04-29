'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

/** PWA 설치 프롬프트 배너 (상단 고정) */
export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent;
      promptEvent.preventDefault();
      setDeferredPrompt(promptEvent);

      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="mobile-floating-banner-top fixed z-50 slide-down">
      <div className="bg-surface rounded-card shadow-card-elevated border border-line p-3 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-card flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-caption">스포</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-body-sm font-semibold text-content">스포짐 앱 설치</p>
          <p className="text-caption text-content-secondary">홈 화면에 추가하면 더 빠르게!</p>
        </div>
        <Button variant="primary" size="sm" onClick={handleInstall}>
          설치
        </Button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="배너 닫기"
          className="w-8 h-8 inline-flex items-center justify-center rounded-full text-content-tertiary active:bg-surface-tertiary"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
