import { httpClient } from '@/shared/api/http-client';
import { ChatRoom, ChatMessage } from '../types/chat';

// [수정] 백엔드 변경 사항 반영: URL 경로를 '/api/petmate/messages/...' 로 변경
// httpClient의 baseURL이 '/api'를 포함하고 있다면 '/petmate/messages/...' 만 적습니다.
// 만약 baseURL이 없다면 '/api/petmate/messages/...' 로 적습니다.
// 아래는 일반적인 Vite Proxy('/api') 사용 시 패턴입니다.

const BASE_URL = '/petmate/messages'; 

export const chatApi = {
  // 내 채팅방 목록 조회
  getMyChatRooms: async (userId: number) => {
    const response = await httpClient.get<ChatRoom[]>(`${BASE_URL}/rooms/${userId}`);
    return response;
  },

  // 특정 채팅방 메시지 내역 조회
  getMessages: async (chatRoomId: number, userId: number) => {
    const response = await httpClient.get<ChatMessage[]>(`${BASE_URL}/room/${chatRoomId}`, {
      params: { userId }
    });
    return response;
  },

  // 메시지 읽음 처리
  markAsRead: async (chatRoomId: number, userId: number) => {
    await httpClient.put(`${BASE_URL}/room/${chatRoomId}/read`, null, {
      params: { userId }
    });
  }
};