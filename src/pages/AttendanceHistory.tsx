import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { cn, formatTime } from '@/lib/utils';

interface AttendanceRecord {
  id: number;
  checkInAt: string;
  checkOutAt: string | null;
  type: string;
  checkInMethod: string;
}

/** 출석 이력 페이지 (월별 캘린더 + 리스트) */
export default function AttendanceHistory() {
  const navigate = useNavigate();
  const { member } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    if (!member) return;
    fetchAttendance();
  }, [member, year, month]);

  const fetchAttendance = async () => {
    if (!member) return;
    setLoading(true);

    const start = new Date(year, month, 1).toISOString();
    const end = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

    const { data } = await supabase
      .from('attendance')
      .select('id, checkInAt, checkOutAt, type, checkInMethod')
      .eq('memberId', member.id)
      .gte('checkInAt', start)
      .lte('checkInAt', end)
      .order('checkInAt', { ascending: false });

    setRecords(data || []);
    setLoading(false);
  };

  const attendanceDays = new Set(
    records.map((r) => new Date(r.checkInAt).getDate())
  );

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const today = new Date();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const typeLabel: Record<string, string> = {
    REGULAR: '일반',
    PT: 'PT',
    GX: 'GX',
    MANUAL: '수동',
  };

  const methodLabel: Record<string, string> = {
    KIOSK: '키오스크',
    APP: '앱',
    MANUAL: '수동',
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* 헤더 */}
      <header className="bg-surface sticky top-0 z-10 border-b border-line">
        <div className="flex items-center px-4 pt-safe-top h-14">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-content" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-lg">출석 이력</h1>
          <div className="w-6" />
        </div>
      </header>

      {/* 월 선택 */}
      <div className="bg-surface px-4 py-3 flex items-center justify-between">
        <button onClick={prevMonth} className="p-2">
          <ChevronLeft className="w-5 h-5 text-content-secondary" />
        </button>
        <span className="font-semibold text-base">
          {year}년 {month + 1}월
        </span>
        <button onClick={nextMonth} className="p-2">
          <ChevronRight className="w-5 h-5 text-content-secondary" />
        </button>
      </div>

      {/* 캘린더 */}
      <div className="bg-surface px-4 pb-4">
        <div className="grid grid-cols-7 gap-1">
          {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
            <div key={day} className={cn(
              'text-center text-xs py-2 font-medium',
              i === 0 ? 'text-state-error' : i === 6 ? 'text-primary' : 'text-content-secondary'
            )}>{day}</div>
          ))}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`e-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const hasAttendance = attendanceDays.has(day);
            const dayOfWeek = new Date(year, month, day).getDay();

            return (
              <div
                key={day}
                className={cn(
                  'aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative',
                  hasAttendance && 'bg-primary text-white font-bold',
                  isToday && !hasAttendance && 'ring-2 ring-primary',
                  !hasAttendance && dayOfWeek === 0 && 'text-state-error/60',
                  !hasAttendance && dayOfWeek === 6 && 'text-primary/60',
                )}
              >
                {day}
                {hasAttendance && (
                  <div className="w-1 h-1 bg-white rounded-full mt-0.5" />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-content-secondary">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-primary rounded" /> 출석
          </span>
          <span>이번 달 총 <strong className="text-primary">{records.length}</strong>회</span>
        </div>
      </div>

      {/* 출석 리스트 */}
      <div className="px-4 mt-2 pb-4">
        <h3 className="font-semibold text-sm mb-3 text-content-secondary">출석 기록</h3>
        {loading ? (
          <div className="text-center py-8 text-content-tertiary text-sm">불러오는 중...</div>
        ) : records.length === 0 ? (
          <div className="text-center py-8 text-content-tertiary text-sm">이번 달 출석 기록이 없습니다.</div>
        ) : (
          <div className="space-y-2">
            {records.map((record) => {
              const checkIn = new Date(record.checkInAt);
              const checkOut = record.checkOutAt ? new Date(record.checkOutAt) : null;
              const duration = checkOut
                ? Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60))
                : null;

              return (
                <div key={record.id} className="bg-surface rounded-lg p-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">{checkIn.getDate()}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {formatTime(record.checkInAt)}
                        {checkOut && ` - ${formatTime(record.checkOutAt!)}`}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-surface-tertiary rounded text-content-secondary">
                        {typeLabel[record.type] || record.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-content-tertiary mt-0.5">
                      <span>{methodLabel[record.checkInMethod] || record.checkInMethod}</span>
                      {duration && (
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {duration}분
                        </span>
                      )}
                    </div>
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
