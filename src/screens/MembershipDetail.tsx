import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Calendar, CreditCard, Pause, History, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getPreviewContractById, isPreviewMode } from '@/lib/preview';
import {
  getLocalLessonCountHistories,
  getLocalLessonCounts,
  type LessonCountHistoryEntry,
  type LessonCountSummary,
} from '@/lib/lessonPlanning';
import { getReservations } from '@/lib/memberExperience';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn, calcDday, formatDateKo, formatCurrency, calcPercent } from '@/lib/utils';

interface ContractDetail {
  id: number;
  productName: string | null;
  memberName: string;
  amount: number | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
  signedAt: string | null;
  createdAt: string;
}

/** 이용권 상세 / 홀딩 신청 페이지 */
export default function MembershipDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { member } = useAuthStore();
  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [lessonCounts, setLessonCounts] = useState<LessonCountSummary[]>([]);
  const [lessonHistories, setLessonHistories] = useState<LessonCountHistoryEntry[]>([]);
  const [nextLessonDate, setNextLessonDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHolding, setShowHolding] = useState(false);
  const [holdingDays, setHoldingDays] = useState(7);
  const [holdingReason, setHoldingReason] = useState('');

  useEffect(() => {
    if (id) fetchContract();
  }, [id]);

  useEffect(() => {
    if (!member?.id) return;
    fetchLessonUsage();
  }, [member?.id]);

  useEffect(() => {
    setShowHolding(searchParams.get('holding') === '1');
  }, [searchParams]);

  const fetchContract = async () => {
    setLoading(true);

    if (isPreviewMode()) {
      setContract(id ? getPreviewContractById(Number(id)) : null);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', Number(id))
      .single();

    if (data) setContract(data);
    setLoading(false);
  };

  const handleHolding = () => {
    toast.success(`홀딩 ${holdingDays}일 신청이 완료되었습니다. 관리자 승인 후 적용됩니다.`);
    setShowHolding(false);
  };

  const fetchLessonUsage = async () => {
    if (!member) return;

    const localNextLesson = getReservations(member.id)
      .filter((item) => new Date(item.startTime) >= new Date())
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0] || null;

    if (isPreviewMode()) {
      setLessonCounts(getLocalLessonCounts(member.id));
      setLessonHistories(getLocalLessonCountHistories(member.id));
      setNextLessonDate(localNextLesson?.startTime ?? null);
      return;
    }

    try {
      const [{ data: countsData }, { data: historyData }, { data: nextClassData }] = await Promise.all([
        supabase
          .from('lesson_counts')
          .select('id, memberId, productName, totalCount, usedCount, startDate, endDate')
          .eq('memberId', member.id)
          .order('endDate'),
        supabase
          .from('lesson_count_histories')
          .select('id, lessonCountId, memberId, scheduleId, deductedAt, memo')
          .eq('memberId', member.id)
          .order('deductedAt', { ascending: false })
          .limit(10),
        supabase
          .from('classes')
          .select('startTime')
          .eq('member_id', member.id)
          .gte('startTime', new Date().toISOString())
          .order('startTime')
          .limit(1),
      ]);

      const mappedCounts: LessonCountSummary[] = (countsData || []).map((item) => ({
        id: String(item.id),
        memberId: item.memberId,
        productName: item.productName,
        totalCount: item.totalCount,
        usedCount: item.usedCount,
        startDate: item.startDate,
        endDate: item.endDate,
        note: null,
      }));

      const mappedHistories: LessonCountHistoryEntry[] = (historyData || []).map((item) => ({
        id: String(item.id),
        memberId: item.memberId,
        lessonCountId: String(item.lessonCountId),
        classId: item.scheduleId ?? null,
        title: 'PT 사용',
        trainerName: null,
        deductedAt: item.deductedAt,
        note: item.memo ?? null,
      }));

      setLessonCounts(mappedCounts.length > 0 ? mappedCounts : getLocalLessonCounts(member.id));
      setLessonHistories(mappedHistories.length > 0 ? mappedHistories : getLocalLessonCountHistories(member.id));
      setNextLessonDate(nextClassData?.[0]?.startTime ?? localNextLesson?.startTime ?? null);
    } catch {
      setLessonCounts(getLocalLessonCounts(member.id));
      setLessonHistories(getLocalLessonCountHistories(member.id));
      setNextLessonDate(localNextLesson?.startTime ?? null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-content-tertiary">불러오는 중...</p>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-content-tertiary mb-3" />
        <p className="text-content-tertiary">이용권 정보를 찾을 수 없습니다.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary font-medium">돌아가기</button>
      </div>
    );
  }

  const dday = contract.endDate ? calcDday(contract.endDate) : null;
  const ddayUrgent = dday !== null && dday <= 7 && dday >= 0;
  const isExpired = dday !== null && dday < 0;

  let progress = 0;
  if (contract.startDate && contract.endDate) {
    const total = new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime();
    const elapsed = Date.now() - new Date(contract.startDate).getTime();
    progress = calcPercent(elapsed, total);
  }

  const totalDays = contract.startDate && contract.endDate
    ? Math.ceil((new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const remainDays = dday !== null && dday > 0 ? dday : 0;
  const relevantLessonCount = lessonCounts.find((item) =>
    contract.productName ? item.productName.includes(contract.productName.replace(/\s+/g, ' ').trim().split(' ')[0]) : true
  ) || lessonCounts[0] || null;
  const relevantHistories = relevantLessonCount
    ? lessonHistories.filter((item) => item.lessonCountId === relevantLessonCount.id).slice(0, 5)
    : [];

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* 헤더 */}
      <header className="bg-primary px-4 pt-safe-top pb-8">
        <div className="flex items-center h-14">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-lg text-white pr-6">이용권 상세</h1>
        </div>
        <div className="text-center">
          <CreditCard className="w-10 h-10 text-white/80 mx-auto mb-2" />
          <h2 className="text-xl font-bold text-white">{contract.productName || '이용권'}</h2>
          <span className={cn(
            'inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium',
            isExpired ? 'bg-white/20 text-white/60' : 'bg-white/20 text-white'
          )}>
            {isExpired ? '만료됨' : contract.status}
          </span>
        </div>
      </header>

      <div className="px-4 -mt-4 space-y-4 pb-32">
        {/* D-day 카드 */}
        {!isExpired && dday !== null && (
          <div className={cn(
            'bg-surface rounded-card p-5 shadow-card text-center',
            ddayUrgent && 'ring-2 ring-state-error'
          )}>
            <p className="text-sm text-content-secondary mb-1">만료까지</p>
            <p className={cn(
              'text-4xl font-bold',
              ddayUrgent ? 'text-state-error' : 'text-primary'
            )}>
              {dday > 0 ? `D-${dday}` : 'D-Day'}
            </p>
            <div className="mt-3 progress-bar">
              <div
                className={cn('progress-bar-fill', ddayUrgent ? 'bg-state-error' : 'bg-primary')}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-content-tertiary mt-2">
              {remainDays}일 남음 / 총 {totalDays}일
            </p>
          </div>
        )}

        {/* 상세 정보 */}
        <div className="bg-surface rounded-card p-4 shadow-card space-y-3">
          <h3 className="font-semibold text-sm mb-2">이용권 정보</h3>
          <DetailRow label="상품명" value={contract.productName || '-'} />
          {contract.amount && <DetailRow label="금액" value={formatCurrency(contract.amount)} />}
          {contract.startDate && <DetailRow label="시작일" value={formatDateKo(contract.startDate)} />}
          {contract.endDate && <DetailRow label="종료일" value={formatDateKo(contract.endDate)} />}
          {contract.signedAt && <DetailRow label="계약일" value={formatDateKo(contract.signedAt)} />}
        </div>

        {relevantLessonCount && (
          <div className="bg-surface rounded-card p-4 shadow-card space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-content-tertiary">PT / 레슨 이용 현황</p>
                <p className="mt-1 text-sm font-semibold">{relevantLessonCount.productName}</p>
              </div>
              <div className="rounded-xl bg-primary-light px-3 py-2 text-right">
                <p className="text-[11px] text-primary">잔여 회차</p>
                <p className="text-lg font-bold text-primary">
                  {Math.max(relevantLessonCount.totalCount - relevantLessonCount.usedCount, 0)}회
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-surface-secondary px-3 py-3">
                <p className="text-[11px] text-content-tertiary">사용 회차</p>
                <p className="mt-1 text-sm font-semibold">
                  {relevantLessonCount.usedCount}/{relevantLessonCount.totalCount}
                </p>
              </div>
              <div className="rounded-xl bg-surface-secondary px-3 py-3">
                <p className="text-[11px] text-content-tertiary">사용 기간</p>
                <p className="mt-1 text-sm font-semibold">
                  {formatDateKo(relevantLessonCount.startDate)} ~ {formatDateKo(relevantLessonCount.endDate)}
                </p>
              </div>
            </div>

            {nextLessonDate && (
              <div className="rounded-xl bg-surface-secondary px-3 py-3">
                <p className="text-[11px] text-content-tertiary">다음 예약 예정</p>
                <p className="mt-1 text-sm font-semibold">{formatDateKo(nextLessonDate)}</p>
              </div>
            )}

            <div>
              <div className="mb-2 flex items-center gap-2">
                <History className="w-4 h-4 text-content-secondary" />
                <p className="text-sm font-semibold">차감 이력</p>
              </div>
              {relevantHistories.length === 0 ? (
                <p className="text-sm text-content-tertiary">아직 차감된 이력이 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {relevantHistories.map((item) => (
                    <div key={item.id} className="rounded-xl bg-surface-secondary px-3 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">{item.title}</p>
                        <span className="text-xs text-content-tertiary">{formatDateKo(item.deductedAt)}</span>
                      </div>
                      {item.note && <p className="mt-1 text-xs text-content-secondary">{item.note}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 홀딩 신청 버튼 */}
        {!isExpired && contract.status === '서명완료' && (
          <button
            onClick={() => setShowHolding(true)}
            className="w-full bg-surface rounded-card p-4 shadow-card flex items-center gap-3 touch-card"
          >
            <div className="w-10 h-10 bg-state-warning/10 rounded-xl flex items-center justify-center">
              <Pause className="w-5 h-5 text-state-warning" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-sm">홀딩(일시정지) 신청</p>
              <p className="text-xs text-content-tertiary">이용권을 일시적으로 정지합니다</p>
            </div>
          </button>
        )}
      </div>

      {/* 홀딩 신청 모달 */}
      {showHolding && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <div className="mobile-bottom-sheet bg-surface rounded-t-2xl p-6 pb-safe-bottom slide-up">
            <h3 className="text-lg font-bold mb-4">홀딩 신청</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-content-secondary mb-1 block">정지 기간 (일)</label>
                <div className="flex gap-2">
                  {[7, 14, 30].map((d) => (
                    <button
                      key={d}
                      onClick={() => setHoldingDays(d)}
                      className={cn(
                        'flex-1 py-2 rounded-lg text-sm font-medium border',
                        holdingDays === d ? 'border-primary bg-primary-light text-primary' : 'border-line text-content-secondary'
                      )}
                    >
                      {d}일
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-content-secondary mb-1 block">사유</label>
                <textarea
                  value={holdingReason}
                  onChange={(e) => setHoldingReason(e.target.value)}
                  placeholder="홀딩 사유를 입력하세요 (선택)"
                  className="w-full p-3 rounded-xl border border-line bg-surface text-sm resize-none h-20 focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowHolding(false)}
                className="flex-1 py-3 rounded-button border border-line text-content-secondary font-medium"
              >
                취소
              </button>
              <button
                onClick={handleHolding}
                className="flex-1 py-3 rounded-button bg-primary text-white font-semibold"
              >
                신청하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-content-secondary">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
