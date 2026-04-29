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
  CreditCard,
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
import { Brand, Card, SectionHeader } from '@/components/ui';

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

  const quickActions = [
    { icon: Dumbbell, label: 'PT 요청', path: '/classes?type=PT', tone: 'text-primary bg-primary-light' },
    { icon: CalendarCheck, label: 'GX 일정', path: '/classes?type=GX', tone: 'text-accent-dark bg-accent-light' },
    { icon: MapPin, label: 'Golf 예약', path: '/golf-bay', tone: 'text-state-info bg-primary-light' },
    { icon: Coins, label: '리워드', path: '/coupons?tab=badge', tone: 'text-state-warning bg-state-warning/10' },
  ];

  const utilityActions = [
    { icon: ClipboardList, label: '운동일지', path: '/workout-log' },
    { icon: BookOpen, label: '운동가이드', path: '/exercise-guide' },
    { icon: UtensilsCrossed, label: '식단관리', path: '/diet' },
    { icon: Building2, label: '센터정보', path: '/center' },
  ];

  return (
    <div className="pull-to-refresh bg-surface-secondary">
      {/* 헤더: 브랜드 + 인사말 + 알림 */}
      <header className="bg-surface px-5 pt-safe-top pb-5">
        <div className="pt-3 flex items-center justify-between mb-5">
          <Brand size="md" />
          <button
            type="button"
            onClick={() => navigate('/notifications')}
            aria-label="알림"
            className="relative w-10 h-10 inline-flex items-center justify-center rounded-full active:bg-surface-tertiary"
          >
            <Bell className="w-6 h-6 text-content" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-state-sale text-white text-[10px] font-bold flex items-center justify-center">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </button>
        </div>

        <div>
          <h1 className="text-display font-bold text-content leading-tight">
            <span className="text-primary">{member.name}님,</span>
          </h1>
          <p className="text-display font-bold text-content leading-tight mt-0.5">오늘도 힘찬 하루!</p>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="px-5 pt-3 space-y-5 pb-8">
        {/* 핵심 요약 카드 (예약내역/이용권/메시지) */}
        <Card variant="flat" padding="none" className="bg-primary text-white rounded-card-lg overflow-hidden">
          <div className="grid grid-cols-3 divide-x divide-white/15">
            <button
              type="button"
              onClick={() => navigate('/lessons')}
              className="flex flex-col items-center py-5 px-3 active:bg-primary-dark transition-colors"
            >
              <ClipboardList className="w-6 h-6 mb-2" strokeWidth={1.8} />
              <span className="text-caption text-white/85">예약내역</span>
              <span className="text-h2 font-bold mt-0.5 leading-none">{todayClasses.length}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/membership')}
              className="flex flex-col items-center py-5 px-3 active:bg-primary-dark transition-colors"
            >
              <CreditCard className="w-6 h-6 mb-2" strokeWidth={1.8} />
              <span className="text-caption text-white/85">이용권</span>
              <span className="text-h2 font-bold mt-0.5 leading-none">{member.membershipExpiry ? 1 : 0}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/notifications')}
              className="flex flex-col items-center py-5 px-3 active:bg-primary-dark transition-colors"
            >
              <Bell className="w-6 h-6 mb-2" strokeWidth={1.8} />
              <span className="text-caption text-white/85">메시지</span>
              <span className="text-h2 font-bold mt-0.5 leading-none">{notificationCount}</span>
            </button>
          </div>
        </Card>

        {/* QR 체크인 액션 */}
        <button
          type="button"
          onClick={() => navigate('/qr')}
          className="w-full bg-surface rounded-card-lg border-2 border-primary/15 p-4 flex items-center gap-3 active:bg-surface-secondary transition-colors"
        >
          <div className="w-12 h-12 bg-primary-light rounded-card flex items-center justify-center">
            <QrCode className="w-7 h-7 text-primary" strokeWidth={2} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-body font-semibold text-content">QR 체크인</p>
            <p className="text-caption text-content-secondary mt-0.5">QR코드로 출석을 인증하세요</p>
          </div>
          <ChevronRight className="w-5 h-5 text-content-tertiary" />
        </button>

        {/* 온보딩 안내 카드 */}
        <button
          type="button"
          onClick={() => navigate('/onboarding')}
          className={cn(
            'w-full rounded-card-lg p-4 text-left touch-card border',
            onboardingComplete
              ? 'bg-state-success/5 border-state-success/30'
              : 'bg-state-warning/5 border-state-warning/30'
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p
                className={cn(
                  'text-caption font-semibold',
                  onboardingComplete ? 'text-state-success' : 'text-state-warning'
                )}
              >
                {onboardingComplete ? '추천 루틴이 준비되었습니다' : '온보딩 설문이 필요합니다'}
              </p>
              <p className="text-body font-semibold text-content mt-1">{routineTitle}</p>
              <p className="text-caption text-content-secondary mt-1 line-clamp-2">
                {onboardingComplete
                  ? '운동 목적과 통증 정보 기준으로 루틴과 FMS 요약을 확인할 수 있습니다.'
                  : '운동 목적, 성향, 통증 정보를 입력하고 첫 루틴을 받아보세요.'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-content-tertiary flex-shrink-0" />
          </div>
        </button>

        {/* 빠른 예약 */}
        <section>
          <SectionHeader
            title="빠른 예약"
            actionLabel="전체 보기"
            onAction={() => navigate('/classes')}
          />
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className="bg-surface rounded-card p-3 shadow-card-soft flex flex-col items-center gap-2 touch-card"
                >
                  <div className={cn('w-11 h-11 rounded-card flex items-center justify-center', item.tone)}>
                    <Icon className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <span className="text-caption font-medium text-content-secondary">{item.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 부가 기능 */}
        <section>
          <SectionHeader title="활동 기록" />
          <div className="grid grid-cols-4 gap-3">
            {utilityActions.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className="bg-surface rounded-card p-3 shadow-card-soft flex flex-col items-center gap-2 touch-card"
                >
                  <div className="w-11 h-11 bg-surface-tertiary rounded-card flex items-center justify-center">
                    <Icon className="w-6 h-6 text-content-secondary" strokeWidth={2} />
                  </div>
                  <span className="text-caption font-medium text-content-secondary">{item.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 마일리지 / 배지 */}
        <Card interactive onClick={() => navigate('/coupons?tab=mileage')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption text-content-tertiary">마일리지 · 배지</p>
              <p className="text-h2 font-bold text-content mt-1">{member.mileage.toLocaleString()}P</p>
            </div>
            <div className="text-right">
              <p className="text-body-sm font-semibold text-primary">획득 배지 {rewardBadgeCount}개</p>
              <p className="text-caption text-content-tertiary mt-0.5">리워드 센터 보기</p>
            </div>
          </div>
        </Card>

        {/* 이용권 현황 */}
        <Card
          interactive
          onClick={() => navigate('/membership')}
          className={cn(ddayUrgent && 'ring-2 ring-state-error')}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <span className="text-body font-semibold text-content">이용권 현황</span>
            </div>
            {dday !== null && (
              <span className={cn('text-body-sm font-bold', ddayUrgent ? 'text-state-error' : 'text-primary')}>
                {dday > 0 ? `D-${dday}` : dday === 0 ? 'D-Day' : `D+${Math.abs(dday)}`}
              </span>
            )}
          </div>
          <p className="text-body-sm text-content-secondary">
            {member.membershipType || '이용권'}
            {member.membershipExpiry && (
              <span className="ml-2 text-content-tertiary">~ {formatDateKo(member.membershipExpiry)}</span>
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
        </Card>

        {/* 오늘 수업 */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-primary" />
              <span className="text-body font-semibold text-content">오늘 수업</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/lessons')}
              className="text-caption text-content-secondary font-medium flex items-center gap-0.5"
            >
              내 수업 <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {todayClasses.length === 0 ? (
            <div className="py-6 text-center text-content-tertiary text-body-sm">오늘 예정된 수업이 없습니다</div>
          ) : (
            <div className="space-y-2">
              {todayClasses.slice(0, 3).map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => navigate(`/classes/${item.id}`)}
                  className="w-full flex items-center gap-3 p-3 bg-surface-secondary rounded-card touch-card text-left"
                >
                  <div
                    className={cn(
                      'w-11 h-11 rounded-card flex items-center justify-center shrink-0',
                      item.type === 'PT' ? 'bg-primary-light' : 'bg-accent-light'
                    )}
                  >
                    <Dumbbell
                      className={cn('w-5 h-5', item.type === 'PT' ? 'text-primary' : 'text-accent-dark')}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-medium text-content truncate">{item.title}</p>
                    <div className="flex items-center gap-2 text-caption text-content-secondary mt-0.5">
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
                  <span
                    className={cn(
                      'text-micro px-2 py-1 rounded-pill font-medium shrink-0',
                      item.type === 'PT' ? 'bg-primary-light text-primary' : 'bg-accent-light text-accent-dark'
                    )}
                  >
                    {item.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* 이번 달 출석 */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-state-warning" />
              <span className="text-body font-semibold text-content">이번 달 출석</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/attendance')}
              className="text-caption text-content-secondary font-medium flex items-center gap-0.5"
            >
              상세보기 <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-state-warning/10 rounded-card flex items-center justify-center">
              <Flame className="w-7 h-7 text-state-warning" />
            </div>
            <div>
              <p className="text-h2 font-bold text-content leading-tight">{monthAttendance}일</p>
              <p className="text-caption text-content-tertiary">{today.getMonth() + 1}월 출석</p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <div key={day} className="text-center text-micro text-content-tertiary py-1 font-medium">
                {day}
              </div>
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
              const typeBg =
                attendanceType === 'PT'
                  ? 'bg-primary'
                  : attendanceType === 'GX'
                    ? 'bg-accent'
                    : 'bg-state-success';

              return (
                <div
                  key={day}
                  className={cn(
                    'aspect-square rounded-md flex items-center justify-center text-[11px]',
                    hasAttendance && `${typeBg} text-white font-bold`,
                    isToday && !hasAttendance && 'ring-1 ring-primary text-primary font-bold',
                    !hasAttendance && !isToday && !isFuture && 'text-content-secondary',
                    isFuture && 'text-content-quaternary'
                  )}
                >
                  {day}
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-center gap-4 text-micro text-content-tertiary">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
              PT
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-accent" />
              GX
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-state-success" />
              일반
            </span>
          </div>
        </Card>

        {/* 공지 슬라이더 */}
        {notices.length > 0 && (
          <Card interactive onClick={() => navigate('/notices')}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-light rounded-card flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-caption text-content-tertiary mb-0.5">공지 · 이벤트</p>
                <p className="text-body-sm font-medium text-content truncate">{notices[noticeIndex]?.title}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-content-tertiary flex-shrink-0" />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
