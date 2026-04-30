'use client';

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  QrCode,
  ScanLine,
  MapPin,
  Train,
  CalendarCheck,
  CreditCard,
  MessageSquare,
  Activity,
  Star,
  ChevronRight,
  ChevronDown,
  BookOpen,
  QrCode as QrIcon,
} from 'lucide-react';
import {
  MOCK_BANNERS,
  MOCK_CENTERS,
  MOCK_TRAINERS,
  MOCK_PRODUCTS,
  img,
} from '@/lib/marketplace';
import { useMarketStore } from '@/stores/marketStore';
import { useAuthStore } from '@/stores/authStore';
import Avatar from '@/components/ui/Avatar';
import SectionHeader from '@/components/ui/SectionHeader';
import ProductCard from '@/components/ui/ProductCard';
import Tag from '@/components/ui/Tag';

// ─── 헬퍼 ────────────────────────────────────────────────────
function discountPct(original: number, price: number) {
  return Math.round(((original - price) / original) * 100);
}

// ─── 배너 슬라이더 ────────────────────────────────────────────
function BannerSlider() {
  const navigate = useNavigate();
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.offsetWidth);
    setActiveIdx(idx);
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
      >
        {MOCK_BANNERS.map((banner) => (
          <button
            key={banner.id}
            type="button"
            onClick={() => navigate(banner.link)}
            className="shrink-0 w-full snap-start relative aspect-[16/7] overflow-hidden"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            {/* 그라디언트 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 text-left">
              <p className="text-white/80 text-caption mb-0.5">{banner.subtitle}</p>
              <h2 className="text-white text-h2 font-bold leading-tight">{banner.title}</h2>
            </div>
            {/* 인디케이터 */}
            <div className="absolute bottom-3 right-4 bg-black/40 rounded-pill px-2 py-0.5 text-white text-micro font-semibold">
              {banner.id} / {MOCK_BANNERS.length}
            </div>
          </button>
        ))}
      </div>
      {/* 하단 도트 */}
      <div className="flex justify-center gap-1.5 mt-2">
        {MOCK_BANNERS.map((b, i) => (
          <span
            key={b.id}
            className={`block rounded-full transition-all duration-200 ${i === activeIdx ? 'w-4 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-line-strong'}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── 퀵 위치 카드 ─────────────────────────────────────────────
function QuickLocationCards() {
  const navigate = useNavigate();
  return (
    <div className="px-5 grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => navigate('/centers')}
        className="bg-primary rounded-card p-4 text-left text-white flex items-start gap-3 shadow-card-soft active:opacity-90"
      >
        <div className="w-10 h-10 bg-white/20 rounded-button flex items-center justify-center shrink-0">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-body font-bold">내 주변 센터</p>
          <p className="text-caption text-white/75 mt-0.5">현재 위치 기준</p>
        </div>
      </button>
      <button
        type="button"
        onClick={() => navigate('/centers')}
        className="bg-accent rounded-card p-4 text-left text-white flex items-start gap-3 shadow-card-soft active:opacity-90"
      >
        <div className="w-10 h-10 bg-white/20 rounded-button flex items-center justify-center shrink-0">
          <Train className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-body font-bold">역세권 센터</p>
          <p className="text-caption text-white/75 mt-0.5">지하철역 인근</p>
        </div>
      </button>
    </div>
  );
}

// ─── 퀵 액션 바 ───────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: '예약하기', icon: CalendarCheck, path: '/classes', color: 'text-primary' },
  { label: '내 회원권', icon: CreditCard, path: '/membership', color: 'text-accent' },
  { label: '커뮤니티', icon: MessageSquare, path: '/notices', color: 'text-state-info' },
  { label: '건강기록', icon: Activity, path: '/workout-log', color: 'text-state-success' },
];

function QuickActions() {
  const navigate = useNavigate();
  return (
    <div className="px-5 grid grid-cols-4 gap-2">
      {QUICK_ACTIONS.map(({ label, icon: Icon, path, color }) => (
        <button
          key={label}
          type="button"
          onClick={() => navigate(path)}
          className="bg-surface rounded-card shadow-card-soft py-3 flex flex-col items-center gap-2 active:bg-surface-secondary"
        >
          <div className={`w-10 h-10 rounded-button bg-surface-secondary flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-caption text-content font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── 내 센터 섹션 ─────────────────────────────────────────────
function MyCenterSection() {
  const navigate = useNavigate();
  const member = useAuthStore((s) => s.member);
  if (!member) return null;

  // 만료일 D-day 계산 (mock 데이터 사용)
  const expiryDate = member.membershipExpiry ?? '2026-06-15';
  const today = new Date('2026-04-29');
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const dday = diffDays > 0 ? `D-${diffDays}` : diffDays === 0 ? 'D-Day' : '만료';

  return (
    <div className="px-5">
      <div className="bg-surface rounded-card-lg shadow-card-soft p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-caption text-content-tertiary">나의 센터</p>
            <h3 className="text-h4 font-bold text-content">{member.name}님의 센터</h3>
          </div>
          <div className="text-right">
            <span className="inline-block bg-primary-light text-primary text-caption font-bold px-2.5 py-1 rounded-pill">
              이용권 {dday}
            </span>
          </div>
        </div>
        {/* 센터 썸네일 */}
        <div className="relative h-28 rounded-card overflow-hidden mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img('center-1', 800, 300)}
            alt="내 센터"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-2 left-3 text-white">
            <p className="text-body-sm font-semibold">바디스위치 피트니스 옥수점</p>
          </div>
        </div>
        {/* 빠른 액션 3개 */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: '예약', icon: CalendarCheck, path: '/classes' },
            { label: 'QR 입장', icon: QrIcon, path: '/qr' },
            { label: '이용권', icon: BookOpen, path: '/membership' },
          ].map(({ label, icon: Icon, path }) => (
            <button
              key={label}
              type="button"
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-1.5 py-2.5 bg-surface-secondary rounded-button active:bg-surface-tertiary"
            >
              <Icon className="w-5 h-5 text-primary" />
              <span className="text-caption text-content font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 체험권 섹션 ──────────────────────────────────────────────
function TrialSection() {
  const navigate = useNavigate();
  const trials = MOCK_PRODUCTS.filter((p) => p.productCategory === '체험권').slice(0, 8);

  return (
    <div>
      <div className="px-5">
        <SectionHeader
          title="처음은 가볍게, 체험부터!"
          description="부담 없이 센터를 경험해보세요"
          actionLabel="전체보기"
          onAction={() => navigate('/centers/search')}
        />
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 pb-1">
        {trials.map((product) => (
          <div key={product.id} className="shrink-0 w-40">
            <ProductCard
              layout="vertical"
              imageUrl={product.thumbnailUrl}
              category={product.productCategory}
              title={product.name}
              subtitle={product.centerName}
              price={product.price}
              originalPrice={product.originalPrice}
              onClick={() => navigate(`/centers/${product.centerId}`)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 센터 추천 섹션 ───────────────────────────────────────────
function TopCentersSection() {
  const navigate = useNavigate();
  const topCenters = [...MOCK_CENTERS]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  return (
    <div>
      <div className="px-5">
        <SectionHeader
          title="센터 추천"
          description="평점 높은 센터 TOP 6"
          actionLabel="전체보기"
          onAction={() => navigate('/centers')}
        />
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 pb-1">
        {topCenters.map((center) => {
          const repPrice = center.representativeProduct.price;
          const repOriginal = center.representativeProduct.originalPrice;
          return (
            <button
              key={center.id}
              type="button"
              onClick={() => navigate(`/centers/${center.id}`)}
              className="shrink-0 w-44 bg-surface rounded-card overflow-hidden shadow-card-soft text-left active:opacity-90"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-surface-tertiary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={center.thumbnailUrl}
                  alt={center.name}
                  className="w-full h-full object-cover"
                />
                {center.isNew && (
                  <span className="absolute top-2 left-2 bg-state-success text-white text-micro font-bold px-2 py-0.5 rounded-pill">
                    NEW
                  </span>
                )}
                {center.isPromoted && (
                  <span className="absolute top-2 left-2 bg-primary text-white text-micro font-bold px-2 py-0.5 rounded-pill">
                    추천
                  </span>
                )}
              </div>
              <div className="p-3 flex flex-col gap-1">
                <p className="text-caption text-primary font-medium truncate">{center.dong}</p>
                <h3 className="text-body-sm font-semibold text-content line-clamp-2 leading-tight">{center.name}</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 text-state-warning fill-state-warning" />
                  <span className="text-caption font-semibold text-content">{center.rating.toFixed(1)}</span>
                  <span className="text-micro text-content-tertiary">({center.reviewCount})</span>
                </div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  {repOriginal && (
                    <span className="text-micro text-state-sale font-bold">
                      {discountPct(repOriginal, repPrice)}%
                    </span>
                  )}
                  <span className="text-caption font-bold text-content">
                    {repPrice.toLocaleString()}원~
                  </span>
                  {repOriginal && (
                    <span className="text-micro text-content-quaternary line-through">
                      {repOriginal.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── 강사 추천 섹션 ───────────────────────────────────────────
function TopTrainersSection() {
  const navigate = useNavigate();
  const topTrainers = [...MOCK_TRAINERS]
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, 8);

  return (
    <div>
      <div className="px-5">
        <SectionHeader
          title="고민하지 마, 리뷰 좋은 강사들!"
          description="평점 4.9 이상 강사 모음"
          actionLabel="전체보기"
          onAction={() => navigate('/trainers')}
        />
      </div>
      <div className="flex gap-4 overflow-x-auto no-scrollbar px-5 pb-1">
        {topTrainers.map((trainer) => (
          <button
            key={trainer.id}
            type="button"
            onClick={() => navigate(`/trainers/${trainer.id}`)}
            className="shrink-0 w-24 flex flex-col items-center gap-2 active:opacity-80"
          >
            <div className="relative">
              <Avatar src={trainer.profileUrl} name={trainer.name} size="xl" />
              <span className="absolute -bottom-1 -right-1 bg-surface rounded-pill px-1.5 py-0.5 text-micro font-bold text-state-warning shadow-card-soft flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-state-warning text-state-warning" />
                {trainer.rating.toFixed(1)}
              </span>
            </div>
            <div className="text-center">
              <p className="text-body-sm font-semibold text-content">{trainer.name}</p>
              <p className="text-micro text-content-tertiary line-clamp-1">{trainer.centerName}</p>
              <p className="text-micro text-content-quaternary mt-0.5">리뷰 {trainer.reviewCount}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── 최근 본 센터 ─────────────────────────────────────────────
function RecentCentersSection() {
  const navigate = useNavigate();
  // mock: 첫 3개 사용
  const recent = MOCK_CENTERS.slice(0, 3);

  return (
    <div className="px-5">
      <SectionHeader title="최근 본 센터" />
      <div className="flex flex-col gap-2">
        {recent.map((center) => {
          const repPrice = center.representativeProduct.price;
          const repOriginal = center.representativeProduct.originalPrice;
          return (
            <button
              key={center.id}
              type="button"
              onClick={() => navigate(`/centers/${center.id}`)}
              className="flex gap-3 p-3 bg-surface rounded-card shadow-card-soft text-left active:opacity-90"
            >
              <div className="w-16 h-16 shrink-0 rounded-card overflow-hidden bg-surface-tertiary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={center.thumbnailUrl} alt={center.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-caption text-primary font-medium">{center.category}</p>
                <h3 className="text-h4 text-content line-clamp-1 mt-0.5">{center.name}</h3>
                <p className="text-caption text-content-tertiary mt-0.5">
                  {center.dong} · 내 위치에서 {center.distanceKm}km
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-0.5 text-caption text-content-secondary">
                    <Star className="w-3 h-3 text-state-warning fill-state-warning" />
                    <span className="font-semibold">{center.rating.toFixed(1)}</span>
                    <span className="text-content-tertiary">({center.reviewCount})</span>
                  </span>
                  <span className="text-body-sm text-content font-bold">
                    {repOriginal && (
                      <span className="text-state-sale mr-0.5">{discountPct(repOriginal, repPrice)}%</span>
                    )}
                    {repPrice.toLocaleString()}원~
                  </span>
                </div>
              </div>
              <div className="flex items-start">
                <ChevronRight className="w-4 h-4 text-content-quaternary mt-1" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────
export default function ExploreHome() {
  const navigate = useNavigate();
  const district = useMarketStore((s) => s.district);
  const [districtOpen, setDistrictOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-secondary pb-24">
      {/* 스티키 헤더 */}
      <header className="sticky top-0 z-30 bg-surface border-b border-line flex items-center px-5 h-14">
        <button
          type="button"
          onClick={() => setDistrictOpen(!districtOpen)}
          aria-label="지역 변경"
          className="flex items-center gap-1.5 text-content font-bold text-body-lg active:opacity-70"
        >
          <MapPin className="w-4 h-4 text-primary" />
          <span>{district}</span>
          <ChevronDown className={`w-4 h-4 text-content-secondary transition-transform ${districtOpen ? 'rotate-180' : ''}`} />
        </button>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="알림"
            onClick={() => navigate('/notifications')}
            className="w-10 h-10 flex items-center justify-center rounded-full active:bg-surface-secondary text-content"
          >
            <Bell className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="QR 체크인"
            onClick={() => navigate('/qr')}
            className="w-10 h-10 flex items-center justify-center rounded-full active:bg-surface-secondary text-content"
          >
            <QrCode className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="센터 검색"
            onClick={() => navigate('/centers/search')}
            className="w-10 h-10 flex items-center justify-center rounded-full active:bg-surface-secondary text-content"
          >
            <ScanLine className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 행정구역 드롭다운 — backdrop은 viewport 전체, 시트는 모바일 프레임 폭 */}
      {districtOpen && (
        <>
          <button
            type="button"
            aria-label="지역 선택 닫기"
            className="fixed inset-0 z-30 bg-black/20"
            onClick={() => setDistrictOpen(false)}
          />
          <div
            className="mobile-fixed-width fixed top-14 z-40 px-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-surface rounded-card-lg shadow-card-elevated p-4">
              <p className="text-body-sm text-content-tertiary mb-3">지역 선택</p>
              {['강남구 논현동', '강남구 역삼동', '서초구 서초동', '송파구 잠실동', '마포구 홍대입구'].map((d) => (
                <button
                  key={d}
                  type="button"
                  className="w-full text-left py-2.5 px-2 text-body text-content rounded-button hover:bg-surface-secondary active:bg-surface-tertiary"
                  onClick={() => {
                    useMarketStore.getState().setDistrict(d);
                    setDistrictOpen(false);
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="space-y-5 pt-3">
        {/* 배너 */}
        <BannerSlider />

        {/* 퀵 위치 카드 */}
        <QuickLocationCards />

        {/* 퀵 액션 */}
        <QuickActions />

        {/* 내 센터 */}
        <MyCenterSection />

        {/* 체험권 */}
        <TrialSection />

        {/* 센터 추천 */}
        <TopCentersSection />

        {/* 강사 추천 */}
        <TopTrainersSection />

        {/* 최근 본 센터 */}
        <RecentCentersSection />

        {/* 하단 여백 */}
        <div className="h-4" />
      </div>
    </div>
  );
}
