import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, AlertTriangle, Target, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader, Chip } from '@/components/ui';

type Category = '전체' | '가슴' | '등' | '어깨' | '하체' | '팔' | '코어';
type Difficulty = '초급' | '중급' | '고급';

interface Exercise {
  id: number;
  name: string;
  category: Exclude<Category, '전체'>;
  difficulty: Difficulty;
  description: string;
  tips: string[];
  caution: string;
}

const EXERCISES: Exercise[] = [
  { id: 1, name: '벤치프레스', category: '가슴', difficulty: '중급', description: '가슴 근육을 발달시키는 대표적인 복합 운동입니다. 바벨을 이용하여 가슴 위에서 밀어올립니다.', tips: ['어깨를 뒤로 모아 견갑골을 고정합니다', '바벨을 가슴 중앙으로 내립니다', '팔꿈치 각도를 약 75도로 유지합니다', '발을 바닥에 단단히 고정합니다'], caution: '과도한 무게 사용 시 어깨 부상 위험이 있습니다. 스팟터와 함께 운동하세요.' },
  { id: 2, name: '인클라인 벤치프레스', category: '가슴', difficulty: '중급', description: '상부 가슴을 집중적으로 발달시키는 운동입니다. 벤치를 30~45도 각도로 기울여 수행합니다.', tips: ['벤치 각도를 30~45도로 설정합니다', '바벨을 쇄골 방향으로 내립니다', '어깨가 올라가지 않도록 주의합니다', '호흡은 내릴 때 흡, 올릴 때 호로 합니다'], caution: '각도가 너무 높으면 어깨에 부담이 됩니다.' },
  { id: 3, name: '덤벨 플라이', category: '가슴', difficulty: '초급', description: '가슴 근육의 스트레칭과 수축을 극대화하는 고립 운동입니다.', tips: ['팔꿈치를 살짝 구부린 상태를 유지합니다', '덤벨을 천천히 옆으로 벌립니다', '가슴 근육의 수축을 느끼며 모읍니다', '과도하게 벌리지 않도록 합니다'], caution: '무거운 무게보다 정확한 자세와 가동범위에 집중하세요.' },
  { id: 4, name: '랫풀다운', category: '등', difficulty: '초급', description: '등 근육의 넓이를 발달시키는 대표적인 운동입니다. 케이블 머신을 이용합니다.', tips: ['그립 너비를 어깨보다 넓게 잡습니다', '가슴을 들고 등을 약간 뒤로 기울입니다', '바를 쇄골 쪽으로 당깁니다', '팔이 아닌 등 근육으로 당기는 느낌을 유지합니다'], caution: '목 뒤로 당기는 동작은 어깨 부상 위험이 있습니다.' },
  { id: 5, name: '바벨 로우', category: '등', difficulty: '중급', description: '등 두께를 키우는 복합 운동입니다. 바벨을 허리 쪽으로 당깁니다.', tips: ['허리를 곧게 펴고 상체를 약 45도로 숙입니다', '바벨을 배꼽 방향으로 당깁니다', '견갑골을 모아주며 등을 수축합니다', '코어를 단단히 잡아 허리를 보호합니다'], caution: '허리가 둥글게 말리면 허리 부상 위험이 높습니다.' },
  { id: 6, name: '데드리프트', category: '등', difficulty: '고급', description: '전신 근력을 키우는 최고의 복합 운동입니다. 등, 하체, 코어를 동시에 훈련합니다.', tips: ['발은 어깨 너비로 벌리고 바벨에 가깝게 섭니다', '허리를 곧게 펴고 엉덩이를 뒤로 빼며 내려갑니다', '바벨을 몸에 밀착시키며 올립니다', '상체를 일으킬 때 엉덩이와 무릎을 동시에 펴줍니다'], caution: '허리를 둥글게 하면 심각한 부상을 입을 수 있습니다. 초보자는 반드시 가벼운 무게부터 시작하세요.' },
  { id: 7, name: '풀업', category: '등', difficulty: '고급', description: '자기 체중을 이용한 등 운동의 정석입니다. 광배근과 이두근을 훈련합니다.', tips: ['어깨 너비보다 넓게 봉을 잡습니다', '가슴을 봉 쪽으로 당기며 올라갑니다', '팔이 아닌 등으로 당기는 느낌을 유지합니다', '천천히 내려와 근육에 자극을 유지합니다'], caution: '어깨에 통증이 있으면 중단하세요. 보조 밴드를 활용할 수 있습니다.' },
  { id: 8, name: '오버헤드프레스', category: '어깨', difficulty: '중급', description: '어깨 전면과 측면을 발달시키는 기본 프레스 운동입니다.', tips: ['발을 어깨 너비로 벌립니다', '바벨을 쇄골 위에서 머리 위로 밀어올립니다', '코어를 잡고 허리가 과도하게 젖혀지지 않게 합니다', '완전히 팔을 편 상태에서 잠시 멈춥니다'], caution: '허리를 과도하게 젖히면 요통을 유발할 수 있습니다.' },
  { id: 9, name: '숄더프레스', category: '어깨', difficulty: '초급', description: '덤벨을 이용한 어깨 프레스 운동입니다. 삼각근 전면과 측면을 훈련합니다.', tips: ['덤벨을 어깨 높이에서 시작합니다', '수직 방향으로 밀어올립니다', '팔꿈치가 완전히 펴지기 직전에 멈춥니다', '천천히 내려와 어깨 근육의 긴장을 유지합니다'], caution: '목에 과도한 긴장이 가지 않도록 주의하세요.' },
  { id: 10, name: '사이드 레터럴 레이즈', category: '어깨', difficulty: '초급', description: '어깨 측면 삼각근을 발달시키는 고립 운동입니다.', tips: ['덤벨을 몸 옆에 들고 시작합니다', '팔꿈치를 살짝 구부린 채로 옆으로 들어올립니다', '어깨 높이까지만 올립니다', '내릴 때 천천히 조절하며 내립니다'], caution: '가벼운 무게로 정확한 자세를 유지하는 것이 중요합니다.' },
  { id: 11, name: '스쿼트', category: '하체', difficulty: '중급', description: '하체 전체를 훈련하는 대표적인 복합 운동입니다. 대퇴사두근, 둔근, 햄스트링을 발달시킵니다.', tips: ['발을 어깨 너비로 벌리고 발끝을 약간 바깥으로 향합니다', '엉덩이를 뒤로 빼며 앉습니다', '무릎이 발끝 방향과 일치하게 합니다', '허벅지가 바닥과 평행할 때까지 내려갑니다'], caution: '무릎이 안으로 모이면 부상 위험이 높습니다. 코어를 단단히 잡으세요.' },
  { id: 12, name: '레그프레스', category: '하체', difficulty: '초급', description: '머신을 이용한 하체 운동으로, 대퇴사두근을 집중적으로 훈련합니다.', tips: ['발을 어깨 너비로 발판에 놓습니다', '무릎을 90도까지 구부립니다', '발판을 밀 때 무릎을 완전히 잠그지 않습니다', '허리가 발판에서 뜨지 않게 합니다'], caution: '무릎을 완전히 펴면 관절에 과도한 부하가 걸립니다.' },
  { id: 13, name: '런지', category: '하체', difficulty: '초급', description: '한 발씩 번갈아 수행하는 하체 운동입니다. 균형감과 하체 근력을 동시에 발달시킵니다.', tips: ['한 발을 앞으로 크게 내딛습니다', '뒷무릎이 바닥에 거의 닿을 때까지 내려갑니다', '앞무릎이 발끝을 넘지 않게 합니다', '상체를 곧게 유지합니다'], caution: '무릎에 통증이 있으면 가동범위를 줄여서 수행하세요.' },
  { id: 14, name: '레그컬', category: '하체', difficulty: '초급', description: '햄스트링(허벅지 뒤쪽)을 집중적으로 훈련하는 고립 운동입니다.', tips: ['패드를 발목 위에 맞춥니다', '천천히 다리를 구부립니다', '최대 수축 지점에서 잠시 멈춥니다', '내릴 때 중력에 의존하지 말고 천천히 합니다'], caution: '급격한 동작은 햄스트링 경련을 유발할 수 있습니다.' },
  { id: 15, name: '바이셉 컬', category: '팔', difficulty: '초급', description: '이두근을 발달시키는 대표적인 고립 운동입니다.', tips: ['팔꿈치를 몸통 옆에 고정합니다', '손목을 고정한 채 팔을 구부립니다', '최대 수축 시 잠시 멈춥니다', '천천히 내려 근육의 긴장을 유지합니다'], caution: '팔꿈치가 움직이면 효과가 줄어듭니다.' },
  { id: 16, name: '트라이셉 푸시다운', category: '팔', difficulty: '초급', description: '삼두근을 훈련하는 케이블 운동입니다.', tips: ['팔꿈치를 몸통 옆에 고정합니다', '케이블을 아래로 밀어내립니다', '팔이 완전히 펴지면 삼두근을 조입니다', '천천히 시작 위치로 돌아옵니다'], caution: '어깨가 올라가지 않도록 주의하세요.' },
  { id: 17, name: '해머 컬', category: '팔', difficulty: '초급', description: '이두근과 전완근을 동시에 훈련하는 운동입니다. 덤벨을 중립 그립으로 들어올립니다.', tips: ['덤벨을 몸 옆에 중립 그립으로 잡습니다', '팔꿈치를 고정하고 들어올립니다', '양팔을 번갈아가며 수행합니다', '반동을 사용하지 않습니다'], caution: '반동을 사용하면 효과가 줄어들고 부상 위험이 있습니다.' },
  { id: 18, name: '플랭크', category: '코어', difficulty: '초급', description: '코어 안정성을 키우는 기본 운동입니다. 전신 근육을 사용합니다.', tips: ['팔꿈치를 어깨 아래에 놓습니다', '몸을 일직선으로 유지합니다', '엉덩이가 올라가거나 처지지 않게 합니다', '호흡을 멈추지 않고 자연스럽게 합니다'], caution: '허리에 통증이 느껴지면 즉시 중단하세요.' },
  { id: 19, name: '크런치', category: '코어', difficulty: '초급', description: '복직근(식스팩) 상부를 훈련하는 기본 복근 운동입니다.', tips: ['무릎을 구부리고 발을 바닥에 둡니다', '손을 가슴 위에 교차하거나 귀 옆에 놓습니다', '상체를 들어올릴 때 복근에 집중합니다', '목이 아닌 복근으로 상체를 들어올립니다'], caution: '목을 당기면 경추에 부담이 됩니다. 시선은 천장을 향합니다.' },
  { id: 20, name: '러시안 트위스트', category: '코어', difficulty: '중급', description: '복사근(옆구리)을 훈련하는 회전 운동입니다.', tips: ['상체를 약 45도로 기울입니다', '발을 바닥에서 살짝 들어올립니다', '상체를 좌우로 회전합니다', '메디슨볼이나 덤벨로 강도를 높일 수 있습니다'], caution: '허리에 과도한 비틀림이 가지 않도록 조절하세요.' },
];

