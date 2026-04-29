import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, Lock, Eye, EyeOff, User } from 'lucide-react';
import { getEmployeeRoleLabel, getRoleHomePath, type EmployeeLoginRole } from '@/lib/auth';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Brand, Button, Input } from '@/components/ui';

type LoginTab = 'member' | 'employee';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginAsEmployee, loading } = useAuthStore();
  const [tab, setTab] = useState<LoginTab>('member');
  const [employeeRole, setEmployeeRole] = useState<EmployeeLoginRole>('trainer');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 11);
    if (cleaned.length <= 3) setPhone(cleaned);
    else if (cleaned.length <= 7) setPhone(`${cleaned.slice(0, 3)}-${cleaned.slice(3)}`);
    else setPhone(`${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'member') {
      if (!phone || !password) {
        toast.error('전화번호와 비밀번호를 입력하세요.');
        return;
      }
      const { error } = await login(phone, password);
      if (error) toast.error(error);
      else {
        toast.success('로그인 성공!');
        navigate('/', { replace: true });
      }
    } else {
      if (!username || !password) {
        toast.error('아이디와 비밀번호를 입력하세요.');
        return;
      }
      const { error, role } = await loginAsEmployee(username, password, employeeRole);
      if (error) toast.error(error);
      else {
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
      {/* 상단 브랜드 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-safe-top">
        <div className="flex flex-col items-center gap-6">
          <Brand size="xl" />
          <p className="text-body text-content-secondary">
            {tab === 'member' ? '회원 전용 앱' : `${getEmployeeRoleLabel(employeeRole)} 직원 로그인`}
          </p>
        </div>
      </div>

      {/* 로그인 폼 */}
      <div className="px-6 pb-10">
        {/* 탭 전환 */}
        <div className="flex mb-6 bg-surface-secondary rounded-card p-1">
          <button
            type="button"
            onClick={() => handleTabChange('member')}
            className={cn(
              'flex-1 py-2.5 rounded-button text-body-sm font-medium transition-colors ease-out-soft',
              tab === 'member' ? 'bg-surface text-content shadow-card-soft' : 'text-content-tertiary'
            )}
          >
            회원 로그인
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('employee')}
            className={cn(
              'flex-1 py-2.5 rounded-button text-body-sm font-medium transition-colors ease-out-soft',
              tab === 'employee' ? 'bg-surface text-content shadow-card-soft' : 'text-content-tertiary'
            )}
          >
            직원 로그인
          </button>
        </div>

        {tab === 'employee' && (
          <div className="mb-4">
            <p className="mb-2 text-caption font-semibold text-content-tertiary">직원 유형</p>
            <div className="grid grid-cols-3 gap-2">
              {(['trainer', 'fc', 'staff'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setEmployeeRole(role)}
                  className={cn(
                    'rounded-button border px-3 py-3 text-body-sm font-medium transition-colors ease-out-soft',
                    employeeRole === role
                      ? 'border-primary bg-primary-light text-primary'
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
          {tab === 'member' ? (
            <Input
              type="tel"
              size="lg"
              placeholder="전화번호"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              leftIcon={<Phone className="w-5 h-5" />}
              autoComplete="tel"
            />
          ) : (
            <Input
              type="text"
              size="lg"
              placeholder="아이디"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              leftIcon={<User className="w-5 h-5" />}
              autoComplete="username"
            />
          )}

          <Input
            type={showPassword ? 'text' : 'password'}
            size="lg"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-5 h-5" />}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? '비밀번호 숨김' : '비밀번호 표시'}
                className="text-content-tertiary"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            }
            autoComplete="current-password"
          />

          <Button type="submit" size="xl" fullWidth loading={loading}>
            로그인
          </Button>
        </form>

        {tab === 'member' && (
          <div className="mt-6 text-center">
            <Link to="/register" className="text-body-sm text-primary font-medium">
              아직 회원이 아니신가요? 앱 연동하기
            </Link>
          </div>
        )}

        <div className="mt-8 rounded-card bg-surface-secondary p-4">
          <p className="text-caption font-semibold text-content-tertiary">직원 화면 미리보기</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              to="/trainer?preview=1&role=trainer"
              className="rounded-button bg-surface px-3 py-3 text-center text-body-sm font-medium text-content-secondary shadow-card-soft"
            >
              Trainer
            </Link>
            <Link
              to="/trainer?preview=1&role=golf_trainer"
              className="rounded-button bg-surface px-3 py-3 text-center text-body-sm font-medium text-content-secondary shadow-card-soft"
            >
              Golf Trainer
            </Link>
            <Link
              to="/fc?preview=1&role=fc"
              className="rounded-button bg-surface px-3 py-3 text-center text-body-sm font-medium text-content-secondary shadow-card-soft"
            >
              FC Preview
            </Link>
            <Link
              to="/staff?preview=1&role=staff"
              className="rounded-button bg-surface px-3 py-3 text-center text-body-sm font-medium text-content-secondary shadow-card-soft"
            >
              Staff Preview
            </Link>
          </div>
          <p className="mt-3 text-micro leading-5 text-content-tertiary">
            관리자 권한은 별도 preview role로 섞지 않고, 실제 로그인 시 트레이너 영역 접근 권한으로만 처리합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
