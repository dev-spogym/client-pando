import { useEffect, useState } from 'react';
import { Bell, ChevronRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { cn, formatDateKo } from '@/lib/utils';
import { getNotificationItems, markNotificationRead, type NotificationItem } from '@/lib/memberExperience';
import { PageHeader, Chip, EmptyState, Card } from '@/components/ui';

/** 알림센터 */
export default function Notifications() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { member } = useAuthStore();
  const [tab, setTab] = useState<'all' | 'unread'>(() =>
    searchParams.get('tab') === 'unread' ? 'unread' : 'all'
  );
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    setTab(searchParams.get('tab') === 'unread' ? 'unread' : 'all');
  }, [searchParams]);

  useEffect(() => {
    if (!member) return;
    setItems(getNotificationItems(member));
  }, [member]);

  const filteredItems = tab === 'unread' ? items.filter((item) => !item.read) : items;

  if (!member) return null;

  const handleOpen = (item: NotificationItem) => {
    markNotificationRead(member.id, item.id);
    setItems(getNotificationItems(member));
    navigate(item.route);
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-surface sticky top-0 z-10 border-b border-line pt-safe-top">
        <PageHeader title="알림센터" showBack sticky={false} />

        <div className="px-5 pb-3 flex gap-2">
          {[
            { key: 'all' as const, label: `전체 ${items.length}` },
            { key: 'unread' as const, label: `미읽음 ${items.filter((item) => !item.read).length}` },
          ].map((item) => (
            <Chip
              key={item.key}
              active={tab === item.key}
              onClick={() => {
                setTab(item.key);
                const next = new URLSearchParams(searchParams);
                if (item.key === 'all') next.delete('tab');
                else next.set('tab', item.key);
                setSearchParams(next, { replace: true });
              }}
            >
              {item.label}
            </Chip>
          ))}
        </div>
      </header>

      <div className="px-5 py-4">
        {filteredItems.length === 0 ? (
          <Card variant="soft" padding="none">
            <EmptyState
              icon={<Bell className="w-8 h-8" />}
              title="표시할 알림이 없습니다"
              size="md"
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleOpen(item)}
                className={cn(
                  'w-full bg-surface rounded-card p-4 shadow-card-soft text-left active:bg-surface-secondary transition-colors',
                  !item.read && 'ring-1 ring-primary/15'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-card flex items-center justify-center flex-shrink-0',
                    item.category === 'reservation' && 'bg-primary-light text-primary',
                    item.category === 'membership' && 'bg-state-warning/10 text-state-warning',
                    item.category === 'reward' && 'bg-state-success/10 text-state-success',
                    item.category === 'notice' && 'bg-state-info/10 text-state-info',
                    item.category === 'system' && 'bg-surface-tertiary text-content-secondary'
                  )}>
                    <Bell className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* 제목 + 시간 (한 줄, 항상 row) */}
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="min-w-0 flex items-center gap-1.5">
                        <h3 className="min-w-0 text-body font-semibold text-content truncate">{item.title}</h3>
                        {!item.read && (
                          <span className="w-1.5 h-1.5 bg-state-sale rounded-full flex-shrink-0" aria-label="미읽음" />
                        )}
                      </div>
                      <span className="text-caption text-content-tertiary flex-shrink-0 whitespace-nowrap">
                        {formatDateKo(item.createdAt)}
                      </span>
                    </div>
                    {/* 본문 — 2줄 line-clamp */}
                    <p className="text-body-sm text-content-secondary mt-1 leading-relaxed line-clamp-2 break-keep">
                      {item.body}
                    </p>
                    {/* 액션 라벨 — 우측 정렬 */}
                    <div className="mt-2.5 flex items-center justify-end gap-0.5 text-caption text-primary font-medium">
                      <span>{item.actionLabel}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
