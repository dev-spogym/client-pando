# Member Publishing

- route: `/publishing/member`
- folder: `src/publishing/member/`
- total screens: `53`

## files

- `index.tsx`: 퍼블리싱 갤러리 인덱스
- `screens.tsx`: 회원앱 전체 화면 / 모달 / 탭 / 완료 상태 정의
- `ui.tsx`: 퍼블리싱 공통 셸, 폰 프레임, 카드, 시트 컴포넌트

## state summary

- `기본`: 일반 화면
- `탭`: 같은 화면의 탭 전환 상태
- `모달`: 바텀시트 / 오버레이 오픈 상태
- `완료`: 완료 / 영수증 / 서명 등 결과 상태
- `에러`: 404 등 예외 상태
