import { SelectedImage, ImageType, CreateDiaryResponse } from '../types/diary';

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

export const createStyle = async (data: any): Promise<any> => {
    const token = localStorage.getItem('petlog_token');
    const response = await fetch('http://localhost:8000/api/v1/diary/styles', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('스타일 저장 실패');
    return await response.json();
};

export const updateStyle = async (styleId: number, data: any): Promise<any> => {
    const token = localStorage.getItem('petlog_token');
    const response = await fetch(`http://localhost:8000/api/v1/diary/styles/${styleId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('스타일 수정 실패');
    return await response.json();
};

export const getMyStyle = async (petId?: number): Promise<any> => {
    const token = localStorage.getItem('petlog_token');
    const url = petId
        ? `http://localhost:8000/api/v1/diary/styles/me?petId=${petId}`
        : 'http://localhost:8000/api/v1/diary/styles/me';

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': token ? `Bearer ${token}` : ''
        }
    });

    if (!response.ok) throw new Error('스타일 조회 실패');
    return await response.json();
};

export const getPetStyle = async (petId: number): Promise<any> => {
    const token = localStorage.getItem('petlog_token');
    const response = await fetch(`http://localhost:8000/api/v1/diary/styles/pet/${petId}`, {
        method: 'GET',
        headers: {
            'Authorization': token ? `Bearer ${token}` : ''
        }
    });

    if (!response.ok) throw new Error('펫 스타일 조회 실패');
    return await response.json();
};
