"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, Phone, Video, MoreVertical, ImageIcon, Smile } from "lucide-react"

interface Message {
  id: string
  senderId: string
  text: string
  timestamp: Date
  isRead: boolean
}

interface Chat {
  id: string
  userId: string
  userName: string
  userAvatar: string
  petName: string
  petPhoto: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
}

function MessagesContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedUserId = searchParams.get("user")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [chats, setChats] = useState<Chat[]>([
    {
      id: "1",
      userId: "1",
      userName: "포메사랑",
      userAvatar: "/placeholder.svg?height=100&width=100",
      petName: "뭉치",
      petPhoto: "/pomeranian-dog.png",
      lastMessage: "내일 저녁 7시에 한강공원에서 만나요!",
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
      unreadCount: 2,
    },
    {
      id: "2",
      userId: "2",
      userName: "골댕이집사",
      userAvatar: "/placeholder.svg?height=100&width=100",
      petName: "해피",
      petPhoto: "/golden-retriever.png",
      lastMessage: "오늘 산책 어떠셨어요?",
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
      unreadCount: 0,
    },
  ])

  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      senderId: "1",
      text: "안녕하세요! 같은 포메를 키우시는군요 😊",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      isRead: true,
    },
    {
      id: "2",
      senderId: "me",
      text: "네, 반가워요! 뭉치 정말 귀엽네요 🐶",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23),
      isRead: true,
    },
    {
      id: "3",
      senderId: "1",
      text: "감사해요! 혹시 어디서 미용하세요?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22),
      isRead: true,
    },
    {
      id: "4",
      senderId: "me",
      text: "한강 근처에 있는 펫살롱 다녀요. 실력 좋고 가격도 괜찮아요!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 21),
      isRead: true,
    },
    {
      id: "5",
      senderId: "1",
      text: "오! 좋은 정보 감사해요. 혹시 내일 저녁에 같이 산책 어떠세요?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      isRead: true,
    },
    {
      id: "6",
      senderId: "me",
      text: "좋아요! 몇 시가 좋으세요?",
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      isRead: true,
    },
    {
      id: "7",
      senderId: "1",
      text: "내일 저녁 7시에 한강공원에서 만나요!",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isRead: false,
    },
  ])

  const [newMessage, setNewMessage] = useState("")

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.push("/login")
      return
    }

    if (selectedUserId) {
      const chat = chats.find((c) => c.userId === selectedUserId)
      if (chat) {
        setSelectedChat(chat)
      }
    }
  }, [user, isLoading, router, selectedUserId, chats])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      senderId: "me",
      text: newMessage,
      timestamp: new Date(),
      isRead: false,
    }

    setMessages([...messages, message])
    setNewMessage("")

    // Update chat list
    if (selectedChat) {
      setChats(
        chats.map((chat) =>
          chat.id === selectedChat.id
            ? {
                ...chat,
                lastMessage: newMessage,
                lastMessageTime: new Date(),
              }
            : chat,
        ),
      )
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days > 0) return `${days}일 전`
    if (hours > 0) return `${hours}시간 전`
    return "방금 전"
  }

  const formatMessageTime = (date: Date) => {
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
              <p className="text-sm text-muted-foreground mt-1">{chats.length}개의 대화</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-pink-50 transition-colors border-b ${
                    selectedChat?.id === chat.id ? "bg-pink-50" : ""
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
                      <p className="font-semibold text-gray-900">{chat.userName}</p>
                      <span className="text-xs text-muted-foreground">{formatTime(chat.lastMessageTime)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Chat Window */}
          <Card className="lg:col-span-2 overflow-hidden flex flex-col">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b bg-gradient-to-r from-pink-50 to-rose-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedChat(null)} className="lg:hidden">
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <img
                      src={selectedChat.petPhoto || "/placeholder.svg"}
                      alt={selectedChat.petName}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-pink-200"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{selectedChat.userName}</p>
                      <p className="text-sm text-muted-foreground">{selectedChat.petName}</p>
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
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === "me" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] ${
                          message.senderId === "me"
                            ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                            : "bg-gray-100 text-gray-900"
                        } rounded-2xl px-4 py-3`}
                      >
                        <p className="text-sm leading-relaxed">{message.text}</p>
                        <p className={`text-xs mt-1 ${message.senderId === "me" ? "text-pink-100" : "text-gray-500"}`}>
                          {formatMessageTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
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
