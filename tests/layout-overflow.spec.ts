import { test, expect } from '@playwright/test';

/**
 * 레이아웃 회귀 가드: 데스크톱 검수 폭(2단 레이아웃)에서 fixed 오버레이/액션바가
 * 앱 프레임을 벗어나 오른쪽 설명 패널로 새지 않는지 검증한다.
 * (.mobile-frame containing block 정책이 깨지면 여기서 실패한다.)
 */
test.use({ viewport: { width: 1440, height: 900 } });

const M = '?preview=1&role=member';
const TR = '?preview=1&role=trainer';

test('필터 바텀시트가 프레임 안에 머문다', async ({ page }) => {
  await page.goto(`/trainers${M}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  // 필터 아이콘 클릭
  await page.getByRole('button', { name: '필터' }).first().click();
  await page.waitForTimeout(500);
  await expect(page.getByText('필터 · 정렬')).toBeVisible();
  // 시트 패널의 오른쪽 끝이 프레임 오른쪽 끝을 넘지 않아야 한다
  const frame = page.locator('.mobile-frame');
  const sheet = page.locator('.mobile-bottom-sheet');
  const fb = await frame.boundingBox();
  const sb = await sheet.boundingBox();
  console.log('FRAME', fb);
  console.log('SHEET', sb);
  expect(sb!.x + sb!.width).toBeLessThanOrEqual(fb!.x + fb!.width + 2);
  expect(sb!.x).toBeGreaterThanOrEqual(fb!.x - 2);
  await page.screenshot({ path: 'tests/.shots/verify-filter-sheet.png' });
});

test('결제 액션바가 프레임 안에 머문다', async ({ page }) => {
  await page.goto(`/checkout/pt-10${M}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  const frame = page.locator('.mobile-frame');
  const bar = page.locator('.bottom-action-bar').first();
  const fb = await frame.boundingBox();
  const bb = await bar.boundingBox();
  console.log('FRAME', fb);
  console.log('ACTIONBAR', bb);
  expect(bb!.x + bb!.width).toBeLessThanOrEqual(fb!.x + fb!.width + 2);
  expect(bb!.x).toBeGreaterThanOrEqual(fb!.x - 2);
  await page.screenshot({ path: 'tests/.shots/verify-actionbar.png' });
});

test('검수기준 섹션이 설명 패널에서 사라졌다', async ({ page }) => {
  await page.goto(`/trainers${M}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await expect(page.getByText('퍼블리싱 검수 기준')).toHaveCount(0);
});
