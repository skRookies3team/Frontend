import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { feedApi, SearchHashtagDto } from '../api/feed-api';

// 디바운스 훅
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export const SEARCH_KEYS = {
  users: (keyword: string) => ['search', 'users', keyword] as const,
  hashtags: (keyword: string) => ['search', 'hashtags', keyword] as const,
};

// 사용자 검색 Hook
export const useUserSearch = (keyword: string) => {
  const debouncedKeyword = useDebounce(keyword, 300);

  return useQuery({
    queryKey: SEARCH_KEYS.users(debouncedKeyword),
    queryFn: () => feedApi.searchUsers(debouncedKeyword),
    // '#'으로 시작하지 않고 검색어가 있을 때만 실행
    enabled: !!debouncedKeyword && debouncedKeyword.trim().length > 0 && !debouncedKeyword.startsWith('#'),
    initialData: [], 
  });
};

// 해시태그 검색 Hook
export const useHashtagSearch = (keyword: string) => {
  const debouncedKeyword = useDebounce(keyword, 300);

  return useQuery<SearchHashtagDto[]>({
    queryKey: SEARCH_KEYS.hashtags(debouncedKeyword),
    queryFn: () => feedApi.searchHashtags(debouncedKeyword),
    // 검색어가 있을 때만 실행
    enabled: !!debouncedKeyword && debouncedKeyword.trim().length > 0,
    initialData: [],
  });
};