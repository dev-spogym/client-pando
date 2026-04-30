'use client';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Calendar,
  Check,
  CreditCard,
  MessageCircle,
  PencilLine,
  QrCode,
  Receipt,
  RotateCcw,
  User2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Badge,
  Button,
  Card,
  PageHeader,
} from '@/components/ui';
import {
  STATUS_LABEL,
  STATUS_TONE,
  cancelOrder,
  getOrder,
  isCancelable,
  isRefundable,
  type OrderItem,
} from '@/lib/orders';
import { useAuthStore } from '@/stores/authStore';
import { cn, formatCurrency, formatDateKo } from '@/lib/utils';

const PAYMENT_METHOD_LABEL: Record<OrderItem['paymentMethod'], string> = {
  CARD: '카드 결제',
  TRANSFER: '계좌이체',
  KAKAOPAY: '카카오페이',
  NAVERPAY: '네이버페이',
};

/** 주문 상세 + 상태 추적 */
export default function OrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { member } = useAuthStore();

  const [order, setOrder] = useState<OrderItem | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!member || !id) return;
    setOrder(getOrder(member.id, id));
    setHydrated(true);
  }, [member, id]);

  const currentStepIndex = useMemo(() => {
    if (!order) return -1;
    const index = order.timeline.findIndex((step) => step.status === order.status);
    if (index === -1) {
      // 이용 완료/취소/환불 케이스에서 마지막 인덱스
      return order.timeline.length - 1;
    }
    return index;
  }, [order]);

  if (!hydrated || !member) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <PageHeader title="주문 상세" showBack />
        <div className="text-center py-20 text-content-tertiary text-body-sm">불러오는 중...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <PageHeader title="주문 상세" showBack />
        <div className="px-4 py-12 text-center">
          <p className="text-h4 text-content">주문을 찾을 수 없어요</p>
          <p className="text-body-sm text-content-tertiary mt-2">삭제되었거나 잘못된 경로일 수 있습니다.</p>
          <Button variant="primary" onClick={() => navigate('/orders')} className="mt-6">
            주문 목록으로
          </Button>
        </div>
      </div>
    );
  }

  const handleCancel = () => {
    if (!window.confirm('주문을 취소할까요?')) return;
    cancelOrder(member.id, order.id);
    setOrder(getOrder(member.id, order.id));
    toast.success('주문이 취소되었습니다.');
  };

  return (
    <div className="min-h-screen bg-surface-secondary page-with-action">
      <PageHeader title="주문 상세" showBack />

      <div className="px-4 py-4 space-y-4">
        {/* 상품 카드 */}
        <Card variant="soft" padding="md">
          <div className="flex items-center justify-between mb-3">
            <Badge tone={STATUS_TONE[order.status]} size="md">
              {STATUS_LABEL[order.status]}
            </Badge>
            <span className="text-caption text-content-tertiary">{formatDateKo(order.paidAt)}</span>
          </div>
          <div className="flex gap-3">
            <div className="w-20 h-20 rounded-card overflow-hidden bg-surface-tertiary shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={order.thumbnailUrl} alt={order.productName} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-caption text-primary font-medium truncate">{order.centerName}</p>
              <p className="text-h4 text-content line-clamp-2 mt-0.5">
                {order.productName}
              </p>
              <p className="text-caption text-content-tertiary mt-1">{order.optionSummary}</p>
            </div>
          </div>
          {order.totalSessions !== null && order.remainingSessions !== null && (
            <div className="mt-3 bg-surface-secondary rounded-xl p-3">
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-content-secondary">잔여 회차</span>
                <span className="font-semibold">
                  {order.remainingSessions} / {order.totalSessions}회
                </span>
              </div>
              <div className="progress-bar mt-2">
                <div
                  className="progress-bar-fill bg-primary"
                  style={{
                    width: `${Math.round((order.remainingSessions / order.totalSessions) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </Card>

        {/* 상태 progress */}
        <Card variant="soft" padding="md">
          <h3 className="text-body font-semibold mb-3">진행 상태</h3>
          <ol className="relative">
            {order.timeline.map((step, idx) => {
              const completed = idx < currentStepIndex;
              const current = idx === currentStepIndex;
              const isLast = idx === order.timeline.length - 1;
              const isFailureStep = step.status === 'cancelled' || step.status === 'refunded';
              return (
                <li key={`${step.status}-${idx}`} className="flex gap-3 pb-5 last:pb-0 relative">
                  {!isLast && (
                    <span
                      aria-hidden
                      className={cn(
                        'absolute left-3 top-6 bottom-0 w-px',
                        completed ? 'bg-primary' : 'bg-line'
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-[1]',
                      isFailureStep
                        ? 'bg-state-error text-white'
                        : completed
                          ? 'bg-primary text-white'
                          : current
                            ? 'bg-primary text-white ring-4 ring-primary-light'
                            : 'bg-surface-tertiary text-content-tertiary'
                    )}
                  >
                    {completed || current ? <Check className="w-3.5 h-3.5" /> : <span className="w-1 h-1 rounded-full bg-current" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-body-sm font-semibold',
                        current ? 'text-primary' : 'text-content'
                      )}
                    >
                      {step.label}
                    </p>
                    <p className="text-caption text-content-tertiary mt-0.5">{step.description}</p>
                    {step.timestamp && (
                      <p className="text-micro text-content-tertiary mt-0.5">
                        {formatDateKo(step.timestamp)} {new Date(step.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>

        {/* 옵션 정보 */}
        <Card variant="soft" padding="md">
          <h3 className="text-body font-semibold mb-3">예약 정보</h3>
          <div className="space-y-2.5">
            {order.trainerName && (
              <DetailRow icon={<User2 className="w-4 h-4" />} label="강사" value={order.trainerName} />
            )}
            <DetailRow
              icon={<Calendar className="w-4 h-4" />}
              label="시작일"
              value={formatDateKo(order.startDate)}
            />
            <DetailRow
              icon={<Receipt className="w-4 h-4" />}
              label="옵션"
              value={order.optionSummary}
            />
          </div>
        </Card>

        {/* 결제 정보 */}
        <Card variant="soft" padding="md">
          <h3 className="text-body font-semibold mb-3">결제 정보</h3>
          <div className="space-y-2.5 text-body-sm">
            <Row label="결제 수단" value={PAYMENT_METHOD_LABEL[order.paymentMethod]} />
            {order.cardCompany && (
              <Row
                label="카드"
                value={order.cardLast4 ? `${order.cardCompany} **** ${order.cardLast4}` : order.cardCompany}
              />
            )}
            <Row label="결제일" value={formatDateKo(order.paidAt)} />
            <Row label="정가" value={formatCurrency(order.originalAmount)} />
            {order.originalAmount !== order.amount && (
              <Row
                label="할인"
                value={`-${formatCurrency(Math.max(0, order.originalAmount - order.amount))}`}
                tone="sale"
              />
            )}
            <div className="border-t border-line pt-2.5 mt-2.5">
              <div className="flex items-center justify-between">
                <span className="text-body font-semibold">최종 결제</span>
                <span className="text-h3 font-bold text-content">{formatCurrency(order.amount)}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              leftIcon={<Receipt className="w-3.5 h-3.5" />}
              onClick={() => {
                toast.message('영수증 화면을 준비 중입니다.');
              }}
            >
              영수증 보기
            </Button>
          </div>
        </Card>

        {/* 환불/취소 안내 */}
        {(isRefundable(order) || isCancelable(order)) && (
          <Card variant="outline" padding="md">
            <p className="text-body-sm text-content-secondary leading-relaxed">
              이용 시작 전에는 100% 환불, 이용 중에는 잔여 회차 또는 잔여 기간 비율로 환불됩니다.
            </p>
          </Card>
        )}
      </div>

      {/* 하단 액션 */}
      <div className="bottom-action-bar">
        <div className="flex gap-2 flex-wrap">
          {order.status === 'in_use' && (
            <>
              <Button variant="outline" size="lg" onClick={() => navigate('/messages')} className="flex-1" leftIcon={<MessageCircle className="w-4 h-4" />}>
                강사에게 톡
              </Button>
              <Button variant="primary" size="lg" onClick={() => navigate('/qr')} className="flex-1" leftIcon={<QrCode className="w-4 h-4" />}>
                QR 입장
              </Button>
            </>
          )}
          {order.status === 'confirmed' && (
            <>
              {isCancelable(order) && (
                <Button variant="outline" size="lg" onClick={handleCancel} className="flex-1" leftIcon={<X className="w-4 h-4" />}>
                  주문 취소
                </Button>
              )}
              <Button variant="primary" size="lg" onClick={() => navigate('/qr')} className="flex-1" leftIcon={<QrCode className="w-4 h-4" />}>
                QR 입장
              </Button>
            </>
          )}
          {order.status === 'pending' && isCancelable(order) && (
            <Button variant="danger" size="xl" fullWidth onClick={handleCancel} leftIcon={<X className="w-4 h-4" />}>
              주문 취소
            </Button>
          )}
          {order.status === 'completed' && (
            <>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  if (order.productId) navigate(`/checkout/${order.productId}/option`);
                  else navigate('/centers');
                }}
                className="flex-1"
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                재구매
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => toast.message('후기 작성 화면을 준비 중입니다.')}
                className="flex-1"
                leftIcon={<PencilLine className="w-4 h-4" />}
              >
                후기 작성
              </Button>
            </>
          )}
          {(order.status === 'cancelled' || order.status === 'refunded') && (
            <Button
              variant="primary"
              size="xl"
              fullWidth
              onClick={() => {
                if (order.productId) navigate(`/checkout/${order.productId}/option`);
                else navigate('/centers');
              }}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              다시 구매
            </Button>
          )}

          {/* 환불 신청 (별도) */}
          {isRefundable(order) && order.status !== 'pending' && (
            <Button
              variant="ghost"
              size="lg"
              fullWidth
              onClick={() => navigate(`/orders/${order.id}/refund`)}
              leftIcon={<CreditCard className="w-4 h-4" />}
              className="-mt-1"
            >
              환불 신청
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-8 h-8 rounded-full bg-primary-light text-primary inline-flex items-center justify-center shrink-0">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-caption text-content-tertiary">{label}</p>
        <p className="text-body-sm font-semibold text-content truncate">{value}</p>
      </div>
    </div>
  );
}

function Row({
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
      <span className={cn('font-medium', tone === 'sale' ? 'text-state-sale' : 'text-content')}>
        {value}
      </span>
    </div>
  );
}
