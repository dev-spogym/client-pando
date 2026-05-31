import { useMemo, useState } from 'react';
import { Heart, MessageSquareText, PenLine } from 'lucide-react';
import { Badge, Card, Chip, EmptyState, PageHeader } from '@/components/ui';
import { QNA_LIST } from '@/lib/community';

type ActivityTab = 'questions' | 'answers' | 'likes';

/** 내 커뮤니티 활동 */
export default function MyCommunityActivity() {
  const [tab, setTab] = useState<ActivityTab>('questions');
  const rows = useMemo(() => {
    if (tab === 'questions') {
      return QNA_LIST.filter((item) => item.authorName === '익명' || item.authorName.includes('*')).slice(0, 5).map((item) => ({
        id: `q-${item.id}`,
        title: item.title,
        meta: `${item.category} · 답변 ${item.answers.length} · ${item.createdAt}`,
        tone: item.answers.length ? 'success' : 'warning',
        label: item.answers.length ? '답변완료' : '답변대기',
      }));
    }

    if (tab === 'answers') {
      return QNA_LIST.flatMap((item) => item.answers.map((answer) => ({
        id: `a-${answer.id}`,
        title: answer.body,
        meta: `${item.title} · ${answer.createdAt}`,
        tone: answer.helpfulCount > 10 ? 'primary' : 'neutral',
        label: `도움 ${answer.helpfulCount}`,
      }))).slice(0, 5);
    }

    return QNA_LIST.filter((item) => item.likeCount > 8).slice(0, 5).map((item) => ({
      id: `l-${item.id}`,
      title: item.title,
      meta: `${item.category} · 좋아요 ${item.likeCount}`,
      tone: 'error',
      label: '좋아요',
    }));
  }, [tab]);

  return (
    <div className="min-h-screen bg-surface-secondary pb-10">
      <PageHeader title="내 활동" showBack />
      <div className="px-4 py-4 space-y-4">
        <Card padding="lg">
          <h1 className="text-body font-semibold">커뮤니티 활동 요약</h1>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Summary icon={<PenLine className="h-4 w-4" />} label="질문" value={5} />
            <Summary icon={<MessageSquareText className="h-4 w-4" />} label="답변" value={8} />
            <Summary icon={<Heart className="h-4 w-4" />} label="좋아요" value={12} />
          </div>
        </Card>

        <div className="flex gap-2">
          <Chip active={tab === 'questions'} size="sm" onClick={() => setTab('questions')}>질문</Chip>
          <Chip active={tab === 'answers'} size="sm" onClick={() => setTab('answers')}>답변</Chip>
          <Chip active={tab === 'likes'} size="sm" onClick={() => setTab('likes')}>좋아요</Chip>
        </div>

        {rows.length === 0 ? (
          <EmptyState title="활동 이력이 없습니다" description="Q&A에서 질문이나 답변을 남겨보세요." />
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <Card key={row.id} padding="md">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-body-sm font-semibold text-content">{row.title}</p>
                    <p className="mt-1 text-caption text-content-secondary">{row.meta}</p>
                  </div>
                  <Badge tone={row.tone as 'primary' | 'neutral' | 'success' | 'warning' | 'error'} size="sm">
                    {row.label}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Summary({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-card bg-surface-secondary p-3 text-center">
      <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary-light text-primary">
        {icon}
      </div>
      <p className="text-caption text-content-tertiary">{label}</p>
      <p className="text-body font-bold text-content">{value}</p>
    </div>
  );
}
