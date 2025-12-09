import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { TabNavigation } from "@/shared/components/tab-navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { Button } from "@/shared/ui/button"
import { Card, CardContent } from "@/shared/ui/card"
import { ArrowLeft, MoreHorizontal, Heart, MessageCircle, Grid, BookOpen } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"

// Mock user data
const MOCK_USERS: Record<
  string,
  {
    id: string
    name: string
    username: string
    avatar: string
    bio: string
    posts: number
    followers: number
    following: number
    isFollowing: boolean
    pets: Array<{ name: string; breed: string; avatar: string }>
    userPosts: Array<{ id: string; image: string; likes: number; comments: number }>
  }
> = {
  "1": {
    id: "1",
    name: "최유진",
    username: "@yujin_choi",
    avatar: "/diverse-woman-avatar.png",
    bio: "🐕 골든 리트리버 맥스와 함께하는 일상 💕\n서울 강남구 | 반려동물 사진작가\n#멍스타그램 #반려견일상",
    posts: 142,
    followers: 1200,
    following: 387,
    isFollowing: false,
    pets: [
      { name: "맥스", breed: "골든 리트리버", avatar: "/golden-retriever.png" },
      { name: "루시", breed: "포메라니안", avatar: "/pomeranian.png" },
    ],
    userPosts: [
      { id: "1", image: "/golden-retriever-playing-park.jpg", likes: 89, comments: 12 },
      { id: "2", image: "/dog-running-grass.jpg", likes: 124, comments: 18 },
      { id: "3", image: "/pomeranian.jpg", likes: 67, comments: 9 },
      { id: "4", image: "/corgi.jpg", likes: 95, comments: 14 },
      { id: "5", image: "/dog-birthday-party.png", likes: 156, comments: 24 },
      { id: "6", image: "/tabby-cat-sunbeam.png", likes: 78, comments: 11 },
    ],
  },
  "2": {
    id: "2",
    name: "강민호",
    username: "@minho_k",
    avatar: "/man-avatar.png",
    bio: "🐈 고양이 집사 | 서울 송파구\n일상 속 고양이들의 소소한 행복을 공유합니다",
    posts: 89,
    followers: 2500,
    following: 512,
    isFollowing: true,
    pets: [{ name: "루나", breed: "코리안 숏헤어", avatar: "/tabby-cat-sunbeam.png" }],
    userPosts: [
      { id: "1", image: "/cat-in-box.jpg", likes: 234, comments: 45 },
      { id: "2", image: "/tabby-cat-sunbeam.png", likes: 189, comments: 32 },
      { id: "3", image: "/golden-retriever.png", likes: 145, comments: 28 },
    ],
  },
}

