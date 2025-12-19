import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PetMateCandidate } from '../api/petmate-api'
import { MapPin, Star, Heart, ChevronUp, ChevronDown } from 'lucide-react'
import './SmoothScrollList.css'

interface SmoothScrollCardProps {
    candidate: PetMateCandidate
    isLiked: boolean
    onLike: (e: React.MouseEvent) => void
    onClick: () => void
    isActive: boolean
    position: 'prev2' | 'prev' | 'current' | 'next' | 'next2' | 'hidden'
}

export function SmoothScrollCard({ candidate, isLiked, onLike, onClick, isActive, position }: SmoothScrollCardProps) {
    const variants = {
        prev2: {
            y: -200,
            scale: 0.75,
            opacity: 0.4,
            zIndex: 1,
            filter: 'grayscale(80%)'
        },
        prev: {
            y: -100,
            scale: 0.85,
            opacity: 0.6,
            zIndex: 5,
            filter: 'grayscale(50%)'
        },
        current: {
            y: 0,
            scale: 1.05,
            opacity: 1,
            zIndex: 10,
            filter: 'grayscale(0%)'
        },
        next: {
            y: 100,
            scale: 0.85,
            opacity: 0.6,
            zIndex: 5,
            filter: 'grayscale(50%)'
        },
        next2: {
            y: 200,
            scale: 0.75,
            opacity: 0.4,
            zIndex: 1,
            filter: 'grayscale(80%)'
        },
        hidden: {
            y: position === 'prev' || position === 'prev2' ? -250 : 250,
            scale: 0.7,
            opacity: 0,
            zIndex: 0,
            filter: 'grayscale(100%)'
        }
    }

    return (
        <motion.div
            className="absolute w-full cursor-pointer"
            onClick={onClick}
            initial={false}
            animate={position}
            variants={variants}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 0.8
            }}
        >
            <div className={`bg-white rounded-2xl shadow-lg border-2 ${isActive ? 'border-pink-400 shadow-xl' : 'border-pink-100'} transition-colors overflow-hidden`}>
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-4 sm:p-5">
                    {/* 펫 이미지 */}
                    <div className="relative flex-shrink-0">
                        <img
                            src={candidate.petPhoto || "/placeholder.svg"}
                            alt={candidate.petName}
                            className="w-24 h-24 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-pink-200"
                        />
                        {candidate.isOnline && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                        )}
                    </div>

                    {/* 펫 정보 */}
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1 sm:gap-2 mb-1">
                            <h3 className="font-bold text-base sm:text-lg text-gray-900 truncate">{candidate.petName}</h3>
                            <span className="text-xs sm:text-sm text-gray-500 truncate">• {candidate.petBreed}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">{candidate.userName}</p>
                        <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3">
                            <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                                <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span>{candidate.distance}km</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-pink-500 text-pink-500" />
                                <span className="text-xs sm:text-sm font-semibold text-pink-600">{candidate.matchScore}%</span>
                            </div>
                        </div>
                    </div>

                    {/* 하트 버튼 */}
                    <motion.button
                        className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center transition-colors ${isLiked
                            ? "bg-pink-100 hover:bg-pink-200"
                            : "bg-gray-50 hover:bg-pink-50"
                            }`}
                        onClick={(e) => {
                            e.stopPropagation()
                            onLike(e)
                        }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Heart
                            className={`h-5 w-5 sm:h-6 sm:w-6 ${isLiked
                                ? "fill-pink-500 text-pink-500"
                                : "text-gray-400"
                                }`}
                        />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    )
}

interface SmoothScrollListProps {
    candidates: PetMateCandidate[]
    isUserLiked: (userId: number) => boolean
    onLike: (candidate: PetMateCandidate) => void
    onSelect: (candidate: PetMateCandidate) => void
}

export function SmoothScrollList({ candidates, isUserLiked, onLike, onSelect }: SmoothScrollListProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

    // 마우스 휠 이벤트 핸들러
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        let isScrolling = false

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault()

            if (isScrolling) return
            isScrolling = true

            if (e.deltaY > 0) {
                // 아래로 스크롤 - 다음 카드
                setCurrentIndex(prev => Math.min(prev + 1, candidates.length - 1))
            } else {
                // 위로 스크롤 - 이전 카드
                setCurrentIndex(prev => Math.max(prev - 1, 0))
            }

            setTimeout(() => {
                isScrolling = false
            }, 300)
        }

        container.addEventListener('wheel', handleWheel, { passive: false })
        return () => container.removeEventListener('wheel', handleWheel)
    }, [candidates.length])

    // 키보드 이벤트
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                setCurrentIndex(prev => Math.min(prev + 1, candidates.length - 1))
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                setCurrentIndex(prev => Math.max(prev - 1, 0))
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [candidates.length])

    const getPosition = (index: number): 'prev2' | 'prev' | 'current' | 'next' | 'next2' | 'hidden' => {
        const diff = index - currentIndex
        if (diff === 0) return 'current'
        if (diff === -1) return 'prev'
        if (diff === -2) return 'prev2'
        if (diff === 1) return 'next'
        if (diff === 2) return 'next2'
        return 'hidden'
    }

    const goUp = () => setCurrentIndex(prev => Math.max(prev - 1, 0))
    const goDown = () => setCurrentIndex(prev => Math.min(prev + 1, candidates.length - 1))

    return (
        <div className="carousel-container" ref={containerRef}>
            {/* 위로 버튼 */}
            <button
                onClick={goUp}
                disabled={currentIndex === 0}
                className={`absolute top-20 left-1/2 -translate-x-1/2 z-20 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all ${currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
            >
                <ChevronUp className="h-6 w-6 text-pink-600" />
            </button>

            {/* 카드 컨테이너 */}
            <div className="relative h-[480px] flex items-center justify-center px-4">
                <AnimatePresence mode="popLayout">
                    {candidates.map((candidate, index) => {
                        const position = getPosition(index)
                        if (position === 'hidden' && Math.abs(index - currentIndex) > 3) return null

                        return (
                            <SmoothScrollCard
                                key={candidate.userId}
                                candidate={candidate}
                                isLiked={isUserLiked(candidate.userId)}
                                onLike={(e) => {
                                    e.stopPropagation()
                                    onLike(candidate)
                                }}
                                onClick={() => onSelect(candidate)}
                                isActive={index === currentIndex}
                                position={position}
                            />
                        )
                    })}
                </AnimatePresence>
            </div>

            {/* 아래로 버튼 */}
            <button
                onClick={goDown}
                disabled={currentIndex === candidates.length - 1}
                className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-20 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all ${currentIndex === candidates.length - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
            >
                <ChevronDown className="h-6 w-6 text-pink-600" />
            </button>

            {/* 인디케이터 */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-20">
                {candidates.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 rounded-full transition-all ${index === currentIndex
                            ? 'h-6 bg-pink-500'
                            : 'h-2 bg-pink-200 hover:bg-pink-300'
                            }`}
                    />
                ))}
            </div>

            {/* 카운터 */}
            <div className="absolute bottom-4 right-4 text-sm font-medium text-gray-500 z-20">
                {currentIndex + 1} / {candidates.length}
            </div>
        </div>
    )
}
