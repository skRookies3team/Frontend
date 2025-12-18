import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { TabNavigation } from "@/shared/components/tab-navigation"
import { FeedList } from "@/features/social/components/feed-list"
import { PostDetailModal } from "@/features/social/components/PostDetailModal"
import { FeedCreateModal } from "@/features/social/components/FeedCreateModal"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { Input } from "@/shared/ui/input"
import { 
  Home, 
  Search, 
  TrendingUp, 
  MessageCircle, 
  PlusSquare, 
  User,
  Heart,
  X,
  Loader2
} from 'lucide-react'
import { useAuth } from "@/features/auth/context/auth-context"
import { useFeedLike } from "../hooks/use-feed-query"
import { useUserSearch } from "../hooks/use-search-query"
import { FeedDto } from "../types/feed"

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
      action: () => setIsSearchOpen(false),
      isActive: location.pathname === "/feed" && !isSearchOpen 
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
      id: "messages", label: "메시지", icon: MessageCircle, link: "/messages", 
      isActive: location.pathname === "/messages" 
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
    // 전체 배경: 아주 연한 핑크빛 (Warm tone)
    <div className="min-h-screen bg-[#FFF5F8]/30 text-slate-800 relative">
      
      {/* 1. 검색 패널 (슬라이드 & 핑크 테마) */}
      <div 
        className={`fixed top-20 left-[88px] h-[calc(100vh-6rem)] bg-white/95 backdrop-blur-md z-40 border border-rose-100 rounded-[2rem] shadow-[0_8px_30px_rgb(255,105,180,0.05)] transition-all duration-300 ease-in-out overflow-hidden ${
          isSearchOpen ? "w-[360px] translate-x-0 opacity-100" : "w-0 -translate-x-10 opacity-0 pointer-events-none"
        }`}
      >
        <div className="p-6 h-full flex flex-col w-[360px]">
           <h2 className="text-xl font-bold mb-6 text-rose-500">검색</h2>
           <div className="relative mb-6">
              <Input 
                placeholder="친구 찾기..." 
                className="bg-rose-50/50 border-none h-11 pl-4 pr-10 focus-visible:ring-2 focus-visible:ring-rose-200 rounded-2xl text-sm transition-all placeholder:text-rose-300/70 text-gray-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-3 text-rose-300 hover:text-rose-500">
                      <X className="h-4 w-4" />
                  </button>
              )}
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar px-1">
               <div className="space-y-2">
                  {isSearchLoading ? (
                      <div className="flex justify-center py-10"><Loader2 className="animate-spin h-6 w-6 text-rose-300"/></div>
                  ) : searchResults && searchResults.length > 0 ? (
                      searchResults.map((u) => (
                        <Link 
                            key={u.userId} 
                            to={`/user/${u.userId}`} 
                            className="flex items-center gap-3 p-2.5 hover:bg-rose-50 rounded-2xl transition-all cursor-pointer group"
                            onClick={() => setIsSearchOpen(false)}
                        >
                            <Avatar className="h-10 w-10 border border-rose-100 group-hover:scale-105 transition-transform">
                                <AvatarImage src={u.profileImageUrl || "/placeholder-user.jpg"} />
                                <AvatarFallback className="bg-rose-100 text-rose-500">{u.nickname[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="font-bold text-sm text-gray-800">{u.nickname}</span>
                                <span className="text-rose-400 text-xs">{u.username}</span>
                            </div>
                        </Link>
                      ))
                  ) : searchQuery ? (
                      <p className="text-center text-rose-300 py-10 text-sm">검색 결과가 없어요 🥲</p>
                  ) : (
                      <div className="text-center text-rose-300 py-10 text-sm">
                          검색어를 입력해보세요!
                      </div>
                  )}
               </div>
           </div>
        </div>
      </div>

      {/* 레이아웃 컨테이너 */}
      <div className={`w-full grid grid-cols-1 md:grid-cols-[88px_1fr] transition-all duration-300 ${
          isSearchOpen 
            ? "lg:grid-cols-[88px_1fr_320px]" 
            : "lg:grid-cols-[240px_1fr_320px]"
      }`}>
        
        {/* (1) 왼쪽 사이드바 */}
        {/* 수정 사항: sticky top-20으로 헤더 침범 방지, 로고 제거, 메뉴 위로 올림(pt-4) */}
        <aside className="hidden md:flex flex-col h-[calc(100vh-6rem)] sticky top-20 ml-6 bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-rose-100 shadow-sm z-30 overflow-hidden py-4">
          
          {/* 로고 삭제됨 - 메뉴를 위쪽으로 정렬 */}
          <nav className="space-y-3 px-3 flex-1 flex flex-col justify-start pt-2"> 
            {sidebarMenu.map((item) => {
                // 핑크 테마 적용: 활성화 시 진한 핑크 아이콘 + 연한 핑크 배경
                const activeClass = "bg-rose-50 text-rose-500 font-bold shadow-sm ring-1 ring-rose-100"
                const inactiveClass = "text-gray-500 hover:bg-rose-50/50 hover:text-rose-400 font-medium"

                return (
                <div key={item.id}>
                    {item.link ? (
                        <Link 
                            to={item.link}
                            onClick={item.action}
                            className={`flex items-center justify-center lg:justify-start gap-4 p-3.5 rounded-2xl transition-all duration-300 group ${item.isActive ? activeClass : inactiveClass}`}
                        >
                            {item.isProfile ? (
                                <Avatar className={`h-6 w-6 transition-transform group-hover:scale-110 ${item.isActive ? "ring-2 ring-rose-200 p-0.5" : ""}`}>
                                    <AvatarImage src={user?.avatar || "/placeholder-user.jpg"} />
                                    <AvatarFallback>Me</AvatarFallback>
                                </Avatar>
                            ) : (
                                <item.icon className={`h-6 w-6 transition-transform group-hover:scale-110 ${item.isActive ? "fill-rose-500 stroke-none" : "stroke-[2px]"}`} />
                            )}
                            <span className={`hidden lg:block text-[15px] ${isSearchOpen ? 'lg:hidden' : ''}`}>{item.label}</span>
                        </Link>
                    ) : (
                        <button 
                            onClick={item.action}
                            className={`w-full flex items-center justify-center lg:justify-start gap-4 p-3.5 rounded-2xl transition-all duration-300 group ${item.isActive ? activeClass : inactiveClass}`}
                        >
                            <item.icon className={`h-6 w-6 transition-transform group-hover:scale-110 ${item.isActive ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
                            <span className={`hidden lg:block text-[15px] ${isSearchOpen ? 'lg:hidden' : ''}`}>{item.label}</span>
                        </button>
                    )}
                </div>
            )})}
          </nav>
        </aside>

        {/* (2) 중앙 메인 피드 */}
        <main className="w-full min-h-screen flex flex-col items-center pt-2 pb-24 px-0" onClick={() => { if(isSearchOpen) setIsSearchOpen(false); }}>
            {/* 모바일 헤더 */}
            <div className="md:hidden w-full fixed top-0 bg-white/90 backdrop-blur-md z-50 flex items-center justify-between px-5 py-3 border-b border-rose-50">
               <span className="font-bold text-xl italic text-rose-500">Petlog</span>
               <div className="flex gap-4">
                 <Heart className="h-6 w-6 text-gray-600" />
                 <Link to="/messages"><MessageCircle className="h-6 w-6 text-gray-600" /></Link>
               </div>
            </div>

            {/* 피드 리스트 컨테이너 */}
            <div className="w-full max-w-[500px] mt-16 md:mt-6 space-y-8">
                <FeedList 
                    filter={activeFilter} 
                    onPostClick={(post) => setSelectedPost(post)} 
                />
            </div>
        </main>

        {/* (3) 오른쪽 사이드바 (추천) */}
        <aside className="hidden lg:block h-[calc(100vh-6rem)] sticky top-20 mr-6 bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-rose-100 shadow-sm py-8 px-6 overflow-hidden" onClick={() => { if(isSearchOpen) setIsSearchOpen(false); }}>
            {user ? (
                <div className="flex items-center justify-between mb-8 p-4 bg-gradient-to-r from-rose-50 to-white rounded-3xl border border-rose-100/50">
                    <Link to={`/user/${myUserId}`} className="flex items-center gap-3 group">
                        <Avatar className="h-11 w-11 border-2 border-white shadow-sm ring-1 ring-rose-100">
                            <AvatarImage src={user.avatar || "/placeholder-user.jpg"} />
                            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-sm">
                            <span className="font-bold text-gray-800 group-hover:text-rose-500 transition-colors">{user.username}</span>
                            <span className="text-gray-400 text-xs">{user.name}</span>
                        </div>
                    </Link>
                    <button className="text-xs font-bold text-rose-400 hover:text-rose-600 transition-colors">전환</button>
                </div>
            ) : (
                <div className="mb-6 p-5 bg-rose-50/50 rounded-3xl text-center border border-rose-100">
                    <p className="text-sm text-gray-600 mb-3 font-medium">로그인하고 펫로그를 즐겨보세요!</p>
                    <Link to="/login" className="text-sm font-bold text-rose-500 hover:text-rose-600">로그인하기</Link>
                </div>
            )}

            <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-sm font-bold text-gray-500">회원님을 위한 추천</span>
                <button className="text-xs font-bold text-rose-400 hover:text-rose-600">모두 보기</button>
            </div>

            {/* 추천 친구 리스트 Placeholder */}
            <div className="space-y-2 px-1">
               {[1, 2].map((i) => (
                   <div key={i} className="flex items-center gap-3 p-2 hover:bg-rose-50/50 rounded-2xl transition-colors cursor-pointer group">
                      <div className="h-10 w-10 bg-rose-100/50 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-rose-300" />
                      </div>
                      <div className="flex-1 space-y-1.5">
                          <div className="h-3 bg-rose-100/30 rounded-full w-20" />
                          <div className="h-2 bg-rose-100/30 rounded-full w-12" />
                      </div>
                   </div>
               ))}
               <div className="text-xs text-rose-300 py-4 text-center font-medium">
                  새로운 친구를 찾고 있어요 🐾
               </div>
            </div>

            <div className="mt-auto pt-6 border-t border-rose-50 text-[11px] text-gray-300 space-y-3 px-2">
                <div className="flex flex-wrap gap-x-2 gap-y-1 leading-relaxed">
                    <span>소개</span><span>•</span><span>도움말</span><span>•</span><span>홍보 센터</span><span>•</span><span>API</span><span>•</span><span>채용 정보</span><span>•</span><span>개인정보처리방침</span><span>•</span><span>약관</span>
                </div>
                <div className="uppercase font-bold text-rose-200/80 tracking-wider">
                    © 2025 PETLOG FROM ROOKIES
                </div>
            </div>
        </aside>
      </div>

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