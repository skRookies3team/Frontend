import { httpClient } from '@/shared/api/http-client';
import {
    DiaryRequest,
    UpdateDiaryRequest,
    DiaryResponse,
    CreateDiaryResponse
} from '../types/diary';

const BASE_URL = '/diaries';

export const diaryApi = {
    // 다이어리 생성
    createDiary: async (request: DiaryRequest) => {
        return await httpClient.post<CreateDiaryResponse>(BASE_URL, request);
    },

    // 다이어리 상세 조회
    getDiary: async (diaryId: number) => {
        return await httpClient.get<DiaryResponse>(`${BASE_URL}/${diaryId}`);
    },

    // 다이어리 수정
    updateDiary: async (diaryId: number, request: UpdateDiaryRequest) => {
        return await httpClient.put<void>(`${BASE_URL}/${diaryId}`, request);
    },

    // 다이어리 삭제
    deleteDiary: async (diaryId: number) => {
        return await httpClient.delete<void>(`${BASE_URL}/${diaryId}`);
    }
};
