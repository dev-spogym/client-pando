import { useEffect, useState } from 'react';
import { ArrowLeft, Coins, Gift, Medal, Ticket } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import {
  buildBadgeCollection,
  getFeedbackEntries,
  isOnboardingComplete,
  type BadgeItem,
} from '@/lib/memberExperience';
import { cn, formatCurrency, formatDateKo } from '@/lib/utils';

interface CouponItem {
  id: number;
  name: string;
  type: string;
  value: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

type RewardTab = 'coupon' | 'mileage' | 'badge';

/** 리워드 센터 */
export default function Coupons() {
  const navigate = useNavigate();
  const { member } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const tab = (searchParams.get('tab') as RewardTab) || 'coupon';

  useEffect(() => {
    if (!member) return;
    fetchRewardData();
  }, [member]);

  const handleTabChange = (nextTab: RewardTab) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', nextTab);
    setSearchParams(nextParams, { replace: true });
  };

  const fetchRewardData = async () => {
    if (!member) return;
    setLoading(true);

    const { data: couponData } = await supabase
      .from('coupons')
      .select('id, name, type, value, validFrom, validUntil, isActive')
      .eq('branchId', member.branchId)
      .eq('isActive', true)
      .gte('validUntil', new Date().toISOString())
      .order('validUntil');

    const { count: attendanceCount } = await supabase
      .from('attendance')
      .select('id', { count: 'exact', head: true })
      .eq('memberId', member.id);

    const { count: bodyRecordCount } = await supabase
      .from('body_compositions')
      .select('id', { count: 'exact', head: true })
      .eq('memberId', member.id);

    setCoupons(couponData || []);
    setBadges(buildBadgeCollection({
      mileage: member.mileage,
      onboardingComplete: isOnboardingComplete(member.id),
      feedbackCount: getFeedbackEntries(member.id).length,
      attendanceCount: attendanceCount || 0,
      bodyRecordCount: bodyRecordCount || 0,
    }));
    setLoading(false);
  };

  if (!member) return null;

  const earnedBadgeCount = badges.filter((item) => item.earned).length;
  const mileageHistory = [
    { id: 1, label: '앱 연동 환영 적립', amount: 1000, type: 'earn', date: '2026-04-22' },
    { id: 2, label: '결제 리워드 적립', amount: 2500, type: 'earn', date: '2026-04-18' },
    { id: 3, label: '프로모션 사용', amount: 1000, type: 'use', date: '2026-04-10' },
  ];

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-surface sticky top-0 z-10 border-b border-line">
        <div className="flex items-center px-4 pt-safe-top h-14">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-content" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-lg">리워드 센터</h1>
          <div className="w-6" />
        </div>
      </header>

      <div className="bg-gradient-to-r from-primary to-primary-dark mx-4 mt-4 rounded-xl p-5 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Coins className="w-5 h-5 text-white/80" />
              <span className="text-sm text-white/80">보유 마일리지</span>
            </div>
            <p className="text-3xl font-bold">
              {member.mileage.toLocaleString()}
              <span className="text-lg font-normal">P</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/80">획득 배지</p>
            <p className="text-2xl font-bold">{earnedBadgeCount}개</p>
          </div>
        </div>
      </div>

      <div className="flex border-b border-line mt-4 bg-surface">
        {[
          { key: 'coupon' as const, label: '쿠폰', icon: Ticket },
          { key: 'mileage' as const, label: '마일리지', icon: Coins },
          { key: 'badge' as const, label: '배지', icon: Medal },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => handleTabChange(item.key)}
            className={cn(
              'flex-1 py-3 text-sm font-medium relative flex items-center justify-center gap-1.5',
              tab === item.key ? 'text-primary' : 'text-content-tertiary'
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
            {tab === item.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        ))}
      </div>

      <div className="px-4 py-4">
        {tab === 'coupon' && (
          loading ? (
            <div className="text-center py-8 text-content-tertiary text-sm">불러오는 중...</div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="w-12 h-12 text-content-tertiary/30 mx-auto mb-3" />
              <p className="text-content-tertiary text-sm">사용 가능한 쿠폰이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {coupons.map((coupon) => {
                const isPercentage = coupon.type === '할인율';
                return (
                  <div key={coupon.id} className="bg-surface rounded-card overflow-hidden shadow-card">
                    <div className="flex">
                      <div className="w-24 bg-primary-light flex flex-col items-center justify-center p-3">
                        <span className="text-2xl font-bold text-primary">
                          {isPercentage ? `${coupon.value}%` : formatCurrency(Number(coupon.value))}
                        </span>
                        <span className="text-[10px] text-primary/70 mt-0.5">할인</span>
                      </div>
                      <div className="flex-1 p-3">
                        <h4 className="font-semibold text-sm">{coupon.name}</h4>
                        <p className="text-xs text-content-tertiary mt-1">
                          {formatDateKo(coupon.validFrom)} ~ {formatDateKo(coupon.validUntil)}
                        </p>
                        <span className="inline-block mt-2 text-[10px] px-2 py-0.5 bg-state-success/10 text-state-success rounded-full font-medium">
                          사용가능
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {tab === 'mileage' && (
          <div className="space-y-4">
            <div className="bg-surface rounded-card p-4 shadow-card">
              <h3 className="font-semibold text-sm mb-3">마일리지 운영 기준</h3>
              <div className="space-y-2 text-sm text-content-secondary">
                <p>결제 리워드는 마일리지로 통합 운영됩니다.</p>
                <p>1P = 1원으로 결제 시 사용 가능</p>
                <p>적립 후 1년 내 미사용 시 소멸</p>
              </div>
            </div>
            <div className="bg-surface rounded-card p-4 shadow-card">
              <h3 className="font-semibold text-sm mb-3">적립 / 사용 내역</h3>
              <div className="space-y-3">
                {mileageHistory.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-content-tertiary mt-1">{item.date}</p>
                    </div>
                    <span className={cn(
                      'text-sm font-semibold',
                      item.type === 'earn' ? 'text-state-success' : 'text-state-error'
                    )}>
                      {item.type === 'earn' ? '+' : '-'}
                      {item.amount.toLocaleString()}P
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'badge' && (
          <div className="space-y-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={cn(
                  'rounded-card p-4 shadow-card border',
                  badge.earned ? 'bg-surface border-primary/20' : 'bg-surface border-transparent'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center text-lg',
                        badge.tone === 'gold' && 'bg-state-warning/10',
                        badge.tone === 'blue' && 'bg-state-info/10',
                        badge.tone === 'green' && 'bg-state-success/10',
                        badge.tone === 'rose' && 'bg-state-error/10'
                      )}>
                        {badge.icon === 'Coins' ? 'P' : badge.icon === 'CalendarCheck' ? '출' : badge.icon === 'MessageSquare' ? '후' : badge.icon === 'LineChart' ? '리' : badge.icon === 'Target' ? '목' : '앱'}
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold">{badge.title}</h3>
                        <p className="text-xs text-content-tertiary mt-1">{badge.condition}</p>
                      </div>
                    </div>
                    <p className="text-sm text-content-secondary mt-3 leading-relaxed">{badge.description}</p>
                  </div>
                  <span className={cn(
                    'text-[11px] px-2 py-1 rounded-full font-semibold flex-shrink-0',
                    badge.earned ? 'bg-primary-light text-primary' : 'bg-surface-secondary text-content-tertiary'
                  )}>
                    {badge.earned ? '획득 완료' : '도전 중'}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-content-secondary">{badge.progressText}</span>
                  {badge.earned && <span className="text-primary font-medium">컬렉션 등록</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
