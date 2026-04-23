import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Phone } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import {
  getPreviewSearchParam,
  getPreviewTrainerMembers,
  getPreviewTrainerTodayAttendanceIds,
  isPreviewMode,
} from '@/lib/preview';
import { supabase } from '@/lib/supabase';
import { cn, formatPhone } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

interface MemberItem {
  id: number;
  name: string;
  phone: string;
  status: string;
  membershipType: string | null;
  isFavorite: boolean;
}

type FilterTab = 'all' | 'today' | 'favorite';

/** 트레이너 - 회원 목록 */
export default function TrainerMembers() {
  const navigate = useNavigate();
  const { trainer } = useAuthStore();
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterTab>('all');
  const [todayMemberIds, setTodayMemberIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!trainer) return;
    fetchMembers();
    fetchTodayAttendance();
  }, [trainer]);

  useEffect(() => {
    if (!isPreviewMode()) return;
    const previewFilter = getPreviewSearchParam('filter');
    if (previewFilter === 'today' || previewFilter === 'favorite') {
      setFilter(previewFilter);
    }
  }, []);

  const fetchMembers = async () => {
    if (!trainer) return;
    setLoading(true);

    if (isPreviewMode()) {
      setMembers(getPreviewTrainerMembers());
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('members')
      .select('id, name, phone, status, membershipType, isFavorite')
      .eq('branchId', trainer.branchId)
      .order('name');

    if (data) {
      setMembers(data.map((m) => ({
        ...m,
        isFavorite: m.isFavorite || false,
      })));
    }
    setLoading(false);
  };

  const fetchTodayAttendance = async () => {
    if (!trainer) return;

    if (isPreviewMode()) {
      setTodayMemberIds(new Set(getPreviewTrainerTodayAttendanceIds()));
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const { data } = await supabase
      .from('attendance')
      .select('memberId')
      .eq('branchId', trainer.branchId)
      .gte('checkInAt', `${todayStr}T00:00:00`)
      .lte('checkInAt', `${todayStr}T23:59:59`);

    if (data) {
      setTodayMemberIds(new Set(data.map((a) => a.memberId)));
    }
  };

  // 검색 + 필터 적용
  const filtered = members.filter((m) => {
    // 검색
    if (search) {
      const q = search.replace(/-/g, '').toLowerCase();
      const nameMatch = m.name.toLowerCase().includes(q);
      const phoneMatch = m.phone.replace(/-/g, '').includes(q);
      if (!nameMatch && !phoneMatch) return false;
    }
    // 필터
    if (filter === 'today') return todayMemberIds.has(m.id);
    if (filter === 'favorite') return m.isFavorite;
    return true;
  });

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      ACTIVE: { label: '이용중', cls: 'bg-green-50 text-green-600' },
      EXPIRED: { label: '만료', cls: 'bg-red-50 text-red-600' },
      HOLDING: { label: '일시정지', cls: 'bg-yellow-50 text-yellow-600' },
      INACTIVE: { label: '비활성', cls: 'bg-gray-100 text-gray-500' },
    };
    const badge = map[status] || { label: status, cls: 'bg-gray-100 text-gray-500' };
    return (
      <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', badge.cls)}>
        {badge.label}
      </span>
    );
  };

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'today', label: '오늘 방문' },
    { key: 'favorite', label: '관심회원' },
  ];

  return (
    <div className="pull-to-refresh">
      {/* 헤더 */}
      <header className="bg-gradient-to-br from-teal-600 to-emerald-600 px-5 pt-safe-top pb-4">
        <h1 className="pt-4 text-white text-lg font-bold">회원 관리</h1>
      </header>

      <div className="px-5 py-4 space-y-3">
        {/* 검색 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-content-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름 또는 전화번호로 검색"
            className={cn(
              'w-full pl-10 pr-4 py-3 rounded-xl border border-line',
              'bg-surface text-content placeholder:text-content-tertiary',
              'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary',
              'text-sm'
            )}
          />
        </div>

        {/* 필터 탭 */}
        <div className="flex gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                filter === tab.key
                  ? 'bg-teal-600 text-white'
                  : 'bg-surface-secondary text-content-secondary'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 회원 목록 */}
        {loading ? (
          <div className="py-12">
            <LoadingSpinner text="회원 목록 로딩 중..." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-content-tertiary text-sm">
            {search ? '검색 결과가 없습니다' : '등록된 회원이 없습니다'}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((m) => (
              <div
                key={m.id}
                onClick={() => navigate(`/trainer/members/${m.id}`)}
                className="bg-surface rounded-card p-4 shadow-card touch-card cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-teal-600 font-bold text-sm">
                      {m.name.slice(0, 1)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{m.name}</p>
                      {statusBadge(m.status)}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Phone className="w-3 h-3 text-content-tertiary" />
                      <span className="text-xs text-content-secondary">{formatPhone(m.phone)}</span>
                    </div>
                    {m.membershipType && (
                      <p className="text-xs text-content-tertiary mt-0.5">{m.membershipType}</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-content-tertiary flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
