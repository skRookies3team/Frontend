import { useInfiniteQuery, useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { feedApi, TEST_USER_ID } from '../api/feed-api';
import { FeedSliceResponse } from '../types/feed';

// 쿼리 키 관리 (필터링 및 유저별 캐싱 분리)
export const FEED_KEYS = {
    all: ['feeds'] as const,
    list: (userId: number, filter: string) => [...FEED_KEYS.all, userId, filter] as const,
};

/**
 * 피드 목록 무한 스크롤 훅
 * @param userId 로그인한 유저 ID (없으면 0)
 * @param filter 필터 옵션 (all, my-posts 등)
 */
export const useFeedList = (userId: number, filter: string = 'all') => {
    // 유저 ID가 없으면(0) 테스트 ID(1)를 사용하도록 처리 -> 회원서비스 없어도 조회 가능
    const effectiveUserId = userId === 0 ? TEST_USER_ID : userId;

    return useInfiniteQuery<FeedSliceResponse, Error>({
        queryKey: FEED_KEYS.list(effectiveUserId, filter),
        queryFn: ({ pageParam = 0 }) => {
            return feedApi.getFeeds(effectiveUserId, pageParam as number, 10);
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            // Slice 방식: last가 false면 다음 페이지 번호 반환
            return lastPage.last ? undefined : lastPage.number + 1;
        },
    });
};

/**
 * 좋아요 토글 훅 (낙관적 업데이트 적용)
 */
export const useFeedLike = (userId: number) => {
    const queryClient = useQueryClient();
    const effectiveUserId = userId === 0 ? TEST_USER_ID : userId;

    return useMutation({
        mutationFn: (feedId: number) => feedApi.toggleLike(feedId, effectiveUserId),
        
        // API 요청 보내기 전에 UI 먼저 업데이트 (인스타그램처럼 즉시 반응)
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
        // 에러 발생 시 롤백
        onError: (_err, _feedId, context) => {
            if (context?.previousFeeds) {
                context.previousFeeds.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
        },
        // 완료 후 최신 데이터 동기화
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: FEED_KEYS.all });
        },
    });
};