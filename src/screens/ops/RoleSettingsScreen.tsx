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
      <header className="bg-surface px-5 pt-safe-top pb-4 shadow-sm">
        <div className="pt-4">
          <p className="text-xs text-content-tertiary">{screenId}</p>
          <h1 className="text-lg font-bold">{title}</h1>
        </div>
      </header>

      <div className="px-5 py-4 pb-24 space-y-4">
        <section className="rounded-card bg-surface p-4 shadow-card">
          <p className="text-sm font-semibold">{profile.name}</p>
          <p className="mt-1 text-xs text-content-secondary">{profile.title} · {profile.branch}</p>
          <p className="mt-2 text-sm text-content-tertiary">{profile.subtitle}</p>
        </section>

        <section className="space-y-3">
          <SectionTitle>알림 설정</SectionTitle>
          {fields.map((field) => (
            <button
              key={field.key}
              onClick={() => toggle(field.key)}
              className="w-full rounded-card bg-surface px-4 py-4 text-left shadow-card"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{field.label}</p>
                  {field.description ? (
                    <p className="mt-1 text-xs text-content-tertiary">{field.description}</p>
                  ) : null}
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${settings[field.key] ? 'bg-teal-50 text-teal-600' : 'bg-surface-secondary text-content-secondary'}`}>
                  {settings[field.key] ? 'ON' : 'OFF'}
                </span>
              </div>
            </button>
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

        <button
          onClick={() => setLogoutConfirmOpen(true)}
          className="w-full rounded-card bg-surface px-4 py-4 text-left shadow-card"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LogOut className="h-4 w-4 text-state-error" />
              <span className="text-sm font-medium text-state-error">로그아웃</span>
            </div>
            <span className="text-xs font-semibold text-state-error">확인</span>
          </div>
        </button>
      </div>

      {logoutConfirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
          <button
            type="button"
            aria-label="로그아웃 확인 닫기"
            onClick={() => !isLoggingOut && setLogoutConfirmOpen(false)}
            className="absolute inset-0"
          />
          <div className="relative z-10 w-full max-w-sm rounded-[28px] bg-surface p-5 shadow-2xl">
            <p className="text-base font-semibold">로그아웃할까요?</p>
            <p className="mt-2 text-sm text-content-secondary">현재 기기에서 로그인 세션이 종료됩니다.</p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => setLogoutConfirmOpen(false)}
                className="flex-1 rounded-xl bg-surface-secondary px-4 py-3 text-sm font-semibold text-content-secondary disabled:opacity-60"
              >
                취소
              </button>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="flex-1 rounded-xl bg-state-error px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isLoggingOut ? '처리 중...' : '로그아웃'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <p className="px-1 text-xs font-semibold tracking-[0.08em] text-content-tertiary">{children}</p>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card bg-surface px-4 py-4 shadow-card">
      <p className="text-xs text-content-tertiary">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function ActionRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-card bg-surface px-4 py-4 text-left shadow-card"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">{label}</span>
        <ChevronRight className="h-4 w-4 text-content-tertiary" />
      </div>
    </button>
  );
}
