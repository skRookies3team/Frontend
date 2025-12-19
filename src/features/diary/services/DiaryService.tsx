import { SelectedImage, DiaryImageDTO } from '../types/diary.ts';

// --- Global Constants and API Endpoints (Service Layer) ---
const DEFAULT_USER_ID = 100;
const DEFAULT_PET_ID = 10;
const API_ENDPOINTS = {
    // 프록시 설정에 의해 'http://localhost:8080' (게이트웨이)로 전달됨
    DIARY_CREATE: '/api/diaries', 
    USER_S3_UPLOAD: import.meta.env.VITE_API_URL + '/users/upload', 
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
        const response = await fetch(API_ENDPOINTS.DIARY_CREATE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-USER-ID': String(DEFAULT_USER_ID)
            },
            body: JSON.stringify(diaryRequestPayload),
        });

        const contentType = response.headers.get('content-type');
        let data: { message: string, diaryId?: number } = { message: `Server Error (${response.status})` };
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        }

        if (response.ok) {
            console.log(`[BACKEND SUCCESS] Diary ID: ${data.diaryId}, Message: ${data.message}`);
            return data as { diaryId: number, message: string };
        } else {
            console.error(`[ERROR] Backend response failed: ${response.status}`, data);
            throw new Error(`일기 생성 실패 (${response.status}): ${data.message || '서버 오류'}`);
        }

    } catch (error) {
        // 네트워크 오류 처리
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 네트워크 오류';
        console.error("[ERROR] Network connection failed:", errorMessage);
        throw new Error(`네트워크 연결 실패: ${errorMessage}`);
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