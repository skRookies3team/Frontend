import { useState, useMemo } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { PetMateCandidate } from '../api/petmate-api';
import { Heart, X, Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface SwipeableCardStackProps {
    candidates: PetMateCandidate[];
    isUserLiked: (userId: number) => boolean;
    onLike: (candidate: PetMateCandidate) => void;
    onPass: (candidate: PetMateCandidate) => void;
    onSelect: (candidate: PetMateCandidate) => void;
}

/**
 * 스와이프 가능한 카드 스택
 * - Tinder 스타일 스와이프 제스처
 * - 스택 효과 (뒤에 카드 보임)
 * - 좌/우 스와이프로 Pass/Like
 */
export function SwipeableCardStack({
    candidates,
    isUserLiked,
    onLike,
    onPass,
    onSelect
}: SwipeableCardStackProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState<'left' | 'right' | null>(null);

    // 중복 제거
    const uniqueCandidates = useMemo(() => {
        const seen = new Set();
        return candidates.filter(candidate => {
            if (seen.has(candidate.userId)) return false;
            seen.add(candidate.userId);
            return true;
        });
    }, [candidates]);

    const currentCandidate = uniqueCandidates[currentIndex];
    const nextCandidate = uniqueCandidates[currentIndex + 1];
    const thirdCandidate = uniqueCandidates[currentIndex + 2];

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 100;

        if (info.offset.x > threshold) {
            // 오른쪽 스와이프 = 좋아요
            setDirection('right');
            onLike(currentCandidate);
            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
                setDirection(null);
            }, 300);
        } else if (info.offset.x < -threshold) {
            // 왼쪽 스와이프 = 패스
            setDirection('left');
            onPass(currentCandidate);
            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
                setDirection(null);
            }, 300);
        }
    };

    const handleLike = () => {
        setDirection('right');
        onLike(currentCandidate);
        setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
            setDirection(null);
        }, 300);
    };

    const handlePass = () => {
        setDirection('left');
        onPass(currentCandidate);
        setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
            setDirection(null);
        }, 300);
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < uniqueCandidates.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    if (currentIndex >= uniqueCandidates.length) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] max-h-[600px] text-center p-8">
                <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center">
                    <Heart className="w-12 h-12 text-pink-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">모든 펫메이트를 확인했어요!</h2>
                <p className="text-gray-500">나중에 다시 확인해주세요 🐾</p>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* 카드 스택 */}
            <div className="relative h-[70vh] max-h-[600px] w-full max-w-md mx-auto">
                {/* 세 번째 카드 (배경) */}
                {thirdCandidate && (
                    <motion.div
                        className="absolute inset-0 rounded-3xl overflow-hidden"
                        style={{ scale: 0.9, y: 30, opacity: 0.3 }}
                    >
                        <img
                            src={thirdCandidate.petPhoto || '/placeholder.svg'}
                            alt=""
                            className="w-full h-full object-cover blur-sm"
                        />
                        <div className="absolute inset-0 bg-black/30" />
                    </motion.div>
                )}

                {/* 두 번째 카드 */}
                {nextCandidate && (
                    <motion.div
                        className="absolute inset-0 rounded-3xl overflow-hidden shadow-xl"
                        style={{ scale: 0.95, y: 15 }}
                    >
                        <img
                            src={nextCandidate.petPhoto || '/placeholder.svg'}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    </motion.div>
                )}

                {/* 메인 카드 */}
                <AnimatePresence mode="wait">
                    {currentCandidate && (
                        <motion.div
                            key={currentCandidate.userId}
                            className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing"
                            initial={{ scale: 1, opacity: 1 }}
                            animate={{
                                x: direction === 'left' ? -300 : direction === 'right' ? 300 : 0,
                                rotate: direction === 'left' ? -20 : direction === 'right' ? 20 : 0,
                                opacity: direction ? 0 : 1
                            }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.8}
                            onDragEnd={handleDragEnd}
                            onClick={() => onSelect(currentCandidate)}
                        >
                            {/* 배경 이미지 */}
                            <img
                                src={currentCandidate.petPhoto || '/placeholder.svg'}
                                alt={currentCandidate.petName}
                                className="w-full h-full object-cover pointer-events-none"
                            />

                            {/* 그라디언트 오버레이 */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                            {/* 스와이프 인디케이터 */}
                            <motion.div
                                className="absolute top-8 left-8 px-6 py-3 rounded-xl bg-red-500/90 backdrop-blur-sm border-4 border-red-600 rotate-[-15deg]"
                                initial={{ opacity: 0, scale: 0.5 }}
                                whileDrag={{ opacity: 1, scale: 1 }}
                                style={{ opacity: 0 }}
                            >
                                <span className="text-2xl font-bold text-white">NOPE</span>
                            </motion.div>

                            <motion.div
                                className="absolute top-8 right-8 px-6 py-3 rounded-xl bg-green-500/90 backdrop-blur-sm border-4 border-green-600 rotate-[15deg]"
                                initial={{ opacity: 0, scale: 0.5 }}
                                whileDrag={{ opacity: 1, scale: 1 }}
                                style={{ opacity: 0 }}
                            >
                                <span className="text-2xl font-bold text-white">LIKE</span>
                            </motion.div>

                            {/* 온라인 상태 */}
                            {currentCandidate.isOnline && (
                                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/90 backdrop-blur-sm pointer-events-none">
                                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                    <span className="text-xs font-medium text-white">온라인</span>
                                </div>
                            )}

                            {/* 매칭 스코어 */}
                            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 shadow-lg pointer-events-none">
                                <Star className="w-4 h-4 text-white fill-white" />
                                <span className="text-sm font-bold text-white">{currentCandidate.matchScore}%</span>
                            </div>

                            {/* 펫 정보 */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
                                <div className="mb-3">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-4xl font-bold text-white drop-shadow-lg">
                                            {currentCandidate.petName}
                                        </h2>
                                        <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm text-white font-medium">
                                            {currentCandidate.petAge}살
                                        </span>
                                    </div>
                                    <p className="text-lg text-white/90 font-medium">
                                        {currentCandidate.petBreed} • {currentCandidate.petGender}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4 text-white/80">
                                    <div className="flex items-center gap-2">
                                        <img
                                            src={currentCandidate.userAvatar || '/placeholder.svg'}
                                            alt=""
                                            className="w-8 h-8 rounded-full border-2 border-white/50 object-cover"
                                        />
                                        <span className="text-sm font-medium">{currentCandidate.userName}</span>
                                    </div>
                                    <span>•</span>
                                    <span className="text-sm font-medium">{currentCandidate.distance}km</span>
                                </div>

                                {/* 소개글 미리보기 */}
                                {currentCandidate.bio && (
                                    <p className="mt-3 text-sm text-white/70 line-clamp-2">
                                        {currentCandidate.bio}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 네비게이션 화살표 */}
            <div className="hidden lg:flex absolute left-0 right-0 top-1/2 -translate-y-1/2 justify-between px-4 pointer-events-none">
                <motion.button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="pointer-events-auto w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition-colors"
                    whileTap={{ scale: 0.9 }}
                >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                </motion.button>
                <motion.button
                    onClick={handleNext}
                    disabled={currentIndex >= uniqueCandidates.length - 1}
                    className="pointer-events-auto w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition-colors"
                    whileTap={{ scale: 0.9 }}
                >
                    <ChevronRight className="w-6 h-6 text-gray-700" />
                </motion.button>
            </div>

            {/* 액션 버튼 */}
            <div className="flex items-center justify-center gap-6 mt-6">
                {/* Pass 버튼 */}
                <motion.button
                    onClick={handlePass}
                    className="w-16 h-16 rounded-full bg-white shadow-xl border-2 border-gray-100 flex items-center justify-center hover:border-red-200 hover:bg-red-50 transition-all"
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.1 }}
                >
                    <X className="w-8 h-8 text-red-500" />
                </motion.button>

                {/* Super Like 버튼 */}
                <motion.button
                    onClick={handleLike}
                    className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 shadow-xl flex items-center justify-center hover:shadow-blue-500/30 transition-all"
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.1 }}
                >
                    <Star className="w-7 h-7 text-white fill-white" />
                </motion.button>

                {/* Like 버튼 */}
                <motion.button
                    onClick={handleLike}
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 shadow-xl flex items-center justify-center hover:shadow-pink-500/30 transition-all"
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.1 }}
                >
                    <Heart className="w-8 h-8 text-white fill-white" />
                </motion.button>
            </div>

            {/* 카운터 */}
            <div className="text-center mt-4 text-sm text-gray-500 font-medium">
                {currentIndex + 1} / {uniqueCandidates.length}
            </div>
        </div>
    );
}
