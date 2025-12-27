import { 
  useInfiniteQuery, 
  useMutation, 
  useQuery, 
  useQueryClient, 
  InfiniteData 
} from '@tanstack/react-query';
import { feedApi } from '../api/feed-api';
import { FeedSliceResponse, FeedDto, FollowStatResponse, LikerDto } from '../types/feed';
import { useToast } from '@/shared/hooks/use-toast';

// 쿼리 키 관리
export const FEED_KEYS = {
  all: ['feeds'] as const,
  // 무한 스크롤용 리스트 키 (필터 포함)
  list: (userId: number, filter: string) => [...FEED_KEYS.all, 'list', userId, filter] as const,
  // 그리드 뷰용 키 (프로필 페이지 등)
  grid: (userId: number) => [...FEED_KEYS.all, 'grid', userId] as const,
  // 인기 게시물 키
  trending: ['feeds', 'trending'] as const,
  // 상세, 좋아요, 팔로우 등
  detail: (feedId: number) => [...FEED_KEYS.all, 'detail', feedId] as const,
  likes: (feedId: number) => ['feeds', 'likes', feedId] as const,
  followStats: (userId: number) => ['follows', 'stats', userId] as const,
  followers: (userId: number) => ['follows', 'followers', userId] as const,
  followings: (userId: number) => ['follows', 'followings', userId] as const,
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
 * [인기 게시물] 인기 탭용
 */
export const useTrendingFeeds = (viewerId: number = 0) => {
  return useQuery<FeedSliceResponse>({
    queryKey: FEED_KEYS.trending,
    queryFn: () => feedApi.getTrendingFeeds(viewerId),
    staleTime: 1000 * 60 * 10,
  });
};

/**
 * [좋아요 토글] 낙관적 업데이트 적용 (화면 깜빡임 방지)
 * - 메인 피드, 그리드, 인기 피드, 상세 모달 모두 동시에 업데이트합니다.
 */
export const useFeedLike = (userId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    // [수정됨] isLiked 상태를 인자로 받을 필요 없음. API가 알아서 토글함.
    mutationFn: (feedId: number) => feedApi.toggleLike(feedId, userId),
    
    onMutate: async (feedId) => {
      // 1. 쿼리 취소
      await queryClient.cancelQueries({ queryKey: FEED_KEYS.all });

      // 2. 스냅샷 저장
      const previousFeeds = queryClient.getQueriesData<InfiniteData<FeedSliceResponse>>({ queryKey: FEED_KEYS.all });
      const previousGrid = queryClient.getQueryData<FeedDto[]>(FEED_KEYS.grid(userId));
      const previousTrending = queryClient.getQueryData<FeedSliceResponse>(FEED_KEYS.trending);
      const previousDetail = queryClient.getQueryData<FeedDto>(FEED_KEYS.detail(feedId));

      // 3. 캐시 업데이트 함수 (UI상에서만 미리 뒤집기)
      const updateFeedLike = (feed: FeedDto) => {
        if (feed.feedId === feedId) {
          const newIsLiked = !feed.isLiked;
          return {
            ...feed,
            isLiked: newIsLiked,
            likeCount: newIsLiked ? feed.likeCount + 1 : feed.likeCount - 1,
          };
        }
        return feed;
      };

      // 4. 각 쿼리 데이터 업데이트
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

      if (previousGrid) {
        queryClient.setQueryData<FeedDto[]>(
          FEED_KEYS.grid(userId),
          (old) => old?.map(updateFeedLike)
        );
      }

      if (previousTrending) {
        queryClient.setQueryData<FeedSliceResponse>(
          FEED_KEYS.trending,
          (old) => old ? { ...old, content: old.content.map(updateFeedLike) } : old
        );
      }

      if (previousDetail) {
        queryClient.setQueryData<FeedDto>(
          FEED_KEYS.detail(feedId),
          (old) => old ? updateFeedLike(old) : old
        );
      }

      return { previousFeeds, previousGrid, previousTrending, previousDetail };
    },
    
    onError: (_err, feedId, context) => {
      // 에러 시 롤백
      if (context?.previousFeeds) {
        context.previousFeeds.forEach(([key, data]) => queryClient.setQueryData(key, data));
      }
      if (context?.previousGrid) {
        queryClient.setQueryData(FEED_KEYS.grid(userId), context.previousGrid);
      }
      if (context?.previousTrending) {
        queryClient.setQueryData(FEED_KEYS.trending, context.previousTrending);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(FEED_KEYS.detail(feedId), context.previousDetail);
      }
      // alert("좋아요 처리에 실패했습니다."); // 필요 시 주석 해제
    },

    onSuccess: (_, feedId) => {
      // 서버 데이터와 동기화
      queryClient.invalidateQueries({ queryKey: FEED_KEYS.all });
      queryClient.invalidateQueries({ queryKey: FEED_KEYS.detail(feedId) });
    }
  });
};

/**
 * [피드 삭제]
 */
export const useDeleteFeed = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ feedId, userId }: { feedId: number; userId: number }) =>
      feedApi.deleteFeed(feedId, userId),
    onSuccess: () => {
      toast({ title: "피드가 삭제되었습니다." });
      queryClient.invalidateQueries({ queryKey: FEED_KEYS.all });
    },
    onError: () => {
      toast({ title: "삭제 실패", description: "잠시 후 다시 시도해주세요.", variant: "destructive" });
    }
  });
};

/**
 * [피드 수정]
 */
export const useUpdateFeed = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ feedId, data }: { feedId: number; data: any }) =>
      feedApi.updateFeed(feedId, data),
    onSuccess: () => {
      toast({ title: "피드가 수정되었습니다." });
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