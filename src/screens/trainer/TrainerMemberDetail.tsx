import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Dumbbell, Activity, Star, StickyNote, CalendarClock,
  Plus, Send,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import {
  appendPreviewTrainerEvaluation,
  appendPreviewTrainerMemo,
  getPreviewTrainerClasses,
  getPreviewSearchParam,
  getPreviewTrainerBodyComps,
  getPreviewTrainerEvaluations,
  getPreviewTrainerExerciseLogs,
  getPreviewTrainerMemberById,
  getPreviewTrainerMemos,
  isPreviewMode,
} from '@/lib/preview';
import {
  getLocalLessonCountHistories,
  getLocalLessonCounts,
  type LessonCountHistoryEntry,
  type LessonCountSummary,
} from '@/lib/lessonPlanning';
import { supabase } from '@/lib/supabase';
import { cn, formatPhone, formatDateKo } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Avatar, Badge, Button, Card, EmptyState } from '@/components/ui';

interface MemberInfo {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  gender: string | null;
  status: string;
  membershipType: string | null;
  membershipExpiry: string | null;
}

interface ExerciseLog {
  id: number;
  exerciseName: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  duration: number | null;
  loggedAt: string;
}

interface BodyComp {
  id: number;
  weight: number | null;
  muscle: number | null;
  fat: number | null;
  fatRate: number | null;
  bmi: number | null;
  createdAt: string;
}

interface Evaluation {
  id: number;
  staffName: string;
  category: string;
  score: number;
  content: string;
  createdAt: string;
}

interface Memo {
  id: number;
  content: string;
  author: string;
  createdAt: string;
}

interface LessonSchedule {
  id: number;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  room: string | null;
  staffName: string;
  lessonStatus: string | null;
}

type TabKey = 'exercise' | 'body' | 'lesson' | 'evaluation' | 'memo';

