"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { TabNavigation } from "@/components/tab-navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  PawPrint,
  Heart,
  Settings,
  ChevronRight,
  Edit,
  MessageCircle,
  X,
  Download,
  Share2,
  ImageIcon,
  BookOpen,
  Sparkles,
  ChevronLeft,
  CalendarIcon,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

const USER_POSTS = [
  "/dog-running-grass.jpg",
  "/golden-retriever-playing-park.jpg",
  "/corgi.jpg",
  "/pomeranian.jpg",
  "/dog-birthday-party.png",
  "/tabby-cat-sunbeam.png",
]

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
]

const AI_DIARY_PHOTOS = [
  {
    id: "d1",
    url: "/golden-retriever-playing-park.jpg",
    date: "2024.01.15",
    title: "공원에서의 즐거운 하루",
    content: "오늘 초코는 공원에서 정말 행복한 시간을 보냈어요. 새로운 친구들을 만나고 신나게 뛰어놀았답니다.",
    aiGenerated: true,
  },
  {
    id: "d2",
    url: "/dog-running-grass.jpg",
    date: "2024.01.14",
    title: "달리기의 즐거움",
    content: "초코가 넓은 잔디밭에서 마음껏 달렸어요. 바람을 가르며 달리는 모습이 정말 자유로워 보였답니다.",
    aiGenerated: true,
  },
]

const CATEGORIES = ["전체", "산책", "놀이", "일상", "휴식", "훈련", "식사"]

const AI_BIOGRAPHIES = [
  {
    id: "bio1",
    title: "초코의 성장 이야기",
    coverImage: "/golden-retriever-playing-park.jpg",
    createdAt: "2024.01.20",
    moments: 12,
    content:
      "작은 강아지였던 초코가 사랑스럽고 용감한 반려견으로 자라난 특별한 여정을 담았습니다. 첫 집에 온 날부터 지금까지의 소중한 순간들을 AI가 감동적인 이야기로 엮었습니다.",
    style: "감성적",
  },
  {
    id: "bio2",
    title: "우리 가족이 된 날",
    coverImage: "/golden-retriever.png",
    createdAt: "2024.01.15",
    moments: 8,
    content:
      "초코가 우리 가족의 일원이 되기까지의 특별한 순간들. 처음 만난 날의 설렘부터 함께 보낸 행복한 시간들을 따뜻한 이야기로 담았습니다.",
    style: "따뜻한",
  },
]

const AI_RECAPS = [
  {
    id: "recap1",
    period: "2024년 1-2월",
    year: 2024,
    coverImage: "/golden-retriever-playing-park.jpg",
    totalMoments: 45,
    createdAt: "2024.03.01",
  },
  {
    id: "recap2",
    period: "2023년 11-12월",
    year: 2023,
    coverImage: "/dog-running-grass.jpg",
    totalMoments: 38,
    createdAt: "2024.01.01",
  },
]

const AI_DIARIES = [
  {
    id: "diary1",
    date: "2024-01-15",
    image: "/golden-retriever-playing-park.jpg",
    title: "공원에서의 즐거운 하루",
    content:
      "오늘 초코는 공원에서 정말 행복한 시간을 보냈어요. 새로운 친구들을 만나고 신나게 뛰어놀았답니다. 햇살이 따스했고, 초코의 웃는 얼굴을 보니 저도 덩달아 행복해졌어요.",
    weather: "맑음",
    mood: "행복",
  },
  {
    id: "diary2",
    date: "2024-01-14",
    image: "/dog-running-grass.jpg",
    title: "달리기의 즐거움",
    content: "초코가 넓은 잔디밭에서 마음껏 달렸어요. 바람을 가르며 달리는 모습이 정말 자유로워 보였답니다.",
    weather: "흐림",
    mood: "신남",
  },
  {
    id: "diary3",
    date: "2024-01-10",
    image: "/golden-retriever.png",
    title: "편안한 오후",
    content: "오늘은 집에서 느긋하게 쉬는 날이에요. 초코도 소파에서 낮잠을 자며 편안한 시간을 보냈답니다.",
    weather: "비",
    mood: "평온",
  },
]

