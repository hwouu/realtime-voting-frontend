// src/types/index.ts

export interface User {
  id: string;
  nickname: string;
  isOnline: boolean;
  joinedAt: Date;
}

export interface VoteOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  options: VoteOption[];
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
  totalVotes: number;
}

export interface Vote {
  pollId: string;
  optionId: string;
  userId: string;
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'system' | 'vote_update';
}

export interface UserMemo {
  id: string;
  userId: string;
  pollId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocketEvents {
  // Client to Server
  'user:join': { nickname: string };
  'poll:create': Omit<Poll, 'id' | 'createdAt' | 'totalVotes'>;
  'vote:cast': { pollId: string; optionId: string };
  'chat:message': { message: string };
  'memo:save': Omit<UserMemo, 'id' | 'createdAt' | 'updatedAt'>;
  
  // Server to Client
  'user:joined': User;
  'user:left': { userId: string };
  'poll:created': Poll;
  'poll:updated': Poll;
  'vote:result': { pollId: string; results: VoteOption[] };
  'chat:message_received': ChatMessage;
  'users:online': User[];
  'memo:saved': UserMemo;
}

export interface AppState {
  currentUser: User | null;
  polls: Poll[];
  activePoll: Poll | null;
  onlineUsers: User[];
  chatMessages: ChatMessage[];
  userMemos: UserMemo[];
  isConnected: boolean;
}

export type SocketEventKey = keyof SocketEvents;
