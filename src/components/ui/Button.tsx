import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClass: Record<Variant, string> = {
  primary:
    'bg-primary text-white shadow-card hover:bg-primary-dark active:bg-primary-deep disabled:bg-line-strong disabled:text-content-tertiary disabled:shadow-none',
  secondary:
    'bg-primary-light text-primary hover:bg-primary-soft active:bg-primary-soft disabled:bg-surface-tertiary disabled:text-content-tertiary',
  tertiary:
    'bg-surface-tertiary text-content hover:bg-line active:bg-line-strong disabled:bg-surface-tertiary disabled:text-content-tertiary',
  outline:
    'bg-surface text-content border border-line-strong hover:bg-surface-secondary active:bg-surface-tertiary disabled:bg-surface disabled:text-content-tertiary',
  ghost:
    'bg-transparent text-content hover:bg-surface-secondary active:bg-surface-tertiary disabled:text-content-tertiary',
  danger:
    'bg-state-error text-white hover:opacity-90 active:opacity-80 disabled:bg-line-strong disabled:text-content-tertiary',
};

const sizeClass: Record<Size, string> = {
  sm: 'h-9 px-3 text-body-sm rounded-button gap-1.5',
  md: 'h-11 px-4 text-body rounded-button gap-2',
  lg: 'h-12 px-5 text-body-lg rounded-button gap-2 font-semibold',
  xl: 'h-14 px-6 text-body-lg rounded-button gap-2 font-semibold',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    leftIcon,
    rightIcon,
    className,
    children,
    disabled,
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors duration-150 ease-out-soft',
        'disabled:cursor-not-allowed select-none',
        variantClass[variant],
        sizeClass[size],
        fullWidth && 'w-full',
        className
      )}
      {...rest}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>처리중…</span>
        </span>
      ) : (
        <>
          {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
});

export default Button;
