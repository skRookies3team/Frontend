import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface LocationResult {
    latitude: number;
    longitude: number;
    address?: string;
}

/**
 * 현재 위치를 가져오는 공유 훅
 * - 위치 권한을 요청하고 좌표를 반환
 * - 에러 처리 및 토스트 알림 포함
 */
export const useCurrentLocation = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getLocation = useCallback((): Promise<LocationResult> => {
        setLoading(true);
        setError(null);

        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                const errorMsg = '이 브라우저에서는 위치 서비스를 지원하지 않습니다.';
                setError(errorMsg);
                setLoading(false);
                toast.error(errorMsg);
                reject(new Error(errorMsg));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLoading(false);
                    setError(null);

                    // TODO: Reverse Geocoding API가 있다면 여기서 호출하여 주소 문자열로 변환
                    // 현재는 좌표를 간단한 형식으로 반환
                    resolve({
                        latitude,
                        longitude,
                        address: `위도 ${latitude.toFixed(4)}, 경도 ${longitude.toFixed(4)}`
                    });
                },
                (err) => {
                    setLoading(false);
                    let errorMsg = '위치를 가져올 수 없습니다.';

                    switch (err.code) {
                        case err.PERMISSION_DENIED:
                            errorMsg = '위치 권한이 거부되었습니다. 브라우저 설정에서 허용해주세요.';
                            break;
                        case err.POSITION_UNAVAILABLE:
                            errorMsg = '위치 정보를 사용할 수 없습니다.';
                            break;
                        case err.TIMEOUT:
                            errorMsg = '위치 요청 시간이 초과되었습니다.';
                            break;
                    }

                    setError(errorMsg);
                    toast.error(errorMsg);
                    reject(new Error(errorMsg));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    }, []);

    /**
     * 위치를 가져와서 주소 문자열로 반환
     */
    const getLocationString = useCallback(async (): Promise<string> => {
        try {
            const result = await getLocation();
            return result.address || `${result.latitude}, ${result.longitude}`;
        } catch {
            return '';
        }
    }, [getLocation]);

    return {
        getLocation,
        getLocationString,
        loading,
        error
    };
};
