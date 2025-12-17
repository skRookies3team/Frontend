import { useState } from "react"
import { Link } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { Button } from "@/shared/ui/button"
import { Card, CardContent } from "@/shared/ui/card"
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react"
import { FeedDto } from "../types/feed"
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface PostCardProps {
  post: FeedDto
  onLikeToggle?: (id: number) => void
  onClickPost?: (post: FeedDto) => void
}

export function PostCard({ post, onLikeToggle, onClickPost }: PostCardProps) {
  const [showFullText, setShowFullText] = useState(false)
  const images = post.imageUrl ? [post.imageUrl] : [] 

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onLikeToggle) onLikeToggle(post.feedId)
  }

  return (
    <Card className="border-b border-gray-200 shadow-none rounded-none md:rounded-lg md:border md:mb-8 overflow-hidden bg-white">
      <CardContent className="p-0">
        
        {/* 1. Header: 작성자 프로필 */}
        <div className="flex items-center justify-between p-3">
          <Link to={`/user/${post.writerNickname}`} className="flex items-center gap-3">
            {/* 인스타그램 스타일: 프로필 링(테두리) 추가 */}
            <div className="rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]">
                <div className="rounded-full bg-white p-[2px]">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={"/placeholder-user.jpg"} alt={post.writerNickname} />
                        <AvatarFallback className="text-xs">{post.writerNickname[0]}</AvatarFallback>
                    </Avatar>
                </div>
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900 leading-tight hover:opacity-70 transition-opacity">
                    {post.writerNickname}
                </span>
                {post.location && <span className="text-xs text-gray-500">{post.location}</span>}
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>

        {/* 2. Image: 게시물 사진 (1:1 비율 유지 및 클릭 이벤트) */}
        {images.length > 0 ? (
          <div 
            className="relative w-full aspect-square bg-gray-100 overflow-hidden cursor-pointer"
            onClick={() => onClickPost?.(post)}
          >
            <img 
                src={images[0]} 
                alt="Post" 
                className="h-full w-full object-cover transition-opacity hover:opacity-95" 
            />
          </div>
        ) : (
            // 텍스트만 있는 경우
            <div 
                className="p-10 bg-gradient-to-br from-pink-50 to-blue-50 aspect-square flex items-center justify-center text-center cursor-pointer"
                onClick={() => onClickPost?.(post)}
            >
                <p className="text-gray-800 font-medium whitespace-pre-wrap text-lg leading-relaxed">
                    {post.content}
                </p>
            </div>
        )}

        {/* 3. Actions & Content */}
        <div className="p-3 pb-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                    <button onClick={handleLike} className="transition-transform active:scale-125 hover:opacity-60">
                        <Heart className={`h-6 w-6 ${post.isLiked ? "fill-red-500 text-red-500" : "text-black"}`} />
                    </button>
                    <button onClick={() => onClickPost?.(post)} className="transition-transform active:scale-125 hover:opacity-60">
                        <MessageCircle className="h-6 w-6 text-black -rotate-90" />
                    </button>
                    <button className="transition-transform active:scale-125 hover:opacity-60">
                        <Send className="h-6 w-6 text-black -rotate-12 mb-1" />
                    </button>
                </div>
                <button className="hover:opacity-60">
                    <Bookmark className="h-6 w-6 text-black" />
                </button>
            </div>

            {/* 좋아요 수 */}
            <div className="mb-2">
                <span className="text-sm font-bold text-gray-900">좋아요 {post.likeCount.toLocaleString()}개</span>
            </div>

            {/* 본문 (캡션) */}
            <div className="mb-2">
                <span className="text-sm font-bold mr-2">{post.writerNickname}</span>
                <span className="text-sm text-gray-900 whitespace-pre-wrap">
                    {showFullText || post.content.length <= 60 ? post.content : `${post.content.slice(0, 60)}...`}
                </span>
                {post.content.length > 60 && (
                    <button 
                        onClick={() => setShowFullText(!showFullText)} 
                        className="text-sm text-gray-500 ml-1 hover:text-gray-900"
                    >
                        {showFullText ? "접기" : "더 보기"}
                    </button>
                )}
            </div>

            {/* 댓글 보기 링크 */}
            {post.commentCount > 0 && (
                <button 
                    onClick={() => onClickPost?.(post)}
                    className="text-sm text-gray-500 mb-1 font-normal cursor-pointer hover:text-gray-800"
                >
                    댓글 {post.commentCount}개 모두 보기
                </button>
            )}

            {/* 작성 시간 */}
            <p className="text-[10px] text-gray-400 uppercase mt-1">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
            </p>
        </div>
      </CardContent>
    </Card>
  )
}