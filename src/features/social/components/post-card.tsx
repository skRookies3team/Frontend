import { useState } from "react";
import { Link } from "react-router-dom"; // [수정] Link import 추가
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Heart, MessageCircle, MoreHorizontal, MapPin, ChevronLeft, ChevronRight, Edit, Trash, AlertTriangle, Ban, Share2 } from "lucide-react";
import { FeedDto } from "../types/feed";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useAuth } from "@/features/auth/context/auth-context";
import { useDeleteFeed, useLikers, useFeedLike } from "../hooks/use-feed-query";
import { FollowListModal } from "./FollowListModal";
import { FeedCreateModal } from "./FeedCreateModal";
import { feedApi } from "../api/feed-api";
import { toast } from "sonner";

interface PostCardProps {
  post: FeedDto;
  onClickPost?: (post: FeedDto) => void;
}

export function PostCard({ post, onClickPost }: PostCardProps) {
  const { user } = useAuth();
  const currentUserId = Number(user?.id);

  const { mutate: toggleLike } = useFeedLike(currentUserId);
  const deleteFeedMutation = useDeleteFeed();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [showLikers, setShowLikers] = useState(false);
  const { data: likers, isLoading: isLikersLoading } = useLikers(post.feedId, showLikers);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const images = post.imageUrls || [];
  const hasMultipleImages = images.length > 1;

  const isOwner = user && Number(user.id) === post.writerId;

  const handlePrevClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(post.feedId);
  };

  const handleDelete = () => {
    if (confirm("정말 이 게시물을 삭제하시겠습니까?")) {
      deleteFeedMutation.mutate({ feedId: post.feedId, userId: currentUserId });
    }
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleReport = async () => {
    if (confirm("이 게시물을 신고하시겠습니까?")) {
      try {
        await feedApi.report(currentUserId, post.feedId, "FEED", "부적절한 콘텐츠");
        alert("신고가 접수되었습니다.");
      } catch (e) {
        alert("신고 처리 중 오류가 발생했습니다.");
      }
    }
  };

  const handleBlock = async () => {
    if (confirm(`'${post.writerNickname}'님을 차단하시겠습니까?`)) {
      try {
        await feedApi.blockUser(currentUserId, post.writerId);
        alert("차단되었습니다.");
      } catch (e) {
        alert("차단 처리 중 오류가 발생했습니다.");
      }
    }
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const shareUrl = `${window.location.origin}/social/feed/${post.feedId}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success("링크가 클립보드에 복사되었습니다!");
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast.error("링크 복사에 실패했습니다.");
    }
  };

  if (images.length === 0 && !post.content) return null;

  return (
    <>
      <div className="flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6 transition-all hover:shadow-md">
        {/* 1. 헤더 */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            {/* [수정] 아바타에 링크 적용 (writerId 사용) */}
            <Link to={`/user/${post.writerId}`}>
              <Avatar className="w-10 h-10 border border-gray-100 shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
                <AvatarImage src={post.writerProfileImage || undefined} />
                <AvatarFallback className="bg-[#FF69B4]/10 text-[#FF69B4] font-bold">
                  {post.writerNickname.substring(0, 1)}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="flex flex-col">
              {/* [수정] 닉네임에 링크 적용 (writerId 사용) */}
              <Link to={`/user/${post.writerId}`} className="text-[15px] font-bold text-gray-900 leading-none mb-1 hover:text-[#FF69B4] transition-colors">
                {post.writerNickname}
              </Link>
              {post.location && (
                <div className="flex items-center text-xs font-medium text-gray-500">
                  <MapPin className="w-3 h-3 mr-0.5 text-gray-400" />
                  {post.location}
                </div>
              )}
            </div>
          </div>

          {/* 메뉴 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-50 outline-none">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white rounded-xl shadow-lg border-gray-100 min-w-[120px]">
              {isOwner ? (
                <>
                  <DropdownMenuItem onClick={handleEdit} className="cursor-pointer gap-2 p-2 hover:bg-gray-50 text-gray-700">
                    <Edit className="w-4 h-4" /> 수정하기
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="cursor-pointer gap-2 p-2 hover:bg-red-50 text-red-600 focus:text-red-600 focus:bg-red-50">
                    <Trash className="w-4 h-4" /> 삭제하기
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={handleReport} className="cursor-pointer gap-2 p-2 hover:bg-gray-50 text-red-500">
                    <AlertTriangle className="w-4 h-4" /> 신고하기
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleBlock} className="cursor-pointer gap-2 p-2 hover:bg-gray-50 text-gray-700">
                    <Ban className="w-4 h-4" /> 차단하기
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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

          {hasMultipleImages && (
            <>
              <button onClick={handlePrevClick} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-black/20 text-white/80 rounded-full opacity-0 group-hover:opacity-100 hover:bg-black/50 transition-all backdrop-blur-[2px] z-10">
                <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
              </button>
              <button onClick={handleNextClick} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-black/20 text-white/80 rounded-full opacity-0 group-hover:opacity-100 hover:bg-black/50 transition-all backdrop-blur-[2px] z-10">
                <ChevronRight className="w-6 h-6" strokeWidth={2.5} />
              </button>
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
              onClick={handleLikeClick}
              className="flex items-center gap-1.5 group transition-transform active:scale-90 focus:outline-none"
            >
              <Heart
                className={`w-7 h-7 transition-all duration-300 ${post.isLiked
                  ? "fill-red-600 text-red-600 drop-shadow-sm scale-105"
                  : "text-gray-700 group-hover:text-red-600"
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
            <button
              onClick={handleShareClick}
              className="flex items-center gap-1.5 text-gray-700 hover:text-blue-500 transition-colors group active:scale-90"
            >
              <Share2 className="w-7 h-7" strokeWidth={1.5} />
            </button>
          </div>

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
            {/* [수정] 본문 내 작성자 이름에도 링크 적용 */}
            <Link to={`/user/${post.writerId}`} className="font-bold mr-2 hover:text-[#FF69B4] transition-colors">
              {post.writerNickname}
            </Link>
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

      {/* 수정 모달 */}
      {isEditModalOpen && (
        <FeedCreateModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          mode="edit"
          initialData={post}
        />
      )}
    </>
  );
}