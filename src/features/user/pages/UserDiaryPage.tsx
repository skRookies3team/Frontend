import { useState, useEffect } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import {
    ChevronLeft,
    ChevronRight,
    Sparkles,
    CalendarIcon,
    BookOpen,
    ImageIcon,
    ArrowRight,
    Plus,
    Heart,
    MessageCircle,
    X,
    Download,
    Share2
} from "lucide-react"

import { Button } from "@/shared/ui/button"
import { Card, CardContent } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog"
import { cn } from "@/shared/lib/utils"

import { AI_DIARIES } from "@/features/healthcare/data/pet-data"
import { RECAPS, Recap } from "@/features/diary/data/recap-data"
import { RecapModal } from "@/features/diary/components/recap-modal"
import { getAllArchivesApi } from "@/features/auth/api/auth-api"

export default function UserDiaryPage() {
    const navigate = useNavigate()
    const location = useLocation()

    // --- State ---
    const [photos, setPhotos] = useState<any[]>([])
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDiary, setSelectedDiary] = useState<(typeof AI_DIARIES)[0] | null>(null)

    const [selectedRecap, setSelectedRecap] = useState<Recap | null>(null)

    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [dialogDate, setDialogDate] = useState<string>("")

    // --- Effects ---
    const fetchArchives = async () => {
        try {
            const response = await getAllArchivesApi()
            const mappedPhotos = response.archives.map((archive: any) => ({
                id: archive.archiveId.toString(),
                url: archive.url,
                category: "일상",
                date: archive.uploadTime?.split('T')[0]?.replace(/-/g, '.') || new Date().toISOString().split('T')[0].replace(/-/g, '.'),
                likes: 0,
                comments: 0
            }))
            setPhotos(mappedPhotos)
        } catch (error) {
            console.error("Failed to fetch archives:", error)
        }
    }

    useEffect(() => {
        fetchArchives()
    }, [])

    useEffect(() => {
        if (location.state?.refresh) {
            fetchArchives()
            navigate(location.pathname, { replace: true, state: {} })
        }
    }, [location.state, navigate, location.pathname])


    // --- Helpers ---
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

    // --- Handlers ---
    const handlePrevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
    const handleNextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

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
        navigate(`/ai-studio/diary?date=${dialogDate}`)
        setShowCreateDialog(false)
    }

    return (
        <>
            <Tabs defaultValue="calendar" className="w-full">
                <TabsList className="grid w-full grid-cols-3 rounded-none border-b bg-transparent p-0">
                    <TabsTrigger
                        value="calendar"
                        className="rounded-none border-b-2 border-transparent px-2 py-3 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                        <CalendarIcon className="mr-1 h-4 w-4" />
                        AI 다이어리
                    </TabsTrigger>
                    <TabsTrigger
                        value="recap"
                        className="rounded-none border-b-2 border-transparent px-2 py-3 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                        <BookOpen className="mr-1 h-4 w-4" />
                        AI 리캡
                    </TabsTrigger>
                    <TabsTrigger
                        value="gallery"
                        className="rounded-none border-b-2 border-transparent px-2 py-3 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                        <ImageIcon className="mr-1 h-4 w-4" />
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
                                            className={cn(
                                                "relative aspect-square overflow-hidden rounded-lg border-2 p-1 transition-all hover:scale-105",
                                                isToday
                                                    ? "border-primary bg-primary/10 font-bold"
                                                    : diary
                                                        ? "border-primary/50 bg-primary/5"
                                                        : "border-muted hover:border-primary/30 hover:bg-muted"
                                            )}
                                        >
                                            {diary && (
                                                <div
                                                    className="absolute inset-0 bg-cover bg-center transition-transform hover:scale-110"
                                                    style={{ backgroundImage: `url(${diary.image})` }}
                                                >
                                                    <div className="absolute inset-0 bg-black/20" />
                                                </div>
                                            )}
                                            <div className="relative z-10 flex h-full flex-col items-center justify-center">
                                                <span className={cn(
                                                    "text-sm",
                                                    diary && "font-bold text-white drop-shadow-md"
                                                )}>{day}</span>
                                                {diary && (
                                                    <Badge className="mt-1 flex h-4 items-center gap-0.5 rounded-full bg-primary/80 backdrop-blur-sm px-1 text-[8px] text-white shadow-sm">
                                                        <Sparkles className="h-2.5 w-2.5" />
                                                    </Badge>
                                                )}
                                            </div>
                                            {isToday && (
                                                <Sparkles className="absolute right-1 top-1 h-3 w-3 text-primary z-20" />
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* AI 리캡 탭 */}
                <TabsContent value="recap" className="mt-6">
                    <Link to="/ai-studio/recap">
                        <Button
                            variant="outline"
                            className="group mb-6 w-full border-primary bg-white text-primary transition-all duration-300 hover:bg-primary/5"
                        >
                            <span className="flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                                AI 리캡 스튜디오로 이동
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </span>
                        </Button>
                    </Link>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {RECAPS.map((recap) => (
                            <Card
                                key={recap.id}
                                className="group cursor-pointer overflow-hidden border-0 shadow-md transition-all hover:scale-105 hover:shadow-xl"
                                onClick={() => setSelectedRecap(recap)}
                            >
                                <div className="relative aspect-video overflow-hidden">
                                    <img
                                        src={recap.coverImage}
                                        alt={recap.period}
                                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/10" />
                                    <Badge className="absolute right-2 top-2 bg-black/50 text-white backdrop-blur-sm">
                                        {recap.year}
                                    </Badge>
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="mb-1 text-lg font-bold">{recap.period} 리캡</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {recap.totalMoments}개의 소중한 순간들
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* 사진 보관함 탭 */}
                <TabsContent value="gallery" className="mt-6">
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="all" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary">
                                사진 <Badge className="ml-1.5 bg-muted text-muted-foreground">{photos.length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="diary" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary">
                                다이어리 <Badge className="ml-1.5 bg-muted text-muted-foreground">{AI_DIARIES.length}</Badge>
                            </TabsTrigger>
                        </TabsList>

                        {/* 전체 탭 */}
                        <TabsContent value="all">
                            <div className="mb-4 flex justify-end">
                                <Button onClick={() => navigate('/photo/upload')} size="sm" className="gap-1">
                                    <Plus className="h-4 w-4" />
                                    사진 업로드
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                                {photos.map((photo) => (
                                    <div
                                        key={photo.id}
                                        className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg"
                                        onClick={() => setSelectedPhoto(photo.url)}
                                    >
                                        <img
                                            src={photo.url}
                                            alt={`Photo ${photo.id}`}
                                            className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                                            <div className="absolute bottom-2 left-2 right-2 text-white">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="flex items-center gap-1">
                                                        <Heart className="h-3 w-3" />
                                                        {photo.likes}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MessageCircle className="h-3 w-3" />
                                                        {photo.comments}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge className="absolute right-1 top-1 text-[10px]">{photo.category}</Badge>
                                        <span className="absolute bottom-1 left-1 text-[10px] font-semibold text-white drop-shadow-md">
                                            {photo.date}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        {/* 다이어리 탭 */}
                        <TabsContent value="diary">
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                                {AI_DIARIES.map((diary) => (
                                    <div
                                        key={diary.id}
                                        className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg"
                                        onClick={() => setSelectedDiary(diary)}
                                    >
                                        <img
                                            src={diary.image}
                                            alt={diary.title}
                                            className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                                            <div className="absolute bottom-2 left-2 right-2 text-white">
                                                <h3 className="text-sm font-bold truncate">{diary.title}</h3>
                                                <p className="text-xs opacity-90">{diary.date}</p>
                                            </div>
                                        </div>
                                        <Badge className="absolute right-1 top-1 flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-[10px] text-white px-1.5 py-0.5">
                                            <Sparkles className="h-2 w-2" />
                                            AI
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </TabsContent>
            </Tabs>

            {/* Diary Modal */}
            {selectedDiary && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm p-4"
                    onClick={() => setSelectedDiary(null)}
                >
                    <div
                        className="relative w-full max-w-2xl overflow-hidden rounded-lg bg-background shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 text-gray-700 hover:bg-white"
                            onClick={() => setSelectedDiary(null)}
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <div className="relative h-64 overflow-hidden">
                            <img src={selectedDiary.image} alt={selectedDiary.title} className="h-full w-full object-cover" />
                            <Badge className="absolute left-4 top-4 flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                <Sparkles className="h-3 w-3" />
                                AI 다이어리
                            </Badge>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                                <h2 className="mb-2 text-2xl font-bold">{selectedDiary.title}</h2>
                                <div className="flex gap-2">
                                    <Badge variant="secondary" className="text-xs">
                                        {selectedDiary.weather}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                        {selectedDiary.mood}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="mb-6 text-muted-foreground leading-relaxed">{selectedDiary.content}</p>
                            <div className="flex gap-2">
                                <Button className="flex-1">
                                    <Download className="mr-2 h-4 w-4" />
                                    다운로드
                                </Button>
                                <Button variant="outline" className="flex-1">
                                    <Share2 className="mr-2 h-4 w-4" />
                                    공유하기
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recap Modal */}
            {selectedRecap && (
                <RecapModal recap={selectedRecap} onClose={() => setSelectedRecap(null)} />
            )}

            {/* Create Diary Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>AI 다이어리 생성</DialogTitle>
                        <DialogDescription>이 날짜에 새로운 AI 다이어리를 생성하시겠습니까?</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Button variant="outline" className="w-full" onClick={() => setShowCreateDialog(false)}>
                            취소
                        </Button>
                        <Button className="mt-2 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white" onClick={handleCreateDiary}>
                            <Sparkles className="mr-2 h-4 w-4" />
                            다이어리 생성하기
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
