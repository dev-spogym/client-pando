import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ListItemProps {
  leading?: ReactNode;
  title: string;
  subtitle?: string;
  meta?: string;
  trailing?: ReactNode;
  showChevron?: boolean;
  onClick?: () => void;
  variant?: 'plain' | 'card';
  className?: string;
  disabled?: boolean;
}

export default function ListItem({
  leading,
  title,
  subtitle,
  meta,
  trailing,
  showChevron = true,
  onClick,
  variant = 'plain',
  className,
  disabled,
}: ListItemProps) {
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3.5 text-left',
        variant === 'card' && 'bg-surface rounded-card shadow-card-soft px-4 py-3.5',
        onClick && !disabled && 'active:bg-surface-tertiary transition-colors',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {leading && <div className="shrink-0">{leading}</div>}
      <div className="flex-1 min-w-0">
        <p className="text-body font-medium text-content truncate">{title}</p>
        {subtitle && <p className="text-body-sm text-content-secondary truncate mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-1 shrink-0 text-content-secondary">
        {meta && <span className="text-caption text-content-tertiary">{meta}</span>}
        {trailing}
        {showChevron && onClick && <ChevronRight className="w-5 h-5 text-content-quaternary" />}
      </div>
    </Tag>
  );
}
