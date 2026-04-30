import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  /** 전체 화면 로딩 */
  fullScreen?: boolean;
  /** 크기 */
  size?: 'sm' | 'md' | 'lg';
  /** 텍스트 */
  text?: string;
  className?: string;
}

/** 로딩 스피너 컴포넌트 */
export default function LoadingSpinner({
  fullScreen = false,
  size = 'md',
  text,
  className,
}: LoadingSpinnerProps) {
  const sizeMap = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

  const spinner = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeMap[size])} />
      {text && <p className="text-body text-content-secondary">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
}
