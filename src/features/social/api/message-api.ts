import { httpClient } from '@/shared/api/http-client';
import { ChatRoom, Message, SendMessageRequest } from '@/features/social/types/message';

const BASE_URL = '/messages';

export const messageApi = {
    // 채팅방 생성 또는 조회
    createOrGetChatRoom: async (userId1: number, userId2: number) => {
        return await httpClient.post<ChatRoom>(
            `${BASE_URL}/room?userId1=${userId1}&userId2=${userId2}`
        );
    },

    // 채팅방 목록 조회
    getChatRooms: async (userId: number) => {
        return await httpClient.get<ChatRoom[]>(`${BASE_URL}/rooms/${userId}`);
    },

    // 메시지 목록 조회
    getMessages: async (chatRoomId: number, userId: number) => {
        return await httpClient.get<Message[]>(
            `${BASE_URL}/room/${chatRoomId}?userId=${userId}`
        );
    },

    // 최근 메시지 조회 (페이징)
    getRecentMessages: async (chatRoomId: number, userId: number, limit: number = 50) => {
        return await httpClient.get<Message[]>(
            `${BASE_URL}/room/${chatRoomId}/recent?userId=${userId}&limit=${limit}`
        );
    },

    // 메시지 전송
    sendMessage: async (request: SendMessageRequest) => {
        return await httpClient.post<Message>(`${BASE_URL}/send`, {
            ...request,
            messageType: request.messageType || 'TEXT',
        });
    },

    // 메시지 읽음 처리
    markAsRead: async (chatRoomId: number, userId: number) => {
        return await httpClient.put<void>(
            `${BASE_URL}/room/${chatRoomId}/read?userId=${userId}`
        );
    },

    // 읽지 않은 메시지 수 조회
    getUnreadCount: async (chatRoomId: number, userId: number) => {
        return await httpClient.get<number>(
            `${BASE_URL}/room/${chatRoomId}/unread?userId=${userId}`
        );
    },

    // 전체 읽지 않은 메시지 수 조회
    getTotalUnreadCount: async (userId: number) => {
        return await httpClient.get<number>(`${BASE_URL}/unread/${userId}`);
    },
};