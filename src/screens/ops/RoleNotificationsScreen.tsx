import { toast } from 'sonner';
import { getRoleNotifications, markAllNotificationsRead, markNotificationRead, type NotificationRole } from '@/lib/mockOperations';
import { formatDateKo } from '@/lib/utils';

interface RoleNotificationsScreenProps {
  role: NotificationRole;
  title: string;
  screenId: string;
}

export default function RoleNotificationsScreen({ role, title, screenId }: RoleNotificationsScreenProps) {
  const notifications = getRoleNotifications(role);

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-surface px-5 pt-safe-top pb-4 shadow-sm">
        <div className="pt-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-content-tertiary">{screenId}</p>
            <h1 className="text-lg font-bold">{title}</h1>
          </div>
          <button
            onClick={() => {
              markAllNotificationsRead(role);
              toast.success('모든 알림을 읽음 처리했습니다.');
            }}
            className="text-sm font-medium text-primary"
          >
            모두 읽음
          </button>
        </div>
      </header>

      <div className="px-5 py-4 pb-24 space-y-3">
        {notifications.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              markNotificationRead(item.id);
              toast.success('알림을 확인했습니다.');
            }}
            className="w-full rounded-card bg-surface p-4 text-left shadow-card"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-2 text-sm text-content-secondary">{item.body}</p>
                <p className="mt-2 text-xs text-content-tertiary">{formatDateKo(item.createdAt)} · {item.category}</p>
              </div>
              {!item.read ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" /> : null}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
