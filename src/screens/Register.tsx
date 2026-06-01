import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Phone, ShieldCheck, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { Button, PageHeader } from '@/components/ui';

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
    // SMS 인증번호는 6자리 (기획 MA-002)
    if (!/^\d{6}$/.test(verifyCode)) {
      toast.error('인증번호 6자리를 정확히 입력해 주세요.');
      return;
    }
    toast.success('휴대폰 인증이 완료되었습니다.');
    setStep('password');
  };

  const handleSetPassword = async () => {
    // 비밀번호는 영문+숫자 조합 8자 이상 (기획 MA-002)
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      toast.error('비밀번호는 영문과 숫자를 포함해 8자 이상이어야 합니다.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    const cleanPhone = phone.replace(/-/g, '');
    const email = `${cleanPhone}@member.fitgenie.app`;

    try {
      const response = await fetch('/api/register-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          memberId,
          phone: cleanPhone,
          name,
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

      // 가입 완료 → 자동 로그인 후 신규 회원 환영(MA-900)으로 진입
      toast.success('앱 연동이 완료되었습니다. 환영합니다!');
      const { error: loginError } = await useAuthStore.getState().login(cleanPhone, password);
      navigate(loginError ? '/login' : '/onboarding-welcome', { replace: true });
    } catch {
      toast.error('네트워크 오류가 발생했습니다.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <PageHeader
        title="앱 가입 / 연동"
        showBack
        onBack={() => {
          if (step === 'phone') navigate(-1);
          else if (step === 'verify') setStep('phone');
          else setStep('verify');
        }}
        sticky={false}
      />

      <div className="flex-1 px-6 pt-8">
        <div className="bg-primary-light rounded-card p-4 mb-6">
          <p className="text-body font-semibold text-primary">진행 방식 안내</p>
          <p className="text-caption text-content-secondary mt-2 leading-relaxed">
            회원 기본 정보는 CRM에서 먼저 등록되고, 앱에서는 휴대폰 인증 후 비밀번호를 설정해 연동을 완료합니다.
          </p>
        </div>

        <div className="flex items-center gap-2 mb-8">
          {['회원 확인', '인증', '비밀번호'].map((label, index) => {
            const stepIndex = { phone: 0, verify: 1, password: 2 }[step];
            return (
              <div key={label} className="flex-1">
                <div className={cn('h-1 rounded-full mb-2', index <= stepIndex ? 'bg-primary' : 'bg-line')} />
                <span className={cn('text-caption', index <= stepIndex ? 'text-primary font-medium' : 'text-content-tertiary')}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {step === 'phone' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-h2 font-bold mb-2">센터에 등록된 회원 정보를 확인합니다</h2>
              <p className="text-body text-content-secondary">이름은 선택 입력이지만, 입력하면 CRM 회원 매칭 정확도가 높아집니다.</p>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-tertiary" />
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="이름 (선택)"
                  className="w-full pl-12 pr-4 py-4 rounded-input border border-line bg-surface text-content placeholder:text-content-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-lg"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-tertiary" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => handlePhoneChange(event.target.value)}
                  placeholder="010-0000-0000"
                  className="w-full pl-12 pr-4 py-4 rounded-input border border-line bg-surface text-content placeholder:text-content-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-lg"
                />
              </div>
            </div>

            <Button
              variant="primary"
              size="xl"
              fullWidth
              loading={loading}
              disabled={phone.replace(/-/g, '').length < 10}
              onClick={handlePhoneSubmit}
            >
              {loading ? '회원 확인 중...' : '인증번호 받기'}
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-h2 font-bold mb-2">휴대폰 인증을 진행해 주세요</h2>
              <p className="text-body text-content-secondary">{phone}로 전송된 6자리 코드를 입력하세요.</p>
            </div>
            <div className="relative">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-tertiary" />
              <input
                type="number"
                value={verifyCode}
                onChange={(event) => setVerifyCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="인증번호 6자리"
                className="w-full pl-12 pr-4 py-4 rounded-input border border-line bg-surface text-content placeholder:text-content-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-lg tracking-widest"
                inputMode="numeric"
              />
            </div>
            <Button
              variant="primary"
              size="xl"
              fullWidth
              disabled={verifyCode.length !== 4}
              onClick={handleVerify}
            >
              확인
            </Button>
          </div>
        )}

        {step === 'password' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-h2 font-bold mb-2">앱 비밀번호를 설정해 주세요</h2>
              <p className="text-body text-content-secondary">설정 후 로그인하면 운동 온보딩과 첫 루틴 추천을 이어서 진행할 수 있습니다.</p>
            </div>
            <div className="space-y-3">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-tertiary" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="비밀번호"
                  className="w-full pl-12 pr-4 py-4 rounded-input border border-line bg-surface text-content placeholder:text-content-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-lg"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-tertiary" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="비밀번호 확인"
                  className="w-full pl-12 pr-4 py-4 rounded-input border border-line bg-surface text-content placeholder:text-content-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-lg"
                />
              </div>
            </div>
            <Button
              variant="primary"
              size="xl"
              fullWidth
              loading={loading}
              disabled={password.length < 6}
              onClick={handleSetPassword}
            >
              {loading ? '처리 중...' : '앱 연동 완료'}
            </Button>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to="/login" className="text-body text-content-secondary">
            이미 연동하셨나요? <span className="text-primary font-medium">로그인</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
