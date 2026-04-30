import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getConsultationById, updateConsultation } from '@/lib/mockOperations';
import { Chip, Card } from '@/components/ui';

export default function FCConsultationDetail() {
  const { id } = useParams<{ id: string }>();
  const consultationId = Number(id);
  const [version, setVersion] = useState(0);
  const consultation = useMemo(() => getConsultationById(consultationId), [consultationId, version]);

  if (!consultation) {
    return <div className="min-h-screen flex items-center justify-center text-body text-content-tertiary">상담 이력을 찾을 수 없습니다.</div>;
  }

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
          <p className="text-body font-semibold">{consultation.type} · {consultation.channel}</p>
          <p className="mt-1 text-caption text-content-secondary">{consultation.scheduledAt.replace('T', ' ').slice(0, 16)}</p>
          <p className="mt-3 text-body text-content-secondary">{consultation.summary}</p>
        </Card>

        <Card className="space-y-3">
          <p className="text-body font-semibold">상담 상태 수정</p>
          <div className="flex gap-2">
            {(['scheduled', 'completed', 'no_show'] as const).map((status) => (
              <Chip
                key={status}
                size="sm"
                active={consultation.status === status}
                onClick={() => {
                  updateConsultation(consultation.id, { status });
                  toast.success('상담 상태를 저장했습니다.');
                  setVersion((value) => value + 1);
                }}
              >
                {status}
              </Chip>
            ))}
          </div>
          <div className="flex gap-2">
            {(['등록', '미등록', '보류'] as const).map((result) => (
              <Chip
                key={result}
                size="sm"
                active={consultation.result === result}
                onClick={() => {
                  updateConsultation(consultation.id, { result, status: 'completed' });
                  toast.success('상담 결과를 저장했습니다.');
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
