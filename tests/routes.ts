/**
 * 회원앱 전체 라우트 매니페스트 (5개 역할).
 * 동적 [id]는 preview mock 데이터에 존재하는 유효 ID로 채운다.
 *  - 회원 클래스: 101~105 (PREVIEW_CLASS_IDS)
 *  - 이용권 계약: 501(활성)/502(만료)
 *  - 결제: preview-payment-gym / preview-payment-pt
 *  - 주문: seed-9001-1..4 (preview 회원 id 9001)
 *  - 상품: gym-1m, pt-10, golf-1m ...
 *  - 센터/강사/이벤트/QnA/메신저: 1+
 *  - 트레이너 수업: 2101~2106(preview) / 회원: 1201~1203
 *  - 트레이너 인증서: cert-8103
 *  - FC 상담: 7001~7003 / 회원: 1201
 *  - 스태프 회원: 1201
 */

export type Role = 'member' | 'trainer' | 'golf_trainer' | 'fc' | 'staff' | 'public';

export interface RouteCase {
  /** 화면 식별 라벨 (리포트용) */
  label: string;
  /** preview 적용 전 순수 경로 */
  path: string;
  /** 역할 (preview role 또는 public) */
  role: Role;
  /** 기획 화면 ID (있으면) */
  ma?: string;
}

