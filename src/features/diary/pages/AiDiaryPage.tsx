import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, MemoryRouter as Router } from 'react-router-dom';
import {
  Camera, Upload, Edit3, Check, Share2, Calendar,
  Image as ImageIcon, X, ChevronLeft, Loader2,
  Save, BookOpen, PawPrint, Sun, Smile, MapPin, Coins
} from 'lucide-react';
import { createRoot } from 'react-dom/client';
import { getUserApi } from "@/features/auth/api/auth-api";
// [중요] LocationTracker import (파일 경로에 맞게 수정해주세요)
import LocationTracker from '../components/LocationTracker';
// 만약 같은 파일에 넣으셨다면 import 필요 없음

// ==========================================
// [환경 변수 및 유틸 설정]
// ==========================================

const getEnv = (key: string) => {
  try {
    return import.meta.env[key];
  } catch (e) {
    return undefined;
  }
};

// [수정] 프록시(게이트웨이)를 통해 요청하도록 변경
const BASE_URL = '/api';

// [중요] 토큰 가져오기 (petlog_token 우선, 없으면 accessToken 확인)
const getAccessToken = () => localStorage.getItem('petlog_token') || localStorage.getItem('accessToken');

// ==========================================
// 1. Auth Logic (Restored Local Implementation)
// ==========================================

const useAuth = () => {
  const [user, setUser] = useState<{ id: number; username: string; pets: any[] } | null>(null);

  useEffect(() => {
    // 1. 토큰 키 확인
    const token = getAccessToken();

    if (token) {
      try {
        // 2. JWT 디코딩 로직
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);

        // 3. ID 추출
        const userId = Number(payload.userId || payload.sub || payload.id);

        if (!isNaN(userId)) {
          // [수정] API를 통해 최신 사용자 정보(펫 포함) 가져오기
          getUserApi(userId)
            .then((userData) => {
              console.log("[Auth] 사용자 정보 조회 성공:", userData);
              setUser({
                id: userId,
                username: userData.username || userData.social || 'User',
                pets: userData.pets || [] // API에서 가져온 펫 목록 사용
              });
            })
            .catch((err) => {
              console.error("[Auth] 사용자 정보 조회 실패:", err);
              // 실패 시 토큰 정보라도 사용 (Fallback)
              setUser({
                id: userId,
                username: payload.username || payload.name || 'User',
                pets: payload.pets || []
              });
            });
        }
      } catch (e) {
        console.error("[Auth] 토큰 파싱 실패:", e);
      }
    } else {
      console.warn("[Auth] 토큰이 없습니다.");
    }
  }, []);

  return { user };
};

// ==========================================
// 2. Services (API Calls)
// ==========================================

