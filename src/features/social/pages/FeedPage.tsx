import { useState } from "react"
import { Link } from "react-router-dom"
import { TabNavigation } from "@/shared/components/tab-navigation"
import { FeedList } from "@/features/social/components/feed-list"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { Badge } from "@/shared/ui/badge"
import { Home, Compass, TrendingUp, PlusSquare, Heart, PlusCircle, User, MessageSquare } from 'lucide-react'
import { useAuth } from "@/features/auth/context/auth-context"

export default function FeedPage() {
  const [activeMenu, setActiveMenu] = useState("home")
  const [activeFilter, setActiveFilter] = useState("all")
  const { user } = useAuth()

  const sidebarMenu = [
    { id: "home", label: "홈", icon: Home },
    { id: "ai-recommend", label: "AI 추천", icon: Compass, link: "/feed/ai-recommend" },
    { id: "popular", label: "인기", icon: TrendingUp },
    { id: "create", label: "만들기", icon: PlusSquare, link: "/create" },
    { id: "favorites", label: "찜", icon: Heart, badge: 0 }, // Badge logic needs to be connected to real data if needed
    { id: "messages", label: "메시지", icon: MessageSquare, badge: 3, link: "/messages" },
  ]

  const filters = [
    { id: "all", label: "전체 게시물" },
    { id: "my-posts", label: "내 게시물" },
    { id: "friends", label: "친구" },
    { id: "favorites", label: "즐겨찾기" },
  ]

  const suggestedUsers = [
    { id: 1, name: "최유진", username: "@yujin_choi", followers: "1.2k", avatar: "/diverse-woman-avatar.png" },
    { id: 2, name: "강민호", username: "@minho_k", followers: "2.5k", avatar: "/man-avatar.png" },
    { id: 3, name: "이서윤", username: "@seoyun_lee", followers: "890", avatar: "/woman-avatar-2.png" },
    { id: 4, name: "박준서", username: "@jun_park", followers: "3.1k", avatar: null },
    { id: 5, name: "김하은", username: "@haeun_kim", followers: "1.8k", avatar: null },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
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
                    <Link key={item.id} to={item.link}>
                      <div
                        className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all hover:scale-105 ${isActive ? "bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600 shadow-md" : "text-foreground hover:bg-white/50"
                          }`}
                      >
                        <Icon className={`h-5 w-5 ${isActive ? "text-pink-600" : "text-muted-foreground"}`} />
                        <span className="flex-1 font-medium">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <Badge className="h-5 w-5 rounded-full bg-rose-500 p-0 text-xs text-white flex items-center justify-center">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  )
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveMenu(item.id)
                      if (item.id === "favorites") {
                        setActiveFilter("favorites")
                      } else if (item.id === "home") {
                        setActiveFilter("all")
                      }
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all hover:scale-105 ${isActive ? "bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600 shadow-md" : "text-foreground hover:bg-white/50"
                      }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? "text-pink-600" : "text-muted-foreground"}`} />
                    <span className="flex-1 font-medium">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge className="h-5 w-5 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 p-0 text-xs text-white flex items-center justify-center shadow-lg">
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                )
              })}

              {/* 나의 프로필 */}
              <Link to="/profile">
                <div className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-foreground transition-all hover:bg-white/50 hover:scale-105">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={user?.avatar || "/diverse-woman-avatar.png"} alt="프로필" />
                    <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-400 text-[10px] text-white">
                      {user?.name?.[0] || "Me"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 font-medium">프로필</span>
                </div>
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
                      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all hover:scale-105 ${activeFilter === filter.id
                        ? "bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg"
                        : "bg-white/70 text-foreground hover:bg-white"
                        }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop Filter Tabs (Optional, but good for UX) */}
            <div className="hidden md:flex gap-2 mb-6 overflow-x-auto pb-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all hover:scale-105 ${activeFilter === filter.id
                    ? "bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg"
                    : "bg-white/70 text-foreground hover:bg-white"
                    }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Posts */}
            <FeedList />
          </main>

          {/* Right Sidebar - Desktop only */}
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <div className="rounded-3xl border-0 bg-white/80 backdrop-blur-sm p-4 shadow-lg">
                <h3 className="mb-3 px-2 text-sm font-bold text-foreground">✨ 추천 친구</h3>
                <div className="space-y-0.5">
                  {suggestedUsers.map((user) => (
                    <div key={user.id} className="flex w-full items-center gap-2 rounded-2xl px-2 py-2 text-left transition-all hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 hover:scale-[1.02]">
                      <Link to={`/profile/${user.id}`} className="flex flex-1 items-center gap-2 min-w-0">
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
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        className="shrink-0 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 px-3 py-1 text-[10px] font-bold text-white hover:scale-110 transition-all shadow-md"
                      >
                        팔로우
                      </button>
                    </div>
                  ))}
                </div>

                <Link to="/explore">
                  <div className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl px-2 py-2 text-xs font-bold text-pink-600 transition-all hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 hover:scale-105">
                    <User className="h-3.5 w-3.5" />
                    <span>더 많은 사용자 보기</span>
                  </div>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Floating Create Button - Mobile only */}
      <Link
        to="/create"
        className="fixed bottom-24 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-pink-500 shadow-2xl transition-all hover:scale-110 hover:rotate-90 md:hidden animate-bounce"
      >
        <PlusCircle className="h-7 w-7 text-white" />
      </Link>

      <TabNavigation />
    </div>
  )
}
