import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { loadWithdrawalRequest, saveWithdrawalRequest } from '@/lib/memberExperience';
import { cn, formatDateKo } from '@/lib/utils';

const REASONS = ['이용 빈도 감소', '가격 부담', '센터 변경', '앱 사용 불편', '기타'];

/** 회원 탈퇴 */
export default function Withdrawal() {
  const navigate = useNavigate();
  const { member } = useAuthStore();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [agree, setAgree] = useState(false);
  const [requestedAt, setRequestedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!member) return;
    const request = loadWithdrawalRequest(member.id);
    setReason(request.reason);
    setDetails(request.details);
    setRequestedAt(request.requestedAt);
  }, [member]);

  if (!member) return null;

  const handleSubmit = () => {
    if (!reason || !agree) {
      toast.error('탈퇴 사유 선택과 동의가 필요합니다.');
      return;
    }

    const next = {
      requestedAt: new Date().toISOString(),
      reason,
      details,
      status: 'requested' as const,
    };

    saveWithdrawalRequest(member.id, next);
    setRequestedAt(next.requestedAt);
    toast.success('회원 탈퇴 요청이 접수되었습니다.');
  };

  return (
    <div className="min-h-screen bg-surface-secondary page-with-action">
      <header className="page-header-sticky">
        <div className="flex items-center px-4 pt-safe-top h-14">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-content" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-lg">회원 탈퇴</h1>
          <div className="w-6" />
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 pb-28">
        <section className="bg-state-error/10 rounded-card p-5">
          <h2 className="text-lg font-bold text-state-error">탈퇴 전 확인해 주세요</h2>
          <p className="text-sm text-content-secondary mt-2 leading-relaxed">
            탈퇴 요청은 퍼블리싱 화면 기준으로 저장되며, 실제 운영에서는 관리자 확인 후 확정 처리됩니다.
          </p>
          {requestedAt && (
            <p className="text-xs text-state-error mt-3">최근 요청일: {formatDateKo(requestedAt)}</p>
          )}
        </section>

        <section className="bg-surface rounded-card p-5 shadow-card">
          <h3 className="text-sm font-semibold mb-3">탈퇴 사유</h3>
          <div className="flex flex-wrap gap-2">
            {REASONS.map((item) => (
              <button
                key={item}
                onClick={() => setReason(item)}
                className={cn(
                  'px-4 py-2.5 rounded-full text-sm font-medium',
                  reason === item ? 'bg-primary text-white' : 'bg-surface-secondary text-content-secondary'
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-surface rounded-card p-5 shadow-card">
          <h3 className="text-sm font-semibold mb-3">추가 의견</h3>
          <textarea
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder="개선이 필요한 점이나 탈퇴 사유를 자세히 남겨주세요."
            className="w-full h-28 rounded-xl border border-line bg-surface-secondary px-4 py-3 text-sm outline-none resize-none"
          />
        </section>

        <label className="bg-surface rounded-card p-4 shadow-card flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agree}
            onChange={(event) => setAgree(event.target.checked)}
            className="mt-1 w-4 h-4 accent-primary"
          />
          <div>
            <p className="text-sm font-medium">탈퇴 시 복구가 어렵고, 보관 데이터 정책을 확인했습니다.</p>
            <p className="text-xs text-content-tertiary mt-1">실제 삭제는 운영 관리자 승인 이후 처리되는 흐름으로 안내합니다.</p>
          </div>
        </label>
      </div>

      <div className="bottom-action-bar">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleSubmit}
            className="w-full py-3.5 rounded-button font-semibold bg-state-error text-white"
          >
            탈퇴 요청하기
          </button>
        </div>
      </div>
    </div>
  );
}
