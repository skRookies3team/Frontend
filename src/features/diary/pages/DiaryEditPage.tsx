import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, PawPrint } from 'lucide-react';
import { useDiaryAuth } from "../hooks/useDiaryAuth";
import { format } from 'date-fns';
import { getWeatherApi } from '../api/diary-api'; // [NEW] Weather API

import EditStep from '../components/EditStep';

const DiaryEditPage = () => {
    const navigate = useNavigate();
    const { user } = useDiaryAuth();

    const STORAGE_KEY = 'ai_diary_backup';

    const getSavedState = (key: string, defaultVal: any) => {
        try {
            const saved = sessionStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed[key] !== undefined ? parsed[key] : defaultVal;
            }
        } catch (e) {
            console.error("Failed to parse session state", e);
        }
        return defaultVal;
    };

    // --- States ---
    const [selectedImages] = useState<any[]>(() => getSavedState('selectedImages', []));
    const [selectedDate] = useState(() => getSavedState('selectedDate', format(new Date(), 'yyyy-MM-dd')));

    // Edit States
    const [editedDiary, setEditedDiary] = useState(() => getSavedState('editedDiary', ""));
    const [title, setTitle] = useState(() => getSavedState('title', "")); // [NEW] Title State
    const [weather, setWeather] = useState(() => getSavedState('weather', ""));
    const [mood, setMood] = useState(() => getSavedState('mood', ""));
    const [locationName, setLocationName] = useState(() => getSavedState('locationName', ""));
    const [locationCoords, setLocationCoords] = useState<{ lat: number, lng: number } | null>(() => getSavedState('locationCoords', null));

    // Style States (Only for preview in EditStep if needed, or defaults)
    const [layoutStyle] = useState("grid");
    const [textAlign] = useState("left");
    const [fontSize] = useState(16);
    const [backgroundColor] = useState("#ffffff");

    // [NEW] 날씨 자동 업데이트 - 위치나 날짜 변경 시 백엔드에서 날씨 정보 가져오기
    useEffect(() => {
        console.log('🌤️ [Weather Debug - DiaryEditPage] useEffect triggered');
        console.log('🌤️ [Weather Debug - DiaryEditPage] locationCoords:', locationCoords);
        console.log('🌤️ [Weather Debug - DiaryEditPage] selectedDate:', selectedDate);
        console.log('🌤️ [Weather Debug - DiaryEditPage] current weather state:', weather);

        if (locationCoords && selectedDate) {
            console.log(`🌤️ [Weather Debug - DiaryEditPage] ✅ Conditions met - Fetching weather for ${selectedDate} at (${locationCoords.lat}, ${locationCoords.lng})`);
            getWeatherApi(locationCoords.lat, locationCoords.lng, selectedDate)
                .then(weatherData => {
                    console.log('🌤️ [Weather Debug - DiaryEditPage] API Response:', weatherData);
                    if (weatherData) {
                        console.log(`🌤️ [Weather Debug - DiaryEditPage] ✅ Updating weather state: ${weather} → ${weatherData}`);
                        setWeather(weatherData);
                    } else {
                        console.warn('🌤️ [Weather Debug - DiaryEditPage] ⚠️ API returned null/empty weather data');
                    }
                })
                .catch(err => {
                    console.error('🌤️ [Weather Debug - DiaryEditPage] ❌ Weather fetch error:', err);
                });
        } else {
            console.warn('🌤️ [Weather Debug - DiaryEditPage] ⚠️ Conditions not met for weather fetch');
            if (!locationCoords) console.warn('🌤️ [Weather Debug - DiaryEditPage]   - Missing locationCoords');
            if (!selectedDate) console.warn('🌤️ [Weather Debug - DiaryEditPage]   - Missing selectedDate');
        }
    }, [locationCoords, selectedDate]);

    // Save State on Change (Effect)
    useEffect(() => {
        const current = sessionStorage.getItem(STORAGE_KEY);
        const parsed = current ? JSON.parse(current) : {};
        const newState = {
            ...parsed,
            editedDiary,
            title, // [NEW] Persist Title
            weather,
            mood,
            locationName,
            locationCoords
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    }, [editedDiary, title, weather, mood, locationName, locationCoords]);

    const handleBack = () => {
        if (window.confirm("편집 내용을 취소하고 다시 시작하시겠습니까? (작성 내용은 사라질 수 있습니다)")) {
            navigate('/ai-studio/diary/upload');
        }
    };

    const handleNext = () => {
        // Navigate to Style Page
        navigate('/ai-studio/diary/style-edit');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 pb-20 font-sans text-gray-800">
            <header className="sticky top-0 z-40 border-b border-pink-100 bg-white/95 backdrop-blur-sm shadow-sm">
                <div className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                    <button onClick={handleBack} className="text-pink-600 hover:text-pink-700 transition-colors p-1"><ChevronLeft className="w-6 h-6" /></button>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#FF6B8B] font-['Jua'] tracking-wider flex items-center gap-3">
                        <PawPrint className="w-6 h-6 animate-bounce text-[#FF8FAB] delay-100" />
                        <span>너와 나의 이야기</span>
                        <PawPrint className="w-6 h-6 animate-bounce text-[#FF8FAB] delay-300" />
                    </h1>
                    <div className="flex items-center gap-2"></div>
                </div>
            </header>

            <main className="container mx-auto max-w-7xl p-4 md:p-6">
                <EditStep
                    userId={Number(user?.id)}
                    selectedImages={selectedImages}
                    editedDiary={editedDiary} setEditedDiary={setEditedDiary}
                    title={title} setTitle={setTitle} // [NEW]
                    weather={weather} setWeather={setWeather}
                    mood={mood} setMood={setMood}

                    locationName={locationName} setLocationName={setLocationName}
                    locationCoords={locationCoords} setLocationCoords={setLocationCoords}
                    selectedDate={selectedDate}
                    layoutStyle={layoutStyle} textAlign={textAlign} fontSize={fontSize} backgroundColor={backgroundColor}
                    onNext={handleNext}
                />
            </main>
        </div>
    );
};

export default DiaryEditPage;
