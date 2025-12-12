import { useState } from "react"
import { Link } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { Button } from "@/shared/ui/button"
import { Card, CardContent } from "@/shared/ui/card"
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react"
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

  return (
    <Card className="overflow-hidden border-0 shadow-sm transition-shadow hover:shadow-md bg-white/80">
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4">
          <Link to={`/user/${post.writerNickname}`} className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarImage src={"/placeholder.svg"} alt={post.writerNickname} />
              <AvatarFallback>{post.writerNickname[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">{post.writerNickname}</p>
                {post.petName && <span className="text-xs text-muted-foreground">with {post.petName}</span>}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
              </p>
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>

        <div className="px-4 pb-3">
          <p className="text-pretty text-foreground text-sm">
            {showFullText || post.content.length <= 150 ? post.content : `${post.content.slice(0, 150)}...`}
            {post.content.length > 150 && (
              <button onClick={() => setShowFullText(!showFullText)} className="ml-1 text-muted-foreground hover:text-primary">
                {showFullText ? "접기" : "더보기"}
              </button>
            )}
          </p>
        </div>

        {images.length > 0 && (
          <div className="relative aspect-square bg-gray-100">
            <img src={images[0] || "/placeholder.svg"} alt="Post" className="h-full w-full object-cover" />
          </div>
        )}

        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <button onClick={() => onLikeToggle?.(post.feedId)} className="flex items-center gap-1.5 transition-colors">
              <Heart className={`h-6 w-6 ${post.isLiked ? "fill-rose-500 text-rose-500" : "text-muted-foreground hover:text-rose-500"}`} />
              <span className={`text-sm font-medium ${post.isLiked ? "text-rose-500" : "text-muted-foreground"}`}>{post.likeCount}</span>
            </button>
            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary">
              <MessageCircle className="h-6 w-6" />
              <span className="text-sm font-medium">{post.commentCount}</span>
            </button>
          </div>
          <button className="text-muted-foreground hover:text-primary"><Share2 className="h-6 w-6" /></button>
        </div>
      </CardContent>
    </Card>
  )
}