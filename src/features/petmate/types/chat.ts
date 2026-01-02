export interface ChatMessage {
  id: number;
  chatRoomId: number;
  senderId: number;
  senderName: string;
  senderAvatar: string | null; // 백엔드에서 null 가능
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'SYSTEM';
  isRead: boolean;
  createdAt: string; // ISO String
}

export interface ChatRoom {
  id: number;
  otherUserId: number;
  otherUserName: string;
  otherUserAvatar: string | null;
  petName: string;
  petPhoto: string | null;
  lastMessage: string | null;    // 메시지 없을 때 null 가능
  lastMessageAt: string | null;  // 메시지 없을 때 null 가능
  unreadCount: number;
}

export interface MessageRequest {
  chatRoomId: number;
  senderId: number;
  content: string;
  messageType: 'TEXT' | 'IMAGE';
}