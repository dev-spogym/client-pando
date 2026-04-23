import type { PublishingScreenSpec } from '@/publishing/member/ui';

function withPreview(path: string, params?: Record<string, string>) {
  const url = new URL(path, 'http://local.preview');
  const search = new URLSearchParams(url.search);

  search.set('preview', '1');
  search.set('role', 'fc');

  Object.entries(params || {}).forEach(([key, value]) => {
    search.set(key, value);
  });

  return `${url.pathname}?${search.toString()}`;
}

export const fcPublishingScreens: PublishingScreenSpec[] = [
  { id: 'fc-home', title: 'FC 홈', route: '/fc', url: withPreview('/fc'), category: '대시보드', state: '기본', note: '오늘 상담, 만료 예정, 긴급 알림을 요약하는 홈입니다.' },
  { id: 'fc-leads', title: '상담 목록', route: '/fc/leads', url: withPreview('/fc/leads'), category: '상담', state: '기본', note: '리드/상담 예정 목록 기본 상태입니다.' },
  { id: 'fc-lead-new', title: '상담 등록', route: '/fc/leads/new', url: withPreview('/fc/leads/new'), category: '상담', state: '모달', note: '신규 상담 이력 등록 상태입니다.' },
  { id: 'fc-lead-detail', title: '상담 상세 / 수정', route: '/fc/leads/7001', url: withPreview('/fc/leads/7001'), category: '상담', state: '완료', note: '상담 상태와 결과를 수정하는 상세 화면입니다.' },
  { id: 'fc-members', title: '담당 회원 목록', route: '/fc/members', url: withPreview('/fc/members'), category: '회원', state: '기본', note: 'FC 담당 회원 목록입니다.' },
  { id: 'fc-member-detail', title: '회원 상세', route: '/fc/members/1201', url: withPreview('/fc/members/1201'), category: '회원', state: '탭', note: '기본/이용권/출석/상담/결제 탭을 가진 상세 화면입니다.' },
  { id: 'fc-member-memo', title: '회원 메모 관리', route: '/fc/members/1201?sheet=memo', url: withPreview('/fc/members/1201', { sheet: 'memo' }), category: '회원', state: '모달', note: '메모 유형 선택, 수정/삭제, 50개 제한이 반영된 메모 시트 상태입니다.' },
  { id: 'fc-expiring', title: '만료 예정 회원', route: '/fc/expiring', url: withPreview('/fc/expiring'), category: '회원', state: '완료', note: '재등록 관리 대상 회원 목록입니다.' },
  { id: 'fc-renewal', title: '재등록 상담 등록', route: '/fc/renewals/new', url: withPreview('/fc/renewals/new'), category: '회원', state: '모달', note: '만료 예정 회원 대상 재등록 상담 등록 상태입니다.' },
  { id: 'fc-kpi', title: 'FC KPI', route: '/fc/kpi', url: withPreview('/fc/kpi'), category: '성과', state: '기본', note: '전환율과 상담 실적을 확인하는 화면입니다.' },
  { id: 'fc-notifications', title: 'FC 알림', route: '/fc/notifications', url: withPreview('/fc/notifications'), category: '성과', state: '기본', note: '만료 예정, 상담 리마인더 알림 상태입니다.' },
  { id: 'fc-settings', title: 'FC 설정', route: '/fc/settings', url: withPreview('/fc/settings'), category: '성과', state: '탭', note: '상담 예정, 만료, 시스템 알림과 계정/앱 정보가 정리된 설정 화면입니다.' },
];
