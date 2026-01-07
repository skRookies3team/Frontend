import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Badge } from "@/shared/ui/badge"
import { ArrowLeft, Sparkles, Calendar, ChevronLeft, ChevronRight, Loader2, Wand2, Star, BookOpen, Heart } from "lucide-react"
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
            <div className="flex min-h-screen items-center justify-center bg-[#fff9db]">
                <div className="bg-white/50 p-6 rounded-full shadow-sm animate-spin">
                    <Loader2 className="h-10 w-10 text-yellow-500" />
                </div>
            </div>
        )
    }

    if (error || !recap) {
        return (
            <div className="min-h-screen bg-[#fff9db] p-4 flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-[2rem] p-8 text-center shadow-xl border-4 border-white">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="h-8 w-8 text-red-400" />
                    </div>
                    <h2 className="mb-2 text-2xl font-['Jua'] font-bold text-red-500">오류 발생!</h2>
                    <p className="text-gray-500 font-medium mb-6">{error || '리캡을 찾을 수 없습니다.'}</p>
                    <button
                        onClick={() => navigate('/ai-studio/recap')}
                        className="w-full rounded-xl bg-amber-500 px-6 py-3 text-white font-bold shadow-md hover:bg-amber-600 transition-colors"
                    >
                        목록으로 돌아가기
                    </button>
                </div>
            </div>
        )
    }

    const images = recap.imageUrls || []
    // 7장 이상일 때만 캐러셀 모드 사용, 그 외에는 콜라주 모드
    const isCarouselMode = images.length >= 7

    return (
        <div className="min-h-screen pb-20 font-sans text-gray-800" style={{ backgroundColor: '#fff9db' }}>
            {/* Header */}
            <header className="sticky top-0 z-40 border-b-2 border-dashed border-yellow-200 bg-white/90 backdrop-blur-md shadow-[0_4px_20px_rgba(255,220,100,0.1)]">
                <div className="container mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="rounded-full p-2 hover:bg-yellow-50 text-amber-400 hover:text-amber-600 transition-colors"
                    >
                        <ArrowLeft className="h-7 w-7" />
                    </button>
                    <h1 className="text-xl font-bold text-amber-500 font-['Jua'] flex items-center gap-2">
                        <Wand2 className="h-5 w-5" />
                        AI 리캡 상세
                    </h1>
                    <div className="w-10" />
                </div>
            </header>

            <main className="container mx-auto max-w-5xl px-4 py-8 text-left">

                {/* 1. Carousel Mode View (>= 7 Images) */}
                {isCarouselMode && (
                    <div className="mb-8 relative mx-auto max-w-4xl transform rotate-1 transition-transform hover:rotate-0 duration-500">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-40 h-8 bg-yellow-200/50 backdrop-blur-sm -rotate-1 z-10"></div>

                        <div className="overflow-hidden rounded-[2rem] border-[6px] border-white shadow-[0_10px_30px_rgba(0,0,0,0.1)] bg-white">
                            <div className="relative aspect-video overflow-hidden bg-gray-100">
                                {images.length > 0 ? (
                                    <>
                                        <img
                                            src={images[currentImageIndex]}
                                            alt={`${recap.title} - ${currentImageIndex + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/40 backdrop-blur-md p-3 shadow-lg transition-transform hover:scale-110 hover:bg-white/80"
                                        >
                                            <ChevronLeft className="h-6 w-6 text-gray-800" />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/40 backdrop-blur-md p-3 shadow-lg transition-transform hover:scale-110 hover:bg-white/80"
                                        >
                                            <ChevronRight className="h-6 w-6 text-gray-800" />
                                        </button>
                                        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 bg-black/20 p-2 rounded-full backdrop-blur-sm">
                                            {images.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setCurrentImageIndex(index)}
                                                    className={`h-2.5 w-2.5 rounded-full transition-all ${index === currentImageIndex
                                                        ? 'w-6 bg-white'
                                                        : 'bg-white/50 hover:bg-white/80'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-yellow-50">
                                        <Sparkles className="h-16 w-16 text-yellow-300" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-amber-900/70 via-transparent to-transparent" />
                                <div className="absolute bottom-8 left-8 text-white">
                                    <Badge className="mb-3 bg-white/20 backdrop-blur-md text-white border border-white/30 px-3 py-1 hover:bg-white/30">
                                        <Sparkles className="mr-1 h-3 w-3 text-yellow-300" />
                                        AI 리캡
                                    </Badge>
                                    <h2 className="text-3xl font-bold md:text-5xl font-['Jua'] drop-shadow-lg">{recap.title}</h2>
                                    <p className="mt-2 text-amber-100 md:text-lg font-medium">
                                        {formatPeriod(recap.periodStart, recap.periodEnd)} • {recap.momentCount}개의 특별한 순간
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content Section - Stationery/Notebook Style */}
                <div className="relative mx-auto max-w-5xl">
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-orange-400 rounded-full opacity-10 animate-pulse"></div>
                    <div className="absolute top-20 -left-6 w-12 h-12 bg-yellow-400 rounded-full opacity-10"></div>

                    <div className="rounded-[2.5rem] bg-white p-6 md:p-10 shadow-[8px_8px_0px_rgba(255,220,100,0.2)] border-2 border-yellow-50 relative z-10 min-h-[600px]">
                        <div className="prose prose-amber max-w-none relative">

                            {/* 2. Collage Mode Header (Instead of Carousel) */}
                            {!isCarouselMode && (
                                <div className="mb-10 text-center border-b-2 border-dashed border-yellow-100 pb-8">
                                    <Badge className="mb-3 bg-yellow-100 text-amber-600 border-none px-3 py-1 hover:bg-yellow-200">
                                        <Sparkles className="mr-1 h-3 w-3" /> AI 리캡
                                    </Badge>
                                    <h1 className="text-4xl md:text-5xl font-bold text-amber-600 font-['Jua'] mb-3 drop-shadow-sm">{recap.title}</h1>
                                    <p className="text-gray-400 font-medium">
                                        {formatPeriod(recap.periodStart, recap.periodEnd)} • {recap.momentCount}개의 특별한 순간
                                    </p>
                                </div>
                            )}

                            {/* Main Content with Floated Images (Collage Effect) */}
                            <div className="relative mb-12">
                                {/* Image 1: Summary - Absolute on Desktop, Float on Mobile */}
                                {!isCarouselMode && images[0] && (
                                    <div className="float-right w-[40%] ml-4 mb-4 md:float-none md:absolute md:-right-64 md:-top-10 md:w-64 md:rotate-6 z-10 transition-transform hover:scale-105 duration-300">
                                        <div className="bg-white p-2 md:p-3 rounded-2xl shadow-xl border border-gray-100/50">
                                            <div className="aspect-[4/5] rounded-xl overflow-hidden">
                                                <img src={images[0]} alt="Moment 1" className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-yellow-200/40 -rotate-3 backdrop-blur-sm shadow-sm md:block hidden"></div>
                                    </div>
                                )}

                                {isCarouselMode && (
                                    <div className="flex items-center gap-3 mb-6 border-b-2 border-dashed border-yellow-100 pb-4">
                                        <BookOpen className="w-8 h-8 text-amber-400" />
                                        <h3 className="text-3xl font-bold text-amber-600 font-['Jua'] m-0">{recap.title}</h3>
                                    </div>
                                )}

                                <p className="text-xl leading-relaxed text-gray-700 font-medium whitespace-pre-wrap">
                                    {recap.summary}
                                </p>
                                <div className="clear-both md:clear-none"></div>
                            </div>

                            {recap.highlights && recap.highlights.length > 0 && (
                                <div className="mt-16 relative">
                                    {/* Image 2: Highlights Header - Absolute on Desktop */}
                                    {!isCarouselMode && images[1] && (
                                        <div className="float-left w-[40%] mr-4 mb-4 md:float-none md:absolute md:-left-64 md:-top-12 md:w-60 md:-rotate-3 z-10 transition-transform hover:scale-105 duration-300">
                                            <div className="bg-white p-2 md:p-3 rounded-2xl shadow-xl border border-gray-100/50">
                                                <div className="aspect-square rounded-xl overflow-hidden">
                                                    <img src={images[1]} alt="Moment 2" className="w-full h-full object-cover" />
                                                </div>
                                            </div>
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-orange-200/40 rotate-2 backdrop-blur-sm shadow-sm md:block hidden"></div>
                                        </div>
                                    )}

                                    <h4 className="flex items-center gap-2 text-2xl font-bold text-amber-600 font-['Jua'] mb-8 clear-none relative z-0 pl-2">
                                        <Star className="w-6 h-6 text-yellow-500 fill-yellow-400" />
                                        이달의 하이라이트
                                    </h4>

                                    <div className="space-y-6">
                                        {recap.highlights.map((highlight, index) => (
                                            <div key={index} className="relative group">
                                                {/* Image 3 (Index 0): Right Side - EXTRA LARGE */}
                                                {!isCarouselMode && index === 0 && images[2] && (
                                                    <div className="float-right w-[35%] ml-4 mb-2 md:float-none md:absolute md:-right-72 md:-top-8 md:w-72 md:rotate-3 z-10 hover:z-20 transition-transform hover:scale-105 duration-300">
                                                        <div className="bg-white p-2 md:p-3 rounded-2xl shadow-xl border border-gray-100/50">
                                                            <div className="aspect-square rounded-xl overflow-hidden">
                                                                <img src={images[2]} alt="Moment 3" className="w-full h-full object-cover" />
                                                            </div>
                                                        </div>
                                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-green-200/40 -rotate-2 backdrop-blur-sm md:block hidden"></div>
                                                    </div>
                                                )}

                                                {/* Image 4 (Index 1): Left Side - MEDIUM */}
                                                {!isCarouselMode && index === 1 && images[3] && (
                                                    <div className="float-left w-[30%] mr-4 mb-2 md:float-none md:absolute md:-left-64 md:top-4 md:w-60 md:-rotate-6 z-10 hover:z-20 transition-transform hover:scale-105 duration-300">
                                                        <div className="bg-white p-2 md:p-3 rounded-2xl shadow-xl border border-gray-100/50">
                                                            <div className="aspect-square rounded-xl overflow-hidden">
                                                                <img src={images[3]} alt="Moment 4" className="w-full h-full object-cover" />
                                                            </div>
                                                        </div>
                                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-pink-200/40 rotate-3 backdrop-blur-sm md:block hidden"></div>
                                                    </div>
                                                )}

                                                {/* Image 5 (Index 2): Right Side - SMALLER */}
                                                {!isCarouselMode && index === 2 && images[4] && (
                                                    <div className="float-right w-[30%] ml-4 mb-2 md:float-none md:absolute md:-right-60 md:top-8 md:w-56 md:rotate-1 z-10 hover:z-20 transition-transform hover:scale-105 duration-300">
                                                        <div className="bg-white p-2 md:p-3 rounded-2xl shadow-xl border border-gray-100/50">
                                                            <div className="aspect-square rounded-xl overflow-hidden">
                                                                <img src={images[4]} alt="Moment 5" className="w-full h-full object-cover" />
                                                            </div>
                                                        </div>
                                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-blue-200/40 -rotate-1 backdrop-blur-sm md:block hidden"></div>
                                                    </div>
                                                )}

                                                <div
                                                    className="rounded-2xl border-2 border-yellow-100 bg-[#fffbe6] p-6 hover:bg-yellow-50 transition-colors relative z-0"
                                                >
                                                    <h5 className="mb-2 text-lg font-bold text-amber-600 font-['Jua'] flex items-center gap-2">
                                                        <span className="w-6 h-6 rounded-full bg-yellow-200 flex items-center justify-center text-sm text-yellow-700">{index + 1}</span>
                                                        {highlight.title}
                                                    </h5>
                                                    <p className="text-gray-600 pl-8 leading-relaxed font-medium">{highlight.content}</p>
                                                </div>
                                                <div className="clear-both md:clear-none"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-10 rounded-2xl bg-gradient-to-r from-yellow-100 to-orange-50 p-6 text-center border border-yellow-100 clear-both">
                                <p className="text-lg font-bold text-amber-600 font-['Jua'] flex items-center justify-center gap-2">
                                    <Heart className="w-5 h-5 text-red-400 fill-red-400 animate-pulse-slow" />
                                    "매 순간이 소중한 추억이 되었습니다"
                                </p>
                            </div>

                            <div className="mt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 font-medium border-t border-gray-100 pt-6 pr-0 md:pr-32">
                                <p>기간: {formatDate(recap.periodStart)} ~ {formatDate(recap.periodEnd)}</p>
                                <p>작성일: {formatDate(recap.createdAt.split('T')[0])}</p>
                            </div>
                        </div>

                        {/* Coin Reward Badge - Sticker Style */}
                        <div className="absolute -bottom-6 -right-6 rotate-[-5deg] animate-bounce-slow z-50">
                            <div className="bg-[#ffd700] text-white px-6 py-3 rounded-full shadow-[0_4px_0_#e6c200] border-4 border-white font-bold text-xl flex items-center gap-2 transform transition-transform hover:scale-110 cursor-pointer">
                                <span className="font-['Jua'] drop-shadow-md">+30 코인</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
