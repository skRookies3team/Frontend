"use client"

import { useState } from "react"
import Link from "next/link"
import { TabNavigation } from "@/components/tab-navigation"
import { PostCard } from "@/components/post-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Home, Compass, TrendingUp, PlusSquare, Heart, PlusCircle, User, MessageSquare } from 'lucide-react'

const MOCK_POSTS = [
  {
    id: "1",
    user: {
      name: "김서연",
      avatar: "/diverse-woman-avatar.png",
    },
    pet: {
      name: "초코",
      avatar: "/golden-retriever.png",
    },
    content:
      "오늘 초코가 공원에서 최고의 하루를 보냈어요! 새로운 친구들을 많이 사귀고 꼬리를 멈추지 않고 흔들었답니다.",
    images: ["/golden-retriever-playing-park.jpg", "/dog-running-grass.jpg"],
    likes: 124,
    comments: 18,
    timeAgo: "2시간 전",
    isLiked: false,
  },
  {
    id: "2",
    user: {
      name: "이민준",
      avatar: "/man-avatar.png",
    },
    pet: {
      name: "루나",
      avatar: "/tabby-cat-sunbeam.png",
    },
    content: "루나가 오늘 골판지 상자의 즐거움을 발견했어요. 최고의 장난감이네요!",
    images: ["/cat-in-box.jpg"],
    likes: 89,
    comments: 12,
    timeAgo: "5시간 전",
    isLiked: true,
  },
  {
    id: "3",
    user: {
      name: "박지은",
      avatar: "/woman-avatar-2.png",
    },
    pet: {
      name: "맥스",
      avatar: "/corgi.jpg",
    },
    content: "맥스가 오늘 새로운 트릭을 배웠어요! 우리 아가가 너무 자랑스러워요.",
    images: [],
    likes: 56,
    comments: 8,
    timeAgo: "1일 전",
    isLiked: false,
  },
]

export default function FeedPage() {
  const [activeMenu, setActiveMenu] = useState("home")
  const [activeFilter, setActiveFilter] = useState("all")

  const sidebarMenu = [
    { id: "home", label: "홈 (피드)", icon: Home },
    { id: "ai-recommend", label: "AI 추천", icon: Compass },
    { id: "popular", label: "인기 게시물", icon: TrendingUp },
    { id: "create", label: "만들기 (업로드)", icon: PlusSquare },
    { id: "favorites", label: "찜", icon: Heart, badge: 3 },
    { id: "messages", label: "메시지", icon: MessageSquare, badge: 3, link: "/messages" },
  ]

  const filters = [
    { id: "all", label: "전체 게시물" },
    { id: "my-posts", label: "내 게시물" },
    { id: "friends", label: "친구" },
    { id: "favorites", label: "즐겨찾기" },
    { id: "pinned", label: "고정됨" },
  ]

  const suggestedUsers = [
    { id: 1, name: "최유진", username: "@yujin_choi", followers: "1.2k", avatar: "/diverse-woman-avatar.png" },
    { id: 2, name: "강민호", username: "@minho_k", followers: "2.5k", avatar: "/man-avatar.png" },
    { id: 3, name: "이서윤", username: "@seoyun_lee", followers: "890", avatar: "/woman-avatar-2.png" },
    { id: 4, name: "박준서", username: "@jun_park", followers: "3.1k", avatar: null },
    { id: 5, name: "김하은", username: "@haeun_kim", followers: "1.8k", avatar: null },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl pb-20 md:pb-8">
        <div className="grid gap-6 md:grid-cols-[200px_1fr] lg:grid-cols-[200px_1fr_240px] md:px-6 md:py-6">
          {/* Left Sidebar - Desktop only */}
          <aside className="hidden md:block">
            <div className="sticky top-20 space-y-2">
              {sidebarMenu.map((item) => {
                const Icon = item.icon
                const isActive = activeMenu === item.id

                if (item.link) {
                  return (
                    <Link key={item.id} href={item.link}>
                      <button
                        className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                          isActive ? "bg-pink-50 text-pink-600" : "text-foreground hover:bg-muted"
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${isActive ? "text-pink-600" : "text-muted-foreground"}`} />
                        <span className="flex-1 font-medium">{item.label}</span>
                        {item.badge && (
                          <Badge className="h-5 w-5 rounded-full bg-rose-500 p-0 text-xs text-white flex items-center justify-center">
                            {item.badge}
                          </Badge>
                        )}
                      </button>
                    </Link>
                  )
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveMenu(item.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                      isActive ? "bg-pink-50 text-pink-600" : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? "text-pink-600" : "text-muted-foreground"}`} />
                    <span className="flex-1 font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge className="h-5 w-5 rounded-full bg-rose-500 p-0 text-xs text-white flex items-center justify-center">
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                )
              })}

              {/* 나의 프로필 */}
              <Link href="/profile">
                <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-foreground transition-all hover:bg-muted">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-400 text-[10px] text-white">
                      Me
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 font-medium">나의 프로필</span>
                </button>
              </Link>
            </div>
          </aside>

          {/* Main Feed */}
          <main>
            {/* Mobile Filter Tabs */}
            <div className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm md:hidden">
              <div className="overflow-x-auto">
                <div className="flex gap-2 px-4 py-3">
                  {filters.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                        activeFilter === filter.id
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-card text-foreground hover:bg-muted"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-4 p-4 md:p-0">
              {MOCK_POSTS.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </main>

          {/* Right Sidebar - Desktop only */}
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <div className="rounded-2xl border border-border bg-card p-2.5 shadow-sm">
                <h3 className="mb-2 px-2 text-sm font-semibold text-foreground">추천 사용자</h3>
                <div className="space-y-0.5">
                  {suggestedUsers.map((user) => (
                    <Link key={user.id} href={`/profile/${user.id}`}>
                      <button className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left transition-all hover:bg-pink-50">
                        <Avatar className="h-7 w-7">
                          {user.avatar ? (
                            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-400 text-xs text-white">
                              {user.name[0]}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{user.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{user.username}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                          }}
                          className="shrink-0 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-2 py-0.5 text-[10px] font-medium text-white hover:opacity-90 transition-opacity"
                        >
                          팔로우
                        </button>
                      </button>
                    </Link>
                  ))}
                </div>

                <Link href="/explore">
                  <button className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-medium text-pink-600 transition-all hover:bg-pink-50">
                    <User className="h-3.5 w-3.5" />
                    <span>더 많은 사용자 보기</span>
                  </button>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Floating Create Button - Mobile only */}
      <Link
        href="/create"
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-xl transition-transform hover:scale-110 md:hidden"
      >
        <PlusCircle className="h-7 w-7 text-white" />
      </Link>

      <TabNavigation />
    </div>
  )
}
