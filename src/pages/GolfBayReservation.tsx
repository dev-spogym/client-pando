import { useEffect, useState } from 'react';
import { ArrowLeft, Clock, User, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Bay {
  id: number;
  number: string;
  status: 'available' | 'in_use' | 'reserved' | 'maintenance';
  memberName?: string;
  endTime?: string;
}

/** 골프 타석 예약 페이지 */
export default function GolfBayReservation() {
  const navigate = useNavigate();
  const { member } = useAuthStore();
  const [bays, setBays] = useState<Bay[]>([]);
  const [selectedBay, setSelectedBay] = useState<Bay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBays();
  }, []);

  const fetchBays = async () => {
    setLoading(true);
    // 골프 타석 데이터 (실제로는 별도 테이블 또는 lockers 테이블 활용)
    // 시뮬레이션용 데이터 생성
    const mockBays: Bay[] = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      number: `${Math.floor(i / 4) + 1}F-${(i % 4) + 1}`,
      status: i < 3 ? 'available' : i < 7 ? 'in_use' : i < 10 ? 'reserved' : 'maintenance',
      memberName: i >= 3 && i < 10 ? `회원${i}` : undefined,
      endTime: i >= 3 && i < 7 ? new Date(Date.now() + (30 + i * 10) * 60000).toISOString() : undefined,
    }));
    setBays(mockBays);
    setLoading(false);
  };

  const handleReserve = (bay: Bay) => {
    if (bay.status !== 'available') return;
    setSelectedBay(bay);
  };

  const confirmReserve = () => {
    if (!selectedBay) return;
    toast.success(`${selectedBay.number} 타석이 예약되었습니다.`);
    setBays((prev) =>
      prev.map((b) =>
        b.id === selectedBay.id
          ? { ...b, status: 'reserved' as const, memberName: member?.name }
          : b
      )
    );
    setSelectedBay(null);
  };

  const handleWaitlist = () => {
    toast.info('대기열에 등록되었습니다. 예상 대기 시간: 약 30분');
  };

  const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    available: { label: '이용가능', color: 'text-state-success', bgColor: 'bg-state-success/10 border-state-success/30' },
    in_use: { label: '이용중', color: 'text-state-warning', bgColor: 'bg-state-warning/10 border-state-warning/30' },
    reserved: { label: '예약', color: 'text-primary', bgColor: 'bg-primary-light border-primary/30' },
    maintenance: { label: '정비중', color: 'text-content-tertiary', bgColor: 'bg-surface-tertiary border-line' },
  };

  const getRemainTime = (endTime?: string) => {
    if (!endTime) return null;
    const remain = Math.max(0, Math.ceil((new Date(endTime).getTime() - Date.now()) / 60000));
    return remain;
  };

  const availableCount = bays.filter((b) => b.status === 'available').length;

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* 헤더 */}
      <header className="bg-surface sticky top-0 z-10 border-b border-line">
        <div className="flex items-center px-4 pt-safe-top h-14">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-content" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-lg">골프 타석 예약</h1>
          <div className="w-6" />
        </div>
      </header>

      {/* 요약 */}
      <div className="bg-surface px-4 py-4 border-b border-line">
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

      {/* 타석 그리드 */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="text-center py-12 text-content-tertiary">불러오는 중...</div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {bays.map((bay) => {
              const config = statusConfig[bay.status];
              const remainTime = getRemainTime(bay.endTime);

              return (
                <button
                  key={bay.id}
                  onClick={() => handleReserve(bay)}
                  disabled={bay.status !== 'available'}
                  className={cn(
                    'aspect-square rounded-xl border-2 p-2 flex flex-col items-center justify-center transition-all',
                    config.bgColor,
                    bay.status === 'available' && 'active:scale-95 cursor-pointer',
                    bay.status !== 'available' && 'cursor-default'
                  )}
                >
                  <span className="text-sm font-bold">{bay.number}</span>
                  <span className={cn('text-[10px] font-medium mt-1', config.color)}>
                    {config.label}
                  </span>
                  {remainTime !== null && (
                    <span className="text-[10px] text-state-warning flex items-center gap-0.5 mt-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {remainTime}분
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 이용 가능한 타석 없을 때 대기열 */}
      {availableCount === 0 && !loading && (
        <div className="px-4 pb-4">
          <div className="bg-state-warning/10 rounded-card p-4 text-center">
            <AlertCircle className="w-8 h-8 text-state-warning mx-auto mb-2" />
            <p className="text-sm font-medium mb-1">현재 이용 가능한 타석이 없습니다</p>
            <p className="text-xs text-content-secondary mb-3">예상 대기 시간: 약 30분</p>
            <button
              onClick={handleWaitlist}
              className="px-6 py-2 bg-state-warning text-white rounded-button font-medium text-sm"
            >
              대기열 등록
            </button>
          </div>
        </div>
      )}

      {/* 예약 확인 모달 */}
      {selectedBay && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <div className="w-full max-w-lg bg-surface rounded-t-2xl p-6 pb-safe-bottom slide-up">
            <h3 className="text-lg font-bold mb-4">타석 예약 확인</h3>
            <div className="bg-surface-secondary rounded-xl p-4 mb-4">
              <p className="text-sm text-content-secondary">선택한 타석</p>
              <p className="text-xl font-bold text-primary">{selectedBay.number}</p>
            </div>
            <p className="text-sm text-content-secondary mb-6">
              예약 시간은 1시간이며, 시간 초과 시 자동 반납됩니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedBay(null)}
                className="flex-1 py-3 rounded-button border border-line text-content-secondary font-medium"
              >
                취소
              </button>
              <button
                onClick={confirmReserve}
                className="flex-1 py-3 rounded-button bg-primary text-white font-semibold active:bg-primary-dark"
              >
                예약하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
