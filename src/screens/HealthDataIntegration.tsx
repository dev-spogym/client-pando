import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, HeartPulse, Link2, RefreshCw, ShieldCheck, Unplug } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import {
  connectHealthData,
  disconnectHealthData,
  loadHealthDataState,
  setHealthDataPermissionStatus,
  syncHealthData,
  type HealthDataConnectionStatus,
  type HealthDataState,
} from '@/lib/memberExperience';
import { Badge, Button, Card, ConfirmDialog, PageHeader } from '@/components/ui';

const STATUS_META: Record<
  HealthDataConnectionStatus,
  { label: string; tone: 'primary' | 'warning' | 'neutral' | 'error'; description: string }
> = {
  connected: {
    label: '연결됨',
    tone: 'primary',
    description: '최근 활동 데이터가 정상적으로 동기화되고 있습니다.',
  },
  partial: {
    label: '부분 권한',
    tone: 'warning',
    description: '허용된 항목만 수집 중입니다. 누락된 권한을 다시 설정할 수 있습니다.',
  },
  delayed: {
    label: '동기화 지연',
    tone: 'warning',
    description: '72시간 이상 새 활동 데이터가 수신되지 않았습니다.',
  },
  disconnected: {
    label: '미연결',
    tone: 'neutral',
    description: '아직 Health Connect 연동이 시작되지 않았습니다.',
  },
  failed: {
    label: '동기화 실패',
    tone: 'error',
    description: '권한 또는 네트워크 문제로 최근 동기화에 실패했습니다.',
  },
  connecting: {
    label: '권한 요청 중',
    tone: 'neutral',
    description: 'OS 권한 허용 후 앱으로 다시 돌아오세요.',
  },
  unsupported: {
    label: '미지원',
    tone: 'neutral',
    description: '현재 기기에서는 Health Connect를 지원하지 않습니다.',
  },
};

const EXCLUDED_DATA = ['심박수', '수면', '체온', '혈당', '의료 데이터'];

