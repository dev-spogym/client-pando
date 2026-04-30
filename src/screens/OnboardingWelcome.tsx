'use client';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowRight,
  Bell,
  ChevronRight,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { Brand, Button, Chip } from '@/components/ui';

const ONBOARDING_KEY = 'onboarding_completed';
const ONBOARDING_DRAFT_KEY = 'onboarding_welcome_draft';

const INTEREST_OPTIONS = [
  { key: 'health', label: '헬스', emoji: '💪' },
  { key: 'pt', label: 'PT', emoji: '🏋️' },
  { key: 'pilates', label: '필라테스', emoji: '🧘' },
  { key: 'yoga', label: '요가', emoji: '🕉️' },
  { key: 'golf', label: '골프', emoji: '⛳' },
  { key: 'spinning', label: '스피닝', emoji: '🚴' },
  { key: 'crossfit', label: '크로스핏', emoji: '🤸' },
  { key: 'boxing', label: '복싱', emoji: '🥊' },
  { key: 'swimming', label: '수영', emoji: '🏊' },
] as const;

const GOAL_OPTIONS = [
  { key: 'diet', label: '다이어트' },
  { key: 'strength', label: '근력 강화' },
  { key: 'rehab', label: '재활' },
  { key: 'stress', label: '스트레스 해소' },
  { key: 'body-profile', label: '바디프로필' },
  { key: 'senior', label: '시니어 건강' },
] as const;

interface OnboardingDraft {
  interests: string[];
  goals: string[];
  locationGranted: boolean;
  notificationGranted: boolean;
}

const DEFAULT_DRAFT: OnboardingDraft = {
  interests: [],
  goals: [],
  locationGranted: false,
  notificationGranted: false,
};

function readDraft(): OnboardingDraft {
  if (typeof window === 'undefined') return DEFAULT_DRAFT;
  try {
    const raw = window.localStorage.getItem(ONBOARDING_DRAFT_KEY);
    if (!raw) return DEFAULT_DRAFT;
    const parsed = JSON.parse(raw) as Partial<OnboardingDraft>;
    return {
      interests: Array.isArray(parsed.interests) ? parsed.interests : [],
      goals: Array.isArray(parsed.goals) ? parsed.goals : [],
      locationGranted: Boolean(parsed.locationGranted),
      notificationGranted: Boolean(parsed.notificationGranted),
    };
  } catch {
    return DEFAULT_DRAFT;
  }
}

function persistDraft(draft: OnboardingDraft) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // 용량 부족 등 무시
  }
}

function markCompleted() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ONBOARDING_KEY, '1');
    window.localStorage.removeItem(ONBOARDING_DRAFT_KEY);
  } catch {
    // 무시
  }
}

const TOTAL_STEPS = 4;

