import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'soft' | 'flat' | 'elevated' | 'outline';
type Padding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  padding?: Padding;
  interactive?: boolean;
  as?: 'div' | 'button' | 'a';
  href?: string;
}

const variantClass: Record<Variant, string> = {
  soft: 'bg-surface shadow-card-soft',
  flat: 'bg-surface',
  elevated: 'bg-surface shadow-card-elevated',
  outline: 'bg-surface border border-line',
};

const paddingClass: Record<Padding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'soft', padding = 'md', interactive = false, className, children, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-card',
        variantClass[variant],
        paddingClass[padding],
        interactive && 'touch-card cursor-pointer',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
});

export default Card;
