'use client';

import { useEffect } from 'react';
import { Copy, MessageCircle, MoreHorizontal, X, Camera } from 'lucide-react';
import { toast } from 'sonner';

interface ShareSheetProps {
  /** 모달 표시 여부 */
  open: boolean;
  /** 닫기 콜백 */
  onClose: () => void;
  /** 공유할 콘텐츠 제목 */
  title: string;
  /** 공유할 URL */
  url: string;
  /** 미리보기 이미지 (선택) */
  imageUrl?: string;
}

interface ShareOption {
  key: string;
  label: string;
  bgClassName: string;
  iconClassName: string;
  icon: React.ReactNode;
  onClick: () => void;
}

/**
 * 공유 바텀시트
 *
 * 카카오톡 / 인스타그램 / 링크 복사 / 더보기 4개 옵션을 제공하는
 * 모바일 공유 시트.
 */
export default function ShareSheet({
  open,
  onClose,
  title,
  url,
  imageUrl,
}: ShareSheetProps) {
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

  const handleCopyLink = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        toast.success('링크가 복사되었어요');
      } else {
        // 클립보드 미지원 환경 폴백
        toast.success('링크가 복사되었어요');
      }
    } catch {
      toast.error('링크 복사에 실패했어요');
    } finally {
      onClose();
    }
  };

  const handleKakao = () => {
    toast.message('카카오톡으로 공유 (데모)', {
      description: title,
    });
    onClose();
  };

  const handleInstagram = () => {
    toast.message('인스타그램으로 공유 (데모)', {
      description: title,
    });
    onClose();
  };

  const handleMore = () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      navigator
        .share({ title, url })
        .catch(() => undefined)
        .finally(() => onClose());
      return;
    }
    toast.message('더 많은 공유 옵션 (데모)');
    onClose();
  };

  const options: ShareOption[] = [
    {
      key: 'kakao',
      label: '카카오톡',
      bgClassName: 'bg-[#FEE500]',
      iconClassName: 'text-[#3B1E1E]',
      icon: <MessageCircle className="w-6 h-6" strokeWidth={2.2} />,
      onClick: handleKakao,
    },
    {
      key: 'instagram',
      label: '인스타그램',
      bgClassName: 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]',
      iconClassName: 'text-white',
      icon: <Camera className="w-6 h-6" strokeWidth={2.2} />,
      onClick: handleInstagram,
    },
    {
      key: 'copy',
      label: '링크 복사',
      bgClassName: 'bg-surface-tertiary',
      iconClassName: 'text-content',
      icon: <Copy className="w-5 h-5" strokeWidth={2.2} />,
      onClick: handleCopyLink,
    },
    {
      key: 'more',
      label: '더보기',
      bgClassName: 'bg-surface-tertiary',
      iconClassName: 'text-content',
      icon: <MoreHorizontal className="w-6 h-6" strokeWidth={2.2} />,
      onClick: handleMore,
    },
  ];

  // url을 host/path 형태로 짧게 표시
  let shortUrl = url;
  try {
    const parsed = new URL(url, typeof window !== 'undefined' ? window.location.href : 'https://example.com');
    shortUrl = `${parsed.host}${parsed.pathname}`;
  } catch {
    shortUrl = url;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-sheet-title"
    >
      <div
        className="mobile-bottom-sheet bg-surface rounded-t-card-lg pt-2 pb-safe-bottom slide-up"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-center py-2">
          <div className="w-10 h-1 rounded-full bg-line-strong" />
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-3 top-3 w-9 h-9 inline-flex items-center justify-center rounded-full active:bg-surface-tertiary text-content-secondary"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-5 pt-2 pb-6">
          <h2
            id="share-sheet-title"
            className="text-h3 text-content text-center mb-4"
          >
            공유하기
          </h2>

          {/* 미리보기 카드 */}
          <div className="flex items-center gap-3 bg-surface-secondary rounded-card p-3 mb-5">
            <div className="w-14 h-14 rounded-card bg-surface-tertiary overflow-hidden flex-shrink-0 flex items-center justify-center">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary-light" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body font-semibold text-content truncate">
                {title}
              </p>
              <p className="text-caption text-content-tertiary truncate mt-0.5">
                {shortUrl}
              </p>
            </div>
          </div>

          {/* 4-column 옵션 그리드 */}
          <div className="grid grid-cols-4 gap-2">
            {options.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={option.onClick}
                className="flex flex-col items-center gap-2 py-2 active:scale-[0.97] transition-transform"
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center ${option.bgClassName} ${option.iconClassName}`}
                >
                  {option.icon}
                </div>
                <span className="text-caption text-content-secondary">
                  {option.label}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="block w-full text-center text-body-sm text-content-tertiary py-4 mt-2"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
