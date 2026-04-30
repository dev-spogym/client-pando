'use client';

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, SlidersHorizontal, LayoutGrid, List, Heart, Star } from 'lucide-react';
import {
  SearchBar,
  Chip,
  Tag,
  Avatar,
  Badge,
  EmptyState,
} from '@/components/ui';
import {
  MOCK_TRAINERS,
  CATEGORIES,
  type CategoryId,
  type MarketTrainer,
  avatarImg,
} from '@/lib/marketplace';
import { useMarketStore } from '@/stores/marketStore';

type SortKey = '리뷰순' | '평점순' | '경력순';
type SecondaryFilter = '평점 4.5+' | '여성 강사' | '남성 강사' | '체험 가능' | '5년+';

const SECONDARY_FILTERS: SecondaryFilter[] = ['평점 4.5+', '여성 강사', '남성 강사', '체험 가능', '5년+'];

const TRAINER_CATEGORIES: CategoryId[] = ['all', 'pt', 'pilates', 'yoga', 'golf', 'crossfit', 'boxing', 'swimming'];

export default function TrainerExplore() {
  const navigate = useNavigate();
  const { isScrapped, toggleScrap } = useMarketStore();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [selectedFilters, setSelectedFilters] = useState<Set<SecondaryFilter>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>('리뷰순');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSort, setShowSort] = useState(false);

  const toggleFilter = (f: SecondaryFilter) => {
    setSelectedFilters((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  };

  const filtered = useMemo(() => {
    let list = [...MOCK_TRAINERS];

    if (selectedCategory !== 'all') {
      list = list.filter((t) => t.category === selectedCategory);
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.specialties.some((s) => s.toLowerCase().includes(q)) ||
          t.centerName.toLowerCase().includes(q)
      );
    }

    if (selectedFilters.has('평점 4.5+')) list = list.filter((t) => t.rating >= 4.5);
    if (selectedFilters.has('여성 강사')) list = list.filter((t) => t.gender === 'F');
    if (selectedFilters.has('남성 강사')) list = list.filter((t) => t.gender === 'M');
    if (selectedFilters.has('5년+')) list = list.filter((t) => t.experienceYears >= 5);

    if (sortKey === '리뷰순') list.sort((a, b) => b.reviewCount - a.reviewCount);
    else if (sortKey === '평점순') list.sort((a, b) => b.rating - a.rating);
    else if (sortKey === '경력순') list.sort((a, b) => b.experienceYears - a.experienceYears);

    return list;
  }, [query, selectedCategory, selectedFilters, sortKey]);

  const categoryChips = CATEGORIES.filter((c) => TRAINER_CATEGORIES.includes(c.id));

  return (
    <div className="min-h-screen bg-surface-secondary pb-24">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-surface border-b border-line">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-h4 text-content font-bold">강사 둘러보기</h1>
          <div className="flex items-center gap-1">
            <button
              className="w-10 h-10 inline-flex items-center justify-center rounded-full active:bg-surface-tertiary text-content-secondary"
              aria-label="알림"
            >
              <Bell className="w-5 h-5" />
            </button>
            {/* Sort dropdown trigger */}
            <div className="relative">
              <button
                onClick={() => setShowSort((v) => !v)}
                className="h-8 px-3 inline-flex items-center gap-1.5 rounded-chip border border-line text-body-sm text-content-secondary bg-surface active:bg-surface-tertiary"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {sortKey}
              </button>
              {showSort && (
                <div className="absolute right-0 top-10 z-50 w-32 bg-surface rounded-card shadow-card-elevated border border-line overflow-hidden">
                  {(['리뷰순', '평점순', '경력순'] as SortKey[]).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setSortKey(opt); setShowSort(false); }}
                      className={`w-full px-4 py-2.5 text-left text-body-sm ${sortKey === opt ? 'text-primary font-semibold bg-primary-light' : 'text-content hover:bg-surface-secondary'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SearchBar */}
        <div className="px-4 pb-3">
          <SearchBar
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery('')}
            placeholder="강사 이름 또는 종목 검색"
            bordered
          />
        </div>

        {/* Category chips: 좌측 고정 필터 아이콘 + 우측 가로 스크롤 */}
        <div className="flex items-center gap-2 px-4 pb-3">
          <button
            type="button"
            aria-label="필터"
            className="shrink-0 w-9 h-9 inline-flex items-center justify-center rounded-chip border border-line-strong bg-surface text-content-secondary active:bg-surface-tertiary relative"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {selectedFilters.size > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                {selectedFilters.size}
              </span>
            )}
          </button>
          <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar">
            {categoryChips.map((cat) => (
              <Chip
                key={cat.id}
                size="sm"
                active={selectedCategory === cat.id}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.icon} {cat.label}
              </Chip>
            ))}
          </div>
        </div>

        {/* Secondary filters: 가로 스크롤 칩 */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
          {SECONDARY_FILTERS.map((f) => (
            <Chip
              key={f}
              size="sm"
              variant="outline"
              active={selectedFilters.has(f)}
              onClick={() => toggleFilter(f)}
            >
              {f}
            </Chip>
          ))}
        </div>
      </header>

      {/* Result count + view toggle (분리) */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <span className="text-body-sm text-content-secondary">
          강사 <span className="text-primary font-semibold">{filtered.length}</span>명
        </span>
        <div className="shrink-0 flex items-center gap-1 bg-surface-tertiary rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`w-7 h-7 inline-flex items-center justify-center rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-surface text-primary shadow-card-soft'
                : 'text-content-tertiary'
            }`}
            aria-label="그리드 보기"
            aria-pressed={viewMode === 'grid'}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`w-7 h-7 inline-flex items-center justify-center rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-surface text-primary shadow-card-soft'
                : 'text-content-tertiary'
            }`}
            aria-label="리스트 보기"
            aria-pressed={viewMode === 'list'}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="검색 결과가 없습니다"
          description="다른 키워드나 필터로 검색해 보세요."
        />
      ) : viewMode === 'grid' ? (
        <GridView trainers={filtered} isScrapped={isScrapped} toggleScrap={toggleScrap} navigate={navigate} />
      ) : (
        <ListView trainers={filtered} isScrapped={isScrapped} toggleScrap={toggleScrap} navigate={navigate} />
      )}
    </div>
  );
}

/* ─── Grid view ─── */
function GridView({
  trainers,
  isScrapped,
  toggleScrap,
  navigate,
}: {
  trainers: MarketTrainer[];
  isScrapped: (type: 'trainer', id: number) => boolean;
  toggleScrap: (type: 'trainer', id: number) => void;
  navigate: ReturnType<typeof useNavigate>;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 pb-6">
      {trainers.map((trainer) => {
        const scrapped = isScrapped('trainer', trainer.id);
        return (
          <div
            key={trainer.id}
            onClick={() => navigate(`/trainers/${trainer.id}`)}
            className="bg-surface rounded-card shadow-card-soft overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
          >
            {/* Image with gradient overlay */}
            <div className="relative aspect-[3/4]">
              <img
                src={trainer.profileUrl || avatarImg(`trainer-${trainer.id}`, 400)}
                alt={trainer.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              {/* Heart */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleScrap('trainer', trainer.id); }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
                aria-label="스크랩"
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${scrapped ? 'fill-state-sale text-state-sale' : 'text-white'}`}
                />
              </button>
              {/* Name + rating overlay */}
              <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
                <p className="text-body font-bold text-white leading-tight">{trainer.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-caption text-white font-medium">{trainer.rating.toFixed(1)}</span>
                  <span className="text-micro text-white/70">({trainer.reviewCount})</span>
                </div>
                <p className="text-micro text-white/80 mt-0.5 truncate">{trainer.centerName}</p>
              </div>
            </div>
            {/* Specialties */}
            <div className="flex flex-wrap gap-1.5 px-3 py-2.5">
              {trainer.specialties.slice(0, 2).map((s) => (
                <Tag key={s} size="sm">{s}</Tag>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── List view ─── */
function ListView({
  trainers,
  isScrapped,
  toggleScrap,
  navigate,
}: {
  trainers: MarketTrainer[];
  isScrapped: (type: 'trainer', id: number) => boolean;
  toggleScrap: (type: 'trainer', id: number) => void;
  navigate: ReturnType<typeof useNavigate>;
}) {
  return (
    <div className="flex flex-col gap-2 px-4 pb-6">
      {trainers.map((trainer) => {
        const scrapped = isScrapped('trainer', trainer.id);
        return (
          <div
            key={trainer.id}
            onClick={() => navigate(`/trainers/${trainer.id}`)}
            className="bg-surface rounded-card shadow-card-soft px-4 py-3 flex items-center gap-3 cursor-pointer active:scale-[0.99] transition-transform"
          >
            <Avatar src={trainer.profileUrl} name={trainer.name} size="lg" />
            <div className="flex-1 min-w-0">
              <p className="text-h4 text-content font-bold truncate">{trainer.name}</p>
              <p className="text-caption text-content-tertiary truncate mt-0.5">{trainer.centerName}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-body-sm font-semibold text-content">{trainer.rating.toFixed(1)}</span>
                <span className="text-caption text-content-tertiary">리뷰 {trainer.reviewCount}개</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {trainer.specialties.slice(0, 3).map((s) => (
                  <Badge key={s} tone="primary" size="sm" variant="soft">{s}</Badge>
                ))}
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); toggleScrap('trainer', trainer.id); }}
              className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center active:bg-surface-tertiary"
              aria-label="스크랩"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${scrapped ? 'fill-state-sale text-state-sale' : 'text-content-tertiary'}`}
              />
            </button>
          </div>
        );
      })}
    </div>
  );
}
