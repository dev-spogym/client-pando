import { toast } from 'sonner';
import { markAllNotificationsRead, markNotificationRead, getRoleNotifications } from '@/lib/mockOperations';
import { formatDateKo } from '@/lib/utils';
import { PageHeader, Card } from '@/components/ui';

export default function TrainerNotifications() {
  const notifications = getRoleNotifications('trainer');

  return (
    <div className="min-h-screen bg-surface-secondary">
      <PageHeader
        showBack={false}
        title="트레이너 알림"
        subtitle="MA-251"
        rightSlot={
          <button
            onClick={() => {
              markAllNotificationsRead('trainer');
              toast.success('모든 알림을 읽음 처리했습니다.');
            }}
            className="text-body font-medium text-primary"
          >
            모두 읽음
          </button>
        }
      />

      <div className="px-5 py-4 pb-24 space-y-3">
        {notifications.map((item) => (
          <Card
            key={item.id}
            variant="elevated"
            padding="md"
            interactive
            onClick={() => {
              markNotificationRead(item.id);
              toast.success('알림을 확인했습니다.');
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-body font-semibold">{item.title}</p>
                <p className="mt-2 text-body text-content-secondary">{item.body}</p>
                <p className="mt-2 text-caption text-content-tertiary">{formatDateKo(item.createdAt)} · {item.category}</p>
              </div>
              {!item.read ? (
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0" />
              ) : null}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
