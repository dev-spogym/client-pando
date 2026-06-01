import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getTrainerPenalties, waivePenalty } from '@/lib/mockOperations';
import { formatDateKo } from '@/lib/utils';
import { Card, Badge, Button, EmptyState } from '@/components/ui';

/** MA-213: 회원별 active 페널티 누적 횟수 → 단계 라벨/색상 */
function usePenaltyStageMap(penalties: ReturnType<typeof getTrainerPenalties>) {
  return useMemo(() => {
    // memberId → active 페널티 횟수 집계
    const countMap: Record<number, number> = {};
    for (const p of penalties) {
      if (p.status === 'active') {
        countMap[p.memberId] = (countMap[p.memberId] ?? 0) + 1;
      }
    }
    return countMap;
  }, [penalties]);
}

/** 누적 횟수 → 단계 배지 정보 */
function penaltyStage(count: number): { label: string; color: string } {
  if (count >= 3) return { label: '예약 제한', color: 'text-state-error bg-state-error/10' };
  if (count === 2) return { label: '주의', color: 'text-orange-600 bg-orange-50' };
  if (count === 1) return { label: '경고', color: 'text-state-warning bg-state-warning/10' };
  return { label: '정상', color: 'text-content-tertiary bg-surface-secondary' };
}

export default function TrainerPenaltyBoard() {
  const [version, setVersion] = useState(0);
  const penalties = getTrainerPenalties();

  // MA-213: 회원별 누적 active 페널티 횟수 맵
  const stageMap = usePenaltyStageMap(penalties);

  const handleWaive = (penaltyId: number) => {
    waivePenalty(penaltyId);
    toast.success('페널티를 면제 처리했어요.');
    setVersion((value) => value + 1);
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-gradient-to-br from-rose-600 to-orange-500 px-5 pt-safe-top pb-5">
        <div className="pt-4">
          <p className="text-white/80 text-body">MA-213</p>
          <h1 className="text-white text-h2 font-bold mt-1">노쇼 / 페널티 처리</h1>
          <p className="text-white/70 text-body mt-1">수업 출석 체크에서 생성된 노쇼·지각 이력을 한 번에 확인합니다.</p>
        </div>
      </header>

      <div className="px-5 py-4 pb-24 space-y-3" key={version}>
        {/* MA-213: 정책 안내 배너 */}
        <div className="rounded-card bg-state-error/10 px-4 py-3">
          <p className="text-caption font-semibold text-state-error">
            노쇼 3회 누적 시 예약이 제한됩니다.
          </p>
          <p className="mt-0.5 text-caption text-content-secondary">
            1회: 경고 · 2회: 주의 · 3회 이상: 예약 제한
          </p>
        </div>

        {penalties.length === 0 ? (
          <EmptyState title="등록된 페널티가 없습니다" />
        ) : penalties.map((penalty) => {
          // 해당 회원의 active 누적 횟수 (면제 후 즉시 반영)
          const activeCount = stageMap[penalty.memberId] ?? 0;
          const stage = penaltyStage(activeCount);

          return (
            <Card key={penalty.id} variant="elevated" padding="md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-state-error" />
                    <p className="text-body font-semibold">{penalty.memberName}</p>
                    {/* MA-213: 단계 배지 */}
                    <span className={`rounded-full px-2 py-0.5 text-caption font-semibold ${stage.color}`}>
                      {stage.label}
                    </span>
                  </div>
                  <p className="mt-2 text-body text-content">{penalty.title}</p>
                  <p className="mt-1 text-caption text-content-secondary">
                    {formatDateKo(penalty.appliedAt)} · {penalty.reason}
                  </p>
                </div>
                <Badge tone="error" variant="soft">{penalty.type}</Badge>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-caption text-content-tertiary">
                  누적 {activeCount}회 · 차감 {penalty.deductCount}회 · 상태 {penalty.status}
                </p>
                {penalty.status === 'active' ? (
                  <Button
                    variant="tertiary"
                    size="sm"
                    onClick={() => handleWaive(penalty.id)}
                  >
                    면제 처리
                  </Button>
                ) : (
                  <span className="flex items-center gap-1 text-caption font-semibold text-state-success">
                    <CheckCircle2 className="w-4 h-4" /> 면제됨
                  </span>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
