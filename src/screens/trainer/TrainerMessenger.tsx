'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Plus, X, Send } from 'lucide-react';
import { PageHeader, Avatar, EmptyState, Button } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { avatarImg, getTrainerById } from '@/lib/marketplace';
import { cn } from '@/lib/utils';

// ─── 탭 정의 ─────────────────────────────────────────────────
type TrainerTab = '회원 톡' | '강의노트' | '공지';
const TABS: TrainerTab[] = ['회원 톡', '강의노트', '공지'];

// ─── mock 데이터 타입 ─────────────────────────────────────────
interface TrainerConversation {
  id: number;
  tab: TrainerTab;
  memberName: string;
  memberAvatar: string;
  sessionInfo?: string; // 예: "PT 24/30회"
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface MockMember {
  id: number;
  name: string;
  avatar: string;
}

// ─── 상대 시간 포맷 ──────────────────────────────────────────
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

// ─── 광화문점 mock 회원 5명 ───────────────────────────────────
const MOCK_MEMBERS: MockMember[] = [
  { id: 1, name: '황성안', avatar: avatarImg('member-hw', 100) },
  { id: 2, name: '이지수', avatar: avatarImg('member-ljs', 100) },
  { id: 3, name: '박현우', avatar: avatarImg('member-phw', 100) },
  { id: 4, name: '최민서', avatar: avatarImg('member-cms', 100) },
  { id: 5, name: '김나연', avatar: avatarImg('member-kny', 100) },
];

// ─── mock 대화 목록 ──────────────────────────────────────────
const MOCK_CONVERSATIONS: TrainerConversation[] = [
  // 회원 톡
  {
    id: 1,
    tab: '회원 톡',
    memberName: '황성안',
    memberAvatar: avatarImg('member-hw', 100),
    sessionInfo: 'PT 24/30회',
    lastMessage: '내일 10시 예약 확인 부탁드려요!',
    lastMessageAt: '2026-04-29T14:23:00',
    unreadCount: 2,
  },
  {
    id: 2,
    tab: '회원 톡',
    memberName: '이지수',
    memberAvatar: avatarImg('member-ljs', 100),
    sessionInfo: 'PT 8/20회',
    lastMessage: '오늘 수업 정말 힘들었어요 ㅠ 근데 뿌듯해요!',
    lastMessageAt: '2026-04-29T11:05:00',
    unreadCount: 0,
  },
  {
    id: 3,
    tab: '회원 톡',
    memberName: '박현우',
    memberAvatar: avatarImg('member-phw', 100),
    sessionInfo: 'PT 15/30회',
    lastMessage: '식단 피드백 감사합니다. 열심히 해볼게요!',
    lastMessageAt: '2026-04-28T19:48:00',
    unreadCount: 1,
  },
  {
    id: 4,
    tab: '회원 톡',
    memberName: '최민서',
    memberAvatar: avatarImg('member-cms', 100),
    sessionInfo: 'PT 3/10회',
    lastMessage: '다음 주 화요일 오후 가능할까요?',
    lastMessageAt: '2026-04-27T09:30:00',
    unreadCount: 0,
  },
  // 강의노트
  {
    id: 5,
    tab: '강의노트',
    memberName: '황성안',
    memberAvatar: avatarImg('member-hw', 100),
    sessionInfo: 'PT 24/30회',
    lastMessage: '[강의노트] 8주차 — 데드리프트 100kg 달성 🎉',
    lastMessageAt: '2026-04-29T10:00:00',
    unreadCount: 0,
  },
  {
    id: 6,
    tab: '강의노트',
    memberName: '이지수',
    memberAvatar: avatarImg('member-ljs', 100),
    sessionInfo: 'PT 8/20회',
    lastMessage: '[강의노트] 스쿼트 자세 교정 — 발목 가동성 집중',
    lastMessageAt: '2026-04-28T18:00:00',
    unreadCount: 1,
  },
  {
    id: 7,
    tab: '강의노트',
    memberName: '박현우',
    memberAvatar: avatarImg('member-phw', 100),
    lastMessage: '[강의노트] 중간 점검 — 체성분 변화 분석',
    lastMessageAt: '2026-04-26T20:30:00',
    unreadCount: 0,
  },
  // 공지
  {
    id: 8,
    tab: '공지',
    memberName: '센터 매니저',
    memberAvatar: avatarImg('branch-1', 100),
    lastMessage: '[공지] 5월 센터 휴무 안내 (5/5, 5/6 어린이날 연휴)',
    lastMessageAt: '2026-04-28T09:00:00',
    unreadCount: 1,
  },
  {
    id: 9,
    tab: '공지',
    memberName: '센터 매니저',
    memberAvatar: avatarImg('branch-1', 100),
    lastMessage: '[공지] 4월 트레이너 우수 피드백 발표 — 김도윤 트레이너 선정!',
    lastMessageAt: '2026-04-25T14:00:00',
    unreadCount: 0,
  },
];

export default function TrainerMessenger() {
  const navigate = useNavigate();
  const { trainer } = useAuthStore();
  const marketTrainer = getTrainerById(trainer?.id ?? 1);

  const [activeTab, setActiveTab] = useState<TrainerTab>('회원 톡');
  const [showNewMsgModal, setShowNewMsgModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [newMsgText, setNewMsgText] = useState('');

  const filtered = MOCK_CONVERSATIONS.filter((c) => c.tab === activeTab);

  const countFor = (tab: TrainerTab) =>
    MOCK_CONVERSATIONS.filter((c) => c.tab === tab && c.unreadCount > 0).length;

  const totalUnread = MOCK_CONVERSATIONS.reduce((s, c) => s + c.unreadCount, 0);

  function handleSendNewMsg() {
    if (!selectedMemberId || !newMsgText.trim()) return;
    setShowNewMsgModal(false);
    setSelectedMemberId(null);
    setNewMsgText('');
    navigate('/trainer/messages/1');
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface-secondary">
      {/* 헤더 */}
      <PageHeader
        showBack={false}
        title="메신저"
        rightSlot={
          <button
            type="button"
            aria-label="알림"
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

      {/* 트레이너 프로필 배너 */}
      {marketTrainer && (
        <div className="bg-gradient-to-r from-primary to-primary-dark px-4 py-3 flex items-center gap-3">
          <Avatar src={marketTrainer.profileUrl} name={marketTrainer.name} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-body-sm">{marketTrainer.name} 트레이너</p>
            <p className="text-white/70 text-caption truncate">{marketTrainer.centerName}</p>
          </div>
          <span className="text-white/90 text-caption bg-white/20 px-2 py-1 rounded-pill">
            {marketTrainer.category.toUpperCase()}
          </span>
        </div>
      )}

      {/* 탭 바 */}
      <div className="bg-surface border-b border-line sticky top-14 z-20">
        <div className="flex">
          {TABS.map((tab) => {
            const cnt = countFor(tab);
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 h-12 text-body-sm font-medium transition-colors relative',
                  isActive
                    ? 'text-primary'
                    : 'text-content-tertiary hover:text-content-secondary'
                )}
              >
                {tab}
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

      {/* 대화 목록 */}
      <div className="flex-1 flex flex-col">
        {filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 px-6">
            {activeTab === '회원 톡' && (
              <EmptyState
                icon="💬"
                title="회원으로부터 받은 메시지가 없습니다"
                description="담당 회원에게 먼저 메시지를 보내보세요"
                action={
                  <Button variant="primary" size="md" onClick={() => navigate('/trainer/members')}>
                    회원 둘러보기 →
                  </Button>
                }
              />
            )}
            {activeTab === '강의노트' && (
              <EmptyState
                icon="📒"
                title="보낸 강의노트가 없습니다"
                description="수업 후 강의노트를 보내 회원의 성장을 기록하세요"
                action={
                  <Button variant="primary" size="md" onClick={() => navigate('/trainer/schedule')}>
                    수업 일정 보기 →
                  </Button>
                }
              />
            )}
            {activeTab === '공지' && (
              <EmptyState
                icon="📢"
                title="받은 공지가 없습니다"
                description="센터 매니저의 공지가 이곳에 표시됩니다"
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
                  onClick={() => navigate(`/trainer/messages/${conv.id}`)}
                >
                  <div className="relative shrink-0">
                    <Avatar src={conv.memberAvatar} name={conv.memberName} size="lg" />
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-state-sale text-white text-[10px] font-bold flex items-center justify-center">
                        {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={cn(
                            'text-body-sm truncate',
                            conv.unreadCount > 0
                              ? 'font-semibold text-content'
                              : 'font-medium text-content'
                          )}
                        >
                          {conv.memberName}
                        </span>
                        {conv.sessionInfo && (
                          <span className="text-caption text-primary bg-primary/10 px-1.5 py-0.5 rounded-pill shrink-0">
                            {conv.sessionInfo}
                          </span>
                        )}
                      </div>
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

      {/* 새 메시지 FAB — 모바일 프레임 우측 안쪽 */}
      <div className="mobile-fixed-width fixed bottom-24 z-30 px-5 pointer-events-none flex justify-end">
        <button
          type="button"
          onClick={() => setShowNewMsgModal(true)}
          aria-label="새 메시지 작성"
          className="pointer-events-auto w-14 h-14 bg-primary text-white rounded-full shadow-card-elevated flex items-center justify-center active:bg-primary-dark transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* 새 메시지 모달 — 모바일 프레임 폭 */}
      {showNewMsgModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <button
            type="button"
            aria-label="닫기"
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowNewMsgModal(false)}
          />
          <div className="mobile-bottom-sheet relative bg-surface rounded-t-2xl px-4 pt-4 pb-safe-bottom max-h-[80vh] flex flex-col">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-h4 font-semibold text-content">새 메시지 보내기</h3>
              <button
                type="button"
                onClick={() => setShowNewMsgModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full active:bg-surface-tertiary text-content-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 회원 선택 */}
            <p className="text-body-sm font-medium text-content-secondary mb-2">회원 선택</p>
            <div className="flex flex-col gap-1 mb-4">
              {MOCK_MEMBERS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMemberId(m.id)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-card transition-colors text-left',
                    selectedMemberId === m.id
                      ? 'bg-primary/10 border border-primary/30'
                      : 'bg-surface-secondary active:bg-surface-tertiary'
                  )}
                >
                  <Avatar src={m.avatar} name={m.name} size="sm" />
                  <span className="text-body-sm font-medium text-content">{m.name}</span>
                  {selectedMemberId === m.id && (
                    <span className="ml-auto text-primary text-caption font-semibold">선택됨</span>
                  )}
                </button>
              ))}
            </div>

            {/* 메시지 입력 */}
            <p className="text-body-sm font-medium text-content-secondary mb-2">메시지</p>
            <textarea
              value={newMsgText}
              onChange={(e) => setNewMsgText(e.target.value)}
              placeholder="메시지를 입력하세요..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-card border border-line bg-surface-secondary text-body text-content placeholder:text-content-tertiary outline-none focus:border-primary/70 transition-colors resize-none mb-4"
            />

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleSendNewMsg}
              disabled={!selectedMemberId || !newMsgText.trim()}
            >
              <Send className="w-4 h-4 mr-2" />
              보내기
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
