'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Users, Clock, Star, DollarSign } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { getTrainerKpi } from '@/lib/mockOperations';
import { Card, Chip } from '@/components/ui';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

const monthlySales = [
  { month: '1월', 매출: 3800000 },
  { month: '2월', 매출: 4200000 },
  { month: '3월', 매출: 3950000 },
  { month: '4월', 매출: 4600000 },
  { month: '5월', 매출: 4300000 },
  { month: '6월', 매출: 5100000 },
  { month: '7월', 매출: 5500000 },
  { month: '8월', 매출: 5200000 },
  { month: '9월', 매출: 5800000 },
  { month: '10월', 매출: 6100000 },
  { month: '11월', 매출: 6400000 },
  { month: '12월', 매출: 6800000 },
];

const weeklyActivity = [
  { day: '월', PT: 8, 그룹: 3 },
  { day: '화', PT: 10, 그룹: 4 },
  { day: '수', PT: 7, 그룹: 5 },
  { day: '목', PT: 11, 그룹: 3 },
  { day: '금', PT: 9, 그룹: 6 },
  { day: '토', PT: 12, 그룹: 2 },
  { day: '일', PT: 4, 그룹: 1 },
];

const ratingDistribution = [
  { star: '5★', count: 87 },
  { star: '4★', count: 52 },
  { star: '3★', count: 18 },
  { star: '2★', count: 6 },
  { star: '1★', count: 2 },
];

const timeSlotData = [
  { time: '7시', 월: 3, 화: 4, 수: 3, 목: 5, 금: 4, 토: 6, 일: 2 },
  { time: '9시', 월: 6, 화: 7, 수: 5, 목: 8, 금: 6, 토: 9, 일: 3 },
  { time: '11시', 월: 5, 화: 6, 수: 4, 목: 6, 금: 5, 토: 7, 일: 4 },
  { time: '13시', 월: 4, 화: 5, 수: 3, 목: 5, 금: 4, 토: 5, 일: 3 },
  { time: '15시', 월: 7, 화: 8, 수: 6, 목: 9, 금: 7, 토: 8, 일: 5 },
  { time: '17시', 월: 9, 화: 10, 수: 8, 목: 11, 금: 9, 토: 10, 일: 4 },
  { time: '19시', 월: 11, 화: 12, 수: 10, 목: 12, 금: 11, 토: 8, 일: 5 },
  { time: '21시', 월: 6, 화: 7, 수: 5, 목: 7, 금: 6, 토: 4, 일: 2 },
];

const memberSegments = [
  { name: '다이어트', value: 34 },
  { name: '근력강화', value: 28 },
  { name: '재활', value: 14 },
  { name: '시니어', value: 12 },
  { name: '주니어', value: 8 },
  { name: '기타', value: 4 },
];

const topMembers = [
  { name: '김민준', attendance: 28, rating: 5.0, avatar: 'K' },
  { name: '이서연', attendance: 25, rating: 4.9, avatar: 'L' },
  { name: '박도현', attendance: 23, rating: 4.8, avatar: 'P' },
  { name: '최지아', attendance: 21, rating: 4.9, avatar: 'C' },
  { name: '정하은', attendance: 19, rating: 4.7, avatar: 'J' },
];

const PIE_COLORS = ['#0E7C7B', '#3FB6B2', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6'];
const TIME_COLORS = ['#0E7C7B', '#3FB6B2', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const PERIODS = ['이번 주', '이번 달', '분기', '연간'] as const;
type Period = typeof PERIODS[number];

function formatKRW(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return String(value);
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface rounded-card shadow-card-soft border border-surface-secondary p-3 text-xs">
      <p className="font-semibold text-content mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{typeof p.value === 'number' && p.value > 10000 ? formatKRW(p.value) : p.value}</span></p>
      ))}
    </div>
  );
};

