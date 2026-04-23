// ============================================================
// Gemini API Layer
// SDK 초기화, 프롬프트, DTO, 변환 함수, 공개 API 모두 포함
// 외부에는 Domain 타입(Trip, TripAction)만 반환
// ============================================================

import { GoogleGenAI } from '@google/genai';
import type { Trip, ChatMessage } from '@/types/trip';
import { migrateBudget as migrateBudgetData } from '@/domain/budget';
import { isMockLlmEnabled } from '@/lib/capture-flags';
import {
  stubChat,
  stubCreateTrip,
  stubEditTrip,
} from '@/api/mocks/gemini-stub';

// -- SDK 초기화 (lazy) --------------------------------------------
// Vercel 빌드 시 환경변수 없이도 모듈 로드가 가능하도록 지연 초기화
let _ai: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!_ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
    }
    _ai = new GoogleGenAI({ apiKey });
  }
  return _ai;
}

// -- Rate Limit 관리 (in-memory, 단일 유저 프로토타입용) ----------
const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-2.0-flash-lite';
let minuteRequestCount = 0;
let minuteResetTime = Date.now();

function getModel(): string {
  const now = Date.now();
  if (now - minuteResetTime > 60000) {
    minuteRequestCount = 0;
    minuteResetTime = now;
  }
  minuteRequestCount++;
  // 분당 8회 초과 시 경량 모델로 전환
  return minuteRequestCount > 8 ? FALLBACK_MODEL : PRIMARY_MODEL;
}

