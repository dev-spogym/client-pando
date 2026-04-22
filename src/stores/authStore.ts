import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import {
  getPreviewMemberProfile,
  isPreviewMode,
  seedPreviewMemberExperience,
} from '@/lib/preview';

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

/** 트레이너/스태프 정보 타입 */
export interface TrainerProfile {
  id: number;
  username: string;
  name: string;
  role: string;
  branchId: number;
  isActive: boolean;
  staffId: number | null;
  staffName: string | null;
  staffPhone: string | null;
  staffColor: string | null;
}

/** 사용자 역할 */
export type UserRole = 'member' | 'trainer' | 'admin';

interface AuthState {
  /** 현재 로그인한 회원 정보 */
  member: MemberProfile | null;
  /** 현재 로그인한 트레이너 정보 */
  trainer: TrainerProfile | null;
  /** 사용자 역할 */
  userRole: UserRole | null;
  /** 로딩 상태 */
  loading: boolean;
  /** 초기화 완료 여부 */
  initialized: boolean;

  /** 트레이너 여부 */
  isTrainer: () => boolean;

  /** 전화번호 + 비밀번호 로그인 (회원) */
  login: (phone: string, password: string) => Promise<{ error: string | null }>;
  /** 아이디 + 비밀번호 로그인 (트레이너) */
  loginAsTrainer: (username: string, password: string) => Promise<{ error: string | null }>;
  /** 로그아웃 */
  logout: () => Promise<void>;
  /** 세션 초기화 (자동 로그인) */
  initialize: () => Promise<void>;
  /** 회원 프로필 갱신 */
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  member: null,
  trainer: null,
  userRole: null,
  loading: false,
  initialized: false,

