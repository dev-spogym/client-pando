import RoleSettingsScreen from '@/screens/ops/RoleSettingsScreen';

export default function StaffSettings() {
  return (
    <RoleSettingsScreen
      role="staff"
      title="스태프 설정"
      screenId="MA-552"
      fields={[
        { key: 'attendanceEnabled', label: '출석 알림', description: '수동 출석 요청과 출입 이슈 알림을 받습니다.' },
        { key: 'systemEnabled', label: '시스템 알림', description: '시설 운영 공지와 시스템 안내를 받습니다.' },
      ]}
    />
  );
}
