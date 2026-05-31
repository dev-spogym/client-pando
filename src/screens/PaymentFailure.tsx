import { AlertTriangle, CreditCard, RotateCcw } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, PageHeader } from '@/components/ui';

/** 결제 실패 */
export default function PaymentFailure() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason') || '카드 승인 또는 네트워크 문제로 결제가 완료되지 않았습니다.';

  return (
    <div className="min-h-screen bg-surface-secondary">
      <PageHeader title="결제 실패" showBack />
      <div className="flex min-h-[calc(100vh-56px)] flex-col px-5 py-8">
        <div className="flex-1">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-card-lg bg-state-error/10 text-state-error">
            <AlertTriangle className="h-10 w-10" />
          </div>
          <h1 className="text-h1 text-content">결제가 완료되지 않았어요</h1>
          <p className="mt-3 text-body text-content-secondary">
            실패한 결제는 미수금으로 집계되지 않습니다. 결제 수단을 확인한 뒤 다시 시도해 주세요.
          </p>

          <Card padding="lg" className="mt-6">
            <p className="text-body-sm font-semibold text-content">실패 사유</p>
            <p className="mt-2 text-body-sm text-content-secondary">{reason}</p>
          </Card>
        </div>

        <div className="space-y-2 pb-safe-bottom">
          <Button fullWidth size="lg" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => navigate(-1)}>
            다시 시도
          </Button>
          <Button fullWidth size="lg" variant="outline" leftIcon={<CreditCard className="h-4 w-4" />} onClick={() => navigate('/payment-methods')}>
            결제 수단 변경
          </Button>
        </div>
      </div>
    </div>
  );
}
