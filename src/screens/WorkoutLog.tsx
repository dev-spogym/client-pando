import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ChevronLeft, ChevronRight, Plus, X, Clock, Flame, Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPreviewWorkoutEntries, isPreviewMode } from '@/lib/preview';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from '@/components/LoadingSpinner';

/** 운동 부위 카테고리 */
const CATEGORIES = ['가슴', '등', '어깨', '하체', '팔', '코어'] as const;
type Category = (typeof CATEGORIES)[number];

interface WorkoutSet {
  weight: number;
  reps: number;
}

interface WorkoutEntry {
  id: number;
  category: Category;
  name: string;
  sets: WorkoutSet[];
  duration: number; // 분
}

function getDateStr(date: Date): string {
  return date.toISOString().split('T')[0];
}

/** exercise_logs 행을 WorkoutEntry로 변환 */
function rowToEntry(row: Record<string, unknown>): WorkoutEntry {
  let sets: WorkoutSet[] = [];
  const notes = row.notes as string | null;
  if (notes) {
    try {
      const parsed = JSON.parse(notes);
      if (parsed.sets) sets = parsed.sets;
    } catch { /* notes가 JSON이 아닌 경우 무시 */ }
  }
  if (sets.length === 0) {
    sets = [{ weight: (row.weight as number) || 0, reps: (row.reps as number) || 0 }];
  }

  let category: Category = '가슴';
  if (notes) {
    try {
      const parsed = JSON.parse(notes);
      if (parsed.category && CATEGORIES.includes(parsed.category)) {
        category = parsed.category;
      }
    } catch { /* 무시 */ }
  }

  return {
    id: row.id as number,
    category,
    name: (row.exercise_name as string) || '',
    sets,
    duration: (row.duration as number) || 0,
  };
}

