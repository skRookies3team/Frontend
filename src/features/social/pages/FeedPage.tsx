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
    <div className="min-h-screen bg-[#FDFBFD] text-slate-800 relative font-sans selection:bg-[#FF69B4] selection:text-white">
      
      {/* [1. 왼쪽 고정 사이드바] 
        - position: fixed 로 변경하여 스크롤 영향 없음
        - z-index: 50으로 최상위
      */}
      <aside 
        className={`hidden md:flex flex-col fixed top-4 left-4 h-[calc(100vh-2rem)] bg-white rounded-[2.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)] border border-gray-100 z-50 overflow-hidden py-8 transition-all duration-300 ease-in-out ${
          isSearchOpen ? "w-[96px]" : "w-[260px]"
        }`}
      >
        <nav className="space-y-4 px-4 flex-1 flex flex-col pt-4"> 
          {sidebarMenu.map((item) => {
              const activeClass = "bg-[#FF69B4] text-white font-bold shadow-md shadow-[#FF69B4]/30"
              // [수정] 텍스트 색상 진하게(text-gray-600), 폰트 굵게(font-semibold)
              const inactiveClass = "text-gray-600 hover:bg-[#FFF0F5] hover:text-[#FF69B4] font-semibold"

              return (
              <div key={item.id}>
                  {item.link ? (
                      <Link 
                          to={item.link}
                          onClick={item.action}
                          className={`flex items-center justify-center ${!isSearchOpen && 'lg:justify-start'} gap-5 p-3.5 rounded-[22px] transition-all duration-200 group ${item.isActive ? activeClass : inactiveClass}`}
                      >
                          {item.isProfile ? (
                              <Avatar className={`h-7 w-7 transition-transform group-hover:scale-105 ${item.isActive ? "ring-2 ring-white" : ""}`}>
                                  <AvatarImage src={user?.avatar || "/placeholder-user.jpg"} />
                                  <AvatarFallback className="text-xs bg-white text-[#FF69B4]">Me</AvatarFallback>
                              </Avatar>
                          ) : (
                              <item.icon className={`h-[26px] w-[26px] transition-transform group-hover:scale-105 ${item.isActive ? "stroke-[2.5px]" : "stroke-[2.5px]"}`} />
                          )}
                          {!isSearchOpen && <span className="hidden lg:block text-[16px] tracking-tight">{item.label}</span>}
                      </Link>
                  ) : (
                      <button 
                          onClick={item.action}
                          className={`w-full flex items-center justify-center ${!isSearchOpen && 'lg:justify-start'} gap-5 p-3.5 rounded-[22px] transition-all duration-200 group ${item.isActive ? activeClass : inactiveClass}`}
                      >
                          <item.icon className={`h-[26px] w-[26px] transition-transform group-hover:scale-105 ${item.isActive ? "stroke-[2.5px]" : "stroke-[2.5px]"}`} />
                          {!isSearchOpen && <span className="hidden lg:block text-[16px] tracking-tight">{item.label}</span>}
                      </button>
                  )}
              </div>
          )})}
        </nav>
      </aside>

      {/* [2. 검색 패널 (슬라이드)] 
        - 사이드바 바로 옆(left-[120px])에서 나옴
        - z-index: 40 (사이드바보다 아래)
      */}
      <div 
        className={`fixed top-4 left-[120px] h-[calc(100vh-2rem)] bg-white z-40 rounded-[2.5rem] shadow-[0_20px_60px_-10px_rgba(255,105,180,0.15)] transition-all duration-300 ease-in-out overflow-hidden border border-[#FF69B4]/10 ${
          isSearchOpen ? "w-[360px] translate-x-0 opacity-100" : "w-0 -translate-x-10 opacity-0 pointer-events-none"
        }`}
      >
        <div className="p-8 h-full flex flex-col w-[360px]">
           <h2 className="text-2xl font-black mb-8 text-[#FF69B4] tracking-tight">검색</h2>
           <div className="relative mb-6">
              <Input 
                placeholder="친구 검색" 
                className="bg-[#FFF0F5] border-none h-12 pl-5 pr-10 focus-visible:ring-2 focus-visible:ring-[#FF69B4] rounded-full text-[15px] transition-all placeholder:text-[#FF69B4]/40 text-gray-800 font-medium shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-4 top-3.5 text-[#FF69B4]/60 hover:text-[#FF69B4] transition-colors">
                      <X className="h-5 w-5" />
                  </button>
              )}
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar px-1">
               <div className="space-y-3">
                  {isSearchLoading ? (
                      <div className="flex justify-center py-10"><Loader2 className="animate-spin h-8 w-8 text-[#FF69B4]"/></div>
                  ) : searchResults && searchResults.length > 0 ? (
                      searchResults.map((u) => (
                        <Link 
                            key={u.userId} 
                            to={`/user/${u.userId}`} 
                            className="flex items-center gap-4 p-3 hover:bg-[#FFF0F5] rounded-[20px] transition-all cursor-pointer group"
                            onClick={() => setIsSearchOpen(false)}
                        >
                            <Avatar className="h-12 w-12 border-2 border-white shadow-sm group-hover:border-[#FF69B4]/30 transition-colors">
                                <AvatarImage src={u.profileImageUrl || "/placeholder-user.jpg"} />
                                <AvatarFallback className="bg-[#FFF0F5] text-[#FF69B4] font-bold">{u.nickname[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="font-bold text-[15px] text-gray-900">{u.nickname}</span>
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

      {/* [3. 메인 컨텐츠 영역]
        - ml (Margin Left)를 동적으로 계산하여 사이드바/검색창에 가려지지 않게 함
        - 기본: ml-[280px]
        - 검색 열림: ml-[490px] (사이드바 줄어듬 + 검색창 너비)
      */}
      <div className={`transition-all duration-300 ease-in-out ${
          isSearchOpen ? "md:ml-[490px]" : "md:ml-[290px]"
      }`}>
        <div className="w-full max-w-[1000px] flex gap-8 pr-4">
          
          {/* 중앙 피드 영역 */}
          <main className="flex-1 min-h-screen pt-4 pb-24" onClick={() => { if(isSearchOpen) setIsSearchOpen(false); }}>
              
              {/* 모바일 헤더 */}
              <div className="md:hidden w-full fixed top-0 left-0 bg-white/95 backdrop-blur-md z-50 flex items-center justify-between px-5 py-4 border-b border-gray-100 shadow-sm">
                 <span className="font-black text-xl italic text-[#FF69B4] tracking-tighter">Petlog</span>
                 <div className="flex gap-5">
                   <Heart className="h-[26px] w-[26px] text-gray-800" />
                   <Link to="/messages"><MessageCircle className="h-[26px] w-[26px] text-gray-800" /></Link>
                 </div>
              </div>

              {/* 컨텐츠 렌더링 (인기 탭 vs 일반 피드) */}
              <div className="w-full max-w-[600px] mx-auto mt-16 md:mt-4">
                  {activeFilter === 'popular' ? (
                     // 인기 게시물 그리드
                     <PopularFeedGrid />
                  ) : (
                     // 일반 피드 리스트
                     <div className="space-y-10">
                        <FeedList 
                            filter={activeFilter} 
                            onPostClick={(post) => setSelectedPost(post)} 
                        />
                     </div>
                  )}
              </div>
          </main>

          {/* (3) 오른쪽 추천 사이드바 (화면 넓을 때만 보임) */}
          <aside className="hidden xl:block h-[calc(100vh-2rem)] sticky top-4 w-[340px] bg-white rounded-[2.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)] border border-gray-100 py-8 px-7 overflow-hidden" onClick={() => { if(isSearchOpen) setIsSearchOpen(false); }}>
              {user ? (
                  <div className="flex items-center justify-between mb-10 p-4 bg-[#FFF0F5]/40 rounded-[24px] border border-[#FF69B4]/10">
                      <Link to={`/user/${myUserId}`} className="flex items-center gap-3.5 group">
                          <Avatar className="h-[52px] w-[52px] border-[3px] border-white shadow-sm bg-white">
                              <AvatarImage src={user.avatar || "/placeholder-user.jpg"} />
                              <AvatarFallback className="text-[#FF69B4] font-bold bg-[#FFF0F5]">{user.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                              <span className="font-bold text-[15px] text-gray-900 group-hover:text-[#FF69B4] transition-colors">{user.username}</span>
                              <span className="text-gray-400 text-xs font-medium">{user.name}</span>
                          </div>
                      </Link>
                      <button className="text-[13px] font-bold text-[#FF69B4] hover:text-[#FF1493] transition-colors px-2 py-1 hover:bg-[#FF69B4]/10 rounded-lg">전환</button>
                  </div>
              ) : (
                  <div className="mb-8 p-6 bg-[#FFF0F5] rounded-[24px] text-center border border-[#FF69B4]/10">
                      <p className="text-sm text-gray-600 mb-4 font-bold">로그인하고 펫로그를 즐겨보세요!</p>
                      <Link to="/login" className="block w-full py-2.5 bg-[#FF69B4] text-white text-sm font-bold rounded-xl hover:bg-[#FF1493] shadow-md shadow-[#FF69B4]/20 transition-all">로그인하기</Link>
                  </div>
              )}

              <div className="flex items-center justify-between mb-5 px-1">
                  <span className="text-[15px] font-bold text-gray-500">회원님을 위한 추천</span>
                  <button className="text-[13px] font-bold text-gray-900 hover:text-[#FF69B4] transition-colors">모두 보기</button>
              </div>

              {/* 추천 친구 리스트 Placeholder */}
              <div className="space-y-3">
                 {[1, 2].map((i) => (
                     <div key={i} className="flex items-center gap-3.5 p-2.5 hover:bg-[#FAFAFA] rounded-[20px] transition-colors cursor-pointer group">
                        <div className="h-11 w-11 bg-[#F5F5F5] rounded-full flex items-center justify-center text-gray-300 group-hover:bg-[#FFF0F5] group-hover:text-[#FF69B4] transition-colors">
                            <User className="h-5 w-5 stroke-[2.5px]" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="h-3.5 bg-gray-100 rounded-full w-24 group-hover:bg-[#FFF0F5] transition-colors" />
                            <div className="h-2.5 bg-gray-50 rounded-full w-16 group-hover:bg-[#FFF0F5] transition-colors" />
                        </div>
                     </div>
                 ))}
                 <div className="text-xs text-[#FF69B4] py-6 text-center font-bold bg-[#FFF0F5]/30 rounded-[20px] mt-4">
                    새로운 친구를 찾고 있어요 🐾
                 </div>
              </div>

              <div className="mt-auto pt-8 border-t border-gray-50 text-[11px] text-gray-300 space-y-3 px-1">
                  <div className="flex flex-wrap gap-x-2 gap-y-1.5 leading-relaxed font-medium">
                      <span>소개</span><span>•</span><span>도움말</span><span>•</span><span>홍보 센터</span><span>•</span><span>API</span><span>•</span><span>채용 정보</span><span>•</span><span>개인정보처리방침</span><span>•</span><span>약관</span>
                  </div>
                  <div className="uppercase font-extrabold text-[#FF69B4]/20 tracking-widest text-[10px]">
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