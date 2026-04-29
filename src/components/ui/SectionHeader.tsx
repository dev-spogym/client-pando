import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function SectionHeader({ title, description, actionLabel, onAction, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-end justify-between gap-3 mb-3', className)}>
      <div className="min-w-0">
        <h2 className="text-h3 text-content truncate">{title}</h2>
        {description && <p className="mt-0.5 text-body-sm text-content-tertiary truncate">{description}</p>}
      </div>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 inline-flex items-center gap-0.5 text-body-sm text-content-secondary hover:text-content"
        >
          {actionLabel}
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
