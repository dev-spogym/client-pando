import { useEffect, useState } from 'react';
import { Pin, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { getPreviewNotices, isPreviewMode } from '@/lib/preview';
import { supabase } from '@/lib/supabase';
import { cn, formatDateKo } from '@/lib/utils';
import { PageHeader, EmptyState } from '@/components/ui';

interface NoticeItem {
  id: number;
  title: string;
  content: string;
  author_name: string;
  is_pinned: boolean;
  published_at: string | null;
  created_at: string;
}

/** 공지사항 페이지 */
export default function Notices() {
  const navigate = useNavigate();
  const { member, trainer } = useAuthStore();
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!member && !trainer) return;
    fetchNotices();
  }, [member, trainer]);

  const fetchNotices = async () => {
    const branchId = member?.branchId ?? trainer?.branchId;
    if (!branchId) return;
    setLoading(true);

    if (isPreviewMode()) {
      setNotices(getPreviewNotices());
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('notices')
      .select('id, title, content, author_name, is_pinned, published_at, created_at')
      .eq('branch_id', branchId)
      .eq('is_published', true)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(30);

    setNotices(data || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <PageHeader title="공지사항" showBack />

      <div className="px-5 py-4">
        {loading ? (
          <div className="text-center py-12 text-content-tertiary text-body">불러오는 중...</div>
        ) : notices.length === 0 ? (
          <EmptyState title="공지사항이 없습니다" size="md" />
        ) : (
          <div className="space-y-2">
            {notices.map((notice) => {
              const isExpanded = expandedId === notice.id;
              return (
                <div
                  key={notice.id}
                  className="bg-surface rounded-card shadow-card-soft overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : notice.id)}
                    className="w-full px-4 py-3.5 flex items-center gap-3 text-left active:bg-surface-secondary transition-colors"
                  >
                    {notice.is_pinned && (
                      <Pin className="w-4 h-4 text-state-error flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        'text-body font-medium truncate',
                        notice.is_pinned && 'font-semibold'
                      )}>
                        {notice.title}
                      </h3>
                      <p className="text-caption text-content-tertiary mt-0.5">
                        {formatDateKo(notice.published_at || notice.created_at)} · {notice.author_name}
                      </p>
                    </div>
                    <ChevronRight className={cn(
                      'w-4 h-4 text-content-tertiary transition-transform flex-shrink-0',
                      isExpanded && 'rotate-90'
                    )} />
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-line-light">
                      <div className="pt-3 text-body text-content-secondary leading-relaxed whitespace-pre-wrap">
                        {notice.content}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
