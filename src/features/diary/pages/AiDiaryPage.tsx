import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, MemoryRouter as Router } from 'react-router-dom';
import {
  Camera, Upload, Edit3, Check, Share2, Calendar,
  Image as ImageIcon, X, ChevronLeft, Loader2,
  Save, BookOpen, PawPrint, Cloud, Sun, Smile, MapPin, Map as MapIcon
} from 'lucide-react';
import { createRoot } from 'react-dom/client';

// ==========================================
// 1. Services (Preview를 위한 Mock Service)
// ==========================================

const createAiDiary = async (formData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ diaryId: Date.now(), message: 'Success' });
    }, 2000);
  });
};

const getDiary = async (diaryId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        content: "오늘은 초코와 함께 산책을 다녀왔다. 날씨가 정말 좋아서 초코도 신나게 뛰어놀았다. 바람이 시원하게 불어서 산책하기 딱 좋은 날이었다.",
        weather: "맑음",
        mood: "행복",
        locationName: null
      });
    }, 500);
  });
};

const updateDiary = async (diaryId, data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Diary Saved:", data);
      resolve();
    }, 1000);
  });
};

const uploadImagesToS3 = async (files) => {
  return new Promise((resolve) => {
    const newImages = files.map(file => ({
      imageUrl: URL.createObjectURL(file),
      source: 'GALLERY'
    }));
    setTimeout(() => resolve(newImages), 500);
  });
};

// ==========================================
// 2. Auth Logic (Mock)
// ==========================================

const useAuth = () => {
  const [user, setUser] = useState({
    id: 1,
    username: 'DemoUser',
    pets: [
      { id: 47, name: '초코', species: 'DOG', breed: '푸들', gender: 'MALE', neutered: true, age: 3 },
      { id: 2, name: '나비', species: 'CAT', breed: '코숏', gender: 'FEMALE', neutered: false, age: 2 }
    ]
  });
  return { user };
};

// ==========================================
// 3. Components
// ==========================================

const Icon = ({ children, className }) => (
  <span className={`inline-flex items-center justify-center ${className}`}>{children}</span>
);

