import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import {
  isEmployeeRole,
  isTrainerRole,
  matchesEmployeeSelection,
  normalizeUserRole,
  type EmployeeLoginRole,
  type UserRole,
} from '@/lib/auth';
import {
  getPreviewMemberProfile,
  getPreviewRole,
  getPreviewTrainerProfile,
  isPreviewMode,
  seedPreviewMemberExperience,
  seedPreviewTrainerExperience,
} from '@/lib/preview';

const AUTH_INIT_TIMEOUT_MS = 3000;
const EMPLOYEE_ID_STORAGE_KEY = 'employee_id';
const EMPLOYEE_USERNAME_STORAGE_KEY = 'employee_username';
const MEMBER_AUTH_DOMAINS = ['member.fitgenie.app', 'member.spogym.app'];
const EMPLOYEE_AUTH_DOMAINS = ['fitgenie.local', 'spogym.local'];
let initializePromise: Promise<void> | null = null;

// 로그인 실패 잠금 정책: 5회 연속 실패 시 30분 잠금 (클라이언트 측 가드)
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_LOCK_MINUTES = 30;

function loginLockKey(identifier: string) {
  return `login_attempts_${identifier}`;
}

function getLoginLock(identifier: string): { locked: boolean; minutesLeft: number } {
  if (typeof window === 'undefined') return { locked: false, minutesLeft: 0 };
  try {
    const raw = window.localStorage.getItem(loginLockKey(identifier));
    if (!raw) return { locked: false, minutesLeft: 0 };
    const { count, firstAt } = JSON.parse(raw) as { count: number; firstAt: number };
    const elapsedMin = (Date.now() - firstAt) / 60_000;
    if (count >= LOGIN_MAX_ATTEMPTS && elapsedMin < LOGIN_LOCK_MINUTES) {
      return { locked: true, minutesLeft: Math.max(1, Math.ceil(LOGIN_LOCK_MINUTES - elapsedMin)) };
    }
    if (elapsedMin >= LOGIN_LOCK_MINUTES) {
      window.localStorage.removeItem(loginLockKey(identifier));
    }
    return { locked: false, minutesLeft: 0 };
  } catch {
    return { locked: false, minutesLeft: 0 };
  }
}

/** 로그인 실패를 기록하고 남은 시도 횟수를 반환한다. */
function registerLoginFailure(identifier: string): number {
  if (typeof window === 'undefined') return LOGIN_MAX_ATTEMPTS;
  try {
    const raw = window.localStorage.getItem(loginLockKey(identifier));
    const prev = raw ? (JSON.parse(raw) as { count: number; firstAt: number }) : { count: 0, firstAt: Date.now() };
    const elapsedMin = (Date.now() - prev.firstAt) / 60_000;
    const base = elapsedMin >= LOGIN_LOCK_MINUTES ? { count: 0, firstAt: Date.now() } : prev;
    const next = { count: base.count + 1, firstAt: base.firstAt };
    window.localStorage.setItem(loginLockKey(identifier), JSON.stringify(next));
    return Math.max(0, LOGIN_MAX_ATTEMPTS - next.count);
  } catch {
    return LOGIN_MAX_ATTEMPTS;
  }
}

function clearLoginFailures(identifier: string) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(loginLockKey(identifier));
  } catch {
    /* noop */
  }
}

/** 탈퇴 처리된 회원인지 판정한다. */
function isWithdrawnMember(row: Record<string, unknown>): boolean {
  return String(row.status ?? '').toUpperCase() === 'WITHDRAWN';
}

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

/** 직원 정보 타입 */
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

interface AuthState {
  /** 현재 로그인한 회원 정보 */
  member: MemberProfile | null;
  /** 현재 로그인한 직원 정보 */
  trainer: TrainerProfile | null;
  /** 사용자 역할 */
  userRole: UserRole | null;
  /** 세션 소스 */
  sessionSource: 'preview' | 'live' | null;
  /** 로딩 상태 */
  loading: boolean;
  /** 초기화 완료 여부 */
  initialized: boolean;

  /** 트레이너 여부 */
  isTrainer: () => boolean;

  /** 전화번호 + 비밀번호 로그인 (회원) */
  login: (phone: string, password: string) => Promise<{ error: string | null }>;
  /** 아이디 + 비밀번호 로그인 (직원) */
  loginAsEmployee: (username: string, password: string, selectedRole: EmployeeLoginRole) => Promise<{ error: string | null; role: UserRole | null }>;
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
  sessionSource: null,
  loading: false,
  initialized: false,

  isTrainer: () => {
    const { userRole } = get();
    return isTrainerRole(userRole);
  },

