import { useTrendingFeeds, useFeedLike } from "../hooks/use-feed-query";
import { Loader2, Heart, MessageCircle, Trophy, Flame } from "lucide-react";
import { useState } from "react";
import { PostDetailModal } from "./PostDetailModal";
import { FeedDto } from "../types/feed";
import { useAuth } from "@/features/auth/context/auth-context";
import { cn } from "@/shared/lib/utils";

export function PopularFeedGrid() {
  const { user } = useAuth();
  const currentUserId = user ? Number(user.id) : 0;
  
  // [수정] userId 전달 (쿼리 키 구분용)
  const { data, isLoading } = useTrendingFeeds(currentUserId);
  
  const [selectedPost, setSelectedPost] = useState<FeedDto | null>(null);
  const { mutate: toggleLike } = useFeedLike(currentUserId);

  // 벤토 그리드 스타일 span 계산
  const getGridSpan = (index: number) => {
    const pattern = index % 10;
    switch (pattern) {
      case 0: return "col-span-2 row-span-2"; // 대형
      case 5: return "col-span-1 row-span-2"; // 세로형
      case 6: return "col-span-2 row-span-1"; // 가로형
      default: return "col-span-1 row-span-1"; // 기본형
    }
  };

  // 랭킹 뱃지 렌더링
  const renderRankBadge = (index: number) => {
    if (index > 2) return null;
    const colors = [
      "bg-yellow-400 text-yellow-900 border-yellow-200", // 1위 Gold
      "bg-slate-300 text-slate-800 border-slate-100",    // 2위 Silver
      "bg-orange-300 text-orange-900 border-orange-200"  // 3위 Bronze
    ];
    return (
      <div className={`absolute top-3 left-3 z-20 flex items-center justify-center w-8 h-8 rounded-full border-2 shadow-lg ${colors[index]} font-black text-sm`}>
        {index + 1}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#FF69B4]" />
        <p className="text-gray-400 font-medium animate-pulse">트렌딩 피드를 불러오는 중...</p>
      </div>
    );
  }

  // [수정] SliceResponse 구조에 맞춰 content 추출
  const feeds = data?.content || [];

  if (feeds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400 gap-3">
        <div className="p-4 bg-gray-100 rounded-full">
          <Flame className="w-8 h-8 text-gray-400" />
        </div>
        <p className="font-medium">아직 인기 게시물이 없어요.</p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto pb-20">
        <div className="flex items-center gap-2 mb-6 px-2">
          <Trophy className="w-6 h-6 text-[#FF69B4]" />
          <h2 className="text-xl font-bold text-gray-800">지금 뜨는 펫로그 🔥</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[180px] md:auto-rows-[280px] grid-flow-dense">
          {feeds.map((feed, index) => (
            <div 
              key={feed.feedId} 
              className={cn(
                "relative group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                getGridSpan(index)
              )}
              onClick={() => setSelectedPost(feed)}
            >
              {renderRankBadge(index)}

              {feed.imageUrls && feed.imageUrls.length > 0 ? (
                <img 
                  src={feed.imageUrls[0]} 
                  alt="popular feed" 
                  className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-50">
                  <span className="text-4xl mb-3">📝</span>
                  <p className="text-sm text-gray-500 font-medium line-clamp-3 leading-relaxed">
                    {feed.content}
                  </p>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 md:p-6">
                <div className="flex items-center gap-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                  <div className="flex items-center text-white/90 font-bold text-lg gap-1.5">
                    <Heart className="w-5 h-5 fill-rose-500 text-rose-500 drop-shadow-md" />
                    <span className="drop-shadow-md">{feed.likeCount}</span>
                  </div>
                  <div className="flex items-center text-white/90 font-bold text-lg gap-1.5">
                    <MessageCircle className="w-5 h-5 fill-white text-white drop-shadow-md rotate-[-90deg]" />
                    <span className="drop-shadow-md">{feed.commentCount}</span>
                  </div>
                </div>
                
                {(index % 10 === 0 || index % 10 === 6) && (
                  <p className="text-white/80 text-sm font-medium mt-2 line-clamp-1 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100">
                    @{feed.writerNickname}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedPost && (
        <PostDetailModal
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          post={selectedPost}
          onLikeToggle={() => toggleLike(selectedPost.feedId)}
        />
      )}
    </>
  );
}