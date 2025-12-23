import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Heart, MessageCircle, MoreHorizontal, MapPin, ChevronLeft, ChevronRight, Edit, Trash } from "lucide-react";
import { FeedDto } from "../types/feed";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useAuth } from "@/features/auth/context/auth-context";
import { useDeleteFeed, useLikers } from "../hooks/use-feed-query";
import { FollowListModal } from "./FollowListModal";

interface PostCardProps {
  post: FeedDto;
  onLikeToggle: (feedId: number) => void;
  onClickPost?: (post: FeedDto) => void;
}

export function PostCard({ post, onLikeToggle, onClickPost }: PostCardProps) {
  const { user } = useAuth();
  const deleteFeedMutation = useDeleteFeed();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // [추가] 좋아요 목록 모달 상태
  const [showLikers, setShowLikers] = useState(false);
  // 모달이 열려있을 때만 API 호출 (enabled: showLikers)
  const { data: likers, isLoading: isLikersLoading } = useLikers(post.feedId, showLikers);

  const images = post.imageUrls || [];
  const hasMultipleImages = images.length > 1;
  
  // 작성자 본인 확인
  const isOwner = user && Number(user.id) === post.writerId;

  const handlePrevClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleDelete = () => {
    if (confirm("정말 이 게시물을 삭제하시겠습니까?")) {
      deleteFeedMutation.mutate({ feedId: post.feedId, userId: Number(user?.id) });
    }
  };

  const handleEdit = () => {
    alert("게시물 수정 페이지로 이동 기능이 필요합니다.");
    // navigate(`/feeds/${post.feedId}/edit`); 등 구현 필요
  };

  // 내용과 이미지가 모두 없으면 렌더링 안 함
  if (images.length === 0 && !post.content) return null;

  return (
    <>
      <div className="flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6 transition-all hover:shadow-md">
        {/* 1. 헤더 */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border border-gray-100 shadow-sm cursor-pointer">
              <AvatarImage src={post.writerProfileImage || undefined} />
              <AvatarFallback className="bg-[#FF69B4]/10 text-[#FF69B4] font-bold">
                {post.writerNickname.substring(0, 1)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col cursor-pointer">
              <span className="text-[15px] font-bold text-gray-900 leading-none mb-1">
                {post.writerNickname}
              </span>
              {post.location && (
                <div className="flex items-center text-xs font-medium text-gray-500">
                  <MapPin className="w-3 h-3 mr-0.5 text-gray-400" />
                  {post.location}
                </div>
              )}
            </div>
          </div>

          {/* [추가] 수정/삭제 메뉴 (본인일 때만 표시) */}
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-50 outline-none">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white rounded-xl shadow-lg border-gray-100 min-w-[120px]">
                <DropdownMenuItem onClick={handleEdit} className="cursor-pointer gap-2 p-2 hover:bg-gray-50 text-gray-700">
                  <Edit className="w-4 h-4" /> 수정하기
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="cursor-pointer gap-2 p-2 hover:bg-red-50 text-red-600 focus:text-red-600 focus:bg-red-50">
                  <Trash className="w-4 h-4" /> 삭제하기
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* 2. 이미지 영역 */}
        <div 
          className="relative aspect-square w-full bg-gray-100 cursor-pointer group overflow-hidden"
          onClick={() => onClickPost?.(post)}
        >
          {images.length > 0 && (
            <img 
              src={images[currentImageIndex]} 
              alt="feed" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
          )}
          
          {/* 슬라이드 화살표 (2장 이상일 때) */}
          {hasMultipleImages && (
            <>
              <button onClick={handlePrevClick} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-black/20 text-white/80 rounded-full opacity-0 group-hover:opacity-100 hover:bg-black/50 transition-all backdrop-blur-[2px] z-10">
                <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
              </button>
              <button onClick={handleNextClick} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-black/20 text-white/80 rounded-full opacity-0 group-hover:opacity-100 hover:bg-black/50 transition-all backdrop-blur-[2px] z-10">
                <ChevronRight className="w-6 h-6" strokeWidth={2.5} />
              </button>
              
              {/* 인디케이터 */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 p-1.5 rounded-full bg-black/10 backdrop-blur-[2px]">
                {images.map((_, idx) => (
                  <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? "bg-white w-4 shadow-sm" : "bg-white/60 w-1.5"}`} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* 3. 액션 버튼 */}
        <div className="p-4 pb-2">
          <div className="flex items-center gap-4 mb-3">
            <button
              onClick={(e) => { e.stopPropagation(); onLikeToggle(post.feedId); }}
              className="flex items-center gap-1.5 group transition-transform active:scale-90"
            >
              <Heart
                className={`w-7 h-7 transition-all duration-300 ${post.isLiked
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

          {/* [추가] 좋아요 개수 클릭 시 목록 보기 */}
          {post.likeCount > 0 && (
            <button 
              onClick={() => setShowLikers(true)} 
              className="text-[15px] font-bold text-gray-900 mb-2 hover:underline decoration-gray-400 underline-offset-2"
            >
              좋아요 {post.likeCount.toLocaleString()}개
            </button>
          )}
        </div>

        {/* 4. 본문 내용 */}
        <div className="px-4 pb-4">
          <div className="text-[15px] leading-relaxed text-gray-900 line-clamp-3">
            <span className="font-bold mr-2">{post.writerNickname}</span>
            {post.content}
          </div>
          {post.commentCount > 0 && (
            <button onClick={() => onClickPost?.(post)} className="text-sm text-gray-500 mt-2 hover:text-gray-700 font-medium">
              댓글 {post.commentCount}개 모두 보기
            </button>
          )}
          <div className="text-xs text-gray-400 mt-2 font-medium uppercase tracking-wide">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
          </div>
        </div>
      </div>

      {/* 좋아요 목록 모달 */}
      <FollowListModal
        isOpen={showLikers}
        onClose={() => setShowLikers(false)}
        title="좋아요"
        users={likers}
        isLoading={isLikersLoading}
      />
    </>
  );
}