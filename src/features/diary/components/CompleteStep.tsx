import React from 'react';

// [수정]: children prop의 타입을 명시적으로 React.ReactNode로 추가합니다.
const Icon: React.FC<{ className?: string, children: React.ReactNode }> = ({ children, className }) => <span className={`inline-flex items-center justify-center ${className}`}>{children}</span>;

export default function CompleteStep() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6">
            <div className="relative">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-xl md:h-40 md:w-40">
                    <Icon className="h-16 w-16 text-white md:h-20 md:w-20">{'✓'}</Icon>
                </div>
            </div>

            <div className="text-center">
                <h2 className="text-balance text-3xl font-bold text-pink-600 md:text-4xl">다이어리 게시 완료!</h2>
                <p className="mt-2 text-lg text-slate-500 md:text-xl">100 펫코인을 획득했어요</p>

                <div className="mt-6 rounded-2xl bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 p-6 md:p-8">
                    <p className="text-3xl font-bold text-pink-600 md:text-4xl">+100</p>
                    <p className="text-sm text-slate-500 md:text-base">펫코인</p>
                </div>
            </div>
        </div>
    );
}