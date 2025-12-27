import { useTrendingFeeds } from "../hooks/use-feed-query";
import { Loader2, Heart, MessageCircle } from "lucide-react";
import { useState } from "react";
import { PostDetailModal } from "./PostDetailModal";
import { FeedDto } from "../types/feed";
import { useFeedLike } from "../hooks/use-feed-query"; // 좋아요 동기화용
import { useAuth } from "@/features/auth/context/auth-context";

export function PopularFeedGrid() {
  const { user } = useAuth();
  const currentUserId = user ? Number(user.id) : 0;
  
  // 데이터 조회
  const { data, isLoading } = useTrendingFeeds(currentUserId);
  
  // 모달 상태
  const [selectedPost, setSelectedPost] = useState<FeedDto | null>(null);

  // 좋아요 동기화 훅 (모달에 전달용)
  const { mutate: toggleLike } = useFeedLike(currentUserId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF69B4]" />
      </div>
    );
  }

  const feeds = data?.content || [];

  if (feeds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400">
        <div className="text-4xl mb-2">🔥</div>
        <p>아직 인기 게시물이 없어요.</p>
      </div>
    );
  }

  return (
    <>
      {/* 그리드 레이아웃: 모바일 3열 유지 (인스타 스타일) */}
      <div className="grid grid-cols-3 gap-1 md:gap-4 md:px-4">
        {feeds.map((feed) => (
          <div 
            key={feed.feedId} 
            className="relative aspect-square group cursor-pointer overflow-hidden bg-gray-100 md:rounded-lg"
            onClick={() => setSelectedPost(feed)}
          >
            {/* 이미지 */}
            {feed.imageUrls && feed.imageUrls.length > 0 ? (
              <img 
                src={feed.imageUrls[0]} 
                alt="popular feed" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-4 text-xs text-gray-400 text-center bg-white">
                {feed.content.slice(0, 30)}...
              </div>
            )}

            {/* 호버 오버레이 (PC에서만/모바일은 터치 시 효과가 없으므로 제외할 수도 있음) */}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="flex items-center text-white font-bold text-lg gap-2">
                <Heart className="w-6 h-6 fill-white text-white" />
                {feed.likeCount}
              </div>
              <div className="flex items-center text-white font-bold text-lg gap-2">
                <MessageCircle className="w-6 h-6 fill-white text-white rotate-[-90deg]" />
                {feed.commentCount}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 상세 모달 연결 */}
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