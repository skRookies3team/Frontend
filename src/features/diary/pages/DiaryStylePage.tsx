import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, PawPrint } from 'lucide-react';
import { useDiaryAuth } from "../hooks/useDiaryAuth";
import { format } from 'date-fns';
import {
    earnCoin,
    createSocialFeed,
} from "../api/diary-api";

import StyleStep from '../components/StyleStep';
import CompleteStep from '../components/CompleteStep';

const DiaryStylePage = () => {
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
    // Steps within this page: 'style' -> 'complete'
    const [step, setStep] = useState("style");

    const [selectedImages] = useState<any[]>(() => getSavedState('selectedImages', []));
    const [selectedDate] = useState(() => getSavedState('selectedDate', format(new Date(), 'yyyy-MM-dd')));
    const [selectedPetId] = useState<number | null>(() => getSavedState('selectedPetId', null));
    const [createdDiaryId, setCreatedDiaryId] = useState<number | null>(() => getSavedState('createdDiaryId', null));

    // Content (Read-only for preview)
    const [editedDiary] = useState(() => getSavedState('editedDiary', ""));
    const [weather] = useState(() => getSavedState('weather', ""));
    const [mood] = useState(() => getSavedState('mood', ""));
    const [locationName] = useState(() => getSavedState('locationName', ""));
    const [locationCoords] = useState<{ lat: number, lng: number } | null>(() => getSavedState('locationCoords', null));

    // Style States
    const [layoutStyle, setLayoutStyle] = useState("grid");
    const [textAlign, setTextAlign] = useState("left");
    const [fontSize, setFontSize] = useState(16);
    const [sizeOption, setSizeOption] = useState("medium");
    const [themeStyle, setThemeStyle] = useState("basic");
    const [preset, setPreset] = useState<string | null>(null);
    const [backgroundColor, setBackgroundColor] = useState("#ffffff");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [earnedReward, setEarnedReward] = useState<number | null>(null);

    const handleBack = () => {
        if (step === 'complete') {
            navigate('/ai-studio/diary/calendar'); // Or home?
        } else {
            navigate('/ai-studio/diary/edit');
        }
    };

    const handleReset = () => {
        navigate('/ai-studio/diary/calendar');
    };

    const handleShareToFeed = async () => {
        setIsSubmitting(true);
        try {
            console.log("=== [Frontend] Finalizing Diary... ===");

            let finalDiaryId = createdDiaryId;

            // [NEW] If no diaryId (Draft Mode), create it now!
            if (!finalDiaryId) {
                if (!user) { throw new Error("로그인이 필요합니다."); }

                // Get Preview IDs from storage
                const previewImageUrls = getSavedState('previewImageUrls', []);
                const previewArchiveIds = getSavedState('previewArchiveIds', []);

                // Construct Request JSON
                const requestData = {
                    userId: Number(user.id),
                    petId: selectedPetId,
                    photoArchiveId: null,
                    content: editedDiary,
                    visibility: "PRIVATE",
                    isAiGen: true,
                    weather: weather,
                    mood: mood,
                    date: selectedDate,
                    latitude: locationCoords ? locationCoords.lat : null,
                    longitude: locationCoords ? locationCoords.lng : null,
                    locationName: locationName,
                    imageUrls: previewImageUrls,
                    archiveIds: previewArchiveIds,
                    images: []
                };

                // Use the Real Create API (JSON)
                const { createAiDiaryApi } = await import("../api/diary-api");
                // Response is now just the ID (number)
                const responseId = await createAiDiaryApi(requestData);
                finalDiaryId = responseId;

                // Update State
                sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
                    ...JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}'),
                    createdDiaryId: finalDiaryId
                }));
                setCreatedDiaryId(finalDiaryId);
            }

            if (user && user.id && finalDiaryId) {
                // [NEW] Save Style Preference
                const { saveDiaryStyleApi, earnCoin } = await import("../api/diary-api");

                try {
                    await saveDiaryStyleApi(Number(user.id), {
                        galleryType: layoutStyle,
                        textAlignment: textAlign,
                        fontSize: fontSize,
                        sizeOption: sizeOption,
                        backgroundColor: backgroundColor,
                        preset: preset,
                        themeStyle: themeStyle,
                        petId: selectedPetId
                    });
                    console.log("=== [Frontend] Style Saved ===");
                } catch (e) {
                    console.warn("Style Save Failed (Non-critical)", e);
                }

                const REWARD_AMOUNT = 15;
                const coinResult = await earnCoin(Number(user.id), REWARD_AMOUNT, 'WRITEDIARY');

                if (coinResult) {
                    console.log("=== [Frontend] Pet Coin Earned ===", coinResult);
                    setEarnedReward(REWARD_AMOUNT);
                }
            }
            console.log("=== [Frontend] Diary Saved & Process Completed ===");
            setStep("complete");

        } catch (error: any) {
            console.error("저장 실패:", error);
            alert(`저장 실패: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSocialShare = async (visibility: string) => {
        if (!createdDiaryId || !user) return;
        try {
            // [FIX] Use persistent S3 URLs, not local blob URLs
            const previewImageUrls = getSavedState('previewImageUrls', []);
            const requestDto = {
                userId: Number(user.id),
                petId: selectedPetId,
                content: editedDiary,
                location: locationName,
                visibility: visibility,
                imageUrls: previewImageUrls.length > 0 ? previewImageUrls : selectedImages.map(img => img.imageUrl)
            };

            const feedId = await createSocialFeed(requestDto);
            const FEED_REWARD = 10;
            const coinResult = await earnCoin(user.id, FEED_REWARD, 'WIRTEFEED');

            if (coinResult) {
                setEarnedReward(prev => (prev || 0) + FEED_REWARD);
            }
            return feedId;
        } catch (error: any) {
            alert(`피드 공유 실패: ${error.message}`);
            throw error;
        }
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
                {step === 'style' && (
                    <StyleStep
                        selectedImages={selectedImages} editedDiary={editedDiary}
                        weather={weather} mood={mood} locationName={locationName} locationCoords={locationCoords}
                        selectedDate={selectedDate}
                        layoutStyle={layoutStyle} setLayoutStyle={setLayoutStyle}
                        textAlign={textAlign} setTextAlign={setTextAlign}
                        fontSize={fontSize} setFontSize={setFontSize}
                        backgroundColor={backgroundColor} setBackgroundColor={setBackgroundColor}
                        sizeOption={sizeOption} setSizeOption={setSizeOption}
                        themeStyle={themeStyle} setThemeStyle={setThemeStyle}
                        preset={preset} setPreset={setPreset}
                        handleShareToFeed={handleShareToFeed} isSubmitting={isSubmitting}
                        onBack={handleBack}
                    />
                )}
                {step === 'complete' && <CompleteStep onHome={handleReset} earnedAmount={earnedReward} onShare={handleSocialShare} />}
            </main>
        </div>
    );
};

export default DiaryStylePage;
