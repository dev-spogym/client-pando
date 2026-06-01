import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Info } from 'lucide-react';
import {
  addConsultation,
  type ConsultationType,
  type ConsultationMethod,
  type LeadStage,
  type InflowSource,
} from '@/lib/mockOperations';
import { Input, Button, Chip, Card } from '@/components/ui';

const TYPES: ConsultationType[] = ['상담', 'OT', '체험', '재등록상담'];
const METHODS: ConsultationMethod[] = ['대면', '유선', '부재'];
const STAGES: LeadStage[] = ['신규', '연락완료', '상담예정', '방문완료', '등록완료', '미전환', '보류'];
const RESULTS: ('등록' | '미등록' | '보류')[] = ['등록', '미등록', '보류'];
const INFLOW_SOURCES: InflowSource[] = ['간판', '인터넷', '전단지', '추천', 'SNS', '카카오톡', '전화문의', '방문', '기타'];

const SUMMARY_MAX = 1000;

export default function FCConsultationEditor() {
  const navigate = useNavigate();
  const [memberName, setMemberName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<ConsultationType>('상담');
  const [method, setMethod] = useState<ConsultationMethod>('대면');
  const [stage, setStage] = useState<LeadStage>('신규');
  const [result, setResult] = useState<'등록' | '미등록' | '보류' | null>(null);
  const [summary, setSummary] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [inflowSource, setInflowSource] = useState<InflowSource>('방문');
  // 등록완료 시도 시 안내 카드 노출 여부
  const [showRegisterRequest, setShowRegisterRequest] = useState(false);

  // 결과가 미등록/보류면 후속 조치 필수
  const followUpRequired = result === '미등록' || result === '보류';

  // 상담 내용 1000자 초과 입력 차단 + 토스트
  const onSummaryChange = (value: string) => {
    if (value.length > SUMMARY_MAX) {
      toast.error('상담 내용은 1000자 이내로 입력해주세요');
      setSummary(value.slice(0, SUMMARY_MAX));
      return;
    }
    setSummary(value);
  };

  // 단계 선택 — 등록완료는 권한 차단 후 직전 단계(방문완료)로 보정
  const onStageSelect = (next: LeadStage) => {
    if (next === '등록완료') {
      toast.error('회원 등록 권한이 없어 등록 요청으로 전환됩니다');
      setShowRegisterRequest(true);
      setStage('방문완료');
      return;
    }
    setShowRegisterRequest(false);
    setStage(next);
  };

  const submit = () => {
    if (!memberName.trim() || !phone.trim() || !summary.trim()) {
      toast.error('회원명, 연락처, 상담 내용을 입력하세요.');
      return;
    }

    if (followUpRequired && !followUp.trim()) {
      toast.error('후속 조치를 입력해주세요');
      return;
    }

    addConsultation({
      memberId: null,
      memberName: memberName.trim(),
      phone: phone.trim(),
      type,
      method,
      stage,
      inflowSource,
      scheduledAt: new Date().toISOString(),
      status: stage === '방문완료' || stage === '미전환' || stage === '보류' ? 'completed' : 'scheduled',
      result,
      summary: summary.trim(),
      followUp: followUp.trim(),
    });

    toast.success('상담 이력이 등록되었어요');
    navigate('/fc/leads');
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-surface px-5 pt-safe-top pb-4 shadow-sm">
        <div className="pt-4">
          <p className="text-caption text-content-tertiary">MA-411</p>
          <h1 className="text-h4 font-bold">상담 이력 등록</h1>
        </div>
      </header>

      <div className="px-5 py-4 pb-24 space-y-4">
        {/* 회원명 / 연락처 */}
        <div className="space-y-3">
          <Input value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="회원명" />
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="연락처" />
        </div>

        {/* 상담 유형 */}
        <div className="space-y-2">
          <p className="text-caption font-semibold text-content-secondary">상담 유형</p>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((item) => (
              <Chip key={item} size="sm" active={type === item} onClick={() => setType(item)}>
                {item}
              </Chip>
            ))}
          </div>
        </div>

        {/* 상담 방식 */}
        <div className="space-y-2">
          <p className="text-caption font-semibold text-content-secondary">상담 방식</p>
          <div className="flex gap-2">
            {METHODS.map((item) => (
              <Chip key={item} size="sm" active={method === item} onClick={() => setMethod(item)}>
                {item}
              </Chip>
            ))}
          </div>
        </div>

        {/* 상담 내용 (최대 1000자) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-caption font-semibold text-content-secondary">상담 내용</p>
            <span className="text-caption text-content-tertiary">{summary.length}/{SUMMARY_MAX}</span>
          </div>
          <textarea
            value={summary}
            onChange={(e) => onSummaryChange(e.target.value)}
            placeholder="상담 내용 (최대 1000자)"
            rows={5}
            className="w-full rounded-xl border border-line px-3 py-3 text-body resize-none focus:outline-none focus:border-primary bg-surface"
          />
        </div>

        {/* 상담 단계 */}
        <div className="space-y-2">
          <p className="text-caption font-semibold text-content-secondary">상담 단계</p>
          <div className="flex flex-wrap gap-2">
            {STAGES.map((item) => (
              <Chip key={item} size="sm" active={stage === item} onClick={() => onStageSelect(item)}>
                {item}
              </Chip>
            ))}
          </div>
        </div>

        {/* 등록완료 차단 안내 카드 */}
        {showRegisterRequest && (
          <Card className="flex gap-3 bg-primary-light/40">
            <Info className="w-5 h-5 shrink-0 text-primary" />
            <div className="space-y-1">
              <p className="text-body font-semibold text-primary">등록 요청 전송됨</p>
              <p className="text-caption text-content-secondary">
                회원 등록 권한이 없어 지점장/매니저에게 등록 요청이 전달되었습니다. 승인 후 등록완료로 전환됩니다.
              </p>
            </div>
          </Card>
        )}

        {/* 상담 결과 */}
        <div className="space-y-2">
          <p className="text-caption font-semibold text-content-secondary">상담 결과</p>
          <div className="flex gap-2">
            <Chip size="sm" active={result === null} onClick={() => setResult(null)}>
              미선택
            </Chip>
            {RESULTS.map((item) => (
              <Chip key={item} size="sm" active={result === item} onClick={() => setResult(item)}>
                {item}
              </Chip>
            ))}
          </div>
        </div>

        {/* 후속 조치 (미등록/보류 시 필수) */}
        <div className="space-y-2">
          <p className="text-caption font-semibold text-content-secondary">
            후속 조치{followUpRequired && <span className="text-state-error"> *필수</span>}
          </p>
          <textarea
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
            placeholder={followUpRequired ? '미등록/보류 시 후속 조치를 반드시 입력하세요' : '후속 조치'}
            rows={followUpRequired ? 4 : 3}
            className={
              'w-full rounded-xl border px-3 py-3 text-body resize-none focus:outline-none bg-surface ' +
              (followUpRequired ? 'border-state-error focus:border-state-error' : 'border-line focus:border-primary')
            }
          />
        </div>

        {/* 유입경로 */}
        <div className="space-y-2">
          <p className="text-caption font-semibold text-content-secondary">유입경로</p>
          <select
            value={inflowSource}
            onChange={(e) => setInflowSource(e.target.value as InflowSource)}
            className="w-full rounded-xl border border-line px-3 py-3 text-body bg-surface focus:outline-none focus:border-primary"
          >
            {INFLOW_SOURCES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <Button fullWidth size="lg" onClick={submit}>
          저장
        </Button>
      </div>
    </div>
  );
}
