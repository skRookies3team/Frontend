import { httpClient } from '@/shared/api/http-client';

// 채팅방 응답 타입
export interface ChatRoom {
    id: number;
    otherUserId: number;
    otherUserName: string;
    otherUserAvatar: string | null;
    petName: string | null;
    petPhoto: string | null;
    lastMessage: string | null;
    lastMessageAt: string | null;
    unreadCount: number;
}

// 메시지 응답 타입
export interface Message {
    id: number;
    chatRoomId: number;
    senderId: number;
    senderName: string;
    senderAvatar: string | null;
    content: string;
    messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'EMOJI';
    isRead: boolean;
    createdAt: string;
}

// 메시지 요청 타입
export interface SendMessageRequest {
    chatRoomId: number;
    senderId: number;
    content: string;
    messageType?: string;
}

export const messageApi = {
    // 채팅방 생성 또는 조회
    createOrGetChatRoom: async (userId1: number, userId2: number): Promise<ChatRoom> => {
        return httpClient.post<ChatRoom>(`/messages/room?userId1=${userId1}&userId2=${userId2}`);
    },

    // 사용자의 모든 채팅방 목록 조회
    getChatRooms: async (userId: number): Promise<ChatRoom[]> => {
        return httpClient.get<ChatRoom[]>(`/messages/rooms/${userId}`);
    },

    // 채팅방 메시지 목록 조회
    getMessages: async (chatRoomId: number, userId: number): Promise<Message[]> => {
        return httpClient.get<Message[]>(`/messages/room/${chatRoomId}?userId=${userId}`);
    },

    // 메시지 전송 (REST API - WebSocket 백업)
    sendMessage: async (request: SendMessageRequest): Promise<Message> => {
        return httpClient.post<Message>('/messages/send', request);
    },

    // 메시지 읽음 처리
    markAsRead: async (chatRoomId: number, userId: number): Promise<void> => {
        await httpClient.put(`/messages/room/${chatRoomId}/read?userId=${userId}`);
    },

    // 전체 읽지 않은 메시지 수
    getTotalUnreadCount: async (userId: number): Promise<number> => {
        return httpClient.get<number>(`/messages/unread/${userId}`);
    },

    // 채팅방 삭제
    deleteChatRoom: async (chatRoomId: number, userId: number): Promise<void> => {
        await httpClient.delete(`/messages/room/${chatRoomId}?userId=${userId}`);
    },
};
