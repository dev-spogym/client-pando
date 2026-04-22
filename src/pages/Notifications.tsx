import { useEffect, useState } from 'react';
import { ArrowLeft, Bell, ChevronRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { cn, formatDateKo } from '@/lib/utils';
import { getNotificationItems, markNotificationRead, type NotificationItem } from '@/lib/memberExperience';

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
      <header className="bg-surface sticky top-0 z-10 border-b border-line">
        <div className="flex items-center px-4 pt-safe-top h-14">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-content" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-lg">알림센터</h1>
          <div className="w-6" />
        </div>

        <div className="px-4 pb-3 flex gap-2">
          {[
            { key: 'all' as const, label: `전체 ${items.length}` },
            { key: 'unread' as const, label: `미읽음 ${items.filter((item) => !item.read).length}` },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setTab(item.key);
                const next = new URLSearchParams(searchParams);
                if (item.key === 'all') next.delete('tab');
                else next.set('tab', item.key);
                setSearchParams(next, { replace: true });
              }}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                tab === item.key ? 'bg-primary text-white' : 'bg-surface-tertiary text-content-secondary'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 py-4">
        {filteredItems.length === 0 ? (
          <div className="bg-surface rounded-card shadow-card text-center py-12">
            <Bell className="w-12 h-12 text-content-tertiary/30 mx-auto mb-3" />
            <p className="text-content-tertiary text-sm">표시할 알림이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleOpen(item)}
                className="w-full bg-surface rounded-card p-4 shadow-card text-left"
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                    item.category === 'reservation' && 'bg-primary-light text-primary',
                    item.category === 'membership' && 'bg-state-warning/10 text-state-warning',
                    item.category === 'reward' && 'bg-state-success/10 text-state-success',
                    item.category === 'notice' && 'bg-state-info/10 text-state-info',
                    item.category === 'system' && 'bg-surface-tertiary text-content-secondary'
                  )}>
                    <Bell className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold truncate">{item.title}</h3>
                        {!item.read && <span className="w-2 h-2 bg-state-error rounded-full flex-shrink-0" />}
                      </div>
                      <span className="text-[11px] text-content-tertiary flex-shrink-0">
                        {formatDateKo(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-content-secondary mt-1 leading-relaxed">{item.body}</p>
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
