import { useLocation } from 'react-router-dom';
import type { Client2ScreenDoc } from '@/lib/client2ScreenDocs';
import { getClient2ScreenDoc } from '@/lib/client2ScreenDocs';

function getFlowSteps(doc: Client2ScreenDoc): string[] {
  if (doc.domain.includes('결제')) {
    return ['상품/주문 정보 확인', '옵션과 결제 조건 확인', '결제 또는 실패/완료 상태 확인', '주문/영수증/환불 화면으로 연결'];
  }

  if (doc.domain.includes('트레이너')) {
    return ['강사 업무 화면 진입', '오늘 처리할 수업 또는 담당 회원 확인', '기록/서명/피드백 등 필요한 업무 수행', '처리 결과가 회원 이력에 반영된 상태 확인'];
  }

  if (doc.domain.includes('FC') || doc.domain.includes('스태프')) {
    return ['역할별 업무 화면 진입', '대상 회원/리드/일정 확인', '상담/출석/메모 등 현장 업무 처리', '처리 상태와 다음 액션 확인'];
  }

  if (doc.domain.includes('탐색')) {
    return ['탐색 화면 진입', '검색/필터로 대상 찾기', '센터/강사/리뷰 상세 확인', '스크랩/문의/예약 등 다음 행동 선택'];
  }

  if (doc.domain.includes('리워드')) {
    return ['리워드 화면 진입', '보유 혜택과 상태 확인', '사용 가능 조건 또는 적립 조건 확인', '사용/공유/상세 확인으로 연결'];
  }

  if (doc.domain.includes('커뮤니티')) {
    return ['커뮤니티 화면 진입', '질문/FAQ/내 활동 확인', '작성/신고/차단 등 필요한 행동 수행', '처리 상태 또는 답변 상태 확인'];
  }

  if (doc.domain.includes('시스템')) {
    return ['앱 상태 화면 진입', '현재 제한 또는 필요한 권한 확인', '재시도/설정/업데이트 등 안내 행동 수행', '정상 사용 가능 상태로 복귀'];
  }

  return ['화면 진입', '핵심 정보 확인', '필요한 행동 선택', '결과 또는 다음 화면 확인'];
}

function getMockDataNotes(doc: Client2ScreenDoc): string[] {
  if (doc.domain.includes('결제')) {
    return ['상품명, 금액, 결제 상태, 영수증 번호는 검수용 목업으로 표시합니다.', '성공/실패/환불 등 상태별 화면이 모두 확인 가능해야 합니다.'];
  }

  if (doc.domain.includes('트레이너')) {
    return ['수업 일정, 담당 회원, 서명, 피드백 기록은 검수용 목업으로 표시합니다.', '정상/완료/노쇼/서명 필요 같은 상태를 화면에서 확인할 수 있어야 합니다.'];
  }

  if (doc.domain.includes('FC') || doc.domain.includes('스태프')) {
    return ['리드, 회원, 상담 메모, 출석 대상은 검수용 목업으로 표시합니다.', '업무 처리 전/후 상태가 화면에서 구분되어야 합니다.'];
  }

  if (doc.domain.includes('탐색')) {
    return ['센터, 강사, 리뷰, 스크랩 정보는 검수용 목업으로 표시합니다.', '목록, 빈 상태, 상세 진입이 자연스럽게 이어져야 합니다.'];
  }

  if (doc.domain.includes('리워드')) {
    return ['쿠폰, 마일리지, 등급, 초대 보상은 검수용 목업으로 표시합니다.', '사용 가능/만료/소멸 예정 상태가 구분되어야 합니다.'];
  }

  if (doc.domain.includes('커뮤니티')) {
    return ['Q&A, FAQ, 신고, 내 활동 데이터는 검수용 목업으로 표시합니다.', '작성 전/작성 후/답변 완료/처리 중 상태를 확인할 수 있어야 합니다.'];
  }

  return ['회원명, 이용권, 예약, 알림 등 화면 데이터는 검수용 목업으로 표시합니다.', '빈 상태와 정상 상태가 모두 화면 의도와 맞아야 합니다.'];
}

