/**
 * 마켓플레이스 mock 데이터 (탐색 플랫폼)
 * — supabase의 실제 16개 branches 기반으로 재구성.
 * — 각 지점은 헬스장(피트니스) 기본 + PT, 필라테스, 요가, GX, 골프 등 다양한 운영.
 * — 이미지: picsum.photos seed (안정적인 무료 CDN)
 */

export type CategoryId =
  | 'all'
  | 'fitness'
  | 'pilates'
  | 'yoga'
  | 'golf'
  | 'crossfit'
  | 'spinning'
  | 'boxing'
  | 'swimming'
  | 'pt';

export const CATEGORIES: { id: CategoryId; label: string; icon: string }[] = [
  { id: 'all', label: '전체', icon: '🏋️' },
  { id: 'fitness', label: '헬스', icon: '💪' },
  { id: 'pt', label: 'PT', icon: '🏋️‍♂️' },
  { id: 'pilates', label: '필라테스', icon: '🧘‍♀️' },
  { id: 'yoga', label: '요가', icon: '🧘' },
  { id: 'golf', label: '골프', icon: '⛳' },
  { id: 'crossfit', label: '크로스핏', icon: '🏃' },
  { id: 'spinning', label: '스피닝', icon: '🚴' },
  { id: 'boxing', label: '복싱', icon: '🥊' },
  { id: 'swimming', label: '수영', icon: '🏊' },
];

export type ProductCategory = '전체' | '수강권' | '이용권' | '체험권' | '그룹' | '개인' | '온라인';
export const PRODUCT_CATEGORIES: ProductCategory[] = ['전체', '수강권', '이용권', '체험권', '그룹', '개인', '온라인'];

export type SortOption = '최신순' | '거리순' | '리뷰순' | '가격 낮은 순' | '체험권';
export const SORT_OPTIONS: SortOption[] = ['최신순', '거리순', '리뷰순', '가격 낮은 순', '체험권'];

export const FACILITY_OPTIONS = [
  '샤워',
  '탈의실',
  '주차장',
  '카페',
  '운동복',
  '타올',
  '유산소기구',
  '개인레슨',
  '발렛',
  '프라이빗 룸',
  '인바디',
  '수면실',
  '여성전용',
  '24시간',
  'WIFI',
  '골프 시뮬레이터',
  '필라테스 룸',
  '요가 룸',
  'GX 스튜디오',
] as const;

export type Facility = (typeof FACILITY_OPTIONS)[number];

export const SPECIALTY_OPTIONS = [
  '다이어트',
  '근력',
  '재활',
  '체형교정',
  '바디프로필',
  '시니어',
  '주니어',
  '임산부',
  '코어',
  '스트레칭',
  '유연성',
  '필라테스 강사 양성',
] as const;

export type Specialty = (typeof SPECIALTY_OPTIONS)[number];

/** 센터 (멀티센터) — DB의 branches와 1:1 매핑 */
export interface MarketCenter {
  id: number;
  name: string;
  /** 대표 카테고리 (보통 fitness — 종합 헬스장) */
  category: Exclude<CategoryId, 'all'>;
  /** 추가 운영 종목 */
  subCategories: Exclude<CategoryId, 'all'>[];
  district: string;
  dong: string;
  address: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  thumbnailUrl: string;
  images: string[];
  facilities: Facility[];
  openingHours: { weekday: string; weekend: string; holiday: string };
  phone: string;
  description: string;
  representativeProduct: {
    name: string;
    price: number;
    originalPrice?: number;
  };
  isNew?: boolean;
  isPromoted?: boolean;
  /** DB branches.branchCode */
  branchCode?: string;
  /** DB branches.districtName ("1지부" / "2지부") */
  districtZone?: string;
}

/** 강사 (마켓 표시용) */
export interface MarketTrainer {
  id: number;
  name: string;
  centerId: number;
  centerName: string;
  category: Exclude<CategoryId, 'all'>;
  rating: number;
  reviewCount: number;
  totalLessons: number;
  experienceYears: number;
  specialties: Specialty[];
  certifications: string[];
  bio: string;
  profileUrl: string;
  gender: 'M' | 'F';
}

/** 상품 */
export interface MarketProduct {
  id: number;
  centerId: number;
  centerName: string;
  category: Exclude<CategoryId, 'all'>;
  productCategory: Exclude<ProductCategory, '전체'>;
  name: string;
  price: number;
  originalPrice?: number;
  duration: string;
  sessions?: number;
  thumbnailUrl: string;
  description: string;
  isRepresentative: boolean;
}

/** 센터 리뷰 */
export interface CenterReview {
  id: number;
  centerId: number;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  facilityScores: { name: string; score: number }[];
  body: string;
  images: string[];
  createdAt: string;
  helpfulCount: number;
  isVerified: boolean;
}

