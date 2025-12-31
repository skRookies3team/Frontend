import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Heart, MapPin, Clock } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { PendingRequest, MatchResult } from '../api/petmate-api';

interface RequestsModalProps {
    isOpen: boolean;
    onClose: () => void;
    requests: PendingRequest[];
    onAccept: (matchId: number) => Promise<MatchResult | null>;
    onReject: (matchId: number) => Promise<boolean>;
    onMatchSuccess: (result: MatchResult, request: PendingRequest) => void;
}

export function RequestsModal({
    isOpen,
    onClose,
    requests,
    onAccept,
    onReject,
    onMatchSuccess
}: RequestsModalProps) {

    const handleAccept = async (request: PendingRequest) => {
        const result = await onAccept(request.matchId);
        if (result && result.isMatched) {
            onMatchSuccess(result, request);
        }
    };

    const handleReject = async (matchId: number) => {
        await onReject(matchId);
    };

    // 시간 포맷팅
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMinutes < 1) return '방금 전';
        if (diffMinutes < 60) return `${diffMinutes}분 전`;
        if (diffHours < 24) return `${diffHours}시간 전`;
        return `${diffDays}일 전`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 헤더 */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500">
                                    <Heart className="h-5 w-5 text-white fill-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">받은 요청</h2>
                                    <p className="text-sm text-gray-500">{requests.length}개의 요청이 있어요</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>

                        {/* 요청 목록 */}
                        <div className="overflow-y-auto max-h-[calc(80vh-100px)]">
                            {requests.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-pink-50 flex items-center justify-center">
                                        <Heart className="h-10 w-10 text-pink-300" />
                                    </div>
                                    <p className="text-gray-500 text-lg mb-2">아직 받은 요청이 없어요</p>
                                    <p className="text-gray-400 text-sm">다른 펫메이트가 하트를 보내면 여기에 표시됩니다</p>
                                </div>
                            ) : (
                                <div className="p-4 space-y-4">
                                    {requests.map((request) => (
                                        <motion.div
                                            key={request.matchId}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-4 border border-pink-100"
                                        >
                                            <div className="flex items-start gap-4">
                                                {/* 프로필 이미지 */}
                                                <div className="relative flex-shrink-0">
                                                    <img
                                                        src={request.petPhoto || '/placeholder.svg'}
                                                        alt={request.petName}
                                                        className="h-20 w-20 rounded-2xl object-cover ring-2 ring-pink-200"
                                                    />
                                                    <img
                                                        src={request.fromUserAvatar || '/placeholder.svg'}
                                                        alt={request.fromUserName}
                                                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full ring-2 ring-white object-cover"
                                                    />
                                                </div>

                                                {/* 정보 */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-bold text-gray-900 truncate">{request.petName}</h3>
                                                        <span className="text-sm text-gray-500">({request.fromUserName})</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        {request.petBreed}
                                                        {request.petAge && ` • ${request.petAge}살`}
                                                    </p>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                                        {request.location && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="h-3 w-3" />
                                                                {request.location}
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {formatTime(request.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 액션 버튼 */}
                                            <div className="flex gap-3 mt-4">
                                                <Button
                                                    onClick={() => handleAccept(request)}
                                                    className="flex-1 h-11 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold"
                                                >
                                                    <Check className="mr-2 h-4 w-4" />
                                                    수락
                                                </Button>
                                                <Button
                                                    onClick={() => handleReject(request.matchId)}
                                                    variant="outline"
                                                    className="flex-1 h-11 rounded-xl border-2 border-gray-300 hover:bg-gray-100 font-semibold"
                                                >
                                                    <X className="mr-2 h-4 w-4" />
                                                    거절
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
