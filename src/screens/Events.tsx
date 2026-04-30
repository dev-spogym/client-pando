'use client';

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Sparkles } from 'lucide-react';
import {
  MOCK_EVENTS,
  formatEventDday,
  formatEventPeriod,
  type DiscoverEvent,
  type EventStatus,
} from '@/lib/discover';
import { Badge, Chip, EmptyState, PageHeader, Button } from '@/components/ui';

type Tab = EventStatus;

const TABS: { id: Tab; label: string }[] = [
  { id: 'ongoing', label: '진행중' },
  { id: 'closing', label: '마감임박' },
  { id: 'ended', label: '종료' },
];

function ddayBadge(event: DiscoverEvent) {
  if (event.isAlways) {
    return (
      <Badge tone="info" variant="solid" size="sm">
        상시
      </Badge>
    );
  }
  if (event.daysLeft < 0) {
    return (
      <Badge tone="neutral" variant="solid" size="sm">
        종료
      </Badge>
    );
  }
  if (event.daysLeft <= 7) {
    return (
      <Badge tone="sale" variant="solid" size="sm">
        {formatEventDday(event)}
      </Badge>
    );
  }
  return (
    <Badge tone="primary" variant="solid" size="sm">
      {formatEventDday(event)}
    </Badge>
  );
}

function EventCard({ event, onClick }: { event: DiscoverEvent; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-surface rounded-card-lg overflow-hidden shadow-card-soft active:opacity-90"
    >
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-surface-tertiary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={event.heroUrl} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-1.5">
          {event.badgeLabel && (
            <Badge tone="warning" variant="solid" size="sm">
              {event.badgeLabel}
            </Badge>
          )}
          {ddayBadge(event)}
        </div>
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <p className="text-caption text-white/85">{event.subtitle}</p>
          <h3 className="text-h2 font-bold leading-tight mt-0.5 line-clamp-2">{event.title}</h3>
        </div>
      </div>
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <p className="text-caption text-content-secondary inline-flex items-center gap-1.5 min-w-0">
          <Calendar className="w-4 h-4 text-content-tertiary shrink-0" />
          <span className="truncate">{formatEventPeriod(event)}</span>
        </p>
        <span className="shrink-0 text-caption font-semibold text-primary">자세히 보기 →</span>
      </div>
    </button>
  );
}

export default function Events() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('ongoing');

  const counts = useMemo(() => {
    return {
      ongoing: MOCK_EVENTS.filter((e) => e.status === 'ongoing').length,
      closing: MOCK_EVENTS.filter((e) => e.status === 'closing').length,
      ended: MOCK_EVENTS.filter((e) => e.status === 'ended').length,
    };
  }, []);

  const visible = useMemo(() => {
    return MOCK_EVENTS.filter((e) => e.status === tab).sort((a, b) => {
      if (a.isAlways) return 1;
      if (b.isAlways) return -1;
      return a.daysLeft - b.daysLeft;
    });
  }, [tab]);

  return (
    <div className="min-h-screen bg-surface-secondary">
      <PageHeader title="이벤트 · 기획전" subtitle={`총 ${MOCK_EVENTS.length}개`} />

      {/* 탭 */}
      <div className="bg-surface border-b border-line sticky top-14 z-20">
        <div className="flex gap-2 px-5 py-3 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <Chip
              key={t.id}
              size="sm"
              active={tab === t.id}
              onClick={() => setTab(t.id)}
            >
              {t.label} {counts[t.id]}
            </Chip>
          ))}
        </div>
      </div>

      {/* 카드 리스트 */}
      <div className="px-5 py-4 space-y-4 pb-10">
        {visible.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="w-8 h-8" />}
            title="해당 상태의 이벤트가 없어요"
            description="다른 탭에서 진행 중인 이벤트를 확인해 보세요"
            action={
              <Button variant="secondary" onClick={() => setTab('ongoing')}>
                진행중 이벤트 보기
              </Button>
            }
          />
        ) : (
          visible.map((e) => (
            <EventCard key={e.id} event={e} onClick={() => navigate(`/events/${e.id}`)} />
          ))
        )}
      </div>
    </div>
  );
}
