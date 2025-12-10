import React, { useState } from 'react';
import { motion } from 'framer-motion';

// --- Import Types and Service Layer ---
import { DiaryStep, SelectedImage, LayoutStyle, TextAlign, ImageType } from '../types/diary.ts';
import { uploadImagesToS3, createAiDiary, generateAiDiaryContent } from '../services/DiaryService.tsx';

// --- Import Child Components ---
import UploadStep from '../../diary/components/UploadStep.tsx';
import GeneratingStep from '../../diary/components/GeneratingStep.tsx';
import EditStep from '../../diary/components/EditStep.tsx';
import CompleteStep from '../../diary/components/CompleteStep.tsx';
import GalleryModal from '../../diary/components/GalleryModal.tsx';


export default function AiDiaryPage() {
  
  const [step, setStep] = useState<DiaryStep>("upload");
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [editedDiary, setEditedDiary] = useState("");
  const [progress, setProgress] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]); 
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>("grid");
  const [textAlign, setTextAlign] = useState<TextAlign>("left");
  const [fontSize, setFontSize] = useState(16);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Logic Implementation (Handlers calling Service Layer) ---

  // 1. 이미지 업로드 핸들러
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    const availableSlots = 10 - selectedImages.length;
    const filesToUpload = files.slice(0, availableSlots);

    if (filesToUpload.length === 0) {
        alert("더 이상 업로드할 수 없습니다 (최대 10장).");
        e.target.value = ''; 
        return;
    }

    setIsSubmitting(true);
    e.target.value = ''; 
    
    try {
        const uploadedImages = await uploadImagesToS3(filesToUpload);
        setSelectedImages(prev => [...prev, ...uploadedImages]);

    } catch (error) {
        console.error("[ERROR] S3 업로드 실패:", error);
        alert("이미지 업로드에 실패했습니다.");
    } finally {
        setIsSubmitting(false);
    }
  };

  // 2. 보관함 이미지 선택 핸들러
  const handleSelectFromGallery = (imageUrl: string) => {
    const isSelected = selectedImages.some(img => img.imageUrl === imageUrl);
    
    if (isSelected) {
      setSelectedImages(prev => prev.filter(img => img.imageUrl !== imageUrl));
    } else if (selectedImages.length < 10) {
      const newImage: SelectedImage = { 
        imageUrl: imageUrl, 
        source: ImageType.ARCHIVE
      };
      setSelectedImages(prev => [...prev, newImage]);
      console.log(`[FRONT] ARCHIVE 이미지 추가됨: ${imageUrl}`);
    }
  };

  // 3. AI 다이어리 생성 핸들러 (진행 표시 포함)
  const handleGenerate = () => {
    if (selectedImages.length === 0) {
        alert("사진을 1장 이상 선택해주세요.");
        return;
    }
    setStep("generating");

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        
        generateAiDiaryContent().then(diary => {
            setEditedDiary(diary);
            setTimeout(() => setStep("edit"), 500);
        }).catch(error => {
            console.error("AI 생성 실패:", error);
            alert("AI 일기 생성 중 오류가 발생했습니다.");
            setStep("upload");
        });
      }
    }, 200);
  };
  
  // 4. 최종 백엔드 전송 핸들러
  const handleShareToFeed = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    const diaryData = {
      content: editedDiary || "AI 일기 내용을 입력하세요.",
      images: selectedImages.map((img, index) => ({
        imageUrl: img.imageUrl,
        imgOrder: index + 1,
        mainImage: index === 0,
        source: img.source 
      }))
    };

    try {
        const result = await createAiDiary(diaryData);
        alert(`일기 생성 성공! (ID: ${result.diaryId})`);
        setStep("complete");
    } catch (error) {
        console.error("일기 생성 실패:", error);
        alert(error instanceof Error ? error.message : '일기 생성 중 알 수 없는 오류 발생');
    } finally {
        setIsSubmitting(false);
    }
  };
  
  // --- UI Rendering (Main Switch) ---

  const Icon: React.FC<{ className?: string }> = ({ children, className }) => <span className={`inline-flex items-center justify-center ${className}`}>{children}</span>;
  
  const renderStep = () => {
    switch (step) {
      case 'upload':
        return (
          <UploadStep 
            selectedImages={selectedImages}
            isSubmitting={isSubmitting}
            handleImageUpload={handleImageUpload}
            handleGenerate={handleGenerate}
            setSelectedImages={setSelectedImages}
            setShowGallery={setShowGallery}
          />
        );
      case 'generating':
        return <GeneratingStep progress={progress} />;
      case 'edit':
        return (
          <EditStep
            selectedImages={selectedImages}
            editedDiary={editedDiary}
            setEditedDiary={setEditedDiary}
            layoutStyle={layoutStyle}
            setLayoutStyle={setLayoutStyle}
            textAlign={textAlign}
            setTextAlign={setTextAlign}
            fontSize={fontSize}
            setFontSize={setFontSize}
            backgroundColor={backgroundColor}
            setBackgroundColor={setBackgroundColor}
            handleShareToFeed={handleShareToFeed}
            isSubmitting={isSubmitting}
          />
        );
      case 'complete':
        return <CompleteStep />;
      default:
        return null;
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 pb-20">
      <header className="sticky top-0 z-40 border-b border-pink-100 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <button onClick={() => alert("Go Back")} className="text-pink-600">
            <Icon className="h-6 w-6">{'<'}</Icon>
          </button>
          <h1 className="text-lg font-bold text-pink-600 md:text-xl">AI 다이어리</h1>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-36 border-pink-200 text-sm rounded-lg p-2"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl p-4 md:p-6">
        {renderStep()}
      </main>

      {/* Gallery modal for selecting existing photos */}
      <GalleryModal
        showGallery={showGallery}
        setShowGallery={setShowGallery}
        selectedImages={selectedImages}
        handleSelectFromGallery={handleSelectFromGallery}
      />
    </div>
  )
}