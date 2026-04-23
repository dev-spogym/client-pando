import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Home,
  QrCode,
  Ticket,
  User,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface PublishingScreenSpec {
  id: string;
  title: string;
  route: string;
  url: string;
  category: string;
  state: '기본' | '탭' | '모달' | '완료' | '에러';
  note: string;
}

export function PreviewCard({
  screen,
  children,
}: {
  screen: PublishingScreenSpec;
  children: ReactNode;
}) {
  return (
    <article
      id={screen.id}
      className="rounded-[32px] border border-slate-200/80 bg-white/90 p-4 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.35)] backdrop-blur"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              {screen.category}
            </span>
            <span
              className={cn(
                'rounded-full px-2.5 py-1 text-[11px] font-semibold',
                screen.state === '기본' && 'bg-emerald-50 text-emerald-700',
                screen.state === '탭' && 'bg-sky-50 text-sky-700',
                screen.state === '모달' && 'bg-amber-50 text-amber-700',
                screen.state === '완료' && 'bg-violet-50 text-violet-700',
                screen.state === '에러' && 'bg-rose-50 text-rose-700'
              )}
            >
              {screen.state}
            </span>
          </div>
          <h2 className="mt-3 text-lg font-bold text-slate-900">{screen.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{screen.route}</p>
        </div>
        <div className="max-w-[180px] text-right text-xs leading-relaxed text-slate-500">
          {screen.note}
        </div>
      </div>

      {children}
    </article>
  );
}

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[360px] rounded-[36px] bg-slate-950 p-3 shadow-[0_32px_80px_-42px_rgba(15,23,42,0.85)]">
      <div className="relative overflow-hidden rounded-[28px] border border-slate-800 bg-surface">
        <div className="h-[720px] overflow-hidden bg-surface-secondary">{children}</div>
      </div>
    </div>
  );
}

export function AppSurface({
  children,
  footer,
}: {
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-full bg-surface-secondary">
      {children}
      {footer}
    </div>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  dark = false,
  right = <Bell className="h-5 w-5" />,
  back = true,
}: {
  title: string;
  subtitle?: string;
  dark?: boolean;
  right?: ReactNode;
  back?: boolean;
}) {
  return (
    <header className={cn('border-b px-4 pb-3 pt-safe-top', dark ? 'border-white/10 bg-primary' : 'border-line bg-surface')}>
      <div className={cn('flex h-14 items-center', dark ? 'text-white' : 'text-content')}>
        <div className="w-6">
          {back ? <ArrowLeft className="h-6 w-6" /> : null}
        </div>
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold">{title}</h1>
          {subtitle ? <p className={cn('text-[11px]', dark ? 'text-white/70' : 'text-content-tertiary')}>{subtitle}</p> : null}
        </div>
        <div className="flex w-6 items-center justify-end">{right}</div>
      </div>
    </header>
  );
}

