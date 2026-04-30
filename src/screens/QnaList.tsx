'use client';

/**
 * 공개 Q&A 목록 화면
 * - 1:1 문의와 별도로, 회원이 센터/강사/다른 회원에게 공개 질문을 등록하고
 *   공개 답변을 누구나 볼 수 있는 커뮤니티성 게시판.
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, MessageCircle, Plus, X, Check, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import { Badge, Button, Chip, EmptyState, PageHeader } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  QNA_CATEGORIES,
  QNA_LIST,
  QNA_TABS,
  filterQna,
  type QnaCategory,
  type QnaItem,
  type QnaTab,
} from '@/lib/community';

export default function QnaList() {
  const navigate = useNavigate();

  const [tab, setTab] = useState<QnaTab>('all');
  const [category, setCategory] = useState<QnaCategory | 'all'>('all');
  const [items, setItems] = useState<QnaItem[]>(QNA_LIST);
  const [showWrite, setShowWrite] = useState(false);

  const visible = useMemo(() => filterQna(items, tab, category), [items, tab, category]);

  const handleSubmit = (next: QnaItem) => {
    setItems((prev) => [next, ...prev]);
    setShowWrite(false);
    toast.success('질문이 등록되었습니다');
  };

  return (
    <div className="min-h-screen bg-surface-secondary pb-10">
      <PageHeader
        title="Q&A"
        showBack
        rightSlot={
          <button
            type="button"
            onClick={() => setShowWrite(true)}
            className="inline-flex items-center gap-1 h-9 px-3 rounded-pill bg-primary text-white text-body-sm font-medium active:bg-primary-dark"
          >
            <Plus className="w-4 h-4" />
            질문하기
          </button>
        }
      />

      {/* 탭 */}
      <div className="bg-surface border-b border-line">
        <div className="px-4 flex items-center gap-2 py-3">
          {QNA_TABS.map((t) => (
            <Chip
              key={t.id}
              size="sm"
              active={tab === t.id}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="bg-surface border-b border-line">
        <div className="px-4 flex items-center gap-2 py-3 overflow-x-auto no-scrollbar">
          <Chip
            size="sm"
            variant="soft"
            active={category === 'all'}
            onClick={() => setCategory('all')}
          >
            전체
          </Chip>
          {QNA_CATEGORIES.map((c) => (
            <Chip
              key={c}
              size="sm"
              variant="soft"
              active={category === c}
              onClick={() => setCategory(c)}
            >
              {c}
            </Chip>
          ))}
        </div>
      </div>

      {/* 리스트 */}
      <div className="px-4 py-4 space-y-3">
        {visible.length === 0 ? (
          <EmptyState
            icon={<HelpCircle className="w-8 h-8" />}
            title="조건에 맞는 Q&A가 없습니다"
            description="다른 카테고리를 선택하거나 직접 질문을 등록해 보세요"
            action={
              <Button onClick={() => setShowWrite(true)} leftIcon={<Plus className="w-4 h-4" />}>
                질문하기
              </Button>
            }
          />
        ) : (
          visible.map((q) => (
            <QnaCard key={q.id} item={q} onClick={() => navigate(`/qna/${q.id}`)} />
          ))
        )}
      </div>

      {showWrite && (
        <QnaWriteModal
          nextId={Math.max(...items.map((q) => q.id), 0) + 1}
          onClose={() => setShowWrite(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// 카드
// ─────────────────────────────────────────

interface QnaCardProps {
  item: QnaItem;
  onClick: () => void;
}

function QnaCard({ item, onClick }: QnaCardProps) {
  const answered = item.answers.length > 0;
  const previewAnswer = answered ? item.answers[0] : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-surface rounded-card-lg shadow-card-soft p-4 active:bg-surface-secondary transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-9 h-9 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold">
          Q
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-caption text-content-secondary font-medium">{item.authorName}</span>
            <span className="text-caption text-content-tertiary">·</span>
            <span className="text-caption text-content-tertiary">{item.createdAt}</span>
            <Badge tone="neutral" size="sm">{item.category}</Badge>
          </div>

          <h3 className="text-body font-semibold text-content line-clamp-1">{item.title}</h3>
          <p className="mt-1 text-body-sm text-content-secondary line-clamp-2">{item.body}</p>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {answered ? (
                <Badge tone="success" size="sm">
                  <Check className="w-3 h-3" />
                  답변 {item.answers.length}
                </Badge>
              ) : (
                <Badge tone="warning" size="sm">답변 대기</Badge>
              )}
              <span className="text-caption text-content-tertiary">조회 {item.viewCount}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-content-tertiary" />
          </div>

          {previewAnswer && (
            <div className="mt-3 p-3 rounded-card bg-surface-secondary">
              <div className="flex items-center gap-1.5 mb-1">
                <MessageCircle className="w-3.5 h-3.5 text-primary" />
                <span className="text-caption font-semibold text-primary">{previewAnswer.authorName}</span>
                <Badge
                  tone={previewAnswer.role === 'official' ? 'primary' : previewAnswer.role === 'trainer' ? 'accent' : 'neutral'}
                  size="sm"
                >
                  {previewAnswer.role === 'official' ? '공식' : previewAnswer.role === 'trainer' ? '강사' : '회원'}
                </Badge>
              </div>
              <p className="text-caption text-content-secondary line-clamp-1">{previewAnswer.body}</p>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────
// 작성 모달
// ─────────────────────────────────────────

interface QnaWriteModalProps {
  nextId: number;
  onClose: () => void;
  onSubmit: (item: QnaItem) => void;
}

function QnaWriteModal({ nextId, onClose, onSubmit }: QnaWriteModalProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<QnaCategory>('시설');
  const [anonymous, setAnonymous] = useState(false);

  const valid = title.trim().length > 1 && body.trim().length > 4;

  const handleSubmit = () => {
    if (!valid) {
      toast.error('제목과 본문을 입력해 주세요');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    onSubmit({
      id: nextId,
      category,
      title: title.trim(),
      body: body.trim(),
      authorName: anonymous ? '익명' : '나',
      anonymous,
      createdAt: today,
      likeCount: 0,
      viewCount: 0,
      answers: [],
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="mobile-bottom-sheet bg-surface rounded-t-2xl p-6 pb-safe-bottom slide-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-h3 text-content">질문 등록</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="-mr-2 w-9 h-9 rounded-full active:bg-surface-tertiary inline-flex items-center justify-center"
          >
            <X className="w-5 h-5 text-content-secondary" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-body-sm font-medium text-content-secondary mb-2">카테고리</label>
            <div className="flex flex-wrap gap-2">
              {QNA_CATEGORIES.map((c) => (
                <Chip
                  key={c}
                  size="sm"
                  active={category === c}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-body-sm font-medium text-content-secondary mb-2">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="질문 제목을 입력하세요"
              maxLength={60}
              className="w-full h-12 px-4 rounded-input border border-line bg-surface text-body focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-body-sm font-medium text-content-secondary mb-2">내용</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="궁금한 내용을 자세히 알려주세요"
              maxLength={500}
              rows={5}
              className="w-full p-3 rounded-input border border-line bg-surface text-body resize-none focus:outline-none focus:border-primary"
            />
            <p className="mt-1 text-caption text-content-tertiary text-right">{body.length}/500</p>
          </div>

          <button
            type="button"
            onClick={() => setAnonymous((v) => !v)}
            className={cn(
              'w-full flex items-center justify-between p-3 rounded-input border transition-colors',
              anonymous ? 'border-primary bg-primary-light' : 'border-line bg-surface'
            )}
          >
            <div className="text-left">
              <p className="text-body-sm font-medium text-content">익명으로 작성</p>
              <p className="text-caption text-content-tertiary">작성자 이름 대신 "익명"으로 표시됩니다</p>
            </div>
            <span
              className={cn(
                'w-10 h-6 rounded-full relative transition-colors',
                anonymous ? 'bg-primary' : 'bg-surface-tertiary'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                  anonymous ? 'translate-x-[18px]' : 'translate-x-0.5'
                )}
              />
            </span>
          </button>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" size="lg" className="flex-1" onClick={onClose}>
            취소
          </Button>
          <Button variant="primary" size="lg" className="flex-1" onClick={handleSubmit} disabled={!valid}>
            등록
          </Button>
        </div>
      </div>
    </div>
  );
}
