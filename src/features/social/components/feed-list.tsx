// src/features/social/components/feed-list.tsx
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';
import { useFeedList, useFeedLike } from '../hooks/use-feed-query';
import { PostCard } from './post-card';
import { FeedSliceResponse, FeedDto } from "../types/feed";
import { useAuth } from "@/features/auth/context/auth-context";

interface FeedListProps {
  filter: string;
}

export function FeedList({ filter }: FeedListProps) {
    const { user } = useAuth();
    // 로그인 안 된 경우 0 또는 기본값 처리 (백엔드 에러 방지)
    const currentUserId = user?.id ? Number(user.id) : 1; 

    // filter에 따라 다른 쿼리 키를 사용하여 데이터 분리
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        error,
    } = useFeedList(currentUserId, filter); 

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
                Error loading feeds: {error?.message || "알 수 없는 오류"}
            </div>
        );
    }

    const isEmpty = !data?.pages[0]?.content.length;

    return (
        <div className="space-y-4 p-4 md:p-0">
            {data?.pages.map((page: FeedSliceResponse, pageIndex: number) => (
                <div key={pageIndex} className="space-y-4">
                    {page.content.map((feed: FeedDto) => (
                        <PostCard
                            key={feed.feedId}
                            post={feed}
                            onLikeToggle={(id) => toggleLike(id)}
                        />
                    ))}
                </div>
            ))}

            {isEmpty && (
                <div className="text-center py-10 text-muted-foreground">
                    <p>게시물이 없습니다.</p>
                </div>
            )}

            <div ref={ref} className="flex justify-center py-4 h-10">
                {isFetchingNextPage && (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                )}
            </div>
        </div>
    );
}