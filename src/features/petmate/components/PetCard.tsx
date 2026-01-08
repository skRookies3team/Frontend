import { motion } from 'framer-motion';
import { PetMateCandidate } from '../api/petmate-api';
import { MapPin, Heart, Sparkles } from 'lucide-react';

interface PetCardProps {
    candidate: PetMateCandidate;
    isLiked: boolean;
    onLike: () => void;
    onClick: () => void;
    style?: 'full' | 'stacked';
    isTop?: boolean;
}

/**
 * 프리미엄 펫 카드 컴포넌트
 * - 풀스크린 이미지 배경
 * - 글래스모피즘 정보 오버레이
 * - 마이크로 애니메이션
 */
export function PetCard({
    candidate,
    isLiked,
    onLike,
    onClick,
    style = 'full',
    isTop = true
}: PetCardProps) {

    const isFull = style === 'full';

    return (
        <motion.div
            className={`relative overflow-hidden cursor-pointer ${isFull
                ? 'w-full h-[70vh] max-h-[600px] rounded-3xl'
                : 'w-full h-[500px] rounded-2xl'
                }`}
            onClick={onClick}
            whileHover={isTop ? { scale: 1.02 } : undefined}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
            {/* 배경 이미지 */}
            <div className="absolute inset-0">
                <img
                    src={candidate.petPhoto || '/placeholder.svg'}
                    alt={candidate.petName}
                    className="w-full h-full object-cover"
                />
                {/* 그라디언트 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>

            {/* 온라인 상태 인디케이터 */}
            {candidate.isOnline && (
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/90 backdrop-blur-sm">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-xs font-medium text-white">온라인</span>
                </div>
            )}

            {/* 매칭 스코어 뱃지 */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm font-bold text-white">{candidate.matchScore}%</span>
            </div>

            {/* 정보 오버레이 (글래스모피즘) */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
                {/* 메인 정보 */}
                <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                            {candidate.petName}
                        </h2>
                        <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm text-white font-medium">
                            {candidate.petAge}살
                        </span>
                    </div>
                    <p className="text-lg text-white/90 font-medium">
                        {candidate.petBreed} • {candidate.petGender}
                    </p>
                </div>

                {/* 위치 & 보호자 정보 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-white/80">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm font-medium">{candidate.distance}km</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <img
                                src={candidate.userAvatar || '/placeholder.svg'}
                                alt={candidate.userName}
                                className="w-8 h-8 rounded-full border-2 border-white/50 object-cover"
                            />
                            <span className="text-sm text-white/90 font-medium">{candidate.userName}</span>
                        </div>
                    </div>

                    {/* 좋아요 버튼 */}
                    <motion.button
                        onClick={(e) => {
                            e.stopPropagation();
                            onLike();
                        }}
                        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all ${isLiked
                            ? 'bg-gradient-to-br from-pink-500 to-rose-600'
                            : 'bg-white/20 backdrop-blur-md hover:bg-white/30'
                            }`}
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ scale: 1.1 }}
                    >
                        <Heart
                            className={`w-7 h-7 ${isLiked
                                ? 'fill-white text-white'
                                : 'text-white'
                                }`}
                        />
                    </motion.button>
                </div>

                {/* 활동성 바 */}
                <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white/70 font-medium">활동성</span>
                        <span className="text-sm text-white font-bold">{candidate.activityLevel}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-pink-400 to-orange-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${candidate.activityLevel}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                        />
                    </div>
                </div>

                {/* 공통 관심사 (있으면 표시) */}
                {candidate.commonInterests && candidate.commonInterests.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {candidate.commonInterests.slice(0, 3).map((interest) => (
                            <span
                                key={interest}
                                className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs text-white font-medium"
                            >
                                {interest}
                            </span>
                        ))}
                        {candidate.commonInterests.length > 3 && (
                            <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs text-white font-medium">
                                +{candidate.commonInterests.length - 3}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* 클릭 힌트 */}
            {isTop && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="px-6 py-3 rounded-full bg-white/90 backdrop-blur-sm shadow-xl">
                        <span className="text-sm font-bold text-gray-800">탭하여 프로필 보기</span>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
