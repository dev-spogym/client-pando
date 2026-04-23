import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Dumbbell, Clock, MapPin, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getPreviewClassesForDate, isPreviewMode } from '@/lib/preview';
import { supabase } from '@/lib/supabase';
import { cn, formatTime } from '@/lib/utils';

interface ClassItem {
  id: number;
  title: string;
  type: string;
  staffName: string;
  room: string | null;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
}

/** 수업 목록 / 예약 페이지 */
export default function ClassList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { member } = useAuthStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState<'ALL' | 'PT' | 'GX'>('ALL');
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialType = searchParams.get('type');
    if (initialType === 'PT' || initialType === 'GX' || initialType === 'ALL') {
      setFilter(initialType);
    }
  }, [searchParams]);

  // 주간 날짜 목록 생성 (오늘 기준 -1일 ~ +6일)
  const weekDates = Array.from({ length: 8 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i - 1);
    return d;
  });

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  useEffect(() => {
    if (!member) return;
    fetchClasses();
  }, [member, selectedDate, filter]);

  const fetchClasses = async () => {
    if (!member) return;
    setLoading(true);

    const dateStr = selectedDate.toISOString().split('T')[0];

    if (isPreviewMode()) {
      setClasses(getPreviewClassesForDate(dateStr, filter));
      setLoading(false);
      return;
    }

    let query = supabase
      .from('classes')
      .select('id, title, type, staffName, room, startTime, endTime, capacity, booked')
      .eq('branchId', member.branchId)
      .gte('startTime', `${dateStr}T00:00:00`)
      .lte('startTime', `${dateStr}T23:59:59`)
      .order('startTime');

    if (filter !== 'ALL') {
      query = query.eq('type', filter);
    }

    const { data } = await query;
    setClasses(data || []);
    setLoading(false);
  };

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const isToday = (d: Date) => isSameDay(d, new Date());

  const handleFilterChange = (nextFilter: 'ALL' | 'PT' | 'GX') => {
    setFilter(nextFilter);
    const nextParams = new URLSearchParams(searchParams);
    if (nextFilter === 'ALL') nextParams.delete('type');
    else nextParams.set('type', nextFilter);
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* 헤더 */}
      <header className="bg-surface sticky top-0 z-10">
        <div className="px-5 pt-safe-top">
          <h1 className="text-xl font-bold py-4">수업 예약</h1>
        </div>

        {/* 주간 날짜 스크롤 */}
        <div
          ref={scrollRef}
          className="flex gap-1 px-4 pb-3 overflow-x-auto no-scrollbar"
        >
          {weekDates.map((date) => {
            const selected = isSameDay(date, selectedDate);
            const today = isToday(date);
            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(new Date(date))}
                className={cn(
                  'flex flex-col items-center min-w-[48px] py-2 px-2 rounded-xl transition-colors',
                  selected ? 'bg-primary text-white' : 'text-content-secondary',
                  today && !selected && 'bg-primary-light'
                )}
              >
                <span className={cn('text-[10px]', selected && 'text-white/80')}>
                  {dayNames[date.getDay()]}
                </span>
                <span className={cn('text-lg font-bold mt-0.5', selected && 'text-white')}>
                  {date.getDate()}
                </span>
              </button>
            );
          })}
        </div>

        {/* 필터 탭 */}
        <div className="flex gap-2 px-4 pb-3">
          {(['ALL', 'PT', 'GX'] as const).map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                filter === f
                  ? 'bg-primary text-white'
                  : 'bg-surface-tertiary text-content-secondary'
              )}
            >
              {f === 'ALL' ? '전체' : f}
            </button>
          ))}
        </div>
      </header>

      {/* 수업 리스트 */}
      <div className="px-4 pb-4 mt-2">
        {loading ? (
          <div className="text-center py-12 text-content-tertiary text-sm">불러오는 중...</div>
        ) : classes.length === 0 ? (
          <div className="text-center py-12">
            <Dumbbell className="w-12 h-12 text-content-tertiary/30 mx-auto mb-3" />
            <p className="text-content-tertiary text-sm">해당 날짜에 예정된 수업이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {classes.map((cls) => {
              const isFull = cls.booked >= cls.capacity;
              const remaining = cls.capacity - cls.booked;

              return (
                <div
                  key={cls.id}
                  onClick={() => navigate(`/classes/${cls.id}`)}
                  className="bg-surface rounded-card p-4 shadow-card touch-card cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                      cls.type === 'PT' ? 'bg-primary-light' : 'bg-accent-light'
                    )}>
                      <Dumbbell className={cn(
                        'w-6 h-6',
                        cls.type === 'PT' ? 'text-primary' : 'text-accent'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-base truncate">{cls.title}</h3>
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0',
                          cls.type === 'PT' ? 'bg-primary-light text-primary' : 'bg-accent-light text-accent'
                        )}>
                          {cls.type}
                        </span>
                      </div>
                      <p className="text-sm text-content-secondary mb-2">{cls.staffName} 강사</p>
                      <div className="flex items-center gap-3 text-xs text-content-tertiary">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                        </span>
                        {cls.room && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {cls.room}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {cls.booked}/{cls.capacity}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 예약 상태 */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {!isFull && (
                        <span className="text-xs text-state-success font-medium">
                          잔여 {remaining}석
                        </span>
                      )}
                      {isFull && (
                        <span className="text-xs text-state-error font-medium">마감</span>
                      )}
                    </div>
                    <button
                      className={cn(
                        'px-4 py-1.5 rounded-button text-sm font-medium',
                        isFull
                          ? 'bg-surface-tertiary text-content-secondary'
                          : 'bg-primary text-white active:bg-primary-dark'
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/classes/${cls.id}`);
                      }}
                    >
                      {isFull ? '대기 등록' : '예약하기'}
                    </button>
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
