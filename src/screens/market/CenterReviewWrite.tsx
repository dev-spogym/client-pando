'use client';

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Star, X } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, Card, Button, Badge } from '@/components/ui';
import { getCenterById, img } from '@/lib/marketplace';
import { cn } from '@/lib/utils';

const FACILITY_ITEMS = ['시설 청결도', '강사 친절', '운동 효과', '편의시설', '가격 만족도'] as const;
type FacilityItem = (typeof FACILITY_ITEMS)[number];

const RATING_LABELS: Record<number, string> = {
  1: '매우 불만족',
  2: '불만족',
  3: '보통',
  4: '만족',
  5: '매우 만족',
};

const SAMPLE_PHOTOS = [img('review-sample-1', 400, 400), img('review-sample-2', 400, 400)];

function StarInput({
  value,
  onChange,
  size = 'sm',
}: {
  value: number;
  onChange: (v: number) => void;
  size?: 'lg' | 'sm';
}) {
  const [hovered, setHovered] = useState(0);
  const dim = size === 'lg' ? 'w-12 h-12' : 'w-6 h-6';
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = (hovered || value) >= star;
        return (
          <button
            key={star}
            type="button"
            aria-label={`별점 ${star}`}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
            className="transition-transform active:scale-90"
          >
            <Star
              className={cn(
                dim,
                'transition-colors',
                filled ? 'fill-state-warning text-state-warning' : 'text-line-strong fill-line'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

export default function CenterReviewWrite() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const center = getCenterById(Number(id));

  const [overallRating, setOverallRating] = useState(0);
  const [facilityRatings, setFacilityRatings] = useState<Record<FacilityItem, number>>(
    Object.fromEntries(FACILITY_ITEMS.map((k) => [k, 0])) as Record<FacilityItem, number>
  );
  const [body, setBody] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [photos, setPhotos] = useState<string[]>(SAMPLE_PHOTOS);
  const [submitting, setSubmitting] = useState(false);

  const isValid = overallRating > 0 && body.length >= 30 && agreed;

  const setFacility = (item: FacilityItem, val: number) =>
    setFacilityRatings((prev) => ({ ...prev, [item]: val }));

  const removePhoto = (idx: number) =>
    setPhotos((prev) => prev.filter((_, i) => i !== idx));

  const addSamplePhoto = () => {
    if (photos.length >= 5) {
      toast.info('사진은 최대 5장까지 첨부할 수 있습니다.');
      return;
    }
    const next = img(`review-extra-${Date.now()}`, 400, 400);
    setPhotos((prev) => [...prev, next]);
  };

  const handleSubmit = () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    toast.success('리뷰가 등록되었습니다.');
    setTimeout(() => {
      navigate(`/centers/${id}/reviews`);
    }, 300);
  };

  if (!center) {
    return (
      <div className="flex flex-col min-h-screen bg-surface-secondary items-center justify-center">
        <p className="text-content-secondary">센터를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface-secondary">
      <PageHeader showBack title="리뷰 작성" />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-28">
        {/* Center info */}
        <Card variant="soft" padding="md">
          <div className="flex items-center gap-3">
            <img
              src={center.thumbnailUrl}
              alt={center.name}
              className="w-16 h-16 rounded-card object-cover shrink-0"
            />
            <div className="min-w-0">
              <p className="text-body font-semibold text-content truncate">{center.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge tone="primary" size="sm" variant="soft">
                  {center.category}
                </Badge>
                <span className="text-caption text-content-tertiary">{center.dong}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Overall rating */}
        <Card variant="soft" padding="lg">
          <p className="text-body-sm font-semibold text-content-secondary mb-4">
            전체적인 만족도는 어떠셨나요?
          </p>
          <div className="flex flex-col items-center gap-3">
            <StarInput value={overallRating} onChange={setOverallRating} size="lg" />
            {overallRating > 0 && (
              <span className="text-body font-semibold text-state-warning">
                {RATING_LABELS[overallRating]}
              </span>
            )}
            {overallRating === 0 && (
              <span className="text-body-sm text-content-tertiary">별을 탭하여 평점을 선택하세요</span>
            )}
          </div>
        </Card>

        {/* Facility ratings */}
        <Card variant="soft" padding="md">
          <p className="text-body-sm font-semibold text-content-secondary mb-3">시설 항목별 별점</p>
          <div className="space-y-3">
            {FACILITY_ITEMS.map((item) => (
              <div key={item} className="flex items-center justify-between gap-3">
                <span className="text-body-sm text-content shrink-0 w-24">{item}</span>
                <StarInput value={facilityRatings[item]} onChange={(v) => setFacility(item, v)} size="sm" />
              </div>
            ))}
          </div>
        </Card>

        {/* Body text */}
        <Card variant="soft" padding="md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-body-sm font-semibold text-content-secondary">리뷰 본문</p>
            <span
              className={cn(
                'text-caption',
                body.length < 30 ? 'text-state-error' : 'text-content-tertiary'
              )}
            >
              {body.length} / 500
            </span>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, 500))}
            placeholder="이용 경험을 자세하게 남겨주세요. (최소 30자)"
            rows={5}
            className="w-full bg-surface-secondary rounded-card p-3 text-body-sm text-content placeholder:text-content-tertiary outline-none resize-none border border-line focus:border-primary/70 transition-colors"
          />
          {body.length > 0 && body.length < 30 && (
            <p className="text-caption text-state-error mt-1">
              {30 - body.length}자 더 입력해주세요
            </p>
          )}
        </Card>

        {/* Photo attachment */}
        <Card variant="soft" padding="md">
          <p className="text-body-sm font-semibold text-content-secondary mb-3">
            사진 첨부 <span className="text-content-tertiary font-normal">(최대 5장)</span>
          </p>
          <div className="grid grid-cols-4 gap-2">
            {photos.map((url, idx) => (
              <div key={idx} className="relative aspect-square">
                <img
                  src={url}
                  alt={`첨부 사진 ${idx + 1}`}
                  className="w-full h-full object-cover rounded-card"
                />
                <button
                  type="button"
                  aria-label="사진 삭제"
                  onClick={() => removePhoto(idx)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-content-secondary text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {photos.length < 5 && (
              <button
                type="button"
                aria-label="사진 추가"
                onClick={addSamplePhoto}
                className="aspect-square rounded-card border-2 border-dashed border-line-strong flex flex-col items-center justify-center gap-1 text-content-tertiary active:bg-surface-tertiary"
              >
                <span className="text-h3 leading-none">+</span>
                <span className="text-micro">추가</span>
              </button>
            )}
          </div>
        </Card>

        {/* Disclaimer */}
        <Card variant="outline" padding="md">
          <p className="text-body-sm text-content-secondary leading-relaxed mb-3">
            허위 리뷰, 광고성 리뷰, 욕설이 포함된 리뷰는 사전 통보 없이 삭제될 수 있습니다.
            실제 이용 경험을 바탕으로 작성해주세요.
          </p>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setAgreed((v) => !v)}
              className={cn(
                'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0',
                agreed ? 'bg-primary border-primary' : 'border-line-strong bg-surface'
              )}
            >
              {agreed && (
                <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-body-sm text-content">
              위 내용을 확인하였으며 동의합니다. <span className="text-state-error">(필수)</span>
            </span>
          </label>
        </Card>
      </div>

      {/* Bottom action bar — 모바일 프레임 폭에 맞춰 fixed */}
      <div className="bottom-action-bar">
        <Button
          variant="primary"
          size="xl"
          fullWidth
          disabled={!isValid}
          loading={submitting}
          onClick={handleSubmit}
        >
          리뷰 등록
        </Button>
      </div>
    </div>
  );
}
