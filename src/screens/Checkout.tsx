import { Check, CreditCard, Tag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import {
  createMockPayment,
  getPaymentMethodOptions,
  getShopProduct,
  type PaymentMethod,
  type ProductCategory,
} from '@/lib/memberExperience';
import { AVAILABLE_COUPONS, type CartCoupon } from '@/lib/orders';
import { isPreviewMode } from '@/lib/preview';
import { cn, formatCurrency } from '@/lib/utils';
import { Button, Card, PageHeader } from '@/components/ui';

/** 결제하기 */
export default function Checkout() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId?: string }>();
  const [searchParams] = useSearchParams();
  const { member } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
  const [mileageUsed, setMileageUsed] = useState(0);
  // MA-142: 쿠폰 1장 선택 상태 (null = 선택 없음)
  const [selectedCoupon, setSelectedCoupon] = useState<CartCoupon | null>(null);
  const [memo, setMemo] = useState('');
  const [agree, setAgree] = useState(false);
  const [paying, setPaying] = useState(false);

  const presetProduct = productId ? getShopProduct(productId) : null;

  const order = useMemo(() => {
    if (presetProduct) {
      return {
        productId: presetProduct.id,
        productName: presetProduct.name,
        category: presetProduct.category,
        price: presetProduct.price,
        originalPrice: presetProduct.originalPrice,
        subtitle: presetProduct.subtitle,
      };
    }

    const amount = Number(searchParams.get('price') || 0);
    return {
      productId: null,
      productName: searchParams.get('name') || '개인 결제',
      category: (searchParams.get('category') as ProductCategory) || 'renewal',
      price: amount,
      originalPrice: amount,
      subtitle: searchParams.get('subtitle') || '개인 결제 페이지에서 생성된 결제 항목',
    };
  }, [presetProduct, searchParams]);

  useEffect(() => {
    const method = searchParams.get('method');
    if (method === 'CARD' || method === 'TRANSFER' || method === 'NAVERPAY' || method === 'KAKAOPAY') {
      setPaymentMethod(method);
    } else {
      setPaymentMethod('CARD');
    }

    const mileageLimit = member
      ? Math.min(member.mileage, Math.floor(order.price / 1000) * 1000)
      : 0;
    const nextMileage = Number(searchParams.get('mileage') || '0');
    if (!Number.isNaN(nextMileage)) {
      setMileageUsed(Math.min(mileageLimit, Math.max(0, nextMileage)));
    } else {
      setMileageUsed(0);
    }

    setAgree(searchParams.get('agree') === '1');
  }, [member, order.price, searchParams]);

  if (!member || !order.productName) return null;

  const methods = getPaymentMethodOptions();
  const maxMileage = Math.min(member.mileage, Math.floor(order.price / 1000) * 1000);
  // 쿠폰 할인 금액 (미선택 시 0)
  const couponDiscount = selectedCoupon ? selectedCoupon.discount : 0;
  // 상품금액 - 쿠폰할인 - 마일리지 = 최종 결제금액 (음수 방지)
  const totalPrice = Math.max(0, order.price - couponDiscount - mileageUsed);

  const handlePay = async () => {
    if (!agree) {
      toast.error('결제 진행 동의가 필요합니다.');
      return;
    }

    setPaying(true);
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member.id,
          branchId: member.branchId,
          productId: order.productId,
          productName: order.productName,
          category: order.category,
          amount: totalPrice,
          originalAmount: order.price,
          mileageUsed,
          // MA-142: 적용 쿠폰 정보
          couponId: selectedCoupon?.id ?? null,
          couponDiscount,
          paymentMethod,
          cardCompany: paymentMethod === 'CARD' ? '앱 카드' : paymentMethod === 'NAVERPAY' ? '네이버페이' : paymentMethod === 'KAKAOPAY' ? '카카오페이' : null,
          receiptTitle: order.productName,
          orderMemo: memo || null,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? 'payment_failed');
      }

      toast.success('결제가 완료되었습니다.');
      navigate(`/payments/${result.data.id}`, { replace: true });
    } catch {
      // preview(데모) 모드에서만 mock 결제를 생성해 완료 화면 흐름을 보여준다.
      if (isPreviewMode()) {
        const payment = createMockPayment(member.id, {
          productId: order.productId,
          productName: order.productName,
          category: order.category,
          amount: totalPrice,
          originalAmount: order.price,
          // MA-142: 쿠폰 할인은 totalPrice(amount)에 이미 반영됨. 마일리지와 합산.
          mileageUsed,
          paymentMethod,
          cardCompany: paymentMethod === 'CARD' ? '앱 카드' : paymentMethod === 'NAVERPAY' ? '네이버페이' : paymentMethod === 'KAKAOPAY' ? '카카오페이' : null,
          receiptTitle: order.productName,
          orderMemo: memo || null,
        });

        toast.success('결제가 완료되었습니다.');
        navigate(`/payments/${payment.id}`, { replace: true });
        return;
      }

      // 실서비스: 결제 실패는 완료로 처리하지 않고 실패 화면으로 분기한다.
      toast.error('결제에 실패했습니다. 다시 시도해주세요.');
      navigate('/checkout/failure', { replace: true });
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-secondary page-with-action">
      <PageHeader title="결제하기" showBack />

      <div className="px-4 py-4 space-y-4 pb-36">
        <Card variant="soft" padding="lg">
          <p className="text-caption text-content-tertiary">주문 상품</p>
          <h2 className="text-h3 text-content mt-1">{order.productName}</h2>
          <p className="text-body-sm text-content-secondary mt-2">{order.subtitle}</p>
          <div className="mt-4 flex items-end gap-2">
            <span className="text-display font-bold">{formatCurrency(order.price)}</span>
            {order.originalPrice !== order.price && (
              <span className="text-body-sm text-content-tertiary line-through">{formatCurrency(order.originalPrice)}</span>
            )}
          </div>
        </Card>

        <Card variant="soft" padding="lg">
          <h3 className="text-body font-semibold mb-3">구매자 정보</h3>
          <div className="space-y-2 text-body-sm">
            <InfoRow label="이름" value={member.name} />
            <InfoRow label="연락처" value={member.phone} />
            <InfoRow label="회원 상태" value={member.membershipType || '일반 회원'} />
          </div>
        </Card>

        {/* MA-142: 쿠폰 선택 섹션 */}
        <Card variant="soft" padding="lg">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-primary" />
            <h3 className="text-body font-semibold">쿠폰 선택</h3>
          </div>
          <p className="text-caption text-content-tertiary mb-3">쿠폰은 1장만 적용됩니다.</p>
          <div className="space-y-2">
            {AVAILABLE_COUPONS.map((coupon) => {
              const isEligible = order.price >= coupon.minAmount;
              const isSelected = selectedCoupon?.id === coupon.id;
              return (
                <button
                  key={coupon.id}
                  disabled={!isEligible}
                  onClick={() => setSelectedCoupon(isSelected ? null : coupon)}
                  className={cn(
                    'w-full rounded-xl border p-4 text-left transition-colors',
                    isEligible
                      ? isSelected
                        ? 'border-primary bg-primary-light'
                        : 'border-line bg-surface hover:border-primary/50'
                      : 'border-line bg-surface-secondary opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-body-sm font-semibold">{coupon.name}</p>
                      {!isEligible && (
                        <p className="text-caption text-state-warning mt-0.5">
                          최소 {formatCurrency(coupon.minAmount)} 이상 결제 시 사용 가능
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn('text-body-sm font-bold', isEligible ? 'text-primary' : 'text-content-tertiary')}>
                        -{formatCurrency(coupon.discount)}
                      </span>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card variant="soft" padding="lg">
          <h3 className="text-body font-semibold mb-3">마일리지 사용</h3>
          <div className="bg-surface-secondary rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-body-sm text-content-secondary">보유 마일리지</span>
              <span className="font-semibold">{member.mileage.toLocaleString()}P</span>
            </div>
            <input
              type="range"
              min={0}
              max={maxMileage}
              step={1000}
              value={mileageUsed}
              onChange={(event) => setMileageUsed(Number(event.target.value))}
              className="w-full accent-primary"
            />
            <div className="mt-3 flex items-center justify-between text-body-sm">
              <span className="text-content-secondary">사용할 마일리지</span>
              <span className="font-semibold text-primary">{mileageUsed.toLocaleString()}P</span>
            </div>
            <p className="text-caption text-content-tertiary mt-2">마일리지 사용액은 결제 원장에 함께 기록됩니다.</p>
          </div>
        </Card>

        <Card variant="soft" padding="lg">
          <h3 className="text-body font-semibold mb-3">결제 수단</h3>
          <div className="space-y-2">
            {methods.map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={cn(
                  'w-full rounded-xl border p-4 text-left transition-colors',
                  paymentMethod === method.id ? 'border-primary bg-primary-light' : 'border-line bg-surface'
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-body-sm font-semibold">{method.label}</p>
                    <p className="text-caption text-content-secondary mt-1">{method.description}</p>
                  </div>
                  {paymentMethod === method.id && (
                    <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {paymentMethod === 'TRANSFER' && (
            <div className="mt-4 bg-state-warning/10 rounded-xl p-4">
              <p className="text-body-sm font-semibold text-state-warning">계좌이체 안내</p>
              <p className="text-body-sm text-content-secondary mt-2">국민은행 123-456-789012 / 예금주 FitGenie</p>
            </div>
          )}
        </Card>

        <Card variant="soft" padding="lg">
          <h3 className="text-body font-semibold mb-3">주문 메모</h3>
          <textarea
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            placeholder="결제 메모 또는 요청사항을 입력하세요."
            className="w-full h-24 rounded-xl border border-line bg-surface-secondary px-4 py-3 text-body-sm outline-none resize-none"
          />
        </Card>

        <label className="bg-surface rounded-card p-4 shadow-card-soft flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agree}
            onChange={(event) => setAgree(event.target.checked)}
            className="mt-1 w-4 h-4 accent-primary"
          />
          <div>
            <p className="text-body-sm font-medium">결제 진행 및 환불 정책에 동의합니다.</p>
            <p className="text-caption text-content-tertiary mt-1">결제 완료 후 CRM 내부 승인번호와 영수증이 생성됩니다.</p>
          </div>
        </label>
      </div>

      <div className="bottom-action-bar">
        <div className="max-w-lg mx-auto space-y-3">
          {/* 결제 요약: 상품금액 - 쿠폰할인 - 마일리지 = 최종 결제금액 */}
          <div className="space-y-1.5 text-body-sm">
            <div className="flex items-center justify-between">
              <span className="text-content-secondary">상품 금액</span>
              <span>{formatCurrency(order.price)}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex items-center justify-between text-primary">
                <span>쿠폰 할인</span>
                <span>-{formatCurrency(couponDiscount)}</span>
              </div>
            )}
            {mileageUsed > 0 && (
              <div className="flex items-center justify-between text-primary">
                <span>마일리지 사용</span>
                <span>-{mileageUsed.toLocaleString()}P</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-1 border-t border-line">
              <span className="text-content-secondary font-medium">최종 결제 금액</span>
              <span className="text-h3 font-bold">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
          <Button
            variant="primary"
            size="xl"
            fullWidth
            leftIcon={<CreditCard className="w-4 h-4" />}
            loading={paying}
            disabled={paying}
            onClick={handlePay}
          >
            {methods.find((item) => item.id === paymentMethod)?.label}로 결제
          </Button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-content-secondary">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
