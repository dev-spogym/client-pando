'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Plus,
  X,
  Eye,
  Camera,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, Card, Button, Chip } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { getTrainerById, SPECIALTY_OPTIONS } from '@/lib/marketplace';
import type { Specialty } from '@/lib/marketplace';
import { cn } from '@/lib/utils';

const CATEGORY_OPTIONS = [
  { id: 'pt', label: 'PT' },
  { id: 'pilates', label: '필라테스' },
  { id: 'yoga', label: '요가' },
  { id: 'golf', label: '골프' },
  { id: 'crossfit', label: '크로스핏' },
  { id: 'spinning', label: '스피닝' },
  { id: 'boxing', label: '복싱' },
  { id: 'swimming', label: '수영' },
  { id: 'fitness', label: '헬스' },
] as const;

type CategoryId = (typeof CATEGORY_OPTIONS)[number]['id'];

const DAYS = ['월', '화', '수', '목', '금', '토', '일'] as const;
type DayKey = (typeof DAYS)[number];

interface DaySchedule {
  enabled: boolean;
  slots: string[];
}

type WeeklySchedule = Record<DayKey, DaySchedule>;

function buildDefaultSchedule(): WeeklySchedule {
  const result = {} as WeeklySchedule;
  for (const day of DAYS) {
    result[day] = { enabled: false, slots: [] };
  }
  // 기본값: 월~금 활성화
  (['월', '화', '수', '목', '금'] as DayKey[]).forEach((d) => {
    result[d] = { enabled: true, slots: ['10:00-12:00', '14:00-18:00'] };
  });
  return result;
}

