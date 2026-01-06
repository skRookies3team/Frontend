import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  InfiniteData
} from '@tanstack/react-query';
import { feedApi, SearchHashtagDto } from '../api/feed-api'; // SearchHashtagDto import 추가
import { FeedSliceResponse, FeedDto, FollowStatResponse, LikerDto } from '../types/feed';
import { toast } from "sonner";
import { useState, useEffect } from 'react';

// [추가] 디바운스 훅 (파일 내에 포함 요청 반영)
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// 쿼리 키 관리
export const FEED_KEYS = {
  all: ['feeds'] as const,
  // 무한 스크롤용 리스트 키 (필터 포함)
  list: (userId: number, filter: string) => [...FEED_KEYS.all, 'list', userId, filter] as const,
  // 그리드 뷰용 키 (프로필 페이지 등)
  grid: (userId: number) => [...FEED_KEYS.all, 'grid', userId] as const,
  // 인기 게시물 키
  trending: (userId: number) => [...FEED_KEYS.all, 'trending', userId] as const,
  // 해시태그 검색 키
  hashtag: (tag: string, userId: number) => [...FEED_KEYS.all, 'hashtag', tag, userId] as const,
  // 상세, 좋아요, 팔로우 등
  detail: (feedId: number) => [...FEED_KEYS.all, 'detail', feedId] as const,
  likes: (feedId: number) => ['feeds', 'likes', feedId] as const,
  followStats: (userId: number) => ['follows', 'stats', userId] as const,
  followers: (userId: number) => ['follows', 'followers', userId] as const,
  followings: (userId: number) => ['follows', 'followings', userId] as const,
};

// [추가] 검색용 쿼리 키
export const SEARCH_KEYS = {
  users: (keyword: string) => ['search', 'users', keyword] as const,
  hashtags: (keyword: string) => ['search', 'hashtags', keyword] as const,
};

/**
 * [단순 목록 조회] 그리드 뷰용 (프로필 페이지 등)
 */
