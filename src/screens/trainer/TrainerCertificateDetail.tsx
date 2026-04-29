import { useParams } from 'react-router-dom';
import { getCertificateById } from '@/lib/mockOperations';
import { formatDateKo, formatTime } from '@/lib/utils';
import { PageHeader, Card } from '@/components/ui';

export default function TrainerCertificateDetail() {
  const { id } = useParams<{ id: string }>();
  const certificate = id ? getCertificateById(id) : null;

  if (!certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-content-tertiary">
        확인서를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      <PageHeader showBack title="확인서 상세" subtitle="MA-313" />

      <div className="px-5 py-4 pb-24">
        <Card variant="elevated" padding="lg">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-content-tertiary">수업명</p>
              <p className="mt-1 text-base font-semibold">{certificate.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="회원">{certificate.memberName}</InfoRow>
              <InfoRow label="서명 방식">{certificate.mode === 'remote' ? '원격' : '대면'}</InfoRow>
              <InfoRow label="강사 서명">
                {certificate.trainerSignedAt
                  ? `${formatDateKo(certificate.trainerSignedAt)} ${formatTime(certificate.trainerSignedAt)}`
                  : '미완료'}
              </InfoRow>
              <InfoRow label="회원 서명">
                {certificate.memberSignedAt
                  ? `${formatDateKo(certificate.memberSignedAt)} ${formatTime(certificate.memberSignedAt)}`
                  : '대기'}
              </InfoRow>
            </div>
            <div className="rounded-card bg-surface-secondary p-4 text-sm text-content-secondary">
              PDF 생성 대신 모바일 웹앱 내 확인서 상세 화면으로 먼저 구현했습니다. 백엔드/파일 스토리지 연동 시 Signed URL 발급과 PDF 내려받기를 연결하면 됩니다.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card bg-surface-secondary p-4">
      <p className="text-xs text-content-tertiary">{label}</p>
      <p className="mt-1 text-sm font-semibold">{children}</p>
    </div>
  );
}