export default function TrainerKpi() {
  const kpi = getTrainerKpi();
  const [period, setPeriod] = useState<Period>('이번 달');

  const statCards = [
    {
      label: '이번 달 매출',
      value: '6,800,000원',
      sub: '+12% 지난달 대비',
      up: true,
      icon: DollarSign,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: '신규 회원',
      value: '8명',
      sub: '+3명 지난달 대비',
      up: true,
      icon: Users,
      color: 'text-state-success',
      bg: 'bg-state-success/10',
    },
    {
      label: '수업 시간',
      value: `${kpi.totalClasses}시간`,
      sub: '완료율 ' + kpi.completionRate + '%',
      up: true,
      icon: Clock,
      color: 'text-state-info',
      bg: 'bg-state-info/10',
    },
    {
      label: '만족도 평점',
      value: '4.8 ★',
      sub: '-0.1 지난달 대비',
      up: false,
      icon: Star,
      color: 'text-state-warning',
      bg: 'bg-state-warning/10',
    },
  ];

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Header */}
      <header className="bg-gradient-to-br from-teal-600 to-cyan-600 px-5 pt-safe-top pb-6">
        <div className="pt-4">
          <p className="text-white/70 text-xs tracking-wide">강사 성과 대시보드</p>
          <h1 className="text-white text-2xl font-bold mt-1">KPI</h1>
        </div>
        {/* Period filter */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                period === p
                  ? 'bg-white text-teal-700'
                  : 'bg-white/20 text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 py-4 pb-28 space-y-4">

        {/* ── Stat Cards 4종 ── */}
        <div className="grid grid-cols-2 gap-3">
          {statCards.map((c) => {
            const Icon = c.icon;
            return (
              <Card key={c.label} variant="elevated" padding="md">
                <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${c.color}`} />
                </div>
                <p className="mt-3 text-[11px] text-content-tertiary">{c.label}</p>
                <p className="mt-0.5 text-lg font-bold text-content">{c.value}</p>
                <div className="mt-1 flex items-center gap-1">
                  {c.up
                    ? <TrendingUp className="w-3 h-3 text-state-success" />
                    : <TrendingDown className="w-3 h-3 text-state-error" />}
                  <span className={`text-[10px] font-medium ${c.up ? 'text-state-success' : 'text-state-error'}`}>{c.sub}</span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* ── Card 1: 매출 추이 ── */}
        <Card variant="elevated" padding="md">
          <p className="text-sm font-bold text-content mb-1">월별 매출 추이</p>
          <p className="text-xs text-content-tertiary mb-4">최근 12개월</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlySales} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <YAxis tickFormatter={formatKRW} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="매출"
                stroke="#0E7C7B"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#0E7C7B', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* ── Card 2: 회원 활동 분포 ── */}
        <Card variant="elevated" padding="md">
          <p className="text-sm font-bold text-content mb-1">요일별 수업 분포</p>
          <p className="text-xs text-content-tertiary mb-4">PT · 그룹 클래스</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyActivity} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="PT" stackId="a" fill="#0E7C7B" radius={[0, 0, 0, 0]} />
              <Bar dataKey="그룹" stackId="a" fill="#3FB6B2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* ── Card 3: 회원 별점 분포 ── */}
        <Card variant="elevated" padding="md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-content">회원 별점 분포</p>
              <p className="text-xs text-content-tertiary">총 165건 리뷰</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">4.8</p>
              <p className="text-xs text-state-warning">★★★★★</p>
            </div>
          </div>
          <div className="space-y-2.5">
            {ratingDistribution.map((r) => {
              const pct = Math.round((r.count / 165) * 100);
              return (
                <div key={r.star} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-content-secondary w-8">{r.star}</span>
                  <div className="flex-1 h-2 bg-surface-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-content-tertiary w-8 text-right">{r.count}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* ── Card 4: 인기 시간대 (stacked bar by hour) ── */}
        <Card variant="elevated" padding="md">
          <p className="text-sm font-bold text-content mb-1">인기 시간대</p>
          <p className="text-xs text-content-tertiary mb-4">요일별 수업 집중도 (7시~21시)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={timeSlotData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="월" stackId="a" fill={TIME_COLORS[0]} />
              <Bar dataKey="화" stackId="a" fill={TIME_COLORS[1]} />
              <Bar dataKey="수" stackId="a" fill={TIME_COLORS[2]} />
              <Bar dataKey="목" stackId="a" fill={TIME_COLORS[3]} />
              <Bar dataKey="금" stackId="a" fill={TIME_COLORS[4]} />
              <Bar dataKey="토" stackId="a" fill={TIME_COLORS[5]} />
              <Bar dataKey="일" stackId="a" fill={TIME_COLORS[6]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* ── Card 5: 회원 세그먼트 ── */}
        <Card variant="elevated" padding="md">
          <p className="text-sm font-bold text-content mb-1">회원 목표 세그먼트</p>
          <p className="text-xs text-content-tertiary mb-2">활성 회원 {kpi.activeMembers}명 기준</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie
                  data={memberSegments}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {memberSegments.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: unknown) => [`${v}명`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {memberSegments.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-xs text-content-secondary">{s.name}</span>
                  </div>
                  <span className="text-xs font-bold text-content">{s.value}명</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* ── Card 6: Top 회원 ── */}
        <Card variant="elevated" padding="md">
          <p className="text-sm font-bold text-content mb-4">Top 5 회원</p>
          <div className="space-y-3">
            {topMembers.map((m, i) => (
              <div key={m.name} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-state-warning text-white' : i === 1 ? 'bg-surface-secondary text-content-secondary' : 'bg-surface-tertiary text-content-tertiary'}`}>
                  {i + 1}
                </div>
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {m.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-content">{m.name}</p>
                  <p className="text-xs text-content-tertiary">출석 {m.attendance}회</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-state-warning">{m.rating.toFixed(1)} ★</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}
