import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'primary' | 'accent' | 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'sale';
type Size = 'sm' | 'md';
type Variant = 'soft' | 'solid' | 'outline';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  size?: Size;
  variant?: Variant;
  dot?: boolean;
}

const toneSoft: Record<Tone, string> = {
  primary: 'bg-primary-light text-primary',
  accent: 'bg-accent-light text-accent-dark',
  neutral: 'bg-surface-tertiary text-content-secondary',
  success: 'bg-state-success/10 text-state-success',
  warning: 'bg-state-warning/10 text-state-warning',
  error: 'bg-state-error/10 text-state-error',
  info: 'bg-primary-light text-primary',
  sale: 'bg-state-sale/10 text-state-sale',
};

const toneSolid: Record<Tone, string> = {
  primary: 'bg-primary text-white',
  accent: 'bg-accent text-white',
  neutral: 'bg-content-secondary text-white',
  success: 'bg-state-success text-white',
  warning: 'bg-state-warning text-white',
  error: 'bg-state-error text-white',
  info: 'bg-primary text-white',
  sale: 'bg-state-sale text-white',
};

const toneOutline: Record<Tone, string> = {
  primary: 'border border-primary text-primary',
  accent: 'border border-accent text-accent-dark',
  neutral: 'border border-line-strong text-content-secondary',
  success: 'border border-state-success text-state-success',
  warning: 'border border-state-warning text-state-warning',
  error: 'border border-state-error text-state-error',
  info: 'border border-primary text-primary',
  sale: 'border border-state-sale text-state-sale',
};

const sizeClass: Record<Size, string> = {
  sm: 'text-micro px-2 py-0.5 rounded-md font-medium',
  md: 'text-caption px-2.5 py-1 rounded-md font-medium',
};

export default function Badge({
  tone = 'primary',
  size = 'sm',
  variant = 'soft',
  dot = false,
  className,
  children,
  ...rest
}: BadgeProps) {
  const toneClass =
    variant === 'solid' ? toneSolid[tone] : variant === 'outline' ? toneOutline[tone] : toneSoft[tone];

  return (
    <span
      className={cn('inline-flex items-center gap-1 whitespace-nowrap', sizeClass[size], toneClass, className)}
      {...rest}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
