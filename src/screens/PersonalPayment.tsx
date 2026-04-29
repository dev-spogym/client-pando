import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getShopProducts, type ProductCategory, type ShopProduct } from '@/lib/memberExperience';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Button, Card, Chip, Input, PageHeader } from '@/components/ui';

/** 개인 결제 페이지 */
export default function PersonalPayment() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState<ProductCategory | 'all'>(() => {
    const nextCategory = searchParams.get('category') as ProductCategory | 'all' | null;
    return nextCategory === 'gym' || nextCategory === 'golf' || nextCategory === 'pt' || nextCategory === 'golf_lesson'
      ? nextCategory
      : 'all';
  });
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  const products = useMemo(() => getShopProducts(category), [category]);

  useEffect(() => {
    const selectedId = searchParams.get('product');
    setSelectedProduct(products.find((item) => item.id === selectedId) || null);
  }, [products, searchParams]);

  const goToCheckoutWithPreset = () => {
    if (!selectedProduct) return;
    navigate(`/checkout/${selectedProduct.id}`);
  };

  const goToCheckoutWithCustom = () => {
    const amount = Number(customPrice.replace(/\D/g, ''));
    if (!customName || !amount) return;
    const params = new URLSearchParams({
      name: customName,
      price: String(amount),
      category: category === 'all' ? 'renewal' : category,
      subtitle: '개인 결제 페이지에서 생성한 수동 결제 항목',
    });
    navigate(`/checkout/manual?${params.toString()}`);
  };

  const categoryItems = [
    { key: 'all' as const, label: '전체' },
    { key: 'gym' as const, label: '헬스장' },
    { key: 'golf' as const, label: '골프장' },
    { key: 'pt' as const, label: 'PT' },
    { key: 'golf_lesson' as const, label: '골프 레슨' },
  ];

  return (
    <div className="min-h-screen bg-surface-secondary">
      <PageHeader title="개인 결제" showBack />

      <div className="px-4 py-4 space-y-4 pb-20">
        <Card variant="soft" padding="lg">
          <h2 className="text-h3 text-content">상품을 빠르게 선택해 결제합니다</h2>
          <p className="text-body-sm text-content-secondary mt-2">헬스장 이용권, 골프장 이용권, PT, 골프 레슨을 바로 결제할 수 있는 퍼블리싱 화면입니다.</p>
        </Card>

        <Card variant="soft" padding="lg">
          <h3 className="text-body font-semibold mb-3">상품 유형</h3>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
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
                  next.delete('product');
                  setSearchParams(next, { replace: true });
                }}
              >
                {item.label}
              </Chip>
            ))}
          </div>
        </Card>

        <Card variant="soft" padding="lg">
          <h3 className="text-body font-semibold mb-3">추천 결제 상품</h3>
          <div className="space-y-2">
            {products.slice(0, 4).map((product) => (
              <button
                key={product.id}
                onClick={() => {
                  setSelectedProduct(product);
                  const next = new URLSearchParams(searchParams);
                  next.set('product', product.id);
                  setSearchParams(next, { replace: true });
                }}
                className={cn(
                  'w-full rounded-xl border p-4 text-left transition-colors',
                  selectedProduct?.id === product.id ? 'border-primary bg-primary-light' : 'border-line bg-surface'
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-body-sm font-semibold">{product.name}</p>
                    <p className="text-caption text-content-secondary mt-1">{product.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-body-sm font-bold">{formatCurrency(product.price)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            className="mt-4"
            disabled={!selectedProduct}
            onClick={goToCheckoutWithPreset}
          >
            선택 상품 결제
          </Button>
        </Card>

        <Card variant="soft" padding="lg">
          <h3 className="text-body font-semibold mb-3">직접 결제 항목 만들기</h3>
          <div className="space-y-3">
            <input
              value={customName}
              onChange={(event) => setCustomName(event.target.value)}
              placeholder="예: 골프장 1개월 이용권"
              className="w-full rounded-xl border border-line bg-surface-secondary px-4 py-3 text-body-sm outline-none"
            />
            <input
              value={customPrice}
              onChange={(event) => setCustomPrice(event.target.value.replace(/[^\d]/g, ''))}
              placeholder="결제 금액"
              className="w-full rounded-xl border border-line bg-surface-secondary px-4 py-3 text-body-sm outline-none"
              inputMode="numeric"
            />
            <Button
              variant="tertiary"
              size="lg"
              fullWidth
              disabled={!customName || !customPrice}
              onClick={goToCheckoutWithCustom}
            >
              직접 입력 항목으로 결제하기
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
