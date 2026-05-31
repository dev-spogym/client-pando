import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Flag, HelpCircle, MessageSquareText, Search, UserRoundCheck } from 'lucide-react';
import { Badge, Button, Card, Chip, PageHeader } from '@/components/ui';
import { QNA_CATEGORIES, QNA_LIST } from '@/lib/community';

/** 커뮤니티 홈 */
export default function CommunityHome() {
  const navigate = useNavigate();
  const popular = useMemo(
    () => [...QNA_LIST].sort((a, b) => (b.likeCount + b.viewCount) - (a.likeCount + a.viewCount)).slice(0, 3),
    []
  );
  const answeredCount = QNA_LIST.filter((item) => item.answers.length > 0).length;
  const pendingCount = QNA_LIST.length - answeredCount;

  return (
    <div className="min-h-screen bg-surface-secondary pb-10">
      <PageHeader title="커뮤니티" showBack />

      <div className="px-4 py-4 space-y-4">
        <Card padding="lg" className="bg-primary text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-caption text-white/75">공개 Q&A</p>
              <h1 className="mt-1 text-h2 font-bold">센터와 운동 정보를 함께 확인하세요</h1>
              <p className="mt-2 text-body-sm text-white/80">
                질문, 답변, FAQ, 신고 이력을 한 곳에서 관리합니다.
              </p>
            </div>
            <MessageSquareText className="h-8 w-8 shrink-0 text-white/85" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Metric label="질문" value={QNA_LIST.length} />
            <Metric label="답변완료" value={answeredCount} />
            <Metric label="대기" value={pendingCount} />
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <QuickCard icon={<HelpCircle className="h-5 w-5" />} title="Q&A" body="질문 목록과 작성" onClick={() => navigate('/qna')} />
          <QuickCard icon={<Search className="h-5 w-5" />} title="FAQ" body="운영자 등록 도움말" onClick={() => navigate('/faq')} />
          <QuickCard icon={<Flag className="h-5 w-5" />} title="신고 이력" body="신고/차단 관리" onClick={() => navigate('/community/reports')} />
          <QuickCard icon={<UserRoundCheck className="h-5 w-5" />} title="내 활동" body="질문·답변·좋아요" onClick={() => navigate('/community/activity')} />
        </div>

        <Card padding="lg">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-body font-semibold">카테고리</h2>
            <Button size="sm" variant="ghost" onClick={() => navigate('/qna')}>
              전체 보기
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {QNA_CATEGORIES.map((category) => (
              <Chip key={category} size="sm" onClick={() => navigate('/qna')}>
                {category}
              </Chip>
            ))}
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-body font-semibold">인기 질문</h2>
            <Button size="sm" variant="ghost" onClick={() => navigate('/qna')}>
              더보기
            </Button>
          </div>
          <div className="mt-3 divide-y divide-line-light">
            {popular.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(`/qna/${item.id}`)}
                className="flex w-full items-center gap-3 py-3 text-left"
              >
                <Badge tone={item.answers.length ? 'success' : 'warning'} size="sm">
                  {item.answers.length ? '답변완료' : '답변대기'}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body-sm font-medium text-content">{item.title}</p>
                  <p className="mt-0.5 text-caption text-content-tertiary">
                    {item.category} · 좋아요 {item.likeCount} · 답변 {item.answers.length}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-content-tertiary" />
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-card bg-white/15 px-3 py-2">
      <p className="text-micro text-white/70">{label}</p>
      <p className="mt-0.5 text-body font-bold text-white">{value}</p>
    </div>
  );
}

function QuickCard({ icon, title, body, onClick }: { icon: React.ReactNode; title: string; body: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-card bg-surface p-4 text-left shadow-card-soft active:bg-surface-secondary">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-card bg-primary-light text-primary">
        {icon}
      </div>
      <p className="text-body font-semibold text-content">{title}</p>
      <p className="mt-1 text-caption text-content-secondary">{body}</p>
    </button>
  );
}
