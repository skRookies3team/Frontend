import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { TabNavigation } from "@/shared/components/tab-navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { Button } from "@/shared/ui/button"
import { Card, CardContent } from "@/shared/ui/card"
import { MoreHorizontal, Heart, MessageCircle, Grid, Ban, AlertTriangle, Loader2, Plus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { useAuth } from "@/features/auth/context/auth-context"
import { feedApi } from "../api/feed-api"
import { getUserApi } from "@/features/auth/api/auth-api"
import { FeedDto } from "../types/feed"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { PostDetailModal } from "../components/PostDetailModal"
import { FollowListModal } from "../components/FollowListModal"
import { FeedCreateModal } from "../components/FeedCreateModal"
import { SocialSidebar } from "../components/layout/SocialSidebar"

export default function UserPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()
  const currentUserId = currentUser ? Number(currentUser.id) : 0;

  // --- UI State ---
  const [selectedPost, setSelectedPost] = useState<FeedDto | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowings, setShowFollowings] = useState(false)

  // --- 1. 타겟 유저 정보 조회 ---
  const cleanId = id?.startsWith('@') ? id.slice(1) : id;
  const { data: targetUser, isLoading: isUserLoading } = useQuery({
    queryKey: ['searchUser', cleanId],
    queryFn: async () => {
      if (!cleanId) return null;
      // 숫자로만 구성된 경우 ID로 직접 조회 시도
      if (/^\d+$/.test(cleanId)) {
        try {
          const directUser = await getUserApi(Number(cleanId));
          if (directUser) return { ...directUser, userId: Number(cleanId) };
        } catch (e) { console.warn("Fallback to search"); }
      }
      // 아니면 검색으로 조회
      const users = await feedApi.searchUsers(cleanId, currentUserId);
      return users.find(u => u.social === cleanId || u.username === cleanId) || users[0] || null;
    },
    enabled: !!cleanId,
    retry: 1
  });

  const targetUserId = targetUser?.userId;

  // --- 2. 팔로우 상태 및 통계 조회 ---
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

  // --- 3. 유저 피드 목록 조회 ---
  const { data: userFeeds, isLoading: isFeedsLoading } = useQuery({
    queryKey: ['userFeeds', targetUserId],
    queryFn: () => feedApi.getUserFeeds(targetUserId!, currentUserId),
    enabled: !!targetUserId
  });

  // --- 4. 팔로워/팔로잉 목록 조회 (모달 오픈 시 실행) ---
  const { data: rawFollowers, isLoading: isFollowersLoading } = useQuery({
    queryKey: ['followers', targetUserId],
    queryFn: () => feedApi.getFollowers(targetUserId!),
    enabled: !!targetUserId && showFollowers
  });

  const { data: rawFollowings, isLoading: isFollowingsLoading } = useQuery({
    queryKey: ['followings', targetUserId],
    queryFn: () => feedApi.getFollowings(targetUserId!),
    enabled: !!targetUserId && showFollowings
  });

  // API 데이터 -> 모달 props 규격(SimpleUserDto)으로 변환
  const followersList = rawFollowers?.map((u: any) => ({
    userId: u.userId,
    nickname: u.nickname || u.username, // API 필드명 대응
    profileImageUrl: u.profileImageUrl || u.profileImage || u.avatar // API 필드명 대응
  }));

  const followingsList = rawFollowings?.map((u: any) => ({
    userId: u.userId,
    nickname: u.nickname || u.username,
    profileImageUrl: u.profileImageUrl || u.profileImage || u.avatar
  }));

  // --- Mutations (팔로우/언팔로우/차단/신고) ---
  const invalidateFollowQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['isFollowing'] });
    queryClient.invalidateQueries({ queryKey: ['followStats'] });
    queryClient.invalidateQueries({ queryKey: ['followers'] });
  };

  const followMutation = useMutation({ 
    mutationFn: () => feedApi.followUser(currentUserId, targetUserId!), 
    onSuccess: invalidateFollowQueries 
  });
  
  const unfollowMutation = useMutation({ 
    mutationFn: () => feedApi.unfollowUser(currentUserId, targetUserId!), 
    onSuccess: invalidateFollowQueries 
  });

  const handleFollowToggle = () => targetUserId && (isFollowing ? unfollowMutation.mutate() : followMutation.mutate());

  const handleBlock = async () => {
    if (confirm("이 사용자를 차단하시겠습니까?") && targetUserId) {
      await feedApi.blockUser(currentUserId, targetUserId);
      alert("차단되었습니다.");
      navigate('/feed');
    }
  };

  const handleReport = async () => {
    if (confirm("이 사용자를 신고하시겠습니까?") && targetUserId) {
      await feedApi.report(currentUserId, targetUserId, "USER", "부적절한 사용자");
      alert("신고가 접수되었습니다.");
    }
  };

  // --- Render ---
  if (isUserLoading) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-[#FF69B4]" /></div>;
  if (!targetUser) return <div className="flex justify-center items-center min-h-screen text-gray-500">사용자를 찾을 수 없습니다.</div>;
  const posts = userFeeds?.content || [];

  return (
    <div className="flex w-full min-h-screen bg-[#FDFBFD] text-slate-900 font-sans selection:bg-[#FF69B4] selection:text-white pt-5">
      
      {/* 왼쪽 사이드바 */}
      <SocialSidebar 
        activePage={Number(targetUserId) === currentUserId ? "profile" : ""} 
        onSearchToggle={setIsSearchOpen} 
        onCreateClick={() => setIsCreateOpen(true)}
      />

      {/* 메인 콘텐츠 */}
      <main className="flex-1 w-full flex justify-center px-4 pb-20 pt-0" onClick={() => isSearchOpen && setIsSearchOpen(false)}>
        <div className="w-full max-w-[935px]">
          <div className="p-4 md:p-6 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 min-h-[80vh]">
            
            {/* [데스크탑 헤더] */}
            <div className="hidden md:flex w-full justify-center items-center pb-6 border-b border-gray-100 mb-8">
              <span className="font-bold text-xl text-gray-900">@{targetUser.social}</span>
            </div>

            {/* [모바일 헤더] */}
            <div className="md:hidden w-full fixed top-0 left-0 bg-white/95 backdrop-blur-md z-50 flex items-center justify-between px-5 py-3 border-b border-gray-100 shadow-sm">
               <span className="font-black text-xl italic text-[#FF69B4] tracking-tighter">Petlog</span>
               <div className="absolute left-1/2 transform -translate-x-1/2">
                 <span className="font-bold text-lg text-gray-900">@{targetUser.social}</span>
               </div>
               <Heart className="h-6 w-6 text-gray-800" />
            </div>

            {/* [프로필 정보 섹션] */}
            <div className="mb-6 md:pl-[90px] transition-all duration-300">
               <div className="mb-6 flex items-start gap-4 md:gap-8">
                <Avatar className="h-20 w-20 border-4 border-border md:h-32 md:w-32">
                  <AvatarImage src={targetUser.profileImage || "/placeholder-user.jpg"} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-400 text-2xl text-white">{targetUser.username[0]}</AvatarFallback>
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
                              className={`rounded-full px-6 transition-all ${isFollowing ? "border-gray-200 text-gray-700 bg-white hover:bg-gray-50" : "bg-[#FF69B4] hover:bg-[#FF1493] text-white shadow-md shadow-pink-200 border-none"}`}
                            >
                              {isFollowing ? "팔로잉" : "팔로우"}
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100"><MoreHorizontal className="h-5 w-5 text-gray-500" /></Button></DropdownMenuTrigger>
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
                  
                  {/* 통계 (클릭 시 모달 오픈) */}
                  <div className="mb-4 flex gap-8">
                    <div>
                        <span className="text-lg font-bold">{posts.length}</span> <span className="text-sm text-muted-foreground">게시물</span>
                    </div>
                    <button onClick={() => setShowFollowers(true)} className="hover:text-pink-500 transition-colors">
                        <span className="text-lg font-bold">{followStats?.followerCount || 0}</span> <span className="text-sm text-muted-foreground">팔로워</span>
                    </button>
                    <button onClick={() => setShowFollowings(true)} className="hover:text-pink-500 transition-colors">
                        <span className="text-lg font-bold">{followStats?.followingCount || 0}</span> <span className="text-sm text-muted-foreground">팔로잉</span>
                    </button>
                  </div>
                  <p className="whitespace-pre-line text-sm">{targetUser.statusMessage}</p>
                </div>
               </div>
               
               {/* [모바일 프로필 상세] */}
               <div className="mb-4 md:hidden">
                 <h2 className="mb-2 text-xl font-bold">{targetUser.username}</h2>
                 <p className="mb-4 whitespace-pre-line text-sm">{targetUser.statusMessage}</p>
                 <div className="mb-4 flex justify-around border-y border-border py-3">
                   <div className="text-center"><p className="text-lg font-bold">{posts.length}</p><p className="text-xs text-muted-foreground">게시물</p></div>
                   <button onClick={() => setShowFollowers(true)} className="text-center"><p className="text-lg font-bold">{followStats?.followerCount || 0}</p><p className="text-xs text-muted-foreground">팔로워</p></button>
                   <button onClick={() => setShowFollowings(true)} className="text-center"><p className="text-lg font-bold">{followStats?.followingCount || 0}</p><p className="text-xs text-muted-foreground">팔로잉</p></button>
                 </div>
                 <div className="flex gap-2">
                    {currentUserId !== targetUserId ? (
                        <Button onClick={handleFollowToggle} variant={isFollowing ? "outline" : "default"} className={`flex-1 rounded-full ${!isFollowing && "bg-[#FF69B4] text-white"}`}>{isFollowing ? "팔로잉" : "팔로우"}</Button>
                    ) : (
                        <Button variant="outline" className="flex-1 rounded-full" onClick={() => navigate('/profile')}>프로필 편집</Button>
                    )}
                 </div>
               </div>
            </div>

            {/* [반려동물 섹션] */}
            {targetUser.pets && targetUser.pets.length > 0 && (
              <div className="mb-8 mt-6 md:pl-[90px]">
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <p className="mb-3 text-sm font-semibold">반려동물</p>
                    <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                      {targetUser.pets.map((pet: any) => (
                        <div key={pet.petId} className="flex items-center gap-2 min-w-fit">
                          <Avatar className="h-10 w-10 border-2 border-pink-400">
                            <AvatarImage src={pet.profileImage || "/placeholder.svg"} />
                            <AvatarFallback>{pet.petName[0]}</AvatarFallback>
                          </Avatar>
                          <div><p className="text-sm font-semibold">{pet.petName}</p><p className="text-xs text-muted-foreground">{pet.breed}</p></div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* [게시물 그리드] */}
            <div className="mb-4 border-t border-border">
              <div className="flex justify-center"><div className="flex items-center justify-center gap-2 border-t-2 border-foreground py-3 px-20"><Grid className="h-4 w-4" /><span className="text-xs font-semibold tracking-widest">게시물</span></div></div>
            </div>

            {isFeedsLoading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-300" /></div> : 
             posts.length > 0 ? (
              <div className="grid grid-cols-3 gap-1 md:gap-3">
                {posts.map((post) => (
                  <div key={post.feedId} className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer" onClick={() => setSelectedPost(post)}>
                    {post.imageUrls?.[0] ? <img src={post.imageUrls[0]} className="h-full w-full object-cover transition-transform group-hover:scale-110" /> : <div className="h-full w-full flex items-center justify-center bg-gray-100 text-xs p-2">{post.content.slice(0, 20)}</div>}
                    <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-1 text-white"><Heart className="h-5 w-5 fill-white" /><span className="font-semibold">{post.likeCount}</span></div>
                      <div className="flex items-center gap-1 text-white"><MessageCircle className="h-5 w-5 fill-white" /><span className="font-semibold">{post.commentCount}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="py-20 text-center text-gray-500">게시물이 없습니다.</div>}
          </div>
        </div>
      </main>

      {/* 모바일 작성 버튼 */}
      <button onClick={() => setIsCreateOpen(true)} className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#FF69B4] text-white shadow-xl shadow-[#FF69B4]/40 md:hidden"><Plus className="h-8 w-8" strokeWidth={2.5} /></button>
      
      <div className="md:hidden"><TabNavigation /></div>
      
      {/* --- Modals --- */}
      {selectedPost && <PostDetailModal post={selectedPost} isOpen={!!selectedPost} onClose={() => setSelectedPost(null)} />}
      
      <FeedCreateModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      
      {/* 팔로워/팔로잉 모달 (데이터 매핑하여 전달) */}
      <FollowListModal 
        isOpen={showFollowers} 
        onClose={() => setShowFollowers(false)} 
        title="팔로워" 
        users={followersList} 
        isLoading={isFollowersLoading} 
      />
      <FollowListModal 
        isOpen={showFollowings} 
        onClose={() => setShowFollowings(false)} 
        title="팔로잉" 
        users={followingsList} 
        isLoading={isFollowingsLoading} 
      />
    </div>
  )
}