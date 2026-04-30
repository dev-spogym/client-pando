import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Dumbbell, Clock, MapPin, Sparkles, Users } from 'lucide-react';
import { getInstructorProfiles } from '@/lib/memberExperience';
import { useAuthStore } from '@/stores/authStore';
import { getPreviewClassesForDate, isPreviewMode } from '@/lib/preview';
import { supabase } from '@/lib/supabase';
import { cn, formatTime } from '@/lib/utils';
import { Badge, Button, Card, Chip, EmptyState } from '@/components/ui';

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

type ClassFilter = 'ALL' | 'PT' | 'GX' | 'PILATES' | 'YOGA' | 'GOLF' | 'CROSSFIT' | 'SPINNING';

const FILTER_OPTIONS: readonly ClassFilter[] = ['ALL', 'PT', 'GX', 'PILATES', 'YOGA', 'GOLF', 'CROSSFIT', 'SPINNING'];

const FILTER_LABELS: Record<ClassFilter, string> = {
  ALL: '전체',
  PT: 'PT',
  GX: 'GX',
  PILATES: '필라테스',
  YOGA: '요가',
  GOLF: '골프',
  CROSSFIT: '크로스핏',
  SPINNING: '스피닝',
};

/** 수업 type을 ClassFilter로 매핑 (supabase의 GX 안에 필라테스/요가/스피닝 등이 섞여 들어오는 경우 title 기반 추론) */
function inferFilterFromClass(cls: ClassItem): ClassFilter {
  const upper = cls.type?.toUpperCase() || '';
  if (FILTER_OPTIONS.includes(upper as ClassFilter)) return upper as ClassFilter;
  const title = cls.title || '';
  if (title.includes('필라테스')) return 'PILATES';
  if (title.includes('요가')) return 'YOGA';
  if (title.includes('골프')) return 'GOLF';
  if (title.includes('크로스')) return 'CROSSFIT';
  if (title.includes('스피닝')) return 'SPINNING';
  return upper === 'PT' ? 'PT' : 'GX';
}

