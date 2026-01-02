import { useState, useEffect, useCallback, useRef } from 'react';
import { Client, IFrame, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Message, ChatRoom, messageApi, SendMessageRequest } from '../api/message-api';

interface UseChatProps {
    userId: number;
    chatRoomId: number | null;
}

interface UseChatReturn {
    messages: Message[];
    chatRooms: ChatRoom[];
    isConnected: boolean;
    isLoading: boolean;
    sendMessage: (content: string) => void;
    loadMessages: (roomId: number) => Promise<void>;
    loadChatRooms: () => Promise<void>;
    deleteRoom: (roomId: number) => Promise<void>;
}

export function useChat({ userId, chatRoomId }: UseChatProps): UseChatReturn {
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const stompClientRef = useRef<Client | null>(null);

    // WebSocket 연결
    useEffect(() => {
        const wsUrl = import.meta.env.PROD
            ? `${window.location.origin}/api/ws`
            : '/api/ws';

        const client = new Client({
            webSocketFactory: () => new SockJS(wsUrl),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            debug: (str: string) => {
                if (import.meta.env.DEV) {
                    console.log('[STOMP]', str);
                }
            },
            onConnect: () => {
                console.log('WebSocket Connected');
                setIsConnected(true);
            },
            onDisconnect: () => {
                console.log('WebSocket Disconnected');
                setIsConnected(false);
            },
            onStompError: (frame: IFrame) => {
                console.error('STOMP Error:', frame.headers['message']);
            },
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (client.active) {
                client.deactivate();
            }
        };
    }, []);

    // 채팅방 구독
    useEffect(() => {
        const client = stompClientRef.current;
        if (!client || !isConnected || !chatRoomId) return;

        const subscription = client.subscribe(`/topic/chat/${chatRoomId}`, (message: IMessage) => {
            const newMessage: Message = JSON.parse(message.body);
            setMessages((prev) => [...prev, newMessage]);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [isConnected, chatRoomId]);

    // 채팅방 변경 시 메시지 로드 (자동)
    useEffect(() => {
        if (chatRoomId) {
            loadMessages(chatRoomId);
        } else {
            setMessages([]);
        }
    }, [chatRoomId]);

    // 채팅방 목록 로드
    const loadChatRooms = useCallback(async () => {
        try {
            const rooms = await messageApi.getChatRooms(userId);
            setChatRooms(rooms);
        } catch (error) {
            console.error('Failed to load chat rooms:', error);
        }
    }, [userId]);

    // 메시지 로드
    const loadMessages = useCallback(async (roomId: number) => {
        setIsLoading(true);
        try {
            const msgs = await messageApi.getMessages(roomId, userId);
            setMessages(msgs);
            // 읽음 처리 (선택적)
            await messageApi.markAsRead(roomId, userId);
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    // 메시지 전송
    const sendMessage = useCallback((content: string) => {
        if (!chatRoomId || !content.trim()) return;

        const client = stompClientRef.current;

        if (client && isConnected) {
            // WebSocket으로 전송
            client.publish({
                destination: `/app/chat/${chatRoomId}`,
                body: JSON.stringify({
                    senderId: userId,
                    content: content.trim(),
                    messageType: 'TEXT',
                }),
            });
        } else {
            // Fallback: REST API로 전송
            const request: SendMessageRequest = {
                chatRoomId,
                senderId: userId,
                content: content.trim(),
                messageType: 'TEXT',
            };
            messageApi.sendMessage(request).then((msg) => {
                setMessages((prev) => [...prev, msg]);
            });
        }
    }, [chatRoomId, userId, isConnected]);

    // 채팅방 삭제
    const deleteRoom = useCallback(async (roomId: number) => {
        try {
            await messageApi.deleteChatRoom(roomId, userId);
            setChatRooms((prev) => prev.filter((r) => r.id !== roomId));
        } catch (error) {
            console.error('Failed to delete chat room:', error);
            throw error;
        }
    }, [userId]);

    // 초기 채팅방 목록 로드
    useEffect(() => {
        if (userId) {
            loadChatRooms();
        }
    }, [userId, loadChatRooms]);

    return {
        messages,
        chatRooms,
        isConnected,
        isLoading,
        sendMessage,
        loadMessages,
        loadChatRooms,
        deleteRoom,
    };
}
