'use client';

import { useNavigate } from 'react-router-dom';
import { Bell, CalendarDays, ScanLine, Users, TrendingUp } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getMockProfile, getStaffDashboard } from '@/lib/mockOperations';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const hourlyEntry = [
  { hour: '06시', 입장: 5 },
  { hour: '07시', 입장: 18 },
  { hour: '08시', 입장: 42 },
  { hour: '09시', 입장: 35 },
  { hour: '10시', 입장: 28 },
  { hour: '11시', 입장: 22 },
  { hour: '12시', 입장: 30 },
  { hour: '13시', 입장: 25 },
  { hour: '14시', 입장: 20 },
  { hour: '15시', 입장: 18 },
  { hour: '16시', 입장: 24 },
  { hour: '17시', 입장: 38 },
  { hour: '18시', 입장: 62 },
  { hour: '19시', 입장: 74 },
  { hour: '20시', 입장: 58 },
  { hour: '21시', 입장: 32 },
  { hour: '22시', 입장: 12 },
  { hour: '23시', 입장: 4 },
];

const weeklyAttendance = [
  { day: '월', 출석: 142 },
  { day: '화', 출석: 158 },
  { day: '수', 출석: 135 },
  { day: '목', 출석: 172 },
  { day: '금', 출석: 188 },
  { day: '토', 출석: 210 },
  { day: '일', 출석: 96 },
];

const memberStatus = [
  { name: '활성', value: 312 },
  { name: '만료', value: 87 },
  { name: '정지', value: 24 },
];

const weeklySales = [
  { day: '월', 매출: 850000 },
  { day: '화', 매출: 1200000 },
  { day: '수', 매출: 780000 },
  { day: '목', 매출: 1450000 },
  { day: '금', 매출: 1680000 },
  { day: '토', 매출: 2100000 },
  { day: '일', 매출: 920000 },
];

const STATUS_COLORS = ['#0E7C7B', '#EF4444', '#F59E0B'];
const LOCKER_USED = 80;
const LOCKER_FREE = 20;
const LOCKER_COLORS = ['#0E7C7B', '#E6F3F3'];

