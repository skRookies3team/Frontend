import React from 'react';
import { motion } from 'framer-motion';
import { PortfolioDiary } from '../types/diary';

interface MemoryAlbumProps {
    diaries: PortfolioDiary[];
    onSelect: (diary: PortfolioDiary) => void;
    onSwitchView: (view: '3d' | 'album') => void;
}

// --- SVG Assets for Blobs ---
const PinkBlob = () => (
    <svg viewBox="0 0 500 400" className="w-full h-full drop-shadow-sm opacity-90">
        <path d="M420.5 285.5C385.5 330.5 325 365 260 360C195 355 125.5 310.5 90 260C54.5 209.5 53 153 85 110C117 67 182.5 37.5 245 40C307.5 42.5 367 77 395 125C423 173 455.5 240.5 420.5 285.5Z" fill="#F8BBD0" />
    </svg>
);

const YellowBlob = () => (
    <svg viewBox="0 0 500 400" className="w-full h-full drop-shadow-sm opacity-90">
        <path d="M410 300C365 350 280 380 200 360C120 340 50 270 40 190C30 110 80 40 160 25C240 10 330 50 380 110C430 170 455 250 410 300Z" fill="#FFF9C4" />
    </svg>
);

const GreenBlob = () => (
    <svg viewBox="0 0 400 300" className="w-full h-full drop-shadow-sm opacity-90">
        <path d="M350 200C320 250 250 280 180 270C110 260 50 210 40 150C30 90 70 40 140 30C210 20 290 50 330 100C370 150 380 150 350 200Z" fill="#DCEDC8" />
    </svg>
);

const CameraSticker = () => (
    <svg viewBox="0 0 100 120" className="w-16 h-16 inline-block mr-2 drop-shadow-md transform -rotate-12 hover:rotate-0 transition-transform">
        {/* Camera Body (Pink) */}
        <rect x="15" y="10" width="70" height="60" rx="10" fill="#F8BBD0" stroke="#F48FB1" strokeWidth="3" />

        {/* Top Accent (Blue) */}
        <path d="M15 25 L85 25 L85 20 C85 15 80 10 75 10 L25 10 C20 10 15 15 15 20 Z" fill="#81D4FA" stroke="#4FC3F7" strokeWidth="3" />

        {/* Lens Area */}
        <circle cx="50" cy="45" r="20" fill="#FFF" stroke="#F48FB1" strokeWidth="3" />
        <circle cx="50" cy="45" r="15" fill="#444" />
        <circle cx="55" cy="40" r="5" fill="#FFF" opacity="0.6" />

        {/* Flash & Viewfinder */}
        <rect x="65" y="15" width="10" height="8" rx="2" fill="#FFEB3B" stroke="#FBC02D" strokeWidth="2" />
        <rect x="25" y="15" width="8" height="8" rx="2" fill="#E1F5FE" stroke="#81D4FA" strokeWidth="2" />

        {/* Shutter Button */}
        <rect x="65" y="5" width="10" height="5" rx="2" fill="#F48FB1" />

        {/* Polaroid Photo Coming Out */}
        <g transform="translate(25, 65)">
            <rect x="0" y="0" width="50" height="45" fill="#FFF" stroke="#E0E0E0" strokeWidth="1" rx="1" />
            <rect x="5" y="5" width="40" height="30" fill="#FFEBEE" />

            {/* Heart on Photo */}
            <path d="M25 25 C25 25, 15 15, 15 20 C15 25, 25 32, 25 32 C25 32, 35 25, 35 20 C35 15, 25 15, 25 25 Z" fill="#FF4081" />
        </g>
    </svg>
);

