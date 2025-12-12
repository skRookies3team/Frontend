// src/features/social/types/message.ts

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

export interface Message {
    id: number;
    chatRoomId: number;
    senderId: number;
    senderName: string;
    senderAvatar: string;
    content: string;
    messageType: 'TEXT' | 'IMAGE' | 'EMOJI';
    isRead: boolean;
    createdAt: string;
}

export interface SendMessageRequest {
    chatRoomId: number;
    senderId: number;
    content: string;
    messageType?: string;
}