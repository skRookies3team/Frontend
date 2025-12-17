import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { TabNavigation } from "@/shared/components/tab-navigation"
import { FeedList } from "@/features/social/components/feed-list"
import { PostDetailModal } from "@/features/social/components/PostDetailModal"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { 
  Home, 
  Search, 
  TrendingUp, 
  MessageCircle, 
  PlusSquare, 
  Menu,
  User,
  Heart
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

export default function FeedPage() {
  const [activeFilter, setActiveFilter] = useState("all")
  const [selectedPost, setSelectedPost] = useState<FeedDto | null>(null)
  
  const { user } = useAuth()
  const location = useLocation()
  
  const myUserId = user ? Number(user.id) : 0;
  const { mutate: toggleLike } = useFeedLike(myUserId);

  // 사이드바 메뉴 정의
  const sidebarMenu: SidebarItem[] = [
    { id: "home", label: "홈", icon: Home, link: "/feed", isActive: location.pathname === "/feed" && activeFilter !== "popular" },
    { id: "search", label: "검색", icon: Search, link: "/explore", isActive: location.pathname === "/explore" },
    { id: "popular", label: "탐색 탭", icon: TrendingUp, action: () => setActiveFilter("popular"), isActive: activeFilter === "popular" },
    { id: "messages", label: "메시지", icon: MessageCircle, link: "/messages", isActive: location.pathname === "/messages" },
    { id: "notifications", label: "알림", icon: Heart, link: "#", isActive: false }, // 알림 페이지 미구현 시 #
    { id: "create", label: "만들기", icon: PlusSquare, link: "/feed/create", isActive: location.pathname === "/feed/create" },
    { id: "profile", label: "프로필", icon: User, isProfile: true, link: `/user/${myUserId}`, isActive: location.pathname === `/user/${myUserId}` },
  ]

  return (
    <div className="min-h-screen bg-white text-black">
      {/* 레이아웃 컨테이너: 사이드바 + 메인 + 추천 */}
      <div className="mx-auto max-w-[1200px] grid grid-cols-1 md:grid-cols-[72px_1fr] lg:grid-cols-[245px_1fr_320px]">
        
        {/* (1) 왼쪽 사이드바 (데스크톱) */}
        <aside className="hidden md:flex flex-col h-screen sticky top-0 border-r border-gray-100 px-3 py-8">
          {/* 로고 영역 */}
          <div className="mb-8 px-4 lg:block hidden">
             <span className="font-bold text-2xl italic tracking-tighter">Petlog</span>
          </div>
          <div className="mb-8 px-2 lg:hidden block text-center">
             <span className="font-bold text-xl italic">P</span>
          </div>

          {/* 네비게이션 */}
          <nav className="space-y-2 flex-1">
            {sidebarMenu.map((item) => (
                <div key={item.id}>
                    {item.link ? (
                        <Link 
                            to={item.link}
                            onClick={item.action}
                            className={`flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-all group ${item.isActive ? "font-bold" : "font-normal"}`}
                        >
                            {item.isProfile ? (
                                <Avatar className={`h-6 w-6 ${item.isActive ? "ring-2 ring-black p-[1px]" : ""}`}>
                                    <AvatarImage src={user?.avatar || "/placeholder-user.jpg"} />
                                    <AvatarFallback>Me</AvatarFallback>
                                </Avatar>
                            ) : (
                                <item.icon className={`h-6 w-6 transition-transform group-hover:scale-105 ${item.isActive ? "stroke-[3px]" : "stroke-[2px]"}`} />
                            )}
                            <span className="hidden lg:block text-base">{item.label}</span>
                        </Link>
                    ) : (
                        <button 
                            onClick={item.action}
                            className={`w-full flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-all group ${item.isActive ? "font-bold" : "font-normal"}`}
                        >
                            <item.icon className={`h-6 w-6 transition-transform group-hover:scale-105 ${item.isActive ? "stroke-[3px]" : "stroke-[2px]"}`} />
                            <span className="hidden lg:block text-base">{item.label}</span>
                        </button>
                    )}
                </div>
            ))}
          </nav>

          {/* 하단 더보기 */}
          <div className="mt-auto">
            <button className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-all">
                <Menu className="h-6 w-6" />
                <span className="hidden lg:block text-base">더 보기</span>
            </button>
          </div>
        </aside>

        {/* (2) 중앙 메인 피드 */}
        <main className="w-full min-h-screen flex flex-col items-center pt-8 md:pt-10 pb-20 px-0">
            {/* 모바일 헤더 */}
            <div className="md:hidden w-full fixed top-0 bg-white z-50 flex items-center justify-between px-4 py-3 border-b border-gray-100">
               <span className="font-bold text-xl italic">Petlog</span>
               <div className="flex gap-4">
                 <Heart className="h-6 w-6" />
                 <Link to="/messages"><MessageCircle className="h-6 w-6" /></Link>
               </div>
            </div>

            {/* 필터 탭 (옵션: 인스타그램은 없지만 편의상 유지하되 심플하게) */}
            {activeFilter !== "popular" && (
                <div className="w-full max-w-[470px] mb-6 flex gap-4 px-2 overflow-x-auto no-scrollbar">
                   {/* Story 영역처럼 보이게 하거나, 심플한 텍스트 탭 */}
                </div>
            )}

            {/* 피드 리스트 */}
            <FeedList 
                filter={activeFilter} 
                onPostClick={(post) => setSelectedPost(post)} 
            />
        </main>

        {/* (3) 오른쪽 사이드바 (추천 등) */}
        <aside className="hidden lg:block h-screen sticky top-0 py-10 px-6 w-[320px]">
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

            {/* 추천 친구 리스트 (API 연동 전 Placeholder) */}
            <div className="space-y-4">
               {/* 실제 데이터가 없으므로 비워두거나 스켈레톤 처리 */}
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
    </div>
  )
}