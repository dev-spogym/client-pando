import { useEffect, useState } from 'react';
import { AlertCircle, CalendarClock, Clock, User } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import {
  createGolfCoachBooking,
  getGolfCoachBookings,
  getGolfInstructorSlots,
  type GolfCoachBooking,
  type GolfInstructorSlot,
} from '@/lib/memberExperience';
import { cn, formatCurrency, formatDateKo } from '@/lib/utils';
import { PageHeader, Button, Chip } from '@/components/ui';

interface Bay {
  id: number;
  number: string;
  status: 'available' | 'in_use' | 'reserved' | 'maintenance';
  memberName?: string;
  endTime?: string;
}

/** 골프 예약 페이지 */
export default function GolfBayReservation() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { member } = useAuthStore();
  const [tab, setTab] = useState<'coach' | 'bay'>(() =>
    searchParams.get('tab') === 'bay' ? 'bay' : 'coach'
  );
  const [bays, setBays] = useState<Bay[]>([]);
  const [selectedBay, setSelectedBay] = useState<Bay | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<GolfInstructorSlot | null>(null);
  const [coachBookings, setCoachBookings] = useState<GolfCoachBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBays();
  }, []);

  useEffect(() => {
    setTab(searchParams.get('tab') === 'bay' ? 'bay' : 'coach');
  }, [searchParams]);

  useEffect(() => {
    if (!member) return;
    setCoachBookings(getGolfCoachBookings(member.id));
  }, [member]);

  useEffect(() => {
    const modal = searchParams.get('modal');
    if (modal === 'coach') {
      const slot = getGolfInstructorSlots()[0];
      if (slot) setSelectedSlot(slot);
    } else if (modal === 'bay') {
      const availableBay = bays.find((item) => item.status === 'available');
      if (availableBay) setSelectedBay(availableBay);
    } else {
      setSelectedSlot(null);
      setSelectedBay(null);
    }
  }, [bays, searchParams]);

  const fetchBays = async () => {
    setLoading(true);
    const mockBays: Bay[] = Array.from({ length: 12 }, (_, index) => ({
      id: index + 1,
      number: `${Math.floor(index / 4) + 1}F-${(index % 4) + 1}`,
      status: index < 3 ? 'available' : index < 7 ? 'in_use' : index < 10 ? 'reserved' : 'maintenance',
      memberName: index >= 3 && index < 10 ? `회원${index}` : undefined,
      endTime: index >= 3 && index < 7 ? new Date(Date.now() + (30 + index * 10) * 60000).toISOString() : undefined,
    }));
    setBays(mockBays);
    setLoading(false);
  };

  const handleReserveBay = (bay: Bay) => {
    if (bay.status !== 'available') return;
    setSelectedBay(bay);
  };

  const confirmReserveBay = () => {
    if (!selectedBay) return;
    toast.success(`${selectedBay.number} 타석이 예약되었습니다.`);
    setBays((prev) =>
      prev.map((bay) =>
        bay.id === selectedBay.id ? { ...bay, status: 'reserved' as const, memberName: member?.name } : bay
      )
    );
    setSelectedBay(null);
  };

  const confirmCoachBooking = () => {
    if (!member || !selectedSlot) return;
    const booking = createGolfCoachBooking(member.id, selectedSlot);
    setCoachBookings([booking, ...coachBookings]);
    toast.success(`${booking.instructorName} 강사 레슨이 예약되었습니다.`);
    setSelectedSlot(null);
  };

  const handleWaitlist = () => {
    toast.info('골프 타석 대기열에 등록되었습니다. 예상 대기 시간: 약 30분');
  };

  const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    available: { label: '이용가능', color: 'text-state-success', bgColor: 'bg-state-success/10 border-state-success/30' },
    in_use: { label: '이용중', color: 'text-state-warning', bgColor: 'bg-state-warning/10 border-state-warning/30' },
    reserved: { label: '예약', color: 'text-primary', bgColor: 'bg-primary-light border-primary/30' },
    maintenance: { label: '정비중', color: 'text-content-tertiary', bgColor: 'bg-surface-tertiary border-line' },
  };

  const availableCount = bays.filter((bay) => bay.status === 'available').length;
  const instructorSlots = getGolfInstructorSlots();
  const nextCoachBooking = coachBookings[0] || null;

  return (
    <div className="min-h-screen bg-surface-secondary">
      <PageHeader
        title="골프 예약"
        onBack={() => navigate(-1)}
        rightSlot={
          <div className="flex gap-2">
            {[
              { key: 'coach' as const, label: '강사 예약' },
              { key: 'bay' as const, label: '타석 예약' },
            ].map((item) => (
              <Chip
                key={item.key}
                active={tab === item.key}
                size="sm"
                onClick={() => {
                  setTab(item.key);
                  const next = new URLSearchParams(searchParams);
                  next.set('tab', item.key);
                  next.delete('modal');
                  setSearchParams(next, { replace: true });
                }}
              >
                {item.label}
              </Chip>
            ))}
          </div>
        }
      />

      <div className="px-4 py-4 space-y-4 pb-20">
        {tab === 'coach' && (
          <>
            <section className="bg-surface rounded-card p-5 shadow-card-soft">
              <h2 className="text-lg font-bold">골프 강사 예약</h2>
              <p className="text-sm text-content-secondary mt-2">강사별 레슨 시간과 타석을 확인하고 바로 예약할 수 있습니다.</p>
            </section>

            {coachBookings.length > 0 && (
              <section className="bg-surface rounded-card p-5 shadow-card-soft space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold">내 골프 레슨 스케줄</h3>
                    <p className="text-xs text-content-secondary mt-1">예약한 레슨 시간과 타석을 한 번에 확인할 수 있습니다.</p>
                  </div>
                  <span className="rounded-pill bg-primary-light px-2 py-1 text-[11px] font-semibold text-primary">
                    {coachBookings.length}건
                  </span>
                </div>

                {nextCoachBooking && (
                  <div className="rounded-card bg-primary/[0.08] border border-primary/10 p-4">
                    <p className="text-xs font-semibold text-primary">다음 예약</p>
                    <p className="mt-1 text-sm font-semibold">{nextCoachBooking.lessonName}</p>
                    <p className="mt-1 text-xs text-content-secondary">
                      {nextCoachBooking.dateLabel} · {nextCoachBooking.timeLabel} · {nextCoachBooking.bayLabel}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  {coachBookings.map((booking) => (
                    <div key={booking.id} className="bg-surface-secondary rounded-card p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{booking.lessonName}</p>
                          <p className="text-xs text-content-secondary mt-1">{booking.instructorName} 강사 · {booking.bayLabel}</p>
                        </div>
                        <span className="px-2 py-1 rounded-pill bg-primary-light text-primary text-[11px] font-semibold">
                          예약 완료
                        </span>
                      </div>
                      <p className="text-xs text-content-tertiary mt-2">{booking.dateLabel} / {booking.timeLabel}</p>
                      <p className="text-[11px] text-content-tertiary mt-1">
                        예약 접수일 {formatDateKo(booking.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-3">
              {instructorSlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot)}
                  className="w-full bg-surface rounded-card p-5 shadow-card-soft text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 rounded-pill bg-state-info/10 text-state-info text-[11px] font-semibold">
                          골프 강사
                        </span>
                        <span className="px-2 py-1 rounded-pill bg-surface-secondary text-content-tertiary text-[11px] font-medium">
                          {slot.bayLabel}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold">{slot.lessonName}</h3>
                      <p className="text-sm text-content-secondary mt-1">{slot.instructorName} 강사</p>
                      <div className="mt-3 space-y-1 text-sm text-content-secondary">
                        <p>{slot.dateLabel}</p>
                        <p>{slot.timeLabel}</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold">{formatCurrency(slot.price)}</p>
                  </div>
                </button>
              ))}
            </section>

            <Button fullWidth onClick={() => navigate('/shop')}>
              골프 레슨권 / 이용권 구매하러 가기
            </Button>
          </>
        )}

        {tab === 'bay' && (
          <>
            <div className="bg-surface px-4 py-4 border border-line rounded-card shadow-card-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-content-secondary">현재 이용 가능</p>
                  <p className="text-2xl font-bold text-primary">{availableCount}석</p>
                </div>
                <div className="flex gap-3">
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <div key={key} className="flex items-center gap-1">
                      <div className={cn('w-3 h-3 rounded-sm border', config.bgColor)} />
                      <span className="text-[10px] text-content-secondary">{config.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-1">
              {loading ? (
                <div className="text-center py-12 text-content-tertiary">불러오는 중...</div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {bays.map((bay) => {
                    const config = statusConfig[bay.status];

                    return (
                      <button
                        key={bay.id}
                        onClick={() => handleReserveBay(bay)}
                        disabled={bay.status !== 'available'}
                        className={cn(
                          'aspect-square rounded-card border-2 p-2 flex flex-col items-center justify-center transition-all',
                          config.bgColor,
                          bay.status === 'available' && 'active:scale-95 cursor-pointer',
                          bay.status !== 'available' && 'cursor-default'
                        )}
                      >
                        <span className="text-sm font-bold">{bay.number}</span>
                        <span className={cn('text-[10px] font-medium mt-1', config.color)}>
                          {config.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {availableCount === 0 && !loading && (
              <div className="bg-state-warning/10 rounded-card p-4 text-center">
                <AlertCircle className="w-8 h-8 text-state-warning mx-auto mb-2" />
                <p className="text-sm font-medium mb-1">현재 이용 가능한 타석이 없습니다</p>
                <p className="text-xs text-content-secondary mb-3">예상 대기 시간: 약 30분</p>
                <Button variant="secondary" onClick={handleWaitlist}>
                  대기열 등록
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <div className="mobile-bottom-sheet bg-surface rounded-t-2xl p-6 pb-safe-bottom slide-up">
            <h3 className="text-lg font-bold mb-4">골프 강사 예약 확인</h3>
            <div className="space-y-3 bg-surface-secondary rounded-card p-4">
              <p className="text-sm font-semibold">{selectedSlot.lessonName}</p>
              <p className="text-sm text-content-secondary flex items-center gap-2"><User className="w-4 h-4" />{selectedSlot.instructorName} 강사</p>
              <p className="text-sm text-content-secondary flex items-center gap-2"><CalendarClock className="w-4 h-4" />{selectedSlot.dateLabel}</p>
              <p className="text-sm text-content-secondary flex items-center gap-2"><Clock className="w-4 h-4" />{selectedSlot.timeLabel} / {selectedSlot.bayLabel}</p>
              <p className="text-lg font-bold">{formatCurrency(selectedSlot.price)}</p>
            </div>
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setSelectedSlot(null);
                  const next = new URLSearchParams(searchParams);
                  next.delete('modal');
                  setSearchParams(next, { replace: true });
                }}
              >
                취소
              </Button>
              <Button fullWidth onClick={confirmCoachBooking}>
                예약하기
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedBay && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <div className="mobile-bottom-sheet bg-surface rounded-t-2xl p-6 pb-safe-bottom slide-up">
            <h3 className="text-lg font-bold mb-4">타석 예약 확인</h3>
            <div className="bg-surface-secondary rounded-card p-4 mb-4">
              <p className="text-sm text-content-secondary">선택한 타석</p>
              <p className="text-xl font-bold text-primary">{selectedBay.number}</p>
            </div>
            <p className="text-sm text-content-secondary mb-6">예약 시간은 1시간이며, 시간 초과 시 자동 반납됩니다.</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setSelectedBay(null);
                  const next = new URLSearchParams(searchParams);
                  next.delete('modal');
                  setSearchParams(next, { replace: true });
                }}
              >
                취소
              </Button>
              <Button fullWidth onClick={confirmReserveBay}>
                예약하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
