import { useLocation } from 'react-router-dom';
import type { Client2ScreenDoc } from '@/lib/client2ScreenDocs';
import { getClient2ScreenDoc } from '@/lib/client2ScreenDocs';

function getFlowSteps(doc: Client2ScreenDoc): string[] {
  if (doc.domain.includes('결제')) {
    return [
      '상품/주문 정보 확인',
      '옵션과 결제 조건 확인',
      '결제 또는 실패/완료 상태 확인',
      '주문/영수증/환불 화면으로 연결',
    ];
  }

  if (doc.domain.includes('트레이너')) {
    return [
      '강사 업무 화면 진입',
      '오늘 처리할 수업 또는 담당 회원 확인',
      '기록/서명/피드백 등 필요한 업무 수행',
      '처리 결과가 회원 이력에 반영된 상태 확인',
    ];
  }

  if (doc.domain.includes('FC') || doc.domain.includes('스태프')) {
    return [
      '역할별 업무 화면 진입',
      '대상 회원/리드/일정 확인',
      '상담/출석/메모 등 현장 업무 처리',
      '처리 상태와 다음 액션 확인',
    ];
  }

  if (doc.domain.includes('탐색')) {
    return [
      '탐색 화면 진입',
      '검색/필터로 대상 찾기',
      '센터/강사/리뷰 상세 확인',
      '스크랩/문의/예약 등 다음 행동 선택',
    ];
  }

  if (doc.domain.includes('리워드')) {
    return [
      '리워드 화면 진입',
      '보유 혜택과 상태 확인',
      '사용 가능 조건 또는 적립 조건 확인',
      '사용/공유/상세 확인으로 연결',
    ];
  }

  if (doc.domain.includes('커뮤니티')) {
    return [
      '커뮤니티 화면 진입',
      '질문/FAQ/내 활동 확인',
      '작성/신고/차단 등 필요한 행동 수행',
      '처리 상태 또는 답변 상태 확인',
    ];
  }

  if (doc.domain.includes('시스템')) {
    return [
      '앱 상태 화면 진입',
      '현재 제한 또는 필요한 권한 확인',
      '재시도/설정/업데이트 등 안내 행동 수행',
      '정상 사용 가능 상태로 복귀',
    ];
  }

  return [
    '화면 진입',
    '핵심 정보 확인',
    '필요한 행동 선택',
    '결과 또는 다음 화면 확인',
  ];
}

function getMockDataNotes(doc: Client2ScreenDoc): string[] {
  if (doc.domain.includes('결제')) {
    return [
      '상품명, 금액, 결제 상태, 영수증 번호는 검수용 목업으로 표시합니다.',
      '성공/실패/환불 등 상태별 화면이 모두 확인 가능해야 합니다.',
    ];
  }

  if (doc.domain.includes('트레이너')) {
    return [
      '수업 일정, 담당 회원, 서명, 피드백 기록은 검수용 목업으로 표시합니다.',
      '정상/완료/노쇼/서명 필요 같은 상태를 화면에서 확인할 수 있어야 합니다.',
    ];
  }

  if (doc.domain.includes('FC') || doc.domain.includes('스태프')) {
    return [
      '리드, 회원, 상담 메모, 출석 대상은 검수용 목업으로 표시합니다.',
      '업무 처리 전/후 상태가 화면에서 구분되어야 합니다.',
    ];
  }

  if (doc.domain.includes('탐색')) {
    return [
      '센터, 강사, 리뷰, 스크랩 정보는 검수용 목업으로 표시합니다.',
      '목록, 빈 상태, 상세 진입이 자연스럽게 이어져야 합니다.',
    ];
  }

  if (doc.domain.includes('리워드')) {
    return [
      '쿠폰, 마일리지, 등급, 초대 보상은 검수용 목업으로 표시합니다.',
      '사용 가능/만료/소멸 예정 상태가 구분되어야 합니다.',
    ];
  }

  if (doc.domain.includes('커뮤니티')) {
    return [
      'Q&A, FAQ, 신고, 내 활동 데이터는 검수용 목업으로 표시합니다.',
      '작성 전/작성 후/답변 완료/처리 중 상태를 확인할 수 있어야 합니다.',
    ];
  }

  return [
    '회원명, 이용권, 예약, 알림 등 화면 데이터는 검수용 목업으로 표시합니다.',
    '빈 상태와 정상 상태가 모두 화면 의도와 맞아야 합니다.',
  ];
}

