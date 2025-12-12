import { SelectedImage, DiaryImageDTO } from '../types/diary.ts';
import httpClient from '@/shared/api/http-client';
 
// --- Global Constants and API Endpoints (Service Layer) ---
const DEFAULT_USER_ID = 100;
const DEFAULT_PET_ID = 10;
const API_ENDPOINTS = {
    // 프록시 설정에 의해 'http://localhost:8000' (게이트웨이)로 전달됨
    DIARY_CREATE: '/api/diaries',
    USER_S3_UPLOAD: '/api/users/upload',
};

// Mock S3 업로드 시뮬레이션
const mockS3Upload = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        console.log(`[SERVICE MOCK S3] 파일 업로드 시도: ${file.name}`);
        setTimeout(() => {
            const mockUrl = `https://s3-bucket/user-${DEFAULT_USER_ID}/${Date.now()}_${file.name}`;
            console.log(`[SERVICE MOCK S3] 업로드 성공. URL: ${mockUrl}`);
            resolve(mockUrl);
        }, 1000);
    });
};

/**
 * 로컬 파일을 S3에 업로드하고 URL을 반환합니다.
 * @param files - 업로드할 파일 목록
 * @returns 업로드된 이미지 정보 배열
 */
export const uploadImagesToS3 = async (files: File[]): Promise<SelectedImage[]> => {
    const uploadPromises = files.map(async (file) => {
        const url = await mockS3Upload(file);
        return { imageUrl: url, source: 'GALLERY' as const };
    });
    return Promise.all(uploadPromises);
};


/**
 * AI 일기 생성 요청을 백엔드 Gateway를 통해 Diary Service로 전송합니다.
 * @param diaryData - 일기 데이터
 * @returns 백엔드 응답
 */
export const createAiDiary = async (diaryData: { content: string, images: DiaryImageDTO[] }): Promise<{ diaryId: number, message: string }> => {
    const diaryRequestPayload = {
        userId: DEFAULT_USER_ID,
        petId: DEFAULT_PET_ID,
        content: diaryData.content,
        visibility: "PUBLIC",
        isAiGen: true,
        weather: null,
        mood: null,
        images: diaryData.images,
    };

    try {
        console.log("--- DIARY CREATE START (via Gateway) ---");

        // httpClient를 사용하여 요청 전송 (자동으로 Authorization 헤더 추가됨)
        // baseURL을 빈 문자열로 설정하여 프록시(/api/...)를 타도록 함
        const data = await httpClient.post<{ diaryId: number, message: string }>(
            API_ENDPOINTS.DIARY_CREATE,
            diaryRequestPayload,
            {
                baseURL: '',
                headers: { 'X-USER-ID': String(DEFAULT_USER_ID) } // Gateway 요구사항이 있다면 유지
            }
        );

        console.log(`[BACKEND SUCCESS] Diary ID: ${data.diaryId}, Message: ${data.message}`);
        return data;

    } catch (error) {
        // 네트워크 오류 및 4xx, 5xx 에러 처리 (httpClient가 throw함)
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        console.error("[ERROR] Diary creation failed:", error);
        throw new Error(`일기 생성 실패: ${errorMessage}`);
    }
};

/**
 * AI 일기 내용을 시뮬레이션하여 생성합니다.
 * @returns 생성된 일기 텍스트
 */
export const generateAiDiaryContent = (): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const diary = "오늘은 정말 완벽한 날이었어요! 공원에 도착하자마자 찰리는 기쁨을 참을 수 없었답니다. 새로운 친구들을 여럿 만났고, 잔디밭을 뛰어다니며 몇 시간을 보냈어요. 꼬리를 쉴 새 없이 흔들며 행복해하는 모습이 너무 사랑스러웠어요. (AI 생성 텍스트)";
            resolve(diary);
        }, 3000); // 3초 대기
    });
};