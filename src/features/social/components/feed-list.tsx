import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';
import { useFeedList, useFeedLike } from '../hooks/use-feed-query';
import { PostCard } from './post-card';
import { useAuth } from "@/features/auth/context/auth-context";

interface FeedListProps {
  filter: string;
}

export function FeedList({ filter }: FeedListProps) {
    const { user } = useAuth();
    const currentUserId = user?.id ? Number(user.id) : 1; 

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        error,
    } = useFeedList(currentUserId, filter); 

    const { mutate: toggleLike } = useFeedLike(currentUserId);
    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    if (status === 'pending') return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-pink-500" /></div>;
    
    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-2">
                <p className="font-semibold text-gray-800">피드를 불러올 수 없습니다</p>
                <p className="text-sm text-gray-500">{(error as Error).message}</p>
                <button onClick={() => window.location.reload()} className="text-xs text-blue-500 hover:underline">
                    새로고침
                </button>
            </div>
        );
    }

    const isEmpty = !data?.pages[0]?.content.length;

    return (
        // ⭐️ max-w-[470px] 제거 -> 부모(680px) 너비를 따라감
        <div className="flex flex-col items-center w-full mx-auto pb-20">
            {data?.pages.map((page, i) => (
                <div key={i} className="w-full flex flex-col gap-6">
                    {page.content.map((feed) => (
                        <PostCard
                            key={feed.feedId}
                            post={feed}
                            onLikeToggle={() => toggleLike(feed.feedId)}
                        />
                    ))}
                </div>
            ))}

            {isEmpty && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Loader2 className="h-8 w-8 text-gray-400" /> 
                    </div>
                    <p className="text-gray-900 font-medium">게시물이 없습니다</p>
                    <p className="text-gray-500 text-sm mt-1">친구를 팔로우하고 소식을 받아보세요.</p>
                </div>
            )}

            <div ref={ref} className="flex justify-center py-6 h-10 w-full">
                {isFetchingNextPage && <Loader2 className="h-6 w-6 animate-spin text-gray-400" />}
            </div>
        </div>
    );
}