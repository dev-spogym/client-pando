import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';

const DOCUMENTS = [
  {
    id: 'service',
    title: '서비스 이용약관',
    content: [
      '회원은 CRM에 등록된 본인 정보를 기반으로 앱을 연동해 이용합니다.',
      '예약, 결제, 리워드, 알림 기능은 센터 운영 정책에 따라 달라질 수 있습니다.',
      '허위 정보 입력, 대리 예약, 부정 이용이 확인되면 서비스 이용이 제한될 수 있습니다.',
    ],
  },
  {
    id: 'privacy',
    title: '개인정보 처리방침',
    content: [
      '이름, 연락처, 이용권, 예약, 결제 기록은 회원 서비스 제공을 위해 처리됩니다.',
      '체성분, FMS, 온보딩 정보는 개인화 서비스와 코치 피드백 제공에 사용됩니다.',
      '필수 보관 기간 이후에는 관련 법령과 센터 정책에 따라 파기 또는 비식별화됩니다.',
    ],
  },
  {
    id: 'marketing',
    title: '마케팅 정보 수신 안내',
    content: [
      '이벤트, 프로모션, 재등록 제안은 마케팅 수신 동의 여부에 따라 발송됩니다.',
      '마케팅 수신 거부 시 서비스 핵심 알림은 계속 수신될 수 있습니다.',
      '동의 상태는 설정 > 동의관리에서 언제든 변경할 수 있습니다.',
    ],
  },
] as const;

/** 약관 센터 */
export default function TermsCenter() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<(typeof DOCUMENTS)[number]['id']>(() => {
    const nextTab = searchParams.get('tab');
    return nextTab === 'privacy' || nextTab === 'marketing' ? nextTab : 'service';
  });

  useEffect(() => {
    const nextTab = searchParams.get('tab');
    setTab(nextTab === 'privacy' || nextTab === 'marketing' ? nextTab : 'service');
  }, [searchParams]);

  const document = DOCUMENTS.find((item) => item.id === tab)!;

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-surface sticky top-0 z-10 border-b border-line">
        <div className="flex items-center px-4 pt-safe-top h-14">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-content" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-lg">약관 / 정책</h1>
          <div className="w-6" />
        </div>

        <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
          {DOCUMENTS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setTab(item.id);
                const next = new URLSearchParams(searchParams);
                if (item.id === 'service') next.delete('tab');
                else next.set('tab', item.id);
                setSearchParams(next, { replace: true });
              }}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap',
                tab === item.id ? 'bg-primary text-white' : 'bg-surface-tertiary text-content-secondary'
              )}
            >
              {item.title}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 py-4">
        <div className="bg-surface rounded-card p-5 shadow-card">
          <h2 className="text-lg font-bold">{document.title}</h2>
          <div className="mt-4 space-y-3 text-sm text-content-secondary leading-relaxed">
            {document.content.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