function getStateNotes(doc: Client2ScreenDoc): string[] {
  if (doc.domain.includes('결제')) {
    return [
      '결제 전 확인 상태, 결제 진행 상태, 결제 완료 상태, 결제 실패 상태가 구분되어야 합니다.',
      '환불 또는 취소가 있는 화면은 요청 전/요청 완료/처리 중/처리 완료 상태를 확인할 수 있어야 합니다.',
      '금액, 할인, 마일리지, 결제수단 표시는 사용자가 오해하지 않도록 같은 순서와 단위로 유지합니다.',
    ];
  }

  if (doc.domain.includes('트레이너')) {
    return [
      '오늘 할 일이 있는 상태와 없는 상태가 모두 자연스럽게 보여야 합니다.',
      '수업은 예정, 진행 가능, 완료, 노쇼, 서명 필요, 확인서 발급 같은 상태가 구분되어야 합니다.',
      '회원 기록 화면은 저장 전 입력 상태와 저장 후 반영 상태가 화면에서 분명해야 합니다.',
    ];
  }

  if (doc.domain.includes('FC') || doc.domain.includes('스태프')) {
    return [
      '업무 대상이 있는 상태와 없는 상태를 모두 확인할 수 있어야 합니다.',
      '상담, 메모, 출석 처리 등 현장 업무는 처리 전/처리 후 상태가 분명해야 합니다.',
      '권한상 볼 수 없는 정보는 숨기고, 필요한 다음 행동만 남겨야 합니다.',
    ];
  }

  if (doc.domain.includes('탐색')) {
    return [
      '추천 목록, 검색 결과 있음, 검색 결과 없음, 필터 적용 상태가 구분되어야 합니다.',
      '센터/강사/리뷰 상세는 정보가 부족한 경우에도 화면 구조가 깨지면 안 됩니다.',
      '스크랩, 문의, 예약 같은 다음 행동은 현재 대상의 상태에 맞게 노출되어야 합니다.',
    ];
  }

  if (doc.domain.includes('리워드')) {
    return [
      '보유 혜택 있음, 보유 혜택 없음, 만료 예정, 사용 완료 상태가 구분되어야 합니다.',
      '등급과 마일리지는 현재 값, 다음 조건, 이력 정보가 서로 혼동되지 않아야 합니다.',
      '혜택 사용이 불가능한 경우에도 이유와 다음 행동이 보여야 합니다.',
    ];
  }

  if (doc.domain.includes('커뮤니티')) {
    return [
      '목록 있음, 목록 없음, 작성 중, 답변 완료, 신고 처리 중 상태가 구분되어야 합니다.',
      '비공개 또는 제한된 항목은 사용자가 이유를 이해할 수 있게 안내해야 합니다.',
      '작성/신고/차단처럼 민감한 행동은 완료 전 확인과 완료 후 상태가 필요합니다.',
    ];
  }

  if (doc.domain.includes('시스템')) {
    return [
      '정상 사용 가능, 권한 필요, 네트워크 오류, 점검, 업데이트 필요 상태가 구분되어야 합니다.',
      '사용자가 직접 해결할 수 있는 상태는 설정/재시도/업데이트 행동을 제공합니다.',
      '앱 사용이 막히는 상태에서도 현재 이유와 다음 행동이 먼저 보여야 합니다.',
    ];
  }

  return [
    '정상 상태, 데이터 없음 상태, 제한 상태, 완료 상태가 화면에서 구분되어야 합니다.',
    '사용자가 다음 행동을 선택해야 하는 화면은 주요 CTA가 하나로 분명해야 합니다.',
    '상태 안내 문구는 짧고 구체적으로 표시합니다.',
  ];
}

function getPublishingCheckpoints(doc: Client2ScreenDoc): string[] {
  const base = [
    '모바일 앱 폭에서 정보가 잘리지 않고, 데스크톱 검수 화면에서는 왼쪽 앱과 오른쪽 설명이 동시에 보여야 합니다.',
    '버튼, 탭, 카드, 리스트, 배지, 빈 상태가 같은 디자인 톤으로 정리되어야 합니다.',
    '문구는 개발 용어가 아니라 사용자가 이해하는 업무/서비스 용어로 표시해야 합니다.',
  ];

  if (doc.domain.includes('결제')) {
    return [
      ...base,
      '금액과 상태 배지는 한눈에 구분되어야 하고, 실패/환불 상태는 성공 상태와 색상과 문구가 섞이면 안 됩니다.',
    ];
  }

  if (
    doc.domain.includes('트레이너') ||
    doc.domain.includes('FC') ||
    doc.domain.includes('스태프')
  ) {
    return [
      ...base,
      '업무 화면은 반복 사용을 전제로 하므로 핵심 정보와 처리 버튼이 스크롤 없이 먼저 인지되어야 합니다.',
    ];
  }

  if (doc.domain.includes('탐색')) {
    return [
      ...base,
      '검색/필터/상세 이동이 자연스럽게 이어지고, 카드 정보 밀도가 과하지 않아야 합니다.',
    ];
  }

  if (doc.domain.includes('커뮤니티')) {
    return [
      ...base,
      '작성, 신고, 차단 같은 행동은 버튼 문구와 완료 피드백이 명확해야 합니다.',
    ];
  }

  return base;
}

