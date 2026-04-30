'use client';

/**
 * 신고 내역 화면
 * - 회원이 직접 한 신고의 처리 내역 조회
 * - 카드: 신고 대상 / 사유 Badge / 일자 / 처리 상태 Badge / 운영팀 답변
 * - EmptyState
 */

import { useMemo, useState } from 'react';
import {
  Flag,
  MessageCircle,
  ChevronDown,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react';

import { Badge, Chip, EmptyState, PageHeader } from '@/components/ui';
import { cn, formatDateKo } from '@/lib/utils';
import {
  REPORT_LIST,
  REPORT_STATUS_TONE,
  type ReportItem,
  type ReportStatus,
  type ReportTargetType,
} from '@/lib/community';

const STATUS_FILTERS: { id: 'all' | ReportStatus; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: '접수', label: '접수' },
  { id: '검토중', label: '검토중' },
  { id: '처리완료', label: '처리완료' },
  { id: '반려', label: '반려' },
];

export default function ReportHistory() {
  const [filter, setFilter] = useState<'all' | ReportStatus>('all');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const visible: ReportItem[] = useMemo(() => {
    if (filter === 'all') return REPORT_LIST;
    return REPORT_LIST.filter((r) => r.status === filter);
  }, [filter]);

  const stats = useMemo(() => {
    return {
      total: REPORT_LIST.length,
      pending: REPORT_LIST.filter((r) => r.status === '접수' || r.status === '검토중').length,
      resolved: REPORT_LIST.filter((r) => r.status === '처리완료').length,
    };
  }, []);

  const toggle = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-surface-secondary pb-10">
      <PageHeader title="신고 내역" showBack />

      {/* 요약 */}
      {REPORT_LIST.length > 0 && (
        <div className="px-4 pt-4">
          <div className="bg-surface rounded-card-lg shadow-card-soft p-4 grid grid-cols-3 divide-x divide-line-light">
            <SummaryCell label="전체" value={stats.total} icon={<Flag className="w-4 h-4 text-content-secondary" />} />
            <SummaryCell label="처리중" value={stats.pending} icon={<Clock className="w-4 h-4 text-state-warning" />} />
            <SummaryCell label="완료" value={stats.resolved} icon={<CheckCircle2 className="w-4 h-4 text-state-success" />} />
          </div>
        </div>
      )}

      {/* 필터 */}
      <div className="px-4 pt-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {STATUS_FILTERS.map((s) => (
          <Chip key={s.id} size="sm" active={filter === s.id} onClick={() => setFilter(s.id)}>
            {s.label}
          </Chip>
        ))}
      </div>

      {/* 리스트 */}
      <div className="px-4 pt-4 space-y-3">
        {visible.length === 0 ? (
          REPORT_LIST.length === 0 ? (
            <EmptyState
              icon={<Flag className="w-8 h-8" />}
              title="신고 내역이 없습니다"
              description="다른 회원의 부적절한 행동을 발견하면 신고해 주세요. 운영팀이 24시간 모니터링 중입니다."
              size="lg"
            />
          ) : (
            <EmptyState
              title="조건에 맞는 신고가 없어요"
              description="다른 상태 필터를 선택해 보세요"
              size="md"
            />
          )
        ) : (
          visible.map((r) => (
            <ReportCard
              key={r.id}
              item={r}
              expanded={expanded.has(r.id)}
              onToggle={() => toggle(r.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// 요약 셀
// ─────────────────────────────────────────

function SummaryCell({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-2">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-caption text-content-tertiary">{label}</span>
      </div>
      <p className="mt-1 text-h2 text-content">{value}</p>
    </div>
  );
}

// ─────────────────────────────────────────
// 카드
// ─────────────────────────────────────────

const TARGET_BG: Record<ReportTargetType, string> = {
  회원: 'bg-state-error/10 text-state-error',
  리뷰: 'bg-state-warning/10 text-state-warning',
  'Q&A': 'bg-primary-light text-primary',
  메시지: 'bg-accent-light text-accent-dark',
};

const STATUS_ICON: Record<ReportStatus, React.ReactNode> = {
  접수: <AlertCircle className="w-3 h-3" />,
  검토중: <Clock className="w-3 h-3" />,
  처리완료: <CheckCircle2 className="w-3 h-3" />,
  반려: <XCircle className="w-3 h-3" />,
};

interface ReportCardProps {
  item: ReportItem;
  expanded: boolean;
  onToggle: () => void;
}

function ReportCard({ item, expanded, onToggle }: ReportCardProps) {
  const tone = REPORT_STATUS_TONE[item.status];
  const hasReply = Boolean(item.staffReply);

  return (
    <div className="bg-surface rounded-card-lg shadow-card-soft overflow-hidden">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span
            className={cn(
              'inline-flex items-center justify-center px-2 h-6 rounded-pill text-caption font-semibold',
              TARGET_BG[item.targetType]
            )}
          >
            {item.targetType}
          </span>
          <Badge tone={tone} size="sm">
            <span className="inline-flex items-center gap-0.5">
              {STATUS_ICON[item.status]}
              {item.status}
            </span>
          </Badge>
          <span className="ml-auto text-caption text-content-tertiary">{formatDateKo(item.createdAt)}</span>
        </div>

        <p className="text-body font-semibold text-content line-clamp-2">{item.targetLabel}</p>

        <div className="mt-2 flex items-center gap-2">
          <Flag className="w-3.5 h-3.5 text-state-error" />
          <span className="text-body-sm text-content-secondary">{item.reason}</span>
        </div>

        {item.detail && (
          <p className="mt-2 text-body-sm text-content-tertiary line-clamp-2">{item.detail}</p>
        )}
      </div>

      {hasReply && (
        <div className="border-t border-line-light bg-surface-secondary px-4 py-3">
          <button
            type="button"
            onClick={onToggle}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-primary" />
              <span className="text-body-sm font-semibold text-primary">운영팀 답변</span>
              {item.resolvedAt && (
                <span className="text-caption text-content-tertiary">
                  · {formatDateKo(item.resolvedAt)}
                </span>
              )}
            </div>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-content-tertiary transition-transform',
                expanded && 'rotate-180'
              )}
            />
          </button>

          <p
            className={cn(
              'mt-2 text-body-sm text-content-secondary leading-relaxed',
              !expanded && 'line-clamp-2'
            )}
          >
            {item.staffReply}
          </p>

          {!expanded && item.staffReply && item.staffReply.length > 80 && (
            <button
              type="button"
              onClick={onToggle}
              className="mt-1 text-caption font-medium text-primary"
            >
              더보기
            </button>
          )}
        </div>
      )}

      {!hasReply && (item.status === '접수' || item.status === '검토중') && (
        <div className="border-t border-line-light bg-surface-secondary px-4 py-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-state-warning" />
          <span className="text-body-sm text-content-secondary">
            운영팀이 검토 중입니다 · 영업일 기준 1~3일 이내 답변
          </span>
        </div>
      )}
    </div>
  );
}
