import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import {
  buildRoutineSuggestion,
  completeOnboarding,
  loadOnboarding,
  saveOnboarding,
  type OnboardingDraft,
} from '@/lib/memberExperience';
import { Button, Chip, PageHeader } from '@/components/ui';

const GOAL_OPTIONS = ['체중 감량', '근력 증가', '체형 교정', '골프 퍼포먼스', '운동 습관 만들기'];
const STYLE_OPTIONS = ['저강도 적응', '밸런스형', '집중형'];
const PAIN_OPTIONS = ['목', '어깨', '허리', '무릎', '손목', '특이사항 없음'];
const BODY_FOCUS_OPTIONS = ['전신 적응', '상체 안정화', '하체 밸런스', '코어 강화'];
const DAY_OPTIONS = ['월', '화', '수', '목', '금', '토', '일'];
const DURATION_OPTIONS = ['30분', '45분', '60분'];

/** 회원 온보딩 */
export default function Onboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { member } = useAuthStore();
  const [step, setStep] = useState(() => {
    const nextStep = Number(searchParams.get('step') || '1');
    return nextStep >= 1 && nextStep <= 3 ? nextStep : 1;
  });
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);

  useEffect(() => {
    const nextStep = Number(searchParams.get('step') || '1');
    setStep(nextStep >= 1 && nextStep <= 3 ? nextStep : 1);
  }, [searchParams]);

  useEffect(() => {
    if (!member) return;
    setDraft(loadOnboarding(member.id));
  }, [member]);

  const routine = draft ? buildRoutineSuggestion(draft) : null;

  if (!member || !draft || !routine) return null;

  const patchDraft = (next: Partial<OnboardingDraft>) => {
    const updated = { ...draft, ...next };
    setDraft(updated);
    saveOnboarding(member.id, updated);
  };

  const toggleMultiValue = (field: 'goals' | 'painAreas' | 'preferredDays', value: string) => {
    const current = draft[field];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    patchDraft({ [field]: next } as Partial<OnboardingDraft>);
  };

  const handleComplete = () => {
    const completedDraft = {
      ...draft,
      recommendedTitle: routine.title,
      recommendedSummary: routine.summary,
      recommendedRoutine: routine.routine,
    };
    completeOnboarding(member.id, completedDraft);
    setDraft(completedDraft);
    toast.success('온보딩이 저장되었습니다.');
    navigate('/', { replace: true });
  };

  const canNextStep1 = draft.goals.length > 0 && Boolean(draft.workoutStyle);
  const canNextStep2 = Boolean(draft.bodyFocus) && draft.preferredDays.length > 0 && Boolean(draft.preferredDuration);

  return (
    <div className="min-h-screen bg-surface-secondary page-with-action">
      <header className="page-header-sticky">
        <PageHeader
          title="운동 온보딩"
          showBack
          onBack={() => (step === 1 ? navigate(-1) : setStep((prev) => prev - 1))}
          sticky={false}
        />

        <div className="px-5 pb-4">
          <div className="flex gap-2">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className={cn(
                  'h-1 flex-1 rounded-full',
                  item <= step ? 'bg-primary' : 'bg-line'
                )}
              />
            ))}
          </div>
        </div>
      </header>

      <div className="px-5 py-4 space-y-4 pb-32">
        {step === 1 && (
          <>
            <section className="bg-surface rounded-card p-5 shadow-card-soft">
              <h2 className="text-h4 font-bold mb-2">운동 목적을 선택해 주세요</h2>
              <p className="text-body text-content-secondary mb-4">복수 선택이 가능하며 첫 루틴 추천에 반영됩니다.</p>
              <div className="flex flex-wrap gap-2">
                {GOAL_OPTIONS.map((item) => (
                  <Chip
                    key={item}
                    active={draft.goals.includes(item)}
                    onClick={() => toggleMultiValue('goals', item)}
                  >
                    {item}
                  </Chip>
                ))}
              </div>
            </section>

            <section className="bg-surface rounded-card p-5 shadow-card-soft">
              <h2 className="text-h4 font-bold mb-2">선호 강도를 알려주세요</h2>
              <div className="grid grid-cols-1 gap-2">
                {STYLE_OPTIONS.map((item) => (
                  <ChoiceCard
                    key={item}
                    active={draft.workoutStyle === item}
                    title={item}
                    description={item === '저강도 적응' ? '부담 없이 시작하는 루틴' : item === '밸런스형' ? '가동성 + 근력을 함께' : '짧고 확실한 집중 루틴'}
                    onClick={() => patchDraft({ workoutStyle: item })}
                  />
                ))}
              </div>
            </section>
          </>
        )}

        {step === 2 && (
          <>
            <section className="bg-surface rounded-card p-5 shadow-card-soft">
              <h2 className="text-h4 font-bold mb-2">통증이나 불편 부위를 선택해 주세요</h2>
              <div className="flex flex-wrap gap-2">
                {PAIN_OPTIONS.map((item) => (
                  <Chip
                    key={item}
                    active={draft.painAreas.includes(item)}
                    onClick={() => toggleMultiValue('painAreas', item)}
                  >
                    {item}
                  </Chip>
                ))}
              </div>
            </section>

            <section className="bg-surface rounded-card p-5 shadow-card-soft">
              <h2 className="text-h4 font-bold mb-2">우선 관리할 부위를 골라 주세요</h2>
              <div className="grid grid-cols-2 gap-2">
                {BODY_FOCUS_OPTIONS.map((item) => (
                  <Chip
                    key={item}
                    active={draft.bodyFocus === item}
                    onClick={() => patchDraft({ bodyFocus: item })}
                  >
                    {item}
                  </Chip>
                ))}
              </div>
            </section>

            <section className="bg-surface rounded-card p-5 shadow-card-soft">
              <h2 className="text-h4 font-bold mb-2">가능한 운동 요일과 시간</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {DAY_OPTIONS.map((item) => (
                  <Chip
                    key={item}
                    active={draft.preferredDays.includes(item)}
                    onClick={() => toggleMultiValue('preferredDays', item)}
                  >
                    {item}
                  </Chip>
                ))}
              </div>
              <div className="flex gap-2">
                {DURATION_OPTIONS.map((item) => (
                  <Chip
                    key={item}
                    active={draft.preferredDuration === item}
                    onClick={() => patchDraft({ preferredDuration: item })}
                  >
                    {item}
                  </Chip>
                ))}
              </div>
            </section>
          </>
        )}

        {step === 3 && (
          <>
            <section className="bg-surface rounded-card p-5 shadow-card-soft">
              <p className="text-caption text-primary font-semibold mb-2">온보딩 요약</p>
              <h2 className="text-h2 font-bold">{routine.title}</h2>
              <p className="text-body text-content-secondary mt-2">{routine.summary}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-body">
                <SummaryBox label="목표" value={draft.goals.join(', ')} />
                <SummaryBox label="강도" value={draft.workoutStyle} />
                <SummaryBox label="통증" value={draft.painAreas.join(', ') || '없음'} />
                <SummaryBox label="선호 요일" value={draft.preferredDays.join(', ')} />
              </div>
            </section>

            <section className="bg-surface rounded-card p-5 shadow-card-soft">
              <h3 className="text-h4 font-bold mb-3">첫 루틴 제안</h3>
              <div className="space-y-2">
                {routine.routine.map((item, index) => (
                  <div key={item} className="flex items-center gap-3 bg-surface-secondary rounded-card px-3 py-3">
                    <div className="w-7 h-7 rounded-full bg-primary-light text-primary flex items-center justify-center text-body font-semibold">
                      {index + 1}
                    </div>
                    <span className="text-body text-content-secondary">{item}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      <div className="bottom-action-bar">
        <div className="max-w-lg mx-auto">
          {step < 3 ? (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={(step === 1 && !canNextStep1) || (step === 2 && !canNextStep2)}
              onClick={() => setStep((prev) => prev + 1)}
            >
              다음 단계
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              rightIcon={<ChevronRight className="w-4 h-4" />}
              onClick={handleComplete}
            >
              루틴 저장하고 시작하기
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ChoiceCard({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-card border p-4 text-left transition-colors',
        active ? 'border-primary bg-primary-light' : 'border-line bg-surface'
      )}
    >
      <p className="font-semibold text-body">{title}</p>
      <p className="text-caption text-content-secondary mt-1">{description}</p>
    </button>
  );
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-secondary rounded-card p-3">
      <p className="text-[11px] text-content-tertiary">{label}</p>
      <p className="text-body font-medium mt-1">{value || '-'}</p>
    </div>
  );
}