function getCurrentScreenComposition(doc: Client2ScreenDoc): string[] {
  if (doc.id === 'MA-100') {
    return [
      '상단에는 현재 지역, 알림, QR 입장, 센터 검색 진입을 고정 헤더로 배치합니다.',
      '첫 화면에는 이미지 배너, 주변/역세권 센터 카드, 수업 예약/QR 입장/체성분/스토어 빠른 메뉴가 이어집니다.',
      '나의 센터 카드에서는 이용권 D-day, 센터 이미지, 내 예약/QR 입장/이용권 바로가기를 한 번에 제공합니다.',
      '하단에는 체험권, 추천 센터, 추천 강사, 최근 본 센터를 가로 카드와 리스트 카드로 노출합니다.',
    ];
  }

  if (doc.id.includes('MA-310') || doc.id.includes('MA-300')) {
    return [
      '상단 헤더와 검색 영역을 먼저 두고, 카테고리/정렬 칩으로 탐색 조건을 바꿀 수 있게 구성합니다.',
      '센터 목록은 이미지, 위치, 거리, 별점, 대표 가격, 시설 태그가 들어간 카드로 반복됩니다.',
      '추천/신규/대표 상품 같은 상태는 배지로 표시하고, 검색 결과 없음은 빈 상태 안내로 분리합니다.',
      '지도 보기와 상세 진입은 목록 탐색 흐름 안에서 바로 이어지도록 배치합니다.',
    ];
  }

  if (doc.id.includes('MA-314') || doc.id.includes('MA-350')) {
    return [
      '상세 상단은 센터 이미지와 핵심 정보가 먼저 보이고, 이후 운영 정보와 상품/시설/후기 영역으로 내려갑니다.',
      '상품, 리뷰, 시설, 강사 정보는 탭 또는 섹션 단위로 나뉘어 사용자가 비교할 수 있게 합니다.',
      '예약, 문의, 리뷰 작성처럼 다음 행동이 필요한 버튼은 화면 하단 또는 섹션 끝에서 반복 노출합니다.',
    ];
  }

  if (doc.id.includes('MA-320')) {
    return [
      '강사 탐색은 프로필 이미지, 전문 분야, 소속 센터, 평점, 후기 수를 중심으로 카드 목록을 구성합니다.',
      '강사 상세는 소개, 전문 영역, 수업 가능 정보, 후기 흐름이 순서대로 이어져야 합니다.',
      '예약 가능한 수업이 있는 경우 수업 예약 또는 문의 행동이 상세 하단에서 분명하게 보여야 합니다.',
    ];
  }

  if (doc.domain.includes('결제')) {
    return [
      '주문 상품, 옵션, 결제 금액, 할인/마일리지, 결제수단을 위에서 아래로 확인하는 구조를 사용합니다.',
      '성공, 실패, 환불, 구독 상태는 같은 카드 구조 안에서도 색상과 문구로 명확히 분리합니다.',
      '결제 전 화면은 최종 확인 CTA를, 완료/실패 화면은 다음 행동 CTA를 가장 마지막에 배치합니다.',
    ];
  }

  if (doc.domain.includes('트레이너')) {
    return [
      '강사용 화면은 오늘 일정, 담당 회원, 처리해야 할 서명/피드백/노쇼 업무를 우선 배치합니다.',
      '회원 상세와 수업 상세은 상태 배지, 기록 카드, 실행 버튼을 반복 패턴으로 사용합니다.',
      '강사 업무 하단 탭은 회원용 탭과 분리하고, 업무 처리에 필요한 화면만 빠르게 이동하게 합니다.',
    ];
  }

  if (doc.domain.includes('FC')) {
    return [
      'FC 화면은 상담 예정, 리드, 만료 예정 회원, 성과 지표를 업무 카드 중심으로 구성합니다.',
      '리드/회원 목록은 상태, 최근 상담, 다음 액션이 한눈에 보이도록 리스트 카드로 반복합니다.',
      '상담 등록과 재등록 상담은 입력 전 확인, 저장 후 상태 확인이 이어지는 폼 흐름으로 보여줍니다.',
    ];
  }

  if (doc.domain.includes('스태프')) {
    return [
      '스태프 화면은 현장 업무에 필요한 회원 검색, 수동 출석, 오늘 일정, 알림을 먼저 배치합니다.',
      '회원 상세은 이용권/출석 요약 중심으로 제한된 정보를 보여주고, 민감한 상담 정보는 제외합니다.',
      '수동 출석은 대상 선택, 출석 처리, 처리 완료 상태가 한 흐름으로 연결되어야 합니다.',
    ];
  }

  if (doc.domain.includes('리워드')) {
    return [
      '리워드 화면은 보유 혜택, 등급, 마일리지, 초대 보상, 활동 이력을 카드와 탭으로 나눕니다.',
      '사용 가능/만료 예정/사용 완료 상태는 배지와 보조 문구로 구분합니다.',
      '공유나 사용 같은 행동은 혜택 조건을 먼저 읽은 뒤 실행할 수 있게 배치합니다.',
    ];
  }

  if (doc.domain.includes('커뮤니티')) {
    return [
      '커뮤니티는 Q&A, FAQ, 내 활동, 신고/차단 메뉴를 허브 형태로 묶어 진입점을 분명히 합니다.',
      '목록 화면은 상태 배지와 작성일, 답변 여부를 반복 카드로 보여주고 상세로 이어집니다.',
      '작성, 신고, 차단처럼 확인이 필요한 행동은 완료 전 확인과 완료 후 상태 피드백을 제공합니다.',
    ];
  }

  if (doc.domain.includes('시스템')) {
    return [
      '시스템 상태 화면은 아이콘, 제목, 원인 안내, 다음 행동 버튼 순서로 단순하게 구성합니다.',
      '권한/업데이트/네트워크/점검 상태는 각각 사용자가 할 수 있는 행동을 하나 이상 제공합니다.',
      '디바이스와 앱 정보는 카드형 정보 목록으로 정리해 검수자가 현재 상태를 바로 확인할 수 있게 합니다.',
    ];
  }

  return [
    '상단 헤더, 핵심 정보 카드, 목록/상세 영역, 주요 행동 버튼 순서로 화면을 구성합니다.',
    '목록형 화면은 카드 반복 패턴을 사용하고, 상세형 화면은 정보 섹션을 위에서 아래로 읽히게 배치합니다.',
    '하단 탭이 있는 화면은 회원의 주요 이동 흐름을 유지하고, 상세/입력 화면에서는 필요한 경우 탭을 숨깁니다.',
  ];
}

