import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { PenTool, ShieldCheck } from 'lucide-react';
import {
  getCertificateByClassId,
  getTrainerClassById,
  signMemberForClass,
  signTrainerForClass,
} from '@/lib/mockOperations';
import { formatDateKo, formatTime } from '@/lib/utils';
import SignaturePad from '@/components/SignaturePad';
import { PageHeader, Card, Button, Badge, Chip } from '@/components/ui';

/** 회원 서명 거부 → 매니저 에스컬레이션 (MA-312 분쟁 처리) */
function DeclineButton({ onDecline }: { onDecline: () => void }) {
  return (
    <Button
      variant="ghost"
      size="md"
      fullWidth
      className="mt-2 text-state-error"
      onClick={() => {
        const proceed = typeof window === 'undefined'
          || window.confirm('회원이 "수업을 진행하지 않았습니다"로 서명을 거부합니다. 매니저에게 에스컬레이션할까요?');
        if (!proceed) return;
        onDecline();
      }}
    >
      서명 거부
    </Button>
  );
}

export default function TrainerDualSignature() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const classId = Number(id);
  const [mode, setMode] = useState<'face_to_face' | 'remote'>('remote');
  const [version, setVersion] = useState(0);
  const [declined, setDeclined] = useState(false);
  const [trainerSigImg, setTrainerSigImg] = useState<string | null>(null);
  const [memberSigImg, setMemberSigImg] = useState<string | null>(null);

  const trainerClass = useMemo(() => getTrainerClassById(classId), [classId, version]);
  const certificate = useMemo(() => getCertificateByClassId(classId), [classId, version]);

  if (!trainerClass) {
    return (
      <div className="min-h-screen flex items-center justify-center text-body text-content-tertiary">
        수업이 없습니다.
      </div>
    );
  }

  const trainerSigned = Boolean(certificate?.trainerSignedAt);
  const memberSigned = Boolean(certificate?.memberSignedAt);

  return (
    <div className="min-h-screen bg-surface-secondary">
      <PageHeader
        showBack
        onBack={() => navigate(-1)}
        title="수업 완료 쌍방서명"
        subtitle="MA-312"
      />

      <div className="px-5 py-4 pb-24 space-y-4">
        <Card variant="elevated" padding="md">
          <p className="text-body font-semibold">{trainerClass.title}</p>
          <p className="mt-1 text-caption text-content-secondary">
            {formatDateKo(trainerClass.startTime)} · {formatTime(trainerClass.startTime)} - {formatTime(trainerClass.endTime)}
          </p>
          <p className="mt-2 text-body text-content-secondary">
            회원: {trainerClass.participants[0]?.memberName || '미정'}
          </p>
        </Card>

        <Card variant="elevated" padding="md">
          <p className="text-body font-semibold mb-3">서명 방식</p>
          <div className="flex gap-2">
            {[
              { key: 'face_to_face' as const, label: '대면 서명' },
              { key: 'remote' as const, label: '원격 서명' },
            ].map((item) => (
              <Chip
                key={item.key}
                active={mode === item.key}
                onClick={() => setMode(item.key)}
                className="flex-1"
              >
                {item.label}
              </Chip>
            ))}
          </div>
        </Card>

        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-2 mb-3">
            <PenTool className="w-4 h-4 text-primary" />
            <p className="text-body font-semibold">1단계. 강사 서명</p>
          </div>
          {trainerSigned ? (
            <div className="rounded-card bg-surface-secondary p-3 text-center">
              {trainerSigImg && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={trainerSigImg} alt="강사 서명" className="mx-auto mb-2 h-20 object-contain" />
              )}
              <p className="text-body-sm font-semibold text-state-success">강사 서명 완료됨</p>
            </div>
          ) : (
            <SignaturePad
              saveLabel="강사 서명 저장"
              onComplete={({ image }) => {
                setTrainerSigImg(image);
                signTrainerForClass(classId, mode);
                setVersion((value) => value + 1);
                toast.success('강사 서명을 저장했어요.');
              }}
            />
          )}
        </Card>

        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-state-success" />
            <p className="text-body font-semibold">2단계. 회원 서명</p>
          </div>

          {declined ? (
            <div className="rounded-card bg-state-error/10 p-3">
              <p className="text-body-sm font-semibold text-state-error">회원이 서명을 거부했어요</p>
              <p className="mt-1 text-caption text-content-secondary">
                분쟁 처리를 위해 센터 매니저에게 에스컬레이션되었습니다. 앱에서는 추가 처리할 수 없어요.
              </p>
            </div>
          ) : memberSigned ? (
            <div className="rounded-card bg-surface-secondary p-3 text-center">
              {memberSigImg && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={memberSigImg} alt="회원 서명" className="mx-auto mb-2 h-20 object-contain" />
              )}
              <p className="text-body-sm font-semibold text-state-success">회원 서명 완료됨</p>
            </div>
          ) : !trainerSigned ? (
            <p className="rounded-card bg-surface-secondary p-3 text-center text-body-sm text-content-tertiary">
              강사 서명을 먼저 완료해 주세요.
            </p>
          ) : mode === 'face_to_face' ? (
            <>
              <SignaturePad
                notice="수업을 정상 수강했습니다"
                saveLabel="회원 서명 완료"
                onComplete={({ image }) => {
                  setMemberSigImg(image);
                  signMemberForClass(classId);
                  setVersion((value) => value + 1);
                  toast.success('회원 서명을 완료했어요.');
                }}
              />
              <DeclineButton onDecline={() => { setDeclined(true); toast.message('서명이 거부되어 매니저에게 전달했어요.'); }} />
            </>
          ) : (
            <>
              <div className="mb-3 rounded-card bg-primary-light p-3">
                <p className="text-body-sm font-bold text-primary">“수업을 정상 수강했습니다”</p>
                <p className="mt-1 text-caption text-content-secondary">
                  회원 앱으로 서명 요청이 발송됩니다. (검수용 시뮬레이션)
                </p>
              </div>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => {
                  signMemberForClass(classId);
                  setVersion((value) => value + 1);
                  toast.success('회원 서명을 완료했어요.');
                }}
              >
                원격 서명 완료 시뮬레이션
              </Button>
              <DeclineButton onDecline={() => { setDeclined(true); toast.message('서명이 거부되어 매니저에게 전달했어요.'); }} />
            </>
          )}
        </Card>

        {certificate ? (
          <Card variant="soft" padding="md">
            <div className="flex items-center justify-between mb-2">
              <p className="text-body font-semibold">확인서 상태</p>
              <Badge tone="neutral" variant="soft">{certificate.status}</Badge>
            </div>
            <p className="text-caption text-content-tertiary">
              강사 서명: {certificate.trainerSignedAt ? '완료' : '미완료'} / 회원 서명: {certificate.memberSignedAt ? '완료' : '대기'}
            </p>
            <Button
              variant="tertiary"
              size="md"
              fullWidth
              className="mt-3"
              onClick={() => navigate(`/trainer/certificates/${certificate.id}`)}
            >
              확인서 상세 보기
            </Button>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
