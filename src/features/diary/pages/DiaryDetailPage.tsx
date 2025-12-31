import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
    Sparkles,
    Download,
    Share2,
    Trash2,
    ArrowLeft,
    Palette
} from "lucide-react"

import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { getDiary, deleteDiary, getMyStyleApi } from "@/features/diary/api/diary-api"
import { useAuth } from "@/features/auth/context/auth-context"
import DiaryPreview from "@/features/diary/components/DiaryPreview"

export default function DiaryDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [diary, setDiary] = useState<any | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Style settings
    const [styleSettings, setStyleSettings] = useState<any>(null)

    useEffect(() => {
        const fetchDiaryDetail = async () => {
            if (!id) return

            try {
                setIsLoading(true)
                console.log("=== 📖 다이어리 상세 정보 로드 시작 ===")
                console.log("Diary ID:", id)

                const data = await getDiary(Number(id))
                console.log("✅ 다이어리 데이터 로드 성공:", data)
                setDiary(data)

                // Use style from diary response if available
                if (data.style) {
                    console.log("🎨 [다이어리 응답에서 스타일 발견]")
                    console.log("스타일 상세:", {
                        galleryType: data.style.galleryType,
                        textAlignment: data.style.textAlignment,
                        fontSize: data.style.fontSize,
                        backgroundColor: data.style.backgroundColor,
                        sizeOption: data.style.sizeOption,
                        themeStyle: data.style.themeStyle,
                        preset: data.style.preset
                    })
                    setStyleSettings(data.style)
                } else if (user?.id && data.petId) {
                    console.log("⚠️ 다이어리 응답에 스타일 없음 → 펫 기본 스타일 조회 시도")
                    console.log("User ID:", user.id, "Pet ID:", data.petId)
                    // Fallback: get default style for this pet
                    try {
                        const styleData = await getMyStyleApi(Number(user.id), data.petId)
                        console.log("✅ 펫 기본 스타일 로드 성공:", styleData)
                        setStyleSettings(styleData)
                    } catch (styleError) {
                        console.warn("❌ 스타일 로드 실패 - 기본값 사용:", styleError)
                    }
                } else {
                    console.log("ℹ️ 스타일 정보 없음 - 기본 스타일 적용")
                }

                console.log("=== 다이어리 로드 완료 ===")
            } catch (error) {
                console.error('❌ Failed to fetch diary:', error)
                alert('다이어리를 불러오는데 실패했습니다.')
                navigate(-1)
            } finally {
                setIsLoading(false)
            }
        }

        fetchDiaryDetail()
    }, [id, navigate, user])

    const handleDelete = async () => {
        if (!diary || !window.confirm('이 다이어리를 정말 삭제하시겠습니까?\\n삭제된 다이어리는 복구할 수 없습니다.')) {
            return
        }

        try {
            await deleteDiary(diary.diaryId, user?.id ? Number(user.id) : undefined)
            alert('다이어리가 삭제되었습니다.')
            navigate(-1)
        } catch (error) {
            console.error('삭제 실패:', error)
            alert('다이어리 삭제 중 오류가 발생했습니다.')
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">로딩 중...</p>
                </div>
            </div>
        )
    }

    if (!diary) {
        return null
    }

    // Prepare images for preview
    const selectedImages = diary.images || diary.imageUrls?.map((url: string) => ({ imageUrl: url })) || []

    return (
        <div className="min-h-screen bg-background">
            {/* Header with Back Button */}
            <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                <div className="container flex h-16 items-center justify-between px-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        뒤로가기
                    </Button>
                    <Badge className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        <Sparkles className="h-3 w-3" />
                        AI 다이어리
                    </Badge>
                </div>
            </div>

            {/* Content with DiaryPreview Component */}
            <div className="container max-w-4xl mx-auto px-4 py-8">
                <DiaryPreview
                    title={diary.title || "무제"}
                    selectedImages={selectedImages}
                    editedDiary={diary.content}
                    weather={diary.weather}
                    mood={diary.mood}
                    locationName={diary.locationName}
                    locationCoords={diary.latitude && diary.longitude ? { lat: diary.latitude, lng: diary.longitude } : null}
                    selectedDate={diary.date}
                    layoutStyle={styleSettings?.galleryType || "grid"}
                    textAlign={styleSettings?.textAlignment || "left"}
                    fontSize={styleSettings?.fontSize || 16}
                    backgroundColor={styleSettings?.backgroundColor || "#ffffff"}
                    sizeOption={styleSettings?.sizeOption || "medium"}
                    themeStyle={styleSettings?.themeStyle || "basic"}
                    preset={styleSettings?.preset || null}
                />

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 border-t pt-6">
                    <Button
                        variant="outline"
                        className="text-base h-12"
                        onClick={() => navigate(`/diary/${id}/style`)}
                    >
                        <Palette className="mr-2 h-5 w-5" />
                        스타일 편집
                    </Button>
                    <Button
                        variant="destructive"
                        className="text-base h-12"
                        onClick={handleDelete}
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
    )
}
