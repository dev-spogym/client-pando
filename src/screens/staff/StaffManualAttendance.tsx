import { useState } from 'react';
import { toast } from 'sonner';
import { addManualAttendance, getManualAttendanceRecords, getMockMembers } from '@/lib/mockOperations';
import { Card, Chip, Button } from '@/components/ui';

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
        <Card className="space-y-3">
          <select
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            className="w-full rounded-xl border border-line px-3 py-3 text-sm focus:outline-none focus:border-primary bg-surface"
          >
            {members.map((member) => (
              <option key={member.id} value={member.id}>{member.name} · {member.phone}</option>
            ))}
          </select>
          <div className="flex gap-2">
            {(['입장', '퇴장'] as const).map((item) => (
              <Chip
                key={item}
                active={type === item}
                onClick={() => setType(item)}
              >
                {item}
              </Chip>
            ))}
          </div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="수동 출석 사유"
            rows={3}
            className="w-full rounded-xl border border-line px-3 py-3 text-sm resize-none focus:outline-none focus:border-primary bg-surface"
          />
          <Button fullWidth size="lg" onClick={submit}>
            출석 처리
          </Button>
        </Card>

        <section className="space-y-3">
          {records.map((record) => (
            <Card key={record.id}>
              <p className="text-sm font-semibold">{record.memberName}</p>
              <p className="mt-1 text-xs text-content-secondary">{record.type} · {record.reason}</p>
              <p className="mt-2 text-xs text-content-tertiary">{record.createdAt.replace('T', ' ').slice(0, 16)} · {record.handledBy}</p>
            </Card>
          ))}
        </section>
      </div>
    </div>
  );
}
