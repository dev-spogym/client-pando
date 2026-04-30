'use client';

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Crown, Medal, Star, Trophy } from 'lucide-react';
import {
  BEST_CATEGORIES,
  BEST_REGIONS,
  getBestCenters,
  getBestProducts,
  getBestTrainers,
  type BestCategoryId,
  type BestRegion,
  type BestTab,
  type RankedCenter,
  type RankedProduct,
  type RankedTrainer,
} from '@/lib/discover';
import { Avatar, Chip, EmptyState, PageHeader, PriceTag } from '@/components/ui';

const TABS: { id: BestTab; label: string }[] = [
  { id: 'center', label: '센터' },
  { id: 'trainer', label: '강사' },
  { id: 'product', label: '상품' },
];

function rankColor(rank: number): string {
  if (rank === 1) return 'bg-state-warning text-white';
  if (rank === 2) return 'bg-content-tertiary text-white';
  if (rank === 3) return 'bg-state-sale/80 text-white';
  return 'bg-surface-secondary text-content-secondary';
}

function rankIcon(rank: number) {
  if (rank === 1) return <Crown className="w-4 h-4" />;
  if (rank === 2) return <Trophy className="w-4 h-4" />;
  if (rank === 3) return <Medal className="w-4 h-4" />;
  return null;
}

function topBorder(rank: number): string {
  if (rank === 1) return 'ring-2 ring-state-warning';
  if (rank === 2) return 'ring-2 ring-content-tertiary';
  if (rank === 3) return 'ring-2 ring-state-sale/80';
  return '';
}

// ─────────────────────────────────────────────────────────────
// 1-3위 큰 카드 (가로 carousel)
// ─────────────────────────────────────────────────────────────

function CenterPodiumCard({ item, onClick }: { item: RankedCenter; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 w-56 bg-surface rounded-card-lg overflow-hidden shadow-card-soft active:opacity-90 ${topBorder(item.rank)}`}
    >
      <div className="relative aspect-[5/4] overflow-hidden bg-surface-tertiary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.thumbnailUrl} alt={item.name} className="w-full h-full object-cover" />
        <div
          className={`absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 h-7 rounded-pill text-caption font-bold ${rankColor(item.rank)}`}
        >
          {rankIcon(item.rank)}
          {item.rank}위
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-body font-bold text-content line-clamp-1">{item.name}</h3>
        <p className="text-caption text-content-tertiary line-clamp-1 mt-0.5">
          {item.district} {item.dong}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="inline-flex items-center gap-0.5 text-caption text-content-secondary">
            <Star className="w-3.5 h-3.5 text-state-warning fill-state-warning" />
            <span className="font-semibold text-content">{item.rating.toFixed(1)}</span>
            <span className="text-content-tertiary">({item.reviewCount})</span>
          </span>
        </div>
        <p className="text-caption font-bold text-content mt-1">
          {item.representativePrice.toLocaleString()}원~
        </p>
      </div>
    </button>
  );
}

function TrainerPodiumCard({ item, onClick }: { item: RankedTrainer; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 w-44 bg-surface rounded-card-lg p-4 shadow-card-soft text-left active:opacity-90 ${topBorder(item.rank)}`}
    >
      <div
        className={`inline-flex items-center gap-1 px-2.5 h-7 rounded-pill text-caption font-bold mb-3 ${rankColor(item.rank)}`}
      >
        {rankIcon(item.rank)}
        {item.rank}위
      </div>
      <div className="flex flex-col items-center text-center">
        <Avatar src={item.profileUrl} name={item.name} size="xl" />
        <h3 className="text-body font-bold text-content mt-3 line-clamp-1">{item.name}</h3>
        <p className="text-caption text-content-tertiary mt-0.5 line-clamp-1">{item.centerName}</p>
        <div className="flex items-center gap-1 mt-2">
          <Star className="w-3.5 h-3.5 text-state-warning fill-state-warning" />
          <span className="text-caption font-semibold text-content">{item.rating.toFixed(1)}</span>
          <span className="text-caption text-content-tertiary">({item.reviewCount})</span>
        </div>
        <p className="text-micro text-content-tertiary mt-0.5">
          경력 {item.experienceYears}년 · 누적 {item.totalLessons.toLocaleString()}회
        </p>
      </div>
    </button>
  );
}

