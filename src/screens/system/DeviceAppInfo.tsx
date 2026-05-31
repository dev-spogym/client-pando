import { useMemo } from 'react';
import { Copy, Database, LogOut, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, PageHeader } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';

/** 디바이스 / 앱 정보 */
export default function DeviceAppInfo() {
  const { logout } = useAuthStore();
  const info = useMemo(() => {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
    const platform = typeof navigator !== 'undefined' ? navigator.platform : 'unknown';
    return {
      appVersion: '1.0.0',
      osVersion: platform,
      device: userAgent.includes('Mobile') ? 'Mobile WebView' : 'Desktop Preview',
      pushToken: 'mock-fcm-token-8f3a...21c',
      userAgent,
    };
  }, []);

  const copyToken = async () => {
    await navigator.clipboard?.writeText(info.pushToken).catch(() => undefined);
    toast.success('푸시 토큰을 복사했습니다.');
  };

  const clearAppData = () => {
    const prefix = 'fitgenie-';
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(prefix)) localStorage.removeItem(key);
    });
    toast.success('앱 캐시 데이터를 초기화했습니다.');
  };

  return (
    <div className="min-h-screen bg-surface-secondary pb-10">
      <PageHeader title="디바이스 / 앱 정보" showBack />
      <div className="px-4 py-4 space-y-4">
        <Card padding="lg">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-card bg-primary-light text-primary">
            <Smartphone className="h-6 w-6" />
          </div>
          <div className="space-y-3">
            <Row label="앱 버전" value={info.appVersion} />
            <Row label="OS / 플랫폼" value={info.osVersion} />
            <Row label="디바이스" value={info.device} />
            <Row label="푸시 토큰" value={info.pushToken} />
          </div>
        </Card>

        <Card padding="md">
          <p className="text-body-sm font-semibold text-content">User Agent</p>
          <p className="mt-2 break-all text-caption text-content-secondary">{info.userAgent}</p>
        </Card>

        <div className="space-y-2">
          <Button fullWidth variant="outline" leftIcon={<Copy className="h-4 w-4" />} onClick={copyToken}>
            푸시 토큰 복사
          </Button>
          <Button fullWidth variant="outline" leftIcon={<Database className="h-4 w-4" />} onClick={clearAppData}>
            앱 데이터 초기화
          </Button>
          <Button fullWidth variant="danger" leftIcon={<LogOut className="h-4 w-4" />} onClick={() => void logout()}>
            로그아웃
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-body-sm text-content-secondary">{label}</span>
      <span className="min-w-0 break-all text-right text-body-sm font-medium text-content">{value}</span>
    </div>
  );
}
