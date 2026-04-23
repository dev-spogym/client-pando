import RoleSettingsScreen from '@/screens/ops/RoleSettingsScreen';

export default function FCSettings() {
  return (
    <RoleSettingsScreen
      role="fc"
      title="FC 설정"
      screenId="MA-452"
      fields={[
        { key: 'consultationEnabled', label: '상담 예정 알림', description: '상담 1시간 전 리마인드 알림을 받습니다.' },
        { key: 'expiryEnabled', label: '만료 알림', description: 'D-7, D-3, D-1 기준 만료 회원 알림을 받습니다.' },
        { key: 'systemEnabled', label: '시스템 알림', description: '운영 공지와 시스템 안내를 받습니다.' },
      ]}
    />
  );
}
