'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crosshair, Star } from 'lucide-react';
import { MOCK_CENTERS, type MarketCenter } from '@/lib/marketplace';
import PageHeader from '@/components/ui/PageHeader';
import SearchBar from '@/components/ui/SearchBar';
import Button from '@/components/ui/Button';

// ─── 핀 위치 (고정 mock — id 기반 랜덤처럼 보이도록) ────────
const PIN_POSITIONS: Record<number, { top: string; left: string }> = {
  1:  { top: '28%', left: '52%' },
  2:  { top: '62%', left: '38%' },
  3:  { top: '44%', left: '68%' },
  4:  { top: '55%', left: '24%' },
  5:  { top: '34%', left: '74%' },
  6:  { top: '70%', left: '58%' },
  9:  { top: '48%', left: '48%' },
  16: { top: '38%', left: '42%' },
};

// 지도에 표시할 센터 (distanceKm 가까운 순 5개)
const MAP_CENTERS = [...MOCK_CENTERS]
  .sort((a, b) => a.distanceKm - b.distanceKm)
  .slice(0, 5);

// ─── SVG 그리드 배경 (지도 감) ────────────────────────────────
function MapGridOverlay() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0E7C7B" strokeWidth="0.8" />
        </pattern>
        <pattern id="gridBig" width="200" height="200" patternUnits="userSpaceOnUse">
          <rect width="200" height="200" fill="url(#grid)" />
          <path d="M 200 0 L 0 0 0 200" fill="none" stroke="#0E7C7B" strokeWidth="2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#gridBig)" />

      {/* mock 도로 */}
      <line x1="0" y1="42%" x2="100%" y2="42%" stroke="#0E7C7B" strokeWidth="3" opacity="0.5" />
      <line x1="0" y1="68%" x2="100%" y2="68%" stroke="#0E7C7B" strokeWidth="2" opacity="0.4" />
      <line x1="35%" y1="0" x2="35%" y2="100%" stroke="#0E7C7B" strokeWidth="3" opacity="0.5" />
      <line x1="65%" y1="0" x2="65%" y2="100%" stroke="#0E7C7B" strokeWidth="2" opacity="0.4" />
      <line x1="15%" y1="0" x2="15%" y2="100%" stroke="#0E7C7B" strokeWidth="1.5" opacity="0.25" />
      <line x1="82%" y1="0" x2="82%" y2="100%" stroke="#0E7C7B" strokeWidth="1.5" opacity="0.25" />

      {/* 공원 블록 */}
      <rect x="55%" y="20%" width="8%" height="10%" rx="4" fill="#0E7C7B" opacity="0.12" />
      <rect x="20%" y="55%" width="10%" height="8%" rx="4" fill="#0E7C7B" opacity="0.10" />

      {/* 건물 블록들 */}
      <rect x="37%" y="15%" width="5%" height="7%" rx="2" fill="#0E7C7B" opacity="0.08" />
      <rect x="44%" y="22%" width="4%" height="6%" rx="2" fill="#0E7C7B" opacity="0.08" />
      <rect x="37%" y="46%" width="6%" height="8%" rx="2" fill="#0E7C7B" opacity="0.06" />
      <rect x="66%" y="44%" width="5%" height="6%" rx="2" fill="#0E7C7B" opacity="0.08" />
    </svg>
  );
}

