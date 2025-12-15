import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera, Upload, Edit3, Check, Share2, Calendar,
  Image as ImageIcon, X, ChevronLeft, Loader2,
  Save, BookOpen
} from 'lucide-react';

// ==========================================
// 0. Auth Logic (JWT Token Parsing)
// ==========================================
// [중요] 실제 프로젝트의 useAuth 훅을 import 해서 쓰신다면 아래 로컬 useAuth는 지우고 import문을 사용하세요.
// import { useAuth } from '@/features/auth/context/auth-context';

const useAuth = () => {
  const [user, setUser] = useState<{ id: number; username: string; pets: any[] } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('petlog_token');
    if (token) {
      try {
        // JWT Payload 디코딩
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);

        // 토큰에서 userId 추출 (필드명은 토큰 생성 로직에 따라 다를 수 있음: 'sub', 'userId', 'id' 등 확인 필요)
        // 여기서는 payload.userId 또는 payload.sub를 사용한다고 가정
        const userId = Number(payload.userId || payload.sub || payload.id);

        if (!isNaN(userId)) {
          setUser({
            id: userId,
            username: payload.username || 'User',
            pets: [] // 토큰에 펫 정보가 없다면 빈 배열 (펫 선택 로직 주의)
          });
        }
      } catch (e) {
        console.error("토큰 파싱 실패:", e);
      }
    }
  }, []);

  return { user };
};

// ==========================================
// 1. Types & Interfaces
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

export interface CreateDiaryResponse {
  diaryId: number;
  message: string;
}

// ==========================================
// 2. Services
// ==========================================

const BASE_URL = 'http://localhost:8000/api/diaries';

const getAuthHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('petlog_token');
  const headers: HeadersInit = {
    'Authorization': token ? `Bearer ${token}` : ''
  };
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

export const createAiDiary = async (formData: FormData): Promise<CreateDiaryResponse> => {
  // 백엔드 엔드포인트 확인 (/api/diaries/ai)
  const response = await fetch(`${BASE_URL}/ai`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: formData
  });

  if (response.status === 401) {
    throw new Error('인증 토큰이 만료되었습니다. 다시 로그인해주세요.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'AI 일기 생성 실패');
  }
  return await response.json();
};

export const getDiary = async (diaryId: number): Promise<any> => {
  const response = await fetch(`${BASE_URL}/${diaryId}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!response.ok) throw new Error('일기 조회 실패');
  return await response.json();
};

export const updateDiary = async (diaryId: number, data: any): Promise<void> => {
  const response = await fetch(`${BASE_URL}/${diaryId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) throw new Error('일기 저장 실패');
};

export const uploadImagesToS3 = async (files: File[]): Promise<SelectedImage[]> => {
  return new Promise<SelectedImage[]>((resolve) => {
    const newImages = files.map(file => ({
      imageUrl: URL.createObjectURL(file),
      source: ImageType.GALLERY
    }));
    setTimeout(() => resolve(newImages), 500);
  });
};

// ==========================================
// 3. Sub-Components
// ==========================================

const Icon: React.FC<{ className?: string, children: React.ReactNode }> = ({ children, className }) => (
  <span className={`inline-flex items-center justify-center ${className}`}>{children}</span>
);

// --- UploadStep ---
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

// --- GeneratingStep ---
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

// --- EditStep ---
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

// --- CompleteStep ---
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

// --- GalleryModal ---
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
  // [수정] 위에서 정의한 JWT 파싱 로직의 useAuth 사용
  const { user } = useAuth();

  // --- States ---
  const [step, setStep] = useState<DiaryStep>("upload");
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

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

      // 펫 ID 추출 (없으면 1로 Fallback - 주의: 사용자가 펫을 선택하게 하는 UI가 있다면 그 값을 써야 함)
      let petId = 1;
      if (user.pets && user.pets.length > 0) {
        // @ts-ignore
        petId = Number(user.pets[0].id || user.pets[0].petId);
        if (isNaN(petId) || petId === 0) petId = 1;
      }

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