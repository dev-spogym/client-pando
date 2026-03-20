import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QrCode, CalendarCheck, Trophy, Bell, ChevronRight,
  Dumbbell, Clock, MapPin, Flame, ClipboardList, BookOpen, UtensilsCrossed, Building2,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { cn, calcDday, formatTime, formatDateKo } from '@/lib/utils';

interface TodayClass {
  id: number;
  title: string;
  staffName: string;
  room: string | null;
  startTime: string;
  endTime: string;
  type: string;
}

interface NoticeItem {
  id: number;
  title: string;
  created_at: string;
}

/** 홈 대시보드 */
export default function Home() {
  const navigate = useNavigate();
  const { member } = useAuthStore();
  const [todayClasses, setTodayClasses] = useState<TodayClass[]>([]);
  const [monthAttendance, setMonthAttendance] = useState(0);
  const [attendanceDays, setAttendanceDays] = useState<Set<number>>(new Set());
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [noticeIndex, setNoticeIndex] = useState(0);

  useEffect(() => {
    if (!member) return;
    fetchDashboardData();
  }, [member]);

  // 공지 슬라이드 자동 전환
  useEffect(() => {
    if (notices.length <= 1) return;
    const timer = setInterval(() => {
      setNoticeIndex((prev) => (prev + 1) % notices.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [notices.length]);

  const fetchDashboardData = async () => {
    if (!member) return;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59).toISOString();

    // 오늘 예약 수업 조회
    const { data: classes } = await supabase
      .from('classes')
      .select('id, title, staffName, room, startTime, endTime, type')
      .eq('branchId', member.branchId)
      .gte('startTime', `${todayStr}T00:00:00`)
      .lte('startTime', `${todayStr}T23:59:59`)
      .order('startTime');

    if (classes) setTodayClasses(classes);

    // 이번 달 출석 조회
    const { data: attendance } = await supabase
      .from('attendance')
      .select('id, checkInAt')
      .eq('memberId', member.id)
      .gte('checkInAt', monthStart)
      .lte('checkInAt', monthEnd);

    if (attendance) {
      setMonthAttendance(attendance.length);
      const days = new Set(attendance.map((a) => new Date(a.checkInAt).getDate()));
      setAttendanceDays(days);
    }

    // 공지사항 조회
    const { data: noticeData } = await supabase
      .from('notices')
      .select('id, title, created_at')
      .eq('branch_id', member.branchId)
      .eq('is_published', true)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5);

    if (noticeData) setNotices(noticeData);
  };

  if (!member) return null;

  // D-day 계산
  const dday = member.membershipExpiry ? calcDday(member.membershipExpiry) : null;
  const ddayUrgent = dday !== null && dday <= 7;

  // 이번 달 달력 미니 히트맵 데이터
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  return (
    <div className="pull-to-refresh">
      {/* 상단 헤더 */}
      <header className="bg-primary px-5 pt-safe-top pb-6">
        <div className="pt-4 flex items-center justify-between mb-4">
          <div>
            <p className="text-white/80 text-sm">안녕하세요</p>
            <h1 className="text-white text-xl font-bold">{member.name}님 오늘도 화이팅!</h1>
          </div>
          <button
            onClick={() => navigate('/notices')}
            className="relative p-2"
          >
            <Bell className="w-6 h-6 text-white" />
            {notices.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-state-error rounded-full" />
            )}
          </button>
        </div>

        {/* QR 체크인 바로가기 */}
        <button
          onClick={() => navigate('/qr')}
          className="w-full bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 active:bg-white/30 transition-colors"
        >
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <QrCode className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-white font-semibold">QR 체크인</p>
            <p className="text-white/70 text-xs">QR코드를 스캔하여 출석하세요</p>
          </div>
          <ChevronRight className="w-5 h-5 text-white/60" />
        </button>
      </header>

      <div className="px-5 -mt-2 space-y-4 pb-4">
        {/* 바로가기 메뉴 */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: <ClipboardList className="w-6 h-6 text-primary" />, label: '운동일지', path: '/workout-log' },
            { icon: <BookOpen className="w-6 h-6 text-accent" />, label: '운동가이드', path: '/exercise-guide' },
            { icon: <UtensilsCrossed className="w-6 h-6 text-state-warning" />, label: '식단관리', path: '/diet' },
            { icon: <Building2 className="w-6 h-6 text-state-info" />, label: '센터정보', path: '/center' },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="bg-surface rounded-card p-3 shadow-card flex flex-col items-center gap-2 touch-card"
            >
              <div className="w-10 h-10 bg-surface-secondary rounded-xl flex items-center justify-center">
                {item.icon}
              </div>
              <span className="text-xs font-medium text-content-secondary">{item.label}</span>
            </button>
          ))}
        </div>

        {/* 이용권 D-day 카드 */}
        <div
          onClick={() => navigate('/membership')}
          className={cn(
            'bg-surface rounded-card p-4 shadow-card touch-card cursor-pointer',
            ddayUrgent && 'ring-2 ring-state-error'
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CreditCardIcon />
              <span className="font-semibold text-sm">이용권 현황</span>
            </div>
            {dday !== null && (
              <span className={cn(
                'text-sm font-bold',
                ddayUrgent ? 'text-state-error' : 'text-primary'
              )}>
                {dday > 0 ? `D-${dday}` : dday === 0 ? 'D-Day' : `D+${Math.abs(dday)}`}
              </span>
            )}
          </div>
          <p className="text-content-secondary text-sm">
            {member.membershipType || '이용권'}
            {member.membershipExpiry && (
              <span className="ml-2 text-content-tertiary">
                ~ {formatDateKo(member.membershipExpiry)}
              </span>
            )}
          </p>
          {dday !== null && dday > 0 && (
            <div className="mt-3 progress-bar">
              <div
                className={cn(
                  'progress-bar-fill',
                  ddayUrgent ? 'bg-state-error' : 'bg-primary'
                )}
                style={{
                  width: `${Math.max(100 - (dday / 365) * 100, 5)}%`,
                }}
              />
            </div>
          )}
        </div>


        {/* 오늘 예약 수업 */}
        <div className="bg-surface rounded-card p-4 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-primary" />
              <span className="font-semibold text-sm">오늘 수업</span>
            </div>
            <button
              onClick={() => navigate('/lessons')}
              className="text-xs text-primary font-medium flex items-center gap-0.5"
            >
              내 수업 <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {todayClasses.length === 0 ? (
            <div className="py-4 text-center text-content-tertiary text-sm">
              오늘 예정된 수업이 없습니다
            </div>
          ) : (
            <div className="space-y-2">
              {todayClasses.slice(0, 3).map((cls) => (
                <div
                  key={cls.id}
                  onClick={() => navigate(`/classes/${cls.id}`)}
                  className="flex items-center gap-3 p-3 bg-surface-secondary rounded-lg touch-card cursor-pointer"
                >
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    cls.type === 'PT' ? 'bg-primary-light' : 'bg-accent-light'
                  )}>
                    <Dumbbell className={cn(
                      'w-5 h-5',
                      cls.type === 'PT' ? 'text-primary' : 'text-accent'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{cls.title}</p>
                    <div className="flex items-center gap-2 text-xs text-content-secondary">
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
                  <span className={cn(
                    'text-xs px-2 py-1 rounded-full font-medium',
                    cls.type === 'PT' ? 'bg-primary-light text-primary' : 'bg-accent-light text-accent'
                  )}>
                    {cls.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 이번 달 출석 요약 (미니 캘린더 히트맵) */}
        <div className="bg-surface rounded-card p-4 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-state-warning" />
              <span className="font-semibold text-sm">이번 달 출석</span>
            </div>
            <button
              onClick={() => navigate('/attendance')}
              className="text-xs text-primary font-medium flex items-center gap-0.5"
            >
              상세보기 <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-8 h-8 text-state-warning" />
              <div>
                <p className="text-2xl font-bold text-content">{monthAttendance}일</p>
                <p className="text-xs text-content-tertiary">{today.getMonth() + 1}월 출석</p>
              </div>
            </div>
          </div>

          {/* 미니 캘린더 히트맵 */}
          <div className="grid grid-cols-7 gap-1">
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <div key={day} className="text-center text-[10px] text-content-tertiary py-1">{day}</div>
            ))}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = day === today.getDate();
              const hasAttendance = attendanceDays.has(day);
              const isFuture = day > today.getDate();

              return (
                <div
                  key={day}
                  className={cn(
                    'aspect-square rounded-md flex items-center justify-center text-[11px]',
                    hasAttendance && 'bg-primary text-white font-bold',
                    isToday && !hasAttendance && 'ring-1 ring-primary text-primary font-bold',
                    !hasAttendance && !isToday && !isFuture && 'text-content-secondary',
                    isFuture && 'text-content-tertiary/40',
                  )}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        {/* 공지사항 배너 */}
        {notices.length > 0 && (
          <div
            onClick={() => navigate('/notices')}
            className="bg-surface rounded-card p-4 shadow-card touch-card cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-state-info/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bell className="w-4 h-4 text-state-info" />
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-xs text-content-tertiary mb-0.5">공지사항</p>
                <p className="text-sm font-medium truncate">{notices[noticeIndex]?.title}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-content-tertiary flex-shrink-0" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** 카드 아이콘 컴포넌트 */
function CreditCardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}
