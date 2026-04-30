'use client';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Plus, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
} from '@/components/ui';
import {
  getPaymentMethods,
  removePaymentMethod,
  setDefaultPaymentMethod,
  updatePaymentMethod,
  type PaymentMethodKind,
  type SavedPaymentMethod,
} from '@/lib/orders';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

const KIND_LABEL: Record<PaymentMethodKind, string> = {
  card: '카드',
  kakaopay: '카카오페이',
  naverpay: '네이버페이',
};

const KIND_GRADIENT: Record<PaymentMethodKind, string> = {
  card: 'from-primary to-primary-deep',
  kakaopay: 'from-yellow-300 to-yellow-500',
  naverpay: 'from-green-400 to-green-600',
};

/** 결제수단 관리 */
export default function PaymentMethods() {
  const navigate = useNavigate();
  const { member } = useAuthStore();
  const [methods, setMethods] = useState<SavedPaymentMethod[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!member) return;
    setMethods(getPaymentMethods(member.id));
    setHydrated(true);
  }, [member]);

  const cards = useMemo(() => methods.filter((m) => m.kind === 'card'), [methods]);
  const pays = useMemo(() => methods.filter((m) => m.kind !== 'card'), [methods]);

  const handleSetDefault = (id: string) => {
    if (!member) return;
    const next = setDefaultPaymentMethod(member.id, id);
    setMethods(next);
    toast.success('기본 결제 수단으로 설정했어요.');
  };

  const handleRemove = (id: string) => {
    if (!member) return;
    if (!window.confirm('이 결제수단을 삭제할까요?')) return;
    const next = removePaymentMethod(member.id, id);
    setMethods(next);
    toast.success('결제수단을 삭제했어요.');
  };

  const handleToggleEnabled = (id: string, enabled: boolean) => {
    if (!member) return;
    const next = updatePaymentMethod(member.id, id, { enabled });
    setMethods(next);
  };

  if (!hydrated || !member) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <PageHeader title="결제수단" showBack />
        <div className="text-center py-20 text-content-tertiary text-body-sm">불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      <PageHeader title="결제수단" showBack />

      <div className="px-4 py-4 space-y-5">
        {/* 카드 섹션 */}
        <section>
          <header className="flex items-center justify-between mb-3">
            <h2 className="text-h4 text-content">등록된 카드</h2>
            <span className="text-caption text-content-tertiary">{cards.length}개</span>
          </header>

          {cards.length === 0 ? (
            <EmptyState
              size="sm"
              icon={<CreditCard className="w-6 h-6" />}
              title="등록된 카드가 없어요"
              description="자주 쓰는 카드를 등록해 보세요."
            />
          ) : (
            <div className="space-y-3">
              {cards.map((card) => (
                <Card key={card.id} variant="soft" padding="none" className="overflow-hidden">
                  <div
                    className={cn(
                      'p-4 text-white bg-gradient-to-br',
                      KIND_GRADIENT[card.kind]
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-caption text-white/80">{KIND_LABEL[card.kind]}</p>
                        <p className="text-body font-semibold mt-1">{card.company}</p>
                      </div>
                      {card.isDefault && (
                        <Badge tone="warning" size="sm" variant="solid">
                          기본
                        </Badge>
                      )}
                    </div>
                    <p className="text-h3 font-mono tracking-widest mt-6">**** **** **** {card.last4}</p>
                    {card.expiry && (
                      <p className="text-caption text-white/80 mt-2">유효기간 {card.expiry}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 bg-surface">
                    <button
                      type="button"
                      onClick={() => handleSetDefault(card.id)}
                      disabled={card.isDefault}
                      className={cn(
                        'inline-flex items-center gap-1.5 text-body-sm font-medium',
                        card.isDefault ? 'text-content-tertiary' : 'text-primary'
                      )}
                    >
                      <Star
                        className={cn(
                          'w-4 h-4',
                          card.isDefault && 'fill-state-warning text-state-warning'
                        )}
                      />
                      {card.isDefault ? '기본 결제' : '기본으로 설정'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(card.id)}
                      className="inline-flex items-center gap-1.5 text-body-sm text-state-error font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      삭제
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* 카드 추가 placeholder */}
          <button
            type="button"
            onClick={() => toast.message('카드 추가 기능을 준비 중이에요.')}
            className="mt-3 w-full rounded-card border-2 border-dashed border-line-strong bg-surface px-4 py-5 text-content-secondary inline-flex items-center justify-center gap-2 active:bg-surface-tertiary"
          >
            <Plus className="w-5 h-5" />
            <span className="text-body-sm font-medium">카드 추가</span>
          </button>
        </section>

        {/* 간편결제 섹션 */}
        <section>
          <header className="flex items-center justify-between mb-3">
            <h2 className="text-h4 text-content">간편결제</h2>
          </header>
          <div className="space-y-2">
            {pays.map((pay) => (
              <Card key={pay.id} variant="soft" padding="md">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'w-10 h-10 rounded-full inline-flex items-center justify-center text-white font-bold text-body-sm shrink-0 bg-gradient-to-br',
                      KIND_GRADIENT[pay.kind]
                    )}
                  >
                    {pay.kind === 'kakaopay' ? '카' : 'N'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm font-semibold">{pay.company}</p>
                    <p className="text-caption text-content-tertiary mt-0.5">
                      {pay.enabled ? '연결됨' : '연결 안됨'}
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={pay.enabled}
                    onChange={(v) => handleToggleEnabled(pay.id, v)}
                    ariaLabel={`${pay.company} 연결`}
                  />
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* 결제 내역 진입 */}
        <Button
          variant="ghost"
          size="lg"
          fullWidth
          onClick={() => navigate('/payments')}
        >
          결제 내역 보기
        </Button>
      </div>
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-11 h-6 rounded-full transition-colors shrink-0',
        checked ? 'bg-primary' : 'bg-line-strong'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-card-soft transition-transform',
          checked && 'translate-x-5'
        )}
      />
    </button>
  );
}
