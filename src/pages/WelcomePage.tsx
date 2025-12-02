import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

export default function WelcomePage() {
  const navigate = useNavigate()
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-pink-50 to-white px-6 py-12 pt-24">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <div className="h-3 w-3 rounded-full bg-gradient-to-br from-pink-500 to-rose-500" />
            </div>
          ))}
        </div>
      )}

      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-gradient-to-br from-pink-500 to-rose-500 p-6 shadow-xl">
            <Sparkles className="h-16 w-16 text-white" />
          </div>
        </div>

        <h1 className="text-balance text-4xl font-bold text-pink-600">PetLog에 오신 것을 환영해요!</h1>
        <p className="mt-4 text-pretty text-lg text-muted-foreground">
          반려동물 프로필이 완성되었어요. 이제 멋진 일상을 공유해볼까요!
        </p>

        <Button
          size="lg"
          onClick={() => navigate("/dashboard")}
          className="mt-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-8 text-base font-semibold shadow-lg hover:from-pink-600 hover:to-rose-600"
        >
          대시보드로 이동
        </Button>
      </div>
    </div>
  )
}