  isTrainer: () => {
    const { userRole } = get();
    return userRole === 'trainer' || userRole === 'admin';
  },

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
            userRole: 'member',
            loading: false,
          });
          localStorage.setItem('member_id', String(memberByPhone.id));
          localStorage.setItem('member_phone', cleanPhone);
          localStorage.setItem('user_role', 'member');
          return { error: null };
        }

        set({ loading: false });
        return { error: '등록된 회원 정보를 찾을 수 없습니다.' };
      }

      set({
        member: mapMemberProfile(member),
        userRole: 'member',
        loading: false,
      });
      localStorage.setItem('member_id', String(member.id));
      localStorage.setItem('member_phone', cleanPhone);
      localStorage.setItem('user_role', 'member');
      return { error: null };
    } catch {
      set({ loading: false });
      return { error: '로그인 중 오류가 발생했습니다.' };
    }
  },

  loginAsTrainer: async (username: string, password: string) => {
    set({ loading: true });
    try {
      // Supabase Auth로 트레이너 로그인
      const email = `${username}@spogym.local`;
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        set({ loading: false });
        return { error: '아이디 또는 비밀번호가 올바르지 않습니다.' };
      }

      // users 테이블에서 사용자 정보 조회
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (userError || !user) {
        set({ loading: false });
        return { error: '등록된 스태프 정보를 찾을 수 없습니다.' };
      }

      // staff 테이블에서 매칭되는 직원 정보 조회
      const { data: staff } = await supabase
        .from('staff')
        .select('*')
        .eq('branchId', user.branchId)
        .eq('name', user.name)
        .eq('isActive', true)
        .limit(1)
        .single();

      const role = user.role;
      const userRole: UserRole = (role === 'ADMIN' || role === 'OWNER') ? 'admin' : 'trainer';

      const trainerProfile: TrainerProfile = {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        branchId: user.branchId,
        isActive: user.isActive,
        staffId: staff?.id || null,
        staffName: staff?.name || user.name,
        staffPhone: staff?.phone || null,
        staffColor: staff?.color || null,
      };

      set({
        trainer: trainerProfile,
        userRole,
        loading: false,
      });
      localStorage.setItem('trainer_id', String(user.id));
      localStorage.setItem('trainer_username', username);
      localStorage.setItem('user_role', userRole);
      return { error: null };
    } catch {
      set({ loading: false });
      return { error: '로그인 중 오류가 발생했습니다.' };
    }
  },

  logout: async () => {
    if (isPreviewMode()) {
      set({ member: null, trainer: null, userRole: null, loading: false, initialized: true });
      return;
    }

    await supabase.auth.signOut();
    localStorage.removeItem('member_id');
    localStorage.removeItem('member_phone');
    localStorage.removeItem('trainer_id');
    localStorage.removeItem('trainer_username');
    localStorage.removeItem('user_role');
    set({ member: null, trainer: null, userRole: null });
  },

  initialize: async () => {
    set({ loading: true });
    try {
      if (isPreviewMode()) {
        const previewMember = getPreviewMemberProfile();
        seedPreviewMemberExperience(previewMember.id);
        set({
          member: previewMember,
          trainer: null,
          userRole: 'member',
          loading: false,
          initialized: true,
        });
        return;
      }

      const savedRole = localStorage.getItem('user_role') as UserRole | null;

      // 트레이너 자동 로그인
      if (savedRole === 'trainer' || savedRole === 'admin') {
        const trainerId = localStorage.getItem('trainer_id');
        if (trainerId) {
          const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', Number(trainerId))
            .single();

          if (user) {
            const { data: staff } = await supabase
              .from('staff')
              .select('*')
              .eq('branchId', user.branchId)
              .eq('name', user.name)
              .eq('isActive', true)
              .limit(1)
              .single();

            set({
              trainer: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                branchId: user.branchId,
                isActive: user.isActive,
                staffId: staff?.id || null,
                staffName: staff?.name || user.name,
                staffPhone: staff?.phone || null,
                staffColor: staff?.color || null,
              },
              userRole: savedRole,
              loading: false,
              initialized: true,
            });
            return;
          }
        }
      }

      // 회원 자동 로그인 (저장된 회원 ID)
      const memberId = localStorage.getItem('member_id');
      if (memberId) {
        const { data: member } = await supabase
          .from('members')
          .select('*')
          .eq('id', Number(memberId))
          .single();

        if (member) {
          set({ member: mapMemberProfile(member), userRole: 'member', loading: false, initialized: true });
          return;
        }
      }

      // Supabase 세션 확인
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userEmail = session.user.email || '';

        // 트레이너 세션인 경우
        if (userEmail.endsWith('@spogym.local')) {
          const username = userEmail.split('@')[0];
          const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

          if (user) {
            const { data: staff } = await supabase
              .from('staff')
              .select('*')
              .eq('branchId', user.branchId)
              .eq('name', user.name)
              .eq('isActive', true)
              .limit(1)
              .single();

            const role: UserRole = (user.role === 'ADMIN' || user.role === 'OWNER') ? 'admin' : 'trainer';
            set({
              trainer: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                branchId: user.branchId,
                isActive: user.isActive,
                staffId: staff?.id || null,
                staffName: staff?.name || user.name,
                staffPhone: staff?.phone || null,
                staffColor: staff?.color || null,
              },
              userRole: role,
              loading: false,
              initialized: true,
            });
            localStorage.setItem('trainer_id', String(user.id));
            localStorage.setItem('trainer_username', username);
            localStorage.setItem('user_role', role);
            return;
          }
        }

        // 회원 세션인 경우
        if (userEmail.endsWith('@member.spogym.app')) {
          const phone = userEmail.split('@')[0];
          const { data: member } = await supabase
            .from('members')
            .select('*')
            .or(`phone.eq.${phone},phone.ilike.%${phone.slice(-8)}%`)
            .limit(1)
            .single();

          if (member) {
            set({ member: mapMemberProfile(member), userRole: 'member', loading: false, initialized: true });
            localStorage.setItem('member_id', String(member.id));
            localStorage.setItem('user_role', 'member');
            return;
          }
        }
      }

      set({ member: null, trainer: null, userRole: null, loading: false, initialized: true });
    } catch {
      set({ member: null, trainer: null, userRole: null, loading: false, initialized: true });
    }
  },

  refreshProfile: async () => {
    if (isPreviewMode()) return;

    const { member, trainer, userRole } = get();

    if (userRole === 'member' && member) {
      const { data } = await supabase
        .from('members')
        .select('*')
        .eq('id', member.id)
        .single();
      if (data) {
        set({ member: mapMemberProfile(data) });
      }
    }

    if ((userRole === 'trainer' || userRole === 'admin') && trainer) {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', trainer.id)
        .single();
      if (user) {
        const { data: staff } = await supabase
          .from('staff')
          .select('*')
          .eq('branchId', user.branchId)
          .eq('name', user.name)
          .eq('isActive', true)
          .limit(1)
          .single();

        set({
          trainer: {
            ...trainer,
            name: user.name,
            role: user.role,
            branchId: user.branchId,
            isActive: user.isActive,
            staffId: staff?.id || null,
            staffName: staff?.name || user.name,
            staffPhone: staff?.phone || null,
            staffColor: staff?.color || null,
          },
        });
      }
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
