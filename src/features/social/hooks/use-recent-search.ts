import { useState, useEffect } from 'react';

export interface RecentSearchItem {
  id: string | number;
  type: 'USER' | 'HASHTAG';
  text: string;
  subText?: string;
  image?: string | null;
  targetId: number;
}

const STORAGE_KEY = 'petlog-recent-searches';
const MAX_ITEMS = 10;

export function useRecentSearch() {
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);

  // 1. 초기 로드 (마운트 시)
  useEffect(() => {
    if (typeof window === 'undefined') return; // SSR 안전 장치
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed);
        }
      } catch (e) {
        console.error("Failed to parse recent searches", e);
      }
    }
  }, []);

  // 2. 검색어 추가
  const addRecentSearch = (item: RecentSearchItem) => {
    setRecentSearches((prev) => {
      // 중복 제거 (같은 ID와 타입이 있으면 삭제)
      const filtered = prev.filter((i) => !(i.targetId === item.targetId && i.type === item.type));
      // 새 항목을 맨 앞에 추가
      const updated = [item, ...filtered].slice(0, MAX_ITEMS);
      
      // [수정] Side Effect를 여기서 처리해도 동작은 하지만, 
      // 더 명확하게 하기 위해 로컬 변수에 담아 저장
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // 3. 검색어 삭제
  const removeRecentSearch = (targetId: number, type: 'USER' | 'HASHTAG') => {
    setRecentSearches((prev) => {
      const updated = prev.filter((i) => !(i.targetId === targetId && i.type === type));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // 4. 전체 삭제
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  };
}