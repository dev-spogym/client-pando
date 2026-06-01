'use client';

import Link from 'next/link';
import { ArrowRight, LayoutGrid, Smartphone } from 'lucide-react';
import { memberPublishingScreens } from './member/screens';
import { trainerPublishingScreens } from './trainer/screens';
import { fcPublishingScreens } from './fc/screens';
import { staffPublishingScreens } from './staff/screens';
import type { PublishingScreenSpec } from './member/ui';

interface RoleEntry {
  key: string;
  label: string;
  description: string;
  accent: string;
  screens: PublishingScreenSpec[];
}

const ROLES: RoleEntry[] = [
  {
    key: 'member',
    label: '공통 · 회원',
    description: '홈·예약·QR·이용권·결제·리워드·커뮤니티 등 회원 전체 흐름',
    accent: 'from-teal-500 to-teal-700',
    screens: memberPublishingScreens,
  },
  {
    key: 'trainer',
    label: '트레이너 · 골프강사',
    description: '수업 시작/완료·서명·담당 회원·체성분·성과 등 현장 업무',
    accent: 'from-emerald-500 to-emerald-700',
    screens: trainerPublishingScreens,
  },
  {
    key: 'fc',
    label: 'FC',
    description: '상담 등록·리드·만료 예정·재등록 상담·KPI',
    accent: 'from-cyan-500 to-cyan-700',
    screens: fcPublishingScreens,
  },
  {
    key: 'staff',
    label: '스태프',
    description: '회원 조회·수동 출석·수업 일정·업무 알림',
    accent: 'from-sky-500 to-sky-700',
    screens: staffPublishingScreens,
  },
];

/** /publishing 허브 — 역할별 퍼블리싱 갤러리를 한곳에 모은 진입 화면 */
export default function PublishingHub() {
  const totalScreens = ROLES.reduce((sum, role) => sum + role.screens.length, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-5 py-12">
        {/* 헤더 */}
        <header className="mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-[12px] font-semibold text-teal-700">
            <LayoutGrid className="h-3.5 w-3.5" />
            퍼블리싱 갤러리
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            FitGenie 회원앱 화면 모음
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            역할별 퍼블리싱 화면을 한곳에 모았습니다. 각 갤러리는 실제 앱 화면(preview 모드)을 그대로 보여주며,
            오른쪽 패널에서 기획 기준 설명을 함께 확인할 수 있습니다.
          </p>
          <p className="mt-3 text-sm font-medium text-slate-500">
            총 <span className="text-teal-700">{totalScreens}</span>개 화면 · {ROLES.length}개 역할
          </p>
        </header>

        {/* 역할 카드 그리드 */}
        <div className="grid gap-5 sm:grid-cols-2">
          {ROLES.map((role) => {
            const categories = Array.from(new Set(role.screens.map((s) => s.category)));
            return (
              <Link
                key={role.key}
                href={`/publishing/${role.key}`}
                className="group rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_90px_-44px_rgba(15,23,42,0.5)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${role.accent} text-white`}
                  >
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                    {role.screens.length}개 화면
                  </span>
                </div>

                <h2 className="mt-4 text-xl font-bold text-slate-900">{role.label}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{role.description}</p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {categories.slice(0, 6).map((category) => (
                    <span
                      key={category}
                      className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-inset ring-slate-200"
                    >
                      {category}
                    </span>
                  ))}
                  {categories.length > 6 && (
                    <span className="px-1 py-1 text-[11px] font-medium text-slate-400">
                      +{categories.length - 6}
                    </span>
                  )}
                </div>

                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700">
                  갤러리 열기
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>

        <footer className="mt-10 text-center text-xs text-slate-400">
          클라이언트 검수용 내부 화면입니다. 운영 사용자용 주요 기능 화면은 아닙니다.
        </footer>
      </div>
    </div>
  );
}
