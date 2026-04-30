'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Calendar,
  CreditCard,
  MessageSquare,
  Sparkles,
  Repeat,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/** 푸시 알림 페이로드 */
export interface PushPayload {
  /** 고유 id (자동 생성) */
  id: string;
  /** 카테고리 */
  category: 'lesson' | 'payment' | 'event' | 'review' | 'renewal';
  /** 알림 제목 */
  title: string;
  /** 알림 본문 */
  body: string;
  /** 클릭 시 진입 라우트 */
  href: string;
  /** 보낸 시각 (Date.now()) */
  timestamp: number;
}

/** 카테고리별 아이콘/색상 */
const CATEGORY_META: Record<
  PushPayload['category'],
  { icon: React.ReactNode; bg: string; iconColor: string }
> = {
  lesson: {
    icon: <Calendar className="w-5 h-5" strokeWidth={2.2} />,
    bg: 'bg-primary-light',
    iconColor: 'text-primary',
  },
  payment: {
    icon: <CreditCard className="w-5 h-5" strokeWidth={2.2} />,
    bg: 'bg-state-success/10',
    iconColor: 'text-state-success',
  },
  event: {
    icon: <Sparkles className="w-5 h-5" strokeWidth={2.2} />,
    bg: 'bg-state-warning/10',
    iconColor: 'text-state-warning',
  },
  review: {
    icon: <MessageSquare className="w-5 h-5" strokeWidth={2.2} />,
    bg: 'bg-accent-light',
    iconColor: 'text-accent-dark',
  },
  renewal: {
    icon: <Repeat className="w-5 h-5" strokeWidth={2.2} />,
    bg: 'bg-state-info/10',
    iconColor: 'text-state-info',
  },
};

/** 시뮬레이터에서 사용하는 푸시 시드 */
const PUSH_SEEDS: Omit<PushPayload, 'id' | 'timestamp'>[] = [
  {
    category: 'lesson',
    title: '수업 시작 1시간 전이에요',
    body: '필라테스 그룹 수업이 곧 시작돼요. 미리 도착해 워밍업 해볼까요?',
    href: '/classes',
  },
  {
    category: 'payment',
    title: '결제가 완료됐어요',
    body: '영수증이 발급되었어요. 주문 내역에서 확인해보세요.',
    href: '/payments',
  },
  {
    category: 'event',
    title: '이번 주 출석 이벤트 진행 중!',
    body: '3일 연속 출석하면 단백질 음료 1개 무료. 지금 바로 도전!',
    href: '/notices',
  },
  {
    category: 'review',
    title: '강사가 후기에 답변했어요',
    body: '내가 남긴 후기에 새 답변이 도착했어요.',
    href: '/scrap',
  },
  {
    category: 'renewal',
    title: 'PT 잔여 회차 3회',
    body: '재등록 시 추가 1회 + 5% 할인 쿠폰을 드려요.',
    href: '/renewal',
  },
];

/** 자동 닫힘까지의 ms */
const AUTO_CLOSE_MS = 5000;

/** 시뮬레이터 인터벌 (ms) — 데모 환경에서만 동작 */
const DEFAULT_INTERVAL_MS = 45_000;

let pushIdCounter = 0;

function makePush(seedIndex?: number): PushPayload {
  const index = seedIndex ?? Math.floor(Math.random() * PUSH_SEEDS.length);
  const seed = PUSH_SEEDS[index] ?? PUSH_SEEDS[0];
  pushIdCounter += 1;
  return {
    ...seed,
    id: `push-${Date.now()}-${pushIdCounter}`,
    timestamp: Date.now(),
  };
}

interface UsePushSimulatorOptions {
  /** 시뮬레이터 활성화 여부 (default: true) */
  enabled?: boolean;
  /** 푸시 발송 인터벌 ms (default: 45_000) */
  intervalMs?: number;
}

interface UsePushSimulatorResult {
  /** 현재 화면에 떠 있는 푸시 (없으면 null) */
  current: PushPayload | null;
  /** 수동 발송 트리거 */
  trigger: (seedIndex?: number) => void;
  /** 닫기 */
  dismiss: () => void;
}

