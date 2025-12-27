import React from 'react';

const GeneratingStep = ({ progress }: { progress: number }) => (
    <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-fade-in">
        <div className="relative w-32 h-32">
            <div className="absolute inset-0 border-4 border-pink-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-pink-500 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-pink-600 font-bold text-xl">{progress}%</div>
        </div>
        <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">AI가 일기를 쓰고 있어요</h2>
            <p className="text-gray-500">사진 속 추억과 날씨 정보를 분석하고 있습니다...</p>
        </div>
    </div>
);

export default GeneratingStep;