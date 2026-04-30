import { useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getTrainerPenalties, waivePenalty } from '@/lib/mockOperations';
import { formatDateKo } from '@/lib/utils';
import { Card, Badge, Button, EmptyState } from '@/components/ui';

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
          <p className="text-white/80 text-body">MA-213</p>
          <h1 className="text-white text-h2 font-bold mt-1">노쇼 / 페널티 처리</h1>
          <p className="text-white/70 text-body mt-1">수업 출석 체크에서 생성된 노쇼·지각 이력을 한 번에 확인합니다.</p>
        </div>
      </header>

      <div className="px-5 py-4 pb-24 space-y-3" key={version}>
        {penalties.length === 0 ? (
          <EmptyState title="등록된 페널티가 없습니다" />
        ) : penalties.map((penalty) => (
          <Card key={penalty.id} variant="elevated" padding="md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-state-error" />
                  <p className="text-body font-semibold">{penalty.memberName}</p>
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
                차감 {penalty.deductCount}회 · 상태 {penalty.status}
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
        ))}
      </div>
    </div>
  );
}
