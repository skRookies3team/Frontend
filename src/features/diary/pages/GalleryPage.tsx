import { useState } from "react"
import { Link } from "react-router-dom"
import { TabNavigation } from "@/shared/components/tab-navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Heart, MessageCircle, X, Download, Share2 } from "lucide-react"
import { cn } from "@/shared/lib/utils"

// 전체 사진 목 데이터
const ALL_PHOTOS = [
  {
    id: "1",
    url: "/golden-retriever-playing-park.jpg",
    category: "산책",
    date: "2024.01.15",
    likes: 124,
    comments: 18,
  },
  {
    id: "2",
    url: "/dog-running-grass.jpg",
    category: "놀이",
    date: "2024.01.14",
    likes: 98,
    comments: 12,
  },
  {
    id: "3",
    url: "/cat-in-box.jpg",
    category: "일상",
    date: "2024.01.13",
    likes: 145,
    comments: 24,
  },
  {
    id: "4",
    url: "/tabby-cat-sunbeam.png",
    category: "휴식",
    date: "2024.01.12",
    likes: 167,
    comments: 31,
  },
  {
    id: "5",
    url: "/corgi.jpg",
    category: "훈련",
    date: "2024.01.11",
    likes: 89,
    comments: 15,
  },
  {
    id: "6",
    url: "/golden-retriever.png",
    category: "식사",
    date: "2024.01.10",
    likes: 112,
    comments: 19,
  },
  {
    id: "7",
    url: "/pomeranian.jpg",
    category: "산책",
    date: "2024.01.09",
    likes: 134,
    comments: 22,
  },
  {
    id: "8",
    url: "/dog-birthday-party.png",
    category: "일상",
    date: "2024.01.08",
    likes: 198,
    comments: 45,
  },
]

// AI 다이어리 목 데이터
const AI_DIARY_PHOTOS = [
  {
    id: "d1",
    url: "/golden-retriever-playing-park.jpg",
    date: "2024.01.15",
    title: "공원에서의 즐거운 하루",
    content:
      "오늘 초코는 공원에서 정말 행복한 시간을 보냈어요. 새로운 친구들을 만나고 신나게 뛰어놀았답니다. 햇살이 따스한 오후, 초코의 꼬리는 멈추지 않고 흔들렸어요.",
    aiGenerated: true,
  },
  {
    id: "d2",
    url: "/dog-running-grass.jpg",
    date: "2024.01.14",
    title: "달리기의 즐거움",
    content:
      "초코가 넓은 잔디밭에서 마음껏 달렸어요. 바람을 가르며 달리는 모습이 정말 자유로워 보였답니다. 운동 후 물을 벌컥벌컥 마시는 모습도 귀여웠어요.",
    aiGenerated: true,
  },
]

// 카테고리별 데이터
const CATEGORIES = ["전체", "산책", "놀이", "일상", "휴식", "훈련", "식사"]

export default function GalleryPage() {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("전체")

  const filteredPhotos =
    selectedCategory === "전체" ? ALL_PHOTOS : ALL_PHOTOS.filter((photo) => photo.category === selectedCategory)

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">사진 보관함</h1>
          <p className="mt-2 text-muted-foreground">내 반려동물의 소중한 순간들을 모아보세요</p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start border-b border-border bg-transparent p-0">
            <TabsTrigger
              value="all"
              className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              전체 사진
              <Badge className="ml-2 bg-pink-100 text-pink-600">{ALL_PHOTOS.length}</Badge>
            </TabsTrigger>
            <TabsTrigger
              value="category"
              className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              카테고리별
            </TabsTrigger>
            <TabsTrigger
              value="diary"
              className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              AI 다이어리
              <Badge className="ml-2 bg-purple-100 text-purple-600">{AI_DIARY_PHOTOS.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* 전체 사진 탭 */}
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {ALL_PHOTOS.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo.id)}
                  className="group relative aspect-square overflow-hidden rounded-xl bg-muted transition-all hover:scale-105 hover:shadow-lg"
                >
                  <img src={photo.url || "/placeholder.svg"} alt="Pet photo" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {photo.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {photo.comments}
                        </span>
                      </div>
                      <p className="mt-1 text-xs">{photo.date}</p>
                    </div>
                  </div>
                  <Badge className="absolute right-2 top-2 bg-white/90 text-foreground">{photo.category}</Badge>
                </button>
              ))}
            </div>
          </TabsContent>

          {/* 카테고리별 탭 */}
          <TabsContent value="category" className="mt-6">
            <div className="mb-6 flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "rounded-full",
                    selectedCategory === category && "bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-90",
                  )}
                >
                  {category}
                  {selectedCategory === category && (
                    <Badge className="ml-2 bg-white/20">
                      {category === "전체"
                        ? ALL_PHOTOS.length
                        : ALL_PHOTOS.filter((p) => p.category === category).length}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredPhotos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo.id)}
                  className="group relative aspect-square overflow-hidden rounded-xl bg-muted transition-all hover:scale-105 hover:shadow-lg"
                >
                  <img src={photo.url || "/placeholder.svg"} alt="Pet photo" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {photo.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {photo.comments}
                        </span>
                      </div>
                      <p className="mt-1 text-xs">{photo.date}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>

          {/* AI 다이어리 탭 */}
          <TabsContent value="diary" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {AI_DIARY_PHOTOS.map((diary) => (
                <div
                  key={diary.id}
                  className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-lg"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={diary.url || "/placeholder.svg"}
                      alt={diary.title}
                      className="h-full w-full object-cover"
                    />
                    <Badge className="absolute right-3 top-3 bg-purple-500 text-white">AI 생성</Badge>
                  </div>
                  <div className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">{diary.title}</h3>
                      <span className="text-xs text-muted-foreground">{diary.date}</span>
                    </div>
                    <p className="line-clamp-3 text-sm text-muted-foreground">{diary.content}</p>
                    <Link to={`/ai-diary/${diary.id}`}>
                      <Button variant="ghost" size="sm" className="mt-3 w-full text-primary">
                        전체 다이어리 보기
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* 사진 상세 모달 */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-h-[90vh] max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -right-4 -top-4 rounded-full bg-white p-2 shadow-lg transition-transform hover:scale-110"
            >
              <X className="h-6 w-6 text-foreground" />
            </button>

            {(() => {
              const photo = ALL_PHOTOS.find((p) => p.id === selectedPhoto)
              if (!photo) return null

              return (
                <>
                  <img
                    src={photo.url || "/placeholder.svg"}
                    alt="Pet photo"
                    className="max-h-[80vh] rounded-2xl object-contain shadow-2xl"
                  />
                  <div className="mt-4 rounded-xl bg-white p-4 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-pink-100 text-pink-600">{photo.category}</Badge>
                          <span className="text-sm text-muted-foreground">{photo.date}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-sm text-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {photo.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {photo.comments}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}

      <TabNavigation />
    </div>
  )
}
