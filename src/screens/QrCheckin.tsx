import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, RefreshCw, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { isPreviewMode } from '@/lib/preview';
import { cn } from '@/lib/utils';

/** QR 체크인 페이지 - 60초 유효 QR 생성 */
export default function QrCheckin() {
  const navigate = useNavigate();
  const { member } = useAuthStore();
  const [qrValue, setQrValue] = useState('');
  const [remainSeconds, setRemainSeconds] = useState(60);
  const [isExpired, setIsExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  /** 서버 서명 QR 토큰 발급 */
  const generateQr = useCallback(async () => {
    if (!member) return;
    setIsLoading(true);
    setErrorMessage('');

    // preview 모드: 서버/DB 없이 클라이언트에서 mock 토큰을 생성한다.
    if (isPreviewMode()) {
      const mockToken = `preview-qr.${member.id}.${Date.now()}`;
      setQrValue(mockToken);
      setRemainSeconds(60);
      setIsExpired(false);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/qr-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: member.id }),
      });
      const result = await response.json();

      if (!response.ok || !result.token) {
        throw new Error(result.error ?? 'qr_token_failed');
      }

      setQrValue(result.token);
      setRemainSeconds(60);
      setIsExpired(false);
    } catch {
      setQrValue('');
      setIsExpired(true);
      setErrorMessage('QR 발급에 실패했습니다. 네트워크 상태를 확인해 주세요.');
    } finally {
      setIsLoading(false);
    }
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
                  disabled={isLoading}
                  className="bg-primary text-white px-4 py-2 rounded-button font-medium flex items-center gap-2 shadow-card-elevated"
                >
                  <RefreshCw className="w-5 h-5" />
                  {isLoading ? '발급 중' : '갱신하기'}
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
                {errorMessage || (isExpired ? '만료됨 - 자동 갱신 중...' : `${remainSeconds}초 후 자동 갱신`)}
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
