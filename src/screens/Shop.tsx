import { ArrowLeft, ChevronRight, CreditCard } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getShopProducts, type ProductCategory } from '@/lib/memberExperience';
import { cn, formatCurrency } from '@/lib/utils';

/** 상품 목록 */
export default function Shop() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState<ProductCategory | 'all'>(() => {
    const nextCategory = searchParams.get('category') as ProductCategory | 'all' | null;
    return nextCategory === 'gym' || nextCategory === 'golf' || nextCategory === 'pt' || nextCategory === 'golf_lesson'
      ? nextCategory
      : 'all';
  });

  const products = useMemo(() => getShopProducts(category), [category]);

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-surface sticky top-0 z-10 border-b border-line">
        <div className="flex items-center px-4 pt-safe-top h-14">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-content" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-lg">상품 스토어</h1>
          <div className="w-6" />
        </div>

        <div className="overflow-x-auto no-scrollbar pb-3 snap-x snap-proximity">
          <div className="flex w-max min-w-full gap-2 px-4">
            {[
              { key: 'all' as const, label: '전체' },
              { key: 'gym' as const, label: '헬스장' },
              { key: 'golf' as const, label: '골프장' },
              { key: 'pt' as const, label: 'PT' },
              { key: 'golf_lesson' as const, label: '골프 레슨' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setCategory(item.key);
                  const next = new URLSearchParams(searchParams);
                  if (item.key === 'all') next.delete('category');
                  else next.set('category', item.key);
                  setSearchParams(next, { replace: true });
                }}
                className={cn(
                  'snap-start px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap',
                  category === item.key ? 'bg-primary text-white' : 'bg-surface-tertiary text-content-secondary'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-3">
        {products.map((product) => (
          <button
            key={product.id}
            onClick={() => navigate(`/shop/${product.id}`)}
            className="w-full bg-surface rounded-card p-5 shadow-card text-left"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {product.recommended && (
                    <span className="px-2 py-1 rounded-full bg-primary-light text-primary text-[11px] font-semibold">
                      추천
                    </span>
                  )}
                  <span className="px-2 py-1 rounded-full bg-surface-secondary text-content-tertiary text-[11px] font-medium">
                    {product.category === 'gym' ? '헬스장' : product.category === 'golf' ? '골프장' : product.category === 'pt' ? 'PT' : product.category === 'golf_lesson' ? '골프 레슨' : '기타'}
                  </span>
                </div>
                <h2 className="text-lg font-bold">{product.name}</h2>
                <p className="text-sm text-content-secondary mt-2 leading-relaxed">{product.subtitle}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span key={tag} className="text-[11px] px-2 py-1 rounded-full bg-state-info/10 text-state-info font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-content-tertiary flex-shrink-0" />
            </div>

            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold">{formatCurrency(product.price)}</p>
                <p className="text-xs text-content-tertiary line-through mt-1">{formatCurrency(product.originalPrice)}</p>
              </div>
              <div className="text-right text-xs text-content-secondary">
                <p>{product.durationText}</p>
                {product.sessionsText && <p>{product.sessionsText}</p>}
              </div>
            </div>
          </button>
        ))}

        <button
          onClick={() => navigate('/payment/personal')}
          className="w-full bg-primary text-white rounded-card p-4 shadow-card flex items-center justify-center gap-2 font-semibold"
        >
          <CreditCard className="w-4 h-4" />
          개인 결제 페이지로 이동
        </button>
      </div>
    </div>
  );
}
