import type React from "react"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  X,
  Upload,
  Sparkles,
  Check,
  ArrowLeft,
  Instagram,
  Share2,
  Grid3x3,
  Grid2x2,
  LayoutGrid,
  ImageIcon,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Facebook,
  Twitter,
  Link as LinkIcon,
} from "lucide-react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"

type DiaryStep = "upload" | "generating" | "edit" | "complete"
type LayoutStyle = "grid" | "masonry" | "slide" | "classic"

export default function AiDiaryPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<DiaryStep>("upload")
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [showGallery, setShowGallery] = useState(false)
  const [editedDiary, setEditedDiary] = useState("")
  const [progress, setProgress] = useState(0)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>("grid")
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left")
  const [fontSize, setFontSize] = useState(16)
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")

  const GALLERY_IMAGES = [
    "/golden-retriever-playing-park.jpg",
    "/dog-running-grass.jpg",
    "/cat-in-box.jpg",
    "/tabby-cat-sunbeam.png",
    "/corgi.jpg",
    "/golden-retriever.png",
    "/pomeranian.jpg",
    "/dog-birthday-party.png",
  ]

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages = Array.from(files)
        .slice(0, 10 - selectedImages.length)
        .map((file) => URL.createObjectURL(file))
      setSelectedImages([...selectedImages, ...newImages])
    }
  }

  const handleSelectFromGallery = (imageUrl: string) => {
    if (selectedImages.length < 10 && !selectedImages.includes(imageUrl)) {
      setSelectedImages([...selectedImages, imageUrl])
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
        const diary =
          "오늘은 정말 완벽한 날이었어요! 공원에 도착하자마자 찰리는 기쁨을 참을 수 없었답니다. 새로운 친구들을 여럿 만났고, 잔디밭을 뛰어다니며 몇 시간을 보냈어요. 꼬리를 쉴 새 없이 흔들며 행복해하는 모습이 너무 사랑스러웠어요. 날씨는 완벽했어요 - 햇살이 따뜻하고 산들바람이 불었죠. 우리는 찰리가 행복하게 지칠 때까지 공놀이를 했어요. 매 순간을 즐기는 찰리를 보며, 이런 단순한 외출이 얼마나 소중한지 다시 한번 느꼈답니다. 찰리의 기쁨은 정말 전염되는 것 같아요!"

        setEditedDiary(diary)
        setTimeout(() => setStep("edit"), 500)
      }
    }, 200)
  }

  const handleShareToFeed = () => {
    setStep("complete")
    setTimeout(() => {
      navigate("/feed")
    }, 2000)
  }



  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-pink-100 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/ai-studio" className="text-pink-600">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-lg font-bold text-pink-600 md:text-xl">AI 다이어리</h1>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-36 border-pink-200 text-sm"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl p-4 md:p-6">
        {step === "upload" && (
          <div className="space-y-6">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-xl md:h-24 md:w-24"
              >
                <Sparkles className="h-10 w-10 text-white md:h-12 md:w-12" />
              </motion.div>
              <h2 className="text-balance text-2xl font-bold text-pink-600 md:text-3xl">AI 다이어리 작성하기</h2>
              <p className="mt-2 text-pretty text-muted-foreground md:text-lg">
                반려동물의 하루를 담은 사진 1-10장을 업로드하면 AI가 아름다운 일기를 작성해드려요
              </p>
            </div>

            <Card className="border-pink-100 shadow-xl">
              <CardContent className="p-6 md:p-8">
                {selectedImages.length === 0 ? (
                  <div className="space-y-4">
                    <label className="flex w-full cursor-pointer flex-col items-center gap-6 rounded-3xl border-2 border-dashed border-pink-300 bg-gradient-to-br from-pink-50 to-rose-50 p-16 transition-all hover:border-pink-500 hover:from-white hover:to-pink-50 md:p-24">
                      <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg">
                        <Upload className="h-10 w-10 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-pink-600">사진을 선택하거나 드래그하세요</p>
                        <p className="mt-2 text-muted-foreground">최대 10장까지 업로드 가능 • JPG, PNG</p>
                      </div>
                    </label>

                    <Button
                      onClick={() => setShowGallery(true)}
                      variant="outline"
                      className="w-full border-2 border-pink-300 text-pink-600 hover:bg-pink-50 bg-transparent"
                      size="lg"
                    >
                      <ImageIcon className="mr-2 h-5 w-5" />
                      보관함에서 선택하기
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="font-semibold text-pink-600">선택된 사진 {selectedImages.length}/10</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowGallery(true)}
                            className="border-pink-200 text-pink-600 hover:bg-pink-50 bg-transparent"
                          >
                            <ImageIcon className="mr-2 h-4 w-4" />
                            보관함
                          </Button>
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-pink-200 text-pink-600 hover:bg-pink-50 bg-transparent"
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              추가
                            </Button>
                          </label>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
                        {selectedImages.map((image, index) => (
                          <motion.div
                            key={index}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="group relative aspect-square overflow-hidden rounded-xl shadow-md"
                          >
                            <img
                              src={image || "/placeholder.svg"}
                              alt={`Upload ${index + 1}`}
                              className="h-full w-full object-cover transition-transform group-hover:scale-110"
                            />
                            <button
                              onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== index))}
                              className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white opacity-0 transition-opacity hover:bg-black group-hover:opacity-100"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <div className="absolute bottom-2 left-2 rounded-full bg-pink-500 px-2 py-0.5 text-xs font-medium text-white">
                              {index + 1}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={handleGenerate}
                      size="lg"
                      className="w-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-lg font-bold shadow-xl transition-all hover:scale-105 hover:from-pink-600 hover:to-rose-600 md:text-xl"
                    >
                      <Sparkles className="mr-2 h-6 w-6" />
                      AI 다이어리 생성하기
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

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

        {step === "edit" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-balance text-2xl font-bold text-pink-600 md:text-3xl">AI 다이어리가 완성되었어요!</h2>
              <p className="mt-2 text-muted-foreground md:text-lg">레이아웃과 스타일을 자유롭게 편집하세요</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
              {/* Main editing area */}
              <div className="space-y-4">
                <Card className="border-pink-100 shadow-xl" style={{ backgroundColor }}>
                  <CardContent className="space-y-4 p-6 md:p-8">
                    {/* Layout templates */}
                    <div className="rounded-xl bg-white/80 p-4 backdrop-blur">
                      <p className="mb-3 text-sm font-semibold text-pink-600">갤러리 스타일</p>
                      <div className="grid grid-cols-4 gap-2">
                        <button
                          onClick={() => setLayoutStyle("grid")}
                          className={`rounded-lg border-2 p-3 transition-all ${layoutStyle === "grid" ? "border-pink-500 bg-pink-50" : "border-pink-200 bg-white hover:border-pink-300"}`}
                        >
                          <Grid2x2 className="mx-auto h-6 w-6 text-pink-600" />
                          <p className="mt-1 text-xs font-medium text-pink-600">그리드</p>
                        </button>
                        <button
                          onClick={() => setLayoutStyle("masonry")}
                          className={`rounded-lg border-2 p-3 transition-all ${layoutStyle === "masonry" ? "border-pink-500 bg-pink-50" : "border-pink-200 bg-white hover:border-pink-300"}`}
                        >
                          <LayoutGrid className="mx-auto h-6 w-6 text-pink-600" />
                          <p className="mt-1 text-xs font-medium text-pink-600">Masonry</p>
                        </button>
                        <button
                          onClick={() => setLayoutStyle("slide")}
                          className={`rounded-lg border-2 p-3 transition-all ${layoutStyle === "slide" ? "border-pink-500 bg-pink-50" : "border-pink-200 bg-white hover:border-pink-300"}`}
                        >
                          <ImageIcon className="mx-auto h-6 w-6 text-pink-600" />
                          <p className="mt-1 text-xs font-medium text-pink-600">슬라이드</p>
                        </button>
                        <button
                          onClick={() => setLayoutStyle("classic")}
                          className={`rounded-lg border-2 p-3 transition-all ${layoutStyle === "classic" ? "border-pink-500 bg-pink-50" : "border-pink-200 bg-white hover:border-pink-300"}`}
                        >
                          <Grid3x3 className="mx-auto h-6 w-6 text-pink-600" />
                          <p className="mt-1 text-xs font-medium text-pink-600">클래식</p>
                        </button>
                      </div>
                    </div>

                    {/* Image gallery based on layout */}
                    <div
                      className={
                        layoutStyle === "grid"
                          ? "grid grid-cols-2 gap-3 md:grid-cols-3"
                          : layoutStyle === "masonry"
                            ? "columns-2 gap-3 md:columns-3"
                            : layoutStyle === "slide"
                              ? "flex gap-3 overflow-x-auto pb-2"
                              : "grid grid-cols-4 gap-2"
                      }
                    >
                      {selectedImages.map((image, index) => (
                        <motion.div
                          key={index}
                          layout
                          className={`overflow-hidden rounded-xl shadow-md ${layoutStyle === "slide" ? "min-w-[250px]" : layoutStyle === "masonry" ? "mb-3" : ""
                            }`}
                        >
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`Diary ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </motion.div>
                      ))}
                    </div>

                    {/* Text editor */}
                    <div className="rounded-xl bg-white/80 p-4 backdrop-blur">
                      <Textarea
                        value={editedDiary}
                        onChange={(e) => setEditedDiary(e.target.value)}
                        style={{
                          textAlign,
                          fontSize: `${fontSize}px`,
                          lineHeight: "1.7",
                        }}
                        className="min-h-[250px] resize-none border-pink-200 focus-visible:ring-pink-500 md:min-h-[300px]"
                        placeholder="다이어리 내용을 입력하세요..."
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Button
                    onClick={handleShareToFeed}
                    size="lg"
                    className="w-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-base font-bold shadow-lg hover:from-pink-600 hover:to-rose-600 md:text-lg"
                  >
                    <Share2 className="mr-2 h-5 w-5" />
                    피드에 게시
                  </Button>
                </div>
              </div>

              <div className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
                <Card className="border-pink-100 shadow-xl">
                  <CardContent className="space-y-6 p-6">
                    <div>
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-pink-600">
                        <Palette className="h-5 w-5" />
                        다이어리 스타일
                      </h3>

                      {/* Text alignment */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-muted-foreground">텍스트 정렬</label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => setTextAlign("left")}
                            className={`rounded-lg border-2 p-2 transition-all ${textAlign === "left" ? "border-pink-500 bg-pink-50" : "border-pink-200 hover:border-pink-300"}`}
                          >
                            <AlignLeft className="mx-auto h-5 w-5 text-pink-600" />
                          </button>
                          <button
                            onClick={() => setTextAlign("center")}
                            className={`rounded-lg border-2 p-2 transition-all ${textAlign === "center" ? "border-pink-500 bg-pink-50" : "border-pink-200 hover:border-pink-300"}`}
                          >
                            <AlignCenter className="mx-auto h-5 w-5 text-pink-600" />
                          </button>
                          <button
                            onClick={() => setTextAlign("right")}
                            className={`rounded-lg border-2 p-2 transition-all ${textAlign === "right" ? "border-pink-500 bg-pink-50" : "border-pink-200 hover:border-pink-300"}`}
                          >
                            <AlignRight className="mx-auto h-5 w-5 text-pink-600" />
                          </button>
                        </div>
                      </div>

                      {/* Font size */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-muted-foreground">글자 크기</label>
                        <input
                          type="range"
                          min="12"
                          max="24"
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          className="w-full accent-pink-500"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>작게</span>
                          <span className="font-medium text-pink-600">{fontSize}px</span>
                          <span>크게</span>
                        </div>
                      </div>

                      {/* Background color */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-muted-foreground">배경 색상</label>
                        <div className="grid grid-cols-5 gap-2">
                          {["#ffffff", "#fff5f5", "#fef2f2", "#fdf4ff", "#f0f9ff"].map((color) => (
                            <button
                              key={color}
                              onClick={() => setBackgroundColor(color)}
                              className={`h-10 rounded-lg border-2 transition-all ${backgroundColor === color ? "border-pink-500 scale-110" : "border-pink-200 hover:border-pink-300"}`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Preset styles */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-muted-foreground">프리셋</label>
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              setLayoutStyle("grid")
                              setTextAlign("left")
                              setFontSize(16)
                              setBackgroundColor("#ffffff")
                            }}
                            className="w-full rounded-lg border-2 border-pink-200 p-3 text-left text-sm font-medium text-pink-600 transition-all hover:border-pink-500 hover:bg-pink-50"
                          >
                            기본 스타일
                          </button>
                          <button
                            onClick={() => {
                              setLayoutStyle("masonry")
                              setTextAlign("center")
                              setFontSize(18)
                              setBackgroundColor("#fef2f2")
                            }}
                            className="w-full rounded-lg border-2 border-pink-200 p-3 text-left text-sm font-medium text-pink-600 transition-all hover:border-pink-500 hover:bg-pink-50"
                          >
                            로맨틱 스타일
                          </button>
                          <button
                            onClick={() => {
                              setLayoutStyle("slide")
                              setTextAlign("left")
                              setFontSize(14)
                              setBackgroundColor("#f0f9ff")
                            }}
                            className="w-full rounded-lg border-2 border-pink-200 p-3 text-left text-sm font-medium text-pink-600 transition-all hover:border-pink-500 hover:bg-pink-50"
                          >
                            모던 스타일
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Animated Social Buttons */}
                <div className="flex justify-center gap-4 py-2">
                  {[
                    { icon: Facebook, label: "Facebook", color: "hover:bg-[#1877F2]", text: "group-hover:text-white" },
                    { icon: Twitter, label: "Twitter", color: "hover:bg-[#1DA1F2]", text: "group-hover:text-white" },
                    { icon: Instagram, label: "Instagram", color: "hover:bg-[#E4405F]", text: "group-hover:text-white" },
                    { icon: LinkIcon, label: "Copy Link", color: "hover:bg-slate-800", text: "group-hover:text-white" },
                  ].map((social, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (social.label === "Copy Link") {
                          navigator.clipboard.writeText(window.location.href);
                          alert("링크가 복사되었습니다!");
                        } else {
                          alert(`${social.label} 공유 기능은 준비 중입니다.`);
                        }
                      }}
                      className={`group relative flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${social.color}`}
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 transition-all duration-300 group-hover:opacity-100 pointer-events-none">
                        <div className={`whitespace-nowrap rounded-md px-2 py-1 text-xs font-bold text-white shadow-sm ${social.color.replace('hover:', '')}`}>
                          {social.label}
                        </div>
                        <div className={`absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-${social.color.replace('hover:bg-', '')}`} />
                      </div>

                      <social.icon className={`h-5 w-5 text-slate-600 transition-colors duration-300 ${social.text}`} />
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {step === "complete" && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-xl md:h-40 md:w-40">
              <Check className="h-16 w-16 text-white md:h-20 md:w-20" />
            </div>

            <div className="text-center">
              <h2 className="text-balance text-3xl font-bold text-pink-600 md:text-4xl">다이어리 게시 완료!</h2>
              <p className="mt-2 text-lg text-muted-foreground md:text-xl">100 펫코인을 획득했어요</p>

              <div className="mt-6 rounded-2xl bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 p-6 md:p-8">
                <p className="text-3xl font-bold text-pink-600 md:text-4xl">+100</p>
                <p className="text-sm text-muted-foreground md:text-base">펫코인</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Gallery modal for selecting existing photos */}
      {showGallery && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setShowGallery(false)}
        >
          <Card className="max-h-[80vh] w-full max-w-4xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-pink-600">보관함에서 선택</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowGallery(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">선택된 사진: {selectedImages.length}/10</p>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {GALLERY_IMAGES.map((image, index) => {
                  const isSelected = selectedImages.includes(image)
                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectFromGallery(image)}
                      disabled={selectedImages.length >= 10 && !isSelected}
                      className={cn(
                        "relative aspect-square overflow-hidden rounded-xl transition-all",
                        isSelected
                          ? "ring-4 ring-pink-500"
                          : selectedImages.length >= 10
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:scale-105 hover:shadow-lg",
                      )}
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Gallery ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-pink-500/50">
                          <Check className="h-10 w-10 text-white" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
              <Button
                onClick={() => setShowGallery(false)}
                className="mt-6 w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-90"
              >
                선택 완료
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}