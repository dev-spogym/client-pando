import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

/** 회원 정보 타입 */
export interface MemberProfile {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  gender: string | null;
  birthDate: string | null;
  profileImage: string | null;
  status: string;
  mileage: number;
  branchId: number;
  membershipType: string | null;
  membershipStart: string | null;
  membershipExpiry: string | null;
  registeredAt: string;
}

interface AuthState {
  /** 현재 로그인한 회원 정보 */
  member: MemberProfile | null;
  /** 로딩 상태 */
  loading: boolean;
  /** 초기화 완료 여부 */
  initialized: boolean;

  /** 전화번호 + 비밀번호 로그인 */
  login: (phone: string, password: string) => Promise<{ error: string | null }>;
  /** 로그아웃 */
  logout: () => Promise<void>;
  /** 세션 초기화 (자동 로그인) */
  initialize: () => Promise<void>;
  /** 회원 프로필 갱신 */
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  member: null,
  loading: false,
  initialized: false,

  login: async (phone: string, password: string) => {
    set({ loading: true });
    try {
      // Supabase Auth로 로그인 (이메일 형태로 전화번호 사용)
      const email = `${phone.replace(/-/g, '')}@member.spogym.app`;
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        set({ loading: false });
        return { error: '전화번호 또는 비밀번호가 올바르지 않습니다.' };
      }

      // 회원 정보 조회
      const cleanPhone = phone.replace(/-/g, '');
      const { data: member, error: memberError } = await supabase
        .from('members')
        .select('*')
        .or(`phone.eq.${cleanPhone},phone.eq.${phone}`)
        .single();

      if (memberError || !member) {
        // Auth는 성공했지만 회원 정보가 없는 경우
        // 전화번호로 직접 검색 시도
        const { data: memberByPhone } = await supabase
          .from('members')
          .select('*')
          .ilike('phone', `%${cleanPhone.slice(-8)}%`)
          .limit(1)
          .single();

        if (memberByPhone) {
          set({
            member: mapMemberProfile(memberByPhone),
            loading: false,
          });
          localStorage.setItem('member_id', String(memberByPhone.id));
          localStorage.setItem('member_phone', cleanPhone);
          return { error: null };
        }

        set({ loading: false });
        return { error: '등록된 회원 정보를 찾을 수 없습니다.' };
      }

      set({
        member: mapMemberProfile(member),
        loading: false,
      });
      localStorage.setItem('member_id', String(member.id));
      localStorage.setItem('member_phone', cleanPhone);
      return { error: null };
    } catch {
      set({ loading: false });
      return { error: '로그인 중 오류가 발생했습니다.' };
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('member_id');
    localStorage.removeItem('member_phone');
    set({ member: null });
  },

  initialize: async () => {
    set({ loading: true });
    try {
      // 저장된 회원 ID로 자동 로그인 시도
      const memberId = localStorage.getItem('member_id');
      if (memberId) {
        const { data: member } = await supabase
          .from('members')
          .select('*')
          .eq('id', Number(memberId))
          .single();

        if (member) {
          set({ member: mapMemberProfile(member), loading: false, initialized: true });
          return;
        }
      }

      // Supabase 세션 확인
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const phone = session.user.email?.split('@')[0] || '';
        const { data: member } = await supabase
          .from('members')
          .select('*')
          .or(`phone.eq.${phone},phone.ilike.%${phone.slice(-8)}%`)
          .limit(1)
          .single();

        if (member) {
          set({ member: mapMemberProfile(member), loading: false, initialized: true });
          localStorage.setItem('member_id', String(member.id));
          return;
        }
      }

      set({ member: null, loading: false, initialized: true });
    } catch {
      set({ member: null, loading: false, initialized: true });
    }
  },

  refreshProfile: async () => {
    const { member } = get();
    if (!member) return;

    const { data } = await supabase
      .from('members')
      .select('*')
      .eq('id', member.id)
      .single();

    if (data) {
      set({ member: mapMemberProfile(data) });
    }
  },
}));

/** DB 레코드를 MemberProfile로 매핑 */
function mapMemberProfile(row: Record<string, unknown>): MemberProfile {
  return {
    id: row.id as number,
    name: (row.name as string) || '',
    phone: (row.phone as string) || '',
    email: (row.email as string) || null,
    gender: (row.gender as string) || null,
    birthDate: row.birthDate ? String(row.birthDate) : null,
    profileImage: (row.profileImage as string) || null,
    status: (row.status as string) || 'ACTIVE',
    mileage: (row.mileage as number) || 0,
    branchId: (row.branchId as number) || 1,
    membershipType: (row.membershipType as string) || null,
    membershipStart: row.membershipStart ? String(row.membershipStart) : null,
    membershipExpiry: row.membershipExpiry ? String(row.membershipExpiry) : null,
    registeredAt: row.registeredAt ? String(row.registeredAt) : new Date().toISOString(),
  };
}
