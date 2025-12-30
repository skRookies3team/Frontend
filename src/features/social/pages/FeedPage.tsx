import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { TabNavigation } from "@/shared/components/tab-navigation"
import { FeedList } from "@/features/social/components/feed-list"
import { PopularFeedGrid } from "@/features/social/components/PopularFeedGrid"
import { HashtagFeedGrid } from "@/features/social/components/HashtagFeedGrid" // [필수] import 확인
import { PostDetailModal } from "@/features/social/components/PostDetailModal"
import { FeedCreateModal } from "@/features/social/components/FeedCreateModal"
import { Heart } from 'lucide-react'
import { useAuth } from "@/features/auth/context/auth-context"
import { useFeedLike } from "../hooks/use-feed-query"
import { FeedDto } from "../types/feed"
import { SocialSidebar } from "../components/layout/SocialSidebar"
import { SocialRightSidebar } from "../components/layout/SocialRightSidebar"

export default function FeedPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // 1. URL에서 파라미터 가져오기
  const searchTag = searchParams.get("tag");
  const filterParam = searchParams.get("filter");
  
  // filter가 없으면 'home', 있으면 그 값 (popular 등)
  const activePage = filterParam === "popular" ? "popular" : "home";

  const [selectedPost, setSelectedPost] = useState<FeedDto | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { user } = useAuth()
  const { mutate: toggleLike } = useFeedLike(user ? Number(user.id) : 0);

  // [중요] 메인 컨텐츠 렌더링 로직
  const renderMainContent = () => {
    // 1순위: 해시태그 검색어가 있으면 해시태그 그리드 보여주기
    if (searchTag) {
      return <HashtagFeedGrid tag={searchTag} />;
    }
    
    // 2순위: 인기 탭이면 인기 그리드 보여주기
    if (activePage === 'popular') {
      return <PopularFeedGrid />;
    }
    
    // 3순위: 기본 피드 리스트 (홈)
    return <FeedList filter="all" onPostClick={setSelectedPost} />;
  };

  return (
    <div className="flex justify-between w-full min-h-screen bg-[#FDFBFD] text-slate-800 font-sans selection:bg-[#FF69B4] selection:text-white pt-0 relative">
      
      {/* 왼쪽 사이드바 */}
      <SocialSidebar 
        activePage={activePage}
        onSearchToggle={setIsSearchOpen}
        onCreateClick={() => setIsCreateOpen(true)}
      />

      {/* 메인 영역 */}
      <main 
        className="flex-1 flex justify-center min-w-0 bg-[#FDFBFD] pt-5 px-4 pb-20" 
        onClick={() => isSearchOpen && setIsSearchOpen(false)}
      >
        <div className="w-full max-w-[680px] md:max-w-[900px]">
          {/* 모바일 헤더 */}
          <div className="md:hidden w-full fixed top-0 left-0 bg-white/95 backdrop-blur-md z-50 flex items-center justify-between px-5 py-3 border-b border-gray-100 shadow-sm">
            <span 
              className="font-black text-xl italic text-[#FF69B4] tracking-tighter cursor-pointer"
              onClick={() => navigate('/feed')}
            >
              Petlog
            </span>
            <div className="flex gap-4">
              <Heart className="h-6 w-6 text-gray-800" />
            </div>
          </div>

          <div className="mt-14 md:mt-0">
            {/* 조건부 렌더링 함수 호출 */}
            {renderMainContent()}
          </div>
        </div>
      </main>

      {/* 오른쪽 사이드바 */}
      <SocialRightSidebar />
      
      {/* 모바일 하단 탭 */}
      <div className="md:hidden"><TabNavigation /></div>

      {/* 게시물 상세 모달 */}
      {selectedPost && (
        <PostDetailModal
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          post={selectedPost}
          onLikeToggle={() => toggleLike(selectedPost.feedId)}
        />
      )}

      {/* 글쓰기 모달 */}
      <FeedCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  )
}