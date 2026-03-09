// ============================================================
// Gemini API Layer
// SDK 초기화, 프롬프트, DTO, 변환 함수, 공개 API 모두 포함
// 외부에는 Domain 타입(Trip, TripAction)만 반환
// ============================================================

import { GoogleGenAI } from '@google/genai';
import type { Trip, TripAction, TripActionType, ChatMessage } from '@/types/trip';

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
const CREATE_TRIP_PROMPT = `당신은 전문 여행 플래너 AI입니다.
사용자의 요청에 맞는 상세한 여행 계획을 JSON 형식으로 생성합니다.

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

## 중요
- 실존하는 장소/식당만 추천
- 영업시간, 휴무일 반영
- 이동 시간은 대중교통 기준
- tips 배열 마지막에 "AI가 생성한 정보입니다. 실제와 다를 수 있습니다." 포함

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
      "weather": [{"date": "YYYY-MM-DD", "dayOfWeek": "월|화|수|목|금|토|일", "icon": "emoji", "tempHigh": "number", "tempLow": "number", "tempAvg": "number"}],
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
      "icocaGuide": ["string"],
      "tips": ["string"]
    },
    "budget": {
      "items": [{"icon": "emoji", "label": "string", "detail": "string", "amount": "string", "percentage": "number", "color": "hex string"}],
      "total": {"min": "string", "max": "string", "minKRW": "string", "maxKRW": "string"},
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

const EDIT_TRIP_PROMPT = `당신은 여행 플래너 AI입니다.
사용자의 수정 요청을 분석하여 기존 여행 계획을 업데이트합니다.

## 현재 여행 데이터
{TRIP_JSON}

## 수정 규칙
1. 변경 최소화: 요청된 부분만 수정
2. 일관성 유지: 시간 변경 시 이후 일정도 조정, 맛집 변경 시 restaurants도 동기화
3. action 타입:
   - "update_item": 단일 타임라인 항목 수정
   - "update_day": 하루 전체 변경
   - "add_item": 항목 추가
   - "remove_item": 항목 삭제
   - "update_restaurant": 맛집 목록 변경
   - "update_budget": 예산 변경
   - "update_overview": 개요 변경
   - "update_transport": 교통 변경
   - "replace_trip": 대규모 변경

## 응답 형식
{
  "message": "변경 내용 설명",
  "action": "update_item",
  "dayNumber": 1,
  "itemIndex": 5,
  "data": { ... 해당 부분 데이터 }
}`;

const CHAT_SYSTEM_PROMPT =
  '당신은 친절한 여행 플래너 AI입니다. 사용자와 자연스럽게 대화하며 여행 계획을 도와주세요. 목적지, 기간, 인원, 예산, 취향 등을 자연스럽게 물어보세요. 충분한 정보가 모이면 "여행 계획을 만들어볼까요?"라고 제안하세요. 한국어로 대화합니다.';

// -- DTO 타입 (이 파일 안에서만 사용) ----------------------------
interface GeminiCreateResponseDTO {
  message: string;
  trip: Record<string, unknown>;
}

interface GeminiEditResponseDTO {
  message: string;
  action: string;
  dayNumber?: number;
  itemIndex?: number;
  data?: unknown;
}

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
    icocaGuide: Array.isArray(t.icocaGuide) ? t.icocaGuide as string[] : [],
    tips: Array.isArray(t.tips) ? t.tips as string[] : [],
  };
}

function normalizeBudget(raw: unknown): Trip['budget'] {
  const b = (raw ?? {}) as Record<string, unknown>;
  const total = (typeof b.total === 'object' && b.total !== null ? b.total : {}) as Record<string, unknown>;
  return {
    items: Array.isArray(b.items) ? b.items as Trip['budget']['items'] : [],
    total: {
      min: typeof total.min === 'string' ? total.min : '',
      max: typeof total.max === 'string' ? total.max : '',
      minKRW: typeof total.minKRW === 'string' ? total.minKRW : '',
      maxKRW: typeof total.maxKRW === 'string' ? total.maxKRW : '',
    },
    tips: Array.isArray(b.tips) ? b.tips as string[] : [],
  };
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

function toTripAction(dto: GeminiEditResponseDTO): TripAction {
  return {
    action: dto.action as TripActionType,
    message: dto.message ?? '',
    dayNumber: dto.dayNumber,
    itemIndex: dto.itemIndex,
    data: dto.data,
  };
}

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

export interface EditTripResult {
  message: string;
  action: TripAction;
}

export const geminiApi = {
  // 여행 계획 생성
  createTrip: async (messages: ChatMessage[]): Promise<CreateTripResult> => {
    const model = getModel();
    const contents = toGeminiContents(messages);

    const response = await getAI().models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: CREATE_TRIP_PROMPT,
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

  // 기존 여행 수정
  editTrip: async (messages: ChatMessage[], currentTrip: Trip): Promise<EditTripResult> => {
    const model = getModel();
    const systemPrompt = EDIT_TRIP_PROMPT.replace('{TRIP_JSON}', JSON.stringify(currentTrip));
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
    const parsed: GeminiEditResponseDTO = JSON.parse(text);

    return {
      message: parsed.message ?? '수정을 완료했습니다.',
      action: toTripAction(parsed),
    };
  },

  // 간단한 대화 (여행 생성 전 질문/응답)
  chat: async (messages: ChatMessage[]): Promise<string> => {
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
