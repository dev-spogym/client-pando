import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ChevronLeft, ChevronRight, Plus, X, Flame, Camera, Trash2,
} from 'lucide-react';

type MealType = '아침' | '점심' | '저녁' | '간식';

const MEAL_TYPES: MealType[] = ['아침', '점심', '저녁', '간식'];

interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  memo: string;
}

interface MealLog {
  [key: string]: FoodEntry[]; // meal type -> entries
}

interface DayDietLog {
  date: string;
  meals: MealLog;
}

const STORAGE_KEY = 'spogym-diet-logs';

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

  const dateStr = getDateStr(currentDate);
  const dayLog = logs?.[dateStr];

  useEffect(() => {
    setLogs(loadLogs());
  }, []);

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
  };

  const handleAddFood = () => {
    if (!formName.trim() || !logs) return;

    const newEntry: FoodEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: formName.trim(),
      calories: formCalories,
      memo: formMemo.trim(),
    };

    const updated = { ...logs };
    if (!updated[dateStr]) {
      updated[dateStr] = { date: dateStr, meals: {} };
    }
    if (!updated[dateStr].meals[selectedMeal]) {
      updated[dateStr].meals[selectedMeal] = [];
    }
    updated[dateStr].meals[selectedMeal].push(newEntry);
    setLogs(updated);
    saveLogs(updated);
    setShowModal(false);
    resetForm();
  };

  const handleDeleteFood = (meal: MealType, entryId: string) => {
    if (!logs) return;

    const updated = { ...logs };
    if (updated[dateStr]?.meals[meal]) {
      updated[dateStr].meals[meal] = updated[dateStr].meals[meal].filter((e) => e.id !== entryId);
      if (updated[dateStr].meals[meal].length === 0) {
        delete updated[dateStr].meals[meal];
      }
      // 모든 끼니가 비었으면 날짜 삭제
      if (Object.keys(updated[dateStr].meals).length === 0) {
        delete updated[dateStr];
      }
      setLogs(updated);
      saveLogs(updated);
    }
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
      {/* 헤더 */}
      <header className="bg-surface sticky top-0 z-10 border-b border-line">
        <div className="flex items-center px-4 pt-safe-top h-14">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-content" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-lg">식단 관리</h1>
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

      {/* 총 칼로리 요약 */}
      <div className="px-4 mt-3">
        <div className="bg-surface rounded-card p-4 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 bg-state-warning/10 rounded-xl flex items-center justify-center">
            <Flame className="w-6 h-6 text-state-warning" />
          </div>
          <div>
            <p className="text-xs text-content-tertiary">하루 총 칼로리</p>
            <p className="text-2xl font-bold">
              {totalCalories.toLocaleString()}<span className="text-sm text-content-tertiary font-normal ml-1">kcal</span>
            </p>
          </div>
        </div>
      </div>

      {/* 끼니별 섹션 */}
      <div className="px-4 mt-4 pb-4 space-y-4">
        {logs === null ? (
          <div className="bg-surface rounded-card p-8 text-center text-sm text-content-tertiary shadow-card">
            불러오는 중...
          </div>
        ) : (
          MEAL_TYPES.map((meal) => {
            const entries = dayLog?.meals[meal] || [];
            const mealCalories = entries.reduce((s, e) => s + e.calories, 0);

            return (
              <div key={meal} className="bg-surface rounded-card p-4 shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{mealIcon[meal]}</span>
                    <h3 className="font-semibold text-sm">{meal}</h3>
                    {mealCalories > 0 && (
                      <span className="text-xs text-content-tertiary">{mealCalories}kcal</span>
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
                  <p className="text-sm text-content-tertiary text-center py-3">
                    음식을 추가해주세요
                  </p>
                ) : (
                  <div className="space-y-2">
                    {entries.map((entry) => (
                      <div key={entry.id} className="flex items-center gap-3 p-3 bg-surface-secondary rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{entry.name}</p>
                          <div className="flex items-center gap-2 text-xs text-content-tertiary">
                            <span>{entry.calories}kcal</span>
                            {entry.memo && <span>· {entry.memo}</span>}
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
              <h2 className="font-bold text-lg">{selectedMeal} 추가</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-6 h-6 text-content-secondary" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* 음식명 */}
              <div>
                <label className="text-sm font-medium text-content-secondary mb-2 block">음식명</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="예: 닭가슴살 샐러드"
                  className="w-full px-4 py-3 bg-surface-secondary rounded-xl text-sm border border-line focus:border-primary focus:outline-none"
                />
              </div>

              {/* 칼로리 */}
              <div>
                <label className="text-sm font-medium text-content-secondary mb-2 block">칼로리 (kcal)</label>
                <input
                  type="number"
                  value={formCalories || ''}
                  onChange={(e) => setFormCalories(Number(e.target.value))}
                  placeholder="예: 350"
                  className="w-full px-4 py-3 bg-surface-secondary rounded-xl text-sm border border-line focus:border-primary focus:outline-none"
                />
              </div>

              {/* 사진 첨부 (placeholder) */}
              <div>
                <label className="text-sm font-medium text-content-secondary mb-2 block">사진 첨부</label>
                <button className="w-full py-8 border-2 border-dashed border-line rounded-xl flex flex-col items-center gap-2 text-content-tertiary active:bg-surface-secondary">
                  <Camera className="w-8 h-8" />
                  <span className="text-sm">사진을 추가하세요</span>
                  <span className="text-xs">(준비 중)</span>
                </button>
              </div>

              {/* 메모 */}
              <div>
                <label className="text-sm font-medium text-content-secondary mb-2 block">메모</label>
                <textarea
                  value={formMemo}
                  onChange={(e) => setFormMemo(e.target.value)}
                  placeholder="간단한 메모를 남겨보세요"
                  rows={2}
                  className="w-full px-4 py-3 bg-surface-secondary rounded-xl text-sm border border-line focus:border-primary focus:outline-none resize-none"
                />
              </div>

              {/* 저장 */}
              <button
                onClick={handleAddFood}
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
