import { useState, useEffect, useRef, Suspense } from "react"
import { useAuth } from "@/features/auth/context/auth-context"
// import { useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/shared/ui/button"
import { Card } from "@/shared/ui/card"
import { Input } from "@/shared/ui/input"
import { ArrowLeft, Send } from "lucide-react"
import { useChatRooms, useChatMessages, useSendMessage } from "@/features/social/hooks/use-chat-query"
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

function MessagesContent() {
  const { user } = useAuth()
  // const navigate = useNavigate()
  const userId = user?.id ? Number(user.id) : 1

  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [newMessage, setNewMessage] = useState("")

  // React Query Hooks
  const { data: chatRooms } = useChatRooms(userId)
  const { data: messages } = useChatMessages(selectedRoomId, userId)
  const { mutate: sendMessage } = useSendMessage(userId)

  // Scroll to bottom
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white pt-20">
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
          {/* Chat List */}
          <Card className={`lg:col-span-1 overflow-hidden flex flex-col ${selectedRoomId ? 'hidden lg:flex' : 'flex'}`}>
            <div className="p-4 border-b bg-gradient-to-r from-pink-50 to-rose-50">
              <h2 className="text-xl font-bold">메시지</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chatRooms?.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedRoomId(chat.id)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-pink-50 transition-colors border-b ${selectedRoomId === chat.id ? "bg-pink-50" : ""}`}
                >
                  <div className="relative">
                    <img src={chat.petPhoto || "/placeholder.svg"} alt={chat.petName} className="h-12 w-12 rounded-full object-cover ring-2 ring-pink-200" />
                    {chat.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rose-500 flex items-center justify-center text-xs font-bold text-white">
                        {chat.unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900">{chat.otherUserName}</p>
                      <span className="text-xs text-muted-foreground">
                        {chat.lastMessageAt && formatDistanceToNow(new Date(chat.lastMessageAt), { addSuffix: true, locale: ko })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Chat Window */}
          <Card className={`lg:col-span-2 overflow-hidden flex flex-col ${!selectedRoomId ? 'hidden lg:flex' : 'flex'}`}>
            {selectedRoomId && selectedRoom ? (
              <>
                <div className="p-4 border-b bg-gradient-to-r from-pink-50 to-rose-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedRoomId(null)} className="lg:hidden">
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <img src={selectedRoom.petPhoto} alt="" className="h-10 w-10 rounded-full" />
                    <div>
                      <p className="font-semibold">{selectedRoom.otherUserName}</p>
                      <p className="text-xs text-muted-foreground">{selectedRoom.petName}</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                  {messages?.map((msg) => {
                    const isMe = msg.senderId === userId
                    return (
                      <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${isMe ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white" : "bg-gray-100 text-gray-900"}`}>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t bg-white flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="메시지 입력..."
                  />
                  <Button onClick={handleSendMessage} className="bg-rose-500"><Send className="h-5 w-5" /></Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                대화를 선택하세요
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