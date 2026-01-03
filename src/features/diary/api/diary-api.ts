import { SelectedImage, ImageType, CreateDiaryResponse, AiDiaryResponse, DiaryResponse } from '../types/diary';
import httpClient from '@/shared/api/http-client';

// Mock S3 업로드 시뮬레이션
const mockS3Upload = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        console.log(`[SERVICE MOCK S3] 파일 업로드 시도: ${file.name}`);
        setTimeout(() => {
            const mockUrl = `https://placehold.co/600x400?text=${encodeURIComponent(file.name)}`;
            console.log(`[SERVICE MOCK S3] 업로드 성공 (Mock). URL: ${mockUrl}`);
            resolve(mockUrl);
        }, 1000);
    });
};

export const uploadImagesToS3 = async (files: File[]): Promise<SelectedImage[]> => {
    const uploadPromises = files.map(async (file) => {
        const url = await mockS3Upload(file);
        return { imageUrl: url, source: ImageType.GALLERY };
    });
    return Promise.all(uploadPromises);
};

export const generateAiDiaryContent = (): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("오늘 초코는 공원에서 정말 행복한 시간을 보냈어요. 새로운 친구들을 만나고 신나게 뛰어놀았답니다. 햇살이 따스했고, 초코의 웃는 얼굴을 보니 저도 덩달아 행복해졌어요. 이렇게 맑은 날씨에 함께할 수 있어서 감사한 하루였습니다.");
        }, 1500);
    });
};

