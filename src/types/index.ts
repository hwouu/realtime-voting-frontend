// src/types/index.ts

export interface User {
  id: string;
  nickname: string;
  isOnline: boolean;
  joinedAt: Date;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

export interface Poll {
  id: string;             // vote_id
  title: string;
  description: string;
  totalVotes: number;     // total_votes
  createdAt: Date;        // created_at
  optionCount: number;    // option_count
  isActive: boolean;      // status === '진행중'
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
  'vote:result': { pollId: string; results: PollOption[] };
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
