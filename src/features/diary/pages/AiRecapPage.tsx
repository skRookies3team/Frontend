import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/shared/ui/button"
import { Card, CardContent } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { ArrowLeft, BookOpen, Sparkles, Calendar } from "lucide-react"
import { RECAPS, Recap } from "@/features/diary/data/recap-data"
import { RecapModal } from "@/features/diary/components/recap-modal"

export default function AiRecapPage() {
  const [selectedRecap, setSelectedRecap] = useState<Recap | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-purple-100 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link to="/ai-studio" className="text-purple-600">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-lg font-bold text-purple-600 md:text-xl">AI 리캡</h1>
          <div className="w-6" />
        </div>
      </header>

      <main className="container mx-auto max-w-4xl p-4 md:p-6">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 md:h-24 md:w-24">
            <BookOpen className="h-10 w-10 text-white md:h-12 md:w-12" />
          </div>
          <h2 className="text-balance text-2xl font-bold text-purple-600 md:text-3xl">반려동물과의 특별한 순간들</h2>
          <p className="mt-2 text-pretty text-muted-foreground md:text-lg">
            1달마다 자동으로 생성되는 감동적인 리캡을 확인하세요
          </p>
        </div>

        <Card className="mb-6 border-purple-100 bg-purple-50">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start gap-3">
              <Calendar className="mt-1 h-5 w-5 text-purple-600" />
              <div>
                <h3 className="mb-1 font-semibold text-purple-600">자동 생성 안내</h3>
                <p className="text-sm text-muted-foreground">
                  리캡은 1달마다 자동으로 생성됩니다. 해당 기간의 사진과 다이어리를 바탕으로 AI가 감동적인 이야기를
                  만들어드려요.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {RECAPS.map((recap) =>
            recap.status === "upcoming" ? (
              <Card key={recap.id} className="border-2 border-dashed border-purple-200 bg-purple-50/50 shadow-none">
                <CardContent className="flex min-h-[280px] flex-col items-center justify-center p-6 text-center md:p-8">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-purple-600">{recap.period}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">{recap.createdAt}에 자동 생성 예정</p>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-600">
                    생성 대기 중
                  </Badge>
                </CardContent>
              </Card>
            ) : (
              <button
                key={recap.id}
                onClick={() => setSelectedRecap(recap)}
                className="group overflow-hidden rounded-2xl border-2 border-transparent bg-white shadow-lg transition-all hover:border-purple-500 hover:shadow-xl"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={recap.coverImage || "/placeholder.svg"}
                    alt={recap.period}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Badge className="absolute right-3 top-3 bg-purple-500 text-white">
                    <Sparkles className="mr-1 h-3 w-3" />
                    AI 리캡
                  </Badge>
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-lg font-bold">{recap.period}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{recap.createdAt} 생성</span>
                    <span>{recap.totalMoments}개의 순간</span>
                  </div>
                  <Button variant="ghost" size="sm" className="mt-3 w-full text-purple-600 hover:text-purple-700">
                    리캡 보기
                  </Button>
                </div>
              </button>
            ),
          )}
        </div>

        {selectedRecap && selectedRecap.status === "generated" && (
          <RecapModal recap={selectedRecap} onClose={() => setSelectedRecap(null)} />
        )}
      </main>
    </div>
  )
}
