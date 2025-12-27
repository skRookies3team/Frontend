import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

import { getAllArchivesApi } from "@/features/auth/api/auth-api";
import { ImageSource } from "../types/diary";
import { useDiaryAuth } from "../hooks/useDiaryAuth";
import {
  getLocationHistory,
  earnCoin,
  createSocialFeed,
  createAiDiaryApi,
  getDiary
} from "../api/diary-api";

import UploadStep from '../components/UploadStep';
import GeneratingStep from '../components/GeneratingStep';
import EditStep from '../components/EditStep';
import CompleteStep from '../components/CompleteStep';
import GalleryModal from '../components/GalleryModal';

const AiDiaryPage = () => {
  const navigate = useNavigate();
  const { user } = useDiaryAuth();

  // --- States ---
  const [step, setStep] = useState("upload");
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // 펫 선택 State
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);

  // 날씨 & 기분 & 위치 State
  const [weather, setWeather] = useState("");
  const [mood, setMood] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationCoords, setLocationCoords] = useState<{ lat: number, lng: number } | null>(null);

  const [createdDiaryId, setCreatedDiaryId] = useState<number | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [editedDiary, setEditedDiary] = useState("");
  const [progress, setProgress] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // Style States
  const [layoutStyle, setLayoutStyle] = useState("grid");
  const [textAlign, setTextAlign] = useState("left");
  const [fontSize, setFontSize] = useState(16);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");

  const [isSubmitting, setIsSubmitting] = useState(false);

  //이번 활동으로 적립된 코인 양 저장
  const [earnedReward, setEarnedReward] = useState<number | null>(null);

  // 보관함 ID를 관리하기 위한 상태 정의
  // const [selectedArchiveId] = useState(1); // Removed hardcoded state
  const [archiveImages, setArchiveImages] = useState<{ archiveId: number, url: string }[]>([]);

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

  // Auth 정보가 로드되면 펫 목록 설정
  useEffect(() => {
    if (user) {
      const userPets = user.pets || [];
      const mappedPets = userPets.map((p: any) => ({
        petId: Number(p.petId || p.id),
        petName: p.petName || p.name,
        species: (p.species === 'CAT' || p.species === '고양이') ? 'CAT' : 'DOG',
      }));

      setPets(mappedPets);

      if (mappedPets.length > 0 && !selectedPetId) {
        setSelectedPetId(mappedPets[0].petId);
      }
    }
  }, [user]);

  // --- Handlers ---

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (imageFiles.length + files.length > 10) {
      alert("최대 10장까지 업로드 가능합니다.");
      return;
    }

    setImageFiles(prev => [...prev, ...files]);

    const newPreviews = files.map(file => ({
      imageUrl: URL.createObjectURL(file),
      source: ImageSource.GALLERY,
      archiveId: null // Gallery upload has no archive ID yet
    }));
    setSelectedImages(prev => [...prev, ...newPreviews]);

    e.target.value = '';
  };

  const handleSelectFromGallery = (image: { archiveId: number, url: string }) => {
    const isSelected = selectedImages.some(img => img.imageUrl === image.url);
    if (isSelected) {
      setSelectedImages(prev => prev.filter(img => img.imageUrl !== image.url));
    } else if (selectedImages.length < 10) {
      setSelectedImages(prev => [...prev, {
        imageUrl: image.url,
        source: ImageSource.ARCHIVE,
        archiveId: image.archiveId
      }]);
    }
  };

  const handleGenerate = async () => {
    if (imageFiles.length === 0 && selectedImages.length === 0) {
      alert("최소 1장의 사진을 선택해주세요.");
      return;
    }
    if (!selectedPetId) {
      alert("반려동물을 선택해주세요.");
      return;
    }
    if (!user) {
      alert("로그인 정보가 없습니다.");
      return;
    }

    setStep("generating");
    console.log("=== [Frontend] Diary Generation Started ===");

    const getCurrentPosition = () => {
      return new Promise<{ lat: number, lng: number } | null>((resolve) => {
        if (!navigator.geolocation) { resolve(null); return; }
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (_err) => resolve(null),
          { enableHighAccuracy: true, timeout: 5000 }
        );
      });
    };

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      if (currentProgress < 90) setProgress(currentProgress);
    }, 200);

    try {
      const today = new Date().toISOString().split("T")[0];
      let location: { lat: number, lng: number } | null = null;

      if (selectedDate === today) {
        console.log("=== [Frontend] 오늘 날짜 선택: 현재 위치 조회 시도 ===");
        location = await getCurrentPosition();
      } else {
        console.log(`=== [Frontend] 과거 날짜(${selectedDate}) 선택: 위치 기록 조회 시도 (PostGIS) ===`);
        console.log(`=== [Frontend] 현재 User ID: ${user.id} ===`);

        const historyLocation = await getLocationHistory(user.id, selectedDate);

        if (historyLocation && typeof historyLocation.latitude === 'number' && typeof historyLocation.longitude === 'number') {
          location = { lat: historyLocation.latitude, lng: historyLocation.longitude };
          console.log("=== [Frontend] 과거 위치 기록 발견(DB 사용) ===", location);
        } else {
          console.warn(`=== [Frontend] 과거 위치 기록 없음(DB 데이터 없음). 현재 위치로 대체합니다. (검색 조건: UserID=${user.id}, Date=${selectedDate}) ===`);
          location = await getCurrentPosition();
        }
      }

      if (location) {
        setLocationCoords({ lat: location.lat, lng: location.lng });
        setLocationName("주소 불러오는 중...");
      } else {
        setLocationName("위치 정보 없음");
      }

      const formData = new FormData();
      if (imageFiles.length > 0) {
        imageFiles.forEach((file) => { formData.append("imageFiles", file); });
      } else {
        // [FIX] 보관함 사진만 선택했을 때도 'imageFiles' 파트가 없으면 400 에러 발생 가능하므로 빈 파일 전송
        // (Backend Controller: required = false이지만 Multipart 요청 구조 유지를 위해 전송)
        formData.append("imageFiles", new Blob([], { type: 'application/octet-stream' }), "");
      }

      // [REF] Backend changed: photoArchiveId is removable. We now send archiveId per image.
      // Top level ID is null to allow backend to process list-based IDs.

      const requestData = {
        userId: Number(user.id),
        petId: selectedPetId,
        photoArchiveId: null, // User requested to separate this, effectively nullifying top-level single ID
        content: "",
        visibility: "PRIVATE",
        isAiGen: true,
        weather: "",
        mood: "",
        date: selectedDate,
        latitude: location ? location.lat : null,
        longitude: location ? location.lng : null,
        locationName: locationName,
        images: selectedImages.map((img, index) => ({
          imageUrl: img.imageUrl || "",
          imgOrder: index + 1,
          mainImage: index === 0,
          source: img.source,
          archiveId: img.archiveId || null // Send individual Archive ID
        }))
      };

      console.log("=== [Frontend] Request Payload ===", requestData);

      formData.append("request", new Blob([JSON.stringify(requestData)], { type: "application/json" }));

      // Use the API function from diary-api.ts
      const response = await createAiDiaryApi(formData);

      const diaryId = response.diaryId;
      setCreatedDiaryId(diaryId);

      const diaryDetail = await getDiary(diaryId);

      console.log("=== [Frontend] getDiary API Response ===", diaryDetail);

      clearInterval(interval);
      setProgress(100);

      setEditedDiary(diaryDetail.content || "AI가 일기를 생성하지 못했습니다.");
      setWeather(diaryDetail.weather || "맑음");
      setMood(diaryDetail.mood || "행복");

      if (diaryDetail.locationName && diaryDetail.locationName !== "위치 정보 없음") {
        setLocationName(diaryDetail.locationName);
      } else {
        setLocationName("위치 정보 없음");
      }

      if (diaryDetail.images && Array.isArray(diaryDetail.images)) {
        console.log("=== [Frontend] Updating images with permanent URLs ===", diaryDetail.images);
        const permanentImages = diaryDetail.images.map((img: any) => ({
          imageUrl: img.imageUrl,
          source: 'GALLERY'
        }));
        setSelectedImages(permanentImages);
      }

      setTimeout(() => setStep("edit"), 500);

    } catch (error: any) {
      clearInterval(interval);
      console.error("=== [Frontend] Diary Generation Error ===", error);

      let errorMessage = error.message || "알 수 없는 오류";
      if (errorMessage.includes("사용자를 찾을 수 없습니다")) {
        errorMessage += "\n\n[안내] 로그인 정보가 만료되었거나 DB와 일치하지 않습니다.\n로그아웃 후 다시 로그인해주세요.";
      }

      alert(`일기 생성 실패: ${errorMessage}`);
      setStep("upload");
    }
  };

  const handleShareToFeed = async () => {
    if (!createdDiaryId) return;
    setIsSubmitting(true);
    try {
      // 1. 일기 내용 최종 업데이트 logic (assumed handled or can be added if needed)
      // await updateDiary(createdDiaryId, { ... });

      // 2. 마일리지(코인) 적립 로직 실행
      console.log("=== [Frontend] Saving Diary... ===");
      if (user && user.id) {
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
    setStep("upload");
    setSelectedImages([]);
    setImageFiles([]);
    setEditedDiary("");
    setProgress(0);
    setCreatedDiaryId(null);
    setEarnedReward(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 pb-20 font-sans text-gray-800">
      <header className="sticky top-0 z-40 border-b border-pink-100 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <button onClick={() => navigate(-1)} className="text-pink-600 hover:text-pink-700 transition-colors p-1"><ChevronLeft className="w-6 h-6" /></button>
          <h1 className="text-lg font-bold text-pink-600 md:text-xl">Pet Log AI</h1>
          <div className="flex items-center gap-2">
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl p-4 md:p-6">
        {step === 'upload' && (
          <UploadStep
            selectedImages={selectedImages} isSubmitting={isSubmitting} handleImageUpload={handleImageUpload} handleGenerate={handleGenerate}
            setSelectedImages={setSelectedImages} setShowGallery={setShowGallery} pets={pets} selectedPetId={selectedPetId} setSelectedPetId={setSelectedPetId}
            selectedDate={selectedDate} setSelectedDate={setSelectedDate}
          />
        )}
        {step === 'generating' && <GeneratingStep progress={progress} />}
        {step === 'edit' && (
          <EditStep
            selectedImages={selectedImages} editedDiary={editedDiary} setEditedDiary={setEditedDiary} weather={weather} setWeather={setWeather} mood={mood} setMood={setMood}
            locationName={locationName} setLocationName={setLocationName} locationCoords={locationCoords} selectedDate={selectedDate}
            layoutStyle={layoutStyle} setLayoutStyle={setLayoutStyle} textAlign={textAlign} setTextAlign={setTextAlign} fontSize={fontSize} setFontSize={setFontSize}
            backgroundColor={backgroundColor} setBackgroundColor={setBackgroundColor} handleShareToFeed={handleShareToFeed} isSubmitting={isSubmitting}
          />
        )}
        {step === 'complete' && <CompleteStep onHome={handleReset} earnedAmount={earnedReward} onShare={handleSocialShare} />}
      </main>
      <GalleryModal
        showGallery={showGallery}
        setShowGallery={setShowGallery}
        selectedImages={selectedImages}
        handleSelectFromGallery={handleSelectFromGallery}
        archiveImages={archiveImages}
      />
    </div>
  );
};

export default AiDiaryPage;