// src/types/index.ts
/**
 * 백엔드 API와 일치하는 타입 정의
 * FastAPI 백엔드의 Pydantic 스키마와 매핑
 */

// 기본 응답 타입
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 사용자 관련 타입
export interface User {
  id: string;
  nickname: string;
  is_online: boolean;
  joined_at: string; // ISO 날짜 문자열
  last_seen?: string;
  avatar_url?: string;
  bio?: string;
}

export interface UserCreateRequest {
  nickname: string;
}

export interface UserLoginRequest {
  nickname: string;
}

export interface UserLoginResponse {
  user: User;
  token: string;
  message: string;
}

// 투표 관련 타입
export interface VoteOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

export interface PollCreateRequest {
  title: string;
  description?: string;
  options: string[];
  ends_at?: string; // ISO 날짜 문자열
}

// 호환성을 위한 별칭 (PollOption은 VoteOption과 동일)
export type PollOption = VoteOption;

export interface Poll {
  id: string;
  title: string;
  description?: string;
  options: VoteOption[];
  created_by: string;
  created_at: string; // ISO 날짜 문자열
  ends_at?: string;
  is_active: boolean;
  total_votes: number;
}

export interface PollListResponse {
  polls: Poll[];
  total: number;
  page: number;
  per_page: number;
}

export interface VoteRequest {
  option_id: string;
}

export interface VoteResponse {
  message: string;
  poll: Poll;
}

// 채팅 관련 타입
export interface ChatMessage {
  id: string;
  message: string;
  type: 'message' | 'system' | 'vote_update' | 'user_join' | 'user_leave' | 'poll_created';
  created_at: string; // ISO 날짜 문자열
  timestamp: string; // 프론트엔드 호환성을 위한 별칭
  user_id?: string;
  username: string;
  metadata?: Record<string, unknown>;
}

export interface ChatMessageCreateRequest {
  message: string;
}

export interface ChatMessageListResponse {
  messages: ChatMessage[];
  total: number;
  page: number;
  per_page: number;
}

// 메모 관련 타입
export interface UserMemo {
  id: string;
  content: string;
  user_id: string;
  poll_id?: string;
  created_at: string; // ISO 날짜 문자열
  updated_at: string; // ISO 날짜 문자열
}

export interface MemoCreateRequest {
  content: string;
  poll_id?: string;
}

export interface MemoUpdateRequest {
  content: string;
}

// WebSocket 이벤트 타입
export interface SocketEvents {
  // Client to Server
  'user:join': { nickname: string };
  'poll:create': PollCreateRequest;
  'vote:cast': { pollId: string; optionId: string };
  'chat:message': { message: string };
  'memo:save': Omit<UserMemo, 'id' | 'created_at' | 'updated_at'>;
  
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

// 애플리케이션 상태 타입
export interface AppState {
  currentUser: User | null;
  polls: Poll[];
  activePoll: Poll | null;
  onlineUsers: User[];
  chatMessages: ChatMessage[];
  userMemos: UserMemo[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

// 유틸리티 타입
export type SocketEventKey = keyof SocketEvents;

// 날짜 헬퍼 타입
export interface DateHelper {
  toISOString(): string;
  toLocaleDateString(): string;
  toLocaleTimeString(): string;
}

// 컴포넌트 Props 타입
export interface ComponentWithChildren {
  children?: React.ReactNode;
}

export interface ComponentWithClassName {
  className?: string;
}

// 에러 타입
export interface AppError {
  message: string;
  code?: string;
  details?: string;
  timestamp: string;
}

// 로딩 상태 타입
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// 환경 변수 타입
export interface EnvConfig {
  VITE_API_BASE_URL: string;
  VITE_WS_URL: string;
  VITE_APP_NAME: string;
  VITE_APP_VERSION: string;
}