const MemoryAlbum: React.FC<MemoryAlbumProps> = ({ diaries, onSelect, onSwitchView }) => {
    return (
        <div className="w-full h-full overflow-y-auto custom-scrollbar relative bg-[#FFF5F7]">
            {/* ... (Notebook Tabs & Backgrounds remain same) ... */}

            {/* --- Notebook Tabs Navigation (Top Center) --- */}
            <div className="absolute top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
                <div className="flex gap-2 pointer-events-auto">
                    {/* Tab 1: 3D Sphere (Inactive) */}
                    <button
                        onClick={() => onSwitchView('3d')}
                        className="bg-indigo-300 hover:bg-indigo-400 text-white font-['Jua'] px-6 py-3 rounded-b-xl shadow-md transition-all transform hover:-translate-y-1 mt-[-5px] hover:mt-0 opacity-90"
                    >
                        🔮 3D 스페이스
                    </button>

                    {/* Tab 2: Memory Album (Active) */}
                    <div className="bg-[#FFF9C4] text-gray-700 font-['Jua'] px-8 py-4 rounded-b-2xl shadow-lg border-b-4 border-yellow-200 z-10 flex items-center gap-2 transform translate-y-1">
                        📒 추억 앨범
                        <span className="text-yellow-500 animate-pulse">✨</span>
                    </div>
                </div>
            </div>

            {/* --- Background Texture (Checkered) --- */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(45deg, #F8BBD0 25%, transparent 25%, transparent 75%, #F8BBD0 75%, #F8BBD0), 
                                      linear-gradient(45deg, #F8BBD0 25%, transparent 25%, transparent 75%, #F8BBD0 75%, #F8BBD0)`,
                    backgroundSize: '40px 40px',
                    backgroundPosition: '0 0, 20px 20px'
                }}
            />

            {/* --- Organic Blobs Background Zones --- */}
            <div className="absolute top-20 left-10 w-[500px] h-[400px] z-0 pointer-events-none">
                <PinkBlob />
                <span className="absolute top-20 left-20 font-['Jua'] text-pink-400 text-2xl -rotate-12 opacity-80">My Loves</span>
            </div>
            <div className="absolute top-40 right-10 w-[400px] h-[350px] z-0 pointer-events-none">
                <YellowBlob />
                <span className="absolute bottom-20 right-20 font-['Jua'] text-yellow-500 text-2xl rotate-6 opacity-80">Highlights</span>
            </div>
            <div className="absolute bottom-10 left-1/3 w-[450px] h-[300px] z-0 pointer-events-none">
                <GreenBlob />
                <span className="absolute bottom-10 left-20 font-['Jua'] text-green-500 text-2xl -rotate-3 opacity-80">Daily Life</span>
            </div>

            {/* --- Header Spacer --- */}
            <div className="h-24 relative z-10" />

            {/* --- Main Grid Content --- */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pb-32">

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
                    {/* Header Title as a Sticky Note */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="col-span-1 md:col-span-2 row-span-1 flex items-centerjustify-center p-4 relative"
                    >
                        <div className="bg-[#FFF9C4] w-full h-full min-h-[150px] shadow-md transform -rotate-2 p-6 flex flex-col items-center justify-center relative">
                            {/* Tape */}
                            <div className="absolute -top-3 w-32 h-8 bg-pink-200/60 rotate-2" />
                            <h1 className="font-['Jua'] text-4xl text-gray-700 mb-2 flex items-center">
                                <CameraSticker />
                                추억 앨범
                            </h1>
                            <p className="font-['Gaegu'] text-xl text-gray-500">우리의 소중한 순간들을 모았어요!</p>
                            <span className="absolute -bottom-4 -right-4 text-3xl"></span>
                        </div>
                    </motion.div>

                    {diaries.map((diary, index) => {
                        // Randomize styles slightly
                        const isPolaroid = index % 3 === 0;
                        const isSticky = index % 3 === 1;
                        const rotate = (index % 5) - 2; // -2 to 2 degrees

                        return (
                            <motion.div
                                key={diary.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                whileHover={{
                                    scale: 1.05,
                                    rotate: 0,
                                    zIndex: 30
                                }}
                                className="relative cursor-pointer group"
                                onClick={() => onSelect(diary)}
                                style={{ transform: `rotate(${rotate}deg)` }}
                            >
                                {isPolaroid ? (
                                    // Style 1: Classic Polaroid
                                    <div className="bg-white p-3 pb-10 shadow-lg hover:shadow-2xl transition-all">
                                        <div className="aspect-square bg-gray-100 overflow-hidden border border-gray-100 mb-3">
                                            <img src={diary.src} alt={diary.title} className="w-full h-full object-cover" loading="lazy" />
                                        </div>
                                        <div className="text-center font-['Gaegu'] text-gray-600 text-lg">
                                            {diary.title}
                                            {diary.weather && <span className="ml-2 text-base">{diary.weather}</span>}
                                        </div>
                                        {/* Pin */}
                                        <div className="absolute -top-3 left-1/2 w-4 h-4 rounded-full bg-red-400 shadow-sm border border-red-500" />
                                    </div>
                                ) : isSticky ? (
                                    // Style 2: Sticky Memory Note (No Photo Border)
                                    <div className="p-4 shadow-md hover:shadow-xl transition-all relative"
                                        style={{ backgroundColor: diary.color || '#E1BEE7' }}>
                                        {/* Masking Tape */}
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-white/40 rotate-1" />

                                        <div className="aspect-[4/3] w-full overflow-hidden rounded-sm mb-2 shadow-inner">
                                            <img src={diary.src} alt={diary.title} className="w-full h-full object-cover" loading="lazy" />
                                        </div>
                                        <h3 className="font-['Jua'] text-gray-700 text-lg mb-1">{diary.title}</h3>
                                        <p className="font-['Gaegu'] text-gray-600 text-sm line-clamp-2">{diary.content}</p>
                                        <div className="mt-2 flex justify-end text-xs text-gray-500 font-bold">
                                            {diary.date}
                                        </div>
                                    </div>
                                ) : (
                                    // Style 3: Clean Card with Sticker
                                    <div className="bg-white rounded-xl p-2 shadow-md hover:shadow-xl transition-all border-2 border-dashed border-gray-200">
                                        <div className="aspect-square rounded-lg overflow-hidden mb-2">
                                            <img src={diary.src} alt={diary.title} className="w-full h-full object-cover" loading="lazy" />
                                        </div>
                                        <div className="flex justify-between items-center px-1">
                                            <span className="font-['Jua'] text-gray-700">{diary.location}</span>
                                            <span className="text-xl"></span>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 10px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #F48FB1; border-radius: 5px; border: 2px solid #FFF5F7; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #F06292; }
                
                .animate-spin-slow { animation: spin 10s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default MemoryAlbum;
