import { useState, useEffect, useCallback } from 'react';
import { messageApi, ChatRoom, Message, SendMessageRequest } from '../api/message-api';

// Mock data for fallback
const MOCK_CHAT_ROOMS: ChatRoom[] = [
    {
        id: 1,
        otherUserId: 1,
        otherUserName: "포메사랑",
        otherUserAvatar: "/placeholder.svg?height=100&width=100",
        petName: "뭉치",
        petPhoto: "/pomeranian-dog.png",
        lastMessage: "내일 저녁 7시에 한강공원에서 만나요!",
        lastMessageAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        unreadCount: 2,
    },
    {
        id: 2,
        otherUserId: 2,
        otherUserName: "골댕이집사",
        otherUserAvatar: "/placeholder.svg?height=100&width=100",
        petName: "해피",
        petPhoto: "/golden-retriever.png",
        lastMessage: "오늘 산책 어떠셨어요?",
        lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        unreadCount: 0,
    },
];

const MOCK_MESSAGES: Message[] = [
    {
        id: 1,
        chatRoomId: 1,
        senderId: 1,
        senderName: "포메사랑",
        senderAvatar: "/placeholder.svg",
        content: "안녕하세요! 같은 포메를 키우시는군요 😊",
        messageType: "TEXT",
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
        id: 2,
        chatRoomId: 1,
        senderId: 999,
        senderName: "나",
        senderAvatar: "/placeholder.svg",
        content: "네, 반가워요! 뭉치 정말 귀엽네요 🐶",
        messageType: "TEXT",
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
    },
    {
        id: 3,
        chatRoomId: 1,
        senderId: 1,
        senderName: "포메사랑",
        senderAvatar: "/placeholder.svg",
        content: "감사해요! 혹시 어디서 미용하세요?",
        messageType: "TEXT",
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    },
    {
        id: 4,
        chatRoomId: 1,
        senderId: 999,
        senderName: "나",
        senderAvatar: "/placeholder.svg",
        content: "한강 근처에 있는 펫살롱 다녀요. 실력 좋고 가격도 괜찮아요!",
        messageType: "TEXT",
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 21).toISOString(),
    },
    {
        id: 5,
        chatRoomId: 1,
        senderId: 1,
        senderName: "포메사랑",
        senderAvatar: "/placeholder.svg",
        content: "오! 좋은 정보 감사해요. 혹시 내일 저녁에 같이 산책 어떠세요?",
        messageType: "TEXT",
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
        id: 6,
        chatRoomId: 1,
        senderId: 999,
        senderName: "나",
        senderAvatar: "/placeholder.svg",
        content: "좋아요! 몇 시가 좋으세요?",
        messageType: "TEXT",
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
        id: 7,
        chatRoomId: 1,
        senderId: 1,
        senderName: "포메사랑",
        senderAvatar: "/placeholder.svg",
        content: "내일 저녁 7시에 한강공원에서 만나요!",
        messageType: "TEXT",
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
];

interface UseMessagesOptions {
    userId: number;
    useMockData?: boolean;
}

