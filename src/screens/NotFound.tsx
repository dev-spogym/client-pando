import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

/** 404 페이지 */
export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6">
      <div className="text-6xl font-bold text-primary/20 mb-4">404</div>
      <h1 className="text-xl font-bold mb-2">페이지를 찾을 수 없습니다</h1>
      <p className="text-sm text-content-secondary text-center mb-8">
        요청하신 페이지가 존재하지 않거나<br />이동되었을 수 있습니다.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-button border border-line text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          뒤로가기
        </button>
        <button
          onClick={() => navigate('/', { replace: true })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-button bg-primary text-white text-sm font-medium"
        >
          <Home className="w-4 h-4" />
          홈으로
        </button>
      </div>
    </div>
  );
}
