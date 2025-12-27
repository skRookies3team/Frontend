import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, Share2, BookOpen, Coins } from 'lucide-react';

interface CompleteStepProps {
    onHome: () => void;
    earnedAmount: number | null;
    onShare: (visibility: string) => Promise<any>;
}

const CompleteStep = ({ onHome, earnedAmount, onShare }: CompleteStepProps) => {
    const [sharingStep, setSharingStep] = useState<'initial' | 'visibility' | 'success'>('initial');
    const [sharedFeedId, setSharedFeedId] = useState<number | null>(null);
    const [isSharing, setIsSharing] = useState(false);
    const navigate = useNavigate();

    // 피드 공유 보상액 설정 (상수로 관리)
    const FEED_REWARD_AMOUNT = 10;

    const handleShareClick = async (visibility: string) => {
        setIsSharing(true);
        try {
            const feedId = await onShare(visibility);
            if (feedId) {
                setSharedFeedId(feedId);
            }
            setSharingStep('success');
        } catch (e) {
            console.error("Share failed", e);
        } finally {
            setIsSharing(false);
        }
    };

    if (sharingStep === 'visibility') {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">공개 범위를 선택해주세요</h2>
                <p className="text-gray-500">소셜 피드에 어떻게 공유할까요?</p>

                <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
                    <button onClick={() => handleShareClick('PUBLIC')} disabled={isSharing} className="flex items-center gap-4 p-4 border rounded-xl hover:bg-pink-50 hover:border-pink-300 transition-all text-left group">
                        <div className="bg-pink-100 p-3 rounded-full text-pink-600 group-hover:bg-pink-200"><Share2 className="w-5 h-5" /></div>
                        <div>
                            <div className="font-bold text-gray-800">전체 공개</div>
                            <div className="text-xs text-gray-500">모든 사용자가 볼 수 있습니다.</div>
                        </div>
                    </button>

                    <button onClick={() => handleShareClick('FOLLOWER')} disabled={isSharing} className="flex items-center gap-4 p-4 border rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all text-left group">
                        <div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:bg-blue-200"><Check className="w-5 h-5" /></div>
                        <div>
                            <div className="font-bold text-gray-800">팔로워 공개</div>
                            <div className="text-xs text-gray-500">내 팔로워만 볼 수 있습니다.</div>
                        </div>
                    </button>

                    <button onClick={() => handleShareClick('PRIVATE')} disabled={isSharing} className="flex items-center gap-4 p-4 border rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-left group">
                        <div className="bg-gray-100 p-3 rounded-full text-gray-600 group-hover:bg-gray-200"><BookOpen className="w-5 h-5" /></div>
                        <div>
                            <div className="font-bold text-gray-800">나만 보기</div>
                            <div className="text-xs text-gray-500">피드에 기록되지만 나만 볼 수 있습니다.</div>
                        </div>
                    </button>
                </div>

                <button onClick={() => setSharingStep('initial')} disabled={isSharing} className="text-gray-400 text-sm underline mt-4">취소</button>
            </div>
        );
    }

    if (sharingStep === 'success') {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                <div className="bg-blue-100 p-6 rounded-full mb-6"><Check className="w-12 h-12 text-blue-600" /></div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">피드 공유 완료!</h2>

                <div className="flex items-center gap-2 bg-yellow-50 px-5 py-2.5 rounded-full border border-yellow-200 mb-8 animate-bounce shadow-sm">
                    <div className="bg-yellow-400 rounded-full p-1">
                        <Coins className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-yellow-700">
                        보너스 <span className="text-rose-500">+{FEED_REWARD_AMOUNT}</span> Pet Coin 적립 완료!
                    </span>
                </div>

                <p className="text-gray-500 mb-8">우리 아이의 일기가 소셜 피드에 올라갔어요.</p>

                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <button onClick={() => sharedFeedId ? navigate(`/feed`) : navigate('/feed')} className="w-full px-6 py-3 bg-pink-500 text-white rounded-xl font-bold shadow-lg hover:bg-pink-600 transition-colors">
                        작성한 피드 보기
                    </button>
                    <button onClick={onHome} className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                        내 다이어리 보관함
                    </button>
                    <button onClick={() => navigate('/')} className="w-full px-6 py-3 border border-gray-200 text-gray-500 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                        홈으로
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="bg-green-100 p-6 rounded-full mb-6">
                <Check className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">일기 작성이 완료되었어요!</h2>

            {earnedAmount !== null && (
                <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200 mb-6 animate-bounce">
                    <Coins className="w-5 h-5 text-yellow-600" />
                    <span className="font-bold text-yellow-700">+{earnedAmount} Pet Coin 적립 완료!</span>
                </div>
            )}

            <div className="flex gap-4 mt-4">
                <button onClick={onHome} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                    내 다이어리 보기
                </button>
                <button onClick={() => setSharingStep('visibility')} className="px-6 py-3 bg-pink-500 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg hover:bg-pink-600 transition-colors">
                    <Share2 className="w-4 h-4" /> 피드 공유하기
                </button>
            </div>
        </div>
    );
};

export default CompleteStep;