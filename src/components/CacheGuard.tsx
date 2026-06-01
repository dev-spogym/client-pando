'use client';

import { useEffect } from 'react';

/**
 * 스테일 캐시 자동 복구 가드.
 *
 * 과거 배포본이 등록한 서비스워커나 Cache Storage가 사용자 기기에 남아 있으면
 * 리브랜딩(스포짐 → FitGenie) 이후에도 옛 번들/디자인이 먼저 노출될 수 있다.
 * 현재 앱은 서비스워커를 사용하지 않으므로, 남아 있는 등록과 캐시를 모두 정리한다.
 * 정리는 기기당 1회만 수행한다(무한 새로고침 방지).
 */
export default function CacheGuard() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const FLAG = 'fitgenie-cache-cleaned-v1';
    if (window.localStorage.getItem(FLAG)) return;

    const cleanup = async () => {
      let removedServiceWorker = false;

      // 1) 남은 서비스워커 등록 해제 (옛 app shell을 서빙하는 주범)
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            const ok = await registration.unregister();
            if (ok) removedServiceWorker = true;
          }
        } catch { /* noop */ }
      }

      // 2) Cache Storage 비우기 (옛 자산 잔존분)
      if ('caches' in window) {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map((key) => caches.delete(key)));
        } catch { /* noop */ }
      }

      window.localStorage.setItem(FLAG, '1');

      // 서비스워커를 실제로 제거했다면 새 자산으로 1회 강제 reload
      if (removedServiceWorker) {
        window.location.reload();
      }
    };

    void cleanup();
  }, []);

  return null;
}
