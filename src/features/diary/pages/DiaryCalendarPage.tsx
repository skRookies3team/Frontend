import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, PawPrint } from 'lucide-react';
import DiaryCalendar from '../components/DiaryCalendar';
import { format } from 'date-fns';

const DiaryCalendarPage = () => {
    const navigate = useNavigate();

    // Minimal state for selectedDate to pass to Calendar
    const [selectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const handleDateSelect = (date: string) => {
        // Clear previous session state to start fresh
        sessionStorage.removeItem('ai_diary_backup');
        // Navigate to Creation Page with selected date
        navigate('/ai-studio/diary/upload', { state: { date } });
    };

    const handleRecapClick = () => {
        navigate('/ai-studio/recap');
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="min-h-screen pb-20 font-sans text-gray-800" style={{ backgroundColor: '#ffeef2' }}>
            <header className="sticky top-0 z-40 border-b-2 border-dashed border-pink-200 bg-white/90 backdrop-blur-md shadow-[0_4px_20px_rgba(255,192,203,0.1)]">
                <div className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                    <button onClick={handleBack} className="text-pink-400 hover:text-pink-600 transition-colors p-2 hover:bg-pink-50 rounded-full"><ChevronLeft className="w-7 h-7" /></button>
                    <h1 className="text-2xl md:text-3xl font-bold text-pink-500 font-['Jua'] tracking-wider flex items-center gap-3 drop-shadow-sm">
                        <PawPrint className="w-6 h-6 animate-bounce text-yellow-400 delay-100" />
                        <span>너와 나의 이야기</span>
                        <PawPrint className="w-6 h-6 animate-bounce text-yellow-400 delay-300" />
                    </h1>
                    <div className="w-10"></div>
                </div>
            </header>

            <main className="container mx-auto max-w-7xl p-4 md:p-6">
                <DiaryCalendar
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    onRecapClick={handleRecapClick}
                />
            </main>
        </div>
    );
};

export default DiaryCalendarPage;
