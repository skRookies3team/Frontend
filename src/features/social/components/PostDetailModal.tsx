import { useState } from 'react';
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
import { Link } from 'react-router-dom';

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
    if (confirm("댓글을 삭제하시겠습니까?")) {
      deleteCommentMutation.mutate({ commentId, userId: currentUserId });
    }
  };

  const handleLike = () => {
      onLikeToggle?.(post.feedId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* 모달 컨테이너 스타일 수정:
        - md:max-w-[1200px]: 너비를 훨씬 넓게 설정
        - md:h-[90vh]: 높이를 화면의 90%로 설정하여 꽉 차게 보이게 함
      */}
      <DialogContent className="max-w-full md:max-w-[1200px] w-full p-0 gap-0 overflow-hidden h-full md:h-[90vh] flex flex-col md:flex-row bg-white border-none sm:rounded-xl z-50">
        <DialogTitle className="sr-only">게시물 상세</DialogTitle>
        
        {/* 닫기 버튼 (모바일 우측 상단) */}
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground md:hidden z-50 bg-white/50 p-1">
            <X className="h-6 w-6 text-black" />
            <span className="sr-only">Close</span>
        </DialogClose>

        {/* 1. 좌측 이미지 영역 
          - md:flex-[1.5_1_0%]: 댓글 영역보다 더 많은 공간(약 60%)을 차지하도록 설정
          - bg-black: 인스타그램처럼 배경을 검게 처리
        */}
        <div className="relative bg-black flex items-center justify-center w-full h-[45vh] md:h-full md:flex-[1.5_1_0%] overflow-hidden bg-gray-100/10">
           {post.imageUrl ? (
             <img 
               src={post.imageUrl} 
               alt="Post" 
               // w-full h-full object-contain: 검은 영역 안에 이미지가 비율을 유지하며 가득 차게 설정
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

        {/* 2. 우측 정보 및 댓글 영역
          - md:flex-1: 남은 공간을 차지
          - border-l: 이미지 영역과 구분선 추가
        */}
        <div className="flex flex-col w-full h-[55vh] md:h-full md:flex-1 bg-white border-l border-gray-100">
          
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
             <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-5 w-5" /></Button>
          </div>

          {/* 댓글 목록 (스크롤 영역) */}
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
                   <p className="text-sm leading-relaxed">
                      <Link to={`/user/${post.writerNickname}`} className="font-semibold mr-2 hover:opacity-70 transition-opacity">
                        {post.writerNickname}
                      </Link>
                      <span className="whitespace-pre-wrap">{post.content}</span>
                   </p>
                   <div className="flex gap-2 mt-2 text-sm text-blue-600">
                        {post.hashtags.map((tag, idx) => <span key={idx}>#{tag}</span>)}
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
             ) : comments?.map((comment) => (
                 <div key={comment.commentId} className="flex gap-3 mb-4 group">
                    <Link to={`/user/${comment.writerNickname}`}>
                        <Avatar className="h-8 w-8 mt-1">
                            <AvatarImage src={comment.writerProfileImage || "/placeholder-user.jpg"} />
                            <AvatarFallback>{comment.writerNickname[0]}</AvatarFallback>
                        </Avatar>
                    </Link>
                    <div className="flex-1">
                       <p className="text-sm leading-tight">
                          <Link to={`/user/${comment.writerNickname}`} className="font-semibold mr-2 hover:opacity-70 transition-opacity">
                            {comment.writerNickname}
                          </Link>
                          {comment.content}
                       </p>
                       <div className="flex items-center gap-3 mt-1.5 font-medium">
                          <span className="text-xs text-gray-400">
                             {formatDistanceToNow(new Date(comment.createdAt), { locale: ko })}
                          </span>
                          {(comment.userId === currentUserId) && (
                             <button 
                                onClick={() => handleDeleteComment(comment.commentId)}
                                className="text-xs text-gray-400 hover:text-red-500"
                             >
                                삭제
                             </button>
                          )}
                       </div>
                    </div>
                 </div>
             ))}
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
                className="border-none focus-visible:ring-0 shadow-none px-0 text-sm"
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