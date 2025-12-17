import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAiDiary, getDiary, updateDiary, uploadImagesToS3 } from '../api/diary-api';
import { SelectedImage, DiaryStep, LayoutStyle, TextAlign, ImageType } from '../types/diary';
import { PetResponseDto } from '../../healthcare/api/pet-api';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '@/features/auth/context/auth-context';

// ==========================================
// 1. Types & Interfaces
// ==========================================

// Types are imported from ../types/diary

// ==========================================
// 2. Services
// ==========================================

// Services are imported from ../api/diary-api

import UploadStep from '../components/UploadStep';
import GeneratingStep from '../components/GeneratingStep';
import EditStep from '../components/EditStep';
import CompleteStep from '../components/CompleteStep';
import GalleryModal from '../components/GalleryModal';


// ==========================================
// 4. Main Page: AiDiaryPage
// ==========================================

export default function AiDiaryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // --- States ---
  const [step, setStep] = useState<DiaryStep>("upload");
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // Pet State
  const [pets, setPets] = useState<PetResponseDto[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);

  // Sync Pets from AuthContext
  useEffect(() => {
    if (user && user.pets) {
      const mappedPets: PetResponseDto[] = user.pets.map(pet => ({
        petId: Number(pet.id),
        petName: pet.name,
        species: pet.species === "강아지" ? "DOG" : "CAT",
        breed: pet.breed,
        genderType: pet.gender === "남아" || pet.gender === "수컷" ? "MALE" : pet.gender === "여아" || pet.gender === "암컷" ? "FEMALE" : "NONE",
        is_neutered: pet.neutered,
        profileImage: pet.photo,
        age: Number(pet.age),
        birth: pet.birthday || "",
        status: "ACTIVE"
      }));
      setPets(mappedPets);
      if (mappedPets.length > 0) {
        setSelectedPetId(mappedPets[0].petId);
      }
    }
  }, [user]);

  // 생성된 다이어리 ID (저장/공유 단계에서 사용)
  const [createdDiaryId, setCreatedDiaryId] = useState<number | null>(null);

  const [showGallery, setShowGallery] = useState(false);
  const [editedDiary, setEditedDiary] = useState("");
  const [progress, setProgress] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // Style States
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>("grid");
  const [textAlign, setTextAlign] = useState<TextAlign>("left");
  const [fontSize, setFontSize] = useState(16);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Handlers ---

  // 1. 이미지 선택 (로컬)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    if (selectedImages.length + files.length > 10) {
      alert("최대 10장까지 업로드 가능합니다.");
      return;
    }

    setIsSubmitting(true);
    // [중요] 원본 파일 저장
    setImageFiles(prev => [...prev, ...files]);

    try {
      const newImages = await uploadImagesToS3(files);
      setSelectedImages(prev => [...prev, ...newImages]);
    } catch (error) {
      console.error("이미지 처리 실패:", error);
      alert("이미지 처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
      e.target.value = ''; // Input 초기화
    }
  };

  // 2. 보관함에서 선택 (ARCHIVE)
  const handleSelectFromGallery = (imageUrl: string) => {
    const isSelected = selectedImages.some(img => img.imageUrl === imageUrl);
    if (isSelected) {
      setSelectedImages(prev => prev.filter(img => img.imageUrl !== imageUrl));
    } else if (selectedImages.length < 10) {
      setSelectedImages(prev => [...prev, { imageUrl, source: ImageType.ARCHIVE }]);
    }
  };

  // 3. [핵심] AI 다이어리 생성 (POST /api/diaries/ai)
  const handleGenerate = async () => {
    if (imageFiles.length === 0) {
      alert("AI 일기를 생성하려면 최소 1장의 로컬 사진이 필요합니다.");
      return;
    }
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    setStep("generating");

    // 진행률 애니메이션
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      if (currentProgress < 90) setProgress(currentProgress);
    }, 200);

    try {
      // [수정] 토큰에서 추출한 실제 userId 사용
      const userId = Number(user.id);

      // 펫 ID 사용
      if (!selectedPetId) {
        alert("주인공(반려동물)을 선택해주세요.");
        clearInterval(interval);
        setStep("upload");
        return;
      }
      const petId = selectedPetId;

      // [FormData 생성]
      const formData = new FormData();
      formData.append("image", imageFiles[0]);

      // 데이터 키 "data" (백엔드 @RequestPart("data")와 일치)
      const requestData = {
        userId,
        petId,
        content: "",
        visibility: "PRIVATE",
        isAiGen: true,
        weather: "맑음",
        mood: "행복"
      };

      formData.append("data", new Blob([JSON.stringify(requestData)], {
        type: "application/json"
      }));

      console.log(`Sending AI Diary Request for User: ${userId}, Pet: ${petId}`);

      // [API 호출] 생성
      const response = await createAiDiary(formData);
      const diaryId = response.diaryId;
      setCreatedDiaryId(diaryId);

      // [API 호출] 생성된 내용 조회
      const diaryDetail = await getDiary(diaryId);

      clearInterval(interval);
      setProgress(100);

      // 편집 화면으로 이동
      setEditedDiary(diaryDetail.content || "AI가 내용을 생성하지 못했습니다.");
      setTimeout(() => setStep("edit"), 500);

    } catch (error: any) {
      clearInterval(interval);
      console.error("생성 실패:", error);
      alert(`일기 생성 실패: ${error.message}`);
      setStep("upload");
    }
  };

  // 4. [핵심] 최종 저장 및 공유 (PATCH /api/diaries/{id})
  const handleShareToFeed = async () => {
    if (!createdDiaryId) return;
    setIsSubmitting(true);

    try {
      // 사용자가 편집한 내용 업데이트
      await updateDiary(createdDiaryId, {
        content: editedDiary,
        visibility: "PUBLIC"
      });

      setStep("complete");
    } catch (error: any) {
      console.error("저장 실패:", error);
      alert(`저장 실패: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. 완료 후 이동
  useEffect(() => {
    if (step === 'complete') {
      const timer = setTimeout(() => {
        navigate('/feed');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 pb-20 font-sans">
      <header className="sticky top-0 z-40 border-b border-pink-100 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <button onClick={() => navigate(-1)} className="text-pink-600 hover:text-pink-700 transition-colors p-1">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-pink-600 md:text-xl">AI 다이어리</h1>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-36 border-pink-200 text-sm rounded-lg p-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl p-4 md:p-6">
        {step === 'upload' && (
          <UploadStep
            selectedImages={selectedImages}
            isSubmitting={isSubmitting}
            handleImageUpload={handleImageUpload}
            handleGenerate={handleGenerate}
            setSelectedImages={setSelectedImages}
            setShowGallery={setShowGallery}
            pets={pets}
            selectedPetId={selectedPetId}
            setSelectedPetId={setSelectedPetId}
          />
        )}
        {step === 'generating' && <GeneratingStep progress={progress} />}
        {step === 'edit' && (
          <EditStep
            selectedImages={selectedImages}
            editedDiary={editedDiary}
            setEditedDiary={setEditedDiary}
            layoutStyle={layoutStyle} setLayoutStyle={setLayoutStyle}
            textAlign={textAlign} setTextAlign={setTextAlign}
            fontSize={fontSize} setFontSize={setFontSize}
            backgroundColor={backgroundColor} setBackgroundColor={setBackgroundColor}
            handleShareToFeed={handleShareToFeed}
            isSubmitting={isSubmitting}
          />
        )}
        {step === 'complete' && <CompleteStep />}
      </main>

      <GalleryModal
        showGallery={showGallery}
        setShowGallery={setShowGallery}
        selectedImages={selectedImages}
        handleSelectFromGallery={handleSelectFromGallery}
      />
    </div>
  );
}