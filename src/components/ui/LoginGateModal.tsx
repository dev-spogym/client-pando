'use client';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, X } from 'lucide-react';
import Button from './Button';

interface LoginGateModalProps {
  /** 모달 표시 여부 */
  open: boolean;
  /** 닫기 콜백 */
  onClose: () => void;
  /** 시도한 액션 라벨 (예: '결제하기', '찜하기') */
  action?: string;
  /** 로그인 후 돌아올 경로 (선택) */
  redirectTo?: string;
}

/**
 * 비로그인 게이트 모달
 *
 * 비로그인 회원이 결제/찜/메신저/리뷰 등 보호된 액션을
 * 시도할 때 표시되는 바텀시트 형태 모달.
 */
export default function LoginGateModal({
  open,
  onClose,
  action,
  redirectTo,
}: LoginGateModalProps) {
  const navigate = useNavigate();

  // 모달 열림 시 body 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  const description = action
    ? `${action} 위해서는 로그인이 필요해요`
    : '회원 전용 서비스예요';

  const handleLogin = () => {
    onClose();
    const target = redirectTo
      ? `/login?redirect=${encodeURIComponent(redirectTo)}`
      : '/login';
    navigate(target);
  };

  const handleRegister = () => {
    onClose();
    navigate('/register');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-gate-title"
    >
      <div
        className="mobile-bottom-sheet bg-surface rounded-t-card-lg pt-2 pb-safe-bottom slide-up"
        onClick={(event) => event.stopPropagation()}
      >
        {/* 핸들바 */}
        <div className="flex justify-center py-2">
          <div className="w-10 h-1 rounded-full bg-line-strong" />
        </div>

        {/* 닫기 버튼 */}
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-3 top-3 w-9 h-9 inline-flex items-center justify-center rounded-full active:bg-surface-tertiary text-content-secondary"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-6 pt-4 pb-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mb-4">
              <LogIn className="w-7 h-7 text-primary" strokeWidth={2.2} />
            </div>
            <h2
              id="login-gate-title"
              className="text-h2 text-content mb-2"
            >
              로그인이 필요해요
            </h2>
            <p className="text-body text-content-secondary">
              {description}
            </p>
          </div>

          <div className="mt-6 space-y-2">
            <Button variant="primary" size="lg" fullWidth onClick={handleLogin}>
              로그인
            </Button>
            <Button variant="outline" size="lg" fullWidth onClick={handleRegister}>
              회원가입
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="block w-full text-center text-body-sm text-content-tertiary py-3"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
