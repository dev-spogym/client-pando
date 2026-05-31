'use client';

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight, CalendarClock, Coins, ReceiptText } from 'lucide-react';
import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { cn, formatCurrency } from '@/lib/utils';

type MileageType = 'earn' | 'use' | 'expire';

interface MileageHistoryItem {
  id: string;
  type: MileageType;
  title: string;
  amount: number;
  date: string;
  expiresAt?: string;
}

const HISTORY: MileageHistoryItem[] = [
  { id: 'm-001', type: 'earn', title: 'PT 10회권 결제 적립', amount: 5000, date: '2026-05-21', expiresAt: '2027-05-20' },
  { id: 'm-002', type: 'use', title: '상품 결제 사용', amount: 3000, date: '2026-05-18' },
  { id: 'm-003', type: 'earn', title: '친구 초대 보상', amount: 10000, date: '2026-05-12', expiresAt: '2027-05-11' },
  { id: 'm-004', type: 'expire', title: '유효기간 만료', amount: 1500, date: '2026-04-30' },
];

const TYPE_META: Record<MileageType, { label: string; tone: 'success' | 'error' | 'warning'; icon: typeof Coins; sign: string; className: string }> = {
  earn: { label: '적립', tone: 'success', icon: ArrowUpRight, sign: '+', className: 'text-state-success' },
  use: { label: '사용', tone: 'error', icon: ArrowDownRight, sign: '-', className: 'text-state-error' },
  expire: { label: '소멸', tone: 'warning', icon: CalendarClock, sign: '-', className: 'text-state-warning' },
};

export default function Mileage() {
  const navigate = useNavigate();
  const { member } = useAuthStore();
  const balance = member?.mileage ?? 0;
  const expiringSoon = 1500;

  const summary = useMemo(() => {
    const earned = HISTORY.filter((item) => item.type === 'earn').reduce((sum, item) => sum + item.amount, 0);
    const used = HISTORY.filter((item) => item.type !== 'earn').reduce((sum, item) => sum + item.amount, 0);
    return { earned, used };
  }, []);

  return (
    <div className="min-h-screen bg-surface-secondary pb-12">
      <PageHeader title="마일리지" showBack />

      <div className="px-5 py-4 space-y-5">
        <section className="rounded-card-lg bg-gradient-to-br from-primary to-primary-deep p-5 text-white shadow-card-elevated">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-body-sm text-white/75">사용 가능 마일리지</p>
              <p className="mt-1 text-display font-bold">
                {balance.toLocaleString('ko-KR')}
                <span className="ml-1 text-h3 font-medium text-white/80">P</span>
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
              <Coins className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-card bg-white/12 p-3">
              <p className="text-caption text-white/70">누적 적립</p>
              <p className="mt-1 text-h3 font-bold">{summary.earned.toLocaleString('ko-KR')}P</p>
            </div>
            <div className="rounded-card bg-white/12 p-3">
              <p className="text-caption text-white/70">사용/소멸</p>
              <p className="mt-1 text-h3 font-bold">{summary.used.toLocaleString('ko-KR')}P</p>
            </div>
          </div>
        </section>

        <Card variant="soft" padding="md">
          <div className="flex items-start gap-3">
            <CalendarClock className="mt-0.5 h-5 w-5 text-state-warning" />
            <div className="flex-1">
              <p className="text-body font-semibold text-content">30일 내 소멸 예정</p>
              <p className="mt-1 text-body-sm text-content-secondary">
                {expiringSoon.toLocaleString('ko-KR')}P가 2026년 6월 30일에 소멸 예정입니다.
              </p>
            </div>
            <Badge tone="warning" variant="soft">D-30</Badge>
          </div>
        </Card>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-h4 text-content">적립 / 사용 이력</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/checkout/manual')}>
              사용하기
            </Button>
          </div>
          <div className="space-y-3">
            {HISTORY.map((item) => {
              const meta = TYPE_META[item.type];
              const Icon = meta.icon;
              return (
                <Card key={item.id} variant="elevated" padding="md">
                  <div className="flex items-start gap-3">
                    <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-tertiary', meta.className)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-body font-semibold text-content">{item.title}</p>
                          <p className="mt-1 text-caption text-content-tertiary">{item.date}</p>
                        </div>
                        <div className="text-right">
                          <p className={cn('text-body font-bold', meta.className)}>
                            {meta.sign}{item.amount.toLocaleString('ko-KR')}P
                          </p>
                          <Badge tone={meta.tone} variant="soft" size="sm">{meta.label}</Badge>
                        </div>
                      </div>
                      {item.expiresAt && (
                        <p className="mt-2 text-caption text-content-tertiary">소멸 예정일 {item.expiresAt}</p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <Card variant="soft" padding="md">
          <div className="flex items-start gap-3">
            <ReceiptText className="mt-0.5 h-5 w-5 text-primary" />
            <div className="space-y-1 text-body-sm text-content-secondary">
              <p>1P는 {formatCurrency(1)}으로 결제 시 사용할 수 있습니다.</p>
              <p>마일리지는 결제 옵션 화면에서 회원이 직접 선택한 경우에만 차감됩니다.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
