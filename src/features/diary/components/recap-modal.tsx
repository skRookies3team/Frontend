import { Badge } from "@/shared/ui/badge"
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react"
import { RecapDetailResponse } from "@/features/diary/types/recap"
import { useState } from "react"

interface RecapModalProps {
    recap: RecapDetailResponse
    onClose: () => void
}

export function RecapModal({ recap, onClose }: RecapModalProps) {
    // Image carousel state
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const images = recap.imageUrls || []
    const hasMultipleImages = images.length > 1

    // Format date display (yyyy-MM-dd -> yyyy.MM.dd)
    const formatDate = (dateStr: string) => dateStr.replace(/-/g, '.')

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 shadow-lg transition-transform hover:scale-110"
                >
                    ×
                </button>

                {/* Image Carousel */}
                <div className="relative aspect-video overflow-hidden">
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
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            prevImage()
                                        }}
                                        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition-transform hover:scale-110"
                                    >
                                        <ChevronLeft className="h-6 w-6" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            nextImage()
                                        }}
                                        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition-transform hover:scale-110"
                                    >
                                        <ChevronRight className="h-6 w-6" />
                                    </button>
                                    <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                                        {images.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setCurrentImageIndex(index)
                                                }}
                                                className={`h-2 w-2 rounded-full transition-all ${index === currentImageIndex
                                                    ? 'bg-white w-4'
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
                        <h2 className="text-3xl font-bold">{recap.title}</h2>
                        <p className="mt-2 text-sm text-white/90">
                            {formatDate(recap.createdAt.split('T')[0])} 생성 • {recap.momentCount}개의 순간
                        </p>
                    </div>
                </div>

                <div className="p-6 md:p-8">
                    <div className="prose prose-purple max-w-none">
                        <h3 className="text-2xl font-bold text-purple-600">{recap.title}</h3>

                        <p className="mt-4 text-lg leading-relaxed text-foreground">
                            {recap.summary}
                        </p>

                        {recap.highlights && recap.highlights.length > 0 && (
                            <>
                                <h4 className="mt-6 text-xl font-bold text-purple-600">하이라이트</h4>
                                <div className="space-y-4">
                                    {recap.highlights.map((highlight, index) => (
                                        <div
                                            key={index}
                                            className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 p-4 border border-purple-100"
                                        >
                                            <h5 className="font-bold text-purple-700 mb-2">{highlight.title}</h5>
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
                    </div>

                    <div className="mt-8 rounded-2xl bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 p-6 text-center">
                        <p className="text-3xl font-bold text-purple-600">+500</p>
                        <p className="text-sm text-muted-foreground">펫코인 획득</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
