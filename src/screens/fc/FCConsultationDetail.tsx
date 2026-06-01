import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';
import { getConsultationById, updateConsultation, type LeadStage } from '@/lib/mockOperations';
import { Chip, Card } from '@/components/ui';

const STAGES: LeadStage[] = ['신규', '연락완료', '상담예정', '방문완료', '등록완료', '미전환', '보류'];
const RESULTS: ('등록' | '미등록' | '보류')[] = ['등록', '미등록', '보류'];
const EDIT_LIMIT_DAYS = 7;

export default function FCConsultationDetail() {
  const { id } = useParams<{ id: string }>();
  const consultationId = Number(id);
  const [version, setVersion] = useState(0);
  const consultation = useMemo(() => getConsultationById(consultationId), [consultationId, version]);

  if (!consultation) {
    return (
      <div className="min-h-screen flex items-center justify-center text-body text-content-tertiary">
        상담 이력을 찾을 수 없습니다.
      </div>
    );
  }

  // 7일 수정제한 — createdAt 기준 경과일 판정
  const elapsedDays = (Date.now() - new Date(consultation.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  const editable = elapsedDays <= EDIT_LIMIT_DAYS;

  // 후속조치 미등록/보류 필수 가드
  const guardFollowUp = (nextResult: '등록' | '미등록' | '보류') => {
    if ((nextResult === '미등록' || nextResult === '보류') && !consultation.followUp.trim()) {
      toast.error('후속 조치를 입력해주세요');
      return false;
    }
    return true;
  };

  const onStageSelect = (stage: LeadStage) => {
    if (!editable) return;
    if (stage === '등록완료') {
      toast.error('회원 등록 권한이 없어 등록 요청으로 전환됩니다');
      return;
    }
    updateConsultation(consultation.id, { stage });
    toast.success('상담 단계를 저장했어요.');
    setVersion((value) => value + 1);
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-surface px-5 pt-safe-top pb-4 shadow-sm">
        <div className="pt-4">
          <p className="text-caption text-content-tertiary">MA-412</p>
          <h1 className="text-h4 font-bold">{consultation.memberName}</h1>
        </div>
      </header>

      <div className="px-5 py-4 pb-24 space-y-4">
        <Card>
          <p className="text-body font-semibold">
            {consultation.type} · {consultation.method}
          </p>
          <p className="mt-1 text-caption text-content-secondary">
            단계 {consultation.stage} · 유입 {consultation.inflowSource}
          </p>
          <p className="mt-1 text-caption text-content-secondary">
            {consultation.scheduledAt.replace('T', ' ').slice(0, 16)}
          </p>
          <p className="mt-3 text-body text-content-secondary">{consultation.summary}</p>
        </Card>

        {/* 7일 수정제한 안내 */}
        {!editable && (
          <Card className="flex gap-3 bg-surface-tertiary">
            <Lock className="w-5 h-5 shrink-0 text-content-tertiary" />
            <p className="text-caption text-content-secondary">수정 가능 기간(7일)이 지났습니다</p>
          </Card>
        )}

        <Card className={'space-y-3' + (editable ? '' : ' opacity-60 pointer-events-none')}>
          <p className="text-body font-semibold">상담 단계 수정</p>
          <div className="flex flex-wrap gap-2">
            {STAGES.map((stage) => (
              <Chip key={stage} size="sm" active={consultation.stage === stage} onClick={() => onStageSelect(stage)}>
                {stage}
              </Chip>
            ))}
          </div>

          <p className="pt-1 text-body font-semibold">상담 결과 수정</p>
          <div className="flex gap-2">
            {RESULTS.map((result) => (
              <Chip
                key={result}
                size="sm"
                active={consultation.result === result}
                onClick={() => {
                  if (!editable) return;
                  if (!guardFollowUp(result)) return;
                  updateConsultation(consultation.id, { result, status: 'completed' });
                  toast.success('상담 결과를 저장했어요.');
                  setVersion((value) => value + 1);
                }}
              >
                {result}
              </Chip>
            ))}
          </div>

          <div className="rounded-2xl bg-surface-secondary p-4 text-body text-content-secondary">
            후속 조치: {consultation.followUp || '미입력'}
          </div>
        </Card>
      </div>
    </div>
  );
}
