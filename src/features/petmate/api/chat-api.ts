import { httpClient } from '@/shared/api/http-client';
import { ChatRoom, ChatMessage, MessageRequest } from '../types/chat';

// httpClient의 baseURL이 '/api'로 설정되어 있으므로, 여기서는 '/messages'로 시작합니다.
// 최종 요청 URL: http://localhost:8000/api/messages/...
const BASE_URL = '/messages';

export const chatApi = {
  // 1. 내 채팅방 목록 조회
  // GET /api/messages/rooms/{userId}
  getMyChatRooms: async (userId: number): Promise<ChatRoom[]> => {
    return httpClient.get<ChatRoom[]>(`${BASE_URL}/rooms/${userId}`);
  },

  // 2. 특정 채팅방 메시지 내역 조회
  // GET /api/messages/room/{chatRoomId}?userId={userId}
  getMessages: async (chatRoomId: number, userId: number): Promise<ChatMessage[]> => {
    return httpClient.get<ChatMessage[]>(`${BASE_URL}/room/${chatRoomId}`, {
      params: { userId },
    });
  },

  // 3. 메시지 읽음 처리
  // PUT /api/messages/room/{chatRoomId}/read?userId={userId}
  markAsRead: async (chatRoomId: number, userId: number): Promise<void> => {
    await httpClient.put(`${BASE_URL}/room/${chatRoomId}/read`, null, {
      params: { userId },
    });
  },

  // 4. 메시지 전송 (REST API - 소켓 연결 실패 시 백업용)
  // POST /api/messages/send
  sendMessage: async (data: MessageRequest): Promise<ChatMessage> => {
    return httpClient.post<ChatMessage>(`${BASE_URL}/send`, data);
  },
  
  // 5. 채팅방 생성 또는 조회 (매칭 시 사용)
  // POST /api/messages/room?userId1={id}&userId2={id}
  createOrGetChatRoom: async (userId1: number, userId2: number) => {
    return httpClient.post(`${BASE_URL}/room`, null, {
        params: { userId1, userId2 }
    });
  }
};