import { getStaffSchedules } from '@/lib/mockOperations';
import { formatDateKo, formatTime } from '@/lib/utils';
import { Card } from '@/components/ui';

export default function StaffSchedule() {
  const schedules = getStaffSchedules();

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-surface px-5 pt-safe-top pb-4 shadow-sm">
        <div className="pt-4">
          <p className="text-xs text-content-tertiary">MA-530</p>
          <h1 className="text-lg font-bold">수업 일정 조회</h1>
        </div>
      </header>

      <div className="px-5 py-4 pb-24 space-y-3">
        {schedules.map((schedule) => (
          <Card key={schedule.id}>
            <p className="text-sm font-semibold">{schedule.title}</p>
            <p className="mt-1 text-xs text-content-secondary">{schedule.coach} · {schedule.room}</p>
            <p className="mt-2 text-sm text-content-secondary">
              {formatDateKo(schedule.startTime)} · {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
            </p>
            <p className="mt-2 text-xs text-content-tertiary">예약 {schedule.booked}/{schedule.capacity} · 상태 {schedule.status}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
