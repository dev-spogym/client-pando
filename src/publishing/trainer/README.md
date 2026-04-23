# Trainer Publishing

- route: `/publishing/trainer`
- folder: `src/publishing/trainer/`
- total screens: `26`

## files

- `index.tsx`: 트레이너 퍼블리싱 갤러리 인덱스
- `screens.tsx`: 트레이너 화면 / 탭 / 모달 / 작성 상태 정의

## publishing focus

- 회원 예약 요청 승인/반려가 보이는 일정 관리 상태 포함
- 트레이너 직접 회원 지정으로 수업 추가하는 모달 상태 포함
- 회원 상세에서 수업이력, 잔여 회차, 차감 이력 탭 포함
- 수업 목록/상세, 노쇼·페널티, 템플릿, KPI, 알림, 설정, 쌍방서명, 확인서 화면 포함

## state summary

- `기본`: 기본 화면
- `탭`: 같은 화면의 필터 / 상세 탭 상태
- `모달`: 수업 추가 등 바텀시트 오픈 상태
- `완료`: 피드백 작성 등 작업 상태
