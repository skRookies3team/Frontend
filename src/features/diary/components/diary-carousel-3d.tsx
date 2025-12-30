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


    // Configuration
    const radius = 340 // Reduced radius for tighter spacing
    const totalCards = cards.length
    // Calculate angle per card based on circumference or fixed step
    // Using fixed step for specific "Concave" look
    const angleStep = 360 / totalCards

    // Setup initial 3D positions
    const updateCards = () => {
      const rotationY = gsap.getProperty(proxy, "x") as number

      cards.forEach((card, i) => {
        // Calculate the angle for this card
        // We add the global rotation (proxy.x) to the card's base angle
        const baseAngle = i * angleStep
        const currentAngle = baseAngle + rotationY

        // Normalize angle to -180 to 180 for shortest path calculation if needed
        // But for simple rotation, we just use sin/cos

        // Convert to radians
        const theta = (currentAngle * Math.PI) / 180

        // Cylinder coordinates
        // x = R * sin(theta)
        // z = R * cos(theta)

        // To make the center card (0 degrees) closest to viewer:
        // At 0 deg: sin(0)=0, cos(0)=1. z should be max (closest).
        // So z = radius * cos(theta).
        // But we want the "Concave" feel where it wraps around.
        // Let's position them relative to the center of rotation.

        const x = radius * Math.sin(theta)
        const z = radius * Math.cos(theta)

        // Rotation of the card itself to face the center (or viewer)
        // If card is at angle theta, it should rotate by theta to face outward, or -theta to face inward?
        // At 0 deg (front), rotation should be 0.
        // At 90 deg (right), it should face left (-90?).
        // Let's try rotationY = currentAngle.

        const cardRotation = -currentAngle // Face center (Concave)

        // Opacity/Dimming based on angle from "front" (0 deg)
        // We need the angle relative to the viewport center.
        // Normalize currentAngle to [-180, 180]
        const normalizedAngle = gsap.utils.wrap(-180, 180, currentAngle)
        const absAngle = Math.abs(normalizedAngle)

        // Dimming: 0 deg = 1, 90 deg = 0.2
        const opacity = 1 - Math.min(absAngle / 120, 0.8)

        // Scale: Center biggest
        const scale = 1 // No scaling effect

        gsap.set(card, {
          x: x,
          z: radius - z, // Inverted Z: Sides come forward (Concave)
          rotationY: cardRotation,
          opacity: opacity,
          scale: scale,
          // Ensure z-index handles layering correctly (closest on top)
          zIndex: 1000 + Math.floor(absAngle), // Sides are closer, so higher z-index
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
      // Remove built-in snap if we handle it manually or keep it for inertia if available
      // snap: { x: ... } // We'll rely on our manual tween for guaranteed centering
    })

    // Auto rotation (optional, slow drift)
    // gsap.to(proxy, {
    //   x: "+=360",
    //   duration: 60,
    //   repeat: -1,
    //   ease: "none",
    //   onUpdate: updateCards
    // })

    // Cleanup
    return () => {
      Draggable.get(proxy)?.kill()
    }
  }, [isReady, displayCards])

  return (
    <div className="w-full h-[350px] bg-gradient-to-b from-pink-50/50 to-white flex items-center justify-center overflow-hidden relative">
      {/* Perspective Container */}
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center"
        style={{ perspective: "1000px" }}
      >
        {/* Carousel Anchor */}
        <div
          ref={carouselRef}
          className="relative w-0 h-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          {isLoading ? (
            <div className="diary-card absolute left-0 top-0 w-[200px] h-[300px] -ml-[100px] -mt-[150px] rounded-2xl bg-pink-100 animate-pulse border border-pink-200">
              <div className="absolute bottom-6 left-6 right-6">
                <div className="h-6 bg-pink-200 rounded mb-2"></div>
                <div className="h-4 bg-pink-200 rounded w-2/3"></div>
              </div>
            </div>
          ) : displayCards.length === 0 ? (
            <div className="diary-card absolute left-0 top-0 w-[200px] h-[300px] -ml-[100px] -mt-[150px] rounded-2xl border border-pink-200 bg-gradient-to-br from-pink-50 to-white flex items-center justify-center">
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
                  className={`diary-card absolute left-0 top-0 w-[200px] h-[300px] -ml-[100px] -mt-[150px] rounded-2xl overflow-hidden ${isPlaceholder
                    ? 'border-2 border-dashed border-pink-200 bg-gradient-to-br from-pink-50/30 to-white/30'
                    : 'border border-zinc-800 bg-zinc-900 cursor-pointer'
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
                      <div className="absolute bottom-6 left-6 right-6">
                        <h3 className="text-white text-xl font-bold">{diary.title}</h3>
                        <p className="text-zinc-400 text-sm mt-1">{diary.date}</p>
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
