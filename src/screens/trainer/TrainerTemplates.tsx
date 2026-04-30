import { useState } from 'react';
import { toast } from 'sonner';
import { FilePlus2 } from 'lucide-react';
import { addTrainerTemplate, getTrainerTemplates } from '@/lib/mockOperations';
import { PageHeader, Card, Button, Badge } from '@/components/ui';

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
      <header className="bg-gradient-to-br from-teal-600 to-emerald-600 px-5 pt-safe-top pb-5">
        <div className="pt-4">
          <p className="text-white/70 text-body">MA-214</p>
          <h1 className="text-white text-h2 font-bold mt-1">수업 템플릿 관리</h1>
        </div>
      </header>

      <div className="px-5 py-4 pb-24 space-y-4" key={version}>
        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-2 mb-3">
            <FilePlus2 className="w-4 h-4 text-primary" />
            <p className="text-body font-semibold">새 템플릿</p>
          </div>
          <div className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="템플릿명"
              className="w-full rounded-input border border-line px-3 py-3 text-body focus:outline-none focus:border-primary"
            />
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="수업 요약"
              rows={3}
              className="w-full rounded-input border border-line px-3 py-3 text-body focus:outline-none focus:border-primary resize-none"
            />
            <Button variant="primary" size="lg" fullWidth onClick={submit}>
              템플릿 추가
            </Button>
          </div>
        </Card>

        <div className="space-y-3">
          {templates.map((template) => (
            <Card key={template.id} variant="elevated" padding="md">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-body font-semibold">{template.name}</p>
                  <p className="mt-1 text-caption text-content-secondary">
                    {template.category} · {template.durationMinutes}분 · {template.intensity}
                  </p>
                </div>
                <Badge tone="neutral" variant="soft">#{template.id}</Badge>
              </div>
              <p className="mt-3 text-body text-content-secondary">{template.summary}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
