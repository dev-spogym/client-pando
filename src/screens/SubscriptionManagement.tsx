'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, CalendarDays, CreditCard, PauseCircle, PlayCircle, RefreshCw, XCircle } from 'lucide-react';
import { Badge, Button, Card, PageHeader } from '@/components/ui';

const BILLING_HISTORY = [
  { id: 'b-001', date: '2026-05-10', amount: 99000, status: '결제완료' },
  { id: 'b-002', date: '2026-04-10', amount: 99000, status: '결제완료' },
  { id: 'b-003', date: '2026-03-10', amount: 99000, status: '결제완료' },
];

export default function SubscriptionManagement() {
  const [paused, setPaused] = useState(false);

  const handlePauseToggle = () => {
    setPaused((value) => !value);
    toast.success(paused ? '자동결제를 재개했어요' : '자동결제를 일시정지했어요');
  };

  return (
    <div className="min-h-screen bg-surface-secondary pb-12">
      <PageHeader title="구독 / 자동결제" showBack />

      <div className="px-5 py-4 space-y-5">
        <section className="rounded-card-lg bg-surface p-5 shadow-card-elevated">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge tone={paused ? 'warning' : 'success'} variant="soft">
                {paused ? '일시정지' : '구독중'}
              </Badge>
              <h2 className="mt-3 text-h2 font-bold text-content">프리미엄 멤버십</h2>
              <p className="mt-1 text-body-sm text-content-secondary">월 99,000원 자동결제</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
              <RefreshCw className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-card bg-surface-secondary p-3">
              <p className="text-caption text-content-tertiary">다음 결제일</p>
              <p className="mt-1 text-body font-bold text-content">2026.06.10</p>
            </div>
            <div className="rounded-card bg-surface-secondary p-3">
              <p className="text-caption text-content-tertiary">Grace period</p>
              <p className="mt-1 text-body font-bold text-content">실패 후 7일</p>
            </div>
          </div>
        </section>

        <Card variant="soft" padding="md">
          <div className="flex items-start gap-3">
            <CreditCard className="mt-0.5 h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-body font-semibold text-content">기본 결제수단</p>
              <p className="mt-1 text-body-sm text-content-secondary">현대카드 **** 4412</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => toast.message('결제수단 화면으로 이동합니다')}>
              변경
            </Button>
          </div>
        </Card>

        <section className="grid grid-cols-2 gap-3">
          <Button variant={paused ? 'primary' : 'secondary'} size="lg" onClick={handlePauseToggle}>
            {paused ? <PlayCircle className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}
            {paused ? '재개' : '일시정지'}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => toast.error('구독 해지는 본인 확인 후 진행됩니다')}
          >
            <XCircle className="h-4 w-4" />
            해지
          </Button>
        </section>

        <Card variant="soft" padding="md">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-state-warning" />
            <p className="text-body-sm text-content-secondary">
              자동결제 실패 시 회원에게 즉시 알림을 보내고 7일 안에 결제수단을 변경하지 않으면 구독이 일시정지됩니다.
            </p>
          </div>
        </Card>

        <section>
          <h2 className="mb-3 text-h4 text-content">결제 내역</h2>
          <div className="space-y-3">
            {BILLING_HISTORY.map((item) => (
              <Card key={item.id} variant="elevated" padding="md">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-content-tertiary" />
                  <div className="flex-1">
                    <p className="text-body font-semibold text-content">{item.date}</p>
                    <p className="mt-1 text-caption text-content-tertiary">정기 자동결제</p>
                  </div>
                  <div className="text-right">
                    <p className="text-body font-bold text-content">{item.amount.toLocaleString('ko-KR')}원</p>
                    <Badge tone="success" variant="soft" size="sm">{item.status}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
