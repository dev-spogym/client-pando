import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Phone, Clock, ChevronRight,
  Dumbbell, Users, Music, Lock, Waves, Wifi,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Facility {
  icon: React.ReactNode;
  name: string;
  description: string;
}

interface Trainer {
  name: string;
  specialty: string;
  experience: string;
  certifications: string[];
}

const FACILITIES: Facility[] = [
  { icon: <Dumbbell className="w-5 h-5 text-primary" />, name: '헬스장', description: '최신 기구 완비, 프리웨이트 존 별도 운영' },
  { icon: <Users className="w-5 h-5 text-accent" />, name: 'PT룸', description: '1:1 개인 트레이닝 전용 공간' },
  { icon: <Music className="w-5 h-5 text-purple-500" />, name: 'GX룸', description: '그룹 운동 수업 (요가, 필라테스, 에어로빅)' },
  { icon: <Lock className="w-5 h-5 text-orange-500" />, name: '락커룸', description: '개인 락커, 샤워실, 파우더룸 완비' },
  { icon: <Waves className="w-5 h-5 text-blue-500" />, name: '스트레칭 존', description: '폼롤러, 밴드 등 스트레칭 용품 구비' },
  { icon: <Wifi className="w-5 h-5 text-green-500" />, name: '라운지', description: '무료 Wi-Fi, 단백질 음료 판매' },
];

const TRAINERS: Trainer[] = [
  {
    name: '김민수',
    specialty: '체형교정 / 다이어트',
    experience: '경력 8년',
    certifications: ['NSCA-CPT', '스포츠지도사 2급'],
  },
  {
    name: '이서연',
    specialty: '필라테스 / 재활운동',
    experience: '경력 6년',
    certifications: ['필라테스 지도자', '물리치료사'],
  },
  {
    name: '박준혁',
    specialty: '근력강화 / 바디빌딩',
    experience: '경력 10년',
    certifications: ['ACSM-CPT', '스포츠지도사 1급'],
  },
  {
    name: '최유진',
    specialty: '기능성 트레이닝 / 체력증진',
    experience: '경력 5년',
    certifications: ['NASM-CPT', '건강운동관리사'],
  },
];

const HOURS = [
  { day: '평일 (월~금)', time: '06:00 - 23:00' },
  { day: '토요일', time: '08:00 - 20:00' },
  { day: '일요일 / 공휴일', time: '10:00 - 18:00' },
];

/** 센터 정보 페이지 */
export default function CenterInfo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* 헤더 */}
      <header className="bg-surface sticky top-0 z-10 border-b border-line">
        <div className="flex items-center px-4 pt-safe-top h-14">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-content" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-lg">센터 정보</h1>
          <div className="w-6" />
        </div>
      </header>

      <div className="px-4 mt-3 space-y-4 pb-4">
        {/* 센터 기본 정보 */}
        <div className="bg-surface rounded-card p-5 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">스포</span>
            </div>
            <div>
              <h2 className="text-lg font-bold">스포짐 피트니스</h2>
              <p className="text-sm text-content-secondary">건강한 라이프스타일의 시작</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-content-tertiary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm">서울특별시 강남구 테헤란로 123</p>
                <p className="text-xs text-content-tertiary">스포짐빌딩 2~3층</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-content-tertiary flex-shrink-0" />
              <a href="tel:02-1234-5678" className="text-sm text-primary font-medium">02-1234-5678</a>
            </div>
          </div>
        </div>

        {/* 영업시간 */}
        <div className="bg-surface rounded-card p-4 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-sm">영업시간</h3>
          </div>
          <div className="space-y-2">
            {HOURS.map((h) => (
              <div key={h.day} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-content-secondary">{h.day}</span>
                <span className="text-sm font-medium">{h.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 시설 안내 */}
        <div className="bg-surface rounded-card p-4 shadow-card">
          <h3 className="font-semibold text-sm mb-3">시설 안내</h3>
          <div className="grid grid-cols-2 gap-3">
            {FACILITIES.map((f) => (
              <div key={f.name} className="bg-surface-secondary rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  {f.icon}
                  <span className="text-sm font-medium">{f.name}</span>
                </div>
                <p className="text-xs text-content-tertiary">{f.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 이벤트/공지 */}
        <div
          onClick={() => navigate('/notices')}
          className="bg-surface rounded-card p-4 shadow-card touch-card cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-state-info/10 rounded-lg flex items-center justify-center">
                <span className="text-sm">📢</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm">이벤트 · 공지사항</h3>
                <p className="text-xs text-content-tertiary">최신 소식을 확인하세요</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-content-tertiary" />
          </div>
        </div>

        {/* 트레이너 소개 */}
        <div className="bg-surface rounded-card p-4 shadow-card">
          <h3 className="font-semibold text-sm mb-3">트레이너 소개</h3>
          <div className="space-y-3">
            {TRAINERS.map((trainer) => (
              <div key={trainer.name} className="flex items-start gap-3 p-3 bg-surface-secondary rounded-xl">
                <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-sm">{trainer.name.slice(0, 1)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{trainer.name}</h4>
                    <span className="text-[10px] px-1.5 py-0.5 bg-primary-light text-primary rounded-full font-medium">
                      {trainer.experience}
                    </span>
                  </div>
                  <p className="text-xs text-content-secondary mb-1">{trainer.specialty}</p>
                  <div className="flex flex-wrap gap-1">
                    {trainer.certifications.map((cert) => (
                      <span key={cert} className="text-[10px] px-1.5 py-0.5 bg-surface-tertiary text-content-tertiary rounded">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
