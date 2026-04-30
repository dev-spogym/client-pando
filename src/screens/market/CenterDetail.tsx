'use client';

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  Share2,
  Heart,
  Star,
  MapPin,
  Phone,
  Clock,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  getCenterById,
  getProductsByCenter,
  getReviewsByCenter,
  getTrainersByCenter,
  getCenterRatingDistribution,
  type MarketProduct,
  type CenterReview,
  type MarketTrainer,
  type ProductCategory,
} from '@/lib/marketplace';
import { useMarketStore } from '@/stores/marketStore';
import {
  Button,
  Card,
  Badge,
  Tag,
  Avatar,
  SectionHeader,
  PriceTag,
} from '@/components/ui';

/* ── 탭 정의 ── */
type TabId = '홈' | '상품' | '리뷰' | '강사' | '위치';
const TABS: TabId[] = ['홈', '상품', '리뷰', '강사', '위치'];

/* ── 별점 렌더러 ── */
function StarRow({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < Math.round(rating)
              ? 'text-state-warning fill-state-warning'
              : 'text-line-strong'
          }`}
        />
      ))}
    </span>
  );
}

/* ── 상품 그룹 섹션 ── */
const PRODUCT_ORDER: ProductCategory[] = [
  '체험권',
  '수강권',
  '이용권',
  '그룹',
  '개인',
  '온라인',
];

function ProductGroupSection({
  products,
  onBuy,
}: {
  products: MarketProduct[];
  onBuy: (p: MarketProduct) => void;
}) {
  const grouped = PRODUCT_ORDER.reduce<Record<string, MarketProduct[]>>(
    (acc, cat) => {
      const items = products.filter((p) => p.productCategory === cat);
      if (items.length > 0) acc[cat] = items;
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([cat, items]) => (
        <section key={cat}>
          <p className="text-body-sm font-bold text-content-secondary mb-3 px-4">
            {cat}
          </p>
          <div className="space-y-3 px-4">
            {items.map((p) => (
              <Card key={p.id} variant="outline" padding="none" className="overflow-hidden">
                <div className="flex gap-0">
                  <div className="w-24 shrink-0 bg-surface-tertiary">
                    <img
                      src={p.thumbnailUrl}
                      alt={p.name}
                      className="w-full h-full object-cover aspect-square"
                    />
                  </div>
                  <div className="flex-1 p-3 flex flex-col gap-1 min-w-0">
                    <p className="text-body font-semibold text-content line-clamp-2 leading-snug">
                      {p.name}
                    </p>
                    <p className="text-caption text-content-tertiary">
                      {p.duration}
                      {p.sessions ? ` · ${p.sessions}회` : ''}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-1">
                      <PriceTag
                        price={p.price}
                        originalPrice={p.originalPrice}
                        size="sm"
                        showDiscountPercent
                      />
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => onBuy(p)}
                        className="shrink-0"
                      >
                        결제하기
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ── 리뷰 카드 ── */
function ReviewCard({ review }: { review: CenterReview }) {
  return (
    <Card variant="flat" padding="none" className="border border-line p-4">
      <div className="flex items-center gap-2.5 mb-2">
        <Avatar
          src={review.authorAvatar}
          name={review.authorName}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-body-sm font-semibold text-content">
              {review.authorName}
            </span>
            {review.isVerified && (
              <span className="inline-flex items-center gap-0.5 text-micro text-primary font-medium">
                <CheckCircle2 className="w-3 h-3" />
                방문 인증
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <StarRow rating={review.rating} />
            <span className="text-micro text-content-tertiary">
              {review.createdAt}
            </span>
          </div>
        </div>
      </div>
      <p className="text-body-sm text-content line-clamp-3 leading-relaxed">
        {review.body}
      </p>
      {review.images.length > 0 && (
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
          {review.images.map((url, i) => (
            <div
              key={i}
              className="shrink-0 w-20 h-20 rounded-card overflow-hidden bg-surface-tertiary"
            >
              <img
                src={url}
                alt={`리뷰 사진 ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ── 강사 카드 ── */
function TrainerCard({
  trainer,
  onClick,
}: {
  trainer: MarketTrainer;
  onClick: () => void;
}) {
  return (
    <Card
      variant="soft"
      padding="none"
      interactive
      className="p-4"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <Avatar src={trainer.profileUrl} name={trainer.name} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-body font-bold text-content">{trainer.name}</p>
            <span className="text-caption text-content-tertiary">
              경력 {trainer.experienceYears}년
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <Star className="w-3.5 h-3.5 text-state-warning fill-state-warning" />
            <span className="text-caption font-semibold text-content">
              {trainer.rating.toFixed(1)}
            </span>
            <span className="text-caption text-content-tertiary">
              ({trainer.reviewCount})
            </span>
          </div>
          <p className="text-caption text-content-secondary mt-1 line-clamp-1">
            {trainer.specialties.join(' · ')}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-content-tertiary shrink-0" />
      </div>
    </Card>
  );
}

/* ── 홈 탭 ── */
function HomeTab({
  center,
  products,
  reviews,
  trainers,
  onMoreReviews,
  onMoreTrainers,
  onBuyProduct,
  onNavigateProduct,
}: {
  center: ReturnType<typeof getCenterById> & object;
  products: MarketProduct[];
  reviews: CenterReview[];
  trainers: MarketTrainer[];
  onMoreReviews: () => void;
  onMoreTrainers: () => void;
  onBuyProduct: (p: MarketProduct) => void;
  onNavigateProduct: (p: MarketProduct) => void;
}) {
  const repProducts = products.filter((p) => p.isRepresentative).slice(0, 2);
  const recentReviews = reviews.slice(0, 3);

  return (
    <div className="space-y-6 px-4 py-4">
      {/* 소개 */}
      <section>
        <SectionHeader title="센터 소개" />
        <p className="text-body text-content-secondary leading-relaxed">
          {center.description}
        </p>
      </section>

      {/* 대표 상품 */}
      {repProducts.length > 0 && (
        <section>
          <SectionHeader
            title="대표 상품"
            actionLabel="전체보기"
            onAction={() => onNavigateProduct(repProducts[0])}
          />
          <div className="space-y-3">
            {repProducts.map((p) => (
              <Card key={p.id} variant="outline" padding="none" className="overflow-hidden">
                <div className="flex">
                  <div className="w-20 shrink-0 bg-surface-tertiary">
                    <img
                      src={p.thumbnailUrl}
                      alt={p.name}
                      className="w-full h-full object-cover aspect-square"
                    />
                  </div>
                  <div className="flex-1 p-3 flex flex-col gap-1 min-w-0">
                    <p className="text-caption text-primary font-semibold">
                      {p.productCategory}
                    </p>
                    <p className="text-body font-semibold text-content line-clamp-2 leading-snug">
                      {p.name}
                    </p>
                    <p className="text-caption text-content-tertiary">
                      {p.duration}
                      {p.sessions ? ` · ${p.sessions}회` : ''}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <PriceTag
                        price={p.price}
                        originalPrice={p.originalPrice}
                        size="sm"
                        showDiscountPercent
                      />
                      <Button size="sm" onClick={() => onBuyProduct(p)}>
                        결제하기
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 최근 리뷰 */}
      {recentReviews.length > 0 && (
        <section>
          <SectionHeader
            title="최근 리뷰"
            actionLabel={`전체보기 (${reviews.length})`}
            onAction={onMoreReviews}
          />
          <div className="space-y-3">
            {recentReviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        </section>
      )}

      {/* 강사 미리보기 */}
      {trainers.length > 0 && (
        <section>
          <SectionHeader
            title="강사진"
            actionLabel="전체보기"
            onAction={onMoreTrainers}
          />
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {trainers.slice(0, 5).map((t) => (
              <div
                key={t.id}
                className="shrink-0 flex flex-col items-center gap-2 w-20"
              >
                <Avatar src={t.profileUrl} name={t.name} size="xl" ring />
                <p className="text-caption font-semibold text-content text-center line-clamp-1">
                  {t.name}
                </p>
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 text-state-warning fill-state-warning" />
                  <span className="text-micro text-content-secondary font-semibold">
                    {t.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ── 리뷰 탭 ── */
function ReviewsTab({
  centerId,
  reviews,
}: {
  centerId: number;
  reviews: CenterReview[];
}) {
  const [showAll, setShowAll] = useState(false);
  const dist = getCenterRatingDistribution(centerId);
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;
  const maxCount = Math.max(...dist.map((d) => d.count), 1);
  const displayed = showAll ? reviews : reviews.slice(0, 5);

  return (
    <div className="px-4 py-4 space-y-5">
      {/* 평점 요약 */}
      <Card variant="soft" padding="md">
        <div className="flex items-center gap-6">
          {/* 평균 */}
          <div className="flex flex-col items-center shrink-0">
            <span className="text-display font-bold text-content leading-none">
              {avgRating.toFixed(1)}
            </span>
            <StarRow rating={avgRating} />
            <span className="text-caption text-content-tertiary mt-1">
              {reviews.length}개 리뷰
            </span>
          </div>

          {/* 분포 바 차트 */}
          <div className="flex-1 h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dist}
                layout="vertical"
                margin={{ top: 0, right: 8, bottom: 0, left: 8 }}
                barSize={8}
              >
                <XAxis type="number" hide domain={[0, maxCount]} />
                <YAxis
                  type="category"
                  dataKey="star"
                  tick={{ fontSize: 11, fill: '#888' }}
                  tickFormatter={(v) => `${v}★`}
                  width={28}
                />
                <Bar dataKey="count" radius={4}>
                  {dist.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.count > 0 ? '#0E7C7B' : '#E5E7EB'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* 리뷰 카드 목록 */}
      <div className="space-y-3">
        {displayed.map((r) => (
          <ReviewCard key={r.id} review={r} />
        ))}
      </div>

      {!showAll && reviews.length > 5 && (
        <Button
          variant="outline"
          fullWidth
          onClick={() => setShowAll(true)}
        >
          리뷰 전체보기 ({reviews.length})
        </Button>
      )}
    </div>
  );
}

/* ── 위치 탭 ── */
function LocationTab({
  center,
}: {
  center: NonNullable<ReturnType<typeof getCenterById>>;
}) {
  return (
    <div className="px-4 py-4 space-y-4">
      {/* Mock 지도 */}
      <div className="relative w-full aspect-video rounded-card-lg overflow-hidden bg-gradient-to-br from-primary-light via-surface-tertiary to-accent-light flex items-center justify-center">
        {/* 그리드 라인 */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`h${i}`}
              className="absolute w-full h-px bg-content"
              style={{ top: `${(i + 1) * 12.5}%` }}
            />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`v${i}`}
              className="absolute h-full w-px bg-content"
              style={{ left: `${(i + 1) * 12.5}%` }}
            />
          ))}
        </div>
        {/* 핀 */}
        <div className="relative flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-card-elevated">
            <MapPin className="w-5 h-5 text-white fill-white" />
          </div>
          <div className="mt-2 px-3 py-1 bg-surface rounded-pill shadow-card-soft text-caption font-semibold text-content max-w-[200px] text-center line-clamp-1">
            {center.name}
          </div>
        </div>
      </div>

      {/* 주소 */}
      <Card variant="outline" padding="md">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-body-sm font-semibold text-content">주소</p>
              <p className="text-body-sm text-content-secondary mt-0.5">
                {center.address}
              </p>
            </div>
          </div>

          <div className="h-px bg-line" />

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-body-sm font-semibold text-content mb-1.5">
                영업시간
              </p>
              <div className="space-y-1">
                <div className="flex justify-between text-body-sm">
                  <span className="text-content-secondary">평일</span>
                  <span className="text-content font-medium">
                    {center.openingHours.weekday}
                  </span>
                </div>
                <div className="flex justify-between text-body-sm">
                  <span className="text-content-secondary">주말</span>
                  <span className="text-content font-medium">
                    {center.openingHours.weekend}
                  </span>
                </div>
                <div className="flex justify-between text-body-sm">
                  <span className="text-content-secondary">공휴일</span>
                  <span className="text-content font-medium">
                    {center.openingHours.holiday}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-line" />

          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1 flex items-center justify-between">
              <p className="text-body-sm font-semibold text-content">전화</p>
              <a
                href={`tel:${center.phone}`}
                className="text-body-sm text-primary font-semibold hover:underline"
              >
                {center.phone}
              </a>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ── 메인 컴포넌트 ── */
export default function CenterDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const center = getCenterById(Number(id));

  const { isScrapped, toggleScrap } = useMarketStore();
  const [activeTab, setActiveTab] = useState<TabId>('홈');
  const [carouselIdx, setCarouselIdx] = useState(0);

  if (!center) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-content-secondary">센터를 찾을 수 없습니다</p>
      </div>
    );
  }

  const products = getProductsByCenter(center.id);
  const reviews = getReviewsByCenter(center.id);
  const trainers = getTrainersByCenter(center.id);
  const scrapped = isScrapped('center', center.id);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : center.rating.toFixed(1);

  return (
    <div className="flex flex-col min-h-screen bg-surface-secondary page-with-action pb-32">
      {/* ── 이미지 캐러셀 ── */}
      <div className="relative">
        <div className="overflow-x-auto snap-x snap-mandatory flex scrollbar-hide">
          {center.images.map((url, i) => (
            <div
              key={i}
              className="shrink-0 w-full snap-center"
              onScroll={() => setCarouselIdx(i)}
            >
              <div className="w-full aspect-video bg-surface-tertiary">
                <img
                  src={url}
                  alt={`${center.name} ${i + 1}`}
                  className="w-full h-full object-cover"
                  onLoad={() => {}} // eager load
                />
              </div>
            </div>
          ))}
        </div>

        {/* 이미지 도트 인디케이터 */}
        <div className="absolute bottom-3 right-4 flex gap-1.5">
          {center.images.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-pill transition-all duration-200 ${
                i === carouselIdx
                  ? 'w-4 bg-white'
                  : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* 플로팅 헤더 오버레이 */}
        <div className="absolute top-0 inset-x-0 flex items-center justify-between px-4 pt-safe pt-4 pb-3 bg-gradient-to-b from-black/40 to-transparent">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="뒤로"
            className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="공유"
              className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label={scrapped ? '스크랩 취소' : '스크랩'}
              onClick={() => toggleScrap('center', center.id)}
              className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  scrapped ? 'text-state-error fill-state-error' : 'text-white'
                }`}
              />
            </button>
            <button
              type="button"
              aria-label="알림"
              className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── 센터 정보 카드 ── */}
      <div className="bg-surface px-4 pt-4 pb-3 shadow-card-soft">
        {/* 배지 행 */}
        <div className="flex items-center gap-1.5 mb-2">
          <Badge tone="primary" variant="soft" size="sm">
            {center.category === 'fitness'
              ? '피트니스'
              : center.category === 'pilates'
                ? '필라테스'
                : center.category === 'yoga'
                  ? '요가'
                  : center.category === 'golf'
                    ? '골프'
                    : center.category === 'crossfit'
                      ? '크로스핏'
                      : center.category === 'spinning'
                        ? '스피닝'
                        : center.category === 'boxing'
                          ? '복싱'
                          : center.category === 'swimming'
                            ? '수영'
                            : center.category.toUpperCase()}
          </Badge>
          {center.isPromoted && (
            <Badge tone="warning" variant="soft" size="sm">
              추천
            </Badge>
          )}
          {center.isNew && (
            <Badge tone="accent" variant="soft" size="sm">
              NEW
            </Badge>
          )}
        </div>

        {/* 센터명 */}
        <h1 className="text-h1 font-bold text-content leading-tight">
          {center.name}
        </h1>

        {/* 위치 */}
        <p className="flex items-center gap-1 text-body-sm text-content-secondary mt-1">
          <MapPin className="w-4 h-4 text-primary shrink-0" />
          {center.district} {center.dong} · 내 위치에서{' '}
          {center.distanceKm.toFixed(1)}km
        </p>

        {/* 별점 행 */}
        <div className="flex items-center gap-2 mt-2">
          <StarRow rating={center.rating} />
          <span className="text-body-sm font-bold text-content">
            {avgRating}
          </span>
          <button
            type="button"
            onClick={() => navigate(`/centers/${center.id}/reviews`)}
            className="text-body-sm text-primary hover:underline"
          >
            후기 {reviews.length > 0 ? reviews.length : center.reviewCount}개
          </button>
        </div>

        {/* 전체 주소 */}
        <p className="text-caption text-content-tertiary mt-1.5">
          {center.address}
        </p>

        {/* 퀵 스탯 */}
        <div className="mt-4 grid grid-cols-3 divide-x divide-line border border-line rounded-card overflow-hidden">
          {[
            {
              label: '평점',
              value: avgRating,
              icon: <Star className="w-4 h-4 text-state-warning fill-state-warning" />,
            },
            {
              label: '후기',
              value: `${reviews.length > 0 ? reviews.length : center.reviewCount}개`,
              icon: <CheckCircle2 className="w-4 h-4 text-primary" />,
            },
            {
              label: '거리',
              value: `${center.distanceKm.toFixed(1)}km`,
              icon: <MapPin className="w-4 h-4 text-primary" />,
            },
          ].map(({ label, value, icon }) => (
            <div
              key={label}
              className="flex flex-col items-center py-3 gap-1 bg-surface"
            >
              {icon}
              <span className="text-body-sm font-bold text-content">{value}</span>
              <span className="text-micro text-content-tertiary">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Sticky 탭 바 ── */}
      <div className="sticky top-0 z-20 bg-surface border-b border-line flex">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-body-sm font-semibold transition-colors relative ${
              activeTab === tab
                ? 'text-primary'
                : 'text-content-secondary hover:text-content'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* ── 탭 콘텐츠 ── */}
      {activeTab === '홈' && (
        <HomeTab
          center={center}
          products={products}
          reviews={reviews}
          trainers={trainers}
          onMoreReviews={() => setActiveTab('리뷰')}
          onMoreTrainers={() => setActiveTab('강사')}
          onBuyProduct={() => navigate(`/checkout?centerId=${center.id}`)}
          onNavigateProduct={() => setActiveTab('상품')}
        />
      )}

      {activeTab === '상품' && (
        <div className="py-4">
          {products.length === 0 ? (
            <p className="text-center text-content-tertiary py-10">
              등록된 상품이 없습니다
            </p>
          ) : (
            <ProductGroupSection
              products={products}
              onBuy={() => navigate(`/checkout?centerId=${center.id}`)}
            />
          )}
        </div>
      )}

      {activeTab === '리뷰' && (
        <ReviewsTab centerId={center.id} reviews={reviews} />
      )}

      {activeTab === '강사' && (
        <div className="px-4 py-4 space-y-3">
          {trainers.length === 0 ? (
            <p className="text-center text-content-tertiary py-10">
              등록된 강사가 없습니다
            </p>
          ) : (
            trainers.map((t) => (
              <TrainerCard
                key={t.id}
                trainer={t}
                onClick={() => navigate(`/trainers/${t.id}`)}
              />
            ))
          )}
        </div>
      )}

      {activeTab === '위치' && <LocationTab center={center} />}

      {/* ── Bottom Action Bar ── (모바일 프레임 폭) */}
      <div className="bottom-action-bar flex items-center gap-3">
        {/* 스크랩 토글 */}
        <button
          type="button"
          aria-label={scrapped ? '스크랩 취소' : '스크랩'}
          onClick={() => toggleScrap('center', center.id)}
          className={`w-12 h-12 rounded-button border flex items-center justify-center shrink-0 transition-colors ${
            scrapped
              ? 'bg-state-error/10 border-state-error text-state-error'
              : 'bg-surface border-line-strong text-content-secondary hover:bg-surface-secondary'
          }`}
        >
          <Heart
            className={`w-5 h-5 ${scrapped ? 'fill-state-error' : ''}`}
          />
        </button>

        {/* 문의 버튼 */}
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={() =>
            navigate(`/messages?centerId=${center.id}&centerName=${encodeURIComponent(center.name)}`)
          }
        >
          센터에 문의
        </Button>

        {/* 결제 버튼 */}
        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          onClick={() => navigate(`/checkout?centerId=${center.id}`)}
        >
          결제하기
        </Button>
      </div>
    </div>
  );
}
