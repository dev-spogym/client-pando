'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { PageHeader, Avatar, SearchBar, Button, EmptyState } from '@/components/ui';
import { useMarketStore } from '@/stores/marketStore';
import { cn } from '@/lib/utils';
import type { ConversationType } from '@/lib/marketplace';

type Tab = { id: ConversationType; label: string };
const TABS: Tab[] = [
  { id: 'center', label: '센터 문의' },
  { id: 'trainer', label: '강사톡' },
  { id: 'note', label: '강의노트' },
];

function formatRelativeTime(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '방금';
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export default function MessengerHub() {
  const navigate = useNavigate();
  const { conversations } = useMarketStore();
  const [activeTab, setActiveTab] = useState<ConversationType>('center');
  const [search, setSearch] = useState('');

  const filtered = conversations
    .filter((c) => c.type === activeTab)
    .filter((c) =>
      search.trim()
        ? c.participantName.includes(search.trim()) ||
          c.lastMessage.includes(search.trim())
        : true
    );

  const countFor = (type: ConversationType) =>
    conversations.filter((c) => c.type === type && c.unreadCount > 0).length;

  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);

  return (
    <div className="flex flex-col min-h-screen bg-surface-secondary">
      {/* Header */}
      <PageHeader
        showBack={false}
        showHome
        title="메신저"
        rightSlot={
          <button
            type="button"
            aria-label="알림"
            onClick={() => navigate('/notifications')}
            className="relative w-10 h-10 inline-flex items-center justify-center rounded-full active:bg-surface-tertiary text-content"
          >
            <Bell className="w-5 h-5" />
            {totalUnread > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-state-sale text-white text-[10px] font-bold flex items-center justify-center">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </button>
        }
      />

      {/* Tabs */}
      <div className="bg-surface border-b border-line sticky top-14 z-20">
        <div className="flex">
          {TABS.map((tab) => {
            const cnt = countFor(tab.id);
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 h-12 text-body-sm font-medium transition-colors relative',
                  isActive ? 'text-primary' : 'text-content-tertiary hover:text-content-secondary'
                )}
              >
                {tab.label}
                {cnt > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-state-sale text-white text-[10px] font-bold flex items-center justify-center">
                    {cnt}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      {conversations.filter((c) => c.type === activeTab).length > 5 && (
        <div className="px-4 py-3 bg-surface">
          <SearchBar
            size="md"
            placeholder="대화방 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Conversation list */}
      <div className="flex-1 flex flex-col">
        {filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 px-6">
            {activeTab === 'center' && (
              <EmptyState
                icon="🏢"
                title="문의한 센터가 없습니다"
                description="센터를 둘러보고 궁금한 점을 문의해보세요"
                action={
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => navigate('/centers')}
                  >
                    센터 둘러보기 →
                  </Button>
                }
              />
            )}
            {activeTab === 'trainer' && (
              <EmptyState
                icon="🏋️"
                title="대화 중인 강사가 없습니다"
                description="나에게 맞는 강사를 찾아 연결해보세요"
                action={
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => navigate('/trainers')}
                  >
                    강사 찾아보기 →
                  </Button>
                }
              />
            )}
            {activeTab === 'note' && (
              <EmptyState
                icon="📒"
                title="아직 받은 강의 노트가 없습니다"
                description="강사님의 강의 노트는 수업 후 이곳에 쌓여요"
              />
            )}
          </div>
        ) : (
          <ul className="flex-1 bg-surface divide-y divide-line">
            {filtered.map((conv) => (
              <li key={conv.id}>
                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-surface-secondary transition-colors text-left"
                  onClick={() => navigate(`/messages/${conv.id}`)}
                >
                  <div className="relative shrink-0">
                    <Avatar
                      src={conv.participantAvatar}
                      name={conv.participantName}
                      size="lg"
                    />
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-state-sale text-white text-[10px] font-bold flex items-center justify-center">
                        {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className={cn(
                          'text-body-sm truncate',
                          conv.unreadCount > 0
                            ? 'font-semibold text-content'
                            : 'font-medium text-content'
                        )}
                      >
                        {conv.participantName}
                      </span>
                      <span className="text-caption text-content-tertiary shrink-0">
                        {formatRelativeTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    <p
                      className={cn(
                        'text-body-sm mt-0.5 truncate',
                        conv.unreadCount > 0
                          ? 'text-content-secondary font-medium'
                          : 'text-content-tertiary'
                      )}
                    >
                      {conv.lastMessage}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
