import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, CalendarDays, MessageSquare, FileText,
  ChevronRight, Clock, Dumbbell,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import {
  getPreviewTrainerClasses,
  getPreviewTrainerTodayAttendanceIds,
  isPreviewMode,
} from '@/lib/preview';
import { supabase } from '@/lib/supabase';
import { cn, formatTime } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

interface TodaySummary {
  totalClasses: number;
  nextClass: { title: string; startTime: string } | null;
  todayVisitors: number;
}

/** 트레이너 홈 대시보드 */
export default function TrainerHome() {
  const navigate = useNavigate();
  const { trainer } = useAuthStore();
  const [summary, setSummary] = useState<TodaySummary>({
    totalClasses: 0,
    nextClass: null,
    todayVisitors: 0,
  });

  useEffect(() => {
    if (!trainer) return;
    fetchSummary();
  }, [trainer]);

  const fetchSummary = async () => {
    if (!trainer) return;

    if (isPreviewMode()) {
      const previewClasses = getPreviewTrainerClasses();
      const todayStr = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      const todayClasses = previewClasses.filter((item) => item.startTime.startsWith(todayStr));
      const nextClass = todayClasses.find((item) => item.startTime > now) || null;

      setSummary({
        totalClasses: todayClasses.length,
        nextClass: nextClass ? { title: nextClass.title, startTime: nextClass.startTime } : null,
        todayVisitors: getPreviewTrainerTodayAttendanceIds().length,
      });
      return;
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const now = today.toISOString();

    // 오늘 수업 조회
    const { data: classes } = await supabase
      .from('classes')
      .select('id, title, startTime, endTime')
      .eq('branchId', trainer.branchId)
      .eq('staffId', trainer.staffId)
      .gte('startTime', `${todayStr}T00:00:00`)
      .lte('startTime', `${todayStr}T23:59:59`)
      .order('startTime');

    const totalClasses = classes?.length || 0;
    const nextClass = classes?.find((c) => c.startTime > now) || null;

    // 오늘 방문 회원 수
    const { count: todayVisitors } = await supabase
      .from('attendance')
      .select('id', { count: 'exact', head: true })
      .eq('branchId', trainer.branchId)
      .gte('checkInAt', `${todayStr}T00:00:00`)
      .lte('checkInAt', `${todayStr}T23:59:59`);

    setSummary({
      totalClasses,
      nextClass: nextClass ? { title: nextClass.title, startTime: nextClass.startTime } : null,
      todayVisitors: todayVisitors || 0,
    });
  };

  if (!trainer) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <LoadingSpinner fullScreen text="트레이너 홈 로딩 중..." />
      </div>
    );
  }

  const quickMenus = [
    { icon: <Users className="w-6 h-6 text-teal-600" />, label: '회원관리', path: '/trainer/members' },
    { icon: <CalendarDays className="w-6 h-6 text-teal-500" />, label: '일정관리', path: '/trainer/schedule' },
    { icon: <MessageSquare className="w-6 h-6 text-emerald-500" />, label: '운동피드백', path: '/trainer/feedback' },
    { icon: <FileText className="w-6 h-6 text-green-500" />, label: '공지작성', path: '/notices' },
  ];

  return (
    <div className="pull-to-refresh">
      {/* 상단 헤더 - 트레이너 테마 (틸/초록 그라데이션) */}
      <header className="bg-gradient-to-br from-teal-600 to-emerald-600 px-5 pt-safe-top pb-6">
        <div className="pt-4 flex items-center justify-between mb-4">
          <div>
            <p className="text-white/80 text-sm">트레이너</p>
            <h1 className="text-white text-xl font-bold">{trainer.staffName || trainer.name}님</h1>
          </div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-white text-xs font-medium">
            {trainer.role}
          </span>
        </div>

        {/* 오늘 요약 카드 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="w-4 h-4 text-white/80" />
              <span className="text-white/80 text-xs">오늘 수업</span>
            </div>
            <p className="text-white text-2xl font-bold">{summary.totalClasses}건</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-white/80" />
              <span className="text-white/80 text-xs">오늘 방문</span>
            </div>
            <p className="text-white text-2xl font-bold">{summary.todayVisitors}명</p>
          </div>
        </div>
      </header>

      <div className="px-5 -mt-2 space-y-4 pb-4">
        {/* 다음 수업 카드 */}
        {summary.nextClass && (
          <div
            onClick={() => navigate('/trainer/schedule')}
            className="bg-surface rounded-card p-4 shadow-card touch-card cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-content-tertiary">다음 수업</p>
                <p className="font-semibold text-sm truncate">{summary.nextClass.title}</p>
                <div className="flex items-center gap-1 text-xs text-content-secondary">
                  <Clock className="w-3 h-3" />
                  {formatTime(summary.nextClass.startTime)}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-content-tertiary" />
            </div>
          </div>
        )}

        {/* 빠른 메뉴 */}
        <div className="grid grid-cols-4 gap-3">
          {quickMenus.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="bg-surface rounded-card p-3 shadow-card flex flex-col items-center gap-2 touch-card"
            >
              <div className="w-10 h-10 bg-surface-secondary rounded-xl flex items-center justify-center">
                {item.icon}
              </div>
              <span className="text-xs font-medium text-content-secondary">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
