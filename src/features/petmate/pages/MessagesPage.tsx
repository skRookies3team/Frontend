import { useState } from "react";
import { Search, MoreVertical, Phone, Video, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card } from "@/shared/ui/card";
import { ScrollArea } from "@/shared/ui/scroll-area";

// 펫메이트 메시지 페이지 (구 Social MessagesPage)
export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  
  // 더미 데이터 (백엔드 연동 전)
  const chats = [
    { id: 1, name: "강형욱", message: "산책 언제 가실래요?", time: "방금 전", unread: 2, avatar: "/placeholder-user.jpg" },
    { id: 2, name: "이효리", message: "우리 강아지가 너무 좋아해요!", time: "10분 전", unread: 0, avatar: "/placeholder-user.jpg" },
  ];

  return (
    <div className="flex h-screen bg-[#FDFBFD] pt-16">
      <div className="container max-w-6xl mx-auto flex h-[calc(100vh-5rem)] gap-6 p-4">
        
        {/* 채팅 목록 사이드바 */}
        <Card className="w-80 flex flex-col border-none shadow-lg rounded-3xl overflow-hidden bg-white">
          <div className="p-4 border-b">
            <h2 className="font-bold text-xl mb-4">메시지</h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input placeholder="검색..." className="pl-9 bg-gray-50 border-none rounded-xl" />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-colors ${
                    selectedChat === chat.id ? "bg-[#FFF0F5]" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                      <AvatarImage src={chat.avatar} />
                      <AvatarFallback>{chat.name[0]}</AvatarFallback>
                    </Avatar>
                    {chat.unread > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#FF69B4] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-bold text-sm">{chat.name}</span>
                      <span className="text-[10px] text-gray-400">{chat.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{chat.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* 채팅방 영역 */}
        <Card className="flex-1 flex flex-col border-none shadow-lg rounded-3xl overflow-hidden bg-white">
          {selectedChat ? (
            <>
              <div className="p-4 border-b flex justify-between items-center bg-white">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-sm">상대방 이름</div>
                    <div className="text-xs text-green-500 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span> 온라인
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full"><Phone className="h-5 w-5 text-gray-500" /></Button>
                  <Button variant="ghost" size="icon" className="rounded-full"><Video className="h-5 w-5 text-gray-500" /></Button>
                  <Button variant="ghost" size="icon" className="rounded-full"><MoreVertical className="h-5 w-5 text-gray-500" /></Button>
                </div>
              </div>
              
              <ScrollArea className="flex-1 p-4 bg-gray-50/50">
                <div className="flex flex-col gap-4">
                  {/* 더미 메시지 */}
                  <div className="flex gap-3 justify-start">
                    <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm max-w-[70%] border border-gray-100">
                      안녕하세요! 펫메이트 보고 연락드렸어요.
                    </div>
                    <span className="text-[10px] text-gray-400 self-end">10:00 AM</span>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <span className="text-[10px] text-gray-400 self-end">10:05 AM</span>
                    <div className="bg-[#FF69B4] text-white p-3 rounded-2xl rounded-tr-none shadow-md shadow-pink-100 text-sm max-w-[70%]">
                      네 안녕하세요! 반갑습니다 🐶
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="p-4 bg-white border-t">
                <div className="flex gap-2">
                  <Input placeholder="메시지를 입력하세요..." className="rounded-xl border-gray-200 bg-gray-50 focus-visible:ring-[#FF69B4]" />
                  <Button size="icon" className="bg-[#FF69B4] hover:bg-[#FF1493] rounded-xl shadow-lg shadow-pink-200">
                    <Send className="h-5 w-5 text-white" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Send className="h-10 w-10 text-gray-300" />
              </div>
              <p>대화를 시작할 친구를 선택해주세요!</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}