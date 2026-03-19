import { useEffect, useState } from 'react';
import { ArrowLeft, CreditCard, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
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

/** 결제 내역 페이지 */
export default function PaymentHistory() {
  const navigate = useNavigate();
  const { member } = useAuthStore();
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!member) return;
    fetchSales();
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

  const methodLabel: Record<string, string> = {
    CARD: '카드',
    CASH: '현금',
    TRANSFER: '이체',
    MILEAGE: '마일리지',
  };

  const statusLabel: Record<string, { text: string; color: string }> = {
    COMPLETED: { text: '완료', color: 'text-state-success' },
    UNPAID: { text: '미결제', color: 'text-state-warning' },
    REFUNDED: { text: '환불', color: 'text-state-error' },
    PENDING: { text: '대기', color: 'text-content-tertiary' },
  };

  // 월별 그룹핑
  const grouped = sales.reduce<Record<string, SaleRecord[]>>((acc, sale) => {
    const d = new Date(sale.saleDate);
    const key = `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(sale);
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

      <div className="px-4 pb-4">
        {loading ? (
          <div className="text-center py-12 text-content-tertiary text-sm">불러오는 중...</div>
        ) : sales.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-content-tertiary/30 mx-auto mb-3" />
            <p className="text-content-tertiary text-sm">결제 내역이 없습니다</p>
          </div>
        ) : (
          Object.entries(grouped).map(([month, items]) => (
            <div key={month} className="mt-4">
              <h3 className="text-sm font-semibold text-content-secondary mb-2">{month}</h3>
              <div className="space-y-2">
                {items.map((sale) => {
                  const st = statusLabel[sale.status] || { text: sale.status, color: 'text-content-tertiary' };
                  return (
                    <div key={sale.id} className="bg-surface rounded-lg p-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{sale.productName || sale.type}</p>
                        <div className="flex items-center gap-2 text-xs text-content-tertiary mt-0.5">
                          <span>{formatDateKo(sale.saleDate)}</span>
                          <span>{methodLabel[sale.paymentMethod] || sale.paymentMethod}</span>
                          {sale.cardCompany && <span>{sale.cardCompany}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{formatCurrency(Number(sale.amount))}</p>
                        <p className={cn('text-xs font-medium', st.color)}>{st.text}</p>
                      </div>
                    </div>
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
