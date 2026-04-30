'use client';

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThumbsUp, AlertCircle, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { BarChart, Bar, XAxis, Cell, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { PageHeader, Card, Avatar, Badge, Chip, Button, EmptyState } from '@/components/ui';
import {
  getCenterById,
  getReviewsByCenter,
  getCenterRatingDistribution,
  type CenterReview,
} from '@/lib/marketplace';
import { cn } from '@/lib/utils';

type SortKey = '최신순' | '별점 높은 순' | '별점 낮은 순' | '사진 있는 순';
const SORT_KEYS: SortKey[] = ['최신순', '별점 높은 순', '별점 낮은 순', '사진 있는 순'];

type FilterKey = '전체' | '사진 있음';
const FILTER_KEYS: FilterKey[] = ['전체', '사진 있음'];

function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 'w-6 h-6' : 'w-3.5 h-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            dim,
            s <= Math.round(rating)
              ? 'fill-state-warning text-state-warning'
              : 'fill-line text-line'
          )}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: CenterReview }) {
  const [expanded, setExpanded] = useState(false);
  const [helpful, setHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount);
  const isLong = review.body.length > 100;

  const compactScores = review.facilityScores.slice(0, 3);

  const handleHelpful = () => {
    if (helpful) {
      setHelpful(false);
      setHelpfulCount((c) => Math.max(0, c - 1));
      return;
    }
    setHelpful(true);
    setHelpfulCount((c) => c + 1);
  };

  const handleReport = () => {
    toast.info('신고가 접수되었습니다. 운영팀이 검토합니다.');
  };

  return (
    <Card variant="soft" padding="md" className="mb-3">
      {/* Header row */}
      <div className="flex items-center gap-2 mb-3">
        <Avatar src={review.authorAvatar} name={review.authorName} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-body-sm font-semibold text-content">{review.authorName}</span>
            {review.isVerified && (
              <Badge tone="success" size="sm" variant="outline">
                방문 인증
              </Badge>
            )}
          </div>
          <p className="text-caption text-content-tertiary">{review.createdAt}</p>
        </div>
      </div>

      {/* Star + facility scores */}
      <div className="flex items-center gap-3 mb-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <StarDisplay rating={review.rating} />
          <span className="text-body-sm font-bold text-content">{review.rating.toFixed(1)}</span>
        </div>
        {compactScores.length > 0 && (
          <span className="text-caption text-content-tertiary">
            {compactScores.map((s) => `${s.name.replace('도', '').replace(' 만족', '')} ${s.score.toFixed(1)}`).join(' · ')}
          </span>
        )}
      </div>

      {/* Body */}
      <p
        className={cn(
          'text-body-sm text-content-secondary leading-relaxed mb-3',
          !expanded && isLong && 'line-clamp-3'
        )}
      >
        {review.body}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-caption text-primary mb-3"
        >
          {expanded ? (
            <>접기 <ChevronUp className="w-3.5 h-3.5" /></>
          ) : (
            <>더 보기 <ChevronDown className="w-3.5 h-3.5" /></>
          )}
        </button>
      )}

      {/* Photos */}
      {review.images.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {review.images.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`리뷰 사진 ${i + 1}`}
              className="aspect-square rounded-card object-cover w-full"
            />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-line">
        <button
          type="button"
          onClick={handleHelpful}
          aria-pressed={helpful}
          className={`flex items-center gap-1.5 text-caption transition-colors ${
            helpful ? 'text-primary' : 'text-content-secondary active:text-primary'
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${helpful ? 'fill-primary' : ''}`} />
          <span>도움됐어요 {helpfulCount > 0 ? helpfulCount : ''}</span>
        </button>
        <button
          type="button"
          onClick={handleReport}
          className="flex items-center gap-1 text-caption text-content-tertiary active:text-state-error transition-colors"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          신고
        </button>
      </div>
    </Card>
  );
}

