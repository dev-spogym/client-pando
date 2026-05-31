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

export default function Client2DescriptionPanel() {
  const location = useLocation();
  const doc = getClient2ScreenDoc(location.pathname);

  if (!doc) {
    return (
      <aside className="client2-doc-panel hidden lg:flex" aria-label="client2 화면 설명">
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

  return (
    <aside className="client2-doc-panel hidden lg:flex" aria-label="client2 화면 설명">
      <div className="client2-doc-scroll">
        <div className="client2-doc-header">
          <p className="client2-doc-eyebrow">기획 기준 화면 설명</p>
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
          <h3>목업 데이터 기준</h3>
          <ul>
            {mockDataNotes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
