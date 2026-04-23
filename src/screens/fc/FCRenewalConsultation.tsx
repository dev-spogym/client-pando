import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { addConsultation, getExpiringMembers } from '@/lib/mockOperations';

export default function FCRenewalConsultation() {
  const navigate = useNavigate();
  const members = getExpiringMembers().filter((item) => item.assignedFc === '정하늘');
  const [memberId, setMemberId] = useState(String(members[0]?.id || ''));
  const [summary, setSummary] = useState('');
  const [followUp, setFollowUp] = useState('');

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-surface px-5 pt-safe-top pb-4 shadow-sm">
        <div className="pt-4">
          <p className="text-xs text-content-tertiary">MA-431</p>
          <h1 className="text-lg font-bold">재등록 상담 등록</h1>
        </div>
      </header>

      <div className="px-5 py-4 pb-24 space-y-3">
        <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className="w-full rounded-xl border border-line px-3 py-3 text-sm bg-surface focus:outline-none focus:border-primary">
          {members.map((member) => (
            <option key={member.id} value={member.id}>{member.name} · 만료일 {member.membershipEnd.slice(0, 10)}</option>
          ))}
        </select>
        <textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="재등록 상담 내용" rows={4} className="w-full rounded-xl border border-line px-3 py-3 text-sm resize-none focus:outline-none focus:border-primary" />
        <textarea value={followUp} onChange={(e) => setFollowUp(e.target.value)} placeholder="후속 조치" rows={3} className="w-full rounded-xl border border-line px-3 py-3 text-sm resize-none focus:outline-none focus:border-primary" />
        <button
          onClick={() => {
            const target = members.find((item) => String(item.id) === memberId);
            if (!target || !summary.trim()) {
              toast.error('회원과 상담 내용을 확인하세요.');
              return;
            }
            addConsultation({
              memberId: target.id,
              memberName: target.name,
              phone: target.phone,
              type: '재등록상담',
              channel: '전화',
              scheduledAt: new Date().toISOString(),
              status: 'scheduled',
              result: null,
              summary: summary.trim(),
              followUp: followUp.trim(),
            });
            toast.success('재등록 상담을 등록했습니다.');
            navigate('/fc/leads');
          }}
          className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
        >
          저장
        </button>
      </div>
    </div>
  );
}
