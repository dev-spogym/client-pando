import { Check, CreditCard } from 'lucide-react';
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
  const [memo, setMemo] = useState('');
  const [agree, setAgree] = useState(false);

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
  const totalPrice = Math.max(0, order.price - mileageUsed);

  const handlePay = () => {
    if (!agree) {
      toast.error('결제 진행 동의가 필요합니다.');
      return;
    }

    const payment = createMockPayment(member.id, {
      productId: order.productId,
      productName: order.productName,
      category: order.category,
      amount: totalPrice,
      originalAmount: order.price,
      mileageUsed,
      paymentMethod,
      cardCompany: paymentMethod === 'CARD' ? '현대카드' : paymentMethod === 'NAVERPAY' ? '네이버페이' : paymentMethod === 'KAKAOPAY' ? '카카오페이' : null,
      receiptTitle: order.productName,
      orderMemo: memo || null,
    });

    toast.success('결제가 완료되었습니다.');
    navigate(`/payments/${payment.id}`, { replace: true });
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
            <p className="text-caption text-content-tertiary mt-2">퍼블리싱 기준으로 적용되며 실제 정산 연동은 후속입니다.</p>
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
            <p className="text-caption text-content-tertiary mt-1">실제 결제 연동 전 단계의 퍼블리싱 화면입니다.</p>
          </div>
        </label>
      </div>

      <div className="bottom-action-bar">
        <div className="max-w-lg mx-auto space-y-3">
          <div className="flex items-center justify-between text-body-sm">
            <span className="text-content-secondary">최종 결제 금액</span>
            <span className="text-h3 font-bold">{formatCurrency(totalPrice)}</span>
          </div>
          <Button
            variant="primary"
            size="xl"
            fullWidth
            leftIcon={<CreditCard className="w-4 h-4" />}
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
