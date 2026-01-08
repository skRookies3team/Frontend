import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, AlertCircle, Heart, Share2, PawPrint, ChevronLeft, ChevronRight, BookOpen, Star } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { getRecapDetailApi } from "../api/diary-api"

// Helper for Coin Badge (Absolute Positioned for Sticker Effect)
const CoinBadge = ({ className }: { className?: string }) => (
    <div className={`absolute z-50 ${className}`}>
        <div className="bg-[#FFD700] text-white font-['Jua'] px-5 py-2 rounded-full border-4 border-white shadow-md flex items-center gap-1 text-lg transform -rotate-12 hover:rotate-0 transition-transform cursor-pointer hover:scale-105 active:scale-95">
            <span></span> +30 코인
        </div>
    </div>
)

// --- Layout 1: Retro Notebook (1-3 images) ---
const RetroNotebookLayout = ({ recap, navigate }: { recap: any, navigate: any }) => {
    const images = recap.imageUrls || []
    return (
        <div className="min-h-screen bg-[#fcf8e3] py-8 px-4 font-sans relative overflow-x-hidden">
            {/* Background Decorations */}
            <div className="fixed top-0 left-0 w-full h-2 bg-stripes-amber opacity-30"></div>
            <div className="fixed bottom-0 left-0 w-full h-2 bg-stripes-amber opacity-30"></div>

            {/* Navigation Bar */}
            <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center relative z-10">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="text-amber-800 hover:bg-amber-100/50 hover:text-amber-900 font-['Jua']"
                >
                    <ArrowLeft className="mr-2 h-5 w-5" /> 리캡 목록
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="text-amber-700 border-amber-200 hover:bg-amber-50"><Share2 className="w-4 h-4" /></Button>
                    <Button variant="outline" size="icon" className="text-amber-700 border-amber-200 hover:bg-amber-50"><Heart className="w-4 h-4" /></Button>
                </div>
            </div>

            {/* Notebook Container */}
            <div className="bg-white rounded-r-3xl rounded-l-md shadow-2xl min-h-[800px] relative max-w-4xl mx-auto">
                <div
                    className="absolute inset-0 z-0 pointer-events-none opacity-20 rounded-r-3xl rounded-l-md overflow-hidden"
                    style={{
                        backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
                        backgroundSize: '24px 24px'
                    }}
                />
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-200 via-gray-100 to-white border-r border-gray-200 z-20 flex flex-col items-center justify-evenly py-6 rounded-l-md">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                        <div key={n} className="w-4 h-4 rounded-full bg-gray-700/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"></div>
                    ))}
                </div>

                <div className="relative z-10 pl-16 pr-8 py-10 md:pl-20 md:pr-12 md:py-12">
                    {/* Header */}
                    <div className="flex justify-center items-center border-b-2 border-dashed border-gray-200 pb-6 mb-8">
                        <div className="bg-white/90 backdrop-blur-sm px-8 py-3 rounded-full border border-gray-200 shadow-sm flex items-center gap-6 font-['Gaegu']">
                            <div className="flex items-baseline gap-2">
                                <span className="text-gray-400 text-sm font-bold font-sans tracking-widest lowercase">period</span>
                                <span className="text-2xl text-slate-700 font-bold tracking-wide">{recap.periodStart} ~ {recap.periodEnd}</span>
                            </div>
                            <span className="text-gray-300 text-xl font-light">|</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-gray-400 text-sm font-bold font-sans tracking-widest lowercase">date</span>
                                <span className="text-2xl text-slate-700 font-bold tracking-wide">{new Date().toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-8">
                            <div className="relative group">
                                <div className="relative w-full aspect-video md:aspect-[4/3] bg-gray-100 shadow-md p-3 pb-8 mb-6 transform -rotate-1 transition-transform group-hover:scale-[1.01] group-hover:rotate-0 duration-500 border border-gray-200">
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-8 bg-yellow-100/60 backdrop-blur-[1px] rotate-2 shadow-sm border border-white/40 z-10"></div>
                                    <div className="w-full h-full overflow-hidden bg-gray-50">
                                        {images[0] && <img src={images[0]} alt="Main" className="w-full h-full object-cover filter contrast-[1.05]" />}
                                    </div>
                                    <div className="absolute bottom-2 right-4 font-['Gaegu'] text-gray-500 text-sm -rotate-2">
                                        {recap.title}
                                    </div>
                                </div>
                                <div className="relative pl-6 border-l-4 border-yellow-200/50">
                                    <div className="font-['Jua'] text-lg text-gray-700 leading-9 whitespace-pre-wrap">{recap.summary}</div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-10 pt-4 md:pt-10">
                            <div className="grid grid-cols-2 gap-4">
                                {images.slice(1, 5).map((img: string, idx: number) => (
                                    <div key={idx} className={`relative p-2 bg-white shadow-md border border-gray-100 ${idx % 2 === 0 ? 'rotate-2' : '-rotate-1'} transition-transform hover:scale-105 hover:z-10`}>
                                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-blue-100/50 backdrop-blur-[1px] rotate-1 shadow-sm"></div>
                                        <div className="w-full aspect-square overflow-hidden bg-gray-50">
                                            <img src={img} alt={`Collage ${idx}`} className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-6">
                                {recap.highlights && recap.highlights.map((highlight: any, idx: number) => (
                                    <div key={idx} className="relative pl-8">
                                        <PawPrint className="absolute left-0 top-1 w-5 h-5 text-gray-300 rotate-12" />
                                        <h4 className="font-['Jua'] text-lg text-gray-700 underline decoration-yellow-200 decoration-4 underline-offset-4 mb-1">{highlight.title}</h4>
                                        <p className="font-['Gaegu'] text-lg text-gray-600 leading-7">{highlight.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-12 flex flex-col items-center justify-center gap-5 pb-4">

                        <p className="font-['Jua'] text-stone-400 text-sm tracking-wide">
                            반려동물과의 소중한 기록, AI 다이어리가 응원합니다
                        </p>
                    </div>
                </div>
                {/* Coin Badge stuck to bottom right of notebook */}
                <CoinBadge className="-bottom-5 -right-5" />
            </div>
        </div>
    )
}

// --- Layout 2: Polaroid Scrapbook (4-6 images) ---
const PolaroidScrapbookLayout = ({ recap, navigate }: { recap: any, navigate: any }) => {
    const images = recap.imageUrls || []
    return (
        <div className="min-h-screen bg-[#fffbeb] font-sans relative flex items-center justify-center p-8 overflow-hidden">
            {/* Navigation */}
            <div className="fixed top-8 left-8 z-50">
                <Button variant="ghost" onClick={() => navigate(-1)} className="text-amber-800 hover:bg-amber-100/50 hover:text-amber-900 font-['Jua']">
                    <ArrowLeft className="mr-2 h-5 w-5" /> 뒤로가기
                </Button>
            </div>

            {/* Main Content Card */}
            <div className="relative bg-white/90 backdrop-blur-sm shadow-xl rounded-[2rem] p-12 max-w-4xl w-full mx-auto my-10 min-h-[700px] flex flex-col items-center">
                {/* Decorative Tape Top */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 transform">
                    <div className="bg-yellow-200/80 w-32 h-8 rotate-1 shadow-sm"></div>
                </div>

                {/* Title */}
                <div className="mb-4 text-center">
                    <span className="inline-block bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-xs font-bold mb-2">✨ AI 리캡</span>
                    <h1 className="text-4xl md:text-5xl font-['Jua'] text-orange-400 mb-2 drop-shadow-sm">{recap.title}</h1>
                    <p className="text-gray-400 font-medium text-sm">{recap.periodStart.split('-')[0]}년 {recap.periodStart.split('-')[1]}월 • {recap.momentCount}개의 특별한 순간</p>
                </div>

                <div className="w-full h-px bg-dashed bg-gray-200 my-6"></div>

                {/* Summary */}
                <div className="w-full max-w-2xl text-center mb-12">
                    <p className="font-['Gaegu'] text-2xl text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {recap.summary}
                    </p>
                </div>

                {/* Highlights Section */}
                <div className="w-full max-w-2xl">
                    <h3 className="font-['Jua'] text-2xl text-orange-400 mb-6 flex items-center gap-2">
                        <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" /> 이달의 하이라이트
                    </h3>
                    <div className="space-y-4">
                        {recap.highlights && recap.highlights.map((highlight: any, idx: number) => (
                            <div key={idx} className="bg-yellow-50 rounded-xl p-5 border border-yellow-100 flex gap-4 items-start hover:shadow-md transition-shadow">
                                <div className="flex-shrink-0 w-8 h-8 bg-yellow-200 text-yellow-700 rounded-lg flex items-center justify-center font-bold font-['Jua']">
                                    {idx + 1}
                                </div>
                                <div>
                                    <h4 className="font-['Jua'] text-lg text-orange-600 mb-1">{highlight.title}</h4>
                                    <p className="font-['Gaegu'] text-lg text-gray-600">{highlight.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Floating Polaroids (Redistributed) */}
                {/* Top Right */}
                <div className="absolute top-20 -right-44 w-60 rotate-6 hover:rotate-0 transition-transform duration-500 z-10 hidden md:block">
                    <div className="bg-white p-3 shadow-lg rounded-sm pb-10">
                        {images[0] && <img src={images[0]} alt="Pic 1" className="w-full aspect-square object-cover" />}
                    </div>
                    <div className="absolute -top-4 w-12 h-6 bg-red-200/50 right-10 -rotate-3"></div>
                </div>
                {/* Top Left */}
                <div className="absolute top-24 -left-44 w-56 -rotate-6 hover:rotate-0 transition-transform duration-500 z-10 hidden md:block">
                    <div className="bg-white p-3 shadow-lg rounded-sm pb-8">
                        {images[1] && <img src={images[1]} alt="Pic 2" className="w-full aspect-square object-cover" />}
                    </div>
                    <div className="absolute -top-4 w-12 h-6 bg-blue-200/50 left-8 rotate-3"></div>
                </div>
                {/* Bottom Right */}
                {images[2] && (
                    <div className="absolute bottom-40 -right-48 w-52 rotate-3 hover:rotate-0 transition-transform duration-500 z-10 hidden md:block">
                        <div className="bg-white p-2 shadow-md rounded-sm pb-6">
                            <img src={images[2]} alt="Pic 3" className="w-full aspect-square object-cover" />
                        </div>
                    </div>
                )}
                {/* Bottom Left */}
                {images[3] && (
                    <div className="absolute bottom-32 -left-48 w-48 -rotate-12 hover:rotate-0 transition-transform duration-500 z-10 hidden md:block">
                        <div className="bg-white p-2 shadow-xl rounded-sm pb-6">
                            <img src={images[3]} alt="Pic 4" className="w-full aspect-square object-cover" />
                        </div>
                        <div className="absolute -top-3 w-10 h-5 bg-yellow-200/50 left-6"></div>
                    </div>
                )}

                {/* Middle Right (5th Image) */}
                {images[4] && (
                    <div className="absolute top-1/2 -translate-y-1/2 -right-52 w-56 -rotate-3 hover:rotate-0 transition-transform duration-500 z-10 hidden md:block">
                        <div className="bg-white p-2 shadow-lg rounded-sm pb-8">
                            <img src={images[4]} alt="Pic 5" className="w-full aspect-square object-cover" />
                        </div>
                        <div className="absolute -top-3 w-10 h-5 bg-green-200/50 right-6 rotate-12"></div>
                    </div>
                )}

                {/* Middle Left (6th Image) */}
                {images[5] && (
                    <div className="absolute top-1/2 -translate-y-1/2 -left-52 w-52 rotate-6 hover:rotate-0 transition-transform duration-500 z-10 hidden md:block">
                        <div className="bg-white p-2 shadow-lg rounded-sm pb-6">
                            <img src={images[5]} alt="Pic 6" className="w-full aspect-square object-cover" />
                        </div>
                        <div className="absolute -top-3 w-10 h-5 bg-purple-200/50 left-6 -rotate-6"></div>
                    </div>
                )}

                {/* Coin Badge Overlapping Bottom Right */}
                <CoinBadge className="-bottom-6 -right-6" />
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-8 w-full text-center text-gray-400 text-xs font-['Jua'] flex flex-col items-center gap-2">
                <div>
                    <span>기간: {recap.periodStart} ~ {recap.periodEnd}</span>
                    <span className="mx-2">|</span>
                    <span>작성일: {new Date().toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    )
}

// --- Layout 3: Widescreen Layout (7+ images) ---
const WidescreenRecapLayout = ({ recap, navigate }: { recap: any, navigate: any }) => {
    const images = recap.imageUrls || []
    const [currentSlide, setCurrentSlide] = useState(0)

    const nextSlide = () => setCurrentSlide(prev => (prev + 1) % images.length)
    const prevSlide = () => setCurrentSlide(prev => (prev - 1 + images.length) % images.length)

    useEffect(() => {
        const timer = setInterval(nextSlide, 5000)
        return () => clearInterval(timer)
    }, [images.length])

    return (
        <div className="min-h-screen bg-[#fcf8e3] font-sans relative pb-20 overflow-x-hidden">
            {/* Navigation */}
            <div className="absolute top-6 left-6 z-50">
                <Button variant="ghost" onClick={() => navigate(-1)} className="text-white hover:bg-black/20 font-medium font-['Jua'] bg-black/10 backdrop-blur-sm rounded-full px-4 border border-white/20">
                    <ArrowLeft className="mr-2 h-5 w-5" /> 돌아가기
                </Button>
            </div>

            {/* Top Section: Full Width Slider */}
            <div className="relative w-full h-[50vh] md:h-[60vh] bg-gray-900 text-white overflow-hidden shadow-xl">
                {/* Slider Images */}
                {images.map((img: string, idx: number) => (
                    <div
                        key={idx}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <img src={img} alt="slide" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
                    </div>
                ))}

                {/* Slider Overlay Info */}
                <div className="absolute bottom-10 left-0 w-full text-center z-10 px-4">
                    <div className="inline-block bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold mb-3 shadow-[0_2px_0_rgb(180,83,9)] transform -rotate-1">
                        ✨ AI 리캡
                    </div>
                    <h1 className="text-4xl md:text-5xl font-['Jua'] text-white drop-shadow-md mb-2">{recap.title}</h1>
                    <p className="text-white/80 font-['Jua'] text-lg">{recap.periodStart} ~ {recap.periodEnd} • {recap.momentCount}개의 특별한 순간</p>

                    {/* Indicators */}
                    <div className="flex justify-center gap-2 mt-6">
                        {images.map((_: any, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentSlide(idx)}
                                className={`h-2 rounded-full transition-all duration-300 shadow-sm ${idx === currentSlide ? 'w-8 bg-yellow-400' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Controls */}
                <Button
                    size="icon"
                    variant="ghost"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-black/20 rounded-full w-12 h-12"
                    onClick={prevSlide}
                >
                    <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-black/20 rounded-full w-12 h-12"
                    onClick={nextSlide}
                >
                    <ChevronRight className="w-8 h-8" />
                </Button>
            </div>

            {/* Bottom Content Container */}
            <div className="max-w-4xl mx-auto -mt-10 relative z-20 px-4">
                <div className="bg-white rounded-[2rem] shadow-xl border border-amber-100 p-8 md:p-12 relative">
                    {/* Decorative Top */}
                    <div className="absolute top-0 left-0 w-full h-3 bg-amber-200/50 rounded-t-[2rem] overflow-hidden"></div>
                    <BookOpen className="absolute top-8 right-8 w-12 h-12 text-amber-100 rotate-12" />

                    {/* Title Section */}
                    <div className="flex items-center gap-3 mb-8 border-b-2 border-dashed border-amber-100 pb-4">
                        <BookOpen className="w-6 h-6 text-amber-500" />
                        <h2 className="text-2xl font-['Jua'] text-amber-600">{recap.title}</h2>
                    </div>

                    {/* Summary */}
                    <div className="mb-10">
                        <p className="font-['Gaegu'] text-xl text-gray-700 leading-8 whitespace-pre-wrap">
                            {recap.summary}
                        </p>
                    </div>

                    {/* Highlights */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            <h3 className="text-xl font-['Jua'] text-amber-800">이달의 하이라이트</h3>
                        </div>

                        {recap.highlights && recap.highlights.map((highlight: any, idx: number) => (
                            <div key={idx} className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex gap-5 hover:shadow-md transition-shadow">
                                <div className="flex-shrink-0 w-8 h-8 bg-amber-200 text-amber-700 rounded-lg flex items-center justify-center font-bold font-['Jua'] shadow-sm transform rotate-3">
                                    {idx + 1}
                                </div>
                                <div>
                                    <h4 className="font-['Jua'] text-lg text-amber-700 mb-2">{highlight.title}</h4>
                                    <p className="font-['Gaegu'] text-lg text-gray-600 leading-relaxed">{highlight.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Coin Badge stuck to bottom right of card */}
                    <CoinBadge className="-bottom-6 -right-6" />
                </div>

                {/* Footer Info */}
                <div className="text-center mt-8 space-y-2">
                    <div className="flex justify-center gap-3">
                        <div className="px-4 py-2 bg-white rounded-full text-amber-800 font-['Jua'] text-sm shadow-sm border border-amber-100 flex items-center gap-1">
                            <Heart className="w-4 h-4 text-red-400 fill-red-400" /> 소중한 추억
                        </div>
                        <div className="px-4 py-2 bg-white rounded-full text-amber-800 font-['Jua'] text-sm shadow-sm border border-amber-100 flex items-center gap-1">
                            <Share2 className="w-4 h-4 text-blue-400" /> 공유하기
                        </div>
                    </div>
                    <p className="text-amber-800/40 text-xs font-['Jua'] mt-4">
                        반려동물과의 소중한 기록, AI 다이어리가 응원합니다
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function RecapDetailPage() {
    const { recapId } = useParams<{ recapId: string }>()
    const navigate = useNavigate()

    const [recap, setRecap] = useState<any | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchRecap = async () => {
            if (!recapId) return
            try {
                setIsLoading(true)
                const data = await getRecapDetailApi(Number(recapId))
                setRecap(data)
            } catch (err: any) {
                console.error("Failed to fetch recap detail:", err)
                setError(err.message || "리캡 정보를 불러오는데 실패했습니다.")
            } finally {
                setIsLoading(false)
            }
        }
        fetchRecap()
    }, [recapId])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#fcf8e3]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-amber-800 font-['Jua'] text-lg animate-pulse">추억 명세서를 찾는 중...</p>
                </div>
            </div>
        )
    }

    if (error || !recap) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#fcf8e3] p-6">
                <AlertCircle className="w-16 h-16 text-amber-600 mb-4" />
                <p className="text-xl text-amber-900 font-['Jua'] mb-6">{error || "리캡을 찾을 수 없습니다."}</p>
                <Button onClick={() => navigate(-1)} className="bg-amber-500 hover:bg-amber-600 text-white font-['Jua']">
                    뒤로가기
                </Button>
            </div>
        )
    }

    // --- Dynamic Layout Switching Logic ---
    const imageCount = (recap.imageUrls || []).length

    if (imageCount >= 7) {
        // [MODIFIED] Uses WidescreenRecapLayout for 7+ images
        return <WidescreenRecapLayout recap={recap} navigate={navigate} />
    } else if (imageCount >= 4) {
        return <PolaroidScrapbookLayout recap={recap} navigate={navigate} /> // 4~6 images
    } else {
        return <RetroNotebookLayout recap={recap} navigate={navigate} /> // 1~3 images
    }
}
