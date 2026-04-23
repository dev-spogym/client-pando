import { toast } from 'sonner';
import { getRoleSettings, updateRoleSettings } from '@/lib/mockOperations';

export default function TrainerSettings() {
  const settings = getRoleSettings('trainer');

  const toggle = (key: 'pushEnabled' | 'systemEnabled' | 'reservationEnabled') => {
    updateRoleSettings('trainer', { [key]: !settings[key] });
    toast.success('설정을 저장했습니다.');
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-surface px-5 pt-safe-top pb-4 shadow-sm">
        <div className="pt-4">
          <p className="text-xs text-content-tertiary">MA-252</p>
          <h1 className="text-lg font-bold">트레이너 설정</h1>
        </div>
      </header>

      <div className="px-5 py-4 pb-24 space-y-3">
        {[
          { key: 'pushEnabled' as const, label: '푸시 알림 수신' },
          { key: 'reservationEnabled' as const, label: '예약 요청 알림' },
          { key: 'systemEnabled' as const, label: '시스템 공지 알림' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => toggle(item.key)}
            className="w-full rounded-card bg-surface px-4 py-4 shadow-card"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{item.label}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${settings[item.key] ? 'bg-teal-50 text-teal-600' : 'bg-surface-secondary text-content-secondary'}`}>
                {settings[item.key] ? 'ON' : 'OFF'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
