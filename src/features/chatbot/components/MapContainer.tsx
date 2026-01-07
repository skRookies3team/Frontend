import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/shared/ui/button";
import { Hospital } from '../api/chatbotApi';
import { X, Navigation, MapPin, Store } from 'lucide-react';

interface MapContainerProps {
  onClose: () => void;
  hospitals: Hospital[];
  center?: { lat: number; lng: number };
}

declare global {
  interface Window {
    kakao: any;
  }
}

export default function MapContainer({ onClose, hospitals, center }: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  useEffect(() => {
    if (!mapRef.current || !window.kakao) {
      console.warn("Kakao maps SDK not loaded");
      return;
    }

    const { kakao } = window;
    
    kakao.maps.load(() => {
      const options = {
        center: new kakao.maps.LatLng(center?.lat || 37.5665, center?.lng || 126.9780),
        level: 4,
      };
      
      const newMap = new kakao.maps.Map(mapRef.current, options);
      setMap(newMap);

      // Add Markers
      hospitals.forEach(hospital => {
        const markerPosition = new kakao.maps.LatLng(hospital.lat, hospital.lng);
        const marker = new kakao.maps.Marker({
          position: markerPosition,
          clickable: true 
        });
        marker.setMap(newMap);

        kakao.maps.event.addListener(marker, 'click', () => {
          setSelectedHospital(hospital);
          newMap.panTo(markerPosition);
        });
      });
    });
  }, [center, hospitals]);

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
          
          {/* Overlay controls */}
          <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
            <Button size="icon" className="rounded-full shadow-lg bg-pink-500 hover:bg-pink-600 text-white" onClick={() => {
                 if (navigator.geolocation && map) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                        const lat = pos.coords.latitude;
                        const lng = pos.coords.longitude;
                        const moveLatLon = new window.kakao.maps.LatLng(lat, lng);
                        map.panTo(moveLatLon);
                    });
                 }
            }}>
               <Navigation className="w-4 h-4" />
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
                   <div className="flex items-center gap-2 mt-3 text-xs text-white/40">
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