function getStateNotes(doc: Client2ScreenDoc): string[] {
  if (doc.domain.includes('결제')) {
    return ['결제 전 확인 상태, 결제 진행 상태, 결제 완료 상태, 결제 실패 상태가 구분되어야 합니다.', '환불 또는 취소가 있는 화면은 요청 전/요청 완료/처리 중/처리 완료 상태를 확인할 수 있어야 합니다.', '금액, 할인, 마일리지, 결제수단 표시는 사용자가 오해하지 않도록 같은 순서와 단위로 유지합니다.'];
  }

  if (doc.domain.includes('트레이너')) {
    return ['오늘 할 일이 있는 상태와 없는 상태가 모두 자연스럽게 보여야 합니다.', '수업은 예정, 진행 가능, 완료, 노쇼, 서명 필요, 확인서 발급 같은 상태가 구분되어야 합니다.', '회원 기록 화면은 저장 전 입력 상태와 저장 후 반영 상태가 화면에서 분명해야 합니다.'];
  }

  if (doc.domain.includes('FC') || doc.domain.includes('스태프')) {
    return ['업무 대상이 있는 상태와 없는 상태를 모두 확인할 수 있어야 합니다.', '상담, 메모, 출석 처리 등 현장 업무는 처리 전/처리 후 상태가 분명해야 합니다.', '권한상 볼 수 없는 정보는 숨기고, 필요한 다음 행동만 남겨야 합니다.'];
  }

  if (doc.domain.includes('탐색')) {
    return ['추천 목록, 검색 결과 있음, 검색 결과 없음, 필터 적용 상태가 구분되어야 합니다.', '센터/강사/리뷰 상세는 정보가 부족한 경우에도 화면 구조가 깨지면 안 됩니다.', '스크랩, 문의, 예약 같은 다음 행동은 현재 대상의 상태에 맞게 노출되어야 합니다.'];
  }

  if (doc.domain.includes('리워드')) {
    return ['보유 혜택 있음, 보유 혜택 없음, 만료 예정, 사용 완료 상태가 구분되어야 합니다.', '등급과 마일리지는 현재 값, 다음 조건, 이력 정보가 서로 혼동되지 않아야 합니다.', '혜택 사용이 불가능한 경우에도 이유와 다음 행동이 보여야 합니다.'];
  }

  if (doc.domain.includes('커뮤니티')) {
    return ['목록 있음, 목록 없음, 작성 중, 답변 완료, 신고 처리 중 상태가 구분되어야 합니다.', '비공개 또는 제한된 항목은 사용자가 이유를 이해할 수 있게 안내해야 합니다.', '작성/신고/차단처럼 민감한 행동은 완료 전 확인과 완료 후 상태가 필요합니다.'];
  }

  if (doc.domain.includes('시스템')) {
    return ['정상 사용 가능, 권한 필요, 네트워크 오류, 점검, 업데이트 필요 상태가 구분되어야 합니다.', '사용자가 직접 해결할 수 있는 상태는 설정/재시도/업데이트 행동을 제공합니다.', '앱 사용이 막히는 상태에서도 현재 이유와 다음 행동이 먼저 보여야 합니다.'];
  }

  return ['정상 상태, 데이터 없음 상태, 제한 상태, 완료 상태가 화면에서 구분되어야 합니다.', '사용자가 다음 행동을 선택해야 하는 화면은 주요 CTA가 하나로 분명해야 합니다.', '상태 안내 문구는 짧고 구체적으로 표시합니다.'];
}

function getPublishingCheckpoints(doc: Client2ScreenDoc): string[] {
  const base = [
    '모바일 앱 폭에서 정보가 잘리지 않고, 데스크톱 검수 화면에서는 왼쪽 앱과 오른쪽 설명이 동시에 보여야 합니다.',
    '버튼, 탭, 카드, 리스트, 배지, 빈 상태가 같은 디자인 톤으로 정리되어야 합니다.',
    '문구는 개발 용어가 아니라 사용자가 이해하는 업무/서비스 용어로 표시해야 합니다.',
  ];

  if (doc.domain.includes('결제')) {
    return [...base, '금액과 상태 배지는 한눈에 구분되어야 하고, 실패/환불 상태는 성공 상태와 색상과 문구가 섞이면 안 됩니다.'];
  }

  if (doc.domain.includes('트레이너') || doc.domain.includes('FC') || doc.domain.includes('스태프')) {
    return [...base, '업무 화면은 반복 사용을 전제로 하므로 핵심 정보와 처리 버튼이 스크롤 없이 먼저 인지되어야 합니다.'];
  }

  if (doc.domain.includes('탐색')) {
    return [...base, '검색/필터/상세 이동이 자연스럽게 이어지고, 카드 정보 밀도가 과하지 않아야 합니다.'];
  }

  if (doc.domain.includes('커뮤니티')) {
    return [...base, '작성, 신고, 차단 같은 행동은 버튼 문구와 완료 피드백이 명확해야 합니다.'];
  }

  return base;
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
            이 화면은 아직 기획 설명 매핑이 필요합니다. 클라이언트 검수 전에는 화면 목적,
            화면 구성, 이용 흐름, 목업 데이터 기준을 모두 채워야 합니다.
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
