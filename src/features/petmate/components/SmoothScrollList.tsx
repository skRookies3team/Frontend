import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { PetMateCandidate } from '../api/petmate-api'
import { MapPin, Star, Heart } from 'lucide-react'
import './SmoothScrollList.css'

interface SmoothScrollCardProps {
    candidate: PetMateCandidate
    isLiked: boolean
    onLike: (e: React.MouseEvent) => void
    onClick: () => void
}

export function SmoothScrollCard({ candidate, isLiked, onLike, onClick }: SmoothScrollCardProps) {
    const ref = useRef<HTMLDivElement>(null)

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    })

    // 중앙에 가까울수록 scale 1.05, 멀어질수록 0.85
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1.05, 0.85])
    // 중앙에 가까울수록 opacity 1, 멀어질수록 0.5
    const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1, 0.5])

    return (
        <motion.div
            ref={ref}
            style={{ scale, opacity }}
            className="smooth-scroll-card cursor-pointer scroll-snap-item"
            onClick={onClick}
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <div className="bg-white rounded-2xl shadow-lg border-2 border-pink-100 hover:border-pink-300 transition-colors overflow-hidden">
                {/* 모바일: 세로 레이아웃, 데스크탑: 가로 레이아웃 */}
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-3 sm:p-4">
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
    return (
        <div className="smooth-scroll-container">
            <div className="smooth-scroll-content">
                {candidates.map((candidate) => (
                    <SmoothScrollCard
                        key={candidate.userId}
                        candidate={candidate}
                        isLiked={isUserLiked(candidate.userId)}
                        onLike={(e) => {
                            e.stopPropagation()
                            onLike(candidate)
                        }}
                        onClick={() => onSelect(candidate)}
                    />
                ))}
            </div>
        </div>
    )
}
