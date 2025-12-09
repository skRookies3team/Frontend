import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog"
import { Input } from "@/shared/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { Search, X } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Link } from "react-router-dom"

interface UserSearchModalProps {
  open: boolean
  onClose: () => void
}

// 임시 사용자 데이터
const MOCK_USERS = [
  { id: "1", name: "김민수", username: "minsu_kim", avatar: "/man-avatar.png", petName: "초코" },
  { id: "2", name: "이수진", username: "sujin_lee", avatar: "/woman-avatar-2.png", petName: "몽이" },
  { id: "3", name: "박지훈", username: "jihun_park", avatar: "/man-avatar-2.png", petName: "바둑이" },
  { id: "4", name: "최유나", username: "yuna_choi", avatar: "/woman-avatar-3.png", petName: "루비" },
  { id: "5", name: "정태현", username: "taehyun_j", avatar: "/man-profile.png", petName: "뽀삐" },
]

const UserSearchModal = ({ open, onClose }: UserSearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredUsers = MOCK_USERS.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.petName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleClose = () => {
    setSearchQuery("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>사용자 검색</DialogTitle>
        </DialogHeader>

        {/* 검색 입력 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="이름, 아이디, 반려동물 이름으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
            autoFocus
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* 검색 결과 */}
        <div className="max-h-[300px] overflow-y-auto">
          {searchQuery === "" ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              검색어를 입력하세요
            </p>
          ) : filteredUsers.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              검색 결과가 없습니다
            </p>
          ) : (
            <div className="space-y-1">
              {filteredUsers.map((user) => (
                <Link
                  key={user.id}
                  to={`/profile/${user.id}`}
                  onClick={handleClose}
                  className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      @{user.username} · 🐕 {user.petName}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { UserSearchModal }