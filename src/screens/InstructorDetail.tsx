import { ArrowLeft, CalendarRange, Star, UserRound } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getInstructorProfile } from '@/lib/memberExperience';

/** 강사 상세 */
export default function InstructorDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const profile = getInstructorProfile(Number(id || 0));

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-surface sticky top-0 z-10 border-b border-line">
        <div className="flex items-center px-4 pt-safe-top h-14">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-content" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-lg">강사 상세</h1>
          <div className="w-6" />
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        <section className="bg-surface rounded-card p-5 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center">
              <UserRound className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xl font-bold">{profile.name}</p>
              <p className="text-sm text-content-secondary mt-1">경력 {profile.careerYears}년</p>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-1 text-state-warning font-medium">
                  <Star className="w-4 h-4 fill-current" />
                  {profile.rating.toFixed(1)}
                </span>
                <span className="text-content-tertiary">후기 {profile.reviewCount}건</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-content-secondary mt-4 leading-relaxed">{profile.intro}</p>
        </section>

        <section className="bg-surface rounded-card p-5 shadow-card">
          <h2 className="text-sm font-semibold mb-3">전문 분야</h2>
          <div className="flex flex-wrap gap-2">
            {profile.specialties.map((item) => (
              <span key={item} className="px-3 py-1.5 rounded-full bg-primary-light text-primary text-sm font-medium">
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="bg-surface rounded-card p-5 shadow-card">
          <h2 className="text-sm font-semibold mb-3">가능 프로그램</h2>
          <div className="space-y-2">
            {profile.availablePrograms.map((item) => (
              <div key={item} className="bg-surface-secondary rounded-xl px-3 py-3 text-sm text-content-secondary">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface rounded-card p-5 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <CalendarRange className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-semibold">최근 예약 가능 시간</h2>
          </div>
          <div className="space-y-2">
            {profile.nextSlots.map((item) => (
              <div key={item} className="bg-surface-secondary rounded-xl px-3 py-3 text-sm text-content-secondary">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface rounded-card p-5 shadow-card">
          <h2 className="text-sm font-semibold mb-3">추천 코칭 포인트</h2>
          <div className="flex flex-wrap gap-2">
            {profile.focusAreas.map((item) => (
              <span key={item} className="px-3 py-1.5 rounded-full bg-state-info/10 text-state-info text-sm font-medium">
                {item}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