export default function ProfilePage() {
  const router = useRouter()
  const { logout } = useAuth()
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [selectedRecap, setSelectedRecap] = useState<string | null>(null)

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedDiary, setSelectedDiary] = useState<(typeof AI_DIARIES)[0] | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [dialogDate, setDialogDate] = useState<string>("")

  const filteredPhotos =
    selectedCategory === "전체" ? ALL_PHOTOS : ALL_PHOTOS.filter((photo) => photo.category === selectedCategory)

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    return { firstDay, daysInMonth, year, month }
  }

  const { firstDay, daysInMonth, year, month } = getDaysInMonth(currentMonth)

  const getDiaryForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return AI_DIARIES.find((diary) => diary.date === dateStr)
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const handleDateClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const diary = getDiaryForDate(day)
    if (diary) {
      setSelectedDiary(diary)
    } else {
      setDialogDate(dateStr)
      setShowCreateDialog(true)
    }
  }

  const handleCreateDiary = () => {
    router.push(`/ai-studio/diary?date=${dialogDate}`)
    setShowCreateDialog(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-5xl pb-20 md:pb-8 md:px-6 md:py-6">
        <div className="space-y-6 p-4 md:p-0">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-border md:h-32 md:w-32">
                    <AvatarImage src="/diverse-woman-avatar.png" alt="Sarah Kim" />
                    <AvatarFallback>SK</AvatarFallback>
                  </Avatar>
                  <button className="absolute -bottom-2 -right-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 p-2 text-white shadow-md hover:opacity-90">
                    <Edit className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="mb-4 flex items-center justify-center gap-3 md:justify-start">
                    <h2 className="text-2xl font-bold text-foreground md:text-3xl">김서연</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={logout}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <LogOut className="mr-1 h-4 w-4" />
                      로그아웃
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">@sarahkim</p>

                  <div className="flex justify-center gap-8 md:justify-start">
                    <div>
                      <p className="text-xl font-bold text-foreground md:text-2xl">24</p>
                      <p className="text-sm text-muted-foreground">게시물</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-foreground md:text-2xl">1.2천</p>
                      <p className="text-sm text-muted-foreground">팔로워</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-foreground md:text-2xl">342</p>
                      <p className="text-sm text-muted-foreground">팔로잉</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* My Pets */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PawPrint className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-foreground">내 반려동물</h3>
                </div>
                <Link href="/profile/pets">
                  <Button variant="ghost" size="sm" className="rounded-full text-primary">
                    관리
                  </Button>
                </Link>
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <Avatar className="h-16 w-16 border-4 border-primary">
                      <AvatarImage src="/golden-retriever.png" alt="Charlie" />
                      <AvatarFallback>C</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">초코</p>
                    <p className="text-xs text-muted-foreground">골든 리트리버</p>
                  </div>
                </div>

                <button className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-border transition-colors hover:border-primary">
                  <span className="text-2xl text-primary">+</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Menu Items */}
          <Card className="border-0 shadow-lg">
            <CardContent className="divide-y divide-border p-0">
              <Link href="/profile/favorites">
                <div className="flex items-center justify-between p-4 transition-colors hover:bg-background">
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">즐겨찾기</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>

              <Link href="/profile/settings">
                <div className="flex items-center justify-between p-4 transition-colors hover:bg-background">
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">설정</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 border-t-8 border-border p-4 md:p-0 md:pt-6">
          <Tabs defaultValue="calendar" className="w-full">
            <TabsList className="w-full justify-start border-b border-border bg-transparent p-0">
              <TabsTrigger
                value="calendar"
                className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                AI 다이어리 캘린더
              </TabsTrigger>
              <TabsTrigger
                value="recap"
                className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                AI 리캡
              </TabsTrigger>
              <TabsTrigger
                value="gallery"
                className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                사진 보관함
              </TabsTrigger>
            </TabsList>

            {/* AI 다이어리 캘린더 탭 */}
            <TabsContent value="calendar" className="mt-6">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-4 md:p-6">
                  {/* 캘린더 헤더 */}
                  <div className="mb-6 flex items-center justify-between">
                    <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="rounded-full">
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h3 className="text-lg font-bold text-foreground">
                      {year}년 {month + 1}월
                    </h3>
                    <Button variant="ghost" size="icon" onClick={handleNextMonth} className="rounded-full">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* 요일 헤더 */}
                  <div className="mb-2 grid grid-cols-7 gap-1">
                    {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                      <div key={day} className="py-2 text-center text-sm font-semibold text-muted-foreground">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* 캘린더 그리드 */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* 빈 칸 */}
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                    {/* 날짜 */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1
                      let diary = getDiaryForDate(day)

                      // Added example diary for Nov 20, 2025
                      if (year === 2025 && month === 10 && day === 20) {
                        diary = {
                          id: "example-diary",
                          date: "2025-11-20",
                          image: "/golden-retriever-playing-park.jpg",
                          title: "행복한 하루",
                          content: "오늘은 초코와 함께 공원에서 즐거운 시간을 보냈어요.",
                          weather: "맑음",
                          mood: "행복",
                        }
                      }

                      const isToday =
                        new Date().getDate() === day &&
                        new Date().getMonth() === month &&
                        new Date().getFullYear() === year

                      return (
                        <button
                          key={day}
                          onClick={() => handleDateClick(day)}
                          disabled={!diary}
                          className={cn(
                            "relative aspect-square overflow-hidden rounded-lg border-2 p-1 transition-all",
                            diary
                              ? "border-pink-300 hover:scale-105 hover:shadow-md"
                              : "border-transparent bg-muted/30",
                            isToday && "ring-2 ring-primary ring-offset-2",
                          )}
                        >
                          {diary && (
                            <>
                              <div className="absolute inset-0 overflow-hidden rounded-lg">
                                <img
                                  src={diary.image || "/placeholder.svg"}
                                  alt={diary.title}
                                  className="h-full w-full object-cover opacity-80"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <Badge className="absolute bottom-1 right-1 h-4 bg-purple-500 px-1 text-[10px]">
                                  <Sparkles className="h-2 w-2" />
                                </Badge>
                              </div>
                              <span className="absolute top-1 left-1 z-10 text-xs font-bold text-white drop-shadow-lg">
                                {day}
                              </span>
                            </>
                          )}
                          {!diary && <span className={cn("text-sm font-medium", "text-muted-foreground")}>{day}</span>}
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-6 text-center text-sm text-muted-foreground">
                    <Sparkles className="mx-auto mb-2 h-5 w-5 text-purple-500" />
                    AI 다이어리가 생성된 날짜를 클릭하면 상세 내용을 볼 수 있어요
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI 리캡 탭 */}
            <TabsContent value="recap" className="mt-6">
              <div className="mb-6">
                <Link href="/ai-studio/recap">
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 md:w-auto">
                    <Sparkles className="mr-2 h-4 w-4" />
                    전체 리캡 보기
                  </Button>
                </Link>
              </div>

              {AI_RECAPS.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <BookOpen className="mb-4 h-16 w-16 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold text-foreground">아직 생성된 리캡이 없어요</h3>
                  <p className="mb-6 text-sm text-muted-foreground">
                    2달마다 자동으로 생성되는 특별한 순간들의 리캡을 기다려주세요
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {AI_RECAPS.map((recap) => (
                    <Card
                      key={recap.id}
                      className="group cursor-pointer overflow-hidden border-0 shadow-lg transition-all hover:shadow-xl"
                      onClick={() => setSelectedRecap(recap.id)}
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
                      <CardContent className="p-4">
                        <div className="mb-3 flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{recap.createdAt} 생성</span>
                          <span>•</span>
                          <span>{recap.totalMoments}개의 순간</span>
                        </div>
                        <Button variant="ghost" size="sm" className="mt-3 w-full text-primary">
                          리캡 보기
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* 보관함 탭 */}
            <TabsContent value="gallery" className="mt-6">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4 w-full justify-start bg-transparent p-0">
                  <TabsTrigger value="all" className="rounded-full">
                    전체 사진
                    <Badge className="ml-2 bg-pink-100 text-pink-600">{ALL_PHOTOS.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="category" className="rounded-full">
                    카테고리별
                  </TabsTrigger>
                  <TabsTrigger value="diary" className="rounded-full">
                    AI 다이어리
                    <Badge className="ml-2 bg-purple-100 text-purple-600">{AI_DIARIES.length}</Badge>
                  </TabsTrigger>
                </TabsList>

                {/* 전체 사진 */}
                <TabsContent value="all">
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                    {ALL_PHOTOS.map((photo) => (
                      <button
                        key={photo.id}
                        onClick={() => setSelectedPhoto(photo.id)}
                        className="group relative aspect-square overflow-hidden rounded-xl bg-muted transition-all hover:scale-105 hover:shadow-lg"
                      >
                        <img
                          src={photo.url || "/placeholder.svg"}
                          alt="Pet photo"
                          className="h-full w-full object-cover"
                        />
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

                {/* 카테고리별 */}
                <TabsContent value="category">
                  <div className="mb-6 flex flex-wrap gap-2">
                    {CATEGORIES.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className={cn(
                          "rounded-full",
                          selectedCategory === category &&
                            "bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-90",
                        )}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                    {filteredPhotos.map((photo) => (
                      <button
                        key={photo.id}
                        onClick={() => setSelectedPhoto(photo.id)}
                        className="group relative aspect-square overflow-hidden rounded-xl bg-muted transition-all hover:scale-105 hover:shadow-lg"
                      >
                        <img
                          src={photo.url || "/placeholder.svg"}
                          alt="Pet photo"
                          className="h-full w-full object-cover"
                        />
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

                {/* AI 다이어리 */}
                <TabsContent value="diary">
                  <div className="grid gap-6 md:grid-cols-2">
                    {AI_DIARIES.map((diary) => (
                      <div
                        key={diary.id}
                        className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-lg"
                      >
                        <div className="relative aspect-video overflow-hidden">
                          <img
                            src={diary.image || "/placeholder.svg"}
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
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-3 w-full text-primary"
                            onClick={() => setSelectedDiary(diary)}
                          >
                            전체 다이어리 보기
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </div>
      </main>

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

      {/* 리캡 상세 모달 */}
      {selectedRecap && (
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
              <X className="h-6 w-6 text-foreground" />
            </button>

            {(() => {
              const recap = AI_RECAPS.find((r) => r.id === selectedRecap)
              if (!recap) return null

              return (
                <div>
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={recap.coverImage || "/placeholder.svg"}
                      alt={recap.period}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <Badge className="mb-2 bg-purple-500">
                        <Sparkles className="mr-1 h-3 w-3" />
                        AI 리캡
                      </Badge>
                      <h2 className="text-3xl font-bold">{recap.period}</h2>
                      <p className="mt-2 text-sm text-white/90">
                        {recap.createdAt} • {recap.totalMoments}개의 순간
                      </p>
                    </div>
                  </div>
                  <div className="p-6 md:p-8">
                    <div className="prose prose-pink max-w-none">
                      <p className="text-lg leading-relaxed text-foreground">
                        AI가 생성한 {recap.period}의 리캡입니다. 이 기간 동안의 특별한 순간들을 감상해보세요.
                      </p>
                      {/* 추가로 리캡 내용을 표시할 수 있는 공간 */}
                    </div>
                    <div className="mt-8 flex gap-3">
                      <Button variant="outline" className="flex-1 bg-transparent">
                        <Download className="mr-2 h-4 w-4" />
                        다운로드
                      </Button>
                      <Button variant="outline" className="flex-1 bg-transparent">
                        <Share2 className="mr-2 h-4 w-4" />
                        공유하기
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {selectedDiary && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedDiary(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedDiary(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 shadow-lg transition-transform hover:scale-110"
            >
              <X className="h-6 w-6 text-foreground" />
            </button>

            <div className="relative aspect-video overflow-hidden">
              <img
                src={selectedDiary.image || "/placeholder.svg"}
                alt={selectedDiary.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <Badge className="mb-2 bg-purple-500">
                  <Sparkles className="mr-1 h-3 w-3" />
                  AI 다이어리
                </Badge>
                <h2 className="text-3xl font-bold">{selectedDiary.title}</h2>
                <p className="mt-2 text-sm text-white/90">{selectedDiary.date}</p>
              </div>
            </div>
            <div className="p-6 md:p-8">
              <div className="mb-4 flex gap-2">
                <Badge className="bg-blue-100 text-blue-600">{selectedDiary.weather}</Badge>
                <Badge className="bg-pink-100 text-pink-600">{selectedDiary.mood}</Badge>
              </div>
              <div className="prose prose-pink max-w-none">
                <p className="text-lg leading-relaxed text-foreground">{selectedDiary.content}</p>
              </div>
              <div className="mt-8 flex gap-3">
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  다운로드
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Share2 className="mr-2 h-4 w-4" />
                  공유하기
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateDialog && (
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>다이어리 생성</DialogTitle>
              <DialogDescription>작성된 다이어리가 없습니다. 다이어리를 생성하시겠어요?</DialogDescription>
            </DialogHeader>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowCreateDialog(false)}>
                아니오
              </Button>
              <Button className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500" onClick={handleCreateDiary}>
                예
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <TabNavigation />
    </div>
  )
}
