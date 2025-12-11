import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { Button } from "@/shared/ui/button"
import { Card, CardContent } from "@/shared/ui/card"
import { Heart, MessageCircle, Share2, MoreHorizontal, Flag } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover"
import { Facebook, Instagram, Link as LinkIcon } from "lucide-react"
import { KakaoIcon } from "@/shared/components/icons/KakaoIcon"
import { FeedDto } from "../types/feed"

interface PostCardProps {
  post: FeedDto
  onLikeToggle?: (id: number) => void
}

export function PostCard({ post, onLikeToggle }: PostCardProps) {
  const [showFullText, setShowFullText] = useState(false)

  // FeedDto has single image, but UI supports multiple. Wrap in array if exists.
  const images = post.imageUrl ? [post.imageUrl] : []
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handleLike = () => {
    if (onLikeToggle) {
      onLikeToggle(post.feedId)
    }
  }

  const truncatedContent = post.content.length > 150 ? post.content.slice(0, 150) + "..." : post.content

  // Calculate time ago (simple version)
  const timeAgo = new Date(post.createdAt).toLocaleDateString()

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <Link to={`/user/${post.writerNickname}`} className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-border">
              <AvatarImage src={"/placeholder.svg"} alt={post.writerNickname} />
              <AvatarFallback>{post.writerNickname[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground hover:underline">{post.writerNickname}</p>
                {post.petName && (
                  <>
                    <span className="text-muted-foreground">with</span>
                    <p className="font-medium text-primary">{post.petName}</p>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem>
                <Flag className="mr-2 h-4 w-4" />
                게시물 신고
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <div className="px-4 pb-3">
          <p className="text-pretty text-foreground">
            {showFullText ? post.content : truncatedContent}
            {post.content.length > 150 && (
              <button
                onClick={() => setShowFullText(!showFullText)}
                className="ml-2 text-sm font-medium text-foreground hover:underline"
              >
                {showFullText ? "접기" : "더보기"}
              </button>
            )}
          </p>
        </div>

        {/* Images */}
        {images.length > 0 && (
          <div className="relative">
            <img
              src={images[currentImageIndex] || "/placeholder.svg"}
              alt="Post image"
              className="aspect-[4/3] w-full object-cover"
            />

            {images.length > 1 && (
              <>
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-1.5 rounded-full transition-all ${index === currentImageIndex ? "w-6 bg-white" : "w-1.5 bg-white/60"
                        }`}
                    />
                  ))}
                </div>

                {currentImageIndex > 0 && (
                  <button
                    onClick={() => setCurrentImageIndex(currentImageIndex - 1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                  >
                    ‹
                  </button>
                )}

                {currentImageIndex < images.length - 1 && (
                  <button
                    onClick={() => setCurrentImageIndex(currentImageIndex + 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                  >
                    ›
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <button onClick={handleLike} className="flex items-center gap-2 transition-colors">
              <Heart
                className={`h-6 w-6 transition-all ${post.isLiked ? "fill-pink-500 text-pink-500" : "text-muted-foreground hover:text-pink-500"
                  }`}
              />
              <span className={`text-sm font-medium ${post.isLiked ? "text-pink-500" : "text-foreground"}`}>{post.likeCount}</span>
            </button>

            <button className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary">
              <MessageCircle className="h-6 w-6" />
              <span className="text-sm font-medium text-foreground">{post.commentCount}</span>
            </button>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <button className="text-muted-foreground transition-colors hover:text-primary">
                <Share2 className="h-6 w-6" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="end">
              <div className="flex gap-2">
                {[
                  { icon: Facebook, label: "Facebook", color: "hover:bg-[#1877F2]", text: "group-hover:text-white" },
                  { icon: KakaoIcon, label: "카카오톡", color: "hover:bg-[#FEE500]", text: "group-hover:text-[#3C1E1E]" },
                  { icon: Instagram, label: "Instagram", color: "hover:bg-[#E4405F]", text: "group-hover:text-white" },
                  { icon: LinkIcon, label: "Copy Link", color: "hover:bg-slate-800", text: "group-hover:text-white" },
                ].map((social, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (social.label === "Copy Link") {
                        navigator.clipboard.writeText(window.location.href);
                        alert("링크가 복사되었습니다!");
                      } else {
                        alert(`${social.label} 공유 기능은 준비 중입니다.`);
                      }
                    }}
                    className={`group relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${social.color}`}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 transition-all duration-300 group-hover:opacity-100 pointer-events-none z-50">
                      <div className={`whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-bold text-white shadow-sm ${social.color.replace('hover:', '')}`}>
                        {social.label}
                      </div>
                      <div className={`absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-${social.color.replace('hover:bg-', '')}`} />
                    </div>

                    <social.icon className={`h-4 w-4 text-slate-600 transition-colors duration-300 ${social.text}`} />
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  )
}