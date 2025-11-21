"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DiaryEntry {
  id: string
  date: string
  photo: string
  title: string
}

const mockDiaries: DiaryEntry[] = [
  {
    id: "1",
    date: "2025-01-15",
    photo: "/golden-retriever-playing-park.jpg",
    title: "공원에서 즐거운 하루",
  },
  {
    id: "2",
    date: "2025-01-14",
    photo: "/dog-running-grass.jpg",
    title: "신나게 뛰어노는 날",
  },
  {
    id: "3",
    date: "2025-01-13",
    photo: "/tabby-cat-sunbeam.png",
    title: "햇살 좋은 오후",
  },
  {
    id: "4",
    date: "2025-01-12",
    photo: "/cat-in-box.jpg",
    title: "상자 탐험 시간",
  },
  {
    id: "5",
    date: "2025-01-11",
    photo: "/golden-retriever.png",
    title: "행복한 미소",
  },
]

export function DiaryCarousel3D() {
  const [currentIndex, setCurrentIndex] = useState(2)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mockDiaries.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const handlePrev = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + mockDiaries.length) % mockDiaries.length)
  }

  const handleNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % mockDiaries.length)
  }

  const getCardStyle = (index: number) => {
    const diff = (index - currentIndex + mockDiaries.length) % mockDiaries.length
    const adjustedDiff = diff > mockDiaries.length / 2 ? diff - mockDiaries.length : diff

    const baseRotateY = adjustedDiff * 25
    const baseTranslateX = adjustedDiff * 160
    const baseTranslateZ = -Math.abs(adjustedDiff) * 180
    const scale = 1 - Math.abs(adjustedDiff) * 0.15
    const opacity = Math.max(0.3, 1 - Math.abs(adjustedDiff) * 0.25)

    return {
      transform: `
        translateX(${baseTranslateX}px)
        translateZ(${baseTranslateZ}px)
        rotateY(${baseRotateY}deg)
        scale(${scale})
      `,
      opacity,
      zIndex: 10 - Math.abs(adjustedDiff),
    }
  }

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-pink-50/30 to-transparent rounded-3xl">
      <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: "1200px" }}>
        <div className="relative w-full h-full flex items-center justify-center">
          {mockDiaries.map((diary, index) => (
            <div
              key={diary.id}
              className="absolute transition-all duration-700 ease-out cursor-pointer"
              style={getCardStyle(index)}
              onClick={() => {
                setIsAutoPlaying(false)
                setCurrentIndex(index)
              }}
            >
              <div className="w-[280px] h-[350px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                <img src={diary.photo || "/placeholder.svg"} alt={diary.title} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <p className="text-white text-sm font-medium">{diary.title}</p>
                  <p className="text-white/80 text-xs">{diary.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white shadow-lg rounded-full"
        onClick={handlePrev}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white shadow-lg rounded-full"
        onClick={handleNext}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {mockDiaries.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? "bg-pink-600 w-6" : "bg-pink-300"
            }`}
            onClick={() => {
              setIsAutoPlaying(false)
              setCurrentIndex(index)
            }}
          />
        ))}
      </div>
    </div>
  )
}
