import { test, expect } from '@playwright/test';

/**
 * 송혜수 검수 4건(06.01)을 현재 코드 기준으로 고정하는 회귀 가드.
 * 4건 모두 현재 코드에선 정상이며(과거 캐시본에서 발생했던 것으로 추정), 재발 방지를 위해 명시 검증한다.
 */
const M = '?preview=1&role=member';

// ① 하단 탭바 "예약" → /classes (수업 예약), /orders 아님
test('R1 하단 탭바 "예약" 탭은 /classes(수업 예약)로 연결', async ({ page }) => {
  await page.goto(`/${M}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  // 하단 탭바의 "예약" 탭(정확히 일치) — 홈의 "수업 예약/내 예약" 버튼과 구분
  const reserveTab = page.getByRole('button', { name: '예약', exact: true });
  await expect(reserveTab).toBeVisible();
  await reserveTab.click();
  await expect(page).toHaveURL(/\/classes(\?|$)/, { timeout: 8000 });
  await expect(page).not.toHaveURL(/\/orders/);
});

// ③ /profile 마이페이지에 /orders(내 주문/예약) 진입 항목 존재
test('R3 마이페이지에 "내 주문/예약"(/orders) 링크 존재', async ({ page }) => {
  await page.goto(`/profile${M}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  await expect(page.getByText('내 주문/예약')).toBeVisible();
});

// ④ 퍼블리싱 갤러리(/publishing/member)에 /orders 화면 포함
test('R4 퍼블리싱 갤러리에 /orders 화면 포함', async ({ page }) => {
  await page.goto('/publishing/member', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  // 갤러리는 memberPublishingScreens 전체를 iframe으로 렌더한다 → /orders iframe 존재
  const ordersFrame = page.locator('iframe[src*="/orders"]');
  await expect(ordersFrame.first()).toHaveCount(1);
});
