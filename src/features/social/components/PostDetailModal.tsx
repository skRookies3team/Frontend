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
        className="max-w-full md:max-w-[1100px] w-full p-0 gap-0 overflow-hidden h-full md:h-[85vh] flex flex-col md:flex-row bg-white border-none sm:rounded-[2.5rem] z-50 shadow-2xl transition-all"
        overlayClassName="bg-black/40 backdrop-blur-sm" 
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">게시물 상세</DialogTitle>
        
        {/* 닫기 버튼 - 핑크빛 호버 효과 */}
        <DialogClose className="fixed right-6 top-6 z-[60] p-2.5 rounded-full bg-black/10 hover:bg-rose-500 hover:text-white text-white/90 transition-all cursor-pointer backdrop-blur-md">
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
        </DialogClose>

        {/* 1. 이미지 영역 (왼쪽) */}
        <div className="relative bg-rose-50/20 flex items-center justify-center w-full h-[45vh] md:h-full md:flex-[1.4_1_0%] overflow-hidden">
           {post.imageUrl ? (
             <img 
               src={post.imageUrl} 
               alt="Post" 
               className="w-full h-full object-cover" 
             />
           ) : (
             <div className="flex items-center justify-center h-full w-full bg-gradient-to-br from-rose-50 via-white to-rose-50 p-10">
                 <p className="text-xl text-gray-700 font-medium text-center leading-relaxed whitespace-pre-wrap">
                     {post.content}
                 </p>
             </div>
           )}
        </div>

        {/* 2. 정보 및 댓글 영역 (오른쪽) */}
        <div className="flex flex-col w-full h-[55vh] md:h-full md:flex-1 bg-white relative">
          
          {/* 헤더 */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-rose-50 shrink-0">
             <div className="flex items-center gap-3">
                <Link to={`/user/${post.writerNickname}`} className="flex items-center gap-3 group">
                    <Avatar className="h-9 w-9 ring-2 ring-transparent group-hover:ring-rose-200 transition-all">
                        <AvatarImage src={post.writerProfileImage || "/placeholder-user.jpg"} />
                        <AvatarFallback className="bg-rose-100 text-rose-500">{post.writerNickname[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-bold text-gray-900 group-hover:text-rose-500 transition-colors">
                        {post.writerNickname}
                    </span>
                </Link>
             </div>
             <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-rose-50 rounded-full text-gray-400 hover:text-rose-500 transition-colors">
                <MoreHorizontal className="h-5 w-5" />
             </Button>
          </div>

          {/* 댓글 목록 */}
          <ScrollArea className="flex-1 p-5">
             {/* 본문 내용 */}
             <div className="flex gap-4 mb-6">
                <Link to={`/user/${post.writerNickname}`} className="shrink-0">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={post.writerProfileImage || "/placeholder-user.jpg"} />
                        <AvatarFallback>{post.writerNickname[0]}</AvatarFallback>
                    </Avatar>
                </Link>
                <div className="flex-1 space-y-1">
                   <div className="text-sm leading-relaxed">
                      <Link to={`/user/${post.writerNickname}`} className="font-bold mr-2 hover:underline decoration-rose-300 decoration-2 underline-offset-2">
                        {post.writerNickname}
                      </Link>
                      <span className="text-gray-800 whitespace-pre-wrap">{post.content}</span>
                   </div>
                   <span className="text-xs text-gray-400 font-medium">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
                   </span>
                </div>
             </div>

             {/* 댓글 리스트 */}
             {isCommentsLoading ? (
                 <div className="flex justify-center items-center h-20">
                     <div className="animate-pulse flex gap-2">
                        <div className="h-2 w-2 bg-rose-200 rounded-full animate-bounce"></div>
                        <div className="h-2 w-2 bg-rose-200 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="h-2 w-2 bg-rose-200 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                     </div>
                 </div>
             ) : (
                 <div className="space-y-5">
                    {comments?.map((comment) => (
                        <div key={comment.commentId} className="flex gap-3 group">
                            <Link to={`/user/${comment.writerNickname}`} className="shrink-0">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={comment.writerProfileImage || "/placeholder-user.jpg"} />
                                    <AvatarFallback>{comment.writerNickname[0]}</AvatarFallback>
                                </Avatar>
                            </Link>
                            <div className="flex-1">
                                <div className="text-sm leading-tight">
                                    <Link to={`/user/${comment.writerNickname}`} className="font-bold mr-2 text-gray-900 hover:text-rose-500 transition-colors">
                                        {comment.writerNickname}
                                    </Link>
                                    <span className="text-gray-700">{comment.content}</span>
                                </div>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <span className="text-xs text-gray-400">
                                        {formatDistanceToNow(new Date(comment.createdAt), { locale: ko })}
                                    </span>
                                    {/* 수정: post.writerId 사용 */}
                                    {(comment.userId === currentUserId || post.writerId === currentUserId) && (
                                        <button 
                                            onClick={() => handleDeleteComment(comment.commentId)}
                                            className="text-xs text-gray-400 hover:text-rose-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
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
          <div className="p-4 border-t border-rose-50 bg-white">
             <div className="flex items-center justify-between mb-3">
                <div className="flex gap-4">
                   <button onClick={handleLike} className="group transition-transform active:scale-90 focus:outline-none">
                      <Heart className={`h-7 w-7 transition-colors duration-300 ${post.isLiked ? "fill-rose-500 text-rose-500" : "text-gray-800 group-hover:text-rose-400"}`} />
                   </button>
                   <button className="hover:opacity-60 transition-opacity"><MessageCircle className="h-7 w-7 text-gray-800 -rotate-90 group-hover:text-rose-400" /></button>
                   <button className="hover:opacity-60 transition-opacity"><Send className="h-7 w-7 text-gray-800 -rotate-12 mb-1 group-hover:text-rose-400" /></button>
                </div>
                <button className="hover:opacity-60 transition-opacity">
                    <Bookmark className="h-7 w-7 text-gray-800 group-hover:text-rose-400" />
                </button>
             </div>
             <div className="font-bold text-sm mb-1 text-gray-900">좋아요 {post.likeCount.toLocaleString()}개</div>
             <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
             </div>
          </div>

          {/* 댓글 입력창 (둥글게 수정) */}
          <form onSubmit={handlePostComment} className="shrink-0 p-4 border-t border-rose-50 bg-white flex items-center gap-3">
             <div className="flex-1 relative">
                <Input 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="댓글 달기..." 
                    className="border-none bg-rose-50/50 focus-visible:ring-0 rounded-full px-4 h-10 text-sm w-full placeholder:text-rose-300/70 text-gray-800"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Button 
                        type="submit" 
                        variant="ghost" 
                        size="sm"
                        className={`text-rose-500 font-bold hover:bg-transparent hover:text-rose-600 transition-all ${!commentText.trim() ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
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
}x