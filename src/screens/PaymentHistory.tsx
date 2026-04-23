import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CreditCard, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { getMockPayments, type MockPaymentRecord } from '@/lib/memberExperience';
import { cn, formatCurrency, formatDateKo } from '@/lib/utils';

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

  const statusLabel: Record<string, { text: string; color: string }> = {
    COMPLETED: { text: '완료', color: 'text-state-success' },
    UNPAID: { text: '미결제', color: 'text-state-warning' },
    REFUNDED: { text: '환불', color: 'text-state-error' },
    PENDING: { text: '대기', color: 'text-content-tertiary' },
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
      <header className="bg-surface sticky top-0 z-10 border-b border-line">
        <div className="flex items-center px-4 pt-safe-top h-14">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-content" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-lg">결제 내역</h1>
          <div className="w-6" />
        </div>
      </header>

      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => navigate('/payment/personal')}
            className="bg-primary text-white rounded-card p-4 text-left shadow-card"
          >
            <p className="text-xs text-white/80">개인 결제</p>
            <p className="text-sm font-semibold mt-1">결제 페이지 바로가기</p>
          </button>
          <button
            onClick={() => navigate('/shop')}
            className="bg-surface rounded-card p-4 text-left shadow-card"
          >
            <p className="text-xs text-content-tertiary">상품 구매</p>
            <p className="text-sm font-semibold mt-1">헬스장 / 골프장 / PT</p>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-content-tertiary text-sm">불러오는 중...</div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-content-tertiary/30 mx-auto mb-3" />
            <p className="text-content-tertiary text-sm">결제 내역이 없습니다</p>
          </div>
        ) : (
          Object.entries(grouped).map(([month, items]) => (
            <div key={month} className="mt-4">
              <h3 className="text-sm font-semibold text-content-secondary mb-2">{month}</h3>
              <div className="space-y-2">
                {items.map((payment) => {
                  const status = statusLabel[payment.status] || { text: payment.status, color: 'text-content-tertiary' };
                  const isMock = payment.source === 'mock';

                  return (
                    <button
                      key={`${payment.source}-${payment.id}`}
                      onClick={() => {
                        if (isMock && payment.receiptId) navigate(`/payments/${payment.receiptId}`);
                      }}
                      className="w-full bg-surface rounded-lg p-4 flex items-center gap-3 text-left"
                    >
                      <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{payment.productName || payment.type}</p>
                          {isMock && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-state-info/10 text-state-info font-medium">
                              영수증 보기
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-content-tertiary mt-0.5">
                          <span>{formatDateKo(payment.saleDate)}</span>
                          <span>{methodLabel[payment.paymentMethod] || payment.paymentMethod}</span>
                          {payment.cardCompany && <span>{payment.cardCompany}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{formatCurrency(Number(payment.amount))}</p>
                        <p className={cn('text-xs font-medium', status.color)}>{status.text}</p>
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
