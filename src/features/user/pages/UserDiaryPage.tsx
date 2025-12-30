import { useState, useEffect } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import {

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

import { RECAPS, Recap } from "@/features/diary/data/recap-data"
import { RecapModal } from "@/features/diary/components/recap-modal"
import { getAllArchivesApi } from "@/features/auth/api/auth-api"
import { getAiDiariesApi } from "@/features/diary/api/diary-api"
import { useAuth } from "@/features/auth/context/auth-context"

export default function UserDiaryPage() {
    const navigate = useNavigate()
    const location = useLocation()

    // --- State ---
    const [photos, setPhotos] = useState<any[]>([])
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

    // [NEW] Real Diary State
    const [userDiaries, setUserDiaries] = useState<any[]>([])
    const [selectedDiary, setSelectedDiary] = useState<any | null>(null)
    const { user } = useAuth()

    const [selectedRecap, setSelectedRecap] = useState<Recap | null>(null)

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

        // [NEW] Fetch Real AI Diaries
        const fetchDiaries = async () => {
            if (user?.id) {
                const res = await getAiDiariesApi(Number(user.id));
                // Mapping logic
                console.log("[UserDiaryPage] Raw API Response:", res); // [DEBUG] Check API structure

                if (Array.isArray(res)) {
                    const mappedDiaries = res.map((d: any) => {
                        // Check multiple possible fields for images
                        let firstImage = null;

                        // Case 1: imageUrls (string[])
                        if (d.imageUrls && d.imageUrls.length > 0) {
                            firstImage = d.imageUrls[0];
                        }
                        // Case 2: images (object[] with imageUrl or string[])
                        else if (d.images && d.images.length > 0) {
                            if (typeof d.images[0] === 'string') {
                                firstImage = d.images[0];
                            } else if (d.images[0].imageUrl) {
                                firstImage = d.images[0].imageUrl;
                            }
                        }

                        return {
                            id: d.diaryId,
                            title: d.title || "무제",
                            date: d.date,
                            // Use found image or placeholder
                            image: firstImage || "/placeholder-diary.jpg",
                            weather: d.weather,
                            mood: d.mood,
                            content: d.content
                        };
                    });
                    setUserDiaries(mappedDiaries);
                }
            }
        };
        fetchDiaries();
    }, [user])

    useEffect(() => {
        if (location.state?.refresh) {
            fetchArchives()
            navigate(location.pathname, { replace: true, state: {} })
        }
    }, [location.state, navigate, location.pathname])


    // --- Helpers ---


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
                    <div className="mb-4 flex justify-end">
                        <Button onClick={() => navigate('/ai-studio/diary')} size="sm" className="gap-1">
                            <Plus className="h-4 w-4" />
                            다이어리 쓰기
                        </Button>
                    </div>
                    {/* [MODIFIED] Vertical Grid Layout with internal scroll after 16 items */}
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 max-h-[900px] overflow-y-auto">
                        {userDiaries.length === 0 ? (
                            <div className="col-span-full py-10 text-center text-gray-400">
                                아직 작성된 AI 다이어리가 없습니다.
                            </div>
                        ) : (
                            userDiaries.map((diary) => (
                                <div
                                    key={diary.id}
                                    className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border-0 shadow-md hover:shadow-xl transition-all"
                                    onClick={() => setSelectedDiary(diary)}
                                >
                                    <img
                                        src={diary.image}
                                        alt={diary.title}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/e2e8f0/94a3b8?text=No+Image';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                    <div className="absolute bottom-2 left-2 right-2 text-white">
                                        <h3 className="text-sm font-bold truncate mb-0.5">{diary.title}</h3>
                                        <p className="text-[10px] opacity-90 font-light">{diary.date}</p>
                                    </div>

                                    <Badge className="absolute right-2 top-2 flex items-center gap-1 bg-white/20 backdrop-blur-md text-white border-0 text-[10px] px-2 py-0.5">
                                        <Sparkles className="h-2 w-2" />
                                        AI
                                    </Badge>
                                </div>
                            ))
                        )}
                    </div>
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

        </>
    )
}
