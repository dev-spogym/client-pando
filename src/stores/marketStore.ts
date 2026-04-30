/**
 * 마켓플레이스 클라이언트 상태 (스크랩, 위치, 검색 기록)
 * 회원 단위 영구 저장은 추후 supabase로. 현재는 localStorage 기반.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  MOCK_CONVERSATIONS,
  MOCK_SCRAPS,
  type MarketConversation,
  type ScrapItem,
  type ScrapTargetType,
} from '@/lib/marketplace';

interface MarketState {
  /** 스크랩 컬렉션 */
  scraps: ScrapItem[];
  /** 검색 기록 (최근 검색어) */
  recentKeywords: string[];
  /** 행정구역 (위치 미허용 시 수동 선택) */
  district: string;
  /** 대화방 (방별 미읽음 카운트 동기화) */
  conversations: MarketConversation[];

  isScrapped: (type: ScrapTargetType, id: number) => boolean;
  toggleScrap: (type: ScrapTargetType, id: number) => void;
  addRecentKeyword: (keyword: string) => void;
  clearRecentKeywords: () => void;
  setDistrict: (district: string) => void;
  markConversationRead: (id: number) => void;
}

export const useMarketStore = create<MarketState>()(
  persist(
    (set, get) => ({
      scraps: MOCK_SCRAPS,
      recentKeywords: [],
      district: '강남구 논현동',
      conversations: MOCK_CONVERSATIONS,

      isScrapped: (type, id) => {
        return get().scraps.some((s) => s.targetType === type && s.targetId === id);
      },

      toggleScrap: (type, id) => {
        const exists = get().scraps.some((s) => s.targetType === type && s.targetId === id);
        if (exists) {
          set({ scraps: get().scraps.filter((s) => !(s.targetType === type && s.targetId === id)) });
        } else {
          set({
            scraps: [
              ...get().scraps,
              {
                id: Date.now(),
                targetType: type,
                targetId: id,
                createdAt: new Date().toISOString().slice(0, 10),
              },
            ],
          });
        }
      },

      addRecentKeyword: (keyword) => {
        const trimmed = keyword.trim();
        if (!trimmed) return;
        const filtered = get().recentKeywords.filter((k) => k !== trimmed);
        set({ recentKeywords: [trimmed, ...filtered].slice(0, 10) });
      },

      clearRecentKeywords: () => set({ recentKeywords: [] }),

      setDistrict: (district) => set({ district }),

      markConversationRead: (id) => {
        set({
          conversations: get().conversations.map((c) =>
            c.id === id ? { ...c, unreadCount: 0 } : c
          ),
        });
      },
    }),
    { name: 'market-store' }
  )
);
