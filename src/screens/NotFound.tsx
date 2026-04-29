import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';

/** 404 페이지 */
export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-secondary flex flex-col items-center justify-center px-6">
      <div className="text-6xl font-bold text-primary/20 mb-4">404</div>
      <h1 className="text-xl font-bold mb-2">페이지를 찾을 수 없습니다</h1>
      <p className="text-sm text-content-secondary text-center mb-8">
        요청하신 페이지가 존재하지 않거나<br />이동되었을 수 있습니다.
      </p>
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="md"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate(-1)}
        >
          뒤로가기
        </Button>
        <Button
          variant="primary"
          size="md"
          leftIcon={<Home className="w-4 h-4" />}
          onClick={() => navigate('/', { replace: true })}
        >
          홈으로
        </Button>
      </div>
    </div>
  );
}
