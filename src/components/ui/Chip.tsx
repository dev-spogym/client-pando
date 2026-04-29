import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Size = 'sm' | 'md' | 'lg';
type Variant = 'default' | 'soft' | 'outline';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  size?: Size;
  variant?: Variant;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

const sizeClass: Record<Size, string> = {
  sm: 'h-7 px-3 text-caption',
  md: 'h-9 px-4 text-body-sm',
  lg: 'h-10 px-4 text-body',
};

const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  {
    active = false,
    size = 'md',
    variant = 'default',
    className,
    children,
    leadingIcon,
    trailingIcon,
    ...rest
  },
  ref
) {
  const baseInactive =
    variant === 'outline'
      ? 'bg-surface text-content-secondary border border-line-strong hover:bg-surface-secondary'
      : variant === 'soft'
        ? 'bg-surface-tertiary text-content-secondary hover:bg-line'
        : 'bg-surface text-content-secondary border border-line hover:bg-surface-secondary';

  const baseActive = 'bg-primary text-white border border-primary shadow-chip-active hover:bg-primary-dark';

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-chip font-medium whitespace-nowrap',
        'transition-colors duration-150 ease-out-soft active:scale-[0.97] select-none',
        sizeClass[size],
        active ? baseActive : baseInactive,
        className
      )}
      {...rest}
    >
      {leadingIcon && <span className="inline-flex shrink-0">{leadingIcon}</span>}
      {children}
      {trailingIcon && <span className="inline-flex shrink-0">{trailingIcon}</span>}
    </button>
  );
});

export default Chip;
