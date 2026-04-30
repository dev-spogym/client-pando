'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Building2,
  Clock,
  Minus,
  Sparkles,
  Star,
  TrendingUp,
  User as UserIcon,
  X,
} from 'lucide-react';
import {
  MOCK_CENTERS,
  MOCK_PRODUCTS,
  MOCK_TRAINERS,
  type MarketCenter,
  type MarketProduct,
  type MarketTrainer,
} from '@/lib/marketplace';
import {
  DISCOVER_CATEGORIES,
  POPULAR_KEYWORDS,
  getSuggestions,
  type RankTrend,
  type SearchSuggestion,
} from '@/lib/discover';
import { useMarketStore } from '@/stores/marketStore';
import {
  Avatar,
  Chip,
  EmptyState,
  PriceTag,
  SearchBar,
  Tag,
} from '@/components/ui';

type ResultTab = 'all' | 'center' | 'trainer' | 'product';

const RESULT_TABS: { id: ResultTab; label: string }[] = [
  { id: 'all', label: '통합' },
  { id: 'center', label: '센터' },
  { id: 'trainer', label: '강사' },
  { id: 'product', label: '상품' },
];

const SUGGESTED_FALLBACK_KEYWORDS = ['필라테스', 'PT', '요가', '골프', '체험권', '바디프로필'];

// ─────────────────────────────────────────────────────────────
// 헬퍼: 매칭 부분 highlight
// ─────────────────────────────────────────────────────────────

