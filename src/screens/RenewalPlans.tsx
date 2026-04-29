import { useState } from 'react';
import { Check, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { buildRenewalPlans } from '@/lib/memberExperience';
import { calcDday, cn, formatCurrency, formatDateKo } from '@/lib/utils';
import { Button, Card, Badge, PageHeader, PriceTag } from '@/components/ui';

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
      <PageHeader title="재등록 추천 플랜" showBack />

      <div className="px-4 py-4 space-y-4 pb-32">
        <Card variant="soft" padding="lg">
          <p className="text-caption text-content-tertiary">현재 이용권</p>
          <h2 className="text-h3 text-content mt-1">{member.membershipType || '회원권'}</h2>
          <div className="mt-3 flex items-center justify-between text-body-sm">
            <span className="text-content-secondary">만료일</span>
            <span className="font-medium">
              {member.membershipExpiry ? formatDateKo(member.membershipExpiry) : '미확인'}
              {dday !== null && (
                <span className="ml-2 text-primary font-semibold">D-{Math.max(dday, 0)}</span>
              )}
            </span>
          </div>
        </Card>

        <section className="space-y-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              variant="soft"
              padding="lg"
              interactive
              className={cn('border transition-colors', selectedPlan?.id === plan.id ? 'border-primary' : 'border-transparent')}
              onClick={() => setSelectedPlanId(plan.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge tone="primary" size="sm">{plan.badge}</Badge>
                    <h3 className="text-h3 text-content">{plan.name}</h3>
                  </div>
                  <p className="text-body-sm text-content-secondary">{plan.description}</p>
                </div>
                {selectedPlan?.id === plan.id && (
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="mt-4">
                <PriceTag
                  price={plan.price}
                  originalPrice={plan.originalPrice}
                  showDiscountPercent
                  size="md"
                />
              </div>

              <div className="mt-4 space-y-2">
                {plan.benefits.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-body-sm text-content-secondary">
                    <Check className="w-4 h-4 text-state-success" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </section>
      </div>

      <div className="bottom-action-bar">
        <div className="max-w-lg mx-auto space-y-2">
          <Button
            variant="primary"
            size="xl"
            fullWidth
            leftIcon={<CreditCard className="w-4 h-4" />}
            onClick={handleCheckout}
          >
            {selectedPlan.name} 결제하기
          </Button>
          <Button
            variant="tertiary"
            size="xl"
            fullWidth
            onClick={() => navigate('/shop')}
          >
            다른 상품 보기
          </Button>
        </div>
      </div>
    </div>
  );
}
