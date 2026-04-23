import { useEffect, useState } from 'react';
import { BookOpen, Clock } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPreviewLessons, isPreviewMode } from '@/lib/preview';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import {
  getFeedbackByClass,
  getAllReservations,
  getReservation,
  getWaitlistEntry,
} from '@/lib/memberExperience';
import { getMemberLessonBookingRequests } from '@/lib/lessonPlanning';
import { cn } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ClassRecord {
  id: number;
  title: string;
  staffId: number | null;
  staffName: string;
  startTime: string;
  endTime: string;
  room: string | null;
  type: string;
  lesson_status: string | null;
}

type TimelineItem =
  | ({
      key: string;
      kind: 'class';
    } & ClassRecord)
  | {
      key: string;
      kind: 'request';
      id: number;
      title: string;
      staffId: number | null;
      staffName: string;
      startTime: string;
      endTime: string;
      room: string | null;
      type: string;
      lesson_status: 'pending' | 'approved';
      requestId: string;
    };

/** 내 수업 / 후기 */
export default function LessonHistory() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const member = useAuthStore((state) => state.member);
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'past'>(() =>
    searchParams.get('tab') === 'past' ? 'past' : 'upcoming'
  );

  useEffect(() => {
    setTab(searchParams.get('tab') === 'past' ? 'past' : 'upcoming');
  }, [searchParams]);

  useEffect(() => {
    if (!member?.id) return;

    const fetchLessons = async () => {
      setLoading(true);

      let baseClasses: ClassRecord[] = [];

      if (isPreviewMode()) {
        baseClasses = getPreviewLessons().map((item) => ({
          ...item,
          staffId: item.staffId ?? null,
          lesson_status: item.lesson_status ?? null,
        }));
      } else {
        const { data: myClasses } = await supabase
          .from('classes')
          .select('id, title, staffId, staffName, startTime, endTime, room, type, lesson_status')
          .eq('member_id', member.id)
          .order('startTime', { ascending: false })
          .limit(50);

        const now = new Date().toISOString();
        const { data: gxClasses } = await supabase
          .from('classes')
          .select('id, title, staffId, staffName, startTime, endTime, room, type, lesson_status')
          .eq('branchId', member.branchId)
          .neq('type', 'PT')
          .is('member_id', null)
          .gte('startTime', now)
          .order('startTime')
          .limit(20);

        const classMap = new Map<number, ClassRecord>();
        (myClasses || []).forEach((item) => classMap.set(item.id, { ...item, staffId: item.staffId ?? null }));
        (gxClasses || []).forEach((item) => {
          if (!classMap.has(item.id)) {
            classMap.set(item.id, { ...item, staffId: item.staffId ?? null });
          }
        });
        baseClasses = Array.from(classMap.values());
      }

      const classMap = new Map<string, TimelineItem>();
      baseClasses.forEach((item) => {
        classMap.set(`class-${item.id}`, {
          ...item,
          key: `class-${item.id}`,
          kind: 'class',
        });
      });

      getAllReservations(member.id).forEach((reservation) => {
        if (reservation.status === 'cancelled') return;
        const key = `class-${reservation.classId}`;
        const existingItem = classMap.get(key);
        if (existingItem?.kind === 'class') {
          if (reservation.status === 'completed' && existingItem.lesson_status !== 'completed') {
            classMap.set(key, {
              ...existingItem,
              lesson_status: 'completed',
            });
          }
          return;
        }

        classMap.set(key, {
          key,
          kind: 'class',
          id: reservation.classId,
          title: reservation.title,
          staffId: reservation.staffId ?? null,
          staffName: reservation.staffName,
          startTime: reservation.startTime,
          endTime: reservation.endTime,
          room: reservation.room,
          type: reservation.type,
          lesson_status: reservation.status === 'completed' ? 'completed' : 'reserved',
        });
      });

      getMemberLessonBookingRequests(member.id, ['pending', 'approved']).forEach((request) => {
        if (request.status !== 'pending' && request.status !== 'approved') return;
        const existing = classMap.get(`class-${request.classId}`);
        if (request.status === 'approved' && existing) return;

        classMap.set(`request-${request.id}`, {
          key: `request-${request.id}`,
          kind: 'request',
          id: request.classId,
          title: request.title,
          staffId: request.trainerId,
          staffName: request.trainerName,
          startTime: request.startTime,
          endTime: request.endTime,
          room: request.room,
          type: request.type,
          lesson_status: request.status,
          requestId: request.id,
        });
      });

      setItems(
        Array.from(classMap.values()).sort(
          (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        )
      );
      setLoading(false);
    };

    fetchLessons();
  }, [member?.id, member?.branchId]);

  const now = new Date();
  const upcoming = items.filter((item) => {
    if (item.kind === 'request') return true;
    if (item.lesson_status === 'completed') return false;
    return new Date(item.startTime) >= now;
  });
  const past = items.filter(
    (item) => item.kind === 'class' && (item.lesson_status === 'completed' || new Date(item.startTime) < now)
  );
  const displayed = tab === 'upcoming' ? upcoming : past;

  const formatLessonDate = (iso: string) => {
    const date = new Date(iso);
    return `${date.getMonth() + 1}/${date.getDate()} (${['일', '월', '화', '수', '목', '금', '토'][date.getDay()]})`;
  };

  const formatLessonTime = (iso: string) => {
    const date = new Date(iso);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  if (!member) {
    return <LoadingSpinner fullScreen text="수업 내역을 불러오는 중..." />;
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="px-4 pt-4 pb-24">
        <div className="flex gap-2 mb-4">
          {(['upcoming', 'past'] as const).map((item) => (
            <button
              key={item}
              onClick={() => {
                setTab(item);
                const next = new URLSearchParams(searchParams);
                if (item === 'upcoming') next.delete('tab');
                else next.set('tab', item);
                setSearchParams(next, { replace: true });
              }}
              className={cn(
                'flex-1 py-2 rounded-lg text-[13px] font-semibold transition-colors',
                tab === item ? 'bg-primary text-white' : 'bg-surface text-content-secondary'
              )}
            >
              {item === 'upcoming' ? `예정 (${upcoming.length})` : `완료 (${past.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary-light border-t-primary rounded-full animate-spin" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-12 text-content-tertiary">
            <BookOpen size={40} className="mx-auto mb-2" />
            <p className="text-[14px]">{tab === 'upcoming' ? '예정된 수업이 없습니다' : '수업 이력이 없습니다'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map((item) => {
              const feedback = member && item.kind === 'class' ? getFeedbackByClass(member.id, item.id) : null;
              const reserved = member && item.kind === 'class' ? getReservation(member.id, item.id) : null;
              const waitlist = member && item.kind === 'class' ? getWaitlistEntry(member.id, item.id) : null;

              return (
                <div key={item.key} className="p-4 rounded-xl border border-line bg-surface shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] text-content-tertiary">
                          {item.type === 'PERSONAL' ? '1:1' : item.type === 'GROUP' ? '그룹' : item.type}
                        </span>
                        {item.kind === 'request' && item.lesson_status === 'pending' && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-state-warning/10 text-state-warning font-medium">
                            승인 대기
                          </span>
                        )}
                        {item.kind === 'request' && item.lesson_status === 'approved' && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-state-success/10 text-state-success font-medium">
                            예약 확정
                          </span>
                        )}
                        {reserved && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-state-success/10 text-state-success font-medium">
                            예약 확정
                          </span>
                        )}
                        {item.kind === 'class' && item.lesson_status === 'completed' && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-state-info/10 text-state-info font-medium">
                            수업 완료
                          </span>
                        )}
                        {waitlist && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-state-warning/10 text-state-warning font-medium">
                            대기 {waitlist.position}번
                          </span>
                        )}
                        {feedback && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary-light text-primary font-medium">
                            후기 완료
                          </span>
                        )}
                      </div>
                      <p className="text-[15px] font-bold text-content">{item.title}</p>
                      <p className="text-[12px] text-content-secondary mt-1 flex items-center gap-1">
                        <Clock size={12} />
                        {formatLessonDate(item.startTime)} {formatLessonTime(item.startTime)}~{formatLessonTime(item.endTime)}
                      </p>
                      <p className="text-[12px] text-content-secondary">
                        강사: {item.staffName}{item.room ? ` · ${item.room}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    {item.kind === 'request' ? (
                      <>
                        <button
                          onClick={() =>
                            item.id > 0
                              ? navigate(`/classes/${item.id}`)
                              : item.staffId && navigate(`/instructors/${item.staffId}`)
                          }
                          className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-medium"
                        >
                          {item.id > 0 ? '요청 시간 보기' : '요청 시간 확인'}
                        </button>
                        <button
                          onClick={() => item.staffId && navigate(`/instructors/${item.staffId}`)}
                          className="flex-1 py-2.5 rounded-lg bg-surface-secondary text-content-secondary text-sm font-medium"
                        >
                          강사 보기
                        </button>
                      </>
                    ) : tab === 'upcoming' ? (
                      <>
                        <button
                          onClick={() => navigate(`/classes/${item.id}`)}
                          className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-medium"
                        >
                          수업 상세
                        </button>
                        {waitlist ? (
                          <button
                            onClick={() => navigate('/waitlist')}
                            className="flex-1 py-2.5 rounded-lg bg-surface-secondary text-content-secondary text-sm font-medium"
                          >
                            대기 현황
                          </button>
                        ) : (
                          <button
                            onClick={() => item.staffId && navigate(`/instructors/${item.staffId}`)}
                            className="flex-1 py-2.5 rounded-lg bg-surface-secondary text-content-secondary text-sm font-medium"
                          >
                            강사 보기
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => navigate(`/classes/${item.id}`)}
                          className="flex-1 py-2.5 rounded-lg bg-surface-secondary text-content-secondary text-sm font-medium"
                        >
                          수업 다시 보기
                        </button>
                        <button
                          onClick={() => navigate(`/classes/${item.id}/feedback`)}
                          className={cn(
                            'flex-1 py-2.5 rounded-lg text-sm font-medium',
                            feedback ? 'bg-primary-light text-primary' : 'bg-primary text-white'
                          )}
                        >
                          {feedback ? '후기 확인' : '후기 작성'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