/** 트레이너 - 회원 상세 */
export default function TrainerMemberDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { trainer } = useAuthStore();

  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>('exercise');

  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [bodyComps, setBodyComps] = useState<BodyComp[]>([]);
  const [lessonSchedules, setLessonSchedules] = useState<LessonSchedule[]>([]);
  const [lessonCounts, setLessonCounts] = useState<LessonCountSummary[]>([]);
  const [lessonCountHistories, setLessonCountHistories] = useState<LessonCountHistoryEntry[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [memos, setMemos] = useState<Memo[]>([]);

  // 평가 작성 폼
  const [evalCategory, setEvalCategory] = useState('');
  const [evalScore, setEvalScore] = useState(5);
  const [evalContent, setEvalContent] = useState('');
  const [evalSubmitting, setEvalSubmitting] = useState(false);

  // 메모 작성
  const [memoContent, setMemoContent] = useState('');
  const [memoSubmitting, setMemoSubmitting] = useState(false);

  useEffect(() => {
    if (!id || !trainer) return;
    fetchMember();
  }, [id, trainer]);

  useEffect(() => {
    if (!isPreviewMode()) return;
    const previewTab = getPreviewSearchParam('tab');
    if (previewTab === 'body' || previewTab === 'lesson' || previewTab === 'evaluation' || previewTab === 'memo') {
      setTab(previewTab);
    }
  }, []);

  useEffect(() => {
    if (!id || !memberInfo) return;
    if (tab === 'exercise') fetchExerciseLogs();
    if (tab === 'body') fetchBodyComps();
    if (tab === 'lesson') fetchLessonOverview();
    if (tab === 'evaluation') fetchEvaluations();
    if (tab === 'memo') fetchMemos();
  }, [tab, id, memberInfo]);

  const fetchMember = async () => {
    setLoading(true);

    if (isPreviewMode()) {
      setMemberInfo(id ? getPreviewTrainerMemberById(Number(id)) : null);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('members')
      .select('id, name, phone, email, gender, status, membershipType, membershipExpiry')
      .eq('id', Number(id))
      .single();

    if (data) setMemberInfo(data);
    setLoading(false);
  };

  const fetchExerciseLogs = async () => {
    if (isPreviewMode()) {
      setExerciseLogs(getPreviewTrainerExerciseLogs(Number(id)));
      return;
    }

    const { data } = await supabase
      .from('exercise_logs')
      .select('id, exerciseName, sets, reps, weight, duration, loggedAt')
      .eq('memberId', Number(id))
      .order('loggedAt', { ascending: false })
      .limit(30);
    if (data) setExerciseLogs(data);
  };

  const fetchBodyComps = async () => {
    if (isPreviewMode()) {
      setBodyComps(getPreviewTrainerBodyComps(Number(id)));
      return;
    }

    const { data } = await supabase
      .from('body_compositions')
      .select('id, weight, muscle, fat, fatRate, bmi, createdAt')
      .eq('memberId', Number(id))
      .order('createdAt', { ascending: false })
      .limit(20);
    if (data) setBodyComps(data);
  };

  const fetchEvaluations = async () => {
    if (isPreviewMode()) {
      setEvaluations(getPreviewTrainerEvaluations(Number(id)));
      return;
    }

    const { data } = await supabase
      .from('member_evaluations')
      .select('id, staffName, category, score, content, createdAt')
      .eq('memberId', Number(id))
      .order('createdAt', { ascending: false })
      .limit(20);
    if (data) setEvaluations(data);
  };

  const fetchLessonOverview = async () => {
    if (isPreviewMode()) {
      setLessonSchedules(
        getPreviewTrainerClasses()
          .filter((item) => item.memberId === Number(id))
          .map((item) => ({
            id: item.id,
            title: item.title,
            type: item.type,
            startTime: item.startTime,
            endTime: item.endTime,
            room: item.room,
            staffName: item.staffName,
            lessonStatus: item.lessonStatus ?? (item.memberId ? 'reserved' : null),
          }))
          .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      );
      setLessonCounts(getLocalLessonCounts(Number(id)));
      setLessonCountHistories(getLocalLessonCountHistories(Number(id)));
      return;
    }

    const [{ data: classData }, { data: countsData }, { data: historyData }] = await Promise.all([
      supabase
        .from('classes')
        .select('id, title, type, startTime, endTime, room, staffName, lesson_status')
        .eq('member_id', Number(id))
        .order('startTime', { ascending: false })
        .limit(20),
      supabase
        .from('lesson_counts')
        .select('id, memberId, productName, totalCount, usedCount, startDate, endDate')
        .eq('memberId', Number(id))
        .order('endDate'),
      supabase
        .from('lesson_count_histories')
        .select('id, lessonCountId, memberId, scheduleId, deductedAt, memo')
        .eq('memberId', Number(id))
        .order('deductedAt', { ascending: false })
        .limit(10),
    ]);

    setLessonSchedules(
      ((classData || []) as Array<Omit<LessonSchedule, 'lessonStatus'> & { lesson_status?: string | null }>).map((item) => ({
        id: item.id,
        title: item.title,
        type: item.type,
        startTime: item.startTime,
        endTime: item.endTime,
        room: item.room,
        staffName: item.staffName,
        lessonStatus: item.lesson_status ?? 'reserved',
      }))
    );
    setLessonCounts(
      (countsData || []).length > 0
        ? (countsData || []).map((item) => ({
            id: String(item.id),
            memberId: item.memberId,
            productName: item.productName,
            totalCount: item.totalCount,
            usedCount: item.usedCount,
            startDate: item.startDate,
            endDate: item.endDate,
            note: null,
          }))
        : getLocalLessonCounts(Number(id))
    );
    setLessonCountHistories(
      (historyData || []).length > 0
        ? (historyData || []).map((item) => ({
            id: String(item.id),
            memberId: item.memberId,
            lessonCountId: String(item.lessonCountId),
            classId: item.scheduleId ?? null,
            title: '수업 차감',
            trainerName: null,
            deductedAt: item.deductedAt,
            note: item.memo ?? null,
          }))
        : getLocalLessonCountHistories(Number(id))
    );
  };

  const fetchMemos = async () => {
    if (isPreviewMode()) {
      setMemos(getPreviewTrainerMemos(Number(id)));
      return;
    }

    const { data } = await supabase
      .from('member_memos')
      .select('id, content, author, createdAt')
      .eq('memberId', Number(id))
      .order('createdAt', { ascending: false })
      .limit(30);
    if (data) setMemos(data);
  };

  const submitEvaluation = async () => {
    if (!trainer || !memberInfo || !evalContent) return;
    setEvalSubmitting(true);

    if (isPreviewMode()) {
      appendPreviewTrainerEvaluation({
        memberId: memberInfo.id,
        staffName: trainer.staffName || trainer.name,
        category: evalCategory || '종합평가',
        score: evalScore,
        content: evalContent,
      });

      setEvalCategory('');
      setEvalScore(5);
      setEvalContent('');
      setEvalSubmitting(false);
      fetchEvaluations();
      return;
    }

    await supabase.from('member_evaluations').insert({
      memberId: memberInfo.id,
      staffId: trainer.staffId,
      staffName: trainer.staffName || trainer.name,
      category: evalCategory || '종합평가',
      score: evalScore,
      content: evalContent,
      branchId: trainer.branchId,
    });

    setEvalCategory('');
    setEvalScore(5);
    setEvalContent('');
    setEvalSubmitting(false);
    fetchEvaluations();
  };

  const submitMemo = async () => {
    if (!trainer || !memberInfo || !memoContent) return;
    setMemoSubmitting(true);

    if (isPreviewMode()) {
      appendPreviewTrainerMemo({
        memberId: memberInfo.id,
        author: trainer.name,
        content: memoContent,
      });

      setMemoContent('');
      setMemoSubmitting(false);
      fetchMemos();
      return;
    }

    await supabase.from('member_memos').insert({
      memberId: memberInfo.id,
      author: trainer.name,
      content: memoContent,
    });

    setMemoContent('');
    setMemoSubmitting(false);
    fetchMemos();
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="회원 정보 로딩 중..." />;
  }

  if (!memberInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-content-secondary">회원 정보를 찾을 수 없습니다</p>
        <Button variant="ghost" onClick={() => navigate(-1)}>뒤로 가기</Button>
      </div>
    );
  }

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'exercise', label: '운동기록', icon: <Dumbbell className="w-4 h-4" /> },
    { key: 'body', label: '체성분', icon: <Activity className="w-4 h-4" /> },
    { key: 'lesson', label: '수업이력', icon: <CalendarClock className="w-4 h-4" /> },
    { key: 'evaluation', label: '평가', icon: <Star className="w-4 h-4" /> },
    { key: 'memo', label: '메모', icon: <StickyNote className="w-4 h-4" /> },
  ];

  const activeLessonCount = lessonCounts.find((item) => item.usedCount < item.totalCount) || lessonCounts[0] || null;
  const nextLessonSchedule = lessonSchedules
    .filter((item) => item.lessonStatus !== 'completed' && new Date(item.startTime) >= new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0] || null;
  const latestLessonHistory = lessonCountHistories[0] || null;

  return (
    <div className="pull-to-refresh">
      {/* 헤더 */}
      <header className="bg-gradient-to-br from-teal-600 to-emerald-600 px-5 pt-safe-top pb-4">
        <div className="pt-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-white text-h4 font-bold">회원 상세</h1>
        </div>
      </header>

      {/* 회원 기본 정보 */}
      <div className="px-5 py-4">
        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <Avatar name={memberInfo.name} size="lg" />
            <div className="flex-1">
              <p className="font-bold text-body-lg">{memberInfo.name}</p>
              <p className="text-body text-content-secondary">{formatPhone(memberInfo.phone)}</p>
            </div>
            <Badge
              tone={memberInfo.status === 'ACTIVE' ? 'success' : 'neutral'}
              variant="soft"
            >
              {memberInfo.status === 'ACTIVE' ? '이용중' : memberInfo.status}
            </Badge>
          </div>
          <div className="mt-3 flex gap-4 text-caption text-content-secondary">
            {memberInfo.membershipType && <span>이용권: {memberInfo.membershipType}</span>}
            {memberInfo.membershipExpiry && <span>만료: {formatDateKo(memberInfo.membershipExpiry)}</span>}
          </div>
        </Card>
      </div>

      {/* 탭 */}
      <div className="px-5">
        <div className="flex border-b border-line">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1 py-3 text-body font-medium border-b-2 transition-colors',
                tab === t.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-content-tertiary'
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="px-5 py-4 space-y-3 pb-24">
        {/* 운동기록 탭 */}
        {tab === 'exercise' && (
          exerciseLogs.length === 0 ? (
            <EmptyState size="sm" title="운동 기록이 없습니다" />
          ) : (
            exerciseLogs.map((log) => (
              <Card key={log.id} variant="soft" padding="sm">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-body">{log.exerciseName}</p>
                  <span className="text-caption text-content-tertiary">{formatDateKo(log.loggedAt)}</span>
                </div>
                <div className="flex gap-3 mt-1 text-caption text-content-secondary">
                  {log.sets && <span>{log.sets}세트</span>}
                  {log.reps && <span>{log.reps}회</span>}
                  {log.weight && <span>{log.weight}kg</span>}
                  {log.duration && <span>{log.duration}분</span>}
                </div>
              </Card>
            ))
          )
        )}

        {/* 체성분 탭 */}
        {tab === 'body' && (
          bodyComps.length === 0 ? (
            <EmptyState size="sm" title="체성분 기록이 없습니다" />
          ) : (
            bodyComps.map((bc) => (
              <Card key={bc.id} variant="soft" padding="sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-caption text-content-tertiary">{formatDateKo(bc.createdAt)}</span>
                </div>
                <div className="grid grid-cols-5 gap-2 text-center">
                  <div>
                    <p className="text-caption text-content-tertiary">체중</p>
                    <p className="text-body font-bold">{bc.weight ?? '-'}kg</p>
                  </div>
                  <div>
                    <p className="text-caption text-content-tertiary">근육</p>
                    <p className="text-body font-bold">{bc.muscle ?? '-'}kg</p>
                  </div>
                  <div>
                    <p className="text-caption text-content-tertiary">체지방</p>
                    <p className="text-body font-bold">{bc.fat ?? '-'}kg</p>
                  </div>
                  <div>
                    <p className="text-caption text-content-tertiary">체지방률</p>
                    <p className="text-body font-bold">{bc.fatRate ?? '-'}%</p>
                  </div>
                  <div>
                    <p className="text-caption text-content-tertiary">BMI</p>
                    <p className="text-body font-bold">{bc.bmi ?? '-'}</p>
                  </div>
                </div>
              </Card>
            ))
          )
        )}

        {tab === 'lesson' && (
          <>
            {activeLessonCount && (
              <Card variant="elevated" padding="md">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-caption text-content-tertiary">수강권 잔여 현황</p>
                      <p className="mt-1 text-body font-semibold">{activeLessonCount.productName}</p>
                    </div>
                    <div className="rounded-card bg-primary-light px-3 py-2 text-right">
                      <p className="text-[11px] text-primary">잔여 회차</p>
                      <p className="text-h4 font-bold text-primary">
                        {Math.max(activeLessonCount.totalCount - activeLessonCount.usedCount, 0)}회
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-card bg-surface-secondary px-3 py-3">
                      <p className="text-[11px] text-content-tertiary">사용 회차</p>
                      <p className="mt-1 text-body font-semibold">
                        {activeLessonCount.usedCount}/{activeLessonCount.totalCount}
                      </p>
                    </div>
                    <div className="rounded-card bg-surface-secondary px-3 py-3">
                      <p className="text-[11px] text-content-tertiary">사용 기간</p>
                      <p className="mt-1 text-body font-semibold">
                        {formatDateKo(activeLessonCount.startDate)} ~ {formatDateKo(activeLessonCount.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-card bg-surface-secondary px-3 py-3">
                      <p className="text-[11px] text-content-tertiary">최근 차감</p>
                      <p className="mt-1 text-body font-semibold">
                        {latestLessonHistory ? formatDateKo(latestLessonHistory.deductedAt) : '없음'}
                      </p>
                    </div>
                    <div className="rounded-card bg-surface-secondary px-3 py-3">
                      <p className="text-[11px] text-content-tertiary">다음 예약 예정</p>
                      <p className="mt-1 text-body font-semibold">
                        {nextLessonSchedule ? formatDateKo(nextLessonSchedule.startTime) : '없음'}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <Card variant="elevated" padding="md">
              <p className="font-semibold text-body mb-3">수업 일정 / 이력</p>
              {lessonSchedules.length === 0 ? (
                <p className="text-body text-content-tertiary">등록된 수업 이력이 없습니다</p>
              ) : (
                <div className="space-y-3">
                  {lessonSchedules.map((lesson) => (
                    <div key={lesson.id} className="rounded-card bg-surface-secondary px-3 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-body font-semibold">{lesson.title}</p>
                            <Badge
                              tone={lesson.lessonStatus === 'completed' ? 'info' : 'success'}
                              variant="soft"
                            >
                              {lesson.lessonStatus === 'completed' ? '완료' : '예정'}
                            </Badge>
                          </div>
                          <p className="mt-1 text-caption text-content-secondary">
                            {formatDateKo(lesson.startTime)} · {lesson.type}{lesson.room ? ` · ${lesson.room}` : ''}
                          </p>
                        </div>
                        <span className="text-caption text-content-tertiary">
                          {formatDateKo(lesson.startTime)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card variant="elevated" padding="md">
              <p className="font-semibold text-body mb-3">차감 이력</p>
              {lessonCountHistories.length === 0 ? (
                <p className="text-body text-content-tertiary">차감 이력이 없습니다</p>
              ) : (
                <div className="space-y-3">
                  {lessonCountHistories.map((history) => (
                    <div key={history.id} className="rounded-card bg-surface-secondary px-3 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-body font-medium">{history.title}</p>
                        <span className="text-caption text-content-tertiary">{formatDateKo(history.deductedAt)}</span>
                      </div>
                      {history.note && <p className="mt-1 text-caption text-content-secondary">{history.note}</p>}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}

        {/* 평가 탭 */}
        {tab === 'evaluation' && (
          <>
            <Card variant="elevated" padding="md">
              <p className="font-semibold text-body flex items-center gap-1 mb-3">
                <Plus className="w-4 h-4" /> 새 평가 작성
              </p>
              <div className="space-y-3">
                <input
                  type="text"
                  value={evalCategory}
                  onChange={(e) => setEvalCategory(e.target.value)}
                  placeholder="평가 카테고리 (예: 체력, 자세, 식단)"
                  className="w-full px-3 py-2 rounded-input border border-line text-body focus:outline-none focus:border-primary"
                />
                <div className="flex items-center gap-2">
                  <span className="text-body text-content-secondary">점수:</span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={evalScore}
                    onChange={(e) => setEvalScore(Number(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <span className="text-body font-bold text-primary w-6 text-right">{evalScore}</span>
                </div>
                <textarea
                  value={evalContent}
                  onChange={(e) => setEvalContent(e.target.value)}
                  placeholder="평가 내용을 입력하세요"
                  rows={3}
                  className="w-full px-3 py-2 rounded-input border border-line text-body focus:outline-none focus:border-primary resize-none"
                />
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={submitEvaluation}
                  disabled={evalSubmitting || !evalContent}
                  loading={evalSubmitting}
                >
                  평가 저장
                </Button>
              </div>
            </Card>

            {evaluations.length === 0 ? (
              <EmptyState size="sm" title="평가 기록이 없습니다" />
            ) : (
              evaluations.map((ev) => (
                <Card key={ev.id} variant="soft" padding="sm">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge tone="primary" variant="soft">{ev.category}</Badge>
                      <span className="text-caption font-bold text-primary">{ev.score}/10</span>
                    </div>
                    <span className="text-caption text-content-tertiary">{formatDateKo(ev.createdAt)}</span>
                  </div>
                  <p className="text-body text-content">{ev.content}</p>
                  <p className="text-caption text-content-tertiary mt-1">- {ev.staffName}</p>
                </Card>
              ))
            )}
          </>
        )}

        {/* 메모 탭 */}
        {tab === 'memo' && (
          <>
            <div className="flex gap-2">
              <input
                type="text"
                value={memoContent}
                onChange={(e) => setMemoContent(e.target.value)}
                placeholder="메모를 입력하세요"
                className="flex-1 px-3 py-2.5 rounded-input border border-line text-body focus:outline-none focus:border-primary"
                onKeyDown={(e) => e.key === 'Enter' && submitMemo()}
              />
              <Button
                variant="primary"
                size="md"
                onClick={submitMemo}
                disabled={memoSubmitting || !memoContent}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {memos.length === 0 ? (
              <EmptyState size="sm" title="메모가 없습니다" />
            ) : (
              memos.map((memo) => (
                <Card key={memo.id} variant="soft" padding="sm">
                  <p className="text-body text-content">{memo.content}</p>
                  <div className="flex justify-between mt-1">
                    <span className="text-caption text-content-tertiary">{memo.author}</span>
                    <span className="text-caption text-content-tertiary">{formatDateKo(memo.createdAt)}</span>
                  </div>
                </Card>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