/** 운동일지 페이지 */
export default function WorkoutLog() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { member } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(searchParams.get('modal') === 'add');
  const [entries, setEntries] = useState<WorkoutEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // 모달 폼 상태
  const [formCategory, setFormCategory] = useState<Category>('가슴');
  const [formName, setFormName] = useState('');
  const [formSets, setFormSets] = useState<WorkoutSet[]>([{ weight: 0, reps: 0 }]);
  const [formDuration, setFormDuration] = useState(0);

  const dateStr = getDateStr(currentDate);

  useEffect(() => {
    setShowModal(searchParams.get('modal') === 'add');
  }, [searchParams]);

  /** DB에서 해당 날짜 운동 기록 조회 */
  const fetchEntries = useCallback(async () => {
    if (!member) return;
    setLoading(true);

    if (isPreviewMode()) {
      setEntries(getPreviewWorkoutEntries(dateStr).map((entry) => ({
        ...entry,
        category: entry.category as Category,
      })));
      setLoading(false);
      return;
    }

    const dayStart = `${dateStr}T00:00:00`;
    const dayEnd = `${dateStr}T23:59:59`;

    const { data } = await supabase
      .from('exercise_logs')
      .select('*')
      .eq('member_id', member.id)
      .gte('logged_at', dayStart)
      .lte('logged_at', dayEnd)
      .order('logged_at');

    setEntries(data ? data.map(rowToEntry) : []);
    setLoading(false);
  }, [member, dateStr]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const prevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const nextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const totalDuration = entries.reduce((sum, e) => sum + e.duration, 0);
  const totalVolume = entries.reduce(
    (sum, e) => sum + e.sets.reduce((s, set) => s + set.weight * set.reps, 0),
    0,
  );

  const resetForm = () => {
    setFormCategory('가슴');
    setFormName('');
    setFormSets([{ weight: 0, reps: 0 }]);
    setFormDuration(0);
  };

  const handleAddEntry = async () => {
    if (!formName.trim() || !member) return;

    if (isPreviewMode()) {
      const validSets = formSets.filter((s) => s.weight > 0 || s.reps > 0);
      const nextEntry: WorkoutEntry = {
        id: Date.now(),
        category: formCategory,
        name: formName.trim(),
        sets: validSets.length > 0 ? validSets : [{ weight: 0, reps: 0 }],
        duration: formDuration,
      };
      setEntries((prev) => [nextEntry, ...prev]);
      setShowModal(false);
      resetForm();
      return;
    }

    const validSets = formSets.filter((s) => s.weight > 0 || s.reps > 0);
    const setsToSave = validSets.length > 0 ? validSets : [{ weight: 0, reps: 0 }];

    const now = new Date();
    const loggedAt = dateStr === getDateStr(now)
      ? now.toISOString()
      : `${dateStr}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;

    const { error } = await supabase.from('exercise_logs').insert({
      member_id: member.id,
      branch_id: member.branchId,
      exercise_name: formName.trim(),
      sets: setsToSave.length,
      reps: setsToSave[0]?.reps || 0,
      weight: setsToSave[0]?.weight || 0,
      duration: formDuration,
      logged_at: loggedAt,
      notes: JSON.stringify({ category: formCategory, sets: setsToSave }),
    });

    if (!error) {
      await fetchEntries();
      setShowModal(false);
      resetForm();
    }
  };

  const handleDeleteEntry = async (entryId: number) => {
    if (isPreviewMode()) {
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      return;
    }

    const { error } = await supabase.from('exercise_logs').delete().eq('id', entryId);
    if (!error) {
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
    }
  };

  const addSet = () => setFormSets([...formSets, { weight: 0, reps: 0 }]);
  const removeSet = (idx: number) => setFormSets(formSets.filter((_, i) => i !== idx));
  const updateSet = (idx: number, field: 'weight' | 'reps', value: number) => {
    const updated = [...formSets];
    updated[idx] = { ...updated[idx], [field]: value };
    setFormSets(updated);
  };

  const today = new Date();
  const isToday =
    currentDate.getFullYear() === today.getFullYear() &&
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getDate() === today.getDate();

  const categoryColor: Record<Category, string> = {
    '가슴': 'bg-red-100 text-red-600',
    '등': 'bg-blue-100 text-blue-600',
    '어깨': 'bg-orange-100 text-orange-600',
    '하체': 'bg-green-100 text-green-600',
    '팔': 'bg-purple-100 text-purple-600',
    '코어': 'bg-yellow-100 text-yellow-700',
  };

  if (!member) {
    return <LoadingSpinner fullScreen text="운동일지를 불러오는 중..." />;
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* 헤더 */}
      <header className="bg-surface sticky top-0 z-10 border-b border-line">
        <div className="flex items-center px-4 pt-safe-top h-14">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-content" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-lg">운동일지</h1>
          <div className="w-6" />
        </div>
      </header>

      {/* 날짜 선택 */}
      <div className="bg-surface px-4 py-3 flex items-center justify-between">
        <button onClick={prevDay} className="p-2">
          <ChevronLeft className="w-5 h-5 text-content-secondary" />
        </button>
        <span className="font-semibold text-base">
          {currentDate.getMonth() + 1}월 {currentDate.getDate()}일
          {isToday && <span className="text-primary text-sm ml-1">(오늘)</span>}
        </span>
        <button onClick={nextDay} className="p-2">
          <ChevronRight className="w-5 h-5 text-content-secondary" />
        </button>
      </div>

      {/* 요약 카드 */}
      <div className="px-4 mt-3">
        <div className="bg-surface rounded-card p-4 shadow-card grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-content-tertiary">총 운동 시간</p>
              <p className="text-lg font-bold">{totalDuration}<span className="text-xs text-content-tertiary ml-0.5">분</span></p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-state-warning/10 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-state-warning" />
            </div>
            <div>
              <p className="text-xs text-content-tertiary">총 볼륨</p>
              <p className="text-lg font-bold">{totalVolume.toLocaleString()}<span className="text-xs text-content-tertiary ml-0.5">kg</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* 운동 기록 목록 */}
      <div className="px-4 mt-4 pb-24">
        {loading ? (
          <div className="text-center py-12 text-content-tertiary text-sm">불러오는 중...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <Flame className="w-12 h-12 text-content-tertiary/30 mx-auto mb-3" />
            <p className="text-content-tertiary text-sm">운동 기록이 없습니다</p>
            <p className="text-content-tertiary text-xs mt-1">+ 버튼을 눌러 운동을 추가하세요</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => {
              const entryVolume = entry.sets.reduce((s, set) => s + set.weight * set.reps, 0);
              return (
                <div key={entry.id} className="bg-surface rounded-card p-4 shadow-card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', categoryColor[entry.category])}>
                        {entry.category}
                      </span>
                      <h3 className="font-semibold text-sm">{entry.name}</h3>
                    </div>
                    <button onClick={() => handleDeleteEntry(entry.id)} className="p-1">
                      <Trash2 className="w-4 h-4 text-content-tertiary" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {entry.sets.map((set, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-content-secondary">
                        <span className="text-xs text-content-tertiary w-12">{i + 1}세트</span>
                        <span>{set.weight}kg</span>
                        <span>x</span>
                        <span>{set.reps}회</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-content-tertiary">
                    {entry.duration > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {entry.duration}분
                      </span>
                    )}
                    <span>볼륨 {entryVolume.toLocaleString()}kg</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB 추가 버튼 */}
      <button
        onClick={() => { resetForm(); setShowModal(true); }}
        className="mobile-fab fixed w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform z-20"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* 운동 추가 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="mobile-bottom-sheet relative bg-surface rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-surface px-5 pt-5 pb-3 border-b border-line flex items-center justify-between">
              <h2 className="font-bold text-lg">운동 추가</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-6 h-6 text-content-secondary" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* 부위 선택 */}
              <div>
                <label className="text-sm font-medium text-content-secondary mb-2 block">운동 부위</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFormCategory(cat)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                        formCategory === cat
                          ? 'bg-primary text-white'
                          : 'bg-surface-tertiary text-content-secondary',
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* 운동명 */}
              <div>
                <label className="text-sm font-medium text-content-secondary mb-2 block">운동명</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="예: 벤치프레스"
                  className="w-full px-4 py-3 bg-surface-secondary rounded-xl text-sm border border-line focus:border-primary focus:outline-none"
                />
              </div>

              {/* 세트 추가 */}
              <div>
                <label className="text-sm font-medium text-content-secondary mb-2 block">세트</label>
                <div className="space-y-2">
                  {formSets.map((set, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-content-tertiary w-12 flex-shrink-0">{i + 1}세트</span>
                      <input
                        type="number"
                        value={set.weight || ''}
                        onChange={(e) => updateSet(i, 'weight', Number(e.target.value))}
                        placeholder="무게"
                        className="flex-1 px-3 py-2 bg-surface-secondary rounded-lg text-sm border border-line focus:border-primary focus:outline-none text-center"
                      />
                      <span className="text-xs text-content-tertiary">kg</span>
                      <input
                        type="number"
                        value={set.reps || ''}
                        onChange={(e) => updateSet(i, 'reps', Number(e.target.value))}
                        placeholder="횟수"
                        className="flex-1 px-3 py-2 bg-surface-secondary rounded-lg text-sm border border-line focus:border-primary focus:outline-none text-center"
                      />
                      <span className="text-xs text-content-tertiary">회</span>
                      {formSets.length > 1 && (
                        <button onClick={() => removeSet(i)} className="p-1">
                          <X className="w-4 h-4 text-content-tertiary" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addSet}
                  className="mt-2 w-full py-2 border border-dashed border-line rounded-lg text-sm text-content-secondary active:bg-surface-secondary"
                >
                  + 세트 추가
                </button>
              </div>

              {/* 운동 시간 */}
              <div>
                <label className="text-sm font-medium text-content-secondary mb-2 block">운동 시간 (분)</label>
                <input
                  type="number"
                  value={formDuration || ''}
                  onChange={(e) => setFormDuration(Number(e.target.value))}
                  placeholder="예: 30"
                  className="w-full px-4 py-3 bg-surface-secondary rounded-xl text-sm border border-line focus:border-primary focus:outline-none"
                />
              </div>

              {/* 저장 */}
              <button
                onClick={handleAddEntry}
                className="w-full py-3 bg-primary text-white font-semibold rounded-xl active:bg-primary-dark transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