/** 신규 회원 온보딩 (4단계) */
export default function OnboardingWelcome() {
  const navigate = useNavigate();
  const { member } = useAuthStore();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<OnboardingDraft>(DEFAULT_DRAFT);
  const [hydrated, setHydrated] = useState(false);

  // 초기 hydration: localStorage 드래프트 복구
  useEffect(() => {
    setDraft(readDraft());
    setHydrated(true);
  }, []);

  // 드래프트 자동 저장
  useEffect(() => {
    if (!hydrated) return;
    persistDraft(draft);
  }, [draft, hydrated]);

  const memberName = member?.name ?? '회원';

  const interestSet = useMemo(() => new Set(draft.interests), [draft.interests]);
  const goalSet = useMemo(() => new Set(draft.goals), [draft.goals]);

  const toggleInterest = (key: string) => {
    setDraft((prev) => {
      const next = new Set(prev.interests);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { ...prev, interests: Array.from(next) };
    });
  };

  const toggleGoal = (key: string) => {
    setDraft((prev) => {
      const next = new Set(prev.goals);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { ...prev, goals: Array.from(next) };
    });
  };

  const handleLocationAllow = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setDraft((prev) => ({ ...prev, locationGranted: true }));
          toast.success('위치 권한이 허용되었어요');
        },
        () => {
          setDraft((prev) => ({ ...prev, locationGranted: true }));
          toast.message('나중에 설정에서도 변경할 수 있어요');
        },
        { timeout: 5000 }
      );
    } else {
      setDraft((prev) => ({ ...prev, locationGranted: true }));
      toast.success('위치 권한이 허용되었어요');
    }
  };

  const handleNotificationAllow = async () => {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const result = await Notification.requestPermission();
        if (result === 'granted') {
          toast.success('알림이 켜졌어요');
        } else {
          toast.message('나중에 설정에서 변경할 수 있어요');
        }
      }
    } catch {
      // 환경 미지원 무시
    } finally {
      setDraft((prev) => ({ ...prev, notificationGranted: true }));
    }
  };

  const canNext = (() => {
    if (step === 1) return true;
    if (step === 2) return true; // skip 가능
    if (step === 3) return draft.interests.length >= 1;
    if (step === 4) return draft.goals.length >= 1;
    return false;
  })();

  const goNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }
    handleComplete();
  };

  const goSkip = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate(-1);
    }
  };

  const handleComplete = () => {
    markCompleted();
    toast.success(`환영해요, ${memberName}님!`);
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface page-with-action flex flex-col">
      {/* 진척률 바 + 상단 액션 */}
      <header className="px-5 pt-5">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={goBack}
            className="text-body-sm text-content-tertiary"
          >
            {step === 1 ? '' : '이전'}
          </button>
          <span className="text-caption text-content-tertiary">
            {step} / {TOTAL_STEPS}
          </span>
          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={goSkip}
              className="text-body-sm text-content-tertiary"
            >
              건너뛰기
            </button>
          ) : (
            <span className="w-12" />
          )}
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }, (_, idx) => idx + 1).map((item) => (
            <div
              key={item}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors duration-300',
                item <= step ? 'bg-primary' : 'bg-line'
              )}
            />
          ))}
        </div>
      </header>

      <div className="flex-1 px-5 pt-8 pb-8">
        {step === 1 && <Step1Welcome name={memberName} />}
        {step === 2 && (
          <Step2Permission
            locationGranted={draft.locationGranted}
            notificationGranted={draft.notificationGranted}
            onLocation={handleLocationAllow}
            onNotification={handleNotificationAllow}
          />
        )}
        {step === 3 && (
          <Step3Interest
            selected={interestSet}
            onToggle={toggleInterest}
          />
        )}
        {step === 4 && (
          <Step4Goal selected={goalSet} onToggle={toggleGoal} />
        )}
      </div>

      <div className="bottom-action-bar">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canNext}
          rightIcon={
            step === TOTAL_STEPS ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )
          }
          onClick={goNext}
        >
          {step === TOTAL_STEPS ? 'BODY SWITCH 시작하기' : '다음'}
        </Button>
      </div>
    </div>
  );
}

/** 1단계 환영 */
function Step1Welcome({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center text-center pt-8">
      <Brand size="lg" />
      <div className="mt-10 w-full">
        <div className="aspect-[4/3] w-full rounded-card-lg bg-gradient-to-br from-primary-light to-accent-light flex items-center justify-center overflow-hidden">
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-surface shadow-card-elevated flex items-center justify-center">
              <Sparkles className="w-9 h-9 text-primary" strokeWidth={2.2} />
            </div>
            <p className="text-h3 text-primary-deep">새로운 운동 여정의 시작</p>
          </div>
        </div>
      </div>
      <h1 className="text-display text-content mt-10">
        환영해요,
        <br />
        <span className="text-primary">{name}</span>님
      </h1>
      <p className="text-body-lg text-content-secondary mt-4 leading-relaxed">
        BODY SWITCH가 {name}님의 일상에
        <br />
        딱 맞는 운동을 추천해드릴게요.
      </p>
    </div>
  );
}

