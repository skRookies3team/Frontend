import { httpClient } from '@/shared/api/http-client';
import { ChatRoom, ChatMessage, MessageRequest } from '../types/chat';

// 백엔드 컨트롤러 경로와 일치시킴
const BASE_URL = '/messages'; // httpClient baseURL에 /api가 포함되어 있다면 /messages만, 아니면 /api/messages

export const chatApi = {
  // 내 채팅방 목록 조회
  getMyChatRooms: async (userId: number) => {
    // GET /api/messages/rooms/{userId}
    const response = await httpClient.get<ChatRoom[]>(`${BASE_URL}/rooms/${userId}`);
    return response;
  },

  // 특정 채팅방 메시지 내역 조회
  getMessages: async (chatRoomId: number, userId: number) => {
    // GET /api/messages/room/{chatRoomId}?userId={userId}
    const response = await httpClient.get<ChatMessage[]>(`${BASE_URL}/room/${chatRoomId}`, {
      params: { userId },
    });
    return response;
  },

  // 메시지 읽음 처리
  markAsRead: async (chatRoomId: number, userId: number) => {
    // PUT /api/messages/room/{chatRoomId}/read?userId={userId}
    await httpClient.put(`${BASE_URL}/room/${chatRoomId}/read`, null, {
      params: { userId },
    });
  },

  // 메시지 전송 (REST API)
  sendMessage: async (data: MessageRequest) => {
    // POST /api/messages/send
    const response = await httpClient.post<ChatMessage>(`${BASE_URL}/send`, data);
    return response;
  }
};