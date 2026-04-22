import { ArrowLeft, Check, CreditCard } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getShopProduct } from '@/lib/memberExperience';
import { formatCurrency } from '@/lib/utils';

/** 상품 상세 */
export default function ProductDetail() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const product = productId ? getShopProduct(productId) : null;

  if (!product) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <button onClick={() => navigate('/shop')} className="text-primary font-medium">
          상품 목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-secondary page-with-action">
      <header className="page-header-sticky">
        <div className="flex items-center px-4 pt-safe-top h-14">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-content" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-lg">상품 상세</h1>
          <div className="w-6" />
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 pb-28">
        <section className="bg-surface rounded-card p-5 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            {product.recommended && (
              <span className="px-2 py-1 rounded-full bg-primary-light text-primary text-[11px] font-semibold">
                추천
              </span>
            )}
            <span className="px-2 py-1 rounded-full bg-surface-secondary text-content-tertiary text-[11px] font-medium">
              {product.category === 'gym' ? '헬스장 이용권' : product.category === 'golf' ? '골프장 이용권' : product.category === 'pt' ? 'PT 패키지' : product.category === 'golf_lesson' ? '골프 레슨' : '재등록'}
            </span>
          </div>
          <h2 className="text-2xl font-bold">{product.name}</h2>
          <p className="text-sm text-content-secondary mt-2 leading-relaxed">{product.description}</p>
          <div className="mt-4 flex items-end gap-2">
            <span className="text-3xl font-bold">{formatCurrency(product.price)}</span>
            <span className="text-sm text-content-tertiary line-through">{formatCurrency(product.originalPrice)}</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <InfoBox label="이용 기간" value={product.durationText} />
            <InfoBox label="횟수 / 구성" value={product.sessionsText || '기간제'} />
          </div>
        </section>

        <section className="bg-surface rounded-card p-5 shadow-card">
          <h3 className="text-sm font-semibold mb-3">포함 혜택</h3>
          <div className="space-y-2">
            {product.benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-sm text-content-secondary">
                <Check className="w-4 h-4 text-state-success" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface rounded-card p-5 shadow-card">
          <h3 className="text-sm font-semibold mb-2">결제 안내</h3>
          <p className="text-sm text-content-secondary leading-relaxed">{product.paymentNote}</p>
        </section>
      </div>

      <div className="bottom-action-bar">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => navigate(`/checkout/${product.id}`)}
            className="w-full py-3.5 rounded-button font-semibold bg-primary text-white flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            결제하기
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-secondary rounded-xl p-3">
      <p className="text-[11px] text-content-tertiary">{label}</p>
      <p className="text-sm font-semibold mt-1">{value}</p>
    </div>
  );
}
