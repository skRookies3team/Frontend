"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { X, Upload, Sparkles, Check } from "lucide-react"

type DiaryStep = "upload" | "generating" | "edit" | "complete"

export default function AIDiaryPage() {
  const router = useRouter()
  const [step, setStep] = useState<DiaryStep>("upload")
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [generatedDiary, setGeneratedDiary] = useState("")
  const [editedDiary, setEditedDiary] = useState("")
  const [progress, setProgress] = useState(0)

  const handleUpload = () => {
    // Simulate image upload
    setSelectedImages(["/dog-running-grass.jpg", "/golden-retriever-playing-park.jpg", "/corgi.jpg"])
  }

  const handleGenerate = () => {
    setStep("generating")

    // Simulate AI generation with progress
    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += 10
      setProgress(currentProgress)

      if (currentProgress >= 100) {
        clearInterval(interval)
        const diary =
          "Today was an absolutely wonderful day at the park! Charlie couldn't contain his excitement from the moment we arrived. He made several new furry friends and spent hours running through the grass, his tail wagging non-stop. The weather was perfect - sunny with a gentle breeze. We played fetch until he was happily exhausted. Watching him enjoy every moment reminded me why these simple outings mean so much. His joy is truly contagious, and days like this make all the morning walks and late-night play sessions worth it."
        setGeneratedDiary(diary)
        setEditedDiary(diary)
        setTimeout(() => setStep("edit"), 500)
      }
    }, 200)
  }

  const handlePost = () => {
    setStep("complete")
    setTimeout(() => {
      router.push("/feed")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-pink-100 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="text-pink-600 md:hidden">
            <X className="h-6 w-6" />
          </Link>
          <h1 className="text-lg font-bold text-pink-600 md:text-xl">AI 다이어리</h1>
          <div className="w-6 md:hidden" />
        </div>
      </header>

      <main className="container mx-auto max-w-4xl p-4 md:p-6">
        {/* Upload Step */}
        {step === "upload" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 md:h-24 md:w-24">
                <Sparkles className="h-10 w-10 text-white md:h-12 md:w-12" />
              </div>
              <h2 className="text-balance text-2xl font-bold text-pink-600 md:text-3xl">AI 다이어리 작성하기</h2>
              <p className="mt-2 text-pretty text-muted-foreground md:text-lg">
                반려동물의 하루를 담은 사진 1-10장을 업로드하면 AI가 아름다운 일기를 작성해드려요
              </p>
            </div>

            <Card className="border-pink-100 shadow-lg">
              <CardContent className="p-6 md:p-8">
                {selectedImages.length === 0 ? (
                  <button
                    onClick={handleUpload}
                    className="flex w-full flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-pink-200 bg-pink-50 p-12 transition-all hover:border-pink-500 hover:bg-white md:p-16"
                  >
                    <Upload className="h-12 w-12 text-pink-600 md:h-16 md:w-16" />
                    <div className="text-center">
                      <p className="font-semibold text-pink-600 md:text-lg">사진 업로드</p>
                      <p className="mt-1 text-sm text-muted-foreground md:text-base">1-10장 선택</p>
                    </div>
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 md:grid-cols-4 md:gap-3">
                      {selectedImages.map((image, index) => (
                        <div key={index} className="relative aspect-square overflow-hidden rounded-xl">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`Upload ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== index))}
                            className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {selectedImages.length < 10 && (
                        <button
                          onClick={handleUpload}
                          className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-pink-200 hover:border-pink-500"
                        >
                          <Upload className="h-8 w-8 text-pink-600" />
                        </button>
                      )}
                    </div>

                    <Button
                      onClick={handleGenerate}
                      size="lg"
                      className="w-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-base font-semibold shadow-lg hover:from-pink-600 hover:to-rose-600 md:text-lg"
                    >
                      <Sparkles className="mr-2 h-5 w-5" />
                      다이어리 생성
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Generating Step */}
        {step === "generating" && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-xl md:h-40 md:w-40">
                <Sparkles className="h-16 w-16 animate-pulse text-white md:h-20 md:w-20" />
              </div>
              <div className="absolute inset-0 animate-ping rounded-full bg-pink-500 opacity-20" />
            </div>

            <div className="w-full max-w-sm space-y-3 text-center">
              <h2 className="text-2xl font-bold text-pink-600 md:text-3xl">반려동물의 하루를 분석 중이에요...</h2>
              <p className="text-muted-foreground md:text-lg">AI가 아름다운 일기를 작성하고 있어요</p>

              <div className="overflow-hidden rounded-full bg-pink-100">
                <div
                  className="h-2 bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-300 md:h-3"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm font-medium text-pink-600 md:text-base">{progress}%</p>
            </div>
          </div>
        )}

        {/* Edit Step */}
        {step === "edit" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-balance text-2xl font-bold text-pink-600 md:text-3xl">AI 다이어리가 완성되었어요!</h2>
              <p className="mt-2 text-muted-foreground md:text-lg">수정하거나 바로 게시할 수 있어요</p>
            </div>

            <Card className="border-pink-100 shadow-lg">
              <CardContent className="space-y-4 p-6 md:p-8">
                <div className="grid grid-cols-3 gap-2 md:grid-cols-4 md:gap-3">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="aspect-square overflow-hidden rounded-xl">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Diary ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>

                <Textarea
                  value={editedDiary}
                  onChange={(e) => setEditedDiary(e.target.value)}
                  className="min-h-[200px] resize-none rounded-xl border-pink-200 text-base focus-visible:ring-pink-500 md:min-h-[250px] md:text-lg"
                />

                <Button
                  onClick={handlePost}
                  size="lg"
                  className="w-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-base font-semibold shadow-lg hover:from-pink-600 hover:to-rose-600 md:text-lg"
                >
                  피드에 게시
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Complete Step */}
        {step === "complete" && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-xl md:h-40 md:w-40">
              <Check className="h-16 w-16 text-white md:h-20 md:w-20" />
            </div>

            <div className="text-center">
              <h2 className="text-balance text-3xl font-bold text-pink-600 md:text-4xl">다이어리 게시 완료!</h2>
              <p className="mt-2 text-lg text-muted-foreground md:text-xl">100 마일리지 포인트를 획득했어요</p>

              <div className="mt-6 rounded-2xl bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 p-6 md:p-8">
                <p className="text-3xl font-bold text-pink-600 md:text-4xl">+100</p>
                <p className="text-sm text-muted-foreground md:text-base">마일리지 포인트</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