export default function CenterReviewList() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const numId = Number(id);
  const center = getCenterById(numId);
  const allReviews = getReviewsByCenter(numId);
  const distribution = getCenterRatingDistribution(numId);

  const [sort, setSort] = useState<SortKey>('최신순');
  const [filter, setFilter] = useState<FilterKey>('전체');

  if (!center) {
    return (
      <div className="flex flex-col min-h-screen bg-surface-secondary items-center justify-center">
        <p className="text-content-secondary">센터를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const avgRating =
    allReviews.length > 0
      ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
      : 0;

  // Apply filter
  let reviews = [...allReviews];
  if (filter === '사진 있음') reviews = reviews.filter((r) => r.images.length > 0);

  // Apply sort
  switch (sort) {
    case '별점 높은 순':
      reviews = reviews.sort((a, b) => b.rating - a.rating);
      break;
    case '별점 낮은 순':
      reviews = reviews.sort((a, b) => a.rating - b.rating);
      break;
    case '사진 있는 순':
      reviews = reviews.sort((a, b) => b.images.length - a.images.length);
      break;
    case '최신순':
    default:
      reviews = reviews.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
  }

  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  return (
    <div className="flex flex-col min-h-screen bg-surface-secondary">
      <PageHeader showBack title={`${center.name} 리뷰`} />

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Summary card */}
        <div className="px-4 pt-4 mb-3">
          <Card variant="elevated" padding="lg">
            <div className="flex items-stretch gap-4">
              {/* Left: avg rating */}
              <div className="flex flex-col items-center justify-center gap-1 shrink-0 w-24">
                <span className="text-display font-bold text-content leading-none">
                  {avgRating.toFixed(1)}
                </span>
                <StarDisplay rating={avgRating} />
                <span className="text-caption text-content-tertiary mt-1">
                  총 {allReviews.length}개
                </span>
              </div>

              {/* Divider */}
              <div className="w-px bg-line" />

              {/* Right: bar chart */}
              <div className="flex-1 min-w-0">
                <div className="space-y-1">
                  {distribution.map((d) => (
                    <div key={d.star} className="flex items-center gap-2">
                      <span className="text-caption text-content-secondary w-6 shrink-0 text-right">
                        {d.star}★
                      </span>
                      <div className="flex-1 h-3 bg-surface-tertiary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(d.count / maxCount) * 100}%` }}
                        />
                      </div>
                      <span className="text-caption text-content-tertiary w-4 shrink-0">
                        {d.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sort chips */}
        <div className="px-4 mb-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {SORT_KEYS.map((key) => (
              <Chip
                key={key}
                size="sm"
                variant="outline"
                active={sort === key}
                onClick={() => setSort(key)}
                className="shrink-0"
              >
                {key}
              </Chip>
            ))}
          </div>
        </div>

        {/* Filter chips */}
        <div className="px-4 mb-4">
          <div className="flex gap-2">
            {FILTER_KEYS.map((key) => (
              <Chip
                key={key}
                size="sm"
                variant="soft"
                active={filter === key}
                onClick={() => setFilter(key)}
              >
                {key}
              </Chip>
            ))}
          </div>
        </div>

        {/* Review list */}
        <div className="px-4">
          {reviews.length === 0 ? (
            <EmptyState
              icon="✍️"
              title="아직 리뷰가 없습니다"
              description="첫 리뷰를 남겨보세요"
              action={
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate(`/centers/${id}/review`)}
                >
                  리뷰 작성하기
                </Button>
              }
            />
          ) : (
            reviews.map((review) => <ReviewCard key={review.id} review={review} />)
          )}
        </div>
      </div>

      {/* Bottom action — 모바일 프레임 폭 */}
      <div className="bottom-action-bar">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => navigate(`/centers/${id}/review`)}
        >
          내가 리뷰 작성하기
        </Button>
      </div>
    </div>
  );
}
