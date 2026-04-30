import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Phone } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import {
  getPreviewSearchParam,
  getPreviewTrainerMembers,
  getPreviewTrainerTodayAttendanceIds,
  isPreviewMode,
} from '@/lib/preview';
import { supabase } from '@/lib/supabase';
import { formatPhone } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { SearchBar, Chip, Card, Badge, Avatar, EmptyState } from '@/components/ui';

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
    if (search) {
      const q = search.replace(/-/g, '').toLowerCase();
      const nameMatch = m.name.toLowerCase().includes(q);
      const phoneMatch = m.phone.replace(/-/g, '').includes(q);
      if (!nameMatch && !phoneMatch) return false;
    }
    if (filter === 'today') return todayMemberIds.has(m.id);
    if (filter === 'favorite') return m.isFavorite;
    return true;
  });

  const statusTone = (status: string): 'success' | 'error' | 'warning' | 'neutral' => {
    const map: Record<string, 'success' | 'error' | 'warning' | 'neutral'> = {
      ACTIVE: 'success',
      EXPIRED: 'error',
      HOLDING: 'warning',
      INACTIVE: 'neutral',
    };
    return map[status] || 'neutral';
  };

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: '이용중',
      EXPIRED: '만료',
      HOLDING: '일시정지',
      INACTIVE: '비활성',
    };
    return map[status] || status;
  };

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'today', label: '오늘 방문' },
    { key: 'favorite', label: '관심회원' },
  ];

  return (
    <div className="pull-to-refresh">
      <header className="bg-gradient-to-br from-teal-600 to-emerald-600 px-5 pt-safe-top pb-4">
        <h1 className="pt-4 text-white text-h4 font-bold">회원 관리</h1>
      </header>

      <div className="px-5 py-4 space-y-3">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="이름 또는 전화번호로 검색"
          onClear={() => setSearch('')}
        />

        {/* 필터 탭 */}
        <div className="flex gap-2">
          {filterTabs.map((tab) => (
            <Chip
              key={tab.key}
              active={filter === tab.key}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
            </Chip>
          ))}
        </div>

        {/* 회원 목록 */}
        {loading ? (
          <div className="py-12">
            <LoadingSpinner text="회원 목록 로딩 중..." />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            size="sm"
            title={search ? '검색 결과가 없습니다' : '등록된 회원이 없습니다'}
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((m) => (
              <Card
                key={m.id}
                variant="elevated"
                padding="md"
                interactive
                onClick={() => navigate(`/trainer/members/${m.id}`)}
              >
                <div className="flex items-center gap-3">
                  <Avatar name={m.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-body">{m.name}</p>
                      <Badge tone={statusTone(m.status)} variant="soft">
                        {statusLabel(m.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Phone className="w-3 h-3 text-content-tertiary" />
                      <span className="text-caption text-content-secondary">{formatPhone(m.phone)}</span>
                    </div>
                    {m.membershipType && (
                      <p className="text-caption text-content-tertiary mt-0.5">{m.membershipType}</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-content-tertiary flex-shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