/** 건강 데이터 연동 */
export default function HealthDataIntegration() {
  const navigate = useNavigate();
  const { member } = useAuthStore();
  const [state, setState] = useState<HealthDataState | null>(null);
  const [disconnectOpen, setDisconnectOpen] = useState(false);

  useEffect(() => {
    if (!member) return;
    setState(loadHealthDataState(member.id));
  }, [member]);

  const permissionLabel = useMemo(() => {
    if (!state) return '';
    if (state.permissionStatus === 'granted') return '모두 허용';
    if (state.permissionStatus === 'partial') return '일부 허용';
    return '거부';
  }, [state]);

  if (!member || !state) return null;

  const meta = STATUS_META[state.status];

  const refreshState = (next: HealthDataState) => {
    setState(next);
  };

  const handleConnect = () => {
    const next = connectHealthData(member.id);
    refreshState(next);
    toast.success(next.supported ? '건강 데이터 연동이 시작되었습니다.' : '현재 기기에서는 지원하지 않습니다.');
  };

  const handleSync = () => {
    const next = syncHealthData(member.id);
    refreshState(next);
    toast.success('최근 30일 활동 요약을 다시 불러왔어요.');
  };

  const handlePermission = (mode: HealthDataState['permissionStatus']) => {
    const next = setHealthDataPermissionStatus(member.id, mode);
    refreshState(next);
    toast.success(
      mode === 'granted'
        ? '권한 상태를 모두 허용으로 반영했습니다.'
        : mode === 'partial'
          ? '부분 권한 상태로 반영했습니다.'
          : '권한 거부 상태로 반영했습니다.'
    );
  };

  const handleDisconnect = () => {
    const next = disconnectHealthData(member.id);
    refreshState(next);
    setDisconnectOpen(false);
    toast.success('신규 수집이 중단되었어요. 기존 요약은 유지돼요.');
  };

  const connected = state.status === 'connected' || state.status === 'partial' || state.status === 'delayed';

  return (
    <div className="min-h-screen bg-surface-secondary">
      <PageHeader title="건강 데이터 연동" onBack={() => navigate(-1)} />

      <div className="px-4 py-4 space-y-4 pb-24">
        <Card variant="soft" padding="lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-card bg-primary-light text-primary">
                <HeartPulse className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-body font-semibold">연동 상태</p>
                  <Badge tone={meta.tone} variant="soft">{meta.label}</Badge>
                </div>
                <p className="mt-1 text-body-sm text-content-secondary">{meta.description}</p>
                <div className="mt-3 space-y-1 text-caption text-content-tertiary">
                  <p>최근 동기화: {state.lastSyncedAt ? new Date(state.lastSyncedAt).toLocaleString('ko-KR') : '없음'}</p>
                  <p>최근 결과: {state.lastSyncResult === 'success' ? '정상' : state.lastSyncResult === 'partial' ? '일부 누락' : state.lastSyncResult === 'failed' ? '실패' : '없음'}</p>
                  <p>소스 앱: {state.sourceApp || '미연결'}</p>
                </div>
              </div>
            </div>
            {!connected && state.supported ? (
              <Button size="sm" onClick={handleConnect}>
                연동 시작
              </Button>
            ) : null}
          </div>
        </Card>

        <Card variant="soft" padding="lg">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="h-5 w-5 text-primary" />
            <h2 className="text-body font-semibold">수집 데이터 범위</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SummaryMetric label="걸음수 7일" value={`${state.summary.steps7d.toLocaleString()}보`} />
            <SummaryMetric label="걸음수 30일" value={`${state.summary.steps30d.toLocaleString()}보`} />
            <SummaryMetric label="이동 거리" value={`${state.summary.distanceKm7d.toFixed(1)}km`} />
            <SummaryMetric label="활동 kcal" value={`${state.summary.calories7d.toLocaleString()}kcal`} />
            <SummaryMetric label="운동 세션" value={`${state.summary.workoutSessions30d}회`} />
            <SummaryMetric label="운동일수" value={`${state.summary.workoutDays30d}일`} />
          </div>
        </Card>

        <Card variant="soft" padding="lg">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-body font-semibold">권한 / 동의</h2>
          </div>

          <div className="space-y-3">
            <div className="rounded-card bg-surface-secondary p-4">
              <p className="text-body-sm font-medium">서비스 내 활용 동의</p>
              <p className="mt-1 text-body-sm text-content-secondary">
                건강 요약, 상담, 개인화 추천에 필요한 최소 활동 데이터만 연동합니다.
              </p>
              <div className="mt-2">
                <Badge tone={state.serviceConsent ? 'primary' : 'neutral'} variant="soft">
                  {state.serviceConsent ? '동의됨' : '미동의'}
                </Badge>
              </div>
            </div>

            <div className="rounded-card bg-surface-secondary p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-body-sm font-medium">OS 권한 상태</p>
                  <p className="mt-1 text-body-sm text-content-secondary">{permissionLabel}</p>
                </div>
                <Badge tone={state.permissionStatus === 'granted' ? 'primary' : state.permissionStatus === 'partial' ? 'warning' : 'error'} variant="soft">
                  {permissionLabel}
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => handlePermission('granted')}>
                  모두 허용
                </Button>
                <Button size="sm" variant="outline" onClick={() => handlePermission('partial')}>
                  일부 허용
                </Button>
                <Button size="sm" variant="outline" onClick={() => handlePermission('denied')}>
                  거부
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card variant="soft" padding="lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-state-warning" />
            <h2 className="text-body font-semibold">연동 제외 데이터</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {EXCLUDED_DATA.map((item) => (
              <span key={item} className="rounded-pill bg-surface-secondary px-3 py-1.5 text-caption text-content-secondary">
                {item}
              </span>
            ))}
          </div>
          <p className="mt-3 text-body-sm text-content-secondary">
            운영·상담에 필요한 최소 활동 데이터만 연동해요.
          </p>
        </Card>

        <Card variant="soft" padding="lg">
          <h2 className="text-body font-semibold">도움말</h2>
          <div className="mt-3 space-y-2 text-body-sm text-content-secondary">
            <p>지원 기기: Android 하이브리드 앱</p>
            <p>iOS는 센터 측정 데이터만 조회할 수 있습니다.</p>
            <p>마케팅 동의와 별개이며, 언제든 연동을 해제할 수 있습니다.</p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            fullWidth
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={handleSync}
            disabled={!state.supported || state.status === 'unsupported'}
          >
            지금 동기화
          </Button>
          <Button
            variant="outline"
            fullWidth
            leftIcon={<CheckCircle2 className="h-4 w-4" />}
            onClick={() => handlePermission(state.permissionStatus === 'partial' ? 'granted' : 'partial')}
            disabled={!state.supported || state.status === 'unsupported'}
          >
            권한 다시 설정
          </Button>
        </div>

        <Button
          variant="danger"
          fullWidth
          leftIcon={<Unplug className="h-4 w-4" />}
          onClick={() => setDisconnectOpen(true)}
          disabled={!connected}
        >
          연동 해제
        </Button>
      </div>

      <ConfirmDialog
        open={disconnectOpen}
        onClose={() => setDisconnectOpen(false)}
        title="건강 데이터 연동을 해제할까요?"
        description="새로운 수집은 중단되며, 기존 요약 데이터는 마지막 동기화 시점 기준으로 유지됩니다."
        confirmLabel="연동 해제"
        variant="danger"
        onConfirm={handleDisconnect}
      />
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card bg-surface-secondary p-3">
      <p className="text-caption text-content-tertiary">{label}</p>
      <p className="mt-1 text-body font-semibold">{value}</p>
    </div>
  );
}
