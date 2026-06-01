# 회원앱 E2E 검증 리포트

작성일: 2026-06-01 (최종 실행 2026-06-02) · 기준 기획: `admin-pando/client2` (C01~C08), `docs/회원앱/APP-사용자시나리오.md`

---

## 📌 최신 실행 결과 (2026-06-02) — 역할별 전수 E2E + client2/docs4 읽기전용 감사

### E2E 실행 결과: ✅ 141/141 PASS (0 failed, 0 flaky, 3.6분)

| 역할 | 범위 | 결과 |
|---|---|---|
| member(회원) | 홈·예약·QR·이용권·결제·환불·식단·커뮤니티·운동/식단일지·이벤트·레슨서명·온보딩/에러화면 | ✅ |
| trainer(트레이너) | 홈·캘린더·수업목록/상세·서명·노쇼/페널티·템플릿·회원관리·평가·KPI·프로필·메신저·확인서 | ✅ |
| golf_trainer(골프강사) | 홈·골프수업상세·쌍방서명·확인서 | ✅ |
| fc(상담) | 홈·리드/상담·등록/수정·회원·만료예정·재등록·KPI·알림·설정 | ✅ |
| staff(스태프) | 홈·회원조회/상세·수동출석·일정·알림·설정 | ✅ |
| public | 로그인·가입·퍼블리싱 허브·디자인가이드(4역할) | ✅ |

- 저니 J1–J10(예약 취소/대기 취소/QR/후기/체크아웃 pt-10/환불/트레이너 시작·출석·완료/골프 서명/FC 상담/스태프 출석) 전부 통과.
- 리뷰체크 R1–R4(예약탭→/classes, 프로필→/orders, 갤러리 iframe) 전부 통과.
- 콘솔 에러 사이드카: unexpected 0. `/publishing/member`의 `[EMPTY]` 메모는 갤러리가 404 데모문서(MA-911, "존재하지 않" 문구)를 나열해 잡힌 **오탐**(라우트 자체는 ✓ 통과).

### 역할별 빠진 것 (client2 정본 읽기전용 감사 — 화면 셸은 전부 존재, 아래는 요구사항 충실도 갭)

**FC(상담) — 가장 심각:**
- ⚠️ MA-411 상담 등록폼이 4필드(회원명/연락처/내용/후속조치)뿐 → 정본은 상담유형·방식·7단계·결과·유입경로 9종·조건부 후속조치 필수·1000자 제한. (`FCConsultationEditor.tsx`)
- ⚠️ MA-410 리드 상태가 3종(scheduled/completed/no_show) → 정본은 7단계 칸반. (`FCConsultations.tsx` + `mockOperations` enum)
- ❌ FC 등록완료 수동저장 차단 + "등록 요청 전환" 안내 미구현.

**staff(스태프):**
- ❌ MA-500 본인 출퇴근 1탭 기록 + 본인 인증 미구현(`StaffHome.tsx`는 대시보드만).

**trainer/golf:**
- ⚠️ MA-212 수업 시작 ±15분 범위 가드 미반영.
- ⚠️ MA-312 골프 원격 서명 24h 만료/12h 리마인드 카운트다운 미반영.
- ⚠️ MA-213 노쇼 1회경고/3회누적 단계 표현 미반영.

**member:**
- ⚠️ MA-142 결제화면 쿠폰 1장 적용 UI 없음(쿠폰함은 별도 존재, 결제 연결 누락).
- ⚠️ MA-110 QR 갱신 60초 → 정본은 7일 회전 토큰 + D-day 표시(정책 표기 불일치).
- ⚠️ MA-001 5회실패 30분잠금/role불일치차단은 로직 일부만, 비번만료 강제이동 미반영.

### docs4 연동 감사 (관리자↔클라이언트, 읽기전용)

- ✅ **회원→CRM 단방향 쓰기 전부 실DB 연동**: 예약/대기(`/api/reservations`+`lesson_bookings`), 결제(`/api/payments`+`sales`), 환불접수(`/api/payments/[id]/refund`+`app_refund_requests`), 문의(`/api/inquiries`), 탈퇴(`/api/withdrawal-requests`), 식단(`/api/diet-logs`), QR출석(`/api/kiosk/checkin`+`/api/qr-token`+`attendance`), 가입(`/api/register-member`+Supabase Auth), 체성분 조회(`body_compositions`).
- ⚠️ **mock 잔존(클라이언트 wiring만 필요, CRM 테이블 존재 시)**: 스태프 수동출석, FC 상담/리드, 상품 카탈로그, 레슨 서명 정본(회원 측은 `classes` 실DB지만 트레이너 양자서명은 mock — 정본 미공유).
- ❌ **백엔드/인프라 필요(클라이언트 단독 불가)**: 회원앱 Push(EXT-MSG-01), Health Connect 실연동(웹앱 한계), 락커 만료/회수 알림(EXT-DEVICE-03), 환불 큐 정본 통합(admin 처리), PG 결제링크(EXT-PAY-02, V2 대기).

