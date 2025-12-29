import { SelectedImage, ImageType, CreateDiaryResponse, AiDiaryResponse } from '../types/diary';
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

    const response = await fetch('http://localhost:8000/api/diaries/ai', {
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
    const response = await fetch(`http://localhost:8000/api/diaries/${diaryId}`, {
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
    const response = await fetch(`http://localhost:8000/api/diaries/${diaryId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('일기 수정 실패');
};

export const deleteDiary = async (diaryId: number): Promise<void> => {
    const token = localStorage.getItem('petlog_token');
    const response = await fetch(`http://localhost:8000/api/diaries/${diaryId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': token ? `Bearer ${token}` : ''
        }
    });

    if (!response.ok) throw new Error('일기 삭제 실패');
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
    const response = await httpClient.post<number>('/diaries', data);
    return response;
};

// [NEW] AI Diary Preview
export const generateAiDiaryPreview = async (data: FormData): Promise<AiDiaryResponse> => {
    // Calls POST /api/diaries/ai/preview with Multipart Form Data
    const response = await httpClient.post<AiDiaryResponse>('/diaries/ai/preview', data, {
        headers: { "Content-Type": "multipart/form-data" }
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
