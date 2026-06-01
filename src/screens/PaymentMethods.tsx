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
  setPaymentMethods,
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
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardCompany, setCardCompany] = useState('');
  const [cardLast4, setCardLast4] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!member) return;
    fetch(`/api/payment-methods?memberId=${member.id}`)
      .then(async (response) => {
        if (!response.ok) throw new Error('payment_methods_fetch_failed');
        const result = await response.json();
        setMethods(result.data?.length ? result.data.map(mapRemotePaymentMethod) : getPaymentMethods(member.id));
      })
      .catch(() => setMethods(getPaymentMethods(member.id)))
      .finally(() => setHydrated(true));
  }, [member]);

  const cards = useMemo(() => methods.filter((m) => m.kind === 'card'), [methods]);
  const pays = useMemo(() => methods.filter((m) => m.kind !== 'card'), [methods]);

  const handleSetDefault = async (id: string) => {
    if (!member) return;
    const next = setDefaultPaymentMethod(member.id, id);
    setMethods(next);
    await patchRemotePaymentMethod(member.id, id, { isDefault: true });
    toast.success('기본 결제 수단으로 설정했어요.');
  };

  const handleRemove = async (id: string) => {
    if (!member) return;
    if (!window.confirm('이 결제수단을 삭제할까요?')) return;
    const next = removePaymentMethod(member.id, id);
    setMethods(next);
    await deleteRemotePaymentMethod(member.id, id);
    toast.success('결제수단을 삭제했어요.');
  };

  const handleToggleEnabled = async (id: string, enabled: boolean) => {
    if (!member) return;
    const next = updatePaymentMethod(member.id, id, { enabled });
    setMethods(next);
    await patchRemotePaymentMethod(member.id, id, { enabled });
  };

  const handleAddCard = async () => {
    if (!member) return;
    const last4 = cardLast4.replace(/\D/g, '').slice(-4);
    if (!cardCompany.trim() || last4.length !== 4) {
      toast.error('카드사와 카드 끝 4자리를 입력해 주세요.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member.id,
          kind: 'card',
          company: cardCompany.trim(),
          last4,
          expiry: cardExpiry.trim() || null,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'payment_method_add_failed');

      setMethods((items) => [...items, mapRemotePaymentMethod(result.data)]);
      setCardCompany('');
      setCardLast4('');
      setCardExpiry('');
      setShowAddCard(false);
      toast.success('결제수단을 등록했어요.');
    } catch {
      const next: SavedPaymentMethod = {
        id: `pm-local-${Date.now()}`,
        kind: 'card',
        company: cardCompany.trim(),
        last4,
        expiry: cardExpiry.trim() || null,
        isDefault: methods.length === 0,
        enabled: true,
      };
      const updated = [...methods, next];
      setPaymentMethods(member.id, updated);
      setMethods(updated);
      setShowAddCard(false);
      toast.success('결제수단을 등록했어요.');
    } finally {
      setSaving(false);
    }
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

          {showAddCard && (
            <Card variant="soft" padding="md" className="mt-3">
              <div className="space-y-3">
                <input
                  value={cardCompany}
                  onChange={(event) => setCardCompany(event.target.value)}
                  placeholder="카드사 또는 카드명"
                  className="w-full rounded-input border border-line-strong bg-surface px-4 h-12 text-body outline-none focus:border-primary"
                />
                <input
                  value={cardLast4}
                  onChange={(event) => setCardLast4(event.target.value.replace(/\D/g, '').slice(0, 4))}
                  inputMode="numeric"
                  placeholder="카드 끝 4자리"
                  className="w-full rounded-input border border-line-strong bg-surface px-4 h-12 text-body outline-none focus:border-primary"
                />
                <input
                  value={cardExpiry}
                  onChange={(event) => setCardExpiry(event.target.value.slice(0, 5))}
                  placeholder="유효기간 MM/YY"
                  className="w-full rounded-input border border-line-strong bg-surface px-4 h-12 text-body outline-none focus:border-primary"
                />
                <div className="flex gap-2">
                  <Button variant="outline" fullWidth onClick={() => setShowAddCard(false)}>
                    취소
                  </Button>
                  <Button variant="primary" fullWidth loading={saving} onClick={handleAddCard}>
                    등록
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <button
            type="button"
            onClick={() => setShowAddCard(true)}
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

function mapRemotePaymentMethod(item: SavedPaymentMethod & { id: number | string }): SavedPaymentMethod {
  return {
    ...item,
    id: String(item.id),
  };
}

async function patchRemotePaymentMethod(memberId: number, id: string, patch: Record<string, unknown>) {
  if (!/^\d+$/.test(id)) return;
  await fetch('/api/payment-methods', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberId, id: Number(id), ...patch }),
  }).catch(() => undefined);
}

async function deleteRemotePaymentMethod(memberId: number, id: string) {
  if (!/^\d+$/.test(id)) return;
  await fetch('/api/payment-methods', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberId, id: Number(id) }),
  }).catch(() => undefined);
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
