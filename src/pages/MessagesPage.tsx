import { useState, useEffect, useRef, Suspense } from "react"
import { useAuth } from "@/lib/auth-context"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, Phone, Video, MoreVertical, ImageIcon, Smile } from "lucide-react"
import { useMessages } from "@/lib/use-messages"
import { formatMessageTime as formatMsgTime } from "@/lib/message-api"

function MessagesContent() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const selectedUserId = searchParams.get("user")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Use the Messages hook with real API (set useMockData to true for testing without backend)
  const {
    chatRooms,
    messages,
    selectedChatRoom,
    sendMessage: sendApiMessage,
    selectChatRoom,
    getOrCreateChatRoom,
  } = useMessages({
    userId: user?.id ? Number(user.id) : 1,
    useMockData: false  // Set to true to use mock data instead of real API
  })

  const [newMessage, setNewMessage] = useState("")

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      navigate("/login")
      return
    }

    // If coming from a match, create/open chat room with that user
    if (selectedUserId) {
      const existingRoom = chatRooms.find((c) => c.otherUserId === Number(selectedUserId))
      if (existingRoom) {
        selectChatRoom(existingRoom)
      } else {
        // Create new chat room
        getOrCreateChatRoom(Number(selectedUserId)).then((room) => {
          if (room) selectChatRoom(room)
        })
      }
    }
  }, [user, isLoading, navigate, selectedUserId, chatRooms, selectChatRoom, getOrCreateChatRoom])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    await sendApiMessage(newMessage)
    setNewMessage("")
  }

  const formatTime = (dateString: string) => {
    return formatMsgTime(dateString)
  }

  const formatTimeLocal = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }



  if (isLoading) {
    return null
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white pt-20">
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
          {/* Chat List */}
          <Card className="lg:col-span-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b bg-gradient-to-r from-pink-50 to-rose-50">
              <h2 className="text-xl font-bold">메시지</h2>
              <p className="text-sm text-muted-foreground mt-1">{chatRooms.length}개의 대화</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chatRooms.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => selectChatRoom(chat)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-pink-50 transition-colors border-b ${selectedChatRoom?.id === chat.id ? "bg-pink-50" : ""
                    }`}
                >
                  <div className="relative">
                    <img
                      src={chat.petPhoto || "/placeholder.svg"}
                      alt={chat.petName}
                      className="h-14 w-14 rounded-full object-cover ring-2 ring-pink-200"
                    />
                    {chat.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-xs font-bold text-white">
                        {chat.unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900">{chat.otherUserName}</p>
                      <span className="text-xs text-muted-foreground">{chat.lastMessageAt ? formatTime(chat.lastMessageAt) : ''}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Chat Window */}
          <Card className="lg:col-span-2 overflow-hidden flex flex-col">
            {selectedChatRoom ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b bg-gradient-to-r from-pink-50 to-rose-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => selectChatRoom(null)} className="lg:hidden">
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <img
                      src={selectedChatRoom.petPhoto || "/placeholder.svg"}
                      alt={selectedChatRoom.petName}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-pink-200"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{selectedChatRoom.otherUserName}</p>
                      <p className="text-sm text-muted-foreground">{selectedChatRoom.petName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                  {messages.map((message) => {
                    const userId = user?.id ? Number(user.id) : 1
                    const isMe = message.senderId === userId
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] ${isMe
                            ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                            : "bg-gray-100 text-gray-900"
                            } rounded-2xl px-4 py-3`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <p className={`text-xs mt-1 ${isMe ? "text-pink-100" : "text-gray-500"}`}>
                            {formatTimeLocal(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t bg-white">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <ImageIcon className="h-5 w-5 text-gray-500" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Smile className="h-5 w-5 text-gray-500" />
                    </Button>
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="메시지를 입력하세요..."
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      className="bg-gradient-to-r from-pink-500 to-rose-500"
                      size="icon"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <div className="h-20 w-20 rounded-full bg-gradient-to-r from-pink-100 to-rose-100 flex items-center justify-center mx-auto mb-4">
                    <Send className="h-10 w-10 text-pink-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">대화를 선택하세요</h3>
                  <p className="text-muted-foreground">왼쪽에서 대화를 선택하여 메시지를 확인하세요</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MessagesContent />
    </Suspense>
  )
}
