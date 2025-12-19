import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/shared/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { ScrollArea } from "@/shared/ui/scroll-area";
// [추가] ChevronLeft, ChevronRight 아이콘 추가
import { Heart, MessageCircle, Send, MoreHorizontal, X, Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import { FeedDto } from "../types/feed";
import { useAuth } from "@/features/auth/context/auth-context";
import { useComments, useCreateComment, useDeleteComment } from "../hooks/use-comment-query";
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface PostDetailModalProps {
  post: FeedDto;
  isOpen: boolean;
  onClose: () => void;
  onLikeToggle?: (id: number) => void;
}

export function PostDetailModal({ post, isOpen, onClose, onLikeToggle }: PostDetailModalProps) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");
  
  // [추가] 이미지 슬라이드 인덱스 상태 관리
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const currentUserId = Number(user?.id);

  const { data: comments, isLoading: isCommentsLoading } = useComments(post.feedId);
  const createCommentMutation = useCreateComment(post.feedId);
  const deleteCommentMutation = useDeleteComment(post.feedId);

  // [추가] 이미지 데이터 준비
  const images = post.imageUrls || [];
  const hasMultipleImages = images.length > 1;

  // [추가] 이전 이미지 보기
  const handlePrevClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // [추가] 다음 이미지 보기
  const handleNextClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    createCommentMutation.mutate(
      { userId: currentUserId, content: commentText },
      { onSuccess: () => setCommentText("") }
    );
  };

  const handleDeleteComment = (commentId: number) => {
    if (confirm("정말 이 댓글을 삭제할까요? 🥺")) {
      deleteCommentMutation.mutate({ commentId, userId: currentUserId });
    }
  };

  const handleLike = () => {
      onLikeToggle?.(post.feedId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-full md:max-w-[1200px] w-full p-0 gap-0 overflow-hidden h-full md:h-[90vh] flex flex-col md:flex-row bg-white border-none sm:rounded-[2.5rem] z-50 shadow-2xl transition-all"
        overlayClassName="bg-black/20 backdrop-blur-sm" 
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">게시물 상세</DialogTitle>
        
        {/* 닫기 버튼 */}
        <DialogClose className="fixed right-8 top-8 z-[60] p-3 rounded-full bg-white shadow-lg text-gray-400 hover:bg-[#FF69B4] hover:text-white hover:scale-110 transition-all cursor-pointer border border-gray-100">
            <X className="h-6 w-6 stroke-[3px]" />
            <span className="sr-only">Close</span>
        </DialogClose>

        {/* 1. 이미지 영역 (왼쪽) - 슬라이더 적용됨 */}
        <div className="relative bg-black flex items-center justify-center w-full h-[45vh] md:h-full md:flex-[1.5_1_0%] overflow-hidden border-r border-[#FFF0F5] group">
           {images.length > 0 ? (
             <>
               {/* 이미지 표시 */}
               <img 
                 src={images[currentImageIndex]} 
                 alt={`Post-${currentImageIndex}`} 
                 className="w-full h-full object-contain" // 이미지가 잘리지 않게 contain 사용 (필요시 cover로 변경)
               />

               {/* 화살표 및 인디케이터 (이미지가 여러 장일 때만 표시) */}
               {hasMultipleImages && (
                 <>
                   <button 
                     onClick={handlePrevClick}
                     className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/20 text-white rounded-full hover:bg-white/40 transition-all backdrop-blur-sm z-10"
                   >
                     <ChevronLeft className="w-6 h-6" />
                   </button>
                   <button 
                     onClick={handleNextClick}
                     className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/20 text-white rounded-full hover:bg-white/40 transition-all backdrop-blur-sm z-10"
                   >
                     <ChevronRight className="w-6 h-6" />
                   </button>

                   {/* 하단 점 (Dots) */}
                   <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 p-2 rounded-full bg-black/20 backdrop-blur-sm">
                     {images.map((_, idx) => (
                       <div
                         key={idx}
                         className={`h-1.5 rounded-full transition-all duration-300 ${
                           idx === currentImageIndex 
                             ? "bg-white w-4" 
                             : "bg-white/50 w-1.5 hover:bg-white/80"
                         }`}
                       />
                     ))}
                   </div>
                 </>
               )}
             </>
           ) : (
             <div className="flex items-center justify-center h-full w-full p-10 bg-[#FFF9FB]">
                 <p className="text-2xl text-gray-800 font-bold text-center leading-relaxed whitespace-pre-wrap font-sans">
                     {post.content}
                 </p>
             </div>
           )}
        </div>

        {/* 2. 정보 및 댓글 영역 (오른쪽) */}
        <div className="flex flex-col w-full h-[55vh] md:h-full md:flex-1 bg-white relative">
          
          {/* 헤더 */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50 shrink-0">
             <div className="flex items-center gap-4">
                <Link to={`/user/${post.writerNickname}`} className="flex items-center gap-3 group">
                    <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-[#FF69B4] transition-all">
                        <AvatarImage src={post.writerProfileImage || "/placeholder-user.jpg"} />
                        <AvatarFallback className="bg-[#FFF0F5] text-[#FF69B4] font-bold">{post.writerNickname[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-[15px] font-bold text-gray-900 group-hover:text-[#FF69B4] transition-colors">
                        {post.writerNickname}
                    </span>
                </Link>
             </div>
             <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-[#FFF0F5] rounded-full text-gray-400 hover:text-[#FF69B4] transition-colors">
                <MoreHorizontal className="h-6 w-6" />
             </Button>
          </div>

          {/* 댓글 목록 */}
          <ScrollArea className="flex-1 p-6">
              {/* 본문 내용 */}
              <div className="flex gap-4 mb-8">
                <Link to={`/user/${post.writerNickname}`} className="shrink-0">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={post.writerProfileImage || "/placeholder-user.jpg"} />
                        <AvatarFallback className="bg-[#FFF0F5] text-[#FF69B4] font-bold">{post.writerNickname[0]}</AvatarFallback>
                    </Avatar>
                </Link>
                <div className="flex-1 space-y-1.5">
                   <div className="text-[15px] leading-relaxed">
                      <Link to={`/user/${post.writerNickname}`} className="font-bold mr-2 hover:underline decoration-[#FF69B4] decoration-2 underline-offset-2 text-gray-900">
                        {post.writerNickname}
                      </Link>
                      <span className="text-gray-800 whitespace-pre-wrap">{post.content}</span>
                   </div>
                   <span className="text-xs text-gray-400 font-medium block mt-1">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
                   </span>
                </div>
              </div>

              {/* 댓글 리스트 */}
              {isCommentsLoading ? (
                  <div className="flex justify-center items-center h-20">
                      <div className="animate-pulse flex gap-2">
                         <div className="h-2.5 w-2.5 bg-[#FF69B4]/30 rounded-full animate-bounce"></div>
                         <div className="h-2.5 w-2.5 bg-[#FF69B4]/30 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                         <div className="h-2.5 w-2.5 bg-[#FF69B4]/30 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      </div>
                  </div>
              ) : (
                  <div className="space-y-6">
                     {comments?.map((comment) => (
                         <div key={comment.commentId} className="flex gap-3 group">
                             <Link to={`/user/${comment.writerNickname}`} className="shrink-0">
                                 <Avatar className="h-8 w-8">
                                     <AvatarImage src={comment.writerProfileImage || "/placeholder-user.jpg"} />
                                     <AvatarFallback className="bg-gray-50 text-gray-500 text-xs">{comment.writerNickname[0]}</AvatarFallback>
                                 </Avatar>
                             </Link>
                             <div className="flex-1">
                                 <div className="text-[14px] leading-relaxed">
                                     <Link to={`/user/${comment.writerNickname}`} className="font-bold mr-2 text-gray-900 hover:text-[#FF69B4] transition-colors">
                                         {comment.writerNickname}
                                     </Link>
                                     <span className="text-gray-700">{comment.content}</span>
                                 </div>
                                 <div className="flex items-center gap-3 mt-1.5">
                                     <span className="text-[11px] text-gray-400 font-medium">
                                         {formatDistanceToNow(new Date(comment.createdAt), { locale: ko })}
                                     </span>
                                     {(comment.writerId === currentUserId || post.writerId === currentUserId) && (
                                         <button 
                                             onClick={() => handleDeleteComment(comment.commentId)}
                                             className="text-[11px] text-gray-400 hover:text-[#FF69B4] font-bold opacity-0 group-hover:opacity-100 transition-all"
                                         >
                                             삭제
                                         </button>
                                     )}
                                 </div>
                             </div>
                         </div>
                     ))}
                  </div>
              )}
          </ScrollArea>

          {/* 하단 액션 버튼 */}
          <div className="p-5 border-t border-gray-50 bg-white">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex gap-5">
                    <button onClick={handleLike} className="group transition-transform active:scale-90 focus:outline-none">
                       <Heart className={`h-[28px] w-[28px] transition-colors duration-200 ${post.isLiked ? "fill-[#FF69B4] text-[#FF69B4]" : "text-gray-800 group-hover:text-[#FF69B4]"}`} />
                    </button>
                    <button className="hover:opacity-60 transition-opacity"><MessageCircle className="h-[28px] w-[28px] text-gray-800 -rotate-90 group-hover:text-[#FF69B4]" /></button>
                    <button className="hover:opacity-60 transition-opacity"><Send className="h-[28px] w-[28px] text-gray-800 -rotate-12 mb-1 group-hover:text-[#FF69B4]" /></button>
                 </div>
                 <button className="hover:opacity-60 transition-opacity">
                     <Bookmark className="h-[28px] w-[28px] text-gray-800 group-hover:text-[#FF69B4]" />
                 </button>
              </div>
              <div className="font-extrabold text-sm mb-1 text-gray-900">좋아요 {post.likeCount.toLocaleString()}개</div>
              <div className="text-[11px] text-gray-400 uppercase tracking-widest font-bold">
                 {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
              </div>
          </div>

          {/* 댓글 입력창 */}
          <form onSubmit={handlePostComment} className="shrink-0 p-5 border-t border-gray-50 bg-white flex items-center gap-3">
              <div className="flex-1 relative">
                 <Input 
                     value={commentText}
                     onChange={(e) => setCommentText(e.target.value)}
                     placeholder="댓글 달기..." 
                     className="border-none bg-[#FAFAFA] focus-visible:ring-2 focus-visible:ring-[#FF69B4] rounded-full px-5 h-12 text-[14px] w-full placeholder:text-gray-400 text-gray-800 shadow-inner"
                 />
                 <div className="absolute right-2 top-1/2 -translate-y-1/2">
                     <Button 
                         type="submit" 
                         variant="ghost" 
                         size="sm"
                         className={`text-[#FF69B4] font-extrabold hover:bg-[#FFF0F5] hover:text-[#FF1493] rounded-full px-4 transition-all ${!commentText.trim() ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                         disabled={createCommentMutation.isPending}
                     >
                         게시
                     </Button>
                 </div>
              </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}