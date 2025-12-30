// API base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL;

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
    bioIcon?: string;  // SVG icon path for bio
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

// API Functions
export const petMateApi = {
    // 프로필 생성/수정
    createOrUpdateProfile: async (profile: PetMateProfile): Promise<PetMateCandidate> => {
        const response = await fetch(`${API_BASE_URL}/petmate/profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile),
        });
        if (!response.ok) throw new Error('Failed to update profile');
        return response.json();
    },

    // 후보자 목록 조회
    getCandidates: async (userId: number, filter?: PetMateFilter): Promise<PetMateCandidate[]> => {
        const response = await fetch(`${API_BASE_URL}/petmate/candidates/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filter || {}),
        });
        if (!response.ok) throw new Error('Failed to fetch candidates');
        return response.json();
    },

    // 좋아요 보내기
    like: async (request: LikeRequest): Promise<MatchResult> => {
        const response = await fetch(`${API_BASE_URL}/petmate/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });
        if (!response.ok) throw new Error('Failed to send like');
        return response.json();
    },

    // 좋아요 취소하기
    unlike: async (request: LikeRequest): Promise<boolean> => {
        const response = await fetch(`${API_BASE_URL}/petmate/like`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });
        if (!response.ok) throw new Error('Failed to cancel like');
        return response.json();
    },

    // 좋아요 보낸 사용자 ID 목록 조회
    getLikedUserIds: async (userId: number): Promise<number[]> => {
        const response = await fetch(`${API_BASE_URL}/petmate/liked/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch liked users');
        return response.json();
    },

    // 매칭 목록 조회
    getMatches: async (userId: number): Promise<MatchResult[]> => {
        const response = await fetch(`${API_BASE_URL}/petmate/matches/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch matches');
        return response.json();
    },

    // 온라인 상태 업데이트
    updateOnlineStatus: async (userId: number, isOnline: boolean): Promise<void> => {
        const response = await fetch(
            `${API_BASE_URL}/petmate/status/${userId}?isOnline=${isOnline}`,
            { method: 'PUT' }
        );
        if (!response.ok) throw new Error('Failed to update status');
    },

    // GPS 좌표 → 주소 변환 (Kakao Maps API)
    getAddressFromCoords: async (longitude: number, latitude: number): Promise<AddressInfo> => {
        const response = await fetch(
            `${API_BASE_URL}/geocoding/reverse?x=${longitude}&y=${latitude}`
        );
        if (!response.ok) throw new Error('Failed to get address from coordinates');
        return response.json();
    },

    // 주소 검색 → 좌표 변환 (Kakao Maps API)
    searchAddress: async (query: string): Promise<SearchAddressResult[]> => {
        const response = await fetch(
            `${API_BASE_URL}/geocoding/search?query=${encodeURIComponent(query)}`
        );
        if (!response.ok) throw new Error('Failed to search address');
        return response.json();
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
        const response = await fetch(
            `${API_BASE_URL}/petmate/location/${userId}?${params.toString()}`,
            { method: 'PUT' }
        );
        if (!response.ok) throw new Error('Failed to update location');
        return response.json();
    },

    // 사용자 저장된 위치 조회
    getSavedLocation: async (userId: number): Promise<{ latitude: number; longitude: number; location: string } | null> => {
        const response = await fetch(`${API_BASE_URL}/petmate/location/${userId}`);
        if (response.status === 404) return null;
        if (!response.ok) throw new Error('Failed to get saved location');
        return response.json();
    },
};

// 주소 정보 인터페이스
export interface AddressInfo {
    fullAddress: string;      // 전체 주소 (지번)
    roadAddress?: string;     // 도로명 주소
    region1: string;          // 시/도
    region2: string;          // 구/군
    region3: string;          // 동/읍/면
    zoneNo?: string;          // 우편번호
    buildingName?: string;    // 건물명
}

// 주소 검색 결과 인터페이스
export interface SearchAddressResult {
    addressName: string;      // 전체 주소
    roadAddress?: string;     // 도로명 주소
    latitude: number;         // 위도
    longitude: number;        // 경도
    region1?: string;         // 시/도
    region2?: string;         // 구/군
    region3?: string;         // 동/읍/면
    zoneNo?: string;          // 우편번호
    buildingName?: string;    // 건물명
}

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

