// src/features/social/components/post-card.tsx

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Heart, MessageCircle, MoreHorizontal, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { FeedDto } from "../types/feed";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/ui/avatar";

interface PostCardProps {
  post: FeedDto;
  onLikeToggle: (feedId: number) => void;
  onClickPost?: (post: FeedDto) => void;
}

export function PostCard({ post, onLikeToggle, onClickPost }: PostCardProps) {
  // 이미지 슬라이드 인덱스 상태 관리
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // 이미지가 있어야 하고, 2장 이상인지 확인
  const images = post.imageUrls || [];
  const hasMultipleImages = images.length > 1;

  const handlePrevClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 포스트 클릭 이벤트 전파 방지
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // 이미지가 없을 경우 처리 (혹시 모를 대비)
  if (images.length === 0) {
      return null; // 또는 적절한 대체 UI
  }

  return (
    <div className="flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6 transition-all hover:shadow-md">
      {/* 1. 헤더: 작성자 정보 */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border border-gray-100 shadow-sm cursor-pointer">
            <AvatarImage src={post.writerProfileImage || undefined} />
            <AvatarFallback className="bg-[#FF69B4]/10 text-[#FF69B4]">{post.writerNickname.substring(0, 1)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col cursor-pointer">
            <span className="text-[15px] font-bold text-gray-900 leading-none mb-1">{post.writerNickname}</span>
            {post.location && (
              <div className="flex items-center text-xs font-medium text-gray-500">
                <MapPin className="w-3 h-3 mr-0.5 text-gray-400" />
                {post.location}
              </div>
            )}
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-50">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* 2. 이미지 영역 (슬라이더 적용) */}
      <div 
        className="relative aspect-square w-full bg-gray-100 cursor-pointer group overflow-hidden"
        onClick={() => onClickPost?.(post)}
      >
        {/* 현재 인덱스의 이미지 보여주기 */}
        <img
          src={images[currentImageIndex]}
          alt={`feed-${post.feedId}-${currentImageIndex}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* 좌우 화살표 및 인디케이터 (이미지가 여러 장일 때만 표시) */}
        {hasMultipleImages && (
          <>
            {/* 화살표는 호버 시에만 더 진하게 보이도록 설정 */}
            <button 
              onClick={handlePrevClick}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-black/20 text-white/80 rounded-full opacity-0 group-hover:opacity-100 hover:bg-black/50 hover:text-white transition-all duration-300 z-10 backdrop-blur-[2px]"
            >
              <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
            </button>
            <button 
              onClick={handleNextClick}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-black/20 text-white/80 rounded-full opacity-0 group-hover:opacity-100 hover:bg-black/50 hover:text-white transition-all duration-300 z-10 backdrop-blur-[2px]"
            >
              <ChevronRight className="w-6 h-6" strokeWidth={2.5} />
            </button>

            {/* 하단 페이지네이션 점 (Dots) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 p-1.5 rounded-full bg-black/10 backdrop-blur-[2px]">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentImageIndex 
                      ? "bg-white w-4 shadow-sm" 
                      : "bg-white/60 w-1.5 hover:bg-white/90"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 3. 액션 버튼 (좋아요/댓글) */}
      <div className="p-4 pb-2">
        <div className="flex items-center gap-4 mb-3">
            <button 
            onClick={(e) => { e.stopPropagation(); onLikeToggle(post.feedId); }}
            className="flex items-center gap-1.5 group transition-transform active:scale-90"
            >
            <Heart 
                className={`w-7 h-7 transition-all duration-300 ${
                post.isLiked 
                    ? "fill-[#FF69B4] text-[#FF69B4] drop-shadow-sm scale-105" 
                    : "text-gray-700 group-hover:text-[#FF69B4]"
                }`} 
                strokeWidth={post.isLiked ? 0 : 1.5}
            />
            </button>
            
            <button 
            onClick={() => onClickPost?.(post)}
            className="flex items-center gap-1.5 text-gray-700 hover:text-[#FF69B4] transition-colors group active:scale-90"
            >
            <MessageCircle className="w-7 h-7" strokeWidth={1.5} />
            </button>
        </div>
        
        {/* 좋아요 카운트 */}
        {post.likeCount > 0 && (
            <div className="text-[15px] font-bold text-gray-900 mb-2">
                좋아요 {post.likeCount.toLocaleString()}개
            </div>
        )}
      </div>

      {/* 4. 본문 내용 */}
      <div className="px-4 pb-4">
        <div className="text-[15px] leading-relaxed text-gray-900 line-clamp-3">
          <span className="font-bold mr-2">{post.writerNickname}</span>
          {post.content}
        </div>
        
        {/* 댓글 더보기 버튼 */}
        {post.commentCount > 0 && (
            <button 
                onClick={() => onClickPost?.(post)}
                className="text-sm text-gray-500 mt-2 hover:text-gray-700 font-medium"
            >
                댓글 {post.commentCount}개 모두 보기
            </button>
        )}
        
        {/* 작성 시간 */}
        <div className="text-xs text-gray-400 mt-2 font-medium uppercase tracking-wide">
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
        </div>
      </div>
    </div>
  );
}