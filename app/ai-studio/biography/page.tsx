"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X, Upload, BookOpen, Check, ArrowLeft, Plus } from "lucide-react"

type BiographyStep = "select" | "upload" | "generating" | "edit" | "complete"
type MomentType = "birth" | "first-home" | "first-walk" | "friends" | "adventure" | "achievement" | "custom"

interface Moment {
  id: string
  type: MomentType
  label: string
  images: string[]
}

export default function AIBiographyPage() {
  const router = useRouter()
  const [step, setStep] = useState<BiographyStep>("select")
  const [selectedMoments, setSelectedMoments] = useState<Moment[]>([])
  const [currentMoment, setCurrentMoment] = useState<MomentType | null>(null)
  const [generatedBiography, setGeneratedBiography] = useState("")
  const [editedBiography, setEditedBiography] = useState("")
  const [progress, setProgress] = useState(0)

  const momentTypes = [
    { type: "birth" as MomentType, label: "탄생", icon: "🐣" },
    { type: "first-home" as MomentType, label: "첫 집 방문", icon: "🏠" },
    { type: "first-walk" as MomentType, label: "첫 산책", icon: "🐾" },
    { type: "friends" as MomentType, label: "친구들과", icon: "🐕" },
    { type: "adventure" as MomentType, label: "모험", icon: "🌈" },
    { type: "achievement" as MomentType, label: "특별한 성취", icon: "🏆" },
  ]

  const handleMomentSelect = (type: MomentType) => {
    setCurrentMoment(type)
    setStep("upload")
  }

  const handleImageUpload = () => {
    const images = ["/golden-retriever.png", "/dog-running-grass.jpg"]
    if (currentMoment) {
      const moment = momentTypes.find((m) => m.type === currentMoment)
      setSelectedMoments([
        ...selectedMoments,
        {
          id: Date.now().toString(),
          type: currentMoment,
          label: moment?.label || "",
          images,
        },
      ])
      setCurrentMoment(null)
      setStep("select")
    }
  }

  const handleGenerate = () => {
    setStep("generating")

    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += 10
      setProgress(currentProgress)

      if (currentProgress >= 100) {
        clearInterval(interval)
        const biography = `찰리의 이야기

2020년 봄, 따뜻한 햇살이 내리던 어느 날, 작고 귀여운 골든 리트리버 강아지 찰리가 이 세상에 태어났습니다. 부드러운 황금빛 털과 반짝이는 눈동자를 가진 찰리는 태어나자마자 모두의 사랑을 받았어요.

생후 2개월이 되었을 때, 찰리는 처음으로 자신의 집에 도착했습니다. 새로운 환경에 조금 긴장했지만, 곧 모든 방을 탐험하며 호기심 가득한 눈으로 주변을 살펴보았죠. 그날부터 찰리의 진짜 모험이 시작되었습니다.

첫 산책은 특별했어요. 작은 발로 풀밭을 밟으며, 세상의 모든 것이 신기했던 찰리. 나비를 쫓고, 꽃 냄새를 맡으며, 매 순간이 새로운 발견이었답니다. 

시간이 흐르면서 찰리는 공원에서 많은 친구들을 만났어요. 같은 품종의 친구들과 뛰어놀고, 다른 강아지들과도 사이좋게 지냈죠. 찰리의 친근한 성격 덕분에 어디를 가든 인기가 많았어요.

여름에는 바다로 첫 여행을 떠났습니다. 파도를 보고 조금 놀랐지만, 곧 파도와 함께 뛰어놀며 신나는 시간을 보냈어요. 모래사장에서 뛰어다니는 찰리의 모습은 정말 행복 그 자체였답니다.

그리고 지난해, 찰리는 반려동물 훈련 과정을 성공적으로 마쳤어요. 앉기, 기다리기, 손 흔들기까지 모든 것을 완벽하게 해냈죠. 선생님도 찰리가 가장 똑똑한 학생이었다고 칭찬했답니다.

지금 이 순간에도 찰리는 매일매일 새로운 추억을 만들어가고 있어요. 때로는 장난꾸러기로, 때로는 든든한 친구로, 항상 우리 곁을 지키며 행복을 선물해주는 찰리. 앞으로도 함께할 많은 순간들이 기대됩니다.

찰리야, 우리의 소중한 가족이 되어줘서 고마워. 너와 함께하는 모든 순간이 특별하단다. 앞으로도 오래오래 건강하고 행복하게 함께하자! 🐾💕`

        setGeneratedBiography(biography)
        setEditedBiography(biography)
        setTimeout(() => setStep("edit"), 500)
      }
    }, 200)
  }

  const handlePost = () => {
    setStep("complete")
    setTimeout(() => {
      router.push("/profile")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-purple-100 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/ai-studio" className="text-purple-600">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-lg font-bold text-purple-600 md:text-xl">AI 일대기</h1>
          <div className="w-6" />
        </div>
      </header>

      <main className="container mx-auto max-w-4xl p-4 md:p-6">
        {step === "select" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 md:h-24 md:w-24">
                <BookOpen className="h-10 w-10 text-white md:h-12 md:w-12" />
              </div>
              <h2 className="text-balance text-2xl font-bold text-purple-600 md:text-3xl">
                반려동물의 특별한 순간들을 선택하세요
              </h2>
              <p className="mt-2 text-pretty text-muted-foreground md:text-lg">
                각 순간의 사진을 업로드하면 AI가 감동적인 일대기를 작성해드려요
              </p>
            </div>

            {selectedMoments.length > 0 && (
              <Card className="border-purple-100 bg-purple-50">
                <CardContent className="p-4 md:p-6">
                  <h3 className="mb-3 font-semibold text-purple-600">선택된 순간들</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMoments.map((moment) => (
                      <Badge
                        key={moment.id}
                        variant="secondary"
                        className="bg-white px-3 py-1.5 text-sm flex items-center gap-2"
                      >
                        {moment.label}
                        <button
                          onClick={() => setSelectedMoments(selectedMoments.filter((m) => m.id !== moment.id))}
                          className="hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {momentTypes.map((moment) => (
                <button
                  key={moment.type}
                  onClick={() => handleMomentSelect(moment.type)}
                  className="flex items-center gap-4 rounded-2xl border-2 border-purple-100 bg-white p-4 text-left transition-all hover:border-purple-500 hover:shadow-lg md:p-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 text-2xl md:h-14 md:w-14">
                    {moment.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-purple-600 md:text-lg">{moment.label}</p>
                    <p className="text-xs text-muted-foreground md:text-sm">사진 추가하기</p>
                  </div>
                  <Plus className="ml-auto h-5 w-5 text-purple-600" />
                </button>
              ))}
            </div>

            {selectedMoments.length >= 3 && (
              <Button
                onClick={handleGenerate}
                size="lg"
                className="w-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-base font-semibold shadow-lg hover:from-purple-600 hover:to-pink-600 md:text-lg"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                일대기 생성하기
              </Button>
            )}

            {selectedMoments.length < 3 && (
              <p className="text-center text-sm text-muted-foreground">최소 3개 이상의 순간을 선택해주세요</p>
            )}
          </div>
        )}

        {step === "upload" && currentMoment && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-purple-600 md:text-3xl">
                {momentTypes.find((m) => m.type === currentMoment)?.label} 사진 업로드
              </h2>
              <p className="mt-2 text-muted-foreground md:text-lg">1-5장의 사진을 업로드하세요</p>
            </div>

            <Card className="border-purple-100 shadow-lg">
              <CardContent className="p-6 md:p-8">
                <button
                  onClick={handleImageUpload}
                  className="flex w-full flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50 p-12 transition-all hover:border-purple-500 hover:bg-white md:p-16"
                >
                  <Upload className="h-12 w-12 text-purple-600 md:h-16 md:w-16" />
                  <div className="text-center">
                    <p className="font-semibold text-purple-600 md:text-lg">사진 업로드</p>
                    <p className="mt-1 text-sm text-muted-foreground md:text-base">1-5장 선택</p>
                  </div>
                </button>

                <Button
                  onClick={() => {
                    setCurrentMoment(null)
                    setStep("select")
                  }}
                  variant="outline"
                  className="mt-4 w-full"
                >
                  취소
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "generating" && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-xl md:h-40 md:w-40">
                <BookOpen className="h-16 w-16 animate-pulse text-white md:h-20 md:w-20" />
              </div>
              <div className="absolute inset-0 animate-ping rounded-full bg-purple-500 opacity-20" />
            </div>

            <div className="w-full max-w-sm space-y-3 text-center">
              <h2 className="text-2xl font-bold text-purple-600 md:text-3xl">반려동물의 일대기를 작성 중이에요...</h2>
              <p className="text-muted-foreground md:text-lg">AI가 감동적인 이야기를 만들고 있어요</p>

              <div className="overflow-hidden rounded-full bg-purple-100">
                <div
                  className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 md:h-3"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm font-medium text-purple-600 md:text-base">{progress}%</p>
            </div>
          </div>
        )}

        {step === "edit" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-balance text-2xl font-bold text-purple-600 md:text-3xl">AI 일대기가 완성되었어요!</h2>
              <p className="mt-2 text-muted-foreground md:text-lg">수정하거나 바로 저장할 수 있어요</p>
            </div>

            <Card className="border-purple-100 shadow-lg">
              <CardContent className="space-y-4 p-6 md:p-8">
                <Textarea
                  value={editedBiography}
                  onChange={(e) => setEditedBiography(e.target.value)}
                  className="min-h-[400px] resize-none rounded-xl border-purple-200 text-base focus-visible:ring-purple-500 md:min-h-[500px] md:text-lg"
                />

                <Button
                  onClick={handlePost}
                  size="lg"
                  className="w-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-base font-semibold shadow-lg hover:from-purple-600 hover:to-pink-600 md:text-lg"
                >
                  저장하기
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "complete" && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-xl md:h-40 md:w-40">
              <Check className="h-16 w-16 text-white md:h-20 md:w-20" />
            </div>

            <div className="text-center">
              <h2 className="text-balance text-3xl font-bold text-purple-600 md:text-4xl">일대기 저장 완료!</h2>
              <p className="mt-2 text-lg text-muted-foreground md:text-xl">500 펫코인을 획득했어요</p>

              <div className="mt-6 rounded-2xl bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 p-6 md:p-8">
                <p className="text-3xl font-bold text-purple-600 md:text-4xl">+500</p>
                <p className="text-sm text-muted-foreground md:text-base">펫코인</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
