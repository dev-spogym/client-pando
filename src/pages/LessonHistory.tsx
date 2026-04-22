import { useEffect, useState } from 'react';
import { BookOpen, Clock } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPreviewLessons, isPreviewMode } from '@/lib/preview';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { getFeedbackByClass, getReservation, getWaitlistEntry } from '@/lib/memberExperience';
import { cn } from '@/lib/utils';

interface ClassRecord {
  id: number;
  title: string;
  staffId: number;
  staffName: string;
  startTime: string;
  endTime: string;
  room: string | null;
  type: string;
  lesson_status: string | null;
}

/** 내 수업 / 후기 */
export default function LessonHistory() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const member = useAuthStore((state) => state.member);
  const [lessons, setLessons] = useState<ClassRecord[]>([]);
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

      if (isPreviewMode()) {
        setLessons(getPreviewLessons());
        setLoading(false);
        return;
      }

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
      (myClasses || []).forEach((item) => classMap.set(item.id, item));
      (gxClasses || []).forEach((item) => {
        if (!classMap.has(item.id)) classMap.set(item.id, item);
      });

      const combined = Array.from(classMap.values()).sort(
        (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );

      setLessons(combined);
      setLoading(false);
    };

    fetchLessons();
  }, [member?.id, member?.branchId]);

  const now = new Date();
  const upcoming = lessons.filter((lesson) => new Date(lesson.startTime) >= now);
  const past = lessons.filter((lesson) => new Date(lesson.startTime) < now);
  const displayed = tab === 'upcoming' ? upcoming : past;

  const formatLessonDate = (iso: string) => {
    const date = new Date(iso);
    return `${date.getMonth() + 1}/${date.getDate()} (${['일', '월', '화', '수', '목', '금', '토'][date.getDay()]})`;
  };

  const formatLessonTime = (iso: string) => {
    const date = new Date(iso);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

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
            {displayed.map((lesson) => {
              const reserved = member ? getReservation(member.id, lesson.id) : null;
              const waitlist = member ? getWaitlistEntry(member.id, lesson.id) : null;
              const feedback = member ? getFeedbackByClass(member.id, lesson.id) : null;

              return (
                <div key={lesson.id} className="p-4 rounded-xl border border-line bg-surface shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] text-content-tertiary">
                          {lesson.type === 'PERSONAL' ? '1:1' : lesson.type === 'GROUP' ? '그룹' : lesson.type}
                        </span>
                        {reserved && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-state-success/10 text-state-success font-medium">
                            예약 확정
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
                      <p className="text-[15px] font-bold text-content">{lesson.title}</p>
                      <p className="text-[12px] text-content-secondary mt-1 flex items-center gap-1">
                        <Clock size={12} />
                        {formatLessonDate(lesson.startTime)} {formatLessonTime(lesson.startTime)}~{formatLessonTime(lesson.endTime)}
                      </p>
                      <p className="text-[12px] text-content-secondary">
                        강사: {lesson.staffName}{lesson.room ? ` · ${lesson.room}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    {tab === 'upcoming' ? (
                      <>
                        <button
                          onClick={() => navigate(`/classes/${lesson.id}`)}
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
                            onClick={() => navigate(`/instructors/${lesson.staffId}`)}
                            className="flex-1 py-2.5 rounded-lg bg-surface-secondary text-content-secondary text-sm font-medium"
                          >
                            강사 보기
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => navigate(`/classes/${lesson.id}`)}
                          className="flex-1 py-2.5 rounded-lg bg-surface-secondary text-content-secondary text-sm font-medium"
                        >
                          수업 다시 보기
                        </button>
                        <button
                          onClick={() => navigate(`/classes/${lesson.id}/feedback`)}
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
