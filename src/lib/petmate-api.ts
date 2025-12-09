// API base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8087';

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
        const response = await fetch(`${API_BASE_URL}/api/petmate/profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile),
        });
        if (!response.ok) throw new Error('Failed to update profile');
        return response.json();
    },

    // 후보자 목록 조회
    getCandidates: async (userId: number, filter?: PetMateFilter): Promise<PetMateCandidate[]> => {
        const response = await fetch(`${API_BASE_URL}/api/petmate/candidates/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filter || {}),
        });
        if (!response.ok) throw new Error('Failed to fetch candidates');
        return response.json();
    },

    // 좋아요 보내기
    like: async (request: LikeRequest): Promise<MatchResult> => {
        const response = await fetch(`${API_BASE_URL}/api/petmate/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });
        if (!response.ok) throw new Error('Failed to send like');
        return response.json();
    },

    // 좋아요 취소하기
    unlike: async (request: LikeRequest): Promise<boolean> => {
        const response = await fetch(`${API_BASE_URL}/api/petmate/like`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });
        if (!response.ok) throw new Error('Failed to cancel like');
        return response.json();
    },

    // 좋아요 보낸 사용자 ID 목록 조회
    getLikedUserIds: async (userId: number): Promise<number[]> => {
        const response = await fetch(`${API_BASE_URL}/api/petmate/liked/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch liked users');
        return response.json();
    },

    // 매칭 목록 조회
    getMatches: async (userId: number): Promise<MatchResult[]> => {
        const response = await fetch(`${API_BASE_URL}/api/petmate/matches/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch matches');
        return response.json();
    },

    // 온라인 상태 업데이트
    updateOnlineStatus: async (userId: number, isOnline: boolean): Promise<void> => {
        const response = await fetch(
            `${API_BASE_URL}/api/petmate/status/${userId}?isOnline=${isOnline}`,
            { method: 'PUT' }
        );
        if (!response.ok) throw new Error('Failed to update status');
    },
};

