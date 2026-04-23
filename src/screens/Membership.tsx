import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, ChevronRight, Calendar, Hash } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getPreviewContracts, isPreviewMode } from '@/lib/preview';
import {
  getLocalLessonCountHistories,
  getLocalLessonCounts,
  type LessonCountHistoryEntry,
  type LessonCountSummary,
} from '@/lib/lessonPlanning';
import { getReservations } from '@/lib/memberExperience';
import { supabase } from '@/lib/supabase';
import { cn, calcDday, formatDateKo, calcPercent } from '@/lib/utils';

interface ContractItem {
  id: number;
  productName: string | null;
  amount: number | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
}

/** 이용권 목록 페이지 */
export default function Membership() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { member } = useAuthStore();
  const [tab, setTab] = useState<'active' | 'expired'>(() =>
    searchParams.get('tab') === 'expired' ? 'expired' : 'active'
  );
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [lessonCounts, setLessonCounts] = useState<LessonCountSummary[]>([]);
  const [lessonHistories, setLessonHistories] = useState<LessonCountHistoryEntry[]>([]);
  const [nextLessonDate, setNextLessonDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTab(searchParams.get('tab') === 'expired' ? 'expired' : 'active');
  }, [searchParams]);

  useEffect(() => {
    if (!member) return;
    fetchContracts();
    fetchLessonSummary();
  }, [member]);

  const fetchContracts = async () => {
    if (!member) return;
    setLoading(true);

    if (isPreviewMode()) {
      setContracts(getPreviewContracts());
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('contracts')
      .select('id, productName, amount, startDate, endDate, status')
      .eq('memberId', member.id)
      .order('startDate', { ascending: false });

    setContracts(data || []);
    setLoading(false);
  };

  const fetchLessonSummary = async () => {
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
          .limit(5),
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

  const activeContracts = contracts.filter(
    (c) => c.status === '서명완료' || c.status === '대기'
  );
  const expiredContracts = contracts.filter(
    (c) => c.status === '만료'
  );

  const displayList = tab === 'active' ? activeContracts : expiredContracts;
  const activeLessonCount = lessonCounts.find((item) => item.usedCount < item.totalCount) || lessonCounts[0] || null;
  const latestLessonHistory = lessonHistories[0] || null;

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* 헤더 */}
      <header className="bg-surface sticky top-0 z-10">
        <div className="px-5 pt-safe-top">
          <h1 className="text-xl font-bold py-4">이용권</h1>
        </div>

        {/* 탭 */}
        <div className="flex border-b border-line">
          {[
            { key: 'active' as const, label: '이용중', count: activeContracts.length },
            { key: 'expired' as const, label: '만료', count: expiredContracts.length },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                const next = new URLSearchParams(searchParams);
                if (t.key === 'active') next.delete('tab');
                else next.set('tab', t.key);
                setSearchParams(next, { replace: true });
              }}
              className={cn(
                'flex-1 py-3 text-sm font-medium relative',
                tab === t.key ? 'text-primary' : 'text-content-tertiary'
              )}
            >
              {t.label} ({t.count})
              {tab === t.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* 이용권 리스트 */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => navigate('/shop')}
            className="bg-surface rounded-card p-4 shadow-card text-left"
          >
            <p className="text-xs text-content-tertiary">이용권 구매</p>
            <p className="text-sm font-semibold mt-1">헬스장 / 골프장 / PT 상품</p>
          </button>
          <button
            onClick={() => navigate('/payment/personal')}
            className="bg-primary text-white rounded-card p-4 shadow-card text-left"
          >
            <p className="text-xs text-white/80">개인 결제</p>
            <p className="text-sm font-semibold mt-1">결제 페이지 바로가기</p>
          </button>
        </div>

        {activeLessonCount && (
          <div className="bg-surface rounded-card p-4 shadow-card mb-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-content-tertiary">수강권 / 잔여 회차</p>
                <p className="mt-1 text-sm font-semibold">{activeLessonCount.productName}</p>
                <p className="mt-2 text-2xl font-bold text-primary">
                  {Math.max(activeLessonCount.totalCount - activeLessonCount.usedCount, 0)}회
                </p>
              </div>
              <div className="rounded-xl bg-primary-light px-3 py-2 text-right">
                <p className="text-[11px] text-primary">사용</p>
                <p className="text-sm font-semibold text-primary">
                  {activeLessonCount.usedCount}/{activeLessonCount.totalCount}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-content-secondary">
              <span>사용기간: {formatDateKo(activeLessonCount.startDate)} ~ {formatDateKo(activeLessonCount.endDate)}</span>
              {latestLessonHistory && <span>최근 차감: {formatDateKo(latestLessonHistory.deductedAt)}</span>}
              {nextLessonDate && <span>다음 예약: {formatDateKo(nextLessonDate)}</span>}
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-content-tertiary text-sm">불러오는 중...</div>
        ) : displayList.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-content-tertiary/30 mx-auto mb-3" />
            <p className="text-content-tertiary text-sm">
              {tab === 'active' ? '이용 중인 이용권이 없습니다' : '만료된 이용권이 없습니다'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayList.map((contract) => {
              const dday = contract.endDate ? calcDday(contract.endDate) : null;
              const ddayUrgent = dday !== null && dday <= 7 && dday >= 0;
              const isExpired = dday !== null && dday < 0;

              // 기간 기반 진행률 계산
              let progress = 0;
              if (contract.startDate && contract.endDate) {
                const total = new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime();
                const elapsed = Date.now() - new Date(contract.startDate).getTime();
                progress = calcPercent(elapsed, total);
              }

              return (
                <div
                  key={contract.id}
                  onClick={() => navigate(`/membership/${contract.id}`)}
                  className={cn(
                    'bg-surface rounded-card p-4 shadow-card touch-card cursor-pointer',
                    ddayUrgent && 'ring-2 ring-state-error/50'
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center',
                        isExpired ? 'bg-surface-tertiary' : 'bg-primary-light'
                      )}>
                        <CreditCard className={cn(
                          'w-5 h-5',
                          isExpired ? 'text-content-tertiary' : 'text-primary'
                        )} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">
                          {contract.productName || '이용권'}
                        </h3>
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          contract.status === '서명완료' ? 'bg-state-success/10 text-state-success' :
                          contract.status === '대기' ? 'bg-state-warning/10 text-state-warning' :
                          'bg-surface-tertiary text-content-tertiary'
                        )}>
                          {contract.status}
                        </span>
                      </div>
                    </div>
                    {dday !== null && !isExpired && (
                      <span className={cn(
                        'text-sm font-bold',
                        ddayUrgent ? 'text-state-error' : 'text-primary'
                      )}>
                        D-{dday}
                      </span>
                    )}
                  </div>

                  {/* 기간 정보 */}
                  <div className="flex items-center gap-4 text-xs text-content-secondary mb-2">
                    {contract.startDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDateKo(contract.startDate)} ~ {contract.endDate ? formatDateKo(contract.endDate) : ''}
                      </span>
                    )}
                  </div>

                  {/* 진행률 바 */}
                  {!isExpired && contract.startDate && contract.endDate && (
                    <div className="progress-bar">
                      <div
                        className={cn(
                          'progress-bar-fill',
                          ddayUrgent ? 'bg-state-error' : 'bg-primary'
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-end mt-2">
                    <ChevronRight className="w-4 h-4 text-content-tertiary" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