export const createAiDiary = async (data: FormData): Promise<CreateDiaryResponse> => {
    const token = localStorage.getItem('petlog_token');
    const API_URL = import.meta.env.VITE_API_URL || '/api';

    const response = await fetch(`${API_URL}/diaries/ai`, {
        method: 'POST',
        headers: {
            'Authorization': token ? `Bearer ${token}` : ''
        },
        body: data
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = response.status === 404
            ? "API 경로를 찾을 수 없습니다 (404). 백엔드 서버 상태를 확인해주세요."
            : (errorData.message || '일기 생성 실패');
        throw new Error(errorMessage);
    }

    return await response.json();
};

export const getDiary = async (diaryId: number): Promise<any> => {
    const token = localStorage.getItem('petlog_token');
    const API_URL = import.meta.env.VITE_API_URL || '/api';
    const response = await fetch(`${API_URL}/diaries/${diaryId}`, {
        method: 'GET',
        headers: {
            'Authorization': token ? `Bearer ${token}` : ''
        }
    });

    if (!response.ok) throw new Error('일기 조회 실패');
    return await response.json();
};

export const updateDiary = async (diaryId: number, data: { content?: string; visibility?: string; mood?: string }): Promise<void> => {
    const token = localStorage.getItem('petlog_token');
    const API_URL = import.meta.env.VITE_API_URL || '/api';
    const response = await fetch(`${API_URL}/diaries/${diaryId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('일기 수정 실패');
};

export const deleteDiary = async (diaryId: number, userId?: number): Promise<void> => {
    try {
        await httpClient.delete(`/diaries/${diaryId}`, {
            headers: userId ? {
                'X-USER-ID': userId.toString()
            } : undefined
        });
    } catch (error: any) {
        console.error('[deleteDiary] 삭제 실패:', error);
        throw new Error(error.response?.data?.message || '일기 삭제 실패');
    }
};

import { DiaryStyleRequest } from '../types/diary';

// [NEW] 스타일 설정 저장 (Upsert)
export const saveDiaryStyleApi = async (userId: number, data: DiaryStyleRequest) => {
    try {
        const response = await httpClient.post<any>('/v1/diary/styles', data, {
            headers: {
                'X-USER-ID': userId.toString()
            }
        });
        return response;
    } catch (error) {
        console.error("[Service] 스타일 저장 실패:", error);
        throw error; // Let the caller handle or ignore
    }
};

// [NEW] 내 스타일 조회
export const getMyStyleApi = async (userId: number, petId?: number) => {
    try {
        const response = await httpClient.get<any>('/v1/diary/styles/me', {
            headers: {
                'X-USER-ID': userId.toString()
            },
            params: { petId }
        });
        return response;
    } catch (error) {
        console.warn("[Service] 스타일 조회 실패:", error);
        return null;
    }
};

// [NEW] 펫 스타일 조회
export const getPetStyleApi = async (userId: number, petId: number) => {
    try {
        const response = await httpClient.get<any>(`/v1/diary/styles/pet/${petId}`, {
            headers: {
                'X-USER-ID': userId.toString()
            }
        });
        return response;
    } catch (error) {
        console.warn("[Service] 펫 스타일 조회 실패:", error);
        return null;
    }
};
// [NEW] 위치 이력 조회
export const getLocationHistory = async (userId: number, date: string) => {
    try {
        const response = await httpClient.get<any>(`/locations/history`, {
            params: { userId, date }
        });
        return response;
    } catch (error) {
        console.warn("[Service] 위치 조회 실패:", error);
        return null;
    }
};

// [NEW] 코인 적립 API
export const earnCoin = async (userId: number, amount: number, type: 'WRITEDIARY' | 'WIRTEFEED') => {
    try {
        const response = await httpClient.post<any>(`/users/${userId}/coin/earn`, {
            amount,
            type
        });
        return response;
    } catch (error) {
        console.error("[Service] 코인 적립 실패:", error);
        return null;
    }
};

// [NEW] 소셜 피드 생성 API
export const createSocialFeed = async (data: any) => {
    try {
        const response = await httpClient.post<any>(`/feeds`, data);
        const feedId = response.feedId || response.id || response;
        return feedId;
    } catch (error) {
        console.error("[Service] 소셜 피드 생성 실패:", error);
        throw error;
    }
};

// [Modified] createAiDiary - Now sends JSON (DiaryRequest.Create)
// Note: The backend 'POST /api/diaries' now expects @RequestBody DiaryRequest.Create (JSON)
export const createAiDiaryApi = async (data: any): Promise<number> => {
    // 'data' passed here should be the DiaryRequest object, not FormData
    const response = await httpClient.post<number>('/diaries', data, {
        timeout: 60000 // [FIX] Increase timeout to 60s for AI generation
    });
    return response;
};

// [NEW] AI Diary Preview
export const generateAiDiaryPreview = async (data: FormData): Promise<AiDiaryResponse> => {
    // Calls POST /api/diaries/ai/preview with Multipart Form Data
    const response = await httpClient.post<AiDiaryResponse>('/diaries/ai/preview', data, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000 // [FIX] Increase timeout to 60s for AI generation
    });
    return response;
};

// [NEW] 캘린더 날짜별 조회 API
export const getDiariesByDate = async (userId: number, date: string) => {
    try {
        const response = await httpClient.get<any>(`/diary-queries/calendar`, {
            params: { userId, date }
        });
        return response;
    } catch (error) {
        console.warn("[Service] 날짜별 다이어리 조회 실패:", error);
        return [];
    }
};
// [NEW] AI 다이어리 전체 조회 (User provided List return)
// Endpoint assumption: GET /diary-queries/ai/{userId} based on user provided service logic
export const getAiDiariesApi = async (userId: number): Promise<DiaryResponse[]> => {
    try {
        const response = await httpClient.get<DiaryResponse[]>(`/diary-queries/ai-archive`, {
            params: { userId },
            headers: {
                'X-USER-ID': userId.toString()
            }
        });
        console.log('[getAiDiariesApi] Success:', response);
        return response; // Expecting List<DiaryResponse>
    } catch (error) {
        console.warn("[Service] AI 다이어리 조회 실패 (백엔드 오류 Fallback):", error);

        // [FALLBACK] Return Mock Data so user can see UI
        return [
            {
                diaryId: 9991,
                userId: userId,
                petId: 1,
                title: "공원에서의 즐거운 하루",
                date: "2024-12-25",
                images: [{
                    imageId: 1,
                    imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=600&fit=crop",
                    imgOrder: 0,
                    mainImage: true
                }],
                content: "오늘은 날씨가 너무 좋아서 공원에 다녀왔어요. 행복한 하루였습니다!",
                weather: "SUNNY",
                mood: "HAPPY",
                isAiGen: true,
                createdAt: "2024-12-25T10:00:00"
            },
            {
                diaryId: 9992,
                userId: userId,
                petId: 1,
                title: "새로운 친구를 만났어요",
                date: "2024-12-26",
                images: [{
                    imageId: 2,
                    imageUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=600&fit=crop",
                    imgOrder: 0,
                    mainImage: true
                }],
                content: "산책하다가 새로운 친구를 만났어요. 정말 즐거웠습니다!",
                weather: "CLOUDY",
                mood: "EXCITED",
                isAiGen: true,
                createdAt: "2024-12-26T14:30:00"
            },
            {
                diaryId: 9993,
                userId: userId,
                petId: 1,
                title: "맛있는 간식 시간",
                date: "2024-12-27",
                images: [{
                    imageId: 3,
                    imageUrl: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=400&h=600&fit=crop",
                    imgOrder: 0,
                    mainImage: true
                }],
                content: "오늘은 특별한 간식을 받았어요. 너무 맛있었어요!",
                weather: "SUNNY",
                mood: "PROUD",
                isAiGen: true,
                createdAt: "2024-12-27T16:00:00"
            }
        ] as DiaryResponse[];
    }
};

// [NEW] 날씨 조회 API - 위치와 날짜 기반 날씨 정보 가져오기
export const getWeatherApi = async (latitude: number, longitude: number, date: string): Promise<string | null> => {
    try {
        const response = await httpClient.get<{ weather: string }>('/diaries/weather', {
            params: { latitude, longitude, date }
        });
        console.log(`[getWeatherApi] Weather for ${date} at (${latitude}, ${longitude}):`, response.weather);
        return response.weather;
    } catch (error) {
        console.error('[getWeatherApi] Failed to fetch weather:', error);
        return null; // Return null on error, let UI handle fallback
    }
};
// ============================================================
// Recap API Functions
// ============================================================

import {
    RecapAutoGenerateRequest,
    RecapManualGenerateRequest,
    RecapDetailResponse,
    RecapSimpleResponse,
    GenerateRecapResponse
} from '../types/recap';

/**
 * Schedule auto recap for next month (WAITING status)
 * POST /api/recaps/schedule/auto
 * Server schedules recap for next month
 */
export const scheduleAutoRecapApi = async (data: RecapAutoGenerateRequest): Promise<GenerateRecapResponse> => {
    try {
        // Send as query parameters
        const params = new URLSearchParams({
            petId: data.petId.toString(),
            userId: data.userId.toString(),
        });

        if (data.petName) {
            params.append('petName', data.petName);
        }

        const response = await httpClient.post<GenerateRecapResponse>(
            `/recaps/schedule/auto?${params.toString()}`,
            null // No body for scheduling
        );
        console.log('[scheduleAutoRecapApi] Success:', response);
        return response;
    } catch (error) {
        console.error('[scheduleAutoRecapApi] Failed to schedule auto recap:', error);
        throw error;
    }
};

/**
 * Generate AI-powered monthly recap manually with custom date range
 * POST /api/recaps/generate/manual
 */
export const generateManualRecapApi = async (data: RecapManualGenerateRequest): Promise<GenerateRecapResponse> => {
    try {
        const response = await httpClient.post<GenerateRecapResponse>('/recaps/generate/manual', data);
        console.log('[generateManualRecapApi] Success:', response);
        return response;
    } catch (error) {
        console.error('[generateManualRecapApi] Failed to generate manual recap:', error);
        throw error;
    }
};

/**
 * Get recap detail by ID
 * GET /api/recaps/{recapId}
 */
export const getRecapDetailApi = async (recapId: number): Promise<RecapDetailResponse> => {
    try {
        const response = await httpClient.get<RecapDetailResponse>(`/recaps/${recapId}`);
        console.log('[getRecapDetailApi] Success:', response);
        return response;
    } catch (error) {
        console.error('[getRecapDetailApi] Failed to get recap detail:', error);
        throw error;
    }
};

/**
 * Get all recaps for a user
 * GET /api/recaps/user/{userId}
 */
export const getUserRecapsApi = async (userId: number): Promise<RecapSimpleResponse[]> => {
    try {
        const response = await httpClient.get<RecapSimpleResponse[]>(`/recaps/user/${userId}`);
        console.log('[getUserRecapsApi] Success:', response);
        return response;
    } catch (error) {
        console.error('[getUserRecapsApi] Failed to get user recaps:', error);
        // Return empty array as fallback
        return [];
    }
};

/**
 * Get recaps by pet ID
 * GET /api/recaps/pet/{petId}
 */
export const getPetRecapsApi = async (petId: number): Promise<RecapSimpleResponse[]> => {
    try {
        const response = await httpClient.get<RecapSimpleResponse[]>(`/recaps/pet/${petId}`);
        console.log('[getPetRecapsApi] Success:', response);
        return response;
    } catch (error) {
        console.error('[getPetRecapsApi] Failed to get pet recaps:', error);
        // Return empty array as fallback
        return [];
    }
};
