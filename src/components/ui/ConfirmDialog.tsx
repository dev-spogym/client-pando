'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import Button from './Button';

interface ConfirmDialogProps {
  /** 모달 표시 여부 */
  open: boolean;
  /** 닫기 콜백 (취소 클릭 / 백드롭 클릭) */
  onClose: () => void;
  /** 제목 */
  title: string;
  /** 본문 설명 */
  description?: string;
  /** 확인 버튼 라벨 */
  confirmLabel?: string;
  /** 취소 버튼 라벨 */
  cancelLabel?: string;
  /** 확인 버튼 스타일 */
  variant?: 'primary' | 'danger';
  /** 확인 콜백 */
  onConfirm: () => void;
  /** 확인 처리 중 로딩 상태 */
  loading?: boolean;
}

/**
 * 확인/취소 모달
 *
 * 가운데 정렬된 mobile-fixed-width 다이얼로그.
 * 환불 신청, 주문 취소 등 사용자의 명시적 확인이 필요한 액션에 사용.
 */
export default function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  variant = 'primary',
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  // 모달 열림 시 body 스크롤 잠금 + ESC 닫기
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6 fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby={description ? 'confirm-dialog-description' : undefined}
    >
      <div
        className={cn(
          'bg-surface rounded-card-lg shadow-card-elevated scale-in',
          'w-full max-w-[320px] p-6'
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <h3
          id="confirm-dialog-title"
          className="text-h3 text-content text-center"
        >
          {title}
        </h3>
        {description && (
          <p
            id="confirm-dialog-description"
            className="text-body text-content-secondary text-center mt-2 whitespace-pre-line"
          >
            {description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 mt-5">
          <Button
            variant="outline"
            size="lg"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="lg"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