export function HeroPanel({
  eyebrow,
  title,
  description,
  accent = 'from-primary to-primary-dark',
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  accent?: string;
  children?: ReactNode;
}) {
  return (
    <section className={cn('mx-4 mt-4 rounded-[28px] bg-gradient-to-br p-5 text-white shadow-card', accent)}>
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">{eyebrow}</p> : null}
      <h2 className="mt-2 text-2xl font-bold leading-tight">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-relaxed text-white/80">{description}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}

export function SectionCard({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-4 mt-4 rounded-card bg-surface p-4 shadow-card">
      {title ? <h3 className="text-sm font-semibold">{title}</h3> : null}
      {description ? <p className="mt-1 text-xs leading-relaxed text-content-tertiary">{description}</p> : null}
      <div className={cn(title || description ? 'mt-3' : '')}>{children}</div>
    </section>
  );
}

export function MetricGrid({
  items,
}: {
  items: Array<{ label: string; value: string; tone?: 'default' | 'primary' | 'warning' | 'success' }>;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl bg-surface-secondary p-3">
          <p className="text-[11px] text-content-tertiary">{item.label}</p>
          <p
            className={cn(
              'mt-2 text-xl font-bold',
              item.tone === 'primary' && 'text-primary',
              item.tone === 'warning' && 'text-state-warning',
              item.tone === 'success' && 'text-state-success'
            )}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export function ChipRow({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className={cn(
            'rounded-full px-3 py-1.5 text-xs font-medium',
            index === 0 ? 'bg-primary text-white' : 'bg-surface-secondary text-content-secondary'
          )}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function ListRows({
  rows,
}: {
  rows: Array<{
    title: string;
    subtitle?: string;
    badge?: string;
    value?: string;
    icon?: LucideIcon;
  }>;
}) {
  return (
    <div className="space-y-2">
      {rows.map((row) => {
        const Icon = row.icon;
        return (
          <div key={`${row.title}-${row.subtitle}`} className="flex items-center gap-3 rounded-2xl bg-surface-secondary p-3">
            {Icon ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            ) : null}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold">{row.title}</p>
                {row.badge ? (
                  <span className="rounded-full bg-primary-light px-2 py-0.5 text-[10px] font-semibold text-primary">
                    {row.badge}
                  </span>
                ) : null}
              </div>
              {row.subtitle ? <p className="mt-1 text-xs text-content-tertiary">{row.subtitle}</p> : null}
            </div>
            {row.value ? <span className="text-xs font-medium text-content-secondary">{row.value}</span> : null}
            <ChevronRight className="h-4 w-4 text-content-tertiary" />
          </div>
        );
      })}
    </div>
  );
}

export function ButtonBar({
  primary,
  secondary,
}: {
  primary: string;
  secondary?: string;
}) {
  return (
    <div className="flex gap-3">
      {secondary ? (
        <button className="flex-1 rounded-button border border-line py-3 text-sm font-medium text-content-secondary">
          {secondary}
        </button>
      ) : null}
      <button className="flex-1 rounded-button bg-primary py-3 text-sm font-semibold text-white">
        {primary}
      </button>
    </div>
  );
}

export function InfoRows({
  rows,
}: {
  rows: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-3 py-1">
          <span className="text-sm text-content-secondary">{row.label}</span>
          <span className="text-right text-sm font-medium">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

export function FormField({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-content-secondary">{label}</label>
      <div
        className={cn(
          'rounded-xl border border-line bg-surface-secondary px-4 py-3 text-sm text-content-secondary',
          multiline ? 'min-h-[88px]' : ''
        )}
      >
        {value}
      </div>
    </div>
  );
}

export function ToggleRows({
  rows,
}: {
  rows: Array<{ title: string; subtitle?: string; enabled?: boolean; locked?: boolean }>;
}) {
  return (
    <div className="overflow-hidden rounded-card bg-surface shadow-card">
      {rows.map((row, index) => (
        <div
          key={row.title}
          className={cn('flex items-center gap-3 px-4 py-4', index > 0 && 'border-t border-line-light')}
        >
          <div className="flex-1">
            <p className="text-sm font-medium">{row.title}</p>
            {row.subtitle ? <p className="mt-1 text-xs text-content-tertiary">{row.subtitle}</p> : null}
          </div>
          <div
            className={cn(
              'relative h-7 w-12 rounded-full',
              row.enabled ? 'bg-primary' : 'bg-line',
              row.locked && 'opacity-60'
            )}
          >
            <span
              className={cn(
                'absolute top-1 h-5 w-5 rounded-full bg-white transition-all',
                row.enabled ? 'left-6' : 'left-1'
              )}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ModalSheet({
  title,
  children,
  primary,
  secondary = '닫기',
}: {
  title: string;
  children: ReactNode;
  primary?: string;
  secondary?: string;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-black/35">
      <div className="pointer-events-auto w-full rounded-t-[28px] bg-surface p-5 shadow-[0_-16px_40px_-24px_rgba(15,23,42,0.5)]">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-line" />
        <h3 className="text-lg font-bold">{title}</h3>
        <div className="mt-4 space-y-4">{children}</div>
        <div className="mt-5 flex gap-3">
          <button className="flex-1 rounded-button border border-line py-3 text-sm font-medium text-content-secondary">
            {secondary}
          </button>
          {primary ? (
            <button className="flex-1 rounded-button bg-primary py-3 text-sm font-semibold text-white">
              {primary}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function InstallBanner() {
  return (
    <div className="mx-4 mt-4 rounded-2xl border border-primary/20 bg-primary-light p-4 shadow-card">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white">
          <Home className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">앱 설치 배너</p>
          <p className="text-xs text-content-secondary">홈 화면에 추가하면 더 빠르게 진입할 수 있습니다.</p>
        </div>
        <button className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white">설치</button>
      </div>
    </div>
  );
}

export function FloatingButton({ label }: { label: string }) {
  return (
    <button className="absolute bottom-24 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-lg">
      {label}
    </button>
  );
}

export function BottomTabs({
  active,
}: {
  active: '홈' | '예약' | 'QR' | '이용권' | 'MY';
}) {
  const tabs = [
    { label: '홈', icon: Home },
    { label: '예약', icon: Ticket },
    { label: 'QR', icon: QrCode },
    { label: '이용권', icon: Ticket },
    { label: 'MY', icon: User },
  ] as const;

  return (
    <footer className="sticky bottom-0 border-t border-line bg-surface/95 px-3 py-3 backdrop-blur">
      <div className="grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const selected = tab.label === active;
          return (
            <div
              key={tab.label}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[11px] font-medium',
                selected ? 'bg-primary-light text-primary' : 'text-content-tertiary'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </div>
          );
        })}
      </div>
    </footer>
  );
}
