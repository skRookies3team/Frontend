"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen, Sparkles, Calendar } from "lucide-react"

interface Recap {
  id: string
  period: string
  year: number
  coverImage: string
  totalMoments: number
  createdAt: string
  status: "generated" | "upcoming"
}

const RECAPS: Recap[] = [
  {
    id: "1",
    period: "2024년 1-2월",
    year: 2024,
    coverImage: "/golden-retriever-playing-park.jpg",
    totalMoments: 45,
    createdAt: "2024.03.01",
    status: "generated",
  },
  {
    id: "2",
    period: "2023년 11-12월",
    year: 2023,
    coverImage: "/dog-running-grass.jpg",
    totalMoments: 38,
    createdAt: "2024.01.01",
    status: "generated",
  },
  {
    id: "3",
    period: "2023년 9-10월",
    year: 2023,
    coverImage: "/golden-retriever.png",
    totalMoments: 52,
    createdAt: "2023.11.01",
    status: "generated",
  },
  {
    id: "upcoming",
    period: "2024년 3-4월",
    year: 2024,
    coverImage: "",
    totalMoments: 0,
    createdAt: "2024.05.01",
    status: "upcoming",
  },
]

export default function AIRecapPage() {
  const [selectedRecap, setSelectedRecap] = useState<Recap | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-purple-100 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/ai-studio" className="text-purple-600">
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
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setSelectedRecap(null)}
          >
            <div
              className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedRecap(null)}
                className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 shadow-lg transition-transform hover:scale-110"
              >
                ×
              </button>

              <div className="relative aspect-video overflow-hidden">
                <img
                  src={selectedRecap.coverImage || "/placeholder.svg"}
                  alt={selectedRecap.period}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <Badge className="mb-2 bg-purple-500">
                    <Sparkles className="mr-1 h-3 w-3" />
                    AI 리캡
                  </Badge>
                  <h2 className="text-3xl font-bold">{selectedRecap.period}</h2>
                  <p className="mt-2 text-sm text-white/90">
                    {selectedRecap.createdAt} 생성 • {selectedRecap.totalMoments}개의 순간
                  </p>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="prose prose-purple max-w-none">
                  <h3 className="text-2xl font-bold text-purple-600">초코와 함께한 {selectedRecap.period}</h3>

                  <p className="mt-4 text-lg leading-relaxed text-foreground">
                    {selectedRecap.period}은 초코에게 특별한 시간이었습니다. 추운 겨울을 이겨내며 함께한 따뜻한 순간들,
                    눈 내린 공원에서의 첫 산책, 그리고 집에서 보낸 포근한 시간들까지. AI가 이 기간 동안의
                    {selectedRecap.totalMoments}개 순간을 분석하여 가장 의미 있는 이야기로 엮어냈습니다.
                  </p>

                  <div className="my-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-6 border-2 border-green-100">
                    <h4 className="mb-4 text-xl font-bold text-green-700 flex items-center gap-2">💚 건강 리포트</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-sm text-gray-600 mb-1">평균 심박수</p>
                        <p className="text-2xl font-bold text-green-600">78 bpm</p>
                        <p className="text-xs text-gray-500 mt-1">정상 범위</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-sm text-gray-600 mb-1">평균 활동량</p>
                        <p className="text-2xl font-bold text-blue-600">3,245 걸음</p>
                        <p className="text-xs text-gray-500 mt-1">+12% ↑</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-sm text-gray-600 mb-1">평균 수면시간</p>
                        <p className="text-2xl font-bold text-purple-600">12.5 시간</p>
                        <p className="text-xs text-gray-500 mt-1">적정 수준</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-sm text-gray-600 mb-1">평균 체중</p>
                        <p className="text-2xl font-bold text-orange-600">28.3 kg</p>
                        <p className="text-xs text-gray-500 mt-1">안정적</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-gray-700">
                      이번 달 초코는 전반적으로 건강한 상태를 유지했습니다. 활동량이 증가하고 수면 패턴도
                      안정적이었어요.
                    </p>
                  </div>

                  <h4 className="mt-6 text-xl font-bold text-purple-600">하이라이트</h4>
                  <ul className="space-y-3">
                    <li className="text-foreground">
                      <strong>첫 눈 산책:</strong> 생애 처음 보는 눈에 신나서 뛰어다니던 초코의 모습
                    </li>
                    <li className="text-foreground">
                      <strong>새 친구 만남:</strong> 공원에서 만난 같은 품종 친구와 금방 친해진 순간
                    </li>
                    <li className="text-foreground">
                      <strong>포근한 겨울:</strong> 난로 앞에서 함께 보낸 따뜻하고 평화로운 오후
                    </li>
                    <li className="text-foreground">
                      <strong>특별한 간식:</strong> 처음 맛본 수제 간식에 행복해하던 표정
                    </li>
                  </ul>

                  <div className="mt-8 rounded-2xl bg-gradient-to-r from-purple-100 to-pink-100 p-6">
                    <p className="text-center text-lg font-semibold text-purple-600">
                      "매 순간이 소중한 추억이 되었습니다 💕"
                    </p>
                  </div>

                  <p className="mt-6 text-foreground">
                    이 기간 동안 초코는 더욱 성장했고, 우리 가족과의 유대감도 깊어졌습니다. 함께 웃고, 뛰놀고, 때로는
                    조용히 곁을 지켜주던 모든 순간들이 이 리캡에 담겨 있습니다. 앞으로도 초코와 함께할 많은 순간들이
                    기대됩니다.
                  </p>
                </div>

                <div className="mt-8 rounded-2xl bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 p-6 text-center">
                  <p className="text-3xl font-bold text-purple-600">+500</p>
                  <p className="text-sm text-muted-foreground">펫코인 획득</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
