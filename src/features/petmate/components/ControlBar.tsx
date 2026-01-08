import { motion } from 'framer-motion';
import {
    MapPin,
    Power,
    Settings2,
    RefreshCw,
    Users,
    Sparkles,
    Heart
} from 'lucide-react';

interface ControlBarProps {
    isOnline: boolean;
    onOnlineToggle: () => void;
    currentLocation: string;
    onLocationClick: () => void;
    onFilterClick: () => void;
    onRefresh: () => void;
    isRefreshing: boolean;
    onMatchesClick: () => void;
    pendingCount: number;
    candidatesCount: number;
}

/**
 * 펫메이트 컨트롤 바 - AI Studio 스타일
 * 왼쪽: 온라인, 위치, 매칭친구
 * 오른쪽: 필터, 새로고침
 */
export function ControlBar({
    isOnline,
    onOnlineToggle,
    currentLocation,
    onLocationClick,
    onFilterClick,
    onRefresh,
    isRefreshing,
    onMatchesClick,
    pendingCount,
    candidatesCount
}: ControlBarProps) {
    return (
        <>
            {/* 모바일 하단 컨트롤 바 */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-3">
                <motion.div
                    className="flex items-center justify-around p-3 rounded-[20px] bg-white/90 backdrop-blur-md shadow-lg border-2 border-pink-200"
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    {/* 온라인 상태 */}
                    <motion.button
                        onClick={onOnlineToggle}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl ${isOnline ? 'text-green-600' : 'text-gray-400'}`}
                        whileTap={{ scale: 0.9 }}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOnline ? 'bg-green-100' : 'bg-gray-100'}`}>
                            <Power className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold">{isOnline ? 'ON' : 'OFF'}</span>
                    </motion.button>

                    {/* 위치 */}
                    <motion.button
                        onClick={onLocationClick}
                        className="flex flex-col items-center gap-1 p-2 rounded-xl text-pink-500"
                        whileTap={{ scale: 0.9 }}
                    >
                        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold truncate max-w-[50px]">{currentLocation.split(' ').pop()}</span>
                    </motion.button>

                    {/* 필터 */}
                    <motion.button
                        onClick={onFilterClick}
                        className="flex flex-col items-center gap-1 p-2 rounded-xl text-amber-600"
                        whileTap={{ scale: 0.9 }}
                    >
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <Settings2 className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold">필터</span>
                    </motion.button>

                    {/* 새로고침 */}
                    <motion.button
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className="flex flex-col items-center gap-1 p-2 rounded-xl text-green-600 disabled:opacity-50"
                        whileTap={{ scale: 0.9 }}
                    >
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </div>
                        <span className="text-xs font-bold">새로고침</span>
                    </motion.button>

                    {/* 매칭친구 */}
                    <motion.button
                        onClick={onMatchesClick}
                        className="relative flex flex-col items-center gap-1 p-2 rounded-xl text-pink-500"
                        whileTap={{ scale: 0.9 }}
                    >
                        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                            <Users className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold">친구</span>
                        {pendingCount > 0 && (
                            <div className="absolute top-0 right-0 w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs font-bold">
                                {pendingCount}
                            </div>
                        )}
                    </motion.button>
                </motion.div>
            </div>

            {/* 데스크탑 왼쪽 사이드바 - AI Studio 스타일 */}
            <div className="hidden lg:block fixed left-6 top-28 z-40 w-64">
                <motion.div
                    className="space-y-4"
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                >
                    {/* 온라인 상태 카드 */}
                    <motion.div
                        onClick={onOnlineToggle}
                        className={`relative p-5 rounded-[20px] cursor-pointer transition-all shadow-md ${isOnline
                                ? 'bg-[#E8F5E9] border-2 border-green-300'
                                : 'bg-white border-2 border-gray-200'
                            }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-pink-400 text-white text-xs font-bold shadow">
                            {isOnline ? 'ON ✨' : 'OFF'}
                        </div>

                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isOnline ? 'bg-green-400' : 'bg-gray-300'}`}>
                                <Power className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className={`font-bold text-lg ${isOnline ? 'text-green-700' : 'text-gray-600'}`}>
                                    {isOnline ? '매칭 활성화' : '오프라인'}
                                </p>
                                <p className="text-sm text-gray-500">클릭하여 전환</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* 위치 카드 */}
                    <motion.div
                        onClick={onLocationClick}
                        className="p-5 rounded-[20px] bg-white border-2 border-pink-200 cursor-pointer shadow-md hover:border-pink-300 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-pink-400 flex items-center justify-center shadow-md">
                                <MapPin className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-800 truncate">{currentLocation}</p>
                                <p className="text-sm text-pink-500">위치 변경하기 📍</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* 매칭 친구 카드 */}
                    <motion.div
                        onClick={onMatchesClick}
                        className="relative p-5 rounded-[20px] bg-[#FCE4EC] border-2 border-pink-300 cursor-pointer shadow-md"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="absolute -top-2 right-4 flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-400 text-white text-xs font-bold shadow">
                            <Heart className="w-3 h-3 fill-white" />
                            Special
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-pink-400 flex items-center justify-center shadow-md">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-pink-700">매칭 친구 💕</p>
                                <p className="text-sm text-pink-500">요청 & 친구 목록</p>
                            </div>
                            {pendingCount > 0 && (
                                <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold animate-bounce shadow-md">
                                    {pendingCount}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* 발견 카운트 */}
                    <div className="p-5 rounded-[20px] bg-white border-2 border-yellow-200 shadow-md">
                        <div className="flex items-center justify-center gap-4">
                            <Sparkles className="w-6 h-6 text-yellow-400 fill-yellow-200" />
                            <div className="text-center">
                                <p className="text-3xl font-black text-pink-500">{candidatesCount}</p>
                                <p className="text-sm font-bold text-gray-600">펫메이트 발견! 🐾</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* 데스크탑 오른쪽 사이드바 - 필터 & 새로고침 */}
            <div className="hidden lg:block fixed right-6 top-28 z-40 w-48">
                <motion.div
                    className="space-y-3"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                >
                    {/* 필터 버튼 */}
                    <motion.button
                        onClick={onFilterClick}
                        className="w-full p-4 rounded-[16px] bg-white border-2 border-amber-200 cursor-pointer shadow-md hover:border-amber-300 transition-colors flex items-center gap-3"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
                            <Settings2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-gray-700">필터 설정</span>
                    </motion.button>

                    {/* 새로고침 버튼 */}
                    <motion.button
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className="w-full p-4 rounded-[16px] bg-white border-2 border-green-200 cursor-pointer shadow-md hover:border-green-300 transition-colors disabled:opacity-50 flex items-center gap-3"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center shadow-md">
                            <RefreshCw className={`w-5 h-5 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
                        </div>
                        <span className="font-bold text-gray-700">새로고침</span>
                    </motion.button>
                </motion.div>
            </div>
        </>
    );
}
