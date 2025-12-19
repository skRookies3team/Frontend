import { useEffect, useState } from 'react';

// 백엔드 API 주소
const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  if (!url.endsWith('/api')) {
    url += '/api';
  }
  return url;
};

const BASE_URL = getBaseUrl();

// [중요] 토큰 가져오기 (petlog_token 우선, 없으면 accessToken 확인)
const getAccessToken = () => localStorage.getItem('petlog_token') || localStorage.getItem('accessToken');

// 토큰에서 사용자 정보 파싱하는 유틸 함수
const parseUserFromToken = (token: string | null) => {
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        if (base64Url) {
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const payload = JSON.parse(jsonPayload);
            const userId = Number(payload.userId || payload.sub || payload.id);

            if (!isNaN(userId)) {
                return {
                    id: userId,
                    username: payload.username || payload.name || 'User',
                };
            }
        }
    } catch (e) {
        console.error("[LocationTracker] 토큰 파싱 실패:", e);
    }
    return null;
};

// [Self-Contained Auth Logic] 실시간 감지 기능 추가
const useAuth = () => {
    // 초기값 설정
    const [user, setUser] = useState<{ id: number; username: string } | null>(() =>
        parseUserFromToken(getAccessToken())
    );

    useEffect(() => {
        const checkAuthStatus = () => {
            const token = getAccessToken();
            const newUser = parseUserFromToken(token);

            setUser((prevUser) => {
                // 1. 둘 다 null이면 변경 없음
                if (!prevUser && !newUser) return null;
                // 2. 둘 중 하나만 null이면 변경 (로그인 또는 로그아웃 발생)
                if (!prevUser || !newUser) return newUser;
                // 3. ID가 다르면 변경 (다른 계정으로 전환)
                if (prevUser.id !== newUser.id) return newUser;
                // 4. 그 외엔 기존 상태 유지 (불필요한 렌더링 방지)
                return prevUser;
            });
        };

        // 1. 주기적으로 토큰 검사 (1초마다) - 같은 탭에서의 로그인/로그아웃 감지용
        const intervalId = setInterval(checkAuthStatus, 1000);

        // 2. 스토리지 이벤트 리스너 - 다른 탭에서의 로그인/로그아웃 감지용
        window.addEventListener('storage', checkAuthStatus);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('storage', checkAuthStatus);
        };
    }, []);

    return { user };
};

const LocationTracker = () => {
    const { user } = useAuth(); // 실시간 업데이트되는 user 정보 사용


    useEffect(() => {
        // 1. 로그아웃 상태면 추적 중지
        if (!user || !user.id) {
            console.log("[LocationTracker] 로그아웃 감지됨 - 위치 추적 비활성화");
            return;
        }

        console.log(`[LocationTracker] 로그인 감지됨 (User: ${user.id}) - 위치 추적 시작`);

        // 2. 위치 전송 함수
        const sendLocation = () => {
            if (!navigator.geolocation) return;

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const userId = Number(user.id);

                    try {
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
                            console.log(`[LocationTracker] 위치 자동 저장 완료: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                        }
                    } catch (error) {
                        // 조용히 실패 (백그라운드 작업이므로 에러 알림 최소화)
                        // console.error("[LocationTracker] 전송 실패:", error);
                    }
                },
                (error) => {
                    console.warn(`[LocationTracker] 위치 권한 오류: ${error.message}`);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        };

        // 3. 최초 실행
        sendLocation();

        // 4. 20분(1,200,000ms) 간격으로 반복
        // 테스트 시에는 1분(60000) 등으로 줄여서 확인 가능
        const intervalId = setInterval(sendLocation, 1200000);

        // 5. 언마운트 또는 로그아웃 시 정리
        return () => {
            clearInterval(intervalId);
            console.log("[LocationTracker] 추적 타이머 정리됨");
        };
    }, [user]); // user 상태가 변할 때마다(로그인/로그아웃) 이 useEffect가 재실행됨

    return null;
};

export default LocationTracker;