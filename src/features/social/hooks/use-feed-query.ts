import { useInfiniteQuery, useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { feedApi } from '../api/feed-api';
import { FeedSliceResponse } from '../types/feed';

// 쿼리 키 관리
export const FEED_KEYS = {
    all: ['feeds'] as const,
    list: (userId: number, filter: string) => [...FEED_KEYS.all, userId, filter] as const,
};

/**
 * 피드 목록 무한 스크롤 훅
 * @param userId 로그인한 유저 ID
 * @param filter 필터 옵션
 */
export const useFeedList = (userId: number, filter: string = 'all') => {
    return useInfiniteQuery<FeedSliceResponse, Error>({
        // 테스트 유저 변환 로직 제거하고 바로 userId 사용
        queryKey: FEED_KEYS.list(userId, filter),
        queryFn: ({ pageParam = 0 }) => {
            return feedApi.getFeeds(userId, pageParam as number, 10);
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            return lastPage.last ? undefined : lastPage.number + 1;
        },
        // userId가 유효할 때만 쿼리 실행 (0이거나 없으면 실행 안 함)
        enabled: !!userId, 
    });
};

/**
 * 좋아요 토글 훅 (낙관적 업데이트 적용)
 */
export const useFeedLike = (userId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        // 테스트 유저 변환 로직 제거
        mutationFn: (feedId: number) => feedApi.toggleLike(feedId, userId),
        
        onMutate: async (feedId) => {
            await queryClient.cancelQueries({ queryKey: FEED_KEYS.all });
            const previousFeeds = queryClient.getQueriesData<InfiniteData<FeedSliceResponse>>({ queryKey: FEED_KEYS.all });

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
        onError: (_err, _feedId, context) => {
            if (context?.previousFeeds) {
                context.previousFeeds.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: FEED_KEYS.all });
        },
    });
};