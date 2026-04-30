'use client';

import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  Clock,
  TrendingUp,
  X,
} from 'lucide-react';
import {
  CATEGORIES,
  PRODUCT_CATEGORIES,
  MOCK_CENTERS,
  MOCK_PRODUCTS,
  filterCentersByCategory,
  type CategoryId,
  type ProductCategory,
  type MarketCenter,
} from '@/lib/marketplace';
import { useMarketStore } from '@/stores/marketStore';
import {
  SearchBar,
  Chip,
  Badge,
  Tag,
  EmptyState,
  PriceTag,
} from '@/components/ui';

/* ── 카테고리 레이블 (CategoryId → 한글) ── */
const CATEGORY_LABEL: Record<Exclude<CategoryId, 'all'>, string> = {
  fitness: '피트니스',
  pilates: '필라테스',
  yoga: '요가',
  golf: '골프',
  crossfit: '크로스핏',
  spinning: '스피닝',
  boxing: '복싱',
  swimming: '수영',
  pt: 'PT',
};

const POPULAR_KEYWORDS = ['필라테스', 'PT', '요가', '골프', '체험권'];

/* ── 검색 결과 카드 ── */
interface ResultCardProps {
  center: MarketCenter;
  onClick: () => void;
}

function ResultCard({ center, onClick }: ResultCardProps) {
  const repProduct = MOCK_PRODUCTS.find(
    (p) => p.centerId === center.id && p.isRepresentative
  );

  const displayFacilities = center.facilities.slice(0, 7);
  const extraCount = center.facilities.length - displayFacilities.length;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-surface rounded-card-lg overflow-hidden shadow-card-soft touch-card"
    >
      {/* 16:9 이미지 */}
      <div className="relative w-full aspect-video overflow-hidden bg-surface-tertiary">
        <img
          src={center.thumbnailUrl}
          alt={center.name}
          className="w-full h-full object-cover"
        />
        {/* 배지 오버레이 */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {center.isPromoted && (
            <Badge tone="warning" variant="solid" size="sm">
              추천
            </Badge>
          )}
          {center.isNew && (
            <Badge tone="accent" variant="solid" size="sm">
              NEW
            </Badge>
          )}
        </div>
      </div>

      {/* 본문 */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-caption text-primary font-semibold mb-0.5">
              {CATEGORY_LABEL[center.category as Exclude<CategoryId, 'all'>] ?? center.category}
            </p>
            <h3 className="text-h4 font-bold text-content leading-snug">
              {center.name}
            </h3>
            <p className="text-caption text-content-tertiary mt-0.5 truncate">
              {center.district} {center.dong} · {center.distanceKm.toFixed(1)}km
            </p>
          </div>

          {/* 대표 상품 배지 */}
          {repProduct?.isRepresentative && (
            <Badge tone="primary" variant="outline" size="sm" className="shrink-0 mt-0.5">
              대표 상품
            </Badge>
          )}
        </div>

        {/* 가격 */}
        <div className="mt-3 flex justify-end">
          <PriceTag
            price={center.representativeProduct.price}
            originalPrice={center.representativeProduct.originalPrice}
            size="md"
            align="right"
            showDiscountPercent
          />
        </div>

        {/* 시설 태그 */}
        {displayFacilities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {displayFacilities.map((f) => (
              <Tag key={f} size="sm">
                {f}
              </Tag>
            ))}
            {extraCount > 0 && (
              <Tag size="sm" className="text-content-tertiary">
                +{extraCount}
              </Tag>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

/* ── 메인 컴포넌트 ── */
export default function CenterCategorySearch() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { district, recentKeywords, addRecentKeyword, clearRecentKeywords } =
    useMarketStore();

  const [query, setQuery] = useState('');

  const selectedCategory = (searchParams.get('category') as CategoryId) || 'all';
  const selectedType = (searchParams.get('type') as ProductCategory) || '전체';

  /* 카테고리 필터 (pt 제외) */
  const visibleCategories = CATEGORIES.filter((c) => c.id !== 'pt');

  /* 결과 필터링 */
  const filtered = filterCentersByCategory(MOCK_CENTERS, selectedCategory).filter((c) => {
    const matchesType =
      selectedType === '전체' ||
      MOCK_PRODUCTS.some(
        (p) => p.centerId === c.id && p.productCategory === selectedType
      );
    const matchesQuery =
      !query ||
      c.name.includes(query) ||
      c.description.includes(query) ||
      c.district.includes(query) ||
      c.dong.includes(query);
    return matchesType && matchesQuery;
  });

  const setCategory = useCallback(
    (id: CategoryId) => {
      const next = new URLSearchParams(searchParams);
      next.set('category', id);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const setType = useCallback(
    (type: ProductCategory) => {
      const next = new URLSearchParams(searchParams);
      next.set('type', type);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const handleSearch = (kw: string) => {
    const trimmed = kw.trim();
    if (!trimmed) return;
    addRecentKeyword(trimmed);
    setQuery(trimmed);
  };

  const handleKeywordClick = (kw: string) => {
    setQuery(kw);
    addRecentKeyword(kw);
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-secondary">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-30 bg-surface border-b border-line flex items-center gap-3 px-4 h-14 shrink-0">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로"
          className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-secondary text-content"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* 지역 드롭다운 — 둘러보기 홈에서 변경 */}
        <button
          type="button"
          onClick={() => navigate('/centers')}
          className="flex items-center gap-1 text-body font-semibold text-content active:opacity-70"
          aria-label="지역 변경"
        >
          {district}
          <ChevronDown className="w-4 h-4 text-content-secondary" />
        </button>

        <div className="flex-1" />

        <button
          type="button"
          aria-label="알림"
          onClick={() => navigate('/notifications')}
          className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-secondary text-content-secondary"
        >
          <Bell className="w-5 h-5" />
        </button>
      </header>

      {/* ── 검색 + 칩 필터 (sticky) ── */}
      <div className="sticky top-14 z-20 bg-surface border-b border-line">
        {/* 검색바 */}
        <div className="px-4 pt-3 pb-2">
          <SearchBar
            size="lg"
            bordered
            placeholder="원하시는 수업을 찾아보세요"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery('')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch(query);
            }}
          />
        </div>

        {/* 1차 카테고리 칩 */}
        <div className="flex gap-2 px-4 pb-2 overflow-x-auto scrollbar-hide">
          {visibleCategories.map((cat) => (
            <Chip
              key={cat.id}
              size="md"
              active={selectedCategory === cat.id}
              onClick={() => setCategory(cat.id)}
              className="shrink-0"
            >
              <span className="mr-0.5">{cat.icon}</span>
              {cat.label}
            </Chip>
          ))}
        </div>

        {/* 2차 상품 카테고리 칩 */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {PRODUCT_CATEGORIES.map((type) => (
            <Chip
              key={type}
              size="sm"
              variant="outline"
              active={selectedType === type}
              onClick={() => setType(type)}
              className="shrink-0"
            >
              {type}
            </Chip>
          ))}
        </div>
      </div>

      {/* ── 본문 ── */}
      <main className="flex-1 px-4 py-4 space-y-4">
        {/* 검색어 없을 때: 최근 검색 + 인기 검색 */}
        {!query && (
          <div className="space-y-5 pb-2">
            {/* 최근 검색 */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <p className="text-body-sm font-semibold text-content flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-content-secondary" />
                  최근 검색
                </p>
                {recentKeywords.length > 0 && (
                  <button
                    type="button"
                    onClick={clearRecentKeywords}
                    className="text-caption text-content-tertiary hover:text-content flex items-center gap-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    전체 삭제
                  </button>
                )}
              </div>
              {recentKeywords.length === 0 ? (
                <p className="text-caption text-content-tertiary py-3">최근 검색어가 없습니다</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {recentKeywords.map((kw) => (
                    <Chip
                      key={kw}
                      size="sm"
                      variant="soft"
                      onClick={() => handleKeywordClick(kw)}
                    >
                      {kw}
                    </Chip>
                  ))}
                </div>
              )}
            </section>

            {/* 인기 검색 */}
            <section>
              <p className="text-body-sm font-semibold text-content flex items-center gap-1.5 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                인기 검색
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_KEYWORDS.map((kw) => (
                  <Chip
                    key={kw}
                    size="sm"
                    variant="outline"
                    onClick={() => handleKeywordClick(kw)}
                  >
                    {kw}
                  </Chip>
                ))}
              </div>
            </section>

            {/* 구분선 */}
            <div className="h-px bg-line" />
          </div>
        )}

        {/* 결과 수 */}
        {(query || selectedCategory !== 'all' || selectedType !== '전체') && (
          <p className="text-body-sm text-content-secondary">
            <span className="font-semibold text-primary">{filtered.length}</span>개의 센터
          </p>
        )}

        {/* 결과 카드 목록 */}
        {filtered.length === 0 ? (
          <EmptyState
            title="검색 결과가 없습니다"
            description="다른 카테고리나 키워드로 다시 찾아보세요"
            size="md"
          />
        ) : (
          <div className="space-y-4">
            {filtered.map((center) => (
              <ResultCard
                key={center.id}
                center={center}
                onClick={() => navigate(`/centers/${center.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
