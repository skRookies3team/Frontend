import { useState } from "react"
import { Link } from "react-router-dom"
import { TabNavigation } from "@/shared/components/tab-navigation"
import { FeedList } from "@/features/social/components/feed-list"

import { Home, Compass, TrendingUp, PlusSquare, Heart, PlusCircle, MessageSquare } from 'lucide-react'
// import { useAuth } from "@/features/auth/context/auth-context"

export default function FeedPage() {
  const [activeMenu, setActiveMenu] = useState("home")
  const [activeFilter, setActiveFilter] = useState("all")
  /* const { user } = useAuth() */

  const sidebarMenu = [
    { id: "home", label: "홈", icon: Home },
    { id: "ai-recommend", label: "AI 추천", icon: Compass, link: "/feed/ai-recommend" },
    { id: "popular", label: "인기", icon: TrendingUp },
    { id: "create", label: "만들기", icon: PlusSquare, link: "/create" },
    { id: "favorites", label: "찜", icon: Heart },
    { id: "messages", label: "메시지", icon: MessageSquare, badge: 3, link: "/messages" },
  ]

  const filters = [
    { id: "all", label: "전체 게시물" },
    { id: "my-posts", label: "내 게시물" },
    { id: "friends", label: "친구" },
    { id: "favorites", label: "즐겨찾기" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="mx-auto max-w-7xl pb-20 md:pb-8">
        <div className="grid gap-6 md:grid-cols-[200px_1fr] lg:grid-cols-[200px_1fr_240px] md:px-6 md:py-6">
          <aside className="hidden md:block">
            <div className="sticky top-20 space-y-2">
              {sidebarMenu.map((item) => (
                item.link ?
                  <Link key={item.id} to={item.link} className="block">
                    <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${activeMenu === item.id ? "text-pink-600 bg-pink-50" : "text-foreground hover:bg-white/50"}`}>
                      <item.icon className="h-5 w-5" /> <span>{item.label}</span>
                    </div>
                  </Link> :
                  <button key={item.id} onClick={() => { setActiveMenu(item.id); if (item.id === 'home') setActiveFilter('all'); }} className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 ${activeMenu === item.id ? "text-pink-600 bg-pink-50" : "text-foreground hover:bg-white/50"}`}>
                    <item.icon className="h-5 w-5" /> <span>{item.label}</span>
                  </button>
              ))}
            </div>
          </aside>

          <main>
            <div className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm md:hidden">
              <div className="flex gap-2 px-4 py-3 overflow-x-auto">
                {filters.map((filter) => (
                  <button key={filter.id} onClick={() => setActiveFilter(filter.id)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${activeFilter === filter.id ? "bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg" : "bg-white/70 text-foreground hover:bg-white"}`}>
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden md:flex gap-2 mb-6 overflow-x-auto pb-2">
              {filters.map((filter) => (
                <button key={filter.id} onClick={() => setActiveFilter(filter.id)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all hover:scale-105 ${activeFilter === filter.id ? "bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg" : "bg-white/70 text-foreground hover:bg-white"}`}>
                  {filter.label}
                </button>
              ))}
            </div>

            <FeedList filter={activeFilter} />
          </main>

          <aside className="hidden lg:block">
            {/* Recommendation Panel Placeholder */}
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