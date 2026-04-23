import { useEffect, useState } from 'react';
import { ArrowLeft, Star } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getPreviewClassById, isPreviewMode } from '@/lib/preview';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { getFeedbackByClass, saveFeedback } from '@/lib/memberExperience';
import { cn } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

const FEEDBACK_TAGS = ['설명이 쉬워요', '난이도가 적절해요', '시설이 쾌적해요', '다음에도 듣고 싶어요'];

interface ClassSummary {
  id: number;
  title: string;
  staffName: string;
  type: string;
}

/** 수업 후기 */
export default function ClassFeedback() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { member } = useAuthStore();
  const [classInfo, setClassInfo] = useState<ClassSummary | null>(null);
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [nps, setNps] = useState<number | null>(null);

  const classId = Number(id);

  useEffect(() => {
    if (!classId) return;
    const fetchClass = async () => {
      if (isPreviewMode()) {
        setClassInfo(getPreviewClassById(classId));
        return;
      }

      const { data } = await supabase
        .from('classes')
        .select('id, title, staffName, type')
        .eq('id', classId)
        .single();

      if (data) setClassInfo(data);
    };
    fetchClass();
  }, [classId]);

  if (!member) return <LoadingSpinner fullScreen text="후기 화면을 준비 중..." />;

  const existing = getFeedbackByClass(member.id, classId);

  const toggleTag = (value: string) => {
    setTags((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const handleSubmit = () => {
    if (!classInfo || rating === 0) {
      toast.error('별점을 선택해 주세요.');
      return;
    }

    saveFeedback(member.id, {
      classId,
      title: classInfo.title,
      staffName: classInfo.staffName,
      rating,
      tags,
      comment,
      npsScore: nps,
      createdAt: new Date().toISOString(),
    });

    toast.success('후기가 저장되었습니다.');
    navigate('/lessons', { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface-secondary page-with-action">
      <header className="page-header-sticky">
        <div className="flex items-center px-4 pt-safe-top h-14">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-content" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-lg">수업 후기</h1>
          <div className="w-6" />
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 pb-28">
        <section className="bg-surface rounded-card p-5 shadow-card">
          <p className="text-xs text-content-tertiary">완료 수업</p>
          <h2 className="text-lg font-bold mt-1">{classInfo?.title || '수업 정보 확인 중'}</h2>
          <p className="text-sm text-content-secondary mt-2">{classInfo?.staffName || '-'} 강사</p>
        </section>

        {existing ? (
          <section className="bg-surface rounded-card p-5 shadow-card">
            <p className="text-sm font-semibold">이미 후기 작성이 완료되었습니다.</p>
            <div className="mt-3 flex items-center gap-1 text-state-warning">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className={cn('w-5 h-5', index < existing.rating && 'fill-current')} />
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {existing.tags.map((item) => (
                <span key={item} className="px-3 py-1.5 rounded-full bg-primary-light text-primary text-sm font-medium">
                  {item}
                </span>
              ))}
            </div>
            {existing.comment && (
              <p className="mt-4 text-sm text-content-secondary leading-relaxed">{existing.comment}</p>
            )}
          </section>
        ) : (
          <>
            <section className="bg-surface rounded-card p-5 shadow-card">
              <h3 className="text-sm font-semibold mb-3">별점</h3>
              <div className="flex items-center justify-center gap-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <button key={index} onClick={() => setRating(index + 1)}>
                    <Star
                      className={cn(
                        'w-8 h-8 text-state-warning',
                        index < rating ? 'fill-current' : 'text-state-warning/30'
                      )}
                    />
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-surface rounded-card p-5 shadow-card">
              <h3 className="text-sm font-semibold mb-3">빠른 태그</h3>
              <div className="flex flex-wrap gap-2">
                {FEEDBACK_TAGS.map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleTag(item)}
                    className={cn(
                      'px-4 py-2.5 rounded-full text-sm font-medium transition-colors',
                      tags.includes(item) ? 'bg-primary text-white' : 'bg-surface-secondary text-content-secondary'
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-surface rounded-card p-5 shadow-card">
              <h3 className="text-sm font-semibold mb-3">한줄 후기</h3>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value.slice(0, 200))}
                placeholder="수업에서 좋았던 점을 남겨주세요."
                className="w-full h-28 rounded-xl border border-line bg-surface-secondary px-4 py-3 text-sm outline-none resize-none"
              />
              <p className="mt-2 text-xs text-content-tertiary text-right">{comment.length}/200</p>
            </section>

            <section className="bg-surface rounded-card p-5 shadow-card">
              <h3 className="text-sm font-semibold mb-3">추천 의향 점수</h3>
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 11 }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setNps(index)}
                    className={cn(
                      'py-2 rounded-lg text-sm font-medium',
                      nps === index ? 'bg-primary text-white' : 'bg-surface-secondary text-content-secondary'
                    )}
                  >
                    {index}
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {!existing && (
        <div className="bottom-action-bar">
          <div className="max-w-lg mx-auto">
            <button
              onClick={handleSubmit}
              className="w-full py-3.5 rounded-button font-semibold bg-primary text-white"
            >
              후기 제출
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
