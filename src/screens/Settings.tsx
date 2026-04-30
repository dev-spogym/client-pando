import { useEffect, useState } from 'react';
import { ChevronRight, LogOut, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { loadMemberSettings, saveMemberSettings, type MemberSettings } from '@/lib/memberExperience';
import { PageHeader } from '@/components/ui';

/** 회원 설정 */
export default function Settings() {
  const navigate = useNavigate();
  const { member, logout } = useAuthStore();
  const [settings, setSettings] = useState<MemberSettings | null>(null);

  useEffect(() => {
    if (!member) return;
    setSettings(loadMemberSettings(member.id));
  }, [member]);

  if (!member || !settings) return null;

  const toggle = (key: keyof MemberSettings) => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    saveMemberSettings(member.id, next);
  };

  const handleLogout = async () => {
    await logout();
    toast.success('로그아웃 되었습니다.');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <PageHeader title="설정" showBack />

      <div className="px-5 py-4 space-y-4">
        <section className="bg-surface rounded-card shadow-card-soft overflow-hidden">
          <SettingToggle label="예약 알림" description="예약 확정, 변경, 대기 확정 알림" value={settings.reservationPush} onToggle={() => toggle('reservationPush')} />
          <SettingToggle label="이용권 알림" description="만료일, 잔여 회차, 재등록 추천" value={settings.membershipPush} onToggle={() => toggle('membershipPush')} />
          <SettingToggle label="결제 알림" description="결제 완료, 영수증, 마일리지 적립" value={settings.paymentPush} onToggle={() => toggle('paymentPush')} />
          <SettingToggle label="공지 알림" description="센터 공지와 운영시간 변경" value={settings.noticePush} onToggle={() => toggle('noticePush')} />
          <SettingToggle label="마케팅 알림" description="이벤트, 프로모션, 추천 상품" value={settings.marketingPush} onToggle={() => toggle('marketingPush')} />
        </section>

        <section className="bg-surface rounded-card shadow-card-soft overflow-hidden">
          {[
            { label: '약관 / 정책', path: '/legal', value: '보기' },
            { label: '동의관리', path: '/consents', value: '관리' },
            { label: '개인 결제 페이지', path: '/payment/personal', value: '이동' },
            { label: '상품 스토어', path: '/shop', value: '이동' },
            { label: '앱 버전', path: '', value: '1.0.0' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => item.path && navigate(item.path)}
              className="w-full flex items-center justify-between px-4 py-4 border-b last:border-b-0 border-line-light"
            >
              <span className="text-body font-medium">{item.label}</span>
              <div className="flex items-center gap-2 text-body text-content-tertiary">
                <span>{item.value}</span>
                {item.path && <ChevronRight className="w-4 h-4" />}
              </div>
            </button>
          ))}
        </section>

        <button
          onClick={() => navigate('/withdrawal')}
          className="w-full bg-surface rounded-card shadow-card-soft px-4 py-4 flex items-center gap-3 text-state-error"
        >
          <ShieldAlert className="w-5 h-5" />
          <span className="text-body font-medium">회원 탈퇴</span>
          <ChevronRight className="w-4 h-4 ml-auto" />
        </button>

        <button
          onClick={handleLogout}
          className="w-full bg-surface rounded-card shadow-card-soft px-4 py-4 flex items-center gap-3 text-state-error"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-body font-medium">로그아웃</span>
        </button>
      </div>
    </div>
  );
}

function SettingToggle({
  label,
  description,
  value,
  onToggle,
}: {
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-4 border-b last:border-b-0 border-line-light">
      <div className="flex-1">
        <p className="text-body font-medium">{label}</p>
        <p className="text-caption text-content-tertiary mt-1">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={cn(
          'w-12 h-7 rounded-full relative transition-colors',
          value ? 'bg-primary' : 'bg-line'
        )}
      >
        <span
          className={cn(
            'absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform',
            value && 'translate-x-5'
          )}
        />
      </button>
    </div>
  );
}
