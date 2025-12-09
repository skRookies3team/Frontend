import type React from "react"
import { useState, useEffect, Component, ReactNode } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Send, ChevronDown } from 'lucide-react'
import { useAuth } from "@/features/auth/context/auth-context"
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PetCanvas from '@/shared/components/3d/PetCanvas'

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

// 에러 경계 컴포넌트
interface ErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

const PET_RESPONSES = [
  "멍멍! 네가 말할 때마다 너무 좋아!",
  "대박! 지금 당장 공원에 갈 수 있을까?",
  "넌 최고의 집사야! 정말 사랑해!",
  "오오, 더 말해줘! 내 꼬리가 이미 흔들리고 있어!",
  "너를 내 집사로 둔 건 정말 행운이야!",
  "왈! 간식 줄 거야? 기대되는데?",
  "하루 종일 너랑 놀고 싶어! 산책 갈래?",
  "멍멍! 오늘도 너와 함께해서 행복해!",
]

export default function ChatbotPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const petIdFromUrl = searchParams.get('petId')

  const pets = user?.pets || []
  const initialPet = petIdFromUrl
    ? pets.find(p => p.id === petIdFromUrl) || pets[0]
    : pets[0]

  const [selectedPet, setSelectedPet] = useState(initialPet)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [speechText, setSpeechText] = useState("멍멍! 반가워!")
  const [showSpeech, setShowSpeech] = useState(true)
  const [showPetSelector, setShowPetSelector] = useState(false)

  // 펫 변경 시 초기 메시지 설정
  useEffect(() => {
    setSpeechText("멍멍! 반가워!")
    setShowSpeech(true)
    setMessages([])
  }, [selectedPet])

  useEffect(() => {
    if (petIdFromUrl) {
      const pet = pets.find(p => p.id === petIdFromUrl)
      if (pet) {
        setSelectedPet(pet)
      }
    }
  }, [petIdFromUrl, pets])

  // 말풍선 자동 숨김 타이머
  useEffect(() => {
    if (showSpeech && !isTyping) {
      const timer = setTimeout(() => {
        setShowSpeech(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showSpeech, speechText, isTyping])

  const handleSend = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setShowSpeech(false)
    setIsTyping(true)

    // 1.5초 후 펫 응답
    setTimeout(() => {
      const botResponse = PET_RESPONSES[Math.floor(Math.random() * PET_RESPONSES.length)]

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, botMessage])
      setSpeechText(botResponse)
      setIsTyping(false)
      setShowSpeech(true)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 3D 로딩/에러 시 보여줄 fallback
  const CanvasFallback = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-sky-200 via-green-100 to-amber-100">
      <div className="flex flex-col items-center gap-4">
        <div className="text-8xl">🐕</div>
        <p className="text-pink-600 font-medium">강아지가 준비 중이에요...</p>
      </div>
    </div>
  )

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-sky-100 via-green-50 to-amber-50">
      {/* 3D Canvas 배경 */}
      <ErrorBoundary fallback={<CanvasFallback />}>
        <PetCanvas
          speechText={speechText}
          showSpeech={showSpeech}
          isTyping={isTyping}
        />
      </ErrorBoundary>

      {/* 상단 헤더 - 펫 선택 */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20">
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setShowPetSelector(!showPetSelector)}
          className="flex items-center gap-3 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-pink-100 hover:bg-white transition-colors"
        >
          <Avatar className="h-10 w-10 border-2 border-pink-300">
            <AvatarImage src={selectedPet?.photo || "/placeholder.svg"} alt={selectedPet?.name} />
            <AvatarFallback>{selectedPet?.name?.[0] || '🐕'}</AvatarFallback>
          </Avatar>
          <div className="text-left">
            <p className="font-bold text-gray-800">{selectedPet?.name || '펫'}</p>
            <p className="text-xs text-gray-500">{selectedPet?.breed || '대화하기'}</p>
          </div>
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${showPetSelector ? 'rotate-180' : ''}`} />
        </motion.button>

        {/* 펫 선택 드롭다운 */}
        <AnimatePresence>
          {showPetSelector && pets.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-pink-100 overflow-hidden min-w-[200px]"
            >
              {pets.map((pet) => (
                <button
                  key={pet.id}
                  onClick={() => {
                    setSelectedPet(pet)
                    setShowPetSelector(false)
                  }}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-pink-50 transition-colors ${selectedPet?.id === pet.id ? 'bg-pink-50' : ''
                    }`}
                >
                  <Avatar className="h-10 w-10 border-2 border-pink-200">
                    <AvatarImage src={pet.photo || "/placeholder.svg"} alt={pet.name} />
                    <AvatarFallback>{pet.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">{pet.name}</p>
                    <p className="text-xs text-gray-500">{pet.breed}</p>
                  </div>
                  {selectedPet?.id === pet.id && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-green-500" />
                  )}
                </button>
              ))}
              <Link to="/pet-info?returnTo=/chatbot" className="block">
                <button className="w-full p-3 text-sm text-pink-600 font-medium hover:bg-pink-50 border-t border-pink-100">
                  + 반려동물 추가하기
                </button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 채팅 기록 */}
      {messages.length > 0 && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 max-h-[40vh] overflow-y-auto">
          <div className="space-y-2 max-w-xs">
            {messages.slice(-5).map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`rounded-2xl px-4 py-2 text-sm ${message.sender === "user"
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white ml-auto"
                  : "bg-white/80 backdrop-blur-sm text-gray-800"
                  }`}
              >
                {message.content}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 하단 입력창 - Glassmorphism */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white/70 backdrop-blur-xl rounded-full shadow-2xl border border-white/50 p-2 flex items-center gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`${selectedPet?.name || '펫'}에게 말해보세요...`}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-4 text-gray-800 placeholder:text-gray-400"
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              size="icon"
              className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg disabled:opacity-50 transition-all hover:scale-105"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-center text-xs text-gray-500 mt-2">
            마우스로 강아지를 회전시켜 보세요! 🐕
          </p>
        </motion.div>
      </div>
    </div>
  )
}