const TABS: Category[] = ['전체', '가슴', '등', '어깨', '하체', '팔', '코어'];

const difficultyColor: Record<Difficulty, string> = {
  '초급': 'bg-state-success/10 text-state-success',
  '중급': 'bg-state-warning/10 text-state-warning',
  '고급': 'bg-state-error/10 text-state-error',
};

const categoryTagColor: Record<string, string> = {
  '가슴': 'bg-state-error/10 text-state-error',
  '등': 'bg-state-info/10 text-state-info',
  '어깨': 'bg-state-warning/10 text-state-warning',
  '하체': 'bg-state-success/10 text-state-success',
  '팔': 'bg-primary-light text-primary',
  '코어': 'bg-accent-light text-accent',
};

/** 운동가이드 페이지 */
export default function ExerciseGuide() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Category>(() => {
    const nextTab = searchParams.get('category');
    return TABS.includes(nextTab as Category) ? (nextTab as Category) : '전체';
  });
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    const nextTab = searchParams.get('category');
    setActiveTab(TABS.includes(nextTab as Category) ? (nextTab as Category) : '전체');
    const exerciseId = Number(searchParams.get('exercise') || '0');
    setSelectedExercise(EXERCISES.find((item) => item.id === exerciseId) || null);
  }, [searchParams]);

  const filtered = activeTab === '전체'
    ? EXERCISES
    : EXERCISES.filter((e) => e.category === activeTab);

  return (
    <div className="min-h-screen bg-surface-secondary">
      <PageHeader title="운동 가이드" onBack={() => navigate(-1)} />

      {/* 카테고리 탭 */}
      <div className="bg-surface overflow-x-auto no-scrollbar py-3 snap-x snap-proximity">
        <div className="flex w-max min-w-full gap-2 px-4">
          {TABS.map((tab) => (
            <Chip
              key={tab}
              active={activeTab === tab}
              onClick={() => {
                setActiveTab(tab);
                const next = new URLSearchParams(searchParams);
                if (tab === '전체') next.delete('category');
                else next.set('category', tab);
                setSearchParams(next, { replace: true });
              }}
            >
              {tab}
            </Chip>
          ))}
        </div>
      </div>

      {/* 운동 카드 목록 */}
      <div className="px-4 mt-3 pb-4 space-y-3">
        {filtered.map((exercise) => (
          <div
            key={exercise.id}
            onClick={() => setSelectedExercise(exercise)}
            className="bg-surface rounded-card p-4 shadow-card-soft touch-card cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-base truncate">{exercise.name}</h3>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded-pill font-medium', categoryTagColor[exercise.category])}>
                    {exercise.category}
                  </span>
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded-pill font-medium', difficultyColor[exercise.difficulty])}>
                    {exercise.difficulty}
                  </span>
                </div>
                <p className="text-xs text-content-secondary line-clamp-2">{exercise.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-content-tertiary flex-shrink-0 mt-1" />
            </div>
          </div>
        ))}
      </div>

      {/* 상세 모달 */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedExercise(null)} />
          <div className="mobile-bottom-sheet relative bg-surface rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-surface px-5 pt-5 pb-3 border-b border-line flex items-center justify-between">
              <h2 className="font-bold text-lg">{selectedExercise.name}</h2>
              <button onClick={() => setSelectedExercise(null)}>
                <X className="w-6 h-6 text-content-secondary" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* 태그 */}
              <div className="flex items-center gap-2">
                <span className={cn('text-xs px-2 py-0.5 rounded-pill font-medium', categoryTagColor[selectedExercise.category])}>
                  {selectedExercise.category}
                </span>
                <span className={cn('text-xs px-2 py-0.5 rounded-pill font-medium', difficultyColor[selectedExercise.difficulty])}>
                  {selectedExercise.difficulty}
                </span>
              </div>

              {/* 설명 */}
              <div>
                <h3 className="font-semibold text-sm mb-2">운동 설명</h3>
                <p className="text-sm text-content-secondary leading-relaxed">{selectedExercise.description}</p>
              </div>

              {/* 올바른 자세 */}
              <div>
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-1">
                  <Target className="w-4 h-4 text-primary" />
                  올바른 자세 포인트
                </h3>
                <div className="space-y-2">
                  {selectedExercise.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 bg-surface-secondary rounded-card p-3">
                      <span className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-content-secondary">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 주의사항 */}
              <div className="bg-state-warning/5 border border-state-warning/20 rounded-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-state-warning" />
                  <h3 className="font-semibold text-sm text-state-warning">주의사항</h3>
                </div>
                <p className="text-sm text-content-secondary">{selectedExercise.caution}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
