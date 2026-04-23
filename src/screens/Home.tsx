import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  Building2,
  CalendarCheck,
  ChevronRight,
  ClipboardList,
  Clock,
  Coins,
  Dumbbell,
  Flame,
  MapPin,
  QrCode,
  Trophy,
  UtensilsCrossed,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import {
  getPreviewAttendanceRecords,
  getPreviewBodyRecords,
  getPreviewNotices,
  getPreviewTodayClasses,
  isPreviewMode,
} from '@/lib/preview';
import { supabase } from '@/lib/supabase';
import {
  buildBadgeCollection,
  buildRoutineSuggestion,
  getFeedbackEntries,
  getUnreadNotificationCount,
  loadOnboarding,
} from '@/lib/memberExperience';
import { calcDday, cn, formatDateKo, formatTime } from '@/lib/utils';

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
  const [attendanceTypes, setAttendanceTypes] = useState<Map<number, string>>(new Map());
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [noticeIndex, setNoticeIndex] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [rewardBadgeCount, setRewardBadgeCount] = useState(0);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [routineTitle, setRoutineTitle] = useState('운동 목적을 입력하고 첫 루틴을 추천받아보세요.');

  useEffect(() => {
    if (!member) return;
    fetchDashboardData();
  }, [member]);

  useEffect(() => {
    if (notices.length <= 1) return;
    const timer = setInterval(() => {
      setNoticeIndex((prev) => (prev + 1) % notices.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [notices.length]);

  const fetchDashboardData = async () => {
    if (!member) return;

    if (isPreviewMode()) {
      const attendance = getPreviewAttendanceRecords();
      const onboarding = loadOnboarding(member.id);
      const routine = buildRoutineSuggestion(onboarding);
      const earnedBadges = buildBadgeCollection({
        mileage: member.mileage,
        onboardingComplete: Boolean(onboarding.completedAt),
        feedbackCount: getFeedbackEntries(member.id).length,
        attendanceCount: attendance.length,
        bodyRecordCount: getPreviewBodyRecords().length,
      }).filter((item) => item.earned);

      setTodayClasses(getPreviewTodayClasses());
      setMonthAttendance(attendance.length);
      setAttendanceDays(new Set(attendance.map((item) => new Date(item.checkInAt).getDate())));
      const typeMap = new Map<number, string>();
      attendance.forEach((item) => {
        typeMap.set(new Date(item.checkInAt).getDate(), item.type || 'REGULAR');
      });
      setAttendanceTypes(typeMap);
      setNotices(
        getPreviewNotices().map((item) => ({
          id: item.id,
          title: item.title,
          created_at: item.created_at,
        }))
      );
      setNotificationCount(getUnreadNotificationCount(member));
      setRewardBadgeCount(earnedBadges.length);
      setOnboardingComplete(Boolean(onboarding.completedAt));
      setRoutineTitle(onboarding.recommendedTitle || routine.title);
      return;
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59).toISOString();

    const { data: classes } = await supabase
      .from('classes')
      .select('id, title, staffName, room, startTime, endTime, type')
      .eq('branchId', member.branchId)
      .gte('startTime', `${todayStr}T00:00:00`)
      .lte('startTime', `${todayStr}T23:59:59`)
      .order('startTime');

    if (classes) setTodayClasses(classes);

    const { data: attendance } = await supabase
      .from('attendance')
      .select('id, checkInAt, type')
      .eq('memberId', member.id)
      .gte('checkInAt', monthStart)
      .lte('checkInAt', monthEnd);

    if (attendance) {
      setMonthAttendance(attendance.length);
      setAttendanceDays(new Set(attendance.map((item) => new Date(item.checkInAt).getDate())));
      const typeMap = new Map<number, string>();
      attendance.forEach((item) => {
        typeMap.set(new Date(item.checkInAt).getDate(), item.type || 'REGULAR');
      });
      setAttendanceTypes(typeMap);
    }

    const { count: bodyRecordCount } = await supabase
      .from('body_compositions')
      .select('id', { count: 'exact', head: true })
      .eq('memberId', member.id);

    const { data: noticeData } = await supabase
      .from('notices')
      .select('id, title, created_at')
      .eq('branch_id', member.branchId)
      .eq('is_published', true)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5);

    if (noticeData) setNotices(noticeData);

    const onboarding = loadOnboarding(member.id);
    const routine = buildRoutineSuggestion(onboarding);
    const earnedBadges = buildBadgeCollection({
      mileage: member.mileage,
      onboardingComplete: Boolean(onboarding.completedAt),
      feedbackCount: getFeedbackEntries(member.id).length,
      attendanceCount: attendance?.length || 0,
      bodyRecordCount: bodyRecordCount || 0,
    }).filter((item) => item.earned);

    setNotificationCount(getUnreadNotificationCount(member));
    setRewardBadgeCount(earnedBadges.length);
    setOnboardingComplete(Boolean(onboarding.completedAt));
    setRoutineTitle(onboarding.recommendedTitle || routine.title);
  };

  if (!member) return null;

  const dday = member.membershipExpiry ? calcDday(member.membershipExpiry) : null;
  const ddayUrgent = dday !== null && dday <= 7;

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  return (
    <div className="pull-to-refresh">
      <header className="bg-primary px-5 pt-safe-top pb-6">
        <div className="pt-4 flex items-center justify-between mb-4">
          <div>
            <p className="text-white/80 text-sm">안녕하세요</p>
            <h1 className="text-white text-xl font-bold">{member.name}님 오늘도 화이팅!</h1>
          </div>
          <button onClick={() => navigate('/notifications')} className="relative p-2">
            <Bell className="w-6 h-6 text-white" />
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-state-error text-white text-[10px] font-bold flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>
        </div>

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
        <button
          onClick={() => navigate('/onboarding')}
          className={cn(
            'w-full rounded-card p-4 shadow-card text-left',
            onboardingComplete ? 'bg-state-success/10' : 'bg-state-warning/10'
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className={cn(
                'text-xs font-semibold',
                onboardingComplete ? 'text-state-success' : 'text-state-warning'
              )}>
                {onboardingComplete ? '추천 루틴이 준비되었습니다' : '온보딩 설문이 필요합니다'}
              </p>
              <p className="text-sm font-semibold mt-1">{routineTitle}</p>
              <p className="text-xs text-content-secondary mt-1">
                {onboardingComplete ? '운동 목적과 통증 정보 기준으로 루틴과 FMS 요약을 확인할 수 있습니다.' : '운동 목적, 성향, 통증 정보를 입력하고 첫 루틴을 받아보세요.'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-content-tertiary flex-shrink-0" />
          </div>
        </button>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-content-secondary">빠른 예약</h2>
            <button onClick={() => navigate('/classes')} className="text-xs text-primary font-medium">
              전체 보기
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: <Dumbbell className="w-6 h-6 text-primary" />, label: 'PT 요청', path: '/classes?type=PT' },
              { icon: <CalendarCheck className="w-6 h-6 text-accent" />, label: 'GX 일정', path: '/classes?type=GX' },
              { icon: <MapPin className="w-6 h-6 text-state-info" />, label: 'Golf 예약', path: '/golf-bay' },
              { icon: <Coins className="w-6 h-6 text-state-warning" />, label: '리워드', path: '/coupons?tab=badge' },
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
        </div>

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

        <div
          onClick={() => navigate('/coupons?tab=mileage')}
          className="bg-surface rounded-card p-4 shadow-card touch-card cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-content-tertiary">마일리지 / 배지 요약</p>
              <p className="text-xl font-bold mt-1">{member.mileage.toLocaleString()}P</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-primary">획득 배지 {rewardBadgeCount}개</p>
              <p className="text-xs text-content-secondary mt-1">리워드 센터에서 자세히 보기</p>
            </div>
          </div>
        </div>

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
              <span className={cn('text-sm font-bold', ddayUrgent ? 'text-state-error' : 'text-primary')}>
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
                className={cn('progress-bar-fill', ddayUrgent ? 'bg-state-error' : 'bg-primary')}
                style={{ width: `${Math.max(100 - (dday / 365) * 100, 5)}%` }}
              />
            </div>
          )}
        </div>

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
            <div className="py-4 text-center text-content-tertiary text-sm">오늘 예정된 수업이 없습니다</div>
          ) : (
            <div className="space-y-2">
              {todayClasses.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/classes/${item.id}`)}
                  className="flex items-center gap-3 p-3 bg-surface-secondary rounded-lg touch-card cursor-pointer"
                >
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    item.type === 'PT' ? 'bg-primary-light' : 'bg-accent-light'
                  )}>
                    <Dumbbell className={cn('w-5 h-5', item.type === 'PT' ? 'text-primary' : 'text-accent')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    <div className="flex items-center gap-2 text-xs text-content-secondary">
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {formatTime(item.startTime)} - {formatTime(item.endTime)}
                      </span>
                      {item.room && (
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" />
                          {item.room}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={cn(
                    'text-xs px-2 py-1 rounded-full font-medium',
                    item.type === 'PT' ? 'bg-primary-light text-primary' : 'bg-accent-light text-accent'
                  )}>
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

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

          <div className="grid grid-cols-7 gap-1">
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <div key={day} className="text-center text-[10px] text-content-tertiary py-1">{day}</div>
            ))}
            {Array.from({ length: firstDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const isToday = day === today.getDate();
              const hasAttendance = attendanceDays.has(day);
              const isFuture = day > today.getDate();
              const attendanceType = attendanceTypes.get(day);
              const typeBg = attendanceType === 'PT' ? 'bg-primary' : attendanceType === 'GX' ? 'bg-accent' : 'bg-state-success';

              return (
                <div
                  key={day}
                  className={cn(
                    'aspect-square rounded-md flex items-center justify-center text-[11px]',
                    hasAttendance && `${typeBg} text-white font-bold`,
                    isToday && !hasAttendance && 'ring-1 ring-primary text-primary font-bold',
                    !hasAttendance && !isToday && !isFuture && 'text-content-secondary',
                    isFuture && 'text-content-tertiary/40'
                  )}
                >
                  {day}
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-content-tertiary">
            <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-primary" />PT</span>
            <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-accent" />GX</span>
            <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-state-success" />일반</span>
          </div>
        </div>

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
                <p className="text-xs text-content-tertiary mb-0.5">공지 / 이벤트</p>
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

function CreditCardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}
