import { useEffect, useState } from 'react';
import { ChevronRight, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import appPackage from '../../../package.json';
import {
  getInitialRoleSettings,
  getMockProfile,
  getRoleSettings,
  updateRoleSettings,
  type NotificationRole,
} from '@/lib/mockOperations';
import { useAuthStore } from '@/stores/authStore';
import { PageHeader, Card, Badge, Button } from '@/components/ui';

type RoleSettingsFieldKey =
  | 'pushEnabled'
  | 'systemEnabled'
  | 'attendanceEnabled'
  | 'reservationEnabled'
  | 'consultationEnabled'
  | 'expiryEnabled';

interface RoleSettingsScreenProps {
  role: NotificationRole;
  title: string;
  screenId: string;
  fields: Array<{ key: RoleSettingsFieldKey; label: string; description?: string }>;
}

export default function RoleSettingsScreen({ role, title, screenId, fields }: RoleSettingsScreenProps) {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const trainer = useAuthStore((state) => state.trainer);
  const mockProfile = getMockProfile(role === 'trainer' ? 'trainer' : role);
  const [settings, setSettings] = useState(() => getInitialRoleSettings(role));
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setSettings(getRoleSettings(role));
  }, [role]);

  const profile = {
    name: trainer?.staffName || trainer?.name || mockProfile.name,
    title: role === 'fc' ? 'FC' : role === 'staff' ? '스태프' : '트레이너',
    branch: trainer ? `지점 ID ${trainer.branchId}` : mockProfile.branch,
    subtitle: mockProfile.subtitle,
    email: trainer?.username ? `${trainer.username}@spogym.local` : mockProfile.email,
  };

  const toggle = (key: RoleSettingsFieldKey) => {
    const nextValue = !settings[key];
    updateRoleSettings(role, { [key]: nextValue });
    setSettings((current) => ({ ...current, [key]: nextValue }));
    toast.success('설정을 저장했습니다.');
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      toast.success('로그아웃 되었습니다.');
      navigate('/login', { replace: true });
    } catch {
      toast.error('로그아웃에 실패했습니다.');
    } finally {
      setIsLoggingOut(false);
      setLogoutConfirmOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <PageHeader showBack={false} title={title} subtitle={screenId} />

      <div className="px-5 py-4 pb-24 space-y-4">
        <Card variant="elevated" padding="md">
          <p className="text-body font-semibold">{profile.name}</p>
          <p className="mt-1 text-caption text-content-secondary">{profile.title} · {profile.branch}</p>
          <p className="mt-2 text-body text-content-tertiary">{profile.subtitle}</p>
        </Card>

        <section className="space-y-3">
          <SectionTitle>알림 설정</SectionTitle>
          {fields.map((field) => (
            <Card
              key={field.key}
              variant="elevated"
              padding="md"
              interactive
              onClick={() => toggle(field.key)}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-body font-medium">{field.label}</p>
                  {field.description ? (
                    <p className="mt-1 text-caption text-content-tertiary">{field.description}</p>
                  ) : null}
                </div>
                <Badge
                  tone={settings[field.key] ? 'primary' : 'neutral'}
                  variant="soft"
                >
                  {settings[field.key] ? 'ON' : 'OFF'}
                </Badge>
              </div>
            </Card>
          ))}
        </section>

        <section className="space-y-3">
          <SectionTitle>계정 정보</SectionTitle>
          <InfoRow label="이름" value={profile.name} />
          <InfoRow label="이메일" value={profile.email} />
        </section>

        <section className="space-y-3">
          <SectionTitle>앱 정보</SectionTitle>
          <InfoRow label="버전 정보" value={appPackage.version} />
          <ActionRow label="이용약관" onClick={() => navigate('/legal')} />
          <ActionRow label="개인정보처리방침" onClick={() => navigate('/legal?tab=privacy')} />
        </section>

        <Card
          variant="elevated"
          padding="md"
          interactive
          onClick={() => setLogoutConfirmOpen(true)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LogOut className="h-4 w-4 text-state-error" />
              <span className="text-body font-medium text-state-error">로그아웃</span>
            </div>
            <span className="text-caption font-semibold text-state-error">확인</span>
          </div>
        </Card>
      </div>

      {logoutConfirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
          <button
            type="button"
            aria-label="로그아웃 확인 닫기"
            onClick={() => !isLoggingOut && setLogoutConfirmOpen(false)}
            className="absolute inset-0"
          />
          <div className="relative z-10 w-full max-w-sm rounded-card-lg bg-surface p-5 shadow-card-elevated">
            <p className="text-body-lg font-semibold">로그아웃할까요?</p>
            <p className="mt-2 text-body text-content-secondary">현재 기기에서 로그인 세션이 종료됩니다.</p>
            <div className="mt-5 flex gap-2">
              <Button
                variant="tertiary"
                size="lg"
                fullWidth
                disabled={isLoggingOut}
                onClick={() => setLogoutConfirmOpen(false)}
              >
                취소
              </Button>
              <Button
                variant="danger"
                size="lg"
                fullWidth
                disabled={isLoggingOut}
                loading={isLoggingOut}
                onClick={handleLogout}
              >
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <p className="px-1 text-caption font-semibold tracking-[0.08em] text-content-tertiary">{children}</p>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Card variant="elevated" padding="md">
      <p className="text-caption text-content-tertiary">{label}</p>
      <p className="mt-1 text-body font-medium">{value}</p>
    </Card>
  );
}

function ActionRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Card variant="elevated" padding="md" interactive onClick={onClick}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-body font-medium">{label}</span>
        <ChevronRight className="h-4 w-4 text-content-tertiary" />
      </div>
    </Card>
  );
}
