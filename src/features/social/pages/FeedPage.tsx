import { useState } from "react"
// [수정 1] 사용하지 않는 useLocation import 제거
import { TabNavigation } from "@/shared/components/tab-navigation"
import { FeedList } from "@/features/social/components/feed-list"
import { PopularFeedGrid } from "@/features/social/components/PopularFeedGrid"
import { PostDetailModal } from "@/features/social/components/PostDetailModal"
import { FeedCreateModal } from "@/features/social/components/FeedCreateModal"
import { Heart } from 'lucide-react'
import { useAuth } from "@/features/auth/context/auth-context"
import { useFeedLike } from "../hooks/use-feed-query"
import { FeedDto } from "../types/feed"
import { SocialSidebar } from "../components/layout/SocialSidebar"
import { SocialRightSidebar } from "../components/layout/SocialRightSidebar"

export default function FeedPage() {
  // [수정 2] 사용하지 않는 setActiveFilter 제거 (state만 남김)
  const [activeFilter] = useState("all") 
  const [selectedPost, setSelectedPost] = useState<FeedDto | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { user } = useAuth()
  const { mutate: toggleLike } = useFeedLike(user ? Number(user.id) : 0);

  return (
    <div className="flex justify-between w-full min-h-screen bg-[#FDFBFD] text-slate-800 font-sans selection:bg-[#FF69B4] selection:text-white pt-0 relative">
      
      {/* 공통 사이드바 사용 */}
      <SocialSidebar 
        activePage={activeFilter === "popular" ? "popular" : "home"}
        onSearchToggle={setIsSearchOpen}
        onCreateClick={() => setIsCreateOpen(true)}
      />

      <main 
        className="flex-1 flex justify-center min-w-0 bg-[#FDFBFD] pt-5 px-4 pb-20" 
        onClick={() => isSearchOpen && setIsSearchOpen(false)}
      >
        <div className="w-full max-w-[680px]">
          {/* 모바일 헤더 */}
          <div className="md:hidden w-full fixed top-0 left-0 bg-white/95 backdrop-blur-md z-50 flex items-center justify-between px-5 py-3 border-b border-gray-100 shadow-sm">
            <span className="font-black text-xl italic text-[#FF69B4] tracking-tighter">Petlog</span>
            <div className="flex gap-4">
              <Heart className="h-6 w-6 text-gray-800" />
            </div>
          </div>

          {activeFilter === 'popular' ? (
            <PopularFeedGrid />
          ) : (
            <FeedList
              filter={activeFilter}
              onPostClick={setSelectedPost}
            />
          )}
        </div>
      </main>

      {/* 오른쪽 사이드바 사용 */}
      <SocialRightSidebar />

      <div className="md:hidden"><TabNavigation /></div>

      {selectedPost && (
        <PostDetailModal
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          post={selectedPost}
          onLikeToggle={toggleLike}
        />
      )}

      <FeedCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  )
}