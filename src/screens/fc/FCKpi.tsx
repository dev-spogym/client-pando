'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Trophy, Users, Target, AlertCircle } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { getFcKpi } from '@/lib/mockOperations';
import { Card } from '@/components/ui';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const funnelData = [
  { stage: '상담 신청', count: 100 },
  { stage: '1차 미팅', count: 80 },
  { stage: '2차 미팅', count: 50 },
  { stage: '계약', count: 30 },
  { stage: '결제', count: 22 },
];

const monthlySalesFC = [
  { month: '1월', 매출: 12500000, 목표: 13000000 },
  { month: '2월', 매출: 13200000, 목표: 13000000 },
  { month: '3월', 매출: 14100000, 목표: 14000000 },
  { month: '4월', 매출: 13800000, 목표: 14000000 },
  { month: '5월', 매출: 15200000, 목표: 15000000 },
  { month: '6월', 매출: 16400000, 목표: 15000000 },
  { month: '7월', 매출: 15900000, 목표: 16000000 },
  { month: '8월', 매출: 17100000, 목표: 16000000 },
  { month: '9월', 매출: 18200000, 목표: 17000000 },
  { month: '10월', 매출: 17800000, 목표: 17500000 },
  { month: '11월', 매출: 19500000, 목표: 18000000 },
  { month: '12월', 매출: 21000000, 목표: 19000000 },
];

const consultCategories = [
  { name: 'PT', value: 38 },
  { name: '헬스 회원권', value: 26 },
  { name: '필라테스', value: 18 },
  { name: '요가', value: 12 },
  { name: '골프', value: 6 },
];

// 30일치 만료 예정
const expiryData = Array.from({ length: 30 }, (_, i) => {
  const dayOfWeek = (i % 7);
  const base = dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 2;
  const count = base + Math.floor(((i * 7 + 13) % 5));
  return { day: `${i + 1}일`, count };
});

const comparisonData = [
  { metric: '신규 상담', me: 28, avg: 22, max: 35 },
  { metric: '전환율', me: 72, avg: 58, max: 85 },
  { metric: '매출', me: 88, avg: 70, max: 100 },
  { metric: '만족도', me: 92, avg: 80, max: 100 },
];

const PIE_COLORS = ['#0E7C7B', '#3FB6B2', '#F59E0B', '#10B981', '#EF4444'];

const PERIODS = ['이번 주', '이번 달', '분기', '연간'] as const;
type Period = typeof PERIODS[number];

function formatKRW(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return String(value);
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface rounded-card shadow-card-soft border border-surface-secondary p-3 text-caption">
      <p className="font-semibold text-content mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{typeof p.value === 'number' && p.value > 10000 ? formatKRW(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  );
};

const FunnelTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  const count = payload[0].value;
  const pct = Math.round((count / 100) * 100);
  return (
    <div className="bg-surface rounded-card shadow-card-soft border border-surface-secondary p-3 text-caption">
      <p className="font-semibold text-content mb-1">{label}</p>
      <p className="text-primary font-bold">{count}명</p>
      <p className="text-content-tertiary">전체 대비 {pct}%</p>
    </div>
  );
};