// -- 시스템 프롬프트 ---------------------------------------------
function getCreateTripPrompt(): string {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return `당신은 전문 여행 플래너 AI입니다.
사용자의 요청에 맞는 상세한 여행 계획을 JSON 형식으로 생성합니다.

## 오늘 날짜
${todayStr}
- 사용자가 날짜를 명시하지 않으면 가까운 미래 날짜로 설정하세요.
- "다음 주", "이번 달" 등 상대적 표현은 오늘 날짜 기준으로 계산하세요.
- startDate는 반드시 오늘 이후여야 합니다.

## 역할
- 현지 맛집, 관광지, 교통편을 실제 정보 기반으로 추천
- 동선 최적화 (같은 지역 묶기, 이동 최소화)
- 시간대별 현실적인 일정 (이동 시간, 대기 시간 포함)
- 예산을 고려한 가성비 추천

## 출력 규칙

### 일정 (days)
1. 각 Day의 items는 시간순으로 정렬
2. type 분류: "spot"(관광지), "food"(식사/카페), "move"(교통 이동), "default"(기타)
3. 이동(move) 항목에는 소요시간과 요금 표시
4. 식사(food) 항목에는 가격대 표시
5. badge: "Lunch", "Dinner", "Snack", "Cafe", "Flight 2h" 등

### 지도 (mapSpots)
1. 주요 장소만 포함 (이동 경유지 제외)
2. 정확한 위도/경도 (소수점 4자리)
3. icon은 장소 특성에 맞는 이모지

### 맛집 (restaurants)
1. Google 평점 4.0 이상 기준
2. 혼밥 가능 여부 고려 (travelers=1이면 카운터석)
3. 가격대는 1인 기준

### 교통 (transport)
1. homeToHotel: 출발지->숙소 단계별 안내
2. intercityRoutes: 도시 간 이동 요금/시간

### 예산 (budget)
1. 숙소/항공 제외 현지 경비만
2. percentage 합계 100
3. color: 교통="#3b82f6", 식비="#f472b6", 입장료="#a78bfa", 간식="#22d3ee", 쇼핑="#f97316", 예비="#64748b"

### Day 색상 (순환)
Day 1: "#f97316", Day 2: "#6366f1", Day 3: "#10b981", Day 4: "#a78bfa", Day 5: "#f472b6"

## 이모지 사용 규칙 (반드시 아래 목록에서만 선택)

### 교통 (transport.homeToHotel.icon)
✈️ 비행기, 🚆 기차/KTX, 🚌 버스, 🚗 자동차/택시, 🚇 지하철, 🚊 트램, 🚶 도보, 🚢 배, 🛫 출발, 🛬 도착, 🏨 호텔, 🏠 집

### 지도 (mapSpots.icon)
🏛️ 관광지/명소, ⛩️ 사찰/신사, 🏯 성/궁전, 🗼 타워, 🍽️ 식당, ☕ 카페, 🛍️ 쇼핑, 🎭 공연/문화, 🎢 놀이공원, 🏨 숙소

### 예산 (budget.items.icon)
🚆 교통, 🍽️ 식비, 🎫 입장료, ☕ 간식/카페, 🛍️ 쇼핑, 💰 예비비

### 준비물 (packing.categoryIcon)
🧳 가방/짐, 👕 의류, 📱 전자기기, 💊 의약품, 📄 서류, 🔌 충전기, 📷 카메라, 👟 신발

⚠️ 위 목록에 없는 이모지는 사용하지 마세요!

## 중요
- 실존하는 장소/식당만 추천
- 영업시간, 휴무일 반영
- 이동 시간은 대중교통 기준
- tips 배열 마지막에 "AI가 생성한 정보입니다. 실제와 다를 수 있습니다." 포함
- **날씨(weather)는 실시간 API에서 제공하므로 생성하지 마세요. overview.weather는 빈 배열 []로 반환하세요.**

## 응답 JSON 스키마 (반드시 이 구조를 따르세요)
추가 텍스트 없이 JSON만 반환합니다.

{
  "message": "string - 사용자에게 보여줄 설명",
  "trip": {
    "title": "string - 여행 제목 (예: '🇯🇵 도쿄 3박 4일')",
    "destination": "string - 도시명 (예: '도쿄')",
    "startDate": "string - ISO 날짜 (예: '2026-04-01')",
    "endDate": "string - ISO 날짜",
    "travelers": "number - 여행자 수",
    "tags": ["string array - 태그들"],
    "overview": {
      "flights": [{"direction": "outbound|inbound", "departure": "string", "arrival": "string", "departureTime": "HH:MM", "arrivalTime": "HH:MM", "date": "YYYY-MM-DD", "duration": "Xh Ym"}],
      "accommodation": {"name": "string", "address": "string", "area": "string", "nearbyStations": ["string"]},
      "weather": [],
      "tips": ["string array"]
    },
    "days": [
      {
        "dayNumber": "number (1부터 시작, 필수!)",
        "date": "YYYY-MM-DD",
        "title": "string - 하루 요약 제목",
        "subtitle": "string - 부제",
        "color": "string - hex color (Day1:#f97316, Day2:#6366f1, Day3:#10b981, Day4:#a78bfa, Day5:#f472b6)",
        "items": [
          {"time": "HH:MM", "title": "string", "description": "string", "type": "spot|food|move|default", "cost": "number (optional)", "currency": "JPY|KRW (optional)", "badge": "string (optional)"}
        ],
        "mapSpots": [
          {"lat": "number", "lng": "number", "name": "string", "time": "HH:MM", "icon": "emoji"}
        ]
      }
    ],
    "restaurants": [
      {"dayNumber": "number", "category": "string", "name": "string", "rating": "number", "reviewCount": "string (optional)", "description": "string", "priceRange": "string"}
    ],
    "transport": {
      "homeToHotel": [{"icon": "emoji", "title": "string", "subtitle": "string"}],
      "intercityRoutes": [{"from": "string", "to": "string", "method": "string", "duration": "string", "cost": "string"}],
      "passes": [{"name": "string", "price": "string", "recommendation": "recommended|neutral|not-recommended", "reason": "string"}],
      "passVerdict": "string",
      "tips": ["string"]
    },
    "budget": {
      "currency": "string - 기본 통화 코드 (JPY, KRW, USD 등)",
      "exchangeRate": "number - 1 외화 = ? KRW (예: JPY면 10, THB면 40). KRW일 때는 생략",
      "items": [{"icon": "emoji", "label": "string", "detail": "string", "amount": "number - 숫자만 (통화 기호 없이)", "percentage": "number", "color": "hex string"}],
      "tips": ["string"]
    },
    "packing": [
      {"category": "string", "categoryIcon": "emoji", "items": [{"name": "string", "note": "string (optional)", "checked": false}]}
    ],
    "preTodos": [
      {"order": "number", "title": "string", "description": "string"}
    ]
  }
}

⚠️ 중요: days 배열의 각 항목에 dayNumber(1,2,3...), color(hex), mapSpots(위경도 배열)는 반드시 포함해야 합니다.`;
}

