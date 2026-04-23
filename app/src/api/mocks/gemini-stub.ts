// ============================================================
// Gemini API 스텁 응답
// NEXT_PUBLIC_MOCK_LLM=1 또는 MOCK_LLM=1 설정 시 실제 Google API 대신 사용.
// 캡처(vibe-videos) 파이프라인이 네트워크/API 키 없이 UI를 재현할 수 있도록 고정 데이터 제공.
// ============================================================

import type { Trip } from '@/types/trip';
import type { CreateTripResult, EditTripResult } from '@/api/gemini';

/**
 * chat 모드 스텁
 * 자유 대화에서 AI가 되돌려주는 짧은 한국어 응답.
 */
export function stubChat(): string {
  return '오사카 여행 좋은 선택이에요. 언제 가실 계획이세요?';
}

/**
 * createTrip 모드 스텁
 * 오사카 3박 4일 고정 Trip — 4탭 뷰어가 모든 섹션을 렌더할 수 있도록
 * 최소한의 필드(days ≥ 2, restaurants/transport/budget/packing/preTodos ≥ 1)를 채워둔다.
 */
export function stubCreateTrip(): CreateTripResult {
  const now = new Date().toISOString();

  const trip: Trip = {
    id: `trip-${Date.now()}`,
    title: '🇯🇵 오사카 3박 4일',
    destination: '오사카',
    startDate: '2026-05-10',
    endDate: '2026-05-13',
    travelers: 2,
    tags: ['맛집', '쇼핑', '도시여행'],
    overview: {
      flights: [
        {
          direction: 'outbound',
          departure: 'ICN',
          arrival: 'KIX',
          departureTime: '09:30',
          arrivalTime: '11:15',
          date: '2026-05-10',
          duration: '1h 45m',
        },
        {
          direction: 'inbound',
          departure: 'KIX',
          arrival: 'ICN',
          departureTime: '19:40',
          arrivalTime: '21:30',
          date: '2026-05-13',
          duration: '1h 50m',
        },
      ],
      accommodation: {
        name: '난바 센트럴 호텔',
        address: '오사카시 주오구 난바 2-1-1',
        area: '난바',
        nearbyStations: ['난바역', '닛폰바시역'],
      },
      weather: [],
      tips: [
        '5월 오사카는 낮 최고 24도 내외로 가벼운 겉옷이 유용합니다.',
        '간사이 스루패스로 난바~교토 이동을 묶으면 교통비가 절약됩니다.',
        'AI가 생성한 정보입니다. 실제와 다를 수 있습니다.',
      ],
    },
    days: [
      {
        dayNumber: 1,
        date: '2026-05-10',
        title: '도착 & 도톤보리 야경',
        subtitle: '난바 호텔 체크인 후 미식 탐방',
        color: '#f97316',
        items: [
          {
            time: '11:15',
            title: '간사이공항 도착',
            description: '난카이 라피트로 난바 이동',
            type: 'move',
            badge: 'Flight 1h 45m',
          },
          {
            time: '13:00',
            title: '난바 센트럴 호텔 체크인',
            description: '짐 보관 후 도보로 도톤보리 이동',
            type: 'default',
          },
          {
            time: '19:00',
            title: '도톤보리 & 글리코 사인',
            description: '오사카 대표 야경 포토존',
            type: 'spot',
            badge: 'Night',
          },
        ],
        mapSpots: [
          {
            lat: 34.6687,
            lng: 135.5016,
            name: '난바 센트럴 호텔',
            time: '13:00',
            icon: '🏨',
          },
          {
            lat: 34.6686,
            lng: 135.5023,
            name: '도톤보리',
            time: '19:00',
            icon: '🏛️',
          },
        ],
      },
      {
        dayNumber: 2,
        date: '2026-05-11',
        title: '오사카성 & 우메다 스카이',
        subtitle: '역사와 전망을 하루에',
        color: '#6366f1',
        items: [
          {
            time: '09:30',
            title: '오사카성 공원 산책',
            description: '봄 벚꽃이 남아 있는 구간 추천',
            type: 'spot',
          },
          {
            time: '12:30',
            title: '요시노야 본점',
            description: '규동 점심 (1인 600엔대)',
            type: 'food',
            cost: 650,
            currency: 'JPY',
            badge: 'Lunch',
          },
          {
            time: '17:00',
            title: '우메다 스카이 빌딩',
            description: '전망대에서 일몰 감상',
            type: 'spot',
            badge: 'Sunset',
          },
        ],
        mapSpots: [
          {
            lat: 34.6873,
            lng: 135.5259,
            name: '오사카성',
            time: '09:30',
            icon: '🏯',
          },
          {
            lat: 34.7054,
            lng: 135.4904,
            name: '우메다 스카이 빌딩',
            time: '17:00',
            icon: '🗼',
          },
        ],
      },
      {
        dayNumber: 3,
        date: '2026-05-12',
        title: '교토 당일치기',
        subtitle: '기요미즈데라 & 기온 거리',
        color: '#10b981',
        items: [
          {
            time: '08:00',
            title: 'JR 교토선 이동',
            description: '오사카역 → 교토역 약 30분',
            type: 'move',
            cost: 570,
            currency: 'JPY',
            badge: 'Train 30m',
          },
          {
            time: '10:00',
            title: '기요미즈데라',
            description: '세계문화유산 사찰',
            type: 'spot',
          },
          {
            time: '15:00',
            title: '기온 거리 산책',
            description: '전통 찻집에서 말차 휴식',
            type: 'food',
            badge: 'Cafe',
          },
        ],
        mapSpots: [
          {
            lat: 34.9949,
            lng: 135.785,
            name: '기요미즈데라',
            time: '10:00',
            icon: '⛩️',
          },
          {
            lat: 35.0037,
            lng: 135.7788,
            name: '기온 거리',
            time: '15:00',
            icon: '🍽️',
          },
        ],
      },
      {
        dayNumber: 4,
        date: '2026-05-13',
        title: '신사이바시 쇼핑 & 귀국',
        subtitle: '마지막까지 알차게',
        color: '#a78bfa',
        items: [
          {
            time: '10:00',
            title: '신사이바시 스지',
            description: '기념품 & 드럭스토어 쇼핑',
            type: 'spot',
            badge: 'Shopping',
          },
          {
            time: '14:30',
            title: '난바역 → 간사이공항',
            description: '난카이 라피트 이용',
            type: 'move',
            badge: 'Train 40m',
          },
          {
            time: '19:40',
            title: 'KIX 출발',
            description: '인천행',
            type: 'move',
            badge: 'Flight 1h 50m',
          },
        ],
        mapSpots: [
          {
            lat: 34.6723,
            lng: 135.5012,
            name: '신사이바시 스지',
            time: '10:00',
            icon: '🛍️',
          },
        ],
      },
    ],
    restaurants: [
      {
        dayNumber: 1,
        category: '라멘',
        name: '이치란 도톤보리',
        rating: 4.3,
        reviewCount: '8,200+',
        description: '독서실 스타일 1인석 돈코츠 라멘',
        priceRange: '¥1,200',
      },
      {
        dayNumber: 2,
        category: '규동',
        name: '요시노야 본점',
        rating: 4.1,
        description: '일본식 덮밥 체인의 본점',
        priceRange: '¥650',
      },
      {
        dayNumber: 3,
        category: '카페',
        name: '츠지리 기온점',
        rating: 4.4,
        description: '교토 스타일 말차 파르페',
        priceRange: '¥1,500',
      },
    ],
    transport: {
      homeToHotel: [
        { icon: '✈️', title: 'ICN → KIX', subtitle: '09:30 출발 · 1시간 45분' },
        { icon: '🚆', title: '간사이공항 → 난바', subtitle: '난카이 라피트 약 40분' },
        { icon: '🏨', title: '난바 센트럴 호텔', subtitle: '난바역 도보 3분' },
      ],
      intercityRoutes: [
        {
          from: '오사카',
          to: '교토',
          method: 'JR 교토선',
          duration: '30분',
          cost: '¥570',
        },
      ],
      passes: [
        {
          name: '간사이 스루패스 2일권',
          price: '¥4,800',
          recommendation: 'recommended',
          reason: '난바~교토 왕복 + 시내 지하철 무제한 탑승',
        },
      ],
      passVerdict: '교토 당일치기 일정이라면 스루패스가 이득입니다.',
      tips: ['IC카드(ICOCA)는 편의점 결제에도 사용 가능합니다.'],
    },
    budget: {
      currency: 'JPY',
      exchangeRate: 10,
      items: [
        {
          icon: '🚆',
          label: '교통',
          detail: '스루패스 + 공항철도',
          amount: 7000,
          currency: 'JPY',
          percentage: 25,
          color: '#3b82f6',
        },
        {
          icon: '🍽️',
          label: '식비',
          detail: '하루 3식 기준',
          amount: 12000,
          currency: 'JPY',
          percentage: 40,
          color: '#f472b6',
        },
        {
          icon: '🎫',
          label: '입장료',
          detail: '오사카성, 기요미즈데라 등',
          amount: 3000,
          currency: 'JPY',
          percentage: 10,
          color: '#a78bfa',
        },
        {
          icon: '🛍️',
          label: '쇼핑',
          detail: '신사이바시 기념품',
          amount: 6000,
          currency: 'JPY',
          percentage: 20,
          color: '#f97316',
        },
        {
          icon: '💰',
          label: '예비비',
          detail: '돌발 지출 대비',
          amount: 2000,
          currency: 'JPY',
          percentage: 5,
          color: '#64748b',
        },
      ],
      total: {
        amount: 30000,
        currency: 'JPY',
        amountKRW: 300000,
      },
      tips: ['현금은 10,000엔 정도만 환전하고 나머지는 트래블월렛 카드로 결제하세요.'],
    },
    packing: [
      {
        category: '의류',
        categoryIcon: '👕',
        items: [
          { name: '가벼운 겉옷', note: '저녁 쌀쌀함 대비', checked: false },
          { name: '편한 운동화', checked: false },
        ],
      },
      {
        category: '전자기기',
        categoryIcon: '📱',
        items: [
          { name: '110V 변환 플러그', checked: false },
          { name: '보조배터리', checked: false },
        ],
      },
    ],
    preTodos: [
      {
        order: 1,
        title: '간사이 스루패스 구매',
        description: '국내 여행사에서 미리 구매하면 줄 설 필요 없음',
      },
      {
        order: 2,
        title: '여권 만료일 확인',
        description: '입국일 기준 6개월 이상 여유 필요',
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  return {
    message: '오사카 3박 4일 초안을 준비했어요. 원하시는 부분은 말씀해주세요!',
    trip,
  };
}

/**
 * editTrip 모드 스텁
 * 실제 편집 대신 첫 번째 Day 제목에 접두사만 붙여 "수정이 적용됐다"는 UX를 보여준다.
 * trip의 id/createdAt은 호출부에서 유지하지만, 스텁은 기존 데이터를 그대로 돌려보내므로 안전하다.
 */
export function stubEditTrip(currentTrip: Trip): EditTripResult {
  const updatedDays: Trip['days'] = currentTrip.days.map((day, index) =>
    index === 0
      ? { ...day, title: `편집 적용됨 — ${day.title}` }
      : day,
  );

  const updatedTrip: Trip = {
    ...currentTrip,
    days: updatedDays,
    updatedAt: new Date().toISOString(),
  };

  return {
    message: '수정을 완료했습니다. Day 1 제목을 업데이트했어요.',
    trip: updatedTrip,
  };
}