### 결론
- **실행 검증 측면**: 5개 역할 전 화면·핵심 저니 무결성 100% 통과. 크래시·런타임 에러·깨진 라우트 없음. 배포 가능 상태.
- **기획 충실도 측면**: 화면 누락은 없음. 클라이언트만으로 메울 수 있는 우선 갭은 **FC 도메인(MA-411 폼/MA-410 칸반/등록완료 차단)** > 스태프 출퇴근 > 수업 ±15분/골프 서명 타이머 > 결제 쿠폰. 나머지(Push·Health·락커)는 백엔드/인프라 의존.

---

## 🛠 갭 구현 결과 (2026-06-02, "백엔드 필요분도 mock으로 전부 구현")

감사에서 도출한 client2 갭을 mock 데이터로 전부 구현. **E2E 145/145 통과**(신규 J11~J14 포함), 프로덕션 빌드 성공, `tsc --noEmit` 0 에러, architect 검증 PASS(Critical/High 0).

| 영역 | 구현 | 파일 |
|---|---|---|
| FC MA-411 상담 등록폼 | 상담유형·방식(대면/유선/부재)·7단계·결과·유입경로 9종·1000자 카운터·후속조치 조건부 필수·등록완료 차단→등록요청 전환 | `fc/FCConsultationEditor.tsx` |
| FC MA-410 리드 칸반 | 7단계(신규~보류) 가로스크롤 필터 + 단계 배지 | `fc/FCConsultations.tsx` |
| FC MA-412 상세 | 새 필드 표시 + 7일 수정제한 + 후속조치 가드 | `fc/FCConsultationDetail.tsx` |
| 데이터 모델 | `Consultation`에 `stage/method/inflowSource/createdAt` 추가, `channel` 제거 | `lib/mockOperations.ts` |
| staff MA-500 출퇴근 | 본인 인증 모달(생체/비번)+출근/퇴근 1탭+근태 전송 시뮬레이션+최근 기록 | `lib/staffShift.ts`(신규)·`staff/StaffHome.tsx` |
| trainer MA-212 | 수업 시작 ±15분 범위 가드 + 시작 가능 시간 안내 | `trainer/TrainerClassDetail.tsx` |
| golf MA-312 | 원격 서명 24h 만료/12h 리마인드 카운트다운 + 만료 시 재요청 | `trainer/TrainerDualSignature.tsx` |
| trainer MA-213 | 노쇼 누적 단계 배지(경고/주의/예약 제한) | `trainer/TrainerPenaltyBoard.tsx` |
| member MA-142 | 쿠폰 1장 선택 + 결제 요약(상품/쿠폰/마일리지/최종) | `Checkout.tsx` |
| member MA-110 | 7일 토큰 D-day 카드 + 보안 코드 회전 표기 | `QrCheckin.tsx` |
| 설명 패널 | 6개 엔트리(ui/rules) 정책 동기화 | `lib/client2ScreenDocs.ts` |
| E2E | J3 카피 정합 수정 + J11~J14 신규(등록완료 차단/후속조치 필수/출퇴근/쿠폰) | `tests/journeys.spec.ts` |

### mock으로 대체 불가(정본 화면 부재 또는 외부 기기 의존 — 날조 금지)
- **락커 만료/회수 알림**(EXT-DEVICE-03): 회원앱에 호스팅할 client2 정본 화면이 없어 미구현(락커 컨트롤러 외부 이벤트). 임의 UI 날조하지 않음.
- **실 푸시 인프라**(EXT-MSG-01): 역할별 알림센터는 이미 mock으로 존재. 디바이스 토큰 등록/발송은 인프라 영역.
- **Health Connect 실연동**: 웹앱 한계로 기존 mock 상태머신 유지.
- **PG 결제링크**(EXT-PAY-02): docs4상 V2 개발 대기(의도된 미구현).

---


## 검증 방식

- **인증**: preview 모드(`?preview=1&role=member|trainer|golf_trainer|fc|staff`)로 로그인 없이 mock 데이터를 시드해 5개 역할 전 화면을 검증.
- **도구**: Playwright (`@playwright/test`). dev 서버 자동 기동(`webServer`).
- **2단계 전략**: ① 스모크(전 화면 무결성 전수) → ② 핵심 유저 저니(실제 클릭·입력·토스트 검증).

## 파일

| 파일 | 역할 |
|---|---|
| `playwright.config.ts` | 모바일 뷰포트, 스크린샷 on, dev 서버 자동 기동 |
| `tests/routes.ts` | 5개 역할 **127개 라우트 매니페스트** + 유효 mock ID |
| `tests/smoke.spec.ts` | 전 화면 무결성(크래시·Next오버레이·404·로그인리다이렉트·빈렌더·콘솔에러·빈상태) |
| `tests/journeys.spec.ts` | 핵심 유저 저니 10종 (예약/대기/QR/후기/결제/환불/수업서명/상담/출석) |
| `tests/.shots/` | 화면별 스크린샷 갤러리 (126장) |

