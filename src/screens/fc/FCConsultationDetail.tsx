import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getConsultationById, updateConsultation } from '@/lib/mockOperations';

export default function FCConsultationDetail() {
  const { id } = useParams<{ id: string }>();
  const consultationId = Number(id);
  const [version, setVersion] = useState(0);
  const consultation = useMemo(() => getConsultationById(consultationId), [consultationId, version]);

  if (!consultation) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-content-tertiary">상담 이력을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-surface px-5 pt-safe-top pb-4 shadow-sm">
        <div className="pt-4">
          <p className="text-xs text-content-tertiary">MA-412</p>
          <h1 className="text-lg font-bold">{consultation.memberName}</h1>
        </div>
      </header>

      <div className="px-5 py-4 pb-24 space-y-4">
        <section className="rounded-card bg-surface p-4 shadow-card">
          <p className="text-sm font-semibold">{consultation.type} · {consultation.channel}</p>
          <p className="mt-1 text-xs text-content-secondary">{consultation.scheduledAt.replace('T', ' ').slice(0, 16)}</p>
          <p className="mt-3 text-sm text-content-secondary">{consultation.summary}</p>
        </section>

        <section className="rounded-card bg-surface p-4 shadow-card space-y-3">
          <p className="text-sm font-semibold">상담 상태 수정</p>
          <div className="grid grid-cols-3 gap-2">
            {(['scheduled', 'completed', 'no_show'] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  updateConsultation(consultation.id, { status });
                  toast.success('상담 상태를 저장했습니다.');
                  setVersion((value) => value + 1);
                }}
                className={`rounded-xl px-3 py-2 text-sm font-semibold ${consultation.status === status ? 'bg-primary text-white' : 'bg-surface-secondary text-content-secondary'}`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['등록', '미등록', '보류'] as const).map((result) => (
              <button
                key={result}
                onClick={() => {
                  updateConsultation(consultation.id, { result, status: 'completed' });
                  toast.success('상담 결과를 저장했습니다.');
                  setVersion((value) => value + 1);
                }}
                className={`rounded-xl px-3 py-2 text-sm font-semibold ${consultation.result === result ? 'bg-sky-600 text-white' : 'bg-surface-secondary text-content-secondary'}`}
              >
                {result}
              </button>
            ))}
          </div>
          <div className="rounded-2xl bg-surface-secondary p-4 text-sm text-content-secondary">
            후속 조치: {consultation.followUp || '미입력'}
          </div>
        </section>
      </div>
    </div>
  );
}