/** 수업 목록 / 예약 페이지 */
export default function ClassList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { member } = useAuthStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const searchType = searchParams.get('type')?.toUpperCase();
  const filter: ClassFilter = FILTER_OPTIONS.includes(searchType as ClassFilter)
    ? (searchType as ClassFilter)
    : 'ALL';
  const ptInstructors = useMemo(() => getInstructorProfiles('PT'), []);

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
      // preview는 PT/GX만 직접 매칭. 그 외 종목은 ALL로 가져온 뒤 클라이언트 필터링
      const previewFilter = filter === 'PT' || filter === 'GX' ? filter : 'ALL';
      const list = getPreviewClassesForDate(dateStr, previewFilter);
      const finalList = filter === 'ALL' || filter === 'PT' || filter === 'GX'
        ? list
        : list.filter((c) => inferFilterFromClass(c) === filter);
      setClasses(finalList);
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

    // supabase classes.type은 PT / GX 만 저장. 그 외 종목은 GX 안에서 클라이언트 필터링
    if (filter === 'PT' || filter === 'GX') {
      query = query.eq('type', filter);
    } else if (filter !== 'ALL') {
      query = query.eq('type', 'GX');
    }

    const { data } = await query;
    const filtered = filter === 'ALL' || filter === 'PT' || filter === 'GX'
      ? (data || [])
      : (data || []).filter((c) => inferFilterFromClass(c as ClassItem) === filter);
    setClasses(filtered);
    setLoading(false);
  };

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

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
      <header className="bg-surface sticky top-0 z-20 border-b border-line">
        <div className="px-5 pt-safe-top">
          <h1 className="text-h2 py-4">수업 예약</h1>
        </div>

        {/* 주간 날짜 스크롤 */}
        <div ref={scrollRef} className="flex gap-1.5 px-4 pb-3 overflow-x-auto no-scrollbar">
          {weekDates.map((date) => {
            const selected = isSameDay(date, selectedDate);
            const today = isToday(date);
            return (
              <button
                key={date.toISOString()}
                type="button"
                onClick={() => setSelectedDate(new Date(date))}
                className={cn(
                  'flex flex-col items-center min-w-[52px] py-2.5 px-2 rounded-card transition-colors ease-out-soft',
                  selected
                    ? 'bg-primary text-white shadow-card-soft'
                    : today
                      ? 'bg-primary-light text-primary'
                      : 'bg-surface text-content-secondary'
                )}
              >
                <span className={cn('text-micro font-medium', selected ? 'text-white/80' : 'opacity-80')}>
                  {dayNames[date.getDay()]}
                </span>
                <span className={cn('text-h3 font-bold mt-0.5')}>{date.getDate()}</span>
              </button>
            );
          })}
        </div>

        {/* 필터 칩 (가로 스크롤) */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
          {FILTER_OPTIONS.map((f) => (
            <Chip key={f} active={filter === f} size="md" onClick={() => handleFilterChange(f)}>
              {FILTER_LABELS[f]}
            </Chip>
          ))}
        </div>
      </header>

      {filter === 'PT' && (
        <div className="px-4 pt-4">
          <Card className="border border-primary/20 bg-primary-light/40">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="w-4 h-4" />
              <p className="text-body-sm font-semibold">트레이너 빈 시간으로 직접 요청</p>
            </div>
            <p className="mt-1 text-body-sm text-content-secondary">
              트레이너 일정에서 수업이 없는 시간을 자동 체크해 회원이 원하는 시간대로 PT를 요청할 수 있습니다.
            </p>
            <div className="mt-3 grid gap-2">
              {ptInstructors.map((instructor) => (
                <button
                  key={instructor.id}
                  type="button"
                  onClick={() => navigate(`/instructors/${instructor.id}`)}
                  className="w-full rounded-card bg-surface px-3 py-3 text-left active:bg-surface-secondary transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-body-sm font-semibold text-content">{instructor.name} 트레이너</p>
                      <p className="mt-1 text-caption text-content-secondary truncate">
                        {instructor.specialties.join(' · ')}
                      </p>
                    </div>
                    <Badge tone="primary" variant="soft" size="md">
                      요청하기
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* 수업 리스트 */}
      <div className="px-4 pb-4 mt-3">
        {loading ? (
          <div className="text-center py-12 text-content-tertiary text-body-sm">불러오는 중…</div>
        ) : classes.length === 0 ? (
          <EmptyState
            icon={<Dumbbell className="w-8 h-8" />}
            title="예정된 수업이 없습니다"
            description="다른 날짜를 선택하거나 필터를 바꿔보세요."
          />
        ) : (
          <div className="space-y-3">
            {classes.map((cls) => {
              const isFull = cls.booked >= cls.capacity;
              const remaining = cls.capacity - cls.booked;

              return (
                <Card key={cls.id} interactive onClick={() => navigate(`/classes/${cls.id}`)}>
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-card flex items-center justify-center flex-shrink-0',
                        cls.type === 'PT' ? 'bg-primary-light' : 'bg-accent-light'
                      )}
                    >
                      <Dumbbell
                        className={cn('w-6 h-6', cls.type === 'PT' ? 'text-primary' : 'text-accent-dark')}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-body font-semibold text-content truncate">{cls.title}</h3>
                        <Badge
                          tone={cls.type === 'PT' ? 'primary' : 'accent'}
                          variant="soft"
                          size="sm"
                        >
                          {cls.type}
                        </Badge>
                      </div>
                      <p className="text-body-sm text-content-secondary mb-2">{cls.staffName} 강사</p>
                      <div className="flex items-center gap-3 text-caption text-content-tertiary flex-wrap">
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

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {!isFull && (
                        <span className="text-caption text-state-success font-medium">
                          {cls.type === 'PT' ? '승인형 예약 가능' : `잔여 ${remaining}석`}
                        </span>
                      )}
                      {isFull && <span className="text-caption text-state-error font-medium">마감</span>}
                    </div>
                    <Button
                      variant={isFull ? 'tertiary' : 'primary'}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/classes/${cls.id}`);
                      }}
                    >
                      {isFull
                        ? cls.type === 'PT'
                          ? '마감'
                          : '대기 등록'
                        : cls.type === 'PT'
                          ? '요청하기'
                          : '예약하기'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
