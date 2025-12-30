import { Link } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { User } from "lucide-react"
import { useAuth } from "@/features/auth/context/auth-context"

export function SocialRightSidebar() {
  const { user } = useAuth();
  const myUserId = user ? Number(user.id) : 0;

  return (
    <aside className="hidden lg:block sticky top-20 h-[calc(100vh-6rem)] w-[320px] shrink-0 mr-4 z-30">
      <div className="h-full bg-white rounded-[2.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100 overflow-y-auto custom-scrollbar py-8 px-6">
        {user && (
          <div className="flex items-center justify-between mb-8 p-3.5 bg-[#FFF0F5]/40 rounded-[20px] border border-[#FF69B4]/10">
            <Link to={`/user/${myUserId}`} className="flex items-center gap-3 group">
              <Avatar className="h-10 w-10 border-[2px] border-white shadow-sm bg-white">
                <AvatarImage src={user.avatar || "/placeholder-user.jpg"} />
                <AvatarFallback className="text-[#FF69B4] font-bold bg-[#FFF0F5]">{user.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-gray-900 group-hover:text-[#FF69B4] transition-colors">{user.username}</span>
                <span className="text-gray-400 text-xs font-medium">{user.name}</span>
              </div>
            </Link>
          </div>
        )}

        <div className="flex items-center justify-between mb-4 px-1">
          <span className="text-sm font-bold text-gray-500">회원님을 위한 추천</span>
          <button className="text-xs font-bold text-gray-900 hover:text-[#FF69B4] transition-colors">모두 보기</button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-2 hover:bg-[#FAFAFA] rounded-[18px] transition-colors cursor-pointer group">
            <div className="h-9 w-9 bg-gray-100 rounded-full flex items-center justify-center"><User className="h-4 w-4 text-gray-400" /></div>
            <div className="flex-1"><div className="h-3 bg-gray-100 w-20 rounded mb-1"></div><div className="h-2 bg-gray-50 w-12 rounded"></div></div>
          </div>
          <div className="text-xs text-[#FF69B4] py-4 text-center font-bold bg-[#FFF0F5]/30 rounded-[18px] mt-4">
            새로운 친구를 찾고 있어요 🐾
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-gray-50 text-[10px] text-gray-300 space-y-2 px-1">
          <div className="uppercase font-extrabold text-[#FF69B4]/20 tracking-widest">© 2025 PETLOG</div>
        </div>
      </div>
    </aside>
  );
}