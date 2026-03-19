import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Check, Pen, AlertTriangle, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
// 레이아웃은 App.tsx의 MobileLayout Outlet으로 자동 적용

// ─── 타입 ───────────────────────────────────────────────────
type LessonStatus = 'scheduled' | 'in_progress' | 'completed' | 'no_show' | 'cancelled' | 'pending_signature';

interface LessonRecord {
  id: number;
  title: string;
  staffName: string;
  startTime: string;
  endTime: string;
  room: string | null;
  lesson_status: LessonStatus;
  signature_url: string | null;
  signature_at: string | null;
  completed_at: string | null;
  type: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  scheduled:         { label: '예정',     color: 'text-blue-600',   bg: 'bg-blue-50' },
  in_progress:       { label: '진행중',    color: 'text-yellow-600', bg: 'bg-yellow-50' },
  completed:         { label: '완료',     color: 'text-green-600',  bg: 'bg-green-50' },
  pending_signature: { label: '서명 대기', color: 'text-orange-600', bg: 'bg-orange-50' },
  no_show:           { label: '노쇼',     color: 'text-red-600',    bg: 'bg-red-50' },
  cancelled:         { label: '취소',     color: 'text-gray-500',   bg: 'bg-gray-50' },
};

// ─── 컴포넌트 ───────────────────────────────────────────────
export default function LessonHistory() {
  const navigate = useNavigate();
  const member = useAuthStore(s => s.member);
  const [lessons, setLessons] = useState<LessonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    if (!member?.id) return;
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('classes')
        .select('*')
        .eq('member_id', member.id)
        .order('startTime', { ascending: false })
        .limit(50);

      if (data) {
        // 서명 대기 상태 판별: completed인데 signature_url 없으면 pending_signature
        setLessons(data.map((d: any) => ({
          ...d,
          lesson_status: d.lesson_status === 'completed' && !d.signature_url
            ? 'pending_signature'
            : d.lesson_status ?? 'scheduled',
        })));
      }
      setLoading(false);
    };
    fetch();
  }, [member?.id]);

  const now = new Date();
  const upcoming = lessons.filter(l => new Date(l.startTime) >= now || l.lesson_status === 'in_progress' || l.lesson_status === 'pending_signature');
  const past = lessons.filter(l => new Date(l.startTime) < now && l.lesson_status !== 'in_progress' && l.lesson_status !== 'pending_signature');

  const displayed = tab === 'upcoming' ? upcoming : past;
  const pendingCount = lessons.filter(l => l.lesson_status === 'pending_signature').length;

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
        {/* 서명 대기 배너 */}
        {pendingCount > 0 && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
              <Pen size={20} className="text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-orange-700">서명 대기 {pendingCount}건</p>
              <p className="text-[11px] text-orange-600">수업 완료 후 서명이 필요합니다</p>
            </div>
          </div>
        )}

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
              {t === 'upcoming' ? `예정/진행 (${upcoming.length})` : `완료 (${past.length})`}
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
            {displayed.map(lesson => {
              const cfg = STATUS_CONFIG[lesson.lesson_status] ?? STATUS_CONFIG.scheduled;
              const needsSign = lesson.lesson_status === 'pending_signature';

              return (
                <div
                  key={lesson.id}
                  onClick={() => {
                    if (needsSign) navigate(`/lesson-sign/${lesson.id}`);
                  }}
                  className={`p-4 rounded-xl border transition-all ${
                    needsSign
                      ? 'border-orange-300 bg-orange-50/50 active:scale-[0.98] cursor-pointer'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        {lesson.type && (
                          <span className="text-[11px] text-gray-500">{lesson.type === 'PERSONAL' ? '1:1' : lesson.type === 'GROUP' ? '그룹' : lesson.type}</span>
                        )}
                      </div>
                      <p className="text-[15px] font-bold text-gray-900">{lesson.title}</p>
                      <p className="text-[12px] text-gray-500 mt-1">
                        {fmtDate(lesson.startTime)} {fmtTime(lesson.startTime)}~{fmtTime(lesson.endTime)}
                      </p>
                      <p className="text-[12px] text-gray-500">
                        강사: {lesson.staffName}{lesson.room ? ` · ${lesson.room}` : ''}
                      </p>
                    </div>

                    {/* 서명 필요 표시 */}
                    {needsSign && (
                      <div className="flex items-center gap-1 text-orange-600">
                        <Pen size={16} />
                        <ChevronRight size={16} />
                      </div>
                    )}

                    {/* 서명 완료 표시 */}
                    {lesson.signature_url && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Check size={14} />
                        <span className="text-[11px] font-medium">서명완료</span>
                      </div>
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