export default function TrainerMarketProfile() {
  const navigate = useNavigate();
  const { trainer } = useAuthStore();

  const marketTrainer = getTrainerById(trainer?.id ?? 1);

  // ── 편집 가능한 필드들 ─────────────────────────────────────
  const [category, setCategory] = useState<CategoryId>(
    (marketTrainer?.category as CategoryId) ?? 'pt'
  );
  const [experienceYears, setExperienceYears] = useState(
    marketTrainer?.experienceYears ?? 3
  );
  const [gender, setGender] = useState<'M' | 'F'>(marketTrainer?.gender ?? 'M');
  const [bio, setBio] = useState(marketTrainer?.bio ?? '');
  const [specialties, setSpecialties] = useState<Specialty[]>(
    marketTrainer?.specialties ?? []
  );
  const [certifications, setCertifications] = useState<string[]>(
    marketTrainer?.certifications ?? []
  );
  const [newCertInput, setNewCertInput] = useState('');
  const [showCertInput, setShowCertInput] = useState(false);
  const [schedule, setSchedule] = useState<WeeklySchedule>(buildDefaultSchedule);
  const [marketExposed, setMarketExposed] = useState(true);
  const [acceptTrial, setAcceptTrial] = useState(true);

  const lastUpdated = '2026-04-29';

  // ── 자격 추가/삭제 ────────────────────────────────────────
  function addCert() {
    if (!newCertInput.trim()) return;
    setCertifications((prev) => [...prev, newCertInput.trim()]);
    setNewCertInput('');
    setShowCertInput(false);
  }

  function removeCert(idx: number) {
    setCertifications((prev) => prev.filter((_, i) => i !== idx));
  }

  // ── 전문분야 토글 ─────────────────────────────────────────
  function toggleSpecialty(s: Specialty) {
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  // ── 가능 시간 요일 토글 ───────────────────────────────────
  function toggleDay(day: DayKey) {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
  }

  function addSlot(day: DayKey) {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], slots: [...prev[day].slots, '09:00-10:00'] },
    }));
  }

  function removeSlot(day: DayKey, idx: number) {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((_, i) => i !== idx),
      },
    }));
  }

  // ── 저장 ─────────────────────────────────────────────────
  function handleSave() {
    toast.success('프로필이 마켓에 반영되었습니다');
  }

  function handleTempSave() {
    toast('임시저장 완료', { description: '마켓에는 아직 반영되지 않았습니다.' });
  }

  // 전문분야: 선택된 것 먼저
  const sortedSpecialties = [...SPECIALTY_OPTIONS].sort((a, b) => {
    const aSelected = specialties.includes(a);
    const bSelected = specialties.includes(b);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return 0;
  });

  return (
    <div className="flex flex-col min-h-screen bg-surface-secondary">
      <PageHeader showBack title="마켓 프로필 편집" />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-32">

        {/* 미리보기 배너 */}
        <button
          type="button"
          onClick={() => navigate(`/trainers/${trainer?.id ?? 1}`)}
          className="w-full flex items-center justify-between px-4 py-3 bg-primary/10 border border-primary/20 rounded-card active:bg-primary/15 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            <span className="text-body-sm font-medium text-primary">회원이 보는 모습 미리보기</span>
          </div>
          <ChevronRight className="w-4 h-4 text-primary" />
        </button>

        {/* 섹션 1 — 프로필 사진 */}
        <Card variant="elevated" padding="md">
          <p className="text-body-sm font-semibold text-content mb-3">프로필 사진</p>
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={marketTrainer?.profileUrl ?? `https://picsum.photos/seed/trainer-${trainer?.id ?? 1}/200/200`}
                alt={marketTrainer?.name ?? '트레이너'}
                className="w-24 h-24 rounded-card object-cover"
              />
              <div className="absolute inset-0 rounded-card bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-sm text-content-secondary mb-2">
                정사각 비율을 권장합니다 (최소 200×200px)
              </p>
              <Button variant="outline" size="sm">
                <Camera className="w-3.5 h-3.5 mr-1.5" />
                사진 변경
              </Button>
            </div>
          </div>
        </Card>

        {/* 섹션 2 — 기본 정보 */}
        <Card variant="elevated" padding="md">
          <p className="text-body-sm font-semibold text-content mb-3">기본 정보</p>
          <div className="space-y-3">
            {/* 이름 (읽기전용) */}
            <div>
              <label className="text-caption text-content-secondary block mb-1">이름</label>
              <div className="h-11 px-3 rounded-card border border-line bg-surface-tertiary flex items-center">
                <span className="text-body text-content-secondary">
                  {marketTrainer?.name ?? trainer?.name ?? '김도윤'}
                </span>
              </div>
            </div>

            {/* 소속 센터 (읽기전용) */}
            <div>
              <label className="text-caption text-content-secondary block mb-1">소속 센터</label>
              <button
                type="button"
                onClick={() => toast.info('소속 센터 변경은 운영팀을 통해 가능합니다.')}
                className="w-full h-11 px-3 rounded-card border border-line bg-surface-tertiary flex items-center justify-between"
              >
                <span className="text-body text-content-secondary">
                  {marketTrainer?.centerName ?? 'FitGenie 광화문점'}
                </span>
                <ChevronRight className="w-4 h-4 text-content-tertiary" />
              </button>
            </div>

            {/* 카테고리 */}
            <div>
              <label className="text-caption text-content-secondary block mb-1.5">카테고리</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCategory(opt.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-pill text-body-sm font-medium border transition-colors',
                      category === opt.id
                        ? 'bg-primary text-white border-primary'
                        : 'bg-surface border-line text-content-secondary active:bg-surface-tertiary'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 경력 년수 */}
            <div>
              <label className="text-caption text-content-secondary block mb-1">경력 (년)</label>
              <input
                type="number"
                min={0}
                max={40}
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full h-11 px-3 rounded-card border border-line bg-surface-secondary text-body text-content outline-none focus:border-primary/70 transition-colors"
              />
            </div>

            {/* 성별 */}
            <div>
              <label className="text-caption text-content-secondary block mb-1.5">성별</label>
              <div className="flex gap-2">
                {(['M', 'F'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={cn(
                      'flex-1 h-11 rounded-card text-body-sm font-medium border transition-colors',
                      gender === g
                        ? 'bg-primary text-white border-primary'
                        : 'bg-surface border-line text-content-secondary active:bg-surface-tertiary'
                    )}
                  >
                    {g === 'M' ? '남' : '여'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* 섹션 3 — 자기소개 */}
        <Card variant="elevated" padding="md">
          <div className="flex items-center justify-between mb-3">
            <p className="text-body-sm font-semibold text-content">자기소개</p>
            <span
              className={cn(
                'text-caption',
                bio.length > 280 ? 'text-state-error' : 'text-content-tertiary'
              )}
            >
              {bio.length}/300
            </span>
          </div>
          <textarea
            value={bio}
            onChange={(e) => {
              if (e.target.value.length <= 300) setBio(e.target.value);
            }}
            placeholder="회원에게 보여줄 자기소개를 작성해주세요 (300자 이내)"
            rows={5}
            className="w-full px-3 py-2.5 rounded-card border border-line bg-surface-secondary text-body text-content placeholder:text-content-tertiary outline-none focus:border-primary/70 transition-colors resize-none"
          />
        </Card>

        {/* 섹션 4 — 전문 분야 */}
        <Card variant="elevated" padding="md">
          <p className="text-body-sm font-semibold text-content mb-3">전문 분야</p>
          <div className="flex flex-wrap gap-2">
            {sortedSpecialties.map((s) => {
              const selected = specialties.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSpecialty(s)}
                  className={cn(
                    'px-3 py-1.5 rounded-pill text-body-sm font-medium border transition-colors',
                    selected
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface border-line text-content-secondary active:bg-surface-tertiary'
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
          {specialties.length > 0 && (
            <p className="text-caption text-content-tertiary mt-2">
              선택됨: {specialties.join(', ')}
            </p>
          )}
        </Card>

        {/* 섹션 5 — 자격 및 이력 */}
        <Card variant="elevated" padding="md">
          <p className="text-body-sm font-semibold text-content mb-3">자격 및 이력</p>
          <div className="space-y-2">
            {certifications.map((cert, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-2.5 bg-surface-secondary rounded-card"
              >
                <span className="flex-1 text-body-sm text-content">{cert}</span>
                <button
                  type="button"
                  onClick={() => removeCert(idx)}
                  className="w-6 h-6 flex items-center justify-center rounded-full active:bg-surface-tertiary text-content-tertiary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {certifications.length === 0 && (
              <p className="text-body-sm text-content-tertiary py-2">
                등록된 자격·이력이 없습니다.
              </p>
            )}
          </div>

          {showCertInput ? (
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={newCertInput}
                onChange={(e) => setNewCertInput(e.target.value)}
                placeholder="예) NSCA-CPT"
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') addCert(); }}
                className="flex-1 h-10 px-3 rounded-card border border-line bg-surface-secondary text-body text-content placeholder:text-content-tertiary outline-none focus:border-primary/70 transition-colors"
              />
              <button
                type="button"
                onClick={addCert}
                className="h-10 px-4 rounded-card bg-primary text-white text-body-sm font-medium active:bg-primary-dark transition-colors"
              >
                추가
              </button>
              <button
                type="button"
                onClick={() => { setShowCertInput(false); setNewCertInput(''); }}
                className="h-10 px-3 rounded-card border border-line text-content-secondary text-body-sm active:bg-surface-tertiary transition-colors"
              >
                취소
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowCertInput(true)}
              className="mt-3 flex items-center gap-1.5 text-body-sm text-primary font-medium active:opacity-70 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              자격 추가
            </button>
          )}
        </Card>

        {/* 섹션 6 — 가능 시간 */}
        <Card variant="elevated" padding="md">
          <p className="text-body-sm font-semibold text-content mb-3">가능 시간</p>
          <div className="space-y-3">
            {/* 요일 칩 */}
            <div className="flex gap-1.5 flex-wrap">
              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={cn(
                    'w-10 h-10 rounded-full text-body-sm font-semibold border transition-colors',
                    schedule[day].enabled
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface border-line text-content-secondary active:bg-surface-tertiary'
                  )}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* 활성 요일별 시간 슬롯 */}
            {DAYS.filter((d) => schedule[d].enabled).map((day) => (
              <div key={day} className="bg-surface-secondary rounded-card p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-body-sm font-medium text-content">{day}요일</span>
                  <button
                    type="button"
                    onClick={() => addSlot(day)}
                    className="flex items-center gap-1 text-caption text-primary font-medium active:opacity-70"
                  >
                    <Plus className="w-3 h-3" />
                    시간 추가
                  </button>
                </div>
                {schedule[day].slots.length === 0 ? (
                  <p className="text-caption text-content-tertiary">시간대를 추가해주세요</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {schedule[day].slots.map((slot, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-surface rounded-pill border border-line"
                      >
                        <span className="text-caption text-content">{slot}</span>
                        <button
                          type="button"
                          onClick={() => removeSlot(day, idx)}
                          className="text-content-tertiary active:text-content-secondary"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* 섹션 7 — 마켓 노출 */}
        <Card variant="elevated" padding="md">
          <p className="text-body-sm font-semibold text-content mb-3">마켓 노출 설정</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-sm text-content">마켓에 노출</p>
                <p className="text-caption text-content-tertiary mt-0.5">
                  회원이 강사 탐색에서 나를 볼 수 있습니다
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMarketExposed((v) => !v)}
                className="shrink-0"
                aria-label="마켓 노출 토글"
              >
                {marketExposed ? (
                  <ToggleRight className="w-8 h-8 text-primary" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-content-tertiary" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-sm text-content">체험권 받기</p>
                <p className="text-caption text-content-tertiary mt-0.5">
                  신규 회원의 체험 신청을 받습니다
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAcceptTrial((v) => !v)}
                className="shrink-0"
                aria-label="체험권 수신 토글"
              >
                {acceptTrial ? (
                  <ToggleRight className="w-8 h-8 text-primary" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-content-tertiary" />
                )}
              </button>
            </div>

            <div className="pt-2 border-t border-line">
              <p className="text-caption text-content-tertiary">
                마지막 업데이트: {lastUpdated}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 하단 sticky 액션 바 */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-line px-4 py-3 pb-safe flex gap-3 z-20">
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={handleTempSave}
        >
          임시저장
        </Button>
        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          onClick={handleSave}
        >
          마켓에 반영
        </Button>
      </div>
    </div>
  );
}
