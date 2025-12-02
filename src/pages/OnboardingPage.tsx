import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ChevronRight, Sparkles, BookHeart, MessageCircleHeart, ShoppingBag } from "lucide-react"

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const features = [
    {
      icon: BookHeart,
      title: "AI 다이어리",
      description: "AI가 반려동물의 특별한 순간을 아름다운 일기로 작성해드려요",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: MessageCircleHeart,
      title: "반려동물 챗봇",
      description: "반려동물의 페르소나와 대화하며 그들의 마음을 들어보세요",
      color: "from-pink-400 to-rose-400",
    },
    {
      icon: Sparkles,
      title: "소셜 피드",
      description: "반려동물의 일상을 공유하고 다른 반려인들과 소통해요",
      color: "from-pink-600 to-rose-600",
    },
    {
      icon: ShoppingBag,
      title: "펫 쇼핑",
      description: "반려동물 용품을 구매하고 다이어리 작성으로 마일리지를 획득하세요",
      color: "from-pink-500 to-rose-400",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-pink-50 via-white to-rose-50 pt-16">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Logo/Title */}
        <div className="mb-12 text-center">
          <h1 className="text-balance text-5xl font-bold text-pink-600">PetLog</h1>
          <p className="mt-2 text-lg text-muted-foreground">반려동물의 일상을 아름답게 기록하세요</p>
        </div>

        {/* Feature Carousel */}
        <div className="w-full max-w-md">
          <div className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-lg">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className={`transition-all duration-500 ${
                    index === currentSlide ? "opacity-100" : "absolute left-0 top-0 opacity-0"
                  }`}
                >
                  <div
                    className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${feature.color}`}
                  >
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-balance text-center text-2xl font-bold text-pink-600">{feature.title}</h2>
                  <p className="mt-3 text-pretty text-center text-muted-foreground">{feature.description}</p>
                </div>
              )
            })}
          </div>

          {/* Dots Indicator */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide ? "w-8 bg-pink-600" : "w-2 bg-pink-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-12 flex w-full max-w-md flex-col gap-3">
          <Button
            asChild
            size="lg"
            className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-base font-semibold shadow-lg hover:from-pink-600 hover:to-rose-600"
          >
            <Link to="/signup">
              시작하기 <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full border-2 border-pink-500 bg-transparent text-base font-semibold text-pink-600 hover:bg-pink-500 hover:text-white"
          >
            <Link to="/login">이미 계정이 있어요</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