function getCommonUiElements(doc: Client2ScreenDoc): string[] {
  const base = [
    '상단 헤더, 하단 탭, 카드, 리스트, 배지, 태그, 버튼은 회원앱 디자인 톤으로 통일합니다.',
    '검색창, 필터 칩, 빈 상태, 알림 배지, 확인 다이얼로그는 화면 성격에 맞게 반복 사용합니다.',
  ];

  if (doc.domain.includes('탐색')) {
    return [
      ...base,
      '탐색 카드에는 이미지, 위치, 거리, 별점, 가격, 시설 태그를 같은 순서로 배치합니다.',
      '가로 스크롤 카드와 세로 리스트 카드는 같은 정보 체계를 유지하되 화면 밀도만 다르게 조정합니다.',
    ];
  }

  if (doc.domain.includes('결제')) {
    return [
      ...base,
      '금액 표기, 할인율, 상태 배지, 영수증 정보는 같은 단위와 순서를 유지합니다.',
      '확인 버튼, 재시도 버튼, 환불 요청 버튼은 현재 상태에 맞는 하나의 주 행동으로 정리합니다.',
    ];
  }

  if (
    doc.domain.includes('트레이너') ||
    doc.domain.includes('FC') ||
    doc.domain.includes('스태프')
  ) {
    return [
      ...base,
      '업무 카드에는 대상, 상태, 마감/일정, 다음 행동을 함께 표시합니다.',
      '역할별 하단 탭은 회원용 탭과 구분되어야 하며 업무 이동을 빠르게 만드는 항목만 둡니다.',
    ];
  }

  return base;
}

