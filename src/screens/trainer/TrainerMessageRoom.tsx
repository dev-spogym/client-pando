'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MoreVertical,
  Paperclip,
  Send,
  ClipboardList,
  X,
} from 'lucide-react';
import { Avatar, Card, Chip } from '@/components/ui';
import { avatarImg } from '@/lib/marketplace';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

// ─── 타입 ─────────────────────────────────────────────────────
type MessageType = 'text' | 'note';

interface NoteData {
  classTitle: string;
  date: string;
  coachComment: string;
  nextGoal?: string;
}

interface TrainerMessage {
  id: number;
  senderId: 'trainer' | 'member';
  type: MessageType;
  content: string;
  noteData?: NoteData;
  sentAt: string;
  isRead: boolean;
}

interface RoomMeta {
  memberName: string;
  memberAvatar: string;
  sessionBadge: string; // 예: "PT 24/30회"
}

// ─── mock 대화방 메타 ──────────────────────────────────────────
const ROOM_META: Record<string, RoomMeta> = {
  '1': {
    memberName: '황성안',
    memberAvatar: avatarImg('member-hw', 100),
    sessionBadge: 'PT 24/30회',
  },
  '2': {
    memberName: '이지수',
    memberAvatar: avatarImg('member-ljs', 100),
    sessionBadge: 'PT 8/20회',
  },
  '3': {
    memberName: '박현우',
    memberAvatar: avatarImg('member-phw', 100),
    sessionBadge: 'PT 15/30회',
  },
  '4': {
    memberName: '최민서',
    memberAvatar: avatarImg('member-cms', 100),
    sessionBadge: 'PT 3/10회',
  },
  '5': {
    memberName: '황성안',
    memberAvatar: avatarImg('member-hw', 100),
    sessionBadge: 'PT 24/30회',
  },
  '6': {
    memberName: '이지수',
    memberAvatar: avatarImg('member-ljs', 100),
    sessionBadge: 'PT 8/20회',
  },
  '7': {
    memberName: '박현우',
    memberAvatar: avatarImg('member-phw', 100),
    sessionBadge: 'PT 15/30회',
  },
};

// ─── mock 메시지 (대화방 1 기준, 다른 방은 동일 패턴) ────────────
function buildMockMessages(roomId: string): TrainerMessage[] {
  const memberName = ROOM_META[roomId]?.memberName ?? '회원';
  const base: TrainerMessage[] = [
    {
      id: 1,
      senderId: 'member',
      type: 'text',
      content: `안녕하세요 트레이너님! 오늘 수업 후 몸이 많이 개운하네요.`,
      sentAt: '2026-04-29T09:00:00',
      isRead: true,
    },
    {
      id: 2,
      senderId: 'trainer',
      type: 'text',
      content: `${memberName}님, 오늘 데드리프트 자세가 많이 좋아지셨어요! 허리 중립 유지가 자연스러워지고 있어요.`,
      sentAt: '2026-04-29T09:05:00',
      isRead: true,
    },
    {
      id: 3,
      senderId: 'member',
      type: 'text',
      content: '정말요? 어제 연습 영상 보면서 자세히 봤는데 확실히 달라진 것 같더라고요.',
      sentAt: '2026-04-29T09:07:00',
      isRead: true,
    },
    {
      id: 4,
      senderId: 'trainer',
      type: 'note',
      content: '8주차 수업 강의노트',
      noteData: {
        classTitle: '바디프로필 8주차 — 데드리프트 & 상체 집중',
        date: '2026-04-29',
        coachComment:
          '상체 라인이 뚜렷하게 잡히고 있어요. 데드리프트 허리 중립 유지가 드디어 자연스러워졌습니다. 이번 주 가장 큰 성과예요. 식단도 탄단지 밸런스 잘 지켜주셔서 체성분 변화가 좋습니다.',
        nextGoal: '데드리프트 100kg × 3회 × 3세트 (다음 주 목표)',
      },
      sentAt: '2026-04-29T09:15:00',
      isRead: true,
    },
    {
      id: 5,
      senderId: 'member',
      type: 'text',
      content: '강의노트 감사합니다! 100kg 꼭 달성해볼게요 💪',
      sentAt: '2026-04-29T09:20:00',
      isRead: true,
    },
    {
      id: 6,
      senderId: 'trainer',
      type: 'text',
      content: '충분히 하실 수 있어요! 내일 예약 확정이시죠? 혹시 컨디션 이상 있으면 미리 말씀 주세요.',
      sentAt: '2026-04-29T09:22:00',
      isRead: true,
    },
    {
      id: 7,
      senderId: 'member',
      type: 'text',
      content: '네! 내일 10시 예약 확인 부탁드려요!',
      sentAt: '2026-04-29T14:23:00',
      isRead: false,
    },
  ];
  return base;
}

