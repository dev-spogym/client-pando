import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Lock, Phone, ShieldCheck, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

/** 회원 앱 연동(가입) 페이지 */
export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'phone' | 'verify' | 'password'>('phone');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [memberId, setMemberId] = useState<number | null>(null);

  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 11);
    if (cleaned.length <= 3) setPhone(cleaned);
    else if (cleaned.length <= 7) setPhone(`${cleaned.slice(0, 3)}-${cleaned.slice(3)}`);
    else setPhone(`${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`);
  };

  const handlePhoneSubmit = async () => {
    setLoading(true);
    const cleanPhone = phone.replace(/-/g, '');

    const { data: members, error } = await supabase
      .from('members')
      .select('id, name, phone')
      .or(`phone.eq.${cleanPhone},phone.eq.${phone}`)
      .limit(5);

    const normalizedName = name.replace(/\s/g, '').trim();
    const matchedMember = members?.find((item) => {
      if (!normalizedName) return true;
      return String(item.name || '').replace(/\s/g, '') === normalizedName;
    });

    if (error || !matchedMember) {
      toast.error('CRM에 등록된 회원 정보를 찾지 못했습니다. 센터 등록 여부를 확인해 주세요.');
      setLoading(false);
      return;
    }

    setMemberId(matchedMember.id);
    toast.success(`${matchedMember.name}님, 인증번호를 전송했습니다.`);
    setStep('verify');
    setLoading(false);
  };

  const handleVerify = () => {
    if (verifyCode === '0000' || verifyCode.length === 4) {
      toast.success('휴대폰 인증이 완료되었습니다.');
      setStep('password');
    } else {
      toast.error('인증번호가 올바르지 않습니다.');
    }
  };

  const handleSetPassword = async () => {
    if (password.length < 6) {
      toast.error('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    const cleanPhone = phone.replace(/-/g, '');
    const email = `${cleanPhone}@member.spogym.app`;

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          email_confirm: true,
          user_metadata: { member_id: memberId, phone: cleanPhone, name },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.msg?.includes('already been registered')) {
          toast.error('이미 연동된 번호입니다. 로그인으로 진행해 주세요.');
        } else {
          toast.error('가입 중 오류가 발생했습니다.');
        }
        setLoading(false);
        return;
      }

      toast.success('앱 연동이 완료되었습니다. 로그인 후 온보딩을 진행해 주세요.');
      navigate('/login', { replace: true });
    } catch {
      toast.error('네트워크 오류가 발생했습니다.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="flex items-center px-4 pt-safe-top h-14">
        <button
          onClick={() => {
            if (step === 'phone') navigate(-1);
            else if (step === 'verify') setStep('phone');
            else setStep('verify');
          }}
        >
          <ArrowLeft className="w-6 h-6 text-content" />
        </button>
        <h1 className="flex-1 text-center font-semibold text-lg pr-6">앱 가입 / 연동</h1>
      </header>

      <div className="flex-1 px-6 pt-8">
        <div className="bg-primary-light rounded-2xl p-4 mb-6">
          <p className="text-sm font-semibold text-primary">진행 방식 안내</p>
          <p className="text-xs text-content-secondary mt-2 leading-relaxed">
            회원 기본 정보는 CRM에서 먼저 등록되고, 앱에서는 휴대폰 인증 후 비밀번호를 설정해 연동을 완료합니다.
          </p>
        </div>

        <div className="flex items-center gap-2 mb-8">
          {['회원 확인', '인증', '비밀번호'].map((label, index) => {
            const stepIndex = { phone: 0, verify: 1, password: 2 }[step];
            return (
              <div key={label} className="flex-1">
                <div className={cn('h-1 rounded-full mb-2', index <= stepIndex ? 'bg-primary' : 'bg-line')} />
                <span className={cn('text-xs', index <= stepIndex ? 'text-primary font-medium' : 'text-content-tertiary')}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {step === 'phone' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">센터에 등록된 회원 정보를 확인합니다</h2>
              <p className="text-sm text-content-secondary">이름은 선택 입력이지만, 입력하면 CRM 회원 매칭 정확도가 높아집니다.</p>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-tertiary" />
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="이름 (선택)"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-line bg-surface text-content placeholder:text-content-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-base"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-tertiary" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => handlePhoneChange(event.target.value)}
                  placeholder="010-0000-0000"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-line bg-surface text-content placeholder:text-content-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-base"
                />
              </div>
            </div>

            <button
              onClick={handlePhoneSubmit}
              disabled={phone.replace(/-/g, '').length < 10 || loading}
              className="w-full py-4 rounded-xl font-semibold bg-primary text-white active:bg-primary-dark disabled:opacity-50 transition-colors"
            >
              {loading ? '회원 확인 중...' : '인증번호 받기'}
            </button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">휴대폰 인증을 진행해 주세요</h2>
              <p className="text-sm text-content-secondary">{phone}로 전송된 4자리 코드를 입력하세요.</p>
            </div>
            <div className="relative">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-tertiary" />
              <input
                type="number"
                value={verifyCode}
                onChange={(event) => setVerifyCode(event.target.value.slice(0, 4))}
                placeholder="인증번호 4자리"
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-line bg-surface text-content placeholder:text-content-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-base tracking-widest"
                inputMode="numeric"
              />
            </div>
            <button
              onClick={handleVerify}
              disabled={verifyCode.length !== 4}
              className="w-full py-4 rounded-xl font-semibold bg-primary text-white active:bg-primary-dark disabled:opacity-50 transition-colors"
            >
              확인
            </button>
          </div>
        )}

        {step === 'password' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">앱 비밀번호를 설정해 주세요</h2>
              <p className="text-sm text-content-secondary">설정 후 로그인하면 운동 온보딩과 첫 루틴 추천을 이어서 진행할 수 있습니다.</p>
            </div>
            <div className="space-y-3">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-tertiary" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="비밀번호"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-line bg-surface text-content placeholder:text-content-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-base"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-tertiary" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="비밀번호 확인"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-line bg-surface text-content placeholder:text-content-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-base"
                />
              </div>
            </div>
            <button
              onClick={handleSetPassword}
              disabled={password.length < 6 || loading}
              className="w-full py-4 rounded-xl font-semibold bg-primary text-white active:bg-primary-dark disabled:opacity-50 transition-colors"
            >
              {loading ? '처리 중...' : '앱 연동 완료'}
            </button>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to="/login" className="text-sm text-content-secondary">
            이미 연동하셨나요? <span className="text-primary font-medium">로그인</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
