import React from 'react';

interface GeneratingStepProps {
    progress: number;
}

const Icon: React.FC<{ className?: string }> = ({ children, className }) => <span className={`inline-flex items-center justify-center ${className}`}>{children}</span>;

export default function GeneratingStep({ progress }: GeneratingStepProps) {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6">
            <div className="relative">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-xl md:h-40 md:w-40">
                    <Icon className="h-16 w-16 animate-pulse text-white md:h-20 md:w-20">{'✨'}</Icon>
                </div>
                <div className="absolute inset-0 animate-ping rounded-full bg-pink-500 opacity-20" />
            </div>

            <div className="w-full max-w-sm space-y-3 text-center">
                <h2 className="text-2xl font-bold text-pink-600 md:text-3xl">반려동물의 하루를 분석 중이에요...</h2>
                <p className="text-slate-500 md:text-lg">AI가 아름다운 일기를 작성하고 있어요</p>

                <div className="overflow-hidden rounded-full bg-pink-100">
                    <div
                        className="h-2 bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-300 md:h-3"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className="text-sm font-medium text-pink-600 md:text-base">{progress}%</p>
            </div>
        </div>
    );
}