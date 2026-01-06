import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Badge } from "@/shared/ui/badge"
import { ArrowLeft, Sparkles, Calendar, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { RecapDetailResponse } from "@/features/diary/types/recap"
import { getRecapDetailApi } from "@/features/diary/api/diary-api"

export default function RecapDetailPage() {
    const { recapId } = useParams<{ recapId: string }>()
    const navigate = useNavigate()
    const [recap, setRecap] = useState<RecapDetailResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    useEffect(() => {
        const fetchRecapDetail = async () => {
            if (!recapId) {
                setError('리캡 ID가 없습니다.')
                setLoading(false)
                return
            }

            // Check if user is logged in
            const userStr = localStorage.getItem('petlog_user')
            const userId = userStr ? JSON.parse(userStr).id : null
            if (!userId || userId === '0') {
                setError('로그인이 필요합니다.')
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                setError(null)
                const data = await getRecapDetailApi(parseInt(recapId))
                setRecap(data)
            } catch (err) {
                console.error('Failed to fetch recap detail:', err)
                setError('리캡 정보를 불러오는데 실패했습니다.')
            } finally {
                setLoading(false)
            }
        }

        fetchRecapDetail()
    }, [recapId])

    const nextImage = () => {
        if (recap && recap.imageUrls.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % recap.imageUrls.length)
        }
    }

    const prevImage = () => {
        if (recap && recap.imageUrls.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + recap.imageUrls.length) % recap.imageUrls.length)
        }
    }

    const formatDate = (dateStr: string) => dateStr.replace(/-/g, '.')

    const formatPeriod = (start: string, end: string) => {
        const startDate = new Date(start)
        const endDate = new Date(end)

        const startYear = startDate.getFullYear()
        const endYear = endDate.getFullYear()
        const startMonth = startDate.getMonth() + 1
        const endMonth = endDate.getMonth() + 1

        if (startYear === endYear && startMonth === endMonth) {
            return `${startYear}년 ${startMonth}월`
        }

        if (startYear === endYear) {
            return `${startYear}년 ${startMonth}월 ~ ${endMonth}월`
        }

        return `${startYear}년 ${startMonth}월 ~ ${endYear}년 ${endMonth}월`
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-purple-50 to-pink-50">
                <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
            </div>
        )
    }

    if (error || !recap) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-4">
                <div className="mx-auto max-w-4xl pt-20 text-center">
                    <Calendar className="mx-auto mb-4 h-16 w-16 text-red-400" />
                    <h2 className="mb-2 text-2xl font-bold text-red-600">오류</h2>
                    <p className="text-muted-foreground">{error || '리캡을 찾을 수 없습니다.'}</p>
                    <button
                        onClick={() => navigate('/ai-recap')}
                        className="mt-6 rounded-lg bg-purple-600 px-6 py-2 text-white hover:bg-purple-700"
                    >
                        목록으로 돌아가기
                    </button>
                </div>
            </div>
        )
    }

    const images = recap.imageUrls || []
    const hasMultipleImages = images.length > 1

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 pb-6">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-purple-100 bg-white/95 backdrop-blur-sm">
                <div className="container mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <h1 className="text-lg font-bold text-purple-600 md:text-xl">AI 리캡</h1>
                    <div className="w-6" />
                </div>
            </header>

            <main className="container mx-auto max-w-4xl px-4 py-6">
                {/* Image Carousel Section */}
                <div className="mb-6 overflow-hidden rounded-2xl shadow-2xl">
                    <div className="relative aspect-video overflow-hidden bg-gray-900">
                        {images.length > 0 ? (
                            <>
                                <img
                                    src={images[currentImageIndex]}
                                    alt={`${recap.title} - ${currentImageIndex + 1}`}
                                    className="h-full w-full object-cover"
                                />
                                {hasMultipleImages && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg transition-transform hover:scale-110"
                                        >
                                            <ChevronLeft className="h-6 w-6" />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg transition-transform hover:scale-110"
                                        >
                                            <ChevronRight className="h-6 w-6" />
                                        </button>
                                        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                                            {images.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setCurrentImageIndex(index)}
                                                    className={`h-2 w-2 rounded-full transition-all ${index === currentImageIndex
                                                        ? 'w-4 bg-white'
                                                        : 'bg-white/50 hover:bg-white/75'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                                <Sparkles className="h-16 w-16 text-purple-400" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-6 left-6 text-white">
                            <Badge className="mb-2 bg-purple-500">
                                <Sparkles className="mr-1 h-3 w-3" />
                                AI 리캡
                            </Badge>
                            <h2 className="text-3xl font-bold md:text-4xl">{recap.title}</h2>
                            <p className="mt-2 text-sm text-white/90 md:text-base">
                                {formatPeriod(recap.periodStart, recap.periodEnd)} • {recap.momentCount}개의 순간
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="rounded-2xl bg-white p-6 shadow-lg md:p-8">
                    <div className="prose prose-purple max-w-none">
                        <h3 className="text-2xl font-bold text-purple-600">{recap.title}</h3>

                        <p className="mt-4 text-lg leading-relaxed text-foreground">
                            {recap.summary}
                        </p>

                        {recap.highlights && recap.highlights.length > 0 && (
                            <>
                                <h4 className="mt-8 text-xl font-bold text-purple-600">하이라이트</h4>
                                <div className="space-y-4">
                                    {recap.highlights.map((highlight, index) => (
                                        <div
                                            key={index}
                                            className="rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 p-4"
                                        >
                                            <h5 className="mb-2 font-bold text-purple-700">{highlight.title}</h5>
                                            <p className="text-gray-700">{highlight.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        <div className="mt-8 rounded-2xl bg-gradient-to-r from-purple-100 to-pink-100 p-6">
                            <p className="text-center text-lg font-semibold text-purple-600">
                                "매 순간이 소중한 추억이 되었습니다 💕"
                            </p>
                        </div>

                        <p className="mt-6 text-sm text-gray-500">
                            기간: {formatDate(recap.periodStart)} ~ {formatDate(recap.periodEnd)}
                        </p>
                        <p className="text-sm text-gray-500">
                            생성일: {formatDate(recap.createdAt.split('T')[0])}
                        </p>
                    </div>

                    <div className="mt-8 rounded-2xl bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 p-6 text-center">
                        <p className="text-3xl font-bold text-purple-600">+30</p>
                        <p className="text-sm text-muted-foreground">펫코인 적립됨</p>
                    </div>
                </div>
            </main>
        </div>
    )
}
