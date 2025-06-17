// src/services/websocket.ts
/**
 * WebSocket 통신을 위한 서비스 계층
 * Socket.IO 클라이언트를 통한 실시간 통신 관리
 */

import { io, Socket } from 'socket.io-client';
import type { 
  User, 
  Poll, 
  ChatMessage, 
  UserMemo,
  SocketEvents,
  VoteOption,
  PollCreateRequest
} from '../types';

type SocketEventCallback<T = unknown> = (data: T) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventListeners: Map<string, SocketEventCallback[]> = new Map();

  constructor() {
    this.setupConnectionHandlers();
  }

  // WebSocket 연결
  connect(token?: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8000';
        
        this.socket = io(wsUrl, {
          auth: {
            token
          },
          transports: ['websocket'],
          upgrade: true,
          rememberUpgrade: true,
          timeout: 20000,
        });

        this.setupEventHandlers();

        this.socket.on('connect', () => {
          console.log('✅ WebSocket 연결 성공');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve(true);
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ WebSocket 연결 실패:', error);
          this.isConnected = false;
          reject(error);
        });

        // 5초 타임아웃
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('WebSocket 연결 타임아웃'));
          }
        }, 5000);

      } catch (error) {
        console.error('WebSocket 초기화 실패:', error);
        reject(error);
      }
    });
  }

  // WebSocket 연결 해제
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('🔌 WebSocket 연결 해제');
    }
  }

  // 이벤트 핸들러 설정
  private setupEventHandlers() {
    if (!this.socket) return;

    // 연결 상태 이벤트
    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket 연결 해제:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // 서버에서 연결을 끊은 경우 재연결 시도
        this.attemptReconnect();
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 WebSocket 재연결 성공 (시도 ${attemptNumber}회)`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ WebSocket 재연결 실패:', error);
      this.attemptReconnect();
    });

    // 비즈니스 로직 이벤트들
    this.setupBusinessEventHandlers();
  }

  // 비즈니스 로직 이벤트 핸들러
  private setupBusinessEventHandlers() {
    if (!this.socket) return;

    // 사용자 관련 이벤트
    this.socket.on('user:joined', (data: User) => {
      this.emitToListeners('user:joined', data);
    });

    this.socket.on('user:left', (data: { userId: string }) => {
      this.emitToListeners('user:left', data);
    });

    this.socket.on('users:online', (data: User[]) => {
      this.emitToListeners('users:online', data);
    });

    // 투표 관련 이벤트
    this.socket.on('poll:created', (data: Poll) => {
      this.emitToListeners('poll:created', data);
    });

    this.socket.on('poll:updated', (data: Poll) => {
      this.emitToListeners('poll:updated', data);
    });

    this.socket.on('vote:result', (data: { poll_id: string; results: VoteOption[] }) => {
      this.emitToListeners('vote:result', data);
    });

    // 채팅 관련 이벤트
    this.socket.on('chat:message_received', (data: ChatMessage) => {
      this.emitToListeners('chat:message_received', data);
    });

    // 메모 관련 이벤트
    this.socket.on('memo:saved', (data: UserMemo) => {
      this.emitToListeners('memo:saved', data);
    });
  }

  // 연결 상태 핸들러
  private setupConnectionHandlers() {
    // 브라우저 visibility API를 사용한 자동 재연결
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && !this.isConnected && this.socket) {
        this.attemptReconnect();
      }
    });
  }

  // 재연결 시도
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ 최대 재연결 시도 횟수 초과');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    console.log(`🔄 WebSocket 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts} (${delay}ms 후)`);

    setTimeout(() => {
      if (this.socket && !this.isConnected) {
        this.socket.connect();
      }
    }, delay);
  }

  // 이벤트 발송
  emit<T extends keyof SocketEvents>(event: T, data: SocketEvents[T]): void {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn(`WebSocket not connected. Cannot emit event: ${event}`);
    }
  }

  // 이벤트 리스너 등록
  on<T extends keyof SocketEvents>(
    event: T, 
    callback: (data: SocketEvents[T]) => void
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  // 이벤트 리스너 제거
  off<T extends keyof SocketEvents>(
    event: T, 
    callback: (data: SocketEvents[T]) => void
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // 내부 이벤트 발송
  private emitToListeners<T>(event: string, data: T): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Event listener error for ${event}:`, error);
        }
      });
    }
  }

  // 사용자 입장
  joinUser(nickname: string): void {
    this.emit('user:join', { nickname });
  }

  // 투표 생성
  createPoll(pollData: PollCreateRequest): void {
    this.emit('poll:create', pollData);
  }

  // 투표 참여
  castVote(pollId: string, optionId: string): void {
    this.emit('vote:cast', { pollId, optionId });
  }

  // 채팅 메시지 전송
  sendChatMessage(message: string): void {
    this.emit('chat:message', { message });
  }

  // 메모 저장
  saveMemo(memo: Omit<UserMemo, 'id' | 'createdAt' | 'updatedAt'>): void {
    this.emit('memo:save', memo);
  }

  // 연결 상태 확인
  get connected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // 소켓 ID 가져오기
  get socketId(): string | undefined {
    return this.socket?.id;
  }
}

// 싱글톤 인스턴스 export
export const wsService = new WebSocketService();
export default wsService;
