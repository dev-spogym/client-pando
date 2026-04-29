import { useEffect, useState } from 'react';
import { ChevronRight, Send, Star } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import {
  appendPreviewTrainerEvaluation,
  getPreviewSearchParam,
  getPreviewTrainerAttendanceMembersByClassId,
  getPreviewTrainerClasses,
  isPreviewMode,
} from '@/lib/preview';
import { supabase } from '@/lib/supabase';
import { cn, formatTime, formatDateKo } from '@/lib/utils';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button, Card, Chip, Avatar, EmptyState } from '@/components/ui';

interface ClassItem {
  id: number;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
}

interface AttendanceMember {
  memberId: number;
  memberName: string;
}

interface FeedbackForm {
  memberId: number;
  memberName: string;
  content: string;
  score: number;
}

type ViewMode = 'list' | 'feedback';

/** 트레이너 - 운동 피드백 */
export default function TrainerFeedback() {
  const { trainer } = useAuthStore();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('list');
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [attendees, setAttendees] = useState<AttendanceMember[]>([]);
  const [feedbacks, setFeedbacks] = useState<Map<number, FeedbackForm>>(new Map());
  const [submitting, setSubmitting] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'week'>('today');

  useEffect(() => {
    if (!trainer) return;
    fetchClasses();
  }, [trainer, filterPeriod]);

  useEffect(() => {
    if (!isPreviewMode() || selectedClass || classes.length === 0) return;

    const requestedView = getPreviewSearchParam('view');
    const requestedClassId = Number(getPreviewSearchParam('classId'));
    if (requestedView !== 'feedback' || Number.isNaN(requestedClassId)) return;

    const previewClass = classes.find((item) => item.id === requestedClassId);
    if (previewClass) {
      void selectClass(previewClass);
    }
  }, [classes, selectedClass]);

  const fetchClasses = async () => {
    if (!trainer) return;
    setLoading(true);

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    let startDate = `${todayStr}T00:00:00`;
    if (filterPeriod === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      startDate = weekAgo.toISOString();
    }

    if (isPreviewMode()) {
      const filteredClasses = getPreviewTrainerClasses().filter((item) => (
        item.startTime >= startDate && item.startTime <= `${todayStr}T23:59:59`
      ));
      setClasses(filteredClasses.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()));
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('classes')
      .select('id, title, type, startTime, endTime')
      .eq('branchId', trainer.branchId)
      .eq('staffId', trainer.staffId)
      .gte('startTime', startDate)
      .lte('startTime', `${todayStr}T23:59:59`)
      .order('startTime', { ascending: false });

    if (data) setClasses(data);
    setLoading(false);
  };

  const selectClass = async (cls: ClassItem) => {
    setSelectedClass(cls);

    if (isPreviewMode()) {
      const previewAttendees = getPreviewTrainerAttendanceMembersByClassId(cls.id);
      setAttendees(previewAttendees);

      const map = new Map<number, FeedbackForm>();
      previewAttendees.forEach((attendee) => {
        map.set(attendee.memberId, {
          memberId: attendee.memberId,
          memberName: attendee.memberName,
          content: '',
          score: 5,
        });
      });
      setFeedbacks(map);
      setView('feedback');
      return;
    }

    const { data } = await supabase
      .from('attendance')
      .select('memberId, memberName')
      .eq('branchId', trainer!.branchId)
      .gte('checkInAt', cls.startTime)
      .lte('checkInAt', cls.endTime);

    if (data) {
      const unique = Array.from(new Map(data.map((a) => [a.memberId, a])).values());
      setAttendees(unique);

      const map = new Map<number, FeedbackForm>();
      unique.forEach((a) => {
        map.set(a.memberId, {
          memberId: a.memberId,
          memberName: a.memberName,
          content: '',
          score: 5,
        });
      });
      setFeedbacks(map);
    }

    setView('feedback');
  };

  const updateFeedback = (memberId: number, field: 'content' | 'score', value: string | number) => {
    setFeedbacks((prev) => {
      const next = new Map(prev);
      const item = next.get(memberId);
      if (item) {
        next.set(memberId, { ...item, [field]: value });
      }
      return next;
    });
  };

  const submitFeedbacks = async () => {
    if (!trainer || !selectedClass) return;
    setSubmitting(true);

    const entries = Array.from(feedbacks.values()).filter((f) => f.content.trim());
    if (entries.length === 0) {
      toast.error('피드백 내용을 1건 이상 입력해주세요.');
      setSubmitting(false);
      return;
    }

    if (isPreviewMode()) {
      entries.forEach((item) => {
        appendPreviewTrainerEvaluation({
          memberId: item.memberId,
          staffName: trainer.staffName || trainer.name,
          category: `${selectedClass.title} 피드백`,
          score: item.score,
          content: item.content,
        });
      });
      toast.success(`${entries.length}건의 피드백이 저장되었습니다.`);
      setView('list');
      setSubmitting(false);
      return;
    }

    const inserts = entries.map((f) => ({
      memberId: f.memberId,
      staffId: trainer.staffId,
      staffName: trainer.staffName || trainer.name,
      category: `${selectedClass.title} 피드백`,
      score: f.score,
      content: f.content,
      branchId: trainer.branchId,
    }));

    const { error } = await supabase.from('member_evaluations').insert(inserts);

    if (error) {
      toast.error('피드백 저장에 실패했습니다.');
    } else {
      toast.success(`${entries.length}건의 피드백이 저장되었습니다.`);
      setView('list');
    }
    setSubmitting(false);
  };

  if (!trainer) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <LoadingSpinner fullScreen text="피드백 화면 로딩 중..." />
      </div>
    );
  }

  return (
    <div className="pull-to-refresh">
      {/* 헤더 */}
      <header className="bg-gradient-to-br from-teal-600 to-emerald-600 px-5 pt-safe-top pb-4">
        <div className="pt-4 flex items-center gap-3">
          {view === 'feedback' && (
            <button onClick={() => setView('list')} className="text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-white text-lg font-bold">
            {view === 'list' ? '운동 피드백' : selectedClass?.title || '피드백 작성'}
          </h1>
        </div>
      </header>

      {/* 수업 목록 뷰 */}
      {view === 'list' && (
        <div className="px-5 py-4 space-y-4">
          {/* 기간 필터 */}
          <div className="flex gap-2">
            {([
              { key: 'today' as const, label: '오늘' },
              { key: 'week' as const, label: '이번 주' },
            ]).map((p) => (
              <Chip
                key={p.key}
                active={filterPeriod === p.key}
                onClick={() => setFilterPeriod(p.key)}
              >
                {p.label}
              </Chip>
            ))}
          </div>

          {loading ? (
            <div className="py-12"><LoadingSpinner text="수업 로딩 중..." /></div>
          ) : classes.length === 0 ? (
            <EmptyState size="sm" title="해당 기간에 수업이 없습니다" />
          ) : (
            <div className="space-y-2">
              {classes.map((cls) => (
                <Card
                  key={cls.id}
                  variant="elevated"
                  padding="md"
                  interactive
                  onClick={() => selectClass(cls)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-card flex items-center justify-center',
                      cls.type === 'PT' ? 'bg-primary-light' : 'bg-surface-secondary'
                    )}>
                      <span className={cn(
                        'text-xs font-bold',
                        cls.type === 'PT' ? 'text-primary' : 'text-content-secondary'
                      )}>
                        {cls.type}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{cls.title}</p>
                      <p className="text-xs text-content-secondary">
                        {formatDateKo(cls.startTime)} {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-content-tertiary" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 피드백 작성 뷰 */}
      {view === 'feedback' && (
        <div className="px-5 py-4 space-y-4 pb-24">
          {attendees.length === 0 ? (
            <EmptyState size="sm" title="이 수업에 출석한 회원이 없습니다" />
          ) : (
            <>
              <p className="text-sm text-content-secondary">
                참여 회원 {attendees.length}명에게 피드백을 작성하세요.
              </p>

              {attendees.map((att) => {
                const fb = feedbacks.get(att.memberId);
                return (
                  <Card key={att.memberId} variant="elevated" padding="md">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={att.memberName} size="sm" />
                        <p className="font-semibold text-sm">{att.memberName}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-primary" />
                        <input
                          type="range"
                          min={1}
                          max={10}
                          value={fb?.score || 5}
                          onChange={(e) => updateFeedback(att.memberId, 'score', Number(e.target.value))}
                          className="flex-1 accent-primary"
                        />
                        <span className="text-sm font-bold text-primary w-6 text-right">
                          {fb?.score || 5}
                        </span>
                      </div>

                      <textarea
                        value={fb?.content || ''}
                        onChange={(e) => updateFeedback(att.memberId, 'content', e.target.value)}
                        placeholder="운동 피드백을 입력하세요"
                        rows={2}
                        className="w-full px-3 py-2 rounded-input border border-line text-sm focus:outline-none focus:border-primary resize-none"
                      />
                    </div>
                  </Card>
                );
              })}

              <Button
                variant="primary"
                size="lg"
                fullWidth
                leftIcon={<Send className="w-4 h-4" />}
                onClick={submitFeedbacks}
                disabled={submitting}
                loading={submitting}
              >
                피드백 저장
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
