import { useState } from 'react';
import { toast } from 'sonner';
import { addManualAttendance, getManualAttendanceRecords, getMockMembers } from '@/lib/mockOperations';

export default function StaffManualAttendance() {
  const members = getMockMembers();
  const [memberId, setMemberId] = useState(String(members[0]?.id || ''));
  const [type, setType] = useState<'입장' | '퇴장'>('입장');
  const [reason, setReason] = useState('');
  const [version, setVersion] = useState(0);
  const records = getManualAttendanceRecords();

  const submit = () => {
    const selected = members.find((item) => String(item.id) === memberId);
    if (!selected) return;

    addManualAttendance({
      memberId: selected.id,
      memberName: selected.name,
      type,
      reason: reason.trim() || '현장 요청',
      handledBy: '데스크 김유리',
    });

    toast.success('수동 출석을 저장했습니다.');
    setReason('');
    setVersion((value) => value + 1);
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-surface px-5 pt-safe-top pb-4 shadow-sm">
        <div className="pt-4">
          <p className="text-xs text-content-tertiary">MA-520</p>
          <h1 className="text-lg font-bold">수동 출석 처리</h1>
        </div>
      </header>

      <div className="px-5 py-4 pb-24 space-y-4" key={version}>
        <section className="rounded-card bg-surface p-4 shadow-card space-y-3">
          <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className="w-full rounded-xl border border-line px-3 py-3 text-sm focus:outline-none focus:border-primary bg-surface">
            {members.map((member) => (
              <option key={member.id} value={member.id}>{member.name} · {member.phone}</option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            {(['입장', '퇴장'] as const).map((item) => (
              <button
                key={item}
                onClick={() => setType(item)}
                className={`rounded-xl px-3 py-3 text-sm font-semibold ${type === item ? 'bg-primary text-white' : 'bg-surface-secondary text-content-secondary'}`}
              >
                {item}
              </button>
            ))}
          </div>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="수동 출석 사유" rows={3} className="w-full rounded-xl border border-line px-3 py-3 text-sm resize-none focus:outline-none focus:border-primary" />
          <button onClick={submit} className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">
            출석 처리
          </button>
        </section>

        <section className="space-y-3">
          {records.map((record) => (
            <div key={record.id} className="rounded-card bg-surface p-4 shadow-card">
              <p className="text-sm font-semibold">{record.memberName}</p>
              <p className="mt-1 text-xs text-content-secondary">{record.type} · {record.reason}</p>
              <p className="mt-2 text-xs text-content-tertiary">{record.createdAt.replace('T', ' ').slice(0, 16)} · {record.handledBy}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
