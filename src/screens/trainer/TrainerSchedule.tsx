import { useEffect, useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, X, Users, Clock, MapPin } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import {
  appendPreviewTrainerClass,
  getPreviewSearchParam,
  getPreviewTrainerClassesForRange,
  isPreviewMode,
} from '@/lib/preview';
import { supabase } from '@/lib/supabase';
import { cn, formatTime } from '@/lib/utils';
import { toast } from 'sonner';

interface ClassItem {
  id: number;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  room: string | null;
  capacity: number;
  booked: number;
}

/** 트레이너 - 주간 일정 */
export default function TrainerSchedule() {
  const { trainer } = useAuthStore();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1); // 월요일 기준
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  const [showModal, setShowModal] = useState(false);

  // 수업 추가 폼
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<'PT' | 'GX'>('PT');
  const [formDate, setFormDate] = useState('');
  const [formStartTime, setFormStartTime] = useState('09:00');
  const [formEndTime, setFormEndTime] = useState('10:00');
  const [formRoom, setFormRoom] = useState('');
  const [formCapacity, setFormCapacity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!trainer) return;
    fetchClasses();
  }, [trainer, weekStart]);

  useEffect(() => {
    if (!isPreviewMode()) return;
    if (getPreviewSearchParam('modal') === 'add') {
      setShowModal(true);
    }
  }, []);

  const fetchClasses = async () => {
    if (!trainer) return;

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    if (isPreviewMode()) {
      setClasses(getPreviewTrainerClassesForRange(weekStart.toISOString(), weekEnd.toISOString()));
      return;
    }

    const { data } = await supabase
      .from('classes')
      .select('id, title, type, startTime, endTime, room, capacity, booked')
      .eq('branchId', trainer.branchId)
      .eq('staffId', trainer.staffId)
      .gte('startTime', weekStart.toISOString())
      .lt('startTime', weekEnd.toISOString())
      .order('startTime');

    if (data) setClasses(data);
  };

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  // 요일 이름 및 날짜 배열
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
  const dayNames = ['월', '화', '수', '목', '금', '토', '일'];

  // 선택된 날짜의 수업 필터
  const selectedDate = days[selectedDay];
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const dayClasses = classes.filter((c) => c.startTime.startsWith(selectedDateStr));

  const openAddModal = () => {
    setFormTitle('');
    setFormType('PT');
    setFormDate(selectedDateStr);
    setFormStartTime('09:00');
    setFormEndTime('10:00');
    setFormRoom('');
    setFormCapacity(1);
    setShowModal(true);
  };

  const submitClass = async () => {
    if (!trainer || !formTitle || !formDate) return;
    setSubmitting(true);

    const startTime = `${formDate}T${formStartTime}:00`;
    const endTime = `${formDate}T${formEndTime}:00`;

    if (isPreviewMode()) {
      appendPreviewTrainerClass({
        title: formTitle,
        type: formType,
        startTime,
        endTime,
        room: formRoom || null,
        capacity: formCapacity,
        booked: 0,
        branchId: trainer.branchId,
        staffId: trainer.staffId,
        staffName: trainer.staffName || trainer.name,
      });
      toast.success('수업이 추가되었습니다.');
      setShowModal(false);
      setSubmitting(false);
      fetchClasses();
      return;
    }

    const { error } = await supabase.from('classes').insert({
      title: formTitle,
      type: formType,
      staffId: trainer.staffId,
      staffName: trainer.staffName || trainer.name,
      startTime,
      endTime,
      room: formRoom || null,
      capacity: formCapacity,
      booked: 0,
      branchId: trainer.branchId,
    });

    if (error) {
      toast.error('수업 추가에 실패했습니다.');
    } else {
      toast.success('수업이 추가되었습니다.');
      setShowModal(false);
      fetchClasses();
    }
    setSubmitting(false);
  };

  const isToday = (d: Date) => {
    const today = new Date();
    return d.toDateString() === today.toDateString();
  };

  // 주 표시 텍스트
  const weekLabel = `${weekStart.getMonth() + 1}월 ${weekStart.getDate()}일 ~ ${days[6].getMonth() + 1}월 ${days[6].getDate()}일`;

  return (
    <div className="pull-to-refresh">
      {/* 헤더 */}
      <header className="bg-gradient-to-br from-teal-600 to-emerald-600 px-5 pt-safe-top pb-4">
        <div className="pt-4 flex items-center justify-between">
          <h1 className="text-white text-lg font-bold">일정 관리</h1>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-lg text-white text-sm"
          >
            <Plus className="w-4 h-4" /> 수업 추가
          </button>
        </div>
      </header>

      <div className="px-5 py-4 space-y-4">
        {/* 주간 네비게이션 */}
        <div className="flex items-center justify-between">
          <button onClick={prevWeek} className="p-2 text-content-secondary">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold">{weekLabel}</span>
          <button onClick={nextWeek} className="p-2 text-content-secondary">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* 요일 선택 */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => (
            <button
              key={i}
              onClick={() => setSelectedDay(i)}
              className={cn(
                'flex flex-col items-center py-2 rounded-xl transition-colors',
                selectedDay === i ? 'bg-teal-600 text-white' : 'text-content-secondary',
                isToday(d) && selectedDay !== i && 'ring-1 ring-teal-400'
              )}
            >
              <span className="text-[10px]">{dayNames[i]}</span>
              <span className="text-sm font-bold mt-0.5">{d.getDate()}</span>
            </button>
          ))}
        </div>

        {/* 수업 목록 */}
        {dayClasses.length === 0 ? (
          <div className="py-12 text-center text-content-tertiary text-sm">
            이 날에 예정된 수업이 없습니다
          </div>
        ) : (
          <div className="space-y-3">
            {dayClasses.map((cls) => (
              <div key={cls.id} className="bg-surface rounded-card p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    cls.type === 'PT' ? 'bg-teal-50' : 'bg-emerald-50'
                  )}>
                    <span className={cn(
                      'text-xs font-bold',
                      cls.type === 'PT' ? 'text-teal-600' : 'text-emerald-600'
                    )}>
                      {cls.type}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{cls.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-content-secondary">
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                      </span>
                      {cls.room && (
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" />
                          {cls.room}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-content-secondary">
                    <Users className="w-3 h-3" />
                    <span>{cls.booked}/{cls.capacity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 수업 추가 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="mobile-bottom-sheet relative bg-surface rounded-t-2xl p-5 pb-10 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">수업 추가</h2>
              <button onClick={() => setShowModal(false)} className="text-content-tertiary">
                <X className="w-6 h-6" />
              </button>
            </div>

            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="수업명"
              className="w-full px-3 py-3 rounded-xl border border-line text-sm focus:outline-none focus:border-teal-500"
            />

            <div className="flex gap-2">
              {(['PT', 'GX'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFormType(t)}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    formType === t ? 'bg-teal-600 text-white' : 'bg-surface-secondary text-content-secondary'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full px-3 py-3 rounded-xl border border-line text-sm focus:outline-none focus:border-teal-500"
            />

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-content-secondary mb-1 block">시작 시간</label>
                <input
                  type="time"
                  value={formStartTime}
                  onChange={(e) => setFormStartTime(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl border border-line text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-content-secondary mb-1 block">종료 시간</label>
                <input
                  type="time"
                  value={formEndTime}
                  onChange={(e) => setFormEndTime(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl border border-line text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <input
              type="text"
              value={formRoom}
              onChange={(e) => setFormRoom(e.target.value)}
              placeholder="장소 (선택)"
              className="w-full px-3 py-3 rounded-xl border border-line text-sm focus:outline-none focus:border-teal-500"
            />

            <div>
              <label className="text-xs text-content-secondary mb-1 block">정원</label>
              <input
                type="number"
                min={1}
                value={formCapacity}
                onChange={(e) => setFormCapacity(Number(e.target.value))}
                className="w-full px-3 py-3 rounded-xl border border-line text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            <button
              onClick={submitClass}
              disabled={submitting || !formTitle}
              className={cn(
                'w-full py-3 rounded-xl font-semibold text-sm text-white',
                'bg-teal-600 active:bg-teal-700 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {submitting ? '추가 중...' : '수업 추가'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
