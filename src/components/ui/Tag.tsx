import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md';
}

/** 시설/편의 태그 (예: 샤워, 탈의실, 주차장) — 회색 알약 형태 */
export default function Tag({ size = 'md', className, children, ...rest }: TagProps) {
  const sizeClass = size === 'sm' ? 'h-6 px-2.5 text-micro' : 'h-7 px-3 text-caption';
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-pill bg-surface-tertiary text-content-secondary font-medium whitespace-nowrap',
        sizeClass,
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
