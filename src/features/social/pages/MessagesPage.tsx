import { useState, useEffect, useRef, Suspense } from "react"
import { useAuth } from "@/features/auth/context/auth-context"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/ui/avatar"
import { FeedCreateModal } from "@/features/social/components/FeedCreateModal"
import { 
  ArrowLeft, 
  Send, 
  Info, 
  Phone, 
  Video, 
  Edit,
  Home, 
  Search, 
  TrendingUp, 
  MessageCircle, 
  PlusSquare, 
  Menu,
  User,
  Heart,
  X
} from "lucide-react"
import { useChatRooms, useChatMessages, useSendMessage } from "@/features/social/hooks/use-chat-query"
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface SidebarItem {
    id: string;
    label: string;
    icon: any;
    link?: string;
    action?: () => void;
    isActive: boolean;
    isProfile?: boolean;
}

// 임시 검색 데이터 (FeedPage와 동일)
const MOCK_SEARCH_USERS = [
  { id: "1", name: "김민수", username: "minsu_kim", avatar: "/man-avatar.png", petName: "초코" },
  { id: "2", name: "이수진", username: "sujin_lee", avatar: "/woman-avatar-2.png", petName: "몽이" },
  { id: "3", name: "박지훈", username: "jihun_park", avatar: "/man-avatar-2.png", petName: "바둑이" },
  { id: "4", name: "최유나", username: "yuna_choi", avatar: "/woman-avatar-3.png", petName: "루비" },
  { id: "5", name: "정태현", username: "taehyun_j", avatar: "/man-profile.png", petName: "뽀삐" },
]

