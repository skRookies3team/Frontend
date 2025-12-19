import { 
  useInfiniteQuery, 
  useMutation, 
  useQuery, // [추가됨]
  useQueryClient, 
  InfiniteData 
} from '@tanstack/react-query';
import { feedApi } from '../api/feed-api';
import { FeedSliceResponse, FeedDto } from '../types/feed';

// 쿼리 키 관리
export const FEED_KEYS = {
    all: ['feeds'] as const,
    list: (userId: number, filter: string) => [...FEED_KEYS.all, 'list', userId, filter] as const,
    detail: (feedId: number) => [...FEED_KEYS.all, 'detail', feedId] as const,
    grid: (userId: number) => [...FEED_KEYS.all, 'grid', userId] as const, // [추가됨] 그리드용 키
};

/**
 * [추가됨] 인기 게시물 그리드용 단순 목록 조회 훅
 * - 인기 탭에서 사진 위주로 보여줄 때 사용합니다.
 * - 한 번에 50개 정도를 불러와서 클라이언트 측에서 정렬하거나 보여줍니다.
 */
export const useFeeds = (userId: number = 0) => {
    return useQuery<FeedDto[]>({
        queryKey: FEED_KEYS.grid(userId),
        queryFn: async () => {
            // 그리드 뷰를 위해 넉넉하게 50개 조회 (필요 시 API에 sort 옵션 추가 가능)
            const response = await feedApi.getFeeds(userId, 0, 50);
            return response.content; // FeedDto[] 배열 반환
        },
        staleTime: 1000 * 60 * 5, // 5분간 캐시 유지 (자주 안 변함)
    });
};

/**
 * 피드 목록 무한 스크롤 훅
 * @param userId 로그인한 유저 ID
 * @param filter 필터 옵션
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
        enabled: !!userId, // userId가 있을 때만 실행
    });
};

/**
 * 좋아요 토글 훅 (낙관적 업데이트 적용, 깜빡임 방지)
 */
export const useFeedLike = (userId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (feedId: number) => feedApi.toggleLike(feedId, userId),
        
        onMutate: async (feedId) => {
            // 1. 진행 중인 쿼리 취소 (충돌 방지)
            await queryClient.cancelQueries({ queryKey: FEED_KEYS.all });

            // 2. 이전 데이터 스냅샷 저장 (에러 시 롤백용)
            // Infinite Query 데이터 스냅샷
            const previousFeeds = queryClient.getQueriesData<InfiniteData<FeedSliceResponse>>({ queryKey: FEED_KEYS.all });
            
            // [추가] Grid Query (useFeeds) 데이터 스냅샷도 저장
            const previousGridFeeds = queryClient.getQueryData<FeedDto[]>(FEED_KEYS.grid(userId));

            // 3. 캐시된 데이터 즉시 업데이트 (UI 반영)
            
            // 3-1. 무한 스크롤 리스트 업데이트
            queryClient.setQueriesData<InfiniteData<FeedSliceResponse>>(
                { queryKey: FEED_KEYS.all }, 
                (oldData) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        pages: oldData.pages.map((page) => ({
                            ...page,
                            content: page.content.map((feed) => {
                                if (feed.feedId === feedId) {
                                    const newIsLiked = !feed.isLiked;
                                    return {
                                        ...feed,
                                        isLiked: newIsLiked,
                                        likeCount: newIsLiked ? feed.likeCount + 1 : feed.likeCount - 1,
                                    };
                                }
                                return feed;
                            }),
                        })),
                    };
                }
            );

            // 3-2. [추가] 그리드 리스트 (useFeeds) 업데이트
            if (previousGridFeeds) {
                queryClient.setQueryData<FeedDto[]>(
                    FEED_KEYS.grid(userId),
                    (oldFeeds) => oldFeeds?.map(feed => {
                        if (feed.feedId === feedId) {
                            const newIsLiked = !feed.isLiked;
                            return {
                                ...feed,
                                isLiked: newIsLiked,
                                likeCount: newIsLiked ? feed.likeCount + 1 : feed.likeCount - 1,
                            };
                        }
                        return feed;
                    })
                );
            }

            return { previousFeeds, previousGridFeeds };
        },
        
        // 에러 발생 시 이전 상태로 롤백
        onError: (_err, _feedId, context) => {
            if (context?.previousFeeds) {
                context.previousFeeds.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            if (context?.previousGridFeeds) {
                queryClient.setQueryData(FEED_KEYS.grid(userId), context.previousGridFeeds);
            }
        },
        
        // onSettled 제거 (깜빡임 방지)
    });
};