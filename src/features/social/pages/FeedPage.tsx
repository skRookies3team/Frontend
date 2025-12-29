import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { TabNavigation } from "@/shared/components/tab-navigation"
import { FeedList } from "@/features/social/components/feed-list"
import { PopularFeedGrid } from "@/features/social/components/PopularFeedGrid"
import { PostDetailModal } from "@/features/social/components/PostDetailModal"
import { FeedCreateModal } from "@/features/social/components/FeedCreateModal"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { Input } from "@/shared/ui/input"
import { 
  Home, Search, TrendingUp, PlusSquare, User, Heart, X, Loader2
} from 'lucide-react'
import { useAuth } from "@/features/auth/context/auth-context"
import { useFeedLike } from "../hooks/use-feed-query"
import { useUserSearch } from "../hooks/use-search-query"
import { FeedDto, SearchUserDto } from "../types/feed"

interface SidebarItem {
  id: string;
  label: string;
  icon: any;
  link?: string;
  action?: () => void;
  isActive: boolean;
  isProfile?: boolean;
}

export default function FeedPage() {
  const [activeFilter, setActiveFilter] = useState("all") 
  const [selectedPost, setSelectedPost] = useState<FeedDto | null>(null)
  
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  const { user } = useAuth()
  const location = useLocation()
  
  const myUserId = user ? Number(user.id) : 0;
  
  const { mutate: toggleLike } = useFeedLike(myUserId);

  const { data: searchResults, isLoading: isSearchLoading } = useUserSearch(searchQuery);

  const sidebarMenu: SidebarItem[] = [
    { 
      id: "home", label: "홈", icon: Home, link: "/feed", 
      action: () => { setActiveFilter("all"); setIsSearchOpen(false); },
      isActive: activeFilter === "all" && !isSearchOpen 
    },
    { 
      id: "search", label: "검색", icon: Search, 
      action: () => setIsSearchOpen(!isSearchOpen), 
      isActive: isSearchOpen 
    },
    { 
      id: "popular", label: "인기", icon: TrendingUp, 
      action: () => { setActiveFilter("popular"); setIsSearchOpen(false); }, 
      isActive: activeFilter === "popular" && !isSearchOpen
    },
    { 
      id: "create", label: "만들기", icon: PlusSquare, 
      action: () => setIsCreateOpen(true), 
      isActive: false 
    },
    { 
      id: "profile", label: "프로필", icon: User, isProfile: true, link: `/user/${myUserId}`, 
      isActive: location.pathname === `/user/${myUserId}` 
    },
  ]

  return (
    // [수정] pt-16 -> pt-0 (상단 여백 제거)
    <div className="flex justify-between w-full min-h-screen bg-[#FDFBFD] text-slate-800 font-sans selection:bg-[#FF69B4] selection:text-white pt-0 relative">
      
      {/* 왼쪽 사이드바 */}
      <aside className="hidden md:block sticky top-20 h-[calc(100vh-6rem)] shrink-0 z-50 ml-4 w-[80px] xl:w-[240px]">
        <div className={`relative h-full flex transition-all duration-300 ease-in-out ${
           isSearchOpen ? "w-[400px]" : "w-full"
        }`}>
          <div className={`h-full bg-white rounded-[2.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100 overflow-y-auto custom-scrollbar py-6 relative z-30 transition-all duration-300 ${
             isSearchOpen ? "w-[80px]" : "w-full"
          }`}>
            <nav className="flex flex-col space-y-3 px-3"> 
            {sidebarMenu.map((item) => {
                const activeClass = "bg-[#FF69B4] text-white font-bold shadow-md shadow-[#FF69B4]/30"
                const inactiveClass = "text-gray-600 hover:bg-[#FFF0F5] hover:text-[#FF69B4] font-semibold"
                const showLabel = !isSearchOpen;

                return (
                <div key={item.id}>
                    {item.link ? (
                        <Link 
                            to={item.link}
                            onClick={item.action}
                            className={`flex items-center justify-center ${showLabel && 'xl:justify-start'} gap-4 p-3 rounded-[20px] transition-all duration-200 group ${item.isActive ? activeClass : inactiveClass}`}
                        >
                            {item.isProfile ? (
                                <Avatar className={`h-7 w-7 transition-transform group-hover:scale-105 ${item.isActive ? "ring-2 ring-white" : ""}`}>
                                    <AvatarImage src={user?.avatar || "/placeholder-user.jpg"} />
                                    <AvatarFallback className="text-[10px] bg-white text-[#FF69B4] font-bold">Me</AvatarFallback>
                                </Avatar>
                            ) : (
                                <item.icon className={`h-6 w-6 transition-transform group-hover:scale-105 ${item.isActive ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
                            )}
                            {showLabel && <span className="hidden xl:block text-[15px] tracking-tight whitespace-nowrap">{item.label}</span>}
                        </Link>
                    ) : (
                        <button 
                            onClick={item.action}
                            className={`w-full flex items-center justify-center ${showLabel && 'xl:justify-start'} gap-4 p-3 rounded-[20px] transition-all duration-200 group ${item.isActive ? activeClass : inactiveClass}`}
                        >
                            <item.icon className={`h-6 w-6 transition-transform group-hover:scale-105 ${item.isActive ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
                            {showLabel && <span className="hidden xl:block text-[15px] tracking-tight whitespace-nowrap">{item.label}</span>}
                        </button>
                    )}
                </div>
            )})}
            </nav>
          </div>

          {/* 검색 패널 */}
          <div 
              className={`absolute top-0 left-[90px] h-full bg-white z-20 rounded-[2.5rem] shadow-xl transition-all duration-300 ease-in-out overflow-hidden border border-[#FF69B4]/10 ${
              isSearchOpen ? "w-[300px] opacity-100 translate-x-0" : "w-0 opacity-0 -translate-x-4 pointer-events-none"
              }`}
          >
              <div className="p-5 h-full flex flex-col w-[300px]">
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-black text-[#FF69B4] tracking-tight">검색</h2>
                      <button onClick={() => setIsSearchOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-full">
                          <X className="h-5 w-5 text-gray-400" />
                      </button>
                  </div>
                  
                  <div className="relative mb-4">
                      <Input 
                          placeholder="소셜 아이디 또는 이름" 
                          className="bg-[#FFF0F5] border-none h-11 pl-4 pr-10 rounded-2xl text-sm transition-all focus-visible:ring-2 focus-visible:ring-[#FF69B4] text-gray-800 font-medium"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Search className="absolute right-3.5 top-3 h-5 w-5 text-[#FF69B4]/50" />
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar px-1">
                      <div className="space-y-2">
                          {isSearchLoading ? (
                              <div className="flex justify-center py-10"><Loader2 className="animate-spin h-6 w-6 text-[#FF69B4]"/></div>
                          ) : searchResults && searchResults.length > 0 ? (
                              searchResults.map((u: SearchUserDto) => (
                                  <Link 
                                      key={u.userId} 
                                      to={`/user/${u.userId}`} 
                                      className="flex items-center gap-3 p-2.5 hover:bg-[#FFF0F5] rounded-[16px] transition-all cursor-pointer group"
                                      onClick={() => setIsSearchOpen(false)}
                                  >
                                      <Avatar className="h-10 w-10 border border-white shadow-sm">
                                          <AvatarImage src={u.profileImage || "/placeholder-user.jpg"} />
                                          <AvatarFallback className="bg-[#FFF0F5] text-[#FF69B4] font-bold text-xs">
                                              {u.username ? u.username[0] : "U"}
                                          </AvatarFallback>
                                      </Avatar>
                                      <div className="flex flex-col overflow-hidden">
                                          <span className="font-bold text-sm text-gray-900 truncate">
                                            {u.username || "알 수 없음"}
                                          </span>
                                          <span className="text-[#FF69B4] text-[11px] font-medium truncate">
                                            @{u.social || "user"}
                                          </span>
                                      </div>
                                  </Link>
                              ))
                          ) : searchQuery ? (
                              <div className="py-10 text-center text-sm text-gray-400">결과가 없어요 🥲</div>
                          ) : (
                              <div className="py-10 text-center text-sm text-gray-400">친구를 찾아보세요!</div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
        </div>
      </aside>

      {/* 중앙 메인 컨텐츠 */}
      {/* [수정] mt-4 md:mt-0 제거하고 pt-20 추가하여 사이드바와 높이 맞춤 */}
      <main className="flex-1 flex justify-center min-w-0 bg-[#FDFBFD] pt-5 px-4 pb-20" onClick={() => { if(isSearchOpen) setIsSearchOpen(false); }}>
        <div className="w-full max-w-[680px]">
             {/* 모바일 헤더 */}
             <div className="md:hidden w-full fixed top-0 left-0 bg-white/95 backdrop-blur-md z-50 flex items-center justify-between px-5 py-3 border-b border-gray-100 shadow-sm">
                <span className="font-black text-xl italic text-[#FF69B4] tracking-tighter">Petlog</span>
                <div className="flex gap-4">
                    <Heart className="h-6 w-6 text-gray-800" />
                </div>
            </div>

            {activeFilter === 'popular' ? (
                <PopularFeedGrid />
            ) : (
                <FeedList 
                    filter={activeFilter} 
                    onPostClick={(post) => setSelectedPost(post)} 
                />
            )}
        </div>
      </main>

      {/* 오른쪽 사이드바 */}
      <aside className="hidden lg:block sticky top-20 h-[calc(100vh-6rem)] w-[320px] shrink-0 mr-4 z-30">
        <div className="h-full bg-white rounded-[2.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100 overflow-y-auto custom-scrollbar py-8 px-6">
            {user && (
                <div className="flex items-center justify-between mb-8 p-3.5 bg-[#FFF0F5]/40 rounded-[20px] border border-[#FF69B4]/10">
                    <Link to={`/user/${myUserId}`} className="flex items-center gap-3 group">
                        <Avatar className="h-10 w-10 border-[2px] border-white shadow-sm bg-white">
                            <AvatarImage src={user.avatar || "/placeholder-user.jpg"} />
                            <AvatarFallback className="text-[#FF69B4] font-bold bg-[#FFF0F5]">{user.name?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-bold text-sm text-gray-900 group-hover:text-[#FF69B4] transition-colors">{user.username}</span>
                            <span className="text-gray-400 text-xs font-medium">{user.name}</span>
                        </div>
                    </Link>
                </div>
            )}
            
            <div className="flex items-center justify-between mb-4 px-1">
                <span className="text-sm font-bold text-gray-500">회원님을 위한 추천</span>
                <button className="text-xs font-bold text-gray-900 hover:text-[#FF69B4] transition-colors">모두 보기</button>
            </div>
            
            <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 hover:bg-[#FAFAFA] rounded-[18px] transition-colors cursor-pointer group">
                    <div className="h-9 w-9 bg-gray-100 rounded-full flex items-center justify-center"><User className="h-4 w-4 text-gray-400"/></div>
                    <div className="flex-1"><div className="h-3 bg-gray-100 w-20 rounded mb-1"></div><div className="h-2 bg-gray-50 w-12 rounded"></div></div>
                </div>
                <div className="text-xs text-[#FF69B4] py-4 text-center font-bold bg-[#FFF0F5]/30 rounded-[18px] mt-4">
                    새로운 친구를 찾고 있어요 🐾
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-gray-50 text-[10px] text-gray-300 space-y-2 px-1">
                 <div className="uppercase font-extrabold text-[#FF69B4]/20 tracking-widest">© 2025 PETLOG</div>
            </div>
        </div>
      </aside>

      <div className="md:hidden"><TabNavigation /></div>

      {selectedPost && (
        <PostDetailModal
           isOpen={!!selectedPost}
           onClose={() => setSelectedPost(null)}
           post={selectedPost}
           onLikeToggle={(id) => toggleLike(id)}
        />
      )}

      <FeedCreateModal 
         isOpen={isCreateOpen}
         onClose={() => setIsCreateOpen(false)}
      />
    </div>
  )
}