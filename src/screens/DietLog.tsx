import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Plus, X, Flame, Camera, Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, Button, EmptyState } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';

type MealType = '아침' | '점심' | '저녁' | '간식';

const MEAL_TYPES: MealType[] = ['아침', '점심', '저녁', '간식'];

interface FoodEntry {
  id: string;
  remoteId?: number;
  name: string;
  calories: number;
  memo: string;
  photoName?: string | null;
}

interface MealLog {
  [key: string]: FoodEntry[]; // meal type -> entries
}

interface DayDietLog {
  date: string;
  meals: MealLog;
}

interface RemoteDietLog {
  id: number;
  date: string;
  mealType: MealType;
  name: string;
  calories: number;
  memo: string | null;
  photoName: string | null;
}

const STORAGE_KEY = 'fitgenie-diet-logs';

function getDateStr(date: Date): string {
  return date.toISOString().split('T')[0];
}

function loadLogs(): Record<string, DayDietLog> {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLogs(logs: Record<string, DayDietLog>) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

function appendEntry(
  logs: Record<string, DayDietLog>,
  date: string,
  meal: MealType,
  entry: FoodEntry,
): Record<string, DayDietLog> {
  const updated = { ...logs };
  const day = updated[date] ?? { date, meals: {} };
  const entries = day.meals[meal] ?? [];
  updated[date] = {
    ...day,
    meals: {
      ...day.meals,
      [meal]: [...entries, entry],
    },
  };
  return updated;
}

function removeEntry(logs: Record<string, DayDietLog>, date: string, meal: MealType, entryId: string): Record<string, DayDietLog> {
  const updated = { ...logs };
  const day = updated[date];
  if (!day?.meals[meal]) return updated;

  const nextEntries = day.meals[meal].filter((entry) => entry.id !== entryId);
  const nextMeals = { ...day.meals };
  if (nextEntries.length === 0) {
    delete nextMeals[meal];
  } else {
    nextMeals[meal] = nextEntries;
  }

  if (Object.keys(nextMeals).length === 0) {
    delete updated[date];
    return updated;
  }

  updated[date] = { ...day, meals: nextMeals };
  return updated;
}

function remoteLogsToDayLogs(items: RemoteDietLog[]): Record<string, DayDietLog> {
  return items.reduce<Record<string, DayDietLog>>((acc, item) => appendEntry(acc, item.date, item.mealType, {
    id: `remote-${item.id}`,
    remoteId: item.id,
    name: item.name,
    calories: item.calories,
    memo: item.memo ?? '',
    photoName: item.photoName,
  }), {});
}

const mealIcon: Record<MealType, string> = {
  '아침': '🌅',
  '점심': '☀️',
  '저녁': '🌙',
  '간식': '🍪',
};

/** 식단 관리 페이지 */
export default function DietLog() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const member = useAuthStore((state) => state.member);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(searchParams.get('modal') === 'add');
  const [selectedMeal, setSelectedMeal] = useState<MealType>(() => {
    const nextMeal = searchParams.get('meal');
    return MEAL_TYPES.includes(nextMeal as MealType) ? (nextMeal as MealType) : '아침';
  });
  const [logs, setLogs] = useState<Record<string, DayDietLog> | null>(null);

  // 모달 폼 상태
  const [formName, setFormName] = useState('');
  const [formCalories, setFormCalories] = useState(0);
  const [formMemo, setFormMemo] = useState('');
  const [formPhotoName, setFormPhotoName] = useState('');

  const dateStr = getDateStr(currentDate);
  const dayLog = logs?.[dateStr];

  useEffect(() => {
    let ignore = false;

    async function loadRemoteLogs() {
      if (!member) {
        setLogs(loadLogs());
        return;
      }

      try {
        const response = await fetch(`/api/diet-logs?memberId=${member.id}`);
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error ?? 'diet_logs_fetch_failed');
        }
        if (!ignore) {
          setLogs(remoteLogsToDayLogs(result.data ?? []));
        }
      } catch (error) {
        if (typeof window !== 'undefined') {
          // eslint-disable-next-line no-console
          console.warn('[DietLog] remote load failed, using local logs:', error);
        }
        if (!ignore) {
          setLogs(loadLogs());
        }
      }
    }

    loadRemoteLogs();
    return () => {
      ignore = true;
    };
  }, [member]);

  useEffect(() => {
    const nextMeal = searchParams.get('meal');
    if (MEAL_TYPES.includes(nextMeal as MealType)) {
      setSelectedMeal(nextMeal as MealType);
    }
    setShowModal(searchParams.get('modal') === 'add');
  }, [searchParams]);

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

  const totalCalories = MEAL_TYPES.reduce((sum, meal) => {
    const entries = dayLog?.meals[meal] || [];
    return sum + entries.reduce((s, e) => s + e.calories, 0);
  }, 0);

  const resetForm = () => {
    setFormName('');
    setFormCalories(0);
    setFormMemo('');
    setFormPhotoName('');
  };

  const handleAddFood = async () => {
    if (!formName.trim() || !logs) return;

    const newEntry: FoodEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: formName.trim(),
      calories: formCalories,
      memo: formMemo.trim(),
      photoName: formPhotoName || null,
    };

    let entry = newEntry;
    if (member) {
      try {
        const response = await fetch('/api/diet-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memberId: member.id,
            date: dateStr,
            mealType: selectedMeal,
            name: newEntry.name,
            calories: newEntry.calories,
            memo: newEntry.memo,
            photoName: newEntry.photoName,
          }),
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error ?? 'diet_log_create_failed');
        }
        entry = {
          ...newEntry,
          id: `remote-${result.data.id}`,
          remoteId: result.data.id,
        };
      } catch (error) {
        if (typeof window !== 'undefined') {
          // eslint-disable-next-line no-console
          console.warn('[DietLog] remote create failed, saving locally:', error);
        }
        toast.warning('네트워크 문제로 이 기기 안에 임시 저장했어요.');
      }
    }

    const updated = appendEntry(logs, dateStr, selectedMeal, entry);
    setLogs(updated);
    saveLogs(updated);
    setShowModal(false);
    resetForm();
  };

  const handleDeleteFood = async (meal: MealType, entryId: string) => {
    if (!logs) return;
    const entry = logs[dateStr]?.meals[meal]?.find((item) => item.id === entryId);

    if (member && entry?.remoteId) {
      try {
        const response = await fetch(`/api/diet-logs?memberId=${member.id}&id=${entry.remoteId}`, {
          method: 'DELETE',
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error ?? 'diet_log_delete_failed');
        }
      } catch (error) {
        if (typeof window !== 'undefined') {
          // eslint-disable-next-line no-console
          console.warn('[DietLog] remote delete failed:', error);
        }
        toast.error('삭제에 실패했어요. 잠시 후 다시 시도해 주세요.');
        return;
      }
    }

    const updated = removeEntry(logs, dateStr, meal, entryId);
    setLogs(updated);
    saveLogs(updated);
  };

  const openAddModal = (meal: MealType) => {
    setSelectedMeal(meal);
    resetForm();
    setShowModal(true);
  };

  const today = new Date();
  const isToday =
    currentDate.getFullYear() === today.getFullYear() &&
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getDate() === today.getDate();

  return (
    <div className="min-h-screen bg-surface-secondary">
      <PageHeader title="식단 관리" onBack={() => navigate(-1)} />

      {/* 날짜 선택 */}
      <div className="bg-surface px-4 py-3 flex items-center justify-between">
        <button onClick={prevDay} className="p-2">
          <ChevronLeft className="w-5 h-5 text-content-secondary" />
        </button>
        <span className="font-semibold text-body-lg">
          {currentDate.getMonth() + 1}월 {currentDate.getDate()}일
          {isToday && <span className="text-primary text-body ml-1">(오늘)</span>}
        </span>
        <button onClick={nextDay} className="p-2">
          <ChevronRight className="w-5 h-5 text-content-secondary" />
        </button>
      </div>

      {/* 총 칼로리 요약 */}
      <div className="px-4 mt-3">
        <div className="bg-surface rounded-card p-4 shadow-card-soft flex items-center gap-4">
          <div className="w-12 h-12 bg-state-warning/10 rounded-xl flex items-center justify-center">
            <Flame className="w-6 h-6 text-state-warning" />
          </div>
          <div>
            <p className="text-caption text-content-tertiary">하루 총 칼로리</p>
            <p className="text-h1 font-bold">
              {totalCalories.toLocaleString()}<span className="text-body text-content-tertiary font-normal ml-1">kcal</span>
            </p>
          </div>
        </div>
      </div>

      {/* 끼니별 섹션 */}
      <div className="px-4 mt-4 pb-4 space-y-4">
        {logs === null ? (
          <div className="bg-surface rounded-card p-8 text-center text-body text-content-tertiary shadow-card-soft">
            불러오는 중...
          </div>
        ) : (
          MEAL_TYPES.map((meal) => {
            const entries = dayLog?.meals[meal] || [];
            const mealCalories = entries.reduce((s, e) => s + e.calories, 0);

            return (
              <div key={meal} className="bg-surface rounded-card p-4 shadow-card-soft">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-h4">{mealIcon[meal]}</span>
                    <h3 className="font-semibold text-body">{meal}</h3>
                    {mealCalories > 0 && (
                      <span className="text-caption text-content-tertiary">{mealCalories}kcal</span>
                    )}
                  </div>
                  <button
                    onClick={() => openAddModal(meal)}
                    className="p-1.5 bg-primary-light rounded-lg active:bg-primary/20 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-primary" />
                  </button>
                </div>

                {entries.length === 0 ? (
                  <p className="text-body text-content-tertiary text-center py-3">
                    음식을 추가해주세요
                  </p>
                ) : (
                  <div className="space-y-2">
                    {entries.map((entry) => (
                      <div key={entry.id} className="flex items-center gap-3 p-3 bg-surface-secondary rounded-card">
                        <div className="flex-1 min-w-0">
                          <p className="text-body font-medium truncate">{entry.name}</p>
                          <div className="flex flex-wrap items-center gap-2 text-caption text-content-tertiary">
                            <span>{entry.calories}kcal</span>
                            {entry.memo && <span>· {entry.memo}</span>}
                            {entry.photoName && <span>· 사진 {entry.photoName}</span>}
                          </div>
                        </div>
                        <button onClick={() => handleDeleteFood(meal, entry.id)} className="p-1">
                          <Trash2 className="w-4 h-4 text-content-tertiary" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 음식 추가 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="mobile-bottom-sheet relative bg-surface rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-surface px-5 pt-5 pb-3 border-b border-line flex items-center justify-between">
              <h2 className="font-bold text-h4">{selectedMeal} 추가</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-6 h-6 text-content-secondary" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* 음식명 */}
              <div>
                <label className="text-body font-medium text-content-secondary mb-2 block">음식명</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="예: 닭가슴살 샐러드"
                  className="w-full px-4 py-3 bg-surface-secondary rounded-input text-body border border-line focus:border-primary focus:outline-none"
                />
              </div>

              {/* 칼로리 */}
              <div>
                <label className="text-body font-medium text-content-secondary mb-2 block">칼로리 (kcal)</label>
                <input
                  type="number"
                  value={formCalories || ''}
                  onChange={(e) => setFormCalories(Number(e.target.value))}
                  placeholder="예: 350"
                  className="w-full px-4 py-3 bg-surface-secondary rounded-input text-body border border-line focus:border-primary focus:outline-none"
                />
              </div>

              {/* 사진 첨부 */}
              <div>
                <label className="text-body font-medium text-content-secondary mb-2 block">사진 첨부</label>
                <label className="w-full py-8 border-2 border-dashed border-line rounded-card flex flex-col items-center gap-2 text-content-tertiary active:bg-surface-secondary cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => setFormPhotoName(event.target.files?.[0]?.name ?? '')}
                  />
                  <Camera className="w-8 h-8" />
                  <span className="text-body">{formPhotoName ? '사진이 선택되었습니다' : '사진을 추가하세요'}</span>
                  <span className="max-w-full px-4 text-caption truncate">
                    {formPhotoName || '선택된 사진 없음'}
                  </span>
                </label>
              </div>

              {/* 메모 */}
              <div>
                <label className="text-body font-medium text-content-secondary mb-2 block">메모</label>
                <textarea
                  value={formMemo}
                  onChange={(e) => setFormMemo(e.target.value)}
                  placeholder="간단한 메모를 남겨보세요"
                  rows={2}
                  className="w-full px-4 py-3 bg-surface-secondary rounded-input text-body border border-line focus:border-primary focus:outline-none resize-none"
                />
              </div>

              {/* 저장 */}
              <Button fullWidth onClick={handleAddFood}>
                저장
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
