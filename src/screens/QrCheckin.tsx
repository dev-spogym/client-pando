import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, RefreshCw, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

/** QR 체크인 페이지 - 60초 유효 QR 생성 */
export default function QrCheckin() {
  const navigate = useNavigate();
  const { member } = useAuthStore();
  const [qrValue, setQrValue] = useState('');
  const [remainSeconds, setRemainSeconds] = useState(60);
  const [isExpired, setIsExpired] = useState(false);

  /** QR 값 생성 (회원ID + 타임스탬프 + 간단한 해시) */
  const generateQr = useCallback(() => {
    if (!member) return;
    const timestamp = Date.now();
    // 간단한 HMAC 시뮬레이션 (실제로는 서버사이드 HMAC 사용 권장)
    const payload = `${member.id}:${timestamp}`;
    const hash = simpleHash(payload);
    const qrData = JSON.stringify({
      memberId: member.id,
      memberName: member.name,
      branchId: member.branchId,
      timestamp,
      hash,
      type: 'CHECKIN',
    });
    setQrValue(qrData);
    setRemainSeconds(60);
    setIsExpired(false);
  }, [member]);

  // 초기 QR 생성
  useEffect(() => {
    generateQr();
  }, [generateQr]);

  // 카운트다운 타이머
  useEffect(() => {
    if (isExpired) return;
    const timer = setInterval(() => {
      setRemainSeconds((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isExpired]);

  // 만료 시 자동 갱신
  useEffect(() => {
    if (isExpired) {
      const autoRefresh = setTimeout(() => {
        generateQr();
      }, 1000);
      return () => clearTimeout(autoRefresh);
    }
  }, [isExpired, generateQr]);

  if (!member) return null;

  const progressPercent = (remainSeconds / 60) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-primary-dark flex flex-col">
      {/* 헤더 */}
      <header className="flex items-center px-4 pt-safe-top h-14">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="flex-1 text-center font-semibold text-h4 text-white pr-6">QR 체크인</h1>
      </header>

      {/* QR 표시 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="qr-container flex flex-col items-center w-full max-w-xs">
          {/* 회원 정보 */}
          <div className="mb-4 text-center">
            <p className="text-h4 font-bold text-white">{member.name}</p>
            <p className="text-body text-white/70">회원번호 #{String(member.id).padStart(6, '0')}</p>
          </div>

          {/* QR 코드 */}
          <div className={cn(
            'relative p-4 bg-white rounded-card-lg shadow-card-elevated',
            isExpired && 'opacity-30'
          )}>
            <QRCodeSVG
              value={qrValue || 'loading'}
              size={220}
              bgColor="#ffffff"
              fgColor="#1E293B"
              level="H"
              includeMargin
            />
            {isExpired && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={generateQr}
                  className="bg-primary text-white px-4 py-2 rounded-button font-medium flex items-center gap-2 shadow-card-elevated"
                >
                  <RefreshCw className="w-5 h-5" />
                  갱신하기
                </button>
              </div>
            )}
          </div>

          {/* 타이머 */}
          <div className="w-full mt-6">
            {/* 진행 바 */}
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden mb-2">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-1000 ease-linear',
                  remainSeconds > 15 ? 'bg-white' : remainSeconds > 5 ? 'bg-state-warning' : 'bg-state-error'
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Shield className={cn(
                'w-4 h-4',
                remainSeconds > 15 ? 'text-white/70' : 'text-state-error'
              )} />
              <span className={cn(
                'text-body font-medium',
                remainSeconds > 15 ? 'text-white/70' : 'text-state-error'
              )}>
                {isExpired ? '만료됨 - 자동 갱신 중...' : `${remainSeconds}초 후 자동 갱신`}
              </span>
            </div>
          </div>
        </div>

        {/* 안내 텍스트 */}
        <p className="text-white/70 text-body mt-6 text-center px-4">
          키오스크 또는 프론트 데스크에서<br />QR코드를 스캔해주세요
        </p>
      </div>
    </div>
  );
}

/** 간단한 해시 함수 (실제 환경에서는 crypto-js 등 사용) */
function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
