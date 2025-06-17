// src/components/chat/ChatPanel.tsx
/**
 * 상대 파일 경로: src/components/chat/ChatPanel.tsx
 * 실시간 채팅 패널 컴포넌트 - 백엔드 API와 WebSocket 통합
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, MessageCircle, Loader2 } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAPI } from '../../hooks/useAPI';
import { apiService } from '../../services/api';
import type { ChatMessage } from '../../types';

export default function ChatPanel() {
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { chatMessages, currentUser, isConnected } = useAppStore();
  const { sendMessage } = useWebSocket();
  const { execute: executeGetMessages } = useAPI();
  const { execute: executeSendMessage } = useAPI();

  // 컴포넌트 마운트 시 채팅 메시지 로드
  useEffect(() => {
    if (currentUser) {
      loadChatMessages();
    }
  }, [currentUser, loadChatMessages]);

  // 새 메시지가 추가될 때마다 스크롤을 아래로
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // 채팅 메시지 로드
  const loadChatMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      await executeGetMessages(() => apiService.getChatMessages(50));
    } catch (error) {
      console.error('채팅 메시지 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [executeGetMessages]);

  // 스크롤을 아래로 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 메시지 전송 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !isConnected) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      // WebSocket을 통한 실시간 전송
      if (isConnected) {
        sendMessage(messageText);
      } else {
        // WebSocket 연결이 없으면 HTTP API 사용
        await executeSendMessage(() => apiService.sendChatMessage(messageText));
      }
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      // 실패 시 입력 값 복원
      setNewMessage(messageText);
    }
  };

  // 시간 포맷팅
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // 메시지 타입별 스타일
  const getMessageStyle = (type: ChatMessage['type']) => {
    switch (type) {
      case 'system':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
      case 'vote_update':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      case 'user_join':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'user_leave':
        return 'bg-red-500/10 border-red-500/20 text-red-400';
      case 'poll_created':
        return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
      default:
        return 'bg-slate-700/50 border-slate-600/30 text-slate-200';
    }
  };

  // 메시지 타입별 아이콘
  const getMessageIcon = (type: ChatMessage['type']) => {
    switch (type) {
      case 'system':
        return '🔔';
      case 'vote_update':
        return '📊';
      case 'user_join':
        return '👋';
      case 'user_leave':
        return '👋';
      case 'poll_created':
        return '🗳️';
      default:
        return null;
    }
  };

  // 현재 사용자의 메시지인지 확인
  const isOwnMessage = (message: ChatMessage) => {
    return message.user_id === currentUser?.id;
  };

  return (
    <div className="card-gradient bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700/50 p-0 h-80 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-500/20 rounded-lg">
            <MessageCircle className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200">실시간 채팅</h3>
            <p className="text-xs text-slate-500">의견을 자유롭게 나눠보세요</p>
          </div>
        </div>

        {/* 연결 상태 표시 */}
        <div className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-emerald-500' : 'bg-red-500'
        }`} title={isConnected ? '연결됨' : '연결 끊김'} />
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto scrollbar-thin space-y-3">
        {isLoading && chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center space-x-2 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">메시지 로딩 중...</span>
            </div>
          </div>
        ) : chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-slate-500">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">아직 메시지가 없습니다</p>
              <p className="text-xs">첫 번째 메시지를 보내보세요!</p>
            </div>
          </div>
        ) : (
          chatMessages.map((message) => {
            const isOwn = isOwnMessage(message);
            const isSystemMessage = message.type !== 'message';
            const icon = getMessageIcon(message.type);

            return (
              <div
                key={message.id}
                className={`p-3 rounded-lg border ${getMessageStyle(message.type)} ${
                  isOwn && !isSystemMessage ? 'ml-8' : ''
                } ${isSystemMessage ? 'text-center' : ''}`}
              >
                {!isSystemMessage ? (
                  // 일반 사용자 메시지
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold ${
                        isOwn ? 'text-blue-300' : 'text-slate-300'
                      }`}>
                        {isOwn ? '나' : message.username}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-200 break-words">
                      {message.message}
                    </p>
                  </>
                ) : (
                  // 시스템 메시지
                  <>
                    <div className="flex items-center justify-center space-x-2">
                      {icon && <span className="text-sm">{icon}</span>}
                      <p className="text-sm">{message.message}</p>
                    </div>
                    <div className="text-xs opacity-75 mt-1">
                      {formatTime(message.timestamp)}
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-slate-700/50">
        {!currentUser ? (
          <div className="text-center text-slate-500 py-2">
            <p className="text-sm">로그인 후 채팅에 참여할 수 있습니다</p>
          </div>
        ) : !isConnected ? (
          <div className="text-center text-red-400 py-2">
            <p className="text-sm">연결이 끊어져 메시지를 보낼 수 없습니다</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm"
              maxLength={500}
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || !isConnected}
              className="p-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
        
        {/* 문자 수 표시 */}
        {newMessage && (
          <div className="mt-2 text-xs text-slate-500 text-right">
            {newMessage.length}/500
          </div>
        )}
      </div>
    </div>
  );
}
