import { Check, CreditCard } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getShopProduct } from '@/lib/memberExperience';
import { formatCurrency } from '@/lib/utils';
import { Button, Card, Badge, PageHeader, PriceTag } from '@/components/ui';

/** 상품 상세 */
export default function ProductDetail() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const product = productId ? getShopProduct(productId) : null;

  if (!product) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center">
        <Button variant="ghost" onClick={() => navigate('/shop')}>
          상품 목록으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-secondary page-with-action">
      <PageHeader title="상품 상세" showBack />

      <div className="px-4 py-4 space-y-4 pb-28">
        <Card variant="soft" padding="lg">
          <div className="flex items-center gap-2 mb-2">
            {product.recommended && (
              <Badge tone="primary" size="sm">추천</Badge>
            )}
            <Badge tone="neutral" size="sm">
              {product.category === 'gym' ? '헬스장 이용권'
                : product.category === 'golf' ? '골프장 이용권'
                : product.category === 'pt' ? 'PT 패키지'
                : product.category === 'golf_lesson' ? '골프 레슨'
                : '재등록'}
            </Badge>
          </div>
          <h2 className="text-h2 text-content">{product.name}</h2>
          <p className="text-body-sm text-content-secondary mt-2 leading-relaxed">{product.description}</p>
          <div className="mt-4">
            <PriceTag
              price={product.price}
              originalPrice={product.originalPrice}
              showDiscountPercent
              size="lg"
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <InfoBox label="이용 기간" value={product.durationText} />
            <InfoBox label="횟수 / 구성" value={product.sessionsText || '기간제'} />
          </div>
        </Card>

        <Card variant="soft" padding="lg">
          <h3 className="text-body font-semibold mb-3">포함 혜택</h3>
          <div className="space-y-2">
            {product.benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-body-sm text-content-secondary">
                <Check className="w-4 h-4 text-state-success" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="soft" padding="lg">
          <h3 className="text-body font-semibold mb-2">결제 안내</h3>
          <p className="text-body-sm text-content-secondary leading-relaxed">{product.paymentNote}</p>
        </Card>
      </div>

      <div className="bottom-action-bar">
        <div className="max-w-lg mx-auto">
          <Button
            variant="primary"
            size="xl"
            fullWidth
            leftIcon={<CreditCard className="w-4 h-4" />}
            onClick={() => navigate(`/checkout/${product.id}`)}
          >
            결제하기
          </Button>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-secondary rounded-xl p-3">
      <p className="text-caption text-content-tertiary">{label}</p>
      <p className="text-body-sm font-semibold mt-1">{value}</p>
    </div>
  );
}