// ─── 날짜 포맷 ────────────────────────────────────────────────
function formatDate(isoStr: string): string {
  const d = new Date(isoStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function formatTime(isoStr: string): string {
  const d = new Date(isoStr);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h < 12 ? '오전' : '오후';
  return `${ampm} ${h % 12 || 12}:${m}`;
}

function groupByDate(msgs: TrainerMessage[]): Map<string, TrainerMessage[]> {
  const map = new Map<string, TrainerMessage[]>();
  for (const msg of msgs) {
    const key = msg.sentAt.slice(0, 10);
    const group = map.get(key) ?? [];
    group.push(msg);
    map.set(key, group);
  }
  return map;
}

// ─── 강의노트 작성 모달 ───────────────────────────────────────
interface NoteModalProps {
  onClose: () => void;
  onSend: (note: NoteData) => void;
}

function NoteModal({ onClose, onSend }: NoteModalProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [classTitle, setClassTitle] = useState('');
  const [coachComment, setCoachComment] = useState('');
  const [nextGoal, setNextGoal] = useState('');

  function handleSubmit() {
    if (!classTitle.trim() || !coachComment.trim()) return;
    onSend({ classTitle, date: today, coachComment, nextGoal: nextGoal.trim() || undefined });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full bg-surface rounded-t-2xl px-4 pt-4 pb-8 max-h-[85vh] flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-h4 font-semibold text-content">강의노트 작성</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full active:bg-surface-tertiary text-content-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 flex-1">
          <div>
            <label className="text-caption text-content-secondary mb-1 block">수업 제목 *</label>
            <input
              type="text"
              value={classTitle}
              onChange={(e) => setClassTitle(e.target.value)}
              placeholder="예) 바디프로필 8주차 — 데드리프트"
              className="w-full h-11 px-3 rounded-card border border-line bg-surface-secondary text-body text-content placeholder:text-content-tertiary outline-none focus:border-primary/70 transition-colors"
            />
          </div>
          <div>
            <label className="text-caption text-content-secondary mb-1 block">날짜</label>
            <input
              type="text"
              value={today}
              readOnly
              className="w-full h-11 px-3 rounded-card border border-line bg-surface-tertiary text-body text-content-secondary outline-none"
            />
          </div>
          <div>
            <label className="text-caption text-content-secondary mb-1 block">코치 코멘트 *</label>
            <textarea
              value={coachComment}
              onChange={(e) => setCoachComment(e.target.value)}
              placeholder="오늘 수업 피드백을 남겨주세요..."
              rows={4}
              className="w-full px-3 py-2.5 rounded-card border border-line bg-surface-secondary text-body text-content placeholder:text-content-tertiary outline-none focus:border-primary/70 transition-colors resize-none"
            />
          </div>
          <div>
            <label className="text-caption text-content-secondary mb-1 block">다음 목표 (선택)</label>
            <input
              type="text"
              value={nextGoal}
              onChange={(e) => setNextGoal(e.target.value)}
              placeholder="예) 스쿼트 60kg × 5회 × 3세트"
              className="w-full h-11 px-3 rounded-card border border-line bg-surface-secondary text-body text-content placeholder:text-content-tertiary outline-none focus:border-primary/70 transition-colors"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!classTitle.trim() || !coachComment.trim()}
          className={cn(
            'mt-4 w-full h-12 rounded-button text-body font-semibold transition-colors',
            classTitle.trim() && coachComment.trim()
              ? 'bg-primary text-white active:bg-primary-dark'
              : 'bg-surface-tertiary text-content-tertiary'
          )}
        >
          강의노트 보내기
        </button>
      </div>
    </div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────
export default function TrainerMessageRoom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { trainer } = useAuthStore();

  const roomId = id ?? '1';
  const meta = ROOM_META[roomId] ?? {
    memberName: '회원',
    memberAvatar: avatarImg('member-hw', 100),
    sessionBadge: '',
  };

  const [messages, setMessages] = useState<TrainerMessage[]>(() => buildMockMessages(roomId));
  const [inputValue, setInputValue] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, []);

  function sendText() {
    if (!inputValue.trim()) return;
    const newMsg: TrainerMessage = {
      id: messages.length + 1,
      senderId: 'trainer',
      type: 'text',
      content: inputValue.trim(),
      sentAt: new Date().toISOString(),
      isRead: false,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputValue('');
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }

  function handleSendNote(note: NoteData) {
    const newMsg: TrainerMessage = {
      id: messages.length + 1,
      senderId: 'trainer',
      type: 'note',
      content: note.classTitle,
      noteData: note,
      sentAt: new Date().toISOString(),
      isRead: false,
    };
    setMessages((prev) => [...prev, newMsg]);
    setShowNoteModal(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }

  function handleQuickAction(action: string) {
    if (action === '강의노트 보내기') {
      setShowNoteModal(true);
      return;
    }
    setInputValue(action);
  }

  const grouped = groupByDate(messages);

  const trainerName = trainer?.staffName ?? trainer?.name ?? '트레이너';

  return (
    <div className="flex flex-col h-screen bg-surface-secondary">
      {/* Sticky 헤더 */}
      <header className="sticky top-0 z-30 bg-surface border-b border-line flex items-center gap-2 px-2 h-14 pt-safe">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
          className="-ml-1 w-10 h-10 inline-flex items-center justify-center rounded-full active:bg-surface-tertiary text-content shrink-0"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <Avatar src={meta.memberAvatar} name={meta.memberName} size="sm" />
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="text-body font-semibold text-content truncate">{meta.memberName}</span>
          {meta.sessionBadge && (
            <span className="text-caption text-primary bg-primary/10 px-2 py-0.5 rounded-pill shrink-0">
              {meta.sessionBadge}
            </span>
          )}
        </div>
        <button
          type="button"
          aria-label="옵션"
          className="w-10 h-10 inline-flex items-center justify-center rounded-full active:bg-surface-tertiary text-content shrink-0"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto bg-surface-secondary px-4 py-4 space-y-6">
        {Array.from(grouped.entries()).map(([dateKey, msgs]) => (
          <div key={dateKey}>
            {/* 날짜 구분선 */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-line" />
              <span className="text-caption text-content-tertiary shrink-0">
                {formatDate(dateKey)}
              </span>
              <div className="flex-1 h-px bg-line" />
            </div>

            <div className="space-y-2">
              {msgs.map((msg, idx) => {
                const isMe = msg.senderId === 'trainer';
                const prevMsg = idx > 0 ? msgs[idx - 1] : null;
                const isFirstInSeries = !prevMsg || prevMsg.senderId !== msg.senderId;

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex items-end gap-2',
                      isMe ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    {/* 아바타 — 상대방 + 첫 메시지만 */}
                    {!isMe && (
                      <div className="w-7 shrink-0 self-end">
                        {isFirstInSeries && (
                          <Avatar src={meta.memberAvatar} name={meta.memberName} size="xs" />
                        )}
                      </div>
                    )}

                    <div
                      className={cn(
                        'flex flex-col gap-1',
                        isMe ? 'items-end' : 'items-start',
                        'max-w-[80%]'
                      )}
                    >
                      {/* 강의노트 타입 */}
                      {msg.type === 'note' && msg.noteData && (
                        <Card
                          variant="elevated"
                          padding="md"
                          className="w-full max-w-[300px] border border-primary/20"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <ClipboardList className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-body-sm font-semibold text-primary">강의노트</span>
                            {isMe && (
                              <span className="ml-auto text-caption text-content-tertiary">
                                {trainerName}
                              </span>
                            )}
                          </div>
                          <p className="text-body-sm font-semibold text-content mb-1">
                            {msg.noteData.classTitle}
                          </p>
                          <p className="text-caption text-content-tertiary mb-2">
                            {msg.noteData.date}
                          </p>
                          <p className="text-body-sm text-content-secondary leading-relaxed">
                            {msg.noteData.coachComment}
                          </p>
                          {msg.noteData.nextGoal && (
                            <div className="mt-3 pt-3 border-t border-line">
                              <p className="text-caption text-content-tertiary mb-0.5">다음 목표</p>
                              <p className="text-body-sm font-medium text-content">
                                {msg.noteData.nextGoal}
                              </p>
                            </div>
                          )}
                        </Card>
                      )}

                      {/* 텍스트 타입 */}
                      {msg.type === 'text' && (
                        <div
                          className={cn(
                            'px-4 py-2.5 rounded-2xl text-body-sm leading-relaxed',
                            isMe
                              ? 'bg-primary text-white rounded-br-md'
                              : 'bg-surface text-content rounded-bl-md shadow-card-soft'
                          )}
                        >
                          {msg.content}
                        </div>
                      )}

                      {/* 시간 + 읽음 */}
                      <div
                        className={cn(
                          'flex items-center gap-1',
                          isMe ? 'flex-row-reverse' : 'flex-row'
                        )}
                      >
                        {isMe && (
                          <span className="text-micro text-content-tertiary">
                            {msg.isRead ? '읽음' : '안읽음'}
                          </span>
                        )}
                        <span className="text-micro text-content-tertiary">
                          {formatTime(msg.sentAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 입력 바 */}
      <div className="bg-surface border-t border-line pb-safe">
        {/* 퀵 액션 칩 */}
        {inputValue === '' && (
          <div className="flex gap-2 px-4 pt-3 pb-0 overflow-x-auto scrollbar-none">
            {['강의노트 보내기', '예약 가능 시간 안내', '수업 후기 요청'].map((action) => (
              <Chip
                key={action}
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => handleQuickAction(action)}
              >
                {action === '강의노트 보내기' ? (
                  <span className="flex items-center gap-1">
                    <ClipboardList className="w-3 h-3" /> {action}
                  </span>
                ) : (
                  action
                )}
              </Chip>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 px-3 py-3">
          <button
            type="button"
            aria-label="첨부"
            className="w-10 h-10 inline-flex items-center justify-center rounded-full active:bg-surface-tertiary text-content-secondary shrink-0"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="메시지 보내기..."
            className="flex-1 h-11 px-4 rounded-input border border-line bg-surface-secondary text-body text-content placeholder:text-content-tertiary outline-none focus:border-primary/70 transition-colors"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputValue.trim()) sendText();
            }}
          />
          <button
            type="button"
            aria-label="전송"
            disabled={!inputValue.trim()}
            onClick={sendText}
            className={cn(
              'w-11 h-11 inline-flex items-center justify-center rounded-button shrink-0 transition-colors',
              inputValue.trim()
                ? 'bg-primary text-white active:bg-primary-dark'
                : 'bg-surface-tertiary text-content-tertiary'
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 강의노트 작성 모달 */}
      {showNoteModal && (
        <NoteModal
          onClose={() => setShowNoteModal(false)}
          onSend={handleSendNote}
        />
      )}
    </div>
  );
}
