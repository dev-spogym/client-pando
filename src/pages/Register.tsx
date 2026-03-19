import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Phone, Lock, User, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/** 회원 앱 연동(가입) 페이지 */
export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'phone' | 'verify' | 'password'>('phone');
  const [phone, setPhone] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [memberId, setMemberId] = useState<number | null>(null);

  /** 전화번호 자동 포맷 */
  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 11);
    if (cleaned.length <= 3) setPhone(cleaned);
    else if (cleaned.length <= 7) setPhone(`${cleaned.slice(0, 3)}-${cleaned.slice(3)}`);
    else setPhone(`${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`);
  };

  /** 1단계: 전화번호로 회원 확인 */
  const handlePhoneSubmit = async () => {
    setLoading(true);
    const cleanPhone = phone.replace(/-/g, '');

    // 회원 테이블에서 전화번호 확인
    const { data: member, error } = await supabase
      .from('members')
      .select('id, name, phone')
      .or(`phone.eq.${cleanPhone},phone.eq.${phone}`)
      .limit(1)
      .single();

    if (error || !member) {
      toast.error('등록된 회원 정보가 없습니다. 센터에 문의하세요.');
      setLoading(false);
      return;
    }

    setMemberId(member.id);
    toast.success(`${member.name}님, 인증번호를 전송했습니다.`);
    // 실제로는 SMS 발송 API 호출
    setStep('verify');
    setLoading(false);
  };

  /** 2단계: 인증번호 확인 (데모: 0000 허용) */
  const handleVerify = () => {
    if (verifyCode === '0000' || verifyCode.length === 4) {
      toast.success('인증 완료!');
      setStep('password');
    } else {
      toast.error('인증번호가 올바르지 않습니다.');
    }
  };

  /** 3단계: 비밀번호 설정 및 계정 생성 */
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

    // Supabase Auth 계정 생성
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { member_id: memberId, phone: cleanPhone },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('이미 가입된 번호입니다. 로그인 해주세요.');
      } else {
        toast.error('가입 중 오류가 발생했습니다.');
      }
      setLoading(false);
      return;
    }

    toast.success('가입 완료! 로그인 해주세요.');
    navigate('/login', { replace: true });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* 헤더 */}
      <header className="flex items-center px-4 pt-safe-top h-14">
        <button onClick={() => {
          if (step === 'phone') navigate(-1);
          else if (step === 'verify') setStep('phone');
          else setStep('verify');
        }}>
          <ArrowLeft className="w-6 h-6 text-content" />
        </button>
        <h1 className="flex-1 text-center font-semibold text-lg pr-6">앱 연동</h1>
      </header>

      <div className="flex-1 px-6 pt-8">
        {/* 단계 인디케이터 */}
        <div className="flex items-center gap-2 mb-8">
          {['전화번호', '인증', '비밀번호'].map((label, i) => {
            const stepIndex = { phone: 0, verify: 1, password: 2 }[step];
            return (
              <div key={label} className="flex-1">
                <div className={cn(
                  'h-1 rounded-full mb-2',
                  i <= stepIndex ? 'bg-primary' : 'bg-line'
                )} />
                <span className={cn(
                  'text-xs',
                  i <= stepIndex ? 'text-primary font-medium' : 'text-content-tertiary'
                )}>{label}</span>
              </div>
            );
          })}
        </div>

        {/* 1단계: 전화번호 입력 */}
        {step === 'phone' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">센터에 등록된 전화번호를<br />입력해주세요</h2>
              <p className="text-sm text-content-secondary">회원 등록 시 사용한 전화번호로 본인인증을 진행합니다.</p>
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-tertiary" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="010-0000-0000"
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-line bg-surface text-content placeholder:text-content-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-base"
              />
            </div>
            <button
              onClick={handlePhoneSubmit}
              disabled={phone.replace(/-/g, '').length < 10 || loading}
              className="w-full py-4 rounded-xl font-semibold bg-primary text-white active:bg-primary-dark disabled:opacity-50 transition-colors"
            >
              {loading ? '확인 중...' : '인증번호 받기'}
            </button>
          </div>
        )}

        {/* 2단계: 인증번호 입력 */}
        {step === 'verify' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">인증번호를 입력해주세요</h2>
              <p className="text-sm text-content-secondary">{phone}로 전송된 4자리 코드를 입력하세요.</p>
            </div>
            <div className="relative">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-tertiary" />
              <input
                type="number"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.slice(0, 4))}
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

        {/* 3단계: 비밀번호 설정 */}
        {step === 'password' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">비밀번호를 설정해주세요</h2>
              <p className="text-sm text-content-secondary">6자 이상 비밀번호를 설정하세요.</p>
            </div>
            <div className="space-y-3">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-tertiary" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-line bg-surface text-content placeholder:text-content-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-base"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-tertiary" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? '처리 중...' : '완료'}
            </button>
          </div>
        )}

        {/* 하단 로그인 링크 */}
        <div className="mt-8 text-center">
          <Link to="/login" className="text-sm text-content-secondary">
            이미 연동하셨나요? <span className="text-primary font-medium">로그인</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
