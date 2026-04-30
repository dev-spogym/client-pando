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
                className="w-full bg-surface rounded-card p-4 shadow-card-soft text-left"
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
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex items-start gap-2">
                        <h3 className="min-w-0 text-sm font-semibold leading-5 break-keep">{item.title}</h3>
                        {!item.read && <span className="w-2 h-2 bg-state-error rounded-full flex-shrink-0" />}
                      </div>
                      <span className="text-[11px] leading-none text-content-tertiary flex-shrink-0 whitespace-nowrap">
                        {formatDateKo(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-content-secondary mt-1 leading-relaxed break-keep">{item.body}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-primary font-medium">
                      <span>{item.actionLabel}</span>
                      <ChevronRight className="w-4 h-4" />
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
