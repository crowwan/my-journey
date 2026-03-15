// ============================================================
// 서버 인메모리 캐시 유틸 (Map 기반, TTL)
// Vercel 서버리스에서 warm 상태 동안 캐시 유지
// ============================================================

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

// 캐시 인스턴스 생성 팩토리
export function createCache<T>(ttlMs: number) {
  const store = new Map<string, CacheEntry<T>>();

  return {
    // 캐시에서 데이터 조회 (만료 시 null 반환)
    get(key: string): T | null {
      const entry = store.get(key);
      if (!entry) return null;
      if (Date.now() > entry.expiry) {
        store.delete(key);
        return null;
      }
      return entry.data;
    },

    // 캐시에 데이터 저장
    set(key: string, data: T): void {
      store.set(key, { data, expiry: Date.now() + ttlMs });
    },
  };
}
