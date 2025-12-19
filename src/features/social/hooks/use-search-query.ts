import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { feedApi } from '../api/feed-api';

// 디바운스 훅 (입력 지연 처리)
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export const SEARCH_KEYS = {
  users: (keyword: string) => ['search', 'users', keyword] as const,
};

export const useUserSearch = (keyword: string) => {
  const debouncedKeyword = useDebounce(keyword, 300);

  return useQuery({
    queryKey: SEARCH_KEYS.users(debouncedKeyword),
    queryFn: () => feedApi.searchUsers(debouncedKeyword),
    enabled: !!debouncedKeyword,
    initialData: [],
  });
};