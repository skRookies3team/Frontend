import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera, Upload, Edit3, Check, Share2, Calendar,
  Image as ImageIcon, X, ChevronLeft, Loader2,
  Save, BookOpen, PawPrint, Cloud, Sun, Smile 
} from 'lucide-react';

// ==========================================
// 1. Types & Interfaces (Internal Definition)
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

export interface PetResponseDto {
  petId: number;
  petName: string;
  species: 'DOG' | 'CAT';
  breed: string;
  genderType: 'MALE' | 'FEMALE' | 'NONE';
  is_neutered: boolean;
  profileImage: string;
  age: number;
  birth: string;
  status: string;
}

// ==========================================
// 2. Auth Logic (Mock)
// ==========================================

const useAuth = () => {
  const [user, setUser] = useState<{ id: number; username: string; pets: any[] } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('petlog_token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const payload = JSON.parse(jsonPayload);
        const userId = Number(payload.userId || payload.sub || payload.id);

        if (!isNaN(userId)) {
            // 실제로는 API로 펫 정보를 가져와야 함 (여기선 토큰 정보나 Mock 사용)
            const petsFromToken = payload.pets || [
                { id: 47, name: '초코', species: '강아지', breed: '푸들', gender: '남아', neutered: true, age: 3 },
                { id: 2, name: '나비', species: '고양이', breed: '코숏', gender: '여아', neutered: false, age: 2 }
            ];

            setUser({
                id: userId,
                username: payload.username || 'User',
                pets: petsFromToken
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
// 3. Services (API Calls)
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
  const response = await fetch(`${BASE_URL}/ai`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: formData
  });
  
  if (response.status === 401) throw new Error('인증 토큰이 만료되었습니다.');
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

export const uploadImagesToS3 = async (files: File[]) => {
  return new Promise<{ imageUrl: string; source: ImageType }[]>((resolve) => {
    const newImages = files.map(file => ({
      imageUrl: URL.createObjectURL(file),
      source: ImageType.GALLERY
    }));
    setTimeout(() => resolve(newImages), 500);
  });
};

// ==========================================
// 4. Sub-Components
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
  pets: PetResponseDto[];
  selectedPetId: number | null;
  setSelectedPetId: (id: number) => void;
}

const UploadStep: React.FC<UploadStepProps> = ({
  selectedImages, isSubmitting, handleImageUpload, handleGenerate, setSelectedImages, setShowGallery,
  pets, selectedPetId, setSelectedPetId
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-xl md:h-24 md:w-24">
          <Icon className="h-10 w-10 text-white md:h-12 md:w-12"><Camera className="w-full h-full" /></Icon>
        </div>
        <h2 className="text-2xl font-bold text-pink-600 md:text-3xl">AI 다이어리 작성하기</h2>
        <p className="mt-2 text-slate-500 md:text-lg">
          반려동물의 하루를 담은 사진을 선택해주세요
        </p>
      </div>

      <div className="flex justify-center mb-4">
        <div className="relative w-full max-w-xs">
          <div className="flex items-center gap-2 mb-2 justify-center">
            <PawPrint className="w-5 h-5 text-pink-500" />
            <span className="font-semibold text-gray-700">주인공 선택하기</span>
          </div>
          <select
            value={selectedPetId || ''}
            onChange={(e) => setSelectedPetId(Number(e.target.value))}
            className="w-full p-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none bg-white text-gray-700 font-medium shadow-sm transition-all"
          >
            <option value="" disabled>어떤 아이의 일기인가요?</option>
            {pets && pets.length > 0 ? (
                pets.map((pet) => (
                    <option key={pet.petId} value={pet.petId}>
                        {pet.petName} ({pet.species === 'DOG' ? '강아지' : '고양이'})
                    </option>
                ))
            ) : (
                <option value="1">기본 펫 (등록된 펫 없음)</option>
            )}
          </select>
        </div>
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
  // [추가] 날씨 & 기분 Props
  weather: string;
  setWeather: (val: string) => void;
  mood: string;
  setMood: (val: string) => void;
  // 스타일 관련 Props
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
  weather, setWeather, mood, setMood,
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
          {/* 상단 메타데이터: 날짜, 날씨, 기분 */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
              <Calendar className="w-4 h-4 text-pink-400" />
              {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </div>
            
            {/* [추가] 날씨 및 기분 표시/수정 영역 */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full text-sm text-blue-600">
                    <Sun className="w-4 h-4" />
                    <input 
                        type="text" 
                        value={weather} 
                        onChange={(e) => setWeather(e.target.value)}
                        className="bg-transparent border-none outline-none w-16 text-center text-blue-700 font-medium placeholder-blue-300"
                        placeholder="날씨"
                    />
                </div>
                <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-full text-sm text-yellow-600">
                    <Smile className="w-4 h-4" />
                    <input 
                        type="text" 
                        value={mood} 
                        onChange={(e) => setMood(e.target.value)}
                        className="bg-transparent border-none outline-none w-16 text-center text-yellow-700 font-medium placeholder-yellow-300"
                        placeholder="기분"
                    />
                </div>
            </div>
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
// 5. Main Page Component
// ==========================================

export default function AiDiaryPage() {
  const navigate = useNavigate();
  const { user } = useAuth(); 

  // --- States ---
  const [step, setStep] = useState<DiaryStep>("upload");
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]); 
  
  // 펫 선택 State
  const [pets, setPets] = useState<PetResponseDto[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);

  // [추가] 날씨 & 기분 State
  const [weather, setWeather] = useState("");
  const [mood, setMood] = useState("");

  // 펫 목록 로딩 및 매핑
  useEffect(() => {
    if (user?.pets && Array.isArray(user.pets)) {
        const mappedPets: PetResponseDto[] = user.pets.map((p: any) => ({
            petId: Number(p.id || p.petId),
            petName: p.name,
            species: p.species === 'CAT' || p.species === '고양이' ? 'CAT' : 'DOG',
            breed: p.breed || '품종 미상',
            genderType: p.gender === 'FEMALE' || p.gender === '여아' ? 'FEMALE' : 'MALE',
            is_neutered: !!p.neutered,
            profileImage: p.photo || '',
            age: Number(p.age || 0),
            birth: p.birthday || '',
            status: 'ACTIVE'
        }));
        setPets(mappedPets);
        
        if (mappedPets.length > 0 && !selectedPetId) {
            setSelectedPetId(mappedPets[0].petId);
        }
    }
  }, [user]);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    if (selectedImages.length + files.length > 10) {
      alert("최대 10장까지 업로드 가능합니다.");
      return;
    }

    setIsSubmitting(true);
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
    // 펫 선택 확인
    if (!selectedPetId) {
        alert("일기를 작성할 반려동물을 선택해주세요.");
        return;
    }

    setStep("generating");
    
    // [위치 정보 가져오기] Promise로 비동기 처리
    const getPosition = () => {
        return new Promise<{ lat: number, lng: number } | null>((resolve) => {
            if (!navigator.geolocation) {
                console.log("Geolocation is not supported by your browser");
                resolve(null);
                return;
            }

            // 타임아웃 5초 설정
            const options = {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            };

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log("위치 정보 획득 성공:", position.coords);
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("위치 정보 획득 실패 (Code " + error.code + "): " + error.message);
                    // 실패해도 null 반환하여 프로세스는 진행
                    resolve(null);
                },
                options
            );
        });
    };

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      if (currentProgress < 90) setProgress(currentProgress);
    }, 200);

    try {
      const userId = Number(user.id);
      const petId = selectedPetId;

      // 위치 정보 대기
      const location = await getPosition();

      const formData = new FormData();
      formData.append("image", imageFiles[0]); 

      const requestData = {
        userId,
        petId, 
        content: "",
        visibility: "PRIVATE",
        isAiGen: true,
        weather: "맑음",
        mood: "행복",
        latitude: location ? location.lat : null, // 위도 (없으면 null)
        longitude: location ? location.lng : null // 경도 (없으면 null)
      };
      
      formData.append("data", new Blob([JSON.stringify(requestData)], {
        type: "application/json"
      }));

      console.log(`Sending AI Diary Request for User: ${userId}, Pet: ${petId}, Loc: ${location?.lat}, ${location?.lng}`);

      const response = await createAiDiary(formData);
      const diaryId = response.diaryId;
      setCreatedDiaryId(diaryId);

      const diaryDetail = await getDiary(diaryId);
      
      clearInterval(interval);
      setProgress(100);

      // [추가] 받아온 일기 내용, 날씨, 기분 설정
      setEditedDiary(diaryDetail.content || "AI가 내용을 생성하지 못했습니다.");
      setWeather(diaryDetail.weather || "맑음"); // 기본값 제공
      setMood(diaryDetail.mood || "행복");       // 기본값 제공

      setTimeout(() => setStep("edit"), 500);

    } catch (error: any) {
      clearInterval(interval);
      console.error("생성 실패:", error);
      alert(`일기 생성 실패: ${error.message}`);
      setStep("upload");
    }
  };

  const handleShareToFeed = async () => {
    if (!createdDiaryId) return;
    setIsSubmitting(true);

    try {
      await updateDiary(createdDiaryId, {
        content: editedDiary,
        visibility: "PUBLIC",
        weather: weather, // [추가] 수정된 날씨 전송
        mood: mood        // [추가] 수정된 기분 전송
      });
      
      setStep("complete");
    } catch (error: any) {
      console.error("저장 실패:", error);
      alert(`저장 실패: ${error.message}`);
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
            weather={weather} setWeather={setWeather} // [추가]
            mood={mood} setMood={setMood}             // [추가]
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