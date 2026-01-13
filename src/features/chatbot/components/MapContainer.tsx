import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/shared/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Hospital } from '../api/chatbotApi';
import { X, Navigation, Loader2, MapPin, Store } from 'lucide-react';

// Preset Locations
const PRESET_LOCATIONS = [
  { name: '동국대(서울)', lat: 37.5582, lng: 126.9982 },
  { name: '강남역', lat: 37.4979, lng: 127.0276 },
  { name: '홍대입구', lat: 37.5575, lng: 126.9245 },
  { name: '여의도', lat: 37.5217, lng: 126.9242 },
  { name: '분당(서현)', lat: 37.3850, lng: 127.1194 },
  { name: '부산(해운대)', lat: 35.1587, lng: 129.1603 },
  { name: '대구(동성로)', lat: 35.8714, lng: 128.6014 },
  { name: '대전(시청)', lat: 36.3504, lng: 127.3845 },
  { name: '광주(터미널)', lat: 35.1601, lng: 126.8793 },
];

interface MapContainerProps {
  onClose: () => void;
  hospitals: Hospital[];
  center?: { lat: number; lng: number };
  onCenterChange?: (lat: number, lng: number) => void;
}

declare global {
  interface Window {
    kakao: any;
  }
}

export default function MapContainer({ onClose, hospitals, center, onCenterChange }: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>("");

  useEffect(() => {
    const loadMap = () => {
        if (!window.kakao || !window.kakao.maps) {
            console.error("Kakao maps SDK not available");
            return;
        }

        window.kakao.maps.load(() => {
            const options = {
                center: new window.kakao.maps.LatLng(center?.lat || 37.5665, center?.lng || 126.9780),
                level: 4,
            };

            const newMap = new window.kakao.maps.Map(mapRef.current, options);
            setMap(newMap);

            // Add Markers
            hospitals.forEach(hospital => {
                const markerPosition = new window.kakao.maps.LatLng(hospital.lat, hospital.lng);
                const marker = new window.kakao.maps.Marker({
                    position: markerPosition,
                    clickable: true
                });
                marker.setMap(newMap);

                window.kakao.maps.event.addListener(marker, 'click', () => {
                    setSelectedHospital(hospital);
                    newMap.panTo(markerPosition);
                });
            });
        });
    };

    // Check if script is already loaded
    if (window.kakao && window.kakao.maps) {
        loadMap();
    } else {
        // Check if script tag exists but maybe not loaded yet
        const existingScript = document.getElementById('kakao-maps-sdk');
        
        if (!existingScript) {
            const script = document.createElement("script");
            script.id = 'kakao-maps-sdk';
            // Use environment variable for API Key
            const apiKey = import.meta.env.VITE_KAKAO_API_KEY;
            script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
            script.async = true;
            
            script.onload = () => {
                // Wait for kakao.maps.load to be available
                window.kakao.maps.load(loadMap);
            };
            
            document.head.appendChild(script);
        } else {
             // Script exists, just wait for it to be ready
             if (window.kakao && window.kakao.maps) {
                 window.kakao.maps.load(loadMap);
             }
        }
    }
  }, [hospitals]); // center 제거 - 초기 로드에만 사용

  // center prop 변경 시 지도 이동 (지역 선택 시)
  useEffect(() => {
    if (map && center && window.kakao) {
      const moveLatLon = new window.kakao.maps.LatLng(center.lat, center.lng);
      map.panTo(moveLatLon);
    }
  }, [map, center]);

  const handleRegionChange = (value: string) => {
    const location = PRESET_LOCATIONS.find(loc => loc.name === value);
    if (location && map && window.kakao) {
      const moveLatLon = new window.kakao.maps.LatLng(location.lat, location.lng);
      map.panTo(moveLatLon);
      setSelectedRegion(value);
      
      // Notify parent to fetch new data
      if (onCenterChange) {
        onCenterChange(location.lat, location.lng);
      }
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-4xl h-[80vh] bg-gray-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
      >
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-50 p-2 bg-black/40 backdrop-blur text-white rounded-full hover:bg-black/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Map Area */}
        <div className="flex-1 relative h-full">
          <div ref={mapRef} className="w-full h-full" />
          
          {/* Top Controls: Region Select */}
          <div className="absolute top-4 left-4 z-40 w-40 shadow-lg">
             <Select value={selectedRegion} onValueChange={handleRegionChange}>
                <SelectTrigger className="w-full bg-white/90 backdrop-blur text-gray-800 border-0 h-10 rounded-full shadow-md font-medium">
                  <SelectValue placeholder="지역 선택" />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_LOCATIONS.map(loc => (
                    <SelectItem key={loc.name} value={loc.name}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
             </Select>
          </div>

          {/* Bottom Right Controls: Geolocation */}
          <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
            <Button 
                size="icon" 
                className="rounded-full shadow-lg bg-pink-500 hover:bg-pink-600 text-white transition-all duration-300" 
                onClick={() => {
                 if (navigator.geolocation && map) {
                    setIsLocating(true);
                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            const lat = pos.coords.latitude;
                            const lng = pos.coords.longitude;
                            const moveLatLon = new window.kakao.maps.LatLng(lat, lng);
                            map.panTo(moveLatLon);
                            setSelectedRegion(""); // Clear region selection when using geolocation
                            
                            // Notify parent to fetch new data
                            if (onCenterChange) {
                                onCenterChange(lat, lng);
                            }
                            setIsLocating(false);
                        },
                        (err) => {
                            console.error("Geolocation error:", err);
                            setIsLocating(false);
                            alert("위치 정보를 가져올 수 없습니다.");
                        }
                    );
                 } else {
                     alert("브라우저가 위치 정보를 지원하지 않습니다.");
                 }
            }}>
               {isLocating ? (
                   <Loader2 className="w-4 h-4 animate-spin" />
               ) : (
                   <Navigation className="w-4 h-4" />
               )}
            </Button>
          </div>
        </div>

        {/* Sidebar (Hospital Info) */}
        <div className="w-full md:w-80 bg-gray-800/90 backdrop-blur border-l border-white/5 p-6 overflow-y-auto">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <MapPin className="text-pink-500" /> 주변 동물병원
          </h2>
          
          <div className="space-y-3">
             {hospitals.map(hospital => (
                <div 
                  key={hospital.id}
                  onClick={() => setSelectedHospital(hospital)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedHospital?.id === hospital.id 
                    ? 'bg-pink-500/10 border-pink-500/50' 
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                >
                   <div className="flex justify-between items-start">
                      <h3 className="text-white font-medium">{hospital.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${hospital.status === 'OPEN' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {hospital.status === 'OPEN' ? '진료중' : '마감'}
                      </span>
                   </div>
                   <p className="text-white/60 text-xs mt-1">{hospital.address}</p>
                   {/* 진료과목 태그 */}
                   {hospital.specialty && (
                     <div className="flex flex-wrap gap-1 mt-2">
                       {hospital.specialty.split(',').slice(0, 3).map((spec: string, idx: number) => (
                         <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded">
                           {spec.trim()}
                         </span>
                       ))}
                     </div>
                   )}
                   <div className="flex items-center gap-2 mt-2 text-xs text-white/40">
                      <span className="flex items-center gap-1"><Store className="w-3 h-3" /> {hospital.distance}m</span>
                      <span>⭐ {hospital.rating}</span>
                   </div>
                </div>
             ))}
          </div>
        </div>

      </motion.div>
    </div>
  );
}
