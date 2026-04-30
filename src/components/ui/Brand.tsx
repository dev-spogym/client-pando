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

/** FitGenie 워드마크 — "Fit" 진하고 "Genie" 가늘게 */
export default function Brand({ size = 'md', inverse = false, className }: BrandProps) {
  return (
    <span className={cn('inline-flex items-baseline tracking-tight font-brand', textClass[size], className)}>
      <span className={cn('font-extrabold', inverse ? 'text-white' : 'text-primary')}>Fit</span>
      <span className={cn('font-light ml-0.5', inverse ? 'text-white/85' : 'text-content')}>Genie</span>
    </span>
  );
}
