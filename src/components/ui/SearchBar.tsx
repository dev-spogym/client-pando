import { forwardRef, type InputHTMLAttributes } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  onClear?: () => void;
  onFilterClick?: () => void;
  bordered?: boolean;
  showFilter?: boolean;
  size?: 'md' | 'lg';
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(function SearchBar(
  {
    onClear,
    onFilterClick,
    bordered = true,
    showFilter = false,
    size = 'md',
    className,
    value,
    placeholder = '찾으시는 항목이 있나요?',
    ...rest
  },
  ref
) {
  const hasValue = typeof value === 'string' && value.length > 0;
  const sizeClass = size === 'lg' ? 'h-14 text-body-lg' : 'h-12 text-body';

  return (
    <div className="flex items-center gap-2">
      {showFilter && (
        <button
          type="button"
          onClick={onFilterClick}
          aria-label="필터"
          className="shrink-0 w-12 h-12 rounded-input border border-line-strong bg-surface flex items-center justify-center text-content-secondary active:bg-surface-tertiary"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      )}
      <div
        className={cn(
          'flex-1 flex items-center gap-2 px-4 rounded-input bg-surface',
          bordered ? 'border-2 border-primary/70' : 'border border-line',
          sizeClass,
          className
        )}
      >
        <input
          ref={ref}
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          placeholder={placeholder}
          value={value}
          className="flex-1 bg-transparent outline-none text-content placeholder:text-content-tertiary"
          {...rest}
        />
        {hasValue && onClear ? (
          <button
            type="button"
            onClick={onClear}
            aria-label="검색어 지우기"
            className="shrink-0 w-6 h-6 rounded-full bg-surface-tertiary flex items-center justify-center text-content-secondary"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <Search className="w-5 h-5 text-content-tertiary shrink-0" aria-hidden />
        )}
      </div>
    </div>
  );
});

export default SearchBar;
