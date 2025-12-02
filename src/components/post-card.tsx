import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, MessageCircle, Share2, MoreHorizontal, Flag } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface PostCardProps {
  post: {
    id: string
    user: {
      name: string
      avatar: string
    }
    pet?: {
      name: string
      avatar: string
    }
    content: string
    images: string[]
    likes: number
    comments: number
    timeAgo: string
    isLiked: boolean
  }
  onLikeToggle?: (id: string, isLiked: boolean) => void
}

export function PostCard({ post, onLikeToggle }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [likes, setLikes] = useState(post.likes)
  const [showFullText, setShowFullText] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Mock userId based on post id for demo
  const userId = post.id

  // Sync state with props when they change (for parent-controlled updates)
  useEffect(() => {
    setIsLiked(post.isLiked)
    setLikes(post.likes)
  }, [post.isLiked, post.likes])

  const handleLike = () => {
    const newIsLiked = !isLiked
    const newLikes = newIsLiked ? likes + 1 : likes - 1

    setLikes(newLikes)
    setIsLiked(newIsLiked)

    if (onLikeToggle) {
      onLikeToggle(post.id, newIsLiked)
    }
  }

  const truncatedContent = post.content.length > 150 ? post.content.slice(0, 150) + "..." : post.content

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <Link to={`/user/${userId}`} className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-border">
              <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.name} />
              <AvatarFallback>{post.user.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground hover:underline">{post.user.name}</p>
                {post.pet && (
                  <>
                    <span className="text-muted-foreground">with</span>
                    <p className="font-medium text-primary">{post.pet.name}</p>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{post.timeAgo}</p>
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
        {post.images.length > 0 && (
          <div className="relative">
            <img
              src={post.images[currentImageIndex] || "/placeholder.svg"}
              alt="Post image"
              className="aspect-[4/3] w-full object-cover"
            />

            {post.images.length > 1 && (
              <>
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {post.images.map((_, index) => (
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

                {currentImageIndex < post.images.length - 1 && (
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
                className={`h-6 w-6 transition-all ${isLiked ? "fill-pink-500 text-pink-500" : "text-muted-foreground hover:text-pink-500"
                  }`}
              />
              <span className={`text-sm font-medium ${isLiked ? "text-pink-500" : "text-foreground"}`}>{likes}</span>
            </button>

            <button className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary">
              <MessageCircle className="h-6 w-6" />
              <span className="text-sm font-medium text-foreground">{post.comments}</span>
            </button>
          </div>

          <button className="text-muted-foreground transition-colors hover:text-primary">
            <Share2 className="h-6 w-6" />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}