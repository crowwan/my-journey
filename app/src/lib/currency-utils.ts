// ============================================================
// 목적지 -> 통화 코드 매핑 유틸
// Trip에 budget.currency가 없는 레거시 데이터 폴백용
// ============================================================

interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
}

// 주요 여행지 -> 통화 매핑 테이블
const DESTINATION_CURRENCY_MAP: Record<string, CurrencyInfo> = {
  // 일본
  '일본': { code: 'JPY', symbol: '¥', name: '엔' },
  '도쿄': { code: 'JPY', symbol: '¥', name: '엔' },
  '오사카': { code: 'JPY', symbol: '¥', name: '엔' },
  '교토': { code: 'JPY', symbol: '¥', name: '엔' },
  '후쿠오카': { code: 'JPY', symbol: '¥', name: '엔' },
  '나고야': { code: 'JPY', symbol: '¥', name: '엔' },
  '삿포로': { code: 'JPY', symbol: '¥', name: '엔' },
  '오키나와': { code: 'JPY', symbol: '¥', name: '엔' },
  '나라': { code: 'JPY', symbol: '¥', name: '엔' },
  '히로시마': { code: 'JPY', symbol: '¥', name: '엔' },
  '가나자와': { code: 'JPY', symbol: '¥', name: '엔' },
  '요코하마': { code: 'JPY', symbol: '¥', name: '엔' },
  '고베': { code: 'JPY', symbol: '¥', name: '엔' },

  // 미국
  '미국': { code: 'USD', symbol: '$', name: '달러' },
  '뉴욕': { code: 'USD', symbol: '$', name: '달러' },
  '로스앤젤레스': { code: 'USD', symbol: '$', name: '달러' },
  'LA': { code: 'USD', symbol: '$', name: '달러' },
  '샌프란시스코': { code: 'USD', symbol: '$', name: '달러' },
  '하와이': { code: 'USD', symbol: '$', name: '달러' },
  '라스베이거스': { code: 'USD', symbol: '$', name: '달러' },
  '시카고': { code: 'USD', symbol: '$', name: '달러' },
  '시애틀': { code: 'USD', symbol: '$', name: '달러' },
  '괌': { code: 'USD', symbol: '$', name: '달러' },
  '사이판': { code: 'USD', symbol: '$', name: '달러' },

  // 유럽
  '프랑스': { code: 'EUR', symbol: '€', name: '유로' },
  '파리': { code: 'EUR', symbol: '€', name: '유로' },
  '이탈리아': { code: 'EUR', symbol: '€', name: '유로' },
  '로마': { code: 'EUR', symbol: '€', name: '유로' },
  '밀라노': { code: 'EUR', symbol: '€', name: '유로' },
  '스페인': { code: 'EUR', symbol: '€', name: '유로' },
  '바르셀로나': { code: 'EUR', symbol: '€', name: '유로' },
  '마드리드': { code: 'EUR', symbol: '€', name: '유로' },
  '독일': { code: 'EUR', symbol: '€', name: '유로' },
  '베를린': { code: 'EUR', symbol: '€', name: '유로' },
  '뮌헨': { code: 'EUR', symbol: '€', name: '유로' },
  '네덜란드': { code: 'EUR', symbol: '€', name: '유로' },
  '암스테르담': { code: 'EUR', symbol: '€', name: '유로' },
  '오스트리아': { code: 'EUR', symbol: '€', name: '유로' },
  '비엔나': { code: 'EUR', symbol: '€', name: '유로' },
  '그리스': { code: 'EUR', symbol: '€', name: '유로' },
  '아테네': { code: 'EUR', symbol: '€', name: '유로' },
  '포르투갈': { code: 'EUR', symbol: '€', name: '유로' },
  '리스본': { code: 'EUR', symbol: '€', name: '유로' },

  // 영국
  '영국': { code: 'GBP', symbol: '£', name: '파운드' },
  '런던': { code: 'GBP', symbol: '£', name: '파운드' },

  // 태국
  '태국': { code: 'THB', symbol: '฿', name: '바트' },
  '방콕': { code: 'THB', symbol: '฿', name: '바트' },
  '치앙마이': { code: 'THB', symbol: '฿', name: '바트' },
  '푸켓': { code: 'THB', symbol: '฿', name: '바트' },
  '파타야': { code: 'THB', symbol: '฿', name: '바트' },

  // 베트남
  '베트남': { code: 'VND', symbol: '₫', name: '동' },
  '하노이': { code: 'VND', symbol: '₫', name: '동' },
  '호치민': { code: 'VND', symbol: '₫', name: '동' },
  '다낭': { code: 'VND', symbol: '₫', name: '동' },

  // 중국
  '중국': { code: 'CNY', symbol: '¥', name: '위안' },
  '베이징': { code: 'CNY', symbol: '¥', name: '위안' },
  '상하이': { code: 'CNY', symbol: '¥', name: '위안' },
  '홍콩': { code: 'HKD', symbol: 'HK$', name: '홍콩달러' },
  '마카오': { code: 'MOP', symbol: 'MOP$', name: '파타카' },

  // 대만
  '대만': { code: 'TWD', symbol: 'NT$', name: '대만달러' },
  '타이베이': { code: 'TWD', symbol: 'NT$', name: '대만달러' },
  '가오슝': { code: 'TWD', symbol: 'NT$', name: '대만달러' },

  // 싱가포르
  '싱가포르': { code: 'SGD', symbol: 'S$', name: '싱가포르달러' },

  // 말레이시아
  '말레이시아': { code: 'MYR', symbol: 'RM', name: '링깃' },
  '쿠알라룸푸르': { code: 'MYR', symbol: 'RM', name: '링깃' },

  // 인도네시아
  '인도네시아': { code: 'IDR', symbol: 'Rp', name: '루피아' },
  '발리': { code: 'IDR', symbol: 'Rp', name: '루피아' },
  '자카르타': { code: 'IDR', symbol: 'Rp', name: '루피아' },

  // 필리핀
  '필리핀': { code: 'PHP', symbol: '₱', name: '페소' },
  '마닐라': { code: 'PHP', symbol: '₱', name: '페소' },
  '세부': { code: 'PHP', symbol: '₱', name: '페소' },
  '보라카이': { code: 'PHP', symbol: '₱', name: '페소' },

  // 호주
  '호주': { code: 'AUD', symbol: 'A$', name: '호주달러' },
  '시드니': { code: 'AUD', symbol: 'A$', name: '호주달러' },
  '멜버른': { code: 'AUD', symbol: 'A$', name: '호주달러' },

  // 캐나다
  '캐나다': { code: 'CAD', symbol: 'C$', name: '캐나다달러' },
  '밴쿠버': { code: 'CAD', symbol: 'C$', name: '캐나다달러' },
  '토론토': { code: 'CAD', symbol: 'C$', name: '캐나다달러' },

  // 스위스
  '스위스': { code: 'CHF', symbol: 'CHF', name: '프랑' },
  '취리히': { code: 'CHF', symbol: 'CHF', name: '프랑' },

  // 체코
  '체코': { code: 'CZK', symbol: 'Kč', name: '코루나' },
  '프라하': { code: 'CZK', symbol: 'Kč', name: '코루나' },

  // 터키
  '터키': { code: 'TRY', symbol: '₺', name: '리라' },
  '이스탄불': { code: 'TRY', symbol: '₺', name: '리라' },
};

// 한국 도시 (KRW 반환 → null 처리)
const KOREAN_DESTINATIONS = [
  '한국', '서울', '부산', '제주', '제주도', '경주', '강릉',
  '여수', '전주', '인천', '대구', '대전', '광주', '속초',
];

/**
 * 목적지 문자열에서 통화 정보를 추출한다.
 * 국내 여행이면 null 반환.
 * 매핑에 없는 목적지도 null 반환.
 */
export function getDestinationCurrency(destination: string): CurrencyInfo | null {
  if (!destination) return null;

  const trimmed = destination.trim();

  // 한국 도시 확인
  if (KOREAN_DESTINATIONS.some((city) => trimmed.includes(city))) {
    return null;
  }

  // 매핑 테이블에서 매치 (포함 관계로 검색)
  for (const [keyword, info] of Object.entries(DESTINATION_CURRENCY_MAP)) {
    if (trimmed.includes(keyword)) {
      return info;
    }
  }

  return null;
}
