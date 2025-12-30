import { useState } from "react"
import { Link } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { Input } from "@/shared/ui/input"
import { Home, Search, TrendingUp, PlusSquare, User, X, Loader2, Hash, Clock } from "lucide-react"
import { useAuth } from "@/features/auth/context/auth-context"
import { useUserSearch, useHashtagSearch } from "../../hooks/use-search-query"
// [확인] RecentSearchItem이 여기서 import 되어 있어야 합니다.
import { useRecentSearch, RecentSearchItem } from "../../hooks/use-recent-search"
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
  
  const { data: userResults, isLoading: isUserLoading } = useUserSearch(searchQuery);
  const { data: tagResults, isLoading: isTagLoading } = useHashtagSearch(searchQuery);
  
  const { recentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } = useRecentSearch();

  const handleSearchToggle = () => {
    const newState = !isSearchOpen;
    setIsSearchOpen(newState);
    onSearchToggle?.(newState);
    if (!newState) setSearchQuery("");
  };

  const handleLinkClick = (action?: () => void) => {
    if (action) action();
    else {
      setIsSearchOpen(false);
      onSearchToggle?.(false);
    }
  };

  const handleResultClick = (item: RecentSearchItem) => {
    addRecentSearch(item);
    setIsSearchOpen(false);
    onSearchToggle?.(false);
  };

  const menuItems = [
    { id: "home", label: "홈", icon: Home, link: "/feed" },
    { id: "search", label: "검색", icon: Search, action: handleSearchToggle, isActiveOverride: isSearchOpen },
    { id: "popular", label: "인기", icon: TrendingUp, link: "/feed?filter=popular" },
    { id: "create", label: "만들기", icon: PlusSquare, action: onCreateClick },
    { id: "profile", label: "프로필", icon: User, link: `/user/${user?.id}`, isProfile: true },
  ];

  const isLoading = isUserLoading || isTagLoading;
  const hasUserResults = userResults && userResults.length > 0;
  const hasTagResults = tagResults && tagResults.length > 0;

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

          {/* 검색 패널 */}
          <div className={`absolute top-0 left-[90px] h-full bg-white z-20 rounded-[2.5rem] shadow-xl transition-all duration-300 ease-in-out overflow-hidden border border-[#FF69B4]/10 ${isSearchOpen ? "w-[300px] opacity-100 translate-x-0" : "w-0 opacity-0 -translate-x-4 pointer-events-none"}`}>
            <div className="p-5 h-full flex flex-col w-[300px]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-black text-[#FF69B4] tracking-tight">통합 검색</h2>
                <button onClick={handleSearchToggle} className="p-1.5 hover:bg-gray-100 rounded-full">
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              <div className="relative mb-4">
                <Input
                  placeholder="이름, 아이디, #해시태그 검색"
                  className="bg-[#FFF0F5] border-none h-11 pl-4 pr-10 rounded-2xl text-sm transition-all focus-visible:ring-2 focus-visible:ring-[#FF69B4] text-gray-800 font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute right-3.5 top-3 h-5 w-5 text-[#FF69B4]/50" />
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar px-1">
                {!searchQuery ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-bold text-gray-500">최근 검색</span>
                      {recentSearches.length > 0 && (
                        <button onClick={clearRecentSearches} className="text-xs text-gray-400 hover:text-red-500">모두 지우기</button>
                      )}
                    </div>
                    {recentSearches.length === 0 ? (
                      <div className="py-10 text-center text-sm text-gray-400 flex flex-col items-center gap-2">
                        <Clock className="w-8 h-8 opacity-20" />
                        <span>최근 검색 기록이 없습니다.</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {/* [수정] item에 RecentSearchItem 타입 명시 */}
                        {recentSearches?.map((item: RecentSearchItem) => (
                          <div key={`${item.type}-${item.targetId}`} className="flex items-center justify-between group p-2 hover:bg-gray-50 rounded-xl transition-colors">
                            <Link 
                              to={item.type === 'USER' ? `/user/${item.targetId}` : `/feed?tag=${item.text.replace('#','')}`}
                              className="flex items-center gap-3 flex-1 overflow-hidden"
                              onClick={() => { setIsSearchOpen(false); onSearchToggle?.(false); }}
                            >
                              {item.type === 'USER' ? (
                                <Avatar className="h-9 w-9 border border-gray-100">
                                  <AvatarImage src={item.image || "/placeholder-user.jpg"} />
                                  <AvatarFallback className="text-[10px]">{item.text[0]}</AvatarFallback>
                                </Avatar>
                              ) : (
                                <div className="h-9 w-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                  <Hash className="w-4 h-4" />
                                </div>
                              )}
                              <div className="flex flex-col overflow-hidden">
                                <span className="font-bold text-sm text-gray-900 truncate">{item.text}</span>
                                <span className="text-[11px] text-gray-400 truncate">{item.subText}</span>
                              </div>
                            </Link>
                            <button onClick={(e) => { e.preventDefault(); removeRecentSearch(item.targetId, item.type); }} className="p-1.5 text-gray-300 hover:text-gray-500 hover:bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-all"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // 검색 결과 영역
                  <div className="space-y-6">
                    {isLoading ? (
                      <div className="flex justify-center py-10"><Loader2 className="animate-spin h-6 w-6 text-[#FF69B4]" /></div>
                    ) : !hasUserResults && !hasTagResults ? (
                      <div className="py-10 text-center text-sm text-gray-400">결과가 없어요 🥲</div>
                    ) : (
                      <>
                        {/* 해시태그 결과 섹션 */}
                        {hasTagResults && (
                          <div className="space-y-2">
                            <div className="px-1 text-xs font-bold text-gray-500 mb-1">해시태그</div>
                            {tagResults?.map((tag: any) => (
                              <Link
                                key={tag.hashtagId}
                                to={`/feed?tag=${tag.name}`}
                                className="flex items-center gap-3 p-2.5 hover:bg-[#FFF0F5] rounded-[16px] transition-all cursor-pointer group"
                                onClick={() => handleResultClick({
                                  id: tag.hashtagId,
                                  targetId: tag.hashtagId,
                                  type: 'HASHTAG',
                                  text: `#${tag.name}`,
                                  subText: `게시물 ${tag.count}개`,
                                  image: null
                                })}
                              >
                                <div className="h-10 w-10 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 shadow-sm group-hover:text-[#FF69B4] group-hover:border-[#FF69B4]/30 transition-colors">
                                  <Hash className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                  <span className="font-bold text-sm text-gray-900 truncate">#{tag.name}</span>
                                  <span className="text-gray-400 text-[11px] font-medium truncate">게시물 {tag.count}개</span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}

                        {/* 사용자 결과 섹션 */}
                        {hasUserResults && (
                          <div className="space-y-2">
                            <div className="px-1 text-xs font-bold text-gray-500 mb-1">사용자</div>
                            {userResults?.map((u: SearchUserDto) => (
                              <Link
                                key={u.userId}
                                to={`/user/${u.userId}`}
                                className="flex items-center gap-3 p-2.5 hover:bg-[#FFF0F5] rounded-[16px] transition-all cursor-pointer group"
                                onClick={() => handleResultClick({
                                  id: u.userId,
                                  targetId: u.userId,
                                  type: 'USER',
                                  text: u.username || "알 수 없음",
                                  subText: `@${u.social}`,
                                  image: u.profileImage
                                })}
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
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}