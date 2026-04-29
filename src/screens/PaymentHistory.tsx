import { useEffect, useMemo, useState } from 'react';
import { CreditCard, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { getMockPayments, type MockPaymentRecord } from '@/lib/memberExperience';
import { cn, formatCurrency, formatDateKo } from '@/lib/utils';
import { Button, Card, PageHeader, Badge, EmptyState } from '@/components/ui';

interface SaleRecord {
  id: number;
  productName: string | null;
  type: string;
  amount: number;
  paymentMethod: string;
  status: string;
  saleDate: string;
  cardCompany: string | null;
}

type PaymentItem =
  | (SaleRecord & { source: 'supabase'; receiptId: string | null })
  | {
      id: string;
      productName: string;
      type: string;
      amount: number;
      paymentMethod: string;
      status: string;
      saleDate: string;
      cardCompany: string | null;
      source: 'mock';
      receiptId: string;
    };

/** 결제 내역 */
export default function PaymentHistory() {
  const navigate = useNavigate();
  const { member } = useAuthStore();
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [mockPayments, setMockPayments] = useState<MockPaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!member) return;
    fetchSales();
    setMockPayments(getMockPayments(member.id));
  }, [member]);

  const fetchSales = async () => {
    if (!member) return;
    setLoading(true);

    const { data } = await supabase
      .from('sales')
      .select('id, productName, type, amount, paymentMethod, status, saleDate, cardCompany')
      .eq('memberId', member.id)
      .order('saleDate', { ascending: false })
      .limit(50);

    setSales(data || []);
    setLoading(false);
  };

  const payments = useMemo<PaymentItem[]>(() => {
    const remote = sales.map((sale) => ({
      ...sale,
      source: 'supabase' as const,
      receiptId: null,
    }));

    const local = mockPayments.map((payment) => ({
      id: payment.id,
      productName: payment.productName,
      type: payment.category,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      saleDate: payment.saleDate,
      cardCompany: payment.cardCompany,
      source: 'mock' as const,
      receiptId: payment.id,
    }));

    return [...local, ...remote].sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
  }, [mockPayments, sales]);

  const methodLabel: Record<string, string> = {
    CARD: '카드',
    CASH: '현금',
    TRANSFER: '계좌이체',
    MILEAGE: '마일리지',
    NAVERPAY: '네이버페이',
    KAKAOPAY: '카카오페이',
  };

  const statusConfig: Record<string, { text: string; tone: 'success' | 'warning' | 'error' | 'neutral' }> = {
    COMPLETED: { text: '완료', tone: 'success' },
    UNPAID: { text: '미결제', tone: 'warning' },
    REFUNDED: { text: '환불', tone: 'error' },
    PENDING: { text: '대기', tone: 'neutral' },
  };

  const grouped = payments.reduce<Record<string, PaymentItem[]>>((acc, payment) => {
    const date = new Date(payment.saleDate);
    const key = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(payment);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-surface-secondary">
      <PageHeader title="결제 내역" showBack />

      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card variant="elevated" padding="md" interactive onClick={() => navigate('/payment/personal')}
            className="bg-primary text-white"
          >
            <p className="text-caption text-white/80">개인 결제</p>
            <p className="text-body-sm font-semibold mt-1 text-white">결제 페이지 바로가기</p>
          </Card>
          <Card variant="soft" padding="md" interactive onClick={() => navigate('/shop')}>
            <p className="text-caption text-content-tertiary">상품 구매</p>
            <p className="text-body-sm font-semibold mt-1">헬스장 / 골프장 / PT</p>
          </Card>
        </div>

        {loading ? (
          <div className="text-center py-12 text-content-tertiary text-body-sm">불러오는 중...</div>
        ) : payments.length === 0 ? (
          <EmptyState
            icon={<Receipt className="w-12 h-12" />}
            title="결제 내역이 없습니다"
          />
        ) : (
          Object.entries(grouped).map(([month, items]) => (
            <div key={month} className="mt-4">
              <h3 className="text-body-sm font-semibold text-content-secondary mb-2">{month}</h3>
              <div className="space-y-2">
                {items.map((payment) => {
                  const status = statusConfig[payment.status] || { text: payment.status, tone: 'neutral' as const };
                  const isMock = payment.source === 'mock';

                  return (
                    <button
                      key={`${payment.source}-${payment.id}`}
                      onClick={() => {
                        if (isMock && payment.receiptId) navigate(`/payments/${payment.receiptId}`);
                      }}
                      className="w-full bg-surface rounded-card shadow-card-soft p-4 flex items-center gap-3 text-left"
                    >
                      <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-body-sm truncate">{payment.productName || payment.type}</p>
                          {isMock && (
                            <Badge tone="info" size="sm">영수증 보기</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-caption text-content-tertiary mt-0.5">
                          <span>{formatDateKo(payment.saleDate)}</span>
                          <span>{methodLabel[payment.paymentMethod] || payment.paymentMethod}</span>
                          {payment.cardCompany && <span>{payment.cardCompany}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-body-sm">{formatCurrency(Number(payment.amount))}</p>
                        <Badge tone={status.tone} size="sm">{status.text}</Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
