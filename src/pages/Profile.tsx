import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Bell,
  ChevronRight,
  CreditCard,
  FileText,
  Gift,
  LogOut,
  Scale,
  Sparkles,
  User,
  Users,
  ShoppingBag,
} from 'lucide-react';
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

/** 마이페이지 */
export default function Profile() {
  const navigate = useNavigate();
  const { member, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    toast.success('로그아웃 되었습니다.');
    navigate('/login', { replace: true });
  };

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
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
            {member.profileImage ? (
              <img src={member.profileImage} alt={member.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold">{member.name}</h2>
            <p className="text-sm text-content-secondary">{formatPhone(member.phone)}</p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  member.status === 'ACTIVE'
                    ? 'bg-state-success/10 text-state-success'
                    : member.status === 'HOLDING'
                      ? 'bg-state-warning/10 text-state-warning'
                      : 'bg-surface-tertiary text-content-tertiary'
                )}
              >
                {member.status === 'ACTIVE' ? '이용중' : member.status === 'HOLDING' ? '홀딩' : member.status === 'EXPIRED' ? '만료' : member.status}
              </span>
              {member.membershipType && <span className="text-xs text-content-tertiary">{member.membershipType}</span>}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/coupons?tab=badge')}
            className="bg-gradient-to-r from-primary to-primary-dark rounded-xl p-4 text-white text-left"
          >
            <p className="text-white/80 text-xs">획득 배지</p>
            <p className="text-xl font-bold mt-1">{badgeCount}개</p>
          </button>
          <button
            onClick={() => navigate('/onboarding')}
            className="bg-surface-secondary rounded-xl p-4 text-left"
          >
            <p className="text-content-tertiary text-xs">추천 루틴</p>
            <p className="text-sm font-semibold mt-1">{onboardingDone ? onboarding.recommendedTitle || '저장됨' : '온보딩 필요'}</p>
          </button>
        </div>
      </header>

      <div className="px-4 mt-2 space-y-4 pb-4">
        {menuGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-xs font-medium text-content-tertiary mb-2 px-1">{group.title}</h3>
            <div className="bg-surface rounded-card shadow-card overflow-hidden">
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
            </div>
          </div>
        ))}

        <button
          onClick={() => navigate('/payments')}
          className="w-full bg-surface rounded-card shadow-card px-4 py-3.5 flex items-center gap-3 active:bg-surface-secondary transition-colors"
        >
          <CreditCard className="w-5 h-5 text-state-info" />
          <span className="text-sm font-medium">결제 내역 보기</span>
          <ChevronRight className="w-4 h-4 text-content-tertiary ml-auto" />
        </button>

        <button
          onClick={handleLogout}
          className="w-full bg-surface rounded-card shadow-card px-4 py-3.5 flex items-center gap-3 active:bg-surface-secondary transition-colors"
        >
          <LogOut className="w-5 h-5 text-state-error" />
          <span className="text-sm font-medium text-state-error">로그아웃</span>
        </button>
      </div>
    </div>
  );
}
