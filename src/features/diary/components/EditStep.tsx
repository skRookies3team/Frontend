import { useState, useEffect } from 'react';
import { Calendar, MapPin, Sun, Smile, Edit3, ArrowRight } from 'lucide-react';
import KakaoMap from './KakaoMap';
import LocationSearchModal from './LocationSearchModal';
import { petMateApi } from '@/features/petmate/api/petmate-api';

interface EditStepProps {
    userId?: number;
    selectedImages: any[];
    editedDiary: string;
    setEditedDiary: (diary: string) => void;
    weather: string;
    setWeather: (weather: string) => void;
    mood: string;
    setMood: (mood: string) => void;
    locationName: string;
    setLocationName: (name: string) => void;
    locationCoords: { lat: number, lng: number } | null;
    setLocationCoords: (coords: { lat: number, lng: number }) => void;
    selectedDate: string;
    title: string; // [NEW]
    setTitle: (title: string) => void; // [NEW]

    // Style props for preview only
    layoutStyle: string;
    textAlign: string;
    fontSize: number;
    backgroundColor: string;

    onNext: () => void;
}

const EditStep = ({
    userId, selectedImages, editedDiary, setEditedDiary, weather, setWeather, mood, setMood, locationName, setLocationName, locationCoords, setLocationCoords,
    selectedDate, layoutStyle, textAlign, fontSize, backgroundColor, onNext, title, setTitle
}: EditStepProps) => {
    const [showLocationModal, setShowLocationModal] = useState(false);

    // Auto-load location if missing (Saved Location -> GPS) -> pattern from PetMate
    useEffect(() => {
        const loadLocation = async () => {
            // Only load if location is not already set (e.g. by history)
            if (locationName && locationName !== "위치 정보 없음" && locationName !== "주소 불러오는 중...") return;

            // 1. Try Saved Location
            if (userId) {
                try {
                    const saved = await petMateApi.getSavedLocation(userId);
                    if (saved && saved.latitude && saved.longitude) {
                        setLocationCoords({ lat: saved.latitude, lng: saved.longitude });
                        setLocationName(saved.location || "저장된 위치");
                        console.log("[EditStep] Loaded saved location");
                        return;
                    }
                } catch (e) {
                    console.warn("[EditStep] No saved location found or error", e);
                }
            }

            // 2. Try GPS (Current Location)
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                        const { latitude, longitude } = pos.coords;
                        setLocationCoords({ lat: latitude, lng: longitude });

                        try {
                            const addr = await petMateApi.getAddressFromCoords(longitude, latitude);
                            const name = addr.buildingName || addr.fullAddress;
                            setLocationName(name);
                            console.log("[EditStep] Loaded current GPS location");

                            // Optional: Save as default if user has none? Leaving out for now to minimize side effects.
                        } catch (e) {
                            console.error("[EditStep] Failed to reverse geocode", e);
                            setLocationName("위치 정보 없음");
                        }
                    },
                    (err) => {
                        console.error("[EditStep] Geolocation error", err);
                    },
                    { enableHighAccuracy: true, timeout: 5000 }
                );
            }
        };

        loadLocation();
    }, [userId]);

    const handleLocationSelect = (name: string, lat: number, lng: number) => {
        console.log('📍 [Location Debug] Location selected:', { name, lat, lng });
        setLocationName(name);
        setLocationCoords({ lat, lng });
        console.log('📍 [Location Debug] State setters called - locationName and locationCoords updated');
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start animate-fade-in">
            <div className="w-full lg:flex-1 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 sticky top-24" style={{ backgroundColor }}>
                <div className={`p-8 ${textAlign === 'center' ? 'text-center' : textAlign === 'right' ? 'text-right' : 'text-left'}`}>
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
                        {/* [NEW] Title Input */}
                        <div className="w-full mb-2">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="일기 제목을 입력하세요..."
                                className="w-full text-2xl font-bold placeholder-gray-300 border-none outline-none bg-transparent"
                            />
                        </div>

                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                            <Calendar className="w-4 h-4 text-pink-400" />
                            {new Date(selectedDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowLocationModal(true)}
                                className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full text-green-600 text-sm hover:bg-green-100 transition-colors"
                            >
                                <MapPin className="w-3 h-3" />
                                <span className="truncate max-w-[150px] inline-block align-middle">{locationName || "위치 추가"}</span>
                            </button>
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

                    <div className={`mb-8 gap-2 ${layoutStyle === 'grid' ? 'grid md:grid-cols-2 xl:grid-cols-3' : layoutStyle === 'slide' ? 'flex overflow-x-auto pb-2 snap-x' : 'flex flex-col space-y-4'}`}>
                        {selectedImages.map((img: any, idx: number) => (
                            <img key={idx} src={img.imageUrl} alt="diary" className={`rounded-lg object-cover shadow-sm w-full ${layoutStyle === 'slide' ? 'min-w-[80%] snap-center' : ''}`} />
                        ))}
                    </div>

                    <textarea
                        value={editedDiary} onChange={(e) => setEditedDiary(e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 resize-none leading-relaxed text-gray-700 outline-none p-0"
                        style={{ fontSize: `${fontSize}px`, minHeight: '200px' }}
                        placeholder="일기 내용을 입력하세요..."
                    />
                </div>
            </div>

            <div className="w-full lg:w-80 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 space-y-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2"><Edit3 className="w-4 h-4 text-pink-500" /> 내용 편집</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        AI가 생성한 일기를 자유롭게 수정해보세요.<br />
                        날씨, 기분, 위치 정보도 변경할 수 있습니다.<br />
                        <b>다음 단계에서 디자인을 꾸밀 수 있어요!</b>
                    </p>
                </div>

                <button onClick={onNext} className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-colors">
                    <span>디자인 꾸미러 가기</span> <ArrowRight className="w-5 h-5" />
                </button>
            </div>
            {/* Location Search Modal */}
            <LocationSearchModal
                isOpen={showLocationModal}
                onClose={() => setShowLocationModal(false)}
                onSelectLocation={handleLocationSelect}
            />
        </div>
    );
};

export default EditStep;