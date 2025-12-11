// src/features/social/hooks/use-feed-query.ts
import { useInfiniteQuery, useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { feedApi } from '../api/feed-api';
import { FeedSliceResponse } from '../types/feed';

// Query Key 관리
export const FEED_KEYS = {
    all: ['feeds'] as const,
    list: (userId: number, filter: string) => [...FEED_KEYS.all, userId, filter] as const,
};

// 피드 목록 조회 훅
export const useFeedList = (userId: number, filter: string = 'all') => {
    return useInfiniteQuery<FeedSliceResponse, Error>({
        // filter가 변경되면 캐시 키가 바뀌어 데이터를 새로 가져옴
        queryKey: FEED_KEYS.list(userId, filter),
        queryFn: ({ pageParam = 0 }) => {
            return feedApi.getFeeds(userId, pageParam as number, 10);
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            return lastPage.last ? undefined : lastPage.number + 1;
        },
    });
};

// 좋아요 토글 훅
export const useFeedLike = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (feedId: number) => feedApi.toggleLike(feedId),
        
        onMutate: async (feedId) => {
            // 1. 진행 중인 피드 관련 쿼리 취소
            await queryClient.cancelQueries({ queryKey: FEED_KEYS.all });

            // 2. 현재 캐시 데이터 스냅샷 저장 (롤백용)
            const previousFeeds = queryClient.getQueriesData<InfiniteData<FeedSliceResponse>>({ queryKey: FEED_KEYS.all });

            // 3. 낙관적 업데이트: 현재 로드된 *모든* 피드 리스트(전체, 내글, 친구 등)에서 해당 피드 상태 변경
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
            // 에러 발생 시 이전 상태로 복구
            if (context?.previousFeeds) {
                context.previousFeeds.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
        },

        onSettled: () => {
            // 데이터 정합성을 위해 쿼리 무효화 (선택 사항)
            queryClient.invalidateQueries({ queryKey: FEED_KEYS.all });
        },
    });
};