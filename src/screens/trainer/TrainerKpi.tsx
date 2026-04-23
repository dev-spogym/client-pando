import { Activity, Award, CircleAlert, TrendingUp } from 'lucide-react';
import { getTrainerKpi } from '@/lib/mockOperations';

export default function TrainerKpi() {
  const kpi = getTrainerKpi();

  const cards = [
    { label: '전체 수업', value: `${kpi.totalClasses}건`, icon: Activity, tone: 'text-teal-600' },
    { label: '완료율', value: `${kpi.completionRate}%`, icon: TrendingUp, tone: 'text-state-success' },
    { label: '노쇼', value: `${kpi.noShowCount}건`, icon: CircleAlert, tone: 'text-state-error' },
    { label: '활성 회원', value: `${kpi.activeMembers}명`, icon: Award, tone: 'text-state-info' },
  ];

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-gradient-to-br from-teal-600 to-cyan-600 px-5 pt-safe-top pb-5">
        <div className="pt-4">
          <p className="text-white/80 text-sm">MA-240</p>
          <h1 className="text-white text-xl font-bold mt-1">강사 성과 / KPI</h1>
        </div>
      </header>

      <div className="px-5 py-4 pb-24 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="rounded-card bg-surface p-4 shadow-card">
                <Icon className={`w-5 h-5 ${card.tone}`} />
                <p className="mt-3 text-xs text-content-tertiary">{card.label}</p>
                <p className="mt-1 text-xl font-bold">{card.value}</p>
              </div>
            );
          })}
        </div>

        <div className="rounded-card bg-surface p-4 shadow-card">
          <p className="text-sm font-semibold">기획 기준 반영 항목</p>
          <ul className="mt-3 space-y-2 text-sm text-content-secondary">
            <li>완료율 = 완료 수업 / 전체 수업</li>
            <li>노쇼율 = 노쇼 건수 / 전체 수업</li>
            <li>대기 서명 건수는 골프 레슨 완료 증빙 흐름과 연결</li>
            <li>mock 데이터지만 실제 모바일 웹앱 화면과 동일 라우트로 확인 가능</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
