import { Link } from "react-router-dom"
import { Button } from "@/shared/ui/button"
import { Card, CardContent } from "@/shared/ui/card"
import { Sparkles, BookOpen, ArrowRight } from "lucide-react"

export default function AiStudioPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 pb-20 md:pb-0">
      <main className="container mx-auto max-w-4xl p-4 pt-8 md:p-6 md:pt-12">
        <div className="mb-8 text-center md:mb-12">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 md:h-24 md:w-24">
            <Sparkles className="h-10 w-10 text-white md:h-12 md:w-12" />
          </div>
          <h1 className="text-balance text-3xl font-bold text-pink-600 md:text-4xl">AI 스튜디오</h1>
          <p className="mt-2 text-pretty text-muted-foreground md:text-lg">
            AI가 반려동물의 특별한 순간을 아름답게 기록해드려요
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* AI 다이어리 */}
          <Link to="/ai-studio/diary">
            <Card className="group cursor-pointer border-pink-100 shadow-lg transition-all hover:shadow-xl hover:scale-105">
              <CardContent className="p-6 md:p-8">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 md:h-20 md:w-20">
                  <Sparkles className="h-8 w-8 text-white md:h-10 md:w-10" />
                </div>
                <h2 className="mb-2 text-xl font-bold text-pink-600 md:text-2xl">AI 다이어리</h2>
                <p className="mb-4 text-pretty text-sm text-muted-foreground md:text-base">
                  오늘 하루 반려동물과 함께한 순간을 사진으로 업로드하면, AI가 감성적인 일기를 작성해드려요
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-pink-500" />
                    <span>사진 1-10장 업로드</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-pink-500" />
                    <span>AI가 자동으로 일기 작성</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-pink-500" />
                    <span>100 펫코인 획득</span>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="mt-6 w-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                >
                  다이어리 작성하기
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/ai-studio/recap">
            <Card className="group cursor-pointer border-pink-100 shadow-lg transition-all hover:shadow-xl hover:scale-105">
              <CardContent className="p-6 md:p-8">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 md:h-20 md:w-20">
                  <BookOpen className="h-8 w-8 text-white md:h-10 md:w-10" />
                </div>
                <h2 className="mb-2 text-xl font-bold text-purple-600 md:text-2xl">AI 리캡</h2>
                <p className="mb-4 text-pretty text-sm text-muted-foreground md:text-base">
                  1달마다 자동으로 생성되는 반려동물의 특별한 순간들을 모아 감동적인 리캡을 만들어드려요
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <span>1달마다 자동 생성</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <span>주요 순간 자동 선택</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <span>500 펫코인 획득</span>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="mt-6 w-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  리캡 보기
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="mt-8 rounded-2xl bg-gradient-to-r from-pink-100 to-rose-100 p-6 text-center md:mt-12 md:p-8">
          <h3 className="mb-2 text-lg font-bold text-pink-600 md:text-xl">💡 Tip</h3>
          <p className="text-sm text-muted-foreground md:text-base">
            AI가 생성한 콘텐츠는 언제든지 수정할 수 있어요. 여러분만의 특별한 이야기를 더해주세요!
          </p>
        </div>
      </main>
    </div>
  )
}
