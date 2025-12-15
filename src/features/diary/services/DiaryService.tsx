import { SelectedImage, DiaryRequest, CreateDiaryResponse, ImageType } from '../types/diary';

// Mock S3 업로드 (테스트용) - 실제로는 백엔드 Presigned URL 등을 사용해야 함
const mockS3Upload = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 더미 이미지 URL 반환
            const mockUrl = `https://placehold.co/600x400?text=${encodeURIComponent(file.name)}`;
            resolve(mockUrl);
        }, 800);
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
            resolve("오늘 우리 멍멍이는 공원에서 신나게 뛰어놀았어요! 날씨도 좋고 친구들도 많이 만나서 기분이 정말 좋아 보였답니다. 간식도 맛있게 먹고 행복한 하루였어요.");
        }, 2000);
    });
};

// [핵심] 실제 백엔드 연동 (fetch 사용)
export const createAiDiary = async (diaryData: DiaryRequest): Promise<CreateDiaryResponse> => {
    // 1. 로컬 스토리지에서 토큰 직접 가져오기
    const token = localStorage.getItem('petlog_token');

    // [수정] 펫 ID 문제 해결을 위해 강제로 Mock ID(1) 사용
    // 실제 petId가 무엇이든 1로 덮어씌워 전송합니다.
    const payload = {
        ...diaryData,
        petId: 1
    };

    // 2. fetch로 요청 보내기 (헤더에 토큰 수동 추가)
    const response = await fetch('http://localhost:8000/api/diaries', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // 토큰이 있을 때만 Authorization 헤더 추가
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
    });

    // 3. 에러 처리
    if (!response.ok) {
        // 서버에서 보낸 에러 메시지가 있다면 파싱
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    // 4. 결과 반환
    return await response.json();
};