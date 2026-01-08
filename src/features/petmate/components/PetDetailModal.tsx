import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PetMateCandidate } from '../api/petmate-api';
import { X, Heart, MessageCircle, MapPin } from 'lucide-react';
import { Button } from '@/shared/ui/button';

interface PetDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidate: PetMateCandidate | null;
    isLiked: boolean;
    onLike: () => void;
    onChat: () => void;
}

/**
 * 펫 상세 정보 모달 - Simple & Clean Style
 */
export function PetDetailModal({
    isOpen,
    onClose,
    candidate,
    isLiked,
    onLike,
    onChat
}: PetDetailModalProps) {
    if (!candidate) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/20 flex items-center justify-center text-white hover:bg-black/30"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Pet Image */}
                        <div className="relative h-64 bg-gray-100">
                            <img
                                src={candidate.petPhoto || '/placeholder.svg'}
                                alt={candidate.petName}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-4">
                            {/* Pet Info */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">{candidate.petName}</h2>
                                    <p className="text-gray-500 text-sm">
                                        {candidate.petBreed} • {candidate.petAge}살 • {candidate.petGender === 'female' ? '암컷' : '수컷'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gray-400">
                                    <MapPin className="w-4 h-4" />
                                    {candidate.distance}km
                                </div>
                            </div>

                            {/* Bio */}
                            {candidate.bio && (
                                <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                                    {candidate.bio}
                                </p>
                            )}

                            {/* Owner Info */}
                            <Link
                                to={`/user/${candidate.userId}`}
                                onClick={onClose}
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <img
                                    src={candidate.userAvatar || '/placeholder.svg'}
                                    alt={candidate.userName}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                    <p className="font-medium text-gray-800">{candidate.userName}</p>
                                    <p className="text-xs text-gray-400">보호자 프로필 보기</p>
                                </div>
                                <span className="text-gray-300">→</span>
                            </Link>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2">
                                <Button
                                    onClick={onLike}
                                    className={`flex-1 h-12 rounded-xl font-bold ${isLiked
                                        ? 'bg-rose-500 hover:bg-rose-600 text-white'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                        }`}
                                >
                                    <Heart className={`mr-2 h-5 w-5 ${isLiked ? 'fill-white' : ''}`} />
                                    {isLiked ? '좋아요!' : '좋아요'}
                                </Button>

                                <Button
                                    onClick={onChat}
                                    className="w-12 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white p-0"
                                >
                                    <MessageCircle className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
