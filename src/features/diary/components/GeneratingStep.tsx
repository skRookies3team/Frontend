import { useState, useEffect } from 'react';

const GeneratingStep = ({ progress }: { progress: number }) => {
    return (
        <div className="relative flex flex-col items-center justify-center py-20 min-h-[60vh] overflow-hidden w-full">
            {/* Background: Soft Night/Dreamy Vibe to suit 'sitting and watching' */}
            <div className="absolute inset-0 bg-[#F3E5F5]/30">
                {/* Moon/Planet Decoration */}
                <div className="absolute top-20 right-20 w-32 h-32 bg-yellow-100 rounded-full blur-2xl opacity-60 animate-pulse-slow"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center space-y-8 animate-fade-in">

                {/* Main Scene: Cats Sitting Back View */}
                <div className="relative w-80 h-64 flex items-center justify-center">

                    <svg viewBox="0 0 300 240" className="drop-shadow-lg">
                        <defs>
                            {/* Soft Shadow Filter */}
                            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        {/* Floor/Ground - Curved Horizon */}
                        <path d="M 20 200 Q 150 180 280 200" stroke="#E1BEE7" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.5" />

                        {/* --- CAT 1: The Black Cat (Soft Charcoal) --- */}
                        <g transform="translate(80, 80)">
                            {/* Body */}
                            <path d="M 40 120 Q 10 120 10 80 Q 10 30 40 20 Q 70 30 70 80 Q 70 120 40 120 Z"
                                fill="#424242" stroke="#424242" strokeWidth="2" />
                            {/* Head */}
                            <circle cx="40" cy="30" r="25" fill="#424242" />
                            {/* Ears */}
                            <path d="M 20 15 L 15 -10 L 35 15 Z" fill="#424242" />
                            <path d="M 60 15 L 65 -10 L 45 15 Z" fill="#424242" />

                            {/* TAIL - Animated */}
                            <g transform="translate(10, 110)"> {/* Anchor at base of tail */}
                                <path d="M 0 0 Q -20 -30 -10 -60"
                                    fill="none" stroke="#424242" strokeWidth="8" strokeLinecap="round"
                                    className="animate-tail-wag-left origin-bottom" />
                            </g>
                        </g>

                        {/* --- CAT 2: The White/Cream Cat --- */}
                        <g transform="translate(160, 90)"> {/* Slightly offset */}
                            {/* Body */}
                            <path d="M 40 110 Q 10 110 10 70 Q 10 20 40 10 Q 70 20 70 70 Q 70 110 40 110 Z"
                                fill="#FFF3E0" stroke="#FFCC80" strokeWidth="2" />
                            {/* Head */}
                            <circle cx="40" cy="20" r="23" fill="#FFF3E0" stroke="#FFCC80" strokeWidth="2" />
                            {/* Ears */}
                            <path d="M 20 10 L 15 -12 L 35 10 Z" fill="#FFF3E0" stroke="#FFCC80" strokeWidth="2" />
                            <path d="M 60 10 L 65 -12 L 45 10 Z" fill="#FFF3E0" stroke="#FFCC80" strokeWidth="2" />

                            {/* Patch/Pattern (Cheese Cat details) */}
                            <path d="M 40 10 Q 50 0 60 10 L 60 30 Q 50 40 40 30 Z" fill="#FFCC80" opacity="0.6" />

                            {/* TAIL - Animated */}
                            <g transform="translate(70, 100)"> {/* Anchor at base */}
                                <path d="M 0 0 Q 30 -40 10 -70"
                                    fill="none" stroke="#FFCC80" strokeWidth="8" strokeLinecap="round"
                                    className="animate-tail-wag-right origin-bottom" />
                            </g>
                        </g>

                        {/* Heart appearing between them */}
                        <g transform="translate(150, 60)" className="animate-float-heart">
                            <path d="M0 10 A10 10 0 0 1 20 10 A10 10 0 0 1 40 10 Q40 25 20 40 Q0 25 0 10 Z"
                                fill="#F48FB1" transform="scale(0.5) translate(-20, -20)" />
                        </g>

                        {/* Sparkles */}
                        <circle cx="100" cy="40" r="2" fill="#FFD54F" className="animate-twinkle delay-100" />
                        <circle cx="200" cy="30" r="3" fill="#FFD54F" className="animate-twinkle delay-300" />
                        <circle cx="150" cy="20" r="2" fill="#FFD54F" className="animate-twinkle delay-500" />

                    </svg>

                    {/* Progress Badge */}
                    <div className="absolute top-0 right-0">
                        <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg shadow-sm border border-purple-100">
                            <span className="text-sm font-bold text-gray-400 font-['Jua']">{progress}%</span>
                        </div>
                    </div>
                </div>

                {/* Text Context */}
                <div className="text-center space-y-3">
                    <h2 className="text-2xl font-bold text-gray-700 font-['Jua'] flex items-center justify-center gap-2">
                        살랑살랑, 추억을 엮는 중
                        <span className="text-2xl animate-bounce">🐈</span>
                    </h2>
                    <p className="text-gray-400 text-sm bg-white/50 px-6 py-2 rounded-full border border-purple-50 shadow-sm">
                        고양이들이 이야기를 모으고 있어요...
                    </p>
                </div>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes tail-wag-left {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(-15deg); }
                }
                
                @keyframes tail-wag-right {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(15deg); }
                }

                @keyframes float-heart {
                    0%, 100% { transform: translate(150px, 60px) scale(0.8); opacity: 0.8; }
                    50% { transform: translate(150px, 50px) scale(1); opacity: 1; }
                }

                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.2); }
                }

                .animate-tail-wag-left {
                    animation: tail-wag-left 2s ease-in-out infinite;
                    transform-origin: bottom center;
                }
                
                .animate-tail-wag-right {
                    animation: tail-wag-right 2s ease-in-out infinite alternate;
                    transform-origin: bottom center;
                }

                .animate-float-heart {
                    animation: float-heart 2.5s ease-in-out infinite;
                }
                
                .animate-twinkle {
                    animation: twinkle 3s ease-in-out infinite;
                }

                .animate-pulse-slow {
                    animation: pulse 5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-fade-in {
                    animation: fade-in 0.8s ease-out;
                }
            `}</style>
        </div>
    );
};

export default GeneratingStep;
