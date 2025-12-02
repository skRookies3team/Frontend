import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"

const banners = [
  {
    id: 1,
    title: "🎉 신규 회원 가입 이벤트",
    description: "첫 AI 다이어리 작성 시 펫코인 100개 지급!",
    image: "/golden-retriever-playing-park.jpg",
    badge: "오늘출발",
    ctaText: "보고픈 장소 바차케어텐",
  },
  {
    id: 2,
    title: "🏥 withapet 연동 이벤트",
    description: "웨어러블 기기 연동하고 펫코인 150개 받으세요",
    image: "/dog-running-grass.jpg",
    badge: "마지막",
    ctaText: "오늘을 또 뭐 입지?",
  },
  {
    id: 3,
    title: "🛍️ 쇼핑몰 오픈 기념",
    description: "모든 상품 20% 할인! 펫코인으로 구매 가능",
    image: "/tabby-cat-sunbeam.png",
    badge: "오늘출발",
    ctaText: "고민 없는 1초 출근템",
  },
  {
    id: 4,
    title: "📢 펫메이트 서비스 업데이트",
    description: "새로운 매칭 알고리즘으로 완벽한 산책 친구를 찾아보세요",
    image: "/cat-in-box.jpg",
    badge: "주말 배송",
    ctaText: "스윗한 뒷모습도 챙길게요",
  },
]

export function EventBannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1)
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  const handlePrev = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const handleNext = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  }

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-2xl h-[200px] lg:h-[260px]">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="absolute inset-0"
        >
          <div className="relative h-full w-full">
            <img
              src={banners[currentIndex].image || "/placeholder.svg"}
              alt={banners[currentIndex].title}
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

            {/* Content */}
            <div className="relative h-full flex flex-col justify-center px-8 lg:px-16 text-white">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="bg-white text-pink-600 px-3 py-1 rounded-full text-xs font-bold">
                  {banners[currentIndex].badge}
                </span>
                <span className="bg-pink-500/90 px-3 py-1 rounded-full text-xs font-semibold">
                  특가
                </span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold mb-3 drop-shadow-lg leading-tight max-w-lg">
                {banners[currentIndex].title}
              </h2>
              <p className="text-base lg:text-xl mb-6 drop-shadow-md max-w-md opacity-95">
                {banners[currentIndex].description}
              </p>
              <div className="text-sm lg:text-base opacity-90">
                {banners[currentIndex].ctaText} →
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-lg h-10 w-10"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-lg h-10 w-10"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1)
              setCurrentIndex(index)
            }}
            className={`h-1.5 rounded-full transition-all shadow-sm ${index === currentIndex ? "w-8 bg-white" : "w-1.5 bg-white/60 hover:bg-white/80"
              }`}
          />
        ))}
      </div>
    </div>
  )
}
