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
  X
} from 'lucide-react'
import { useAuth } from "@/features/auth/context/auth-context"
import { useFeedLike } from "../hooks/use-feed-query"
import { useUserSearch } from "../hooks/use-search-query" // 실제 검색 훅 사용
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
  
  // UI States
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  const { user } = useAuth()
  const location = useLocation()
  
  const myUserId = user ? Number(user.id) : 0;
  const { mutate: toggleLike } = useFeedLike(myUserId);

  // 실제 검색 훅 연결
  const { data: searchResults, isLoading: isSearchLoading } = useUserSearch(searchQuery);

  // 사이드바 메뉴 정의
  const sidebarMenu: SidebarItem[] = [
    { 
      id: "home", 
      label: "홈", 
      icon: Home, 
      link: "/feed", 
      action: () => setIsSearchOpen(false),
      isActive: location.pathname === "/feed" && !isSearchOpen 
    },
    { 
      id: "search", 
      label: "검색", 
      icon: Search, 
      action: () => setIsSearchOpen(!isSearchOpen), 
      isActive: isSearchOpen 
    },
    { 
      id: "popular", 
      label: "인기게시물", 
      icon: TrendingUp, 
      action: () => { setActiveFilter("popular"); setIsSearchOpen(false); }, 
      isActive: activeFilter === "popular" && !isSearchOpen
    },
    { 
      id: "messages", 
      label: "메시지", 
      icon: MessageCircle, 
      link: "/messages", 
      isActive: location.pathname === "/messages" 
    },
    { 
      id: "create", 
      label: "만들기", 
      icon: PlusSquare, 
      action: () => setIsCreateOpen(true), 
      isActive: false 
    },
    { 
      id: "profile", 
      label: "프로필", 
      icon: User, 
      isProfile: true, 
      link: `/user/${myUserId}`, 
      isActive: location.pathname === `/user/${myUserId}` 
    },
  ]

  return (
    <div className="min-h-screen bg-white text-black relative">
      
      {/* 1. 검색 패널 (슬라이드 애니메이션) */}
      <div 
        className={`fixed top-16 left-[73px] h-[calc(100vh-4rem)] bg-white z-40 border-r border-gray-100 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden ${
          isSearchOpen ? "w-[397px] translate-x-0 opacity-100" : "w-0 -translate-x-full opacity-0"
        }`}
      >
        <div className="p-6 h-full flex flex-col w-[397px]">
           <h2 className="text-2xl font-bold mb-8">검색</h2>
           <div className="relative mb-6">
              <Input 
                placeholder="검색" 
                className="bg-gray-100 border-none h-10 pl-4 pr-10 focus-visible:ring-0 rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-2.5 text-gray-400">
                      <X className="h-4 w-4" />
                  </button>
              )}
           </div>
           
           <div className="flex-1 overflow-y-auto">
               <div className="flex justify-between items-center mb-4">
                   <span className="font-semibold text-base">검색 결과</span>
               </div>
               
               <div className="space-y-2">
                  {/* 검색 로딩 및 결과 처리 */}
                  {isSearchLoading ? (
                      <div className="flex justify-center py-10 text-gray-400">검색 중...</div>
                  ) : searchResults && searchResults.length > 0 ? (
                      searchResults.map((u) => (
                        <Link 
                            key={u.userId} 
                            to={`/user/${u.userId}`} 
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                            onClick={() => setIsSearchOpen(false)}
                        >
                            <Avatar className="h-11 w-11">
                                <AvatarImage src={u.profileImageUrl || "/placeholder-user.jpg"} />
                                <AvatarFallback>{u.nickname[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="font-semibold text-sm">{u.nickname}</span>
                                <span className="text-gray-500 text-sm">{u.username} {u.petName ? `• ${u.petName}` : ''}</span>
                            </div>
                        </Link>
                      ))
                  ) : searchQuery ? (
                      <p className="text-center text-gray-400 py-10">검색 결과가 없습니다.</p>
                  ) : (
                      <div className="text-center text-gray-400 py-10 text-sm">
                          검색어를 입력하세요.
                      </div>
                  )}
               </div>
           </div>
        </div>
      </div>


      {/* 레이아웃 컨테이너 
          - 수정: w-full (화면 꽉 차게) 적용하여 왼쪽 사이드바가 화면 끝에 붙도록 함
          - grid-cols: 검색창 열림 여부에 따라 사이드바 너비 조정
      */}
      <div className={`w-full grid grid-cols-1 md:grid-cols-[72px_1fr] transition-all duration-300 ${
          isSearchOpen 
            ? "lg:grid-cols-[72px_1fr_320px]" 
            : "lg:grid-cols-[200px_1fr_320px]"
      }`}>
        
        {/* (1) 왼쪽 사이드바 (데스크톱) */}
        {/* 수정: sticky top-16 (헤더 높이만큼 띄움), h-[calc(100vh-4rem)] (헤더 제외 높이) 적용 */}
        <aside className="hidden md:flex flex-col h-[calc(100vh-4rem)] sticky top-16 border-r border-gray-100 px-3 py-8 z-50 bg-white">
          
          {/* 로고 영역 삭제됨 */}

          {/* 네비게이션 */}
          <nav className="space-y-2 flex-1 pt-4"> 
            {sidebarMenu.map((item) => (
                <div key={item.id}>
                    {item.link ? (
                        <Link 
                            to={item.link}
                            onClick={item.action}
                            className={`flex items-center justify-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-all group w-full ${item.isActive ? "font-bold" : "font-normal"}`}
                        >
                            {item.isProfile ? (
                                <Avatar className={`h-6 w-6 ${item.isActive ? "ring-2 ring-black p-[1px]" : ""}`}>
                                    <AvatarImage src={user?.avatar || "/placeholder-user.jpg"} />
                                    <AvatarFallback>Me</AvatarFallback>
                                </Avatar>
                            ) : (
                                <item.icon className={`h-6 w-6 transition-transform group-hover:scale-105 ${item.isActive ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
                            )}
                            {/* 검색 열리면 텍스트 숨김 (lg 화면에서도) */}
                            <span className={`hidden lg:block text-base ${isSearchOpen ? 'lg:hidden' : ''}`}>{item.label}</span>
                        </Link>
                    ) : (
                        <button 
                            onClick={item.action}
                            className={`flex items-center justify-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-all group w-full ${item.isActive ? "font-bold" : "font-normal"}`}
                        >
                            <item.icon className={`h-6 w-6 transition-transform group-hover:scale-105 ${item.isActive ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
                            <span className={`hidden lg:block text-base ${isSearchOpen ? 'lg:hidden' : ''}`}>{item.label}</span>
                        </button>
                    )}
                </div>
            ))}
          </nav>

          {/* 더 보기 버튼 삭제됨 */}
        </aside>

        {/* (2) 중앙 메인 피드 */}
        <main className="w-full min-h-screen flex flex-col items-center pt-8 md:pt-10 pb-20 px-0" onClick={() => { if(isSearchOpen) setIsSearchOpen(false); }}>
            {/* 모바일 헤더 */}
            <div className="md:hidden w-full fixed top-0 bg-white z-50 flex items-center justify-between px-4 py-3 border-b border-gray-100">
               <span className="font-bold text-xl italic">Petlog</span>
               <div className="flex gap-4">
                 <Heart className="h-6 w-6" />
                 <Link to="/messages"><MessageCircle className="h-6 w-6" /></Link>
               </div>
            </div>

            {/* 피드 리스트 */}
            <FeedList 
                filter={activeFilter} 
                onPostClick={(post) => setSelectedPost(post)} 
            />
        </main>

        {/* (3) 오른쪽 사이드바 (추천 등) */}
        {/* 수정: sticky top-16 및 높이 조정하여 헤더 침범 방지 */}
        <aside className="hidden lg:block h-[calc(100vh-4rem)] sticky top-16 py-10 px-6 w-[320px]" onClick={() => { if(isSearchOpen) setIsSearchOpen(false); }}>
            {user ? (
                <div className="flex items-center justify-between mb-6">
                    <Link to={`/user/${myUserId}`} className="flex items-center gap-3 group">
                        <Avatar className="h-11 w-11">
                            <AvatarImage src={user.avatar || "/placeholder-user.jpg"} />
                            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-sm">
                            <span className="font-bold text-gray-900">{user.username}</span>
                            <span className="text-gray-500">{user.name}</span>
                        </div>
                    </Link>
                    <button className="text-xs font-bold text-blue-500 hover:text-blue-700">전환</button>
                </div>
            ) : (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-2">로그인하고 더 많은 기능을 즐겨보세요.</p>
                    <Link to="/login" className="text-sm font-bold text-blue-500">로그인하기</Link>
                </div>
            )}

            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-gray-500">회원님을 위한 추천</span>
                <button className="text-xs font-bold text-gray-900 hover:opacity-70">모두 보기</button>
            </div>

            {/* 추천 친구 리스트 */}
            <div className="space-y-4">
               <div className="text-xs text-gray-400 py-4 text-center">
                  추천할 친구를 찾고 있어요...
               </div>
            </div>

            <div className="mt-8 text-xs text-gray-300 space-y-4">
                <div className="flex flex-wrap gap-x-2 gap-y-1">
                    <span>소개</span><span>•</span><span>도움말</span><span>•</span><span>홍보 센터</span><span>•</span><span>API</span><span>•</span><span>채용 정보</span><span>•</span><span>개인정보처리방침</span><span>•</span><span>약관</span>
                </div>
                <div className="uppercase">
                    © 2025 PETLOG FROM ROOKIES
                </div>
            </div>
        </aside>
      </div>

      {/* 모바일 하단 탭 */}
      <div className="md:hidden">
          <TabNavigation />
      </div>

      {/* 게시물 상세 모달 */}
      {selectedPost && (
        <PostDetailModal
           isOpen={!!selectedPost}
           onClose={() => setSelectedPost(null)}
           post={selectedPost}
           onLikeToggle={(id) => toggleLike(id)}
        />
      )}

      {/* 만들기 모달 */}
      <FeedCreateModal 
         isOpen={isCreateOpen}
         onClose={() => setIsCreateOpen(false)}
      />
    </div>
  )
}