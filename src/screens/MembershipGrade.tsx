'use client';

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  Crown,
  Gift,
  Lock,
  Sparkles,
  Star,
  Tag,
  Ticket,
  TrendingUp,
  UserCog,
  UserPlus,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Badge, Card, PageHeader } from '@/components/ui';
import { cn, formatCurrency } from '@/lib/utils';
import {
  MEMBERSHIP_GRADES,
  getCurrentGrade,
  getGradeProgress,
  getNextGrade,
  type GradeBenefit,
  type MembershipGrade as MembershipGradeType,
} from '@/lib/rewards';

const BENEFIT_ICON: Record<GradeBenefit['icon'], typeof Star> = {
  discount: Tag,
  inbody: Sparkles,
  priority: TrendingUp,
  locker: Lock,
  private: Crown,
  manager: UserCog,
  review: Star,
  gift: Gift,
};

/** 회원 등급 / 멤버십 화면 */
export default function MembershipGrade() {
  const navigate = useNavigate();
  const { member } = useAuthStore();

  // mock: 누적 이용 금액 (실데이터 연동 전까지 예시 값)
  const totalSpend = 2_150_000;
  const memberName = member?.name || '회원';

  const currentGrade = useMemo(() => getCurrentGrade(totalSpend), [totalSpend]);
  const nextGrade = useMemo(() => getNextGrade(currentGrade.id), [currentGrade.id]);
  const progress = useMemo(() => getGradeProgress(totalSpend, currentGrade.id), [totalSpend, currentGrade.id]);
  const remaining = nextGrade ? Math.max(nextGrade.threshold - totalSpend, 0) : 0;

  const [selectedGradeId, setSelectedGradeId] = useState<MembershipGradeType['id']>(currentGrade.id);
  const selectedGrade = MEMBERSHIP_GRADES.find((g) => g.id === selectedGradeId) ?? currentGrade;

  return (
    <div className="min-h-screen bg-surface-secondary pb-12">
      <PageHeader title="멤버십" />

      <div className="px-5 py-4 space-y-5">
        {/* ── 현재 등급 카드 ─────────────────────────────── */}
        <section
          className={cn(
            'relative overflow-hidden rounded-card-lg p-5 text-white shadow-card-elevated',
            'bg-gradient-to-br',
            currentGrade.gradient
          )}
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" aria-hidden />
          <div className="absolute bottom-0 left-1/3 w-24 h-24 rounded-full bg-white/5 blur-xl" aria-hidden />

          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-caption">현재 등급</p>
                <h2 className="mt-1 text-h1 font-bold tracking-tight">
                  {memberName}
                  <span className="text-white/70 text-h3 font-medium ml-2">님</span>
                </h2>
              </div>
              <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-sm">
                <Crown className="w-7 h-7 text-white" />
              </div>
            </div>

            <div className="mt-4 inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-pill px-3 py-1.5">
              <Award className="w-4 h-4" />
              <span className="text-body-sm font-bold tracking-wide">{currentGrade.name}</span>
              <span className="text-white/80 text-caption">· {currentGrade.tagline}</span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div>
                <p className="text-caption text-white/70">누적 이용 금액</p>
                <p className="mt-1 text-h2 font-bold">{formatCurrency(totalSpend)}</p>
              </div>
              <div className="text-right">
                <p className="text-caption text-white/70">올해 적립 포인트</p>
                <p className="mt-1 text-h2 font-bold">21,500P</p>
              </div>
            </div>

            {nextGrade ? (
              <div className="mt-5">
                <div className="flex items-center justify-between text-caption text-white/85 mb-2">
                  <span>다음 등급 {nextGrade.name}까지</span>
                  <span className="font-semibold text-white">{progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.6)] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-body-sm">
                  <span className="font-semibold">{nextGrade.name}</span>까지{' '}
                  <span className="font-bold">{formatCurrency(remaining)}</span> 남았어요.
                </p>
              </div>
            ) : (
              <div className="mt-5 inline-flex items-center gap-2 bg-white/15 rounded-pill px-3 py-1.5">
                <Sparkles className="w-4 h-4" />
                <span className="text-body-sm font-semibold">최상위 멤버십이에요</span>
              </div>
            )}
          </div>
        </section>

        {/* ── 등급 비교 carousel ─────────────────────────── */}
        <section>
          <div className="flex items-end justify-between px-1 mb-3">
            <div>
              <h3 className="text-h3 text-content">등급별 혜택</h3>
              <p className="text-caption text-content-tertiary mt-0.5">좌우로 밀어 비교해 보세요</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedGradeId(currentGrade.id)}
              className="text-caption text-primary font-semibold"
            >
              내 등급 보기
            </button>
          </div>

          <div className="-mx-5 overflow-x-auto pb-2">
            <div className="flex gap-3 px-5 snap-x snap-mandatory">
              {MEMBERSHIP_GRADES.map((grade) => {
                const isCurrent = grade.id === currentGrade.id;
                const isActive = grade.id === selectedGradeId;
                return (
                  <button
                    key={grade.id}
                    type="button"
                    onClick={() => setSelectedGradeId(grade.id)}
                    className={cn(
                      'shrink-0 w-44 snap-start text-left rounded-card-lg p-4 transition-all relative overflow-hidden',
                      'bg-gradient-to-br text-white shadow-card-soft',
                      grade.gradient,
                      isActive && 'ring-2 ring-offset-2 ring-offset-surface-secondary ring-primary scale-[1.02]',
                      !isActive && 'opacity-90'
                    )}
                    aria-pressed={isActive}
                  >
                    {isCurrent && (
                      <span className="absolute top-2 right-2 text-[10px] font-bold bg-white/95 text-primary rounded-pill px-2 py-0.5">
                        내 등급
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                        <Award className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-body-sm font-bold tracking-wide">{grade.name}</span>
                    </div>
                    <p className="mt-3 text-caption text-white/80">{grade.tagline}</p>
                    <p className="mt-1 text-h4 font-bold">
                      {grade.threshold === 0 ? '가입 시' : `${(grade.threshold / 10_000).toLocaleString()}만+`}
                    </p>
                    <p className="mt-2 text-caption text-white/85 line-clamp-2 min-h-[36px]">{grade.summary}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 선택된 등급 혜택 강조 ─────────────────────── */}
        <section>
          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-caption text-content-tertiary">{selectedGrade.tagline}</p>
                <h3 className={cn('text-h2 mt-0.5', selectedGrade.accentText)}>{selectedGrade.name} 혜택</h3>
              </div>
              <Badge tone={selectedGrade.id === currentGrade.id ? 'primary' : 'neutral'} variant="soft">
                {selectedGrade.id === currentGrade.id ? '현재 등급' : '미리 보기'}
              </Badge>
            </div>

            <ul className="space-y-3">
              {selectedGrade.benefits.map((benefit) => {
                const Icon = BENEFIT_ICON[benefit.icon];
                return (
                  <li
                    key={benefit.title}
                    className="flex items-start gap-3 rounded-card bg-surface-secondary p-3"
                  >
                    <div className="w-9 h-9 rounded-card bg-primary-light text-primary flex items-center justify-center shrink-0">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body font-semibold text-content">{benefit.title}</p>
                      <p className="text-body-sm text-content-secondary mt-0.5">{benefit.description}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </section>

        {/* ── 등급 산정 기준 ─────────────────────────────── */}
        <section>
          <Card variant="outline" padding="md">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-card bg-primary-light text-primary flex items-center justify-center shrink-0">
                <Ticket className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1">
                <p className="text-body font-semibold text-content">등급 산정 기준</p>
                <ul className="mt-2 space-y-1 text-body-sm text-content-secondary list-disc pl-4">
                  <li>최근 12개월 누적 이용 금액 기준으로 매월 1일 갱신돼요.</li>
                  <li>이용권/PT/굿즈/동반 결제가 모두 누적 금액에 포함돼요.</li>
                  <li>환불 시 해당 금액은 누적에서 차감돼요.</li>
                  <li>등급은 한 번 올라가면 1년간 유지돼요.</li>
                </ul>
              </div>
            </div>
          </Card>
        </section>

        {/* ── 친구 초대 CTA ──────────────────────────────── */}
        <section>
          <button
            type="button"
            onClick={() => navigate('/referral')}
            className="w-full text-left bg-gradient-to-r from-primary to-accent rounded-card-lg p-5 shadow-card-elevated text-white relative overflow-hidden"
          >
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl" aria-hidden />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-sm">
                <UserPlus className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-caption text-white/85">친구 초대로 등급 빨리 올리기</p>
                <p className="mt-0.5 text-h3 text-white">친구 1명당 최대 13,000원 적립</p>
              </div>
              <span className="text-body-sm font-semibold">바로가기 →</span>
            </div>
          </button>
        </section>
      </div>
    </div>
  );
}
