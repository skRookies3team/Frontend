
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

import { ArrowLeft, Sparkles, AlertCircle, Heart, Share2, PawPrint, User } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { getRecapDetailApi } from "../api/diary-api"

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

    const images = recap.imageUrls || []

    return (
        <div className="min-h-screen bg-[#fcf8e3] py-8 px-4 font-sans relative overflow-hidden">

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
            <div className="bg-white rounded-r-3xl rounded-l-md shadow-2xl overflow-hidden min-h-[800px] relative max-w-4xl mx-auto">

                {/* Grid Background */}
                <div
                    className="absolute inset-0 z-0 pointer-events-none opacity-20"
                    style={{
                        backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
                        backgroundSize: '24px 24px'
                    }}
                />

                {/* Spine Binding */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-200 via-gray-100 to-white border-r border-gray-200 z-20 flex flex-col items-center justify-evenly py-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                        <div key={n} className="w-4 h-4 rounded-full bg-gray-700/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"></div>
                    ))}
                </div>

                {/* Page Content */}
                <div className="relative z-10 pl-16 pr-8 py-10 md:pl-20 md:pr-12 md:py-12">

                    {/* Top Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-dashed border-gray-300 pb-2 mb-10">
                        <div>
                            <h1 className="text-3xl font-bold text-blue-900 tracking-wider font-sans mb-1">PET RECORD</h1>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-400 tracking-[0.2em]">
                                <span>MONTHLY RECAP</span>
                                <span>•</span>
                                <span>NO. {recapId}</span>
                            </div>
                        </div>

                        {/* Date Fields */}
                        <div className="flex gap-6 mt-4 md:mt-0 font-['Jua'] text-gray-600">
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] text-gray-400 font-sans font-bold tracking-widest mb-1">YEAR</span>
                                <span className="text-xl border-b border-gray-300 w-16 text-center pb-1">{recap.periodStart.split('-')[0]}</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] text-gray-400 font-sans font-bold tracking-widest mb-1">MONTH</span>
                                <span className="text-xl border-b border-gray-300 w-12 text-center pb-1">{recap.periodStart.split('-')[1]}</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] text-gray-400 font-sans font-bold tracking-widest mb-1">DATE</span>
                                <span className="text-xl border-b border-gray-300 w-12 text-center pb-1">{recap.periodStart.split('-')[2]}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="absolute top-10 right-8 flex gap-1">
                        <div className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-t-md text-[10px] font-bold text-gray-400">DAILY</div>
                        <div className="px-3 py-1 bg-yellow-300 border border-yellow-400 rounded-t-md text-[10px] font-bold text-yellow-800 shadow-sm relative -top-2">RECAP</div>
                        <div className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-t-md text-[10px] font-bold text-gray-400">HEALTH</div>
                        <div className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-t-md text-[10px] font-bold text-gray-400">FOOD</div>
                    </div>

                    {/* Main Layout Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                        {/* Left Column */}
                        <div className="space-y-8">
                            {/* Main Summary Box */}
                            <div className="relative group">
                                {/* Main Photo with Tape */}
                                <div className="relative w-full aspect-video md:aspect-[4/3] bg-gray-100 shadow-md p-3 pb-8 mb-6 transform -rotate-1 transition-transform group-hover:scale-[1.01] group-hover:rotate-0 duration-500 border border-gray-200">
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-8 bg-yellow-100/60 backdrop-blur-[1px] rotate-2 shadow-sm border border-white/40 z-10"></div>
                                    <div className="w-full h-full overflow-hidden bg-gray-50">
                                        {images[0] ? (
                                            <img src={images[0]} alt="Main" className="w-full h-full object-cover filter contrast-[1.05]" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300"><Sparkles className="w-10 h-10" /></div>
                                        )}
                                    </div>
                                    {/* Handwriting on Photo */}
                                    <div className="absolute bottom-2 right-4 font-['Gaegu'] text-gray-500 text-sm -rotate-2">
                                        {recap.title}
                                    </div>
                                </div>

                                {/* Summary Text */}
                                <div className="relative pl-6 border-l-4 border-yellow-200/50">
                                    <div className="font-['Jua'] text-lg text-gray-700 leading-9 whitespace-pre-wrap">
                                        {recap.summary}
                                    </div>
                                    <div className="absolute top-0 right-0 text-3xl animate-bounce-slow opacity-80">🐱</div>
                                </div>
                            </div>

                            {/* Highlight 1 */}
                            {recap.highlights && recap.highlights[0] && (
                                <div className="relative bg-[#fffbe6] p-6 rounded-lg border-2 border-dashed border-yellow-200 shadow-[4px_4px_0px_rgba(253,224,71,0.3)] transform rotate-1">
                                    <div className="absolute -top-3 -left-3">
                                        <div className="w-8 h-8 bg-red-400 rounded-full flex items-center justify-center text-white font-bold shadow-sm">1</div>
                                    </div>
                                    <h3 className="font-['Jua'] text-xl text-amber-600 mb-2">{recap.highlights[0].title}</h3>
                                    <p className="font-['Gaegu'] text-lg text-gray-600 leading-6">{recap.highlights[0].content}</p>
                                </div>
                            )}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-10 pt-4 md:pt-10">
                            {/* Photo Collage */}
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

                            {/* Highlight 2 & 3 */}
                            <div className="space-y-6">
                                {recap.highlights && recap.highlights.slice(1).map((highlight: any, idx: number) => (
                                    <div key={idx} className="relative pl-8">
                                        <PawPrint className="absolute left-0 top-1 w-5 h-5 text-gray-300 rotate-12" />
                                        <h4 className="font-['Jua'] text-lg text-gray-700 underline decoration-yellow-200 decoration-4 underline-offset-4 mb-1">
                                            {highlight.title}
                                        </h4>
                                        <p className="font-['Gaegu'] text-xl text-gray-600 leading-7">
                                            {highlight.content}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Sticker Area */}
                            <div className="flex justify-end gap-4 pr-10">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-400 border-2 border-red-200 transform rotate-12 shadow-sm">
                                    <Heart className="w-8 h-8 fill-red-400" />
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-400 border-2 border-blue-200 transform -rotate-6 shadow-sm mt-4">
                                    <User className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
