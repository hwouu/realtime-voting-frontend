// src/hooks/useWebSocket.ts
/**
 * WebSocket 연결 및 이벤트 관리를 위한 커스텀 훅
 */

import { useEffect, useRef } from 'react';
import { wsService } from '../services/websocket';
import { useAppStore } from '../stores/useAppStore';
import type { User, Poll, ChatMessage, UserMemo } from '../types';

export function useWebSocket() {
  const { currentUser, actions } = useAppStore();
  const isInitialized = useRef(false);

  // WebSocket 이벤트 핸들러 설정
  useEffect(() => {
    if (!currentUser || isInitialized.current) return;

    // 연결 상태 업데이트
    const updateConnectionStatus = () => {
      actions.setConnectionStatus(wsService.connected);
    };

    // 사용자 관련 이벤트
    const handleUserJoined = (user: User) => {
      actions.addOnlineUser(user);
      actions.addChatMessage({
        id: `system_${Date.now()}`,
        message: `${user.nickname}님이 입장했습니다.`,
        type: 'user_join',
        created_at: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        username: 'System',
        user_id: undefined,
      });
    };

    const handleUserLeft = (data: { userId: string }) => {
      actions.removeOnlineUser(data.userId);
      // 퇴장한 사용자 정보를 가져와서 메시지 생성
      // TODO: 사용자 닉네임 정보 필요
    };

    const handleOnlineUsers = (users: User[]) => {
      actions.setOnlineUsers(users);
    };

    // 투표 관련 이벤트
    const handlePollCreated = (poll: Poll) => {
      actions.addPoll(poll);
      actions.addChatMessage({
        id: `system_${Date.now()}`,
        message: `새로운 투표 "${poll.title}"가 생성되었습니다.`,
        type: 'poll_created',
        created_at: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        username: 'System',
        user_id: undefined,
      });
    };

    const handlePollUpdated = (poll: Poll) => {
      actions.updatePoll(poll);
    };

    const handleVoteResult = (data: { poll_id: string; results: any }) => {
      // 투표 결과 업데이트
      // TODO: 투표 결과 데이터 구조에 맞게 처리
      console.log('Vote result received:', data);
    };

    // 채팅 관련 이벤트
    const handleChatMessage = (message: ChatMessage) => {
      actions.addChatMessage(message);
    };

    // 메모 관련 이벤트
    const handleMemoSaved = (memo: UserMemo) => {
      actions.addUserMemo(memo);
    };

    // 이벤트 리스너 등록
    wsService.on('user:joined', handleUserJoined);
    wsService.on('user:left', handleUserLeft);
    wsService.on('users:online', handleOnlineUsers);
    wsService.on('poll:created', handlePollCreated);
    wsService.on('poll:updated', handlePollUpdated);
    wsService.on('vote:result', handleVoteResult);
    wsService.on('chat:message_received', handleChatMessage);
    wsService.on('memo:saved', handleMemoSaved);

    // 연결 상태 모니터링
    const connectionInterval = setInterval(updateConnectionStatus, 1000);

    isInitialized.current = true;

    // 정리 함수
    return () => {
      wsService.off('user:joined', handleUserJoined);
      wsService.off('user:left', handleUserLeft);
      wsService.off('users:online', handleOnlineUsers);
      wsService.off('poll:created', handlePollCreated);
      wsService.off('poll:updated', handlePollUpdated);
      wsService.off('vote:result', handleVoteResult);
      wsService.off('chat:message_received', handleChatMessage);
      wsService.off('memo:saved', handleMemoSaved);
      
      clearInterval(connectionInterval);
      isInitialized.current = false;
    };
  }, [currentUser, actions]);

  // WebSocket 연결
  const connect = async (token?: string) => {
    try {
      actions.setLoading(true);
      const connected = await wsService.connect(token);
      actions.setConnectionStatus(connected);
      
      if (connected && currentUser) {
        // 사용자 입장 알림
        wsService.joinUser(currentUser.nickname);
      }
      
      return connected;
    } catch (error) {
      console.error('WebSocket 연결 실패:', error);
      actions.setError('실시간 연결에 실패했습니다.');
      return false;
    } finally {
      actions.setLoading(false);
    }
  };

  // WebSocket 연결 해제
  const disconnect = () => {
    wsService.disconnect();
    actions.setConnectionStatus(false);
  };

  // 채팅 메시지 전송
  const sendMessage = (message: string) => {
    if (wsService.connected) {
      wsService.sendChatMessage(message);
    } else {
      actions.setError('연결이 끊어져 메시지를 전송할 수 없습니다.');
    }
  };

  // 투표 참여
  const castVote = (pollId: string, optionId: string) => {
    if (wsService.connected) {
      wsService.castVote(pollId, optionId);
    } else {
      actions.setError('연결이 끊어져 투표할 수 없습니다.');
    }
  };

  // 메모 저장
  const saveMemo = (content: string, pollId?: string) => {
    if (wsService.connected && currentUser) {
      wsService.saveMemo({
        content,
        user_id: currentUser.id,
        poll_id: pollId,
      });
    } else {
      actions.setError('연결이 끊어져 메모를 저장할 수 없습니다.');
    }
  };

  return {
    connect,
    disconnect,
    sendMessage,
    castVote,
    saveMemo,
    isConnected: wsService.connected,
  };
}
