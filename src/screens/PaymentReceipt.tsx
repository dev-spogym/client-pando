import { Download, Receipt } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { getMockPayment } from '@/lib/memberExperience';
import { formatCurrency, formatDateKo } from '@/lib/utils';
import { Button, Card, PageHeader } from '@/components/ui';

/** 영수증 상세 */
export default function PaymentReceipt() {
  const navigate = useNavigate();
  const { paymentId } = useParams<{ paymentId: string }>();
  const { member } = useAuthStore();

  const payment = member && paymentId ? getMockPayment(member.id, paymentId) : null;

  if (!member || !payment) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center">
        <Button variant="ghost" onClick={() => navigate('/payments')}>
          결제 내역으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      <PageHeader title="영수증" showBack />

      <div className="px-4 py-4 space-y-4">
        <Card variant="soft" padding="lg" className="text-center">
          <Receipt className="w-10 h-10 text-primary mx-auto mb-3" />
          <p className="text-caption text-content-tertiary">결제 완료</p>
          <h2 className="text-h3 text-content mt-1">{payment.productName}</h2>
          <p className="text-display font-bold mt-3">{formatCurrency(payment.amount)}</p>
          <p className="text-body-sm text-content-secondary mt-2">{formatDateKo(payment.saleDate)}</p>
        </Card>

        <Card variant="soft" padding="lg" className="space-y-3">
          <ReceiptRow label="상품명" value={payment.productName} />
          <ReceiptRow label="결제수단" value={payment.cardCompany || payment.paymentMethod} />
          <ReceiptRow label="정가" value={formatCurrency(payment.originalAmount)} />
          <ReceiptRow label="사용 마일리지" value={`${payment.mileageUsed.toLocaleString()}P`} />
          <ReceiptRow label="최종 결제금액" value={formatCurrency(payment.amount)} />
          <ReceiptRow label="주문 메모" value={payment.orderMemo || '-'} />
        </Card>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          leftIcon={<Download className="w-4 h-4" />}
          onClick={() => navigate('/payments')}
        >
          결제 내역으로 돌아가기
        </Button>
      </div>
    </div>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-body-sm">
      <span className="text-content-secondary">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
