import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helper?: string;
  errorMessage?: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
  size?: 'md' | 'lg';
  required?: boolean;
}

const sizeClass = {
  md: 'h-12 text-body',
  lg: 'h-14 text-body-lg',
} as const;

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    helper,
    errorMessage,
    leftIcon,
    rightSlot,
    size = 'md',
    required,
    className,
    id,
    disabled,
    ...rest
  },
  ref
) {
  const hasError = Boolean(errorMessage);
  const inputId = id || (label ? `input-${label.replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-body-sm font-medium text-content-secondary mb-1.5">
          {label}
          {required && <span className="text-state-error ml-0.5">*</span>}
        </label>
      )}
      <div
        className={cn(
          'flex items-center gap-2 px-4 rounded-input bg-surface border transition-colors',
          hasError ? 'border-state-error' : 'border-line-strong focus-within:border-primary',
          disabled && 'bg-surface-secondary text-content-tertiary',
          sizeClass[size]
        )}
      >
        {leftIcon && <span className="text-content-tertiary shrink-0">{leftIcon}</span>}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={cn(
            'flex-1 bg-transparent outline-none text-content placeholder:text-content-tertiary',
            'disabled:cursor-not-allowed',
            className
          )}
          {...rest}
        />
        {rightSlot && <span className="shrink-0">{rightSlot}</span>}
      </div>
      {(helper || errorMessage) && (
        <p className={cn('mt-1.5 text-caption', hasError ? 'text-state-error' : 'text-content-tertiary')}>
          {errorMessage || helper}
        </p>
      )}
    </div>
  );
});

export default Input;
