'use client';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, RefreshCw, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui';

const SYNC_KEY = 'last_sync_at';

function readLastSync(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SYNC_KEY);
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function formatRelative(timestamp: number | null): string {
  if (!timestamp) return '동기화 기록 없음';
  const diffMs = Date.now() - timestamp;
  if (diffMs < 0) return '방금 전';
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

/** 네트워크 오류 / 오프라인 안내 페이지 */
export default function NoNetwork() {
  const navigate = useNavigate();
  const [retrying, setRetrying] = useState(false);
  const [lastSyncLabel, setLastSyncLabel] = useState('동기화 기록 없음');
  const [online, setOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // 마지막 동기화 시각 라벨
  useEffect(() => {
    const update = () => setLastSyncLabel(formatRelative(readLastSync()));
    update();
    const intervalId = window.setInterval(update, 30_000);
    return () => window.clearInterval(intervalId);
  }, []);

  // 온라인 상태 추적
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setRetrying(true);
    // UX상 약간의 latency 부여
    await new Promise((resolve) => setTimeout(resolve, 600));
    setRetrying(false);

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      toast.error('아직 인터넷에 연결되지 않았어요');
      return;
    }

    toast.success('연결되었어요');
    try {
      window.localStorage.setItem(SYNC_KEY, String(Date.now()));
    } catch {
      // 무시
    }
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col px-6 py-8">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full bg-state-error/10 flex items-center justify-center mb-6">
          <WifiOff
            className="w-12 h-12 text-state-error"
            strokeWidth={2.2}
          />
        </div>

        <h2 className="text-h1 text-content">
          인터넷 연결을
          <br />
          확인해주세요
        </h2>
        <p className="text-body text-content-secondary mt-3 leading-relaxed">
          네트워크 상태를 확인하고
          <br />
          다시 시도해주세요.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-surface-secondary">
          <span
            className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-state-success' : 'bg-state-error'}`}
          />
          <span className="text-caption text-content-secondary">
            마지막 업데이트: {lastSyncLabel}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={retrying}
          leftIcon={<RefreshCw className="w-4 h-4" />}
          onClick={handleRetry}
        >
          다시 시도
        </Button>
        <Button
          variant="outline"
          size="lg"
          fullWidth
          leftIcon={<Home className="w-4 h-4" />}
          onClick={() => navigate('/', { replace: true })}
        >
          홈으로
        </Button>
      </div>
    </div>
  );
}
