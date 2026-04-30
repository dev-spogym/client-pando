import type { ReactNode } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import PriceTag from './PriceTag';
import Tag from './Tag';

export interface ProductCardProps {
  imageUrl?: string;
  imageFallback?: ReactNode;
  category?: string;
  title: string;
  subtitle?: string;
  location?: string;
  distance?: string;
  rating?: number;
  reviewCount?: number;
  price?: number;
  originalPrice?: number;
  badges?: string[];
  tags?: string[];
  layout?: 'horizontal' | 'vertical';
  rightSlot?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function ProductCard({
  imageUrl,
  imageFallback,
  category,
  title,
  subtitle,
  location,
  distance,
  rating,
  reviewCount,
  price,
  originalPrice,
  badges,
  tags,
  layout = 'horizontal',
  rightSlot,
  onClick,
  className,
}: ProductCardProps) {
  if (layout === 'vertical') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'group flex flex-col w-full text-left bg-surface rounded-card overflow-hidden shadow-card-soft touch-card',
          className
        )}
      >
        <div className="relative aspect-[4/3] bg-surface-tertiary overflow-hidden">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-content-tertiary">
              {imageFallback || '이미지'}
            </div>
          )}
        </div>
        <div className="p-3 flex flex-col gap-1">
          {category && <p className="text-caption text-primary font-medium">{category}</p>}
          <h3 className="text-body font-semibold text-content line-clamp-2">{title}</h3>
          {subtitle && <p className="text-caption text-content-secondary line-clamp-1">{subtitle}</p>}
          {price !== undefined && (
            <div className="mt-1">
              <PriceTag price={price} originalPrice={originalPrice} size="sm" />
            </div>
          )}
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full gap-3 p-3 text-left bg-surface rounded-card shadow-card-soft touch-card',
        className
      )}
    >
      <div className="relative w-24 h-24 shrink-0 rounded-card overflow-hidden bg-surface-tertiary">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-content-tertiary">
            {imageFallback || '🏋️'}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {category && <p className="text-caption text-primary font-medium truncate">{category}</p>}
            <h3 className="text-h4 text-content line-clamp-1 mt-0.5">{title}</h3>
            {subtitle && <p className="text-caption text-content-secondary line-clamp-1 mt-0.5">{subtitle}</p>}
            {location && (
              <p className="text-caption text-content-tertiary line-clamp-1 mt-0.5">
                {location}
                {distance && <span className="ml-1 text-primary">{distance}</span>}
              </p>
            )}
          </div>
          {rightSlot && <div className="shrink-0">{rightSlot}</div>}
        </div>

        {(rating !== undefined || badges) && (
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {rating !== undefined && (
              <span className="inline-flex items-center gap-1 text-caption text-content-secondary">
                <Star className="w-3.5 h-3.5 text-state-warning fill-state-warning" />
                <span className="font-semibold text-content">{rating.toFixed(1)}</span>
                {reviewCount !== undefined && <span className="text-content-tertiary">({reviewCount})</span>}
              </span>
            )}
            {badges?.map((badge) => (
              <span key={badge} className="text-micro text-primary font-medium">
                {badge}
              </span>
            ))}
          </div>
        )}

        {price !== undefined && (
          <div className="mt-auto pt-1.5">
            <PriceTag price={price} originalPrice={originalPrice} size="md" />
          </div>
        )}

        {tags && tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.slice(0, 5).map((tag) => (
              <Tag key={tag} size="sm">
                {tag}
              </Tag>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}
