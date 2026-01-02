import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, PawPrint } from 'lucide-react';

import { getAllArchivesApi } from "@/features/auth/api/auth-api";
import { useDiaryAuth } from "../hooks/useDiaryAuth";
import { format } from 'date-fns';
import {
  earnCoin,
  createSocialFeed,
  createAiDiaryApi, // [NEW]
  getWeatherApi, // [NEW] Weather API
} from "../api/diary-api";

import EditStep from '../components/EditStep';
import StyleStep from '../components/StyleStep';
import CompleteStep from '../components/CompleteStep';
import GalleryModal from '../components/GalleryModal';

const AiDiaryPage = () => {
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
  // Default to 'edit' as this is now the subsequent page
  const [step, setStep] = useState<string>(() => getSavedState('step', "edit"));

  // Note: selectedImages are now fully URLs from DB (or persisted objects)
  const [selectedImages] = useState<any[]>(() => getSavedState('selectedImages', []));
  // imageFiles, mainImageIndex removed as they are upload-time only, or mainImage logic handled in DB.

  // 펫 선택 State
  const [selectedPetId] = useState<number | null>(() => getSavedState('selectedPetId', null));

  // 날씨 & 기분 & 위치 State
  const [weather, setWeather] = useState("");
  const [mood, setMood] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationCoords, setLocationCoords] = useState<{ lat: number, lng: number } | null>(null);

  const [createdDiaryId, setCreatedDiaryId] = useState<number | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [editedDiary, setEditedDiary] = useState(() => getSavedState('editedDiary', ""));
  // progress removed
  const [selectedDate] = useState(() => getSavedState('selectedDate', format(new Date(), 'yyyy-MM-dd')));
  const [title, setTitle] = useState(() => getSavedState('title', "")); // [NEW] Title State

  // Style States
  const [layoutStyle, setLayoutStyle] = useState("grid"); // galleryType
  const [textAlign, setTextAlign] = useState("left");
  const [fontSize, setFontSize] = useState(16);
  const [sizeOption, setSizeOption] = useState("medium");
  const [themeStyle, setThemeStyle] = useState("basic");
  const [preset, setPreset] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");

  const [isSubmitting, setIsSubmitting] = useState(false);

  //이번 활동으로 적립된 코인 양 저장
  const [earnedReward, setEarnedReward] = useState<number | null>(null);

  // 보관함 ID를 관리하기 위한 상태 정의
  const [archiveImages, setArchiveImages] = useState<{ archiveId: number, url: string }[]>([]);

  // [NEW] 날씨 자동 업데이트 - 위치나 날짜 변경 시 백엔드에서 날씨 정보 가져오기
  useEffect(() => {
    console.log('🌤️ [Weather Debug] useEffect triggered');
    console.log('🌤️ [Weather Debug] locationCoords:', locationCoords);
    console.log('🌤️ [Weather Debug] selectedDate:', selectedDate);
    console.log('🌤️ [Weather Debug] current weather state:', weather);

    if (locationCoords && selectedDate) {
      console.log(`🌤️ [Weather Debug] ✅ Conditions met - Fetching weather for ${selectedDate} at (${locationCoords.lat}, ${locationCoords.lng})`);
      getWeatherApi(locationCoords.lat, locationCoords.lng, selectedDate)
        .then(weatherData => {
          console.log('🌤️ [Weather Debug] API Response:', weatherData);
          if (weatherData) {
            console.log(`🌤️ [Weather Debug] ✅ Updating weather state: ${weather} → ${weatherData}`);
            setWeather(weatherData);
          } else {
            console.warn('🌤️ [Weather Debug] ⚠️ API returned null/empty weather data');
          }
        })
        .catch(err => {
          console.error('🌤️ [Weather Debug] ❌ Weather fetch error:', err);
        });
    } else {
      console.warn('🌤️ [Weather Debug] ⚠️ Conditions not met for weather fetch');
      if (!locationCoords) console.warn('🌤️ [Weather Debug]   - Missing locationCoords');
      if (!selectedDate) console.warn('🌤️ [Weather Debug]   - Missing selectedDate');
    }
  }, [locationCoords, selectedDate]);

  // 보관함 이미지 불러오기
  useEffect(() => {
    if (user && showGallery) {
      getAllArchivesApi()
        .then((res) => {
          if (res && res.archives) {
            // Store full archive objects including ID
            setArchiveImages(res.archives.map((a: any) => ({
              archiveId: a.archiveId,
              url: a.url
            })));
          }
        })
        .catch(err => console.error("보관함 로드 실패:", err));
    }
  }, [user, showGallery]);

  // --- Handlers ---

  const handleBack = () => {
    if (step === 'edit') {
      // If backing out from Edit, maybe warn? Or go back to Upload?
      // If we go back to Upload, we might lose the "generated" state, or Upload page needs to handle re-entry.
      // For now, allow navigating back to Upload page to start over.
      if (window.confirm("편집 내용을 취소하고 다시 시작하시겠습니까?")) {
        navigate('/ai-studio/diary/upload');
      }
    } else if (step === 'style') {
      setStep('edit');
    } else {
      navigate('/ai-studio/diary/calendar'); // Default fallback
    }
  };

  const handleShareToFeed = async () => {
    if (!createdDiaryId) return;
    setIsSubmitting(true);
    try {
      console.log("=== [Frontend] Saving Diary... ===");
      if (user && user.id) {
        // [NEW] Actual Save to Backend
        const diaryRequest = {
          userId: Number(user.id),
          petId: selectedPetId || 0,
          date: selectedDate,
          title: title, // [NEW]
          content: editedDiary,
          weather: weather,
          mood: mood,
          locationName: locationName,
          latitude: locationCoords?.lat,
          longitude: locationCoords?.lng,
          visibility: "PUBLIC", // Default
          isAiGen: true,
          imageUrls: selectedImages.map(img => img.imageUrl),
          archiveIds: selectedImages.map(img => img.archiveId).filter(id => id != null)
        };

        const newDiaryId = await createAiDiaryApi(diaryRequest); // Call API
        console.log("=== [Frontend] Diary Saved. ID:", newDiaryId);
        setCreatedDiaryId(newDiaryId);

        const REWARD_AMOUNT = 15;
        const coinResult = await earnCoin(user.id, REWARD_AMOUNT, 'WRITEDIARY');

        if (coinResult) {
          console.log("=== [Frontend] Pet Coin Earned ===", coinResult);
          setEarnedReward(REWARD_AMOUNT);
        }
      }
      console.log("=== [Frontend] Diary Saved & Process Completed ===");
      setStep("complete");

    } catch (error: any) {
      alert(`저장 실패: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialShare = async (visibility: string) => {
    if (!createdDiaryId || !user) return;

    try {
      const requestDto = {
        userId: Number(user.id),
        petId: selectedPetId,
        content: editedDiary,
        location: locationName,
        visibility: visibility,
        imageUrls: selectedImages.map(img => img.imageUrl)
      };

      const feedId = await createSocialFeed(requestDto);
      console.log(`[Frontend] Feed created with ID: ${feedId}`);

      const FEED_REWARD = 10;
      const coinResult = await earnCoin(user.id, FEED_REWARD, 'WIRTEFEED');

      if (coinResult) {
        setEarnedReward(prev => (prev || 0) + FEED_REWARD);
      }

      return feedId;
    } catch (error: any) {
      console.error("[Frontend] Social Share Error:", error);
      alert(`피드 공유 실패: ${error.message}`);
      throw error;
    }
  };

  const handleReset = () => {
    navigate('/ai-studio/diary/calendar');
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
          <div className="flex items-center gap-2">
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl p-4 md:p-6">

        {/* Calendar Removed */}

        {step === 'edit' && (
          <EditStep
            userId={Number(user?.id)}
            selectedImages={selectedImages} editedDiary={editedDiary} setEditedDiary={setEditedDiary} weather={weather} setWeather={setWeather} mood={mood} setMood={setMood}
            locationName={locationName} setLocationName={setLocationName}
            locationCoords={locationCoords} setLocationCoords={setLocationCoords}
            selectedDate={selectedDate}
            layoutStyle={layoutStyle} textAlign={textAlign} fontSize={fontSize} backgroundColor={backgroundColor}
            title={title} setTitle={setTitle} // [NEW]
            onNext={() => setStep('style')}
          />
        )}
        {step === 'style' && (
          <StyleStep
            selectedImages={selectedImages} editedDiary={editedDiary} weather={weather} mood={mood} locationName={locationName} locationCoords={locationCoords} selectedDate={selectedDate}
            layoutStyle={layoutStyle} setLayoutStyle={setLayoutStyle} textAlign={textAlign} setTextAlign={setTextAlign} fontSize={fontSize} setFontSize={setFontSize}
            backgroundColor={backgroundColor} setBackgroundColor={setBackgroundColor}
            sizeOption={sizeOption} setSizeOption={setSizeOption}
            themeStyle={themeStyle} setThemeStyle={setThemeStyle}
            preset={preset} setPreset={setPreset}
            handleShareToFeed={handleShareToFeed} isSubmitting={isSubmitting}
            onBack={() => setStep('edit')}
            title={title} // [NEW] Pass Title
          />
        )}
        {step === 'complete' && <CompleteStep onHome={handleReset} earnedAmount={earnedReward} onShare={handleSocialShare} />}
      </main>
      <GalleryModal
        showGallery={showGallery}
        setShowGallery={setShowGallery}
        selectedImages={selectedImages}
        handleSelectFromGallery={() => { }} // No-op in edit/style modes usually? or read-only? 
        archiveImages={archiveImages}
      />
    </div>
  );
};

export default AiDiaryPage;