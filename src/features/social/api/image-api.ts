import { httpClient } from '@/shared/api/http-client';

export const imageApi = {
  /**
   * 이미지 업로드 (User Service)
   * POST /api/images/upload
   * Response: List<String> (이미지 URL 리스트)
   */
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    // User Service의 ImageController가 "multipartFile"이라는 키를 기대함
    formData.append('multipartFile', file);

    // boundary 자동 설정을 위해 Content-Type 헤더는 생략하는게 정석이지만
    // http-client의 기본 설정(application/json)을 덮어쓰기 위해 명시적으로 지정
    const response = await httpClient.post<string[]>('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // 리스트의 첫 번째 URL 반환
    return response[0];
  }
};