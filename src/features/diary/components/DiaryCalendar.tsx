import { useState, useEffect } from 'react';
import {
    format, addMonths, subMonths, startOfMonth, endOfMonth,
    startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay,
    parseISO
} from 'date-fns';
// import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Sparkles, BookOpen, Dog, X, ArrowRight, Lightbulb } from 'lucide-react';

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
                            if (isCurrentMonth) {
                                // If diary exists, navigate to detail page
                                if (entry) {
                                    console.log('[Calendar Click] Entry:', entry);
                                    const diaryId = entry.id || entry.diaryId || entry.diary_id;
                                    if (diaryId) {
                                        console.log('[Calendar Click] Navigating to diary:', diaryId);
                                        window.location.href = `/diary/${diaryId}`;
                                    } else {
                                        console.log('[Calendar Click] No diary ID found, selecting date');
                                        onDateSelect(isoDateStr);
                                    }
                                } else {
                                    // If no diary, just select the date (for creating new diary)
                                    console.log('[Calendar Click] No entry, selecting date');
                                    onDateSelect(isoDateStr);
                                }
                            }
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
            {renderHeader()}
            {renderDays()}
            {/* Swipable content area could go here, but for now just grid */}
            {renderCells()}

            {/* Info Modal Overlay - AI Studio Dashboard */}
            {showInfoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowInfoModal(false)}>
                    <div
                        className="bg-[#FFF5F6] rounded-[40px] w-full max-w-5xl p-6 md:p-12 shadow-2xl relative animate-scale-up border-4 border-white overflow-hidden max-h-[90vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setShowInfoModal(false)}
                            className="absolute top-6 right-6 md:top-8 md:right-8 text-gray-300 hover:text-gray-500 transition-colors bg-white rounded-full p-2 shadow-sm hover:shadow-md z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Header Section */}
                        <div className="text-center mb-8 md:mb-12 mt-4 md:mt-0">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#FD4776] rounded-full text-white mb-6 shadow-lg shadow-pink-200 animate-bounce-slow">
                                <Sparkles className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-[#FD4776] mb-3 font-['Jua'] tracking-wide">AI 스튜디오</h2>
                            <p className="text-gray-500 font-medium text-base md:text-lg">AI가 반려동물의 특별한 순간을 아름답게 기록해드려요</p>
                        </div>

                        {/* Cards Container */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
                            {/* Left Card: AI Diary */}
                            <div className="bg-white rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-pink-50 flex flex-col items-start h-full relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-bl-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform" />

                                <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B8B] to-[#FF8FAB] rounded-2xl flex items-center justify-center mb-6 shadow-md text-white z-10">
                                    <Sparkles className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-[#FD4776] mb-4 font-['Jua'] z-10">AI 다이어리</h3>
                                <p className="text-gray-600 mb-6 leading-relaxed font-medium z-10">
                                    오늘 하루 반려동물과 함께한 순간을 사진으로 업로드하면, AI가 감성적인 일기를 작성해드려요
                                </p>
                                <ul className="space-y-3 mb-8 w-full z-10">
                                    <li className="flex items-center gap-3 text-gray-600 font-medium">
                                        <div className="w-2 h-2 rounded-full bg-[#FD4776]" />
                                        사진 1-10장 업로드
                                    </li>
                                    <li className="flex items-center gap-3 text-gray-600 font-medium">
                                        <div className="w-2 h-2 rounded-full bg-[#FD4776]" />
                                        AI가 자동으로 일기 작성
                                    </li>
                                </ul>
                                <div className="mt-auto w-full z-10">
                                    <button
                                        onClick={() => {
                                            setShowInfoModal(false);
                                            onDateSelect(format(new Date(), 'yyyy-MM-dd'));
                                        }}
                                        className="w-full bg-gradient-to-r from-[#FD4776] to-[#FF8FAB] text-white font-bold py-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group/btn"
                                    >
                                        다이어리 작성하기 <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>

                            {/* Right Card: AI Recap */}
                            <div className="bg-white rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-purple-50 flex flex-col items-start h-full relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform" />

                                <div className="w-16 h-16 bg-gradient-to-br from-[#AF52DE] to-[#D987F5] rounded-2xl flex items-center justify-center mb-6 shadow-md text-white z-10">
                                    <BookOpen className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-[#AF52DE] mb-4 font-['Jua'] z-10">AI 리캡</h3>
                                <p className="text-gray-600 mb-6 leading-relaxed font-medium z-10">
                                    1달마다 자동으로 생성되는 반려동물의 특별한 순간들을 모아 감동적인 리캡을 만들어드려요
                                </p>
                                <ul className="space-y-3 mb-8 w-full z-10">
                                    <li className="flex items-center gap-3 text-gray-600 font-medium">
                                        <div className="w-2 h-2 rounded-full bg-[#AF52DE]" />
                                        1달마다 자동 생성
                                    </li>
                                    <li className="flex items-center gap-3 text-gray-600 font-medium">
                                        <div className="w-2 h-2 rounded-full bg-[#AF52DE]" />
                                        주요 순간 자동 선택
                                    </li>
                                </ul>
                                <div className="mt-auto w-full z-10">
                                    <button
                                        onClick={() => {
                                            setShowInfoModal(false);
                                            if (onRecapClick) onRecapClick();
                                        }}
                                        className="w-full bg-gradient-to-r from-[#AF52DE] to-[#D987F5] text-white font-bold py-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group/btn"
                                    >
                                        리캡 보기 <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Tip Section */}
                        <div className="bg-[#FFE4E8] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-center gap-3 text-center md:text-left animate-pulse-slow">
                            <Lightbulb className="w-6 h-6 text-[#FD4776] fill-current" />
                            <p className="text-[#FD4776] font-bold text-lg font-['Jua']">Tip</p>
                            <p className="text-gray-600 font-medium">
                                AI가 생성한 콘텐츠는 언제든지 수정할 수 있어요. 여러분만의 특별한 이야기를 더해주세요!
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiaryCalendar;
