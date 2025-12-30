import { useRef, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const getEnv = (key: string) => {
    try {
        return import.meta.env[key];
    } catch (e) {
        return undefined;
    }
};

interface KakaoMapProps {
    lat: number;
    lng: number;
}

declare global {
    interface Window {
        kakao: any;
    }
}

const KakaoMap = ({ lat, lng }: KakaoMapProps) => {
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

export default KakaoMap;
