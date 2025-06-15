// src/utils/constants.ts

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';

export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  
  // User events
  USER_JOIN: 'user:join',
  USER_JOINED: 'user:joined',
  USER_LEFT: 'user:left',
  USERS_ONLINE: 'users:online',
  
  // Poll events
  POLL_CREATE: 'poll:create',
  POLL_CREATED: 'poll:created',
  POLL_UPDATED: 'poll:updated',
  
  // Vote events
  VOTE_CAST: 'vote:cast',
  VOTE_RESULT: 'vote:result',
  
  // Chat events
  CHAT_MESSAGE: 'chat:message',
  CHAT_MESSAGE_RECEIVED: 'chat:message_received',
  
  // Memo events
  MEMO_SAVE: 'memo:save',
  MEMO_SAVED: 'memo:saved',
} as const;

export const POLL_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
];

export const MAX_POLL_OPTIONS = 8;
export const MAX_MESSAGE_LENGTH = 500;
export const MAX_MEMO_LENGTH = 1000;
export const MAX_NICKNAME_LENGTH = 20;

import { Poll } from '../types';

export const DEMO_POLLS: Poll[] = [
  {
    id: 'demo-1',
    title: '점심 메뉴 투표',
    description: '오늘 점심으로 무엇을 먹을까요?',
    options: [
      { id: 'opt1', text: '한식', votes: 0, percentage: 0 },
      { id: 'opt2', text: '중식', votes: 0, percentage: 0 },
      { id: 'opt3', text: '일식', votes: 0, percentage: 0 },
      { id: 'opt4', text: '양식', votes: 0, percentage: 0 },
    ],
    createdBy: 'system',
    createdAt: new Date(),
    isActive: true,
    totalVotes: 0,
  },
  {
    id: 'demo-2',
    title: '프로젝트 우선순위',
    description: '다음 스프린트에서 우선적으로 진행할 기능은?',
    options: [
      { id: 'opt1', text: '사용자 인증 개선', votes: 0, percentage: 0 },
      { id: 'opt2', text: '실시간 알림', votes: 0, percentage: 0 },
      { id: 'opt3', text: '모바일 최적화', votes: 0, percentage: 0 },
    ],
    createdBy: 'system',
    createdAt: new Date(),
    isActive: true,
    totalVotes: 0,
  },
];
