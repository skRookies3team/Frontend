export interface ChatMessage {
  id: number;
  chatRoomId: number;
  senderId: number;
  senderName: string;
  senderAvatar: string | null;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

export interface ChatRoom {
  id: number;
  otherUserId: number;
  otherUserName: string;
  otherUserAvatar: string | null;
  petName: string;
  petPhoto: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface MessageRequest {
  chatRoomId: number;
  senderId: number;
  content: string;
  messageType: 'TEXT' | 'IMAGE';
}