'use client';

import { useNavigate, useParams } from 'react-router-dom';
import { Heart, Star, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  PageHeader,
  Button,
  Badge,
  Avatar,
  Tag,
} from '@/components/ui';
import {
  MOCK_TRAINERS,
  MOCK_REVIEWS,
  getTrainerById,
  getCenterById,
  avatarImg,
} from '@/lib/marketplace';
import { useMarketStore } from '@/stores/marketStore';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

// Generate mock availability slots for each day
const MOCK_AVAILABILITY: Record<string, string[]> = {
  월: ['09:00', '11:00', '14:00', '17:00'],
  화: ['10:00', '13:00', '16:00'],
  수: ['09:00', '11:00', '15:00', '18:00'],
  목: ['10:00', '14:00', '17:00'],
  금: ['09:00', '12:00', '16:00', '19:00'],
  토: ['10:00', '13:00'],
  일: ['11:00'],
};

export default function TrainerDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isScrapped, toggleScrap } = useMarketStore();

  const trainer = getTrainerById(Number(id));

  if (!trainer) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center">
        <p className="text-content-tertiary">강사 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const scrapped = isScrapped('trainer', trainer.id);
  const center = getCenterById(trainer.centerId);

  // Top 5 reviews (any center for now, since trainer reviews aren't separate)
  const reviews = MOCK_REVIEWS.slice(0, 5);

  // Same category trainers (excluding self)
  const relatedTrainers = MOCK_TRAINERS.filter(
    (t) => t.category === trainer.category && t.id !== trainer.id
  ).slice(0, 4);

  const categoryLabel: Record<string, string> = {
    pt: 'PT',
    pilates: '필라테스',
    yoga: '요가',
    golf: '골프',
    crossfit: '크로스핏',
    boxing: '복싱',
    swimming: '수영',
    fitness: '피트니스',
    spinning: '스피닝',
  };

  return (
    <div className="min-h-screen bg-surface-secondary pb-32">
      {/* PageHeader — transparent over hero */}
      <PageHeader
        showBack
        showNotification
        onNotification={() => navigate('/notifications')}
        variant="transparent"
        className="absolute top-0 left-0 right-0 z-30"
        rightSlot={
          <button
            type="button"
            onClick={() => toggleScrap('trainer', trainer.id)}
            className="w-10 h-10 inline-flex items-center justify-center rounded-full active:bg-white/20"
            aria-label="스크랩"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${scrapped ? 'fill-state-sale text-state-sale' : 'text-white'}`}
            />
          </button>
        }
      />

      {/* Hero image */}
      <div className="relative w-full aspect-[3/4] max-h-[480px] overflow-hidden">
        <img
          src={trainer.profileUrl || avatarImg(`trainer-${trainer.id}`, 800)}
          alt={trainer.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        {/* Hero text */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-6">
          <div className="flex items-center gap-2 mb-1">
            <Badge tone="primary" size="sm" variant="solid">
              {categoryLabel[trainer.category] ?? trainer.category}
            </Badge>
            <Badge tone="neutral" size="sm" variant="soft" className="bg-white/20 text-white border-0">
              경력 {trainer.experienceYears}년
            </Badge>
          </div>
          <h1 className="text-display text-white font-bold leading-tight">{trainer.name}</h1>
          <button
            onClick={() => center && navigate(`/centers/${center.id}`)}
            className="flex items-center gap-1 mt-1 active:opacity-80"
          >
            <span className="text-body text-white/80">{trainer.centerName}</span>
            <ChevronRight className="w-4 h-4 text-white/60" />
          </button>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-body font-bold text-white">{trainer.rating.toFixed(1)}</span>
              <span className="text-body-sm text-white/70">({trainer.reviewCount})</span>
            </div>
            <span className="text-white/40">·</span>
            <span className="text-body-sm text-white/70">누적 수업 {trainer.totalLessons.toLocaleString()}회</span>
            <span className="text-white/40">·</span>
            <span className="text-body-sm text-white/70">경력 {trainer.experienceYears}년</span>
          </div>
        </div>
      </div>

      {/* Stat row */}
      <div className="mx-4 -mt-2 relative z-10 bg-surface rounded-card shadow-card-elevated">
        <div className="grid grid-cols-3 divide-x divide-line py-4">
          <StatCell label="별점" value={trainer.rating.toFixed(1)} unit="점" />
          <StatCell label="누적 수업" value={trainer.totalLessons.toLocaleString()} unit="회" />
          <StatCell label="경력" value={String(trainer.experienceYears)} unit="년" />
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-3 px-4">
        {/* 자기소개 */}
        <div className="bg-surface rounded-card shadow-card-soft p-4">
          <SectionTitle>자기소개</SectionTitle>
          <p className="text-body text-content leading-relaxed mt-2">{trainer.bio}</p>
        </div>

        {/* 전문 분야 */}
        <div className="bg-surface rounded-card shadow-card-soft p-4">
          <SectionTitle>전문 분야</SectionTitle>
          <div className="flex flex-wrap gap-2 mt-3">
            {trainer.specialties.map((s) => (
              <Badge key={s} tone="primary" size="md" variant="soft">{s}</Badge>
            ))}
          </div>
        </div>

        {/* 자격 */}
        <div className="bg-surface rounded-card shadow-card-soft p-4">
          <SectionTitle>자격 및 이력</SectionTitle>
          <div className="flex flex-col gap-2 mt-3">
            {trainer.certifications.map((cert) => (
              <div key={cert} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-body text-content">{cert}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 후기 */}
        <div className="bg-surface rounded-card shadow-card-soft p-4">
          <div className="flex items-center justify-between mb-3">
            <SectionTitle>수업 후기</SectionTitle>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ChevronRight className="w-4 h-4" />}
              onClick={() => center && navigate(`/centers/${center.id}/reviews`)}
            >
              더 보기
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            {reviews.map((review) => (
              <div key={review.id}>
                <div className="flex items-center gap-2.5">
                  <Avatar
                    src={review.authorAvatar}
                    name={review.authorName}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-body-sm font-semibold text-content">{review.authorName}</span>
                      {review.isVerified && (
                        <Badge tone="success" size="sm" variant="soft">인증</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-line-strong'}`}
                        />
                      ))}
                      <span className="text-micro text-content-tertiary ml-1">{review.createdAt}</span>
                    </div>
                  </div>
                </div>
                <p className="text-body-sm text-content-secondary mt-2 leading-relaxed">{review.body}</p>
                {review.images.length > 0 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto scrollbar-none">
                    {review.images.map((url) => (
                      <img
                        key={url}
                        src={url}
                        alt="후기 이미지"
                        className="w-20 h-20 rounded-lg object-cover shrink-0"
                      />
                    ))}
                  </div>
                )}
                <div className="h-px bg-line mt-3" />
              </div>
            ))}
          </div>
        </div>

        {/* 가능 시간 */}
        <div className="bg-surface rounded-card shadow-card-soft p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-primary" />
            <SectionTitle>가능 시간</SectionTitle>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map((day) => {
              const slots = MOCK_AVAILABILITY[day] ?? [];
              return (
                <div key={day} className="flex flex-col items-center gap-1">
                  <span className={`text-caption font-semibold mb-1 ${day === '토' || day === '일' ? 'text-state-sale' : 'text-content'}`}>
                    {day}
                  </span>
                  {slots.length === 0 ? (
                    <span className="text-micro text-content-tertiary">-</span>
                  ) : (
                    slots.map((t) => (
                      <span
                        key={t}
                        className="w-full text-center bg-primary-light text-primary text-micro rounded-md py-0.5 font-medium"
                      >
                        {t}
                      </span>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 같은 카테고리 강사 */}
        {relatedTrainers.length > 0 && (
          <div className="bg-surface rounded-card shadow-card-soft p-4">
            <SectionTitle>같은 종목 다른 강사</SectionTitle>
            <div className="flex gap-3 mt-3 overflow-x-auto scrollbar-none pb-1">
              {relatedTrainers.map((t) => (
                <button
                  key={t.id}
                  onClick={() => navigate(`/trainers/${t.id}`)}
                  className="flex flex-col items-center gap-1.5 shrink-0 w-[76px] active:opacity-80"
                >
                  <div className="relative">
                    <Avatar src={t.profileUrl} name={t.name} size="xl" />
                    <div className="absolute -bottom-1 -right-1 bg-primary text-white text-micro rounded-full px-1.5 py-0.5 font-bold shadow">
                      {t.rating.toFixed(1)}
                    </div>
                  </div>
                  <p className="text-body-sm font-semibold text-content text-center leading-tight">{t.name}</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {t.specialties.slice(0, 1).map((s) => (
                      <Tag key={s} size="sm">{s}</Tag>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom action bar — 모바일 프레임 폭 */}
      <div className="bottom-action-bar flex items-center gap-3">
        <button
          onClick={() => toggleScrap('trainer', trainer.id)}
          className="w-12 h-12 shrink-0 rounded-button border border-line-strong flex items-center justify-center active:bg-surface-tertiary"
          aria-label="스크랩"
        >
          <Heart
            className={`w-5 h-5 ${scrapped ? 'fill-state-sale text-state-sale' : 'text-content-secondary'}`}
          />
        </button>
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={() => navigate('/messages')}
        >
          1:1 톡
        </Button>
        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          onClick={() => {
            toast.info('예약 요청을 보냈습니다. 강사 확인 후 메신저로 회신됩니다.');
            navigate('/messages');
          }}
        >
          예약 요청
        </Button>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-h4 text-content font-bold">{children}</h2>;
}

function StatCell({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 py-1">
      <span className="text-caption text-content-tertiary">{label}</span>
      <div className="flex items-baseline gap-0.5">
        <span className="text-h3 text-primary font-bold">{value}</span>
        <span className="text-body-sm text-content-secondary">{unit}</span>
      </div>
    </div>
  );
}