// ─── 가격 핀 ──────────────────────────────────────────────────
function PricePin({
  center,
  active,
  onClick,
}: {
  center: MarketCenter;
  active: boolean;
  onClick: () => void;
}) {
  const pos = PIN_POSITIONS[center.id] ?? { top: '50%', left: '50%' };
  const price = center.representativeProduct.price;
  const priceLabel =
    price >= 1000000
      ? `${(price / 10000).toFixed(0)}만원`
      : `${Math.round(price / 1000)}천원`;

  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute z-10 -translate-x-1/2 -translate-y-full"
      style={{ top: pos.top, left: pos.left }}
    >
      {/* 말풍선 */}
      <div
        className={`relative flex items-center justify-center rounded-pill px-2.5 py-1 text-caption font-bold shadow-fab transition-all duration-150
          ${active
            ? 'bg-primary text-white scale-110 shadow-lg'
            : 'bg-surface text-content shadow-card-elevated'
          }`}
      >
        {priceLabel}
        {/* 화살표 꼬리 */}
        <span
          className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0
            border-l-[5px] border-r-[5px] border-t-[6px]
            border-l-transparent border-r-transparent
            ${active ? 'border-t-primary' : 'border-t-surface'}`}
        />
      </div>
    </button>
  );
}

// ─── 하단 미니 카드 ───────────────────────────────────────────
function BottomMiniCard({
  center,
  active,
  onClick,
}: {
  center: MarketCenter;
  active: boolean;
  onClick: () => void;
}) {
  const navigate = useNavigate();
  const repPrice = center.representativeProduct.price;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 w-56 bg-surface rounded-card-lg p-3 text-left shadow-card-soft transition-all duration-150
        ${active ? 'ring-2 ring-primary shadow-card-elevated' : ''}`}
    >
      <div className="flex gap-3">
        <div className="w-14 h-14 shrink-0 rounded-card overflow-hidden bg-surface-tertiary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={center.thumbnailUrl} alt={center.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-micro text-primary font-medium">{center.dong}</p>
          <h4 className="text-body-sm font-semibold text-content line-clamp-2 leading-tight mt-0.5">
            {center.name}
          </h4>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 text-state-warning fill-state-warning" />
            <span className="text-micro font-semibold text-content">{center.rating.toFixed(1)}</span>
            <span className="text-micro text-content-tertiary">({center.reviewCount})</span>
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-body-sm font-bold text-content">
          {repPrice.toLocaleString()}원~
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/centers/${center.id}`);
          }}
          className="text-micro text-primary font-semibold bg-primary-light rounded-pill px-2.5 py-1"
        >
          상세보기
        </button>
      </div>
    </button>
  );
}

// ─── 현 위치 마커 ─────────────────────────────────────────────
function MyLocationMarker() {
  return (
    <div className="absolute z-20" style={{ top: '50%', left: '48%' }}>
      <div className="relative w-5 h-5 -translate-x-1/2 -translate-y-1/2">
        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
        <div className="relative w-5 h-5 bg-primary rounded-full border-2 border-white shadow-fab" />
      </div>
    </div>
  );
}

// ─── 메인 ─────────────────────────────────────────────────────
export default function CenterMap() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<number | null>(MAP_CENTERS[0]?.id ?? null);
  const [recenterKey, setRecenterKey] = useState(0);

  function handlePinClick(id: number) {
    setActiveId(id);
  }

  function handleCardClick(id: number) {
    setActiveId(id);
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-surface-secondary flex flex-col">
      {/* 상단 오버레이 (헤더 + 검색바 + 버튼들) */}
      <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none">
        {/* 헤더 */}
        <div className="pointer-events-auto">
          <PageHeader
            title="지도로 찾기"
            showBack={true}
            onBack={() => navigate(-1)}
            variant="default"
            sticky={false}
            rightSlot={
              <div className="flex items-center gap-1">
                {/* 현 위치 재중심 */}
                <button
                  type="button"
                  aria-label="현 위치 재중심"
                  onClick={() => setRecenterKey((k) => k + 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-surface shadow-card-soft text-primary active:bg-surface-secondary border border-line"
                >
                  <Crosshair className="w-4 h-4" />
                </button>
                {/* 목록보기 */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/centers')}
                >
                  목록보기
                </Button>
              </div>
            }
          />
        </div>

        {/* 검색바 */}
        <div className="pointer-events-auto px-4 pb-3 bg-surface border-b border-line">
          <SearchBar
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery('')}
            placeholder="센터명, 동으로 검색"
            bordered={false}
          />
        </div>
      </div>

      {/* 풀스크린 지도 배경 */}
      <div
        key={recenterKey}
        className="absolute inset-0 bg-gradient-to-br from-primary-light via-surface to-surface-tertiary"
      >
        <MapGridOverlay />

        {/* 내 위치 마커 */}
        <MyLocationMarker />

        {/* 가격 핀 */}
        {MAP_CENTERS.map((center) => (
          <PricePin
            key={center.id}
            center={center}
            active={activeId === center.id}
            onClick={() => handlePinClick(center.id)}
          />
        ))}
      </div>

      {/* 하단 미니 카드 스크롤 */}
      <div className="absolute bottom-24 left-0 right-0 z-20 pointer-events-none">
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 pb-2 pointer-events-auto">
          {MAP_CENTERS.map((center) => (
            <BottomMiniCard
              key={center.id}
              center={center}
              active={activeId === center.id}
              onClick={() => handleCardClick(center.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
