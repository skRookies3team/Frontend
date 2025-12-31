import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { useAuth } from "@/features/auth/context/auth-context";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUserApi } from "@/features/auth/api/auth-api";

export function SocialRightSidebar() {
  const { user } = useAuth();
  
  // [추가] ProfilePage와 동일하게 최신 유저 정보를 가져옵니다.
  const { data: apiUserData } = useQuery({
    queryKey: ['user', user?.id],
    queryFn: () => getUserApi(Number(user?.id)),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });

  // 프로필 이미지 결정 로직 (ProfilePage와 동일)
  const profileImage = apiUserData?.profileImage || user?.avatar || "/placeholder-user.jpg";
  const userName = apiUserData?.username || user?.name || "사용자";
  const userHandle = apiUserData?.social || user?.username || "user";

  // 추천 친구 데이터 (임시)
  const suggestedUsers = [
    { id: 1, name: "강아지사랑", username: "doglover", avatar: null },
    { id: 2, name: "냥냥펀치", username: "catpunch", avatar: null },
    { id: 3, name: "펫마스터", username: "petmaster", avatar: null },
  ];

  return (
    <aside className="hidden xl:block w-[320px] shrink-0 sticky top-24 h-fit ml-8">
      {/* 내 프로필 카드 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link to={`/user/${user?.id}`}>
            <Avatar className="h-14 w-14 border border-gray-100 cursor-pointer">
              {/* [수정] ProfilePage와 동일한 로직 적용 */}
              <AvatarImage 
                src={profileImage} 
                className="object-cover" 
              />
              <AvatarFallback className="bg-[#FFF0F5] text-[#FF69B4] font-bold">
                {userName[0]}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={`/user/${user?.id}`}>
              <h3 className="font-bold text-gray-900 truncate hover:underline cursor-pointer">
                {userName}
              </h3>
            </Link>
            <p className="text-sm text-gray-500 truncate">@{userHandle}</p>
          </div>
          <Button variant="ghost" className="text-xs text-[#FF69B4] hover:text-[#FF1493] font-bold">
            전환
          </Button>
        </div>
      </div>

      {/* 추천 친구 리스트 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-500 text-sm">회원님을 위한 추천</h3>
          <button className="text-xs font-bold text-gray-900 hover:text-gray-700">모두 보기</button>
        </div>
        <div className="space-y-4">
          {suggestedUsers.map((u) => (
            <div key={u.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <Link to={`/user/${u.id}`}>
                  <Avatar className="h-10 w-10 border border-gray-100 cursor-pointer">
                    <AvatarImage 
                      src={u.avatar || "/placeholder-user.jpg"} 
                      className="object-cover" 
                    />
                    <AvatarFallback className="bg-gray-100 text-gray-500 text-xs font-bold">
                      {u.name[0]}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex flex-col">
                  <Link to={`/user/${u.id}`} className="text-sm font-bold text-gray-900 group-hover:text-[#FF69B4] transition-colors cursor-pointer">
                    {u.username}
                  </Link>
                  <span className="text-xs text-gray-400">회원님을 팔로우합니다</span>
                </div>
              </div>
              <Button variant="ghost" className="text-xs text-[#FF69B4] hover:text-[#FF1493] font-bold h-auto p-0 hover:bg-transparent">
                팔로우
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-x-2 gap-y-1 text-xs text-gray-400 px-2">
        <div className="w-full mt-4">© 2025 PETLOG FROM SK ROOKIES</div>
      </div>
    </aside>
  );
}