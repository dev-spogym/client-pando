import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, Lock, Eye, EyeOff, User } from 'lucide-react';
import { getEmployeeRoleLabel, getRoleHomePath, type EmployeeLoginRole } from '@/lib/auth';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type LoginTab = 'member' | 'employee';

/** 로그인 페이지 */
export default function Login() {
  const navigate = useNavigate();
  const { login, loginAsEmployee, loading } = useAuthStore();
  const [tab, setTab] = useState<LoginTab>('member');
  const [employeeRole, setEmployeeRole] = useState<EmployeeLoginRole>('trainer');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  /** 전화번호 자동 포맷 */
  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 11);
    if (cleaned.length <= 3) {
      setPhone(cleaned);
    } else if (cleaned.length <= 7) {
      setPhone(`${cleaned.slice(0, 3)}-${cleaned.slice(3)}`);
    } else {
      setPhone(`${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (tab === 'member') {
      if (!phone || !password) {
        toast.error('전화번호와 비밀번호를 입력하세요.');
        return;
      }
      const { error } = await login(phone, password);
      if (error) {
        toast.error(error);
      } else {
        toast.success('로그인 성공!');
        navigate('/', { replace: true });
      }
    } else {
      if (!username || !password) {
        toast.error('아이디와 비밀번호를 입력하세요.');
        return;
      }
      const { error, role } = await loginAsEmployee(username, password, employeeRole);
      if (error) {
        toast.error(error);
      } else {
        toast.success('로그인 성공!');
        navigate(getRoleHomePath(role), { replace: true });
      }
    }
  };

  const handleTabChange = (newTab: LoginTab) => {
    setTab(newTab);
    setPassword('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* 상단 로고 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-safe-top">
        <div className={cn(
          'w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg',
          tab === 'member'
            ? 'bg-primary'
            : employeeRole === 'fc'
              ? 'bg-gradient-to-br from-indigo-600 to-sky-600'
              : employeeRole === 'staff'
                ? 'bg-gradient-to-br from-slate-800 to-slate-600'
                : 'bg-gradient-to-br from-teal-600 to-emerald-600'
        )}>
          <span className="text-white text-2xl font-bold">스포짐</span>
        </div>
        <h1 className="text-2xl font-bold text-content mb-1">스포짐</h1>
        <p className="text-content-secondary text-sm">
          {tab === 'member' ? '회원 전용 앱' : `${getEmployeeRoleLabel(employeeRole)} 직원 로그인`}
        </p>
      </div>

      {/* 로그인 폼 */}
      <div className="px-6 pb-10">
        {/* 탭 전환 */}
        <div className="flex mb-6 bg-surface-secondary rounded-xl p-1">
          <button
            onClick={() => handleTabChange('member')}
            className={cn(
              'flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors',
              tab === 'member'
                ? 'bg-surface text-content shadow-sm'
                : 'text-content-tertiary'
            )}
          >
            회원 로그인
          </button>
          <button
            onClick={() => handleTabChange('employee')}
            className={cn(
              'flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors',
              tab === 'employee'
                ? 'bg-surface text-content shadow-sm'
                : 'text-content-tertiary'
            )}
          >
            직원 로그인
          </button>
        </div>

        {tab === 'employee' && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold text-content-tertiary">직원 유형</p>
            <div className="grid grid-cols-3 gap-2">
              {(['trainer', 'fc', 'staff'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setEmployeeRole(role)}
                  className={cn(
                    'rounded-xl border px-3 py-3 text-sm font-medium transition-colors',
                    employeeRole === role
                      ? role === 'fc'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : role === 'staff'
                          ? 'border-slate-500 bg-slate-100 text-slate-700'
                          : 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-line bg-surface text-content-secondary'
                  )}
                >
                  {getEmployeeRoleLabel(role)}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 회원: 전화번호 입력 / 직원: 아이디 입력 */}
          {tab === 'member' ? (
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-tertiary" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="전화번호"
                className={cn(
                  'w-full pl-12 pr-4 py-4 rounded-xl border border-line',
                  'bg-surface text-content placeholder:text-content-tertiary',
                  'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary',
                  'text-base'
                )}
                autoComplete="tel"
              />
            </div>
          ) : (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-tertiary" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="아이디"
                className={cn(
                  'w-full pl-12 pr-4 py-4 rounded-xl border border-line',
                  'bg-surface text-content placeholder:text-content-tertiary',
                  'focus:outline-none focus:ring-1',
                  employeeRole === 'fc'
                    ? 'focus:border-indigo-500 focus:ring-indigo-500'
                    : employeeRole === 'staff'
                      ? 'focus:border-slate-500 focus:ring-slate-500'
                      : 'focus:border-teal-500 focus:ring-teal-500',
                  'text-base'
                )}
                autoComplete="username"
              />
            </div>
          )}

          {/* 비밀번호 입력 */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-tertiary" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              className={cn(
                'w-full pl-12 pr-12 py-4 rounded-xl border border-line',
                'bg-surface text-content placeholder:text-content-tertiary',
                'focus:outline-none focus:ring-1',
                tab === 'member'
                  ? 'focus:border-primary focus:ring-primary'
                  : employeeRole === 'fc'
                    ? 'focus:border-indigo-500 focus:ring-indigo-500'
                    : employeeRole === 'staff'
                      ? 'focus:border-slate-500 focus:ring-slate-500'
                      : 'focus:border-teal-500 focus:ring-teal-500',
                'text-base'
              )}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-content-tertiary"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className={cn(
              'w-full py-4 rounded-xl font-semibold text-base',
              'text-white',
              'active:opacity-90 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              tab === 'member'
                ? 'bg-primary active:bg-primary-dark'
                : employeeRole === 'fc'
                  ? 'bg-gradient-to-r from-indigo-600 to-sky-600'
                  : employeeRole === 'staff'
                    ? 'bg-gradient-to-r from-slate-800 to-slate-600'
                    : 'bg-gradient-to-r from-teal-600 to-emerald-600'
            )}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* 하단 링크 (회원 탭일 때만) */}
        {tab === 'member' && (
          <div className="mt-6 text-center">
            <Link to="/register" className="text-sm text-primary font-medium">
              아직 회원이 아니신가요? 앱 연동하기
            </Link>
          </div>
        )}

        <div className="mt-8 rounded-2xl bg-surface-secondary p-4">
          <p className="text-xs font-semibold text-content-tertiary">직원 화면 미리보기</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link to="/trainer?preview=1&role=trainer" className="rounded-xl bg-surface px-3 py-3 text-center text-sm font-medium text-content-secondary shadow-sm">
              Trainer
            </Link>
            <Link to="/trainer?preview=1&role=golf_trainer" className="rounded-xl bg-surface px-3 py-3 text-center text-sm font-medium text-content-secondary shadow-sm">
              Golf Trainer
            </Link>
            <Link to="/fc?preview=1&role=fc" className="rounded-xl bg-surface px-3 py-3 text-center text-sm font-medium text-content-secondary shadow-sm">
              FC Preview
            </Link>
            <Link to="/staff?preview=1&role=staff" className="rounded-xl bg-surface px-3 py-3 text-center text-sm font-medium text-content-secondary shadow-sm">
              Staff Preview
            </Link>
          </div>
          <p className="mt-3 text-[11px] leading-5 text-content-tertiary">
            관리자 권한은 별도 preview role로 섞지 않고, 실제 로그인 시 트레이너 영역 접근 권한으로만 처리합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
