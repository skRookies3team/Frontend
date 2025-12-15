import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { TabNavigation } from "@/shared/components/tab-navigation"
import { FeedList } from "@/features/social/components/feed-list"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { Badge } from "@/shared/ui/badge"
import { 
  Home, 
  Search, 
  TrendingUp, 
  MessageCircle, 
  PlusSquare, 
  Menu,
  User
} from 'lucide-react'
import { useAuth } from "@/features/auth/context/auth-context"

// 사이드바 메뉴 항목들의 타입을 정의합니다 (TypeScript 에러 방지용)
interface SidebarItem {
  id: string;
  label: string;
  icon: any;
  link?: string;
  action?: () => void;
  isActive: boolean;
  badge?: number;
  isProfile?: boolean;
}

export default function FeedPage() {
  // 1. 상태 관리 (State)
  // activeFilter: 현재 어떤 피드를 보고 있는지 저장합니다. ('all', 'my-posts', 'friends')
  const [activeFilter, setActiveFilter] = useState("all")
  
  // user: 로그인한 사용자 정보를 가져옵니다. (AuthContext 사용)
  const { user } = useAuth()
  
  // location: 현재 URL 경로 정보를 가져옵니다. (메뉴 활성화 표시에 사용)
  const location = useLocation()
  
  // 내 유저 ID (로그인 안 했으면 0)
  const myUserId = user?.id || 0;

  // 2. 사이드바 메뉴 데이터 정의
  // 배열로 관리하면 나중에 메뉴를 추가하거나 뺄 때 편합니다.
  const sidebarMenu: SidebarItem[] = [
    { 
      id: "home", 
      label: "홈", 
      icon: Home, 
      link: "/feed",
      isActive: location.pathname === "/feed" && activeFilter !== "popular"
    },
    { 
      id: "search", 
      label: "검색", 
      icon: Search, 
      link: "/explore",
      isActive: location.pathname === "/explore"
    },
    { 
      id: "popular", 
      label: "인기", 
      icon: TrendingUp, 
      // 인기 메뉴는 페이지 이동 대신 필터를 변경합니다.
      action: () => setActiveFilter("popular"),
      isActive: activeFilter === "popular"
    },
    { 
      id: "messages", 
      label: "메시지", 
      icon: MessageCircle, 
      badge: 3, // 안 읽은 메시지 수 (예시)
      link: "/messages",
      isActive: location.pathname === "/messages"
    },
    { 
      id: "create", 
      label: "만들기", 
      icon: PlusSquare, 
      link: "/feed/create",
      isActive: location.pathname === "/feed/create"
    },
    { 
      id: "profile", 
      label: "프로필", 
      icon: User, 
      isProfile: true, // 프로필은 아이콘 대신 사진을 씁니다.
      link: `/user/${myUserId}`,
      isActive: location.pathname === `/user/${myUserId}`
    },
  ]

  // 상단 탭 필터 목록
  const filters = [
    { id: "all", label: "전체" },
    { id: "my-posts", label: "내 게시물" },
    { id: "friends", label: "팔로잉" },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* 전체 컨테이너: 최대 너비를 제한하고 중앙 정렬합니다. */}
      <div className="mx-auto max-w-[1400px]"> {/* 기존보다 더 넓게 확장 */}
        
        {/* Grid 레이아웃 설정 (반응형)
          - md(태블릿): 왼쪽 사이드바(240px) + 나머지(1fr)
          - lg(데스크톱): 왼쪽(240px) + 나머지(1fr) + 오른쪽(320px) 
        */}
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[240px_1fr_320px] gap-10 md:px-4 pt-6">
          
          {/* =========================================
              (1) 왼쪽 사이드바 영역 (데스크톱용)
             ========================================= */}
          <aside className="hidden md:block">
            {/* sticky: 스크롤을 내려도 화면 상단(top-24)에 딱 붙어있게 만듭니다. */}
            <div className="sticky top-24 flex flex-col gap-2 h-[calc(100vh-8rem)]">
              <nav className="space-y-1">
                {sidebarMenu.map((item) => {
                  const Icon = item.icon
                  const isBold = item.isActive // 현재 메뉴가 선택되었는지 확인

                  const content = (
                    <div 
                      className={`flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-200 group
                        ${isBold ? "bg-gray-100 font-bold text-gray-900" : "text-gray-700 hover:bg-gray-50"}
                      `}
                    >
                      {item.isProfile ? (
                        // 프로필 메뉴일 경우 아바타 표시
                        <Avatar className={`h-7 w-7 border transition-all ${isBold ? "border-black ring-1 ring-black" : "border-gray-200"}`}>
                          <AvatarImage src={user?.avatar || "/diverse-woman-avatar.png"} alt="프로필" />
                          <AvatarFallback>{user?.name?.[0] || "Me"}</AvatarFallback>
                        </Avatar>
                      ) : (
                        // 일반 메뉴일 경우 아이콘 표시
                        <div className="relative">
                          <Icon className={`h-6 w-6 transition-transform group-hover:scale-110 ${isBold ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
                          {item.badge && (
                            <Badge className="absolute -top-1 -right-2 h-4 min-w-[16px] px-1 rounded-full bg-rose-500 border-2 border-white text-[10px] text-white flex items-center justify-center">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                      )}
                      <span className="text-base">{item.label}</span>
                    </div>
                  )

                  // 링크가 있으면 Link 컴포넌트로, 아니면 button으로 렌더링
                  if (item.link) {
                    return <Link key={item.id} to={item.link}>{content}</Link>
                  }
                  return <button key={item.id} onClick={item.action} className="w-full text-left">{content}</button>
                })}
              </nav>

              {/* 하단 더보기 버튼 */}
              <div className="mt-auto">
                <button className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-gray-700 hover:bg-gray-50 transition-all">
                  <Menu className="h-6 w-6" />
                  <span className="text-base">더 보기</span>
                </button>
              </div>
            </div>
          </aside>

          {/* =========================================
              (2) 중앙 메인 컨텐츠 영역 (피드)
             ========================================= */}
          {/* max-w-[800px]: 중앙 영역 너비를 800px로 넓게 설정 */}
          <main className="w-full max-w-[800px] mx-auto min-h-screen">
            
            {/* 모바일용 상단 헤더 (로고, 메시지 아이콘) */}
            <div className="md:hidden flex items-center justify-between px-4 pb-4">
               <span className="font-bold text-lg italic bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                 Petlog
               </span>
               <div className="flex gap-4">
                 <Link to="/messages">
                    <MessageCircle className="h-6 w-6 text-gray-800" />
                 </Link>
               </div>
            </div>

            {/* 필터 탭 (전체 / 내 게시물 / 팔로잉) */}
            {activeFilter !== "popular" && (
                <div className="mb-6 flex justify-start border-b border-gray-100">
                   <div className="flex gap-8 px-2">
                      {filters.map((filter) => (
                        <button
                          key={filter.id}
                          onClick={() => setActiveFilter(filter.id)} // 클릭 시 activeFilter 상태 변경
                          className={`pb-3 text-sm font-semibold transition-all relative ${
                            activeFilter === filter.id ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          {filter.label}
                          {/* 선택된 탭 아래에 검은색 밑줄 표시 */}
                          {activeFilter === filter.id && (
                             <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black rounded-t-full" />
                          )}
                        </button>
                      ))}
                   </div>
                </div>
            )}

            {/* ⭐️ 실제 피드 목록을 보여주는 컴포넌트 */}
            {/* activeFilter 값을 props로 전달해서 그에 맞는 피드를 불러오게 함 */}
            <div className="pb-20">
               <FeedList filter={activeFilter} />
            </div>
          </main>

          {/* =========================================
              (3) 오른쪽 사이드바 영역 (데스크톱용)
             ========================================= */}
          <aside className="hidden lg:block">
             <div className="sticky top-24 w-[320px]">
                {/* 내 프로필 요약 카드 */}
                <div className="flex items-center justify-between mb-6">
                   <Link to={`/user/${myUserId}`} className="flex items-center gap-3 group">
                      <Avatar className="h-12 w-12 border border-gray-200">
                         <AvatarImage src={user?.avatar} />
                         <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                         <span className="text-sm font-bold text-gray-900 group-hover:text-gray-600 transition-colors">
                            {user?.username || "guest"}
                         </span>
                         <span className="text-sm text-gray-500">{user?.name || "게스트"}</span>
                      </div>
                   </Link>
                   <Link to="/login" className="text-xs font-bold text-blue-500 hover:text-blue-700">전환</Link>
                </div>

                {/* 추천 친구 영역 */}
                <div className="flex items-center justify-between mb-4">
                   <span className="text-sm font-bold text-gray-500">회원님을 위한 추천</span>
                   <button className="text-xs font-bold text-gray-900 hover:opacity-70">모두 보기</button>
                </div>
                
                {/* 추천 친구 목록 (Mock 데이터) */}
                <div className="space-y-4">
                   {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-gray-100">
                                <AvatarFallback className="text-xs bg-gray-50">U{i}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                               <span className="text-sm font-bold text-gray-900 hover:underline cursor-pointer">user_{i}</span>
                               <span className="text-xs text-gray-500">회원님을 팔로우합니다</span>
                            </div>
                         </div>
                         <button className="text-xs font-bold text-blue-500 hover:text-blue-700">팔로우</button>
                      </div>
                   ))}
                </div>
                
                {/* 푸터 정보 */}
                <div className="mt-8">
                    <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-gray-300 mb-4">
                        <span>소개</span><span>•</span><span>도움말</span><span>•</span><span>홍보 센터</span>
                    </div>
                   <div className="text-xs text-gray-300 uppercase">
                      © 2025 PETLOG FROM ROOKIES
                   </div>
                </div>
             </div>
          </aside>

        </div>
      </div>

      {/* 모바일 화면에서만 보이는 하단 탭 네비게이션 */}
      <div className="md:hidden">
          <TabNavigation />
      </div>
    </div>
  )
}