/** 2단계 권한 */
function Step2Permission({
  locationGranted,
  notificationGranted,
  onLocation,
  onNotification,
}: {
  locationGranted: boolean;
  notificationGranted: boolean;
  onLocation: () => void;
  onNotification: () => void;
}) {
  return (
    <div>
      <h2 className="text-h1 text-content">조금 더 편하게,</h2>
      <p className="text-h1 text-content">권한을 허용해주세요</p>
      <p className="text-body text-content-secondary mt-3">
        더 정확한 추천과 알림을 위해 두 가지 권한이 필요해요.
      </p>

      <div className="mt-8 space-y-3">
        <PermissionCard
          icon={<MapPin className="w-6 h-6" strokeWidth={2.2} />}
          title="위치 권한"
          description="가까운 BODY SWITCH 센터를 추천해드릴게요"
          granted={locationGranted}
          onAllow={onLocation}
        />
        <PermissionCard
          icon={<Bell className="w-6 h-6" strokeWidth={2.2} />}
          title="알림 권한"
          description="수업 시작·결제·이벤트 알림을 보내드릴게요"
          granted={notificationGranted}
          onAllow={onNotification}
        />
      </div>

      <p className="text-caption text-content-tertiary mt-5">
        * 권한은 언제든지 설정에서 변경할 수 있어요
      </p>
    </div>
  );
}

function PermissionCard({
  icon,
  title,
  description,
  granted,
  onAllow,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  granted: boolean;
  onAllow: () => void;
}) {
  return (
    <div
      className={cn(
        'rounded-card-lg p-4 border transition-colors',
        granted
          ? 'border-primary bg-primary-light'
          : 'border-line bg-surface-secondary'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'w-12 h-12 rounded-card flex items-center justify-center flex-shrink-0',
            granted ? 'bg-primary text-white' : 'bg-surface text-primary'
          )}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-h4 text-content">{title}</p>
          <p className="text-body-sm text-content-secondary mt-1">
            {description}
          </p>
        </div>
      </div>
      <Button
        variant={granted ? 'secondary' : 'primary'}
        size="md"
        fullWidth
        onClick={onAllow}
        className="mt-3"
        disabled={granted}
      >
        {granted ? '허용됨' : '허용하기'}
      </Button>
    </div>
  );
}

/** 3단계 관심 종목 */
function Step3Interest({
  selected,
  onToggle,
}: {
  selected: Set<string>;
  onToggle: (key: string) => void;
}) {
  return (
    <div>
      <h2 className="text-h1 text-content">관심 있는 종목을</h2>
      <p className="text-h1 text-content">알려주세요</p>
      <p className="text-body text-content-secondary mt-3">
        최소 1개 이상 선택해주세요. 여러 개도 가능해요.
      </p>

      <div className="mt-8 grid grid-cols-3 gap-2.5">
        {INTEREST_OPTIONS.map((option) => {
          const active = selected.has(option.key);
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => onToggle(option.key)}
              className={cn(
                'aspect-square rounded-card-lg border flex flex-col items-center justify-center gap-1.5',
                'transition-colors active:scale-[0.97]',
                active
                  ? 'border-primary bg-primary-light shadow-chip-active'
                  : 'border-line bg-surface'
              )}
            >
              <span className="text-h1">{option.emoji}</span>
              <span
                className={cn(
                  'text-body-sm font-medium',
                  active ? 'text-primary' : 'text-content-secondary'
                )}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-caption text-content-tertiary mt-4">
        선택됨 {selected.size}개
      </p>
    </div>
  );
}

/** 4단계 운동 목표 */
function Step4Goal({
  selected,
  onToggle,
}: {
  selected: Set<string>;
  onToggle: (key: string) => void;
}) {
  return (
    <div>
      <h2 className="text-h1 text-content">어떤 목표를</h2>
      <p className="text-h1 text-content">이루고 싶으세요?</p>
      <p className="text-body text-content-secondary mt-3">
        목표에 맞는 프로그램을 추천해드릴게요. 여러 개 선택 가능.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {GOAL_OPTIONS.map((option) => (
          <Chip
            key={option.key}
            size="lg"
            active={selected.has(option.key)}
            onClick={() => onToggle(option.key)}
          >
            {option.label}
          </Chip>
        ))}
      </div>

      <p className="text-caption text-content-tertiary mt-4">
        선택됨 {selected.size}개
      </p>
    </div>
  );
}
