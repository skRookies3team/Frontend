import { useState, useEffect } from 'react';
import { getUserApi } from "@/features/auth/api/auth-api";

const getAccessToken = () => localStorage.getItem('petlog_token') || localStorage.getItem('accessToken');

export const useDiaryAuth = () => {
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