export const useFeeds = (userId: number = 0) => {
  return useQuery<FeedDto[]>({
    queryKey: FEED_KEYS.grid(userId),
    queryFn: async () => {
      const response = await feedApi.getFeeds(userId, 0, 50);
      return response.content;
    },
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * [무한 스크롤] 뉴스피드용
 */
export const useFeedList = (userId: number, filter: string = 'all') => {
  return useInfiniteQuery<FeedSliceResponse, Error>({
    queryKey: FEED_KEYS.list(userId, filter),
    queryFn: ({ pageParam = 0 }) => {
      return feedApi.getFeeds(userId, pageParam as number, 10);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.last ? undefined : lastPage.number + 1;
    },
    enabled: !!userId,
  });
};

/**
 * [인기 게시물] 인기 탭용 (알고리즘 정렬)
 */
export const useTrendingFeeds = (viewerId: number = 0) => {
  return useQuery<FeedSliceResponse>({
    queryKey: FEED_KEYS.trending(viewerId),
    queryFn: () => feedApi.getTrendingFeeds(viewerId, 0), // 0번 페이지 조회
    staleTime: 1000 * 60 * 5, // 5분 캐싱
  });
};

/**
 * [해시태그 피드 검색] (알고리즘 정렬)
 */
export const useFeedsByHashtag = (tag: string, userId: number) => {
  return useQuery<FeedSliceResponse>({
    queryKey: FEED_KEYS.hashtag(tag, userId),
    queryFn: () => feedApi.searchFeedsByHashtag(tag, userId, 0),
    enabled: !!tag,
  });
};

// [추가] 사용자 검색 Hook
export const useUserSearch = (keyword: string, viewerId: number = 0) => {
  const debouncedKeyword = useDebounce(keyword, 300);

  return useQuery({
    queryKey: SEARCH_KEYS.users(debouncedKeyword),
    queryFn: () => feedApi.searchUsers(debouncedKeyword, viewerId),
    // '#'으로 시작하지 않고 검색어가 있을 때만 실행
    enabled: !!debouncedKeyword && debouncedKeyword.trim().length > 0 && !debouncedKeyword.startsWith('#'),
    initialData: [],
  });
};

// [추가] 해시태그 검색 Hook (자동완성용)
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

/**
 * [좋아요 토글] 낙관적 업데이트 적용
 */
export const useFeedLike = (userId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feedId: number) => feedApi.toggleLike(feedId, userId),

    onMutate: async (feedId) => {
      await queryClient.cancelQueries({ queryKey: FEED_KEYS.all });

      const previousFeeds = queryClient.getQueriesData<InfiniteData<FeedSliceResponse>>({ queryKey: FEED_KEYS.all });
      const previousGrid = queryClient.getQueryData<FeedDto[]>(FEED_KEYS.grid(userId));
      const previousDetail = queryClient.getQueryData<FeedDto>(FEED_KEYS.detail(feedId));

      const updateFeedLike = (feed: FeedDto) => {
        if (feed.feedId === feedId) {
          const newIsLiked = !feed.isLiked;
          return {
            ...feed,
            isLiked: newIsLiked,
            // [수정] 음수 방지
            likeCount: newIsLiked ? feed.likeCount + 1 : Math.max(0, feed.likeCount - 1),
          };
        }
        return feed;
      };

      // Infinite Query 데이터 업데이트
      queryClient.setQueriesData<InfiniteData<FeedSliceResponse>>(
        { queryKey: FEED_KEYS.all },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              content: page.content.map(updateFeedLike),
            })),
          };
        }
      );

      // Grid 데이터 업데이트
      if (previousGrid) {
        queryClient.setQueryData<FeedDto[]>(
          FEED_KEYS.grid(userId),
          (old) => old?.map(updateFeedLike)
        );
      }

      if (previousDetail) {
        queryClient.setQueryData<FeedDto>(
          FEED_KEYS.detail(feedId),
          (old) => old ? updateFeedLike(old) : old
        );
      }

      return { previousFeeds, previousGrid, previousDetail };
    },

    onError: (_err, feedId, context) => {
      if (context?.previousFeeds) {
        context.previousFeeds.forEach(([key, data]) => queryClient.setQueryData(key, data));
      }
      if (context?.previousGrid) {
        queryClient.setQueryData(FEED_KEYS.grid(userId), context.previousGrid);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(FEED_KEYS.detail(feedId), context.previousDetail);
      }
    },

    onSuccess: (data, feedId) => {
      // [중요] 서버 응답(data)으로 캐시를 "확정" 업데이트합니다. 
      // 낙관적 업데이트가 실패하거나, 서버와 동기화가 필요할 때 정확한 값으로 보정해줍니다.

      const updateFeedLike = (feed: FeedDto) => {
        if (feed.feedId === feedId) {
          return {
            ...feed,
            isLiked: data.isLiked,
            likeCount: data.likeCount,
          };
        }
        return feed;
      };

      // 1. Infinite Query (피드 목록) 업데이트
      queryClient.setQueriesData<InfiniteData<FeedSliceResponse>>(
        { queryKey: FEED_KEYS.all },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              content: page.content.map(updateFeedLike),
            })),
          };
        }
      );

      // 2. Grid Query (그리드 뷰) 업데이트
      queryClient.setQueryData<FeedDto[]>(
        FEED_KEYS.grid(userId),
        (old) => old ? old.map(updateFeedLike) : old
      );

      // 3. Detail Query (상세 보기) 업데이트
      // 상세 모달이 열려있을 때 이 부분이 업데이트 되어야 하트 색깔이 정확히 반영됩니다.
      queryClient.setQueryData<FeedDto>(
        FEED_KEYS.detail(feedId),
        (old) => old ? updateFeedLike(old) : old
      );
    }
  });
};

/**
 * [피드 삭제]
 */
export const useDeleteFeed = () => {
  const queryClient = useQueryClient();
  // const { toast } = useToast(); -> Removed

  return useMutation({
    mutationFn: ({ feedId, userId }: { feedId: number; userId: number }) =>
      feedApi.deleteFeed(feedId, userId),
    onSuccess: () => {
      toast.success("피드가 삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: FEED_KEYS.all });
    },
    onError: () => {
      toast.error("삭제 실패", { description: "잠시 후 다시 시도해주세요." });
    }
  });
};

/**
 * [피드 수정]
 */
export const useUpdateFeed = () => {
  const queryClient = useQueryClient();
  // const { toast } = useToast();

  return useMutation({
    mutationFn: ({ feedId, data }: { feedId: number; data: any }) =>
      feedApi.updateFeed(feedId, data),
    onSuccess: () => {
      toast.success("피드가 수정되었습니다.");
      queryClient.invalidateQueries({ queryKey: FEED_KEYS.all });
    },
  });
};

/**
 * [팔로우 통계 조회]
 */
export const useFollowStats = (userId: number) => {
  return useQuery<FollowStatResponse>({
    queryKey: FEED_KEYS.followStats(userId),
    queryFn: () => feedApi.getFollowStats(userId),
    enabled: !!userId,
  });
};

/**
 * [좋아요 누른 사람 목록 조회]
 */
export const useLikers = (feedId: number, isOpen: boolean) => {
  return useQuery<LikerDto[]>({
    queryKey: FEED_KEYS.likes(feedId),
    queryFn: () => feedApi.getLikers(feedId),
    enabled: !!feedId && isOpen,
  });
};