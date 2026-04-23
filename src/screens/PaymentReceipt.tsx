import { ArrowLeft, Download, Receipt } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { getMockPayment } from '@/lib/memberExperience';
import { formatCurrency, formatDateKo } from '@/lib/utils';

/** 영수증 상세 */
export default function PaymentReceipt() {
  const navigate = useNavigate();
  const { paymentId } = useParams<{ paymentId: string }>();
  const { member } = useAuthStore();

  const payment = member && paymentId ? getMockPayment(member.id, paymentId) : null;

  if (!member || !payment) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <button onClick={() => navigate('/payments')} className="text-primary font-medium">
          결제 내역으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-surface sticky top-0 z-10 border-b border-line">
        <div className="flex items-center px-4 pt-safe-top h-14">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-content" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-lg">영수증</h1>
          <div className="w-6" />
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        <section className="bg-surface rounded-card p-5 shadow-card text-center">
          <Receipt className="w-10 h-10 text-primary mx-auto mb-3" />
          <p className="text-xs text-content-tertiary">결제 완료</p>
          <h2 className="text-xl font-bold mt-1">{payment.productName}</h2>
          <p className="text-3xl font-bold mt-3">{formatCurrency(payment.amount)}</p>
          <p className="text-sm text-content-secondary mt-2">{formatDateKo(payment.saleDate)}</p>
        </section>

        <section className="bg-surface rounded-card p-5 shadow-card space-y-3">
          <ReceiptRow label="상품명" value={payment.productName} />
          <ReceiptRow label="결제수단" value={payment.cardCompany || payment.paymentMethod} />
          <ReceiptRow label="정가" value={formatCurrency(payment.originalAmount)} />
          <ReceiptRow label="사용 마일리지" value={`${payment.mileageUsed.toLocaleString()}P`} />
          <ReceiptRow label="최종 결제금액" value={formatCurrency(payment.amount)} />
          <ReceiptRow label="주문 메모" value={payment.orderMemo || '-'} />
        </section>

        <button
          onClick={() => navigate('/payments')}
          className="w-full bg-primary text-white rounded-button py-3.5 font-semibold flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          결제 내역으로 돌아가기
        </button>
      </div>
    </div>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-content-secondary">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
