'use client';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Tag as TagIcon, Ticket, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
} from '@/components/ui';
import {
  AVAILABLE_COUPONS,
  type CartCoupon,
  type CartItem,
  createOrderFromCart,
  getCart,
  pickBestCoupon,
  setCart,
} from '@/lib/orders';
import { useAuthStore } from '@/stores/authStore';
import { cn, formatCurrency } from '@/lib/utils';

/** 장바구니 (다중 결제) */
export default function Cart() {
  const navigate = useNavigate();
  const { member } = useAuthStore();

  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<CartCoupon | null>(null);
  const [mileageUsed, setMileageUsed] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!member) return;
    const list = getCart(member.id);
    setItems(list);
    setHydrated(true);
  }, [member]);

  const persist = (next: CartItem[]) => {
    if (!member) return;
    setItems(next);
    setCart(member.id, next);
  };

  const selectedItems = useMemo(() => items.filter((it) => it.selected), [items]);
  const allSelected = items.length > 0 && selectedItems.length === items.length;
  const subtotal = useMemo(
    () => selectedItems.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0),
    [selectedItems]
  );
  const originalSubtotal = useMemo(
    () => selectedItems.reduce((sum, it) => sum + it.originalPrice * it.quantity, 0),
    [selectedItems]
  );
  const productDiscount = Math.max(0, originalSubtotal - subtotal);

  // 추천 쿠폰 자동 선택
  useEffect(() => {
    if (!hydrated) return;
    if (subtotal === 0) {
      setCoupon(null);
      return;
    }
    const best = pickBestCoupon(subtotal);
    setCoupon((current) => {
      if (current && subtotal >= current.minAmount) return current;
      return best;
    });
  }, [subtotal, hydrated]);

  const couponDiscount = coupon ? Math.min(coupon.discount, subtotal) : 0;
  const maxMileage = useMemo(() => {
    if (!member) return 0;
    const remaining = Math.max(0, subtotal - couponDiscount);
    return Math.min(member.mileage, Math.floor(remaining / 1000) * 1000);
  }, [member, subtotal, couponDiscount]);

  // mileage 보정
  useEffect(() => {
    if (mileageUsed > maxMileage) setMileageUsed(maxMileage);
  }, [maxMileage, mileageUsed]);

  const finalAmount = Math.max(0, subtotal - couponDiscount - mileageUsed);

  const handleToggleItem = (id: string) => {
    persist(items.map((it) => (it.id === id ? { ...it, selected: !it.selected } : it)));
  };

  const handleToggleAll = () => {
    const next = !allSelected;
    persist(items.map((it) => ({ ...it, selected: next })));
  };

  const handleQty = (id: string, delta: number) => {
    persist(
      items.map((it) =>
        it.id === id ? { ...it, quantity: Math.max(1, Math.min(99, it.quantity + delta)) } : it
      )
    );
  };

  const handleRemove = (id: string) => {
    persist(items.filter((it) => it.id !== id));
    toast.success('상품을 장바구니에서 제거했어요.');
  };

  const handleClear = () => {
    if (items.length === 0) return;
    if (!window.confirm('장바구니의 모든 상품을 비울까요?')) return;
    persist([]);
    toast.success('장바구니를 비웠어요.');
  };

  const handlePay = () => {
    if (!member) {
      toast.error('로그인이 필요합니다.');
      return;
    }
    if (selectedItems.length === 0) {
      toast.error('결제할 상품을 선택해 주세요.');
      return;
    }

    const created = createOrderFromCart(member.id, {
      items: selectedItems,
      paymentMethod: 'CARD',
      cardLast4: '1234',
      cardCompany: '현대카드',
      couponDiscount,
      mileageUsed,
    });

    // 결제된 항목 제거
    const remaining = items.filter((it) => !selectedItems.find((sel) => sel.id === it.id));
    persist(remaining);

    toast.success(`${created.length}건 결제가 완료되었습니다.`);
    if (created[0]) {
      navigate(`/orders/${created[0].id}`);
    } else {
      navigate('/orders');
    }
  };

  if (!hydrated || !member) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <PageHeader title="장바구니" showBack />
        <div className="text-center py-20 text-content-tertiary text-body-sm">불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-secondary page-with-action">
      <PageHeader
        title="장바구니"
        showBack
        rightSlot={
          items.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="text-body-sm text-content-secondary px-2"
            >
              전체삭제
            </button>
          )
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="장바구니가 비어있어요"
          description="관심 있는 상품을 담아 한 번에 결제할 수 있어요."
          action={
            <Button variant="primary" onClick={() => navigate('/centers')}>
              둘러보기
            </Button>
          }
          size="lg"
        />
      ) : (
        <div className="px-4 py-4 space-y-3">
          {/* 전체 선택 */}
          <div className="flex items-center justify-between bg-surface rounded-card px-4 py-3 shadow-card-soft">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleToggleAll}
                className="w-4 h-4 accent-primary"
                aria-label="전체 선택"
              />
              <span className="text-body-sm font-medium">
                전체 선택 ({selectedItems.length}/{items.length})
              </span>
            </label>
          </div>

          {/* 카트 아이템 */}
          {items.map((item) => (
            <Card key={item.id} variant="soft" padding="none" className="overflow-hidden">
              <div className="flex p-3 gap-3">
                <input
                  type="checkbox"
                  checked={item.selected}
                  onChange={() => handleToggleItem(item.id)}
                  className="w-4 h-4 accent-primary mt-1.5 shrink-0"
                  aria-label={`${item.productName} 선택`}
                />
                <div className="w-20 h-20 rounded-card overflow-hidden bg-surface-tertiary shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.thumbnailUrl} alt={item.productName} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-caption text-primary font-medium truncate">{item.centerName}</p>
                      <p className="text-body-sm font-semibold text-content line-clamp-2 mt-0.5">
                        {item.productName}
                      </p>
                      {item.optionSummary && (
                        <p className="text-caption text-content-tertiary mt-1 line-clamp-1">
                          {item.optionSummary}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      aria-label="삭제"
                      className="text-content-tertiary p-1 -mr-1 -mt-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-end justify-between mt-2">
                    <div className="inline-flex items-center rounded-pill border border-line">
                      <button
                        type="button"
                        onClick={() => handleQty(item.id, -1)}
                        disabled={item.quantity <= 1}
                        aria-label="수량 감소"
                        className="w-7 h-7 inline-flex items-center justify-center text-content-secondary disabled:opacity-30"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-body-sm font-semibold w-7 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleQty(item.id, 1)}
                        aria-label="수량 증가"
                        className="w-7 h-7 inline-flex items-center justify-center text-content-secondary"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-body font-bold text-content">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* 쿠폰 */}
          <Card variant="soft" padding="md">
            <h3 className="text-body font-semibold inline-flex items-center gap-2">
              <Ticket className="w-4 h-4 text-primary" />쿠폰
            </h3>
            <div className="space-y-2 mt-3">
              {AVAILABLE_COUPONS.map((c) => {
                const eligible = subtotal >= c.minAmount;
                const active = coupon?.id === c.id && eligible;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      if (!eligible) {
                        toast.error(`${formatCurrency(c.minAmount)} 이상 결제 시 사용 가능해요.`);
                        return;
                      }
                      setCoupon(active ? null : c);
                    }}
                    disabled={!eligible}
                    className={cn(
                      'w-full rounded-xl border p-3 text-left transition-colors',
                      active
                        ? 'border-primary bg-primary-light'
                        : eligible
                          ? 'border-line bg-surface'
                          : 'border-line bg-surface-secondary opacity-60'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-body-sm font-semibold text-content">{c.name}</p>
                      <span className="text-body-sm font-bold text-state-sale">
                        -{formatCurrency(c.discount)}
                      </span>
                    </div>
                    <p className="text-caption text-content-tertiary mt-1">
                      {formatCurrency(c.minAmount)} 이상 결제 시 사용 가능
                    </p>
                    {active && (
                      <Badge tone="primary" size="sm" className="mt-2">
                        적용중
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* 마일리지 */}
          <Card variant="soft" padding="md">
            <h3 className="text-body font-semibold inline-flex items-center gap-2">
              <TagIcon className="w-4 h-4 text-primary" />마일리지 사용
            </h3>
            <div className="bg-surface-secondary rounded-xl p-3 mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-caption text-content-secondary">보유</span>
                <span className="font-semibold text-body-sm">{member.mileage.toLocaleString()}P</span>
              </div>
              <input
                type="range"
                min={0}
                max={maxMileage}
                step={1000}
                value={mileageUsed}
                onChange={(e) => setMileageUsed(Number(e.target.value))}
                disabled={maxMileage === 0}
                className="w-full accent-primary"
                aria-label="마일리지 사용"
              />
              <div className="flex items-center justify-between mt-2 text-body-sm">
                <span className="text-content-secondary">사용</span>
                <span className="font-semibold text-primary">{mileageUsed.toLocaleString()}P</span>
              </div>
            </div>
          </Card>

          {/* 가격 요약 */}
          <Card variant="soft" padding="md">
            <h3 className="text-body font-semibold mb-3">결제 금액</h3>
            <div className="space-y-2 text-body-sm">
              <PriceRow label="상품 합계" value={formatCurrency(originalSubtotal)} />
              {productDiscount > 0 && (
                <PriceRow
                  label="상품 할인"
                  value={`-${formatCurrency(productDiscount)}`}
                  tone="sale"
                />
              )}
              {couponDiscount > 0 && (
                <PriceRow label="쿠폰 할인" value={`-${formatCurrency(couponDiscount)}`} tone="sale" />
              )}
              {mileageUsed > 0 && (
                <PriceRow label="마일리지" value={`-${formatCurrency(mileageUsed)}`} tone="sale" />
              )}
              <div className="border-t border-line pt-3 mt-3 flex items-center justify-between">
                <span className="text-body font-semibold">최종 결제</span>
                <span className="text-h2 font-bold text-content">{formatCurrency(finalAmount)}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {items.length > 0 && (
        <div className="bottom-action-bar">
          <Button
            variant="primary"
            size="xl"
            fullWidth
            disabled={selectedItems.length === 0}
            onClick={handlePay}
          >
            결제하기 ({selectedItems.length}개 항목 · {formatCurrency(finalAmount)})
          </Button>
        </div>
      )}
    </div>
  );
}

function PriceRow({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'sale';
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-content-secondary">{label}</span>
      <span
        className={cn(
          'font-medium',
          tone === 'sale' ? 'text-state-sale' : 'text-content'
        )}
      >
        {value}
      </span>
    </div>
  );
}