export default function FCKpi() {
  const kpi = getFcKpi();
  const [period, setPeriod] = useState<Period>('이번 달');

  const statCards = [
    {
      label: '이번 달 신규 상담',
      value: `${kpi.totalConsultations}건`,
      sub: '+6건 지난달 대비',
      up: true,
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: '계약 전환율',
      value: `${kpi.conversionRate}%`,
      sub: '+3.2%p 지난달 대비',
      up: true,
      icon: Target,
      color: 'text-state-success',
      bg: 'bg-state-success/10',
    },
    {
      label: '이번 달 매출',
      value: '21,000,000원',
      sub: '+7.7% 지난달 대비',
      up: true,
      icon: TrendingUp,
      color: 'text-state-info',
      bg: 'bg-state-info/10',
    },
    {
      label: '만료 예정 회원',
      value: '47명',
      sub: '30일 이내 만료',
      up: false,
      icon: AlertCircle,
      color: 'text-state-warning',
      bg: 'bg-state-warning/10',
    },
  ];

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary to-primary-dark px-5 pt-safe-top pb-6">
        <div className="pt-4">
          <p className="text-white/70 text-caption tracking-wide">FC 성과 대시보드</p>
          <h1 className="text-white text-h1 font-bold mt-1">KPI</h1>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-caption font-semibold transition-all ${
                period === p ? 'bg-white text-primary' : 'bg-white/20 text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 py-4 pb-28 space-y-4">

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 gap-3">
          {statCards.map((c) => {
            const Icon = c.icon;
            return (
              <Card key={c.label} variant="elevated" padding="md">
                <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${c.color}`} />
                </div>
                <p className="mt-3 text-[11px] text-content-tertiary">{c.label}</p>
                <p className="mt-0.5 text-body-lg font-bold text-content leading-tight">{c.value}</p>
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

        {/* ── Card 1: Funnel ── */}
        <Card variant="elevated" padding="md">
          <p className="text-body font-bold text-content mb-1">상담 → 계약 전환 퍼널</p>
          <p className="text-caption text-content-tertiary mb-4">이번 달 기준 · 총 100건 상담</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={funnelData} layout="vertical" margin={{ top: 4, right: 40, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9CA3AF' }} domain={[0, 110]} />
              <YAxis type="category" dataKey="stage" tick={{ fontSize: 10, fill: '#6B7280' }} width={68} />
              <Tooltip content={<FunnelTooltip />} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} label={{ position: 'right', fontSize: 10, fill: '#6B7280', formatter: (v: unknown) => `${v}명` }}>
                {funnelData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={`rgba(14,124,123,${1 - i * 0.15})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* drop-off indicators */}
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {funnelData.slice(1).map((stage, i) => {
              const prev = funnelData[i].count;
              const dropPct = Math.round(((prev - stage.count) / prev) * 100);
              return (
                <div key={stage.stage} className="shrink-0 bg-state-error/10 rounded-lg px-3 py-1.5 text-center">
                  <p className="text-[10px] text-content-tertiary">{funnelData[i].stage} → {stage.stage}</p>
                  <p className="text-caption font-bold text-state-error">-{dropPct}%</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* ── Card 2: 매출 추이 (Area + Line) ── */}
        <Card variant="elevated" padding="md">
          <p className="text-body font-bold text-content mb-1">월별 매출 추이</p>
          <p className="text-caption text-content-tertiary mb-4">목표 vs 실적 (최근 12개월)</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlySalesFC} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="fcSalesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0E7C7B" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0E7C7B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <YAxis tickFormatter={formatKRW} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="매출" stroke="#0E7C7B" strokeWidth={2.5} fill="url(#fcSalesGrad)" dot={{ r: 3, fill: '#0E7C7B', strokeWidth: 0 }} />
              <Line type="monotone" dataKey="목표" stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* ── Card 3: 상담 카테고리 분포 ── */}
        <Card variant="elevated" padding="md">
          <p className="text-body font-bold text-content mb-2">상담 카테고리 분포</p>
          <div className="flex items-center gap-2">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie
                  data={consultCategories}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {consultCategories.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: unknown) => [`${v}건`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {consultCategories.map((c, i) => {
                const total = consultCategories.reduce((s, x) => s + x.value, 0);
                const pct = Math.round((c.value / total) * 100);
                return (
                  <div key={c.name}>
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                        <span className="text-caption text-content-secondary">{c.name}</span>
                      </div>
                      <span className="text-caption font-bold text-content">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-surface-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: PIE_COLORS[i] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* ── Card 4: 만료 예정 분포 ── */}
        <Card variant="elevated" padding="md">
          <p className="text-body font-bold text-content mb-1">만료 예정 회원 분포</p>
          <p className="text-caption text-content-tertiary mb-4">향후 30일 · 일자별</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={expiryData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#9CA3AF' }} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#EF4444" opacity={0.75} radius={[3, 3, 0, 0]} name="만료 예정" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* ── Card 5: 본인 vs 평균 ── */}
        <Card variant="elevated" padding="md">
          <p className="text-body font-bold text-content mb-4">본인 vs 센터 평균 비교</p>
          <div className="space-y-4">
            {comparisonData.map((d) => {
              const mePct = Math.round((d.me / d.max) * 100);
              const avgPct = Math.round((d.avg / d.max) * 100);
              return (
                <div key={d.metric}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-caption font-semibold text-content">{d.metric}</span>
                    <div className="flex gap-3">
                      <span className="text-caption font-bold text-primary">나 {d.me}{d.metric === '매출' || d.metric === '만족도' ? '%' : d.metric === '신규 상담' ? '건' : '%'}</span>
                      <span className="text-caption text-content-tertiary">평균 {d.avg}{d.metric === '신규 상담' ? '건' : '%'}</span>
                    </div>
                  </div>
                  <div className="relative h-2.5 bg-surface-secondary rounded-full overflow-hidden">
                    <div className="absolute h-full bg-primary/20 rounded-full" style={{ width: `${avgPct}%` }} />
                    <div className="absolute h-full bg-primary rounded-full transition-all" style={{ width: `${mePct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-4 text-[10px] text-content-tertiary">
            <span className="flex items-center gap-1"><span className="w-3 h-1 rounded bg-primary inline-block" /> 본인</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1 rounded bg-primary/20 inline-block" /> 센터 평균</span>
          </div>
        </Card>

        {/* ── Card 6: Best Month ── */}
        <Card variant="elevated" padding="md">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-state-warning/10 flex items-center justify-center shrink-0">
              <Trophy className="w-7 h-7 text-state-warning" />
            </div>
            <div className="flex-1">
              <p className="text-caption text-content-tertiary mb-0.5">역대 최고 기록</p>
              <p className="text-h4 font-bold text-content">2025년 12월</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  { label: '월 매출', value: '21,000,000원' },
                  { label: '신규 상담', value: '42건' },
                  { label: '전환율', value: '78%' },
                  { label: '만족도', value: '4.9 ★' },
                ].map((r) => (
                  <div key={r.label} className="bg-surface-secondary rounded-xl px-3 py-2">
                    <p className="text-[10px] text-content-tertiary">{r.label}</p>
                    <p className="text-body font-bold text-primary">{r.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