// --- [UPDATED] Kakao Map Component ---
const KakaoMap = ({ lat, lng, setAddress }) => {
  const mapRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    // 입력해주신 키 적용
    const KAKAO_API_KEY = "9e8e14d3e91f66f04016e81a8448e4c8";

    // 이미 스크립트가 있다면 로드 과정 생략
    if (document.getElementById('kakao-map-script')) {
      if (window.kakao && window.kakao.maps) {
        setIsLoaded(true);
      }
      return;
    }

    const script = document.createElement("script");
    script.id = 'kakao-map-script';
    // autoload=false 필수, services 라이브러리 추가
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&libraries=services&autoload=false`;
    script.async = true;

    script.onload = () => {
      // 로드 성공 시
      window.kakao.maps.load(() => {
        setIsLoaded(true);
      });
    };

    script.onerror = () => {
      console.warn("Kakao Map script failed to load. Switching to Mock View.");
      setLoadError(true);
    };

    document.head.appendChild(script);

    return () => {
      // Clean up optional
    };
  }, []);

  useEffect(() => {
    if (isLoaded && mapRef.current && lat && lng && !loadError) {
      try {
        const options = {
          center: new window.kakao.maps.LatLng(lat, lng),
          level: 3,
        };
        const map = new window.kakao.maps.Map(mapRef.current, options);

        const markerPosition = new window.kakao.maps.LatLng(lat, lng);
        const marker = new window.kakao.maps.Marker({
          position: markerPosition
        });
        marker.setMap(map);

        // [Reverse Geocoding] 좌표 -> 주소 변환
        if (setAddress && window.kakao.maps.services) {
          const geocoder = new window.kakao.maps.services.Geocoder();
          geocoder.coord2Address(lng, lat, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
              const address = result[0].address.address_name;
              console.log("주소 변환 성공:", address);
              setAddress(address);
            } else {
              console.warn("주소 변환 실패 status:", status);
            }
          });
        }

      } catch (e) {
        console.error("Map render error:", e);
        setLoadError(true);
      }
    }
  }, [isLoaded, lat, lng, loadError, setAddress]);

  if (!lat || !lng) return null;

  // [화면 렌더링] 로드 실패 시 대체 UI 보여주기
  if (loadError) {
    return (
      <div className="w-full h-48 rounded-xl overflow-hidden shadow-inner bg-blue-50 relative group border border-blue-100 flex flex-col items-center justify-center">
        {/* 지도 느낌의 배경 패턴 */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}>
        </div>

        {/* 마커 아이콘 시뮬레이션 */}
        <MapPin className="w-10 h-10 text-red-500 drop-shadow-md z-10 animate-bounce" fill="currentColor" />
        <div className="w-4 h-2 bg-black/10 rounded-full blur-[2px] mt-1 z-0"></div>

        <div className="mt-3 text-xs text-center text-gray-500 bg-white/90 px-3 py-1.5 rounded-lg shadow-sm z-10 mx-4">
          <p className="font-bold text-gray-700">지도 로딩 실패</p>
          <p className="text-[10px]">도메인 미등록 또는 키 문제 (로컬 실행 권장)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-48 rounded-xl overflow-hidden shadow-inner bg-gray-100 relative group">
      <div id="map" ref={mapRef} className="w-full h-full" />

      {!isLoaded && !loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400">
          <Loader2 className="w-8 h-8 mb-2 opacity-50 animate-spin" />
          <p className="text-xs">지도 불러오는 중...</p>
        </div>
      )}
    </div>
  );
};


// --- UploadStep ---
const UploadStep = ({
  selectedImages, isSubmitting, handleImageUpload, handleGenerate, setSelectedImages, setShowGallery,
  pets, selectedPetId, setSelectedPetId, selectedDate, setSelectedDate
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-xl md:h-24 md:w-24">
          <Icon className="h-10 w-10 text-white md:h-12 md:w-12"><Camera className="w-full h-full" /></Icon>
        </div>
        <h2 className="text-2xl font-bold text-pink-600 md:text-3xl">AI 다이어리 작성하기</h2>
        <p className="mt-2 text-slate-500 md:text-lg">
          언제, 어떤 아이의 하루였나요?
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 mb-4">
        {/* 날짜 선택 */}
        <div className="relative w-full max-w-xs">
          <div className="flex items-center gap-2 mb-2 justify-center">
            <Calendar className="w-5 h-5 text-pink-500" />
            <span className="font-semibold text-gray-700">날짜 선택</span>
          </div>
          <input
            type="date"
            value={selectedDate}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none bg-white text-gray-700 font-medium shadow-sm transition-all text-center"
          />
        </div>

        {/* 펫 선택 */}
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
              <option value="1">기본 펫</option>
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
                  <p className="text-xl font-bold text-pink-600">{isSubmitting ? '업로드 중...' : '사진 선택하기'}</p>
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
                      <div className={`absolute bottom-0 left-0 px-2 py-1 text-xs font-bold text-white rounded-tr-lg ${image.source === 'GALLERY' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
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
const GeneratingStep = ({ progress }) => (
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
      <p className="text-gray-500">사진 속 추억과 날씨 정보를 분석하고 있습니다...</p>
    </div>
  </div>
);

// --- EditStep ---
const EditStep = ({
  selectedImages, editedDiary, setEditedDiary,
  weather, setWeather, mood, setMood, locationName, setLocationName, locationCoords,
  selectedDate,
  layoutStyle, setLayoutStyle, textAlign, setTextAlign,
  fontSize, setFontSize, backgroundColor, setBackgroundColor,
  handleShareToFeed, isSubmitting
}) => {
  const backgroundColors = ["#ffffff", "#fff5f5", "#fef2f2", "#fdf4ff", "#f0f9ff"];

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start animate-fade-in">
      <div className="w-full lg:flex-1 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 sticky top-24"
        style={{ backgroundColor }}>
        <div className={`p-8 ${textAlign === 'center' ? 'text-center' : textAlign === 'right' ? 'text-right' : 'text-left'}`}>
          {/* 상단 메타데이터: 날짜, 위치, 날씨, 기분 */}
          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
              <Calendar className="w-4 h-4 text-pink-400" />
              {/* 선택된 날짜 표시 */}
              {new Date(selectedDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </div>

            {/* 메타데이터 표시/수정 영역 (위치, 날씨, 기분) */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {/* 위치 정보 표시 UI (텍스트) */}
              <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full text-sm text-green-600 flex-1 sm:flex-none justify-center">
                <MapPin className="w-4 h-4 shrink-0" />
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="bg-transparent border-none outline-none w-48 text-center text-green-700 font-medium placeholder-green-300 focus:ring-0 p-0 text-sm truncate"
                  placeholder="위치 (예: 마포구)"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full text-sm text-blue-600 flex-1 sm:flex-none justify-center">
                <Sun className="w-4 h-4 shrink-0" />
                <input
                  type="text"
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  className="bg-transparent border-none outline-none w-16 text-center text-blue-700 font-medium placeholder-blue-300 focus:ring-0 p-0 text-sm"
                  placeholder="날씨"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-full text-sm text-yellow-600 flex-1 sm:flex-none justify-center">
                <Smile className="w-4 h-4 shrink-0" />
                <input
                  type="text"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="bg-transparent border-none outline-none w-16 text-center text-yellow-700 font-medium placeholder-yellow-300 focus:ring-0 p-0 text-sm"
                  placeholder="기분"
                />
              </div>
            </div>
          </div>

          {/* 카카오맵 표시 영역 (로드 실패 시 Fallback UI 표시) */}
          {locationCoords && (
            <div className="mb-6">
              <KakaoMap lat={locationCoords.lat} lng={locationCoords.lng} setAddress={setLocationName} />
            </div>
          )}

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
                  onClick={() => setLayoutStyle(style)}
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
                  onClick={() => setTextAlign(align)}
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
const CompleteStep = ({ onHome }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
    <div className="bg-green-100 p-6 rounded-full mb-6">
      <Check className="w-12 h-12 text-green-600" />
    </div>
    <h2 className="text-3xl font-bold text-gray-800 mb-4">일기 작성이 완료되었어요!</h2>
    <p className="text-gray-500 mb-8 max-w-md">
      소중한 추억이 안전하게 저장되었습니다.<br />
      이제 피드에서 친구들과 공유해보세요.
    </p>
    <div className="flex gap-4">
      <button
        onClick={onHome}
        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
      >
        내 다이어리 보기
      </button>
      <button
        onClick={onHome}
        className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-medium shadow-md transition-colors flex items-center gap-2"
      >
        <Share2 className="w-4 h-4" /> 피드 공유하기
      </button>
    </div>
  </div>
);

// --- GalleryModal ---
const GalleryModal = ({
  showGallery, setShowGallery, selectedImages, handleSelectFromGallery
}) => {
  if (!showGallery) return null;

  const archiveImages = Array.from({ length: 8 }).map((_, i) =>
    `https://picsum.photos/seed/${i + 100}/200/200`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl">
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
// 4. Main Page Component
// ==========================================

const AiDiaryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // --- States ---
  const [step, setStep] = useState("upload");
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);

  // 펫 선택 State
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(null);

  // 날씨 & 기분 & 위치 State
  const [weather, setWeather] = useState("");
  const [mood, setMood] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationCoords, setLocationCoords] = useState(null); // [NEW] 위도/경도 객체 상태

  const [createdDiaryId, setCreatedDiaryId] = useState(null);
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

  // Load Pets
  useEffect(() => {
    if (user?.pets && Array.isArray(user.pets)) {
      const mappedPets = user.pets.map((p) => ({
        petId: Number(p.id || p.petId),
        petName: p.name,
        species: p.species === 'CAT' ? 'CAT' : 'DOG',
        breed: p.breed || 'Unknown',
        genderType: p.gender === 'FEMALE' ? 'FEMALE' : 'MALE',
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

  // --- Handlers ---

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
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
      console.error("Image upload failed:", error);
      alert("Error uploading images.");
    } finally {
      setIsSubmitting(false);
      e.target.value = '';
    }
  };

  const handleSelectFromGallery = (imageUrl) => {
    const isSelected = selectedImages.some(img => img.imageUrl === imageUrl);
    if (isSelected) {
      setSelectedImages(prev => prev.filter(img => img.imageUrl !== imageUrl));
    } else if (selectedImages.length < 10) {
      setSelectedImages(prev => [...prev, { imageUrl, source: 'ARCHIVE' }]);
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

    setStep("generating");

    // [위치 정보 가져오기]
    const getPosition = () => {
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          console.log("Geolocation 미지원");
          resolve(null);
          return;
        }

        const options = {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            console.error("Geolocation Error:", error);
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
      const location = await getPosition();

      // [수정] 좌표 정보 저장 및 주소 시뮬레이션
      if (location) {
        // 1. 좌표 상태 저장 (지도를 그리기 위해 필요)
        setLocationCoords({ lat: location.lat, lng: location.lng });

        // 2. 주소는 KakaoMap 컴포넌트에서 Reverse Geocoding으로 가져옴
        setLocationName("위치 확인 중...");
      } else {
        setLocationName("위치 정보 없음");
        setLocationCoords(null);
      }

      const formData = new FormData();
      // ... formData logic ...

      const response = await createAiDiary(formData);
      const diaryId = response.diaryId;
      setCreatedDiaryId(diaryId);

      const diaryDetail = await getDiary(diaryId);

      clearInterval(interval);
      setProgress(100);

      setEditedDiary(diaryDetail.content || "AI가 일기를 생성하지 못했습니다.");
      setWeather(diaryDetail.weather || "맑음");
      setMood(diaryDetail.mood || "행복");

      if (diaryDetail.locationName) {
        setLocationName(diaryDetail.locationName);
      }

      setTimeout(() => setStep("edit"), 500);

    } catch (error) {
      clearInterval(interval);
      console.error("Generation failed:", error);
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
        weather,
        mood,
        locationName // 수정된 위치 정보 저장
      });

      setStep("complete");
    } catch (error) {
      console.error("Save failed:", error);
      alert(`저장 실패: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep("upload");
    setSelectedImages([]);
    setImageFiles([]);
    setEditedDiary("");
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 pb-20 font-sans text-gray-800">
      <header className="sticky top-0 z-40 border-b border-pink-100 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <button onClick={() => navigate(-1)} className="text-pink-600 hover:text-pink-700 transition-colors p-1">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-pink-600 md:text-xl">Pet Log AI</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-pink-500 hidden sm:block">
              {user?.username}
            </span>
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
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        )}
        {step === 'generating' && <GeneratingStep progress={progress} />}
        {step === 'edit' && (
          <EditStep
            selectedImages={selectedImages}
            editedDiary={editedDiary}
            setEditedDiary={setEditedDiary}
            weather={weather} setWeather={setWeather}
            mood={mood} setMood={setMood}
            locationName={locationName} setLocationName={setLocationName}
            locationCoords={locationCoords} // [NEW] 전달
            selectedDate={selectedDate}
            layoutStyle={layoutStyle} setLayoutStyle={setLayoutStyle}
            textAlign={textAlign} setTextAlign={setTextAlign}
            fontSize={fontSize} setFontSize={setFontSize}
            backgroundColor={backgroundColor} setBackgroundColor={setBackgroundColor}
            handleShareToFeed={handleShareToFeed}
            isSubmitting={isSubmitting}
          />
        )}
        {step === 'complete' && <CompleteStep onHome={handleReset} />}
      </main>

      <GalleryModal
        showGallery={showGallery}
        setShowGallery={setShowGallery}
        selectedImages={selectedImages}
        handleSelectFromGallery={handleSelectFromGallery}
      />
    </div>
  );
};
export default AiDiaryPage;

// Root Component wrapping in Router for preview
const App = () => (
  <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <AiDiaryPage />
  </Router>
);

const root = createRoot(document.getElementById('root'));
root.render(<App />);