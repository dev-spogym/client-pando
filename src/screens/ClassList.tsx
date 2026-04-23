import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Dumbbell, Clock, MapPin, Sparkles, Users } from 'lucide-react';
import { getInstructorProfiles } from '@/lib/memberExperience';
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

type ClassFilter = 'ALL' | 'PT' | 'GX';

/** 수업 목록 / 예약 페이지 */
export default function ClassList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { member } = useAuthStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const filterOptions: readonly ClassFilter[] = ['ALL', 'PT', 'GX'];
  const searchType = searchParams.get('type')?.toUpperCase();
  const filter = filterOptions.includes(searchType as ClassFilter)
    ? (searchType as ClassFilter)
    : 'ALL';
  const ptInstructors = useMemo(() => getInstructorProfiles('PT'), []);

  // 주간 날짜 목록 생성 (오늘 기준 -1일 ~ +6일)
  const weekDates = Array.from({ length: 8 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i - 1);
    return d;
  });

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  useEffect(() => {
    if (!member) return;
    void fetchClasses();
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

  const handleFilterChange = (nextFilter: ClassFilter) => {
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
          {filterOptions.map((f) => (
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

      {filter === 'PT' && (
        <div className="px-4 pt-4">
          <div className="rounded-card border border-primary/15 bg-primary/8 p-4 text-left shadow-card">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="w-4 h-4" />
              <p className="text-sm font-semibold">트레이너 빈 시간으로 직접 요청</p>
            </div>
            <p className="mt-1 text-sm text-content-secondary">
              트레이너 일정에서 수업이 없는 시간을 자동 체크해 회원이 원하는 시간대로 PT를 요청할 수 있습니다.
            </p>
            <div className="mt-3 grid gap-2">
              {ptInstructors.map((instructor) => (
                <button
                  key={instructor.id}
                  onClick={() => navigate(`/instructors/${instructor.id}`)}
                  className="w-full rounded-xl bg-surface px-3 py-3 text-left"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{instructor.name} 트레이너</p>
                      <p className="mt-1 text-xs text-content-secondary truncate">
                        {instructor.specialties.join(' · ')}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-primary-light px-2 py-1 text-xs font-semibold text-primary">
                      요청하기
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
                          {cls.type === 'PT' ? '승인형 예약 가능' : `잔여 ${remaining}석`}
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
                      {isFull ? (cls.type === 'PT' ? '마감' : '대기 등록') : (cls.type === 'PT' ? '요청하기' : '예약하기')}
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
