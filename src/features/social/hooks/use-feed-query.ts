import { useInfiniteQuery, useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { feedApi } from '../api/feed-api';
import { FeedSliceResponse } from '../types/feed';

export const FEED_KEYS = {
    all: ['feeds'] as const,
    list: (userId: number, filter: string) => [...FEED_KEYS.all, userId, filter] as const,
};

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
    });
};

export const useFeedLike = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (feedId: number) => feedApi.toggleLike(feedId),
        
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