export function useMessages({ userId, useMockData = true }: UseMessagesOptions) {
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch chat rooms
    const fetchChatRooms = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            if (useMockData) {
                setChatRooms(MOCK_CHAT_ROOMS);
            } else {
                const data = await messageApi.getChatRooms(userId);
                setChatRooms(data);
            }
        } catch (err) {
            console.error('Failed to fetch chat rooms:', err);
            setError('채팅방 목록을 불러오는데 실패했습니다.');
            setChatRooms(MOCK_CHAT_ROOMS);
        } finally {
            setLoading(false);
        }
    }, [userId, useMockData]);

    // Fetch messages for a chat room
    const fetchMessages = useCallback(async (chatRoomId: number) => {
        try {
            if (useMockData) {
                setMessages(MOCK_MESSAGES.filter(m => m.chatRoomId === chatRoomId));
            } else {
                const data = await messageApi.getMessages(chatRoomId, userId);
                setMessages(data);
            }
        } catch (err) {
            console.error('Failed to fetch messages:', err);
            setMessages(MOCK_MESSAGES.filter(m => m.chatRoomId === chatRoomId));
        }
    }, [userId, useMockData]);

    // Send a message
    const sendMessage = useCallback(async (content: string): Promise<Message | null> => {
        if (!selectedChatRoom) return null;

        try {
            if (useMockData) {
                const newMessage: Message = {
                    id: Date.now(),
                    chatRoomId: selectedChatRoom.id,
                    senderId: userId,
                    senderName: "나",
                    senderAvatar: "/placeholder.svg",
                    content,
                    messageType: "TEXT",
                    isRead: false,
                    createdAt: new Date().toISOString(),
                };
                setMessages(prev => [...prev, newMessage]);

                // Update last message in chat room
                setChatRooms(prev => prev.map(room =>
                    room.id === selectedChatRoom.id
                        ? { ...room, lastMessage: content, lastMessageAt: new Date().toISOString() }
                        : room
                ));

                return newMessage;
            } else {
                const request: SendMessageRequest = {
                    chatRoomId: selectedChatRoom.id,
                    senderId: userId,
                    content,
                    messageType: 'TEXT',
                };
                const newMsg = await messageApi.sendMessage(request);
                setMessages(prev => [...prev, newMsg]);
                await fetchChatRooms(); // Refresh chat rooms
                return newMsg;
            }
        } catch (err) {
            console.error('Failed to send message:', err);
            setError('메시지 전송에 실패했습니다.');
            return null;
        }
    }, [selectedChatRoom, userId, useMockData, fetchChatRooms]);

    // Mark messages as read
    const markAsRead = useCallback(async (chatRoomId: number) => {
        if (!useMockData) {
            try {
                await messageApi.markAsRead(chatRoomId, userId);
                setChatRooms(prev => prev.map(room =>
                    room.id === chatRoomId ? { ...room, unreadCount: 0 } : room
                ));
            } catch (err) {
                console.error('Failed to mark as read:', err);
            }
        } else {
            setChatRooms(prev => prev.map(room =>
                room.id === chatRoomId ? { ...room, unreadCount: 0 } : room
            ));
        }
    }, [userId, useMockData]);

    // Select a chat room
    const selectChatRoom = useCallback((room: ChatRoom | null) => {
        setSelectedChatRoom(room);
        if (room) {
            fetchMessages(room.id);
            markAsRead(room.id);
        } else {
            setMessages([]);
        }
    }, [fetchMessages, markAsRead]);

    // Get or create chat room with another user
    const getOrCreateChatRoom = useCallback(async (otherUserId: number): Promise<ChatRoom | null> => {
        try {
            if (useMockData) {
                const existing = chatRooms.find(r => r.otherUserId === otherUserId);
                if (existing) return existing;

                const newRoom: ChatRoom = {
                    id: Date.now(),
                    otherUserId,
                    otherUserName: `User ${otherUserId}`,
                    otherUserAvatar: "/placeholder.svg",
                    petName: "Pet",
                    petPhoto: "/placeholder.svg",
                    lastMessage: "",
                    lastMessageAt: new Date().toISOString(),
                    unreadCount: 0,
                };
                setChatRooms(prev => [newRoom, ...prev]);
                return newRoom;
            } else {
                const room = await messageApi.createOrGetChatRoom(userId, otherUserId);
                await fetchChatRooms();
                return room;
            }
        } catch (err) {
            console.error('Failed to get/create chat room:', err);
            return null;
        }
    }, [userId, useMockData, chatRooms, fetchChatRooms]);

    // Get total unread count
    const totalUnreadCount = chatRooms.reduce((sum, room) => sum + room.unreadCount, 0);

    // Initial fetch
    useEffect(() => {
        fetchChatRooms();
    }, [fetchChatRooms]);

    return {
        chatRooms,
        messages,
        selectedChatRoom,
        loading,
        error,
        totalUnreadCount,
        fetchChatRooms,
        fetchMessages,
        sendMessage,
        markAsRead,
        selectChatRoom,
        getOrCreateChatRoom,
    };
}
