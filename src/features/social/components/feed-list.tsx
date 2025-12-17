import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";
import { PostCard } from "./post-card";
import { useFeedList, useFeedLike } from "../hooks/use-feed-query";
import { useAuth } from "@/features/auth/context/auth-context";
import { FeedDto } from "../types/feed";

interface FeedListProps {
  filter: string;
  onPostClick?: (post: FeedDto) => void;
}

export function FeedList({ filter, onPostClick }: FeedListProps) {
  const { user } = useAuth();
  const { ref, inView } = useInView();
  
  const currentUserId = user ? Number(user.id) : 0;

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useFeedList(currentUserId, filter);

  const { mutate: toggleLike } = useFeedLike(currentUserId);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <p>게시물을 불러올 수 없습니다.</p>
        <button onClick={() => window.location.reload()} className="text-blue-500 text-sm mt-2 font-bold">
            다시 시도
        </button>
      </div>
    );
  }

  if (!data || data.pages[0].content.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 text-black" />
        </div>
        <h3 className="text-xl font-bold mb-2">게시물이 없습니다</h3>
        <p className="text-gray-500 text-sm">친구를 팔로우하고 소식을 받아보세요.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* 최대 너비를 470px로 제한하여 인스타그램 비율 구현 */}
      <div className="w-full max-w-[470px]">
        {data.pages.map((page, pageIndex) => (
            <div key={pageIndex}>
            {page.content.map((post) => (
                <PostCard
                key={post.feedId}
                post={post}
                onLikeToggle={(id) => toggleLike(id)}
                onClickPost={onPostClick}
                />
            ))}
            </div>
        ))}
      </div>
      
      {/* 무한 스크롤 로딩 인디케이터 */}
      <div ref={ref} className="h-20 flex justify-center items-center w-full">
        {isFetchingNextPage && <Loader2 className="h-6 w-6 animate-spin text-gray-400" />}
      </div>
    </div>
  );
}