function getInteractionStandards(doc: Client2ScreenDoc): string[] {
  if (doc.domain.includes('탐색')) {
    return [
      '검색어 입력, 정렬 칩 선택, 카드 선택, 지도 보기, 상세 이동이 끊기지 않아야 합니다.',
      '검색 결과가 없을 때도 초기화 또는 다른 조건 선택으로 돌아갈 수 있어야 합니다.',
    ];
  }

  if (doc.domain.includes('결제')) {
    return [
      '옵션 변경이나 수량 변경 후 금액이 즉시 이해되어야 합니다.',
      '실패, 취소, 환불처럼 불안한 상태는 이유와 다음 행동을 같은 화면에서 안내합니다.',
    ];
  }

  if (
    doc.domain.includes('트레이너') ||
    doc.domain.includes('FC') ||
    doc.domain.includes('스태프')
  ) {
    return [
      '업무 처리 버튼은 처리 가능한 상태에서만 보여야 합니다.',
      '저장, 완료, 서명, 출석 처리 후에는 목록이나 상세에서 상태가 바뀐 것처럼 확인되어야 합니다.',
    ];
  }

  if (doc.domain.includes('커뮤니티')) {
    return [
      '작성, 신고, 차단 행동은 완료 전 확인을 거치고 완료 후 상태 문구가 남아야 합니다.',
      '내 활동 화면에서는 사용자가 이전 행동 결과를 다시 찾을 수 있어야 합니다.',
    ];
  }

  return [
    '주요 버튼은 한 화면에서 가장 중요한 행동 하나가 먼저 보이게 배치합니다.',
    '화면 이동 후 사용자가 이전 맥락을 잃지 않도록 제목, 상태, 선택 값을 유지합니다.',
  ];
}

export default function Client2DescriptionPanel() {
  const location = useLocation();
  const doc = getClient2ScreenDoc(location.pathname);

  if (!doc) {
    return (
      <aside className="client2-doc-panel" aria-label="client2 화면 설명">
        <div className="client2-doc-scroll">
          <p className="client2-doc-eyebrow">client2 기준 설명</p>
          <h2 className="client2-doc-title">매핑 확인 필요</h2>
          <div className="client2-doc-section">
            <h3>화면 일치 기준</h3>
            <p>
              이 화면은 아직 기획 설명 매핑이 필요합니다. 클라이언트 검수 전에는
              화면 목적, 화면 구성, 이용 흐름, 목업 데이터 기준을 모두 채워야
              합니다.
            </p>
          </div>
        </div>
      </aside>
    );
  }

  const flowSteps = getFlowSteps(doc);
  const mockDataNotes = getMockDataNotes(doc);
  const stateNotes = getStateNotes(doc);
  const publishingCheckpoints = getPublishingCheckpoints(doc);
  const currentScreenComposition = getCurrentScreenComposition(doc);
  const commonUiElements = getCommonUiElements(doc);
  const interactionStandards = getInteractionStandards(doc);

  return (
    <aside className="client2-doc-panel" aria-label="client2 화면 설명">
      <div className="client2-doc-scroll">
        <div className="client2-doc-header">
          <p className="client2-doc-eyebrow">기획자 화면 설명서</p>
          <h2 className="client2-doc-title">{doc.title}</h2>
        </div>

        <dl className="client2-doc-meta">
          <div>
            <dt>화면 ID</dt>
            <dd>{doc.id}</dd>
          </div>
          <div>
            <dt>도메인</dt>
            <dd>{doc.domain}</dd>
          </div>
        </dl>

        <div className="client2-doc-section">
          <h3>화면 목적</h3>
          <p>{doc.purpose}</p>
        </div>

        <div className="client2-doc-section">
          <h3>화면 구성</h3>
          <ul>
            {doc.ui.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="client2-doc-section">
          <h3>실제 화면 구성</h3>
          <ul>
            {currentScreenComposition.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="client2-doc-section">
          <h3>공통 UI 요소</h3>
          <ul>
            {commonUiElements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="client2-doc-section">
          <h3>상호작용 기준</h3>
          <ul>
            {interactionStandards.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="client2-doc-section">
          <h3>이용 흐름</h3>
          <ul>
            {flowSteps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="client2-doc-section">
          <h3>기획 기준</h3>
          <ul>
            {doc.rules.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="client2-doc-section">
          <h3>상태별 표현</h3>
          <ul>
            {stateNotes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="client2-doc-section">
          <h3>목업 데이터 기준</h3>
          <ul>
            {mockDataNotes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="client2-doc-section">
          <h3>퍼블리싱 검수 기준</h3>
          <ul>
            {publishingCheckpoints.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
