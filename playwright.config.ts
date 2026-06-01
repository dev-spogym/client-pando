import { defineConfig, devices } from '@playwright/test';

/**
 * 회원앱 E2E 설정.
 * - preview 모드(`?preview=1&role=...`)로 로그인 없이 mock 데이터를 시드해 모든 역할/화면을 검증한다.
 * - dev 서버는 webServer로 자동 기동하며, 이미 떠 있으면 재사용한다.
 */
export default defineConfig({
  testDir: './tests',
  // 화면별 on-demand 컴파일 때문에 첫 진입이 느릴 수 있어 넉넉히 잡는다.
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: 'tests/.report/results.json' }]],
  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 390, height: 844 }, // 모바일 앱 프레임 기준
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
    trace: 'retain-on-failure',
    // 증거용: 모든 스텝 스크린샷을 남긴다 (저니 검증 시 눈으로 대조).
    screenshot: 'on',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000/login',
    reuseExistingServer: true,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
