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
  const [activeFilter, setActiveFilter] = useState("all") // 'all' | 'popular'
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
    // [1] 상단 여백 축소: pt-24 -> pt-16 (약 64px, 헤더 바로 밑)
    <div className="min-h-screen bg-[#FDFBFD] text-slate-800 relative font-sans selection:bg-[#FF69B4] selection:text-white pt-16">
      
      {/* [2] 레이아웃 확장: max-w-7xl -> max-w-[1600px] (와이드 화면) 
          [3] 간격 축소: gap-10 -> gap-6
      */}
      <div className={`w-full max-w-[1600px] mx-auto grid transition-all duration-300 gap-6 px-4 ${
          isSearchOpen 
            ? "grid-cols-[80px_1fr] lg:grid-cols-[80px_1fr_320px]" 
            : "grid-cols-[80px_1fr] md:grid-cols-[240px_1fr] lg:grid-cols-[240px_1fr_320px]" 
      }`}>
        
        {/* [1. 왼쪽 사이드바] - Sticky top-20 (헤더와 약간의 여백) */}
        <div className="hidden md:block relative">
            <aside 
                className={`sticky top-20 h-[calc(100vh-6rem)] bg-white rounded-[2.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100 overflow-y-auto custom-scrollbar py-6 transition-all duration-300 ease-in-out z-30 ${
                isSearchOpen ? "w-[80px]" : "w-full"
                }`}
            >
                <nav className="flex flex-col space-y-3 px-3"> 
                {sidebarMenu.map((item) => {
                    const activeClass = "bg-[#FF69B4] text-white font-bold shadow-md shadow-[#FF69B4]/30"
                    const inactiveClass = "text-gray-600 hover:bg-[#FFF0F5] hover:text-[#FF69B4] font-semibold"

                    return (
                    <div key={item.id}>
                        {item.link ? (
                            <Link 
                                to={item.link}
                                onClick={item.action}
                                className={`flex items-center justify-center ${!isSearchOpen && 'xl:justify-start'} gap-4 p-3 rounded-[20px] transition-all duration-200 group ${item.isActive ? activeClass : inactiveClass}`}
                            >
                                {item.isProfile ? (
                                    <Avatar className={`h-7 w-7 transition-transform group-hover:scale-105 ${item.isActive ? "ring-2 ring-white" : ""}`}>
                                        <AvatarImage src={user?.avatar || "/placeholder-user.jpg"} />
                                        <AvatarFallback className="text-[10px] bg-white text-[#FF69B4] font-bold">Me</AvatarFallback>
                                    </Avatar>
                                ) : (
                                    <item.icon className={`h-6 w-6 transition-transform group-hover:scale-105 ${item.isActive ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
                                )}
                                {!isSearchOpen && <span className="hidden xl:block text-[15px] tracking-tight">{item.label}</span>}
                            </Link>
                        ) : (
                            <button 
                                onClick={item.action}
                                className={`w-full flex items-center justify-center ${!isSearchOpen && 'xl:justify-start'} gap-4 p-3 rounded-[20px] transition-all duration-200 group ${item.isActive ? activeClass : inactiveClass}`}
                            >
                                <item.icon className={`h-6 w-6 transition-transform group-hover:scale-105 ${item.isActive ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
                                {!isSearchOpen && <span className="hidden xl:block text-[15px] tracking-tight">{item.label}</span>}
                            </button>
                        )}
                    </div>
                )})}
                </nav>
            </aside>

            {/* [검색 패널] */}
            <div 
                className={`absolute top-0 left-[90px] h-[calc(100vh-6rem)] bg-white z-40 rounded-[2.5rem] shadow-[0_20px_60px_-10px_rgba(255,105,180,0.15)] transition-all duration-300 ease-in-out overflow-hidden border border-[#FF69B4]/10 ${
                isSearchOpen ? "w-[360px] opacity-100 visible" : "w-0 opacity-0 invisible"
                }`}
            >
                <div className="p-6 h-full flex flex-col w-[360px]">
                    <h2 className="text-xl font-black mb-6 text-[#FF69B4] tracking-tight">검색</h2>
                    <div className="relative mb-6">
                        <Input 
                            placeholder="친구 검색" 
                            className="bg-[#FFF0F5] border-none h-11 pl-4 pr-10 focus-visible:ring-2 focus-visible:ring-[#FF69B4] rounded-full text-sm transition-all placeholder:text-[#FF69B4]/50 text-gray-800 font-medium shadow-inner"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="absolute right-4 top-3 text-[#FF69B4]/60 hover:text-[#FF69B4] transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-1">
                        <div className="space-y-2">
                            {isSearchLoading ? (
                                <div className="flex justify-center py-10"><Loader2 className="animate-spin h-8 w-8 text-[#FF69B4]"/></div>
                            ) : searchResults && searchResults.length > 0 ? (
                                searchResults.map((u) => (
                                    <Link 
                                        key={u.userId} 
                                        to={`/user/${u.userId}`} 
                                        className="flex items-center gap-3 p-2.5 hover:bg-[#FFF0F5] rounded-[18px] transition-all cursor-pointer group"
                                        onClick={() => setIsSearchOpen(false)}
                                    >
                                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm group-hover:border-[#FF69B4]/30 transition-colors">
                                            <AvatarImage src={u.profileImageUrl || "/placeholder-user.jpg"} />
                                            <AvatarFallback className="bg-[#FFF0F5] text-[#FF69B4] font-bold">{u.nickname[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-gray-900">{u.nickname}</span>
                                            <span className="text-[#FF69B4] text-xs font-medium">{u.username}</span>
                                        </div>
                                    </Link>
                                ))
                            ) : searchQuery ? (
                                <p className="text-center text-[#FF69B4]/40 py-10 text-sm font-medium">검색 결과가 없어요 🥲</p>
                            ) : (
                                <div className="text-center text-[#FF69B4]/40 py-10 text-sm font-medium">
                                    검색어를 입력해보세요!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* [2. 중앙 메인 컨텐츠] 
           - 너비 확장: max-w-[700px] (기존 600px -> 700px)
        */}
        <main className="w-full max-w-[700px] mx-auto min-h-screen pb-20" onClick={() => { if(isSearchOpen) setIsSearchOpen(false); }}>
            
            {/* 모바일 헤더 */}
            <div className="md:hidden w-full fixed top-0 left-0 bg-white/95 backdrop-blur-md z-50 flex items-center justify-between px-5 py-3 border-b border-gray-100 shadow-sm">
                <span className="font-black text-xl italic text-[#FF69B4] tracking-tighter">Petlog</span>
                <div className="flex gap-4">
                    <Heart className="h-6 w-6 text-gray-800" />
                    <Link to="/messages"><MessageCircle className="h-6 w-6 text-gray-800" /></Link>
                </div>
            </div>

            {/* 피드 영역 - 상단 여백 제거 (Sticky에 맞춤) */}
            <div className="mt-4 md:mt-0">
                {activeFilter === 'popular' ? (
                    <PopularFeedGrid />
                ) : (
                    <div className="space-y-8">
                        <FeedList 
                            filter={activeFilter} 
                            onPostClick={(post) => setSelectedPost(post)} 
                        />
                    </div>
                )}
            </div>
        </main>

        {/* [3. 오른쪽 추천 사이드바] - Sticky top-20 */}
        <div className="hidden lg:block relative">
            <aside 
                className="sticky top-20 h-[calc(100vh-6rem)] bg-white rounded-[2.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100 overflow-y-auto custom-scrollbar py-8 px-6 transition-all duration-300"
                onClick={() => { if(isSearchOpen) setIsSearchOpen(false); }}
            >
                {user ? (
                    <div className="flex items-center justify-between mb-8 p-3.5 bg-[#FFF0F5]/40 rounded-[20px] border border-[#FF69B4]/10">
                        <Link to={`/user/${myUserId}`} className="flex items-center gap-3 group">
                            <Avatar className="h-10 w-10 border-[2px] border-white shadow-sm bg-white">
                                <AvatarImage src={user.avatar || "/placeholder-user.jpg"} />
                                <AvatarFallback className="text-[#FF69B4] font-bold bg-[#FFF0F5]">{user.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="font-bold text-sm text-gray-900 group-hover:text-[#FF69B4] transition-colors">{user.username}</span>
                                <span className="text-gray-400 text-xs font-medium">{user.name}</span>
                            </div>
                        </Link>
                        <button className="text-xs font-bold text-[#FF69B4] hover:text-[#FF1493] transition-colors px-2 py-1 hover:bg-[#FF69B4]/10 rounded-lg">전환</button>
                    </div>
                ) : (
                    <div className="mb-6 p-5 bg-[#FFF0F5] rounded-[20px] text-center border border-[#FF69B4]/10">
                        <p className="text-sm text-gray-600 mb-3 font-bold">로그인하고 펫로그를 즐겨보세요!</p>
                        <Link to="/login" className="block w-full py-2 bg-[#FF69B4] text-white text-sm font-bold rounded-xl hover:bg-[#FF1493] shadow-md shadow-[#FF69B4]/20 transition-all">로그인</Link>
                    </div>
                )}

                <div className="flex items-center justify-between mb-4 px-1">
                    <span className="text-sm font-bold text-gray-500">회원님을 위한 추천</span>
                    <button className="text-xs font-bold text-gray-900 hover:text-[#FF69B4] transition-colors">모두 보기</button>
                </div>

                <div className="space-y-2">
                    {[1, 2].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-2 hover:bg-[#FAFAFA] rounded-[18px] transition-colors cursor-pointer group">
                            <div className="h-9 w-9 bg-[#F5F5F5] rounded-full flex items-center justify-center text-gray-300 group-hover:bg-[#FFF0F5] group-hover:text-[#FF69B4] transition-colors">
                                <User className="h-4 w-4 stroke-[2.5px]" />
                            </div>
                            <div className="flex-1 space-y-1.5">
                                <div className="h-3 bg-gray-100 rounded-full w-20 group-hover:bg-[#FFF0F5] transition-colors" />
                                <div className="h-2 bg-gray-50 rounded-full w-12 group-hover:bg-[#FFF0F5] transition-colors" />
                            </div>
                        </div>
                    ))}
                    <div className="text-xs text-[#FF69B4] py-4 text-center font-bold bg-[#FFF0F5]/30 rounded-[18px] mt-4">
                        새로운 친구를 찾고 있어요 🐾
                    </div>
                </div>

                <div className="mt-auto pt-6 border-t border-gray-50 text-[10px] text-gray-300 space-y-2 px-1">
                    <div className="flex flex-wrap gap-x-2 gap-y-1 leading-relaxed font-medium">
                        <span>소개</span><span>•</span><span>도움말</span><span>•</span><span>홍보 센터</span><span>•</span><span>API</span><span>•</span><span>채용 정보</span><span>•</span><span>개인정보처리방침</span><span>•</span><span>약관</span>
                    </div>
                    <div className="uppercase font-extrabold text-[#FF69B4]/20 tracking-widest">
                        © 2025 PETLOG FROM ROOKIES
                    </div>
                </div>
            </aside>
        </div>
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