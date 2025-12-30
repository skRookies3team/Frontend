import { useFeedsByHashtag, useFeedLike } from "../hooks/use-feed-query";
import { Loader2, Heart, MessageCircle, Hash } from "lucide-react";
import { useState } from "react";
import { PostDetailModal } from "./PostDetailModal";
import { FeedDto } from "../types/feed";
import { useAuth } from "@/features/auth/context/auth-context";
import { cn } from "@/shared/lib/utils";

interface HashtagFeedGridProps {
  tag: string;
}

export function HashtagFeedGrid({ tag }: HashtagFeedGridProps) {
  const { user } = useAuth();
  const currentUserId = user ? Number(user.id) : 0;
  
  // 해시태그 검색 데이터 조회 (알고리즘 정렬)
  const { data, isLoading } = useFeedsByHashtag(tag, currentUserId);
  
  const [selectedPost, setSelectedPost] = useState<FeedDto | null>(null);
  const { mutate: toggleLike } = useFeedLike(currentUserId);

  // 벤토 그리드 패턴 (인기 페이지와 동일한 스타일)
  const getGridSpan = (index: number) => {
    const pattern = index % 10;
    switch (pattern) {
      case 0: return "col-span-2 row-span-2"; 
      case 5: return "col-span-1 row-span-2"; 
      case 6: return "col-span-2 row-span-1"; 
      default: return "col-span-1 row-span-1"; 
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#FF69B4]" />
        <p className="text-gray-400 font-medium">#{tag} 관련 피드를 찾는 중...</p>
      </div>
    );
  }

  const feeds = data?.content || [];

  if (feeds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400 gap-3">
        <div className="p-4 bg-gray-100 rounded-full">
          <Hash className="w-8 h-8 text-gray-400" />
        </div>
        <p className="font-medium">#{tag}에 대한 게시물이 없어요.</p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto pb-20">
        {/* 상단 해시태그 헤더 */}
        <div className="flex items-center gap-4 mb-8 px-4 py-6 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF69B4] to-[#FFB6C1] flex items-center justify-center text-white shadow-lg rotate-3">
            <Hash className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">#{tag}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-[#FFF0F5] text-[#FF69B4] text-xs font-bold rounded-full">
                TRENDING
              </span>
              <p className="text-sm text-gray-500 font-medium">게시물 {feeds.length.toLocaleString()}개</p>
            </div>
          </div>
        </div>

        {/* 벤토 그리드 레이아웃 */}
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
              {/* 이미지 */}
              {feed.imageUrls && feed.imageUrls.length > 0 ? (
                <img 
                  src={feed.imageUrls[0]} 
                  alt="feed" 
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

              {/* 그라데이션 오버레이 */}
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
                
                {/* 큰 타일일 경우 작성자 표시 */}
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

      {/* 상세 모달 */}
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