import { useState } from 'react';
import { ArrowLeft, Check, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { buildRenewalPlans } from '@/lib/memberExperience';
import { calcDday, cn, formatCurrency, formatDateKo } from '@/lib/utils';

/** 재등록 추천 플랜 */
export default function RenewalPlans() {
  const navigate = useNavigate();
  const { member } = useAuthStore();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const plans = member ? buildRenewalPlans(member) : [];

  if (!member) return null;

  const selectedPlan = plans.find((item) => item.id === selectedPlanId) || plans[0];
  const dday = member.membershipExpiry ? calcDday(member.membershipExpiry) : null;

  const handleCheckout = () => {
    const params = new URLSearchParams({
      name: selectedPlan.name,
      price: String(selectedPlan.price),
      category: 'renewal',
      subtitle: selectedPlan.description,
    });
    navigate(`/checkout/manual?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-surface-secondary page-with-action">
      <header className="page-header-sticky">
        <div className="flex items-center px-4 pt-safe-top h-14">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-content" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-lg">재등록 추천 플랜</h1>
          <div className="w-6" />
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 pb-32">
        <section className="bg-surface rounded-card p-5 shadow-card">
          <p className="text-xs text-content-tertiary">현재 이용권</p>
          <h2 className="text-lg font-bold mt-1">{member.membershipType || '회원권'}</h2>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-content-secondary">만료일</span>
            <span className="font-medium">
              {member.membershipExpiry ? formatDateKo(member.membershipExpiry) : '미확인'}
              {dday !== null && <span className="ml-2 text-primary font-semibold">D-{Math.max(dday, 0)}</span>}
            </span>
          </div>
        </section>

        <section className="space-y-3">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={cn(
                'w-full bg-surface rounded-card p-5 shadow-card text-left border transition-colors',
                selectedPlan?.id === plan.id ? 'border-primary' : 'border-transparent'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 rounded-full bg-primary-light text-primary text-[11px] font-semibold">
                      {plan.badge}
                    </span>
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                  </div>
                  <p className="text-sm text-content-secondary">{plan.description}</p>
                </div>
                {selectedPlan?.id === plan.id && (
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-end gap-2">
                <span className="text-2xl font-bold">{formatCurrency(plan.price)}</span>
                <span className="text-sm text-content-tertiary line-through">{formatCurrency(plan.originalPrice)}</span>
              </div>

              <div className="mt-4 space-y-2">
                {plan.benefits.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-content-secondary">
                    <Check className="w-4 h-4 text-state-success" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </section>
      </div>

      <div className="bottom-action-bar">
        <div className="max-w-lg mx-auto space-y-2">
          <button
            onClick={handleCheckout}
            className="w-full py-3.5 rounded-button font-semibold bg-primary text-white flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            {selectedPlan.name} 결제하기
          </button>
          <button
            onClick={() => navigate('/shop')}
            className="w-full py-3.5 rounded-button font-semibold bg-surface-secondary text-content-secondary"
          >
            다른 상품 보기
          </button>
        </div>
      </div>
    </div>
  );
}
