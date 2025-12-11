import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';
import { useFeedList, useFeedLike } from '../hooks/use-feed-query';
import { PostCard } from './post-card';

export function FeedList() {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        error,
    } = useFeedList();

    const { mutate: toggleLike } = useFeedLike();

    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    if (status === 'pending') {
        return (
            <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="text-center py-10 text-red-500">
                Error loading feeds: {error.message}
            </div>
        );
    }

    return (
        <div className="space-y-4 p-4 md:p-0">
            {data.pages.map((page, pageIndex) => (
                <div key={pageIndex} className="space-y-4">
                    {page.content.map((feed) => (
                        <PostCard
                            key={feed.feedId}
                            post={feed}
                            onLikeToggle={(id) => toggleLike(id)}
                        />
                    ))}
                </div>
            ))}

            {data.pages[0].content.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                    <p>게시물이 없습니다.</p>
                </div>
            )}

            <div ref={ref} className="flex justify-center py-4">
                {isFetchingNextPage && (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                )}
            </div>
        </div>
    );
}
