import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/shared/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Heart, MessageCircle, Send, MoreHorizontal, X, Bookmark } from "lucide-react";
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
  const currentUserId = Number(user?.id);

  // 댓글 관련 훅 사용
  const { data: comments, isLoading: isCommentsLoading } = useComments(post.feedId);
  const createCommentMutation = useCreateComment(post.feedId);
  const deleteCommentMutation = useDeleteComment(post.feedId);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    createCommentMutation.mutate(
      { userId: currentUserId, content: commentText },
      { onSuccess: () => setCommentText("") }
    );
  };

  const handleDeleteComment = (commentId: number) => {
    if (confirm("댓글을 삭제하시겠습니까?")) {
      deleteCommentMutation.mutate({ commentId, userId: currentUserId });
    }
  };

  const handleLike = () => {
      onLikeToggle?.(post.feedId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* 배경 오버레이 스타일 수정 및 닫기 버튼 커스텀 위치 사용 */}
      <DialogContent 
        className="max-w-full md:max-w-[1200px] w-full p-0 gap-0 overflow-hidden h-full md:h-[90vh] flex flex-col md:flex-row bg-white border-none sm:rounded-xl z-50 shadow-2xl"
        overlayClassName="bg-black/30 backdrop-blur-none" 
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">게시물 상세</DialogTitle>
        
        {/* 커스텀 닫기 버튼 (우측 상단 고정) */}
        <DialogClose className="fixed right-6 top-6 z-[60] p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors cursor-pointer">
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
        </DialogClose>

        {/* 1. 이미지 영역 */}
        <div className="relative bg-black flex items-center justify-center w-full h-[40vh] md:h-full md:flex-[1.5_1_0%] overflow-hidden bg-gray-100/10">
           {post.imageUrl ? (
             <img 
               src={post.imageUrl} 
               alt="Post" 
               className="w-full h-full object-contain" 
             />
           ) : (
             <div className="flex items-center justify-center h-full w-full bg-gradient-to-br from-pink-50 to-blue-50 p-10">
                 <p className="text-xl text-gray-800 font-medium text-center leading-relaxed whitespace-pre-wrap">
                     {post.content}
                 </p>
             </div>
           )}
        </div>

        {/* 2. 정보 및 댓글 영역 */}
        <div className="flex flex-col w-full h-[60vh] md:h-full md:flex-1 bg-white border-l border-gray-100 relative">
          
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
             <div className="flex items-center gap-3">
                <Link to={`/user/${post.writerNickname}`} className="flex items-center gap-3 group">
                    <Avatar className="h-8 w-8 ring-1 ring-gray-100 group-hover:ring-gray-300 transition-all">
                        <AvatarImage src={post.writerProfileImage || "/placeholder-user.jpg"} />
                        <AvatarFallback>{post.writerNickname[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold group-hover:opacity-70 transition-opacity">
                        {post.writerNickname}
                    </span>
                </Link>
             </div>
             <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 rounded-full">
                <MoreHorizontal className="h-5 w-5" />
             </Button>
          </div>

          {/* 댓글 목록 스크롤 영역 */}
          <ScrollArea className="flex-1 p-4">
             {/* 본문 내용 */}
             <div className="flex gap-3 mb-6">
                <Link to={`/user/${post.writerNickname}`}>
                    <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src={post.writerProfileImage || "/placeholder-user.jpg"} />
                        <AvatarFallback>{post.writerNickname[0]}</AvatarFallback>
                    </Avatar>
                </Link>
                <div className="flex-1">
                   <div className="text-sm leading-relaxed">
                      <Link to={`/user/${post.writerNickname}`} className="font-semibold mr-2 hover:opacity-70 transition-opacity">
                        {post.writerNickname}
                      </Link>
                      <span className="whitespace-pre-wrap">{post.content}</span>
                   </div>
                   <span className="text-xs text-gray-400 mt-2 block">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
                   </span>
                </div>
             </div>

             {/* 댓글 리스트 */}
             {isCommentsLoading ? (
                 <div className="flex justify-center items-center h-20">
                     <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                 </div>
             ) : (
                 <div className="space-y-4">
                    {comments?.map((comment) => (
                        <div key={comment.commentId} className="flex gap-3 group relative">
                            <Link to={`/user/${comment.writerNickname}`}>
                                <Avatar className="h-8 w-8 mt-1">
                                    <AvatarImage src={comment.writerProfileImage || "/placeholder-user.jpg"} />
                                    <AvatarFallback>{comment.writerNickname[0]}</AvatarFallback>
                                </Avatar>
                            </Link>
                            <div className="flex-1">
                                <div className="text-sm leading-tight">
                                    <Link to={`/user/${comment.writerNickname}`} className="font-semibold mr-2 hover:opacity-70 transition-opacity">
                                        {comment.writerNickname}
                                    </Link>
                                    {comment.content}
                                </div>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <span className="text-xs text-gray-400">
                                        {formatDistanceToNow(new Date(comment.createdAt), { locale: ko })}
                                    </span>
                                    {(comment.userId === currentUserId || post.userId === currentUserId) && (
                                        <button 
                                            onClick={() => handleDeleteComment(comment.commentId)}
                                            className="text-xs text-gray-400 hover:text-red-500 font-medium"
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

          {/* 하단 액션 버튼 & 좋아요 */}
          <div className="p-4 border-t border-gray-100 shrink-0 bg-white">
             <div className="flex items-center justify-between mb-2">
                <div className="flex gap-4">
                   <button onClick={handleLike} className="transition-transform active:scale-125 hover:opacity-60">
                      <Heart className={`h-6 w-6 ${post.isLiked ? "fill-red-500 text-red-500" : "text-black"}`} />
                   </button>
                   <button className="hover:opacity-60"><MessageCircle className="h-6 w-6 text-black -rotate-90" /></button>
                   <button className="hover:opacity-60"><Send className="h-6 w-6 text-black -rotate-12 mb-1" /></button>
                </div>
                <button className="hover:opacity-60">
                    <Bookmark className="h-6 w-6 text-black" />
                </button>
             </div>
             <div className="font-bold text-sm mb-1">좋아요 {post.likeCount.toLocaleString()}개</div>
             <div className="text-[10px] text-gray-400 uppercase tracking-wide">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
             </div>
          </div>

          {/* 댓글 입력창 */}
          <form onSubmit={handlePostComment} className="shrink-0 p-3 border-t border-gray-100 flex items-center gap-2 bg-white">
             <Input 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="댓글 달기..." 
                className="border-none focus-visible:ring-0 shadow-none px-0 text-sm flex-1"
             />
             <Button 
                type="submit" 
                variant="ghost" 
                className="text-blue-500 font-semibold hover:bg-transparent hover:text-blue-700 p-0 shrink-0 text-sm"
                disabled={!commentText.trim() || createCommentMutation.isPending}
             >
                게시
             </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}