import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: Size;
  className?: string;
  ring?: boolean;
}

const sizeClass: Record<Size, string> = {
  xs: 'w-7 h-7 text-[10px]',
  sm: 'w-9 h-9 text-caption',
  md: 'w-11 h-11 text-body-sm',
  lg: 'w-14 h-14 text-body',
  xl: 'w-20 h-20 text-h4',
};

function initialOf(name?: string) {
  if (!name) return '';
  const trimmed = name.trim();
  if (!trimmed) return '';
  return trimmed.slice(0, 1);
}

export default function Avatar({ src, alt, name, size = 'md', ring = false, className }: AvatarProps) {
  const dim = sizeClass[size];

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-primary-light text-primary font-semibold overflow-hidden shrink-0',
        ring && 'ring-2 ring-surface',
        dim,
        className
      )}
      aria-label={alt || name || '프로필'}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt || name || '프로필'} className="w-full h-full object-cover" />
      ) : name ? (
        <span>{initialOf(name)}</span>
      ) : (
        <User className="w-1/2 h-1/2" />
      )}
    </div>
  );
}
