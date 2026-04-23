import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, PenTool, ShieldCheck } from 'lucide-react';
import {
  getCertificateByClassId,
  getTrainerClassById,
  signMemberForClass,
  signTrainerForClass,
} from '@/lib/mockOperations';
import { formatDateKo, formatTime } from '@/lib/utils';

export default function TrainerDualSignature() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const classId = Number(id);
  const [mode, setMode] = useState<'face_to_face' | 'remote'>('remote');
  const [version, setVersion] = useState(0);

  const trainerClass = useMemo(() => getTrainerClassById(classId), [classId, version]);
  const certificate = useMemo(() => getCertificateByClassId(classId), [classId, version]);

  if (!trainerClass) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-content-tertiary">수업이 없습니다.</div>;
  }

  const trainerSigned = Boolean(certificate?.trainerSignedAt);
  const memberSigned = Boolean(certificate?.memberSignedAt);

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-gradient-to-br from-emerald-700 to-teal-600 px-5 pt-safe-top pb-5">
        <div className="pt-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-white/80 text-sm">MA-312</p>
            <h1 className="text-white text-xl font-bold">수업 완료 쌍방서명</h1>
          </div>
        </div>
      </header>

      <div className="px-5 py-4 pb-24 space-y-4">
        <section className="rounded-card bg-surface p-4 shadow-card">
          <p className="text-sm font-semibold">{trainerClass.title}</p>
          <p className="mt-1 text-xs text-content-secondary">
            {formatDateKo(trainerClass.startTime)} · {formatTime(trainerClass.startTime)} - {formatTime(trainerClass.endTime)}
          </p>
          <p className="mt-2 text-sm text-content-secondary">회원: {trainerClass.participants[0]?.memberName || '미정'}</p>
        </section>

        <section className="rounded-card bg-surface p-4 shadow-card space-y-3">
          <p className="text-sm font-semibold">서명 방식</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'face_to_face' as const, label: '대면 서명' },
              { key: 'remote' as const, label: '원격 서명' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setMode(item.key)}
                className={`rounded-xl px-3 py-3 text-sm font-semibold ${mode === item.key ? 'bg-teal-600 text-white' : 'bg-surface-secondary text-content-secondary'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-card bg-surface p-4 shadow-card space-y-3">
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 text-teal-600" />
            <p className="text-sm font-semibold">1단계. 강사 서명</p>
          </div>
          <button
            onClick={() => {
              signTrainerForClass(classId, mode);
              setVersion((value) => value + 1);
              toast.success('강사 서명을 저장했습니다.');
            }}
            className="w-full rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white"
          >
            {trainerSigned ? '강사 서명 완료됨' : '강사 서명 저장'}
          </button>
        </section>

        <section className="rounded-card bg-surface p-4 shadow-card space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <p className="text-sm font-semibold">2단계. 회원 서명</p>
          </div>
          <button
            onClick={() => {
              signMemberForClass(classId);
              setVersion((value) => value + 1);
              toast.success('회원 서명을 완료 처리했습니다.');
            }}
            disabled={!trainerSigned}
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            {memberSigned ? '회원 서명 완료됨' : mode === 'remote' ? '원격 서명 완료 시뮬레이션' : '대면 서명 완료'}
          </button>
        </section>

        {certificate ? (
          <section className="rounded-card bg-surface p-4 shadow-card">
            <p className="text-sm font-semibold">확인서 상태</p>
            <p className="mt-2 text-sm text-content-secondary">상태: {certificate.status}</p>
            <p className="mt-1 text-xs text-content-tertiary">강사 서명: {certificate.trainerSignedAt ? '완료' : '미완료'} / 회원 서명: {certificate.memberSignedAt ? '완료' : '대기'}</p>
            <button
              onClick={() => navigate(`/trainer/certificates/${certificate.id}`)}
              className="mt-3 w-full rounded-xl bg-surface-secondary px-4 py-3 text-sm font-semibold text-content-secondary"
            >
              확인서 상세 보기
            </button>
          </section>
        ) : null}
      </div>
    </div>
  );
}
