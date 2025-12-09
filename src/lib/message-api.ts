// API base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8087';

// Types
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

// API Functions
export const messageApi = {
    // 채팅방 생성 또는 조회
    createOrGetChatRoom: async (userId1: number, userId2: number): Promise<ChatRoom> => {
        const response = await fetch(
            `${API_BASE_URL}/api/messages/room?userId1=${userId1}&userId2=${userId2}`,
            { method: 'POST' }
        );
        if (!response.ok) throw new Error('Failed to create/get chat room');
        return response.json();
    },

    // 채팅방 목록 조회
    getChatRooms: async (userId: number): Promise<ChatRoom[]> => {
        const response = await fetch(`${API_BASE_URL}/api/messages/rooms/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch chat rooms');
        return response.json();
    },

    // 메시지 목록 조회
    getMessages: async (chatRoomId: number, userId: number): Promise<Message[]> => {
        const response = await fetch(
            `${API_BASE_URL}/api/messages/room/${chatRoomId}?userId=${userId}`
        );
        if (!response.ok) throw new Error('Failed to fetch messages');
        return response.json();
    },

    // 최근 메시지 조회 (페이징)
    getRecentMessages: async (
        chatRoomId: number,
        userId: number,
        limit: number = 50
    ): Promise<Message[]> => {
        const response = await fetch(
            `${API_BASE_URL}/api/messages/room/${chatRoomId}/recent?userId=${userId}&limit=${limit}`
        );
        if (!response.ok) throw new Error('Failed to fetch recent messages');
        return response.json();
    },

    // 메시지 전송
    sendMessage: async (request: SendMessageRequest): Promise<Message> => {
        const response = await fetch(`${API_BASE_URL}/api/messages/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...request,
                messageType: request.messageType || 'TEXT',
            }),
        });
        if (!response.ok) throw new Error('Failed to send message');
        return response.json();
    },

    // 메시지 읽음 처리
    markAsRead: async (chatRoomId: number, userId: number): Promise<void> => {
        const response = await fetch(
            `${API_BASE_URL}/api/messages/room/${chatRoomId}/read?userId=${userId}`,
            { method: 'PUT' }
        );
        if (!response.ok) throw new Error('Failed to mark as read');
    },

    // 읽지 않은 메시지 수 조회
    getUnreadCount: async (chatRoomId: number, userId: number): Promise<number> => {
        const response = await fetch(
            `${API_BASE_URL}/api/messages/room/${chatRoomId}/unread?userId=${userId}`
        );
        if (!response.ok) throw new Error('Failed to get unread count');
        return response.json();
    },

    // 전체 읽지 않은 메시지 수 조회
    getTotalUnreadCount: async (userId: number): Promise<number> => {
        const response = await fetch(`${API_BASE_URL}/api/messages/unread/${userId}`);
        if (!response.ok) throw new Error('Failed to get total unread count');
        return response.json();
    },
};

// 시간 포맷팅 유틸리티
export const formatMessageTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    return '방금 전';
};

export const formatChatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
    });
};
