import { test, expect, type Page, type ConsoleMessage } from '@playwright/test';
import { appendFileSync, mkdirSync } from 'node:fs';
import { ALL_ROUTES, toUrl, type RouteCase } from './routes';

const CONSOLE_LOG = 'tests/.report/console-errors.log';
try { mkdirSync('tests/.report', { recursive: true }); } catch { /* noop */ }

/**
 * 전 화면 스모크: preview 모드로 각 라우트를 직접 진입해
 * (1) 런타임 크래시 (2) Next 에러 오버레이 (3) 404/로그인 리다이렉트
 * (4) 빈 렌더 (5) 콘솔 에러 를 잡는다.
 */

const BENIGN_CONSOLE = [
  /favicon/i,
  /ResizeObserver loop/i,
  /Download the React DevTools/i,
  /\[Fast Refresh\]/i,
  /Supabase/i, // preview 모드에서 미사용 경로의 네트워크 경고는 무시
  /Failed to load resource/i, // mock 이미지(picsum 등) 404
  /net::ERR/i,
  /the server responded with a status of 4\d\d/i,
];

function isBenign(text: string): boolean {
  return BENIGN_CONSOLE.some((re) => re.test(text));
}

interface RouteResult {
  consoleErrors: string[];
  pageErrors: string[];
}

async function visit(page: Page, route: RouteCase): Promise<RouteResult> {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  const onConsole = (msg: ConsoleMessage) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!isBenign(text)) consoleErrors.push(text);
    }
  };
  const onPageError = (err: Error) => {
    pageErrors.push(err.message);
  };

  page.on('console', onConsole);
  page.on('pageerror', onPageError);

  try {
    await page.goto(toUrl(route), { waitUntil: 'domcontentloaded' });
    // 클라이언트 렌더/preview 세션 주입이 끝날 시간을 준다.
    await page.waitForTimeout(1200);
  } finally {
    page.off('console', onConsole);
    page.off('pageerror', onPageError);
  }

  return { consoleErrors, pageErrors };
}

for (const route of ALL_ROUTES) {
  const title = `[${route.role}] ${route.ma ? route.ma + ' ' : ''}${route.label} (${route.path})`;

  test(title, async ({ page }) => {
    const { consoleErrors, pageErrors } = await visit(page, route);

    const finalUrl = page.url();
    const bodyText = (await page.locator('body').innerText().catch(() => '')) || '';

    // 1) 런타임 예외
    expect(pageErrors, `런타임 예외:\n${pageErrors.join('\n')}`).toEqual([]);

    // 2) Next dev 에러 오버레이 (getByText는 open shadow DOM을 관통한다)
    const overlay = page.getByText(
      /Unhandled Runtime Error|Build Error|Failed to compile|This page could not be found/i,
    );
    expect(await overlay.count(), 'Next 에러 오버레이 노출됨').toBe(0);

    // 3) 404 / 의도치 않은 로그인 리다이렉트
    expect(bodyText, '앱 NotFound 화면 렌더됨').not.toContain('페이지를 찾을 수 없습니다');
    if (route.role !== 'public') {
      expect(finalUrl, `로그인으로 리다이렉트됨 (preview 세션 주입 실패): ${finalUrl}`).not.toMatch(/\/login(\?|$)/);
    }

    // 4) 빈 렌더 (로딩 스피너만 남은 경우 포함)
    expect(bodyText.trim().length, '본문이 비어있음').toBeGreaterThan(20);
    expect(bodyText, '로딩 스피너에서 멈춤').not.toBe('로딩 중...');

    // 4-1) 데이터 미해소로 인한 빈 상세(EmptyState) 감지 — 기록만 (mock ID 불일치/데이터 누락 탐지)
    const EMPTY_SIGNS = ['찾을 수 없', '정보가 없', '불러올 수 없', '주문을 찾을 수 없', '존재하지 않'];
    const emptyHit = EMPTY_SIGNS.find((s) => bodyText.includes(s));
    if (emptyHit) {
      appendFileSync(CONSOLE_LOG, `### [EMPTY] ${title}\n  - 빈 상태 문구 감지: "${emptyHit}"\n\n`);
      test.info().annotations.push({ type: 'empty-state', description: emptyHit });
    }

    // 5) 콘솔 에러는 사이드카 로그에 기록 (실패시키지 않음, 리뷰용)
    if (consoleErrors.length) {
      test.info().annotations.push({
        type: 'console-error',
        description: consoleErrors.slice(0, 5).join(' | '),
      });
      appendFileSync(
        CONSOLE_LOG,
        `### ${title}\n${consoleErrors.map((e) => '  - ' + e).join('\n')}\n\n`,
      );
    }

    // 6) 화면별 스크린샷 갤러리 저장 (눈으로 전수 대조용)
    const safe = `${route.role}__${route.path}`.replace(/[^a-zA-Z0-9가-힣]+/g, '_').replace(/^_|_$/g, '');
    await page.screenshot({ path: `tests/.shots/${safe}.png`, fullPage: true }).catch(() => {});
  });
}
