import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import {
  loadConsentState,
  saveConsentState,
  type MemberConsentState,
} from '@/lib/memberExperience';
import { cn, formatDateKo } from '@/lib/utils';
import { PageHeader, Card } from '@/components/ui';

/** 동의 관리 */
export default function ConsentManagement() {
  const navigate = useNavigate();
  const { member } = useAuthStore();
  const [consents, setConsents] = useState<MemberConsentState | null>(null);

  useEffect(() => {
    if (!member) return;
    setConsents(loadConsentState(member.id));
  }, [member]);

  if (!member || !consents) return null;

  const toggle = (key: keyof MemberConsentState) => {
    const next = { ...consents, [key]: !consents[key] };
    setConsents(next);
    saveConsentState(member.id, next);
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <PageHeader title="동의관리" onBack={() => navigate(-1)} />

      <div className="px-4 py-4 space-y-4">
        <section className="bg-surface rounded-card shadow-card-soft overflow-hidden">
          <ConsentRow label="서비스 이용약관" value={consents.serviceTerms} disabled />
          <ConsentRow label="개인정보 처리방침" value={consents.privacyPolicy} disabled />
          <ConsentRow label="제3자 정보 제공" value={consents.thirdPartyData} disabled />
        </section>

        <section className="bg-surface rounded-card shadow-card-soft overflow-hidden">
          <ConsentRow label="마케팅 SMS 수신" value={consents.marketingSms} onToggle={() => toggle('marketingSms')} />
          <ConsentRow label="마케팅 이메일 수신" value={consents.marketingEmail} onToggle={() => toggle('marketingEmail')} />
          <ConsentRow label="마케팅 푸시 수신" value={consents.marketingPush} onToggle={() => toggle('marketingPush')} />
        </section>

        <Card padding="lg">
          <h3 className="text-body font-semibold mb-2">최근 변경일</h3>
          <p className="text-body text-content-secondary">
            {consents.updatedAt ? formatDateKo(consents.updatedAt) : '기록 없음'}
          </p>
        </Card>
      </div>
    </div>
  );
}

function ConsentRow({
  label,
  value,
  onToggle,
  disabled = false,
}: {
  label: string;
  value: boolean;
  onToggle?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-4 border-b last:border-b-0 border-line-light">
      <div className="flex-1">
        <p className="text-body font-medium">{label}</p>
        {disabled && <p className="text-caption text-content-tertiary mt-1">필수 동의 항목</p>}
      </div>
      <button
        onClick={onToggle}
        disabled={disabled}
        className={cn(
          'w-12 h-7 rounded-full relative transition-colors',
          value ? 'bg-primary' : 'bg-line',
          disabled && 'opacity-60 cursor-default'
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
