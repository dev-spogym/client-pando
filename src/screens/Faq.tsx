'use client';

/**
 * 자주 묻는 질문 (FAQ)
 * - 검색 + 카테고리 필터
 * - 인기 질문 5개 강조 섹션
 * - 아코디언 답변 + "도움됐어요" 토글
 * - 하단 1:1 문의 진입 카드
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, MessageSquare, ThumbsUp, Sparkles, Search } from 'lucide-react';

import { Badge, Button, Chip, EmptyState, PageHeader, SearchBar } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  FAQ_CATEGORIES,
  FAQ_LIST,
  getPopularFaq,
  searchFaq,
  type FaqCategory,
  type FaqItem,
} from '@/lib/community';

export default function Faq() {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<FaqCategory | 'all'>('all');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [helpful, setHelpful] = useState<Set<number>>(new Set());

  const popular = useMemo(() => getPopularFaq(FAQ_LIST), []);
  const filtered = useMemo(
    () => searchFaq(FAQ_LIST, keyword, category),
    [keyword, category]
  );

  const showPopular = keyword.trim().length === 0 && category === 'all';

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleHelpful = (id: number) => {
    setHelpful((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-surface-secondary pb-10">
      <PageHeader title="자주 묻는 질문" showBack />

      {/* 검색 */}
      <div className="px-4 pt-4">
        <SearchBar
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="궁금한 점을 검색해보세요"
          onClear={() => setKeyword('')}
        />
      </div>

      {/* 카테고리 chips */}
      <div className="px-4 pt-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <Chip size="sm" active={category === 'all'} onClick={() => setCategory('all')}>
          전체
        </Chip>
        {FAQ_CATEGORIES.map((c) => (
          <Chip key={c} size="sm" active={category === c} onClick={() => setCategory(c)}>
            {c}
          </Chip>
        ))}
      </div>

      {/* 인기 질문 (검색/카테고리 미적용 시) */}
      {showPopular && popular.length > 0 && (
        <section className="px-4 pt-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-h4 text-content">지금 가장 많이 본 질문</h2>
          </div>
          <div className="space-y-2">
            {popular.map((f, idx) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  toggleExpand(f.id);
                  if (typeof window !== 'undefined') {
                    setTimeout(() => {
                      const el = document.getElementById(`faq-${f.id}`);
                      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 0);
                  }
                }}
                className="w-full text-left bg-surface rounded-card-lg shadow-card-soft p-4 active:bg-surface-secondary transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-primary text-white text-caption font-bold inline-flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-medium text-content line-clamp-2">{f.question}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Badge tone="neutral" size="sm">{f.category}</Badge>
                      <span className="text-caption text-content-tertiary">
                        도움됐어요 {f.helpfulCount}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 전체 FAQ 리스트 */}
      <section className="px-4 pt-6">
        <h2 className="text-h4 text-content mb-3">
          {showPopular ? '전체 질문' : `검색 결과 ${filtered.length}건`}
        </h2>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Search className="w-8 h-8" />}
            title="검색 결과가 없습니다"
            description="다른 키워드로 검색하거나 1:1 문의로 연락 주세요"
            action={
              <Button variant="outline" onClick={() => navigate('/messages')}>
                1:1 문의하기
              </Button>
            }
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((f) => (
              <FaqItemRow
                key={f.id}
                item={f}
                expanded={expanded.has(f.id)}
                helpful={helpful.has(f.id)}
                onToggle={() => toggleExpand(f.id)}
                onToggleHelpful={() => toggleHelpful(f.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 하단 1:1 문의 카드 */}
      <section className="px-4 pt-8">
        <div className="bg-surface rounded-card-lg shadow-card-soft p-5 border border-primary-light">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-light text-primary inline-flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-h4 text-content">원하는 답변을 못 찾으셨나요?</h3>
              <p className="mt-1 text-body-sm text-content-secondary">
                운영팀이 1:1로 직접 답변해 드려요. 평균 응답 시간 30분 이내.
              </p>
              <Button
                size="md"
                variant="primary"
                className="mt-3"
                onClick={() => navigate('/messages')}
              >
                1:1 문의하기
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────
// FAQ 아코디언 행
// ─────────────────────────────────────────

interface FaqItemRowProps {
  item: FaqItem;
  expanded: boolean;
  helpful: boolean;
  onToggle: () => void;
  onToggleHelpful: () => void;
}

function FaqItemRow({ item, expanded, helpful, onToggle, onToggleHelpful }: FaqItemRowProps) {
  const totalHelpful = item.helpfulCount + (helpful ? 1 : 0);

  return (
    <div
      id={`faq-${item.id}`}
      className="bg-surface rounded-card-lg shadow-card-soft overflow-hidden"
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 flex items-start gap-3 text-left active:bg-surface-secondary transition-colors"
      >
        <span className="shrink-0 w-7 h-7 rounded-full bg-primary-light text-primary inline-flex items-center justify-center font-bold">
          Q
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge tone="neutral" size="sm">{item.category}</Badge>
            {item.popular && (
              <Badge tone="primary" size="sm">
                <Sparkles className="w-3 h-3" />
                인기
              </Badge>
            )}
          </div>
          <p className="text-body font-medium text-content">{item.question}</p>
        </div>
        <ChevronDown
          className={cn(
            'shrink-0 w-5 h-5 text-content-tertiary transition-transform mt-1',
            expanded && 'rotate-180'
          )}
        />
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-line-light">
          <div className="pt-3 flex items-start gap-3">
            <span className="shrink-0 w-7 h-7 rounded-full bg-accent-light text-accent-dark inline-flex items-center justify-center font-bold">
              A
            </span>
            <p className="flex-1 text-body text-content-secondary whitespace-pre-wrap leading-relaxed">
              {item.answer}
            </p>
          </div>

          <div className="mt-4 flex items-center justify-end">
            <button
              type="button"
              onClick={onToggleHelpful}
              className={cn(
                'inline-flex items-center gap-1.5 h-9 px-3 rounded-pill text-body-sm font-medium transition-colors',
                helpful
                  ? 'bg-primary-light text-primary'
                  : 'bg-surface-secondary text-content-secondary active:bg-surface-tertiary'
              )}
            >
              <ThumbsUp className={cn('w-4 h-4', helpful && 'fill-current')} />
              도움됐어요 {totalHelpful}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
