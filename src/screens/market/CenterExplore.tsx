'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import {
  MOCK_CENTERS,
  MOCK_PRODUCTS,
  SORT_OPTIONS,
  sortCenters,
  type SortOption,
  type MarketCenter,
} from '@/lib/marketplace';
import Chip from '@/components/ui/Chip';
import SearchBar from '@/components/ui/SearchBar';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import Tag from '@/components/ui/Tag';
import Button from '@/components/ui/Button';

// ─── 헬퍼 ────────────────────────────────────────────────────
function discountPct(original: number, price: number) {
  return Math.round(((original - price) / original) * 100);
}

function hasTrialProduct(centerId: number) {
  return MOCK_PRODUCTS.some(
    (p) => p.centerId === centerId && p.productCategory === '체험권'
  );
}

// ─── 센터 수평 카드 ───────────────────────────────────────────
function CenterHorizontalCard({ center, onClick }: { center: MarketCenter; onClick: () => void }) {
  const repPrice = center.representativeProduct.price;
  const repOriginal = center.representativeProduct.originalPrice;
  const hasTrial = hasTrialProduct(center.id);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full gap-3 p-3 text-left bg-surface rounded-card shadow-card-soft active:opacity-90"
    >
      {/* 이미지 */}
      <div className="relative w-24 h-24 shrink-0 rounded-card overflow-hidden bg-surface-tertiary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={center.thumbnailUrl}
          alt={center.name}
          className="w-full h-full object-cover"
        />
        {center.isNew && (
          <span className="absolute top-1.5 left-1.5 bg-state-success text-white text-micro font-bold px-1.5 py-0.5 rounded-pill">
            NEW
          </span>
        )}
        {center.isPromoted && !center.isNew && (
          <span className="absolute top-1.5 left-1.5 bg-primary text-white text-micro font-bold px-1.5 py-0.5 rounded-pill">
            추천
          </span>
        )}
      </div>

      {/* 정보 */}
      <div className="flex-1 min-w-0 flex flex-col">
        <p className="text-caption text-primary font-medium truncate">{center.category}</p>
        <h3 className="text-body font-semibold text-content line-clamp-1 mt-0.5">
          {center.name}
        </h3>
        <p className="text-caption text-content-tertiary mt-0.5 line-clamp-1">
          {center.dong} · {center.address}
        </p>
        <p className="text-caption text-primary font-medium mt-0.5">
          내 위치에서 {center.distanceKm.toFixed(1)}km
        </p>

        {/* 별점 */}
        <div className="flex items-center gap-1.5 mt-1">
          <span className="inline-flex items-center gap-1 text-caption text-content-secondary">
            <Star className="w-3.5 h-3.5 text-state-warning fill-state-warning" />
            <span className="font-semibold text-content">{center.rating.toFixed(1)}</span>
            <span className="text-content-tertiary">후기 {center.reviewCount}</span>
          </span>
        </div>

        {/* 가격 */}
        <div className="flex items-baseline gap-1 mt-1">
          {repOriginal && (
            <span className="text-caption text-state-sale font-bold">
              {discountPct(repOriginal, repPrice)}%
            </span>
          )}
          {repOriginal && (
            <span className="text-caption text-content-tertiary line-through">
              {repOriginal.toLocaleString()}원
            </span>
          )}
          <span className="text-body-sm font-bold text-content">
            {repPrice.toLocaleString()}원~
          </span>
        </div>

        {/* 시설 태그 */}
        <div className="flex flex-wrap gap-1 mt-1.5">
          {hasTrial && (
            <Tag size="sm" className="bg-primary-light text-primary border-0">
              체험권
            </Tag>
          )}
          {center.facilities.slice(0, 3).map((f) => (
            <Tag key={f} size="sm">
              {f}
            </Tag>
          ))}
        </div>
      </div>
    </button>
  );
}

// ─── 메인 ─────────────────────────────────────────────────────
export default function CenterExplore() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeSort, setActiveSort] = useState<SortOption>('최신순');

  // 검색 + 정렬 필터
  const filtered: MarketCenter[] = (() => {
    let result = [...MOCK_CENTERS];

    // 검색어 필터
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.dong.toLowerCase().includes(q) ||
          c.district.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }

    // 정렬
    result = sortCenters(result, activeSort);
    return result;
  })();

  // 정렬 옵션 (가격 낮은 순 제외)
  const displaySortOptions = SORT_OPTIONS.filter((s) => s !== '가격 낮은 순');

  return (
    <div className="min-h-screen bg-surface-secondary pb-28">
      {/* 헤더 */}
      <PageHeader
        title="내 주변"
        showBack={false}
        showNotification
        notificationCount={2}
      />

      {/* 검색바 */}
      <div className="px-5 pt-3 pb-2 bg-surface sticky top-14 z-20 border-b border-line">
        <SearchBar
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery('')}
          showFilter
          placeholder="장소, 종목으로 검색해보세요"
        />

        {/* 정렬 칩 */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3 pb-0.5">
          {displaySortOptions.map((opt) => (
            <Chip
              key={opt}
              active={activeSort === opt}
              size="sm"
              onClick={() => setActiveSort(opt)}
            >
              {opt}
            </Chip>
          ))}
        </div>
      </div>

      {/* 결과 수 */}
      <div className="px-5 py-3 flex items-center justify-between">
        <p className="text-body-sm text-content-secondary">
          총 <span className="font-bold text-content">{filtered.length}</span>개 센터
        </p>
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="text-caption text-primary font-medium"
          >
            검색 초기화
          </button>
        )}
      </div>

      {/* 센터 목록 */}
      <div className="px-5 space-y-3">
        {filtered.length === 0 ? (
          <EmptyState
            title="검색 결과가 없습니다"
            description="다른 검색어나 필터를 사용해보세요"
            size="md"
          />
        ) : (
          filtered.map((center) => (
            <CenterHorizontalCard
              key={center.id}
              center={center}
              onClick={() => navigate(`/centers/${center.id}`)}
            />
          ))
        )}
      </div>

      {/* 지도보기 FAB */}
      <button
        type="button"
        onClick={() => navigate('/centers/map')}
        className="fixed bottom-24 right-5 z-30 flex items-center gap-2 bg-primary text-white rounded-pill px-4 h-11 shadow-fab font-semibold text-body-sm active:bg-primary-dark"
      >
        <MapPin className="w-4 h-4" />
        지도보기
      </button>
    </div>
  );
}
