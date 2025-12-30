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
    Share2,
    ChevronLeft,
    ChevronRight,
    Trash2
} from "lucide-react"

import { Button } from "@/shared/ui/button"
import { Card, CardContent } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"

import { RECAPS, Recap } from "@/features/diary/data/recap-data"
import { RecapModal } from "@/features/diary/components/recap-modal"
import { getAllArchivesApi } from "@/features/auth/api/auth-api"
import { getAiDiariesApi, deleteDiary } from "@/features/diary/api/diary-api"
import { useAuth } from "@/features/auth/context/auth-context"

export default function UserDiaryPage() {
    const navigate = useNavigate()
    const location = useLocation()

    // --- State ---
    const [photos, setPhotos] = useState<any[]>([])
    const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null)

    // [NEW] Real Diary State
    const [userDiaries, setUserDiaries] = useState<any[]>([])
    const [selectedDiary, setSelectedDiary] = useState<any | null>(null)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
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

    // [NEW] Fetch AI Diaries Function (moved outside useEffect for reusability)
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
                        images: d.images || [], // ✅ 이미지 배열 추가
                        weather: d.weather,
                        mood: d.mood,
                        content: d.content
                    };
                });
                setUserDiaries(mappedDiaries);
            }
        }
    };

    useEffect(() => {
        fetchArchives()
        fetchDiaries()
    }, [user])

    useEffect(() => {
        if (location.state?.refresh) {
            fetchArchives()
            navigate(location.pathname, { replace: true, state: {} })
        }
    }, [location.state, navigate, location.pathname])

    // [NEW] 다이어리 삭제 핸들러
    const handleDeleteDiary = async (diaryId: number) => {
        if (!window.confirm('이 다이어리를 정말 삭제하시겠습니까?\n삭제된 다이어리는 복구할 수 없습니다.')) {
            return
        }

        try {
            await deleteDiary(diaryId, user?.id ? Number(user.id) : undefined)
            alert('다이어리가 삭제되었습니다.')
            setSelectedDiary(null)
            // 목록 새로고침
            fetchDiaries()
        } catch (error) {
            console.error('삭제 실패:', error)
            alert('다이어리 삭제 중 오류가 발생했습니다.')
        }
    }


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
                                onClick={() => setSelectedPhoto(photo)}
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
                    onClick={() => {
                        setSelectedDiary(null)
                        setCurrentImageIndex(0)
                    }}
                >
                    <div
                        className="relative w-full max-w-4xl overflow-hidden rounded-lg bg-background shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 text-gray-700 hover:bg-white"
                            onClick={() => {
                                setSelectedDiary(null)
                                setCurrentImageIndex(0)
                            }}
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <div className="relative min-h-[400px] max-h-[70vh] bg-gray-100 overflow-hidden flex items-center justify-center">
                            {/* Image Carousel */}
                            <img
                                src={selectedDiary.images?.[currentImageIndex]?.imageUrl || selectedDiary.image}
                                alt={selectedDiary.title}
                                className="w-full h-full object-contain"
                            />

                            {/* Debug: Log images array */}
                            {console.log('[Diary Modal] Images:', selectedDiary.images, 'Length:', selectedDiary.images?.length, 'Show carousel?', selectedDiary.images?.length > 1)}

                            {/* Navigation Arrows - only show if multiple images */}
                            {selectedDiary.images && selectedDiary.images.length > 1 && (
                                <>
                                    <button
                                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors z-20"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setCurrentImageIndex((prev) => (prev - 1 + selectedDiary.images.length) % selectedDiary.images.length)
                                        }}
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors z-20"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setCurrentImageIndex((prev) => (prev + 1) % selectedDiary.images.length)
                                        }}
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>

                                    {/* Dot Indicators */}
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                                        {selectedDiary.images.map((_: any, index: number) => (
                                            <button
                                                key={index}
                                                className={`h-2 w-2 rounded-full transition-all ${index === currentImageIndex
                                                    ? 'bg-white w-6'
                                                    : 'bg-white/50 hover:bg-white/80'
                                                    }`}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setCurrentImageIndex(index)
                                                }}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}

                            <Badge className="absolute left-4 top-4 flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white z-10 text-sm px-3 py-1.5">
                                <Sparkles className="h-4 w-4" />
                                AI 다이어리
                            </Badge>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8 text-white">
                                <h2 className="mb-3 text-4xl font-bold">{selectedDiary.title}</h2>
                                <div className="flex gap-3">
                                    <Badge variant="secondary" className="text-base px-3 py-1">
                                        {selectedDiary.weather}
                                    </Badge>
                                    <Badge variant="secondary" className="text-base px-3 py-1">
                                        {selectedDiary.mood}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <div className="p-8">
                            <p className="mb-8 text-muted-foreground leading-relaxed text-lg">{selectedDiary.content}</p>
                            <div className="flex gap-3">
                                <Button
                                    variant="destructive"
                                    className="text-base h-12"
                                    onClick={() => handleDeleteDiary(selectedDiary.id)}
                                >
                                    <Trash2 className="mr-2 h-5 w-5" />
                                    삭제
                                </Button>
                                <Button className="flex-1 text-base h-12">
                                    <Download className="mr-2 h-5 w-5" />
                                    다운로드
                                </Button>
                                <Button variant="outline" className="flex-1 text-base h-12">
                                    <Share2 className="mr-2 h-5 w-5" />
                                    공유하기
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Photo Gallery Modal */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div
                        className="relative w-full max-w-4xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute right-4 top-4 z-30 rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition-colors"
                            onClick={() => setSelectedPhoto(null)}
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <div className="relative w-full aspect-square max-h-[80vh] overflow-hidden rounded-lg">
                            <img
                                src={selectedPhoto.url}
                                alt={`Photo ${selectedPhoto.id}`}
                                className="w-full h-full object-contain"
                            />

                            {/* 향후 여러 이미지 지원을 위한 준비 */}
                            {/* Navigation arrows would go here when photos have multiple images */}

                            <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white">
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="flex items-center gap-2">
                                        <Heart className="h-4 w-4" />
                                        {selectedPhoto.likes}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <MessageCircle className="h-4 w-4" />
                                        {selectedPhoto.comments}
                                    </span>
                                </div>
                                <div className="text-xs text-white/80">
                                    {selectedPhoto.date} · {selectedPhoto.category}
                                </div>
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
