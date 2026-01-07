import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, PawPrint } from 'lucide-react';
import { useDiaryAuth } from "../hooks/useDiaryAuth";
import { format } from 'date-fns';
import {
    earnCoin,
    createSocialFeed,
    createNotification,
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
    const [title] = useState(() => getSavedState('title', "")); // [NEW] Read-only title for style page

    // Style States
    const [layoutStyle, setLayoutStyle] = useState("grid");
    const [textAlign, setTextAlign] = useState("left");
    const [fontSize, setFontSize] = useState(16);
    const [sizeOption, setSizeOption] = useState("medium");
    const [themeStyle, setThemeStyle] = useState("basic");
    const [preset, setPreset] = useState<string | null>(null);
    const [backgroundColor, setBackgroundColor] = useState("#ffffff");
    const [fontFamily, setFontFamily] = useState("Noto Sans KR"); // [NEW] Default Font

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [earnedReward, setEarnedReward] = useState<number | null>(null);

    // ✅ S3 URL로 변환된 이미지 배열 (미리보기용)
    const displayImages = (() => {
        const previewImageUrls = getSavedState('previewImageUrls', []);
        return selectedImages.map((img, index) => ({
            ...img,
            imageUrl: previewImageUrls[index] || img.imageUrl // S3 URL 우선
        }));
    })();

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
                const mainImageIndex = getSavedState('mainImageIndex', 0); // ✅ 대표 이미지 인덱스

                // Construct Request JSON
                const requestData = {
                    userId: Number(user.id),
                    petId: selectedPetId,
                    photoArchiveId: null,
                    title: title, // [NEW]
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
                    // ✅ selectedImages에서 images 배열 생성
                    images: selectedImages.map((img, index) => ({
                        imageUrl: previewImageUrls[index] || img.imageUrl, // ✅ S3 URL 우선
                        imgOrder: index + 1,
                        mainImage: index === mainImageIndex, // ✅ mainImageIndex 사용
                        source: img.source || 'ARCHIVE',
                        archiveId: img.archiveId || null,
                        metadata: img.metadata || null // ✅ EXIF 메타데이터 포함
                    }))
                };

                console.log('=== [DiaryStylePage] 최종 일기 생성 요청 데이터 ===');
                console.log('[DiaryStylePage] requestData:', JSON.stringify(requestData, null, 2));

                // 메타데이터 포함 여부 확인
                const imagesWithMetadata = requestData.images.filter(img => img.metadata);
                if (imagesWithMetadata.length > 0) {
                    console.log('=== [FINAL METADATA] 최종 전송될 메타데이터 ===');
                    imagesWithMetadata.forEach((img, idx) => {
                        console.log(`[FINAL METADATA] Image ${idx + 1}:`, {
                            imgOrder: img.imgOrder,
                            mainImage: img.mainImage,
                            source: img.source,
                            metadata: img.metadata
                        });
                    });
                } else {
                    console.log('[FINAL METADATA] ⚠️ 최종 요청에 메타데이터가 없습니다.');
                }

                // Use the Real Create API (JSON)
                const { createAiDiaryApi } = await import("../api/diary-api");
                console.log('[DiaryStylePage] 📤 백엔드로 일기 생성 요청 전송 중...');
                // Response is now just the ID (number)
                const responseId = await createAiDiaryApi(requestData);
                console.log('[DiaryStylePage] ✅ 일기 생성 성공! DiaryId:', responseId);
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
                        diaryId: finalDiaryId, // [FIX] ID 연동
                        galleryType: layoutStyle,
                        textAlignment: textAlign,
                        fontSize: fontSize,
                        sizeOption: sizeOption,
                        backgroundColor: backgroundColor,
                        preset: preset,
                        themeStyle: themeStyle,
                        petId: selectedPetId,
                        fontFamily: fontFamily // [NEW] Save Font
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

            // ✅ [NEW] 일기 생성 알림 전송
            if (finalDiaryId && user) {
                await createNotification({
                    type: 'DIARY',
                    senderId: Number(user.id),
                    receiverId: Number(user.id),
                    targetId: finalDiaryId
                });
            }

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

    const [backgroundTheme, setBackgroundTheme] = useState<'pink' | 'skyblue'>('pink');

    return (
        <div className="min-h-screen pb-20 font-sans text-gray-800"
            style={{
                backgroundColor: backgroundTheme === 'pink' ? '#fff1f2' : '#f0f9ff', // pink-50/rose-50 equivalent hex
                backgroundImage: backgroundTheme === 'pink'
                    ? 'linear-gradient(to bottom, #fff1f2, #fff1f2)' // pink-50 to rose-50 approx
                    : 'linear-gradient(to bottom, #f0f9ff, #eff6ff)', // sky-50 to blue-50 approx
                transition: 'background-color 0.5s ease-in-out, background-image 0.5s ease-in-out'
            }}
        >
            <header className={`sticky top-0 z-40 border-b-2 border-dashed bg-white/90 backdrop-blur-md transition-colors duration-500 ${backgroundTheme === 'pink'
                ? 'border-pink-200 shadow-[0_4px_20px_rgba(255,192,203,0.1)]'
                : 'border-blue-200 shadow-[0_4px_20px_rgba(135,206,235,0.1)]'
                }`}>
                <div className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                    <button onClick={handleBack} className={`transition-colors p-1 ${backgroundTheme === 'pink' ? 'text-pink-600 hover:text-pink-700' : 'text-blue-600 hover:text-blue-700'}`}>
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className={`text-2xl md:text-3xl font-bold font-['Jua'] tracking-wider flex items-center gap-3 transition-colors duration-500 ${backgroundTheme === 'pink' ? 'text-[#FF6B8B]' : 'text-blue-500'}`}>
                        <PawPrint className={`w-6 h-6 animate-bounce delay-100 ${backgroundTheme === 'pink' ? 'text-[#FF8FAB]' : 'text-blue-300'}`} />
                        <span>너와 나의 이야기</span>
                        <PawPrint className={`w-6 h-6 animate-bounce delay-300 ${backgroundTheme === 'pink' ? 'text-[#FF8FAB]' : 'text-blue-300'}`} />
                    </h1>
                    <div className="flex items-center gap-2"></div>
                </div>
            </header>

            <main className="container mx-auto max-w-7xl p-4 md:p-6">
                {step === 'style' && (
                    <StyleStep
                        selectedImages={displayImages} editedDiary={editedDiary}
                        weather={weather} mood={mood} locationName={locationName} locationCoords={locationCoords}
                        selectedDate={selectedDate}
                        layoutStyle={layoutStyle} setLayoutStyle={setLayoutStyle}
                        textAlign={textAlign} setTextAlign={setTextAlign}
                        fontSize={fontSize} setFontSize={setFontSize}
                        backgroundColor={backgroundColor} setBackgroundColor={setBackgroundColor}
                        sizeOption={sizeOption} setSizeOption={setSizeOption}
                        themeStyle={themeStyle} setThemeStyle={setThemeStyle}
                        preset={preset} setPreset={setPreset}
                        preset={preset} setPreset={setPreset}
                        handleShareToFeed={handleShareToFeed} isSubmitting={isSubmitting}
                        onBack={handleBack}
                        title={title}
                        fontFamily={fontFamily} setFontFamily={setFontFamily} // [NEW] Font Family State
                    />
                )}
                {step === 'complete' && <CompleteStep onHome={handleReset} earnedAmount={earnedReward} onShare={handleSocialShare} onThemeChange={setBackgroundTheme} />}
            </main>
        </div>
    );
};

export default DiaryStylePage;
