import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Dumbbell, Activity, Star, StickyNote,
  Plus, Send,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import {
  appendPreviewTrainerEvaluation,
  appendPreviewTrainerMemo,
  getPreviewSearchParam,
  getPreviewTrainerBodyComps,
  getPreviewTrainerEvaluations,
  getPreviewTrainerExerciseLogs,
  getPreviewTrainerMemberById,
  getPreviewTrainerMemos,
  isPreviewMode,
} from '@/lib/preview';
import { supabase } from '@/lib/supabase';
import { cn, formatPhone, formatDateKo } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

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

type TabKey = 'exercise' | 'body' | 'evaluation' | 'memo';

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
    if (previewTab === 'body' || previewTab === 'evaluation' || previewTab === 'memo') {
      setTab(previewTab);
    }
  }, []);

  useEffect(() => {
    if (!id || !memberInfo) return;
    if (tab === 'exercise') fetchExerciseLogs();
    if (tab === 'body') fetchBodyComps();
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
        <button onClick={() => navigate(-1)} className="text-primary text-sm font-medium">
          뒤로 가기
        </button>
      </div>
    );
  }

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'exercise', label: '운동기록', icon: <Dumbbell className="w-4 h-4" /> },
    { key: 'body', label: '체성분', icon: <Activity className="w-4 h-4" /> },
    { key: 'evaluation', label: '평가', icon: <Star className="w-4 h-4" /> },
    { key: 'memo', label: '메모', icon: <StickyNote className="w-4 h-4" /> },
  ];

  return (
    <div className="pull-to-refresh">
      {/* 헤더 */}
      <header className="bg-gradient-to-br from-teal-600 to-emerald-600 px-5 pt-safe-top pb-4">
        <div className="pt-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-lg font-bold">회원 상세</h1>
        </div>
      </header>

      {/* 회원 기본 정보 */}
      <div className="px-5 py-4">
        <div className="bg-surface rounded-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center">
              <span className="text-teal-600 font-bold text-lg">{memberInfo.name.slice(0, 1)}</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-base">{memberInfo.name}</p>
              <p className="text-sm text-content-secondary">{formatPhone(memberInfo.phone)}</p>
            </div>
            <span className={cn(
              'text-xs px-2 py-1 rounded-full font-medium',
              memberInfo.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
            )}>
              {memberInfo.status === 'ACTIVE' ? '이용중' : memberInfo.status}
            </span>
          </div>
          <div className="mt-3 flex gap-4 text-xs text-content-secondary">
            {memberInfo.membershipType && <span>이용권: {memberInfo.membershipType}</span>}
            {memberInfo.membershipExpiry && <span>만료: {formatDateKo(memberInfo.membershipExpiry)}</span>}
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="px-5">
        <div className="flex border-b border-line">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1 py-3 text-sm font-medium border-b-2 transition-colors',
                tab === t.key
                  ? 'border-teal-600 text-teal-600'
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
            <p className="text-center text-content-tertiary text-sm py-8">운동 기록이 없습니다</p>
          ) : (
            exerciseLogs.map((log) => (
              <div key={log.id} className="bg-surface rounded-card p-3 shadow-card">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">{log.exerciseName}</p>
                  <span className="text-xs text-content-tertiary">{formatDateKo(log.loggedAt)}</span>
                </div>
                <div className="flex gap-3 mt-1 text-xs text-content-secondary">
                  {log.sets && <span>{log.sets}세트</span>}
                  {log.reps && <span>{log.reps}회</span>}
                  {log.weight && <span>{log.weight}kg</span>}
                  {log.duration && <span>{log.duration}분</span>}
                </div>
              </div>
            ))
          )
        )}

        {/* 체성분 탭 */}
        {tab === 'body' && (
          bodyComps.length === 0 ? (
            <p className="text-center text-content-tertiary text-sm py-8">체성분 기록이 없습니다</p>
          ) : (
            bodyComps.map((bc) => (
              <div key={bc.id} className="bg-surface rounded-card p-3 shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-content-tertiary">{formatDateKo(bc.createdAt)}</span>
                </div>
                <div className="grid grid-cols-5 gap-2 text-center">
                  <div>
                    <p className="text-xs text-content-tertiary">체중</p>
                    <p className="text-sm font-bold">{bc.weight ?? '-'}kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-content-tertiary">근육</p>
                    <p className="text-sm font-bold">{bc.muscle ?? '-'}kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-content-tertiary">체지방</p>
                    <p className="text-sm font-bold">{bc.fat ?? '-'}kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-content-tertiary">체지방률</p>
                    <p className="text-sm font-bold">{bc.fatRate ?? '-'}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-content-tertiary">BMI</p>
                    <p className="text-sm font-bold">{bc.bmi ?? '-'}</p>
                  </div>
                </div>
              </div>
            ))
          )
        )}

        {/* 평가 탭 */}
        {tab === 'evaluation' && (
          <>
            {/* 평가 작성 폼 */}
            <div className="bg-surface rounded-card p-4 shadow-card space-y-3">
              <p className="font-semibold text-sm flex items-center gap-1">
                <Plus className="w-4 h-4" /> 새 평가 작성
              </p>
              <input
                type="text"
                value={evalCategory}
                onChange={(e) => setEvalCategory(e.target.value)}
                placeholder="평가 카테고리 (예: 체력, 자세, 식단)"
                className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:border-teal-500"
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-content-secondary">점수:</span>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={evalScore}
                  onChange={(e) => setEvalScore(Number(e.target.value))}
                  className="flex-1 accent-teal-600"
                />
                <span className="text-sm font-bold text-teal-600 w-6 text-right">{evalScore}</span>
              </div>
              <textarea
                value={evalContent}
                onChange={(e) => setEvalContent(e.target.value)}
                placeholder="평가 내용을 입력하세요"
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:border-teal-500 resize-none"
              />
              <button
                onClick={submitEvaluation}
                disabled={evalSubmitting || !evalContent}
                className={cn(
                  'w-full py-2.5 rounded-lg font-semibold text-sm text-white',
                  'bg-teal-600 active:bg-teal-700 transition-colors',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {evalSubmitting ? '저장 중...' : '평가 저장'}
              </button>
            </div>

            {/* 평가 목록 */}
            {evaluations.length === 0 ? (
              <p className="text-center text-content-tertiary text-sm py-4">평가 기록이 없습니다</p>
            ) : (
              evaluations.map((ev) => (
                <div key={ev.id} className="bg-surface rounded-card p-3 shadow-card">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full">
                        {ev.category}
                      </span>
                      <span className="text-xs font-bold text-teal-600">{ev.score}/10</span>
                    </div>
                    <span className="text-xs text-content-tertiary">{formatDateKo(ev.createdAt)}</span>
                  </div>
                  <p className="text-sm text-content">{ev.content}</p>
                  <p className="text-xs text-content-tertiary mt-1">- {ev.staffName}</p>
                </div>
              ))
            )}
          </>
        )}

        {/* 메모 탭 */}
        {tab === 'memo' && (
          <>
            {/* 메모 입력 */}
            <div className="flex gap-2">
              <input
                type="text"
                value={memoContent}
                onChange={(e) => setMemoContent(e.target.value)}
                placeholder="메모를 입력하세요"
                className="flex-1 px-3 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-teal-500"
                onKeyDown={(e) => e.key === 'Enter' && submitMemo()}
              />
              <button
                onClick={submitMemo}
                disabled={memoSubmitting || !memoContent}
                className={cn(
                  'px-4 py-2.5 rounded-lg text-white',
                  'bg-teal-600 active:bg-teal-700 transition-colors',
                  'disabled:opacity-50'
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* 메모 목록 */}
            {memos.length === 0 ? (
              <p className="text-center text-content-tertiary text-sm py-4">메모가 없습니다</p>
            ) : (
              memos.map((memo) => (
                <div key={memo.id} className="bg-surface rounded-card p-3 shadow-card">
                  <p className="text-sm text-content">{memo.content}</p>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-content-tertiary">{memo.author}</span>
                    <span className="text-xs text-content-tertiary">{formatDateKo(memo.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