// edit 모드: 수정 요청을 반영한 전체 Trip JSON을 반환 (replace_trip 방식)
// create와 동일한 응답 스키마를 사용하여 복잡한 부분 merge 로직을 회피
function getEditTripPrompt(tripJson: string): string {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return `당신은 전문 여행 플래너 AI입니다.
사용자의 수정 요청을 반영하여 기존 여행 계획을 업데이트합니다.

## 오늘 날짜
${todayStr}

## 현재 여행 데이터
${tripJson}

## 수정 규칙
1. **변경 요청된 부분만 수정**하고, 나머지는 기존과 100% 동일하게 유지
2. 시간 변경 시 이후 일정도 자연스럽게 조정
3. 맛집 변경 시 restaurants 배열도 동기화
4. 일정 추가/삭제 시 mapSpots도 동기화
5. 구조, 포맷, 필드명은 기존 데이터와 동일하게 유지

## 이모지 사용 규칙 (반드시 아래 목록에서만 선택)
- 교통: ✈️ 🚆 🚌 🚗 🚇 🚊 🚶 🚢 🛫 🛬 🏨 🏠
- 지도: 🏛️ ⛩️ 🏯 🗼 🍽️ ☕ 🛍️ 🎭 🎢 🏨
- 예산: 🚆 🍽️ 🎫 ☕ 🛍️ 💰
- 준비물: 🧳 👕 📱 💊 📄 🔌 📷 👟
⚠️ 위 목록에 없는 이모지는 절대 사용하지 마세요!

## 중요
- 수정하지 않은 부분은 **절대** 임의로 변경하지 마세요
- 이모지도 위 허용 목록에서만 사용하세요
- 전체 Trip JSON을 create와 동일한 형식으로 반환합니다
- 추가 텍스트 없이 JSON만 반환합니다
- **weather 배열은 수정하지 말고 그대로 유지하세요 (실시간 API에서 별도 제공)**

## 응답 JSON 스키마 (create와 동일)
{
  "message": "string - 수정 내용 설명 (어떤 부분이 변경되었는지)",
  "trip": { ... 수정이 반영된 전체 Trip 객체 (기존과 동일한 구조) }
}`;
}

const CHAT_SYSTEM_PROMPT =
  '당신은 친절한 여행 플래너 AI입니다. 사용자와 자연스럽게 대화하며 여행 계획을 도와주세요. 목적지, 기간, 인원, 예산, 취향 등을 자연스럽게 물어보세요. 충분한 정보가 모이면 "여행 계획을 만들어볼까요?"라고 제안하세요. 한국어로 대화합니다.';

// -- DTO 타입 (이 파일 안에서만 사용) ----------------------------
interface GeminiCreateResponseDTO {
  message: string;
  trip: Record<string, unknown>;
}

// edit 응답도 create와 동일한 DTO 사용 (replace_trip 방식)

// -- Day 색상 순환 팔레트 ------------------------------------------
const DAY_COLORS = ['#f97316', '#6366f1', '#10b981', '#a78bfa', '#f472b6'];

// -- days 배열 정규화 (dayNumber, color 누락 보정) ------------------
function normalizeDays(rawDays: unknown[]): Trip['days'] {
  return rawDays.map((raw, index) => {
    const day = raw as Record<string, unknown>;
    return {
      dayNumber: (typeof day.dayNumber === 'number' ? day.dayNumber : index + 1),
      date: (typeof day.date === 'string' ? day.date : ''),
      title: (typeof day.title === 'string' ? day.title : `Day ${index + 1}`),
      subtitle: (typeof day.subtitle === 'string' ? day.subtitle : ''),
      color: (typeof day.color === 'string' ? day.color : DAY_COLORS[index % DAY_COLORS.length]),
      items: Array.isArray(day.items) ? (day.items as Trip['days'][0]['items']) : [],
      mapSpots: Array.isArray(day.mapSpots) ? (day.mapSpots as Trip['days'][0]['mapSpots']) : [],
    };
  });
}

// -- restaurants 배열 정규화 (dayNumber 누락 보정) ------------------
function normalizeRestaurants(rawRestaurants: unknown[]): Trip['restaurants'] {
  return rawRestaurants.map((raw) => {
    const r = raw as Record<string, unknown>;
    return {
      dayNumber: (typeof r.dayNumber === 'number' ? r.dayNumber : 1),
      category: (typeof r.category === 'string' ? r.category : ''),
      name: (typeof r.name === 'string' ? r.name : ''),
      rating: (typeof r.rating === 'number' ? r.rating : 0),
      reviewCount: (typeof r.reviewCount === 'string' ? r.reviewCount : undefined),
      description: (typeof r.description === 'string' ? r.description : ''),
      priceRange: (typeof r.priceRange === 'string' ? r.priceRange : ''),
    };
  });
}

// -- 중첩 객체 정규화 함수 (객체는 있지만 하위 필드 누락 대응) ------
function normalizeOverview(raw: unknown): Trip['overview'] {
  const o = (raw ?? {}) as Record<string, unknown>;
  return {
    flights: Array.isArray(o.flights) ? o.flights as Trip['overview']['flights'] : [],
    accommodation: {
      name: '',
      address: '',
      area: '',
      nearbyStations: [],
      ...(typeof o.accommodation === 'object' && o.accommodation !== null
        ? o.accommodation as Record<string, unknown>
        : {}),
    } as Trip['overview']['accommodation'],
    weather: Array.isArray(o.weather) ? o.weather as Trip['overview']['weather'] : [],
    tips: Array.isArray(o.tips) ? o.tips as string[] : [],
  };
}

