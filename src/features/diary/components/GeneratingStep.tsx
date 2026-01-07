import { useState, useEffect } from 'react';
import { Dog, Cat, Bird, Fish, PawPrint, Sparkles } from 'lucide-react';

const icons = [Dog, Cat, Bird, Fish, PawPrint];
const iconColors = ['text-amber-500', 'text-gray-500', 'text-blue-400', 'text-pink-400', 'text-purple-400'];

const GeneratingStep = ({ progress }: { progress: number }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % icons.length);
        }, 800);
        return () => clearInterval(interval);
    }, []);

    const CurrentIcon = icons[currentIndex];
    const currentColor = iconColors[currentIndex];

    return (
        <div className="relative flex flex-col items-center justify-center py-20 min-h-[60vh] overflow-hidden w-full">
            {/* Pastel Background Blobs - Reference Style */}
            <div className="absolute top-0 right-10 w-64 h-64 bg-blue-100/60 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-10 left-10 w-72 h-72 bg-pink-100/60 rounded-full blur-3xl animate-pulse-slow delay-700" />
            <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-yellow-100/60 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center space-y-10 animate-fade-in">

                {/* Cute Spinner Container */}
                <div className="relative w-48 h-48">
                    {/* Decorative Outer Ring */}
                    <div className="absolute inset-0 rounded-full border-[6px] border-white shadow-xl bg-white/30 backdrop-blur-sm"></div>

                    {/* Pink Progress Spinner */}
                    <div
                        className="absolute inset-2 rounded-full border-[6px] border-pink-200"
                    ></div>
                    <div
                        className="absolute inset-2 rounded-full border-[6px] border-pink-400 border-t-transparent animate-spin"
                    ></div>

                    {/* Inner Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="relative mb-2 transition-all duration-300 transform scale-110">
                            <CurrentIcon
                                className={`w-12 h-12 ${currentColor} transition-colors duration-500`}
                                strokeWidth={2.5}
                            />
                            <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-yellow-400 animate-bounce fill-yellow-200" />
                        </div>
                        <span className="text-2xl font-bold text-gray-700 font-['Jua'] drop-shadow-sm">
                            {progress}%
                        </span>
                    </div>
                </div>

                {/* Text Section */}
                <div className="text-center space-y-3">
                    <h2 className="text-3xl font-bold text-gray-800 font-['Jua'] flex items-center justify-center gap-2">
                        AI가 일기를 쓰고 있어요
                        <span className="animate-bounce">✏️</span>
                    </h2>
                    <p className="text-gray-500 font-medium text-lg bg-white/40 px-6 py-2 rounded-full backdrop-blur-md border border-white/50 shadow-sm">
                        사진 속 추억과 날씨 정보를<br />
                        꼼꼼히 분석하고 있답니다
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GeneratingStep;