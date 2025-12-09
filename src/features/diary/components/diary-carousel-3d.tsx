import { useEffect, useRef, useState } from "react"
import { Diary } from "@/features/healthcare/data/pet-data"
import { gsap } from "gsap"
import { Draggable } from "gsap/Draggable"

// Register GSAP plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(Draggable)
}

interface DiaryCarousel3DProps {
  diaries?: Diary[]
}

export function DiaryCarousel3D({ diaries = [] }: DiaryCarousel3DProps) {
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
  }, [isReady, diaries])

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
          {diaries.map((diary) => (
            <div
              key={diary.id}
              className="diary-card absolute left-0 top-0 w-[200px] h-[300px] -ml-[100px] -mt-[150px] rounded-2xl overflow-hidden cursor-pointer border border-zinc-800 bg-zinc-900"
              style={{
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden" // Or visible if we want to see backs
              }}
            >
              <img
                src={diary.image || "/placeholder.svg"}
                alt={diary.title}
                className="w-full h-full object-cover pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-white text-xl font-bold">{diary.title}</h3>
                <p className="text-zinc-400 text-sm mt-1">{diary.date}</p>
              </div>
            </div>
          ))}
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
