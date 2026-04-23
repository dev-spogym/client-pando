import { useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getTrainerPenalties, waivePenalty } from '@/lib/mockOperations';
import { formatDateKo } from '@/lib/utils';

export default function TrainerPenaltyBoard() {
  const [version, setVersion] = useState(0);
  const penalties = getTrainerPenalties();

  const handleWaive = (penaltyId: number) => {
    waivePenalty(penaltyId);
    toast.success('페널티를 면제 처리했습니다.');
    setVersion((value) => value + 1);
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-gradient-to-br from-rose-600 to-orange-500 px-5 pt-safe-top pb-5">
        <div className="pt-4">
          <p className="text-white/80 text-sm">MA-213</p>
          <h1 className="text-white text-xl font-bold mt-1">노쇼 / 페널티 처리</h1>
          <p className="text-white/70 text-sm mt-1">수업 출석 체크에서 생성된 노쇼·지각 이력을 한 번에 확인합니다.</p>
        </div>
      </header>

      <div className="px-5 py-4 pb-24 space-y-3" key={version}>
        {penalties.length === 0 ? (
          <div className="rounded-card bg-surface p-10 text-center text-sm text-content-tertiary shadow-card">
            등록된 페널티가 없습니다.
          </div>
        ) : penalties.map((penalty) => (
          <div key={penalty.id} className="rounded-card bg-surface p-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-state-error" />
                  <p className="text-sm font-semibold">{penalty.memberName}</p>
                </div>
                <p className="mt-2 text-sm text-content">{penalty.title}</p>
                <p className="mt-1 text-xs text-content-secondary">{formatDateKo(penalty.appliedAt)} · {penalty.reason}</p>
              </div>
              <span className="rounded-full bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-600">
                {penalty.type}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-content-tertiary">차감 {penalty.deductCount}회 · 상태 {penalty.status}</p>
              {penalty.status === 'active' ? (
                <button
                  onClick={() => handleWaive(penalty.id)}
                  className="rounded-xl bg-surface-secondary px-3 py-2 text-xs font-semibold text-content-secondary"
                >
                  면제 처리
                </button>
              ) : (
                <span className="flex items-center gap-1 text-xs font-semibold text-state-success">
                  <CheckCircle2 className="w-4 h-4" /> 면제됨
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
