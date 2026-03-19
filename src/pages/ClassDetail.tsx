import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Users, User, Dumbbell, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn, formatTime, formatDateKo } from '@/lib/utils';

interface ClassData {
  id: number;
  title: string;
  type: string;
  staffId: number;
  staffName: string;
  room: string | null;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
}

/** 수업 상세 / 예약 / 취소 페이지 */
export default function ClassDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { member } = useAuthStore();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    if (id) fetchClass();
  }, [id]);

  const fetchClass = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', Number(id))
      .single();

    if (data) setClassData(data);
    setLoading(false);
  };

  /** 예약하기 */
  const handleReserve = async () => {
    if (!member || !classData) return;
    setReserving(true);

    try {
      // 예약 수 증가
      const { error } = await supabase
        .from('classes')
        .update({ booked: classData.booked + 1 })
        .eq('id', classData.id)
        .lt('booked', classData.capacity);

      if (error) {
        toast.error('예약에 실패했습니다. 정원이 찼을 수 있습니다.');
      } else {
        // 출석 기록 생성 (예약 타입)
        await supabase.from('attendance').insert({
          memberId: member.id,
          memberName: member.name,
          checkInAt: classData.startTime,
          type: classData.type === 'PT' ? 'PT' : 'GX',
          checkInMethod: 'APP',
          branchId: member.branchId,
        });

        toast.success('예약이 완료되었습니다!');
        setClassData({ ...classData, booked: classData.booked + 1 });
      }
    } catch {
      toast.error('예약 중 오류가 발생했습니다.');
    }

    setReserving(false);
  };

  /** 대기열 등록 */
  const handleWaitlist = () => {
    toast.info('대기열에 등록되었습니다. 자리가 나면 알려드립니다.');
  };

  /** 예약 취소 */
  const handleCancel = async () => {
    if (!classData) return;
    setReserving(true);

    const { error } = await supabase
      .from('classes')
      .update({ booked: Math.max(0, classData.booked - 1) })
      .eq('id', classData.id);

    if (error) {
      toast.error('취소에 실패했습니다.');
    } else {
      toast.success('예약이 취소되었습니다.');
      setClassData({ ...classData, booked: classData.booked - 1 });
    }

    setReserving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-content-tertiary">불러오는 중...</p>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-content-tertiary mb-3" />
        <p className="text-content-tertiary">수업 정보를 찾을 수 없습니다.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary font-medium">
          돌아가기
        </button>
      </div>
    );
  }

  const isFull = classData.booked >= classData.capacity;
  const remaining = classData.capacity - classData.booked;
  const startDate = new Date(classData.startTime);
  const isPast = startDate < new Date();

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* 헤더 */}
      <header className={cn(
        'px-4 pt-safe-top pb-6',
        classData.type === 'PT' ? 'bg-primary' : 'bg-accent'
      )}>
        <div className="flex items-center h-14">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-lg text-white pr-6">수업 상세</h1>
        </div>
        <div className="text-center mt-2">
          <div className="w-16 h-16 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-3">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">{classData.title}</h2>
          <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm text-white font-medium">
            {classData.type}
          </span>
        </div>
      </header>

      <div className="px-4 -mt-2 space-y-4 pb-32">
        {/* 수업 정보 카드 */}
        <div className="bg-surface rounded-card p-4 shadow-card">
          <h3 className="font-semibold text-sm mb-3">수업 정보</h3>
          <div className="space-y-3">
            <InfoRow icon={<Clock className="w-5 h-5 text-content-tertiary" />} label="일시">
              {formatDateKo(classData.startTime)} {formatTime(classData.startTime)} - {formatTime(classData.endTime)}
            </InfoRow>
            <InfoRow icon={<User className="w-5 h-5 text-content-tertiary" />} label="강사">
              {classData.staffName}
            </InfoRow>
            {classData.room && (
              <InfoRow icon={<MapPin className="w-5 h-5 text-content-tertiary" />} label="장소">
                {classData.room}
              </InfoRow>
            )}
            <InfoRow icon={<Users className="w-5 h-5 text-content-tertiary" />} label="정원">
              <span className={cn(isFull && 'text-state-error font-medium')}>
                {classData.booked} / {classData.capacity}명
                {!isFull && <span className="text-state-success ml-2">(잔여 {remaining}석)</span>}
                {isFull && <span className="text-state-error ml-2">(마감)</span>}
              </span>
            </InfoRow>
          </div>
        </div>

        {/* 정원 시각화 */}
        <div className="bg-surface rounded-card p-4 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">예약 현황</span>
            <span className="text-sm text-content-secondary">{Math.round((classData.booked / classData.capacity) * 100)}%</span>
          </div>
          <div className="progress-bar">
            <div
              className={cn(
                'progress-bar-fill',
                isFull ? 'bg-state-error' : classData.booked / classData.capacity > 0.7 ? 'bg-state-warning' : 'bg-state-success'
              )}
              style={{ width: `${(classData.booked / classData.capacity) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      {!isPast && (
        <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-line p-4 pb-safe-bottom">
          <div className="max-w-lg mx-auto flex gap-3">
            {!isFull ? (
              <button
                onClick={handleReserve}
                disabled={reserving}
                className="flex-1 py-3.5 rounded-button font-semibold bg-primary text-white active:bg-primary-dark disabled:opacity-50"
              >
                {reserving ? '처리 중...' : '예약하기'}
              </button>
            ) : (
              <button
                onClick={handleWaitlist}
                className="flex-1 py-3.5 rounded-button font-semibold bg-state-warning text-white active:opacity-80"
              >
                대기열 등록
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div className="flex-1">
        <p className="text-xs text-content-tertiary">{label}</p>
        <p className="text-sm">{children}</p>
      </div>
    </div>
  );
}
