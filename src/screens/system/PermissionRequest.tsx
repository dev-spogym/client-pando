import { useState } from 'react';
import { Bell, Camera, CheckCircle2, MapPin, Settings, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Badge, Button, Card, PageHeader } from '@/components/ui';

const PERMISSIONS = [
  { key: 'push', title: '푸시 알림', body: '예약, 결제, 마일리지, 공지 알림', icon: Bell },
  { key: 'location', title: '위치', body: '내 주변 센터와 지도 검색', icon: MapPin },
  { key: 'camera', title: '카메라', body: 'QR 스캔과 사진 첨부', icon: Camera },
  { key: 'photos', title: '사진', body: '후기와 체성분 사진 첨부', icon: Upload },
] as const;

type PermissionKey = (typeof PERMISSIONS)[number]['key'];

/** 권한 요청 */
export default function PermissionRequest() {
  const [granted, setGranted] = useState<Set<PermissionKey>>(new Set());

  const request = (key: PermissionKey) => {
    setGranted((prev) => new Set(prev).add(key));
    toast.success('권한 상태를 허용으로 반영했습니다.');
  };

  const openSettings = () => {
    toast.info('기기 설정에서 앱 권한을 변경할 수 있습니다.');
  };

  return (
    <div className="min-h-screen bg-surface-secondary pb-10">
      <PageHeader title="권한 요청" showBack />
      <div className="px-4 py-4 space-y-4">
        <Card padding="lg">
          <h1 className="text-h2 font-bold text-content">필요할 때만 권한을 요청합니다</h1>
          <p className="mt-2 text-body-sm text-content-secondary">
            거부해도 핵심 기능은 사용할 수 있으며, 해당 기능 진입 시 다시 안내합니다.
          </p>
        </Card>

        <div className="space-y-3">
          {PERMISSIONS.map((item) => {
            const Icon = item.icon;
            const allowed = granted.has(item.key);
            return (
              <Card key={item.key} padding="md">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-card bg-primary-light text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-body-sm font-semibold text-content">{item.title}</p>
                      {allowed && (
                        <Badge tone="success" size="sm">
                          <CheckCircle2 className="h-3 w-3" />
                          허용
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-caption text-content-secondary">{item.body}</p>
                  </div>
                  <Button size="sm" variant={allowed ? 'outline' : 'primary'} onClick={() => request(item.key)}>
                    {allowed ? '다시 요청' : '허용'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        <Button fullWidth variant="outline" leftIcon={<Settings className="h-4 w-4" />} onClick={openSettings}>
          기기 설정 열기
        </Button>
      </div>
    </div>
  );
}