// [NEW] 과거 위치 이력 조회 추가
const getLocationHistory = async (userId: number, date: string) => {
  try {
    const token = getAccessToken();
    const url = `${BASE_URL}/locations/history?userId=${userId}&date=${date}`;
    console.log(`[Service] 위치 조회 요청 URL: ${url}`); // URL 확인용 로그

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      console.warn(`[Service] 위치 조회 실패: Status ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log("[Service] 과거 위치 조회 성공:", data);
    // 백엔드 LocationResponse DTO: { latitude: number, longitude: number }
    return data;
  } catch (error) {
    console.error("[Service] 위치 조회 중 에러 발생:", error);
    return null;
  }
};

const createAiDiary = async (formData: FormData) => {
  try {
    console.log("[Service] createAiDiary 요청 전송...");
    const token = getAccessToken();

    const response = await fetch(`${BASE_URL}/diaries/ai`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // 에러 메시지 상세화
      const errorMessage = errorData.message || `서버 오류: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[Service] createAiDiary 실패:", error);
    // [수정] Mock Fallback 제거 - 에러를 상위로 전파하여 프로세스 중단
    throw error;
  }
};

const getDiary = async (diaryId: number) => {
  try {
    const token = getAccessToken();
    const response = await fetch(`${BASE_URL}/diaries/${diaryId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '일기 조회 실패');
    }
    return await response.json();
  } catch (error) {
    console.error("[Service] getDiary 실패:", error);
    // [수정] Mock Fallback 제거
    throw error;
  }
};

const updateDiary = async (diaryId: number, data: any) => {
  try {
    const token = getAccessToken();
    const response = await fetch(`${BASE_URL}/diaries/${diaryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('일기 저장 실패');
  } catch (error) {
    console.error("[Service] updateDiary 실패:", error);
    throw error;
  }
};

const uploadImagesToS3 = async (files: File[]) => {
  return new Promise((resolve) => {
    const newImages = files.map(file => ({
      imageUrl: URL.createObjectURL(file),
      source: 'GALLERY'
    }));
    setTimeout(() => resolve(newImages), 500);
  });
};

// ==========================================
// [NEW] 2. Services (코인 적립 API 추가)
// ==========================================

// [추가] 코인 적립 API
const earnCoin = async (userId: number, amount: number) => {
  try {
    const token = getAccessToken();
    console.log(`[Service] 코인 적립 요청: User ${userId}, Amount ${amount}`);

    // [주의] 게이트웨이 라우팅 규칙에 따라 '/users' 또는 '/members'로 수정 필요할 수 있음
    // 현재 코드에서는 일반적인 REST 관례인 '/users'를 사용합니다.
    const response = await fetch(`${BASE_URL}/users/${userId}/coin/earn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      // 요청 DTO: { amount: number }
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      console.warn(`[Service] 코인 적립 실패: Status ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log("[Service] 코인 적립 성공, 잔액:", data.petCoin);
    return data; // 응답 DTO: { petCoin: number }
  } catch (error) {
    console.error("[Service] 코인 적립 중 에러:", error);
    return null;
  }
};

// [추가] 소셜 피드 생성 API
const createSocialFeed = async (formData: FormData) => {
  try {
    const token = getAccessToken();
    console.log("[Service] 소셜 피드 생성 요청 전송...");

    const response = await fetch(`${BASE_URL}/feeds`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `피드 생성 실패: ${response.status}`);
    }

    const data = await response.json(); // returns feedId (Long)
    console.log("[Service] 소셜 피드 생성 성공, ID:", data);
    return data;
  } catch (error) {
    console.error("[Service] 소셜 피드 생성 중 에러:", error);
    throw error;
  }
};

// ==========================================
// 3. UI Components
// ==========================================

const Icon = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={`inline-flex items-center justify-center ${className}`}>{children}</span>
);

const KakaoMap = ({ lat, lng }: { lat: number; lng: number }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const envKey = getEnv('VITE_KAKAO_API_KEY');
    const KAKAO_API_KEY = envKey;

    if (document.getElementById('kakao-map-script')) {
      if (window.kakao && window.kakao.maps) {
        setIsLoaded(true);
      }
      return;
    }

    const script = document.createElement("script");
    script.id = 'kakao-map-script';
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&autoload=false`;
    script.async = true;
    script.onload = () => window.kakao.maps.load(() => setIsLoaded(true));
    script.onerror = () => setLoadError(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (isLoaded && mapRef.current && lat && lng && !loadError) {
      try {
        const options = { center: new window.kakao.maps.LatLng(lat, lng), level: 3 };
        const map = new window.kakao.maps.Map(mapRef.current, options);
        new window.kakao.maps.Marker({ position: new window.kakao.maps.LatLng(lat, lng) }).setMap(map);
      } catch (e) {
        console.error("Map render error:", e);
      }
    }
  }, [isLoaded, lat, lng, loadError]);

  if (!lat || !lng) return null;
  if (loadError) return <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-xs text-gray-500">지도 로딩 실패</div>;

  return (
    <div className="w-full h-48 rounded-xl overflow-hidden shadow-inner bg-gray-100 relative group">
      <div id="map" ref={mapRef} className="w-full h-full" />
      {!isLoaded && <div className="absolute inset-0 flex items-center justify-center bg-gray-100"><Loader2 className="animate-spin" /></div>}
    </div>
  );
};

// --- Step Components ---

const UploadStep = ({
  selectedImages, isSubmitting, handleImageUpload, handleGenerate, setSelectedImages, setShowGallery,
  pets, selectedPetId, setSelectedPetId, selectedDate, setSelectedDate
}: any) => (
  <div className="space-y-6 animate-fade-in">
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-xl">
        <Icon className="h-10 w-10 text-white"><Camera className="w-full h-full" /></Icon>
      </div>
      <h2 className="text-2xl font-bold text-pink-600">AI 다이어리 작성하기</h2>
      <p className="mt-2 text-slate-500">언제, 어떤 아이의 하루였나요?</p>
    </div>

    <div className="flex flex-col items-center gap-4 mb-4">
      <div className="w-full max-w-xs">
        <div className="flex items-center gap-2 mb-2 justify-center">
          <Calendar className="w-5 h-5 text-pink-500" />
          <span className="font-semibold text-gray-700">날짜 선택</span>
        </div>
        <input
          type="date"
          value={selectedDate}
          max={new Date().toISOString().split("T")[0]}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full p-3 border border-pink-200 rounded-xl text-center focus:border-pink-500 outline-none"
        />
      </div>

      <div className="w-full max-w-xs">
        <div className="flex items-center gap-2 mb-2 justify-center">
          <PawPrint className="w-5 h-5 text-pink-500" />
          <span className="font-semibold text-gray-700">주인공 선택하기</span>
        </div>
        <select
          value={selectedPetId || ''}
          onChange={(e) => setSelectedPetId(Number(e.target.value))}
          className="w-full p-3 border border-pink-200 rounded-xl focus:border-pink-500 outline-none bg-white"
        >
          <option value="" disabled>주인공을 선택해주세요</option>
          {pets && pets.length > 0 ? (
            pets.map((pet: any) => (
              <option key={pet.id || pet.petId} value={pet.id || pet.petId}>
                {pet.name || pet.petName} ({pet.species})
              </option>
            ))
          ) : (
            <option value="" disabled>등록된 반려동물이 없습니다.</option>
          )}
        </select>
      </div>
    </div>

    <div className="border border-pink-100 shadow-xl rounded-xl bg-white p-6 md:p-8">
      {selectedImages.length === 0 ? (
        <div className="space-y-4">
          <label className="flex w-full cursor-pointer flex-col items-center gap-6 rounded-3xl border-2 border-dashed border-pink-300 bg-pink-50 p-16 hover:bg-white transition-all">
            <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isSubmitting} />
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg">
              <Icon className="h-10 w-10 text-white"><Upload /></Icon>
            </div>
            <p className="text-xl font-bold text-pink-600">{isSubmitting ? '업로드 중...' : '사진 선택하기'}</p>
          </label>
          <button onClick={() => setShowGallery(true)} disabled={isSubmitting} className="w-full border-2 border-pink-300 text-pink-600 py-3 rounded-full font-bold hover:bg-pink-50 flex items-center justify-center gap-2">
            <Icon className="w-5 h-5"><ImageIcon /></Icon> 보관함에서 선택하기
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl bg-pink-50 p-4 grid grid-cols-3 gap-3 md:grid-cols-5">
            {selectedImages.map((image: any, index: number) => (
              <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                <img src={image.imageUrl} alt="upload" className="w-full h-full object-cover" />
                <button onClick={() => setSelectedImages(selectedImages.filter((_: any, i: number) => i !== index))} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"><X className="w-3 h-3" /></button>
              </div>
            ))}
            <label className="flex items-center justify-center border-2 border-dashed border-pink-300 rounded-xl cursor-pointer hover:bg-white">
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
              <Upload className="text-pink-400" />
            </label>
          </div>
          <button onClick={handleGenerate} disabled={isSubmitting} className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-3 rounded-full shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-2">
            <Edit3 /> AI 다이어리 생성하기
          </button>
        </div>
      )}
    </div>
  </div>
);

const GeneratingStep = ({ progress }: { progress: number }) => (
  <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-fade-in">
    <div className="relative w-32 h-32">
      <div className="absolute inset-0 border-4 border-pink-100 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-pink-500 rounded-full border-t-transparent animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center text-pink-600 font-bold text-xl">{progress}%</div>
    </div>
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-800">AI가 일기를 쓰고 있어요</h2>
      <p className="text-gray-500">사진 속 추억과 날씨 정보를 분석하고 있습니다...</p>
    </div>
  </div>
);

const EditStep = ({
  selectedImages, editedDiary, setEditedDiary, weather, setWeather, mood, setMood, locationName, setLocationName, locationCoords,
  selectedDate, layoutStyle, setLayoutStyle, textAlign, setTextAlign, fontSize, setFontSize, backgroundColor, setBackgroundColor,
  handleShareToFeed, isSubmitting
}: any) => {
  const backgroundColors = ["#ffffff", "#fff5f5", "#fef2f2", "#fdf4ff", "#f0f9ff"];

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start animate-fade-in">
      <div className="w-full lg:flex-1 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 sticky top-24" style={{ backgroundColor }}>
        <div className={`p-8 ${textAlign === 'center' ? 'text-center' : textAlign === 'right' ? 'text-right' : 'text-left'}`}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
              <Calendar className="w-4 h-4 text-pink-400" />
              {new Date(selectedDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full text-green-600 text-sm">
                <MapPin className="w-3 h-3" />
                <input value={locationName} onChange={(e) => setLocationName(e.target.value)} className="bg-transparent w-48 outline-none text-center truncate" />
              </div>
              <div className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full text-blue-600 text-sm">
                <Sun className="w-3 h-3" />
                <input value={weather} onChange={(e) => setWeather(e.target.value)} className="bg-transparent w-12 outline-none text-center" />
              </div>
              <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full text-yellow-600 text-sm">
                <Smile className="w-3 h-3" />
                <input value={mood} onChange={(e) => setMood(e.target.value)} className="bg-transparent w-12 outline-none text-center" />
              </div>
            </div>
          </div>

          {locationCoords && <div className="mb-6"><KakaoMap lat={locationCoords.lat} lng={locationCoords.lng} /></div>}

          <div className={`mb-8 gap-2 ${layoutStyle === 'grid' ? 'grid grid-cols-2' : layoutStyle === 'slide' ? 'flex overflow-x-auto pb-2 snap-x' : 'flex flex-col space-y-4'}`}>
            {selectedImages.map((img: any, idx: number) => (
              <img key={idx} src={img.imageUrl} alt="diary" className={`rounded-lg object-cover shadow-sm w-full ${layoutStyle === 'slide' ? 'min-w-[80%] snap-center' : ''}`} />
            ))}
          </div>

          <textarea
            value={editedDiary} onChange={(e) => setEditedDiary(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 resize-none leading-relaxed text-gray-700 outline-none p-0"
            style={{ fontSize: `${fontSize}px`, minHeight: '200px' }}
          />
        </div>
      </div>

      <div className="w-full lg:w-80 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 space-y-6">
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><Edit3 className="w-4 h-4 text-pink-500" /> 스타일 편집</h3>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400">레이아웃</label>
            <div className="grid grid-cols-3 gap-2">
              {['grid', 'slide', 'classic'].map(style => (
                <button key={style} onClick={() => setLayoutStyle(style)} className={`p-2 rounded text-xs ${layoutStyle === style ? 'bg-pink-100 text-pink-600' : 'bg-gray-50'}`}>{style}</button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400">배경 색상</label>
            <div className="grid grid-cols-5 gap-2">
              {backgroundColors.map(color => (
                <button key={color} onClick={() => setBackgroundColor(color)} className={`h-8 rounded-full border ${backgroundColor === color ? "border-pink-500 ring-1 ring-pink-500" : "border-gray-200"}`} style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
        </div>

        <button onClick={handleShareToFeed} disabled={isSubmitting} className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-70">
          {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />} <span>저장하고 공유하기</span>
        </button>
      </div>
    </div>
  );
};

// const CompleteStep = ({ onHome }: { onHome: () => void }) => (
//   <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
//     <div className="bg-green-100 p-6 rounded-full mb-6"><Check className="w-12 h-12 text-green-600" /></div>
//     <h2 className="text-3xl font-bold text-gray-800 mb-4">일기 작성이 완료되었어요!</h2>
//     <div className="flex gap-4">
//       <button onClick={onHome} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium">내 다이어리 보기</button>
//       <button onClick={onHome} className="px-6 py-3 bg-pink-500 text-white rounded-xl font-medium flex items-center gap-2"><Share2 className="w-4 h-4" /> 피드 공유하기</button>
//     </div>
//   </div>
// );

// ==========================================
// 3. UI Components (CompleteStep 수정)
// ==========================================

// [수정] earnedAmount prop 추가하여 적립금액 표시
const CompleteStep = ({ onHome, earnedAmount, onShare }: { onHome: () => void, earnedAmount: number | null, onShare: (visibility: string) => Promise<any> }) => {
  const [sharingStep, setSharingStep] = useState<'initial' | 'visibility' | 'success'>('initial');
  const [sharedFeedId, setSharedFeedId] = useState<number | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const navigate = useNavigate();

  const handleShareClick = async (visibility: string) => {
    setIsSharing(true);
    try {
      const feedId = await onShare(visibility);
      if (feedId) {
        setSharedFeedId(feedId);
      }
      // 성공 시 부모 컴포넌트에서 처리가 완료되면 여기로 넘어오지 않을 수도 있지만,
      // 로직상 성공 상태로 전환
      setSharingStep('success');
    } catch (e) {
      console.error("Share failed", e);
    } finally {
      setIsSharing(false);
    }
  };

  if (sharingStep === 'visibility') {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">공개 범위를 선택해주세요</h2>
        <p className="text-gray-500">소셜 피드에 어떻게 공유할까요?</p>

        <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
          <button onClick={() => handleShareClick('PUBLIC')} disabled={isSharing} className="flex items-center gap-4 p-4 border rounded-xl hover:bg-pink-50 hover:border-pink-300 transition-all text-left group">
            <div className="bg-pink-100 p-3 rounded-full text-pink-600 group-hover:bg-pink-200"><Share2 className="w-5 h-5" /></div>
            <div>
              <div className="font-bold text-gray-800">전체 공개</div>
              <div className="text-xs text-gray-500">모든 사용자가 볼 수 있습니다.</div>
            </div>
          </button>

          <button onClick={() => handleShareClick('FOLLOWER')} disabled={isSharing} className="flex items-center gap-4 p-4 border rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all text-left group">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:bg-blue-200"><Check className="w-5 h-5" /></div>
            <div>
              <div className="font-bold text-gray-800">팔로워 공개</div>
              <div className="text-xs text-gray-500">내 팔로워만 볼 수 있습니다.</div>
            </div>
          </button>

          <button onClick={() => handleShareClick('PRIVATE')} disabled={isSharing} className="flex items-center gap-4 p-4 border rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-left group">
            <div className="bg-gray-100 p-3 rounded-full text-gray-600 group-hover:bg-gray-200"><BookOpen className="w-5 h-5" /></div>
            <div>
              <div className="font-bold text-gray-800">나만 보기</div>
              <div className="text-xs text-gray-500">피드에 기록되지만 나만 볼 수 있습니다.</div>
            </div>
          </button>
        </div>

        <button onClick={() => setSharingStep('initial')} disabled={isSharing} className="text-gray-400 text-sm underline mt-4">취소</button>
      </div>
    );
  }

  if (sharingStep === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="bg-blue-100 p-6 rounded-full mb-6"><Check className="w-12 h-12 text-blue-600" /></div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">피드 공유 완료!</h2>
        <p className="text-gray-500 mb-8">우리 아이의 일기가 소셜 피드에 올라갔어요.</p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button onClick={() => sharedFeedId ? navigate(`/feed`) : navigate('/feed')} className="w-full px-6 py-3 bg-pink-500 text-white rounded-xl font-bold shadow-lg hover:bg-pink-600 transition-colors">
            작성한 피드 보기
          </button>
          <button onClick={onHome} className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
            내 다이어리 보관함
          </button>
          <button onClick={() => navigate('/')} className="w-full px-6 py-3 border border-gray-200 text-gray-500 rounded-xl font-medium hover:bg-gray-50 transition-colors">
            홈으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="bg-green-100 p-6 rounded-full mb-6">
        <Check className="w-12 h-12 text-green-600" />
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-2">일기 작성이 완료되었어요!</h2>

      {/* [추가] 코인 적립 알림 UI */}
      {earnedAmount !== null && (
        <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200 mb-6 animate-bounce">
          <Coins className="w-5 h-5 text-yellow-600" />
          <span className="font-bold text-yellow-700">+{earnedAmount} Pet Coin 적립 완료!</span>
        </div>
      )}

      <div className="flex gap-4 mt-4">
        <button onClick={onHome} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
          내 다이어리 보기
        </button>
        <button onClick={() => setSharingStep('visibility')} className="px-6 py-3 bg-pink-500 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg hover:bg-pink-600 transition-colors">
          <Share2 className="w-4 h-4" /> 피드 공유하기
        </button>
      </div>
    </div>
  );
};

const GalleryModal = ({ showGallery, setShowGallery, selectedImages, handleSelectFromGallery }: any) => {
  if (!showGallery) return null;
  const archiveImages = Array.from({ length: 8 }).map((_, i) => `https://picsum.photos/seed/${i + 100}/200/200`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold">사진 보관함</h3>
          <button onClick={() => setShowGallery(false)}><X className="text-gray-500" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-3 gap-4">
          {archiveImages.map((img, idx) => {
            const isSelected = selectedImages.some((si: any) => si.imageUrl === img);
            return (
              <div key={idx} onClick={() => handleSelectFromGallery(img)} className={`aspect-square rounded-xl overflow-hidden cursor-pointer relative ${isSelected ? 'ring-4 ring-pink-500' : ''}`}>
                <img src={img} className="w-full h-full object-cover" />
                {isSelected && <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center"><Check className="text-white" /></div>}
              </div>
            );
          })}
        </div>
        <div className="p-6 border-t flex justify-end">
          <button onClick={() => setShowGallery(false)} className="px-6 py-2 bg-gray-800 text-white rounded-xl">선택 완료</button>
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
  const { user } = useAuth(); // [NEW] useAuth 훅 사용

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

  // [추가] 이번 활동으로 적립된 코인 양 저장
  const [earnedReward, setEarnedReward] = useState<number | null>(null);

  // [NEW] Auth 정보가 로드되면 펫 목록 설정
  useEffect(() => {
    if (user) {
      // useAuth에서 파싱된 user.pets 사용
      const userPets = user.pets || [];

      // 데이터 구조 매핑 (토큰 데이터 또는 Mock 데이터 구조 대응)
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
  }, [user]); // user가 변경될 때 실행

  // --- Handlers ---

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      alert("Error uploading images.");
    } finally {
      setIsSubmitting(false);
      e.target.value = '';
    }
  };

  const handleSelectFromGallery = (imageUrl: string) => {
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
    if (!user) {
      alert("로그인 정보가 없습니다.");
      return;
    }

    setStep("generating");
    console.log("=== [Frontend] Diary Generation Started ===");

    // 현재 위치 가져오기 함수 (기존 로직)
    const getCurrentPosition = () => {
      return new Promise<{ lat: number, lng: number } | null>((resolve) => {
        if (!navigator.geolocation) { resolve(null); return; }
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (err) => resolve(null),
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
      // 날짜 비교 로직 추가 (오늘 vs 과거)
      const today = new Date().toISOString().split("T")[0];
      let location: { lat: number, lng: number } | null = null;

      if (selectedDate === today) {
        console.log("=== [Frontend] 오늘 날짜 선택: 현재 위치 조회 시도 ===");
        location = await getCurrentPosition();
      } else {
        console.log(`=== [Frontend] 과거 날짜(${selectedDate}) 선택: 위치 기록 조회 시도 (PostGIS) ===`);
        console.log(`=== [Frontend] 현재 User ID: ${user.id} ===`); // User ID 확인용 로그 추가

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
      if (imageFiles.length > 0) formData.append("image", imageFiles[0]);

      const requestData = {
        userId: Number(user.id), // [IMPORTANT] Decoded ID from Token
        petId: selectedPetId,
        content: "",
        visibility: "PRIVATE",
        isAiGen: true,
        weather: "",
        mood: "",
        date: selectedDate,
        latitude: location ? location.lat : null,
        longitude: location ? location.lng : null,
        locationName: locationName // [추가] 초기값 전달
      };

      console.log("=== [Frontend] Request Payload ===", requestData);

      formData.append("data", new Blob([JSON.stringify(requestData)], { type: "application/json" }));

      const response = await createAiDiary(formData);

      const diaryId = response.diaryId;
      setCreatedDiaryId(diaryId);

      const diaryDetail = await getDiary(diaryId);

      console.log("=== [Frontend] getDiary API Response ===", diaryDetail);

      clearInterval(interval);
      setProgress(100);

      setEditedDiary(diaryDetail.content || "AI가 일기를 생성하지 못했습니다.");
      setWeather(diaryDetail.weather || "맑음");
      setMood(diaryDetail.mood || "행복");

      // [수정] 백엔드 응답에서 주소 확인 및 상태 업데이트
      if (diaryDetail.locationName && diaryDetail.locationName !== "위치 정보 없음") {
        setLocationName(diaryDetail.locationName);
      } else {
        setLocationName("위치 정보 없음");
      }

      setTimeout(() => setStep("edit"), 500);

    } catch (error: any) {
      clearInterval(interval);
      console.error("=== [Frontend] Diary Generation Error ===", error);

      // [NEW] 에러 메시지에 따른 사용자 안내 추가
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
    // try {
    //   await updateDiary(createdDiaryId, { content: editedDiary, visibility: "PUBLIC", weather, mood, locationName });
    //   setStep("complete");
    // } catch (error: any) {
    //   alert(`저장 실패: ${error.message}`);
    // } finally {
    //   setIsSubmitting(false);
    // }
    try {
      // 1. 일기 내용 최종 업데이트 (공개 전환 등)
      // (이전 코드에서 import했던 updateDiary 함수 등 사용)
      // await updateDiary(createdDiaryId, { content: editedDiary, visibility: "PUBLIC", weather, mood, locationName });
      // 위 로직은 기존 코드에 구현되어 있다고 가정하고 아래에 API 호출을 배치합니다.

      // 실제로는 여기에 updateDiary 호출이 있어야 합니다. (질문자님 기존 코드 참조)
      // 예시:
      // await updateDiary(createdDiaryId, { ... }); 

      // 2. [추가] 마일리지(코인) 적립 로직 실행
      if (user && user.id) {
        // 프론트에서 15코인으로 고정하여 요청
        const REWARD_AMOUNT = 15;
        const coinResult = await earnCoin(user.id, REWARD_AMOUNT);

        if (coinResult) {
          setEarnedReward(REWARD_AMOUNT); // 적립 성공 시 UI 표시용 State 업데이트
        }
      }

      // 3. 완료 화면으로 이동
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
      // 1. FormData 생성
      const formData = new FormData();

      // 이미지 파일 추가 (업로드된 파일이 있으면 사용, 없으면 기존 이미지 URL 사용 - 여기서는 파일이 있다고 가정)
      // 주의: 이미지가 없는 경우(텍스트 일기 등)에 대한 처리가 필요할 수 있음
      if (imageFiles.length > 0) {
        formData.append("file", imageFiles[0]);
      }

      // 2. Request DTO 생성
      const requestDto = {
        userId: Number(user.id),
        petId: selectedPetId,
        content: editedDiary, // 수정된 일기 내용 사용
        location: locationName,
        visibility: visibility // [IMPORTANT] 선택한 공개 범위 전달
      };

      formData.append("request", new Blob([JSON.stringify(requestDto)], { type: "application/json" }));

      // 3. API 호출
      const feedId = await createSocialFeed(formData);
      console.log(`[Frontend] Feed created with ID: ${feedId}`);

      // 성공 시 피드 ID 반환 (CompleteStep에서 사용 가능)
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
    setEarnedReward(null); // 보상 초기화
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
      <GalleryModal showGallery={showGallery} setShowGallery={setShowGallery} selectedImages={selectedImages} handleSelectFromGallery={handleSelectFromGallery} />
    </div>
  );
};

export default AiDiaryPage;

const App = () => (
  <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    {/* 여기서 LocationTracker를 렌더링하면, 
      로그인 상태일 때 자동으로 백그라운드에서 위치를 저장합니다.
      어떤 페이지(일기 쓰기, 홈 등)로 이동해도 Router 안에 있으므로 계속 동작합니다.
    */}
    <LocationTracker />

    <AiDiaryPage />
  </Router>
);

const root = createRoot(document.getElementById('root')!);
root.render(<App />);