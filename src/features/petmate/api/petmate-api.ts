import { httpClient } from '@/shared/api/http-client';

// Types
export interface PetMateProfile {
    id?: number;
    userId: number;
    userName: string;
    userAvatar?: string;
    userGender: string;
    petName: string;
    petBreed: string;
    petAge?: number;
    petGender?: string;
    petPhoto?: string;
    bio?: string;
    activityLevel?: number;
    latitude?: number;
    longitude?: number;
    location?: string;
    interests?: string[];
}

export interface PetMateCandidate {
    id: number;
    userId: number;
    userName: string;
    userAvatar: string;
    userGender: string;
    petName: string;
    petBreed: string;
    petAge: number;
    petGender: string;
    petPhoto: string;
    bio: string;
    bioIcon?: string;
    activityLevel: number;
    distance: number;
    location: string;
    commonInterests: string[];
    matchScore: number;
    isOnline: boolean;
    lastActiveAt?: string;
}

export interface PetMateFilter {
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    userGender?: string;
    petBreed?: string;
    minActivityLevel?: number;
    maxActivityLevel?: number;
}

export interface MatchResult {
    matchId: number;
    matchedUserId: number;
    matchedUserName: string;
    matchedUserAvatar: string;
    petName: string;
    petPhoto: string;
    matchScore?: number;
    isMatched: boolean;
    matchedAt?: string;
    chatRoomId?: number;
    alreadyLiked?: boolean;
}

export interface LikeRequest {
    fromUserId: number;
    toUserId: number;
}

export interface PendingRequest {
    matchId: number;
    fromUserId: number;
    fromUserName: string;
    fromUserAvatar: string;
    petName: string;
    petPhoto: string;
    petBreed: string;
    petAge?: number;
    location?: string;
    createdAt: string;
}

export interface RequestRespondPayload {
    matchId: number;
    userId: number;
    accept: boolean;
}

// 주소 정보 인터페이스
export interface AddressInfo {
    fullAddress: string;
    roadAddress?: string;
    region1: string;
    region2: string;
    region3: string;
    zoneNo?: string;
    buildingName?: string;
}

// 주소 검색 결과 인터페이스
export interface SearchAddressResult {
    addressName: string;
    roadAddress?: string;
    latitude: number;
    longitude: number;
    region1?: string;
    region2?: string;
    region3?: string;
    zoneNo?: string;
    buildingName?: string;
}

// API Functions - httpClient 사용으로 JWT 토큰 자동 포함
export const petMateApi = {
    // 프로필 생성/수정
    createOrUpdateProfile: async (profile: PetMateProfile): Promise<PetMateCandidate> => {
        return httpClient.post<PetMateCandidate>('/petmate/profile', profile);
    },

    // 후보자 목록 조회
    getCandidates: async (userId: number, filter?: PetMateFilter): Promise<PetMateCandidate[]> => {
        return httpClient.post<PetMateCandidate[]>(`/petmate/candidates/${userId}`, filter || {});
    },

    // 좋아요 보내기
    like: async (request: LikeRequest): Promise<MatchResult> => {
        return httpClient.post<MatchResult>('/petmate/like', request);
    },

    // 좋아요 취소하기
    unlike: async (request: LikeRequest): Promise<boolean> => {
        return httpClient.delete<boolean>('/petmate/like', { data: request });
    },

    // 좋아요 보낸 사용자 ID 목록 조회
    getLikedUserIds: async (userId: number): Promise<number[]> => {
        return httpClient.get<number[]>(`/petmate/liked/${userId}`);
    },

    // 매칭 목록 조회
    getMatches: async (userId: number): Promise<MatchResult[]> => {
        return httpClient.get<MatchResult[]>(`/petmate/matches/${userId}`);
    },

    // 온라인 상태 업데이트
    updateOnlineStatus: async (userId: number, isOnline: boolean): Promise<void> => {
        await httpClient.put<void>(`/petmate/status/${userId}?isOnline=${isOnline}`);
    },

    // GPS 좌표 → 주소 변환 (Kakao Maps API)
    getAddressFromCoords: async (longitude: number, latitude: number): Promise<AddressInfo> => {
        return httpClient.get<AddressInfo>(`/geocoding/reverse?x=${longitude}&y=${latitude}`);
    },

    // 주소 검색 → 좌표 변환 (Kakao Maps API)
    searchAddress: async (query: string): Promise<SearchAddressResult[]> => {
        return httpClient.get<SearchAddressResult[]>(`/geocoding/search?query=${encodeURIComponent(query)}`);
    },

    // 사용자 위치 업데이트 (DB 저장)
    updateLocation: async (userId: number, latitude: number, longitude: number, location?: string): Promise<boolean> => {
        const params = new URLSearchParams({
            latitude: latitude.toString(),
            longitude: longitude.toString(),
        });
        if (location) {
            params.append('location', location);
        }
        return httpClient.put<boolean>(`/petmate/location/${userId}?${params.toString()}`);
    },

    // 사용자 저장된 위치 조회
    getSavedLocation: async (userId: number): Promise<{ latitude: number; longitude: number; location: string } | null> => {
        try {
            return await httpClient.get<{ latitude: number; longitude: number; location: string }>(`/petmate/location/${userId}`);
        } catch {
            return null;
        }
    },

    // 받은 매칭 요청 목록 조회
    getPendingRequests: async (userId: number): Promise<PendingRequest[]> => {
        return httpClient.get<PendingRequest[]>(`/petmate/requests/${userId}`);
    },

    // 받은 매칭 요청 수 조회 (배지용)
    getPendingRequestsCount: async (userId: number): Promise<number> => {
        return httpClient.get<number>(`/petmate/requests/${userId}/count`);
    },

    // 매칭 요청 수락/거절
    respondToRequest: async (matchId: number, userId: number, accept: boolean): Promise<MatchResult> => {
        const payload: RequestRespondPayload = { matchId, userId, accept };
        return httpClient.post<MatchResult>(`/petmate/requests/${matchId}/respond`, payload);
    },
};

// GPS 좌표 가져오기 유틸리티
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser.'));
            return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });
    });
};

// GPS 좌표로 주소 가져오기 (통합 함수)
export const getAddressFromGPS = async (): Promise<AddressInfo> => {
    const position = await getCurrentPosition();
    const { longitude, latitude } = position.coords;
    return petMateApi.getAddressFromCoords(longitude, latitude);
};
