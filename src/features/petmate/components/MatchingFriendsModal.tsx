import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Users } from 'lucide-react';
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
    onCancelRequest: (toUserId: number) => Promise<boolean>;
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
    onCancelRequest,
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

    const handleMessage = (userId: number) => {
        onClose();
        navigate(`/messages?userId=${userId}`);
    };

    const formatTime = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        if (diffMinutes < 1) return '방금 전';
        if (diffMinutes < 60) return `${diffMinutes}분 전`;
        return `${Math.floor(diffMinutes / 60)}시간 전`;
    };

    const tabs = [
        { id: 'matched' as TabType, label: '매칭된 친구', count: matches.length },
        { id: 'received' as TabType, label: '받은 요청', count: pendingRequests.length },
        { id: 'sent' as TabType, label: '보낸 요청', count: sentRequests.length },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        className="bg-[#FFFCF5] rounded-[24px] shadow-2xl max-w-lg w-full h-[600px] flex flex-col font-sans overflow-hidden border border-[#EBE5D5]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-[#F0E6D2]">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">🧩</span>
                                <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: '"Jua", sans-serif' }}>매칭 친구들</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="h-8 w-8 rounded-full bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-colors text-gray-400"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex px-4 pt-4 bg-[#FFFCF5]">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 pb-3 text-sm font-bold transition-all relative ${activeTab === tab.id
                                        ? 'text-rose-400'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    style={{ fontFamily: '"Jua", sans-serif' }}
                                >
                                    <div className="flex items-center justify-center gap-1.5">
                                        <span>{tab.label}</span>
                                        {tab.count > 0 && (
                                            <span className={`px-1.5 min-w-[18px] h-[18px] text-[10px] rounded-full flex items-center justify-center ${activeTab === tab.id
                                                ? 'bg-rose-400 text-white'
                                                : 'bg-gray-200 text-gray-500'
                                                }`}>
                                                {tab.count}
                                            </span>
                                        )}
                                    </div>
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTabIndicator"
                                            className="absolute bottom-0 left-0 right-0 h-[3px] bg-rose-400 rounded-t-full mx-2"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto bg-[#FFFCF5] p-4 scrollbar-hide">

                            {/* MATCHED FRIENDS TAB */}
                            {activeTab === 'matched' && (
                                <div className="space-y-3">
                                    {matches.length === 0 ? (
                                        <EmptyState message="아직 매칭된 친구가 없어요!" subMessage="마음을 보내보세요 💕" />
                                    ) : (
                                        matches.map((match) => (
                                            <div key={match.matchId} className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100/50 flex flex-col gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <img
                                                            src={match.petPhoto || '/placeholder.svg'}
                                                            alt={match.petName || ''}
                                                            className="h-12 w-12 rounded-xl object-cover bg-gray-50"
                                                        />
                                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white"></div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-gray-800 text-base" style={{ fontFamily: '"Jua", sans-serif' }}>{match.petName}</h3>
                                                        <p className="text-xs text-gray-400">{match.matchedUserName} • {formatTime(match.matchedAt)}</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={() => handleMessage(match.matchedUserId)}
                                                    className="w-full h-11 rounded-xl bg-emerald-400 hover:bg-emerald-500 text-white text-sm font-bold shadow-sm transition-all"
                                                >
                                                    <MessageCircle className="mr-1.5 h-4 w-4" />
                                                    대화하기
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* RECEIVED REQUESTS TAB */}
                            {activeTab === 'received' && (
                                <div className="space-y-3">
                                    {pendingRequests.length === 0 ? (
                                        <EmptyState message="받은 요청이 없어요." subMessage="새로운 친구를 기다려봐요!" />
                                    ) : (
                                        pendingRequests.map((request) => (
                                            <div key={request.matchId} className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-rose-50">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <img
                                                        src={request.petPhoto || '/placeholder.svg'}
                                                        alt={request.petName}
                                                        className="h-14 w-14 rounded-xl object-cover bg-rose-50"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-bold text-gray-800 text-base" style={{ fontFamily: '"Jua", sans-serif' }}>{request.petName}</h3>
                                                            <span className="text-[10px] bg-rose-100 text-rose-500 px-1.5 py-0.5 rounded font-bold">New</span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                                                            {request.petBreed} • {request.petAge}살
                                                        </p>
                                                        {request.location && <p className="text-[10px] text-gray-400 mt-0.5">{request.location}</p>}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => handleAccept(request)}
                                                        className="flex-1 h-10 rounded-xl bg-rose-400 hover:bg-rose-500 text-white text-sm font-bold shadow-sm"
                                                    >
                                                        수락
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleReject(request.matchId)}
                                                        className="h-10 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 text-sm font-bold"
                                                    >
                                                        거절
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* SENT REQUESTS TAB */}
                            {activeTab === 'sent' && (
                                <div className="space-y-3">
                                    {sentRequests.length === 0 ? (
                                        <EmptyState message="보낸 요청이 없어요." subMessage="친구들에게 마음을 표현해보세요!" />
                                    ) : (
                                        sentRequests.map((request) => (
                                            <div key={request.matchId} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex items-center gap-3 opacity-90">
                                                <img
                                                    src={request.petPhoto || '/placeholder.svg'}
                                                    alt={request.petName}
                                                    className="h-12 w-12 rounded-xl object-cover grayscale-[0.3]"
                                                />
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-700 text-sm" style={{ fontFamily: '"Jua", sans-serif' }}>{request.petName}</h3>
                                                    <p className="text-xs text-orange-400 font-medium">응답 대기중...</p>
                                                </div>
                                                <button
                                                    onClick={() => onCancelRequest(request.fromUserId)}
                                                    className="p-2 text-gray-300 hover:text-red-400 transition-colors"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))
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

function EmptyState({ message, subMessage }: { message: string, subMessage: string }) {
    return (
        <div className="h-40 flex flex-col items-center justify-center text-center opacity-70">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Users className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-600 font-bold text-sm">{message}</p>
            <p className="text-gray-400 text-xs mt-1">{subMessage}</p>
        </div>
    );
}
