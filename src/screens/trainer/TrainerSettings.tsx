import { toast } from 'sonner';
import { getRoleSettings, updateRoleSettings } from '@/lib/mockOperations';
import { PageHeader, Card, Badge } from '@/components/ui';

export default function TrainerSettings() {
  const settings = getRoleSettings('trainer');

  const toggle = (key: 'pushEnabled' | 'systemEnabled' | 'reservationEnabled') => {
    updateRoleSettings('trainer', { [key]: !settings[key] });
    toast.success('설정을 저장했습니다.');
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <PageHeader showBack={false} title="트레이너 설정" subtitle="MA-252" />

      <div className="px-5 py-4 pb-24 space-y-3">
        {[
          { key: 'pushEnabled' as const, label: '푸시 알림 수신' },
          { key: 'reservationEnabled' as const, label: '예약 요청 알림' },
          { key: 'systemEnabled' as const, label: '시스템 공지 알림' },
        ].map((item) => (
          <Card
            key={item.key}
            variant="elevated"
            padding="md"
            interactive
            onClick={() => toggle(item.key)}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{item.label}</span>
              <Badge
                tone={settings[item.key] ? 'primary' : 'neutral'}
                variant="soft"
              >
                {settings[item.key] ? 'ON' : 'OFF'}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
