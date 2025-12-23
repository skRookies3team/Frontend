import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/ui/avatar";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Link } from "react-router-dom";

// 유저 정보 표시를 위한 인터페이스
interface SimpleUserDto {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
}

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: SimpleUserDto[] | undefined;
  isLoading?: boolean;
}

export function FollowListModal({ isOpen, onClose, title, users, isLoading }: FollowListModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] bg-white rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center font-bold text-lg">{title}</DialogTitle>
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
              {users.map((user) => (
                <div key={user.userId} className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <Link 
                    to={`/user/${user.userId}`} 
                    className="flex items-center gap-3 w-full" 
                    onClick={onClose}
                  >
                    <Avatar className="w-10 h-10 border border-gray-100">
                      <AvatarImage src={user.profileImageUrl || undefined} />
                      <AvatarFallback className="bg-pink-50 text-pink-400 font-bold">
                        {user.nickname.charAt(0)}
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