## 결과

- **스모크: 127/127 통과** — 런타임 크래시·에러 오버레이·404·로그인 리다이렉트·빈 렌더·콘솔에러 **0건**.
- **핵심 저니: 10/10 통과**.

### 실행

```bash
npm run dev                      # (또는 Playwright가 자동 기동)
npx playwright test smoke.spec.ts
npx playwright test journeys.spec.ts
npx playwright test journeys.spec.ts --headed   # 브라우저 띄워서 보기
```

## 발견 및 수정 (발견 즉시 수정)

| # | 화면/영역 | 문제 | 영향 | 조치 |
|---|---|---|---|---|
| 1 | 브랜드/PWA | `manifest.json`·아이콘이 리브랜딩 누락으로 옛 "스포짐"·파랑(`#3B82F6`) | PWA 설치 시 옛 스플래시/셸 + 옛 캐시 번들("트레이너 로그인") 노출 | manifest·아이콘을 **FitGenie/청록(`#0E7C7B`)**으로 교체 |
| 2 | 전역 | 과거 배포본의 서비스워커/Cache Storage 잔존 시 옛 디자인 고착 | 강력새로고침 전까지 옛 화면 | `CacheGuard` 추가 — 로드 시 잔존 SW unregister + 캐시 정리(기기당 1회) |
| 3 | QR 입장(MA-110) | preview 회원(9001)이 DB에 없어 `/api/qr-token` 404 → QR 발급 실패("갱신하기") | preview/데모/테스트에서 QR 깨짐 | preview 모드에서 클라이언트 mock 토큰 생성 |
| 4 | 결제 옵션(MA-800) | `CheckoutOption`이 숫자 id(MOCK_PRODUCTS)만 조회 → 문자열 id(`pt-10`)면 "상품을 찾을 수 없어요" | 주문 재구매·카탈로그 진입 시 깨짐 | 숫자·문자열 id(SHOP_PRODUCTS) 모두 해석하도록 수정 |

## 추가 정리 — 토스트 어미 기획 정합 (완료)

기획 토스트 표준(`_공통/토스트_메시지.md`)에 맞춰 **73개 토스트 문구를 일괄 정리**:
- 회원 일반·강사·FC·스태프·탐색·커뮤니티 영역 → 친근체 `~되었어요` (예: `예약이 완료되었습니다`→`예약되었어요`, `후기가 저장되었습니다`→`후기가 등록되었어요`, `수업을 시작 처리했습니다`→`수업 시작되었어요`, `상담 이력을 등록했습니다`→`상담이 등록되었어요`).
- 결제·환불·세금계산서·가입/인증/보안·시스템·주문 영역 → 격식체 `~되었습니다` 유지.
- 타입체크 통과, 저니 10/10 통과(정규식 호환).

## 검수 대응 — 송혜수 06.01 4건 (현재 코드 기준 전부 정상)

`tests/review-checks.spec.ts`로 회귀 가드 추가 (R1/R3/R4 통과).

| # | 검수 내용 | 현재 코드 상태 |
|---|---|---|
| ① | 하단 탭바 "예약" → /orders? | **정상**: `BottomTabBar`의 "예약" 탭은 `/classes`로 연결 (R1 클릭 검증). |
| ② | 홈에서 /membership 버튼 2개 (나의 센터 컴포넌트 내부 중복) | 현재 홈에 **"나의 센터" 컴포넌트 없음**. /membership 진입은 ①요약 카운터 카드 ②"이용권 현황" 상세 카드 2곳 — 글랜스 통계 + 상세의 **의도된 대시보드 패턴**. 통합 원하시면 조정 가능. |
| ③ | /profile에 /orders 링크 없음 | **정상**: 마이페이지 "내 정보" 그룹에 "내 주문/예약" → `/orders` 존재 (R3 검증). |
| ④ | /orders가 갤러리에 누락 + 다른 누락 페이지 | **정상**: 갤러리는 `memberPublishingScreens`(106개) 전체를 iframe 렌더, `/orders`·주문상세·환불 포함 (R4 검증). 회원 화면 전수 교차검증 결과 **실제 누락 0건** (checkout/shop/lesson-sign은 다른 데모 ID로 이미 포함). |

> ①③④는 과거 캐시본/구 배포본에서 관찰된 것으로 추정됨(브랜드 캐시 이슈와 동일 원인). 현재 빌드는 정상이며 재배포 + PWA 재설치로 해소.

## 미해결(정책 판단 필요)

- **QR 유효시간 기획 내부 충돌**: `APP-사용자시나리오`는 1분, `C01 MA-110`은 7일. 코드는 60초. 정본 합의 필요.

## 비고

- 스모크의 1건 "존재하지 않" 감지(`/publishing/member`)는 디자인 가이드가 404 상태를 **의도적으로 문서화**한 안내문구 — 실제 깨짐 아님.
