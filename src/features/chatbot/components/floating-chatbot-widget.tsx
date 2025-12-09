"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { MessageCircle, X, RotateCcw, Send, Plus, Sparkles, PenLine } from 'lucide-react'

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    content:
      "안녕하세요! 반려동물 관련 정보나 궁금한 점을 물어보세요. 건강, 훈련, 영양, 행동 등 다양한 주제에 대해 답변해드립니다.",
    sender: "bot",
    timestamp: new Date(),
  },
]

import { useAuth } from "@/features/auth/context/auth-context"

export function FloatingChatbotWidget() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isTyping, isOpen])

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
      const infoResponses = [
        "반려동물의 건강을 위해서는 정기적인 동물병원 검진이 중요합니다. 최소 1년에 1-2회 건강검진을 권장드립니다.",
        "강아지 사회화 훈련은 생후 3-14주 사이에 시작하는 것이 가장 효과적입니다. 다양한 환경, 사람, 동물에게 노출시켜 주세요.",
        "고양이는 하루에 체중 1kg당 50-60ml의 물을 섭취해야 합니다. 물그릇을 여러 곳에 두면 수분 섭취를 늘릴 수 있습니다.",
        "반려동물의 치아 건강도 중요합니다. 정기적인 양치질과 치석 제거로 치주 질환을 예방할 수 있습니다.",
        "급격한 행동 변화나 식욕 감소가 보인다면 건강 문제의 신호일 수 있으니 동물병원 방문을 권장드립니다.",
        "강아지의 적정 운동량은 품종과 나이에 따라 다릅니다. 소형견은 하루 30분, 대형견은 1-2시간 정도의 산책이 적절합니다.",
        "반려동물 비만은 당뇨, 관절염 등 다양한 질병의 원인이 됩니다. 적정 체중 유지를 위해 식단 관리와 규칙적인 운동이 필요합니다.",
      ]
      const botResponse = infoResponses[Math.floor(Math.random() * infoResponses.length)]

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

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES)
  }

  const handleOpenChat = () => {
    setIsOpen(true)
    setIsMenuOpen(false)
  }

  const handleOpenDiary = () => {
    // AI 다이어리 작성 페이지로 이동
    window.location.href = '/feed/create'
    setIsMenuOpen(false)
  }

  if (!user) {
    return null
  }

  return (
    <>
      {/* Floating Action Button with Menu */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8">
          {/* Menu Items */}
          {isMenuOpen && (
            <div className="absolute bottom-20 right-0 flex flex-col gap-3 mb-2">
              {/* AI 다이어리 작성하기 */}
              <div
                onClick={handleOpenDiary}
                className="group flex items-center gap-3 cursor-pointer"
              >
                <span className="bg-gray-900/90 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  AI 다이어리 작성하기
                </span>
                <Button
                  size="icon"
                  className="h-12 w-12 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg transition-all hover:scale-110 hover:from-pink-600 hover:to-rose-600 hover:shadow-xl"
                  aria-label="AI 다이어리 작성하기"
                >
                  <PenLine className="h-5 w-5 text-white" />
                </Button>
              </div>

              {/* 펫로그 AI 도우미 */}
              <div
                onClick={handleOpenChat}
                className="group flex items-center gap-3 cursor-pointer"
              >
                <span className="bg-gray-900/90 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  펫로그 AI 도우미
                </span>
                <Button
                  size="icon"
                  className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg transition-all hover:scale-110 hover:from-indigo-600 hover:to-purple-600 hover:shadow-xl"
                  aria-label="펫로그 AI 도우미"
                >
                  <MessageCircle className="h-5 w-5 text-white" />
                </Button>
              </div>
            </div>
          )}

          {/* Main FAB Button */}
          <Button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            size="icon"
            className={`h-14 w-14 rounded-full shadow-lg transition-all md:h-16 md:w-16 ${isMenuOpen
              ? 'bg-gray-800 hover:bg-gray-900 rotate-45'
              : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:scale-110 hover:from-indigo-600 hover:to-purple-600 hover:shadow-xl'
              }`}
            aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          >
            <Plus className="h-7 w-7 text-white md:h-8 md:w-8 transition-transform" />
          </Button>
        </div>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[500px] w-[350px] flex-col rounded-2xl bg-white shadow-2xl md:bottom-8 md:right-8 md:h-[550px] md:w-[380px]">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-2xl border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border-2 border-white">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="AI" />
                <AvatarFallback className="bg-white text-indigo-600 text-xs">AI</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">펫로그 AI 도우미</p>
                <p className="text-xs opacity-90">온라인</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReset}
                className="h-8 w-8 rounded-full text-white hover:bg-white/20"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Title */}
            <div className="text-center py-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">펫로그 도우미에게 물어보세요</h2>
              <p className="text-sm text-gray-500">반려동물 관련 정보를 안내해드립니다</p>
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-2 pb-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-indigo-200 text-indigo-600 hover:bg-indigo-50 bg-transparent text-xs"
                onClick={() => setInputValue("강아지 건강검진 주기는?")}
              >
                <Sparkles className="mr-1 h-3 w-3" />
                건강검진
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-indigo-200 text-indigo-600 hover:bg-indigo-50 bg-transparent text-xs"
                onClick={() => setInputValue("강아지 훈련 방법")}
              >
                <Sparkles className="mr-1 h-3 w-3" />
                훈련 방법
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-indigo-200 text-indigo-600 hover:bg-indigo-50 bg-transparent text-xs"
                onClick={() => setInputValue("반려동물 영양 관리")}
              >
                <Sparkles className="mr-1 h-3 w-3" />
                영양 관리
              </Button>
            </div>

            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                {message.sender === "bot" && (
                  <Avatar className="mr-2 mt-1 h-7 w-7 border border-indigo-100">
                    <AvatarImage src="/placeholder.svg?height=28&width=28" alt="AI" />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs">
                      AI
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`max-w-[75%] space-y-1 ${message.sender === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`rounded-2xl px-3 py-2 ${message.sender === "user"
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                      : "bg-gray-100 text-gray-900"
                      }`}
                  >
                    <p className="text-pretty text-sm leading-relaxed">{message.content}</p>
                  </div>
                  <p className="px-2 text-xs text-gray-400">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <Avatar className="mr-2 mt-1 h-7 w-7 border border-indigo-100">
                  <AvatarImage src="/placeholder.svg?height=28&width=28" alt="AI" />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs">
                    AI
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-2xl bg-gray-100 px-4 py-3">
                  <div className="flex gap-1">
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-indigo-500"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-indigo-500"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-indigo-500"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-full text-gray-500">
                <Plus className="h-5 w-5" />
              </Button>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="질문을 입력하세요..."
                className="flex-1 rounded-full border-gray-300 bg-gray-50 px-4 text-sm focus-visible:ring-indigo-500"
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                size="icon"
                className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-center text-xs text-gray-400">AI가 실수할 수 있습니다</p>
          </div>
        </div>
      )}
    </>
  )
}
