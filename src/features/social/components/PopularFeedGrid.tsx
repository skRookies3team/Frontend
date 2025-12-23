import { useState } from "react";
import { Heart, Loader2, RefreshCw } from "lucide-react";
import { FeedDto } from "../types/feed";
import { useTrendingFeeds, useFeedLike, useFeeds } from "../hooks/use-feed-query";
import { PostDetailModal } from "./PostDetailModal";
import { useAuth } from "@/features/auth/context/auth-context";
import { Button } from "@/shared/ui/button";

export function PopularFeedGrid() {
  const { user } = useAuth();
  const myUserId = user ? Number(user.id) : 0;
  
  // 1. 인기 게시물 API 호출
  const { data: trendingData, isLoading: isTrendingLoading, refetch } = useTrendingFeeds(myUserId);
  
  // 2. [폴백] 데이터가 없으면 전체 피드 호출해서 클라이언트에서 정렬
  const { data: allFeedsData, isLoading: isAllLoading } = useFeeds(myUserId);
  
  const { mutate: toggleLike } = useFeedLike(myUserId);
  const [selectedPost, setSelectedPost] = useState<FeedDto | null>(null);

  // 로딩 상태 처리
  if (isTrendingLoading || (isAllLoading && !trendingData)) {
    return (
      <div className="flex flex-col justify-center items-center w-full py-20 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        <span className="text-sm text-gray-400">인기 게시물을 불러오고 있어요...</span>
      </div>
    );
  }

  // 데이터 우선순위: 백엔드 인기글 -> 없으면 전체글 중 좋아요순 정렬 -> 없으면 빈 배열
  let feeds = trendingData?.content || [];
  
  if (feeds.length === 0 && allFeedsData) {
    // 백엔드 인기글이 0개면, 전체 글을 좋아요 순으로 정렬해서 보여줌 (Fallback)
    feeds = [...allFeedsData].sort((a, b) => b.likeCount - a.likeCount);
  }

  if (feeds.length === 0) {
    return (
      <div className="text-center py-20 w-full flex flex-col items-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-gray-500 font-bold mb-2">아직 인기 게시물이 없어요!</p>
        <p className="text-sm text-gray-400 mb-6">첫 번째 인기 스타가 되어보세요.</p>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" /> 새로고침
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1 md:gap-6 w-full pb-20">
        {feeds.map((post) => (
          <div 
            key={post.feedId}
            onClick={() => setSelectedPost(post)}
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-[16px] md:rounded-[24px] bg-gray-100 shadow-sm border border-gray-50"
          >
            {post.imageUrls && post.imageUrls.length > 0 ? (
              <img 
                src={post.imageUrls[0]} 
                alt="popular-feed" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#FFF0F5] p-4 text-center">
                <span className="text-[10px] md:text-xs font-bold text-[#FF69B4] line-clamp-4 leading-relaxed">
                  {post.content}
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center gap-4 text-white font-bold backdrop-blur-[2px]">
              <div className="flex items-center gap-1">
                <Heart className="h-5 w-5 fill-white text-white drop-shadow-md" />
                <span className="text-lg drop-shadow-md">{post.likeCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPost && (
        <PostDetailModal
           isOpen={!!selectedPost}
           onClose={() => setSelectedPost(null)}
           post={selectedPost}
           onLikeToggle={(id) => toggleLike(id)}
        />
      )}
    </>
  );
}