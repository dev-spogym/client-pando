import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Bell,
  CalendarDays,
  ChevronRight,
  CreditCard,
  FileText,
  Gift,
  Heart,
  LogOut,
  MessageSquare,
  Scale,
  Sparkles,
  User,
  Users,
  ShoppingBag,
} from 'lucide-react';
import { useMarketStore } from '@/stores/marketStore';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import {
  buildBadgeCollection,
  getFeedbackEntries,
  getUnreadNotificationCount,
  isOnboardingComplete,
  loadOnboarding,
} from '@/lib/memberExperience';
import { cn, formatPhone } from '@/lib/utils';
import { Avatar, Badge, Card, ListItem } from '@/components/ui';

/** 마이페이지 */
export default function Profile() {
  const navigate = useNavigate();
  const { member, trainer, logout } = useAuthStore();
  const scrapCount = useMarketStore((s) => s.scraps.length);

  const handleLogout = async () => {
    await logout();
    toast.success('로그아웃 되었습니다.');
    navigate('/login', { replace: true });
  };

  if (!member && !trainer) return null;

  if (!member && trainer) {
    const trainerMenus = [
      { icon: Users, label: '회원 관리', path: '/trainer/members', color: 'text-primary' },
      { icon: CalendarDays, label: '일정 관리', path: '/trainer/schedule', color: 'text-state-info' },
      { icon: Activity, label: '수업 목록', path: '/trainer/classes', color: 'text-teal-600' },
      { icon: Bell, label: '노쇼 / 페널티', path: '/trainer/penalties', color: 'text-state-error' },
      { icon: MessageSquare, label: '운동 피드백', path: '/trainer/feedback', color: 'text-state-success' },
      { icon: ShoppingBag, label: '수업 템플릿', path: '/trainer/templates', color: 'text-content-secondary' },
      { icon: Sparkles, label: '성과 / KPI', path: '/trainer/kpi', color: 'text-state-warning' },
      { icon: FileText, label: '확인서', path: '/trainer/certificates', color: 'text-content-secondary' },
      { icon: Bell, label: '알림', path: '/trainer/notifications', color: 'text-content-secondary' },
      { icon: User, label: '설정', path: '/trainer/settings', color: 'text-content-secondary' },
    ];

    return (
      <div className="min-h-screen bg-surface-secondary">
        <header className="bg-gradient-to-br from-primary to-primary-dark px-5 pt-safe-top pb-6">
          <div className="pt-4">
            <p className="text-white/80 text-sm">트레이너 마이페이지</p>
            <h1 className="text-white text-xl font-bold mt-1">{trainer.staffName || trainer.name}</h1>
            <p className="text-white/70 text-sm mt-1">@{trainer.username}</p>
          </div>

          <div className="mt-5 rounded-card-lg bg-white/15 p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <User className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{trainer.role}</p>
                <p className="text-xs text-white/70">지점 ID {trainer.branchId}</p>
              </div>
              {trainer.staffPhone ? (
                <span className="text-xs text-white/80">{trainer.staffPhone}</span>
              ) : null}
            </div>
          </div>
        </header>

        <div className="px-5 -mt-2 pb-4 space-y-4">
          <Card variant="soft" padding="none" className="overflow-hidden">
            {trainerMenus.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-4',
                    index > 0 && 'border-t border-line-light',
                    'active:bg-surface-secondary transition-colors'
                  )}
                >
                  <Icon className={cn('w-5 h-5', item.color)} />
                  <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-content-tertiary" />
                </button>
              );
            })}
          </Card>

          <button
            onClick={handleLogout}
            className="w-full bg-surface rounded-card shadow-card-soft px-4 py-3.5 flex items-center gap-3 active:bg-surface-secondary transition-colors"
          >
            <LogOut className="w-5 h-5 text-state-error" />
            <span className="text-sm font-medium text-state-error">로그아웃</span>
          </button>
        </div>
      </div>
    );
  }

  if (!member) return null;

  const onboardingDone = isOnboardingComplete(member.id);
  const onboarding = loadOnboarding(member.id);
  const badgeCount = buildBadgeCollection({
    mileage: member.mileage,
    onboardingComplete: onboardingDone,
    feedbackCount: getFeedbackEntries(member.id).length,
    attendanceCount: 0,
    bodyRecordCount: 0,
  }).filter((item) => item.earned).length;

  const unreadNotifications = getUnreadNotificationCount(member);

  const menuGroups = [
    {
      title: '내 정보',
      items: [
        { icon: Heart, label: '찜한 항목', path: '/scrap', badge: scrapCount > 0 ? `${scrapCount}` : undefined, color: 'text-state-sale' },
        { icon: Scale, label: '체성분 / FMS', path: '/body-composition', color: 'text-primary' },
        { icon: Gift, label: '리워드 센터', path: '/coupons?tab=mileage', badge: `${member.mileage.toLocaleString()}P`, color: 'text-state-warning' },
        { icon: CreditCard, label: '재등록 추천', path: '/renewal', color: 'text-state-info' },
        { icon: Activity, label: '출석 이력', path: '/attendance', color: 'text-state-success' },
      ],
    },
    {
      title: '서비스',
      items: [
        { icon: Bell, label: '알림센터', path: '/notifications', badge: unreadNotifications > 0 ? `${unreadNotifications}` : undefined, color: 'text-content-secondary' },
        { icon: Users, label: '대기 예약 관리', path: '/waitlist', color: 'text-content-secondary' },
        { icon: Sparkles, label: '운동 온보딩', path: '/onboarding', badge: onboardingDone ? '완료' : '필요', color: 'text-content-secondary' },
        { icon: ShoppingBag, label: '상품 스토어', path: '/shop', color: 'text-content-secondary' },
        { icon: FileText, label: '공지사항', path: '/notices', color: 'text-content-secondary' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-surface px-5 pt-safe-top pb-5">
        <div className="flex items-center justify-between pt-4 mb-5">
          <h1 className="text-xl font-bold">마이페이지</h1>
          <button onClick={() => navigate('/settings')} className="text-sm text-primary font-medium">
            설정
          </button>
        </div>

        <div className="flex items-center gap-4">
          <Avatar size="xl" src={member.profileImage} alt={member.name} name={member.name} />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold">{member.name}</h2>
            <p className="text-sm text-content-secondary">{formatPhone(member.phone)}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                tone={
                  member.status === 'ACTIVE' ? 'success' :
                  member.status === 'HOLDING' ? 'warning' :
                  'neutral'
                }
                variant="soft"
              >
                {member.status === 'ACTIVE' ? '이용중' : member.status === 'HOLDING' ? '홀딩' : member.status === 'EXPIRED' ? '만료' : member.status}
              </Badge>
              {member.membershipType && <span className="text-xs text-content-tertiary">{member.membershipType}</span>}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/coupons?tab=badge')}
            className="bg-gradient-to-r from-primary to-primary-dark rounded-card p-4 text-white text-left"
          >
            <p className="text-white/80 text-xs">획득 배지</p>
            <p className="text-xl font-bold mt-1">{badgeCount}개</p>
          </button>
          <button
            onClick={() => navigate('/onboarding')}
            className="bg-surface-secondary rounded-card p-4 text-left"
          >
            <p className="text-content-tertiary text-xs">추천 루틴</p>
            <p className="text-sm font-semibold mt-1">{onboardingDone ? onboarding.recommendedTitle || '저장됨' : '온보딩 필요'}</p>
          </button>
        </div>
      </header>

      <div className="px-5 mt-2 space-y-4 pb-4">
        {menuGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-xs font-medium text-content-tertiary mb-2 px-1">{group.title}</h3>
            <Card variant="soft" padding="none" className="overflow-hidden">
              {group.items.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3.5',
                      index > 0 && 'border-t border-line-light',
                      'active:bg-surface-secondary transition-colors'
                    )}
                  >
                    <Icon className={cn('w-5 h-5', item.color)} />
                    <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                    {item.badge && <span className="text-xs text-primary font-medium">{item.badge}</span>}
                    <ChevronRight className="w-4 h-4 text-content-tertiary" />
                  </button>
                );
              })}
            </Card>
          </div>
        ))}

        <button
          onClick={() => navigate('/payments')}
          className="w-full bg-surface rounded-card shadow-card-soft px-4 py-3.5 flex items-center gap-3 active:bg-surface-secondary transition-colors"
        >
          <CreditCard className="w-5 h-5 text-state-info" />
          <span className="text-sm font-medium">결제 내역 보기</span>
          <ChevronRight className="w-4 h-4 text-content-tertiary ml-auto" />
        </button>

        <button
          onClick={handleLogout}
          className="w-full bg-surface rounded-card shadow-card-soft px-4 py-3.5 flex items-center gap-3 active:bg-surface-secondary transition-colors"
        >
          <LogOut className="w-5 h-5 text-state-error" />
          <span className="text-sm font-medium text-state-error">로그아웃</span>
        </button>
      </div>
    </div>
  );
}
