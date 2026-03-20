import { useState, useEffect } from 'react';
import { BookOpen, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
// 레이아웃은 App.tsx의 MobileLayout Outlet으로 자동 적용

// ─── 타입 ───────────────────────────────────────────────────
interface ClassRecord {
  id: number;
  title: string;
  staffName: string;
  startTime: string;
  endTime: string;
  room: string | null;
  type: string;
  attendedAt: string; // attendance.checkInAt
}

// ─── 컴포넌트 ───────────────────────────────────────────────
export default function LessonHistory() {
  const member = useAuthStore(s => s.member);
  const [lessons, setLessons] = useState<ClassRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    if (!member?.id) return;
    const fetchLessons = async () => {
      setLoading(true);

      // 1단계: attendance 테이블에서 회원의 출석 기록 조회
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('classId, checkInAt')
        .eq('memberId', member.id)
        .not('classId', 'is', null)
        .order('checkInAt', { ascending: false })
        .limit(50);

      if (!attendanceData || attendanceData.length === 0) {
        setLessons([]);
        setLoading(false);
        return;
      }

      // 2단계: 해당 class ID들로 classes 조회
      const classIds = attendanceData.map((a: any) => a.classId);
      const { data: classesData } = await supabase
        .from('classes')
        .select('id, title, staffName, startTime, endTime, room, type')
        .in('id', classIds);

      if (classesData) {
        // attendance의 checkInAt과 classes 정보를 합쳐서 목록 구성
        const attendanceMap = new Map(attendanceData.map((a: any) => [a.classId, a.checkInAt]));
        const combined: ClassRecord[] = classesData.map((c: any) => ({
          id: c.id,
          title: c.title,
          staffName: c.staffName,
          startTime: c.startTime,
          endTime: c.endTime,
          room: c.room,
          type: c.type,
          attendedAt: attendanceMap.get(c.id) ?? c.startTime,
        }));
        // 최신순 정렬
        combined.sort((a, b) => new Date(b.attendedAt).getTime() - new Date(a.attendedAt).getTime());
        setLessons(combined);
      }

      setLoading(false);
    };
    fetchLessons();
  }, [member?.id]);

  const now = new Date();
  const upcoming = lessons.filter(l => new Date(l.startTime) >= now);
  const past = lessons.filter(l => new Date(l.startTime) < now);

  const displayed = tab === 'upcoming' ? upcoming : past;

  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} (${['일','월','화','수','목','금','토'][d.getDay()]})`;
  };
  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div>
      <div className="px-4 pt-4 pb-24">
        {/* 탭 */}
        <div className="flex gap-2 mb-4">
          {(['upcoming', 'past'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                tab === t ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {t === 'upcoming' ? `예정 (${upcoming.length})` : `완료 (${past.length})`}
            </button>
          ))}
        </div>

        {/* 수업 목록 */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <BookOpen size={40} className="mx-auto mb-2" />
            <p className="text-[14px]">{tab === 'upcoming' ? '예정된 수업이 없습니다' : '수업 이력이 없습니다'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map(lesson => (
              <div
                key={lesson.id}
                className="p-4 rounded-xl border border-gray-200 bg-white"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {lesson.type && (
                        <span className="text-[11px] text-gray-500">
                          {lesson.type === 'PERSONAL' ? '1:1' : lesson.type === 'GROUP' ? '그룹' : lesson.type}
                        </span>
                      )}
                    </div>
                    <p className="text-[15px] font-bold text-gray-900">{lesson.title}</p>
                    <p className="text-[12px] text-gray-500 mt-1 flex items-center gap-1">
                      <Clock size={12} />
                      {fmtDate(lesson.startTime)} {fmtTime(lesson.startTime)}~{fmtTime(lesson.endTime)}
                    </p>
                    <p className="text-[12px] text-gray-500">
                      강사: {lesson.staffName}{lesson.room ? ` · ${lesson.room}` : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
