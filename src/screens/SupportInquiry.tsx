'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, Clock3, MessageSquareText, Paperclip, Send } from 'lucide-react';
import { Badge, Button, Card, Input, PageHeader } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';

const CATEGORIES = ['이용문의', '결제문의', '시설문의', '수업문의', '기타'] as const;

const RECENT_INQUIRIES = [
  { id: 'q-101', title: '결제 영수증 재발급 문의', status: '답변완료', createdAt: '2026-05-22T00:00:00Z' },
  { id: 'q-102', title: '대기 예약 알림이 오지 않아요', status: '접수', createdAt: '2026-05-18T00:00:00Z' },
];

type Inquiry = {
  id: number | string;
  title: string;
  status: string;
  createdAt: string;
};

export default function SupportInquiry() {
  const { member } = useAuthStore();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('이용문의');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>(RECENT_INQUIRIES);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = title.trim().length >= 2 && body.trim().length >= 10;

  useEffect(() => {
    if (!member) return;

    fetch(`/api/inquiries?memberId=${member.id}`)
      .then(async (response) => {
        if (!response.ok) throw new Error('inquiry_fetch_failed');
        const result = await response.json();
        setRecentInquiries(result.data?.length ? result.data : []);
      })
      .catch(() => {
        setRecentInquiries(RECENT_INQUIRIES);
      });
  }, [member]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      toast.error('제목과 문의 내용을 입력해 주세요');
      return;
    }

    if (!member) {
      toast.error('로그인 후 문의를 접수할 수 있어요');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member.id,
          memberName: member.name,
          branchId: member.branchId,
          category,
          title,
          content: body,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? 'inquiry_submit_failed');
      }

      setRecentInquiries((items) => [result.data, ...items]);
      toast.success('문의가 접수되었어요', {
        description: '영업일 기준 1~2일 안에 답변드릴게요.',
      });
      setTitle('');
      setBody('');
    } catch {
      toast.error('문의 접수에 실패했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-secondary pb-12">
      <PageHeader title="1:1 문의" showBack />

      <div className="px-5 py-4 space-y-5">
        <Card variant="soft" padding="md">
          <div className="flex items-start gap-3">
            <Clock3 className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="text-body font-semibold text-content">답변 SLA</p>
              <p className="mt-1 text-body-sm text-content-secondary">
                일반 문의는 영업일 기준 1~2일, 결제·출입 차단 등 긴급 문의는 영업일 24시간 안에 확인합니다.
              </p>
            </div>
          </div>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-4">
          <section>
            <h2 className="mb-2 text-h4 text-content">문의 유형</h2>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`shrink-0 rounded-full px-4 py-2 text-body-sm font-semibold ${
                    category === item
                      ? 'bg-primary text-white'
                      : 'bg-surface text-content-secondary border border-line-light'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </section>

          <Input
            label="제목"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="문의 제목을 입력해 주세요"
            required
          />

          <label className="block">
            <span className="mb-1.5 block text-body-sm font-medium text-content-secondary">
              문의 내용 <span className="text-state-error">*</span>
            </span>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="상황을 구체적으로 남겨주세요"
              className="min-h-[160px] w-full resize-none rounded-input border border-line-strong bg-surface px-4 py-3 text-body outline-none placeholder:text-content-tertiary focus:border-primary"
            />
            <span className="mt-1.5 block text-caption text-content-tertiary">최소 10자 이상 입력</span>
          </label>

          <button
            type="button"
            onClick={() => toast.message('첨부 파일 선택창을 열었어요')}
            className="flex w-full items-center justify-center gap-2 rounded-card border-2 border-dashed border-line-strong bg-surface px-4 py-4 text-body-sm font-semibold text-content-secondary"
          >
            <Paperclip className="h-4 w-4" />
            스크린샷 첨부
          </button>

          <Button type="submit" variant="primary" size="lg" fullWidth disabled={!canSubmit || isSubmitting}>
            <Send className="h-4 w-4" />
            {isSubmitting ? '접수 중' : '문의 접수'}
          </Button>
        </form>

        <section>
          <h2 className="mb-3 text-h4 text-content">최근 문의</h2>
          <div className="space-y-3">
            {recentInquiries.map((item) => (
              <Card key={item.id} variant="elevated" padding="md">
                <div className="flex items-start gap-3">
                  {item.status === '답변완료' ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-state-success" />
                  ) : (
                    <MessageSquareText className="mt-0.5 h-5 w-5 text-primary" />
                  )}
                  <div className="flex-1">
                    <p className="text-body font-semibold text-content">{item.title}</p>
                    <p className="mt-1 text-caption text-content-tertiary">{formatDate(item.createdAt)}</p>
                  </div>
                  <Badge tone={item.status === '답변완료' ? 'success' : 'primary'} variant="soft">
                    {item.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return value.slice(0, 10);
}
