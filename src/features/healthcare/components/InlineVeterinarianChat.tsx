import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Send, Mic, Stethoscope, Activity, Sparkles, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function InlineVeterinarianChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "안녕하세요! AI 수의사 닥터 펫입니다. \n오늘 아이의 컨디션은 어떤가요? 궁금한 점이 있다면 언제든 물어봐주세요.",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Mock response
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "네, 말씀하신 증상을 기록했습니다. \n소화기 계통의 일시적인 문제일 수 있습니다만, 증상이 24시간 이상 지속된다면 가까운 병원 방문을 권장드립니다.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <Card className="h-[600px] flex flex-col overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm ring-1 ring-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#004e92] to-[#50cc7f] p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl">👨‍⚕️</span>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-[#004e92]" />
          </div>
          <div>
            <h3 className="font-bold text-lg">AI 수의사 상담소</h3>
            <p className="text-xs text-white/90 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              실시간 상담 대기중
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-2xl p-4 text-sm shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-blue-500 text-white rounded-tr-none' 
                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
            }`}>
              <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
              <p className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-4 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-75" />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-150" />
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Recommended Topics Pills */}
      <div className="px-4 py-2 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto scrollbar-hide">
        {["구토/설사", "피부 발진", "예방접종", "사료 추천"].map((topic) => (
          <button 
            key={topic}
            onClick={() => setInputValue(topic)}
            className="flex-shrink-0 px-3 py-1.5 bg-gray-50 hover:bg-blue-50 text-xs font-medium text-gray-600 hover:text-blue-600 rounded-full border border-gray-200 transition-colors"
          >
            {topic}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-full border border-gray-200 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <Button variant="ghost" size="icon" className="rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50">
            <Mic className="h-5 w-5" />
          </Button>
          <Input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="증상이나 궁금한 점을 입력해주세요..." 
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 px-2 text-sm"
          />
          <Button 
            onClick={handleSend}
            disabled={!inputValue.trim()}
            size="icon" 
            className="rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-md disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
