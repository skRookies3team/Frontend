import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Heart, MapPin, Clock, MessageCircle, UserMinus, Send, Users } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { PendingRequest, MatchResult } from '../api/petmate-api';
import { useNavigate } from 'react-router-dom';

type TabType = 'matched' | 'received' | 'sent';

interface MatchingFriendsModalProps {
    isOpen: boolean;
    onClose: () => void;
    matches: MatchResult[];
    pendingRequests: PendingRequest[];
    sentRequests: PendingRequest[];
    onAccept: (matchId: number) => Promise<MatchResult | null>;
    onReject: (matchId: number) => Promise<boolean>;
    onUnfriend: (matchedUserId: number) => Promise<boolean>;
    onMatchSuccess: (result: MatchResult, request: PendingRequest) => void;
}

export function MatchingFriendsModal({
    isOpen,
    onClose,
    matches,
    pendingRequests,
    sentRequests,
    onAccept,
    onReject,
    onUnfriend,
    onMatchSuccess
}: MatchingFriendsModalProps) {
    const [activeTab, setActiveTab] = useState<TabType>('matched');
    const navigate = useNavigate();

    const handleAccept = async (request: PendingRequest) => {
        const result = await onAccept(request.matchId);
        if (result && result.isMatched) {
            onMatchSuccess(result, request);
        }
    };

    const handleReject = async (matchId: number) => {
        await onReject(matchId);
    };

    const handleUnfriend = async (matchedUserId: number) => {
        if (confirm('정말 친구를 끊으시겠습니까?')) {
            await onUnfriend(matchedUserId);
        }
    };

    const handleMessage = (userId: number) => {
        onClose();
        navigate(`/messages?userId=${userId}`);
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

    const tabs = [
        { id: 'matched' as TabType, label: '매칭된 친구', count: matches.length, icon: Users },
        { id: 'received' as TabType, label: '받은 요청', count: pendingRequests.length, icon: Heart },
        { id: 'sent' as TabType, label: '보낸 요청', count: sentRequests.length, icon: Send },
    ];

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
                        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 헤더 */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500">
                                    <Users className="h-5 w-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">매칭친구</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>

                        {/* 탭 */}
                        <div className="flex border-b border-gray-100">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative ${activeTab === tab.id
                                            ? 'text-pink-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <div className="flex items-center justify-center gap-1">
                                        <tab.icon className="h-4 w-4" />
                                        <span>{tab.label}</span>
                                        {tab.count > 0 && (
                                            <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${activeTab === tab.id
                                                    ? 'bg-pink-100 text-pink-600'
                                                    : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                {tab.count}
                                            </span>
                                        )}
                                    </div>
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* 컨텐츠 */}
                        <div className="overflow-y-auto max-h-[calc(85vh-180px)]">
                            {/* 매칭된 친구 탭 */}
                            {activeTab === 'matched' && (
                                <div className="p-4">
                                    {matches.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-50 flex items-center justify-center">
                                                <Users className="h-8 w-8 text-pink-300" />
                                            </div>
                                            <p className="text-gray-500">아직 매칭된 친구가 없어요</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {matches.map((match) => (
                                                <div
                                                    key={match.matchId}
                                                    className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <img
                                                            src={match.petPhoto || '/placeholder.svg'}
                                                            alt={match.petName || ''}
                                                            className="h-16 w-16 rounded-2xl object-cover ring-2 ring-green-200"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-bold text-gray-900 truncate">{match.petName}</h3>
                                                            <p className="text-sm text-gray-500">{match.matchedUserName}</p>
                                                            {match.matchedAt && (
                                                                <p className="text-xs text-gray-400 mt-1">
                                                                    {formatTime(match.matchedAt)}에 매칭됨
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 mt-3">
                                                        <Button
                                                            onClick={() => handleMessage(match.matchedUserId)}
                                                            className="flex-1 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm"
                                                        >
                                                            <MessageCircle className="mr-1 h-4 w-4" />
                                                            메시지
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleUnfriend(match.matchedUserId)}
                                                            variant="outline"
                                                            className="h-10 rounded-xl border-2 border-red-200 text-red-500 hover:bg-red-50 text-sm"
                                                        >
                                                            <UserMinus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 받은 요청 탭 */}
                            {activeTab === 'received' && (
                                <div className="p-4">
                                    {pendingRequests.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-50 flex items-center justify-center">
                                                <Heart className="h-8 w-8 text-pink-300" />
                                            </div>
                                            <p className="text-gray-500">받은 요청이 없어요</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {pendingRequests.map((request) => (
                                                <motion.div
                                                    key={request.matchId}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-4 border border-pink-100"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className="relative flex-shrink-0">
                                                            <img
                                                                src={request.petPhoto || '/placeholder.svg'}
                                                                alt={request.petName}
                                                                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-pink-200"
                                                            />
                                                            <img
                                                                src={request.fromUserAvatar || '/placeholder.svg'}
                                                                alt={request.fromUserName}
                                                                className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full ring-2 ring-white object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="font-bold text-gray-900 truncate">{request.petName}</h3>
                                                                <span className="text-sm text-gray-500">({request.fromUserName})</span>
                                                            </div>
                                                            <p className="text-sm text-gray-600">
                                                                {request.petBreed}
                                                                {request.petAge && ` • ${request.petAge}살`}
                                                            </p>
                                                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
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
                                                    <div className="flex gap-3 mt-4">
                                                        <Button
                                                            onClick={() => handleAccept(request)}
                                                            className="flex-1 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-sm font-semibold"
                                                        >
                                                            <Check className="mr-1 h-4 w-4" />
                                                            수락
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleReject(request.matchId)}
                                                            variant="outline"
                                                            className="flex-1 h-10 rounded-xl border-2 border-gray-300 hover:bg-gray-100 text-sm font-semibold"
                                                        >
                                                            <X className="mr-1 h-4 w-4" />
                                                            거절
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 보낸 요청 탭 */}
                            {activeTab === 'sent' && (
                                <div className="p-4">
                                    {sentRequests.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-50 flex items-center justify-center">
                                                <Send className="h-8 w-8 text-orange-300" />
                                            </div>
                                            <p className="text-gray-500">보낸 요청이 없어요</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {sentRequests.map((request) => (
                                                <div
                                                    key={request.matchId}
                                                    className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <img
                                                            src={request.petPhoto || '/placeholder.svg'}
                                                            alt={request.petName}
                                                            className="h-14 w-14 rounded-2xl object-cover ring-2 ring-orange-200"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-bold text-gray-900 truncate">{request.petName}</h3>
                                                            <p className="text-sm text-gray-500">{request.fromUserName}</p>
                                                            <p className="text-xs text-orange-500 mt-1">응답 대기 중...</p>
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            {formatTime(request.createdAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
