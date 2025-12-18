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
  Menu,
  User,
  Heart,
  X
} from 'lucide-react'
import { useAuth } from "@/features/auth/context/auth-context"
import { useFeedLike } from "../hooks/use-feed-query"
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

// 임시 검색 데이터
const MOCK_SEARCH_USERS = [
  { id: "1", name: "김민수", username: "minsu_kim", avatar: "/man-avatar.png", petName: "초코" },
  { id: "2", name: "이수진", username: "sujin_lee", avatar: "/woman-avatar-2.png", petName: "몽이" },
  { id: "3", name: "박지훈", username: "jihun_park", avatar: "/man-avatar-2.png", petName: "바둑이" },
  { id: "4", name: "최유나", username: "yuna_choi", avatar: "/woman-avatar-3.png", petName: "루비" },
  { id: "5", name: "정태현", username: "taehyun_j", avatar: "/man-profile.png", petName: "뽀삐" },
]

export default function FeedPage() {
  const [activeFilter, setActiveFilter] = useState("all")
  const [selectedPost, setSelectedPost] = useState<FeedDto | null>(null)
  
  // UI States for Search & Create
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  const { user } = useAuth()
  const location = useLocation()
  
  const myUserId = user ? Number(user.id) : 0;
  const { mutate: toggleLike } = useFeedLike(myUserId);

  const filteredUsers = MOCK_SEARCH_USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.petName.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
      
      {/* 1. 검색 패널 (슬라이드 애니메이션)
          - z-40: 사이드바(z-50) 뒤에 숨었다가, 사이드바가 좁아지면 옆으로 보이게 처리
          - left-[73px]: 아이콘형 사이드바 너비만큼 띄움
      */}
      <div 
        className={`fixed top-0 left-[73px] h-full bg-white z-40 border-r border-gray-100 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden ${
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
                   <span className="font-semibold text-base">최근 검색 항목</span>
                   <button className="text-sm text-blue-500 hover:text-blue-700 font-semibold">모두 지우기</button>
               </div>
               
               {/* 검색 결과 목록 */}
               <div className="space-y-2">
                  {searchQuery && filteredUsers.length === 0 ? (
                      <p className="text-center text-gray-400 py-10">검색 결과가 없습니다.</p>
                  ) : filteredUsers.map((u) => (
                      <Link 
                        key={u.id} 
                        to={`/user/${u.id}`} 
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                        onClick={() => setIsSearchOpen(false)}
                      >
                         <Avatar className="h-11 w-11">
                             <AvatarImage src={u.avatar} />
                             <AvatarFallback>{u.name[0]}</AvatarFallback>
                         </Avatar>
                         <div className="flex flex-col">
                             <span className="font-semibold text-sm">{u.username}</span>
                             <span className="text-gray-500 text-sm">{u.name} • {u.petName}</span>
                         </div>
                      </Link>
                  ))}
                  {!searchQuery && (
                      <div className="text-center text-gray-400 py-10 text-sm">
                          최근 검색 내역이 없습니다.
                      </div>
                  )}
               </div>
           </div>
        </div>
      </div>


      {/* 레이아웃 컨테이너 
          - lg:grid-cols-... : 검색창이 열려있으면(isSearchOpen) 사이드바 영역을 72px로 고정(좁힘), 아니면 200px(넓힘)
      */}
      <div className={`mx-auto max-w-[1500px] grid grid-cols-1 md:grid-cols-[72px_1fr] transition-all duration-300 ${
          isSearchOpen 
            ? "lg:grid-cols-[72px_1fr_320px]" 
            : "lg:grid-cols-[200px_1fr_320px]"
      }`}>
        
        {/* (1) 왼쪽 사이드바 (데스크톱) */}
        <aside className="hidden md:flex flex-col h-screen sticky top-0 border-r border-gray-100 px-3 py-8 z-50 bg-white">
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

          <div className="mt-auto">
            <button className="flex items-center justify-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-all w-full">
                <Menu className="h-6 w-6" />
                <span className={`hidden lg:block text-base ${isSearchOpen ? 'lg:hidden' : ''}`}>더 보기</span>
            </button>
          </div>
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
        <aside className="hidden lg:block h-screen sticky top-0 py-10 px-6 w-[320px]" onClick={() => { if(isSearchOpen) setIsSearchOpen(false); }}>
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