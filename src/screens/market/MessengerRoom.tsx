'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Paperclip, Send, ClipboardList } from 'lucide-react';
import { Avatar, Card, Chip } from '@/components/ui';
import { getConversationById, getMessagesByConversation } from '@/lib/marketplace';
import { useMarketStore } from '@/stores/marketStore';
import { cn } from '@/lib/utils';
import type { MarketMessage } from '@/lib/marketplace';

const QUICK_REPLIES = ['예약 가능 시간', '가격 문의', '위치 알려주세요'];

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

function groupByDate(messages: MarketMessage[]): Map<string, MarketMessage[]> {
  const map = new Map<string, MarketMessage[]>();
  for (const msg of messages) {
    const dateKey = msg.sentAt.slice(0, 10);
    const group = map.get(dateKey) ?? [];
    group.push(msg);
    map.set(dateKey, group);
  }
  return map;
}

export default function MessengerRoom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { markConversationRead } = useMarketStore();
  const [inputValue, setInputValue] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const numId = Number(id);
  const conversation = getConversationById(numId);
  const messages = getMessagesByConversation(numId);

  useEffect(() => {
    if (numId) markConversationRead(numId);
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [numId, markConversationRead]);

  if (!conversation) {
    return (
      <div className="flex flex-col min-h-screen bg-surface-secondary items-center justify-center">
        <p className="text-content-secondary">대화방을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const grouped = groupByDate(messages);

  return (
    <div className="flex flex-col h-screen bg-surface-secondary">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface border-b border-line flex items-center gap-2 px-2 h-14 pt-safe">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
          className="-ml-1 w-10 h-10 inline-flex items-center justify-center rounded-full active:bg-surface-tertiary text-content shrink-0"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <Avatar
          src={conversation.participantAvatar}
          name={conversation.participantName}
          size="sm"
        />
        <span className="flex-1 text-body font-semibold text-content truncate">
          {conversation.participantName}
        </span>
        <button
          type="button"
          aria-label="옵션"
          className="w-10 h-10 inline-flex items-center justify-center rounded-full active:bg-surface-tertiary text-content shrink-0"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      {/* Message area */}
      <div className="flex-1 overflow-y-auto bg-surface-secondary px-4 py-4 space-y-6">
        {Array.from(grouped.entries()).map(([dateKey, msgs]) => (
          <div key={dateKey}>
            {/* Date divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-line" />
              <span className="text-caption text-content-tertiary shrink-0">{formatDate(dateKey)}</span>
              <div className="flex-1 h-px bg-line" />
            </div>

            <div className="space-y-2">
              {msgs.map((msg, idx) => {
                const isMe = msg.senderId === 'me';
                const prevMsg = idx > 0 ? msgs[idx - 1] : null;
                const isFirstInSeries =
                  !prevMsg ||
                  prevMsg.senderId !== msg.senderId;

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex items-end gap-2',
                      isMe ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    {/* Avatar — other side only, first in series */}
                    {!isMe && (
                      <div className="w-7 shrink-0 self-end">
                        {isFirstInSeries && (
                          <Avatar
                            src={conversation.participantAvatar}
                            name={conversation.participantName}
                            size="xs"
                          />
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
                      {/* Note type */}
                      {msg.type === 'note' && msg.noteData && (
                        <Card
                          variant="elevated"
                          padding="md"
                          className="w-full max-w-[300px] border border-primary/20"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <ClipboardList className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-body-sm font-semibold text-primary">강의노트</span>
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

                      {/* Image type */}
                      {msg.type === 'image' && msg.imageUrl && (
                        <img
                          src={msg.imageUrl}
                          alt="첨부 이미지"
                          className="rounded-card object-cover max-w-[200px] max-h-[200px]"
                        />
                      )}

                      {/* Text type */}
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

                      {/* Time + read status */}
                      <div className={cn('flex items-center gap-1', isMe ? 'flex-row-reverse' : 'flex-row')}>
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

      {/* Input bar */}
      <div className="bg-surface border-t border-line pb-safe">
        {/* Quick replies — shown when input is empty */}
        {inputValue === '' && (
          <div className="flex gap-2 px-4 pt-3 pb-0 overflow-x-auto scrollbar-none">
            {QUICK_REPLIES.map((reply) => (
              <Chip
                key={reply}
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => setInputValue(reply)}
              >
                {reply}
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
              if (e.key === 'Enter' && inputValue.trim()) setInputValue('');
            }}
          />
          <button
            type="button"
            aria-label="전송"
            disabled={!inputValue.trim()}
            onClick={() => setInputValue('')}
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
    </div>
  );
}
