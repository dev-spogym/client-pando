'use client';

import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Check, Clock, ShoppingCart, Star, User2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  PageHeader,
  PriceTag,
} from '@/components/ui';
import {
  MOCK_PRODUCTS,
  MOCK_TRAINERS,
  type MarketProduct,
  type MarketTrainer,
} from '@/lib/marketplace';
import {
  SESSION_PLANS,
  START_DATE_OPTIONS,
  TIME_SLOTS,
  WEEKDAYS,
  type SessionPlan,
  type StartDateOption,
  type WeekdayCode,
  addToCart,
  buildCartItemFromProduct,
  buildOptionSummary,
} from '@/lib/orders';
import { useAuthStore } from '@/stores/authStore';
import { cn, formatCurrency } from '@/lib/utils';

/** 결제 전 옵션 선택 — 강사/시간/회차/시작일 */
export default function CheckoutOption() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const { member } = useAuthStore();

  const product = useMemo<MarketProduct | null>(() => {
    if (!productId) return null;
    const numericId = Number(productId);
    if (Number.isNaN(numericId)) return null;
    return MOCK_PRODUCTS.find((p) => p.id === numericId) || null;
  }, [productId]);

  const trainers = useMemo<MarketTrainer[]>(() => {
    if (!product) return [];
    const sameCenterAndCategory = MOCK_TRAINERS.filter(
      (t) => t.centerId === product.centerId && t.category === product.category
    );
    if (sameCenterAndCategory.length > 0) return sameCenterAndCategory;
    return MOCK_TRAINERS.filter((t) => t.centerId === product.centerId);
  }, [product]);

  const [trainerId, setTrainerId] = useState<number | null>(trainers[0]?.id ?? null);
  const [weekday, setWeekday] = useState<WeekdayCode | null>('mon');
  const [time, setTime] = useState<string | null>('09:00');
  const [startOption, setStartOption] = useState<StartDateOption>('today');
  const [planId, setPlanId] = useState<string>(SESSION_PLANS[1].id);

  if (!product) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <PageHeader title="옵션 선택" showBack />
        <EmptyState
          title="상품을 찾을 수 없어요"
          description="삭제되었거나 잘못된 경로일 수 있습니다."
          action={
            <Button variant="primary" onClick={() => navigate('/centers')}>
              센터 둘러보기
            </Button>
          }
        />
      </div>
    );
  }

  const trainer = trainerId ? trainers.find((t) => t.id === trainerId) || null : null;
  const plan: SessionPlan = SESSION_PLANS.find((p) => p.id === planId) || SESSION_PLANS[1];
  const baseUnitPrice = product.price;
  const optionUnitPrice = Math.round(baseUnitPrice * plan.multiplier);
  const optionOriginalPrice = product.originalPrice
    ? Math.round(product.originalPrice * plan.multiplier)
    : optionUnitPrice;
  const totalPrice = optionUnitPrice;

  const optionSummary = buildOptionSummary({
    trainer,
    weekday,
    time,
    plan,
    startOption,
  });

  const validateOptions = (): string | null => {
    if (trainers.length > 0 && !trainerId) return '강사를 선택해 주세요.';
    if (!weekday || !time) return '요일과 시간을 선택해 주세요.';
    return null;
  };

  const handlePay = () => {
    const error = validateOptions();
    if (error) {
      toast.error(error);
      return;
    }
    // 옵션 정보를 쿼리로 전달하면서 기존 결제 페이지로 이동
    const params = new URLSearchParams({
      name: `${product.name} (${plan.label})`,
      price: String(totalPrice),
      category: 'renewal',
      subtitle: optionSummary,
    });
    navigate(`/checkout/manual?${params.toString()}`);
  };

  const handleAddToCart = () => {
    const error = validateOptions();
    if (error) {
      toast.error(error);
      return;
    }
    if (!member) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    const base = buildCartItemFromProduct(product);
    addToCart(member.id, {
      ...base,
      productName: `${product.name} (${plan.label})`,
      productSubtitle: optionSummary,
      unitPrice: optionUnitPrice,
      originalPrice: optionOriginalPrice,
      quantity: 1,
      optionSummary,
    });
    toast.success('장바구니에 담았어요.');
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-surface-secondary page-with-action">
      <PageHeader title="옵션 선택" showBack />

      <div className="px-4 py-4 space-y-4">
        {/* 상품 요약 */}
        <Card variant="soft" padding="md">
          <div className="flex gap-3">
            <div className="w-20 h-20 rounded-card overflow-hidden bg-surface-tertiary shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.thumbnailUrl} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-caption text-primary font-medium">{product.centerName}</p>
              <h2 className="text-body font-semibold text-content line-clamp-2 mt-0.5">{product.name}</h2>
              <div className="mt-2">
                <PriceTag
                  price={product.price}
                  originalPrice={product.originalPrice}
                  size="sm"
                  showDiscountPercent
                />
              </div>
            </div>
          </div>
        </Card>

        {/* 강사 선택 */}
        {trainers.length > 0 && (
          <section>
            <header className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-h4 text-content inline-flex items-center gap-2">
                <User2 className="w-4 h-4 text-primary" />
                강사 선택
              </h3>
              <span className="text-caption text-content-tertiary">{trainers.length}명</span>
            </header>
            <div className="grid grid-cols-2 gap-3">
              {trainers.map((t) => {
                const active = trainerId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTrainerId(t.id)}
                    aria-pressed={active}
                    className={cn(
                      'rounded-card p-3 text-left bg-surface border transition-colors',
                      active ? 'border-primary bg-primary-light' : 'border-line'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar src={t.profileUrl} name={t.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm font-semibold truncate">{t.name}</p>
                        <span className="inline-flex items-center gap-1 text-caption text-content-secondary mt-0.5">
                          <Star className="w-3 h-3 text-state-warning fill-state-warning" />
                          {t.rating.toFixed(1)} ({t.reviewCount})
                        </span>
                      </div>
                      {active && (
                        <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <p className="text-caption text-content-tertiary mt-2 line-clamp-1">
                      {t.specialties.slice(0, 3).join(' · ')}
                    </p>
                    <p className="text-micro text-content-tertiary mt-0.5">경력 {t.experienceYears}년</p>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* 요일 / 시간 */}
        <section>
          <header className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-h4 text-content inline-flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              요일 · 시간
            </h3>
          </header>
          <Card variant="soft" padding="md">
            <p className="text-caption text-content-tertiary mb-2">요일</p>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((w) => (
                <Chip
                  key={w.code}
                  active={weekday === w.code}
                  size="sm"
                  onClick={() => setWeekday(w.code)}
                >
                  {w.label}
                </Chip>
              ))}
            </div>
            <p className="text-caption text-content-tertiary mt-4 mb-2">시간</p>
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map((slot) => (
                <Chip key={slot} active={time === slot} size="sm" onClick={() => setTime(slot)}>
                  {slot}
                </Chip>
              ))}
            </div>
          </Card>
        </section>

        {/* 시작일 */}
        <section>
          <header className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-h4 text-content inline-flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              시작일
            </h3>
          </header>
          <div className="grid grid-cols-3 gap-2">
            {START_DATE_OPTIONS.map((opt) => {
              const active = startOption === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStartOption(opt.id)}
                  className={cn(
                    'rounded-card p-3 text-center bg-surface border transition-colors',
                    active ? 'border-primary bg-primary-light' : 'border-line'
                  )}
                >
                  <p className="text-body-sm font-semibold">{opt.label}</p>
                  <p className="text-micro text-content-tertiary mt-1">{opt.sublabel}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* 회차 / 기간 */}
        <section>
          <header className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-h4 text-content">회차 · 기간</h3>
          </header>
          <div className="grid grid-cols-3 gap-2">
            {SESSION_PLANS.map((p) => {
              const active = planId === p.id;
              const planPrice = Math.round(baseUnitPrice * p.multiplier);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlanId(p.id)}
                  className={cn(
                    'rounded-card p-3 text-center bg-surface border transition-colors',
                    active ? 'border-primary bg-primary-light' : 'border-line'
                  )}
                >
                  <p className="text-body-sm font-semibold">{p.label}</p>
                  <p className="text-caption text-content-secondary mt-1">{formatCurrency(planPrice)}</p>
                  {p.id === 'plan-10' && (
                    <Badge tone="primary" size="sm" className="mt-1">
                      인기
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* 선택 요약 */}
        <Card variant="soft" padding="md">
          <p className="text-caption text-content-tertiary">선택한 옵션</p>
          <p className="text-body font-semibold mt-1">{optionSummary || '옵션을 선택해 주세요'}</p>
        </Card>
      </div>

      <div className="bottom-action-bar">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-body-sm text-content-secondary">총 결제 금액</span>
            <span className="text-h2 font-bold text-content">{formatCurrency(totalPrice)}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="xl"
              leftIcon={<ShoppingCart className="w-4 h-4" />}
              onClick={handleAddToCart}
              className="shrink-0 px-4"
            >
              담기
            </Button>
            <Button
              variant="primary"
              size="xl"
              fullWidth
              onClick={handlePay}
            >
              결제하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
