import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BarChart3, Calendar, Flame, TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'spogym-workout-logs';

const CATEGORIES = ['가슴', '등', '어깨', '하체', '팔', '코어'] as const;

const categoryColor: Record<string, string> = {
  '가슴': 'bg-red-400',
  '등': 'bg-blue-400',
  '어깨': 'bg-orange-400',
  '하체': 'bg-green-400',
  '팔': 'bg-purple-400',
  '코어': 'bg-yellow-400',
};

interface WorkoutSet {
  weight: number;
  reps: number;
}

interface WorkoutEntry {
  id: string;
  category: string;
  name: string;
  sets: WorkoutSet[];
  duration: number;
}

interface DayLog {
  date: string;
  entries: WorkoutEntry[];
}

function loadLogs(): Record<string, DayLog> {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** 운동기록 분석 페이지 */
export default function WorkoutAnalysis() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const logs = useMemo(() => loadLogs(), []);

  const today = new Date();
  const rangeStart = new Date(today);
  if (period === 'week') {
    rangeStart.setDate(today.getDate() - 6);
  } else {
    rangeStart.setDate(today.getDate() - 29);
  }
  rangeStart.setHours(0, 0, 0, 0);

  // 기간 내 로그 필터
  const filteredDays = useMemo(() => {
    const result: DayLog[] = [];
    Object.values(logs).forEach((day) => {
      const d = new Date(day.date);
      if (d >= rangeStart && d <= today) {
        result.push(day);
      }
    });
    result.sort((a, b) => a.date.localeCompare(b.date));
    return result;
  }, [logs, period]);

  // 운동 일수
  const workoutDays = filteredDays.filter((d) => d.entries.length > 0).length;

  // 부위별 운동 횟수
  const categoryCount = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORIES.forEach((c) => (counts[c] = 0));
    filteredDays.forEach((day) => {
      day.entries.forEach((entry) => {
        if (counts[entry.category] !== undefined) {
          counts[entry.category]++;
        }
      });
    });
    return counts;
  }, [filteredDays]);

  const maxCategoryCount = Math.max(...Object.values(categoryCount), 1);

  // 날짜별 볼륨
  const dailyVolume = useMemo(() => {
    return filteredDays.map((day) => {
      const volume = day.entries.reduce(
        (sum, e) => sum + e.sets.reduce((s, set) => s + set.weight * set.reps, 0),
        0,
      );
      const d = new Date(day.date);
      return {
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        volume,
      };
    });
  }, [filteredDays]);

  const maxVolume = Math.max(...dailyVolume.map((d) => d.volume), 1);

  // 최근 운동 기록
  const recentEntries = useMemo(() => {
    const all: (WorkoutEntry & { date: string })[] = [];
    filteredDays.forEach((day) => {
      day.entries.forEach((entry) => {
        all.push({ ...entry, date: day.date });
      });
    });
    return all.reverse().slice(0, 10);
  }, [filteredDays]);

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* 헤더 */}
      <header className="bg-surface sticky top-0 z-10 border-b border-line">
        <div className="flex items-center px-4 pt-safe-top h-14">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-content" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-lg">운동기록 분석</h1>
          <div className="w-6" />
        </div>
      </header>

      {/* 주간/월간 토글 */}
      <div className="bg-surface px-4 py-3">
        <div className="flex bg-surface-secondary rounded-xl p-1">
          {(['week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'flex-1 py-2 text-sm font-medium rounded-lg transition-colors',
                period === p ? 'bg-primary text-white' : 'text-content-secondary',
              )}
            >
              {p === 'week' ? '주간' : '월간'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-3 space-y-4 pb-4">
        {/* 운동 일수 */}
        <div className="bg-surface rounded-card p-4 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-xs text-content-tertiary">운동 일수</p>
            <p className="text-2xl font-bold">
              {workoutDays}<span className="text-sm text-content-tertiary font-normal ml-1">일 / {period === 'week' ? '7' : '30'}일</span>
            </p>
          </div>
        </div>

        {/* 부위별 운동 비율 */}
        <div className="bg-surface rounded-card p-4 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-sm">부위별 운동 비율</h3>
          </div>
          <div className="space-y-3">
            {CATEGORIES.map((cat) => {
              const count = categoryCount[cat];
              const pct = maxCategoryCount > 0 ? (count / maxCategoryCount) * 100 : 0;
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-xs text-content-secondary w-8">{cat}</span>
                  <div className="flex-1 h-5 bg-surface-secondary rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', categoryColor[cat])}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                  <span className="text-xs text-content-tertiary w-8 text-right">{count}회</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 총 볼륨 추이 */}
        <div className="bg-surface rounded-card p-4 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-sm">총 볼륨 추이</h3>
          </div>
          {dailyVolume.length === 0 ? (
            <div className="text-center py-6 text-content-tertiary text-sm">
              기록된 데이터가 없습니다
            </div>
          ) : (
            <div className="flex items-end gap-1 h-32">
              {dailyVolume.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div
                    className="w-full bg-primary rounded-t-sm min-h-[2px]"
                    style={{ height: `${(d.volume / maxVolume) * 100}%` }}
                  />
                  <span className="text-[9px] text-content-tertiary mt-1 truncate w-full text-center">
                    {d.date}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 최근 운동 기록 */}
        <div className="bg-surface rounded-card p-4 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-state-warning" />
            <h3 className="font-semibold text-sm">최근 운동 기록</h3>
          </div>
          {recentEntries.length === 0 ? (
            <div className="text-center py-6 text-content-tertiary text-sm">
              운동 기록이 없습니다
            </div>
          ) : (
            <div className="space-y-2">
              {recentEntries.map((entry, i) => {
                const d = new Date(entry.date);
                const volume = entry.sets.reduce((s, set) => s + set.weight * set.reps, 0);
                return (
                  <div key={i} className="flex items-center gap-3 p-3 bg-surface-secondary rounded-lg">
                    <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">{d.getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{entry.name}</p>
                      <p className="text-xs text-content-tertiary">
                        {entry.sets.length}세트 · 볼륨 {volume.toLocaleString()}kg
                      </p>
                    </div>
                    <span className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                      categoryColor[entry.category]?.replace('bg-', 'bg-').replace('-400', '-100'),
                      'bg-surface-tertiary text-content-secondary',
                    )}>
                      {entry.category}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
