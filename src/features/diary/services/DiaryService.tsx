import { DiaryRequest, CreateDiaryResponse } from '../types/diary';

const BASE_URL = 'http://localhost:8000/api/diaries';

// 토큰 가져오기 헬퍼
const getAuthHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('petlog_token');
  const headers: HeadersInit = {
    'Authorization': token ? `Bearer ${token}` : ''
  };
  // Multipart가 아닐 때만 Content-Type: application/json 추가
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

// [1] AI 일기 생성 (이미지+JSON 전송)
export const createAiDiary = async (formData: FormData): Promise<CreateDiaryResponse> => {
  // 백엔드 엔드포인트: /api/diaries/ai
  const response = await fetch(`${BASE_URL}/ai`, {
    method: 'POST',
    headers: getAuthHeaders(true), // Content-Type 자동 설정을 위해 true 전달
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'AI 일기 생성에 실패했습니다.');
  }

  return await response.json();
};

// [2] 일기 상세 조회 (생성된 AI 일기 내용 확인용)
export const getDiary = async (diaryId: number): Promise<any> => {
  const response = await fetch(`${BASE_URL}/${diaryId}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('일기 정보를 불러오는데 실패했습니다.');
  }
  return await response.json();
};

// [3] 일기 수정 (편집 단계에서 최종 저장용)
export const updateDiary = async (diaryId: number, data: Partial<DiaryRequest>): Promise<void> => {
  const response = await fetch(`${BASE_URL}/${diaryId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('일기 수정에 실패했습니다.');
  }
};

// S3 업로드 (현재 백엔드 로직상 createAiDiary에서 이미지를 직접 처리하므로 프론트의 Mock 업로드는 미리보기용으로만 사용)
export const uploadImagesToS3 = async (files: File[]): Promise<{imageUrl: string, source: any}[]> => {
  return new Promise((resolve) => {
    const newImages = files.map(file => ({
      imageUrl: URL.createObjectURL(file), // 로컬 미리보기 URL
      source: 'GALLERY'
    }));
    setTimeout(() => resolve(newImages), 500);
  });
};