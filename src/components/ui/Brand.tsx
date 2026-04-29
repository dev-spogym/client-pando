import { cn } from '@/lib/utils';

interface BrandProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  inverse?: boolean;
  className?: string;
}

const textClass = {
  sm: 'text-h4',
  md: 'text-h2',
  lg: 'text-display',
  xl: 'text-display-lg',
} as const;

/** 스포짐 워드마크 — "SPO" 진하고 "GYM" 가늘게 */
export default function Brand({ size = 'md', inverse = false, className }: BrandProps) {
  return (
    <span className={cn('inline-flex items-baseline tracking-tight font-brand', textClass[size], className)}>
      <span className={cn('font-extrabold', inverse ? 'text-white' : 'text-primary')}>SPO</span>
      <span className={cn('font-light ml-0.5', inverse ? 'text-white/85' : 'text-content')}>GYM</span>
    </span>
  );
}