function normalizeTransport(raw: unknown): Trip['transport'] {
  const t = (raw ?? {}) as Record<string, unknown>;
  return {
    homeToHotel: Array.isArray(t.homeToHotel) ? t.homeToHotel as Trip['transport']['homeToHotel'] : [],
    intercityRoutes: Array.isArray(t.intercityRoutes) ? t.intercityRoutes as Trip['transport']['intercityRoutes'] : [],
    passes: Array.isArray(t.passes) ? t.passes as Trip['transport']['passes'] : [],
    passVerdict: typeof t.passVerdict === 'string' ? t.passVerdict : '',
    tips: Array.isArray(t.tips) ? t.tips as string[] : [],
  };
}

function normalizeBudget(raw: unknown): Trip['budget'] {
  return migrateBudgetData((raw ?? {}) as Record<string, unknown>);
}

// -- 변환 함수 ---------------------------------------------------
function toTrip(dto: Record<string, unknown>, id?: string): Trip {
  const now = new Date().toISOString();
  return {
    id: id ?? `trip-${Date.now()}`,
    title: (dto.title ?? '새 여행') as string,
    destination: (dto.destination ?? '') as string,
    startDate: (dto.startDate ?? '') as string,
    endDate: (dto.endDate ?? '') as string,
    travelers: (dto.travelers ?? 1) as number,
    tags: (dto.tags ?? []) as string[],
    overview: normalizeOverview(dto.overview),
    days: Array.isArray(dto.days) ? normalizeDays(dto.days) : [],
    restaurants: Array.isArray(dto.restaurants) ? normalizeRestaurants(dto.restaurants) : [],
    transport: normalizeTransport(dto.transport),
    budget: normalizeBudget(dto.budget),
    packing: Array.isArray(dto.packing) ? dto.packing as Trip['packing'] : [],
    preTodos: Array.isArray(dto.preTodos) ? dto.preTodos as Trip['preTodos'] : [],
    createdAt: now,
    updatedAt: now,
  };
}

// toTripAction은 replace_trip 방식 전환으로 더 이상 사용하지 않음
// TripAction 타입은 향후 부분 업데이트 최적화 시 재활용 가능하므로 유지

// -- ChatMessage -> Gemini Contents 변환 -------------------------
function toGeminiContents(messages: ChatMessage[]) {
  return messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'user' ? ('user' as const) : ('model' as const),
      parts: [{ text: m.content }],
    }));
}

// -- 공개 API ----------------------------------------------------
export interface CreateTripResult {
  message: string;
  trip: Trip;
}

// edit 결과도 create와 동일한 형태 (replace_trip 방식)
export interface EditTripResult {
  message: string;
  trip: Trip;
}

export const geminiApi = {
  // 여행 계획 생성
  createTrip: async (messages: ChatMessage[]): Promise<CreateTripResult> => {
    // 캡처용 모킹 모드: 네트워크 없이 고정 Trip 반환
    if (isMockLlmEnabled()) {
      return stubCreateTrip();
    }

    const model = getModel();
    const contents = toGeminiContents(messages);

    const response = await getAI().models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: getCreateTripPrompt(),
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text ?? '{}';
    const parsed: GeminiCreateResponseDTO = JSON.parse(text);

    return {
      message: parsed.message ?? '여행 계획을 생성했습니다!',
      trip: toTrip(parsed.trip ?? {}),
    };
  },

  // 기존 여행 수정 (replace_trip 방식: 수정된 전체 Trip JSON 반환)
  editTrip: async (messages: ChatMessage[], currentTrip: Trip): Promise<EditTripResult> => {
    // 캡처용 모킹 모드: Day 1 제목에 접두사만 붙여 편집 UX 재현
    if (isMockLlmEnabled()) {
      return stubEditTrip(currentTrip);
    }

    const model = getModel();
    const systemPrompt = getEditTripPrompt(JSON.stringify(currentTrip));
    const contents = toGeminiContents(messages);

    const response = await getAI().models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text ?? '{}';
    const parsed: GeminiCreateResponseDTO = JSON.parse(text);

    return {
      message: parsed.message ?? '수정을 완료했습니다.',
      // 기존 Trip의 ID와 생성일을 유지하여 덮어쓰기 저장 가능
      trip: {
        ...toTrip(parsed.trip ?? {}, currentTrip.id),
        createdAt: currentTrip.createdAt,
      },
    };
  },

  // 간단한 대화 (여행 생성 전 질문/응답)
  chat: async (messages: ChatMessage[]): Promise<string> => {
    // 캡처용 모킹 모드: 고정 한국어 응답 즉시 반환
    if (isMockLlmEnabled()) {
      return stubChat();
    }

    const model = getModel();
    const contents = toGeminiContents(messages);

    const response = await getAI().models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: CHAT_SYSTEM_PROMPT,
        temperature: 0.8,
      },
    });

    return response.text ?? '죄송합니다, 응답을 생성하지 못했습니다.';
  },
};
