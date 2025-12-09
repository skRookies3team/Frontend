import { useState } from "react"
import { TabNavigation } from "@/shared/components/tab-navigation"
import { PostCard } from "@/features/social/components/post-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { Button } from "@/shared/ui/button"
import { Card, CardContent } from "@/shared/ui/card"
import { Input } from "@/shared/ui/input"
import { Search, TrendingUp } from "lucide-react"

const TRENDING_POSTS = [
  {
    id: "4",
    user: {
      name: "정수아",
      avatar: "/woman-avatar-3.png",
    },
    pet: {
      name: "벨라",
      avatar: "/pomeranian.jpg",
    },
    content: "벨라의 생일 파티가 대성공이었어요! 정말 많은 강아지 친구들이 축하하러 왔답니다.",
    images: ["/dog-birthday-party.png"],
    likes: 342,
    comments: 45,
    timeAgo: "3시간 전",
    isLiked: false,
  },
]

const SUGGESTED_USERS = [
  {
    id: "1",
    name: "최민호",
    avatar: "/diverse-person-avatars.png",
    petName: "록키",
    followers: "2.3천",
  },
  {
    id: "2",
    name: "윤지혜",
    avatar: "/woman-avatar-4.png",
    petName: "마일로",
    followers: "1.8천",
  },
  {
    id: "3",
    name: "한준서",
    avatar: "/man-avatar-2.png",
    petName: "코코",
    followers: "3.1천",
  },
]

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-pink-50 pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-pink-100 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <h1 className="mb-4 text-2xl font-bold text-pink-600 md:text-3xl">탐색</h1>

          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="반려동물, 사용자, 게시물 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-full border-pink-200 pl-10 focus-visible:ring-pink-500"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl space-y-6 p-4 md:p-6">
        {/* Suggested Users */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-lg font-bold text-pink-600 md:text-xl">추천 친구</h2>
          </div>

          <div className="space-y-3">
            {SUGGESTED_USERS.map((user) => (
              <Card key={user.id} className="border-pink-100 shadow-md transition-shadow hover:shadow-lg">
                <CardContent className="flex items-center justify-between p-4 md:p-5">
                  <div className="flex items-center gap-3 md:gap-4">
                    <Avatar className="h-12 w-12 border-2 border-pink-200 md:h-14 md:w-14">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-pink-600 md:text-lg">{user.name}</p>
                      <p className="text-sm text-muted-foreground md:text-base">
                        {user.petName}와 함께 · 팔로워 {user.followers}명
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                  >
                    팔로우
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Trending Posts */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-pink-600 md:h-6 md:w-6" />
            <h2 className="text-lg font-bold text-pink-600 md:text-xl">인기 게시물</h2>
          </div>

          <div className="space-y-4">
            {TRENDING_POSTS.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      </main>

      <TabNavigation />
    </div>
  )
}
