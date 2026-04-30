'use client';

import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, CheckCircle2, Info, Share2 } from 'lucide-react';
import {
  formatEventDday,
  formatEventPeriod,
  getEventById,
} from '@/lib/discover';
import { MOCK_PRODUCTS, type MarketProduct } from '@/lib/marketplace';
import { Badge, Button, Card, EmptyState, PriceTag } from '@/components/ui';

function FloatingHeader({ onBack, onShare }: { onBack: () => void; onShare: () => void }) {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 pt-3">
      <button
        type="button"
        onClick={onBack}
        aria-label="뒤로 가기"
        className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm active:bg-black/50"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={onShare}
        aria-label="공유"
        className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm active:bg-black/50"
      >
        <Share2 className="w-5 h-5" />
      </button>
    </header>
  );
}

function ProductRow({
  product,
  onClick,
}: {
  product: MarketProduct;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full gap-3 p-3 text-left bg-surface rounded-card border border-line active:opacity-90"
    >
      <div className="relative w-20 h-20 shrink-0 rounded-card overflow-hidden bg-surface-tertiary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.thumbnailUrl} alt={product.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-caption text-primary font-medium">{product.productCategory}</p>
        <h4 className="text-body font-semibold text-content line-clamp-2 mt-0.5">
          {product.name}
        </h4>
        <p className="text-caption text-content-tertiary line-clamp-1 mt-0.5">
          {product.centerName}
        </p>
        <div className="mt-1.5">
          <PriceTag price={product.price} originalPrice={product.originalPrice} size="sm" />
        </div>
      </div>
    </button>
  );
}

export default function EventDetail() {
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const event = useMemo(() => (Number.isFinite(id) ? getEventById(id) : undefined), [id]);

  const products = useMemo(() => {
    if (!event) return [] as MarketProduct[];
    return MOCK_PRODUCTS.filter((p) => event.productIds.includes(p.id));
  }, [event]);

  if (!event) {
    return (
      <div className="min-h-screen bg-surface-secondary flex flex-col">
        <header className="flex items-center gap-2 px-4 h-14 bg-surface border-b border-line">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="뒤로 가기"
            className="w-10 h-10 inline-flex items-center justify-center rounded-full active:bg-surface-tertiary text-content"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-h4 text-content">이벤트</h1>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            title="이벤트를 찾을 수 없어요"
            description="이미 종료되었거나 잘못된 경로일 수 있습니다"
            action={
              <Button variant="primary" onClick={() => navigate('/events')}>
                이벤트 목록으로
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const handleShare = () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    const navAny = window.navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>;
    };
    if (navAny.share) {
      navAny
        .share({ title: event.title, text: event.subtitle, url })
        .catch(() => {
          /* 사용자 취소 등 무시 */
        });
      return;
    }
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(url)
        .catch(() => {
          /* 무시 */
        });
    }
  };

  return (
    <div className="min-h-screen bg-surface-secondary pb-32 relative">
      {/* Hero 이미지 + floating 헤더 */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-surface-tertiary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={event.heroUrl} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
        <FloatingHeader onBack={() => navigate(-1)} onShare={handleShare} />
      </div>

      {/* 이벤트 정보 카드 */}
      <div className="px-5 -mt-6 relative z-20">
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-2 mb-2">
            {event.badgeLabel && (
              <Badge tone="warning" variant="solid" size="sm">
                {event.badgeLabel}
              </Badge>
            )}
            <Badge
              tone={event.isAlways ? 'info' : event.daysLeft <= 7 ? 'sale' : 'primary'}
              variant="solid"
              size="sm"
            >
              {formatEventDday(event)}
            </Badge>
          </div>
          <h1 className="text-h2 text-content font-bold leading-snug">{event.title}</h1>
          <p className="text-body-sm text-content-secondary mt-1">{event.subtitle}</p>
          <div className="mt-3 flex items-center gap-2 text-caption text-content-tertiary">
            <Calendar className="w-4 h-4" />
            <span>{formatEventPeriod(event)}</span>
          </div>
          <p className="mt-4 text-body text-content-secondary leading-relaxed">
            {event.description}
          </p>
        </Card>
      </div>

      {/* 본문 섹션 */}
      <div className="px-5 mt-6 space-y-6">
        {event.bodySections.map((sec, idx) => (
          <section key={idx} className="space-y-3">
            <h2 className="text-h3 text-content">{sec.heading}</h2>
            {sec.imageUrl && (
              <div className="relative w-full aspect-[16/9] rounded-card overflow-hidden bg-surface-tertiary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sec.imageUrl} alt={sec.heading} className="w-full h-full object-cover" />
              </div>
            )}
            <p className="text-body text-content-secondary leading-relaxed whitespace-pre-line">
              {sec.body}
            </p>
          </section>
        ))}
      </div>

      {/* 참여 조건 */}
      <div className="px-5 mt-6">
        <Card variant="outline" padding="md">
          <h3 className="text-body font-semibold text-content flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            참여 조건
          </h3>
          <ul className="mt-3 space-y-2">
            {event.eligibility.map((item, idx) => (
              <li key={idx} className="flex gap-2 text-body-sm text-content-secondary">
                <span className="text-primary mt-1">•</span>
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* 유의사항 */}
      <div className="px-5 mt-3">
        <Card variant="outline" padding="md">
          <h3 className="text-body font-semibold text-content flex items-center gap-1.5">
            <Info className="w-4 h-4 text-state-warning" />
            유의사항
          </h3>
          <ul className="mt-3 space-y-2">
            {event.notice.map((item, idx) => (
              <li key={idx} className="flex gap-2 text-body-sm text-content-secondary">
                <span className="text-content-tertiary mt-1">•</span>
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* 적용 상품 */}
      {products.length > 0 && (
        <div className="px-5 mt-6">
          <h2 className="text-h3 text-content mb-3">
            적용 상품 <span className="text-primary">{products.length}</span>
          </h2>
          <div className="space-y-2.5">
            {products.map((p) => (
              <ProductRow
                key={p.id}
                product={p}
                onClick={() => navigate(`/shop/${p.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 하단 sticky CTA */}
      <div className="mobile-fixed-width fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-line px-5 pt-3 pb-[max(env(safe-area-inset-bottom),12px)]">
        <Button
          variant={event.daysLeft < 0 ? 'tertiary' : 'primary'}
          size="lg"
          fullWidth
          disabled={event.daysLeft < 0}
          onClick={() => navigate(event.ctaPath)}
        >
          {event.daysLeft < 0 ? '종료된 이벤트입니다' : event.ctaLabel}
        </Button>
      </div>
    </div>
  );
}
