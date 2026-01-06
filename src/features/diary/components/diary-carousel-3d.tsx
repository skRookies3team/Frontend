import { useEffect, useRef, useState } from "react"
import { DiaryResponse } from "@/features/diary/types/diary"
import { gsap } from "gsap"
import { Draggable } from "gsap/Draggable"

// Register GSAP plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(Draggable)
}

interface DiaryCarousel3DProps {
  diaries?: DiaryResponse[]
  isLoading?: boolean
}

export function DiaryCarousel3D({ diaries = [], isLoading = false }: DiaryCarousel3DProps) {
  console.log('[DiaryCarousel3D] Received diaries:', diaries)
  console.log('[DiaryCarousel3D] isLoading:', isLoading)

  // 최소 8개의 카드를 유지하기 위해 임시 카드 추가
  const MIN_CARDS = 8
  const displayCards = [...diaries]

  if (!isLoading && diaries.length < MIN_CARDS) {
    const placeholderCount = MIN_CARDS - diaries.length
    for (let i = 0; i < placeholderCount; i++) {
      displayCards.push({
        diaryId: -1 - i, // 음수 ID로 placeholder 구분
        userId: 0,
        petId: 0,
        title: '',
        content: '',
        weather: '',
        mood: '',
        date: '',
        images: [],
        isAiGen: false,
        createdAt: '',
        isPlaceholder: true // placeholder 플래그
      } as any)
    }
  }

  const containerRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const proxyRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Ensure DOM is ready
    setIsReady(true)
  }, [])

  useEffect(() => {
    if (!isReady || !containerRef.current || !carouselRef.current || !proxyRef.current) return

    const container = containerRef.current
    const proxy = proxyRef.current
    const cards = gsap.utils.toArray(".diary-card") as HTMLDivElement[]

    if (cards.length === 0) return;


    // Configuration - Convex style (center forward, sides back)
    const totalCards = cards.length
    const angleStep = 360 / totalCards
    const radius = 280 // Distance from center

    // Setup initial 3D positions - Convex style
    const updateCards = () => {
      const rotationY = gsap.getProperty(proxy, "x") as number

      cards.forEach((card, i) => {
        // Calculate the angle for this card
        const baseAngle = i * angleStep
        const currentAngle = baseAngle + rotationY

        // Normalize angle to -180 to 180
        const normalizedAngle = gsap.utils.wrap(-180, 180, currentAngle)
        const absAngle = Math.abs(normalizedAngle)

        // Convex: Center card (0°) is closest, sides go back
        // X position: sin for horizontal spread
        const x = Math.sin((normalizedAngle * Math.PI) / 180) * radius * 0.8

        // Z position: Center is forward (higher z), sides go back
        const z = Math.cos((normalizedAngle * Math.PI) / 180) * 100 - 50

        // Card rotation: Cards tilt away from center
        const cardRotation = normalizedAngle * 0.3 // Subtle tilt

        // Scale: Center biggest, sides smaller
        const scale = 1 - (absAngle / 180) * 0.4

        // Opacity: Center brightest
        const opacity = 1 - (absAngle / 180) * 0.7

        // Z-index: Center on top
        const zIndex = 1000 - Math.floor(absAngle)

        gsap.set(card, {
          x: x,
          z: z,
          rotationY: cardRotation,
          scale: scale,
          opacity: opacity,
          zIndex: zIndex,
        })
      })
    }

    // Initial update
    updateCards()

    // Draggable
    Draggable.create(proxy, {
      type: "x",
      trigger: container, // Drag anywhere in container
      inertia: true,
      onDrag: updateCards,
      onThrowUpdate: updateCards,
      onDragEnd: () => {
        const rotationY = gsap.getProperty(proxy, "x") as number
        const snapAngle = Math.round(rotationY / angleStep) * angleStep
        gsap.to(proxy, {
          x: snapAngle,
          duration: 0.5,
          ease: "power2.out",
          onUpdate: updateCards
        })
      },
    })

    // Cleanup
    return () => {
      Draggable.get(proxy)?.kill()
    }
  }, [isReady, displayCards])

  return (
    <div className="w-full h-[500px] bg-gradient-to-b from-pink-50/50 to-white flex items-center justify-center overflow-hidden relative rounded-2xl">
      {/* Subtle glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-200/30 rounded-full blur-3xl" />

      {/* Perspective Container */}
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ perspective: "1200px" }}
      >
        {/* Carousel Anchor */}
        <div
          ref={carouselRef}
          className="relative w-0 h-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          {isLoading ? (
            <div className="diary-card absolute left-0 top-0 w-[240px] h-[360px] -ml-[120px] -mt-[180px] rounded-2xl bg-pink-100 animate-pulse border border-pink-200">
              <div className="absolute bottom-6 left-6 right-6">
                <div className="h-6 bg-pink-200 rounded mb-2"></div>
                <div className="h-4 bg-pink-200 rounded w-2/3"></div>
              </div>
            </div>
          ) : displayCards.length === 0 ? (
            <div className="diary-card absolute left-0 top-0 w-[240px] h-[360px] -ml-[120px] -mt-[180px] rounded-2xl border border-pink-200 bg-gradient-to-br from-pink-50 to-white flex items-center justify-center shadow-lg">
              <div className="text-center p-6">
                <p className="text-pink-400 text-sm">아직 일기가 없어요</p>
                <p className="text-pink-300 text-xs mt-2">AI와 함께<br />첫 일기를 작성해보세요</p>
              </div>
            </div>
          ) : (
            displayCards.map((diary: any) => {
              const isPlaceholder = diary.isPlaceholder
              return (
                <div
                  key={diary.diaryId}
                  className={`diary-card absolute left-0 top-0 w-[240px] h-[360px] -ml-[120px] -mt-[180px] rounded-2xl overflow-hidden shadow-xl ${isPlaceholder
                    ? 'border-2 border-dashed border-pink-200 bg-gradient-to-br from-pink-50/80 to-white'
                    : 'border border-pink-200 bg-white cursor-pointer hover:border-pink-400 transition-colors'
                    }`}
                  style={{
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden"
                  }}
                >
                  {isPlaceholder ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center p-6">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-pink-100 flex items-center justify-center">
                          <svg className="w-8 h-8 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <p className="text-pink-300 text-xs">더 많은 추억을<br />기록해보세요</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <img
                        src={diary.images?.[0]?.imageUrl || "/placeholder.svg"}
                        alt={diary.title || "다이어리"}
                        className="w-full h-full object-cover pointer-events-none"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white text-lg font-bold mb-1">{diary.title || "무제"}</h3>
                        <p className="text-white/80 text-xs">{diary.date || ""}</p>
                      </div>
                    </>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Proxy element for Draggable */}
      <div ref={proxyRef} className="absolute invisible" />

      {/* Instructions
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-zinc-500 text-sm pointer-events-none">
        Drag to rotate
      </div> */}
    </div>
  )
}
