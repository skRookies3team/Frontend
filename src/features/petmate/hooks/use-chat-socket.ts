import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessage, MessageRequest } from '../types/chat';

// Vite Proxy가 설정되어 있다면 '/ws-chat', 없다면 전체 주소
const SOCKET_URL = 'http://localhost:8000/ws-chat'; 

export function useChatSocket(userId: number, currentRoomId: number | null) {
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<any>(null); // 현재 구독 객체 저장
  const [newMessages, setNewMessages] = useState<ChatMessage[]>([]);

  // 방 변경 시 메시지 버퍼 초기화
  useEffect(() => {
    setNewMessages([]);
  }, [currentRoomId]);

  // 1. 소켓 연결 설정 (한 번만 실행)
  useEffect(() => {
    if (!userId) return;

    const socket = new SockJS(SOCKET_URL);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000, // 자동 재연결 (5초)
      debug: (str) => {
        // console.log('STOMP Debug:', str);
      },
      onConnect: () => {
        console.log('✅ WebSocket Connected');
        setConnected(true);
      },
      onStompError: (frame) => {
        console.error('❌ Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
      onDisconnect: () => {
        console.log('❌ WebSocket Disconnected');
        setConnected(false);
      }
    });

    client.activate();
    clientRef.current = client;

    // 언마운트 시 연결 종료
    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [userId]);

  // 2. 방 구독 관리 (currentRoomId가 바뀔 때마다 실행)
  useEffect(() => {
    const client = clientRef.current;

    // 연결이 안됐거나 방 ID가 없으면 리턴
    if (!client || !client.connected || !currentRoomId) return;

    // 기존 구독이 있다면 해제 (중복 수신 방지)
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    // 새 방 구독
    // 백엔드 경로: /sub/chat/room/{roomId}
    console.log(`📡 Subscribing to room: ${currentRoomId}`);
    subscriptionRef.current = client.subscribe(`/sub/chat/room/${currentRoomId}`, (message: IMessage) => {
      if (message.body) {
        try {
          const receivedMsg: ChatMessage = JSON.parse(message.body);
          setNewMessages((prev) => [...prev, receivedMsg]);
        } catch (e) {
          console.error("Failed to parse message", e);
        }
      }
    });

    // 클린업: 방이 바뀌거나 컴포넌트가 사라질 때 구독 해제
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [currentRoomId, connected]); // connected가 true가 된 직후에도 실행되어야 함

  // 3. 메시지 전송 함수
  const sendMessage = useCallback((content: string, roomId: number) => {
    if (clientRef.current && clientRef.current.connected) {
      const payload: MessageRequest = {
        chatRoomId: roomId,
        senderId: userId,
        content: content,
        messageType: 'TEXT',
      };

      // 백엔드 발행 경로: /pub/chat/message
      clientRef.current.publish({
        destination: '/pub/chat/message',
        body: JSON.stringify(payload),
      });
      return true;
    }
    return false;
  }, [userId]);

  return {
    connected,
    newMessages,
    sendMessage,
  };
}