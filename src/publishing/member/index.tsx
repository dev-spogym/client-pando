import { useMemo, useState } from 'react';
import { FolderKanban, LayoutGrid, Search, Smartphone } from 'lucide-react';
import { memberPublishingScreens } from './screens';
import { PhoneFrame, PreviewCard } from './ui';

const stateFilters = ['전체', '기본', '탭', '모달', '완료', '에러'] as const;

export default function MemberPublishingGallery() {
  const [category, setCategory] = useState('전체');
  const [state, setState] = useState<(typeof stateFilters)[number]>('전체');
  const [query, setQuery] = useState('');

  const categories = useMemo(
    () => ['전체', ...Array.from(new Set(memberPublishingScreens.map((screen) => screen.category)))],
    []
  );

  const filtered = useMemo(() => {
    return memberPublishingScreens.filter((screen) => {
      const matchedCategory = category === '전체' || screen.category === category;
      const matchedState = state === '전체' || screen.state === state;
      const matchedQuery =
        !query ||
        `${screen.title} ${screen.route} ${screen.note}`.toLowerCase().includes(query.toLowerCase());

      return matchedCategory && matchedState && matchedQuery;
    });
  }, [category, query, state]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, typeof filtered>>((acc, screen) => {
      if (!acc[screen.category]) acc[screen.category] = [];
      acc[screen.category].push(screen);
      return acc;
    }, {});
  }, [filtered]);

  const totalCount = memberPublishingScreens.length;
  const modalCount = memberPublishingScreens.filter((screen) => screen.state === '모달').length;
  const tabCount = memberPublishingScreens.filter((screen) => screen.state === '탭').length;

  return (
    <div className="h-[100dvh] overflow-y-auto overscroll-y-contain bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,#f8fafc_28%,#fff7ed_62%,#ffffff_100%)]">
      <div className="mx-auto max-w-[1600px] px-4 py-6 pb-10 sm:px-6 lg:px-8">
        <header className="rounded-[36px] border border-white/80 bg-white/80 p-6 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.32)] backdrop-blur">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                <FolderKanban className="h-4 w-4" />
                member publishing folder
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                회원앱 퍼블리싱 갤러리
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
                실제 회원앱 라우트를 그대로 iframe으로 묶은 퍼블리싱 갤러리입니다. 별도 복제 화면이 아니라
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.95em]">preview=1</code> 모드의 실제 페이지를 그대로 보여줍니다.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatCard icon={Smartphone} label="전체 퍼블리싱 화면" value={`${totalCount}장`} />
              <StatCard icon={LayoutGrid} label="모달 / 시트 상태" value={`${modalCount}장`} />
              <StatCard icon={FolderKanban} label="탭 / 상태 분기" value={`${tabCount}장`} />
            </div>
          </div>
        </header>

        <section className="mt-6 rounded-[32px] border border-white/80 bg-white/80 p-5 shadow-[0_22px_70px_-36px_rgba(15,23,42,0.25)] backdrop-blur">
          <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">검색</label>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="화면명, 경로, 설명으로 검색"
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">상태 필터</p>
              <div className="flex flex-wrap gap-2">
                {stateFilters.map((item) => (
                  <button
                    key={item}
                    onClick={() => setState(item)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      state === item ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold text-slate-700">카테고리 필터</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    category === item ? 'bg-primary text-white' : 'bg-primary-light text-primary'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 space-y-8">
          {Object.keys(grouped).length === 0 ? (
            <div className="rounded-[32px] border border-dashed border-slate-300 bg-white/70 p-12 text-center text-sm text-slate-500">
              조건에 맞는 퍼블리싱 화면이 없습니다.
            </div>
          ) : (
            Object.entries(grouped).map(([groupName, screens]) => (
              <div key={groupName}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{groupName}</h2>
                    <p className="text-sm text-slate-500">{screens.length}장</p>
                  </div>
                </div>

                <div className="grid gap-6 2xl:grid-cols-2">
                  {screens.map((screen) => (
                    <PreviewCard key={screen.id} screen={screen}>
                      <PhoneFrame>
                        <iframe
                          title={screen.title}
                          src={screen.url}
                          className="h-[720px] w-full border-0 bg-white"
                          loading="lazy"
                        />
                      </PhoneFrame>
                    </PreviewCard>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Smartphone;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
