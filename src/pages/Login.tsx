import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/** 로그인 페이지 */
export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();
  const [phone, setPhone] = useState('');
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
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* 상단 로고 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-safe-top">
        <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg">
          <span className="text-white text-2xl font-bold">스포짐</span>
        </div>
        <h1 className="text-2xl font-bold text-content mb-1">스포짐</h1>
        <p className="text-content-secondary text-sm">회원 전용 앱</p>
      </div>

      {/* 로그인 폼 */}
      <div className="px-6 pb-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 전화번호 입력 */}
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
                'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary',
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
              'bg-primary text-white',
              'active:bg-primary-dark transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* 하단 링크 */}
        <div className="mt-6 text-center">
          <Link to="/register" className="text-sm text-primary font-medium">
            아직 회원이 아니신가요? 앱 연동하기
          </Link>
        </div>
      </div>
    </div>
  );
}