  login: async (phone: string, password: string) => {
    set({ loading: true });
    try {
      const cleanPhone = phone.replace(/-/g, '');

      // 0) 로그인 시도 잠금 확인 (5회 실패 → 30분 잠금)
      const lock = getLoginLock(cleanPhone);
      if (lock.locked) {
        set({ loading: false });
        return { error: `로그인 시도가 5회를 초과했습니다. ${lock.minutesLeft}분 후 다시 시도해 주세요.` };
      }

      // 1) Supabase Auth로 로그인 시도
      const { error: authError } = await signInWithDomains(cleanPhone, password, MEMBER_AUTH_DOMAINS);

      if (authError) {
        if (typeof window !== 'undefined') {
          // eslint-disable-next-line no-console
          console.warn('[Auth] signIn failed:', getAuthErrorMessage(authError));
        }

        // 2) Auth 실패 — 회원 정보가 있으면 가입이 필요한 상태로 안내
        const { data: existingMember } = await supabase
          .from('members')
          .select('id, name, phone')
          .or(`phone.eq.${cleanPhone},phone.eq.${phone}`)
          .limit(1)
          .maybeSingle();

        // 가입 안내 케이스는 비밀번호 오류가 아니므로 실패 카운트에서 제외
        if (existingMember) {
          set({ loading: false });
          return {
            error: '앱 가입이 필요합니다. 아래 "앱 연동하기"를 눌러 비밀번호를 설정해 주세요.',
          };
        }

        const remaining = registerLoginFailure(cleanPhone);
        set({ loading: false });
        if (remaining <= 0) {
          return { error: '로그인 시도가 5회를 초과해 30분간 잠겼습니다. 잠시 후 다시 시도해 주세요.' };
        }
        return { error: `전화번호 또는 비밀번호가 올바르지 않습니다. (남은 시도 ${remaining}회)` };
      }

      clearLoginFailures(cleanPhone);

      // 3) Auth 성공 — 회원 정보 조회
      const { data: member } = await supabase
        .from('members')
        .select('*')
        .or(`phone.eq.${cleanPhone},phone.eq.${phone}`)
        .limit(1)
        .maybeSingle();

      if (!member) {
        // 폴백: 끝 8자리 부분 매칭
        const { data: memberByPhone } = await supabase
          .from('members')
          .select('*')
          .ilike('phone', `%${cleanPhone.slice(-8)}%`)
          .limit(1)
          .maybeSingle();

        if (memberByPhone) {
          if (isWithdrawnMember(memberByPhone)) {
            await supabase.auth.signOut();
            set({ loading: false });
            return { error: '탈퇴 처리된 계정입니다. 센터에 문의해 주세요.' };
          }
          set({
            member: mapMemberProfile(memberByPhone),
            userRole: 'member',
            sessionSource: 'live',
            loading: false,
          });
          localStorage.setItem('member_id', String(memberByPhone.id));
          localStorage.setItem('member_phone', cleanPhone);
          localStorage.setItem('user_role', 'member');
          return { error: null };
        }

        set({ loading: false });
        return { error: '등록된 회원 정보를 찾을 수 없습니다. 센터에 문의해 주세요.' };
      }

      if (isWithdrawnMember(member)) {
        await supabase.auth.signOut();
        set({ loading: false });
        return { error: '탈퇴 처리된 계정입니다. 센터에 문의해 주세요.' };
      }

      set({
        member: mapMemberProfile(member),
        userRole: 'member',
        sessionSource: 'live',
        loading: false,
      });
      localStorage.setItem('member_id', String(member.id));
      localStorage.setItem('member_phone', cleanPhone);
      localStorage.setItem('user_role', 'member');
      return { error: null };
    } catch (err) {
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-console
        console.error('[Auth] login error:', err);
      }
      set({ loading: false });
      return { error: '로그인 중 오류가 발생했습니다. 네트워크 상태를 확인해 주세요.' };
    }
  },

  loginAsEmployee: async (username: string, password: string, selectedRole: EmployeeLoginRole) => {
    set({ loading: true });
    try {
      // Supabase Auth로 직원 로그인
      const { error: authError } = await signInWithDomains(username, password, EMPLOYEE_AUTH_DOMAINS);

      if (authError) {
        set({ loading: false });
        return { error: '직원 아이디 또는 비밀번호가 올바르지 않습니다.', role: null };
      }

      // users 테이블에서 사용자 정보 조회
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (userError || !user) {
        await supabase.auth.signOut();
        set({ loading: false });
        return { error: '등록된 직원 정보를 찾을 수 없습니다.', role: null };
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

      const userRole = normalizeUserRole(user.role);

      if (!userRole || !isEmployeeRole(userRole)) {
        await clearEmployeeSession(set);
        return { error: '직원 권한이 없는 계정입니다.', role: null };
      }

      if (!matchesEmployeeSelection(selectedRole, userRole)) {
        await clearEmployeeSession(set);
        return { error: `${selectedRole === 'fc' ? 'FC' : selectedRole === 'staff' ? '스태프' : '트레이너'} 탭에서 로그인할 수 없는 계정입니다.`, role: null };
      }

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
        sessionSource: 'live',
        loading: false,
      });
      saveEmployeeSession(user.id, username, userRole);
      return { error: null, role: userRole };
    } catch {
      set({ loading: false });
      return { error: '로그인 중 오류가 발생했습니다.', role: null };
    }
  },

  logout: async () => {
    if (isPreviewMode()) {
      set({ member: null, trainer: null, userRole: null, sessionSource: null, loading: false, initialized: true });
      return;
    }

    await supabase.auth.signOut();
    clearStoredSession();
    set({ member: null, trainer: null, userRole: null, sessionSource: null });
  },

  initialize: async () => {
    const state = get();
    const previewActive = isPreviewMode();
    const previewRole = previewActive ? getPreviewRole() : null;
    const previewReady = previewActive && (
      previewRole === 'member'
        ? state.userRole === 'member' && state.member !== null && state.sessionSource === 'preview'
        : state.userRole === previewRole && state.trainer !== null && state.sessionSource === 'preview'
    );

    if (state.initialized) {
      if (previewReady) return;
      if (!previewActive && state.sessionSource !== 'preview') return;
    }

    if (initializePromise) return initializePromise;

    initializePromise = (async () => {
      set({ loading: true });

      try {
        if (isPreviewMode()) {
          const previewRole = getPreviewRole();

          if (previewRole !== 'member') {
            const previewTrainer = createPreviewEmployeeProfile(previewRole);
            seedPreviewTrainerExperience(previewTrainer.id);
            set({
              member: null,
              trainer: previewTrainer,
              userRole: previewRole === 'golf_trainer' ? 'golf_trainer' : previewRole,
              sessionSource: 'preview',
              loading: false,
              initialized: true,
            });
            return;
          }

          const previewMember = getPreviewMemberProfile();
          seedPreviewMemberExperience(previewMember.id);
          set({
            member: previewMember,
            trainer: null,
            userRole: 'member',
            sessionSource: 'preview',
            loading: false,
            initialized: true,
          });
          return;
        }

        const savedRole = localStorage.getItem('user_role') as UserRole | null;

        // 직원 자동 로그인
        if (savedRole && isEmployeeRole(savedRole)) {
          const employeeId = localStorage.getItem(EMPLOYEE_ID_STORAGE_KEY) ?? localStorage.getItem('trainer_id');
          if (employeeId) {
            const user = await getTrainerById(Number(employeeId));
            if (user) {
              const normalizedRole = normalizeUserRole(user.role);
              if (!normalizedRole || !isEmployeeRole(normalizedRole)) {
                clearStoredSession();
                set({ member: null, trainer: null, userRole: null, sessionSource: null, loading: false, initialized: true });
                return;
              }

              const staff = await getStaffProfile(user.branchId, user.name);
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
                userRole: normalizedRole,
                sessionSource: 'live',
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
          const member = await getMemberById(Number(memberId));
          if (member) {
            set({
              member: mapMemberProfile(member),
              userRole: 'member',
              sessionSource: 'live',
              loading: false,
              initialized: true,
            });
            return;
          }
        }

        // Supabase 세션 확인
        const sessionResult = await withTimeout(supabase.auth.getSession());
        const session = sessionResult?.data.session ?? null;

        if (session?.user) {
          const userEmail = session.user.email || '';

          if (isAuthEmailDomain(userEmail, EMPLOYEE_AUTH_DOMAINS)) {
            const username = userEmail.split('@')[0];
            const user = await getTrainerByUsername(username);
            if (user) {
              const normalizedRole = normalizeUserRole(user.role);
              if (!normalizedRole || !isEmployeeRole(normalizedRole)) {
                clearStoredSession();
                set({ member: null, trainer: null, userRole: null, sessionSource: null, loading: false, initialized: true });
                return;
              }

              const staff = await getStaffProfile(user.branchId, user.name);
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
                userRole: normalizedRole,
                sessionSource: 'live',
                loading: false,
                initialized: true,
              });
              saveEmployeeSession(user.id, username, normalizedRole);
              return;
            }
          }

          if (isAuthEmailDomain(userEmail, MEMBER_AUTH_DOMAINS)) {
            const phone = userEmail.split('@')[0];
            const member = await getMemberByPhone(phone);
            if (member) {
              set({
                member: mapMemberProfile(member),
                userRole: 'member',
                sessionSource: 'live',
                loading: false,
                initialized: true,
              });
              localStorage.setItem('member_id', String(member.id));
              localStorage.setItem('member_phone', phone);
              localStorage.setItem('user_role', 'member');
              return;
            }
          }
        }

        set({ member: null, trainer: null, userRole: null, sessionSource: null, loading: false, initialized: true });
      } catch {
        set({ member: null, trainer: null, userRole: null, sessionSource: null, loading: false, initialized: true });
      } finally {
        initializePromise = null;
      }
    })();

    return initializePromise;
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

    if (isEmployeeRole(userRole) && trainer) {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', trainer.id)
        .single();
      if (user) {
        const normalizedRole = normalizeUserRole(user.role);
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
          userRole: normalizedRole ?? userRole,
          sessionSource: 'live',
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

async function withTimeout<T>(promise: PromiseLike<T>, timeoutMs = AUTH_INIT_TIMEOUT_MS): Promise<T | null> {
  const timeoutPromise = new Promise<null>((resolve) => {
    setTimeout(() => resolve(null), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } catch {
    return null;
  }
}

async function getTrainerById(id: number) {
  const result = await withTimeout(
    supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
  );

  return result?.data ?? null;
}

async function getTrainerByUsername(username: string) {
  const result = await withTimeout(
    supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()
  );

  return result?.data ?? null;
}

async function getStaffProfile(branchId: number, name: string) {
  const result = await withTimeout(
    supabase
      .from('staff')
      .select('*')
      .eq('branchId', branchId)
      .eq('name', name)
      .eq('isActive', true)
      .limit(1)
      .single()
  );

  return result?.data ?? null;
}

async function getMemberById(id: number) {
  const result = await withTimeout(
    supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single()
  );

  return result?.data ?? null;
}

async function getMemberByPhone(phone: string) {
  const result = await withTimeout(
    supabase
      .from('members')
      .select('*')
      .or(`phone.eq.${phone},phone.ilike.%${phone.slice(-8)}%`)
      .limit(1)
      .single()
  );

  return result?.data ?? null;
}

async function signInWithDomains(identifier: string, password: string, domains: string[]) {
  let lastError: unknown = null;

  for (const domain of domains) {
    const { error } = await supabase.auth.signInWithPassword({
      email: `${identifier}@${domain}`,
      password,
    });

    if (!error) {
      return { error: null };
    }

    lastError = error;
  }

  return { error: lastError };
}

function getAuthErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'Unknown auth error';
}

function isAuthEmailDomain(email: string, domains: string[]) {
  return domains.some((domain) => email.endsWith(`@${domain}`));
}

function saveEmployeeSession(id: number, username: string, role: UserRole) {
  localStorage.setItem(EMPLOYEE_ID_STORAGE_KEY, String(id));
  localStorage.setItem(EMPLOYEE_USERNAME_STORAGE_KEY, username);
  localStorage.setItem('trainer_id', String(id));
  localStorage.setItem('trainer_username', username);
  localStorage.setItem('user_role', role);
}

function clearStoredSession() {
  localStorage.removeItem('member_id');
  localStorage.removeItem('member_phone');
  localStorage.removeItem(EMPLOYEE_ID_STORAGE_KEY);
  localStorage.removeItem(EMPLOYEE_USERNAME_STORAGE_KEY);
  localStorage.removeItem('trainer_id');
  localStorage.removeItem('trainer_username');
  localStorage.removeItem('user_role');
}

async function clearEmployeeSession(set: (partial: Partial<AuthState>) => void) {
  await supabase.auth.signOut();
  clearStoredSession();
  set({ member: null, trainer: null, userRole: null, sessionSource: null, loading: false });
}

function createPreviewEmployeeProfile(role: Exclude<UserRole, 'member'>): TrainerProfile {
  const base = getPreviewTrainerProfile();

  if (role === 'fc') {
    return {
      ...base,
      username: 'fc.preview',
      name: '최은영',
      role: 'FC',
      staffId: 2,
      staffName: '최은영',
      staffPhone: '010-8888-1122',
      staffColor: '#4f46e5',
    };
  }

  if (role === 'staff') {
    return {
      ...base,
      username: 'staff.preview',
      name: '정하나',
      role: 'STAFF',
      staffId: 3,
      staffName: '정하나',
      staffPhone: '010-7777-3344',
      staffColor: '#475569',
    };
  }

  if (role === 'golf_trainer') {
    return {
      ...base,
      username: 'golf.preview',
      name: '이준호',
      role: 'GOLF_TRAINER',
      staffId: 4,
      staffName: '이준호',
      staffPhone: '010-6666-7890',
      staffColor: '#0f766e',
    };
  }

  return base;
}
