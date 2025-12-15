import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera, Upload, Edit3, Check, Share2, Calendar,
  Image as ImageIcon, X, ChevronLeft, Loader2,
  Save, Trash2, BookOpen
} from 'lucide-react';
import { useAuth } from '@/features/auth/context/auth-context';

// ==========================================
// 1. Types & Interfaces (통합)
// ==========================================

export type DiaryStep = 'upload' | 'generating' | 'edit' | 'complete';
export type LayoutStyle = 'grid' | 'masonry' | 'slide' | 'classic';
export type TextAlign = 'left' | 'center' | 'right';

export enum ImageType {
  GALLERY = 'GALLERY',
  ARCHIVE = 'ARCHIVE'
}

export interface SelectedImage {
  imageUrl: string;
  source: ImageType;
}

export interface DiaryRequest {
  userId: number;
  petId: number;
  content: string;
  visibility: string;
  isAiGen: boolean;
  weather: string | null;
  mood: string | null;
  images: {
    imageUrl: string;
    imgOrder: number;
    mainImage: boolean;
    source: ImageType;
  }[];
}

export interface CreateDiaryResponse {
  diaryId: number;
  message: string;
}

// ==========================================
// 2. Services (통합)
// ==========================================

const uploadImagesToS3 = async (files: File[]): Promise<SelectedImage[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newImages = files.map(file => ({
        imageUrl: URL.createObjectURL(file),
        source: ImageType.GALLERY
      }));
      resolve(newImages);
    }, 1000);
  });
};

const generateAiDiaryContent = async (): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("오늘 초코는 공원에서 정말 행복한 시간을 보냈어요. 새로운 친구들을 만나고 신나게 뛰어놀았답니다. 햇살이 따스했고, 초코의 웃는 얼굴을 보니 저도 덩달아 행복해졌어요. 이렇게 맑은 날씨에 함께할 수 있어서 감사한 하루였습니다.");
    }, 1500);
  });
};

const createAiDiary = async (data: DiaryRequest): Promise<CreateDiaryResponse> => {
  const token = localStorage.getItem('petlog_token');

  const response = await fetch('http://localhost:8000/api/diaries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || '일기 생성 실패');
  }

  return await response.json();
};

// ==========================================
// 3. Components (통합)
// ==========================================

const Icon: React.FC<{ className?: string, children: React.ReactNode }> = ({ children, className }) => (
  <span className={`inline-flex items-center justify-center ${className}`}>{children}</span>
);

// 3-1. UploadStep
interface UploadStepProps {
  selectedImages: SelectedImage[];
  isSubmitting: boolean;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleGenerate: () => void;
  setSelectedImages: React.Dispatch<React.SetStateAction<SelectedImage[]>>;
  setShowGallery: (show: boolean) => void;
}

