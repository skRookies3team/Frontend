import { useInfiniteQuery, useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { getFeeds, toggleLike } from '../api/feed-api';
import { FeedSliceResponse, FeedDto } from '../types/feed';

export const FEED_KEYS = {
    all: ['feeds'] as const,
    lists: () => [...FEED_KEYS.all, 'list'] as const,
};

export const useFeedList = () => {
    return useInfiniteQuery<FeedSliceResponse, Error>({
        queryKey: FEED_KEYS.lists(),
        queryFn: ({ pageParam }) => getFeeds(pageParam as number, 10),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            return lastPage.last ? undefined : lastPage.number + 1;
        },
    });
};

export const useFeedLike = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (feedId: number) => toggleLike(feedId),
        onMutate: async (feedId) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: FEED_KEYS.lists() });

            // Snapshot the previous value
            const previousFeeds = queryClient.getQueryData<InfiniteData<FeedSliceResponse>>(FEED_KEYS.lists());

            // Optimistically update to the new value
            if (previousFeeds) {
                queryClient.setQueryData<InfiniteData<FeedSliceResponse>>(FEED_KEYS.lists(), (old) => {
                    if (!old) return old;

                    return {
                        ...old,
                        pages: old.pages.map((page) => ({
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
                });
            }

            // Return a context object with the snapshotted value
            return { previousFeeds };
        },
        onError: (_err, _newTodo, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousFeeds) {
                queryClient.setQueryData(FEED_KEYS.lists(), context.previousFeeds);
            }
        },
        onSettled: () => {
            // Always refetch after error or success:
            // queryClient.invalidateQueries({ queryKey: FEED_KEYS.lists() });
            // Note: In high traffic feeds, invalidating might cause jumpy UI. 
            // Since we updated optimistically, we might choose not to invalidate immediately 
            // or invalidate specific items if possible. For now, let's keep it simple and NOT invalidate 
            // to preserve the scroll position and smooth experience, relying on the optimistic update.
            // If consistency is critical, we should invalidate.
        },
    });
};