function ProductPodiumCard({ item, onClick }: { item: RankedProduct; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 w-56 bg-surface rounded-card-lg overflow-hidden shadow-card-soft active:opacity-90 ${topBorder(item.rank)}`}
    >
      <div className="relative aspect-[5/4] overflow-hidden bg-surface-tertiary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.thumbnailUrl} alt={item.name} className="w-full h-full object-cover" />
        <div
          className={`absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 h-7 rounded-pill text-caption font-bold ${rankColor(item.rank)}`}
        >
          {rankIcon(item.rank)}
          {item.rank}위
        </div>
      </div>
      <div className="p-3">
        <p className="text-caption text-primary font-medium">{item.productCategory}</p>
        <h3 className="text-body font-bold text-content line-clamp-2 mt-0.5">{item.name}</h3>
        <p className="text-caption text-content-tertiary line-clamp-1 mt-0.5">{item.centerName}</p>
        <div className="mt-1.5">
          <PriceTag price={item.price} originalPrice={item.originalPrice} size="sm" />
        </div>
        <p className="text-micro text-content-tertiary mt-1">구매 {item.buyerCount}명+</p>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// 4위~ 가로 row (랭킹 번호 + 카드)
// ─────────────────────────────────────────────────────────────

function CenterRow({ item, onClick }: { item: RankedCenter; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 p-3 text-left bg-surface rounded-card shadow-card-soft active:opacity-90"
    >
      <span className="w-8 text-center text-h4 font-bold text-content-secondary">{item.rank}</span>
      <div className="relative w-16 h-16 shrink-0 rounded-card overflow-hidden bg-surface-tertiary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.thumbnailUrl} alt={item.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-body font-semibold text-content line-clamp-1">{item.name}</h3>
        <p className="text-caption text-content-tertiary line-clamp-1 mt-0.5">
          {item.district} {item.dong}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="inline-flex items-center gap-0.5 text-caption text-content-secondary">
            <Star className="w-3.5 h-3.5 text-state-warning fill-state-warning" />
            <span className="font-semibold text-content">{item.rating.toFixed(1)}</span>
            <span className="text-content-tertiary">({item.reviewCount})</span>
          </span>
          <span className="text-caption font-semibold text-content">
            {item.representativePrice.toLocaleString()}원~
          </span>
        </div>
      </div>
    </button>
  );
}

function TrainerRow({ item, onClick }: { item: RankedTrainer; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 p-3 text-left bg-surface rounded-card shadow-card-soft active:opacity-90"
    >
      <span className="w-8 text-center text-h4 font-bold text-content-secondary">{item.rank}</span>
      <Avatar src={item.profileUrl} name={item.name} size="lg" />
      <div className="flex-1 min-w-0">
        <h3 className="text-body font-semibold text-content line-clamp-1">{item.name}</h3>
        <p className="text-caption text-content-tertiary line-clamp-1 mt-0.5">{item.centerName}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="inline-flex items-center gap-0.5 text-caption text-content-secondary">
            <Star className="w-3.5 h-3.5 text-state-warning fill-state-warning" />
            <span className="font-semibold text-content">{item.rating.toFixed(1)}</span>
            <span className="text-content-tertiary">({item.reviewCount})</span>
          </span>
          <span className="text-caption text-content-tertiary">
            경력 {item.experienceYears}년
          </span>
        </div>
      </div>
    </button>
  );
}

function ProductRow({ item, onClick }: { item: RankedProduct; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 p-3 text-left bg-surface rounded-card shadow-card-soft active:opacity-90"
    >
      <span className="w-8 text-center text-h4 font-bold text-content-secondary">{item.rank}</span>
      <div className="relative w-16 h-16 shrink-0 rounded-card overflow-hidden bg-surface-tertiary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.thumbnailUrl} alt={item.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-caption text-primary font-medium">{item.productCategory}</p>
        <h3 className="text-body font-semibold text-content line-clamp-1 mt-0.5">{item.name}</h3>
        <p className="text-caption text-content-tertiary line-clamp-1 mt-0.5">{item.centerName}</p>
        <div className="mt-1">
          <PriceTag price={item.price} originalPrice={item.originalPrice} size="sm" />
        </div>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// 메인
// ─────────────────────────────────────────────────────────────

export default function BestRanking() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<BestTab>('center');
  const [category, setCategory] = useState<BestCategoryId>('all');
  const [region, setRegion] = useState<BestRegion>('전체');

  const centerData = useMemo(
    () => (tab === 'center' ? getBestCenters(category, region) : []),
    [tab, category, region],
  );
  const trainerData = useMemo(
    () => (tab === 'trainer' ? getBestTrainers(category, region) : []),
    [tab, category, region],
  );
  const productData = useMemo(
    () => (tab === 'product' ? getBestProducts(category, region) : []),
    [tab, category, region],
  );

  const totalCount =
    tab === 'center' ? centerData.length : tab === 'trainer' ? trainerData.length : productData.length;

  return (
    <div className="min-h-screen bg-surface-secondary pb-10">
      <PageHeader
        title="BEST"
        subtitle="회원이 직접 검증한 인기 랭킹"
        rightSlot={
          <span className="inline-flex items-center gap-1 text-caption text-content-tertiary">
            <Award className="w-4 h-4 text-state-warning" />
            04.29 기준
          </span>
        }
      />

      {/* Sticky 필터 영역 */}
      <div className="bg-surface border-b border-line sticky top-14 z-20 space-y-2 pb-3 pt-3">
        {/* 메인 탭 */}
        <div className="flex gap-2 px-5 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <Chip
              key={t.id}
              size="md"
              active={tab === t.id}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </Chip>
          ))}
        </div>

        {/* 카테고리 chips */}
        <div className="flex gap-2 px-5 overflow-x-auto no-scrollbar">
          {BEST_CATEGORIES.map((c) => (
            <Chip
              key={c.id}
              size="sm"
              variant="outline"
              active={category === c.id}
              onClick={() => setCategory(c.id)}
              leadingIcon={<span>{c.emoji}</span>}
            >
              {c.label}
            </Chip>
          ))}
        </div>

        {/* 지역 chips */}
        <div className="flex gap-2 px-5 overflow-x-auto no-scrollbar">
          {BEST_REGIONS.map((r) => (
            <Chip
              key={r}
              size="sm"
              variant="soft"
              active={region === r}
              onClick={() => setRegion(r)}
            >
              {r}
            </Chip>
          ))}
        </div>
      </div>

      {/* 본문 */}
      <div className="px-5 pt-4 pb-4">
        <p className="text-body-sm text-content-secondary mb-3">
          총 <span className="font-bold text-primary">{totalCount}</span>개 랭킹
        </p>

        {totalCount === 0 ? (
          <EmptyState
            title="조건에 맞는 랭킹이 없어요"
            description="카테고리나 지역 필터를 다시 선택해 보세요"
            size="md"
          />
        ) : tab === 'center' ? (
          <RankingBody
            top3={centerData.slice(0, 3)}
            rest={centerData.slice(3)}
            renderTop={(item) => (
              <CenterPodiumCard
                key={item.centerId}
                item={item}
                onClick={() => navigate(`/centers/${item.centerId}`)}
              />
            )}
            renderRow={(item) => (
              <CenterRow
                key={item.centerId}
                item={item}
                onClick={() => navigate(`/centers/${item.centerId}`)}
              />
            )}
          />
        ) : tab === 'trainer' ? (
          <RankingBody
            top3={trainerData.slice(0, 3)}
            rest={trainerData.slice(3)}
            renderTop={(item) => (
              <TrainerPodiumCard
                key={item.trainerId}
                item={item}
                onClick={() => navigate(`/trainers/${item.trainerId}`)}
              />
            )}
            renderRow={(item) => (
              <TrainerRow
                key={item.trainerId}
                item={item}
                onClick={() => navigate(`/trainers/${item.trainerId}`)}
              />
            )}
          />
        ) : (
          <RankingBody
            top3={productData.slice(0, 3)}
            rest={productData.slice(3)}
            renderTop={(item) => (
              <ProductPodiumCard
                key={item.productId}
                item={item}
                onClick={() => navigate(`/shop/${item.productId}`)}
              />
            )}
            renderRow={(item) => (
              <ProductRow
                key={item.productId}
                item={item}
                onClick={() => navigate(`/shop/${item.productId}`)}
              />
            )}
          />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 공통 랭킹 본문 (제네릭으로 1-3위 carousel + 4-10위 리스트)
// ─────────────────────────────────────────────────────────────

function RankingBody<T>({
  top3,
  rest,
  renderTop,
  renderRow,
}: {
  top3: T[];
  rest: T[];
  renderTop: (item: T) => React.ReactNode;
  renderRow: (item: T) => React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      {top3.length > 0 && (
        <section>
          <h2 className="text-h4 text-content mb-3">TOP 3</h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
            {top3.map(renderTop)}
          </div>
        </section>
      )}
      {rest.length > 0 && (
        <section>
          <h2 className="text-h4 text-content mb-3">4 ~ {3 + rest.length}위</h2>
          <div className="space-y-2.5">{rest.map(renderRow)}</div>
        </section>
      )}
    </div>
  );
}
