'use client';

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Home as HomeIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  showHome?: boolean;
  showNotification?: boolean;
  notificationCount?: number;
  onNotification?: () => void;
  rightSlot?: ReactNode;
  variant?: 'default' | 'plain' | 'transparent';
  sticky?: boolean;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  showBack = true,
  onBack,
  showHome = false,
  showNotification = false,
  notificationCount = 0,
  onNotification,
  rightSlot,
  variant = 'default',
  sticky = true,
  className,
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  const baseClass =
    variant === 'transparent'
      ? 'bg-transparent'
      : variant === 'plain'
        ? 'bg-surface'
        : 'bg-surface border-b border-line';

  return (
    <header
      className={cn(
        'flex items-center gap-2 px-4 min-h-14 pt-safe-top',
        sticky && 'sticky top-0 z-30',
        baseClass,
        className
      )}
    >
      {showBack && (
        <button
          type="button"
          onClick={handleBack}
          aria-label="뒤로 가기"
          className="-ml-2 w-10 h-10 inline-flex items-center justify-center rounded-full active:bg-surface-tertiary text-content"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      )}
      {showHome && (
        <button
          type="button"
          onClick={() => navigate('/')}
          aria-label="홈으로"
          className="w-10 h-10 inline-flex items-center justify-center rounded-full active:bg-surface-tertiary text-content"
        >
          <HomeIcon className="w-5 h-5" />
        </button>
      )}
      <div className="flex-1 min-w-0 text-center">
        {title && <h1 className="text-h4 text-content truncate">{title}</h1>}
        {subtitle && <p className="text-caption text-content-tertiary truncate">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-1 min-w-[40px] justify-end">
        {rightSlot}
        {showNotification && (
          <button
            type="button"
            onClick={onNotification}
            aria-label="알림"
            className="relative w-10 h-10 inline-flex items-center justify-center rounded-full active:bg-surface-tertiary text-content"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-state-sale text-white text-[10px] font-bold flex items-center justify-center">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
}
