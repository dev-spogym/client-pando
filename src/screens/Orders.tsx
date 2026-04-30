'use client';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, MessageCircle, Package, PencilLine, QrCode, RotateCcw, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  PageHeader,
} from '@/components/ui';
import {
  STATUS_LABEL,
  STATUS_TONE,
  cancelOrder,
  getOrders,
  isCancelable,
  type OrderItem,
  type OrderStatus,
  type OrderTabFilter,
} from '@/lib/orders';
import { useAuthStore } from '@/stores/authStore';
import { formatCurrency, formatDateKo } from '@/lib/utils';

const TABS: { id: OrderTabFilter; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'in_progress', label: '진행중' },
  { id: 'completed', label: '완료' },
  { id: 'cancelled', label: '취소' },
];

const TAB_STATUSES: Record<OrderTabFilter, OrderStatus[]> = {
  all: ['pending', 'confirmed', 'in_use', 'completed', 'cancelled', 'refunded'],
  in_progress: ['pending', 'confirmed', 'in_use'],
  completed: ['completed'],
  cancelled: ['cancelled', 'refunded'],
};

/** 주문/예약 통합 내역 */
export default function Orders() {
  const navigate = useNavigate();
  const { member } = useAuthStore();

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [tab, setTab] = useState<OrderTabFilter>('all');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!member) return;
    setOrders(getOrders(member.id));
    setHydrated(true);
  }, [member]);

  const filtered = useMemo(() => {
    const allowed = new Set(TAB_STATUSES[tab]);
    return orders
      .filter((o) => allowed.has(o.status))
      .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
  }, [orders, tab]);

  const handleCancel = (orderId: string) => {
    if (!member) return;
    if (!window.confirm('주문을 취소할까요? 취소 후 복구할 수 없습니다.')) return;
    cancelOrder(member.id, orderId);
    setOrders(getOrders(member.id));
    toast.success('주문이 취소되었습니다.');
  };

  if (!hydrated || !member) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <PageHeader title="내 주문/예약" showBack />
        <div className="text-center py-20 text-content-tertiary text-body-sm">불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      <PageHeader title="내 주문/예약" showBack />

      <div className="px-4 pt-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <Chip key={t.id} active={tab === t.id} size="md" onClick={() => setTab(t.id)}>
              {t.label}
            </Chip>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package className="w-8 h-8" />}
          title="아직 주문이 없어요"
          description="센터를 둘러보고 첫 주문을 시작해 보세요."
          action={
            <Button variant="primary" onClick={() => navigate('/centers')}>
              둘러보기
            </Button>
          }
          size="lg"
        />
      ) : (
        <div className="px-4 py-4 space-y-3">
          {filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => navigate(`/orders/${order.id}`)}
              onCancel={() => handleCancel(order.id)}
              onWriteReview={() => navigate(`/orders/${order.id}`)}
              onRebuy={() => {
                if (order.productId) {
                  navigate(`/checkout/${order.productId}/option`);
                } else {
                  navigate('/centers');
                }
              }}
              onQr={() => navigate('/qr')}
              onMessage={() => navigate('/messages')}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface OrderCardProps {
  order: OrderItem;
  onClick: () => void;
  onCancel: () => void;
  onWriteReview: () => void;
  onRebuy: () => void;
  onQr: () => void;
  onMessage: () => void;
}

function OrderCard({
  order,
  onClick,
  onCancel,
  onWriteReview,
  onRebuy,
  onQr,
  onMessage,
}: OrderCardProps) {
  return (
    <Card variant="soft" padding="none" className="overflow-hidden">
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left p-4 active:bg-surface-tertiary transition-colors"
      >
        <div className="flex items-center justify-between mb-2">
          <Badge tone={STATUS_TONE[order.status]} size="md">
            {STATUS_LABEL[order.status]}
          </Badge>
          <span className="text-caption text-content-tertiary">{formatDateKo(order.paidAt)} 결제</span>
        </div>
        <div className="flex gap-3">
          <div className="w-16 h-16 rounded-card overflow-hidden bg-surface-tertiary shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={order.thumbnailUrl} alt={order.productName} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-caption text-primary font-medium truncate">{order.centerName}</p>
            <p className="text-body-sm font-semibold text-content line-clamp-2 mt-0.5">
              {order.productName}
            </p>
            <p className="text-caption text-content-tertiary mt-1 line-clamp-1">{order.optionSummary}</p>
            <p className="text-body-sm font-bold mt-1">{formatCurrency(order.amount)}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-content-tertiary self-center" />
        </div>
      </button>

      {/* Quick action */}
      <div className="px-4 pb-4 flex gap-2 flex-wrap">
        {order.status === 'in_use' && (
          <>
            <Button variant="primary" size="sm" leftIcon={<QrCode className="w-3.5 h-3.5" />} onClick={onQr}>
              QR 입장
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<MessageCircle className="w-3.5 h-3.5" />}
              onClick={onMessage}
            >
              강사에게 톡
            </Button>
          </>
        )}
        {order.status === 'confirmed' && (
          <>
            <Button variant="primary" size="sm" leftIcon={<QrCode className="w-3.5 h-3.5" />} onClick={onQr}>
              QR 입장
            </Button>
            {isCancelable(order) && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<X className="w-3.5 h-3.5" />}
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel();
                }}
              >
                주문 취소
              </Button>
            )}
          </>
        )}
        {order.status === 'pending' && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<X className="w-3.5 h-3.5" />}
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
          >
            주문 취소
          </Button>
        )}
        {order.status === 'completed' && (
          <>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PencilLine className="w-3.5 h-3.5" />}
              onClick={onWriteReview}
            >
              {order.reviewWritten ? '내 후기' : '후기 작성'}
            </Button>
            <Button variant="outline" size="sm" leftIcon={<RotateCcw className="w-3.5 h-3.5" />} onClick={onRebuy}>
              재구매
            </Button>
          </>
        )}
        {(order.status === 'cancelled' || order.status === 'refunded') && (
          <Button variant="outline" size="sm" leftIcon={<RotateCcw className="w-3.5 h-3.5" />} onClick={onRebuy}>
            다시 구매
          </Button>
        )}
      </div>
    </Card>
  );
}
