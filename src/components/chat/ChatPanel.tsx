// src/components/chat/ChatPanel.tsx
import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import type { ChatMessage } from '../../types';

interface ChatPanelProps {
  messages?: ChatMessage[];
  onSendMessage?: (message: string) => void;
}

export default function ChatPanel({ messages = [], onSendMessage }: ChatPanelProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Demo messages for development
  const demoMessages: ChatMessage[] = [
    {
      id: '1',
      userId: 'user1',
      username: '현우',
      message: '안녕하세요! 투표에 참여해보세요',
      timestamp: new Date(Date.now() - 300000),
      type: 'message'
    },
    {
      id: '2',
      userId: 'system',
      username: 'System',
      message: '새로운 투표가 생성되었습니다: "점심 메뉴 투표"',
      timestamp: new Date(Date.now() - 240000),
      type: 'system'
    },
    {
      id: '3',
      userId: 'user2',
      username: '민수',
      message: '한식이 좋을 것 같아요!',
      timestamp: new Date(Date.now() - 180000),
      type: 'message'
    },
    {
      id: '4',
      userId: 'user3',
      username: '수현',
      message: '저는 중식 추천합니다 👍',
      timestamp: new Date(Date.now() - 120000),
      type: 'message'
    }
  ];

  const displayMessages = messages.length > 0 ? messages : demoMessages;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [displayMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (onSendMessage) {
      onSendMessage(newMessage.trim());
    }
    setNewMessage('');
  };

  const formatTime = (timestamp: Date) => {
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
      {/* Header */}
      <div className="flex items-center space-x-3 p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-500/20 rounded-lg">
          <MessageCircle className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-200">실시간 채팅</h3>
          <p className="text-xs text-slate-500">의견을 자유롭게 나눠보세요</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto scrollbar-thin space-y-3">
        {displayMessages.map((message) => (
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
            {message.type !== 'message' && (
              <div className="text-xs text-slate-500 mt-1">
                {formatTime(message.timestamp)}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
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
