import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';

import MobileLayout from '@/components/MobileLayout';
import PrivateRoute from '@/components/PrivateRoute';
import { useAuthStore } from '@/stores/authStore';

// 페이지
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Home from '@/pages/Home';
import QrCheckin from '@/pages/QrCheckin';
import AttendanceHistory from '@/pages/AttendanceHistory';
import ClassList from '@/pages/ClassList';
import ClassDetail from '@/pages/ClassDetail';
import GolfBayReservation from '@/pages/GolfBayReservation';
import Membership from '@/pages/Membership';
import MembershipDetail from '@/pages/MembershipDetail';
import PaymentHistory from '@/pages/PaymentHistory';
import Profile from '@/pages/Profile';
import BodyComposition from '@/pages/BodyComposition';
import Coupons from '@/pages/Coupons';
import Notices from '@/pages/Notices';
import LessonHistory from '@/pages/LessonHistory';
import LessonSignature from '@/pages/LessonSignature';
import NotFound from '@/pages/NotFound';

/** PWA 설치 프롬프트 배너 */
function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // 이미 설치된 경우 표시하지 않음
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    (deferredPrompt as any).prompt();
    const result = await (deferredPrompt as any).userChoice;
    if (result.outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-lg mx-auto slide-up">
      <div className="bg-surface rounded-xl shadow-lg border border-line p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">스포</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">스포짐 앱 설치</p>
          <p className="text-xs text-content-secondary">홈 화면에 추가하면 더 빠르게!</p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-xs text-content-tertiary px-2 py-1"
        >
          닫기
        </button>
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg"
        >
          설치
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        {/* 레이아웃 적용 라우트 */}
        <Route element={<MobileLayout />}>
          {/* 공개 라우트 */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 인증 필요 라우트 */}
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/qr" element={<PrivateRoute><QrCheckin /></PrivateRoute>} />
          <Route path="/attendance" element={<PrivateRoute><AttendanceHistory /></PrivateRoute>} />
          <Route path="/classes" element={<PrivateRoute><ClassList /></PrivateRoute>} />
          <Route path="/classes/:id" element={<PrivateRoute><ClassDetail /></PrivateRoute>} />
          <Route path="/golf-bay" element={<PrivateRoute><GolfBayReservation /></PrivateRoute>} />
          <Route path="/membership" element={<PrivateRoute><Membership /></PrivateRoute>} />
          <Route path="/membership/:id" element={<PrivateRoute><MembershipDetail /></PrivateRoute>} />
          <Route path="/payments" element={<PrivateRoute><PaymentHistory /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/body-composition" element={<PrivateRoute><BodyComposition /></PrivateRoute>} />
          <Route path="/coupons" element={<PrivateRoute><Coupons /></PrivateRoute>} />
          <Route path="/notices" element={<PrivateRoute><Notices /></PrivateRoute>} />
          <Route path="/lessons" element={<PrivateRoute><LessonHistory /></PrivateRoute>} />
          <Route path="/lesson-sign/:classId" element={<PrivateRoute><LessonSignature /></PrivateRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>

      {/* PWA 설치 배너 */}
      <InstallBanner />

      {/* 토스트 알림 */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
    </BrowserRouter>
  );
}
