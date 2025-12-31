import { httpClient } from '@/shared/api/http-client';

export interface Message {
    id: number;
    chatRoomId: number;
    senderId: number;
    senderName: string;
    senderAvatar: string;
    content: string;
    messageType: 'TEXT' | 'IMAGE' | 'SYSTEM';
    isRead: boolean;
    createdAt: string;
}

export interface ChatRoom {
    id: number;
    otherUserId: number;
    otherUserName: string;
    otherUserAvatar: string;
    petName: string;
    petPhoto: string;
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
}

export interface MessageRequest {
    chatRoomId: number;
    senderId: number;
    content: string;
    messageType?: 'TEXT' | 'IMAGE';
}

export const messageApi = {
    // 내 채팅방 목록 조회
    getMyChatRooms: async (userId: number): Promise<ChatRoom[]> => {
        return httpClient.get<ChatRoom[]>(`/messages/rooms/${userId}`);
    },

    // 특정 채팅방의 메시지 내역 조회
    getChatHistory: async (chatRoomId: number, userId: number): Promise<Message[]> => {
        return httpClient.get<Message[]>(`/messages/room/${chatRoomId}?userId=${userId}`);
    },

    // 메시지 읽음 처리
    markAsRead: async (chatRoomId: number, userId: number): Promise<void> => {
        return httpClient.put<void>(`/messages/room/${chatRoomId}/read?userId=${userId}`);
    },
    
    // 메시지 전송 (REST Fallback용)
    sendMessage: async (data: MessageRequest): Promise<Message> => {
        return httpClient.post<Message>('/messages/send', data);
    }
};