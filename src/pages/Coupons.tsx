import { useEffect, useState } from 'react';
import { ArrowLeft, Gift, Coins, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { cn, formatDateKo, formatCurrency } from '@/lib/utils';

interface CouponItem {
  id: number;
  name: string;
  type: string;
  value: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

/** 쿠폰/마일리지 페이지 */
export default function Coupons() {
  const navigate = useNavigate();
  const { member } = useAuthStore();
  const [tab, setTab] = useState<'coupon' | 'mileage'>('coupon');
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!member) return;
    fetchCoupons();
  }, [member]);

  const fetchCoupons = async () => {
    if (!member) return;
    setLoading(true);

    const { data } = await supabase
      .from('coupons')
      .select('id, name, type, value, validFrom, validUntil, isActive')
      .eq('branchId', member.branchId)
      .eq('isActive', true)
      .gte('validUntil', new Date().toISOString())
      .order('validUntil');

    setCoupons(data || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-surface sticky top-0 z-10 border-b border-line">
        <div className="flex items-center px-4 pt-safe-top h-14">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-content" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-lg">쿠폰/마일리지</h1>
          <div className="w-6" />
        </div>
      </header>

      {/* 마일리지 요약 */}
      <div className="bg-gradient-to-r from-primary to-primary-dark mx-4 mt-4 rounded-xl p-5 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Coins className="w-5 h-5 text-white/80" />
          <span className="text-sm text-white/80">보유 마일리지</span>
        </div>
        <p className="text-3xl font-bold">{member?.mileage?.toLocaleString() || 0}<span className="text-lg font-normal">P</span></p>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-line mt-4 bg-surface">
        {[
          { key: 'coupon' as const, label: '쿠폰', icon: Ticket },
          { key: 'mileage' as const, label: '마일리지', icon: Coins },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex-1 py-3 text-sm font-medium relative flex items-center justify-center gap-1.5',
              tab === t.key ? 'text-primary' : 'text-content-tertiary'
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            {tab === t.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
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
                        <span className="text-[10px] text-primary/70 mt-0.5">
                          {isPercentage ? '할인' : '할인'}
                        </span>
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
              <h3 className="font-semibold text-sm mb-3">마일리지 안내</h3>
              <div className="space-y-2 text-sm text-content-secondary">
                <p>결제 금액의 1% 적립</p>
                <p>1P = 1원으로 결제 시 사용 가능</p>
                <p>적립 후 1년 내 미사용 시 소멸</p>
              </div>
            </div>
            <div className="bg-surface rounded-card p-4 shadow-card">
              <h3 className="font-semibold text-sm mb-3">적립/사용 내역</h3>
              <div className="text-center py-4 text-content-tertiary text-sm">
                마일리지 이력이 없습니다
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
