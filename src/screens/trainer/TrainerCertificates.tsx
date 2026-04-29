import { useNavigate } from 'react-router-dom';
import { getCertificates } from '@/lib/mockOperations';
import { formatDateKo } from '@/lib/utils';
import { Card, Badge, EmptyState } from '@/components/ui';

export default function TrainerCertificates() {
  const navigate = useNavigate();
  const certificates = getCertificates();

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-gradient-to-br from-teal-600 to-emerald-600 px-5 pt-safe-top pb-5">
        <div className="pt-4">
          <p className="text-white/80 text-sm">MA-313</p>
          <h1 className="text-white text-xl font-bold mt-1">레슨 확인서 조회</h1>
        </div>
      </header>

      <div className="px-5 py-4 pb-24 space-y-3">
        {certificates.length === 0 ? (
          <EmptyState title="확인서가 없습니다" />
        ) : (
          certificates.map((certificate) => (
            <Card
              key={certificate.id}
              variant="elevated"
              padding="md"
              interactive
              onClick={() => navigate(`/trainer/certificates/${certificate.id}`)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{certificate.title}</p>
                  <p className="mt-1 text-xs text-content-secondary">
                    {certificate.memberName} · {certificate.mode === 'remote' ? '원격' : '대면'} 서명
                  </p>
                  <p className="mt-2 text-xs text-content-tertiary">
                    {formatDateKo(certificate.trainerSignedAt || new Date().toISOString())}
                  </p>
                </div>
                <Badge tone="neutral" variant="soft">{certificate.status}</Badge>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
