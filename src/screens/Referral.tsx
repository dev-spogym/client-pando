'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import {
  Check,
  Copy,
  Gift,
  Instagram,
  Link2,
  MessageCircle,
  Sparkles,
  Ticket,
  UserPlus,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Badge, Button, Card, EmptyState, Input, PageHeader } from '@/components/ui';
import { cn, formatCurrency } from '@/lib/utils';
import {
  REFERRAL_STEPS,
  SAMPLE_REFERRAL_FRIENDS,
  getReferralStatusMeta,
  type ReferralFriend,
  type ReferralStatus,
} from '@/lib/rewards';

const STATUS_ORDER: Record<ReferralStatus, number> = {
  registered: 1,
  paid: 2,
  reviewed: 3,
};

function buildReferralCode(memberId: number | undefined) {
  // mock 추천 코드 — 회원 ID 기반으로 생성, ID 없으면 데모 코드
  const seed = memberId ?? 12345;
  const alpha = 'HSAJBKLMNPQRTV';
  const tail = String(seed).padStart(5, '0').slice(-5);
  const head = alpha[seed % alpha.length] + alpha[(seed + 3) % alpha.length] + alpha[(seed + 7) % alpha.length];
  return `${head}${tail}`;
}

/** 친구 초대 / 추천 화면 */
export default function Referral() {
  const { member } = useAuthStore();
  const referralCode = useMemo(() => buildReferralCode(member?.id), [member?.id]);
  const referralLink = useMemo(() => `https://app.pando.kr/r/${referralCode}`, [referralCode]);

  const [friends] = useState<ReferralFriend[]>(SAMPLE_REFERRAL_FRIENDS);
  const [referrerInput, setReferrerInput] = useState('');
  const [referrerApplied, setReferrerApplied] = useState<string | null>(null);

  const totalReward = friends.reduce((sum, f) => sum + f.rewardAmount, 0);
  const reviewedCount = friends.filter((f) => f.status === 'reviewed').length;
  const paidCount = friends.filter((f) => STATUS_ORDER[f.status] >= STATUS_ORDER.paid).length;

  const stepProgress = useMemo(
    () => ({
      registered: friends.length,
      paid: paidCount,
      reviewed: reviewedCount,
    }),
    [friends.length, paidCount, reviewedCount]
  );

  const handleCopyCode = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(referralCode);
      }
      toast.success('추천 코드를 복사했어요');
    } catch {
      toast.error('복사에 실패했어요. 직접 입력해 주세요');
    }
  };

  const handleCopyLink = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(referralLink);
      }
      toast.success('초대 링크를 복사했어요');
    } catch {
      toast.error('복사에 실패했어요');
    }
  };

  const handleShareKakao = () => {
    toast('카카오톡 공유 시트를 열었어요', {
      description: '친구를 선택해 초대해 보세요',
    });
  };

  const handleShareInstagram = () => {
    toast('인스타그램 스토리로 공유했어요', {
      description: '추천 코드와 함께 자동 카드가 들어갔어요',
    });
  };

  const handleApplyReferrer = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = referrerInput.trim().toUpperCase();
    if (!value) {
      toast.error('추천 코드를 입력해 주세요');
      return;
    }
    if (value.length < 6) {
      toast.error('코드 형식이 올바르지 않아요');
      return;
    }
    if (value === referralCode) {
      toast.error('자기 자신의 코드는 입력할 수 없어요');
      return;
    }
    setReferrerApplied(value);
    setReferrerInput('');
    toast.success(`추천인 코드 ${value} 가 적용됐어요`, {
      description: '첫 결제 후 추천인에게 보상이 지급돼요',
    });
  };

  return (
    <div className="min-h-screen bg-surface-secondary pb-12">
      <PageHeader title="친구 초대" />

      <div className="px-5 py-4 space-y-5">
        {/* ── Hero 카드 ─────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-card-lg p-5 text-white shadow-card-elevated bg-gradient-to-br from-primary-deep via-primary to-accent">
          <div className="absolute -top-8 -right-6 w-40 h-40 rounded-full bg-white/15 blur-2xl" aria-hidden />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 bg-white/15 rounded-pill px-2.5 py-1 backdrop-blur-sm">
              <Gift className="w-3.5 h-3.5" />
              <span className="text-caption font-semibold">친구 초대 이벤트</span>
            </div>
            <h2 className="mt-3 text-h1 font-bold leading-snug">
              친구 초대하면 <br />둘 다 <span className="text-yellow-200">1만원 적립!</span>
            </h2>
            <p className="mt-2 text-body-sm text-white/85">
              친구가 첫 결제까지 마치면 양쪽 모두 적립금이 들어와요.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-card bg-white/15 backdrop-blur-sm p-3">
                <p className="text-caption text-white/85">초대한 친구</p>
                <p className="mt-1 text-h2 font-bold">{friends.length}명</p>
              </div>
              <div className="rounded-card bg-white/15 backdrop-blur-sm p-3">
                <p className="text-caption text-white/85">누적 적립</p>
                <p className="mt-1 text-h2 font-bold">{formatCurrency(totalReward)}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 내 추천 코드 카드 ──────────────────────────── */}
        <Card variant="elevated" padding="lg">
          <p className="text-caption text-content-tertiary">내 추천 코드</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-display font-bold text-content tracking-[0.2em]">{referralCode}</p>
            <button
              type="button"
              onClick={handleCopyCode}
              className="w-11 h-11 rounded-full bg-primary-light text-primary inline-flex items-center justify-center active:bg-primary-soft"
              aria-label="추천 코드 복사"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
          <p className="mt-3 text-caption text-content-tertiary">초대 링크</p>
          <div className="mt-1 flex items-center justify-between gap-3 rounded-card bg-surface-secondary px-3 py-2.5">
            <p className="text-body-sm text-content-secondary truncate">{referralLink}</p>
            <button
              type="button"
              onClick={handleCopyLink}
              className="text-caption font-semibold text-primary shrink-0"
            >
              링크 복사
            </button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleShareKakao}
              className="flex flex-col items-center gap-1.5 rounded-card bg-[#FEE500] py-3 active:opacity-90"
            >
              <MessageCircle className="w-5 h-5 text-[#3B1E1E]" />
              <span className="text-caption font-semibold text-[#3B1E1E]">카카오톡</span>
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex flex-col items-center gap-1.5 rounded-card bg-surface-tertiary py-3 active:bg-line"
            >
              <Link2 className="w-5 h-5 text-content" />
              <span className="text-caption font-semibold text-content">링크 복사</span>
            </button>
            <button
              type="button"
              onClick={handleShareInstagram}
              className="flex flex-col items-center gap-1.5 rounded-card bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] py-3 active:opacity-90"
            >
              <Instagram className="w-5 h-5 text-white" />
              <span className="text-caption font-semibold text-white">인스타</span>
            </button>
          </div>
        </Card>

        {/* ── 초대 진행 단계 ─────────────────────────────── */}
        <section>
          <h3 className="text-h3 text-content px-1 mb-3">초대 진행 단계</h3>
          <Card variant="soft" padding="md">
            <ol className="space-y-3">
              {REFERRAL_STEPS.map((step) => {
                const count = stepProgress[step.status];
                const reached = count > 0;
                return (
                  <li key={step.step} className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center text-body-sm font-bold shrink-0',
                        reached ? 'bg-primary text-white' : 'bg-surface-tertiary text-content-tertiary'
                      )}
                    >
                      {reached ? <Check className="w-4 h-4" /> : step.step}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-body font-semibold text-content">{step.title}</p>
                        <Badge tone={reached ? 'success' : 'neutral'} variant="soft">
                          +{step.reward.toLocaleString('ko-KR')}원
                        </Badge>
                      </div>
                      <p className="text-body-sm text-content-secondary mt-0.5">{step.description}</p>
                      <p className="text-caption text-content-tertiary mt-1">
                        달성 친구 {count}명
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>
        </section>

        {/* ── 친구 초대 현황 ─────────────────────────────── */}
        <section>
          <div className="flex items-end justify-between px-1 mb-3">
            <h3 className="text-h3 text-content">초대 친구 ({friends.length})</h3>
            <span className="text-caption text-content-tertiary">최근 가입순</span>
          </div>

          {friends.length === 0 ? (
            <Card variant="soft" padding="md">
              <EmptyState
                icon={<UserPlus className="w-7 h-7" />}
                title="아직 초대한 친구가 없어요"
                description="추천 코드를 공유하고 첫 친구를 초대해 보세요"
                size="sm"
              />
            </Card>
          ) : (
            <Card variant="soft" padding="none">
              <ul className="divide-y divide-line-light">
                {friends.map((friend) => {
                  const meta = getReferralStatusMeta(friend.status);
                  return (
                    <li key={friend.id} className="flex items-center gap-3 px-4 py-3.5">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-body-sm font-bold text-content shrink-0"
                        style={{ backgroundColor: friend.avatarColor }}
                        aria-label={`${friend.name} 아바타`}
                      >
                        {friend.name.slice(0, 1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-body font-semibold text-content truncate">{friend.name}</p>
                        <p className="text-caption text-content-tertiary mt-0.5">
                          {friend.joinedAt} 가입
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge tone={meta.tone} variant="soft">
                          {meta.label}
                        </Badge>
                        <p className="mt-1 text-caption font-bold text-primary">
                          +{friend.rewardAmount.toLocaleString('ko-KR')}원
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="border-t border-line-light px-4 py-3 flex items-center justify-between">
                <span className="text-body-sm text-content-secondary inline-flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary" />
                  누적 적립 합계
                </span>
                <span className="text-h3 text-primary">{formatCurrency(totalReward)}</span>
              </div>
            </Card>
          )}
        </section>

        {/* ── 추천인 코드 입력 ───────────────────────────── */}
        <section>
          <h3 className="text-h3 text-content px-1 mb-3">추천인 코드 입력</h3>
          <Card variant="outline" padding="md">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-card bg-primary-light text-primary flex items-center justify-center shrink-0">
                <Ticket className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1">
                <p className="text-body font-semibold text-content">친구 추천으로 가입했나요?</p>
                <p className="text-body-sm text-content-secondary mt-0.5">
                  가입 후 30일 이내에 추천인 코드를 입력하면 양쪽 모두 보상을 받아요.
                </p>
              </div>
            </div>
            {referrerApplied ? (
              <div className="rounded-card bg-state-success/10 px-3 py-3 flex items-center gap-2">
                <Check className="w-4 h-4 text-state-success" />
                <span className="text-body-sm text-state-success font-semibold">
                  적용된 코드: {referrerApplied}
                </span>
              </div>
            ) : (
              <form className="flex items-center gap-2" onSubmit={handleApplyReferrer}>
                <Input
                  value={referrerInput}
                  onChange={(e) => setReferrerInput(e.target.value.toUpperCase())}
                  placeholder="예: HSA12345"
                  maxLength={12}
                  className="flex-1 uppercase tracking-widest"
                  aria-label="추천인 코드"
                />
                <Button type="submit" size="md" variant="primary">
                  적용
                </Button>
              </form>
            )}
          </Card>
        </section>
      </div>
    </div>
  );
}
