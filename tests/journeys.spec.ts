import { test, expect, type Page } from '@playwright/test';

/**
 * 핵심 유저 저니 심화 검증.
 * - preview 모드로 진입해 실제 버튼/입력/토스트를 클릭·검증한다.
 * - 토스트 문구는 sonner가 렌더하는 텍스트로 확인한다.
 * - 각 스텝 스크린샷은 playwright.config(screenshot:'on')으로 자동 저장된다.
 */

const M = '?preview=1&role=member';
const T = '?preview=1&role=trainer';
const G = '?preview=1&role=golf_trainer';
const F = '?preview=1&role=fc';
const S = '?preview=1&role=staff';

/** sonner 토스트 텍스트가 보이는지 확인 */
async function expectToast(page: Page, re: RegExp) {
  await expect(page.getByText(re).first()).toBeVisible({ timeout: 8000 });
}

async function settle(page: Page) {
  await page.waitForTimeout(800);
}

// ───────────────────────── 회원(member) ─────────────────────────

test('J1 예약 취소 — 예약된 미래 수업 취소 (MA-121)', async ({ page }) => {
  // 103: 내일 11:00 GX, preview 시드에서 예약 상태 → 미래 수업이라 액션바 노출
  await page.goto(`/classes/103${M}`, { waitUntil: 'domcontentloaded' });
  await settle(page);
  const cancelBtn = page.getByRole('button', { name: '예약 취소' });
  await expect(cancelBtn).toBeVisible();
  await cancelBtn.click();
  await expectToast(page, /예약이?\s*취소/);
});

test('J2 대기 예약 관리 — 대기 항목 취소 (MA-124)', async ({ page }) => {
  // 시드된 대기 항목(필라테스 리커버리, 2번 대기)을 관리 화면에서 취소 (시간 비의존)
  await page.goto(`/waitlist${M}`, { waitUntil: 'domcontentloaded' });
  await settle(page);
  await expect(page.getByText('필라테스 리커버리')).toBeVisible();
  await page.getByRole('button', { name: '대기 취소' }).first().click();
  await expectToast(page, /대기.*취소/);
});

test('J3 QR 입장 — preview 토큰으로 QR 정상 발급 (MA-110)', async ({ page }) => {
  await page.goto(`/qr${M}`, { waitUntil: 'domcontentloaded' });
  await settle(page);
  // 수정 후: preview에서 만료/실패가 아니라 정상 카운트다운이 보여야 한다
  await expect(page.getByText(/초 후 자동 갱신/)).toBeVisible();
  await expect(page.getByRole('button', { name: /갱신하기/ })).toHaveCount(0);
  // QR SVG 렌더 확인
  await expect(page.locator('svg').first()).toBeVisible();
});

test('J4 수업 후기 — 별점+제출 (MA-126)', async ({ page }) => {
  await page.goto(`/classes/105/feedback${M}`, { waitUntil: 'domcontentloaded' });
  await settle(page);
  // 별점 버튼 5개 중 마지막 클릭
  const stars = page.locator('button:has(svg.lucide-star)');
  await stars.nth(4).click();
  await page.getByRole('button', { name: '후기 제출' }).click();
  await expectToast(page, /후기/);
});

test('J5 온라인 결제 — 동의 후 결제 완료 (MA-142)', async ({ page }) => {
  await page.goto(`/checkout/pt-10${M}`, { waitUntil: 'domcontentloaded' });
  await settle(page);
  // 결제 진행 동의 체크
  await page.locator('input[type="checkbox"]').first().check();
  await page.getByRole('button', { name: /로 결제/ }).click();
  await expectToast(page, /결제가? 완료|결제되었/);
  await expect(page).toHaveURL(/\/payments\//, { timeout: 10000 });
});

test('J6 환불 요청 — 카드 결제건 환불 접수 (MA-830)', async ({ page }) => {
  await page.goto(`/orders/seed-9001-1/refund${M}`, { waitUntil: 'domcontentloaded' });
  await settle(page);
  await page.getByRole('button', { name: /환불 신청/ }).click();
  await expectToast(page, /환불 (신청|요청)이? 접수/);
});

// ───────────────────────── 트레이너(trainer) ─────────────────────────

test('J7 수업 시작/완료 — PT 수업 진행 (MA-212)', async ({ page }) => {
  await page.goto(`/trainer/classes/8101${T}`, { waitUntil: 'domcontentloaded' });
  await settle(page);
  const startBtn = page.getByRole('button', { name: '수업 시작' });
  await expect(startBtn).toBeEnabled();
  await startBtn.click();
  await expectToast(page, /수업.*시작/);
  await settle(page);
  await page.getByRole('button', { name: '수업 완료' }).click();
  await expectToast(page, /수업.*완료/);
});

test('J8 골프 쌍방서명 진입 — GOLF 수업에서 서명 분기 (MA-312)', async ({ page }) => {
  await page.goto(`/trainer/classes/8103${G}`, { waitUntil: 'domcontentloaded' });
  await settle(page);
  const signBtn = page.getByRole('button', { name: '쌍방서명 진행' });
  await expect(signBtn).toBeVisible();
  await signBtn.click();
  await expect(page).toHaveURL(/\/trainer\/classes\/8103\/signature/, { timeout: 8000 });
  // 서명 화면이 빈 화면이 아니어야 한다
  const body = (await page.locator('body').innerText()).trim();
  expect(body.length).toBeGreaterThan(20);
  expect(body).not.toContain('찾을 수 없');
});

// ───────────────────────── FC ─────────────────────────

test('J9 상담 이력 등록 — 신규 리드 상담 (MA-411)', async ({ page }) => {
  await page.goto(`/fc/leads/new${F}`, { waitUntil: 'domcontentloaded' });
  await settle(page);
  await page.getByPlaceholder('회원명').fill('홍길동');
  await page.getByPlaceholder('연락처').fill('010-1234-5678');
  await page.getByPlaceholder('상담 내용').fill('체험 후 재등록 상담 희망');
  await page.getByRole('button', { name: '저장' }).click();
  await expectToast(page, /상담.*등록/);
});

// ───────────────────────── 스태프(staff) ─────────────────────────

test('J10 수동 출석 처리 — 데스크 출석 기록 (MA-520)', async ({ page }) => {
  await page.goto(`/staff/attendance/manual${S}`, { waitUntil: 'domcontentloaded' });
  await settle(page);
  await page.locator('textarea').first().fill('QR 인식 불가');
  await page.getByRole('button', { name: '출석 처리' }).click();
  await expectToast(page, /출석/);
});