function HighlightedText({ text, keyword }: { text: string; keyword: string }): ReactNode {
  const q = keyword.trim();
  if (!q) return <>{text}</>;
  const lower = text.toLowerCase();
  const lowerQ = q.toLowerCase();
  const idx = lower.indexOf(lowerQ);
  if (idx < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-primary font-semibold">{text.slice(idx, idx + q.length)}</span>
      {text.slice(idx + q.length)}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// 인기 검색어 trend 아이콘
// ─────────────────────────────────────────────────────────────

function TrendIcon({ trend, change }: { trend: RankTrend; change: number }) {
  if (trend === 'new') {
    return <span className="text-micro font-bold text-state-sale">NEW</span>;
  }
  if (trend === 'same') {
    return (
      <span className="inline-flex items-center text-micro text-content-tertiary">
        <Minus className="w-3 h-3" />
      </span>
    );
  }
  if (trend === 'up') {
    return (
      <span className="inline-flex items-center gap-0.5 text-micro text-state-sale font-semibold">
        <ArrowUp className="w-3 h-3" />
        {change}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-micro text-state-info font-semibold">
      <ArrowDown className="w-3 h-3" />
      {change}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// 결과 카드
// ─────────────────────────────────────────────────────────────

function CenterResultCard({
  center,
  query,
  onClick,
}: {
  center: MarketCenter;
  query: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full gap-3 p-3 text-left bg-surface rounded-card shadow-card-soft active:opacity-90"
    >
      <div className="relative w-20 h-20 shrink-0 rounded-card overflow-hidden bg-surface-tertiary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={center.thumbnailUrl} alt={center.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-caption text-primary font-medium">센터</p>
        <h3 className="text-body font-semibold text-content line-clamp-1 mt-0.5">
          <HighlightedText text={center.name} keyword={query} />
        </h3>
        <p className="text-caption text-content-tertiary line-clamp-1 mt-0.5">
          {center.district} {center.dong} · {center.distanceKm.toFixed(1)}km
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="inline-flex items-center gap-0.5 text-caption text-content-secondary">
            <Star className="w-3.5 h-3.5 text-state-warning fill-state-warning" />
            <span className="font-semibold text-content">{center.rating.toFixed(1)}</span>
            <span className="text-content-tertiary">({center.reviewCount})</span>
          </span>
          <span className="text-caption font-semibold text-content">
            {center.representativeProduct.price.toLocaleString()}원~
          </span>
        </div>
      </div>
    </button>
  );
}

function TrainerResultCard({
  trainer,
  query,
  onClick,
}: {
  trainer: MarketTrainer;
  query: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 p-3 text-left bg-surface rounded-card shadow-card-soft active:opacity-90"
    >
      <Avatar src={trainer.profileUrl} name={trainer.name} size="lg" />
      <div className="flex-1 min-w-0">
        <p className="text-caption text-primary font-medium">강사</p>
        <h3 className="text-body font-semibold text-content line-clamp-1 mt-0.5">
          <HighlightedText text={trainer.name} keyword={query} />
        </h3>
        <p className="text-caption text-content-tertiary line-clamp-1 mt-0.5">
          {trainer.centerName}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="inline-flex items-center gap-0.5 text-caption text-content-secondary">
            <Star className="w-3.5 h-3.5 text-state-warning fill-state-warning" />
            <span className="font-semibold text-content">{trainer.rating.toFixed(1)}</span>
            <span className="text-content-tertiary">({trainer.reviewCount})</span>
          </span>
          <span className="text-caption text-content-secondary">
            경력 {trainer.experienceYears}년
          </span>
        </div>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {trainer.specialties.slice(0, 3).map((s) => (
            <Tag key={s} size="sm">
              {s}
            </Tag>
          ))}
        </div>
      </div>
    </button>
  );
}

function ProductResultCard({
  product,
  query,
  onClick,
}: {
  product: MarketProduct;
  query: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full gap-3 p-3 text-left bg-surface rounded-card shadow-card-soft active:opacity-90"
    >
      <div className="relative w-20 h-20 shrink-0 rounded-card overflow-hidden bg-surface-tertiary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.thumbnailUrl} alt={product.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-caption text-primary font-medium">{product.productCategory}</p>
        <h3 className="text-body font-semibold text-content line-clamp-2 mt-0.5">
          <HighlightedText text={product.name} keyword={query} />
        </h3>
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

// ─────────────────────────────────────────────────────────────
// 자동완성 행
// ─────────────────────────────────────────────────────────────

function SuggestionRow({
  suggestion,
  query,
  onClick,
}: {
  suggestion: SearchSuggestion;
  query: string;
  onClick: () => void;
}) {
  const Icon = suggestion.type === 'center' ? Building2 : suggestion.type === 'trainer' ? UserIcon : Sparkles;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-5 py-2.5 text-left active:bg-surface-secondary"
    >
      <span className="w-9 h-9 rounded-full bg-surface-secondary text-content-secondary inline-flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-body text-content line-clamp-1">
          <HighlightedText text={suggestion.title} keyword={query} />
        </p>
        <p className="text-caption text-content-tertiary line-clamp-1 mt-0.5">
          {suggestion.subtitle}
        </p>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// 메인 — Search
// ─────────────────────────────────────────────────────────────

export default function Search() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const recentKeywords = useMarketStore((s) => s.recentKeywords);
  const addRecentKeyword = useMarketStore((s) => s.addRecentKeyword);
  const clearRecentKeywords = useMarketStore((s) => s.clearRecentKeywords);

  const [query, setQuery] = useState('');
  /** 실제 검색어 (Enter 또는 항목 클릭 시 설정) */
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [activeTab, setActiveTab] = useState<ResultTab>('all');

  /** 마운트 시 검색창 자동 포커스 */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /** 자동완성 후보 */
  const suggestions = useMemo(() => getSuggestions(query, 8), [query]);

  /** 검색 결과 */
  const matchedCenters = useMemo(() => {
    const q = submittedQuery.trim().toLowerCase();
    if (!q) return [] as MarketCenter[];
    return MOCK_CENTERS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dong.toLowerCase().includes(q) ||
        c.district.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    );
  }, [submittedQuery]);

  const matchedTrainers = useMemo(() => {
    const q = submittedQuery.trim().toLowerCase();
    if (!q) return [] as MarketTrainer[];
    return MOCK_TRAINERS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.centerName.toLowerCase().includes(q) ||
        t.specialties.some((s) => s.toLowerCase().includes(q)),
    );
  }, [submittedQuery]);

  const matchedProducts = useMemo(() => {
    const q = submittedQuery.trim().toLowerCase();
    if (!q) return [] as MarketProduct[];
    return MOCK_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.centerName.toLowerCase().includes(q) ||
        p.productCategory.toLowerCase().includes(q),
    );
  }, [submittedQuery]);

  const totalCount = matchedCenters.length + matchedTrainers.length + matchedProducts.length;

  const handleSubmitSearch = (kw: string) => {
    const trimmed = kw.trim();
    if (!trimmed) return;
    addRecentKeyword(trimmed);
    setQuery(trimmed);
    setSubmittedQuery(trimmed);
    setActiveTab('all');
  };

  const handleClickSuggestion = (s: SearchSuggestion) => {
    if (s.type === 'center') navigate(`/centers/${s.id}`);
    else if (s.type === 'trainer') navigate(`/trainers/${s.id}`);
    else navigate(`/shop/${s.id}`);
  };

  const handleResetQuery = () => {
    setQuery('');
    setSubmittedQuery('');
    inputRef.current?.focus();
  };

  // ─── 화면 모드 결정 ────────────────────────────────────────
  const trimmed = query.trim();
  const hasResults = submittedQuery.trim().length > 0;
  /** 입력은 했지만 아직 결과 화면은 아닌 상태 (자동완성) */
  const showSuggestions = trimmed.length > 0 && !hasResults;

  return (
    <div className="flex flex-col min-h-screen bg-surface-secondary">
      {/* Sticky 헤더 + 검색바 */}
      <header className="sticky top-0 z-30 bg-surface border-b border-line">
        <div className="flex items-center gap-2 px-3 h-14">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="뒤로 가기"
            className="w-10 h-10 inline-flex items-center justify-center rounded-full active:bg-surface-tertiary text-content"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <SearchBar
              ref={inputRef}
              value={query}
              size="md"
              bordered
              placeholder="센터, 강사, 상품을 검색해 보세요"
              onChange={(e) => {
                setQuery(e.target.value);
                if (hasResults) setSubmittedQuery('');
              }}
              onClear={handleResetQuery}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmitSearch(query);
              }}
            />
          </div>
        </div>

        {/* 결과 탭 (검색 실행됐을 때만) */}
        {hasResults && (
          <div className="flex gap-2 px-5 pb-3 overflow-x-auto no-scrollbar">
            {RESULT_TABS.map((tab) => {
              const count =
                tab.id === 'all'
                  ? totalCount
                  : tab.id === 'center'
                  ? matchedCenters.length
                  : tab.id === 'trainer'
                  ? matchedTrainers.length
                  : matchedProducts.length;
              return (
                <Chip
                  key={tab.id}
                  size="sm"
                  active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label} {count}
                </Chip>
              );
            })}
          </div>
        )}
      </header>

      {/* 본문 */}
      <main className="flex-1">
        {/* 1. 입력 비어있음 — 최근/인기/카테고리 */}
        {!trimmed && !hasResults && (
          <EmptyEntry
            recentKeywords={recentKeywords}
            onSelectKeyword={(kw) => {
              setQuery(kw);
              handleSubmitSearch(kw);
            }}
            onClearRecent={clearRecentKeywords}
          />
        )}

        {/* 2. 자동완성 */}
        {showSuggestions && (
          <div className="bg-surface">
            <p className="px-5 pt-4 pb-2 text-caption text-content-tertiary">
              이런 결과가 있어요{' '}
              <span className="font-semibold text-primary">({suggestions.length}개)</span>
            </p>
            {suggestions.length === 0 ? (
              <div className="py-6 text-center text-caption text-content-tertiary">
                추천 결과가 없습니다. 엔터를 눌러 검색을 실행해 보세요.
              </div>
            ) : (
              <ul>
                {suggestions.map((s) => (
                  <li key={`${s.type}-${s.id}`}>
                    <SuggestionRow
                      suggestion={s}
                      query={query}
                      onClick={() => handleClickSuggestion(s)}
                    />
                  </li>
                ))}
              </ul>
            )}
            <div className="px-5 py-3 border-t border-line">
              <button
                type="button"
                onClick={() => handleSubmitSearch(query)}
                className="w-full text-body-sm text-primary font-semibold py-2 active:opacity-70"
              >
                &quot;{query}&quot; 전체 결과 보기
              </button>
            </div>
          </div>
        )}

        {/* 3. 검색 실행 결과 */}
        {hasResults && (
          <div className="px-5 py-4 space-y-3">
            {totalCount === 0 ? (
              <EmptyState
                title={`"${submittedQuery}" 검색 결과가 없어요`}
                description="다른 키워드를 시도해 보세요"
                size="md"
                action={
                  <div className="flex flex-wrap gap-2 justify-center">
                    {SUGGESTED_FALLBACK_KEYWORDS.slice(0, 6).map((kw) => (
                      <Chip
                        key={kw}
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setQuery(kw);
                          handleSubmitSearch(kw);
                        }}
                      >
                        {kw}
                      </Chip>
                    ))}
                  </div>
                }
              />
            ) : (
              <ResultBody
                tab={activeTab}
                query={submittedQuery}
                matchedCenters={matchedCenters}
                matchedTrainers={matchedTrainers}
                matchedProducts={matchedProducts}
                onCenter={(id) => navigate(`/centers/${id}`)}
                onTrainer={(id) => navigate(`/trainers/${id}`)}
                onProduct={(id) => navigate(`/shop/${id}`)}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 비어있을 때 (최근/인기/카테고리)
// ─────────────────────────────────────────────────────────────

function EmptyEntry({
  recentKeywords,
  onSelectKeyword,
  onClearRecent,
}: {
  recentKeywords: string[];
  onSelectKeyword: (kw: string) => void;
  onClearRecent: () => void;
}) {
  return (
    <div className="px-5 py-5 space-y-7">
      {/* 최근 검색어 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-body font-semibold text-content flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-content-secondary" />
            최근 검색어
          </h2>
          {recentKeywords.length > 0 && (
            <button
              type="button"
              onClick={onClearRecent}
              className="text-caption text-content-tertiary hover:text-content"
            >
              전체 삭제
            </button>
          )}
        </div>
        {recentKeywords.length === 0 ? (
          <p className="text-caption text-content-tertiary py-3">최근 검색어가 없습니다</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {recentKeywords.map((kw) => (
              <RecentChip key={kw} keyword={kw} onClick={() => onSelectKeyword(kw)} />
            ))}
          </div>
        )}
      </section>

      {/* 인기 검색어 (실시간 랭킹) */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-body font-semibold text-content flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-primary" />
            인기 검색어
          </h2>
          <span className="text-caption text-content-tertiary">04.29 18:00 기준</span>
        </div>
        <div className="bg-surface rounded-card shadow-card-soft p-2 grid grid-cols-2 gap-x-4">
          {POPULAR_KEYWORDS.map((kw) => (
            <button
              key={kw.rank}
              type="button"
              onClick={() => onSelectKeyword(kw.keyword)}
              className="flex items-center gap-3 px-3 py-2.5 text-left rounded-button active:bg-surface-secondary"
            >
              <span
                className={`w-5 text-center text-body-sm font-bold ${
                  kw.rank <= 3 ? 'text-primary' : 'text-content-secondary'
                }`}
              >
                {kw.rank}
              </span>
              <span className="flex-1 min-w-0 text-body-sm text-content truncate">
                {kw.keyword}
              </span>
              <TrendIcon trend={kw.trend} change={kw.change} />
            </button>
          ))}
        </div>
      </section>

      {/* 추천 카테고리 */}
      <section>
        <h2 className="text-body font-semibold text-content mb-3">카테고리로 찾아보기</h2>
        <div className="grid grid-cols-2 gap-3">
          {DISCOVER_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectKeyword(cat.searchKeyword)}
              className={`relative aspect-[4/3] rounded-card-lg ${cat.bgClass} text-white p-4 text-left overflow-hidden active:opacity-90 shadow-card-soft`}
            >
              <span className="absolute top-3 right-3 text-3xl opacity-90">{cat.emoji}</span>
              <p className="text-caption text-white/80 font-medium">카테고리</p>
              <h3 className="text-h3 font-bold mt-1">{cat.label}</h3>
              <p className="text-caption text-white/85 mt-3">전체 보러가기 →</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

// 최근 검색 chip — X 버튼은 zustand 직접 호출 (recentKeywords 배열 단순 필터)
function RecentChip({ keyword, onClick }: { keyword: string; onClick: () => void }) {
  const removeOne = () => {
    const current = useMarketStore.getState().recentKeywords;
    useMarketStore.setState({ recentKeywords: current.filter((k) => k !== keyword) });
  };

  return (
    <span className="inline-flex items-center gap-1 h-8 pl-3 pr-1.5 rounded-pill bg-surface border border-line text-content-secondary">
      <button
        type="button"
        onClick={onClick}
        className="text-body-sm text-content hover:text-primary"
      >
        {keyword}
      </button>
      <button
        type="button"
        onClick={removeOne}
        aria-label={`${keyword} 삭제`}
        className="w-6 h-6 inline-flex items-center justify-center text-content-tertiary hover:text-content"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// 결과 바디
// ─────────────────────────────────────────────────────────────

function ResultBody({
  tab,
  query,
  matchedCenters,
  matchedTrainers,
  matchedProducts,
  onCenter,
  onTrainer,
  onProduct,
}: {
  tab: ResultTab;
  query: string;
  matchedCenters: MarketCenter[];
  matchedTrainers: MarketTrainer[];
  matchedProducts: MarketProduct[];
  onCenter: (id: number) => void;
  onTrainer: (id: number) => void;
  onProduct: (id: number) => void;
}) {
  if (tab === 'center') {
    return (
      <div className="space-y-3">
        {matchedCenters.length === 0 ? (
          <EmptyState title="센터 결과가 없습니다" size="sm" />
        ) : (
          matchedCenters.map((c) => (
            <CenterResultCard
              key={c.id}
              center={c}
              query={query}
              onClick={() => onCenter(c.id)}
            />
          ))
        )}
      </div>
    );
  }

  if (tab === 'trainer') {
    return (
      <div className="space-y-3">
        {matchedTrainers.length === 0 ? (
          <EmptyState title="강사 결과가 없습니다" size="sm" />
        ) : (
          matchedTrainers.map((t) => (
            <TrainerResultCard
              key={t.id}
              trainer={t}
              query={query}
              onClick={() => onTrainer(t.id)}
            />
          ))
        )}
      </div>
    );
  }

  if (tab === 'product') {
    return (
      <div className="space-y-3">
        {matchedProducts.length === 0 ? (
          <EmptyState title="상품 결과가 없습니다" size="sm" />
        ) : (
          matchedProducts.map((p) => (
            <ProductResultCard
              key={p.id}
              product={p}
              query={query}
              onClick={() => onProduct(p.id)}
            />
          ))
        )}
      </div>
    );
  }

  // 통합
  return (
    <div className="space-y-6">
      {matchedCenters.length > 0 && (
        <section>
          <SectionRow label={`센터 ${matchedCenters.length}`} />
          <div className="space-y-3">
            {matchedCenters.slice(0, 3).map((c) => (
              <CenterResultCard
                key={c.id}
                center={c}
                query={query}
                onClick={() => onCenter(c.id)}
              />
            ))}
          </div>
        </section>
      )}
      {matchedTrainers.length > 0 && (
        <section>
          <SectionRow label={`강사 ${matchedTrainers.length}`} />
          <div className="space-y-3">
            {matchedTrainers.slice(0, 3).map((t) => (
              <TrainerResultCard
                key={t.id}
                trainer={t}
                query={query}
                onClick={() => onTrainer(t.id)}
              />
            ))}
          </div>
        </section>
      )}
      {matchedProducts.length > 0 && (
        <section>
          <SectionRow label={`상품 ${matchedProducts.length}`} />
          <div className="space-y-3">
            {matchedProducts.slice(0, 3).map((p) => (
              <ProductResultCard
                key={p.id}
                product={p}
                query={query}
                onClick={() => onProduct(p.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-h4 text-content">{label}</h3>
    </div>
  );
}
