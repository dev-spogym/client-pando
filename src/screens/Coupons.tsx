import { useEffect, useState } from 'react';
import { Coins, Gift, Medal, Ticket } from 'lucide-react';
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
import { PageHeader, EmptyState, Card, Badge } from '@/components/ui';

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
      <PageHeader title="리워드 센터" showBack />

      <div className="bg-gradient-to-r from-primary to-primary-dark mx-5 mt-4 rounded-card p-5 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Coins className="w-5 h-5 text-white/80" />
              <span className="text-body text-white/80">보유 마일리지</span>
            </div>
            <p className="text-display font-bold">
              {member.mileage.toLocaleString()}
              <span className="text-h4 font-normal">P</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-caption text-white/80">획득 배지</p>
            <p className="text-h1 font-bold">{earnedBadgeCount}개</p>
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
              'flex-1 py-3 text-body font-medium relative flex items-center justify-center gap-1.5',
              tab === item.key ? 'text-primary' : 'text-content-tertiary'
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
            {tab === item.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        ))}
      </div>

      <div className="px-5 py-4">
        {tab === 'coupon' && (
          loading ? (
            <div className="text-center py-8 text-content-tertiary text-body">불러오는 중...</div>
          ) : coupons.length === 0 ? (
            <EmptyState
              icon={<Gift className="w-8 h-8" />}
              title="사용 가능한 쿠폰이 없습니다"
              size="md"
            />
          ) : (
            <div className="space-y-3">
              {coupons.map((coupon) => {
                const isPercentage = coupon.type === '할인율';
                return (
                  <div key={coupon.id} className="bg-surface rounded-card overflow-hidden shadow-card-soft">
                    <div className="flex">
                      <div className="w-24 bg-primary-light flex flex-col items-center justify-center p-3">
                        <span className="text-h1 font-bold text-primary">
                          {isPercentage ? `${coupon.value}%` : formatCurrency(Number(coupon.value))}
                        </span>
                        <span className="text-[10px] text-primary/70 mt-0.5">할인</span>
                      </div>
                      <div className="flex-1 p-3">
                        <h4 className="font-semibold text-body">{coupon.name}</h4>
                        <p className="text-caption text-content-tertiary mt-1">
                          {formatDateKo(coupon.validFrom)} ~ {formatDateKo(coupon.validUntil)}
                        </p>
                        <div className="mt-2">
                          <Badge tone="success" variant="soft">사용가능</Badge>
                        </div>
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
            <Card variant="soft" padding="md">
              <h3 className="font-semibold text-body mb-3">마일리지 운영 기준</h3>
              <div className="space-y-2 text-body text-content-secondary">
                <p>결제 리워드는 마일리지로 통합 운영됩니다.</p>
                <p>1P = 1원으로 결제 시 사용 가능</p>
                <p>적립 후 1년 내 미사용 시 소멸</p>
              </div>
            </Card>
            <Card variant="soft" padding="md">
              <h3 className="font-semibold text-body mb-3">적립 / 사용 내역</h3>
              <div className="space-y-3">
                {mileageHistory.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-body font-medium">{item.label}</p>
                      <p className="text-caption text-content-tertiary mt-1">{item.date}</p>
                    </div>
                    <span className={cn(
                      'text-body font-semibold',
                      item.type === 'earn' ? 'text-state-success' : 'text-state-error'
                    )}>
                      {item.type === 'earn' ? '+' : '-'}
                      {item.amount.toLocaleString()}P
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab === 'badge' && (
          <div className="space-y-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={cn(
                  'rounded-card p-4 shadow-card-soft border',
                  badge.earned ? 'bg-surface border-primary/20' : 'bg-surface border-transparent'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'w-10 h-10 rounded-card flex items-center justify-center text-h4',
                        badge.tone === 'gold' && 'bg-state-warning/10',
                        badge.tone === 'blue' && 'bg-state-info/10',
                        badge.tone === 'green' && 'bg-state-success/10',
                        badge.tone === 'rose' && 'bg-state-error/10'
                      )}>
                        {badge.icon === 'Coins' ? 'P' : badge.icon === 'CalendarCheck' ? '출' : badge.icon === 'MessageSquare' ? '후' : badge.icon === 'LineChart' ? '리' : badge.icon === 'Target' ? '목' : '앱'}
                      </span>
                      <div>
                        <h3 className="text-body font-semibold">{badge.title}</h3>
                        <p className="text-caption text-content-tertiary mt-1">{badge.condition}</p>
                      </div>
                    </div>
                    <p className="text-body text-content-secondary mt-3 leading-relaxed">{badge.description}</p>
                  </div>
                  <Badge
                    tone={badge.earned ? 'primary' : 'neutral'}
                    variant="soft"
                  >
                    {badge.earned ? '획득 완료' : '도전 중'}
                  </Badge>
                </div>
                <div className="mt-4 flex items-center justify-between text-caption">
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
