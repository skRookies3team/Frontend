import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog"; // DialogClose 제거
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Heart, MessageCircle, MoreHorizontal, X, ChevronLeft, ChevronRight, CornerDownRight } from "lucide-react";
import { FeedDto, CommentDto } from "../types/feed";
import { useAuth } from "@/features/auth/context/auth-context";
import { useComments, useCreateComment, useDeleteComment } from "../hooks/use-comment-query";
import { FEED_KEYS } from "../hooks/use-feed-query"; 
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { feedApi } from "../api/feed-api";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";

interface PostDetailModalProps {
  post: FeedDto;
  isOpen: boolean;
  onClose: () => void;
  onLikeToggle?: (id: number) => void;
}

// --- [댓글 아이템 컴포넌트] ---
function CommentItem({ 
  comment, 
  currentUserId, 
  onDelete, 
  onUpdate,
  onReply 
}: { 
  comment: CommentDto, 
  currentUserId: number, 
  onDelete: (id: number) => void,
  onUpdate: (id: number, content: string) => void,
  onReply: (id: number, nickname: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const isReply = !!comment.parentId;

  const handleUpdate = () => {
    if (!editContent.trim()) return;
    onUpdate(comment.commentId, editContent);
    setIsEditing(false);
  };

  return (
    <div className={`flex gap-3 group items-start ${isReply ? "ml-12 mt-2" : "mt-4"}`}>
        {isReply && <CornerDownRight className="w-4 h-4 text-gray-300 mt-2 shrink-0" />}

        <Link to={`/user/${comment.writerId}`} className="shrink-0">
            <Avatar className="h-8 w-8 mt-1">
                <AvatarImage src={comment.writerProfileImage || "/placeholder-user.jpg"} />
                <AvatarFallback className="bg-gray-50 text-gray-500 text-xs">{comment.writerNickname[0]}</AvatarFallback>
            </Avatar>
        </Link>
        <div className="flex-1">
            <div className="text-[14px] leading-relaxed">
                <Link to={`/user/${comment.writerId}`} className="font-bold mr-2 text-gray-900 hover:text-[#FF69B4] transition-colors">
                    {comment.writerNickname}
                </Link>
                
                {isEditing ? (
                   <div className="flex gap-2 mt-1">
                      <Input 
                         value={editContent} 
                         onChange={(e) => setEditContent(e.target.value)} 
                         className="h-8 text-xs bg-gray-50 border-gray-200" 
                         autoFocus
                      />
                      <Button size="sm" onClick={handleUpdate} className="h-8 text-xs bg-[#FF69B4] hover:bg-[#FF1493]">완료</Button>
                      <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="h-8 text-xs">취소</Button>
                   </div>
                ) : (
                   <span className="text-gray-700">{comment.content}</span>
                )}
            </div>
            
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400 font-medium">
                <span>{formatDistanceToNow(new Date(comment.createdAt), { locale: ko })}</span>
                
                {!isEditing && !isReply && (
                    <button 
                        onClick={() => onReply(comment.commentId, comment.writerNickname)}
                        className="hover:text-gray-600 font-bold transition-colors cursor-pointer"
                    >
                        답글 달기
                    </button>
                )}

                {(comment.writerId === currentUserId) && !isEditing && (
                    <>
                      <button onClick={() => setIsEditing(true)} className="hover:text-gray-600 font-bold opacity-0 group-hover:opacity-100 transition-all">수정</button>
                      <button onClick={() => onDelete(comment.commentId)} className="hover:text-red-500 font-bold opacity-0 group-hover:opacity-100 transition-all">삭제</button>
                    </>
                )}
            </div>
        </div>
    </div>
  );
}

// --- [상세 모달 메인 컴포넌트] ---
export function PostDetailModal({ post: initialPost, isOpen, onClose }: PostDetailModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const currentUserId = Number(user?.id);
  const inputRef = useRef<HTMLInputElement>(null);

  const [replyTarget, setReplyTarget] = useState<{ id: number; nickname: string } | null>(null);

  const { data: post } = useQuery({
    queryKey: FEED_KEYS.detail(initialPost.feedId), 
    queryFn: () => feedApi.getFeedDetail(initialPost.feedId, currentUserId),
    initialData: initialPost,
    enabled: isOpen && !!currentUserId,
  });

  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);

  useEffect(() => {
    setIsLiked(post.isLiked);
    setLikeCount(post.likeCount);
  }, [post]);

  const { data: comments, isLoading: isCommentsLoading } = useComments(post.feedId);
  const createCommentMutation = useCreateComment(post.feedId);
  const deleteCommentMutation = useDeleteComment(post.feedId);

  const likeMutation = useMutation({
    mutationFn: () => feedApi.toggleLike(post.feedId, currentUserId),
    onMutate: async () => {
      const prevLiked = isLiked;
      const prevCount = likeCount;
      setIsLiked(!prevLiked);
      setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);
      return { prevLiked, prevCount };
    },
    onError: (_err, _vars, context) => {
      if (context) {
        setIsLiked(context.prevLiked);
        setLikeCount(context.prevCount);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEED_KEYS.all });
      queryClient.invalidateQueries({ queryKey: FEED_KEYS.detail(post.feedId) });
    }
  });

  const images = post.imageUrls || [];
  const hasMultipleImages = images.length > 1;

  const handlePrevClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleReplyClick = (commentId: number, nickname: string) => {
    setReplyTarget({ id: commentId, nickname });
    inputRef.current?.focus();
  };

  const handleCancelReply = () => {
    setReplyTarget(null);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    createCommentMutation.mutate(
      { 
          userId: currentUserId, 
          content: commentText,
          parentId: replyTarget ? replyTarget.id : null 
      },
      { 
          onSuccess: () => {
              setCommentText("");
              setReplyTarget(null);
          } 
      }
    );
  };

  const handleDeleteComment = (commentId: number) => {
    if (confirm("정말 이 댓글을 삭제할까요? 🥺")) {
      deleteCommentMutation.mutate({ commentId, userId: currentUserId });
    }
  };

  const handleUpdateComment = async (commentId: number, newContent: string) => {
      try {
        await feedApi.updateComment(commentId, { userId: currentUserId, content: newContent });
        queryClient.invalidateQueries({ queryKey: ['comments', post.feedId] });
      } catch (e) {
        console.error(e);
        alert("댓글 수정에 실패했습니다.");
      }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-full md:max-w-[1200px] w-full p-0 gap-0 overflow-hidden h-full md:h-[90vh] flex flex-col md:flex-row bg-white border-none sm:rounded-[2.5rem] z-50 shadow-2xl transition-all"
        overlayClassName="bg-black/20 backdrop-blur-sm" 
        showCloseButton={false} // 기본 닫기 버튼 숨김
      >
        <DialogTitle className="sr-only">게시물 상세</DialogTitle>
        {/* [삭제] 기존의 fixed DialogClose 제거됨 */}

        {/* 왼쪽: 이미지 영역 */}
        <div className="relative bg-black flex items-center justify-center w-full h-[45vh] md:h-full md:flex-[1.5_1_0%] overflow-hidden border-r border-[#FFF0F5] group">
           {images.length > 0 ? (
             <>
               <img src={images[currentImageIndex]} alt={`Post-${currentImageIndex}`} className="w-full h-full object-contain"/>
               {hasMultipleImages && (
                 <>
                   <button onClick={handlePrevClick} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/20 text-white rounded-full hover:bg-white/40 transition-all backdrop-blur-sm z-10">
                     <ChevronLeft className="w-6 h-6" />
                   </button>
                   <button onClick={handleNextClick} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/20 text-white rounded-full hover:bg-white/40 transition-all backdrop-blur-sm z-10">
                     <ChevronRight className="w-6 h-6" />
                   </button>
                   <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 p-2 rounded-full bg-black/20 backdrop-blur-sm">
                     {images.map((_, idx) => (
                       <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? "bg-white w-4" : "bg-white/50 w-1.5 hover:bg-white/80"}`} />
                     ))}
                   </div>
                 </>
               )}
             </>
           ) : (
             <div className="flex items-center justify-center h-full w-full p-10 bg-[#FFF9FB]">
                 <p className="text-2xl text-gray-800 font-bold text-center leading-relaxed whitespace-pre-wrap font-sans">{post.content}</p>
             </div>
           )}
        </div>

        {/* 오른쪽: 정보 및 댓글 영역 */}
        <div className="flex flex-col w-full h-[55vh] md:h-full md:flex-1 bg-white relative">
          
          {/* 헤더 */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50 shrink-0">
             <div className="flex items-center gap-4">
                <Link to={`/user/${post.writerId}`} className="flex items-center gap-3 group">
                    <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-[#FF69B4] transition-all">
                        <AvatarImage src={post.writerProfileImage || "/placeholder-user.jpg"} />
                        <AvatarFallback className="bg-[#FFF0F5] text-[#FF69B4] font-bold">{post.writerNickname[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-[15px] font-bold text-gray-900 group-hover:text-[#FF69B4] transition-colors">{post.writerNickname}</span>
                </Link>
             </div>
             {/* [수정] 오른쪽 상단에 옵션 버튼과 닫기 버튼 배치 */}
             <div className="flex items-center gap-2">
               <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-[#FFF0F5] rounded-full text-gray-400 hover:text-[#FF69B4] transition-colors">
                 <MoreHorizontal className="h-6 w-6" />
               </Button>
               {/* 닫기 버튼 추가 */}
               <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9 hover:bg-[#FFF0F5] rounded-full text-gray-400 hover:text-[#FF69B4] transition-colors">
                 <X className="h-6 w-6" />
               </Button>
             </div>
          </div>

          {/* 댓글 목록 */}
          <ScrollArea className="flex-1 p-6">
              <div className="flex gap-4 mb-8">
                <Link to={`/user/${post.writerId}`} className="shrink-0">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={post.writerProfileImage || "/placeholder-user.jpg"} />
                        <AvatarFallback className="bg-[#FFF0F5] text-[#FF69B4] font-bold">{post.writerNickname[0]}</AvatarFallback>
                    </Avatar>
                </Link>
                <div className="flex-1 space-y-1.5">
                    <div className="text-[15px] leading-relaxed">
                      <Link to={`/user/${post.writerId}`} className="font-bold mr-2 hover:underline decoration-[#FF69B4] decoration-2 underline-offset-2 text-gray-900">{post.writerNickname}</Link>
                      <span className="text-gray-800 whitespace-pre-wrap">{post.content}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-medium block mt-1">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
                    </span>
                </div>
              </div>

              {isCommentsLoading ? (
                  <div className="flex justify-center items-center h-20">
                      <div className="animate-pulse flex gap-2">
                          <div className="h-2.5 w-2.5 bg-[#FF69B4]/30 rounded-full animate-bounce"></div>
                          <div className="h-2.5 w-2.5 bg-[#FF69B4]/30 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="h-2.5 w-2.5 bg-[#FF69B4]/30 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      </div>
                  </div>
              ) : (
                  <div className="space-y-4">
                      {comments?.map((parentComment) => (
                          <div key={parentComment.commentId}>
                             <CommentItem 
                                comment={parentComment} 
                                currentUserId={currentUserId}
                                onDelete={handleDeleteComment}
                                onUpdate={handleUpdateComment}
                                onReply={handleReplyClick}
                             />
                             {parentComment.children && parentComment.children.length > 0 && (
                                 <div className="flex flex-col">
                                     {parentComment.children.map((childComment) => (
                                       <CommentItem 
                                          key={childComment.commentId} 
                                          comment={childComment} 
                                          currentUserId={currentUserId}
                                          onDelete={handleDeleteComment}
                                          onUpdate={handleUpdateComment}
                                          onReply={handleReplyClick}
                                       />
                                     ))}
                                 </div>
                             )}
                          </div>
                      ))}
                  </div>
              )}
          </ScrollArea>

          {/* 하단 액션 버튼 */}
          <div className="p-5 border-t border-gray-50 bg-white">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex gap-5">
                    <button onClick={() => likeMutation.mutate()} className="group transition-transform active:scale-90 focus:outline-none">
                        <Heart className={`h-[28px] w-[28px] transition-colors duration-200 ${isLiked ? "fill-red-600 text-red-600" : "text-gray-800 group-hover:text-red-600"}`} />
                    </button>
                    <button className="hover:opacity-60 transition-opacity"><MessageCircle className="h-[28px] w-[28px] text-gray-800 -rotate-90 group-hover:text-[#FF69B4]" /></button>
                 </div>
              </div>
              <div className="font-extrabold text-sm mb-1 text-gray-900">좋아요 {likeCount.toLocaleString()}개</div>
              <div className="text-[11px] text-gray-400 uppercase tracking-widest font-bold">
                 {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
              </div>
          </div>

          {replyTarget && (
            <div className="px-5 py-2 bg-gray-50 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 animate-in slide-in-from-bottom-2 fade-in duration-200">
                <span>
                    <span className="font-bold text-[#FF69B4]">@{replyTarget.nickname}</span> 님에게 답글 남기는 중...
                </span>
                <button onClick={handleCancelReply} className="text-gray-400 hover:text-gray-600 p-1">
                    <X className="h-4 w-4" />
                </button>
            </div>
          )}

          <form onSubmit={handlePostComment} className="shrink-0 p-5 border-t border-gray-50 bg-white flex items-center gap-3">
              <div className="flex-1 relative">
                  <Input 
                      ref={inputRef}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={replyTarget ? "답글을 입력하세요..." : "댓글 달기..."}
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