/** 메신저 대화방 */
export type ConversationType = 'center' | 'trainer' | 'note';
export interface MarketConversation {
  id: number;
  type: ConversationType;
  participantName: string;
  participantAvatar: string;
  centerId?: number;
  trainerId?: number;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

/** 메시지 */
export type MessageContentType = 'text' | 'image' | 'note';
export interface MarketMessage {
  id: number;
  conversationId: number;
  senderId: 'me' | 'them';
  senderName?: string;
  type: MessageContentType;
  content: string;
  imageUrl?: string;
  noteData?: {
    classTitle: string;
    date: string;
    coachComment: string;
    nextGoal?: string;
  };
  sentAt: string;
  isRead: boolean;
}

/** picsum.photos seed URL 생성 */
export function img(seed: string, w = 800, h = 600): string {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

/** Avatar 전용 (정사각) */
export function avatarImg(seed: string, size = 200): string {
  return `https://picsum.photos/seed/${seed}/${size}/${size}`;
}

// ─────────────────────────────────────────────────────────────
// 센터 mock — 실제 DB의 16개 branches 기반
// 각 지점은 헬스장(피트니스) 기본 + 추가 운영 종목(필라테스/요가/PT/GX/골프 등)
// ─────────────────────────────────────────────────────────────

export const MOCK_CENTERS: MarketCenter[] = [
  {
    id: 1,
    name: '스포짐 광화문점',
    category: 'fitness',
    subCategories: ['pt', 'pilates', 'yoga', 'spinning'],
    district: '종로구',
    dong: '신문로1가',
    address: '서울 종로구 신문로1가 89 광화문빌딩 3F',
    latitude: 37.5715,
    longitude: 126.9748,
    distanceKm: 13.7,
    rating: 4.8,
    reviewCount: 312,
    thumbnailUrl: img('branch-1', 800, 600),
    images: [img('branch-1a', 1200, 800), img('branch-1b', 1200, 800), img('branch-1c', 1200, 800)],
    facilities: ['샤워', '탈의실', '주차장', '카페', '운동복', '타올', '인바디', 'WIFI', '필라테스 룸', '요가 룸', 'GX 스튜디오'],
    openingHours: { weekday: '06:00 - 23:00', weekend: '08:00 - 22:00', holiday: '08:00 - 22:00' },
    phone: '02-1234-5678',
    description: '광화문 직장인 90% 회원의 본점. 200평 규모, 헬스 · PT · 필라테스 · 요가 · 스피닝 · 줌바 · 에어로빅 모두 운영.',
    representativeProduct: { name: '회원권 12개월', price: 980000, originalPrice: 1200000 },
    isPromoted: true,
    branchCode: 'BR001',
    districtZone: '1지부',
  },
  {
    id: 2,
    name: '스포짐 을지로점',
    category: 'fitness',
    subCategories: ['pt', 'spinning'],
    district: '중구',
    dong: '을지로2가',
    address: '서울 중구 을지로2가 195',
    latitude: 37.5663,
    longitude: 126.9907,
    distanceKm: 14.2,
    rating: 4.6,
    reviewCount: 178,
    thumbnailUrl: img('branch-2', 800, 600),
    images: [img('branch-2a', 1200, 800), img('branch-2b', 1200, 800)],
    facilities: ['샤워', '탈의실', '운동복', '타올', '유산소기구', '24시간', 'GX 스튜디오'],
    openingHours: { weekday: '06:00 - 24:00', weekend: '08:00 - 22:00', holiday: '08:00 - 20:00' },
    phone: '02-1234-5679',
    description: '을지로 직장인 회원 중심. 점심·퇴근 시간 PT/스피닝 인기.',
    representativeProduct: { name: '헬스 6개월', price: 240000, originalPrice: 360000 },
    branchCode: 'BR002',
    districtZone: '1지부',
  },
  {
    id: 3,
    name: '스포짐 종각점',
    category: 'fitness',
    subCategories: ['pt', 'yoga', 'pilates'],
    district: '종로구',
    dong: '종로1가',
    address: '서울 종로구 종로1가 24',
    latitude: 37.5703,
    longitude: 126.9826,
    distanceKm: 13.5,
    rating: 4.7,
    reviewCount: 142,
    thumbnailUrl: img('branch-3', 800, 600),
    images: [img('branch-3a', 1200, 800), img('branch-3b', 1200, 800)],
    facilities: ['샤워', '탈의실', '주차장', '카페', '운동복', '타올', '필라테스 룸', '요가 룸'],
    openingHours: { weekday: '06:30 - 22:00', weekend: '09:00 - 20:00', holiday: '10:00 - 18:00' },
    phone: '02-1234-5680',
    description: '종각역 도보 3분. PT · 요가 · 필라테스 그룹 클래스 풍부.',
    representativeProduct: { name: '회원권 6개월', price: 360000 },
    branchCode: 'BR003',
    districtZone: '1지부',
  },
  {
    id: 4,
    name: '스포짐 종로점',
    category: 'fitness',
    subCategories: ['pt', 'pilates'],
    district: '종로구',
    dong: '종로3가',
    address: '서울 종로구 종로3가 15',
    latitude: 37.5708,
    longitude: 126.9919,
    distanceKm: 13.8,
    rating: 4.5,
    reviewCount: 98,
    thumbnailUrl: img('branch-4', 800, 600),
    images: [img('branch-4a', 1200, 800), img('branch-4b', 1200, 800)],
    facilities: ['샤워', '탈의실', '운동복', '타올', '인바디', '필라테스 룸'],
    openingHours: { weekday: '07:00 - 22:00', weekend: '09:00 - 21:00', holiday: '10:00 - 18:00' },
    phone: '02-1234-5681',
    description: '종로3가 도보 5분 헬스장. 필라테스 1:1 룸 보유.',
    representativeProduct: { name: 'PT 10회', price: 700000 },
    branchCode: 'BR004',
    districtZone: '1지부',
  },
  {
    id: 5,
    name: '스포짐 서교점',
    category: 'fitness',
    subCategories: ['pt', 'crossfit', 'yoga'],
    district: '마포구',
    dong: '서교동',
    address: '서울 마포구 서교동 364',
    latitude: 37.5563,
    longitude: 126.9237,
    distanceKm: 12.1,
    rating: 4.7,
    reviewCount: 234,
    thumbnailUrl: img('branch-5', 800, 600),
    images: [img('branch-5a', 1200, 800), img('branch-5b', 1200, 800), img('branch-5c', 1200, 800)],
    facilities: ['샤워', '탈의실', '주차장', '운동복', '타올', '프라이빗 룸', '인바디', 'GX 스튜디오', '요가 룸'],
    openingHours: { weekday: '06:00 - 23:00', weekend: '08:00 - 22:00', holiday: '09:00 - 20:00' },
    phone: '02-1234-5682',
    description: '홍대 인근 트렌디 헬스장. 크로스핏 박스 + PT + 요가 + 그룹 클래스.',
    representativeProduct: { name: '회원권 8개월', price: 50000, originalPrice: 100000 },
    isPromoted: true,
    branchCode: 'BR005',
    districtZone: '1지부',
  },
  {
    id: 6,
    name: '스포짐 신당점',
    category: 'fitness',
    subCategories: ['pt', 'spinning'],
    district: '중구',
    dong: '신당동',
    address: '서울 중구 신당동 290',
    latitude: 37.5656,
    longitude: 127.0186,
    distanceKm: 12.8,
    rating: 4.4,
    reviewCount: 87,
    thumbnailUrl: img('branch-6', 800, 600),
    images: [img('branch-6a', 1200, 800), img('branch-6b', 1200, 800)],
    facilities: ['샤워', '탈의실', '운동복', '타올', '24시간', 'GX 스튜디오'],
    openingHours: { weekday: '24시간', weekend: '24시간', holiday: '24시간' },
    phone: '02-1234-5683',
    description: '신당역 24시간 운영 헬스장. 스피닝 · 줌바 · 에어로빅 그룹 클래스 매일 진행.',
    representativeProduct: { name: '헬스 무제한 3개월', price: 180000 },
    branchCode: 'BR006',
    districtZone: '1지부',
  },
  {
    id: 7,
    name: '스포짐 가양점',
    category: 'fitness',
    subCategories: ['pt', 'pilates', 'yoga', 'spinning'],
    district: '강서구',
    dong: '가양동',
    address: '서울 강서구 가양동 1483',
    latitude: 37.5614,
    longitude: 126.8542,
    distanceKm: 15.2,
    rating: 4.6,
    reviewCount: 156,
    thumbnailUrl: img('branch-7', 800, 600),
    images: [img('branch-7a', 1200, 800), img('branch-7b', 1200, 800), img('branch-7c', 1200, 800)],
    facilities: ['샤워', '탈의실', '주차장', '카페', '운동복', '타올', '유산소기구', '개인레슨', '필라테스 룸', '요가 룸', 'GX 스튜디오'],
    openingHours: { weekday: '05:30 - 24:00', weekend: '08:00 - 22:00', holiday: '08:00 - 18:00' },
    phone: '02-1234-5684',
    description: '강서권 1등 종합 헬스장. 24시간 운영 + 필라테스/요가/스피닝 그룹 풍부.',
    representativeProduct: { name: 'GX 그룹레슨 50회 6개월', price: 399000 },
    branchCode: 'BR007',
    districtZone: '1지부',
  },
  {
    id: 8,
    name: '스포짐 고덕역점',
    category: 'fitness',
    subCategories: ['pt', 'pilates'],
    district: '강동구',
    dong: '고덕동',
    address: '서울 강동구 고덕동 633',
    latitude: 37.5547,
    longitude: 127.1546,
    distanceKm: 18.4,
    rating: 4.7,
    reviewCount: 121,
    thumbnailUrl: img('branch-8', 800, 600),
    images: [img('branch-8a', 1200, 800), img('branch-8b', 1200, 800)],
    facilities: ['샤워', '탈의실', '주차장', '운동복', '타올', '인바디', '프라이빗 룸', '필라테스 룸'],
    openingHours: { weekday: '06:00 - 23:00', weekend: '08:00 - 22:00', holiday: '10:00 - 20:00' },
    phone: '02-1234-5685',
    description: '고덕역 직결. 1:1 PT · 필라테스 프라이빗 룸 운영.',
    representativeProduct: { name: 'PT 20회 + 식단', price: 1600000 },
    isNew: true,
    branchCode: 'BR008',
    districtZone: '1지부',
  },
  {
    id: 9,
    name: '스포짐 양천향교점',
    category: 'fitness',
    subCategories: ['pt', 'spinning'],
    district: '양천구',
    dong: '신정동',
    address: '서울 양천구 신정동 318',
    latitude: 37.5252,
    longitude: 126.8567,
    distanceKm: 16.1,
    rating: 4.3,
    reviewCount: 64,
    thumbnailUrl: img('branch-9', 800, 600),
    images: [img('branch-9a', 1200, 800), img('branch-9b', 1200, 800)],
    facilities: ['샤워', '탈의실', '주차장', '운동복', '타올', 'GX 스튜디오'],
    openingHours: { weekday: '06:00 - 22:00', weekend: '09:00 - 21:00', holiday: '10:00 - 18:00' },
    phone: '02-1234-5686',
    description: '양천향교역 도보 3분. 합리적인 가격 + GX 그룹 클래스.',
    representativeProduct: { name: '헬스 3개월', price: 150000 },
    branchCode: 'BR009',
    districtZone: '1지부',
  },
  {
    id: 10,
    name: '스포짐 용산점',
    category: 'fitness',
    subCategories: ['pt', 'pilates', 'yoga'],
    district: '용산구',
    dong: '한강로2가',
    address: '서울 용산구 한강로2가 191',
    latitude: 37.5292,
    longitude: 126.9645,
    distanceKm: 8.4,
    rating: 4.7,
    reviewCount: 198,
    thumbnailUrl: img('branch-10', 800, 600),
    images: [img('branch-10a', 1200, 800), img('branch-10b', 1200, 800), img('branch-10c', 1200, 800)],
    facilities: ['샤워', '탈의실', '주차장', '카페', '운동복', '타올', '인바디', '프라이빗 룸', '필라테스 룸', '요가 룸'],
    openingHours: { weekday: '06:00 - 23:00', weekend: '08:00 - 22:00', holiday: '08:00 - 22:00' },
    phone: '02-1234-5687',
    description: '용산역 도보 5분. 헬스 · PT · 필라테스 · 요가 모두 보유.',
    representativeProduct: { name: '필라테스 그룹 50회', price: 750000 },
    branchCode: 'BR010',
    districtZone: '2지부',
  },
  {
    id: 11,
    name: '스포짐 판교점',
    category: 'fitness',
    subCategories: ['pt', 'pilates', 'yoga', 'golf', 'spinning'],
    district: '분당구',
    dong: '백현동',
    address: '경기 성남시 분당구 백현동 532',
    latitude: 37.3947,
    longitude: 127.1089,
    distanceKm: 22.3,
    rating: 4.9,
    reviewCount: 421,
    thumbnailUrl: img('branch-11', 800, 600),
    images: [
      img('branch-11a', 1200, 800),
      img('branch-11b', 1200, 800),
      img('branch-11c', 1200, 800),
      img('branch-11d', 1200, 800),
    ],
    facilities: [
      '샤워', '탈의실', '주차장', '카페', '발렛', '운동복', '타올', '인바디',
      '프라이빗 룸', '24시간', 'WIFI', '골프 시뮬레이터', '필라테스 룸', '요가 룸', 'GX 스튜디오',
    ],
    openingHours: { weekday: '24시간', weekend: '24시간', holiday: '24시간' },
    phone: '031-1234-5688',
    description: '판교 IT 직장인 1등 종합 운동 시설. 헬스 · PT · 필라테스 · 요가 · 스피닝 + GDR 골프 시뮬레이터까지 한 곳에서.',
    representativeProduct: { name: '프리미엄 회원권 12개월', price: 1200000, originalPrice: 1500000 },
    isPromoted: true,
    branchCode: 'BR011',
    districtZone: '2지부',
  },
  {
    id: 12,
    name: '스포짐 판교역점',
    category: 'fitness',
    subCategories: ['pt', 'golf'],
    district: '분당구',
    dong: '백현동',
    address: '경기 성남시 분당구 백현동 178',
    latitude: 37.3945,
    longitude: 127.1115,
    distanceKm: 22.1,
    rating: 4.6,
    reviewCount: 134,
    thumbnailUrl: img('branch-12', 800, 600),
    images: [img('branch-12a', 1200, 800), img('branch-12b', 1200, 800)],
    facilities: ['샤워', '탈의실', '주차장', '카페', '발렛', '운동복', '타올', '골프 시뮬레이터'],
    openingHours: { weekday: '06:00 - 23:00', weekend: '08:00 - 22:00', holiday: '08:00 - 22:00' },
    phone: '031-1234-5689',
    description: '판교역 도보 1분. 헬스 + 골프 인도어 전용. 직장인 점심·퇴근 후 골프 인기.',
    representativeProduct: { name: '골프 + 헬스 6개월', price: 1500000, originalPrice: 1800000 },
    isNew: true,
    branchCode: 'BR012',
    districtZone: '2지부',
  },
  {
    id: 13,
    name: '스포짐 대치점',
    category: 'fitness',
    subCategories: ['pt', 'pilates', 'yoga', 'golf'],
    district: '강남구',
    dong: '대치동',
    address: '서울 강남구 대치동 651',
    latitude: 37.4945,
    longitude: 127.0599,
    distanceKm: 10.8,
    rating: 4.9,
    reviewCount: 478,
    thumbnailUrl: img('branch-13', 800, 600),
    images: [
      img('branch-13a', 1200, 800),
      img('branch-13b', 1200, 800),
      img('branch-13c', 1200, 800),
      img('branch-13d', 1200, 800),
    ],
    facilities: [
      '샤워', '탈의실', '주차장', '카페', '발렛', '운동복', '타올', '인바디',
      '프라이빗 룸', '여성전용', 'WIFI', '골프 시뮬레이터', '필라테스 룸', '요가 룸',
    ],
    openingHours: { weekday: '06:00 - 23:00', weekend: '08:00 - 22:00', holiday: '08:00 - 22:00' },
    phone: '02-1234-5690',
    description: '대치동 학원가 인기 종합 헬스장. PT · 필라테스 · 요가 · 골프 모두 운영, 학부모/학생 회원 다수.',
    representativeProduct: { name: '필라테스 1:1 30회', price: 2400000, originalPrice: 3000000 },
    isPromoted: true,
    branchCode: 'BR013',
    districtZone: '2지부',
  },
  {
    id: 14,
    name: '스포짐 고척점',
    category: 'fitness',
    subCategories: ['pt', 'spinning'],
    district: '구로구',
    dong: '고척동',
    address: '서울 구로구 고척동 70',
    latitude: 37.4986,
    longitude: 126.8521,
    distanceKm: 14.5,
    rating: 4.4,
    reviewCount: 76,
    thumbnailUrl: img('branch-14', 800, 600),
    images: [img('branch-14a', 1200, 800), img('branch-14b', 1200, 800)],
    facilities: ['샤워', '탈의실', '주차장', '운동복', '타올', 'GX 스튜디오'],
    openingHours: { weekday: '06:00 - 23:00', weekend: '09:00 - 22:00', holiday: '10:00 - 18:00' },
    phone: '02-1234-5691',
    description: '고척돔 인근. 합리적 가격, GX 그룹 클래스 다수.',
    representativeProduct: { name: '헬스 6개월', price: 210000 },
    branchCode: 'BR014',
    districtZone: '2지부',
  },
  {
    id: 15,
    name: '스포짐 부천점',
    category: 'fitness',
    subCategories: ['pt', 'pilates', 'swimming'],
    district: '부천시',
    dong: '중동',
    address: '경기 부천시 원미구 중동 1141',
    latitude: 37.5039,
    longitude: 126.7651,
    distanceKm: 21.5,
    rating: 4.6,
    reviewCount: 102,
    thumbnailUrl: img('branch-15', 800, 600),
    images: [img('branch-15a', 1200, 800), img('branch-15b', 1200, 800)],
    facilities: ['샤워', '탈의실', '주차장', '카페', '운동복', '타올', '인바디', '필라테스 룸'],
    openingHours: { weekday: '06:00 - 23:00', weekend: '08:00 - 22:00', holiday: '09:00 - 20:00' },
    phone: '032-1234-5692',
    description: '부천 중동역 인근. 헬스 + 필라테스 + 25m 수영장 보유.',
    representativeProduct: { name: '회원권 + 수영 6개월', price: 480000 },
    branchCode: 'BR015',
    districtZone: '2지부',
  },
  {
    id: 16,
    name: '스포짐 목동점',
    category: 'fitness',
    subCategories: ['pt', 'pilates', 'yoga', 'golf'],
    district: '양천구',
    dong: '목동',
    address: '서울 양천구 목동 906',
    latitude: 37.5341,
    longitude: 126.8755,
    distanceKm: 14.8,
    rating: 4.8,
    reviewCount: 256,
    thumbnailUrl: img('branch-16', 800, 600),
    images: [
      img('branch-16a', 1200, 800),
      img('branch-16b', 1200, 800),
      img('branch-16c', 1200, 800),
    ],
    facilities: [
      '샤워', '탈의실', '주차장', '카페', '발렛', '운동복', '타올', '인바디',
      'WIFI', '골프 시뮬레이터', '필라테스 룸', '요가 룸', 'GX 스튜디오',
    ],
    openingHours: { weekday: '06:00 - 23:00', weekend: '08:00 - 22:00', holiday: '08:00 - 22:00' },
    phone: '02-1234-5693',
    description: '목동 학원가 종합 헬스장. PT · 필라테스 · 요가 · 골프 시뮬레이터 모두 운영.',
    representativeProduct: { name: '회원권 12개월', price: 980000, originalPrice: 1200000 },
    branchCode: 'BR016',
    districtZone: '미설정',
  },
];

// ─────────────────────────────────────────────────────────────
// 강사 mock — 지점별 분포 (각 지점 1-5명, 다양한 카테고리)
// ─────────────────────────────────────────────────────────────

export const MOCK_TRAINERS: MarketTrainer[] = [
  // 광화문점 (id 1) — 5명
  { id: 1, name: '김도윤', centerId: 1, centerName: '스포짐 광화문점', category: 'pt', rating: 4.9, reviewCount: 142, totalLessons: 1240, experienceYears: 8, specialties: ['다이어트', '근력', '바디프로필'], certifications: ['NSCA-CPT', '생활스포츠지도사 2급'], bio: '광화문 직장인 PT 다수 케어. 점심·퇴근 시간 클래스 인기.', profileUrl: avatarImg('trainer-1', 400), gender: 'M' },
  { id: 2, name: '박지민', centerId: 1, centerName: '스포짐 광화문점', category: 'pilates', rating: 5.0, reviewCount: 198, totalLessons: 1080, experienceYears: 7, specialties: ['재활', '체형교정', '필라테스 강사 양성'], certifications: ['BASI 마스터', 'STOTT PILATES'], bio: 'BASI 마스터 강사. 재활 필라테스 전문. 디스크/거북목 호전 사례 다수.', profileUrl: avatarImg('trainer-2', 400), gender: 'F' },
  { id: 3, name: '이서윤', centerId: 1, centerName: '스포짐 광화문점', category: 'yoga', rating: 4.8, reviewCount: 113, totalLessons: 760, experienceYears: 6, specialties: ['스트레칭', '유연성', '코어'], certifications: ['RYT-500', '인도 정통 요가 학교 수료'], bio: '인도 리시케시 7년 수련. 빈야사·하타·아쉬탕가 모두 가능.', profileUrl: avatarImg('trainer-3', 400), gender: 'F' },
  { id: 4, name: '강민준', centerId: 1, centerName: '스포짐 광화문점', category: 'pt', rating: 4.8, reviewCount: 89, totalLessons: 920, experienceYears: 6, specialties: ['근력', '시니어', '재활'], certifications: ['NSCA-CPT', 'FMS Level 2'], bio: '시니어·재활 PT 특화. 60대 이상 회원의 통증 완화 다수 사례.', profileUrl: avatarImg('trainer-4', 400), gender: 'M' },
  { id: 5, name: '정혜원', centerId: 1, centerName: '스포짐 광화문점', category: 'spinning', rating: 4.9, reviewCount: 154, totalLessons: 1340, experienceYears: 5, specialties: ['다이어트', '유연성'], certifications: ['Schwinn Spinning', 'Les Mills RPM'], bio: '광화문점 인기 스피닝 강사. 점심시간 라이브 DJ 클래스 매주 진행.', profileUrl: avatarImg('trainer-5', 400), gender: 'F' },

  // 을지로점 (id 2) — 1명
  { id: 6, name: '이효리', centerId: 2, centerName: '스포짐 을지로점', category: 'pt', rating: 4.7, reviewCount: 64, totalLessons: 580, experienceYears: 5, specialties: ['다이어트', '근력'], certifications: ['NSCA-CPT'], bio: '을지로 직장인 PT 전문. 30분/60분 클래스 운영.', profileUrl: avatarImg('trainer-6', 400), gender: 'F' },

  // 종각점 (id 3) — 2명
  { id: 7, name: '정지훈', centerId: 3, centerName: '스포짐 종각점', category: 'pt', rating: 4.6, reviewCount: 47, totalLessons: 520, experienceYears: 4, specialties: ['다이어트', '근력', '주니어'], certifications: ['NSCA-CPT'], bio: '입문자 환영. 친절한 코칭으로 6개월 다이어트 성공 회원 다수.', profileUrl: avatarImg('trainer-7', 400), gender: 'M' },
  { id: 8, name: '신소연', centerId: 3, centerName: '스포짐 종각점', category: 'yoga', rating: 4.8, reviewCount: 87, totalLessons: 720, experienceYears: 6, specialties: ['스트레칭', '유연성', '임산부'], certifications: ['RYT-200', '임산부 요가 지도자'], bio: '임산부 요가 전문. 출산 전후 회원 케어 다수.', profileUrl: avatarImg('trainer-8', 400), gender: 'F' },

  // 종로점 (id 4) — 1명
  { id: 9, name: '박재범', centerId: 4, centerName: '스포짐 종로점', category: 'pt', rating: 4.5, reviewCount: 32, totalLessons: 420, experienceYears: 4, specialties: ['바디프로필', '다이어트'], certifications: ['NSCA-CPT'], bio: '바디프로필 8주 챌린지 운영.', profileUrl: avatarImg('trainer-9', 400), gender: 'M' },

  // 서교점 (id 5) — 3명
  { id: 10, name: '한지우', centerId: 5, centerName: '스포짐 서교점', category: 'crossfit', rating: 4.8, reviewCount: 102, totalLessons: 980, experienceYears: 6, specialties: ['근력', '코어', '주니어'], certifications: ['CrossFit L2', 'CrossFit Mobility'], bio: 'CrossFit Games 지역 출전 경력. 주니어 클래스 인기.', profileUrl: avatarImg('trainer-10', 400), gender: 'F' },
  { id: 11, name: '윤성호', centerId: 5, centerName: '스포짐 서교점', category: 'pt', rating: 4.7, reviewCount: 78, totalLessons: 720, experienceYears: 7, specialties: ['근력', '바디프로필'], certifications: ['NSCA-CSCS', 'Precision Nutrition L1'], bio: '식단 컨설팅 동시 제공. 매크로 영양 기반 코칭.', profileUrl: avatarImg('trainer-11', 400), gender: 'M' },
  { id: 12, name: '오나라', centerId: 5, centerName: '스포짐 서교점', category: 'yoga', rating: 4.6, reviewCount: 53, totalLessons: 460, experienceYears: 4, specialties: ['스트레칭', '유연성'], certifications: ['RYT-200'], bio: '홍대 인근 직장인 요가 클래스 운영.', profileUrl: avatarImg('trainer-12', 400), gender: 'F' },

  // 신당점 (id 6) — 1명
  { id: 13, name: '송지효', centerId: 6, centerName: '스포짐 신당점', category: 'spinning', rating: 4.5, reviewCount: 42, totalLessons: 580, experienceYears: 5, specialties: ['다이어트'], certifications: ['Les Mills RPM'], bio: '24시간 운영 신당점 스피닝 매니저. 새벽·심야 클래스 인기.', profileUrl: avatarImg('trainer-13', 400), gender: 'F' },

  // 가양점 (id 7) — 3명
  { id: 14, name: '남주혁', centerId: 7, centerName: '스포짐 가양점', category: 'pt', rating: 4.6, reviewCount: 49, totalLessons: 520, experienceYears: 4, specialties: ['다이어트', '근력', '주니어'], certifications: ['NSCA-CPT'], bio: '강서권 가성비 PT. 입문자 친절 코칭.', profileUrl: avatarImg('trainer-14', 400), gender: 'M' },
  { id: 15, name: '강예진', centerId: 7, centerName: '스포짐 가양점', category: 'pilates', rating: 4.7, reviewCount: 67, totalLessons: 620, experienceYears: 5, specialties: ['재활', '체형교정', '임산부'], certifications: ['BASI', 'NASM-CES'], bio: '재활 필라테스 전문. 디스크·허리 통증 회원 다수.', profileUrl: avatarImg('trainer-15', 400), gender: 'F' },
  { id: 16, name: '한가람', centerId: 7, centerName: '스포짐 가양점', category: 'yoga', rating: 4.5, reviewCount: 38, totalLessons: 410, experienceYears: 3, specialties: ['스트레칭', '코어'], certifications: ['RYT-200'], bio: '하타 · 빈야사 요가 그룹 클래스.', profileUrl: avatarImg('trainer-16', 400), gender: 'F' },

  // 고덕역점 (id 8) — 2명
  { id: 17, name: '신민아', centerId: 8, centerName: '스포짐 고덕역점', category: 'pt', rating: 4.8, reviewCount: 71, totalLessons: 680, experienceYears: 5, specialties: ['바디프로필', '재활'], certifications: ['NSCA-CPT', 'NASM-CES'], bio: '고덕역 1:1 PT 전문. 8주 바디프로필 챌린지.', profileUrl: avatarImg('trainer-17', 400), gender: 'F' },
  { id: 18, name: '백승현', centerId: 8, centerName: '스포짐 고덕역점', category: 'pilates', rating: 4.6, reviewCount: 47, totalLessons: 420, experienceYears: 4, specialties: ['재활', '체형교정'], certifications: ['BASI', 'Polestar Mat'], bio: '재활 필라테스 1:1 프라이빗.', profileUrl: avatarImg('trainer-18', 400), gender: 'M' },

  // 양천향교점 (id 9) — 1명
  { id: 19, name: '이준기', centerId: 9, centerName: '스포짐 양천향교점', category: 'pt', rating: 4.3, reviewCount: 28, totalLessons: 320, experienceYears: 3, specialties: ['다이어트', '근력'], certifications: ['NSCA-CPT'], bio: '입문자 PT 전문. 친절한 코칭.', profileUrl: avatarImg('trainer-19', 400), gender: 'M' },

  // 용산점 (id 10) — 3명
  { id: 20, name: '한가인', centerId: 10, centerName: '스포짐 용산점', category: 'pt', rating: 4.8, reviewCount: 124, totalLessons: 1080, experienceYears: 8, specialties: ['바디프로필', '근력'], certifications: ['NSCA-CSCS', 'TRX'], bio: '용산점 인기 PT. 보디빌더 출신 트레이너.', profileUrl: avatarImg('trainer-20', 400), gender: 'F' },
  { id: 21, name: '문서진', centerId: 10, centerName: '스포짐 용산점', category: 'pilates', rating: 4.9, reviewCount: 95, totalLessons: 720, experienceYears: 6, specialties: ['바디프로필', '체형교정'], certifications: ['BASI', 'Polestar'], bio: '용산점 필라테스 그룹 클래스 정원 즉시 마감.', profileUrl: avatarImg('trainer-21', 400), gender: 'F' },
  { id: 22, name: '조태웅', centerId: 10, centerName: '스포짐 용산점', category: 'yoga', rating: 4.7, reviewCount: 78, totalLessons: 640, experienceYears: 5, specialties: ['스트레칭', '유연성', '코어'], certifications: ['RYT-200'], bio: '용산권 직장인 요가 인기 강사.', profileUrl: avatarImg('trainer-22', 400), gender: 'M' },

  // 판교점 (id 11) — 5명
  { id: 23, name: '원빈', centerId: 11, centerName: '스포짐 판교점', category: 'pt', rating: 5.0, reviewCount: 218, totalLessons: 1860, experienceYears: 12, specialties: ['근력', '바디프로필', '재활'], certifications: ['NSCA-CSCS', 'FMS Level 2', 'TRX'], bio: '판교 IT 직장인 PT 1순위. 8주 바디프로필 다수 성공.', profileUrl: avatarImg('trainer-23', 400), gender: 'M' },
  { id: 24, name: '김유나', centerId: 11, centerName: '스포짐 판교점', category: 'pilates', rating: 4.9, reviewCount: 187, totalLessons: 1340, experienceYears: 7, specialties: ['바디프로필', '재활', '체형교정'], certifications: ['BASI 마스터', 'Polestar Mat'], bio: '판교점 필라테스 8주 챌린지 정원 즉시 마감.', profileUrl: avatarImg('trainer-24', 400), gender: 'F' },
  { id: 25, name: '이수민', centerId: 11, centerName: '스포짐 판교점', category: 'yoga', rating: 4.8, reviewCount: 142, totalLessons: 980, experienceYears: 6, specialties: ['스트레칭', '유연성', '명상'] as Specialty[], certifications: ['RYT-500'], bio: '판교 직장인 요가/명상 전문. 점심시간 클래스 인기.', profileUrl: avatarImg('trainer-25', 400), gender: 'F' },
  { id: 26, name: '정현우', centerId: 11, centerName: '스포짐 판교점', category: 'golf', rating: 4.9, reviewCount: 156, totalLessons: 1240, experienceYears: 10, specialties: ['주니어', '시니어'], certifications: ['KPGA 정회원', 'TPI Golf Fitness'], bio: 'KPGA 출신. 판교 IT 직장인 골프 입문자 1순위.', profileUrl: avatarImg('trainer-26', 400), gender: 'M' },
  { id: 27, name: '박서연', centerId: 11, centerName: '스포짐 판교점', category: 'spinning', rating: 4.7, reviewCount: 98, totalLessons: 760, experienceYears: 5, specialties: ['다이어트'], certifications: ['Schwinn Spinning'], bio: '판교점 라이브 DJ 스피닝 클래스.', profileUrl: avatarImg('trainer-27', 400), gender: 'F' },

  // 판교역점 (id 12) — 2명
  { id: 28, name: '고준희', centerId: 12, centerName: '스포짐 판교역점', category: 'golf', rating: 4.6, reviewCount: 67, totalLessons: 620, experienceYears: 6, specialties: ['주니어'], certifications: ['KPGA 준회원', 'PGA Junior Coach'], bio: '판교역 도보 1분 골프 전문. 점심시간 1:1 레슨.', profileUrl: avatarImg('trainer-28', 400), gender: 'F' },
  { id: 29, name: '강승원', centerId: 12, centerName: '스포짐 판교역점', category: 'pt', rating: 4.5, reviewCount: 42, totalLessons: 380, experienceYears: 4, specialties: ['근력', '다이어트'], certifications: ['NSCA-CPT'], bio: 'IT 직장인 PT. 30분 단위 점심 PT 운영.', profileUrl: avatarImg('trainer-29', 400), gender: 'M' },

  // 대치점 (id 13) — 4명
  { id: 30, name: '박서준', centerId: 13, centerName: '스포짐 대치점', category: 'pt', rating: 4.9, reviewCount: 256, totalLessons: 1680, experienceYears: 10, specialties: ['바디프로필', '근력', '재활'], certifications: ['NSCA-CSCS', 'FMS Level 2'], bio: '대치 학부모/학생 다수 케어. 주말 패밀리 PT 인기.', profileUrl: avatarImg('trainer-30', 400), gender: 'M' },
  { id: 31, name: '최예린', centerId: 13, centerName: '스포짐 대치점', category: 'pilates', rating: 5.0, reviewCount: 187, totalLessons: 1240, experienceYears: 7, specialties: ['바디프로필', '체형교정', '임산부'], certifications: ['Polestar 마스터', 'BASI'], bio: '대치동 1:1 프라이빗 필라테스 전문. 산전·산후 케어.', profileUrl: avatarImg('trainer-31', 400), gender: 'F' },
  { id: 32, name: '안유진', centerId: 13, centerName: '스포짐 대치점', category: 'yoga', rating: 4.8, reviewCount: 123, totalLessons: 920, experienceYears: 6, specialties: ['스트레칭', '코어'], certifications: ['RYT-500'], bio: '대치 학부모 요가 인기 강사.', profileUrl: avatarImg('trainer-32', 400), gender: 'F' },
  { id: 33, name: '백승준', centerId: 13, centerName: '스포짐 대치점', category: 'golf', rating: 4.8, reviewCount: 142, totalLessons: 1120, experienceYears: 9, specialties: ['주니어'], certifications: ['KPGA 정회원'], bio: '대치 학생 골프 입문 다수. 주말 패밀리 골프.', profileUrl: avatarImg('trainer-33', 400), gender: 'M' },

  // 고척점 (id 14) — 1명
  { id: 34, name: '김지원', centerId: 14, centerName: '스포짐 고척점', category: 'pt', rating: 4.4, reviewCount: 38, totalLessons: 340, experienceYears: 3, specialties: ['다이어트', '근력'], certifications: ['NSCA-CPT'], bio: '고척돔 인근 PT. 입문자 환영.', profileUrl: avatarImg('trainer-34', 400), gender: 'F' },

  // 부천점 (id 15) — 2명
  { id: 35, name: '이서진', centerId: 15, centerName: '스포짐 부천점', category: 'swimming', rating: 4.7, reviewCount: 87, totalLessons: 920, experienceYears: 8, specialties: ['주니어', '시니어'], certifications: ['생활체육 수영지도자', 'KCSF 마스터'], bio: '부천 25m 수영장. 입문자~마스터즈, 주니어반 인기.', profileUrl: avatarImg('trainer-35', 400), gender: 'M' },
  { id: 36, name: '추예원', centerId: 15, centerName: '스포짐 부천점', category: 'pilates', rating: 4.6, reviewCount: 54, totalLessons: 510, experienceYears: 5, specialties: ['재활', '체형교정'], certifications: ['BASI'], bio: '부천 필라테스 그룹·1:1.', profileUrl: avatarImg('trainer-36', 400), gender: 'F' },

  // 목동점 (id 16) — 3명
  { id: 37, name: '최우식', centerId: 16, centerName: '스포짐 목동점', category: 'pt', rating: 4.8, reviewCount: 156, totalLessons: 1180, experienceYears: 8, specialties: ['바디프로필', '근력', '시니어'], certifications: ['NSCA-CPT', 'NASM-CES'], bio: '목동 학원가 학부모 PT 다수. 주말 패밀리 PT 인기.', profileUrl: avatarImg('trainer-37', 400), gender: 'M' },
  { id: 38, name: '정아름', centerId: 16, centerName: '스포짐 목동점', category: 'pilates', rating: 4.7, reviewCount: 98, totalLessons: 720, experienceYears: 6, specialties: ['체형교정', '다이어트'], certifications: ['BASI'], bio: '목동 직장 여성 필라테스 그룹.', profileUrl: avatarImg('trainer-38', 400), gender: 'F' },
  { id: 39, name: '김태형', centerId: 16, centerName: '스포짐 목동점', category: 'golf', rating: 4.7, reviewCount: 78, totalLessons: 640, experienceYears: 7, specialties: ['주니어'], certifications: ['KPGA 준회원'], bio: '목동 학생 골프 입문/주니어 클래스.', profileUrl: avatarImg('trainer-39', 400), gender: 'M' },

  // 골프 보강 — 판교점에 1명 더, 대치점에 1명 더, 목동점에 1명 더
  { id: 40, name: '정유진', centerId: 11, centerName: '스포짐 판교점', category: 'golf', rating: 4.8, reviewCount: 132, totalLessons: 1080, experienceYears: 9, specialties: ['바디프로필', '시니어'] as Specialty[], certifications: ['LPGA Class A', 'TPI Golf Fitness'], bio: 'LPGA 출신 여성 골프 전문 강사. 여성·시니어 회원 인기.', profileUrl: avatarImg('trainer-40', 400), gender: 'F' },
  { id: 41, name: '하성진', centerId: 13, centerName: '스포짐 대치점', category: 'golf', rating: 4.9, reviewCount: 167, totalLessons: 1340, experienceYears: 11, specialties: ['바디프로필', '주니어'] as Specialty[], certifications: ['KPGA 정회원', 'PGA Certified'], bio: '대치동 KPGA 정회원. 입문부터 싱글 진입까지 단계별 커리큘럼.', profileUrl: avatarImg('trainer-41', 400), gender: 'M' },
  { id: 42, name: '오세린', centerId: 16, centerName: '스포짐 목동점', category: 'golf', rating: 4.6, reviewCount: 64, totalLessons: 540, experienceYears: 5, specialties: ['주니어', '체형교정'], certifications: ['KLPGA 준회원'], bio: '목동 학원가 학부모/학생 골프 가족 클래스.', profileUrl: avatarImg('trainer-42', 400), gender: 'F' },
];

// ─────────────────────────────────────────────────────────────
// 상품 mock — 지점별 다양한 카테고리 (헬스 이용권 + PT + GX 그룹 + 골프)
// 한 지점에 평균 4-7개 상품이 분포 (BODY SWITCH 패턴: 한 센터 다종목)
// ─────────────────────────────────────────────────────────────

let _pid = 0;
const nextPid = () => ++_pid;

function buildProductsForCenter(center: MarketCenter): MarketProduct[] {
  const products: MarketProduct[] = [];

  // 헬스 이용권 (모든 지점 기본)
  products.push({
    id: nextPid(),
    centerId: center.id,
    centerName: center.name,
    category: 'fitness',
    productCategory: '체험권',
    name: '헬스 체험 1회',
    price: 9900,
    duration: '1회',
    thumbnailUrl: img(`product-${center.id}-trial`, 600, 400),
    description: '센터 시설을 직접 체험해보세요.',
    isRepresentative: false,
  });

  // 대표 상품 (이용권 또는 회원권)
  products.push({
    id: nextPid(),
    centerId: center.id,
    centerName: center.name,
    category: 'fitness',
    productCategory: '이용권',
    name: center.representativeProduct.name,
    price: center.representativeProduct.price,
    originalPrice: center.representativeProduct.originalPrice,
    duration: center.representativeProduct.name.includes('12개월') ? '12개월' : center.representativeProduct.name.includes('8개월') ? '8개월' : '6개월',
    thumbnailUrl: img(`product-${center.id}-main`, 600, 400),
    description: center.description,
    isRepresentative: true,
  });

  // PT (모든 지점에 PT 옵션)
  if (center.subCategories.includes('pt') || center.category === 'pt') {
    products.push({
      id: nextPid(),
      centerId: center.id,
      centerName: center.name,
      category: 'pt',
      productCategory: '개인',
      name: 'PT 10회',
      price: 700000,
      duration: '3개월 이내',
      sessions: 10,
      thumbnailUrl: img(`product-${center.id}-pt10`, 600, 400),
      description: '1:1 PT 10회. 인바디 측정 포함.',
      isRepresentative: false,
    });
    products.push({
      id: nextPid(),
      centerId: center.id,
      centerName: center.name,
      category: 'pt',
      productCategory: '개인',
      name: 'PT 20회 + 식단 컨설팅',
      price: 1400000,
      originalPrice: 1600000,
      duration: '6개월 이내',
      sessions: 20,
      thumbnailUrl: img(`product-${center.id}-pt20`, 600, 400),
      description: 'PT 20회 + 매크로 영양 식단 컨설팅.',
      isRepresentative: false,
    });
  }

  // 필라테스
  if (center.subCategories.includes('pilates')) {
    products.push({
      id: nextPid(),
      centerId: center.id,
      centerName: center.name,
      category: 'pilates',
      productCategory: '그룹',
      name: '필라테스 그룹레슨 50회',
      price: 750000,
      duration: '6개월',
      sessions: 50,
      thumbnailUrl: img(`product-${center.id}-pilates-grp`, 600, 400),
      description: '주 2회 그룹 필라테스. 정원 6명.',
      isRepresentative: false,
    });
  }

  // 요가
  if (center.subCategories.includes('yoga')) {
    products.push({
      id: nextPid(),
      centerId: center.id,
      centerName: center.name,
      category: 'yoga',
      productCategory: '그룹',
      name: '요가 그룹레슨 40회',
      price: 480000,
      duration: '4개월',
      sessions: 40,
      thumbnailUrl: img(`product-${center.id}-yoga-grp`, 600, 400),
      description: '주 2-3회 요가 클래스 (하타·빈야사·아쉬탕가).',
      isRepresentative: false,
    });
  }

  // 골프 (보유 지점만)
  if (center.subCategories.includes('golf')) {
    products.push({
      id: nextPid(),
      centerId: center.id,
      centerName: center.name,
      category: 'golf',
      productCategory: '개인',
      name: '골프 1:1 레슨 30회',
      price: 1500000,
      originalPrice: 1800000,
      duration: '6개월',
      sessions: 30,
      thumbnailUrl: img(`product-${center.id}-golf-30`, 600, 400),
      description: 'KPGA 출신 강사 1:1 레슨 + GDR 시뮬레이터.',
      isRepresentative: false,
    });
    products.push({
      id: nextPid(),
      centerId: center.id,
      centerName: center.name,
      category: 'golf',
      productCategory: '체험권',
      name: '골프 체험 1회',
      price: 39000,
      duration: '1회',
      thumbnailUrl: img(`product-${center.id}-golf-trial`, 600, 400),
      description: 'KPGA 강사 1:1 체험 레슨.',
      isRepresentative: false,
    });
  }

  // 스피닝/GX
  if (center.subCategories.includes('spinning')) {
    products.push({
      id: nextPid(),
      centerId: center.id,
      centerName: center.name,
      category: 'spinning',
      productCategory: '그룹',
      name: 'GX 무제한 3개월 (스피닝/줌바/에어로빅)',
      price: 270000,
      duration: '3개월',
      thumbnailUrl: img(`product-${center.id}-gx`, 600, 400),
      description: 'GX 그룹 클래스 무제한.',
      isRepresentative: false,
    });
  }

  // 크로스핏
  if (center.subCategories.includes('crossfit')) {
    products.push({
      id: nextPid(),
      centerId: center.id,
      centerName: center.name,
      category: 'crossfit',
      productCategory: '이용권',
      name: '크로스핏 무제한 3개월',
      price: 540000,
      duration: '3개월',
      thumbnailUrl: img(`product-${center.id}-crossfit`, 600, 400),
      description: 'CrossFit L1/L2 코치 WOD 매일 무제한.',
      isRepresentative: false,
    });
  }

  // 수영
  if (center.subCategories.includes('swimming')) {
    products.push({
      id: nextPid(),
      centerId: center.id,
      centerName: center.name,
      category: 'swimming',
      productCategory: '이용권',
      name: '자유 수영 6개월',
      price: 360000,
      duration: '6개월',
      thumbnailUrl: img(`product-${center.id}-swim`, 600, 400),
      description: '25m 5레인 풀 자유 이용.',
      isRepresentative: false,
    });
  }

  return products;
}

export const MOCK_PRODUCTS: MarketProduct[] = MOCK_CENTERS.flatMap(buildProductsForCenter);

// ─────────────────────────────────────────────────────────────
// 센터 리뷰 mock — 지점별 분포
// ─────────────────────────────────────────────────────────────

const FACILITY_SCORE_KEYS = ['시설 청결도', '강사 친절', '운동 효과', '편의시설', '가격 만족도'];

function buildFacilityScores(base: number) {
  return FACILITY_SCORE_KEYS.map((name, i) => ({
    name,
    score: Math.max(1, Math.min(5, Math.round((base + ((i % 3) - 1) * 0.3) * 10) / 10)),
  }));
}

let _rid = 0;
const nextRid = () => ++_rid;

function r(centerId: number, authorName: string, rating: number, body: string, withImages = 0, helpfulCount = 0, daysAgo = 1, withAvatar = false): CenterReview {
  const date = new Date('2026-04-29');
  date.setDate(date.getDate() - daysAgo);
  return {
    id: nextRid(),
    centerId,
    authorName,
    authorAvatar: withAvatar ? avatarImg(`u-${centerId}-${authorName}`, 100) : undefined,
    rating,
    facilityScores: buildFacilityScores(rating),
    body,
    images: Array.from({ length: withImages }, (_, i) => img(`review-${centerId}-${authorName}-${i}`, 600, 600)),
    createdAt: date.toISOString().slice(0, 10),
    helpfulCount,
    isVerified: true,
  };
}

export const MOCK_REVIEWS: CenterReview[] = [
  // 광화문점 (id 1)
  r(1, '김**', 5, '점심시간 그룹 클래스 풍부. 광화문 직장인이라면 추천!', 2, 32, 2, true),
  r(1, '박**', 5, '시설도 깨끗하고 트레이너분들도 친절. PT 받으면서 8주만에 7kg 감량.', 1, 24, 5),
  r(1, '이**', 4, '점심시간엔 사람이 많지만 새벽이 한산해요.', 1, 12, 9, true),
  r(1, '최**', 5, '필라테스 박지민 강사님 진짜 최고. 디스크 통증 많이 줄었어요.', 0, 28, 3),
  // 을지로점 (id 2)
  r(2, '정**', 4, '24시간 운영이라 새벽 운동 가능. 가성비 좋아요.', 0, 14, 4),
  r(2, '윤**', 5, '직장에서 가까워 출퇴근 운동 편해요.', 1, 18, 7),
  // 종각점 (id 3)
  r(3, '오**', 5, '요가 이서윤 강사님 수업 깊이 있어요.', 1, 19, 4, true),
  r(3, '강**', 4, '시설 깨끗하고 강사 친절. 종각역 가까워서 좋음.', 0, 11, 8),
  // 종로점 (id 4)
  r(4, '서**', 4, '필라테스 1:1 룸 보유. PT 박재범 코치님 추천.', 0, 9, 6),
  // 서교점 (id 5)
  r(5, '임**', 5, '홍대 인근에서 크로스핏 + 헬스 동시에 가능한 곳!', 2, 26, 3),
  r(5, '백**', 5, '한지우 코치님 크로스핏 입문 잘 봐주세요.', 1, 17, 5, true),
  r(5, '조**', 4, '장비 좋고 깨끗해요. 주차도 편해요.', 0, 13, 9),
  // 신당점 (id 6)
  r(6, '신**', 4, '24시간 운영 너무 편해요. 새벽 스피닝 인기.', 0, 8, 4),
  r(6, '권**', 5, '클럽 분위기 스피닝 너무 신나요.', 1, 16, 7, true),
  // 가양점 (id 7)
  r(7, '황**', 5, '강서권 가성비 헬스장 1등. 시설 좋고 강사 친절.', 1, 21, 5, true),
  r(7, '양**', 4, '가족 단위로 다니기 좋아요. 필라테스도 운영.', 0, 12, 8),
  r(7, '구**', 5, '필라테스 강예진 강사님 재활 PT 받았는데 효과 최고.', 2, 19, 3),
  // 고덕역점 (id 8)
  r(8, '추**', 5, '신축 시설 너무 깨끗. 신민아 트레이너님 PT 추천.', 1, 23, 2, true),
  r(8, '문**', 4, '고덕역 직결이라 출퇴근 편해요.', 0, 9, 6),
  // 양천향교점 (id 9)
  r(9, '정**', 4, '합리적 가격, 운영 깔끔해요.', 0, 6, 7),
  // 용산점 (id 10)
  r(10, '한**', 5, '용산점 시설·강사·운영 다 만족. 한가인 트레이너님 추천!', 2, 31, 4, true),
  r(10, '서**', 5, '필라테스 문서진 강사님 그룹 클래스 정원 즉시 마감 ㅠ', 0, 22, 6),
  r(10, '강**', 4, '직장인 점심 운동하기 좋아요.', 1, 14, 9, true),
  // 판교점 (id 11) — 가장 인기
  r(11, '정**', 5, '판교 IT 직장인 1순위. 헬스·PT·필라테스·요가·골프 다 한 곳에서!', 3, 47, 2, true),
  r(11, '한**', 5, '원빈 트레이너님 PT 받고 8주만에 바디프로필 찍었어요!', 2, 38, 4),
  r(11, '서**', 4, '시설 너무 좋고 24시간이라 좋은데 가끔 사람이 너무 많아요.', 0, 11, 8, true),
  r(11, '강**', 5, '김유나 강사님 필라테스 8주 챌린지 완전 변신.', 1, 26, 6, true),
  r(11, '신**', 5, '정현우 코치님 골프 레슨 KPGA 수준. 6개월만에 머리비기 70대.', 2, 34, 3, true),
  r(11, '윤**', 5, '24시간 운영 + 골프 시뮬레이터 같은 곳 강력 추천.', 1, 28, 7),
  // 판교역점 (id 12)
  r(12, '백**', 5, '점심시간 골프 1:1 레슨 너무 편해요. 고준희 코치님 추천.', 1, 19, 5, true),
  r(12, '오**', 4, '판교역 도보 1분이라 IT 직장인 출퇴근 운동 편해요.', 0, 11, 8),
  // 대치점 (id 13)
  r(13, '문**', 5, '대치 학원가 패밀리 헬스장. 학생·학부모 모두 다녀요.', 2, 42, 3, true),
  r(13, '추**', 5, '최예린 강사님 필라테스 1:1. 청담급 퀄리티.', 1, 31, 5),
  r(13, '곽**', 5, '박서준 트레이너님 주말 패밀리 PT 강력 추천.', 2, 29, 6, true),
  r(13, '권**', 4, '시설은 최고지만 가격이 좀 있어요.', 0, 13, 9, true),
  r(13, '하**', 5, '백승준 코치님 골프 주니어반 우리 아이 너무 잘 가르쳐주셔요.', 1, 24, 4),
  // 고척점 (id 14)
  r(14, '권**', 4, '고척돔 인근 합리적 헬스장.', 0, 7, 7),
  // 부천점 (id 15)
  r(15, '강**', 5, '25m 수영장 보유. 가족 단위로 다니기 좋아요.', 1, 18, 4, true),
  r(15, '박**', 4, '필라테스 추예원 강사님 친절해요.', 0, 11, 8),
  // 목동점 (id 16)
  r(16, '정**', 5, '목동 학원가 학부모 패밀리 헬스장. 골프 시뮬레이터까지!', 2, 33, 3, true),
  r(16, '윤**', 5, '최우식 트레이너님 PT 받고 다이어트 성공.', 1, 22, 5),
  r(16, '구**', 4, '시설 좋고 깨끗해요. 점심 클래스 다양.', 0, 14, 7, true),
];

// ─────────────────────────────────────────────────────────────
// 메신저 대화방 + 메시지 mock
// ─────────────────────────────────────────────────────────────

export const MOCK_CONVERSATIONS: MarketConversation[] = [
  { id: 1, type: 'center', participantName: '스포짐 광화문점', participantAvatar: avatarImg('branch-1', 100), centerId: 1, lastMessage: '문의주신 PT 패키지 안내드립니다. 이번주 주말 상담 가능하실까요?', lastMessageAt: '2026-04-29T14:23:00', unreadCount: 2 },
  { id: 2, type: 'trainer', participantName: '김도윤 트레이너', participantAvatar: avatarImg('trainer-1', 100), trainerId: 1, lastMessage: '내일 10시 시간 가능합니다. 컨디션 어떠세요?', lastMessageAt: '2026-04-29T11:05:00', unreadCount: 1 },
  { id: 3, type: 'trainer', participantName: '박지민 트레이너', participantAvatar: avatarImg('trainer-2', 100), trainerId: 2, lastMessage: '오늘 수업 후기 작성 부탁드려요!', lastMessageAt: '2026-04-28T19:48:00', unreadCount: 0 },
  { id: 4, type: 'center', participantName: '스포짐 판교점', participantAvatar: avatarImg('branch-11', 100), centerId: 11, lastMessage: '환영합니다! 첫 방문 안내문 보내드렸어요.', lastMessageAt: '2026-04-28T10:12:00', unreadCount: 0 },
  { id: 5, type: 'note', participantName: '원빈 트레이너 — 강의노트', participantAvatar: avatarImg('trainer-23', 100), trainerId: 23, lastMessage: '[강의노트] 4주차 중간 점검 — 데드리프트 자세 교정', lastMessageAt: '2026-04-27T20:30:00', unreadCount: 1 },
  { id: 6, type: 'note', participantName: '김유나 강사 — 강의노트', participantAvatar: avatarImg('trainer-24', 100), trainerId: 24, lastMessage: '[강의노트] 필라테스 챌린지 5주차 동작 영상', lastMessageAt: '2026-04-26T15:00:00', unreadCount: 0 },
];

export const MOCK_MESSAGES: Record<number, MarketMessage[]> = {
  1: [
    { id: 1, conversationId: 1, senderId: 'them', senderName: '센터 매니저', type: 'text', content: '안녕하세요, 스포짐 광화문점입니다. 문의 감사드립니다.', sentAt: '2026-04-29T14:10:00', isRead: true },
    { id: 2, conversationId: 1, senderId: 'me', type: 'text', content: 'PT 30회 패키지 가격이 궁금해요. 식단 컨설팅도 같이 되나요?', sentAt: '2026-04-29T14:12:00', isRead: true },
    { id: 3, conversationId: 1, senderId: 'them', senderName: '센터 매니저', type: 'text', content: 'PT 30회 + 식단 컨설팅 패키지 240만원입니다. 첫 달 인바디 측정과 8주 챌린지 프로그램 포함이에요.', sentAt: '2026-04-29T14:18:00', isRead: false },
    { id: 4, conversationId: 1, senderId: 'them', senderName: '센터 매니저', type: 'text', content: '문의주신 PT 패키지 안내드립니다. 이번주 주말 상담 가능하실까요?', sentAt: '2026-04-29T14:23:00', isRead: false },
  ],
  2: [
    { id: 1, conversationId: 2, senderId: 'them', senderName: '김도윤 트레이너', type: 'text', content: '안녕하세요 황성안님. 다음 PT 일정 잡으려고 연락드렸어요.', sentAt: '2026-04-29T10:45:00', isRead: true },
    { id: 2, conversationId: 2, senderId: 'me', type: 'text', content: '내일 오전 가능한 시간 있을까요?', sentAt: '2026-04-29T10:58:00', isRead: true },
    { id: 3, conversationId: 2, senderId: 'them', senderName: '김도윤 트레이너', type: 'text', content: '내일 10시 시간 가능합니다. 컨디션 어떠세요?', sentAt: '2026-04-29T11:05:00', isRead: false },
  ],
  3: [
    { id: 1, conversationId: 3, senderId: 'them', senderName: '박지민 트레이너', type: 'text', content: '오늘 수업 수고 많으셨어요!', sentAt: '2026-04-28T19:30:00', isRead: true },
    { id: 2, conversationId: 3, senderId: 'me', type: 'text', content: '재활 효과 정말 좋네요. 감사합니다!', sentAt: '2026-04-28T19:42:00', isRead: true },
    { id: 3, conversationId: 3, senderId: 'them', senderName: '박지민 트레이너', type: 'text', content: '오늘 수업 후기 작성 부탁드려요!', sentAt: '2026-04-28T19:48:00', isRead: true },
  ],
  4: [
    { id: 1, conversationId: 4, senderId: 'them', senderName: '센터 매니저', type: 'text', content: '환영합니다! 첫 방문 안내문 보내드렸어요.', sentAt: '2026-04-28T10:12:00', isRead: true },
  ],
  5: [
    { id: 1, conversationId: 5, senderId: 'them', senderName: '원빈 트레이너', type: 'note', content: '4주차 중간 점검', noteData: { classTitle: '바디프로필 8주 챌린지 4주차', date: '2026-04-27', coachComment: '상체 라인이 많이 잡혔어요. 데드리프트 자세에서 허리 중립 유지에 더 집중하면 5주차에 큰 변화가 있을 거예요.', nextGoal: '데드리프트 80kg × 5회 × 3세트' }, sentAt: '2026-04-27T20:30:00', isRead: false },
  ],
  6: [
    { id: 1, conversationId: 6, senderId: 'them', senderName: '김유나 강사', type: 'note', content: '5주차 동작 영상', noteData: { classTitle: '필라테스 8주 챌린지 5주차', date: '2026-04-26', coachComment: '코어 안정성이 많이 좋아졌어요. 호흡과 함께 동작을 천천히 가져가는 부분에 더 신경써주세요.', nextGoal: '리포머 풋워크 시리즈 매일 10분 자가연습' }, sentAt: '2026-04-26T15:00:00', isRead: true },
  ],
};

// ─────────────────────────────────────────────────────────────
// 찜 mock
// ─────────────────────────────────────────────────────────────

export type ScrapTargetType = 'center' | 'trainer' | 'product' | 'class';

export interface ScrapItem {
  id: number;
  targetType: ScrapTargetType;
  targetId: number;
  createdAt: string;
}

export const MOCK_SCRAPS: ScrapItem[] = [
  { id: 1, targetType: 'center', targetId: 1, createdAt: '2026-04-26' },
  { id: 2, targetType: 'center', targetId: 11, createdAt: '2026-04-25' },
  { id: 3, targetType: 'center', targetId: 13, createdAt: '2026-04-23' },
  { id: 4, targetType: 'trainer', targetId: 23, createdAt: '2026-04-26' },
  { id: 5, targetType: 'trainer', targetId: 24, createdAt: '2026-04-24' },
  { id: 6, targetType: 'trainer', targetId: 1, createdAt: '2026-04-22' },
  { id: 7, targetType: 'product', targetId: 4, createdAt: '2026-04-25' },
  { id: 8, targetType: 'product', targetId: 12, createdAt: '2026-04-23' },
];

// ─────────────────────────────────────────────────────────────
// 배너 슬라이드 mock
// ─────────────────────────────────────────────────────────────

export interface MarketBanner {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  bgColor: string;
  link: string;
}

export const MOCK_BANNERS: MarketBanner[] = [
  { id: 1, title: 'BODY SWITCH ON 하세요!', subtitle: '강남구 1등 헬스장 추천', imageUrl: img('banner-1', 1200, 480), bgColor: 'bg-primary-light', link: '/centers' },
  { id: 2, title: '4월 신규 가입 50% 할인', subtitle: '체험권부터 시작해보세요', imageUrl: img('banner-2', 1200, 480), bgColor: 'bg-accent-light', link: '/centers/search' },
  { id: 3, title: '리뷰 좋은 강사 BEST 10', subtitle: '평점 4.9 이상 강사 모음', imageUrl: img('banner-3', 1200, 480), bgColor: 'bg-state-warning/10', link: '/trainers' },
];

// ─────────────────────────────────────────────────────────────
// 헬퍼
// ─────────────────────────────────────────────────────────────

export function getCenterById(id: number) {
  return MOCK_CENTERS.find((c) => c.id === id);
}

export function getTrainerById(id: number) {
  return MOCK_TRAINERS.find((t) => t.id === id);
}

export function getProductsByCenter(centerId: number) {
  return MOCK_PRODUCTS.filter((p) => p.centerId === centerId);
}

export function getReviewsByCenter(centerId: number) {
  return MOCK_REVIEWS.filter((r) => r.centerId === centerId);
}

export function getTrainersByCenter(centerId: number) {
  return MOCK_TRAINERS.filter((t) => t.centerId === centerId);
}

export function getConversationById(id: number) {
  return MOCK_CONVERSATIONS.find((c) => c.id === id);
}

export function getMessagesByConversation(id: number) {
  return MOCK_MESSAGES[id] || [];
}

export function getCenterRatingDistribution(centerId: number): { star: number; count: number }[] {
  const reviews = getReviewsByCenter(centerId);
  return [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));
}

/** 거리/리뷰/가격으로 센터 정렬 */
export function sortCenters(centers: MarketCenter[], sort: SortOption): MarketCenter[] {
  const arr = [...centers];
  switch (sort) {
    case '거리순':
      return arr.sort((a, b) => a.distanceKm - b.distanceKm);
    case '리뷰순':
      return arr.sort((a, b) => b.reviewCount - a.reviewCount);
    case '가격 낮은 순':
      return arr.sort((a, b) => a.representativeProduct.price - b.representativeProduct.price);
    case '체험권':
      return arr.sort(
        (a, b) =>
          Number(MOCK_PRODUCTS.some((p) => p.centerId === b.id && p.productCategory === '체험권')) -
          Number(MOCK_PRODUCTS.some((p) => p.centerId === a.id && p.productCategory === '체험권'))
      );
    case '최신순':
    default:
      return arr.sort((a, b) => Number(b.isNew || 0) - Number(a.isNew || 0));
  }
}

/** 카테고리 필터 (지점이 해당 카테고리를 운영 중이면 매칭) */
export function filterCentersByCategory(centers: MarketCenter[], category: CategoryId): MarketCenter[] {
  if (category === 'all') return centers;
  return centers.filter((c) => c.category === category || c.subCategories.includes(category));
}
