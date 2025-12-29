import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { TabNavigation } from "@/shared/components/tab-navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { Button } from "@/shared/ui/button"
import { Card, CardContent } from "@/shared/ui/card"
import { Input } from "@/shared/ui/input"
import { 
  MoreHorizontal, Heart, MessageCircle, Grid, 
  Ban, AlertTriangle, Loader2, Home, Search, TrendingUp, PlusSquare, User, X, Plus 
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { useAuth } from "@/features/auth/context/auth-context"
import { feedApi } from "../api/feed-api"
import { getUserApi } from "@/features/auth/api/auth-api" 
import { FeedDto, SearchUserDto } from "../types/feed"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { PostDetailModal } from "../components/PostDetailModal"
import { FollowListModal } from "../components/FollowListModal"
import { FeedCreateModal } from "../components/FeedCreateModal"
import { useUserSearch } from "../hooks/use-search-query"

export default function UserPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()
  const currentUserId = currentUser ? Number(currentUser.id) : 0;

  // --- State ---
  const [selectedPost, setSelectedPost] = useState<FeedDto | null>(null)
  
  // 사이드바 상태
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState("")

  // 모달 상태
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowings, setShowFollowings] = useState(false)

  // --- Data Fetching ---
  const cleanId = id?.startsWith('@') ? id.slice(1) : id;

  const { data: targetUser, isLoading: isUserLoading } = useQuery({
    queryKey: ['searchUser', cleanId],
    queryFn: async () => {
      if (!cleanId) return null;
      if (/^\d+$/.test(cleanId)) {
        try {
          const directUser = await getUserApi(Number(cleanId));
          if (directUser) return { ...directUser, userId: Number(cleanId) };
        } catch (e) { console.warn("Fallback to search"); }
      }
      const users = await feedApi.searchUsers(cleanId, currentUserId);
      const exactMatch = users.find(u => u.social === cleanId || u.username === cleanId);
      return exactMatch || users[0] || null;
    },
    enabled: !!cleanId,
    retry: 1
  });

  const targetUserId = targetUser?.userId;

  const { data: followStats } = useQuery({
    queryKey: ['followStats', targetUserId],
    queryFn: () => feedApi.getFollowStats(targetUserId!),
    enabled: !!targetUserId
  });

  const { data: isFollowing, isLoading: isFollowCheckLoading } = useQuery({
    queryKey: ['isFollowing', currentUserId, targetUserId],
    queryFn: () => feedApi.checkFollow(currentUserId, targetUserId!),
    enabled: !!currentUserId && !!targetUserId && currentUserId !== targetUserId
  });

  const { data: userFeeds, isLoading: isFeedsLoading } = useQuery({
    queryKey: ['userFeeds', targetUserId],
    queryFn: () => feedApi.getUserFeeds(targetUserId!, currentUserId),
    enabled: !!targetUserId
  });

  const { data: followersList, isLoading: isFollowersLoading } = useQuery({
    queryKey: ['followers', targetUserId],
    queryFn: () => feedApi.getFollowers(targetUserId!),
    enabled: !!targetUserId && showFollowers
  });

  const { data: followingsList, isLoading: isFollowingsLoading } = useQuery({
    queryKey: ['followings', targetUserId],
    queryFn: () => feedApi.getFollowings(targetUserId!),
    enabled: !!targetUserId && showFollowings
  });

  const { data: searchResults, isLoading: isSearchLoading } = useUserSearch(sidebarSearchQuery);

  // --- Mutations ---
  const followMutation = useMutation({
    mutationFn: () => feedApi.followUser(currentUserId, targetUserId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing'] });
      queryClient.invalidateQueries({ queryKey: ['followStats'] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
    }
  });

  const unfollowMutation = useMutation({
    mutationFn: () => feedApi.unfollowUser(currentUserId, targetUserId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing'] });
      queryClient.invalidateQueries({ queryKey: ['followStats'] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
    }
  });

  // --- Handlers ---
  const handleFollowToggle = () => {
    if (!targetUserId) return;
    if (isFollowing) unfollowMutation.mutate();
    else followMutation.mutate();
  };

  const handleBlock = async () => {
      if(confirm("이 사용자를 차단하시겠습니까?")) {
          if (targetUserId) {
            await feedApi.blockUser(currentUserId, targetUserId);
            alert("차단되었습니다.");
            navigate('/feed');
          }
      }
  }

  const handleReport = async () => {
    if(confirm("이 사용자를 신고하시겠습니까?")) {
        if (targetUserId) {
            await feedApi.report(currentUserId, targetUserId, "USER", "부적절한 사용자");
            alert("신고가 접수되었습니다.");
        }
    }
  }

  // --- Sidebar Config ---
  const sidebarMenu = [
    { id: "home", label: "홈", icon: Home, link: "/feed", action: () => setIsSearchOpen(false), isActive: false },
    { id: "search", label: "검색", icon: Search, action: () => setIsSearchOpen(!isSearchOpen), isActive: isSearchOpen },
    { id: "popular", label: "인기", icon: TrendingUp, link: "/popular", action: () => setIsSearchOpen(false), isActive: false },
    { id: "create", label: "만들기", icon: PlusSquare, action: () => setIsCreateOpen(true), isActive: false },
    { id: "profile", label: "프로필", icon: User, isProfile: true, link: `/user/${currentUserId}`, isActive: Number(targetUserId) === currentUserId },
  ];

  if (isUserLoading) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-[#FF69B4]" /></div>;
  if (!targetUser) return <div className="flex justify-center items-center min-h-screen text-gray-500">사용자를 찾을 수 없습니다.</div>;

  const posts = userFeeds?.content || [];

  return (
    // [수정] pt-0으로 변경하여 상단 여백 제거 (헤더와 바로 연결되도록)
    <div className="flex w-full min-h-screen bg-[#FDFBFD] text-slate-900 font-sans selection:bg-[#FF69B4] selection:text-white pt-5">
      
      {/* [1. 왼쪽 사이드바 - 아이콘형 고정] */}
      <aside className="hidden md:block fixed left-4 top-20 bottom-4 z-50">
        <div className="relative h-full flex w-[80px]">
          
          {/* 메뉴 바 */}
          <div className="w-full h-full bg-white rounded-[2.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100 overflow-y-auto custom-scrollbar pt-4 pb-6 relative z-30 flex flex-col items-center">
            <nav className="flex-1 flex flex-col gap-4 w-full px-3"> 
            {sidebarMenu.map((item) => {
                return (
                <div key={item.id} className="w-full flex justify-center">
                    {item.link ? (
                        <Link to={item.link} onClick={item.action} className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 group hover:bg-[#FFF0F5] hover:text-[#FF69B4] ${item.isActive ? "bg-[#FF69B4] text-white shadow-md shadow-[#FF69B4]/30" : "text-gray-600"}`}>
                            {item.isProfile ? (
                                <Avatar className={`h-7 w-7 transition-transform group-hover:scale-105 ${item.isActive ? "ring-2 ring-white" : ""}`}>
                                    <AvatarImage src={currentUser?.avatar || "/placeholder-user.jpg"} />
                                    <AvatarFallback className="text-[10px] bg-white text-[#FF69B4] font-bold">Me</AvatarFallback>
                                </Avatar>
                            ) : ( 
                                <item.icon className={`h-6 w-6 transition-transform group-hover:scale-110 ${item.isActive ? "stroke-[2.5px]" : "stroke-[2px]"}`} /> 
                            )}
                        </Link>
                    ) : (
                        <button onClick={item.action} className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 group hover:bg-[#FFF0F5] hover:text-[#FF69B4] ${item.isActive ? "bg-[#FF69B4] text-white shadow-md shadow-[#FF69B4]/30" : "text-gray-600"}`}>
                            <item.icon className={`h-6 w-6 transition-transform group-hover:scale-110 ${item.isActive ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
                        </button>
                    )}
                </div>
            )})}
            </nav>
          </div>

          {/* 검색 패널 */}
          <div className={`absolute top-0 left-[90px] h-full bg-white z-20 rounded-[2.5rem] shadow-xl transition-all duration-300 ease-in-out overflow-hidden border border-[#FF69B4]/10 ${isSearchOpen ? "w-[300px] opacity-100 translate-x-0" : "w-0 opacity-0 -translate-x-4 pointer-events-none"}`}>
              <div className="p-5 h-full flex flex-col w-[300px]">
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-black text-[#FF69B4] tracking-tight">검색</h2>
                      <button onClick={() => setIsSearchOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-full"><X className="h-5 w-5 text-gray-400" /></button>
                  </div>
                  <div className="relative mb-4">
                      <Input placeholder="소셜 아이디 또는 이름" className="bg-[#FFF0F5] border-none h-11 pl-4 pr-10 rounded-2xl text-sm transition-all focus-visible:ring-2 focus-visible:ring-[#FF69B4]" value={sidebarSearchQuery} onChange={(e) => setSidebarSearchQuery(e.target.value)} />
                      <Search className="absolute right-3.5 top-3 h-5 w-5 text-[#FF69B4]/50" />
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar px-1">
                      <div className="space-y-2">
                          {isSearchLoading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin h-6 w-6 text-[#FF69B4]"/></div> : 
                           searchResults && searchResults.length > 0 ? searchResults.map((u: SearchUserDto) => (
                                  <Link key={u.userId} to={`/user/${u.userId}`} className="flex items-center gap-3 p-2.5 hover:bg-[#FFF0F5] rounded-[16px] transition-all cursor-pointer group" onClick={() => setIsSearchOpen(false)}>
                                      <Avatar className="h-10 w-10 border border-white shadow-sm">
                                          <AvatarImage src={u.profileImage || "/placeholder-user.jpg"} />
                                          <AvatarFallback className="bg-[#FFF0F5] text-[#FF69B4] font-bold text-xs">{u.username?.[0] || "U"}</AvatarFallback>
                                      </Avatar>
                                      <div className="flex flex-col overflow-hidden">
                                          <span className="font-bold text-sm text-gray-900 truncate">{u.username}</span>
                                          <span className="text-[#FF69B4] text-[11px] font-medium truncate">@{u.social}</span>
                                      </div>
                                  </Link>
                              )) : <div className="py-10 text-center text-sm text-gray-400">결과가 없어요 🥲</div>}
                      </div>
                  </div>
              </div>
          </div>
        </div>
      </aside>

      {/* [2. 중앙 메인 컨텐츠] */}
      {/* [수정] pt-0으로 변경 (위쪽 여백 제거) */}
      <main className="flex-1 w-full flex justify-center px-4 pb-20 pt-0" onClick={() => isSearchOpen && setIsSearchOpen(false)}>
        <div className="w-full max-w-[935px]"> 
          
          <div className="p-4 md:p-6 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 min-h-[80vh]">
            
            {/* 웹(Desktop) 헤더: 소셜 ID 중앙 표시 */}
            <div className="hidden md:flex w-full justify-center items-center pb-6 border-b border-gray-100 mb-8">
               <span className="font-bold text-xl text-gray-900">@{targetUser.social}</span>
            </div>

            {/* 모바일 헤더 */}
            <div className="md:hidden w-full fixed top-0 left-0 bg-white/95 backdrop-blur-md z-50 flex items-center justify-between px-5 py-3 border-b border-gray-100 shadow-sm">
                <div className="flex-shrink-0">
                    <span className="font-black text-xl italic text-[#FF69B4] tracking-tighter">Petlog</span>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2">
                    <span className="font-bold text-lg text-gray-900">@{targetUser.social}</span>
                </div>
                <div className="flex-shrink-0 flex gap-4">
                    <Heart className="h-6 w-6 text-gray-800" />
                </div>
            </div>

            {/* [프로필 헤더] */}
            <div className="mb-6 md:pl-[90px] transition-all duration-300">
              <div className="mb-6 flex items-start gap-4 md:gap-8">
                <Avatar className="h-20 w-20 border-4 border-border md:h-32 md:w-32">
                  <AvatarImage src={targetUser.profileImage || "/placeholder-user.jpg"} alt={targetUser.username} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-400 text-2xl text-white">
                    {targetUser.username[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="hidden flex-1 md:block">
                  <div className="mb-4 flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-foreground">{targetUser.username}</h2>
                    <div className="flex gap-2">
                        {currentUserId !== targetUserId ? (
                            <>
                                <Button
                                    onClick={handleFollowToggle}
                                    variant={isFollowing ? "outline" : "default"}
                                    disabled={isFollowCheckLoading || followMutation.isPending || unfollowMutation.isPending}
                                    className={`rounded-full px-6 transition-all ${
                                        isFollowing 
                                        ? "border-gray-200 text-gray-700 bg-white hover:bg-gray-50" 
                                        : "bg-[#FF69B4] hover:bg-[#FF1493] text-white shadow-md shadow-pink-200 border-none"
                                    }`}
                                >
                                    {isFollowing ? "팔로잉" : "팔로우"}
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100"><MoreHorizontal className="h-5 w-5 text-gray-500" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="rounded-xl">
                                        <DropdownMenuItem onClick={handleBlock} className="text-destructive cursor-pointer gap-2"><Ban className="w-4 h-4"/>차단하기</DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleReport} className="text-destructive cursor-pointer gap-2"><AlertTriangle className="w-4 h-4"/>신고하기</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <Button variant="outline" className="rounded-full" onClick={() => navigate('/profile')}>프로필 편집</Button>
                        )}
                    </div>
                  </div>

                  <div className="mb-4 flex gap-8">
                    <div>
                      <span className="text-lg font-bold text-foreground">{posts.length}</span>
                      <span className="ml-1 text-sm text-muted-foreground">게시물</span>
                    </div>
                    <button onClick={() => setShowFollowers(true)} className="transition-colors hover:text-foreground">
                      <span className="text-lg font-bold text-foreground">{followStats?.followerCount || 0}</span>
                      <span className="ml-1 text-sm text-muted-foreground">팔로워</span>
                    </button>
                    <button onClick={() => setShowFollowings(true)} className="transition-colors hover:text-foreground">
                      <span className="text-lg font-bold text-foreground">{followStats?.followingCount || 0}</span>
                      <span className="ml-1 text-sm text-muted-foreground">팔로잉</span>
                    </button>
                  </div>

                  <p className="whitespace-pre-line text-sm text-foreground">{targetUser.statusMessage}</p>
                </div>
              </div>

              <div className="mb-4 md:hidden">
                <h2 className="mb-2 text-xl font-bold text-foreground">{targetUser.username}</h2>
                <p className="mb-4 whitespace-pre-line text-sm text-foreground">{targetUser.statusMessage}</p>

                <div className="mb-4 flex justify-around border-y border-border py-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{posts.length}</p>
                    <p className="text-xs text-muted-foreground">게시물</p>
                  </div>
                  <button onClick={() => setShowFollowers(true)} className="text-center transition-colors hover:text-foreground">
                    <p className="text-lg font-bold text-foreground">{followStats?.followerCount || 0}</p>
                    <p className="text-xs text-muted-foreground">팔로워</p>
                  </button>
                  <button onClick={() => setShowFollowings(true)} className="text-center transition-colors hover:text-foreground">
                    <p className="text-lg font-bold text-foreground">{followStats?.followingCount || 0}</p>
                    <p className="text-xs text-muted-foreground">팔로잉</p>
                  </button>
                </div>

                <div className="flex gap-2">
                    {currentUserId !== targetUserId ? (
                        <>
                            <Button 
                                onClick={handleFollowToggle} 
                                variant={isFollowing ? "outline" : "default"} 
                                disabled={isFollowCheckLoading}
                                className={`flex-1 rounded-full ${isFollowing ? "" : "bg-[#FF69B4] hover:bg-[#FF1493] text-white border-none"}`}
                            >
                                {isFollowing ? "팔로잉" : "팔로우"}
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100"><MoreHorizontal className="h-5 w-5 text-gray-500" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-xl">
                                    <DropdownMenuItem onClick={handleBlock} className="text-destructive cursor-pointer gap-2"><Ban className="w-4 h-4"/>차단하기</DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleReport} className="text-destructive cursor-pointer gap-2"><AlertTriangle className="w-4 h-4"/>신고하기</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <Button variant="outline" className="flex-1 rounded-full" onClick={() => navigate('/profile')}>프로필 편집</Button>
                    )}
                </div>
              </div>
            </div>

            {/* 반려동물 섹션 */}
            {targetUser.pets && targetUser.pets.length > 0 && (
                <div className="mb-8 mt-6 md:pl-[90px] transition-all duration-300">
                    <Card className="border-0 shadow-md">
                      <CardContent className="p-4">
                        <p className="mb-3 text-sm font-semibold text-foreground">반려동물</p>
                        <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                          {targetUser.pets.map((pet: any) => (
                            <div key={pet.petId} className="flex items-center gap-2 min-w-fit">
                              <Avatar className="h-10 w-10 border-2 border-pink-400">
                                <AvatarImage src={pet.profileImage || "/placeholder.svg"} alt={pet.petName} />
                                <AvatarFallback>{pet.petName[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-semibold text-foreground">{pet.petName}</p>
                                <p className="text-xs text-muted-foreground">{pet.breed}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                </div>
            )}

            {/* 탭 메뉴 */}
            <div className="mb-4 border-t border-border">
              <div className="flex justify-center">
                <div className="flex items-center justify-center gap-2 border-t-2 border-foreground py-3 text-foreground px-20">
                  <Grid className="h-4 w-4" />
                  <span className="text-xs font-semibold tracking-widest">게시물</span>
                </div>
              </div>
            </div>

            {/* 게시물 목록 */}
            {isFeedsLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-300" /></div>
            ) : posts.length > 0 ? (
                <div className="grid grid-cols-3 gap-1 md:gap-3">
                    {posts.map((post) => (
                    <div key={post.feedId} className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer" onClick={() => setSelectedPost(post)}>
                        {post.imageUrls && post.imageUrls.length > 0 ? (
                            <img src={post.imageUrls[0]} alt="Post" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs p-2 text-center">{post.content.slice(0, 20)}</div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                            <div className="flex items-center gap-1 text-white">
                                <Heart className="h-5 w-5 fill-white" />
                                <span className="font-semibold">{post.likeCount}</span>
                            </div>
                            <div className="flex items-center gap-1 text-white">
                                <MessageCircle className="h-5 w-5 fill-white" />
                                <span className="font-semibold">{post.commentCount}</span>
                            </div>
                        </div>
                    </div>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center text-gray-500">게시물이 없습니다.</div>
            )}
          </div>
        </div>
      </main>

      {/* 플로팅 피드 작성 버튼 (모바일용, 우측 하단) */}
      <button
        onClick={() => setIsCreateOpen(true)}
        className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#FF69B4] text-white shadow-xl shadow-[#FF69B4]/40 transition-transform active:scale-90 md:hidden"
        aria-label="피드 작성"
      >
        <Plus className="h-8 w-8" strokeWidth={2.5} />
      </button>

      {/* Modals */}
      <div className="md:hidden"><TabNavigation /></div>
      {selectedPost && <PostDetailModal post={selectedPost} isOpen={!!selectedPost} onClose={() => setSelectedPost(null)} />}
      <FeedCreateModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <FollowListModal isOpen={showFollowers} onClose={() => setShowFollowers(false)} title="팔로워" users={followersList} isLoading={isFollowersLoading} />
      <FollowListModal isOpen={showFollowings} onClose={() => setShowFollowings(false)} title="팔로잉" users={followingsList} isLoading={isFollowingsLoading} />
    </div>
  )
}