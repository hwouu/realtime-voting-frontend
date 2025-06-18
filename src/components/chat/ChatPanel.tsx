// src/components/chat/ChatPanel.tsx
import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import type { ChatMessage } from '../../types';

interface ChatPanelProps {
  nickname: string;
  onSendMessage?: (message: string) => void;
}

export default function ChatPanel({ nickname, onSendMessage }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket 연결
  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_API_URL + '/chat';
    const socket = new WebSocket(`${wsUrl}?nickname=${encodeURIComponent(nickname)}`);
    wsRef.current = socket;

    socket.onopen = () => {
      console.log('✅ WebSocket 연결됨');
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'chat_message' && data.data) {
          const { nickname: sender, message, timestamp } = data.data;

          const newMsg: ChatMessage = {
            id: crypto.randomUUID(),
            userId: sender,
            username: sender,
            message,
            timestamp, // 문자열 그대로 사용
            type: 'message',
          };

          console.log('[RECEIVED]', newMsg);
          setMessages((prev) => [...prev, newMsg]);
        }
      } catch (err) {
        console.error('❌ WebSocket 메시지 파싱 실패:', err);
      }
    };

    socket.onerror = (e) => console.error('❌ WebSocket 오류:', e);
    socket.onclose = () => console.log('❌ WebSocket 종료됨');

    return () => {
      socket.close();
    };
  }, [nickname]);

  // 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 메시지 전송
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const payload = {
      type: 'chat_message',
      message: newMessage.trim(),
    };

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('[SEND]', payload);
      wsRef.current.send(JSON.stringify(payload));
    }

    setNewMessage('');
  };

  const formatTime = (timestamp: string | Date) => {
    if (typeof timestamp === 'string') return timestamp;
    return new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(timestamp);
  };

  const getMessageStyle = (type: ChatMessage['type']) => {
    switch (type) {
      case 'system':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
      case 'vote_update':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      default:
        return 'bg-slate-700/50 border-slate-600/30 text-slate-200';
    }
  };

  return (
    <div className="card-gradient bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700/50 p-0 h-80 flex flex-col">
      <div className="flex items-center space-x-3 p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-500/20 rounded-lg">
          <MessageCircle className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-200">실시간 채팅</h3>
          <p className="text-xs text-slate-500">의견을 자유롭게 나눠보세요</p>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto scrollbar-thin space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg border ${getMessageStyle(message.type)}`}
          >
            {message.type === 'message' && (
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-300">
                  {message.username}
                </span>
                <span className="text-xs text-slate-500">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            )}
            <p className={`text-sm ${message.type === 'message' ? 'text-slate-200' : ''}`}>
              {message.message}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-700/50">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
