'use client';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import {
  Badge,
  Button,
  Card,
  PageHeader,
} from '@/components/ui';
import {
  REFUND_REASONS,
  estimateRefund,
  getOrder,
  isRefundable,
  refundOrder,
  type OrderItem,
  type RefundReason,
} from '@/lib/orders';
import { useAuthStore } from '@/stores/authStore';
import { cn, formatCurrency } from '@/lib/utils';

/** 환불 신청 */
export default function Refund() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { member } = useAuthStore();

  const [order, setOrder] = useState<OrderItem | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [reason, setReason] = useState<RefundReason>('change_of_mind');
  const [memo, setMemo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!member || !id) return;
    setOrder(getOrder(member.id, id));
    setHydrated(true);
  }, [member, id]);

  const estimate = useMemo(() => (order ? estimateRefund(order) : null), [order]);

  if (!hydrated || !member) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <PageHeader title="환불 신청" showBack />
        <div className="text-center py-20 text-content-tertiary text-body-sm">불러오는 중...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <PageHeader title="환불 신청" showBack />
        <div className="px-4 py-12 text-center">
          <p className="text-h4 text-content">주문을 찾을 수 없어요</p>
          <Button variant="primary" onClick={() => navigate('/orders')} className="mt-6">
            주문 목록으로
          </Button>
        </div>
      </div>
    );
  }

  if (!isRefundable(order)) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <PageHeader title="환불 신청" showBack />
        <div className="px-4 py-12 text-center">
          <p className="text-h4 text-content">환불할 수 없는 주문이에요</p>
          <p className="text-body-sm text-content-tertiary mt-2">
            현재 상태: {order.status === 'completed' ? '이용 완료' : order.status === 'cancelled' ? '취소' : '환불'}
          </p>
          <Button variant="primary" onClick={() => navigate(`/orders/${order.id}`)} className="mt-6">
            주문 상세로
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!estimate) return;
    if (reason === 'other' && !memo.trim()) {
      toast.error('기타 사유를 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    refundOrder(member.id, order.id, estimate.refundAmount);
    toast.success('환불 신청이 접수되었습니다.');
    setSubmitting(false);
    navigate(`/orders/${order.id}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface-secondary page-with-action">
      <PageHeader title="환불 신청" showBack />

      <div className="px-4 py-4 space-y-4">
        {/* 주문 요약 */}
        <Card variant="soft" padding="md">
          <p className="text-caption text-content-tertiary">환불 대상</p>
          <div className="flex gap-3 mt-2">
            <div className="w-16 h-16 rounded-card overflow-hidden bg-surface-tertiary shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={order.thumbnailUrl} alt={order.productName} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-caption text-primary font-medium truncate">{order.centerName}</p>
              <p className="text-body-sm font-semibold text-content line-clamp-2 mt-0.5">
                {order.productName}
              </p>
              <p className="text-body-sm font-bold mt-1">{formatCurrency(order.amount)}</p>
            </div>
          </div>
        </Card>

        {/* 환불 정책 */}
        <Card variant="outline" padding="md">
          <div className="flex gap-2">
            <AlertTriangle className="w-4 h-4 text-state-warning shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-body-sm font-semibold">환불 정책</p>
              <ul className="text-caption text-content-secondary mt-2 space-y-1">
                <li>· 이용 시작 전: 100% 환불</li>
                <li>· 이용 중 (회차제): 잔여 회차 비율로 환불</li>
                <li>· 이용 중 (기간제): 결제 후 7일 이내 100%, 30일 이내 70%, 30일 초과 30% 환불</li>
                <li>· 카드 결제: 카드사 정책에 따라 영업일 3~5일 내 자동 환불</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* 예상 환불 금액 */}
        {estimate && (
          <Card variant="soft" padding="md" className="bg-primary-light">
            <p className="text-caption text-primary font-medium">예상 환불 금액</p>
            <p className="text-display font-bold text-primary mt-1">
              {formatCurrency(estimate.refundAmount)}
            </p>
            <Badge tone="primary" size="md" className="mt-2">
              {Math.round(estimate.ratio * 100)}% 환불
            </Badge>
            <p className="text-caption text-content-secondary mt-2 leading-relaxed">{estimate.policy}</p>
          </Card>
        )}

        {/* 환불 사유 */}
        <Card variant="soft" padding="md">
          <h3 className="text-body font-semibold mb-3">환불 사유</h3>
          <div className="space-y-2">
            {REFUND_REASONS.map((r) => {
              const active = reason === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setReason(r.id)}
                  className={cn(
                    'w-full rounded-xl border p-3 text-left transition-colors',
                    active ? 'border-primary bg-primary-light' : 'border-line bg-surface'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-body-sm font-semibold">{r.label}</p>
                      <p className="text-caption text-content-tertiary mt-1">{r.description}</p>
                    </div>
                    <span
                      className={cn(
                        'w-5 h-5 rounded-full border-2 inline-flex items-center justify-center shrink-0',
                        active ? 'border-primary' : 'border-line-strong'
                      )}
                    >
                      {active && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* 추가 의견 */}
        <Card variant="soft" padding="md">
          <h3 className="text-body font-semibold mb-2">
            추가 의견
            {reason === 'other' && <span className="text-state-error ml-1">*</span>}
          </h3>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder={
              reason === 'other'
                ? '환불 사유를 자세히 적어주세요.'
                : '센터에 전달할 추가 의견을 입력하세요. (선택)'
            }
            className="w-full h-28 rounded-xl border border-line bg-surface-secondary px-4 py-3 text-body-sm outline-none resize-none"
            maxLength={500}
          />
          <p className="text-caption text-content-tertiary mt-1 text-right">{memo.length}/500</p>
        </Card>

        {/* 환불 계좌 */}
        <Card variant="soft" padding="md">
          <h3 className="text-body font-semibold mb-3">환불 수단</h3>
          {order.paymentMethod === 'CARD' ? (
            <div className="bg-surface-secondary rounded-xl p-3">
              <p className="text-body-sm font-medium">
                {order.cardCompany} **** {order.cardLast4}
              </p>
              <p className="text-caption text-content-tertiary mt-1">
                결제하신 카드로 자동 환불됩니다. (영업일 3~5일 소요)
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-caption text-content-tertiary mb-1.5">은행</p>
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-between rounded-input border border-line-strong bg-surface px-4 h-12 text-body"
                  onClick={() => toast.message('은행 선택은 후속 단계에서 제공됩니다.')}
                >
                  <span className="text-content-tertiary">은행을 선택하세요</span>
                  <ChevronDown className="w-4 h-4 text-content-tertiary" />
                </button>
              </div>
              <div>
                <p className="text-caption text-content-tertiary mb-1.5">계좌번호</p>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="'-' 없이 숫자만 입력"
                  className="w-full rounded-input border border-line-strong bg-surface px-4 h-12 text-body outline-none focus:border-primary"
                />
              </div>
              <div>
                <p className="text-caption text-content-tertiary mb-1.5">예금주</p>
                <input
                  type="text"
                  defaultValue={member.name}
                  className="w-full rounded-input border border-line-strong bg-surface px-4 h-12 text-body outline-none focus:border-primary"
                />
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="bottom-action-bar">
        <Button
          variant="danger"
          size="xl"
          fullWidth
          loading={submitting}
          onClick={handleSubmit}
        >
          {estimate ? `${formatCurrency(estimate.refundAmount)} 환불 신청` : '환불 신청'}
        </Button>
      </div>
    </div>
  );
}
