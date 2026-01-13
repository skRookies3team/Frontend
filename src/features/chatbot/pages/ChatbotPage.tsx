import type React from "react"
import { useState, useEffect, Component, type ReactNode, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Send, ChevronDown, Mic, Sparkles, X, Volume2, MicOff } from 'lucide-react'
import { useAuth } from "@/features/auth/context/auth-context"
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PetCanvas from '@/shared/components/3d/PetCanvas'
import { chatbotApi, ChatMessage, resetPersonaChatCounter } from "../api/chatbotApi"
import Pet3DModelUpload from '@/features/healthcare/components/Pet3DModelUpload'

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

export default function ChatbotPage() {
  const { user, token } = useAuth()
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
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState<'listening' | 'processing' | 'speaking'>('listening')
  const [speechText, setSpeechText] = useState("나는 너의 베프야! 멍멍!")
  const [showSpeech, setShowSpeech] = useState(true)
  const [showPetSelector, setShowPetSelector] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // STT 관련 상태
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])

  // 🆕 3D 모델 상태 - 모델이 있으면 대화 UI, 없으면 생성 UI 표시
  const [has3DModel, setHas3DModel] = useState<boolean>(false)
  const [model3DUrl, setModel3DUrl] = useState<string | null>(null)

  // 🆕 펫 선택 시 기존 3D 모델 확인 (localStorage 또는 API에서)
  useEffect(() => {
    if (selectedPet?.id) {
      const savedModelUrl = localStorage.getItem(`pet3DModel_${selectedPet.id}`)
      if (savedModelUrl) {
        setHas3DModel(true)
        setModel3DUrl(savedModelUrl)
      } else {
        setHas3DModel(false)
        setModel3DUrl(null)
      }
    }
  }, [selectedPet?.id])

  // 🆕 3D 모델 생성 완료 핸들러
  const handle3DModelGenerated = (modelUrl: string) => {
    if (selectedPet?.id) {
      localStorage.setItem(`pet3DModel_${selectedPet.id}`, modelUrl)
    }
    setModel3DUrl(modelUrl)
    setHas3DModel(true)
    setSpeechText(`안녕! 드디어 3D로 만났네! 이제 같이 대화하자! 🐕`)
    setShowSpeech(true)
  }

  // 펫 변경 시 초기 메시지 설정
  useEffect(() => {
    resetPersonaChatCounter() // 펫 변경 시 순차 응답 카운터 리셋
    setSpeechText(`안녕! 나는 ${selectedPet?.name || '멍멍이'}야! 오늘 기분 어때?`)
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
      // ⭐ Persona Chat - petId 전달로 SSE 스트리밍 활성화
      const response = await chatbotApi.sendMessage(
        userMsg.content, 
        user?.id || 'guest',
        selectedPet?.id // petId 전달 → SSE 스트리밍 모드
      )
      
      // If response is 'map' or 'disease', we guide the user to the Healthcare page instead
      if (response.type === 'map' || response.type === 'disease_list') {
         const redirectMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'bot',
            content: "아픈 곳이나 병원을 찾고 싶다면 '헬스케어' 탭으로 이동해봐! 나는 너랑 노는 게 더 좋아!",
            timestamp: new Date()
         };
         setMessages(prev => [...prev, redirectMsg]);
         setSpeechText("헬스케어 탭에서 도와줄 수 있어! 멍멍!");
      } else {
         setMessages(prev => [...prev, response])
         setSpeechText(response.content)
      }
      setShowSpeech(true)

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

  const handleSTT = async () => {
    setIsVoiceMode(true)
    setVoiceStatus('listening')
    
    try {
      // 1. 마이크 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // 2. MediaRecorder 설정
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      const chunks: Blob[] = []
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }
      
      recorder.onstop = async () => {
        // 3. 녹음 종료 시 처리
        setVoiceStatus('processing')
        stream.getTracks().forEach(track => track.stop()) // 마이크 리소스 해제
        
        try {
          // 4. Blob으로 변환 후 API 호출
          const audioBlob = new Blob(chunks, { type: 'audio/webm' })
          const formData = new FormData()
          formData.append('file', audioBlob, 'recording.webm')
          
          const response = await fetch('/api/chat/stt', {
            method: 'POST',
            body: formData,
            headers: token ? {
              'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
            } : {}
          })
          
          if (!response.ok) {
            throw new Error('STT API 호출 실패')
          }
          
          const data = await response.json()
          const transcribedText = data.text || data.transcript
          
          // 5. 변환된 텍스트로 채팅 전송
          if (transcribedText) {
            setInputValue(transcribedText)
            setIsVoiceMode(false)
            // 자동 전송 (선택사항)
            // handleSend()
          } else {
            setSpeechText("음성을 인식하지 못했어... 다시 말해줄래?")
            setVoiceStatus('listening')
          }
          
        } catch (apiError) {
          console.error('STT API Error:', apiError)
          setSpeechText("음성 변환 중 오류가 발생했어...")
          setVoiceStatus('listening')
        }
      }
      
      // 6. 녹음 시작
      setMediaRecorder(recorder)
      recorder.start()
      setAudioChunks([])
      
    } catch (error) {
      console.error('Microphone permission denied:', error)
      setSpeechText("마이크 권한이 필요해! 허용해줄래?")
      setIsVoiceMode(false)
    }
  }

  // 녹음 중지 함수
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop()
    }
  }

  const closeVoiceMode = () => {
    setIsVoiceMode(false)
    setVoiceStatus('listening')
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

      {/* 2. 3D Pet Canvas Layer (Middle) or 3D Model Upload UI */}
      <div className="absolute inset-0 z-10">
        {has3DModel ? (
          // ✅ 3D 모델이 있으면 → 대화 UI 표시
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
              modelUrl={model3DUrl}
            />
          </ErrorBoundary>
        ) : (
          // 🆕 3D 모델이 없으면 → 생성 UI 표시
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md w-full px-6"
            >
              {/* 헤더 */}
              <div className="text-center mb-8">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🐕
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {selectedPet?.name || '반려동물'}을(를) 3D로 만나보세요!
                </h2>
                <p className="text-white/60 text-sm">
                  사진 한 장으로 나만의 3D 펫을 생성하고<br />
                  실시간 대화를 즐겨보세요 ✨
                </p>
              </div>

              {/* 3D 모델 생성 컴포넌트 */}
              <Pet3DModelUpload
                petId={selectedPet?.id}
                onModelGenerated={handle3DModelGenerated}
              />

              {/* 스킵 버튼 (개발용) */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 2 } }}
                onClick={() => setHas3DModel(true)}
                className="mt-6 w-full text-center text-white/40 text-sm hover:text-white/60 transition-colors"
              >
                임시로 기본 모델 사용하기 →
              </motion.button>
            </motion.div>
          </div>
        )}
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

      {/* Chat Interface (Overlay) - 3D 모델이 있을 때만 표시 */}
      {has3DModel && (
       <div className="absolute left-0 right-0 bottom-24 px-4 z-20 overflow-hidden h-[40vh] pointer-events-none" style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)' }}>
          <div className="max-w-2xl mx-auto flex flex-col justify-end h-full space-y-3 pb-4 pt-16 px-2">
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
       </div>
      )}

      {/* Input Area - 3D 모델이 있을 때만 표시 */}
      {has3DModel && (
      <div className="absolute bottom-0 left-0 right-0 z-30 p-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-full shadow-2xl border border-white/10 p-2 flex items-center gap-3 transition-all focus-within:ring-2 focus-within:ring-pink-500/50 focus-within:bg-gray-900/80">
            {/* STT Button */}
            <Button 
               variant="ghost" 
               size="icon" 
               className="h-10 w-10 rounded-full text-pink-400 hover:text-pink-300 hover:bg-white/10 transition-colors"
               onClick={handleSTT}
            >
               <Mic className="w-5 h-5" />
            </Button>
            
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`${selectedPet?.name || '펫'}에게 말을 걸어보세요...`}
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
        </motion.div>
      </div>
      )}

      {/* Voice Mode Overlay */}
      <AnimatePresence>
        {isVoiceMode && (
            <motion.div
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute inset-0 z-50 bg-gray-950/95 backdrop-blur-3xl flex flex-col items-center justify-center font-sans"
            >
                {/* Close Button */}
                <button 
                    onClick={closeVoiceMode}
                    className="absolute top-6 right-6 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
                >
                    <X className="w-8 h-8" />
                </button>

                {/* Main Visualizer */}
                <div className="relative flex items-center justify-center w-full h-1/2">
                    {/* Concentric Circles Animation */}
                    <AnimatePresence mode='wait'>
                        {voiceStatus === 'listening' && (
                            <motion.div>
                                {[...Array(3)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute inset-0 m-auto rounded-full border border-pink-500/30"
                                        style={{ width: '150px', height: '150px' }}
                                        animate={{
                                            scale: [1, 2 + i * 0.5],
                                            opacity: [0.8, 0],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            delay: i * 0.6,
                                            ease: "easeOut"
                                        }}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Central Orb */}
                    <motion.div
                        animate={{
                            scale: voiceStatus === 'speaking' ? [1, 1.2, 1] : [1, 1.05, 1],
                            boxShadow: voiceStatus === 'speaking' 
                                ? "0 0 50px 10px rgba(236, 72, 153, 0.6)" 
                                : "0 0 30px 5px rgba(236, 72, 153, 0.3)"
                        }}
                        transition={{
                            duration: voiceStatus === 'speaking' ? 0.5 : 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="w-40 h-40 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 relative z-10 flex items-center justify-center shadow-2xl"
                    >
                        {voiceStatus === 'listening' && <Mic className="w-16 h-16 text-white" />}
                        {voiceStatus === 'speaking' && <Volume2 className="w-16 h-16 text-white" />}
                        {voiceStatus === 'processing' && <Sparkles className="w-16 h-16 text-white animate-spin-slow" />}
                    </motion.div>
                </div>

                {/* Status Text */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={voiceStatus}
                    className="mt-12 text-center space-y-2"
                >
                    <h2 className="text-3xl font-bold text-white">
                        {voiceStatus === 'listening' && "듣고 있어요..."}
                        {voiceStatus === 'processing' && "생각하는 중..."}
                        {voiceStatus === 'speaking' && "답변하는 중..."}
                    </h2>
                    <p className="text-white/50 text-lg">
                        {voiceStatus === 'listening' && "말씀해주세요"}
                        {voiceStatus === 'processing' && "잠시만 기다려주세요"}
                        {voiceStatus === 'speaking' && "AI 닥터가 말하고 있습니다"}
                    </p>
                </motion.div>

                {/* Bottom Controls */}
                <div className="absolute bottom-12 flex items-center gap-8">
                    <button 
                        onClick={stopRecording}
                        className={`p-6 rounded-full transition-all ${
                            voiceStatus === 'listening' 
                            ? 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30 ring-2 ring-rose-500/50' 
                            : 'bg-white/10 text-white/50 hover:bg-white/20'
                        }`}
                    >
                        {voiceStatus === 'listening' ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

