import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  addMemberNote,
  deleteMemberNote,
  getConsultations,
  getInitialMemberNotes,
  getMemberNotes,
  getMockMemberById,
  updateMemberNote,
  type MemberNote,
  type MemberNoteType,
  type MockMember,
} from '@/lib/mockOperations';
import { cn, formatCurrency, formatDateKo } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { PageHeader, Card, Badge, Button, Chip } from '@/components/ui';

type SharedRole = 'fc' | 'staff';
type TabKey = 'basic' | 'membership' | 'attendance' | 'consultation' | 'payment';

const MAX_MEMBER_NOTES = 50;
const NOTE_TYPE_OPTIONS: Array<{ value: MemberNoteType; label: string }> = [
  { value: 'general', label: '일반' },
  { value: 'caution', label: '주의' },
  { value: 'vip', label: 'VIP' },
  { value: 'other', label: '기타' },
];

const NOTE_TYPE_BADGE_CLASS: Record<MemberNoteType, string> = {
  general: 'bg-surface-tertiary text-content-secondary',
  caution: 'bg-state-error/10 text-state-error',
  vip: 'bg-accent-light text-accent-dark',
  other: 'bg-state-info/10 text-state-info',
};

export default function SharedMemberDetail({ role }: { role: SharedRole }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { id } = useParams<{ id: string }>();
  const trainer = useAuthStore((state) => state.trainer);
  const member = id ? getMockMemberById(Number(id)) : null;
  const memberId = member?.id ?? null;
  const [tab, setTab] = useState<TabKey>('basic');
  const [noteDraft, setNoteDraft] = useState('');
  const [noteType, setNoteType] = useState<MemberNoteType>('general');
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MemberNote | null>(null);
  const [notes, setNotes] = useState<MemberNote[]>(() => (
    role === 'fc' && member ? getInitialMemberNotes(member.id) : []
  ));

  const currentFcName = trainer?.staffName || trainer?.name || member?.assignedFc || '담당 FC';
  const consultations = useMemo(() => (
    role === 'fc'
      ? getConsultations().filter((item) => item.memberId === memberId)
      : []
  ), [memberId, role]);

  useEffect(() => {
    if (role !== 'fc' || !memberId) {
      setNotes([]);
      return;
    }

    setNotes(getMemberNotes(memberId));
  }, [memberId, role]);

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-content-tertiary">
        회원 정보를 찾을 수 없습니다.
      </div>
    );
  }

  const isMemoSheetOpen = role === 'fc' && searchParams.get('sheet') === 'memo';
  const isEditing = editingNoteId !== null;

  const openMemoSheet = () => {
    const next = new URLSearchParams(searchParams);
    next.set('sheet', 'memo');
    setSearchParams(next, { replace: true });
  };

  const resetNoteForm = () => {
    setNoteDraft('');
    setNoteType('general');
    setEditingNoteId(null);
  };

  const closeMemoSheet = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('sheet');
    setSearchParams(next, { replace: true });
    resetNoteForm();
    setDeleteTarget(null);
  };

  const canManageNote = (note: MemberNote) => note.authorRole === 'fc' && note.authorName === currentFcName;

  const saveNote = () => {
    const trimmedNote = noteDraft.trim();

    if (!trimmedNote) {
      toast.error('메모를 입력하세요.');
      return;
    }

    if (!isEditing && notes.length >= MAX_MEMBER_NOTES) {
      toast.error('메모는 최대 50개까지 등록 가능합니다. 이전 메모를 삭제해주세요.');
      return;
    }

    if (editingNoteId) {
      updateMemberNote(editingNoteId, { content: trimmedNote, type: noteType });
      toast.success('메모를 수정했습니다.');
    } else {
      addMemberNote(member.id, 'fc', currentFcName, trimmedNote, noteType);
      toast.success('메모를 저장했습니다.');
    }

    resetNoteForm();
    setNotes(getMemberNotes(member.id));
  };

  const startEditNote = (note: MemberNote) => {
    setEditingNoteId(note.id);
    setNoteDraft(note.content);
    setNoteType(note.type);
  };

  const confirmDeleteNote = () => {
    if (!deleteTarget) return;

    deleteMemberNote(deleteTarget.id);
    setDeleteTarget(null);
    if (editingNoteId === deleteTarget.id) {
      resetNoteForm();
    }
    setNotes(getMemberNotes(member.id));
    toast.success('메모를 삭제했습니다.');
  };

  const tabs: Array<{ key: TabKey; label: string }> = role === 'fc'
    ? [
        { key: 'basic', label: '기본' },
        { key: 'membership', label: '이용권' },
        { key: 'attendance', label: '출석' },
        { key: 'consultation', label: '상담' },
        { key: 'payment', label: '결제' },
      ]
    : [
        { key: 'basic', label: '기본' },
        { key: 'membership', label: '이용권' },
        { key: 'attendance', label: '출석' },
        { key: 'payment', label: '결제' },
      ];

  return (
    <div className="min-h-screen bg-surface-secondary">
      <PageHeader
        showBack
        onBack={() => navigate(-1)}
        title={member.name}
        subtitle={role === 'fc' ? 'MA-421' : 'MA-511'}
      />

      <div className="px-5 py-4 pb-24 space-y-4">
        <Card variant="elevated" padding="md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{member.membershipName}</p>
              <p className="mt-1 text-xs text-content-secondary">
                상태 {member.status} · 담당 {role === 'fc' ? member.assignedFc : member.assignedTrainer}
              </p>
            </div>
            {role === 'fc' ? (
              <Button variant="tertiary" size="sm" onClick={openMemoSheet}>
                메모 관리
              </Button>
            ) : null}
          </div>
          <p className="mt-3 text-sm text-content-secondary">{member.programSummary}</p>
        </Card>

        {/* 탭 바 */}
        <div className="flex rounded-card bg-surface p-1 shadow-card-soft">
          {tabs.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={cn(
                'flex-1 rounded-card px-3 py-2 text-sm font-medium transition-colors',
                tab === item.key ? 'bg-surface-secondary text-content' : 'text-content-tertiary'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === 'basic' ? <BasicTab member={member} notes={notes} role={role} /> : null}
        {tab === 'membership' ? <MembershipTab member={member} /> : null}
        {tab === 'attendance' ? <AttendanceTab member={member} /> : null}
        {tab === 'consultation' && role === 'fc' ? <ConsultationTab consultations={consultations} /> : null}
        {tab === 'payment' ? <PaymentTab member={member} /> : null}
      </div>

      {isMemoSheetOpen ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/35">
          <button
            type="button"
            aria-label="메모 시트 닫기"
            onClick={closeMemoSheet}
            className="absolute inset-0"
          />
          <div className="relative z-10 w-full rounded-t-[28px] bg-surface px-5 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] pt-4 shadow-card-elevated">
            <div className="mx-auto h-1.5 w-12 rounded-full bg-line" />
            <div className="mt-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-content-tertiary">MA-422</p>
                <h2 className="text-lg font-bold">{member.name} 메모 관리</h2>
                <p className="mt-1 text-xs text-content-tertiary">총 {notes.length} / {MAX_MEMBER_NOTES}</p>
              </div>
              <Button variant="tertiary" size="sm" onClick={closeMemoSheet}>닫기</Button>
            </div>

            <div className="mt-4 space-y-4">
              <Card variant="soft" padding="md">
                <div className="flex flex-wrap gap-2">
                  {NOTE_TYPE_OPTIONS.map((item) => (
                    <Chip
                      key={item.value}
                      active={noteType === item.value}
                      size="sm"
                      onClick={() => setNoteType(item.value)}
                    >
                      {item.label}
                    </Chip>
                  ))}
                </div>

                {isEditing ? (
                  <div className="mt-3 rounded-card bg-accent-light/30 px-3 py-2 text-xs text-accent-dark">
                    수정 모드입니다. 저장 시 메모 내용과 유형이 함께 갱신됩니다.
                  </div>
                ) : null}

                <textarea
                  value={noteDraft}
                  onChange={(event) => setNoteDraft(event.target.value.slice(0, 500))}
                  placeholder="메모를 입력하세요"
                  rows={4}
                  maxLength={500}
                  className="mt-3 w-full resize-none rounded-input border border-line bg-surface px-3 py-3 text-sm focus:border-primary focus:outline-none"
                />
                <div className="mt-2 flex items-center justify-between text-xs text-content-tertiary">
                  <span>{isEditing ? '메모 수정' : '신규 메모 등록'}</span>
                  <span>{noteDraft.length} / 500</span>
                </div>
                <div className="mt-3 flex gap-2">
                  {isEditing ? (
                    <Button variant="tertiary" size="md" fullWidth onClick={resetNoteForm}>
                      수정 취소
                    </Button>
                  ) : null}
                  <Button variant="primary" size="md" fullWidth onClick={saveNote}>
                    {isEditing ? '메모 수정' : '메모 저장'}
                  </Button>
                </div>
              </Card>

              <div className="max-h-[40vh] space-y-3 overflow-y-auto pb-1">
                {notes.length === 0 ? (
                  <Card variant="soft" padding="md">
                    <p className="text-sm text-content-tertiary">등록된 메모가 없습니다.</p>
                  </Card>
                ) : notes.map((note) => (
                  <Card key={note.id} variant="soft" padding="md">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={cn('rounded-pill px-2.5 py-1 text-[11px] font-semibold', NOTE_TYPE_BADGE_CLASS[note.type])}>
                          {getNoteTypeLabel(note.type)}
                        </span>
                        {note.updatedAt ? (
                          <span className="text-[11px] text-content-tertiary">수정됨</span>
                        ) : null}
                      </div>
                      {canManageNote(note) ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEditNote(note)}
                            className="rounded-full bg-surface px-2.5 py-2 text-content-secondary"
                            aria-label="메모 수정"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(note)}
                            className="rounded-full bg-surface px-2.5 py-2 text-state-error"
                            aria-label="메모 삭제"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm text-content-secondary">{note.content}</p>
                    <p className="mt-2 text-xs text-content-tertiary">
                      {note.authorName} · {formatDateKo(note.createdAt)} {note.createdAt.slice(11, 16)}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-5">
          <button
            type="button"
            aria-label="삭제 확인 닫기"
            onClick={() => setDeleteTarget(null)}
            className="absolute inset-0"
          />
          <div className="relative z-10 w-full max-w-sm rounded-card-lg bg-surface p-5 shadow-card-elevated">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-state-error/10 p-2 text-state-error">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold">메모를 삭제할까요?</p>
                <p className="text-sm text-content-secondary">삭제된 메모는 복구할 수 없습니다.</p>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <Button variant="tertiary" size="lg" fullWidth onClick={() => setDeleteTarget(null)}>
                취소
              </Button>
              <Button variant="danger" size="lg" fullWidth onClick={confirmDeleteNote}>
                삭제
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BasicTab({ member, notes, role }: { member: MockMember; notes: MemberNote[]; role: SharedRole }) {
  const cautionNotes = role === 'fc' ? notes.filter((note) => note.type === 'caution') : [];

  return (
    <div className="space-y-3">
      {role === 'fc' && cautionNotes.length > 0 ? (
        <Card variant="outline" padding="md" className="border-state-error/30 bg-state-error/5">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-surface p-2 text-state-error">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-state-error">주의 메모 {cautionNotes.length}건</p>
              <p className="mt-1 text-sm text-state-error">{cautionNotes[0].content}</p>
            </div>
          </div>
        </Card>
      ) : null}

      <InfoCard label="전화번호" value={member.phone} />
      <InfoCard label="성별" value={member.gender === 'F' ? '여성' : '남성'} />
      <InfoCard label="생년월일" value={member.birthDate} />
      <InfoCard label="가입일" value={formatDateKo(member.joinDate)} />
      <InfoCard label="담당 FC" value={member.assignedFc} />
      <InfoCard label="담당 트레이너" value={member.assignedTrainer} />
      <InfoCard label="락커" value={member.lockerLabel} />

      {role === 'fc' ? (
        <Card variant="elevated" padding="md">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="text-sm font-semibold">최근 메모</p>
            <span className="text-xs text-content-tertiary">{notes.length}건</span>
          </div>
          <div className="space-y-2">
            {notes.length === 0 ? (
              <p className="text-sm text-content-tertiary">메모가 없습니다.</p>
            ) : notes.slice(0, 3).map((note) => (
              <div key={note.id} className="rounded-card bg-surface-secondary px-3 py-3">
                <div className="flex items-center gap-2">
                  <Badge tone="neutral" variant="soft">{getNoteTypeLabel(note.type)}</Badge>
                </div>
                <p className="mt-2 text-sm text-content-secondary">{note.content}</p>
                <p className="mt-1 text-xs text-content-tertiary">
                  {note.authorName} · {formatDateKo(note.createdAt)} {note.createdAt.slice(11, 16)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function MembershipTab({ member }: { member: MockMember }) {
  return (
    <div className="space-y-3">
      <InfoCard label="이용권" value={member.membershipName} />
      <InfoCard label="시작일" value={formatDateKo(member.membershipStart)} />
      <InfoCard label="종료일" value={formatDateKo(member.membershipEnd)} />
      <InfoCard label="잔여 회차" value={`${member.remainingSessions} / ${member.totalSessions}회`} />
    </div>
  );
}

function AttendanceTab({ member }: { member: MockMember }) {
  return (
    <section className="space-y-3">
      {member.attendanceHistory.map((record) => (
        <Card key={record.id} variant="elevated" padding="md">
          <p className="text-sm font-semibold">{formatDateKo(record.checkInAt)}</p>
          <p className="mt-1 text-xs text-content-secondary">{record.source === 'staff' ? '수동 처리' : 'QR 체크인'}</p>
          <p className="mt-2 text-sm text-content-secondary">
            입장 {record.checkInAt.slice(11, 16)} / 퇴장 {record.checkOutAt ? record.checkOutAt.slice(11, 16) : '미처리'}
          </p>
        </Card>
      ))}
    </section>
  );
}

function ConsultationTab({ consultations }: { consultations: Array<{ id: number; type: string; scheduledAt: string; status: string; result: string | null; summary: string }> }) {
  return (
    <section className="space-y-3">
      {consultations.length === 0 ? (
        <Card variant="soft" padding="md">
          <p className="text-sm text-content-tertiary">상담 이력이 없습니다.</p>
        </Card>
      ) : consultations.map((item) => (
        <Card key={item.id} variant="elevated" padding="md">
          <p className="text-sm font-semibold">{item.type}</p>
          <p className="mt-1 text-xs text-content-secondary">
            {formatDateKo(item.scheduledAt)} · {item.status} · {item.result || '미정'}
          </p>
          <p className="mt-2 text-sm text-content-secondary">{item.summary}</p>
        </Card>
      ))}
    </section>
  );
}

function PaymentTab({ member }: { member: MockMember }) {
  return (
    <section className="space-y-3">
      {member.payments.map((payment) => (
        <Card key={payment.id} variant="elevated" padding="md">
          <p className="text-sm font-semibold">{payment.product}</p>
          <p className="mt-1 text-xs text-content-secondary">{formatDateKo(payment.paidAt)} · {payment.method}</p>
          <p className="mt-2 text-sm font-semibold text-primary">{formatCurrency(payment.amount)}</p>
        </Card>
      ))}
    </section>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <Card variant="elevated" padding="md">
      <p className="text-xs text-content-tertiary">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </Card>
  );
}

function getNoteTypeLabel(type: MemberNoteType) {
  return NOTE_TYPE_OPTIONS.find((item) => item.value === type)?.label || '일반';
}
