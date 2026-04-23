import { FolderKanban } from 'lucide-react';
import { PreviewCard, PhoneFrame } from '@/publishing/member/ui';
import { staffPublishingScreens } from './screens';

export default function StaffPublishingGallery() {
  return (
    <div className="min-h-screen overflow-y-auto bg-[radial-gradient(circle_at_top_left,#e2e8f0_0%,#f1f5f9_28%,#f8fafc_62%,#ffffff_100%)]">
      <div className="mx-auto max-w-[1600px] px-4 py-6 pb-10 sm:px-6 lg:px-8">
        <header className="rounded-[36px] border border-white/80 bg-white/80 p-6 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.32)] backdrop-blur">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
            <FolderKanban className="h-4 w-4" />
            staff publishing folder
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">스태프 퍼블리싱 갤러리</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.95em]">preview=1&amp;role=staff</code> 기반 실제 스태프 라우트 갤러리입니다.
          </p>
        </header>

        <section className="mt-8 grid gap-6 2xl:grid-cols-2">
          {staffPublishingScreens.map((screen) => (
            <PreviewCard key={screen.id} screen={screen}>
              <PhoneFrame>
                <iframe title={screen.title} src={screen.url} className="h-[720px] w-full border-0 bg-white" loading="lazy" />
              </PhoneFrame>
            </PreviewCard>
          ))}
        </section>
      </div>
    </div>
  );
}
