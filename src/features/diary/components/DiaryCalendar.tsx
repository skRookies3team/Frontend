import { useState, useEffect } from 'react';
import {
    format, addMonths, subMonths, startOfMonth, endOfMonth,
    startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay,
    parseISO
} from 'date-fns';
// import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Sparkles, BookOpen, Dog, HelpCircle, X, ArrowRight } from 'lucide-react';

import { useDiaryAuth } from "../hooks/useDiaryAuth";
import { getDiariesByDate } from "../api/diary-api";

interface DiaryCalendarProps {
    selectedDate: string; // YYYY-MM-DD
    onDateSelect: (date: string) => void;
    onRecapClick?: () => void;
    diaryEntries?: any[]; // Keep for prop compatibility if needed
}

const DiaryCalendar = ({ selectedDate, onDateSelect, onRecapClick }: DiaryCalendarProps) => {
    const { user } = useDiaryAuth();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [entries, setEntries] = useState<any[]>([]);


    const [showInfoModal, setShowInfoModal] = useState(false);
    const today = new Date();

    // Palette for colorful empty states
    const EMPTY_COLORS = [
        { bg: 'bg-orange-50/50', text: 'text-orange-200', hover: 'group-hover:text-orange-300' },
        { bg: 'bg-blue-50/50', text: 'text-blue-200', hover: 'group-hover:text-blue-300' },
        { bg: 'bg-green-50/50', text: 'text-green-200', hover: 'group-hover:text-green-300' },
        { bg: 'bg-purple-50/50', text: 'text-purple-200', hover: 'group-hover:text-purple-300' },
        { bg: 'bg-pink-50/50', text: 'text-pink-200', hover: 'group-hover:text-pink-300' },
        { bg: 'bg-yellow-50/50', text: 'text-yellow-200', hover: 'group-hover:text-yellow-300' },
        { bg: 'bg-teal-50/50', text: 'text-teal-200', hover: 'group-hover:text-teal-300' },
    ];

    // Fetch monthly diaries when currentMonth or user changes
    useEffect(() => {
        if (user) {
            fetchMonthlyData();
        }
    }, [currentMonth, user]);

    const fetchMonthlyData = async () => {
        if (!user) return;

        try {
            // [MODIFIED] Use getDiariesByDate (daily API) to fetch for the whole month
            const monthStart = startOfMonth(currentMonth);
            const monthEnd = endOfMonth(monthStart);
            const daysToFetch: string[] = [];

            let dayIterator = monthStart;
            while (dayIterator <= monthEnd) {
                daysToFetch.push(format(dayIterator, 'yyyy-MM-dd'));
                dayIterator = addDays(dayIterator, 1);
            }


            const BATCH_SIZE = 5;
            const results: { date: string, data: any }[] = [];

            // Chunked sequential fetching
            for (let i = 0; i < daysToFetch.length; i += BATCH_SIZE) {
                const batch = daysToFetch.slice(i, i + BATCH_SIZE);
                // Parallel within batch
                const batchResponses = await Promise.all(
                    batch.map(date =>
                        getDiariesByDate(user.id, date)
                            .then(res => ({ date, data: res }))
                            .catch((err) => {
                                console.warn(`Failed to fetch for ${date}:`, err);
                                return { date, data: [] };
                            })
                    )
                );
                results.push(...batchResponses);
                // Small delay to be gentle to backend
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            // Aggregate results
            const allEntries = results.flatMap(({ date, data }) => {
                if (Array.isArray(data)) {
                    return data.map((d: any) => ({
                        ...d,
                        date: date
                    }));
                }
                return [];
            });

            console.log("[DiaryCalendar] Fetched entries:", allEntries);
            if (allEntries.length > 0 && allEntries[0].images) {
                console.log("[DiaryCalendar] First Entry Images:", allEntries[0].images);
            }
            setEntries(allEntries);

        } catch (error) {
            console.error("Failed to fetch monthly diaries:", error);
            setEntries([]);
        } finally {

        }
    };

    const renderHeader = () => {
        return (
            <div className="flex flex-col gap-6 mb-8 animate-fade-in-down">
                {/* Vintage Recap Button Area - Restored */}
                <div className="flex justify-center mb-2">
                    <button
                        onClick={onRecapClick}
                        className="relative group cursor-pointer transition-transform hover:scale-105"
                    >
                        {/* Tape Effect */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-yellow-100/90 rotate-1 shadow-sm border-l border-r border-white/60 z-20 backdrop-blur-[1px]" />

                        <div className="relative z-10 bg-[#fff9f0] border-2 border-[#e6dcc8] px-8 py-4 rounded-xl shadow-lg flex items-center gap-4 min-w-[320px]">
                            <div className="bg-violet-100 p-2 rounded-lg text-violet-600">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <div className="text-left flex-1">
                                <h3 className="text-gray-800 font-serif font-bold text-lg flex items-center gap-2">
                                    월간 리캡 보기 <Sparkles className="w-4 h-4 text-yellow-500" />
                                </h3>
                                <p className="text-xs text-gray-500 font-medium">지난달의 소중한 추억을 모아봤어요</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-violet-500 transition-colors" />
                        </div>
                    </button>
                </div>

                {/* Modern Simple Header */}
                <div className="flex items-center justify-between px-2 mt-4">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-50 rounded-full text-gray-500 hover:text-gray-900 transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <h2 className="text-2xl text-gray-800 flex items-center gap-2 font-['Jua']">
                        {format(currentMonth, 'yyyy')}년 <span className="text-pink-500">{format(currentMonth, 'M')}월</span>
                    </h2>

                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-50 rounded-full text-gray-500 hover:text-gray-900 transition-colors">
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = [];
        const date = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        for (let i = 0; i < 7; i++) {
            days.push(
                <div key={i} className="text-center text-sm font-medium text-gray-400 py-4">
                    {date[i]}
                </div>
            );
        }
        return <div className="grid grid-cols-7 mb-2">{days}</div>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = '';

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, 'd');
                const isoDateStr = format(day, 'yyyy-MM-dd');
                const isSelected = isSameDay(day, parseISO(selectedDate));
                // const isToday = isSameDay(day, today);
                const isCurrentMonth = isSameMonth(day, monthStart);

                // Find diary entry for this day
                const entry = entries.find((e: any) => e.date === isoDateStr);

                // Find main image
                let displayImage = null;
                if (entry && entry.images && entry.images.length > 0) {
                    // Try to find image with mainImage: true
                    const mainImg = entry.images.find((img: any) => img.mainImage === true);
                    displayImage = mainImg ? mainImg.imageUrl : entry.images[0].imageUrl;
                }

                days.push(
                    <div
                        key={day.toString()}
                        className={`
                            flex flex-col items-center gap-2 mb-6 cursor-pointer group relative
                            ${!isCurrentMonth ? 'opacity-30' : ''}
                        `}
                        onClick={() => {
                            if (isCurrentMonth) onDateSelect(isoDateStr);
                        }}
                    >
                        {/* Visual Square Container */}
                        <div className={`
                            relative w-full aspect-square rounded-2xl overflow-hidden shadow-sm transition-all duration-300
                            ${isSelected ? 'ring-2 ring-offset-2 ring-gray-800 transform scale-105' : 'hover:scale-105'}
                            ${!displayImage ? 'bg-gray-100 flex items-center justify-center' : ''}
                        `}>
                            {displayImage ? (
                                <>
                                    <img
                                        src={displayImage}
                                        alt="Day thumbnail"
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Edit Icon Overlay */}
                                    {isCurrentMonth && (
                                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-full p-1">
                                            <Sparkles className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </>
                            ) : (
                                // Empty State with Colorful Icon
                                (() => {
                                    // Deterministic random color based on date
                                    const colorIndex = day.getDate() % EMPTY_COLORS.length;
                                    const colors = EMPTY_COLORS[colorIndex];

                                    return (
                                        <div className={`
                                            w-full h-full flex items-center justify-center transition-colors
                                            ${isSelected ? 'bg-pink-100' : `${colors.bg} group-hover:bg-opacity-80`}
                                        `}>
                                            <Dog className={`
                                                w-8 h-8 
                                                ${isSelected ? 'text-pink-400' : `${colors.text} ${colors.hover}`}
                                                transition-colors
                                            `} />
                                            {/* Subtle Plus on Hover */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                <div className="bg-white/80 rounded-full p-2 shadow-sm">
                                                    <Sparkles className="w-4 h-4 text-gray-400" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()
                            )}

                            {/* Selection Overlay (if selected but no image, maybe slight tint?) */}
                            {isSelected && !displayImage && (
                                <div className="absolute inset-0 bg-gray-200/50" />
                            )}
                        </div>

                        {/* Date Number & Status */}
                        <div className="flex flex-col items-center gap-1">
                            <span className={`
                                text-sm font-medium
                                ${isSelected ? 'text-gray-900 font-bold' : 'text-gray-600'}
                            `}>
                                {formattedDate}
                            </span>

                            {/* Status Dot */}
                            {displayImage && (
                                <div className={`
                                    w-1.5 h-1.5 rounded-full
                                    ${isSelected ? 'bg-blue-500' : 'bg-gray-300'}
                                `} />
                            )}
                            {/* Today Dot (if needed, maybe distinct color) */}
                            {!displayImage && isSameDay(day, today) && (
                                <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                            )}
                        </div>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div key={day.toString()} className="grid grid-cols-7 gap-3 px-2">
                    {days}
                </div>
            );
            days = [];
        }

        return <div className="pb-10">{rows}</div>;
    };

    return (
        <div className="relative w-full max-w-[1400px] mx-auto px-4 md:px-8 animate-fade-in bg-white/50 min-h-[600px]">
            {/* Info Modal Trigger - Prominent CTA */}
            <button
                onClick={() => setShowInfoModal(true)}
                className="absolute top-6 right-4 md:right-8 bg-white/90 backdrop-blur-sm border border-pink-200 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2 group z-20"
            >
                <div className="bg-yellow-100 p-1 rounded-full group-hover:rotate-12 transition-transform">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                </div>
                <span className="text-sm font-bold text-gray-700 font-['Jua'] group-hover:text-pink-500 transition-colors">
                    100코인 받기
                </span>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                </span>
            </button>

            {renderHeader()}
            {renderDays()}
            {/* Swipable content area could go here, but for now just grid */}
            {renderCells()}

            {/* Info Modal Overlay */}
            {showInfoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowInfoModal(false)}>
                    <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl relative animate-scale-up border border-pink-100" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setShowInfoModal(false)}
                            className="absolute top-6 right-6 text-gray-300 hover:text-gray-500 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            {/* Icon Box */}
                            <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-rose-500 rounded-[28px] flex items-center justify-center mb-6 shadow-lg shadow-pink-200">
                                <Sparkles className="w-12 h-12 text-white" />
                            </div>

                            <h3 className="text-2xl font-bold text-pink-600 mb-3 font-['Jua']">AI 다이어리</h3>

                            <p className="text-gray-600 mb-8 leading-relaxed break-keep font-medium text-sm">
                                오늘 하루 반려동물과 함께한 순간을 사진으로 업로드하면, AI가 감성적인 일기를 작성해드려요
                            </p>

                            <div className="w-full space-y-3 mb-8 text-left pl-4">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                                    <span className="font-medium text-sm">사진 1-10장 업로드</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                                    <span className="font-medium text-sm">AI가 자동으로 일기 작성</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                                    <span className="font-medium text-sm">100 펫코인 획득</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowInfoModal(false)}
                                className="w-full bg-[#FF6B8B] hover:bg-[#ff527a] text-white font-bold py-3.5 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
                            >
                                <span>다이어리 작성하기</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiaryCalendar;
