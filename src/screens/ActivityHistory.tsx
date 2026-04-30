'use client';

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Award,
  BadgeCheck,
  Building2,
  Calendar,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Dumbbell,
  Footprints,
  Gift,
  MapPin,
  MessageSquare,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge, Button, Card, EmptyState, PageHeader } from '@/components/ui';
import { cn, formatCurrency } from '@/lib/utils';
import {
  SAMPLE_ACTIVITY_STATS,
  SAMPLE_BADGES,
  SAMPLE_BEST_INSTRUCTORS,
  SAMPLE_CATEGORY_SHARE,
  SAMPLE_FAVORITE_CENTERS,
  SAMPLE_MONTHLY_PAYMENTS,
  SAMPLE_MONTHLY_VISITS,
  SAMPLE_TIMELINE,
  isNewMemberActivity,
  type MilestoneBadge,
  type TimelineAction,
} from '@/lib/rewards';

const TIMELINE_ICON: Record<TimelineAction, typeof Activity> = {
  visit: Footprints,
  reservation: CalendarDays,
  payment: CreditCard,
  review: MessageSquare,
};

const TIMELINE_TONE: Record<TimelineAction, { bg: string; text: string; label: string }> = {
  visit: { bg: 'bg-primary-light', text: 'text-primary', label: '방문' },
  reservation: { bg: 'bg-accent-light', text: 'text-accent-dark', label: '예약' },
  payment: { bg: 'bg-state-warning/10', text: 'text-state-warning', label: '결제' },
  review: { bg: 'bg-state-success/10', text: 'text-state-success', label: '후기' },
};

const BADGE_ICON: Record<MilestoneBadge['icon'], typeof Award> = {
  'first-pt': Dumbbell,
  'streak-10': CheckCircle2,
  'review-1': MessageSquare,
  'streak-30': Calendar,
  'big-spender': Trophy,
  'inviter': Gift,
  'early-bird': Sparkles,
  'marathon': BadgeCheck,
};

function formatKRWCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return String(value);
}

const ChartTooltip = ({
  active,
  payload,
  label,
  unit = '',
  formatter,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
  unit?: string;
  formatter?: (value: number) => string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface rounded-card shadow-card-elevated border border-line-light px-3 py-2 text-caption">
      <p className="font-semibold text-content mb-0.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          <span className="text-content-secondary mr-1">{p.name}</span>
          <span className="font-bold">{formatter ? formatter(p.value) : `${p.value}${unit}`}</span>
        </p>
      ))}
    </div>
  );
};

