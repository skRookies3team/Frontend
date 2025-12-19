import { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { FeedDto } from "../types/feed";
import { useFeeds, useFeedLike } from "../hooks/use-feed-query";
import { PostDetailModal } from "./PostDetailModal";
import { useAuth } from "@/features/auth/context/auth-context";

export function PopularFeedGrid() {
  const { data: feeds, isLoading } = useFeeds();
  const [selectedPost, setSelectedPost] = useState<FeedDto | null>(null);
  const { user } = useAuth();
  const myUserId = user ? Number(user.id) : 0;
  const { mutate: toggleLike } = useFeedLike(myUserId);

  // 좋아요 많은 순서대로 정렬 (내림차순)
  const sortedFeeds = feeds ? [...feeds].sort((a, b) => b.likeCount - a.likeCount) : [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-1 md:gap-4 w-full">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-100 rounded-[20px] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1 md:gap-6 w-full pb-20">
        {sortedFeeds.map((post) => (
          <div 
            key={post.feedId}
            onClick={() => setSelectedPost(post)}
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-[24px] bg-gray-100 shadow-sm border border-gray-50"
          >
            {post.imageUrls && post.imageUrls.length > 0 ? (
              <img 
                src={post.imageUrls[0]} 
                alt="popular-feed" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
            ) : (
              // 이미지가 없는 글일 경우 텍스트 표시
              <div className="flex h-full w-full items-center justify-center bg-[#FFF0F5] p-4 text-center">
                <span className="text-xs font-bold text-[#FF69B4] line-clamp-4 leading-relaxed">
                  {post.content}
                </span>
              </div>
            )}

            {/* 호버 시 나타나는 오버레이 (검은 배경 + 아이콘) */}
            <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center gap-6 text-white font-bold backdrop-blur-[2px]">
              <div className="flex items-center gap-2">
                <Heart className="h-6 w-6 fill-white text-white drop-shadow-md" />
                <span className="text-xl drop-shadow-md">{post.likeCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-6 w-6 fill-white text-white -rotate-90 drop-shadow-md" />
                <span className="text-xl drop-shadow-md">{post.commentCount}</span>
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