export default function UserPage() {
  const params = useParams()
  const userId = params.id as string
  const user = MOCK_USERS[userId] || MOCK_USERS["1"]

  const [isFollowing, setIsFollowing] = useState(user.isFollowing)
  const [followers, setFollowers] = useState(user.followers)
  const [activeTab, setActiveTab] = useState<"posts" | "diary">("posts")

  const handleFollow = () => {
    if (isFollowing) {
      setIsFollowing(false)
      setFollowers(followers - 1)
    } else {
      setIsFollowing(true)
      setFollowers(followers + 1)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/feed">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="flex-1 text-center text-lg font-bold text-foreground">{user.username}</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem className="text-destructive">차단하기</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">신고하기</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <main className="mx-auto max-w-5xl pb-20 md:pb-8">
        <div className="p-4 md:p-6">
          {/* Profile Header */}
          <div className="mb-6">
            <div className="mb-6 flex items-start gap-4 md:gap-8">
              {/* Avatar */}
              <Avatar className="h-20 w-20 border-4 border-border md:h-32 md:w-32">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-400 text-2xl text-white">
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>

              {/* Stats - Desktop */}
              <div className="hidden flex-1 md:block">
                <div className="mb-4 flex items-center gap-4">
                  <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleFollow}
                      variant={isFollowing ? "outline" : "default"}
                      className={
                        isFollowing
                          ? "rounded-full"
                          : "rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:opacity-90"
                      }
                    >
                      {isFollowing ? "팔로잉" : "팔로우"}
                    </Button>
                    <Link to="/messages">
                      <Button variant="outline" className="rounded-full bg-transparent">
                        메시지
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="mb-4 flex gap-8">
                  <div>
                    <span className="text-lg font-bold text-foreground">{user.posts}</span>
                    <span className="ml-1 text-sm text-muted-foreground">게시물</span>
                  </div>
                  <button className="transition-colors hover:text-foreground">
                    <span className="text-lg font-bold text-foreground">{followers.toLocaleString()}</span>
                    <span className="ml-1 text-sm text-muted-foreground">팔로워</span>
                  </button>
                  <button className="transition-colors hover:text-foreground">
                    <span className="text-lg font-bold text-foreground">{user.following}</span>
                    <span className="ml-1 text-sm text-muted-foreground">팔로잉</span>
                  </button>
                </div>

                <p className="whitespace-pre-line text-sm text-foreground">{user.bio}</p>
              </div>
            </div>

            {/* Stats - Mobile */}
            <div className="mb-4 md:hidden">
              <h2 className="mb-2 text-xl font-bold text-foreground">{user.name}</h2>
              <p className="mb-4 whitespace-pre-line text-sm text-foreground">{user.bio}</p>

              <div className="mb-4 flex justify-around border-y border-border py-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{user.posts}</p>
                  <p className="text-xs text-muted-foreground">게시물</p>
                </div>
                <button className="text-center transition-colors hover:text-foreground">
                  <p className="text-lg font-bold text-foreground">{followers.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">팔로워</p>
                </button>
                <button className="text-center transition-colors hover:text-foreground">
                  <p className="text-lg font-bold text-foreground">{user.following}</p>
                  <p className="text-xs text-muted-foreground">팔로잉</p>
                </button>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleFollow}
                  variant={isFollowing ? "outline" : "default"}
                  className={
                    isFollowing
                      ? "flex-1 rounded-full"
                      : "flex-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:opacity-90"
                  }
                >
                  {isFollowing ? "팔로잉" : "팔로우"}
                </Button>
                <Link to="/messages" className="flex-1">
                  <Button variant="outline" className="w-full rounded-full bg-transparent">
                    메시지
                  </Button>
                </Link>
              </div>
            </div>

            {/* Pets */}
            {user.pets.length > 0 && (
              <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                  <p className="mb-3 text-sm font-semibold text-foreground">반려동물</p>
                  <div className="flex gap-4">
                    {user.pets.map((pet, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Avatar className="h-10 w-10 border-2 border-pink-400">
                          <AvatarImage src={pet.avatar || "/placeholder.svg"} alt={pet.name} />
                          <AvatarFallback>{pet.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{pet.name}</p>
                          <p className="text-xs text-muted-foreground">{pet.breed}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Tabs */}
          <div className="mb-4 border-t border-border">
            <div className="flex">
              <button
                onClick={() => setActiveTab("posts")}
                className={`flex flex-1 items-center justify-center gap-2 border-t-2 py-3 transition-colors ${activeTab === "posts"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground"
                  }`}
              >
                <Grid className="h-5 w-5" />
                <span className="text-sm font-semibold">게시물</span>
              </button>
              <button
                onClick={() => setActiveTab("diary")}
                className={`flex flex-1 items-center justify-center gap-2 border-t-2 py-3 transition-colors ${activeTab === "diary"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground"
                  }`}
              >
                <BookOpen className="h-5 w-5" />
                <span className="text-sm font-semibold">AI 다이어리 보관함</span>
              </button>
            </div>
          </div>

          {/* Posts Grid */}
          {activeTab === "posts" && (
            <div className="grid grid-cols-3 gap-1 md:gap-3">
              {user.userPosts.map((post) => (
                <div key={post.id} className="group relative aspect-square overflow-hidden rounded-lg">
                  <img src={post.image || "/placeholder.svg"} alt="Post" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex items-center gap-1 text-white">
                      <Heart className="h-5 w-5 fill-white" />
                      <span className="font-semibold">{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1 text-white">
                      <MessageCircle className="h-5 w-5 fill-white" />
                      <span className="font-semibold">{post.comments}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI 다이어리 보관함 탭 내용 */}
          {activeTab === "diary" && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">AI 다이어리는 본인만 볼 수 있어요</h3>
              <p className="text-sm text-muted-foreground">{user.name}님의 AI 다이어리는 비공개로 설정되어 있습니다</p>
            </div>
          )}
        </div>
      </main>

      <TabNavigation />
    </div>
  )
}
