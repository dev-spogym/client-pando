import { CreditCard } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getShopProducts, type ProductCategory } from '@/lib/memberExperience';
import { formatCurrency } from '@/lib/utils';
import { Button, Card, Chip, PageHeader, Badge, PriceTag } from '@/components/ui';

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

  const categoryItems = [
    { key: 'all' as const, label: '전체' },
    { key: 'gym' as const, label: '헬스장' },
    { key: 'golf' as const, label: '골프장' },
    { key: 'pt' as const, label: 'PT' },
    { key: 'golf_lesson' as const, label: '골프 레슨' },
  ];

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="bg-surface sticky top-0 z-30 border-b border-line">
        <PageHeader title="상품 스토어" showBack sticky={false} />
        <div className="overflow-x-auto no-scrollbar pb-3 snap-x snap-proximity">
          <div className="flex w-max min-w-full gap-2 px-4">
            {categoryItems.map((item) => (
              <Chip
                key={item.key}
                active={category === item.key}
                size="md"
                onClick={() => {
                  setCategory(item.key);
                  const next = new URLSearchParams(searchParams);
                  if (item.key === 'all') next.delete('category');
                  else next.set('category', item.key);
                  setSearchParams(next, { replace: true });
                }}
              >
                {item.label}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {products.map((product) => (
          <Card
            key={product.id}
            variant="soft"
            padding="lg"
            interactive
            onClick={() => navigate(`/shop/${product.id}`)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {product.recommended && (
                    <Badge tone="primary" size="sm">추천</Badge>
                  )}
                  <Badge tone="neutral" size="sm">
                    {product.category === 'gym' ? '헬스장'
                      : product.category === 'golf' ? '골프장'
                      : product.category === 'pt' ? 'PT'
                      : product.category === 'golf_lesson' ? '골프 레슨'
                      : '기타'}
                  </Badge>
                </div>
                <h2 className="text-h3 text-content">{product.name}</h2>
                <p className="text-body-sm text-content-secondary mt-2 leading-relaxed">{product.subtitle}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} tone="info" size="sm">{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-end justify-between">
              <PriceTag
                price={product.price}
                originalPrice={product.originalPrice}
                showDiscountPercent
                size="md"
              />
              <div className="text-right text-caption text-content-secondary">
                <p>{product.durationText}</p>
                {product.sessionsText && <p>{product.sessionsText}</p>}
              </div>
            </div>
          </Card>
        ))}

        <Button
          variant="primary"
          size="lg"
          fullWidth
          leftIcon={<CreditCard className="w-4 h-4" />}
          onClick={() => navigate('/payment/personal')}
        >
          개인 결제 페이지로 이동
        </Button>
      </div>
    </div>
  );
}