function MessagesContent() {
  const { user } = useAuth()
  const location = useLocation()
  const userId = user?.id ? Number(user.id) : 1

  // 채팅 관련 상태
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [newMessage, setNewMessage] = useState("")

  // 사이드바 액션 상태 (검색 패널, 만들기 모달)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const { data: chatRooms } = useChatRooms(userId)
  const { data: messages } = useChatMessages(selectedRoomId, userId)
  const { mutate: sendMessage } = useSendMessage(userId)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedRoomId) return
    sendMessage({
      chatRoomId: selectedRoomId,
      senderId: userId,
      content: newMessage,
      messageType: 'TEXT'
    })
    setNewMessage("")
  }

  const selectedRoom = chatRooms?.find(r => r.id === selectedRoomId)

  // 검색 필터링 로직
  const filteredUsers = MOCK_SEARCH_USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.petName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 사이드바 메뉴 정의 (FeedPage와 동작 통일)
  const sidebarMenu: SidebarItem[] = [
    { 
        id: "home", 
        label: "홈", 
        icon: Home, 
        link: "/feed", 
        action: () => setIsSearchOpen(false),
        isActive: false 
    },
    { 
        id: "search", 
        label: "검색", 
        icon: Search, 
        action: () => setIsSearchOpen(!isSearchOpen), 
        isActive: isSearchOpen 
    },
    { 
        id: "popular", 
        label: "인기게시물", 
        icon: TrendingUp, 
        link: "/feed", 
        action: () => setIsSearchOpen(false),
        isActive: false 
    },
    { 
        id: "messages", 
        label: "메시지", 
        icon: MessageCircle, 
        link: "/messages",
        action: () => setIsSearchOpen(false),
        isActive: true 
    },
    { 
        id: "create", 
        label: "만들기", 
        icon: PlusSquare, 
        action: () => setIsCreateOpen(true), 
        isActive: false 
    },
    { 
        id: "profile", 
        label: "프로필", 
        icon: User, 
        isProfile: true, 
        link: `/user/${userId}`,
        action: () => setIsSearchOpen(false), 
        isActive: false 
    },
  ]

  return (
    <div className="flex h-screen bg-white overflow-hidden relative">

      {/* 1. 검색 패널 (슬라이드 애니메이션) - FeedPage와 동일한 위치/동작 */}
      <div 
        className={`fixed top-0 left-[73px] h-full bg-white z-40 border-r border-gray-100 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden ${
          isSearchOpen ? "w-[397px] translate-x-0 opacity-100" : "w-0 -translate-x-full opacity-0"
        }`}
      >
        <div className="p-6 h-full flex flex-col w-[397px]">
           <h2 className="text-2xl font-bold mb-8">검색</h2>
           <div className="relative mb-6">
              <Input 
                placeholder="검색" 
                className="bg-gray-100 border-none h-10 pl-4 pr-10 focus-visible:ring-0 rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-2.5 text-gray-400">
                      <X className="h-4 w-4" />
                  </button>
              )}
           </div>
           
           <div className="flex-1 overflow-y-auto">
               <div className="flex justify-between items-center mb-4">
                   <span className="font-semibold text-base">최근 검색 항목</span>
                   <button className="text-sm text-blue-500 hover:text-blue-700 font-semibold">모두 지우기</button>
               </div>
               
               <div className="space-y-2">
                  {searchQuery && filteredUsers.length === 0 ? (
                      <p className="text-center text-gray-400 py-10">검색 결과가 없습니다.</p>
                  ) : filteredUsers.map((u) => (
                      <Link 
                        key={u.id} 
                        to={`/user/${u.id}`} 
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                        onClick={() => setIsSearchOpen(false)}
                      >
                         <Avatar className="h-11 w-11">
                             <AvatarImage src={u.avatar} />
                             <AvatarFallback>{u.name[0]}</AvatarFallback>
                         </Avatar>
                         <div className="flex flex-col">
                             <span className="font-semibold text-sm">{u.username}</span>
                             <span className="text-gray-500 text-sm">{u.name} • {u.petName}</span>
                         </div>
                      </Link>
                  ))}
                  {!searchQuery && (
                      <div className="text-center text-gray-400 py-10 text-sm">
                          최근 검색 내역이 없습니다.
                      </div>
                  )}
               </div>
           </div>
        </div>
      </div>
      
      {/* 2. 미니 사이드바 (72px 고정 - FeedPage 검색 모드와 동일 스타일) */}
      <aside className="hidden md:flex flex-col h-screen border-r border-gray-100 px-3 py-8 bg-white w-[72px] shrink-0 z-50">
          <nav className="space-y-2 flex-1 pt-4"> 
            {sidebarMenu.map((item) => (
                <div key={item.id}>
                    {item.link ? (
                        <Link 
                            to={item.link}
                            onClick={item.action}
                            className={`flex items-center justify-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-all group w-full ${item.isActive ? "font-bold" : "font-normal"}`}
                            title={item.label}
                        >
                            {item.isProfile ? (
                                <Avatar className={`h-6 w-6 ${item.isActive ? "ring-2 ring-black p-[1px]" : ""}`}>
                                    <AvatarImage src={user?.avatar || "/placeholder-user.jpg"} />
                                    <AvatarFallback>Me</AvatarFallback>
                                </Avatar>
                            ) : (
                                <item.icon className={`h-6 w-6 transition-transform group-hover:scale-105 ${item.isActive ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
                            )}
                            <span className="hidden">{item.label}</span>
                        </Link>
                    ) : (
                        <button 
                            onClick={item.action}
                            className={`flex items-center justify-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-all group w-full ${item.isActive ? "font-bold" : "font-normal"}`}
                            title={item.label}
                        >
                            <item.icon className={`h-6 w-6 transition-transform group-hover:scale-105 ${item.isActive ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
                            <span className="hidden">{item.label}</span>
                        </button>
                    )}
                </div>
            ))}
          </nav>

          <div className="mt-auto">
             <button className="flex items-center justify-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-all w-full">
                 <Menu className="h-6 w-6" />
                 <span className="hidden">더 보기</span>
             </button>
          </div>
      </aside>

      {/* 컨텐츠 영역 클릭 시 검색 패널 닫기 */}
      <div className="flex h-full w-full" onClick={() => { if(isSearchOpen) setIsSearchOpen(false); }}>
          
          {/* 3. 좌측 채팅방 목록 */}
          <div className={`w-full lg:w-[350px] flex flex-col border-r border-gray-100 h-full ${selectedRoomId ? 'hidden lg:flex' : 'flex'}`}>
            {/* 헤더 */}
            <div className="h-[70px] flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
            <div className="flex items-center gap-2 cursor-pointer">
                <span className="text-xl font-bold">{user?.username}</span>
                <span className="text-xs">▼</span>
            </div>
            <Edit className="h-6 w-6 text-gray-900 cursor-pointer" />
            </div>
            
            <div className="px-5 pb-3">
            <div className="flex justify-between font-bold text-base mb-2">
                <span>메시지</span>
                <span className="text-gray-400 font-normal">요청</span>
            </div>
            </div>

            {/* 채팅방 리스트 */}
            <div className="flex-1 overflow-y-auto">
            {chatRooms?.map((chat) => (
                <div
                key={chat.id}
                onClick={() => setSelectedRoomId(chat.id)}
                className={`w-full px-5 py-3 flex items-center gap-3 cursor-pointer transition-colors ${selectedRoomId === chat.id ? "bg-gray-100" : "hover:bg-gray-50"}`}
                >
                <div className="relative">
                    <Avatar className="h-14 w-14 border border-gray-100">
                        <AvatarImage src={chat.petPhoto || "/placeholder.svg"} />
                        <AvatarFallback>{chat.otherUserName[0]}</AvatarFallback>
                    </Avatar>
                    {chat.unreadCount > 0 && (
                    <div className="absolute top-0 right-0 h-3 w-3 rounded-full bg-blue-500 border-2 border-white"></div>
                    )}
                </div>
                <div className="flex-1 text-left min-w-0">
                    <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'font-bold text-black' : 'font-normal text-gray-900'}`}>
                        {chat.otherUserName}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <p className={`truncate max-w-[150px] ${chat.unreadCount > 0 ? 'font-bold text-black' : 'font-normal'}`}>
                            {chat.lastMessage}
                        </p>
                        <span>·</span>
                        <span>
                            {chat.lastMessageAt && formatDistanceToNow(new Date(chat.lastMessageAt), { addSuffix: false, locale: ko })}
                        </span>
                    </div>
                </div>
                </div>
            ))}
            </div>
          </div>

          {/* 4. 우측 채팅창 */}
          <div className={`flex-1 flex flex-col h-full bg-white relative ${!selectedRoomId ? 'hidden lg:flex' : 'flex'}`}>
            {selectedRoomId && selectedRoom ? (
            <>
                <div className="h-[75px] border-b border-gray-100 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedRoomId(null)} className="lg:hidden">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={selectedRoom.petPhoto} />
                            <AvatarFallback>{selectedRoom.otherUserName[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-base">{selectedRoom.otherUserName}</span>
                    </div>
                </div>
                <div className="flex gap-4 text-black">
                    <Phone className="h-6 w-6 cursor-pointer hover:opacity-50" />
                    <Video className="h-6 w-6 cursor-pointer hover:opacity-50" />
                    <Info className="h-6 w-6 cursor-pointer hover:opacity-50" />
                </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
                {messages?.map((msg) => {
                    const isMe = msg.senderId === userId
                    return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        {!isMe && (
                            <Avatar className="h-7 w-7 mr-2 self-end mb-1">
                                <AvatarImage src={selectedRoom.petPhoto} />
                                <AvatarFallback>User</AvatarFallback>
                            </Avatar>
                        )}
                        <div className={`max-w-[60%] rounded-[22px] px-4 py-2.5 text-sm leading-relaxed ${
                            isMe 
                            ? "bg-[#3797F0] text-white" 
                            : "bg-gray-100 text-black" 
                        }`}>
                        {msg.content}
                        </div>
                    </div>
                    )
                })}
                <div ref={messagesEndRef} />
                </div>

                <div className="p-4 shrink-0">
                <div className="relative flex items-center bg-white border border-gray-200 rounded-[22px] px-4 py-2 gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder="메시지 입력..."
                        className="border-none focus-visible:ring-0 shadow-none px-0 text-sm bg-transparent flex-1"
                    />
                    {newMessage.trim() && (
                        <button onClick={handleSendMessage} className="text-[#3797F0] font-semibold text-sm hover:text-blue-700">
                            보내기
                        </button>
                    )}
                    {!newMessage.trim() && (
                        <div className="flex gap-3 text-gray-900">
                            <CustomImageIcon className="h-6 w-6 cursor-pointer" />
                            <Heart className="h-6 w-6 cursor-pointer" />
                        </div>
                    )}
                </div>
                </div>
            </>
            ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                <div className="w-24 h-24 rounded-full border-2 border-black flex items-center justify-center mb-4">
                    <Send className="h-10 w-10 -rotate-12 ml-1 mt-1" />
                </div>
                <h3 className="text-xl font-light mb-2">내 메시지</h3>
                <p className="text-sm text-gray-500 mb-6">친구나 그룹에 비공개 사진과 메시지를 보내보세요.</p>
                <Button className="bg-[#3797F0] hover:bg-blue-600 rounded-lg px-4 py-1.5 text-sm font-semibold">
                    메시지 보내기
                </Button>
            </div>
            )}
          </div>
      </div>

      {/* 만들기 모달 */}
      <FeedCreateModal 
         isOpen={isCreateOpen}
         onClose={() => setIsCreateOpen(false)}
      />
    </div>
  )
}

function CustomImageIcon({ className }: { className?: string }) {
    return <svg className={className} aria-label="이미지 추가" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M6.549 5.013A1.557 1.557 0 1 0 8.106 6.57a1.557 1.557 0 0 0-1.557-1.557Z"></path><path d="m2 18.605 3.901-3.9a.908.908 0 0 1 1.284 0l2.807 2.806a.908.908 0 0 0 1.283 0l5.534-5.534a.908.908 0 0 1 1.283 0l3.905 3.905"></path><path d="M18.44 2.004A3.56 3.56 0 0 1 22 5.564h-1.25a2.309 2.309 0 0 0-2.31-2.31V2.004Z"></path><path d="M2.004 5.564A3.56 3.56 0 0 1 5.564 2v1.25a2.309 2.309 0 0 0-2.31 2.31H2.004Z"></path><path d="M5.564 22a3.56 3.56 0 0 1-3.56-3.56h1.25a2.309 2.309 0 0 0 2.31 2.31V22Z"></path><path d="M22 18.44a3.56 3.56 0 0 1-3.56 3.56v-1.25a2.309 2.309 0 0 0 2.31-2.31H22Z"></path></svg>
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MessagesContent />
    </Suspense>
  )
}