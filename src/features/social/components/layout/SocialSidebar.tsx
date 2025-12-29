import { useState } from "react"
import { Link } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { Input } from "@/shared/ui/input"
import { Home, Search, TrendingUp, PlusSquare, User, X, Loader2 } from "lucide-react"
import { useAuth } from "@/features/auth/context/auth-context"
import { useUserSearch } from "../../hooks/use-search-query"
import { SearchUserDto } from "../../types/feed"

interface SocialSidebarProps {
  activePage: "home" | "search" | "popular" | "create" | "profile" | string;
  onSearchToggle?: (isOpen: boolean) => void;
  onCreateClick?: () => void;
}

export function SocialSidebar({ activePage, onSearchToggle, onCreateClick }: SocialSidebarProps) {
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchResults, isLoading: isSearchLoading } = useUserSearch(searchQuery);

  const handleSearchToggle = () => {
    const newState = !isSearchOpen;
    setIsSearchOpen(newState);
    onSearchToggle?.(newState);
  };

  const handleLinkClick = (action?: () => void) => {
    if (action) action();
    else {
      setIsSearchOpen(false);
      onSearchToggle?.(false);
    }
  };

  const menuItems = [
    { id: "home", label: "홈", icon: Home, link: "/feed" },
    { id: "search", label: "검색", icon: Search, action: handleSearchToggle, isActiveOverride: isSearchOpen },
    { id: "popular", label: "인기", icon: TrendingUp, link: "/feed?filter=popular" },
    // [변경] 드롭다운 없이 바로 실행 (onCreateClick)
    { id: "create", label: "만들기", icon: PlusSquare, action: onCreateClick },
    { id: "profile", label: "프로필", icon: User, link: `/user/${user?.id}`, isProfile: true },
  ];

  return (
    <>
      <aside className="hidden md:block sticky top-20 h-[calc(100vh-6rem)] shrink-0 z-50 ml-4 w-[80px] xl:w-[240px]">
        <div className={`relative h-full flex transition-all duration-300 ease-in-out ${isSearchOpen ? "w-[400px]" : "w-full"}`}>
          {/* 네비게이션 바 */}
          <div className={`h-full bg-white rounded-[2.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100 overflow-y-auto custom-scrollbar py-6 relative z-30 transition-all duration-300 ${isSearchOpen ? "w-[80px]" : "w-full"}`}>
            <nav className="flex flex-col space-y-3 px-3">
              {menuItems.map((item) => {
                const isActive = item.isActiveOverride ?? (activePage === item.id && !isSearchOpen);
                const activeClass = "bg-[#FF69B4] text-white font-bold shadow-md shadow-[#FF69B4]/30";
                const inactiveClass = "text-gray-600 hover:bg-[#FFF0F5] hover:text-[#FF69B4] font-semibold";
                const showLabel = !isSearchOpen;

                const Content = () => (
                  <>
                    {item.isProfile ? (
                      <Avatar className={`h-7 w-7 transition-transform group-hover:scale-105 ${isActive ? "ring-2 ring-white" : ""}`}>
                        <AvatarImage src={user?.avatar || "/placeholder-user.jpg"} />
                        <AvatarFallback className="text-[10px] bg-white text-[#FF69B4] font-bold">Me</AvatarFallback>
                      </Avatar>
                    ) : (
                      <item.icon className={`h-6 w-6 transition-transform group-hover:scale-105 ${isActive ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
                    )}
                    {showLabel && <span className="hidden xl:block text-[15px] tracking-tight whitespace-nowrap">{item.label}</span>}
                  </>
                );

                const containerClass = `flex items-center justify-center ${showLabel && 'xl:justify-start'} gap-4 p-3 rounded-[20px] transition-all duration-200 group ${isActive ? activeClass : inactiveClass}`;

                return (
                  <div key={item.id}>
                    {item.link ? (
                      <Link to={item.link} onClick={() => handleLinkClick(item.action)} className={containerClass}>
                        <Content />
                      </Link>
                    ) : (
                      <button onClick={item.action} className={`w-full ${containerClass}`}>
                        <Content />
                      </button>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* 검색 패널 (유지) */}
          <div className={`absolute top-0 left-[90px] h-full bg-white z-20 rounded-[2.5rem] shadow-xl transition-all duration-300 ease-in-out overflow-hidden border border-[#FF69B4]/10 ${isSearchOpen ? "w-[300px] opacity-100 translate-x-0" : "w-0 opacity-0 -translate-x-4 pointer-events-none"}`}>
            <div className="p-5 h-full flex flex-col w-[300px]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-black text-[#FF69B4] tracking-tight">검색</h2>
                <button onClick={handleSearchToggle} className="p-1.5 hover:bg-gray-100 rounded-full">
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
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin h-6 w-6 text-[#FF69B4]" /></div>
                  ) : searchResults && searchResults.length > 0 ? (
                    searchResults.map((u: SearchUserDto) => (
                      <Link
                        key={u.userId}
                        to={`/user/${u.userId}`}
                        className="flex items-center gap-3 p-2.5 hover:bg-[#FFF0F5] rounded-[16px] transition-all cursor-pointer group"
                        onClick={() => { setIsSearchOpen(false); onSearchToggle?.(false); }}
                      >
                        <Avatar className="h-10 w-10 border border-white shadow-sm">
                          <AvatarImage src={u.profileImage || "/placeholder-user.jpg"} />
                          <AvatarFallback className="bg-[#FFF0F5] text-[#FF69B4] font-bold text-xs">{u.username?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-bold text-sm text-gray-900 truncate">{u.username || "알 수 없음"}</span>
                          <span className="text-[#FF69B4] text-[11px] font-medium truncate">@{u.social || "user"}</span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="py-10 text-center text-sm text-gray-400">{searchQuery ? "결과가 없어요 🥲" : "친구를 찾아보세요!"}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}