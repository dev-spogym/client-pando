'use client';

import { useNavigate } from 'react-router-dom';
import { Clock, ExternalLink, Phone, Wrench } from 'lucide-react';
import { Button } from '@/components/ui';

interface MaintenanceWindow {
  /** 점검 시작 (YYYY-MM-DD HH:mm) */
  startLabel: string;
  /** 점검 종료 */
  endLabel: string;
}

interface ChannelLink {
  key: string;
  label: string;
  href: string;
}

const DEFAULT_WINDOW: MaintenanceWindow = {
  startLabel: '2026-04-29 (수) 02:00',
  endLabel: '2026-04-29 (수) 06:00',
};

const CHANNELS: ChannelLink[] = [
  {
    key: 'instagram',
    label: '공식 인스타그램',
    href: 'https://instagram.com/bodyswitch.official',
  },
  {
    key: 'naver',
    label: '공식 블로그',
    href: 'https://blog.naver.com/bodyswitch',
  },
];

const SUPPORT_TEL = '15880000';

/** 서버 점검 안내 페이지 */
export default function ServerMaintenance({
  window: maintenanceWindow = DEFAULT_WINDOW,
}: { window?: MaintenanceWindow } = {}) {
  const navigate = useNavigate();

  const handleSupport = () => {
    if (typeof window !== 'undefined') {
      window.location.href = `tel:${SUPPORT_TEL}`;
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col px-6 py-8">
      <div className="flex-1 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-state-warning/10 flex items-center justify-center mt-8 mb-6">
          <Wrench className="w-11 h-11 text-state-warning" strokeWidth={2.2} />
        </div>

        <h2 className="text-h1 text-content">
          서비스 점검 중이에요
        </h2>
        <p className="text-body text-content-secondary mt-3 leading-relaxed">
          더 나은 서비스를 위해 점검을 진행하고 있어요.
          <br />
          이용에 불편을 드려 죄송합니다.
        </p>

        {/* 점검 시간 카드 */}
        <div className="w-full mt-8 bg-surface-secondary rounded-card-lg p-5 text-left">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-state-warning" />
            <span className="text-body-sm font-semibold text-content">
              점검 시간
            </span>
          </div>
          <div className="space-y-2">
            <Row label="시작" value={maintenanceWindow.startLabel} />
            <Row label="종료" value={maintenanceWindow.endLabel} />
          </div>
        </div>

        {/* 점검 내용 */}
        <div className="w-full mt-3 bg-surface-secondary rounded-card-lg p-5 text-left">
          <p className="text-body-sm font-semibold text-content mb-2">
            점검 내용
          </p>
          <ul className="space-y-1.5 text-body-sm text-content-secondary">
            <li className="flex gap-2">
              <span className="text-primary">·</span>
              결제 시스템 안정화 작업
            </li>
            <li className="flex gap-2">
              <span className="text-primary">·</span>
              회원 알림 채널 업데이트
            </li>
            <li className="flex gap-2">
              <span className="text-primary">·</span>
              데이터베이스 점검
            </li>
          </ul>
        </div>

        {/* 공식 채널 */}
        <div className="w-full mt-5">
          <p className="text-caption text-content-tertiary mb-2 text-left">
            진행 상황은 공식 채널에서 안내드릴게요
          </p>
          <div className="space-y-2">
            {CHANNELS.map((channel) => (
              <a
                key={channel.key}
                href={channel.href}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center justify-between bg-surface border border-line rounded-card p-4 text-left active:bg-surface-secondary"
              >
                <span className="text-body text-content">{channel.label}</span>
                <ExternalLink className="w-4 h-4 text-content-tertiary" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          leftIcon={<Phone className="w-4 h-4" />}
          onClick={handleSupport}
        >
          고객센터 문의
        </Button>
        <Button
          variant="ghost"
          size="md"
          fullWidth
          onClick={() => navigate('/faq')}
        >
          자주 묻는 질문 보기
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-caption text-content-tertiary">{label}</span>
      <span className="text-body-sm font-medium text-content tabular-nums">
        {value}
      </span>
    </div>
  );
}
