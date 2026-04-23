import type { PublishingScreenSpec } from '@/publishing/member/ui';

function withPreview(path: string) {
  const search = new URLSearchParams({ preview: '1', role: 'staff' });
  return `${path}?${search.toString()}`;
}

export const staffPublishingScreens: PublishingScreenSpec[] = [
  { id: 'staff-home', title: '스태프 홈', route: '/staff', url: withPreview('/staff'), category: '대시보드', state: '기본', note: '출석 현황과 시설 요약을 보여주는 홈입니다.' },
  { id: 'staff-members', title: '회원 조회', route: '/staff/members', url: withPreview('/staff/members'), category: '회원', state: '기본', note: '지점 전체 회원 조회 화면입니다.' },
  { id: 'staff-member-detail', title: '회원 상세', route: '/staff/members/1201', url: withPreview('/staff/members/1201'), category: '회원', state: '탭', note: '읽기전용 회원 상세 화면입니다.' },
  { id: 'staff-attendance', title: '수동 출석 처리', route: '/staff/attendance/manual', url: withPreview('/staff/attendance/manual'), category: '출석', state: '모달', note: '입장/퇴장 수동 처리 화면입니다.' },
  { id: 'staff-schedule', title: '수업 일정 조회', route: '/staff/schedule', url: withPreview('/staff/schedule'), category: '일정', state: '기본', note: '읽기전용 수업 일정 화면입니다.' },
  { id: 'staff-notifications', title: '스태프 알림', route: '/staff/notifications', url: withPreview('/staff/notifications'), category: '일정', state: '기본', note: '출석 및 시스템 알림 상태입니다.' },
  { id: 'staff-settings', title: '스태프 설정', route: '/staff/settings', url: withPreview('/staff/settings'), category: '일정', state: '탭', note: '출석, 시스템 알림과 계정/앱 정보, 로그아웃 확인 흐름이 반영된 설정 화면입니다.' },
];
