import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Share2, Coins, Facebook, Instagram, Link as LinkIcon } from 'lucide-react';

interface CompleteStepProps {
    onHome: () => void;
    earnedAmount: number | null;
    onShare: (visibility: string) => Promise<any>;
    onThemeChange?: (theme: 'pink' | 'skyblue') => void;
}

const CompleteStep = ({ onHome, earnedAmount, onShare, onThemeChange }: CompleteStepProps) => {
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
            onThemeChange?.('skyblue'); // Trigger background change
        } catch (e) {
            console.error("Share failed", e);
        } finally {
            setIsSharing(false);
        }
    };

    const handleExternalShare = (platform: string) => {
        const shareUrl = window.location.href;
        const shareText = "우리 아이의 일기를 확인해보세요!";

        switch (platform) {
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
                break;
            case 'instagram':
                navigator.clipboard.writeText(shareUrl);
                alert('링크가 복사되었습니다! Instagram 앱에서 붙여넣기 해주세요.');
                break;
            case 'message':
                if (navigator.share) {
                    navigator.share({
                        title: '펫 로그 다이어리',
                        text: shareText,
                        url: shareUrl
                    }).catch(err => console.log('Share failed', err));
                } else {
                    navigator.clipboard.writeText(shareUrl);
                    alert('링크가 복사되었습니다!');
                }
                break;
            case 'link':
                navigator.clipboard.writeText(shareUrl);
                alert('링크가 복사되었습니다!');
                break;
        }
    };



    if (sharingStep === 'success') {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                <div className="bg-[#E3F2FD] p-8 rounded-[2.5rem] shadow-[8px_8px_0px_rgba(135,206,235,0.2)] border-2 border-blue-100 mb-8 relative transform -rotate-1 transition-transform hover:rotate-0">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-blue-100/50 rotate-1 backdrop-blur-sm rounded-sm"></div>

                    <div className="bg-blue-100 p-6 rounded-full mb-6 relative inline-block">
                        <Check className="w-12 h-12 text-blue-500" />
                        <div className="absolute top-0 right-0 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4 font-['Jua']">피드 공유 완료!</h2>

                    <div className="flex items-center gap-2 bg-yellow-50 px-5 py-2.5 rounded-full border border-yellow-200 mb-6 animate-bounce shadow-sm inline-flex">
                        <div className="bg-yellow-400 rounded-full p-1">
                            <Coins className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-yellow-700">
                            보너스 <span className="text-rose-500">+{FEED_REWARD_AMOUNT}</span> Pet Coin 적립 완료!
                        </span>
                    </div>

                    <p className="text-gray-500 font-medium">우리 아이의 일기가 소셜 피드에 올라갔어요 💙</p>
                </div>

                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <button onClick={() => sharedFeedId ? navigate(`/feed`) : navigate('/feed')} className="w-full px-6 py-4 bg-gradient-to-r from-sky-400 to-blue-400 text-white rounded-2xl font-bold shadow-[0_8px_20px_rgba(135,206,235,0.3)] hover:shadow-xl hover:scale-[1.02] transition-all">
                        작성한 피드 보기
                    </button>
                    <button onClick={onHome} className="w-full px-6 py-4 bg-white border-2 border-blue-100 text-blue-500 rounded-2xl font-bold hover:bg-blue-50 transition-colors">
                        내 다이어리 보관함
                    </button>
                    <button onClick={() => navigate('/')} className="w-full px-6 py-3 text-gray-400 font-medium hover:text-gray-600 transition-colors">
                        홈으로
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="bg-[#FFF5F6] p-8 rounded-[2.5rem] shadow-[8px_8px_0px_rgba(255,182,193,0.2)] border-2 border-pink-100 mb-8 relative transform rotate-1 transition-transform hover:rotate-0">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-pink-100/50 -rotate-2 backdrop-blur-sm rounded-sm"></div>
                <div className="bg-pink-100 p-6 rounded-full mb-6 relative inline-block">
                    <Check className="w-12 h-12 text-pink-500" />
                    <div className="absolute top-0 right-0 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-700 mb-3 font-['Jua'] drop-shadow-sm">일기 작성이<br />완료되었어요!</h2>

                {earnedAmount !== null && (
                    <div className="inline-flex items-center gap-3 bg-[#FFF9C4] pl-2 pr-6 py-2 rounded-full border border-yellow-200 animate-bounce shadow-sm">
                        <div className="bg-yellow-400 rounded-full p-2">
                            <Coins className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-[#8B5E3C] text-lg">
                            <span className="text-rose-500 mr-1.5">+{earnedAmount}</span>
                            Pet Coin 적립 완료!
                        </span>
                    </div>
                )}
            </div>

            <div className="flex gap-4 mt-2 mb-12">
                <button onClick={onHome} className="px-6 py-3.5 bg-white border-2 border-pink-100 text-pink-500 rounded-2xl font-bold hover:bg-pink-50 transition-colors shadow-sm">
                    내 다이어리 보기
                </button>
                <button onClick={() => handleShareClick('PUBLIC')} disabled={isSharing} className="px-8 py-3.5 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-2xl font-bold flex items-center gap-2 shadow-[0_4px_15px_rgba(255,105,180,0.3)] hover:scale-105 transition-all">
                    <Share2 className="w-5 h-5" /> {isSharing ? '공유 중...' : '피드 공유하기'}
                </button>
            </div>

            {/* External Share Buttons */}
            <div className="flex gap-4 items-center justify-center relative">
                <div className="absolute -top-10 text-gray-400 font-['Jua'] text-sm bg-white/50 px-3 py-1 rounded-full">친구에게 자랑하기</div>

                <button
                    onClick={() => handleExternalShare('facebook')}
                    className="relative flex flex-col items-center gap-2 group"
                >
                    <div className="absolute -top-12 bg-blue-500 text-white text-base px-4 py-2 rounded-lg font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Facebook
                    </div>
                    <div className="w-14 h-14 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md group-hover:bg-blue-500 group-hover:border-blue-500 group-hover:scale-110 transition-all cursor-pointer">
                        <Facebook className="w-7 h-7 text-gray-600 group-hover:text-white group-hover:fill-current transition-colors" />
                    </div>
                </button>

                <button
                    onClick={() => handleExternalShare('message')}
                    className="relative flex flex-col items-center gap-2 group"
                >
                    <div className="absolute -top-12 bg-yellow-400 text-gray-800 text-base px-4 py-2 rounded-lg font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        KakaoTalk
                    </div>
                    <div className="w-14 h-14 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md group-hover:bg-yellow-400 group-hover:border-yellow-400 group-hover:scale-110 transition-all cursor-pointer">
                        <svg
                            className="w-7 h-7 text-gray-600 group-hover:text-gray-800 transition-colors"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M12 2C6.48 2 2 5.58 2 10c0 2.76 1.56 5.18 4 6.65V22l5.5-3.5c.5.08 1 .12 1.5.12 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
                        </svg>
                    </div>
                </button>

                <button
                    onClick={() => handleExternalShare('instagram')}
                    className="relative flex flex-col items-center gap-2 group"
                >
                    <div className="absolute -top-12 bg-rose-600 text-white text-base px-4 py-2 rounded-lg font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Instagram
                    </div>
                    <div className="w-14 h-14 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md group-hover:bg-rose-600 group-hover:border-rose-600 group-hover:scale-110 transition-all cursor-pointer">
                        <Instagram className="w-7 h-7 text-gray-600 group-hover:text-white transition-colors" />
                    </div>
                </button>

                <button
                    onClick={() => handleExternalShare('link')}
                    className="relative flex flex-col items-center gap-2 group"
                >
                    <div className="absolute -top-12 bg-slate-700 text-white text-base px-4 py-2 rounded-lg font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Copy Link
                    </div>
                    <div className="w-14 h-14 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md group-hover:bg-slate-700 group-hover:border-slate-700 group-hover:scale-110 transition-all cursor-pointer">
                        <LinkIcon className="w-7 h-7 text-gray-600 group-hover:text-white transition-colors" />
                    </div>
                </button>
            </div>
        </div>
    );
};

export default CompleteStep;