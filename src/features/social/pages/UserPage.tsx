import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { TabNavigation } from "@/shared/components/tab-navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { Button } from "@/shared/ui/button"
import { ArrowLeft, MoreHorizontal, Heart, MessageCircle, Grid, BookOpen, Ban, AlertTriangle, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { useAuth } from "@/features/auth/context/auth-context"
import { feedApi } from "../api/feed-api"
import { getUserApi } from "@/features/auth/api/auth-api" 
import { FeedDto } from "../types/feed"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { PostDetailModal } from "../components/PostDetailModal"

export default function UserPage() {
  const { id } = useParams<{ id: string }>() // URL 파라미터
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()
  const currentUserId = currentUser ? Number(currentUser.id) : 0;

  const [activeTab, setActiveTab] = useState<"posts" | "diary">("posts")
  const [selectedPost, setSelectedPost] = useState<FeedDto | null>(null)
  
  // [리팩토링] URL 파라미터 정제 ('@' 제거)
  const cleanId = id?.startsWith('@') ? id.slice(1) : id;

  // 1. 유저 정보 조회 (검색 + ID 조회 하이브리드)
  const { data: targetUser, isLoading: isUserLoading } = useQuery({
    queryKey: ['searchUser', cleanId],
    queryFn: async () => {
      if (!cleanId) return null;

      // CASE A: 파라미터가 숫자인 경우 -> ID로 직접 조회 시도 (빠르고 정확함)
      if (/^\d+$/.test(cleanId)) {
        try {
          const directUser = await getUserApi(Number(cleanId));
          if (directUser) {
            // API 응답 형식을 UI에서 사용하는 형태로 변환
            return {
              userId: Number(cleanId),
              username: directUser.username,
              social: directUser.social,
              profileImage: directUser.profileImage,
              statusMessage: directUser.statusMessage || ""
            };
          }
        } catch (e) {
          console.warn("Direct ID fetch failed, falling back to search", e);
        }
      }

      // CASE B: 닉네임/아이디 문자열인 경우 -> 검색 API 사용
      // viewerId를 넘겨서 검색해야 차단된 유저 등이 필터링되어 정확도가 높아짐
      const users = await feedApi.searchUsers(cleanId, currentUserId);
      
      // 정확히 일치하는 유저 찾기 (social ID 또는 닉네임)
      const exactMatch = users.find(u => 
        u.social?.toLowerCase() === cleanId.toLowerCase() || 
        u.username === cleanId
      );

      // 정확한 매칭이 없으면 첫 번째 결과라도 반환 (유사 검색), 없으면 null
      return exactMatch || users[0] || null;
    },
    enabled: !!cleanId,
    retry: 1
  });

  const targetUserId = targetUser?.userId;

  // 2. 팔로우 통계 조회
  const { data: followStats } = useQuery({
    queryKey: ['followStats', targetUserId],
    queryFn: () => feedApi.getFollowStats(targetUserId!),
    enabled: !!targetUserId
  });

  // 3. 팔로우 여부 확인
  const { data: isFollowing, isLoading: isFollowCheckLoading } = useQuery({
    queryKey: ['isFollowing', currentUserId, targetUserId],
    queryFn: () => feedApi.checkFollow(currentUserId, targetUserId!),
    enabled: !!currentUserId && !!targetUserId && currentUserId !== targetUserId
  });

  // 4. 유저 게시물 조회
  const { data: userFeeds, isLoading: isFeedsLoading } = useQuery({
    queryKey: ['userFeeds', targetUserId],
    queryFn: () => feedApi.getUserFeeds(targetUserId!, currentUserId),
    enabled: !!targetUserId
  });

  // 팔로우/언팔로우 뮤테이션
  const followMutation = useMutation({
    mutationFn: () => feedApi.followUser(currentUserId, targetUserId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing'] });
      queryClient.invalidateQueries({ queryKey: ['followStats'] });
    }
  });

  const unfollowMutation = useMutation({
    mutationFn: () => feedApi.unfollowUser(currentUserId, targetUserId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing'] });
      queryClient.invalidateQueries({ queryKey: ['followStats'] });
    }
  });

  const handleFollowToggle = () => {
    if (!targetUserId) return;
    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
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

  // 로딩 상태 처리
  if (isUserLoading) {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-[#FF69B4]" />
        </div>
    );
  }

  // 유저를 찾을 수 없을 때
  if (!targetUser) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
            <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center">
                <Grid className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">사용자를 찾을 수 없습니다</h2>
            <p className="text-gray-500 font-medium text-center">
                요청하신 '{cleanId}'님을 찾을 수 없어요.<br/>
                아이디를 다시 확인해 주세요.
            </p>
            <Button onClick={() => navigate('/feed')} variant="outline" className="mt-4 rounded-xl px-8">
                피드로 돌아가기
            </Button>
        </div>
    );
  }

  const posts = userFeeds?.content || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="flex-1 text-center text-lg font-bold text-foreground">
             {targetUser.social ? `@${targetUser.social}` : targetUser.username}
          </h1>
          
          {currentUserId !== targetUserId ? (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <MoreHorizontal className="h-5 w-5" />
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem onClick={handleBlock} className="text-destructive gap-2 cursor-pointer">
                    <Ban className="w-4 h-4" /> 차단하기
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleReport} className="text-destructive gap-2 cursor-pointer">
                    <AlertTriangle className="w-4 h-4" /> 신고하기
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="w-10" />
          )}
        </div>
      </div>

      <main className="mx-auto max-w-5xl pb-20 md:pb-8">
        <div className="p-4 md:p-6">
          {/* Profile Header */}
          <div className="mb-6">
            <div className="mb-6 flex items-start gap-4 md:gap-8">
              {/* Avatar */}
              <Avatar className="h-20 w-20 border-4 border-white shadow-md md:h-32 md:w-32">
                <AvatarImage src={targetUser.profileImage || "/placeholder-user.jpg"} alt={targetUser.username} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-400 text-2xl text-white">
                  {targetUser.username[0]}
                </AvatarFallback>
              </Avatar>

              {/* Stats & Actions */}
              <div className="flex-1">
                <div className="mb-3 flex items-center justify-between md:justify-start md:gap-6">
                  <h2 className="text-2xl font-bold text-foreground">{targetUser.username}</h2>
                  
                  {/* Desktop Actions */}
                  <div className="hidden md:flex gap-2">
                    {currentUserId !== targetUserId ? (
                        <Button
                            onClick={handleFollowToggle}
                            variant={isFollowing ? "outline" : "default"}
                            className={isFollowing ? "rounded-full border-gray-300" : "rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white border-none"}
                            disabled={isFollowCheckLoading}
                        >
                            {isFollowing ? "팔로잉" : "팔로우"}
                        </Button>
                    ) : (
                        <Button variant="outline" className="rounded-full" onClick={() => navigate('/profile')}>프로필 편집</Button>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-6 mb-4 text-sm md:text-base">
                  <div className="text-center md:text-left">
                    <span className="font-bold text-foreground mr-1">{posts.length}</span>
                    <span className="text-muted-foreground">게시물</span>
                  </div>
                  <div className="text-center md:text-left">
                    <span className="font-bold text-foreground mr-1">{followStats?.followerCount || 0}</span>
                    <span className="text-muted-foreground">팔로워</span>
                  </div>
                  <div className="text-center md:text-left">
                    <span className="font-bold text-foreground mr-1">{followStats?.followingCount || 0}</span>
                    <span className="text-muted-foreground">팔로잉</span>
                  </div>
                </div>

                {/* 상태메시지 */}
                {targetUser.statusMessage && (
                    <p className="text-sm text-foreground whitespace-pre-line mb-2 leading-relaxed">{targetUser.statusMessage}</p>
                )}
                
                {/* Mobile Actions */}
                <div className="md:hidden flex gap-2 mt-4">
                    {currentUserId !== targetUserId ? (
                        <Button
                            onClick={handleFollowToggle}
                            variant={isFollowing ? "outline" : "default"}
                            className={`flex-1 rounded-xl h-10 ${!isFollowing && "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-none"}`}
                            disabled={isFollowCheckLoading}
                        >
                            {isFollowing ? "팔로잉" : "팔로우"}
                        </Button>
                    ) : (
                         <Button variant="outline" className="flex-1 rounded-xl h-10" onClick={() => navigate('/profile')}>프로필 편집</Button>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-border mt-2">
            <div className="flex">
              <button
                onClick={() => setActiveTab("posts")}
                className={`flex flex-1 items-center justify-center gap-2 border-t-2 py-3 transition-colors ${activeTab === "posts"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground"
                  }`}
              >
                <Grid className="h-5 w-5" />
                <span className="text-sm font-semibold">게시물</span>
              </button>
              <button
                onClick={() => setActiveTab("diary")}
                className={`flex flex-1 items-center justify-center gap-2 border-t-2 py-3 transition-colors ${activeTab === "diary"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground"
                  }`}
              >
                <BookOpen className="h-5 w-5" />
                <span className="text-sm font-semibold">AI 다이어리</span>
              </button>
            </div>
          </div>

          {/* Content */}
          {activeTab === "posts" && (
             isFeedsLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-300" /></div>
             ) : posts.length > 0 ? (
                <div className="grid grid-cols-3 gap-1 md:gap-4">
                {posts.map((post) => (
                    <div 
                        key={post.feedId} 
                        className="group relative aspect-square overflow-hidden bg-gray-100 cursor-pointer"
                        onClick={() => setSelectedPost(post)}
                    >
                    {post.imageUrls && post.imageUrls.length > 0 ? (
                        <img src={post.imageUrls[0]} alt="Post" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs p-2 text-center break-all bg-gray-50">
                            {post.content.slice(0, 30)}
                        </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex items-center gap-1 text-white font-bold">
                        <Heart className="h-5 w-5 fill-white" />
                        <span>{post.likeCount}</span>
                        </div>
                        <div className="flex items-center gap-1 text-white font-bold">
                        <MessageCircle className="h-5 w-5 fill-white" />
                        <span>{post.commentCount}</span>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            ) : (
                <div className="py-20 text-center text-gray-500 flex flex-col items-center">
                    <Grid className="h-10 w-10 text-gray-300 mb-2" />
                    <p>게시물이 없습니다.</p>
                </div>
            )
          )}

          {activeTab === "diary" && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-1 text-lg font-semibold text-foreground">비공개 다이어리</h3>
              <p className="text-sm text-muted-foreground">{targetUser.username}님의 AI 다이어리는 비공개입니다.</p>
            </div>
          )}
        </div>
      </main>

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal 
            post={selectedPost} 
            isOpen={!!selectedPost} 
            onClose={() => setSelectedPost(null)} 
        />
      )}

      <TabNavigation />
    </div>
  )
}