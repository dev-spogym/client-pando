import { cn } from '@/lib/utils';

interface PriceTagProps {
  price: number;
  originalPrice?: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'right';
  showDiscountPercent?: boolean;
  className?: string;
}

function formatPrice(value: number, currency = '원') {
  return `${value.toLocaleString()}${currency}`;
}

export default function PriceTag({
  price,
  originalPrice,
  currency = '원',
  size = 'md',
  align = 'left',
  showDiscountPercent = true,
  className,
}: PriceTagProps) {
  const hasDiscount = typeof originalPrice === 'number' && originalPrice > price;
  const discountPercent = hasDiscount ? Math.round(((originalPrice! - price) / originalPrice!) * 100) : 0;

  const priceClass =
    size === 'lg' ? 'text-h2 font-bold' : size === 'sm' ? 'text-body font-semibold' : 'text-h3 font-bold';
  const originalClass =
    size === 'lg' ? 'text-body' : size === 'sm' ? 'text-caption' : 'text-body-sm';

  return (
    <div
      className={cn(
        'inline-flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5',
        align === 'right' && 'justify-end',
        className
      )}
    >
      {hasDiscount && (
        <span className={cn('text-content-tertiary line-through', originalClass)}>
          {formatPrice(originalPrice!, currency)}
        </span>
      )}
      {hasDiscount && showDiscountPercent && (
        <span className={cn('text-state-sale font-bold', originalClass)}>{discountPercent}%</span>
      )}
      <span className={cn('text-content', priceClass)}>{formatPrice(price, currency)}</span>
    </div>
  );
}
