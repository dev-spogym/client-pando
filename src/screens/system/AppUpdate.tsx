import { ExternalLink, ShieldAlert, Sparkles } from 'lucide-react';
import { Button, Card, PageHeader } from '@/components/ui';

const UPDATE_TYPE: 'critical' | 'minor' = 'minor';

/** 앱 업데이트 안내 */
export default function AppUpdate() {
  const critical = UPDATE_TYPE === 'critical';

  const openStore = () => {
    if (typeof window !== 'undefined') {
      window.location.href = 'https://fitgenie.app';
    }
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <PageHeader title="앱 업데이트" showBack={!critical} />
      <div className="flex min-h-[calc(100vh-56px)] flex-col px-5 py-8">
        <div className="flex-1">
          <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-card-lg ${critical ? 'bg-state-error/10 text-state-error' : 'bg-primary-light text-primary'}`}>
            {critical ? <ShieldAlert className="h-10 w-10" /> : <Sparkles className="h-10 w-10" />}
          </div>
          <h1 className="text-h1 text-content">
            {critical ? '필수 업데이트가 필요해요' : '새 버전이 준비됐어요'}
          </h1>
          <p className="mt-3 text-body text-content-secondary">
            {critical
              ? '보안 패치와 치명 오류 수정이 포함되어 업데이트 전에는 앱을 이용할 수 없습니다.'
              : '기능 개선과 안정화가 포함되어 있습니다. 지금 업데이트하거나 나중에 다시 안내받을 수 있습니다.'}
          </p>

          <Card padding="lg" className="mt-6">
            <p className="text-body-sm font-semibold text-content">버전 정보</p>
            <div className="mt-3 space-y-2 text-body-sm text-content-secondary">
              <Row label="현재 버전" value="1.0.0" />
              <Row label="최신 버전" value="1.1.0" />
              <Row label="업데이트 유형" value={critical ? 'Critical' : 'Minor'} />
            </div>
          </Card>
        </div>

        <div className="space-y-2 pb-safe-bottom">
          <Button fullWidth size="lg" rightIcon={<ExternalLink className="h-4 w-4" />} onClick={openStore}>
            스토어로 이동
          </Button>
          {!critical && (
            <Button fullWidth size="lg" variant="ghost" onClick={() => history.back()}>
              나중에
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="font-medium text-content">{value}</span>
    </div>
  );
}
