import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/features/auth/context/auth-context';
import { chatApi } from '../api/chat-api';
import { useChatSocket } from '../hooks/use-chat-socket';
// [수정] 사용하지 않는 ChatMessage 제거
import { ChatRoom } from '../types/chat'; 
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Send, ArrowLeft, MoreVertical, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function MessagesPage() {
  const { user } = useAuth();
  const currentUserId = Number(user?.id);
  // [수정] 사용하지 않는 queryClient 제거
  // const queryClient = useQueryClient(); 

  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  
  const { data: chatRooms, isLoading: isRoomsLoading } = useQuery({
    queryKey: ['chatRooms', currentUserId],
    queryFn: () => chatApi.getMyChatRooms(currentUserId),
    enabled: !!currentUserId,
    refetchInterval: 5000,
  });

  // [수정] room 파라미터에 타입 명시 (room: ChatRoom)
  const activeRoom = chatRooms?.find((room: ChatRoom) => room.id === selectedRoomId);

  return (
    <div className="flex h-[calc(100vh-6rem)] w-full max-w-6xl mx-auto bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden my-4">
      <div className={`w-full md:w-[320px] lg:w-[380px] border-r border-gray-100 flex flex-col ${selectedRoomId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-5 border-b border-gray-50">
          <h1 className="text-xl font-bold text-gray-900">메시지</h1>
        </div>
        
        <ScrollArea className="flex-1">
          {isRoomsLoading ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-gray-300" /></div>
          ) : chatRooms?.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">
              진행 중인 대화가 없습니다.<br/>펫메이트에서 친구를 찾아보세요! 🐾
            </div>
          ) : (
            <div className="flex flex-col">
              {/* [수정] room 파라미터에 타입 명시 (room: ChatRoom) */}
              {chatRooms?.map((room: ChatRoom) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`flex items-center gap-4 p-4 text-left transition-colors hover:bg-gray-50 ${
                    selectedRoomId === room.id ? 'bg-[#FFF0F5] hover:bg-[#FFF0F5]' : ''
                  }`}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12 border border-gray-100">
                      <AvatarImage src={room.otherUserAvatar || '/placeholder-user.jpg'} className="object-cover" />
                      <AvatarFallback>{room.otherUserName[0]}</AvatarFallback>
                    </Avatar>
                    {room.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white">
                        {room.unreadCount > 99 ? '99+' : room.unreadCount}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-gray-900 truncate">{room.otherUserName}</span>
                      {room.lastMessageAt && (
                        <span className="text-[11px] text-gray-400 shrink-0">
                          {format(new Date(room.lastMessageAt), 'M월 d일', { locale: ko })}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm truncate ${room.unreadCount > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                      {room.lastMessage || '대화를 시작해보세요!'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <div className={`flex-1 flex flex-col bg-[#FDFBFD] ${!selectedRoomId ? 'hidden md:flex' : 'flex'}`}>
        {selectedRoomId && activeRoom ? (
          <ChatWindow 
            roomId={selectedRoomId} 
            userId={currentUserId} 
            roomInfo={activeRoom} 
            onBack={() => setSelectedRoomId(null)} 
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <Send className="w-8 h-8 text-gray-300" />
            </div>
            <p>채팅방을 선택하여 대화를 시작하세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ... (ChatWindow 컴포넌트는 기존과 동일, 변경 필요 없음)
// 하단 ChatWindow 함수는 그대로 두시면 됩니다.
function ChatWindow({ roomId, userId, roomInfo, onBack }: { roomId: number, userId: number, roomInfo: ChatRoom, onBack: () => void }) {
  // ... 기존 코드 유지 ...
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: historyMessages, isLoading } = useQuery({
    queryKey: ['chatHistory', roomId],
    queryFn: () => chatApi.getMessages(roomId, userId),
    enabled: !!roomId,
  });

  const { realtimeMessages, sendMessage, connected } = useChatSocket(roomId, userId);

  useEffect(() => {
    if (roomId) {
      chatApi.markAsRead(roomId, userId).then(() => {
        queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      });
    }
  }, [roomId, userId, queryClient]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [historyMessages, realtimeMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !connected) return;

    const sent = sendMessage(input);
    if (sent) {
      setInput('');
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    }
  };

  const allMessages = [...(historyMessages || []), ...realtimeMessages];

  return (
    <>
      <div className="h-16 px-4 md:px-6 border-b border-gray-100 bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="md:hidden p-2 -ml-2 text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Avatar className="h-9 w-9 border border-gray-100">
            <AvatarImage src={roomInfo.otherUserAvatar || '/placeholder-user.jpg'} />
            <AvatarFallback>{roomInfo.otherUserName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-bold text-gray-900 text-sm">{roomInfo.otherUserName}</h2>
            {connected && <p className="text-[10px] text-green-500 font-medium">● 실시간 연결됨</p>}
          </div>
        </div>
        <button className="p-2 text-gray-400 hover:text-gray-600"><MoreVertical className="w-5 h-5" /></button>
      </div>

      <ScrollArea className="flex-1 p-4 bg-[#FDFBFD]">
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#FF69B4]" /></div>
        ) : (
          <div className="flex flex-col gap-3 pb-4">
            {allMessages.map((msg, idx) => {
              const isMe = msg.senderId === userId;
              const showProfile = !isMe && (idx === 0 || allMessages[idx - 1].senderId !== msg.senderId);

              return (
                <div key={idx} className={`flex gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {!isMe && (
                    <div className="w-8 shrink-0">
                      {showProfile && (
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarImage src={roomInfo.otherUserAvatar || '/placeholder-user.jpg'} />
                          <AvatarFallback>{roomInfo.otherUserName[0]}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  )}
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-[20px] text-sm leading-relaxed shadow-sm ${
                    isMe 
                      ? 'bg-[#FF69B4] text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                  <div className="text-[10px] text-gray-400 self-end mb-1 min-w-[40px]">
                    {format(new Date(msg.createdAt), 'a h:mm', { locale: ko })}
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      <div className="p-4 bg-white border-t border-gray-100 shrink-0">
        <form onSubmit={handleSend} className="flex gap-2 relative">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="rounded-full bg-gray-50 border-transparent focus:bg-white focus:border-[#FF69B4] pr-12 transition-all"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!input.trim() || !connected}
            className={`absolute right-1 top-1 h-8 w-8 rounded-full ${input.trim() ? 'bg-[#FF69B4] hover:bg-[#FF1493]' : 'bg-gray-200 text-gray-400'}`}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </>
  );
}