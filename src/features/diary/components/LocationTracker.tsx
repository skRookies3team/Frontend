import { useEffect, useState } from 'react';

// 백엔드 API 주소 (프록시 설정이 없다면 전체 주소 사용)
const BASE_URL = 'http://localhost:8087/api';

// [중요] 토큰 가져오기 (petlog_token 우선, 없으면 accessToken 확인)
const getAccessToken = () => localStorage.getItem('petlog_token') || localStorage.getItem('accessToken');

// [Self-Contained Auth Logic] 외부 의존성 제거를 위한 로컬 useAuth 구현
const useAuth = () => {
    const [user, setUser] = useState<{ id: number; username: string } | null>(null);

    useEffect(() => {
        const token = getAccessToken();

        if (token) {
            try {
                // JWT 디코딩 로직
                const base64Url = token.split('.')[1];
                if (base64Url) {
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));

                    const payload = JSON.parse(jsonPayload);

                    // ID 추출 (sub, userId, id 등 다양한 필드 대응)
                    const userId = Number(payload.userId || payload.sub || payload.id);

                    if (!isNaN(userId)) {
                        setUser({
                            id: userId,
                            username: payload.username || payload.name || 'User',
                        });
                    }
                }
            } catch (e) {
                console.error("[LocationTracker] 토큰 파싱 실패:", e);
            }
        }
    }, []);

    return { user };
};

const LocationTracker = () => {
    const { user } = useAuth(); // 로컬 useAuth 사용

    useEffect(() => {
        // 1. 로그인이 안 되어 있으면 아무것도 안 함
        if (!user || !user.id) return;

        console.log("[LocationTracker] 위치 추적 시작... UserID:", user.id);

        // 2. 위치 전송 함수 정의
        const sendLocation = () => {
            if (!navigator.geolocation) {
                console.warn("[LocationTracker] GPS를 지원하지 않는 브라우저입니다.");
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const userId = Number(user.id);

                    try {
                        // 백엔드에 위치 저장 요청 (POST /api/locations)
                        const response = await fetch(`${BASE_URL}/locations`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${getAccessToken()}`
                            },
                            body: JSON.stringify({
                                userId: userId,
                                latitude: latitude,
                                longitude: longitude
                            })
                        });

                        if (response.ok) {
                            console.log(`[LocationTracker] 위치 저장 성공: ${latitude}, ${longitude}`);
                        } else {
                            console.warn(`[LocationTracker] 위치 저장 실패: ${response.status}`);
                        }
                    } catch (error) {
                        console.error("[LocationTracker] 서버 전송 오류:", error);
                    }
                },
                (error) => {
                    console.warn(`[LocationTracker] 위치 확인 실패: ${error.message}`);
                },
                {
                    enableHighAccuracy: true, // 정확도 우선
                    timeout: 10000,           // 10초 내에 응답 없으면 실패
                    maximumAge: 0             // 캐시된 위치 사용 안 함
                }
            );
        };

        // 3. 최초 1회 즉시 실행
        sendLocation();

        // 4. 1분(60000ms)마다 반복 실행
        const intervalId = setInterval(sendLocation, 60000);

        // 20분마다 반복 실행
        //const intervalId = setInterval(sendLocation, 1200000);

        // 5. 컴포넌트가 사라지거나 로그아웃 시 타이머 정리
        return () => {
            clearInterval(intervalId);
            console.log("[LocationTracker] 위치 추적 중지");
        };
    }, [user]); // user 정보가 바뀔 때(로그인/로그아웃)마다 재실행

    // 화면에 렌더링할 것은 없음
    return null;
};

export default LocationTracker;