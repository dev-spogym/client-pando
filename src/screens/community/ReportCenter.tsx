import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Flag, ShieldCheck } from 'lucide-react';
import { Badge, Card, Chip, EmptyState, PageHeader } from '@/components/ui';
import { REPORT_REASONS } from '@/lib/community';

const REPORTS = [
  { id: 1, target: 'PT 10회권 vs 20회권 어느 쪽이 좋을까요?', reason: '홍보', status: 'reviewing', date: '2026-05-21' },
  { id: 2, target: '무관한 광고성 답변', reason: '스팸', status: 'hidden', date: '2026-05-18' },
  { id: 3, target: '욕설이 포함된 댓글', reason: '욕설', status: 'closed', date: '2026-05-10' },
] as const;

type StatusFilter = 'all' | (typeof REPORTS)[number]['status'];

/** 신고 / 차단 관리 */
export default function ReportCenter() {
  const [filter, setFilter] = useState<StatusFilter>('all');
  const visible = REPORTS.filter((item) => filter === 'all' || item.status === filter);

  return (
    <div className="min-h-screen bg-surface-secondary pb-10">
      <PageHeader title="신고 / 차단 관리" showBack />
      <div className="px-4 py-4 space-y-4">
        <Card padding="lg">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-card bg-state-warning/10 text-state-warning">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-body font-semibold">커뮤니티 안전 정책</h1>
              <p className="mt-1 text-body-sm text-content-secondary">
                동일 게시물 신고 3건 누적 시 자동 숨김 처리되고 운영자 검토 큐로 전달됩니다.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {REPORT_REASONS.map((reason) => (
              <Badge key={reason} tone="neutral" variant="soft" size="sm">
                {reason}
              </Badge>
            ))}
          </div>
        </Card>

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { key: 'all', label: '전체' },
            { key: 'reviewing', label: '검토중' },
            { key: 'hidden', label: '자동숨김' },
            { key: 'closed', label: '종료' },
          ].map((item) => (
            <Chip key={item.key} active={filter === item.key} size="sm" onClick={() => setFilter(item.key as StatusFilter)}>
              {item.label}
            </Chip>
          ))}
        </div>

        {visible.length === 0 ? (
          <EmptyState
            icon={<Flag className="h-8 w-8" />}
            title="신고 이력이 없습니다"
            description="부적절한 질문이나 답변은 상세 화면에서 신고할 수 있습니다."
          />
        ) : (
          <div className="space-y-3">
            {visible.map((report) => (
              <Card key={report.id} padding="md">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-body-sm font-semibold text-content">{report.target}</p>
                    <p className="mt-1 text-caption text-content-secondary">사유: {report.reason} · {report.date}</p>
                  </div>
                  <ReportStatus status={report.status} />
                </div>
              </Card>
            ))}
          </div>
        )}

        <Card padding="md" className="border border-state-warning/20 bg-state-warning/5">
          <div className="flex gap-2 text-state-warning">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-caption">
              본인 글은 신고할 수 없고, 동일 게시물 중복 신고는 제한됩니다.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ReportStatus({ status }: { status: (typeof REPORTS)[number]['status'] }) {
  if (status === 'reviewing') return <Badge tone="warning" size="sm">검토중</Badge>;
  if (status === 'hidden') return <Badge tone="error" size="sm">자동숨김</Badge>;
  return (
    <Badge tone="success" size="sm">
      <CheckCircle2 className="h-3 w-3" />
      종료
    </Badge>
  );
}
