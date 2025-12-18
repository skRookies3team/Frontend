import { useInfiniteQuery, useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { feedApi } from '../api/feed-api';
import { FeedSliceResponse } from '../types/feed';

// 쿼리 키 관리
export const FEED_KEYS = {
    all: ['feeds'] as const,
    list: (userId: number, filter: string) => [...FEED_KEYS.all, 'list', userId, filter] as const,
    detail: (feedId: number) => [...FEED_KEYS.all, 'detail', feedId] as const,
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
            const previousFeeds = queryClient.getQueriesData<InfiniteData<FeedSliceResponse>>({ queryKey: FEED_KEYS.all });

            // 3. 캐시된 데이터 즉시 업데이트 (UI 반영)
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

            return { previousFeeds };
        },
        
        // 에러 발생 시 이전 상태로 롤백
        onError: (_err, _feedId, context) => {
            if (context?.previousFeeds) {
                context.previousFeeds.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
        },
        
        // 중요: onSettled(invalidateQueries) 제거
        // 서버 응답 직후 재조회를 하지 않음으로써 UI 깜빡임 방지
    });
};