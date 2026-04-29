import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function EmptyState({
  icon,
  title = '내용이 없습니다',
  description,
  action,
  size = 'md',
  className,
}: EmptyStateProps) {
  const padding = size === 'sm' ? 'py-10' : size === 'lg' ? 'py-24' : 'py-16';
  const iconBox = size === 'sm' ? 'w-12 h-12' : size === 'lg' ? 'w-20 h-20' : 'w-16 h-16';
  const iconSize = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';

  return (
    <div className={cn('flex flex-col items-center justify-center text-center px-6', padding, className)}>
      <div
        className={cn(
          'rounded-full bg-surface-tertiary text-content-tertiary flex items-center justify-center mb-4',
          iconBox
        )}
      >
        {icon || <Inbox className={iconSize} />}
      </div>
      <p className="text-h4 text-content">{title}</p>
      {description && <p className="mt-1 text-body-sm text-content-secondary max-w-[280px]">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
