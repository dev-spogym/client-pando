import { useEffect, useState } from 'react';
import { ArrowLeft, Pin, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { getPreviewNotices, isPreviewMode } from '@/lib/preview';
import { supabase } from '@/lib/supabase';
import { cn, formatDateKo } from '@/lib/utils';

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
  const { member } = useAuthStore();
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!member) return;
    fetchNotices();
  }, [member]);

  const fetchNotices = async () => {
    if (!member) return;
    setLoading(true);

    if (isPreviewMode()) {
      setNotices(getPreviewNotices());
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('notices')
      .select('id, title, content, author_name, is_pinned, published_at, created_at')
      .eq('branch_id', member.branchId)
      .eq('is_published', true)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(30);

    setNotices(data || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-surface sticky top-0 z-10 border-b border-line">
        <div className="flex items-center px-4 pt-safe-top h-14">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-content" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-lg">공지사항</h1>
          <div className="w-6" />
        </div>
      </header>

      <div className="px-4 py-4">
        {loading ? (
          <div className="text-center py-12 text-content-tertiary text-sm">불러오는 중...</div>
        ) : notices.length === 0 ? (
          <div className="text-center py-12 text-content-tertiary text-sm">공지사항이 없습니다</div>
        ) : (
          <div className="space-y-2">
            {notices.map((notice) => {
              const isExpanded = expandedId === notice.id;
              return (
                <div
                  key={notice.id}
                  className="bg-surface rounded-card shadow-card overflow-hidden"
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
                        'text-sm font-medium truncate',
                        notice.is_pinned && 'font-semibold'
                      )}>
                        {notice.title}
                      </h3>
                      <p className="text-xs text-content-tertiary mt-0.5">
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
                      <div className="pt-3 text-sm text-content-secondary leading-relaxed whitespace-pre-wrap">
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
