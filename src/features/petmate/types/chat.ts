export interface ChatRoom {
  id: number;
  otherUserId: number;
  otherUserName: string;
  otherUserAvatar: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface ChatMessage {
  id: number;
  chatRoomId: number;
  senderId: number;
  senderName: string;
  senderAvatar: string | null;
  content: string;
  messageType: 'TEXT' | 'IMAGE';
  isRead: boolean;
  createdAt: string;
}