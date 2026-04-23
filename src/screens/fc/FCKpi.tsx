import { getFcKpi } from '@/lib/mockOperations';

export default function FCKpi() {
  const kpi = getFcKpi();

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-gradient-to-br from-indigo-600 to-blue-500 px-5 pt-safe-top pb-5">
        <div className="pt-4">
          <p className="text-white/80 text-sm">MA-440</p>
          <h1 className="text-white text-xl font-bold mt-1">FC 성과 / KPI</h1>
        </div>
      </header>

      <div className="px-5 py-4 pb-24 grid grid-cols-2 gap-3">
        <KpiCard label="전환율" value={`${kpi.conversionRate}%`} />
        <KpiCard label="전체 상담" value={`${kpi.totalConsultations}건`} />
        <KpiCard label="완료 상담" value={`${kpi.completedConsultations}건`} />
        <KpiCard label="홀딩 회원" value={`${kpi.holdMembers}명`} />
      </div>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card bg-surface p-4 shadow-card">
      <p className="text-xs text-content-tertiary">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
