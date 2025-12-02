import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Send, Paperclip, Heart, Camera, Smile } from 'lucide-react'
import { useAuth } from "@/lib/auth-context"
import { useSearchParams } from 'react-router-dom'

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

const PERSONA_INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    content: "멍멍! 나랑 대화하려고 온 거야? 너무 좋아!",
    sender: "bot",
    timestamp: new Date(Date.now() - 3600000),
  },
]

export default function ChatbotPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const petIdFromUrl = searchParams.get('petId')

  const pets = user?.pets || [
    { id: "1", name: "초코", breed: "골든 리트리버", photo: "/golden-retriever.png", age: "3살", personality: "활발하고 사교적", emoji: "🐕" },
    { id: "2", name: "모카", breed: "푸들", photo: "/fluffy-white-poodle.png", age: "2살", personality: "영리하고 장난기 많음", emoji: "🐩" },
  ]

  const initialPet = petIdFromUrl
    ? pets.find(p => p.id === petIdFromUrl) || pets[0]
    : pets[0]

  const [selectedPet, setSelectedPet] = useState(initialPet)
  const [currentTitlePetIndex, setCurrentTitlePetIndex] = useState(0)
  const [messages, setMessages] = useState<Message[]>(PERSONA_INITIAL_MESSAGES)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    setMessages([
      {
        id: "1",
        content: "멍멍! 나랑 대화하려고 온 거야? 너무 좋아!",
        sender: "bot",
        timestamp: new Date(),
      },
    ])
  }, [selectedPet])

  useEffect(() => {
    if (pets.length > 1) {
      const interval = setInterval(() => {
        setCurrentTitlePetIndex((prev) => (prev + 1) % pets.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [pets.length])

  useEffect(() => {
    if (petIdFromUrl) {
      const pet = pets.find(p => p.id === petIdFromUrl)
      if (pet) {
        setSelectedPet(pet)
      }
    }
  }, [petIdFromUrl, pets])

  const handleSend = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages([...messages, userMessage])
    setInputValue("")

    setIsTyping(true)
    setTimeout(() => {
      const petResponses = [
        "멍멍! 네가 말할 때마다 너무 좋아!",
        "대박! 지금 당장 공원에 갈 수 있을까?",
        "넌 최고의 집사야! 정말 사랑해!",
        "오오, 더 말해줘! 내 꼬리가 이미 흔들리고 있어!",
        "너를 내 집사로 둔 건 정말 행운이야!",
        "왈! 간식 줄 거야? 기대되는데?",
        "하루 종일 너랑 놀고 싶어! 산책 갈래?",
      ]
      const botResponse = petResponses[Math.floor(Math.random() * petResponses.length)]

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 pt-16">
      {/* Left Sidebar - Pet Selection */}
      <aside className="hidden md:flex md:w-80 flex-col border-r border-pink-100 bg-white/80 backdrop-blur-sm">
        <div className="p-6 border-b border-pink-100">
          <h2 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            {pets[currentTitlePetIndex].emoji} {pets[currentTitlePetIndex].name}이와 대화하기
          </h2>
          <p className="text-sm text-muted-foreground mt-1">대화할 반려동물을 선택하세요</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {pets.map((pet) => (
            <button
              key={pet.id}
              onClick={() => setSelectedPet(pet)}
              className={`w-full p-4 rounded-2xl transition-all ${selectedPet.id === pet.id
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg scale-105'
                : 'bg-white hover:bg-pink-50 text-foreground shadow-sm hover:shadow-md'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className={`h-14 w-14 border-2 ${selectedPet.id === pet.id ? 'border-white' : 'border-pink-200'
                    }`}>
                    <AvatarImage src={pet.photo || "/placeholder.svg"} alt={pet.name} />
                    <AvatarFallback>{pet.name[0]}</AvatarFallback>
                  </Avatar>
                  {selectedPet.id === pet.id && (
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-left">
                  <p className="font-bold text-base">{pet.name}</p>
                  <p className={`text-xs ${selectedPet.id === pet.id ? 'text-pink-100' : 'text-muted-foreground'}`}>
                    {pet.breed} · {pet.age}
                  </p>
                  <p className={`text-xs mt-1 ${selectedPet.id === pet.id ? 'text-white/90' : 'text-muted-foreground'}`}>
                    {pet.personality}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-pink-100">
          <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-xl">
            + 반려동물 추가하기
          </Button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <header className="border-b border-pink-100 bg-white/95 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-14 w-14 border-3 border-pink-500 shadow-lg">
                  <AvatarImage src={selectedPet.photo || "/placeholder.svg"} alt={selectedPet.name} />
                  <AvatarFallback>{selectedPet.name[0]}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white" />
              </div>

              <div className="flex-1">
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  {selectedPet.name}
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    온라인
                  </span>
                  <span>·</span>
                  <span>{selectedPet.breed}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-pink-50">
                  <Heart className="h-5 w-5 text-pink-500" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-pink-50">
                  <Camera className="h-5 w-5 text-pink-500" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                {message.sender === "bot" && (
                  <Avatar className="mr-3 mt-1 h-10 w-10 border-2 border-pink-200 shadow-md">
                    <AvatarImage src={selectedPet.photo || "/placeholder.svg"} alt={selectedPet.name} />
                    <AvatarFallback>{selectedPet.name[0]}</AvatarFallback>
                  </Avatar>
                )}

                <div className={`max-w-[70%] space-y-2 ${message.sender === "user" ? "items-end" : "items-start"}`}>
                  {message.sender === "bot" && (
                    <p className="text-xs font-medium text-pink-600 px-2">{selectedPet.name}</p>
                  )}

                  <div
                    className={`rounded-3xl px-6 py-4 ${message.sender === "user"
                      ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                      : "bg-white text-foreground shadow-md border border-pink-100"
                      }`}
                  >
                    <p className="text-pretty leading-relaxed">{message.content}</p>
                  </div>

                  <p className="px-2 text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>

                {message.sender === "user" && (
                  <Avatar className="ml-3 mt-1 h-10 w-10 border-2 border-purple-200 shadow-md">
                    <AvatarImage src={user?.avatar || "/placeholder.svg?height=40&width=40&query=user"} alt="You" />
                    <AvatarFallback>나</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <Avatar className="mr-3 mt-1 h-10 w-10 border-2 border-pink-200 shadow-md">
                  <AvatarImage src={selectedPet.photo || "/placeholder.svg"} alt={selectedPet.name} />
                  <AvatarFallback>{selectedPet.name[0]}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-pink-600 px-2">{selectedPet.name}</p>
                  <Card className="rounded-3xl border-0 px-6 py-4 shadow-md bg-white">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-pink-500" style={{ animationDelay: "0ms" }} />
                      <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-pink-500" style={{ animationDelay: "150ms" }} />
                      <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-pink-500" style={{ animationDelay: "300ms" }} />
                    </div>
                  </Card>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-pink-100 bg-white/95 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 shrink-0 rounded-full hover:bg-pink-50 text-pink-600"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 shrink-0 rounded-full hover:bg-pink-50 text-pink-600"
                >
                  <Smile className="h-5 w-5" />
                </Button>

                <div className="flex-1 relative">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`${selectedPet.name}에게 메시지를 보내보세요...`}
                    className="rounded-full border-2 border-pink-200 bg-white px-6 py-6 focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:border-pink-500"
                  />
                </div>

                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  size="icon"
                  className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
