// src/features/social/pages/FeedPage.tsx
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
    { id: "favorites", label: "찜", icon: Heart, badge: 0 },
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
    // ... 더 많은 유저
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="mx-auto max-w-7xl pb-20 md:pb-8">
        <div className="grid gap-6 md:grid-cols-[200px_1fr] lg:grid-cols-[200px_1fr_240px] md:px-6 md:py-6">
          
          {/* Left Sidebar */}
          <aside className="hidden md:block">
            <div className="sticky top-20 space-y-2">
              {sidebarMenu.map((item) => {
                const Icon = item.icon
                const isActive = activeMenu === item.id

                if (item.link) {
                  return (
                    <Link key={item.id} to={item.link}>
                      <div className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all hover:scale-105 ${isActive ? "bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600 shadow-md" : "text-foreground hover:bg-white/50"}`}>
                        <Icon className={`h-5 w-5 ${isActive ? "text-pink-600" : "text-muted-foreground"}`} />
                        <span className="flex-1 font-medium">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <Badge className="h-5 w-5 rounded-full bg-rose-500 p-0 text-xs text-white flex items-center justify-center">{item.badge}</Badge>
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
                      if (item.id === "favorites") setActiveFilter("favorites")
                      else if (item.id === "home") setActiveFilter("all")
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all hover:scale-105 ${isActive ? "bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600 shadow-md" : "text-foreground hover:bg-white/50"}`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? "text-pink-600" : "text-muted-foreground"}`} />
                    <span className="flex-1 font-medium">{item.label}</span>
                  </button>
                )
              })}
              
              {/* 프로필 링크 */}
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

          {/* Main Content */}
          <main>
            {/* Filter Tabs */}
            <div className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm md:hidden">
               {/* Mobile Tabs */}
               <div className="flex gap-2 px-4 py-3 overflow-x-auto">
                  {filters.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${activeFilter === filter.id ? "bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg" : "bg-white/70 text-foreground hover:bg-white"}`}
                    >
                      {filter.label}
                    </button>
                  ))}
               </div>
            </div>
            
            <div className="hidden md:flex gap-2 mb-6 overflow-x-auto pb-2">
               {/* Desktop Tabs */}
               {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all hover:scale-105 ${activeFilter === filter.id ? "bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg" : "bg-white/70 text-foreground hover:bg-white"}`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* ⭐️ FeedList 컴포넌트 사용 (Filter 전달) ⭐️ */}
            <FeedList filter={activeFilter} />
          </main>

          {/* Right Sidebar */}
          <aside className="hidden lg:block">
             <div className="sticky top-20">
               {/* ... 추천 친구 목록 등 ... */}
               <div className="rounded-3xl border-0 bg-white/80 backdrop-blur-sm p-4 shadow-lg">
                  <h3 className="mb-3 px-2 text-sm font-bold text-foreground">✨ 추천 친구</h3>
                  {/* ... 추천 유저 맵핑 ... */}
                  {suggestedUsers.map((user) => (
                    <div key={user.id} className="flex w-full items-center gap-2 rounded-2xl px-2 py-2 text-left hover:bg-pink-50">
                        {/* ... */}
                        <div className="flex-1"><p className="text-xs font-bold">{user.name}</p></div>
                        <button className="text-[10px] bg-pink-400 text-white px-2 py-1 rounded-full">팔로우</button>
                    </div>
                  ))}
               </div>
             </div>
          </aside>
        </div>
      </div>

      <Link to="/create" className="fixed bottom-24 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-pink-500 shadow-2xl animate-bounce md:hidden">
        <PlusCircle className="h-7 w-7 text-white" />
      </Link>

      <TabNavigation />
    </div>
  )
}