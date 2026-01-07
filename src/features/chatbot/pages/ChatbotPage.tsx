import type React from "react"
import { useState, useEffect, Component, type ReactNode, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Send, ChevronDown, Map, Stethoscope, ArrowLeft } from 'lucide-react'
import { useAuth } from "@/features/auth/context/auth-context"
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PetCanvas from '@/shared/components/3d/PetCanvas'
import { chatbotApi, ChatMessage, Hospital } from "../api/chatbotApi"
import MapContainer from "../components/MapContainer"
import DiseaseSearch from "../components/DiseaseSearch"

// Error Boundary Component
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

type ViewMode = 'chat' | 'map' | 'disease';

export default function ChatbotPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const petIdFromUrl = searchParams.get('petId')

  const pets = user?.pets || []
  const initialPet = petIdFromUrl
    ? pets.find(p => p.id === petIdFromUrl) || pets[0]
    : pets[0]

  const [selectedPet, setSelectedPet] = useState(initialPet)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [speechText, setSpeechText] = useState("멍멍! 반가워!")
  const [showSpeech, setShowSpeech] = useState(true)
  const [showPetSelector, setShowPetSelector] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('chat')
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 펫 변경 시 초기 메시지 설정
  useEffect(() => {
    setSpeechText(`안녕! 나는 ${selectedPet?.name || '멍멍이'}야!`)
    setShowSpeech(true)
    setMessages([])
  }, [selectedPet])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 말풍선 자동 숨김 타이머
  useEffect(() => {
    if (showSpeech && !isTyping) {
      const timer = setTimeout(() => {
        setShowSpeech(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showSpeech, speechText, isTyping])

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMsg])
    setInputValue("")
    setShowSpeech(false)
    setIsTyping(true)

    try {
      const response = await chatbotApi.sendMessage(userMsg.content, user?.id || 'guest')
      
      setMessages(prev => [...prev, response])
      setSpeechText(response.content)
      setShowSpeech(true)

      // Handle specific response types
      if (response.type === 'map') {
        const data = await chatbotApi.getNearbyHospitals(37.5665, 126.9780);
        setHospitals(data);
        setTimeout(() => setViewMode('map'), 1500);
      } else if (response.type === 'disease_list') {
         setTimeout(() => setViewMode('disease'), 1500);
      }

    } catch (error) {
      console.error("Chat error:", error)
      setSpeechText("멍멍... 뭔가 문제가 생긴 것 같아.")
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTTS = () => {
    alert("TTS 기능은 곧 추가될 예정입니다! 🎙️")
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-900 font-sans">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedPet?.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <img 
              src={selectedPet?.photo || "/placeholder.svg"} 
              alt="Background" 
              className="w-full h-full object-cover opacity-60 blur-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 2. 3D Pet Canvas Layer (Middle) */}
      <div className={`absolute inset-0 z-10 transition-all duration-700 ${viewMode !== 'chat' ? 'scale-90 opacity-30 blur-sm' : ''}`}>
        <ErrorBoundary fallback={
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex flex-col items-center gap-4">
                 <div className="text-6xl">🐕</div>
                 <p className="text-white/80 font-medium text-sm">3D 강아지 불러오는 중...</p>
              </div>
           </div>
        }>
          <PetCanvas
            speechText={speechText}
            showSpeech={showSpeech}
            isTyping={isTyping}
          />
        </ErrorBoundary>
      </div>

      {/* Side Pet Selector (Top Right) */}
      <div className="absolute top-6 right-6 z-30">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative"
        >
          <button
            onClick={() => setShowPetSelector(!showPetSelector)}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full pl-2 pr-4 py-1.5 border border-white/20 hover:bg-white/20 transition-all group shadow-lg"
          >
            <Avatar className="h-8 w-8 border border-white/50">
              <AvatarImage src={selectedPet?.photo || "/placeholder.svg"} />
              <AvatarFallback>{selectedPet?.name?.[0]}</AvatarFallback>
            </Avatar>
            <span className="text-white font-medium text-sm group-hover:text-white/90">
              {selectedPet?.name}
            </span>
            <ChevronDown className={`h-4 w-4 text-white/70 transition-transform ${showPetSelector ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showPetSelector && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-2 bg-gray-900/90 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden min-w-[180px]"
              >
                {pets.map((pet) => (
                  <button
                    key={pet.id}
                    onClick={() => {
                      setSelectedPet(pet)
                      setShowPetSelector(false)
                    }}
                    className={`w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-colors ${selectedPet?.id === pet.id ? 'bg-white/5' : ''
                      }`}
                  >
                    <Avatar className="h-8 w-8 border border-white/20">
                      <AvatarImage src={pet.photo || "/placeholder.svg"} />
                      <AvatarFallback>{pet.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-medium text-white text-sm">{pet.name}</p>
                      <p className="text-[10px] text-white/50">{pet.breed}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      
      {/* Mode Switcher / Back Button */}
      {viewMode !== 'chat' && (
         <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-6 left-6 z-50"
         >
            <Button 
               variant="secondary" 
               className="bg-white/10 backdrop-blur border border-white/20 text-white hover:bg-white/20 rounded-full gap-2 pl-3 pr-4"
               onClick={() => setViewMode('chat')}
            >
               <ArrowLeft className="w-4 h-4" /> 채팅으로 돌아가기
            </Button>
         </motion.div>
      )}

      {/* Quick Actions (When in Chat Mode) */}
      <AnimatePresence>
         {viewMode === 'chat' && (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 20 }}
               className="absolute top-6 left-6 z-30 flex gap-2"
            >
               <Button 
                  size="sm" 
                  className="bg-white/10 backdrop-blur text-white border border-white/10 hover:bg-white/20 rounded-full gap-2"
                  onClick={() => {
                     // Trigger Map via API call simulation or direct mode switch
                     // For UI demo, direct switch:
                     chatbotApi.getNearbyHospitals(37.5665, 126.9780).then(data => setHospitals(data));
                     setViewMode('map');
                  }}
               >
                  <Map className="w-4 h-4 text-emerald-400" /> 병원 찾기
               </Button>
               <Button 
                  size="sm" 
                  className="bg-white/10 backdrop-blur text-white border border-white/10 hover:bg-white/20 rounded-full gap-2"
                  onClick={() => setViewMode('disease')}
               >
                  <Stethoscope className="w-4 h-4 text-pink-400" /> 증상 검색
               </Button>
            </motion.div>
         )}
      </AnimatePresence>


      {/* Chat Interface (Overlay) */}
      <AnimatePresence>
      {viewMode === 'chat' && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute left-0 right-0 bottom-24 px-4 z-20 overflow-hidden h-[35vh] mask-linear-fade pointer-events-none"
          >
             <div className="max-w-2xl mx-auto flex flex-col justify-end h-full space-y-3 pb-4 px-2">
                {messages.slice(-5).map((message) => (
                   <motion.div
                     key={message.id}
                     initial={{ opacity: 0, y: 20, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} pointer-events-auto`}
                   >
                     <div className={`max-w-[85%] px-5 py-3 rounded-2xl backdrop-blur-md text-sm shadow-lg border border-white/5 ${
                       message.sender === 'user' 
                         ? 'bg-pink-500/80 text-white rounded-br-sm' 
                         : 'bg-gray-800/60 text-white rounded-bl-sm'
                     }`}>
                       {message.content}
                     </div>
                   </motion.div>
                ))}
                <div ref={messagesEndRef} />
             </div>
          </motion.div>

          {/* Input Area */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-0 left-0 right-0 z-30 p-6 pb-8"
          >
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-full shadow-2xl border border-white/10 p-2 flex items-center gap-3 transition-all focus-within:ring-2 focus-within:ring-pink-500/50 focus-within:bg-gray-900/80">
                <Button 
                   variant="ghost" 
                   size="icon" 
                   className="h-10 w-10 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                   onClick={handleTTS}
                >
                   <span className="text-lg">🎙️</span>
                </Button>
                
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="증상을 말하거나 궁금한 점을 물어보세요..."
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2 text-white placeholder:text-white/30 text-base h-10"
                />
                
                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all transform hover:scale-105 active:scale-95"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
      </AnimatePresence>

      {/* Modes Overlay */}
      <AnimatePresence>
        {viewMode === 'map' && (
          <MapContainer 
            onClose={() => setViewMode('chat')} 
            hospitals={hospitals}
          />
        )}
        {viewMode === 'disease' && (
          <DiseaseSearch 
            onClose={() => setViewMode('chat')} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}
