import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { addConsultation } from '@/lib/mockOperations';
import { Input, Button } from '@/components/ui';

export default function FCConsultationEditor() {
  const navigate = useNavigate();
  const [memberName, setMemberName] = useState('');
  const [phone, setPhone] = useState('');
  const [summary, setSummary] = useState('');
  const [followUp, setFollowUp] = useState('');

  const submit = () => {
    if (!memberName.trim() || !phone.trim() || !summary.trim()) {
      toast.error('회원명, 연락처, 상담 내용을 입력하세요.');
      return;
    }

    addConsultation({
      memberId: null,
      memberName: memberName.trim(),
      phone: phone.trim(),
      type: '상담',
      channel: '전화',
      scheduledAt: new Date().toISOString(),
      status: 'scheduled',
      result: null,
      summary: summary.trim(),
      followUp: followUp.trim(),
    });

    toast.success('상담 이력을 등록했습니다.');
    navigate('/fc/leads');
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-surface px-5 pt-safe-top pb-4 shadow-sm">
        <div className="pt-4">
          <p className="text-xs text-content-tertiary">MA-411</p>
          <h1 className="text-lg font-bold">상담 이력 등록</h1>
        </div>
      </header>

      <div className="px-5 py-4 pb-24 space-y-3">
        <Input
          value={memberName}
          onChange={(e) => setMemberName(e.target.value)}
          placeholder="회원명"
        />
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="연락처"
        />
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="상담 내용"
          rows={4}
          className="w-full rounded-xl border border-line px-3 py-3 text-sm resize-none focus:outline-none focus:border-primary bg-surface"
        />
        <textarea
          value={followUp}
          onChange={(e) => setFollowUp(e.target.value)}
          placeholder="후속 조치"
          rows={3}
          className="w-full rounded-xl border border-line px-3 py-3 text-sm resize-none focus:outline-none focus:border-primary bg-surface"
        />
        <Button fullWidth size="lg" onClick={submit}>
          저장
        </Button>
      </div>
    </div>
  );
}
