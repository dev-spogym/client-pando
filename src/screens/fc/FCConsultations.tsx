import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { getConsultations, type LeadStage } from '@/lib/mockOperations';
import { formatDateKo } from '@/lib/utils';
import { Chip, Card, Button, Badge } from '@/components/ui';

const STAGES: LeadStage[] = ['신규', '연락완료', '상담예정', '방문완료', '등록완료', '미전환', '보류'];

// 단계별 배지 색상 매핑
const STAGE_TONE: Record<LeadStage, 'info' | 'primary' | 'accent' | 'success' | 'neutral' | 'warning'> = {
  신규: 'info',
  연락완료: 'primary',
  상담예정: 'accent',
  방문완료: 'primary',
  등록완료: 'success',
  미전환: 'neutral',
  보류: 'warning',
};

export default function FCConsultations() {
  const navigate = useNavigate();
  const [stageFilter, setStageFilter] = useState<'all' | LeadStage>('all');
  const consultations = getConsultations();

  const filtered = useMemo(
    () => (stageFilter === 'all' ? consultations : consultations.filter((item) => item.stage === stageFilter)),
    [consultations, stageFilter]
  );

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-surface px-5 pt-safe-top pb-4 shadow-sm">
        <div className="pt-4 flex items-center justify-between">
          <div>
            <p className="text-caption text-content-tertiary">MA-410</p>
            <h1 className="text-h4 font-bold">리드 / 상담 예정 목록</h1>
          </div>
          <Button size="sm" onClick={() => navigate('/fc/leads/new')} leftIcon={<Plus className="w-4 h-4" />}>
            추가
          </Button>
        </div>
      </header>

      <div className="py-4 pb-24 space-y-4">
        {/* 7단계 + 전체 가로 스크롤 칩 필터 */}
        <div className="flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-none">
          <Chip size="sm" active={stageFilter === 'all'} onClick={() => setStageFilter('all')} className="shrink-0">
            전체
          </Chip>
          {STAGES.map((stage) => (
            <Chip
              key={stage}
              size="sm"
              active={stageFilter === stage}
              onClick={() => setStageFilter(stage)}
              className="shrink-0"
            >
              {stage}
            </Chip>
          ))}
        </div>

        <div className="px-5 space-y-3">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-body text-content-tertiary">해당 단계의 상담이 없습니다.</p>
          ) : (
            filtered.map((item) => (
              <button key={item.id} onClick={() => navigate(`/fc/leads/${item.id}`)} className="w-full text-left">
                <Card interactive>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-body font-semibold">{item.memberName}</p>
                    <Badge tone={STAGE_TONE[item.stage]} size="sm">
                      {item.stage}
                    </Badge>
                  </div>
                  <p className="mt-1 text-caption text-content-secondary">
                    {item.type} · {item.method} · {item.inflowSource}
                  </p>
                  <p className="mt-2 text-body text-content-secondary">{item.summary}</p>
                  <p className="mt-2 text-caption text-content-tertiary">{formatDateKo(item.scheduledAt)}</p>
                </Card>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
