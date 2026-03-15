import type {
  Trip, Flight, Accommodation, WeatherDay, Day, TimelineItem,
  Restaurant, TransportSection, TransportPass,
  BudgetSection,
  PackingItem, PreTodoItem,
} from '@/types/trip';

// ============================================================
// XSS 방지 유틸
// ============================================================
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ============================================================
// 날짜 포맷 유틸
// ============================================================
function formatDate(dateStr: string): string {
  return dateStr.replace(/-/g, '.');
}

// ============================================================
// Day 색상 순환 (디자인 시스템)
// ============================================================
const DAY_COLORS = ['#f97316', '#6366f1', '#10b981', '#a78bfa', '#f472b6'];

function getDayColor(dayNumber: number): string {
  return DAY_COLORS[(dayNumber - 1) % DAY_COLORS.length];
}

// ============================================================
// Google Maps 검색 링크 생성
// ============================================================
function mapsLink(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

// ============================================================
// 타임라인 아이템 타입별 색상
// ============================================================
function getTypeColor(type: string): string {
  switch (type) {
    case 'spot': return '#10b981';
    case 'food': return '#ec4899';
    case 'move': return '#3b82f6';
    default: return '#f97316';
  }
}

// ============================================================
// 패스 추천 상태별 스타일
// ============================================================
function getPassStyle(recommendation: TransportPass['recommendation']): { border: string; bg: string; text: string; badgeBg: string; badgeText: string; label: string } {
  switch (recommendation) {
    case 'recommended':
      return { border: '#10b98166', bg: '#10b98118', text: '#10b981', badgeBg: '#10b98133', badgeText: '#10b981', label: '추천' };
    case 'neutral':
      return { border: '#e5e7eb', bg: '#ffffff', text: '#6b7280', badgeBg: '#f3f4f6', badgeText: '#6b7280', label: '보통' };
    case 'not-recommended':
      return { border: '#e5e7eb', bg: '#ffffff', text: '#9ca3af', badgeBg: '#f3f4f6', badgeText: '#9ca3af', label: '비추천' };
  }
}

// ============================================================
// CSS 스타일 블록
// ============================================================
function generateCSS(): string {
  return `
    :root {
      --color-primary: #f97316;
      --color-primary-50: #fff7ed;
      --color-primary-600: #ea580c;
      --color-secondary: #0d9488;
      --color-bg: #ffffff;
      --color-bg-secondary: #f9fafb;
      --color-bg-tertiary: #f3f4f6;
      --color-surface: #ffffff;
      --color-text-primary: #111827;
      --color-text-secondary: #6b7280;
      --color-text-tertiary: #9ca3af;
      --color-border: #e5e7eb;
      --color-border-light: #f3f4f6;
      --color-cat-sightseeing: #10b981;
      --color-cat-food: #ec4899;
      --color-cat-transport: #3b82f6;
      --color-cat-accommodation: #8b5cf6;
      --color-cat-activity: #06b6d4;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Noto Sans KR', system-ui, -apple-system, sans-serif;
      line-height: 1.7;
      color: var(--color-text-primary);
      background: var(--color-bg-secondary);
    }

    .container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 20px;
    }

    @media (min-width: 640px) {
      .container { padding: 0 32px; }
    }

    a { color: var(--color-primary); text-decoration: none; }
    a:hover { text-decoration: underline; }

    /* 히어로 */
    .hero {
      background: linear-gradient(135deg, #f97316, #ea580c);
      color: white;
      padding: 40px 20px 32px;
      margin-bottom: 0;
    }
    @media (min-width: 640px) {
      .hero { padding: 48px 32px 40px; }
    }
    .hero-title {
      font-family: 'Playfair Display', serif;
      font-size: 2.25rem;
      font-weight: 700;
      margin-bottom: 8px;
      line-height: 1.2;
    }
    @media (min-width: 640px) {
      .hero-title { font-size: 3rem; }
    }
    .hero-meta {
      font-size: 0.875rem;
      opacity: 0.9;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
    }
    .hero-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }
    .hero-tag {
      background: rgba(255,255,255,0.2);
      font-size: 0.75rem;
      padding: 4px 12px;
      border-radius: 9999px;
    }

    /* 네비게이션 바 */
    .nav-bar {
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border-light);
      padding: 12px 20px;
      position: sticky;
      top: 0;
      z-index: 40;
      display: flex;
      gap: 4px;
      overflow-x: auto;
    }
    @media (min-width: 640px) {
      .nav-bar { padding: 12px 32px; justify-content: center; gap: 8px; }
    }
    .nav-link {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-secondary);
      padding: 8px 16px;
      border-radius: 9999px;
      white-space: nowrap;
      transition: all 0.2s;
      text-decoration: none;
    }
    .nav-link:hover {
      background: var(--color-bg-tertiary);
      color: var(--color-text-primary);
      text-decoration: none;
    }

    /* 섹션 */
    .section {
      padding: 32px 0;
    }
    .section + .section {
      border-top: 1px solid var(--color-border-light);
    }
    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-subtitle {
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: 12px;
      margin-top: 24px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* 카드 */
    .card {
      background: var(--color-surface);
      border: 1px solid var(--color-border-light);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    }
    .card-sm {
      background: var(--color-surface);
      border: 1px solid var(--color-border-light);
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    }

    /* 그리드 */
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }
    .grid-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    /* 수평 스크롤 */
    .scroll-row {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      padding-bottom: 8px;
      -webkit-overflow-scrolling: touch;
    }
    .scroll-row::-webkit-scrollbar { display: none; }

    /* 뱃지 */
    .badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 500;
      padding: 2px 10px;
      border-radius: 9999px;
    }
    .badge-primary {
      background: #fff7ed;
      color: #f97316;
    }
    .badge-food {
      background: #ec489918;
      color: #ec4899;
    }
    .badge-transport {
      background: #3b82f618;
      color: #3b82f6;
    }
    .badge-sightseeing {
      background: #10b98118;
      color: #10b981;
    }

    /* 항공편 경로 표시 */
    .flight-route {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .flight-point {
      flex: 1;
      text-align: center;
    }
    .flight-point-time {
      font-size: 1.125rem;
      font-weight: 700;
    }
    .flight-point-name {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }
    .flight-line {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
      color: var(--color-text-tertiary);
    }
    .flight-line-bar {
      width: 32px;
      height: 1px;
      background: var(--color-border);
    }

    /* 타임라인 */
    .timeline {
      position: relative;
      padding-left: 26px;
    }
    .timeline::before {
      content: '';
      position: absolute;
      left: 7px;
      top: 4px;
      bottom: 4px;
      width: 2px;
      background: var(--color-border);
      border-radius: 1px;
      opacity: 0.3;
    }
    .tl-item {
      position: relative;
      margin-bottom: 16px;
    }
    .tl-item::before {
      content: '';
      position: absolute;
      left: -21px;
      top: 6px;
      width: 9px;
      height: 9px;
      border-radius: 50%;
      border: 2px solid var(--color-primary);
      background: var(--color-bg);
    }
    .tl-item.food::before {
      border-color: var(--color-cat-food);
      background: var(--color-cat-food);
    }
    .tl-item.move::before {
      border-color: var(--color-cat-transport);
      background: var(--color-cat-transport);
    }
    .tl-item.spot::before {
      border-color: var(--color-cat-sightseeing);
    }

    .tl-time {
      font-size: 0.75rem;
      font-weight: 600;
      margin-bottom: 2px;
    }
    .tl-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }
    .tl-desc {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      margin-top: 2px;
    }
    .tl-badge {
      display: inline-block;
      font-size: 0.66rem;
      padding: 2px 6px;
      border-radius: 9999px;
      font-weight: 600;
      margin-left: 4px;
      vertical-align: middle;
    }

    /* 테이블 */
    .table-wrap {
      background: var(--color-surface);
      border: 1px solid var(--color-border-light);
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }
    th {
      text-align: left;
      padding: 12px 16px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--color-border-light);
    }
    th:last-child { text-align: right; }
    td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--color-border-light);
    }
    tr:last-child td { border-bottom: 0; }
    td:last-child { text-align: right; }

    /* 예산 바 */
    .budget-bar-bg {
      height: 8px;
      background: var(--color-bg-tertiary);
      border-radius: 9999px;
      overflow: hidden;
      margin-top: 4px;
    }
    .budget-bar {
      height: 100%;
      border-radius: 9999px;
      transition: width 0.3s;
    }

    /* 체크리스트 */
    .checklist-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px;
      border-radius: 16px;
      background: var(--color-surface);
      border: 1px solid var(--color-border-light);
      margin-bottom: 8px;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .check-box {
      width: 18px;
      height: 18px;
      border: 2px solid var(--color-border);
      border-radius: 4px;
      flex-shrink: 0;
    }

    /* 사전 할 일 */
    .todo-card {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .todo-number {
      width: 32px;
      height: 32px;
      background: var(--color-primary-50);
      color: var(--color-primary);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    /* Day 카드 헤더 */
    .day-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 16px;
    }
    .day-number {
      font-size: 1.5rem;
      font-weight: 900;
    }
    .day-title {
      font-size: 1rem;
      font-weight: 700;
    }
    .day-subtitle {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      margin-top: 2px;
    }

    /* 별점 */
    .stars { color: #f59e0b; }

    /* 팁 아코디언 (details/summary) */
    details {
      background: var(--color-surface);
      border: 1px solid var(--color-border-light);
      border-radius: 16px;
      margin-bottom: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    summary {
      padding: 16px 20px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      list-style: none;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    summary::-webkit-details-marker { display: none; }
    summary::after {
      content: '\\25B6';
      font-size: 0.6rem;
      color: var(--color-text-tertiary);
      margin-left: auto;
      transition: transform 0.2s;
    }
    details[open] summary::after {
      transform: rotate(90deg);
    }
    details .details-content {
      padding: 0 20px 16px;
    }
    details .details-content li {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      margin-bottom: 8px;
      padding-left: 16px;
      position: relative;
    }
    details .details-content li::before {
      content: '\\2022';
      position: absolute;
      left: 0;
      color: var(--color-primary);
    }

    /* 푸터 */
    .footer {
      text-align: center;
      padding: 32px 20px;
      color: var(--color-text-tertiary);
      font-size: 0.75rem;
      border-top: 1px solid var(--color-border-light);
      margin-top: 16px;
    }
    .footer a {
      color: var(--color-primary);
      font-weight: 500;
    }

    /* 교통 경로 스텝 */
    .route-step {
      background: var(--color-surface);
      border: 1px solid var(--color-border-light);
      border-radius: 16px;
      padding: 12px 16px;
      text-align: center;
      min-width: 100px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      flex-shrink: 0;
    }
    .route-arrow {
      color: var(--color-cat-transport);
      font-size: 1.125rem;
      flex-shrink: 0;
    }

    /* Google Maps 링크 */
    .maps-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.75rem;
      color: var(--color-cat-transport);
      margin-top: 4px;
    }

    /* 숙소 카드 내 역 뱃지 */
    .station-badge {
      display: inline-block;
      font-size: 0.75rem;
      background: #3b82f618;
      color: #3b82f6;
      padding: 4px 10px;
      border-radius: 9999px;
      margin-right: 8px;
      margin-bottom: 4px;
    }

    /* 예산 총합 카드 */
    .budget-total {
      background: linear-gradient(135deg, #f97316, #ea580c);
      color: white;
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 12px;
      text-align: center;
    }
    .budget-total-label {
      font-size: 0.875rem;
      opacity: 0.9;
      margin-bottom: 8px;
    }
    .budget-total-amount {
      font-size: 1.25rem;
      font-weight: 700;
    }

    /* 날씨 카드 */
    .weather-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border-light);
      border-radius: 16px;
      padding: 16px;
      min-width: 120px;
      text-align: center;
      flex-shrink: 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }

    /* ICOCA 가이드 넘버 뱃지 */
    .number-badge {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    /* 인쇄 스타일 */
    @media print {
      body { background: white; }
      .nav-bar { display: none; }
      .hero { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .card, .card-sm, .table-wrap, details {
        break-inside: avoid;
      }
    }
  `;
}

// ============================================================
// 히어로 섹션 HTML
// ============================================================
function generateHeroHtml(trip: Trip): string {
  const dateRange = `${formatDate(trip.startDate)} — ${formatDate(trip.endDate)}`;
  const travelersText = trip.travelers === 1 ? '혼자 여행' : `${trip.travelers}명`;

  const tagsHtml = trip.tags.length > 0
    ? `<div class="hero-tags">${trip.tags.map((tag) => `<span class="hero-tag">${escapeHtml(tag)}</span>`).join('')}</div>`
    : '';

  return `
    <div class="hero">
      <div class="container">
        <h1 class="hero-title">${escapeHtml(trip.title)}</h1>
        <div class="hero-meta">
          <span>${dateRange}</span>
          <span style="color: rgba(255,255,255,0.6)">·</span>
          <span>${travelersText}</span>
        </div>
        ${tagsHtml}
      </div>
    </div>
  `;
}

// ============================================================
// 네비게이션 바 HTML
// ============================================================
function generateNavBarHtml(trip: Trip): string {
  const links: Array<{ href: string; label: string; emoji: string }> = [];

  links.push({ href: '#summary', label: '요약', emoji: '✈️' });
  if ((trip.days ?? []).length > 0) {
    links.push({ href: '#schedule', label: '일정', emoji: '📅' });
  }

  const hasRestaurants = (trip.restaurants ?? []).length > 0;
  const hasTransport = trip.transport && (
    (trip.transport.homeToHotel ?? []).length > 0 ||
    (trip.transport.intercityRoutes ?? []).length > 0 ||
    (trip.transport.passes ?? []).length > 0
  );
  const hasBudget = trip.budget && (trip.budget.items ?? []).length > 0;

  if (hasRestaurants || hasTransport || hasBudget) {
    links.push({ href: '#guide', label: '가이드', emoji: '🧭' });
  }

  const hasPacking = (trip.packing ?? []).length > 0;
  const hasPreTodos = (trip.preTodos ?? []).length > 0;
  if (hasPacking || hasPreTodos) {
    links.push({ href: '#checklist', label: '체크리스트', emoji: '✅' });
  }

  return `
    <nav class="nav-bar">
      ${links.map((l) => `<a href="${l.href}" class="nav-link">${l.emoji} ${l.label}</a>`).join('')}
    </nav>
  `;
}

// ============================================================
// 요약 섹션 HTML
// ============================================================
function generateSummaryHtml(trip: Trip): string {
  const parts: string[] = [];

  // 항공편
  const flights = trip.overview?.flights ?? [];
  if (flights.length > 0) {
    parts.push(generateFlightsHtml(flights));
  }

  // 숙소
  const accommodation = trip.overview?.accommodation;
  if (accommodation && accommodation.name) {
    parts.push(generateAccommodationHtml(accommodation));
  }

  // 날씨
  const weather = trip.overview?.weather ?? [];
  if (weather.length > 0) {
    parts.push(generateWeatherHtml(weather));
  }

  // 일정 요약
  const days = trip.days ?? [];
  if (days.length > 0) {
    parts.push(generateDaySummaryHtml(days));
  }

  // 팁
  const tips = trip.overview?.tips ?? [];
  if (tips.length > 0) {
    parts.push(generateTipsHtml(tips, '여행 팁'));
  }

  if (parts.length === 0) return '';

  return `
    <div class="section" id="summary">
      <div class="container">
        <h2 class="section-title">✈️ 요약</h2>
        ${parts.join('')}
      </div>
    </div>
  `;
}

function generateFlightsHtml(flights: Flight[]): string {
  return flights.map((flight) => {
    const dirLabel = flight.direction === 'outbound' ? '가는 편' : '오는 편';
    const noteHtml = flight.note
      ? `<div style="font-size:0.875rem; color:var(--color-text-secondary); margin-top:8px; background:var(--color-bg-secondary); border-radius:8px; padding:8px 12px;">${escapeHtml(flight.note)}</div>`
      : '';

    return `
      <div class="card">
        <div style="font-size:0.75rem; color:var(--color-text-tertiary); text-transform:uppercase; letter-spacing:0.05em; font-weight:600; margin-bottom:12px;">
          ${dirLabel}
        </div>
        <div class="flight-route">
          <div class="flight-point">
            <div class="flight-point-time">${escapeHtml(flight.departureTime)}</div>
            <div class="flight-point-name">${escapeHtml(flight.departure)}</div>
            <div style="font-size:0.75rem; color:var(--color-text-tertiary);">${escapeHtml(flight.date)}</div>
          </div>
          <div class="flight-line">
            <div class="flight-line-bar"></div>
            <span>✈️</span>
            <div class="flight-line-bar"></div>
          </div>
          <div class="flight-point">
            <div class="flight-point-time">${escapeHtml(flight.arrivalTime)}</div>
            <div class="flight-point-name">${escapeHtml(flight.arrival)}</div>
            ${flight.duration ? `<div style="font-size:0.75rem; color:var(--color-text-tertiary);">${escapeHtml(flight.duration)}</div>` : ''}
          </div>
        </div>
        ${noteHtml}
      </div>
    `;
  }).join('');
}

function generateAccommodationHtml(accommodation: Accommodation): string {
  const mapHref = accommodation.mapUrl || mapsLink(accommodation.name);
  const stationsHtml = (accommodation.nearbyStations ?? []).length > 0
    ? `<div style="margin-top:12px;">
        <span style="font-size:0.75rem; color:var(--color-text-tertiary);">주변 역</span>
        <div style="margin-top:4px;">${(accommodation.nearbyStations ?? []).map((s) => `<span class="station-badge">${escapeHtml(s)}</span>`).join('')}</div>
      </div>`
    : '';

  return `
    <div class="card">
      <div style="display:flex; align-items:center; justify-content:space-between;">
        <div style="font-size:1rem; font-weight:700;">${escapeHtml(accommodation.name)}</div>
        <a href="${mapHref}" target="_blank" rel="noopener noreferrer" class="maps-link">지도 보기 ↗</a>
      </div>
      ${accommodation.area ? `<div style="font-size:0.875rem; color:var(--color-text-secondary); margin-top:4px;">${escapeHtml(accommodation.area)}</div>` : ''}
      ${accommodation.address ? `<div style="font-size:0.75rem; color:var(--color-text-tertiary); margin-top:4px;">${escapeHtml(accommodation.address)}</div>` : ''}
      ${stationsHtml}
    </div>
  `;
}

function generateWeatherHtml(weather: WeatherDay[]): string {
  const cards = weather.map((w) => `
    <div class="weather-card">
      <div style="font-size:0.75rem; color:var(--color-text-tertiary); font-weight:600;">${escapeHtml(w.dayOfWeek)}</div>
      <div style="font-size:1.5rem; margin:6px 0;">${escapeHtml(w.icon)}</div>
      <div style="font-size:1rem; font-weight:700;">${w.tempAvg}°</div>
      <div style="font-size:0.75rem; color:var(--color-text-secondary);">${w.tempLow}° ~ ${w.tempHigh}°</div>
    </div>
  `).join('');

  return `
    <h3 class="section-subtitle">🌤️ 날씨 예보</h3>
    <div class="scroll-row">${cards}</div>
  `;
}

function generateDaySummaryHtml(days: Day[]): string {
  const cards = days.map((day) => {
    const color = getDayColor(day.dayNumber);
    return `
      <div class="card-sm">
        <div style="font-size:1.125rem; font-weight:900; color:${color}; margin-bottom:4px;">${day.dayNumber}</div>
        <div style="font-size:0.875rem; font-weight:700; color:var(--color-text-primary);">${escapeHtml(day.title)}</div>
        <div style="font-size:0.75rem; color:var(--color-text-secondary); margin-top:2px;">${escapeHtml(day.subtitle)}</div>
      </div>
    `;
  }).join('');

  return `
    <h3 class="section-subtitle">📅 일정 요약</h3>
    <div class="grid-2">${cards}</div>
  `;
}

function generateTipsHtml(tips: string[], title: string): string {
  const items = tips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join('');
  return `
    <details style="margin-top:16px;">
      <summary>💡 ${escapeHtml(title)}</summary>
      <div class="details-content">
        <ul style="list-style:none; padding:0; margin:0;">${items}</ul>
      </div>
    </details>
  `;
}

// ============================================================
// 일정 섹션 HTML
// ============================================================
function generateScheduleHtml(trip: Trip): string {
  const days = trip.days ?? [];
  if (days.length === 0) return '';

  const daysHtml = days.map((day) => generateDayHtml(day)).join('');

  return `
    <div class="section" id="schedule">
      <div class="container">
        <h2 class="section-title">📅 일정</h2>
        ${daysHtml}
      </div>
    </div>
  `;
}

function generateDayHtml(day: Day): string {
  const color = getDayColor(day.dayNumber);
  const dateStr = (day.date ?? '').replace(/-/g, '.');

  // 장소 링크 목록 (mapSpots)
  const spotsHtml = (day.mapSpots ?? []).length > 0
    ? `<div style="margin-bottom:16px;">
        ${(day.mapSpots ?? []).map((spot) =>
          `<a href="${mapsLink(spot.name)}" target="_blank" rel="noopener noreferrer" class="maps-link" style="margin-right:12px;">${escapeHtml(spot.icon)} ${escapeHtml(spot.name)} ↗</a>`
        ).join('')}
      </div>`
    : '';

  // 타임라인 아이템
  const itemsHtml = day.items.map((item) => generateTimelineItemHtml(item)).join('');

  return `
    <div class="card" style="border-left: 4px solid ${color};">
      <div class="day-header">
        <div class="day-number" style="color:${color};">${day.dayNumber}</div>
        <div>
          <div class="day-title">${escapeHtml(day.title)}</div>
          <div class="day-subtitle">${dateStr} · ${escapeHtml(day.subtitle)}</div>
        </div>
      </div>
      ${spotsHtml}
      <div class="timeline">
        ${itemsHtml}
      </div>
    </div>
  `;
}

function generateTimelineItemHtml(item: TimelineItem): string {
  const typeClass = item.type === 'default' ? '' : item.type;
  const timeColor = getTypeColor(item.type);

  const badgeHtml = item.badge
    ? (() => {
        const badgeBg = item.type === 'food' ? '#ec489924' : item.type === 'move' ? '#3b82f624' : '#f9731624';
        const badgeColor = getTypeColor(item.type);
        return `<span class="tl-badge" style="background:${badgeBg}; color:${badgeColor};">${escapeHtml(item.badge)}</span>`;
      })()
    : '';

  const descHtml = item.description
    ? `<div class="tl-desc">${escapeHtml(item.description)}</div>`
    : '';

  return `
    <div class="tl-item ${typeClass}">
      <div class="tl-time" style="color:${timeColor};">${escapeHtml(item.time)}</div>
      <div class="tl-title">${escapeHtml(item.title)}${badgeHtml}</div>
      ${descHtml}
    </div>
  `;
}

// ============================================================
// 가이드 섹션 HTML
// ============================================================
function generateGuideHtml(trip: Trip): string {
  const parts: string[] = [];

  // 맛집
  const restaurants = trip.restaurants ?? [];
  if (restaurants.length > 0) {
    parts.push(generateRestaurantsHtml(restaurants));
  }

  // 교통
  const transport = trip.transport;
  if (transport) {
    const transportHtml = generateTransportHtml(transport);
    if (transportHtml) parts.push(transportHtml);
  }

  // 예산
  const budget = trip.budget;
  if (budget && (budget.items ?? []).length > 0) {
    parts.push(generateBudgetHtml(budget));
  }

  if (parts.length === 0) return '';

  return `
    <div class="section" id="guide">
      <div class="container">
        <h2 class="section-title">🧭 가이드</h2>
        ${parts.join('')}
      </div>
    </div>
  `;
}

function generateRestaurantsHtml(restaurants: Restaurant[]): string {
  // dayNumber별 그룹핑
  const grouped = new Map<number, Restaurant[]>();
  restaurants.forEach((r) => {
    const list = grouped.get(r.dayNumber) ?? [];
    list.push(r);
    grouped.set(r.dayNumber, list);
  });

  const sortedDays = Array.from(grouped.entries()).sort(([a], [b]) => a - b);

  const html = sortedDays.map(([dayNumber, dayRestaurants]) => {
    const cards = dayRestaurants.map((r) => {
      const stars = '★'.repeat(Math.round(r.rating));
      const reviewHtml = r.reviewCount
        ? `<span style="font-size:0.75rem; color:var(--color-text-tertiary); margin-left:4px;">(${escapeHtml(r.reviewCount)})</span>`
        : '';

      return `
        <a href="${mapsLink(r.name)}" target="_blank" rel="noopener noreferrer" class="card-sm" style="display:flex; flex-direction:column; text-decoration:none; color:inherit;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
            <span class="badge badge-food">${escapeHtml(r.category)}</span>
            <span class="stars" style="font-size:0.875rem;">${stars} <span style="color:var(--color-text-secondary);">${r.rating}</span>${reviewHtml}</span>
          </div>
          <div style="font-size:1rem; font-weight:700; margin-bottom:4px;">${escapeHtml(r.name)}</div>
          <div style="font-size:0.875rem; color:var(--color-text-secondary); line-height:1.6; flex:1;">${escapeHtml(r.description)}</div>
          <div style="margin-top:12px;">
            <span style="font-size:0.75rem; color:var(--color-text-tertiary); font-weight:500; background:var(--color-bg-secondary); padding:4px 10px; border-radius:9999px;">${escapeHtml(r.priceRange)}</span>
          </div>
        </a>
      `;
    }).join('');

    return `
      <h3 class="section-subtitle">🍽️ Day ${dayNumber}</h3>
      <div class="grid-cards">${cards}</div>
    `;
  }).join('');

  return `
    <h3 class="section-subtitle">🍽️ 맛집</h3>
    ${html}
  `;
}

function generateTransportHtml(transport: TransportSection): string {
  const parts: string[] = [];
  const homeToHotel = transport.homeToHotel ?? [];
  const intercityRoutes = transport.intercityRoutes ?? [];
  const passes = transport.passes ?? [];
  const icocaGuide = transport.icocaGuide ?? [];
  const tips = transport.tips ?? [];

  if (homeToHotel.length === 0 && intercityRoutes.length === 0 && passes.length === 0) {
    return '';
  }

  // 집 -> 호텔 경로
  if (homeToHotel.length > 0) {
    const steps = homeToHotel.map((step, idx) => {
      const arrow = idx < homeToHotel.length - 1 ? '<span class="route-arrow">→</span>' : '';
      return `
        <div style="display:flex; align-items:center; gap:12px; flex-shrink:0;">
          <div class="route-step">
            <div style="font-size:1.25rem; margin-bottom:2px;">${escapeHtml(step.icon)}</div>
            <div style="font-size:0.875rem; font-weight:600;">${escapeHtml(step.title)}</div>
            <div style="font-size:0.75rem; color:var(--color-text-secondary);">${escapeHtml(step.subtitle)}</div>
          </div>
          ${arrow}
        </div>
      `;
    }).join('');
    parts.push(`
      <h3 class="section-subtitle">✈️ 집 → 호텔 경로</h3>
      <div class="scroll-row">${steps}</div>
    `);
  }

  // 도시간 노선
  if (intercityRoutes.length > 0) {
    const rows = intercityRoutes.map((route) => `
      <tr>
        <td style="font-weight:500;">${escapeHtml(route.from)}</td>
        <td style="font-weight:500;">${escapeHtml(route.to)}</td>
        <td style="color:var(--color-cat-transport);">${escapeHtml(route.method)}</td>
        <td style="color:var(--color-text-secondary);">${escapeHtml(route.duration)}</td>
        <td style="color:var(--color-primary); font-weight:600;">${escapeHtml(route.cost)}</td>
      </tr>
    `).join('');

    parts.push(`
      <h3 class="section-subtitle">🚆 도시간 노선</h3>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>출발</th><th>도착</th><th>교통편</th><th>소요</th><th style="text-align:right;">요금</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `);
  }

  // 패스 비교
  if (passes.length > 0) {
    const passCards = passes.map((pass) => {
      const style = getPassStyle(pass.recommendation);
      return `
        <div class="card-sm" style="border-color:${style.border}; background:${style.bg};">
          <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:8px; margin-bottom:8px;">
            <div style="font-size:1rem; font-weight:700;">${escapeHtml(pass.name)}</div>
            <span class="badge" style="background:${style.badgeBg}; color:${style.badgeText}; flex-shrink:0;">${style.label}</span>
          </div>
          <div style="font-size:0.875rem; font-weight:600; color:${style.text}; margin-bottom:4px;">${escapeHtml(pass.price)}</div>
          <div style="font-size:0.875rem; color:var(--color-text-secondary);">${escapeHtml(pass.reason)}</div>
        </div>
      `;
    }).join('');

    const verdictHtml = transport.passVerdict
      ? `<div class="card-sm" style="background:var(--color-primary-50); border-color:#f9731633; margin-top:12px;">
          <div style="font-size:0.875rem; color:var(--color-text-secondary);">💡 ${escapeHtml(transport.passVerdict)}</div>
        </div>`
      : '';

    parts.push(`
      <h3 class="section-subtitle">💳 패스 비교</h3>
      <div class="grid-cards">${passCards}</div>
      ${verdictHtml}
    `);
  }

  // ICOCA 가이드
  if (icocaGuide.length > 0) {
    const items = icocaGuide.map((guide, idx) => `
      <li style="display:flex; align-items:flex-start; gap:8px; margin-bottom:8px; font-size:0.875rem;">
        <span class="number-badge" style="background:#06b6d424; color:#06b6d4; margin-top:2px;">${idx + 1}</span>
        <span style="color:var(--color-text-secondary);">${escapeHtml(guide)}</span>
      </li>
    `).join('');

    parts.push(`
      <h3 class="section-subtitle">💳 ICOCA 가이드</h3>
      <div class="card">
        <ul style="list-style:none; padding:0; margin:0;">${items}</ul>
      </div>
    `);
  }

  // 교통 팁
  if (tips.length > 0) {
    parts.push(generateTipsHtml(tips, '교통 팁'));
  }

  return `
    <h3 class="section-subtitle" style="margin-top:32px;">🚆 교통</h3>
    ${parts.join('')}
  `;
}

function generateBudgetHtml(budget: BudgetSection): string {
  const items = budget.items ?? [];
  const total = budget.total;
  const tips = budget.tips ?? [];

  // 예산 항목
  const itemsHtml = items.map((item) => `
    <div class="card" style="display:flex; align-items:center; gap:12px;">
      <div style="font-size:1.25rem;">${escapeHtml(item.icon)}</div>
      <div style="flex:1; min-width:0;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="font-size:0.875rem; font-weight:600;">${escapeHtml(item.label)}</div>
          <div style="font-size:0.875rem; font-weight:700; color:var(--color-primary);">${escapeHtml(item.amount)}</div>
        </div>
        <div style="font-size:0.75rem; color:var(--color-text-secondary); margin-top:2px;">${escapeHtml(item.detail)}</div>
        <div class="budget-bar-bg">
          <div class="budget-bar" style="width:${item.percentage}%; background:${item.color || '#f97316'};"></div>
        </div>
      </div>
    </div>
  `).join('');

  // 총합
  const totalHtml = total
    ? `<div class="budget-total">
        <div class="budget-total-label">예상 총 비용</div>
        <div class="budget-total-amount">${escapeHtml(total.min)} ~ ${escapeHtml(total.max)}</div>
        ${total.minKRW ? `<div style="font-size:0.875rem; opacity:0.9; margin-top:4px;">(${escapeHtml(total.minKRW)} ~ ${escapeHtml(total.maxKRW)})</div>` : ''}
      </div>`
    : '';

  // 예산 팁
  const tipsHtml = tips.length > 0 ? generateTipsHtml(tips, '예산 팁') : '';

  return `
    <h3 class="section-subtitle" style="margin-top:32px;">💰 예산</h3>
    ${itemsHtml}
    ${totalHtml}
    ${tipsHtml}
  `;
}

// ============================================================
// 체크리스트 섹션 HTML
// ============================================================
function generateChecklistHtml(trip: Trip): string {
  const packing = trip.packing ?? [];
  const preTodos = trip.preTodos ?? [];

  if (packing.length === 0 && preTodos.length === 0) return '';

  const parts: string[] = [];

  // 준비물
  if (packing.length > 0) {
    parts.push(generatePackingHtml(packing));
  }

  // 사전 할 일
  if (preTodos.length > 0) {
    parts.push(generatePreTodosHtml(preTodos));
  }

  return `
    <div class="section" id="checklist">
      <div class="container">
        <h2 class="section-title">✅ 체크리스트</h2>
        ${parts.join('')}
      </div>
    </div>
  `;
}

function generatePackingHtml(packing: PackingItem[]): string {
  const categoriesHtml = packing.map((category) => {
    const itemsHtml = category.items.map((item) => {
      const noteHtml = item.note
        ? `<span style="font-size:0.75rem; color:var(--color-text-tertiary); margin-left:8px;">${escapeHtml(item.note)}</span>`
        : '';
      return `
        <div class="checklist-item">
          <div class="check-box"></div>
          <span>${escapeHtml(item.name)}${noteHtml}</span>
        </div>
      `;
    }).join('');

    return `
      <div style="margin-bottom:16px;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px; padding:0 4px;">
          <span>${escapeHtml(category.categoryIcon)}</span>
          <span style="font-size:0.875rem; font-weight:600;">${escapeHtml(category.category)}</span>
          <span style="font-size:0.75rem; color:var(--color-text-tertiary);">(${category.items.length})</span>
        </div>
        ${itemsHtml}
      </div>
    `;
  }).join('');

  return `
    <h3 class="section-subtitle">🧳 준비물</h3>
    ${categoriesHtml}
  `;
}

function generatePreTodosHtml(preTodos: PreTodoItem[]): string {
  const items = preTodos.map((todo) => `
    <div class="card">
      <div class="todo-card">
        <div class="todo-number">${todo.order}</div>
        <div style="flex:1; min-width:0;">
          <div style="font-size:0.875rem; font-weight:700; margin-bottom:4px;">${escapeHtml(todo.title)}</div>
          <div style="font-size:0.875rem; color:var(--color-text-secondary); line-height:1.6;">${escapeHtml(todo.description)}</div>
        </div>
      </div>
    </div>
  `).join('');

  return `
    <h3 class="section-subtitle" style="margin-top:24px;">📋 출발 전 할 일</h3>
    ${items}
  `;
}

// ============================================================
// 푸터 HTML
// ============================================================
function generateFooterHtml(): string {
  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

  return `
    <div class="footer">
      <p>
        <a href="https://my-journey-planner.vercel.app" target="_blank" rel="noopener noreferrer">My Journey</a>에서 만들었어요
      </p>
      <p style="margin-top:4px;">${dateStr} 공유됨</p>
    </div>
  `;
}

// ============================================================
// 메인 함수: Trip 객체 → 완전한 HTML 문자열
// ============================================================
export function generateTripHtml(trip: Trip): string {
  const heroHtml = generateHeroHtml(trip);
  const navBarHtml = generateNavBarHtml(trip);
  const summaryHtml = generateSummaryHtml(trip);
  const scheduleHtml = generateScheduleHtml(trip);
  const guideHtml = generateGuideHtml(trip);
  const checklistHtml = generateChecklistHtml(trip);
  const footerHtml = generateFooterHtml();
  const css = generateCSS();

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="generator" content="My Journey">
  <title>${escapeHtml(trip.title)} | My Journey</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;900&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
  <style>${css}</style>
</head>
<body>
  ${heroHtml}
  ${navBarHtml}
  ${summaryHtml}
  ${scheduleHtml}
  ${guideHtml}
  ${checklistHtml}
  ${footerHtml}
</body>
</html>`;
}