/** 활동 이력 / 시각화 화면 */
export default function ActivityHistory() {
  const navigate = useNavigate();
  const stats = SAMPLE_ACTIVITY_STATS;

  const earnedBadges = useMemo(() => SAMPLE_BADGES.filter((b) => b.earned), []);
  const lockedBadges = useMemo(() => SAMPLE_BADGES.filter((b) => !b.earned), []);

  const groupedTimeline = useMemo(() => {
    const map = new Map<string, typeof SAMPLE_TIMELINE>();
    SAMPLE_TIMELINE.forEach((entry) => {
      const list = map.get(entry.date) ?? [];
      list.push(entry);
      map.set(entry.date, list);
    });
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, []);

  const isEmpty = isNewMemberActivity(stats);

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <PageHeader title="활동 이력" />
        <EmptyState
          icon={<Dumbbell className="w-8 h-8" />}
          title="첫 운동을 시작해보세요"
          description="활동 이력이 쌓이면 월별 차트와 배지를 확인할 수 있어요"
          size="lg"
          action={
            <Button variant="primary" onClick={() => navigate('/shop')}>
              이용권 둘러보기
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-secondary pb-12">
      <PageHeader title="활동 이력" />

      <div className="px-5 py-4 space-y-5">
        {/* ── Stat Grid 4종 ───────────────────────────── */}
        <section className="grid grid-cols-2 gap-3">
          {[
            {
              label: '누적 결제',
              value: formatCurrency(stats.totalSpend),
              icon: CreditCard,
              tone: 'bg-primary/10 text-primary',
            },
            {
              label: '방문 횟수',
              value: `${stats.visitCount}회`,
              icon: Footprints,
              tone: 'bg-accent/10 text-accent-dark',
            },
            {
              label: '완료 수업',
              value: `${stats.lessonCount}회`,
              icon: Dumbbell,
              tone: 'bg-state-success/10 text-state-success',
            },
            {
              label: '작성 후기',
              value: `${stats.reviewCount}건`,
              icon: MessageSquare,
              tone: 'bg-state-warning/10 text-state-warning',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.label} variant="elevated" padding="md">
                <div className={cn('w-9 h-9 rounded-card flex items-center justify-center', card.tone)}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <p className="mt-3 text-caption text-content-tertiary">{card.label}</p>
                <p className="mt-0.5 text-h2 text-content">{card.value}</p>
              </Card>
            );
          })}
        </section>

        {/* ── 차트 1: 월별 방문 추이 ───────────────────── */}
        <Card variant="elevated" padding="md">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-h4 text-content">월별 방문 추이</p>
              <p className="text-caption text-content-tertiary mt-0.5">최근 12개월</p>
            </div>
            <Badge tone="primary" variant="soft">
              평균 7회/월
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={SAMPLE_MONTHLY_VISITS} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <Tooltip content={<ChartTooltip unit="회" />} cursor={{ fill: '#0E7C7B0F' }} />
              <Bar dataKey="visits" name="방문" fill="#0E7C7B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* ── 차트 2: 카테고리별 활동 ────────────────── */}
        <Card variant="elevated" padding="md">
          <div className="mb-3">
            <p className="text-h4 text-content">카테고리별 활동 비율</p>
            <p className="text-caption text-content-tertiary mt-0.5">
              가장 많이 한 운동 — <span className="text-primary font-semibold">PT</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie
                  data={SAMPLE_CATEGORY_SHARE}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {SAMPLE_CATEGORY_SHARE.map((c, i) => (
                    <Cell key={i} fill={c.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={<ChartTooltip formatter={(v) => `${v}%`} />}
                  cursor={{ fill: 'transparent' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <ul className="flex-1 space-y-2">
              {SAMPLE_CATEGORY_SHARE.map((cat) => (
                <li key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                    <span className="text-body-sm text-content-secondary">{cat.name}</span>
                  </div>
                  <span className="text-body-sm font-bold text-content">{cat.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* ── 차트 3: 누적 결제 추이 ────────────────── */}
        <Card variant="elevated" padding="md">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-h4 text-content">누적 결제 금액 추이</p>
              <p className="text-caption text-content-tertiary mt-0.5">최근 12개월</p>
            </div>
            <Badge tone="success" variant="soft">
              <TrendingUp className="w-3 h-3" />
              +18%
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={SAMPLE_MONTHLY_PAYMENTS} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="paymentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0E7C7B" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#0E7C7B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <YAxis
                tickFormatter={formatKRWCompact}
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
              />
              <Tooltip
                content={<ChartTooltip formatter={(v) => formatCurrency(v)} />}
                cursor={{ stroke: '#0E7C7B40', strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                name="결제"
                stroke="#0E7C7B"
                strokeWidth={2.5}
                fill="url(#paymentGradient)"
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* ── 베스트 강사 ───────────────────────────── */}
        <section>
          <h3 className="text-h3 text-content px-1 mb-3">베스트 강사</h3>
          <div className="grid grid-cols-2 gap-3">
            {SAMPLE_BEST_INSTRUCTORS.map((ins, idx) => (
              <Card key={ins.id} variant="elevated" padding="md">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-h4 font-bold text-content"
                  style={{ backgroundColor: ins.avatarColor }}
                >
                  {ins.name.slice(0, 1)}
                </div>
                <p className="mt-3 text-body font-semibold text-content">{ins.name}</p>
                <p className="text-caption text-content-tertiary">PT {ins.totalSessions}회 받음</p>
                <div className="mt-2 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-state-warning text-state-warning" />
                  <span className="text-caption font-bold text-state-warning">{ins.rating.toFixed(1)}</span>
                  {idx === 0 && (
                    <Badge tone="primary" variant="soft" className="ml-auto">
                      MVP
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ── 자주 가는 센터 ───────────────────────── */}
        <section>
          <h3 className="text-h3 text-content px-1 mb-3">자주 가는 센터</h3>
          <Card variant="soft" padding="none">
            <ul className="divide-y divide-line-light">
              {SAMPLE_FAVORITE_CENTERS.map((center, idx) => (
                <li key={center.id} className="flex items-center gap-3 px-4 py-3.5">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center text-body-sm font-bold shrink-0',
                      idx === 0 && 'bg-state-warning text-white',
                      idx === 1 && 'bg-content-secondary text-white',
                      idx === 2 && 'bg-surface-tertiary text-content-secondary'
                    )}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-semibold text-content truncate">{center.name}</p>
                    <p className="text-caption text-content-tertiary mt-0.5 inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {center.area}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-body-sm font-bold text-primary">{center.visitCount}회</p>
                    <p className="text-caption text-content-tertiary mt-0.5">최근 {center.lastVisitedAt}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* ── 받은 배지 ───────────────────────────── */}
        <section>
          <div className="flex items-end justify-between px-1 mb-3">
            <h3 className="text-h3 text-content">받은 배지 ({earnedBadges.length})</h3>
            <span className="text-caption text-content-tertiary">
              잠긴 배지 {lockedBadges.length}개
            </span>
          </div>
          <div className="-mx-5 overflow-x-auto pb-1">
            <div className="flex gap-3 px-5">
              {SAMPLE_BADGES.map((badge) => {
                const Icon = BADGE_ICON[badge.icon];
                return (
                  <div
                    key={badge.id}
                    className={cn(
                      'shrink-0 w-32 rounded-card-lg p-4 text-center',
                      badge.earned
                        ? 'bg-surface shadow-card-soft'
                        : 'bg-surface-tertiary opacity-60'
                    )}
                  >
                    <div
                      className={cn(
                        'w-14 h-14 rounded-full mx-auto flex items-center justify-center',
                        badge.earned
                          ? 'bg-gradient-to-br from-primary to-accent text-white'
                          : 'bg-line text-content-tertiary'
                      )}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className="mt-2 text-body-sm font-semibold text-content">{badge.title}</p>
                    <p className="text-caption text-content-tertiary mt-0.5 line-clamp-2 min-h-[36px]">
                      {badge.description}
                    </p>
                    {badge.earned && badge.earnedAt && (
                      <p className="text-[10px] text-primary font-semibold mt-1">{badge.earnedAt} 획득</p>
                    )}
                    {!badge.earned && (
                      <p className="text-[10px] text-content-tertiary font-semibold mt-1">잠김</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 타임라인 ───────────────────────────── */}
        <section>
          <h3 className="text-h3 text-content px-1 mb-3">최근 30일 활동</h3>
          <Card variant="soft" padding="md">
            <ol className="space-y-5">
              {groupedTimeline.map(([date, entries]) => (
                <li key={date}>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-3.5 h-3.5 text-content-tertiary" />
                    <span className="text-caption font-semibold text-content-secondary">{date}</span>
                    <span className="flex-1 h-px bg-line-light" />
                  </div>
                  <ul className="space-y-2.5">
                    {entries.map((entry) => {
                      const Icon = TIMELINE_ICON[entry.action];
                      const tone = TIMELINE_TONE[entry.action];
                      return (
                        <li key={entry.id} className="flex items-start gap-3">
                          <div
                            className={cn(
                              'w-9 h-9 rounded-card flex items-center justify-center shrink-0',
                              tone.bg,
                              tone.text
                            )}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-body font-medium text-content truncate">{entry.title}</p>
                              {entry.amount && (
                                <span className="text-body-sm font-bold text-primary shrink-0">
                                  {formatCurrency(entry.amount)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge tone="neutral" variant="soft">
                                {tone.label}
                              </Badge>
                              {entry.meta && (
                                <span className="text-caption text-content-tertiary">{entry.meta}</span>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ol>
          </Card>
        </section>

        {/* ── 멤버십 / 추천 cross-link ─────────────── */}
        <section className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => navigate('/membership-grade')}
            className="rounded-card-lg p-4 bg-surface shadow-card-soft text-left active:bg-surface-secondary"
          >
            <Award className="w-5 h-5 text-primary" />
            <p className="mt-2 text-body font-semibold text-content">내 멤버십 등급</p>
            <p className="text-caption text-content-tertiary mt-0.5">등급별 혜택 확인</p>
          </button>
          <button
            type="button"
            onClick={() => navigate('/referral')}
            className="rounded-card-lg p-4 bg-surface shadow-card-soft text-left active:bg-surface-secondary"
          >
            <Building2 className="w-5 h-5 text-accent-dark" />
            <p className="mt-2 text-body font-semibold text-content">친구 초대</p>
            <p className="text-caption text-content-tertiary mt-0.5">최대 13,000원 적립</p>
          </button>
        </section>
      </div>
    </div>
  );
}
