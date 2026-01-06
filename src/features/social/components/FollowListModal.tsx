import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/ui/avatar";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Link } from "react-router-dom";

interface FollowUserDto {
  userId: number;
  nickname: string;
  profileImageUrl?: string | null;
  profileImage?: string | null;
}

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: any[] | undefined;
  isLoading?: boolean;
}

export function FollowListModal({ isOpen, onClose, title, users, isLoading }: FollowListModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] bg-white rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center font-bold text-lg">{title}</DialogTitle>
          <DialogDescription className="sr-only">
            {title} 목록입니다.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full text-gray-400">
              불러오는 중...
            </div>
          ) : !users || users.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-400">
              목록이 비어있습니다.
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {users.map((user: FollowUserDto) => (
                <div key={user.userId} className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <Link
                    to={`/user/${user.userId}`}
                    className="flex items-center gap-3 w-full"
                    onClick={onClose}
                  >
                    <Avatar className="w-10 h-10 border border-gray-100">
                      {/* [수정 핵심] 
                        이미지가 없으면 undefined가 아니라 '/placeholder-user.jpg'를 넣습니다.
                        그래야 닉네임 텍스트 대신 기본 사람 그림이 나옵니다.
                      */}
                      <AvatarImage
                        src={user.profileImage || user.profileImageUrl || "/placeholder-user.jpg"}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-[#FFF0F5] text-[#FF69B4] font-bold text-xs">
                        {user.nickname ? user.nickname[0] : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-gray-900">{user.nickname}</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}