const UploadStep: React.FC<UploadStepProps> = ({
  selectedImages, isSubmitting, handleImageUpload, handleGenerate, setSelectedImages, setShowGallery
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-xl md:h-24 md:w-24">
          <Icon className="h-10 w-10 text-white md:h-12 md:w-12"><Camera className="w-full h-full" /></Icon>
        </div>
        <h2 className="text-2xl font-bold text-pink-600 md:text-3xl">AI 다이어리 작성하기</h2>
        <p className="mt-2 text-slate-500 md:text-lg">
          반려동물의 하루를 담은 사진 1-10장을 업로드하면 AI가 아름다운 일기를 작성해드려요
        </p>
      </div>

      <div className="border border-pink-100 shadow-xl rounded-xl bg-white">
        <div className="p-6 md:p-8">
          {selectedImages.length === 0 ? (
            <div className="space-y-4">
              <label className="flex w-full cursor-pointer flex-col items-center gap-6 rounded-3xl border-2 border-dashed border-pink-300 bg-gradient-to-br from-pink-50 to-rose-50 p-16 transition-all hover:border-pink-500 hover:from-white hover:to-pink-50 md:p-24">
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isSubmitting} />
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg">
                  <Icon className="h-10 w-10 text-white"><Upload /></Icon>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-pink-600">{isSubmitting ? '업로드 중...' : '로컬 사진 선택 (Source: GALLERY)'}</p>
                  <p className="mt-2 text-slate-500">최대 10장까지 업로드 가능 • JPG, PNG</p>
                </div>
              </label>

              <button
                onClick={() => setShowGallery(true)}
                className="w-full border-2 border-pink-300 text-pink-600 hover:bg-pink-50 bg-transparent py-3 px-4 rounded-full font-bold transition flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                <Icon className="w-5 h-5"><ImageIcon /></Icon>
                보관함에서 선택하기 (Source: ARCHIVE)
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-semibold text-pink-600">선택된 사진 {selectedImages.length}/10</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowGallery(true)}
                      className="border border-pink-200 text-pink-600 hover:bg-pink-50 bg-transparent py-2 px-3 text-sm rounded-lg font-medium flex items-center gap-1"
                    >
                      <Icon className="w-4 h-4"><ImageIcon /></Icon>
                      보관함
                    </button>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isSubmitting || selectedImages.length >= 10}
                      />
                      <span className="border border-pink-200 text-pink-600 hover:bg-pink-50 bg-transparent py-2 px-3 text-sm rounded-lg font-medium flex items-center cursor-pointer h-full gap-1">
                        <Icon className="w-4 h-4"><Upload /></Icon>
                        추가
                      </span>
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
                  {selectedImages.map((image, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square overflow-hidden rounded-xl shadow-md transition-transform"
                    >
                      <img
                        src={image.imageUrl}
                        alt={`Upload ${index + 1}`}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      />
                      <div className={`absolute bottom-0 left-0 px-2 py-1 text-xs font-bold text-white rounded-tr-lg ${image.source === ImageType.GALLERY ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                        {image.source}
                      </div>
                      <button
                        onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== index))}
                        className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white opacity-0 transition-opacity hover:bg-black group-hover:opacity-100"
                      >
                        <Icon className="h-4 w-4"><X /></Icon>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isSubmitting || selectedImages.length === 0}
                className="w-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-lg font-bold shadow-xl py-3 transition-all hover:scale-[1.01] hover:from-pink-600 hover:to-rose-600 md:text-xl text-white disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Icon className="h-6 w-6"><Edit3 /></Icon>
                AI 다이어리 생성하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 3-2. GeneratingStep
const GeneratingStep: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-fade-in">
    <div className="relative w-32 h-32">
      <div className="absolute inset-0 border-4 border-pink-100 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-pink-500 rounded-full border-t-transparent animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center text-pink-600 font-bold text-xl">
        {progress}%
      </div>
    </div>
    <div className="text-center space-y-2">
      <h2 className="text-2xl font-bold text-gray-800">AI가 일기를 쓰고 있어요</h2>
      <p className="text-gray-500">사진 속 추억을 분석하여 감성적인 글을 만들고 있습니다...</p>
    </div>
  </div>
);

// 3-3. EditStep
interface EditStepProps {
  selectedImages: SelectedImage[];
  editedDiary: string;
  setEditedDiary: (val: string) => void;
  layoutStyle: LayoutStyle;
  setLayoutStyle: (val: LayoutStyle) => void;
  textAlign: TextAlign;
  setTextAlign: (val: TextAlign) => void;
  fontSize: number;
  setFontSize: (val: number) => void;
  backgroundColor: string;
  setBackgroundColor: (val: string) => void;
  handleShareToFeed: () => void;
  isSubmitting: boolean;
}

const EditStep: React.FC<EditStepProps> = ({
  selectedImages, editedDiary, setEditedDiary,
  layoutStyle, setLayoutStyle, textAlign, setTextAlign,
  fontSize, setFontSize, backgroundColor, setBackgroundColor,
  handleShareToFeed, isSubmitting
}) => {
  const backgroundColors = ["#ffffff", "#fff5f5", "#fef2f2", "#fdf4ff", "#f0f9ff"];

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <div className="w-full lg:flex-1 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 sticky top-24"
        style={{ backgroundColor }}>
        <div className={`p-8 ${textAlign === 'center' ? 'text-center' : textAlign === 'right' ? 'text-right' : 'text-left'}`}>
          <div className="flex items-center gap-2 text-gray-400 mb-6 text-sm font-medium">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </div>

          <div className={`mb-8 gap-2 ${layoutStyle === 'grid' ? 'grid grid-cols-2' :
            layoutStyle === 'masonry' ? 'columns-2 space-y-2' :
              layoutStyle === 'slide' ? 'flex overflow-x-auto pb-2 snap-x' :
                'flex flex-col space-y-4'
            }`}>
            {selectedImages.map((img, idx) => (
              <img
                key={idx}
                src={img.imageUrl}
                alt="diary"
                className={`rounded-lg object-cover shadow-sm w-full ${layoutStyle === 'slide' ? 'min-w-[80%] snap-center' : ''}`}
              />
            ))}
          </div>

          <textarea
            value={editedDiary}
            onChange={(e) => setEditedDiary(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 resize-none leading-relaxed text-gray-700 placeholder-gray-300 outline-none p-0"
            style={{ fontSize: `${fontSize}px`, minHeight: '200px' }}
            spellCheck={false}
          />
        </div>
      </div>

      <div className="w-full lg:w-80 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 space-y-6">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-pink-500" /> 스타일 편집
          </h3>

          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">레이아웃</label>
            <div className="grid grid-cols-4 gap-2">
              {['grid', 'masonry', 'slide', 'classic'].map((style) => (
                <button
                  key={style}
                  onClick={() => setLayoutStyle(style as LayoutStyle)}
                  className={`p-2 rounded-lg text-xs font-medium transition-all ${layoutStyle === style
                    ? 'bg-pink-50 text-pink-600 border border-pink-200 shadow-sm'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">정렬</label>
            <div className="flex bg-gray-50 rounded-lg p-1">
              {['left', 'center', 'right'].map((align) => (
                <button
                  key={align}
                  onClick={() => setTextAlign(align as TextAlign)}
                  className={`flex-1 py-1.5 rounded-md text-sm transition-all ${textAlign === align ? 'bg-white shadow text-gray-800' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  {align === 'left' ? 'L' : align === 'center' ? 'C' : 'R'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">글자 크기</label>
              <span className="text-xs font-medium text-pink-500">{fontSize}px</span>
            </div>
            <input
              type="range" min="12" max="24" step="1"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-pink-500 h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">배경 색상</label>
            <div className="grid grid-cols-5 gap-2">
              {backgroundColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setBackgroundColor(color)}
                  className={`h-8 rounded-full border transition-all ${backgroundColor === color ? "border-pink-500 scale-110 ring-1 ring-pink-500" : "border-gray-200"}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleShareToFeed}
          disabled={isSubmitting}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-pink-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>저장하고 공유하기</span>
        </button>
      </div>
    </div>
  );
};

// 3-4. CompleteStep
const CompleteStep: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
    <div className="bg-green-100 p-6 rounded-full mb-6 animate-bounce-short">
      <Check className="w-12 h-12 text-green-600" />
    </div>
    <h2 className="text-3xl font-bold text-gray-800 mb-4">일기 작성이 완료되었어요!</h2>
    <p className="text-gray-500 mb-8 max-w-md">
      소중한 추억이 안전하게 저장되었습니다.<br />
      이제 피드에서 친구들과 공유해보세요.
    </p>
    <div className="flex gap-4">
      <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors">
        내 다이어리 보기
      </button>
      <button className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-medium shadow-md transition-colors flex items-center gap-2">
        <Share2 className="w-4 h-4" /> 피드 공유하기
      </button>
    </div>
  </div>
);

// 3-5. GalleryModal
interface GalleryModalProps {
  showGallery: boolean;
  setShowGallery: (show: boolean) => void;
  selectedImages: SelectedImage[];
  handleSelectFromGallery: (url: string) => void;
}

const GalleryModal: React.FC<GalleryModalProps> = ({
  showGallery, setShowGallery, selectedImages, handleSelectFromGallery
}) => {
  if (!showGallery) return null;

  const archiveImages = Array.from({ length: 8 }).map((_, i) =>
    `https://picsum.photos/seed/${i + 100}/200/200`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl animate-scale-up">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-pink-500" /> 사진 보관함
          </h3>
          <button onClick={() => setShowGallery(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {archiveImages.map((img, idx) => {
              const isSelected = selectedImages.some(si => si.imageUrl === img);
              return (
                <div
                  key={idx}
                  onClick={() => handleSelectFromGallery(img)}
                  className={`aspect-square rounded-xl overflow-hidden cursor-pointer relative group transition-all duration-200 ${isSelected ? 'ring-4 ring-pink-500 ring-offset-2' : 'hover:opacity-90'
                    }`}
                >
                  <img src={img} alt="archive" className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center">
                      <div className="bg-pink-500 text-white rounded-full p-1 shadow-sm">
                        <Check className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end">
          <button
            onClick={() => setShowGallery(false)}
            className="px-6 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-medium transition-colors"
          >
            선택 완료
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. Main Page: AiDiaryPage
// ==========================================

export default function AiDiaryPage() {
  const navigate = useNavigate();
  const { user } = useAuth(); // AuthContext 사용

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

  // --- Handlers ---

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    if (selectedImages.length + files.length > 10) {
      alert("더 이상 업로드할 수 없습니다 (최대 10장).");
      return;
    }

    setIsSubmitting(true);
    e.target.value = '';

    try {
      const newImages = await uploadImagesToS3(files);
      setSelectedImages(prev => [...prev, ...newImages]);
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      alert("이미지 처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectFromGallery = (imageUrl: string) => {
    const isSelected = selectedImages.some(img => img.imageUrl === imageUrl);
    if (isSelected) {
      setSelectedImages(prev => prev.filter(img => img.imageUrl !== imageUrl));
    } else if (selectedImages.length < 10) {
      setSelectedImages(prev => [...prev, { imageUrl, source: ImageType.ARCHIVE }]);
    }
  };

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
          console.error(error);
          alert("AI 생성 실패");
          setStep("upload");
        });
      }
    }, 200);
  };

  const handleShareToFeed = async () => {
    if (isSubmitting) return;

    if (!user) {
      alert("로그인이 필요한 서비스입니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      const userId = Number(user.id);

      // [핵심 수정] petId 추출 로직 강화
      let petId: number;

      if (user.pets && Array.isArray(user.pets) && user.pets.length > 0) {
        const firstPet = user.pets[0];
        petId = Number(firstPet.id);
        if (isNaN(petId)) {
          // @ts-ignore
          petId = Number(firstPet.petId);
        }
      } else {
        console.warn("등록된 펫이 없어 기본 ID(1)를 사용합니다.");
        petId = 1;
      }

      if (isNaN(petId) || petId <= 0) {
        throw new Error("유효한 반려동물 ID를 찾을 수 없습니다.");
      }

      const diaryRequest: DiaryRequest = {
        userId,
        petId,
        content: editedDiary || "내용 없음",
        visibility: "PUBLIC",
        isAiGen: true,
        weather: "맑음",
        mood: "행복",
        images: selectedImages.map((img, index) => ({
          imageUrl: img.imageUrl,
          imgOrder: index + 1,
          mainImage: index === 0,
          source: img.source
        }))
      };

      console.log("Sending Diary Request:", diaryRequest);

      const result = await createAiDiary(diaryRequest);
      console.log(`Created Diary ID: ${result.diaryId}`);
      setStep("complete");

    } catch (error: any) {
      console.error("일기 저장 실패:", error);
      alert(`일기 저장 실패: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          />
        )}
        {step === 'generating' && <GeneratingStep progress={progress} />}
        {step === 'edit' && (
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