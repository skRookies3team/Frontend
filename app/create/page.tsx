"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { TabNavigation } from "@/components/tab-navigation"
import { X, ImageIcon, Sparkles, Camera } from "lucide-react"

export default function CreatePage() {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [selectedImages, setSelectedImages] = useState<string[]>([])

  const handlePost = () => {
    // Handle post creation
    router.push("/feed")
  }

  return (
    <div className="min-h-screen bg-pink-50 pb-20">
      <header className="sticky top-0 z-40 border-b border-pink-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
          <Link href="/feed" className="text-pink-600">
            <X className="h-6 w-6" />
          </Link>
          <h1 className="text-lg font-bold text-pink-600">게시물 작성</h1>
          <Button
            onClick={handlePost}
            disabled={!content.trim() && selectedImages.length === 0}
            className="h-9 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-6 text-sm font-semibold hover:from-pink-600 hover:to-rose-600"
          >
            게시
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-lg p-4">
        <div className="space-y-4">
          {/* Creation Options */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/ai-diary">
              <Card className="cursor-pointer overflow-hidden border-2 border-pink-500 bg-gradient-to-br from-pink-500 to-rose-500 transition-transform hover:scale-105">
                <CardContent className="flex flex-col items-center gap-2 p-6 text-white">
                  <Sparkles className="h-8 w-8" />
                  <p className="text-center text-sm font-semibold">AI 다이어리</p>
                </CardContent>
              </Card>
            </Link>

            <Card className="cursor-pointer overflow-hidden border-2 border-pink-200 transition-all hover:border-pink-500 hover:shadow-md">
              <CardContent className="flex flex-col items-center gap-2 p-6 text-pink-600">
                <Camera className="h-8 w-8" />
                <p className="text-center text-sm font-semibold">일반 게시물</p>
              </CardContent>
            </Card>
          </div>

          {/* Post Form */}
          <Card className="border-0 shadow-md">
            <CardContent className="space-y-4 p-4">
              <Textarea
                placeholder="반려동물에 대한 이야기를 공유해주세요..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[150px] resize-none rounded-xl border-pink-200 text-base focus-visible:ring-pink-500"
              />

              {/* Image Preview */}
              {selectedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden rounded-xl">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Selected ${index + 1}`}
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
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-pink-200 text-pink-600 bg-transparent hover:bg-pink-50"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  사진 추가
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <TabNavigation />
    </div>
  )
}