function formatKRW(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return String(value);
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface rounded-card shadow-card-soft border border-surface-secondary p-3 text-xs">
      <p className="font-semibold text-content mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{typeof p.value === 'number' && p.value > 10000 ? formatKRW(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function StaffHome() {
  const navigate = useNavigate();
  const trainer = useAuthStore((state) => state.trainer);
  const dashboard = getStaffDashboard();
  const mockProfile = getMockProfile('staff');
  const displayName = trainer?.staffName || trainer?.name || mockProfile.name;
  const branchLabel = trainer ? `지점 ID ${trainer.branchId}` : mockProfile.branch;

  const kpiCards = [
    { label: '오늘 입장', value: `${dashboard.todayAttendanceCount}건`, sub: '+12 어제 대비', up: true, color: '#0E7C7B' },
    { label: '신규 가입', value: '8명', sub: '+3 이번 주', up: true, color: '#10B981' },
    { label: '오늘 결제', value: '2,850,000원', sub: '+15% 어제 대비', up: true, color: '#3FB6B2' },
    { label: '미수금', value: '320,000원', sub: '3건 처리 필요', up: false, color: '#EF4444' },
  ];

  return (
    <div className="min-h-screen bg-surface-secondary">

      {/* ── Original Header (preserved) ── */}
      <header className="bg-gradient-to-br from-content to-content-secondary px-5 pt-safe-top pb-6">
        <div className="pt-4 flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">Staff</p>
            <h1 className="text-white text-xl font-bold">{displayName}</h1>
          </div>
          <button onClick={() => navigate('/staff/notifications')} className="rounded-full bg-white/20 p-2 text-white">
            <Bell className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <SummaryCard label="오늘 출석" value={`${dashboard.todayAttendanceCount}건`} />
          <SummaryCard label="현재 이용중" value={`${dashboard.activeVisitors}명`} />
          <SummaryCard label="락커 사용" value={`${dashboard.lockerUsage.used}/${dashboard.lockerUsage.total}`} />
          <SummaryCard label="지점" value={branchLabel} />
        </div>
      </header>

      {/* ── Original Quick Menu (preserved) ── */}
      <div className="px-5 -mt-2 grid grid-cols-3 gap-3">
        <QuickMenu label="회원 조회" icon={<Users className="w-5 h-5 text-content-secondary" />} onClick={() => navigate('/staff/members')} />
        <QuickMenu label="수동 출석" icon={<ScanLine className="w-5 h-5 text-state-success" />} onClick={() => navigate('/staff/attendance/manual')} />
        <QuickMenu label="일정 조회" icon={<CalendarDays className="w-5 h-5 text-primary" />} onClick={() => navigate('/staff/schedule')} />
      </div>

      {/* ── Chart Section ── */}
      <div className="px-4 pt-4 pb-28 space-y-4">

        {/* ── 운영 KPI Cards ── */}
        <div>
          <p className="text-xs font-semibold text-content-tertiary uppercase tracking-wide mb-3">오늘 운영 현황</p>
          <div className="grid grid-cols-2 gap-3">
            {kpiCards.map((c) => (
              <Card key={c.label} variant="elevated" padding="md">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-content-tertiary">{c.label}</p>
                  <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                </div>
                <p className="mt-2 text-base font-bold text-content leading-tight">{c.value}</p>
                <div className="mt-1 flex items-center gap-1">
                  <TrendingUp className={`w-3 h-3 ${c.up ? 'text-state-success' : 'text-state-error rotate-180'}`} />
                  <span className={`text-[10px] font-medium ${c.up ? 'text-state-success' : 'text-state-error'}`}>{c.sub}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* ── 시간대별 입장 추이 ── */}
        <Card variant="elevated" padding="md">
          <p className="text-sm font-bold text-content mb-1">오늘 시간대별 입장 추이</p>
          <p className="text-xs text-content-tertiary mb-4">6시~23시 · 피크타임 19시</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={hourlyEntry} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
              <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#9CA3AF' }} interval={2} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="입장"
                stroke="#0E7C7B"
                strokeWidth={2.5}
                dot={{ r: 2.5, fill: '#0E7C7B', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* ── 이번 주 일별 출석 ── */}
        <Card variant="elevated" padding="md">
          <p className="text-sm font-bold text-content mb-1">이번 주 일별 출석</p>
          <p className="text-xs text-content-tertiary mb-4">월요일 ~ 일요일</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyAttendance} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="출석" radius={[6, 6, 0, 0]}>
                {weeklyAttendance.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.day === '토' || entry.day === '금' ? '#0E7C7B' : '#3FB6B2'}
                    opacity={entry.day === '토' || entry.day === '금' ? 1 : 0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* ── 회원 활동 상태 + 락커 사용률 (side by side) ── */}
        <div className="grid grid-cols-2 gap-3">

          {/* 회원 활동 상태 PieChart */}
          <Card variant="elevated" padding="md">
            <p className="text-xs font-bold text-content mb-2">회원 활동 상태</p>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie
                  data={memberStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={52}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {memberStatus.map((_, i) => (
                    <Cell key={i} fill={STATUS_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: unknown) => [`${v}명`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-1 space-y-1">
              {memberStatus.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[i] }} />
                    <span className="text-[10px] text-content-secondary">{s.name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-content">{s.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* 락커 사용률 Donut */}
          <Card variant="elevated" padding="md">
            <p className="text-xs font-bold text-content mb-2">락커 사용률</p>
            <div className="relative flex items-center justify-center" style={{ height: 120 }}>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={[{ value: LOCKER_USED }, { value: LOCKER_FREE }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={52}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    <Cell fill="#0E7C7B" />
                    <Cell fill="#E6F3F3" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-lg font-bold text-primary leading-none">{LOCKER_USED}%</p>
                <p className="text-[9px] text-content-tertiary">사용중</p>
              </div>
            </div>
            <div className="mt-1 space-y-1">
              {[
                { label: '사용중', pct: LOCKER_USED, color: '#0E7C7B' },
                { label: '여유', pct: LOCKER_FREE, color: '#E6F3F3' },
              ].map((l) => (
                <div key={l.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full border border-surface-secondary" style={{ background: l.color }} />
                    <span className="text-[10px] text-content-secondary">{l.label}</span>
                  </div>
                  <span className="text-[10px] font-bold text-content">{l.pct}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── 최근 7일 매출 AreaChart ── */}
        <Card variant="elevated" padding="md">
          <p className="text-sm font-bold text-content mb-1">최근 7일 매출</p>
          <p className="text-xs text-content-tertiary mb-4">일별 매출 합계</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklySales} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="staffSalesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0E7C7B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0E7C7B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis tickFormatter={formatKRW} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="매출"
                stroke="#0E7C7B"
                strokeWidth={2.5}
                fill="url(#staffSalesGrad)"
                dot={{ r: 3.5, fill: '#0E7C7B', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-3 flex items-center justify-between text-xs">
            <div>
              <p className="text-content-tertiary">주간 합계</p>
              <p className="text-base font-bold text-content">9,980,000원</p>
            </div>
            <div className="text-right">
              <p className="text-content-tertiary">일 평균</p>
              <p className="text-base font-bold text-primary">1,426,000원</p>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}

// ─── Sub-components (original, preserved) ────────────────────────────────────

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/20 p-4 text-white">
      <p className="text-xs text-white/70">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

function QuickMenu({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-card bg-surface p-4 text-left shadow-card-soft">
      {icon}
      <p className="mt-3 text-sm font-semibold">{label}</p>
    </button>
  );
}