/** preview 파라미터를 붙인 최종 URL을 만든다. */
export function toUrl({ path, role }: RouteCase): string {
  if (role === 'public') return path;
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}preview=1&role=${role}`;
}

export const MEMBER_ROUTES: RouteCase[] = [
  { label: '회원 홈 대시보드', path: '/', role: 'member', ma: 'MA-100' },
  { label: '탐색 홈', path: '/explore', role: 'member', ma: 'MA-300' },
  { label: 'QR 입장', path: '/qr', role: 'member', ma: 'MA-110' },
  { label: '출석 이력', path: '/attendance', role: 'member', ma: 'MA-111' },
  { label: '수업 예약 목록', path: '/classes', role: 'member', ma: 'MA-120' },
  { label: '수업 예약 상세', path: '/classes/101', role: 'member', ma: 'MA-121' },
  { label: '수업 후기/만족도', path: '/classes/105/feedback', role: 'member', ma: 'MA-126' },
  { label: '내 예약/수업 이력', path: '/lessons', role: 'member', ma: 'MA-122' },
  { label: 'Golf 예약/타석', path: '/golf-bay', role: 'member', ma: 'MA-123' },
  { label: '대기 예약 관리', path: '/waitlist', role: 'member', ma: 'MA-124' },
  { label: '강사 상세(회원)', path: '/instructors/1', role: 'member', ma: 'MA-125' },
  { label: '온보딩 시작', path: '/onboarding-welcome', role: 'member', ma: 'MA-127' },
  { label: '온보딩 설문', path: '/onboarding', role: 'member', ma: 'MA-128' },
  { label: '내 프로필/마이페이지', path: '/profile', role: 'member', ma: 'MA-130' },
  { label: '이용권/잔여 회차', path: '/membership', role: 'member', ma: 'MA-131' },
  { label: '이용권 상세', path: '/membership/501', role: 'member', ma: 'MA-131' },
  { label: '체성분/FMS 조회', path: '/body-composition', role: 'member', ma: 'MA-132' },
  { label: '리포트 이력', path: '/reports', role: 'member', ma: 'MA-132' },
  { label: '건강 데이터 연동', path: '/settings/health-data', role: 'member', ma: 'MA-132' },
  { label: '결제 이력', path: '/payments', role: 'member', ma: 'MA-133' },
  { label: '결제 영수증', path: '/payments/preview-payment-gym', role: 'member', ma: 'MA-133' },
  { label: '상품 스토어', path: '/shop', role: 'member', ma: 'MA-134' },
  { label: '상품 상세', path: '/shop/pt-10', role: 'member', ma: 'MA-141' },
  { label: '온라인 결제', path: '/checkout/pt-10', role: 'member', ma: 'MA-142' },
  { label: '결제 옵션 선택', path: '/checkout/pt-10/option', role: 'member', ma: 'MA-800' },
  { label: '개인 결제', path: '/payment/personal', role: 'member', ma: 'MA-142' },
  { label: '수동 결제', path: '/checkout/manual', role: 'member', ma: 'MA-810' },
  { label: '결제 실패', path: '/checkout/failure', role: 'member', ma: 'MA-812' },
  { label: '쿠폰함', path: '/coupons', role: 'member', ma: 'MA-135' },
  { label: '마일리지', path: '/mileage', role: 'member', ma: 'MA-136' },
  { label: '재등록 추천 플랜', path: '/renewal', role: 'member', ma: 'MA-138' },
  { label: '알림센터', path: '/notifications', role: 'member', ma: 'MA-150' },
  { label: '센터 정보', path: '/center', role: 'member', ma: 'MA-151' },
  { label: '공지사항', path: '/notices', role: 'member', ma: 'MA-152' },
  { label: '1:1 문의', path: '/support', role: 'member', ma: 'MA-153' },
  { label: '구독/자동결제', path: '/subscription', role: 'member', ma: 'MA-154' },
  { label: '결제수단 관리', path: '/payment-methods', role: 'member', ma: 'MA-154' },
  { label: '설정', path: '/settings', role: 'member', ma: 'MA-155' },
  { label: '약관/개인정보', path: '/legal', role: 'member', ma: 'MA-156' },
  { label: '동의 관리', path: '/consents', role: 'member', ma: 'MA-157' },
  { label: '회원 탈퇴', path: '/withdrawal', role: 'member', ma: 'MA-159' },
  { label: '장바구니', path: '/cart', role: 'member', ma: 'MA-801' },
  { label: '주문/예약 통합내역', path: '/orders', role: 'member', ma: 'MA-820' },
  { label: '주문 상세', path: '/orders/seed-9001-1', role: 'member', ma: 'MA-821' },
  { label: '환불 요청', path: '/orders/seed-9001-1/refund', role: 'member', ma: 'MA-830' },
  // 탐색 플랫폼 (C04)
  { label: '내 주변 센터', path: '/centers', role: 'member', ma: 'MA-310' },
  { label: '카테고리 검색', path: '/centers/search', role: 'member', ma: 'MA-311' },
  { label: '센터 상세', path: '/centers/1', role: 'member', ma: 'MA-314' },
  { label: '센터 리뷰 목록', path: '/centers/1/reviews', role: 'member', ma: 'MA-350' },
  { label: '센터 리뷰 작성', path: '/centers/1/review', role: 'member', ma: 'MA-350' },
  { label: '지도 보기', path: '/centers/map', role: 'member', ma: 'MA-315' },
  { label: '강사 둘러보기', path: '/trainers', role: 'member', ma: 'MA-320' },
  { label: '강사 상세(탐색)', path: '/trainers/1', role: 'member', ma: 'MA-321' },
  { label: '스크랩', path: '/scrap', role: 'member', ma: 'MA-330' },
  { label: '메신저 목록', path: '/messages', role: 'member', ma: 'MA-340' },
  { label: '메신저 방', path: '/messages/1', role: 'member', ma: 'MA-340' },
  { label: '통합 검색', path: '/search', role: 'member', ma: 'MA-311' },
  // 리워드 (C06)
  { label: '멤버십 등급 상세', path: '/membership-grade', role: 'member', ma: 'MA-710' },
  { label: '친구 초대', path: '/referral', role: 'member', ma: 'MA-730' },
  { label: '활동 이력/미션', path: '/activity-history', role: 'member', ma: 'MA-740' },
  { label: '베스트 랭킹', path: '/best', role: 'member', ma: 'MA-750' },
  // 커뮤니티 (C07)
  { label: '커뮤니티 홈', path: '/community', role: 'member', ma: 'MA-600' },
  { label: 'Q&A 목록', path: '/qna', role: 'member', ma: 'MA-601' },
  { label: 'Q&A 상세', path: '/qna/1', role: 'member', ma: 'MA-610' },
  { label: 'FAQ', path: '/faq', role: 'member', ma: 'MA-630' },
  { label: '신고/차단 관리', path: '/community/reports', role: 'member', ma: 'MA-640' },
  { label: '내 활동', path: '/community/activity', role: 'member', ma: 'MA-650' },
  // 운동/식단 기록
  { label: '운동 일지', path: '/workout-log', role: 'member', ma: 'MA-225' },
  { label: '운동 분석', path: '/workout-analysis', role: 'member' },
  { label: '식단 일지', path: '/diet', role: 'member' },
  { label: '운동 가이드', path: '/exercise-guide', role: 'member' },
  { label: '이벤트 목록', path: '/events', role: 'member' },
  { label: '이벤트 상세', path: '/events/1', role: 'member' },
  // 회원 골프 서명(원격)
  { label: '레슨 쌍방서명(회원)', path: '/lesson-sign/101', role: 'member', ma: 'MA-312' },
];

export const TRAINER_ROUTES: RouteCase[] = [
  { label: '강사 홈', path: '/trainer', role: 'trainer', ma: 'MA-200' },
  { label: '수업 캘린더', path: '/trainer/schedule', role: 'trainer', ma: 'MA-210' },
  { label: '수업 목록', path: '/trainer/classes', role: 'trainer', ma: 'MA-211' },
  { label: '수업 상세', path: '/trainer/classes/8101', role: 'trainer', ma: 'MA-212' },
  { label: '수업 서명', path: '/trainer/classes/8103/signature', role: 'trainer', ma: 'MA-212' },
  { label: '노쇼/페널티', path: '/trainer/penalties', role: 'trainer', ma: 'MA-213' },
  { label: '수업 템플릿', path: '/trainer/templates', role: 'trainer', ma: 'MA-214' },
  { label: '담당 회원 목록', path: '/trainer/members', role: 'trainer', ma: 'MA-220' },
  { label: '회원 상세(강사)', path: '/trainer/members/1201', role: 'trainer', ma: 'MA-221' },
  { label: '회원 평가', path: '/trainer/feedback', role: 'trainer', ma: 'MA-223' },
  { label: '강사 성과/KPI', path: '/trainer/kpi', role: 'trainer', ma: 'MA-240' },
  { label: '강사 프로필', path: '/trainer/profile', role: 'trainer', ma: 'MA-250' },
  { label: '강사 마켓 프로필', path: '/trainer/profile/market', role: 'trainer', ma: 'MA-250' },
  { label: '강사 알림', path: '/trainer/notifications', role: 'trainer', ma: 'MA-251' },
  { label: '강사 설정', path: '/trainer/settings', role: 'trainer', ma: 'MA-252' },
  { label: '강사 메신저 목록', path: '/trainer/messages', role: 'trainer' },
  { label: '강사 메신저 방', path: '/trainer/messages/1', role: 'trainer' },
  { label: '레슨 확인서 목록', path: '/trainer/certificates', role: 'trainer', ma: 'MA-313' },
  { label: '레슨 확인서 상세', path: '/trainer/certificates/cert-8103', role: 'trainer', ma: 'MA-313' },
];

export const GOLF_TRAINER_ROUTES: RouteCase[] = [
  { label: '골프강사 홈', path: '/trainer', role: 'golf_trainer', ma: 'MA-200' },
  { label: '골프 수업 상세', path: '/trainer/classes/8103', role: 'golf_trainer', ma: 'MA-212' },
  { label: '골프 쌍방서명', path: '/trainer/classes/8103/signature', role: 'golf_trainer', ma: 'MA-312' },
  { label: '레슨 확인서 목록(골프)', path: '/trainer/certificates', role: 'golf_trainer', ma: 'MA-313' },
];

export const FC_ROUTES: RouteCase[] = [
  { label: 'FC 홈', path: '/fc', role: 'fc', ma: 'MA-400' },
  { label: '리드/상담 예정', path: '/fc/leads', role: 'fc', ma: 'MA-410' },
  { label: '상담 이력 등록', path: '/fc/leads/new', role: 'fc', ma: 'MA-411' },
  { label: '상담 이력 상세/수정', path: '/fc/leads/7001', role: 'fc', ma: 'MA-412' },
  { label: 'FC 담당 회원 목록', path: '/fc/members', role: 'fc', ma: 'MA-420' },
  { label: 'FC 회원 상세', path: '/fc/members/1201', role: 'fc', ma: 'MA-421' },
  { label: '만료 예정 회원', path: '/fc/expiring', role: 'fc', ma: 'MA-430' },
  { label: '재등록 상담', path: '/fc/renewals/new', role: 'fc', ma: 'MA-431' },
  { label: 'FC 성과/KPI', path: '/fc/kpi', role: 'fc', ma: 'MA-440' },
  { label: 'FC 알림', path: '/fc/notifications', role: 'fc', ma: 'MA-451' },
  { label: 'FC 설정', path: '/fc/settings', role: 'fc', ma: 'MA-452' },
];

export const STAFF_ROUTES: RouteCase[] = [
  { label: '스태프 홈', path: '/staff', role: 'staff', ma: 'MA-500' },
  { label: '회원 조회', path: '/staff/members', role: 'staff', ma: 'MA-510' },
  { label: '회원 상세 조회', path: '/staff/members/1201', role: 'staff', ma: 'MA-511' },
  { label: '수동 출석 처리', path: '/staff/attendance/manual', role: 'staff', ma: 'MA-520' },
  { label: '수업 일정 조회', path: '/staff/schedule', role: 'staff', ma: 'MA-530' },
  { label: '스태프 알림', path: '/staff/notifications', role: 'staff', ma: 'MA-551' },
  { label: '스태프 설정', path: '/staff/settings', role: 'staff', ma: 'MA-552' },
];

export const SYSTEM_ROUTES: RouteCase[] = [
  { label: '신규 회원 환영', path: '/onboarding-welcome', role: 'member', ma: 'MA-900' },
  { label: '네트워크 오류', path: '/no-network', role: 'member', ma: 'MA-910' },
  { label: '서버 점검', path: '/server-maintenance', role: 'member', ma: 'MA-920' },
  { label: '앱 업데이트 안내', path: '/app-update', role: 'member', ma: 'MA-930' },
  { label: '권한 요청', path: '/permissions', role: 'member', ma: 'MA-940' },
  { label: '디바이스/앱 정보', path: '/device-info', role: 'member', ma: 'MA-970' },
];

export const PUBLIC_ROUTES: RouteCase[] = [
  { label: '로그인', path: '/login', role: 'public', ma: 'MA-001' },
  { label: '앱 가입/연동', path: '/register', role: 'public', ma: 'MA-002' },
  { label: '디자인 가이드(member)', path: '/publishing/member', role: 'public', ma: 'MA-960' },
  { label: '디자인 가이드(trainer)', path: '/publishing/trainer', role: 'public' },
  { label: '디자인 가이드(fc)', path: '/publishing/fc', role: 'public' },
  { label: '디자인 가이드(staff)', path: '/publishing/staff', role: 'public' },
];

export const ALL_ROUTES: RouteCase[] = [
  ...MEMBER_ROUTES,
  ...TRAINER_ROUTES,
  ...GOLF_TRAINER_ROUTES,
  ...FC_ROUTES,
  ...STAFF_ROUTES,
  ...SYSTEM_ROUTES,
  ...PUBLIC_ROUTES,
];
