import { useEffect, useState } from 'react';
import { ArrowLeft, TrendingDown, TrendingUp, Minus, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { cn, formatDateKo } from '@/lib/utils';

interface BodyRecord {
  id: number;
  date: string;
  weight: number | null;
  muscle: number | null;
  fat: number | null;
  fatRate: number | null;
  bmi: number | null;
  memo: string | null;
}

/** 체성분 기록 페이지 */
export default function BodyComposition() {
  const navigate = useNavigate();
  const { member } = useAuthStore();
  const [records, setRecords] = useState<BodyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!member) return;
    fetchRecords();
  }, [member]);

  const fetchRecords = async () => {
    if (!member) return;
    setLoading(true);

    const { data } = await supabase
      .from('body_compositions')
      .select('*')
      .eq('memberId', member.id)
      .order('date', { ascending: false })
      .limit(20);

    setRecords(data || []);
    setLoading(false);
  };

  const latest = records[0];
  const previous = records[1];

  const getDiff = (current: number | null, prev: number | null) => {
    if (current === null || prev === null) return null;
    return Number((current - prev).toFixed(1));
  };

  const TrendIcon = ({ diff }: { diff: number | null }) => {
    if (diff === null || diff === 0) return <Minus className="w-3.5 h-3.5 text-content-tertiary" />;
    if (diff > 0) return <TrendingUp className="w-3.5 h-3.5 text-state-error" />;
    return <TrendingDown className="w-3.5 h-3.5 text-state-success" />;
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-surface sticky top-0 z-10 border-b border-line">
        <div className="flex items-center px-4 pt-safe-top h-14">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-content" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-lg">체성분 기록</h1>
          <div className="w-6" />
        </div>
      </header>

      {/* 최신 기록 요약 */}
      {latest && (
        <div className="bg-surface px-4 py-5">
          <p className="text-xs text-content-tertiary mb-3">최근 측정: {formatDateKo(latest.date)}</p>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              label="체중"
              value={latest.weight}
              unit="kg"
              diff={getDiff(latest.weight, previous?.weight ?? null)}
              icon={<Scale className="w-5 h-5 text-primary" />}
            />
            <MetricCard
              label="골격근량"
              value={latest.muscle}
              unit="kg"
              diff={getDiff(latest.muscle, previous?.muscle ?? null)}
              good="up"
              icon={<div className="text-lg">💪</div>}
            />
            <MetricCard
              label="체지방량"
              value={latest.fat}
              unit="kg"
              diff={getDiff(latest.fat, previous?.fat ?? null)}
              icon={<div className="text-lg">🔥</div>}
            />
            <MetricCard
              label="체지방률"
              value={latest.fatRate}
              unit="%"
              diff={getDiff(latest.fatRate, previous?.fatRate ?? null)}
              icon={<div className="text-lg">📊</div>}
            />
          </div>
          {latest.bmi !== null && (
            <div className="mt-3 bg-surface-secondary rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm text-content-secondary">BMI</span>
              <span className="font-bold text-primary">{latest.bmi}</span>
            </div>
          )}
        </div>
      )}

      {/* 기록 리스트 */}
      <div className="px-4 py-4">
        <h3 className="font-semibold text-sm mb-3 text-content-secondary">측정 이력</h3>
        {loading ? (
          <div className="text-center py-8 text-content-tertiary text-sm">불러오는 중...</div>
        ) : records.length === 0 ? (
          <div className="text-center py-12">
            <Scale className="w-12 h-12 text-content-tertiary/30 mx-auto mb-3" />
            <p className="text-content-tertiary text-sm">체성분 측정 기록이 없습니다</p>
            <p className="text-content-tertiary text-xs mt-1">센터에서 InBody 측정 후 기록됩니다</p>
          </div>
        ) : (
          <div className="space-y-2">
            {records.map((record) => (
              <div key={record.id} className="bg-surface rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{formatDateKo(record.date)}</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <MiniMetric label="체중" value={record.weight} unit="kg" />
                  <MiniMetric label="골격근" value={record.muscle} unit="kg" />
                  <MiniMetric label="체지방" value={record.fat} unit="kg" />
                  <MiniMetric label="체지방률" value={record.fatRate} unit="%" />
                </div>
                {record.memo && (
                  <p className="text-xs text-content-tertiary mt-2 bg-surface-secondary rounded p-2">{record.memo}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label, value, unit, diff, good = 'down', icon,
}: {
  label: string;
  value: number | null;
  unit: string;
  diff: number | null;
  good?: 'up' | 'down';
  icon: React.ReactNode;
}) {
  const isGood = diff !== null && diff !== 0 && (
    (good === 'down' && diff < 0) || (good === 'up' && diff > 0)
  );

  return (
    <div className="bg-surface-secondary rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-content-secondary">{label}</span>
      </div>
      <p className="text-xl font-bold">{value !== null ? value : '-'}<span className="text-xs font-normal text-content-tertiary ml-0.5">{unit}</span></p>
      {diff !== null && diff !== 0 && (
        <p className={cn('text-xs mt-1 font-medium', isGood ? 'text-state-success' : 'text-state-error')}>
          {diff > 0 ? '+' : ''}{diff}{unit}
        </p>
      )}
    </div>
  );
}

function MiniMetric({ label, value, unit }: { label: string; value: number | null; unit: string }) {
  return (
    <div>
      <p className="text-[10px] text-content-tertiary">{label}</p>
      <p className="text-sm font-semibold">{value !== null ? value : '-'}<span className="text-[10px] text-content-tertiary">{unit}</span></p>
    </div>
  );
}
