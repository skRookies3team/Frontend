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
}

export function PostCard({ post, onLikeToggle }: PostCardProps) {
  const [showFullText, setShowFullText] = useState(false)
  const images = post.imageUrl ? [post.imageUrl] : [] 

  // 좋아요 핸들러
  const handleLike = () => {
    if (onLikeToggle) onLikeToggle(post.feedId);
  }

  return (
    // 인스타그램 스타일의 깔끔한 카드 디자인 (경계선 제거, 그림자 최소화)
    <Card className="border-b border-gray-100 shadow-none rounded-none md:rounded-xl md:border md:mb-6">
      <CardContent className="p-0">
        
        {/* 1. Header: 작성자 정보 */}
        <div className="flex items-center justify-between p-3">
          <Link to={`/user/${post.writerNickname}`} className="flex items-center gap-3">
            <Avatar className="h-8 w-8 border border-gray-200">
              <AvatarImage src={"/placeholder.svg"} alt={post.writerNickname} />
              <AvatarFallback className="text-xs">{post.writerNickname[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900 leading-none">{post.writerNickname}</span>
                {post.location && <span className="text-xs text-gray-500 mt-0.5">{post.location}</span>}
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-5 w-5 text-gray-600" />
          </Button>
        </div>

        {/* 2. Image: 게시물 사진 */}
        {images.length > 0 ? (
          <div className="relative aspect-square bg-gray-100 overflow-hidden">
            <img 
                src={images[0] || "/placeholder.svg"} 
                alt="Post Content" 
                className="h-full w-full object-cover" 
            />
          </div>
        ) : (
            // 이미지가 없는 글일 경우 텍스트 강조 영역 (옵션)
            <div className="p-6 bg-pink-50 min-h-[200px] flex items-center justify-center text-center">
                <p className="text-gray-700 font-medium">{post.content}</p>
            </div>
        )}

        {/* 3. Actions: 좋아요/댓글/공유 버튼 */}
        <div className="p-3">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                    <button onClick={handleLike} className="transition-transform active:scale-110">
                        <Heart className={`h-6 w-6 ${post.isLiked ? "fill-red-500 text-red-500" : "text-gray-900 hover:text-gray-600"}`} />
                    </button>
                    <button className="transition-transform active:scale-110">
                        <MessageCircle className="h-6 w-6 text-gray-900 hover:text-gray-600" />
                    </button>
                    <button className="transition-transform active:scale-110">
                        <Send className="h-6 w-6 text-gray-900 hover:text-gray-600 -rotate-45 mb-1" />
                    </button>
                </div>
                <button>
                    <Bookmark className="h-6 w-6 text-gray-900 hover:text-gray-600" />
                </button>
            </div>

            {/* 좋아요 수 표시 */}
            <div className="mb-2">
                <span className="text-sm font-semibold text-gray-900">좋아요 {post.likeCount.toLocaleString()}개</span>
            </div>

            {/* 4. Content: 본문 내용 */}
            <div className="mb-1">
                <span className="text-sm font-semibold mr-2">{post.writerNickname}</span>
                <span className="text-sm text-gray-800 whitespace-pre-wrap">
                    {showFullText || post.content.length <= 100 ? post.content : `${post.content.slice(0, 100)}...`}
                </span>
                {post.content.length > 100 && (
                    <button 
                        onClick={() => setShowFullText(!showFullText)} 
                        className="text-sm text-gray-500 ml-1 hover:text-gray-900"
                    >
                        {showFullText ? "" : "더 보기"}
                    </button>
                )}
            </div>

            {/* 해시태그 */}
            {post.hashtags && post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                    {post.hashtags.map((tag, idx) => (
                        <span key={idx} className="text-sm text-blue-600 hover:underline cursor-pointer">#{tag}</span>
                    ))}
                </div>
            )}

            {/* 댓글 미리보기 */}
            {post.commentCount > 0 && (
                <button className="text-sm text-gray-500 mb-1 font-normal hover:text-gray-900">
                    댓글 {post.commentCount}개 모두 보기
                </button>
            )}

            {/* 작성 시간 */}
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
            </p>
        </div>
      </CardContent>
    </Card>
  )
}