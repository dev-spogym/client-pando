import { useState } from 'react';
import { toast } from 'sonner';
import { FilePlus2 } from 'lucide-react';
import { addTrainerTemplate, getTrainerTemplates } from '@/lib/mockOperations';

export default function TrainerTemplates() {
  const [name, setName] = useState('');
  const [summary, setSummary] = useState('');
  const [version, setVersion] = useState(0);
  const templates = getTrainerTemplates();

  const submit = () => {
    if (!name.trim() || !summary.trim()) {
      toast.error('템플릿명과 요약을 입력하세요.');
      return;
    }

    addTrainerTemplate({
      name: name.trim(),
      summary: summary.trim(),
      category: 'PT',
      durationMinutes: 50,
      intensity: 'medium',
    });
    setName('');
    setSummary('');
    setVersion((value) => value + 1);
    toast.success('템플릿을 추가했습니다.');
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-gradient-to-br from-slate-900 to-slate-700 px-5 pt-safe-top pb-5">
        <div className="pt-4">
          <p className="text-white/70 text-sm">MA-214</p>
          <h1 className="text-white text-xl font-bold mt-1">수업 템플릿 관리</h1>
        </div>
      </header>

      <div className="px-5 py-4 pb-24 space-y-4" key={version}>
        <section className="rounded-card bg-surface p-4 shadow-card space-y-3">
          <div className="flex items-center gap-2">
            <FilePlus2 className="w-4 h-4 text-teal-600" />
            <p className="text-sm font-semibold">새 템플릿</p>
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="템플릿명"
            className="w-full rounded-xl border border-line px-3 py-3 text-sm focus:outline-none focus:border-teal-500"
          />
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="수업 요약"
            rows={3}
            className="w-full rounded-xl border border-line px-3 py-3 text-sm focus:outline-none focus:border-teal-500 resize-none"
          />
          <button onClick={submit} className="w-full rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white">
            템플릿 추가
          </button>
        </section>

        <section className="space-y-3">
          {templates.map((template) => (
            <div key={template.id} className="rounded-card bg-surface p-4 shadow-card">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{template.name}</p>
                  <p className="mt-1 text-xs text-content-secondary">{template.category} · {template.durationMinutes}분 · {template.intensity}</p>
                </div>
                <span className="rounded-full bg-surface-secondary px-2 py-1 text-[11px] font-semibold text-content-secondary">
                  #{template.id}
                </span>
              </div>
              <p className="mt-3 text-sm text-content-secondary">{template.summary}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
