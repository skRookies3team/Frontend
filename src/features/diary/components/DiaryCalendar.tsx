import { useState, useEffect } from 'react';
import {
    format, addMonths, subMonths, startOfMonth, endOfMonth,
    startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay,
    parseISO
} from 'date-fns';
import { ko } from 'date-fns/locale'; // 한국어 로케일
import { ChevronLeft, ChevronRight, BookOpen, Sparkles, Calendar as CalendarIcon } from 'lucide-react';

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

    const today = new Date();

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
                {/* Vintage Recap Button Area */}
                <div className="flex justify-center">
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

                <div className="flex items-center justify-between px-4 mt-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-pink-600">{format(currentMonth, 'MMMM', { locale: ko })}</span>
                        <span className="text-gray-400 font-light">{format(currentMonth, 'yyyy')}</span>
                    </h2>
                    <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-50 rounded text-gray-500 hover:text-pink-600 transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={() => setCurrentMonth(new Date())} className="px-3 text-xs font-bold text-gray-500 hover:text-pink-600 border-l border-r border-gray-100 transition-colors">
                            오늘
                        </button>
                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-50 rounded text-gray-500 hover:text-pink-600 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = [];
        const date = ['일', '월', '화', '수', '목', '금', '토'];

        for (let i = 0; i < 7; i++) {
            days.push(
                <div key={i} className={`text-center text-sm font-bold py-3 ${i === 0 ? 'text-rose-500' : 'text-gray-500'}`}>
                    {date[i]}
                </div>
            );
        }
        return <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">{days}</div>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = '';

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, 'd');
                const isoDateStr = format(day, 'yyyy-MM-dd');
                const isSelected = isSameDay(day, parseISO(selectedDate));
                const isToday = isSameDay(day, today);
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
                            relative h-28 md:h-36 border-r border-b border-gray-100 bg-white group cursor-pointer transition-all hover:bg-pink-50/30
                            ${!isCurrentMonth ? 'bg-gray-50/30 text-gray-300' : 'text-gray-700'}
                            ${isSelected ? 'ring-2 ring-inset ring-pink-500 z-10' : ''}
                        `}
                        onClick={() => {
                            onDateSelect(isoDateStr);
                        }}
                    >
                        {/* Date Number */}
                        <div className={`
                            absolute top-2 left-2 w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold z-20
                            ${isToday
                                ? 'bg-pink-500 text-white shadow-md'
                                : isSelected
                                    ? 'bg-gray-900 text-white'
                                    : 'group-hover:bg-white group-hover:shadow-sm'}
                            ${i === 0 && !isToday && !isSelected ? 'text-rose-500' : ''}
                        `}>
                            {formattedDate}
                        </div>

                        {/* Image Content */}
                        {isCurrentMonth && displayImage && (
                            <div className="absolute inset-2 top-8 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <img
                                    src={displayImage}
                                    alt="diary entry"
                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500"
                                />
                                {isSelected && (
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                        <div className="bg-white/90 p-1.5 rounded-full shadow-lg">
                                            <CalendarIcon className="w-4 h-4 text-pink-500" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Empty State Add Icon */}
                        {isCurrentMonth && !displayImage && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 shadow-sm">
                                    +
                                </div>
                            </div>
                        )}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div key={day.toString()} className="grid grid-cols-7">
                    {days}
                </div>
            );
            days = [];
        }

        return <div className="border border-gray-100 rounded-b-2xl overflow-hidden shadow-xl">{rows}</div>;
    };

    return (
        <div className="max-w-5xl mx-auto p-4 animate-fade-in">
            {renderHeader()}
            <div className="bg-white rounded-2xl shadow-sm">
                {renderDays()}
                {renderCells()}
            </div>

            <div className="mt-8 flex justify-center">
                <p className="text-gray-400 text-sm font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-pink-500"></span> 오늘
                    <span className="w-2 h-2 rounded-full bg-gray-300 ml-4"></span> 기록 없음
                    <span className="w-2 h-2 rounded-full bg-pink-500 ml-4"></span> 기록 있음
                </p>
            </div>
        </div>
    );
};

export default DiaryCalendar;
