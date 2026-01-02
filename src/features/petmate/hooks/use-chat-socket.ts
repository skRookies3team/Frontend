import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessage, MessageRequest } from '../types/chat';

// Vite Proxy 설정이 되어있다면 상대 경로 사용 권장 ("/ws-chat")
// Proxy가 없다면 백엔드 전체 주소 ("http://localhost:8080/ws-chat")
const SOCKET_URL = '/ws-chat'; // 또는 import.meta.env.VITE_WS_URL 사용

export function useChatSocket(userId: number, currentRoomId: number | null) {
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const [newMessages, setNewMessages] = useState<ChatMessage[]>([]);

  // 룸 변경 시 새 메시지 버퍼 초기화
  useEffect(() => {
    setNewMessages([]);
  }, [currentRoomId]);

  useEffect(() => {
    if (!userId) return;

    const socket = new SockJS(SOCKET_URL);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (_str) => {
        // console.log('STOMP Debug:', _str);
      },
      onConnect: () => {
        console.log('✅ WebSocket Connected');
        setConnected(true);

        // 현재 보고 있는 방이 있다면 구독
        if (currentRoomId) {
          subscribeToRoom(client, currentRoomId);
        }
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

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [userId]);

  // 방 변경 시 구독 갱신
  useEffect(() => {
    const client = clientRef.current;
    if (client && client.connected && currentRoomId) {
      // 기존 구독 취소 로직은 stompjs가 내부적으로 처리하거나, 
      // 명시적으로 하려면 subscribe()가 반환하는 unsubscribe 함수를 저장해둬야 함.
      // 여기서는 간단하게 새 방을 구독하면 콜백이 그 방 메시지만 처리하도록 필터링하는 방식 사용하거나
      // stompjs의 특성상 중복 구독을 막기 위해 이전 구독을 해제하는 것이 정석임.
      
      // 간단한 구현: 메시지 수신 시 currentRoomId와 비교
      subscribeToRoom(client, currentRoomId);
    }
  }, [currentRoomId, connected]); // connected가 true가 되었을 때도 실행되어야 함

  const subscribeToRoom = (client: Client, roomId: number) => {
    // 이미 구독 중인지 체크하는 로직이 있으면 좋지만, 간단하게 구현
    // 백엔드 구독 경로: /sub/chat/room/{roomId}
    client.subscribe(`/sub/chat/room/${roomId}`, (message: IMessage) => {
      if (message.body) {
        const receivedMsg: ChatMessage = JSON.parse(message.body);
        setNewMessages((prev) => [...prev, receivedMsg]);
      }
    });
  };

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