/**
 * 푸시 시뮬레이터 훅
 *
 * 모바일 앱 환경을 흉내내기 위해 임의 인터벌마다 mock 푸시를 표시.
 * 실제 푸시 채널 대신 데모용으로 사용.
 */
export function usePushSimulator(
  options: UsePushSimulatorOptions = {}
): UsePushSimulatorResult {
  const { enabled = true, intervalMs = DEFAULT_INTERVAL_MS } = options;
  const [current, setCurrent] = useState<PushPayload | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trigger = useCallback((seedIndex?: number) => {
    setCurrent(makePush(seedIndex));
  }, []);

  const dismiss = useCallback(() => {
    setCurrent(null);
  }, []);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const schedule = () => {
      timerRef.current = setTimeout(() => {
        setCurrent(makePush());
        schedule();
      }, intervalMs);
    };

    schedule();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, intervalMs]);

  return { current, trigger, dismiss };
}

interface PushToastProps {
  /** 표시할 푸시 데이터 (null이면 렌더링 X) */
  push: PushPayload | null;
  /** 닫기 콜백 */
  onClose: () => void;
  /** 자동 닫힘 ms (default: 5000) */
  autoCloseMs?: number;
}

/**
 * 푸시 알림 토스트 컴포넌트
 *
 * 화면 상단에 잠시 떠올랐다 사라지는 모바일 푸시 카드.
 * - 5초 후 자동 닫힘
 * - 클릭 시 해당 라우트 진입
 * - 위로 스와이프 시 dismiss
 * - 모바일 프레임 폭에 맞춰 가로 위치 고정
 */
export default function PushToast({
  push,
  onClose,
  autoCloseMs = AUTO_CLOSE_MS,
}: PushToastProps) {
  const navigate = useNavigate();
  const startYRef = useRef<number | null>(null);
  const [translateY, setTranslateY] = useState(0);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 자동 닫힘
  useEffect(() => {
    if (!push) return;

    setTranslateY(0);
    closeTimerRef.current = setTimeout(() => {
      onClose();
    }, autoCloseMs);

    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [push, autoCloseMs, onClose]);

  const meta = useMemo(() => {
    if (!push) return null;
    return CATEGORY_META[push.category];
  }, [push]);

  if (!push || !meta) return null;

  const handleClick = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    navigate(push.href);
    onClose();
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    startYRef.current = event.touches[0].clientY;
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (startYRef.current === null) return;
    const delta = event.touches[0].clientY - startYRef.current;
    if (delta < 0) {
      setTranslateY(delta);
    }
  };

  const handleTouchEnd = () => {
    if (translateY < -40) {
      onClose();
    } else {
      setTranslateY(0);
    }
    startYRef.current = null;
  };

  return (
    <div
      className={cn(
        'mobile-floating-banner-top fixed z-[60] px-2',
        'pointer-events-none'
      )}
      style={{ top: 'calc(var(--safe-top, 0px) + 8px)' }}
    >
      <div
        role="alert"
        aria-live="polite"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
        style={{
          transform: `translateY(${translateY}px)`,
          transition: translateY === 0 ? 'transform 200ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
        }}
        className={cn(
          'pointer-events-auto cursor-pointer',
          'bg-surface rounded-card-lg shadow-card-elevated border border-line',
          'p-3 flex items-start gap-3 active:scale-[0.99]',
          'slide-down'
        )}
      >
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
            meta.bg,
            meta.iconColor
          )}
        >
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center gap-2">
            <Bell className="w-3 h-3 text-content-tertiary flex-shrink-0" />
            <span className="text-micro text-content-tertiary">
              BODY SWITCH
            </span>
            <span className="text-micro text-content-tertiary">·</span>
            <span className="text-micro text-content-tertiary">지금</span>
          </div>
          <p className="text-body-sm font-semibold text-content mt-0.5 truncate">
            {push.title}
          </p>
          <p className="text-caption text-content-secondary line-clamp-2 mt-0.5">
            {push.body}
          </p>
        </div>
      </div>
    </div>
  );
}
