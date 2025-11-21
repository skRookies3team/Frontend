"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, Users, Sparkles, Activity, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"

const features = [
  {
    id: "chatbot",
    title: "펫 챗봇",
    emoji: "🐕",
    description: "AI가 우리 아이의 성격을 학습해 실제로 대화하는 것처럼 답변해요",
    color: "from-purple-500 to-pink-500",
    icon: MessageCircle,
    preview: (
      <div className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-purple-300">
            <img src="/golden-retriever.png" alt="초코" className="h-full w-full object-cover" />
          </div>
          <div>
            <h3 className="font-semibold">초코</h3>
            <p className="text-xs text-green-500">● 온라인</p>
          </div>
        </div>
        <div className="flex-1 space-y-4 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-end"
          >
            <div className="max-w-[70%] rounded-2xl rounded-tr-sm bg-purple-500 px-4 py-3 text-white">
              초코야, 오늘 기분 어때?
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex items-start gap-2"
          >
            <div className="h-8 w-8 overflow-hidden rounded-full border border-gray-200">
              <img src="/golden-retriever.png" alt="초코" className="h-full w-full object-cover" />
            </div>
            <div className="max-w-[70%] rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3">
              멍멍! 오늘 날씨가 좋아서 기분이 정말 좋아요! 산책 나가고 싶어요 🐾
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="flex justify-end"
          >
            <div className="max-w-[70%] rounded-2xl rounded-tr-sm bg-purple-500 px-4 py-3 text-white">
              그래? 그럼 조금 있다가 공원 갈까?
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
            className="flex items-start gap-2"
          >
            <div className="h-8 w-8 overflow-hidden rounded-full border border-gray-200">
              <img src="/golden-retriever.png" alt="초코" className="h-full w-full object-cover" />
            </div>
            <div className="max-w-[70%] rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3">
              와! 정말요? 너무 좋아요! 공 가지고 갈 거죠? 🎾
            </div>
          </motion.div>
        </div>
      </div>
    ),
  },
  {
    id: "feed",
    title: "소셜 피드",
    emoji: "👥",
    description: "반려동물 보호자들과 일상을 공유하고 소통해요",
    color: "from-rose-500 to-pink-500",
    icon: Users,
    preview: (
      <div className="h-full overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="space-y-4 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-gray-200 bg-white p-4"
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-400" />
              <div>
                <h4 className="font-semibold">냥이집사</h4>
                <p className="text-xs text-muted-foreground">5분 전</p>
              </div>
            </div>
            <div className="mb-3 aspect-square overflow-hidden rounded-xl">
              <img
                src="/cute-cat-playing.png"
                alt="post"
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mb-2 text-sm">오늘 우리 냥이 생일 🎂✨</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <button className="flex items-center gap-1 hover:text-rose-500">
                ❤️ 234
              </button>
              <button className="flex items-center gap-1 hover:text-blue-500">
                💬 48
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    ),
  },
  {
    id: "recap",
    title: "AI 리캡",
    emoji: "✨",
    description: "AI가 사진을 분석해 감성적인 일기로 자동 작성해줘요",
    color: "from-blue-500 to-cyan-500",
    icon: Sparkles,
    preview: (
      <div className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-4"
        >
          <div className="mb-3 grid grid-cols-3 gap-2">
            <div className="aspect-square overflow-hidden rounded-lg">
              <img
                src="/lively-dog-park.png"
                alt="photo 1"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="aspect-square overflow-hidden rounded-lg">
              <img
                src="/dog-playing-ball.jpg"
                alt="photo 2"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="aspect-square overflow-hidden rounded-lg">
              <img
                src="/happy-golden-retriever.png"
                alt="photo 3"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex-1 space-y-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 p-4"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
            <Sparkles className="h-4 w-4" />
            AI가 작성한 일기
          </div>
          <h3 className="text-lg font-bold">공원에서의 즐거운 하루 ☀️</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            오늘은 날씨가 정말 좋았어요. 초코와 함께 공원에서 공놀이를 했답니다. 공을 쫓아가는 초코의 모습이 정말 행복해 보였어요. 햇살 아래서 반짝이는 초코의 털이 아름다웠습니다...
          </p>
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span>📍 한강공원</span>
            <span>☀️ 맑음 23°C</span>
          </div>
        </motion.div>
      </div>
    ),
  },
  {
    id: "healthcare",
    title: "헬스케어",
    emoji: "💊",
    description: "반려동물의 건강을 실시간으로 모니터링하고 관리해요",
    color: "from-emerald-500 to-teal-500",
    icon: Activity,
    preview: (
      <div className="flex h-full flex-col gap-4 rounded-2xl bg-white p-6 shadow-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
            <div className="mb-2 text-xs font-medium text-emerald-600">심박수</div>
            <div className="text-2xl font-bold">85</div>
            <div className="text-xs text-muted-foreground">bpm (정상)</div>
          </div>
          <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
            <div className="mb-2 text-xs font-medium text-blue-600">호흡수</div>
            <div className="text-2xl font-bold">24</div>
            <div className="text-xs text-muted-foreground">회/분 (정상)</div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex-1 rounded-xl border border-gray-200 bg-gray-50 p-4"
        >
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-600">
            <Activity className="h-4 w-4" />
            AI 건강 진단
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>전반적인 활동량 정상</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>수면 패턴 양호</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>식욕 및 배변 정상</span>
            </div>
          </div>
          <div className="mt-4 rounded-lg bg-white p-3 text-xs text-muted-foreground">
            초코의 건강 상태는 매우 양호합니다. 꾸준한 산책과 규칙적인 식사를 유지해주세요.
          </div>
        </motion.div>
      </div>
    ),
  },
]

export function FeaturePreviewAnimation() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  useEffect(() => {
    if (!isAutoPlay) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [isAutoPlay])

  const handlePrevious = () => {
    setIsAutoPlay(false)
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length)
  }

  const handleNext = () => {
    setIsAutoPlay(false)
    setCurrentIndex((prev) => (prev + 1) % features.length)
  }

  const currentFeature = features[currentIndex]
  const Icon = currentFeature.icon

  return (
    <div className="relative">
      {/* Main Preview Area */}
      <div className="relative overflow-hidden rounded-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFeature.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className={`relative min-h-[600px] rounded-3xl bg-gradient-to-br ${currentFeature.color} p-1`}
          >
            <div className="relative h-full rounded-3xl bg-gray-50 p-8 md:p-12">
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg">
                  <Icon className="h-8 w-8 text-gray-700" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold">
                    {currentFeature.emoji} {currentFeature.title}
                  </h3>
                  <p className="text-lg text-muted-foreground">{currentFeature.description}</p>
                </div>
              </div>

              {/* Preview Content */}
              <div className="h-[400px]">{currentFeature.preview}</div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur transition-all hover:scale-110 hover:bg-white"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur transition-all hover:scale-110 hover:bg-white"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Indicator Dots */}
      <div className="mt-8 flex items-center justify-center gap-3">
        {features.map((feature, index) => (
          <button
            key={feature.id}
            onClick={() => {
              setIsAutoPlay(false)
              setCurrentIndex(index)
            }}
            className="group relative"
          >
            <div
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? "w-12 bg-gradient-to-r " + feature.color : "w-2 bg-gray-300"
              }`}
            />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
              {feature.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
