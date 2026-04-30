'use client';

/**
 * Q&A 상세 화면
 * - 질문 본문 + 좋아요 / 신고 / 공유
 * - 답변 목록 (공식 / 강사 / 회원 — 도움됨 순/최신순)
 * - 강사 답변자 카드 클릭 시 강사 상세, 센터(공식)는 센터 상세로 진입
 * - 댓글/추가 답변 입력 박스 (sticky)
 * - 신고 모달 (광고 / 욕설 / 기타)
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ThumbsUp,
  Heart,
  Flag,
  Share2,
  Send,
  X,
  ArrowUpDown,
  Building2,
  GraduationCap,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

import { Avatar, Badge, Button, Chip, EmptyState, PageHeader } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  REPORT_REASONS,
  getQnaById,
  type QnaAnswer,
  type QnaAnswerRole,
  type QnaItem,
  type ReportReason,
} from '@/lib/community';

type SortOrder = 'helpful' | 'recent';

export default function QnaDetail() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [item, setItem] = useState<QnaItem | null>(() => getQnaById(id));
  const [liked, setLiked] = useState(false);
  const [helpfulIds, setHelpfulIds] = useState<Set<number>>(new Set());
  const [sort, setSort] = useState<SortOrder>('helpful');
  const [reply, setReply] = useState('');
  const [showReport, setShowReport] = useState(false);

  // 라우트 파라미터가 변경될 때 동기화
  useEffect(() => {
    setItem(getQnaById(id));
  }, [id]);

  const sortedAnswers: QnaAnswer[] = useMemo(() => {
    if (!item) return [];
    const arr = [...item.answers];
    if (sort === 'helpful') return arr.sort((a, b) => b.helpfulCount - a.helpfulCount);
    return arr.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [item, sort]);

  if (!item) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <PageHeader title="Q&A" showBack />
        <EmptyState
          title="질문을 찾을 수 없습니다"
          description="삭제되었거나 접근 권한이 없는 게시물입니다"
          action={
            <Button variant="outline" onClick={() => navigate('/qna')}>
              목록으로
            </Button>
          }
        />
      </div>
    );
  }

  const toggleLike = () => {
    setLiked((v) => !v);
    toast.success(liked ? '좋아요를 취소했어요' : '좋아요를 눌렀어요');
  };

  const toggleHelpful = (answerId: number) => {
    setHelpfulIds((prev) => {
      const next = new Set(prev);
      if (next.has(answerId)) next.delete(answerId);
      else next.add(answerId);
      return next;
    });
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      const url = typeof window !== 'undefined' ? `${window.location.origin}/qna/${item.id}` : `/qna/${item.id}`;
      navigator.clipboard.writeText(url).catch(() => undefined);
      toast.success('링크가 복사되었어요');
      return;
    }
    toast.success('링크가 복사되었어요');
  };

  const handleSubmitReply = () => {
    if (reply.trim().length < 2) {
      toast.error('답변을 2자 이상 입력해 주세요');
      return;
    }

    const newAnswer: QnaAnswer = {
      id: Math.max(...item.answers.map((a) => a.id), 0) + 1,
      authorName: '나',
      role: 'member',
      body: reply.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      helpfulCount: 0,
    };

    setItem({ ...item, answers: [...item.answers, newAnswer] });
    setReply('');
    toast.success('답변이 등록되었어요');
  };

  const handleAuthorTap = (a: QnaAnswer) => {
    if (a.role === 'trainer' && a.refId) navigate(`/trainers/${a.refId}`);
    else if (a.role === 'official' && a.refId) navigate(`/centers/${a.refId}`);
  };

  return (
    <div className="min-h-screen bg-surface-secondary pb-32">
      <PageHeader title="Q&A" showBack />

      {/* 질문 카드 */}
      <div className="px-4 pt-4">
        <div className="bg-surface rounded-card-lg shadow-card-soft p-5">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <Badge tone="neutral" size="sm">{item.category}</Badge>
            <span className="text-caption text-content-tertiary">{item.authorName}</span>
            <span className="text-caption text-content-tertiary">·</span>
            <span className="text-caption text-content-tertiary">{item.createdAt}</span>
          </div>

          <h1 className="text-h2 text-content leading-snug">{item.title}</h1>
          <p className="mt-3 text-body text-content-secondary whitespace-pre-wrap leading-relaxed">{item.body}</p>

          <div className="mt-4 flex items-center gap-4 text-caption text-content-tertiary">
            <span>좋아요 {item.likeCount + (liked ? 1 : 0)}</span>
            <span>·</span>
            <span>답변 {item.answers.length}</span>
            <span>·</span>
            <span>조회 {item.viewCount}</span>
          </div>

          <div className="mt-4 pt-4 border-t border-line-light grid grid-cols-3">
            <ActionFooterButton
              icon={<Heart className={cn('w-4 h-4', liked && 'fill-current text-state-error')} />}
              label={liked ? '좋아요 취소' : '좋아요'}
              onClick={toggleLike}
              active={liked}
            />
            <ActionFooterButton
              icon={<Flag className="w-4 h-4" />}
              label="신고"
              onClick={() => setShowReport(true)}
            />
            <ActionFooterButton
              icon={<Share2 className="w-4 h-4" />}
              label="공유"
              onClick={handleShare}
            />
          </div>
        </div>
      </div>

      {/* 답변 헤더 + 정렬 */}
      <div className="px-4 mt-6 mb-2 flex items-center justify-between">
        <h2 className="text-h3 text-content">답변 {item.answers.length}</h2>
        {item.answers.length > 1 && (
          <button
            type="button"
            onClick={() => setSort((s) => (s === 'helpful' ? 'recent' : 'helpful'))}
            className="inline-flex items-center gap-1 text-caption font-medium text-content-secondary"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            {sort === 'helpful' ? '도움됨 순' : '최신순'}
          </button>
        )}
      </div>

      {/* 답변 리스트 */}
      <div className="px-4 space-y-3">
        {sortedAnswers.length === 0 ? (
          <div className="bg-surface rounded-card-lg shadow-card-soft p-8 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-surface-tertiary text-content-tertiary inline-flex items-center justify-center mb-3">
              <Send className="w-5 h-5" />
            </div>
            <p className="text-body font-semibold text-content">아직 답변이 없어요</p>
            <p className="mt-1 text-body-sm text-content-secondary">
              아래 입력창에 첫 답변을 남겨보세요
            </p>
          </div>
        ) : (
          sortedAnswers.map((a) => (
            <AnswerCard
              key={a.id}
              answer={a}
              helpful={helpfulIds.has(a.id)}
              onToggleHelpful={() => toggleHelpful(a.id)}
              onAuthorTap={() => handleAuthorTap(a)}
            />
          ))
        )}
      </div>

      {/* 답변 입력 (sticky) */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-surface border-t border-line px-4 py-3 pb-safe-bottom">
        <div className="flex items-end gap-2">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="답변을 입력해 주세요"
            rows={1}
            maxLength={500}
            className="flex-1 px-3 py-2.5 rounded-input border border-line bg-surface text-body resize-none focus:outline-none focus:border-primary max-h-[120px]"
          />
          <Button
            size="md"
            onClick={handleSubmitReply}
            disabled={reply.trim().length < 2}
            rightIcon={<Send className="w-4 h-4" />}
          >
            전송
          </Button>
        </div>
      </div>

      {showReport && (
        <ReportModal
          onClose={() => setShowReport(false)}
          onSubmit={(reason) => {
            setShowReport(false);
            toast.success(`"${reason}"으로 신고가 접수되었어요`);
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// 액션 푸터 버튼
// ─────────────────────────────────────────

interface ActionFooterButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}

function ActionFooterButton({ icon, label, onClick, active = false }: ActionFooterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-1.5 py-2 rounded-button text-body-sm font-medium transition-colors',
        active ? 'text-state-error' : 'text-content-secondary active:bg-surface-secondary'
      )}
    >
      {icon}
      {label}
    </button>
  );
}

// ─────────────────────────────────────────
// 답변 카드
// ─────────────────────────────────────────

interface AnswerCardProps {
  answer: QnaAnswer;
  helpful: boolean;
  onToggleHelpful: () => void;
  onAuthorTap: () => void;
}

const ROLE_LABEL: Record<QnaAnswerRole, string> = {
  official: '공식 답변',
  trainer: '강사 답변',
  member: '회원 답변',
};

const ROLE_ICON: Record<QnaAnswerRole, React.ReactNode> = {
  official: <Building2 className="w-3 h-3" />,
  trainer: <GraduationCap className="w-3 h-3" />,
  member: <User className="w-3 h-3" />,
};

const ROLE_TONE: Record<QnaAnswerRole, 'primary' | 'accent' | 'neutral'> = {
  official: 'primary',
  trainer: 'accent',
  member: 'neutral',
};

function AnswerCard({ answer, helpful, onToggleHelpful, onAuthorTap }: AnswerCardProps) {
  const clickable = (answer.role === 'trainer' || answer.role === 'official') && answer.refId;
  const helpfulCount = answer.helpfulCount + (helpful ? 1 : 0);

  return (
    <div className="bg-surface rounded-card-lg shadow-card-soft p-4">
      <button
        type="button"
        onClick={onAuthorTap}
        disabled={!clickable}
        className={cn(
          'w-full flex items-center gap-3 text-left',
          clickable && 'active:opacity-70'
        )}
      >
        <Avatar name={answer.authorName} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-body-sm font-semibold text-content truncate">{answer.authorName}</span>
            <Badge tone={ROLE_TONE[answer.role]} size="sm">
              <span className="inline-flex items-center gap-0.5">
                {ROLE_ICON[answer.role]}
                {ROLE_LABEL[answer.role]}
              </span>
            </Badge>
          </div>
          <p className="text-caption text-content-tertiary mt-0.5">{answer.createdAt}</p>
        </div>
      </button>

      <p className="mt-3 text-body text-content-secondary whitespace-pre-wrap leading-relaxed">{answer.body}</p>

      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={onToggleHelpful}
          className={cn(
            'inline-flex items-center gap-1.5 h-9 px-3 rounded-pill text-body-sm font-medium transition-colors',
            helpful
              ? 'bg-primary-light text-primary'
              : 'bg-surface-secondary text-content-secondary active:bg-surface-tertiary'
          )}
        >
          <ThumbsUp className={cn('w-4 h-4', helpful && 'fill-current')} />
          도움됐어요 {helpfulCount}
        </button>

        {clickable && (
          <span className="text-caption font-medium text-primary">프로필 보기 →</span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// 신고 모달
// ─────────────────────────────────────────

interface ReportModalProps {
  onClose: () => void;
  onSubmit: (reason: ReportReason) => void;
}

function ReportModal({ onClose, onSubmit }: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [detail, setDetail] = useState('');

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="mobile-bottom-sheet bg-surface rounded-t-2xl p-6 pb-safe-bottom slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-h3 text-content">신고하기</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="-mr-2 w-9 h-9 rounded-full active:bg-surface-tertiary inline-flex items-center justify-center"
          >
            <X className="w-5 h-5 text-content-secondary" />
          </button>
        </div>

        <p className="text-body-sm text-content-secondary mb-4">
          신고 사유를 선택해 주세요. 운영팀이 확인 후 조치합니다.
        </p>

        <div className="space-y-2 mb-4">
          {REPORT_REASONS.slice(0, 3).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReason(r)}
              className={cn(
                'w-full text-left p-3 rounded-input border transition-colors',
                reason === r ? 'border-primary bg-primary-light' : 'border-line bg-surface'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-body-sm font-medium text-content">{r}</span>
                <Chip
                  size="sm"
                  active={reason === r}
                  variant="soft"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReason(r);
                  }}
                >
                  {reason === r ? '선택됨' : '선택'}
                </Chip>
              </div>
            </button>
          ))}
          {/* 기타 — 사유 직접 입력 가능 */}
          <button
            type="button"
            onClick={() => setReason('기타')}
            className={cn(
              'w-full text-left p-3 rounded-input border transition-colors',
              reason === '기타' ? 'border-primary bg-primary-light' : 'border-line bg-surface'
            )}
          >
            <span className="text-body-sm font-medium text-content">기타</span>
          </button>
        </div>

        {reason === '기타' && (
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="상세 사유를 입력해 주세요"
            rows={3}
            maxLength={300}
            className="w-full p-3 rounded-input border border-line bg-surface text-body-sm resize-none focus:outline-none focus:border-primary mb-4"
          />
        )}

        <div className="flex gap-3">
          <Button variant="outline" size="lg" className="flex-1" onClick={onClose}>
            취소
          </Button>
          <Button
            variant="danger"
            size="lg"
            className="flex-1"
            disabled={!reason || (reason === '기타' && detail.trim().length < 4)}
            onClick={() => reason && onSubmit(reason)}
          >
            신고하기
          </Button>
        </div>
      </div>
    </div>
  );
}
