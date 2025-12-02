"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, Sparkles, Check } from 'lucide-react'

const samplePhotos = [
  "/golden-retriever-playing-park.jpg",
  "/corgi-sitting.png",
  "/dog-running-grass.jpg",
]

type Step = "upload" | "generating" | "edit" | "complete"

export function RecapGenerationAnimation() {
  const [step, setStep] = useState<Step>("upload")
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [generatedText, setGeneratedText] = useState("")

  useEffect(() => {
    const cycleSteps = () => {
      // Upload step - 초기 상태
      setStep("upload")
      setSelectedImages([])
      setProgress(0)
      setGeneratedText("")

      // 사진 업로드 시뮬레이션
      setTimeout(() => {
        setSelectedImages([samplePhotos[0]])
        setTimeout(() => {
          setSelectedImages([samplePhotos[0], samplePhotos[1]])
          setTimeout(() => {
            setSelectedImages([samplePhotos[0], samplePhotos[1], samplePhotos[2]])

            // 생성 단계로 전환
            setTimeout(() => {
              setStep("generating")

              // 프로그레스 바 애니메이션
              const progressInterval = setInterval(() => {
                setProgress((prev) => {
                  if (prev >= 100) {
                    clearInterval(progressInterval)
                    // 편집 단계로 전환
                    setTimeout(() => {
                      setGeneratedText(
                        "오늘은 정말 완벽한 날이었어요! 공원에 도착하자마자 찰리는 기쁨을 참을 수 없었답니다. 새로운 친구들을 여럿 만났고, 잔디밭을 뛰어다니며 몇 시간을 보냈어요. 꼬리를 쉴 새 없이 흔들며 행복해하는 모습이 너무 사랑스러웠어요."
                      )
                      setStep("edit")

                      // 완료 단계로 전환
                      setTimeout(() => {
                        setStep("complete")

                        // 사이클 재시작
                        setTimeout(() => {
                          cycleSteps()
                        }, 2500)
                      }, 3000)
                    }, 500)
                    return 100
                  }
                  return prev + 10
                })
              }, 200)
            }, 1000)
          }, 600)
        }, 600)
      }, 1000)
    }

    cycleSteps()
  }, [])

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-3xl bg-gradient-to-b from-pink-50 to-rose-50 shadow-2xl">
      <div className="relative h-full p-8">
        <AnimatePresence mode="wait">
          {/* 1단계: 사진 업로드 */}
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex h-full flex-col items-center justify-center space-y-6"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg">
                <Sparkles className="h-10 w-10 text-white" />
              </div>

              <div className="text-center">
                <h2 className="text-2xl font-bold text-pink-600">AI 다이어리 작성하기</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  반려동물의 하루를 담은 사진 1-10장을 업로드하면<br />
                  AI가 아름다운 일기를 작성해드려요
                </p>
              </div>

              <div className="w-full max-w-md rounded-2xl border-2 border-pink-100 bg-white p-6 shadow-lg">
                {selectedImages.length === 0 ? (
                  <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-pink-200 bg-pink-50 p-12">
                    <Upload className="h-12 w-12 text-pink-500" />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-pink-600">사진 업로드</p>
                      <p className="mt-1 text-xs text-muted-foreground">1-10장 선택</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <AnimatePresence>
                        {selectedImages.map((image, index) => (
                          <motion.div
                            key={index}
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="relative aspect-square overflow-hidden rounded-xl"
                          >
                            <img
                              src={image || "/placeholder.svg"}
                              alt={`Upload ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </motion.div>
                        ))}
                        {selectedImages.length < 10 && (
                          <div className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-pink-200">
                            <Upload className="h-6 w-6 text-pink-400" />
                          </div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 py-2.5 text-center shadow-lg">
                      <span className="flex items-center justify-center gap-2 text-sm font-semibold text-white">
                        <Sparkles className="h-4 w-4" />
                        다이어리 생성
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* 2단계: AI 생성 중 */}
          {step === "generating" && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex h-full flex-col items-center justify-center space-y-8"
            >
              <div className="relative">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-xl">
                  <Sparkles className="h-16 w-16 animate-pulse text-white" />
                </div>
                <div className="absolute inset-0 animate-ping rounded-full bg-pink-400 opacity-20" />
              </div>

              <div className="w-full max-w-md space-y-3 text-center">
                <h2 className="text-2xl font-bold text-pink-600">반려동물의 하루를 분석 중이에요...</h2>
                <p className="text-sm text-muted-foreground">AI가 아름다운 일기를 작성하고 있어요</p>

                <div className="overflow-hidden rounded-full bg-pink-100">
                  <motion.div
                    className="h-2 bg-gradient-to-r from-pink-500 to-rose-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm font-medium text-pink-600">{progress}%</p>
              </div>
            </motion.div>
          )}

          {/* 3단계: 편집 */}
          {step === "edit" && (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex h-full flex-col items-center justify-center space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-pink-600">AI 다이어리가 완성되었어요!</h2>
                <p className="mt-2 text-sm text-muted-foreground">수정하거나 바로 게시할 수 있어요</p>
              </div>

              <div className="w-full max-w-md space-y-4 rounded-2xl border-2 border-pink-100 bg-white p-6 shadow-lg">
                <div className="grid grid-cols-3 gap-2">
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

                <div className="min-h-[140px] rounded-xl border-2 border-pink-200 bg-pink-50 p-4">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-sm leading-relaxed text-gray-700"
                  >
                    {generatedText}
                  </motion.p>
                </div>

                <div className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 py-2.5 text-center shadow-lg">
                  <span className="text-sm font-semibold text-white">피드에 게시</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* 4단계: 완료 */}
          {step === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex h-full flex-col items-center justify-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.6 }}
                className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-xl"
              >
                <Check className="h-16 w-16 text-white" />
              </motion.div>

              <div className="text-center">
                <h2 className="text-3xl font-bold text-pink-600">다이어리 게시 완료!</h2>
                <p className="mt-2 text-lg text-muted-foreground">100 펫코인을 획득했어요</p>

                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 rounded-2xl bg-gradient-to-r from-yellow-400/20 to-orange-400/20 p-6"
                >
                  <p className="text-3xl font-bold text-pink-600">+100</p>
                  <p className="text-sm text-muted-foreground">펫코인</p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
