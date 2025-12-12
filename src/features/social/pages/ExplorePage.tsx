// src/features/social/pages/ExplorePage.tsx
import { useState } from "react"
import { TabNavigation } from "@/shared/components/tab-navigation"
import { PostCard } from "@/features/social/components/post-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { Button } from "@/shared/ui/button"
import { Card, CardContent } from "@/shared/ui/card"
import { Input } from "@/shared/ui/input"
import { Search, TrendingUp } from "lucide-react"
import { FeedDto } from "../types/feed" // 타입 Import

// FeedDto 형식에 맞춘 Mock Data
const TRENDING_POSTS: FeedDto[] = [
  {
    feedId: 4,
    writerNickname: "정수아",
    petName: "벨라",
    content: "벨라의 생일 파티가 대성공이었어요!",
    imageUrl: "/dog-birthday-party.png",
    likeCount: 342,
    commentCount: 45,
    isLiked: false,
    createdAt: new Date().toISOString(),
    location: "서울",
    recentComments: [],
    hashtags: ["생일", "파티"]
  },
]

const SUGGESTED_USERS = [
  { id: "1", name: "최민호", avatar: "/diverse-person-avatars.png", petName: "록키", followers: "2.3천" },
  { id: "2", name: "윤지혜", avatar: "/woman-avatar-4.png", petName: "마일로", followers: "1.8천" },
]

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock 좋아요 핸들러
  const handleLikeToggle = (id: number) => {
    console.log("Toggle like for:", id);
  }

  return (
    <div className="min-h-screen bg-pink-50 pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-pink-100 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <h1 className="mb-4 text-2xl font-bold text-pink-600 md:text-3xl">탐색</h1>
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="검색..."
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
              <Card key={user.id} className="border-pink-100 shadow-md">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Avatar><AvatarImage src={user.avatar} /><AvatarFallback>{user.name[0]}</AvatarFallback></Avatar>
                    <div>
                      <p className="font-semibold text-pink-600">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.petName} · {user.followers}</p>
                    </div>
                  </div>
                  <Button size="sm" className="rounded-full bg-pink-500">팔로우</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Trending Posts */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-pink-600" />
            <h2 className="text-lg font-bold text-pink-600">인기 게시물</h2>
          </div>
          <div className="space-y-4">
            {TRENDING_POSTS.map((post) => (
              <PostCard key={post.feedId} post={post} onLikeToggle={handleLikeToggle} />
            ))}
          </div>
        </section>
      </main>
      <TabNavigation />
    </div>
  )
}