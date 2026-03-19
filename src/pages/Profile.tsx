import { useNavigate } from 'react-router-dom';
import {
  ChevronRight, LogOut, User, Activity, Gift,
  CreditCard, Bell, Scale, FileText, Settings,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { cn, formatPhone, formatCurrency } from '@/lib/utils';

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

  const menuGroups = [
    {
      title: '내 정보',
      items: [
        { icon: Scale, label: '체성분 기록', path: '/body-composition', color: 'text-primary' },
        { icon: Gift, label: '쿠폰/마일리지', path: '/coupons', badge: member.mileage > 0 ? `${member.mileage.toLocaleString()}P` : undefined, color: 'text-state-warning' },
        { icon: CreditCard, label: '결제 내역', path: '/payments', color: 'text-state-info' },
        { icon: Activity, label: '출석 이력', path: '/attendance', color: 'text-state-success' },
      ],
    },
    {
      title: '서비스',
      items: [
        { icon: FileText, label: '공지사항', path: '/notices', color: 'text-content-secondary' },
        { icon: Bell, label: '알림 설정', path: '#', color: 'text-content-secondary' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* 프로필 헤더 */}
      <header className="bg-surface px-5 pt-safe-top pb-5">
        <div className="flex items-center justify-between pt-4 mb-5">
          <h1 className="text-xl font-bold">마이페이지</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* 아바타 */}
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
            {member.profileImage ? (
              <img
                src={member.profileImage}
                alt={member.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold">{member.name}</h2>
            <p className="text-sm text-content-secondary">{formatPhone(member.phone)}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium',
                member.status === 'ACTIVE' ? 'bg-state-success/10 text-state-success' :
                member.status === 'HOLDING' ? 'bg-state-warning/10 text-state-warning' :
                'bg-surface-tertiary text-content-tertiary'
              )}>
                {member.status === 'ACTIVE' ? '이용중' :
                 member.status === 'HOLDING' ? '홀딩' :
                 member.status === 'EXPIRED' ? '만료' : member.status}
              </span>
              {member.membershipType && (
                <span className="text-xs text-content-tertiary">{member.membershipType}</span>
              )}
            </div>
          </div>
        </div>

        {/* 마일리지 카드 */}
        <div className="mt-4 bg-gradient-to-r from-primary to-primary-dark rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-xs">보유 마일리지</p>
              <p className="text-xl font-bold">{member.mileage.toLocaleString()}P</p>
            </div>
            <button
              onClick={() => navigate('/coupons')}
              className="px-3 py-1.5 bg-white/20 rounded-lg text-sm font-medium"
            >
              상세보기
            </button>
          </div>
        </div>
      </header>

      {/* 메뉴 그룹 */}
      <div className="px-4 mt-2 space-y-4 pb-4">
        {menuGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-xs font-medium text-content-tertiary mb-2 px-1">{group.title}</h3>
            <div className="bg-surface rounded-card shadow-card overflow-hidden">
              {group.items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => item.path !== '#' && navigate(item.path)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3.5',
                      i > 0 && 'border-t border-line-light',
                      'active:bg-surface-secondary transition-colors'
                    )}
                  >
                    <Icon className={cn('w-5 h-5', item.color)} />
                    <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="text-xs text-primary font-medium">{item.badge}</span>
                    )}
                    <ChevronRight className="w-4 h-4 text-content-tertiary" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* 로그아웃 버튼 */}
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
