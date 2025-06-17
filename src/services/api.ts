// src/services/api.ts
/**
 * 백엔드 API와의 통신을 위한 서비스 계층
 * FastAPI 백엔드의 엔드포인트들과 통신
 */

import type { 
  User, 
  Poll, 
  PollCreateRequest, 
  VoteRequest, 
  ChatMessage, 
  UserMemo,
  APIResponse,
  PollListResponse,
  ChatMessageListResponse
} from '../types';

// API 기본 설정
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class APIService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // 토큰 설정
  setToken(token: string) {
    this.token = token;
  }

  // 기본 fetch 래퍼
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        success: true,
        data,
        message: data.message
      };
    } catch (error) {
      console.error(`API Request Error [${endpoint}]:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // 인증 API
  async login(nickname: string): Promise<APIResponse<{ user: User; token: string }>> {
    return this.request<{ user: User; token: string }>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ nickname }),
    });
  }

  async signUp(nickname: string): Promise<APIResponse<{ user: User; token: string }>> {
    return this.request<{ user: User; token: string }>('/users/register', {
      method: 'POST',
      body: JSON.stringify({ nickname }),
    });
  }

  async getCurrentUser(): Promise<APIResponse<User>> {
    return this.request<User>('/users/me');
  }

  // 투표 API
  async getPolls(): Promise<APIResponse<Poll[]>> {
    const response = await this.request<PollListResponse>('/polls');
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data.polls || []
      };
    }
    return response as APIResponse<Poll[]>;
  }

  async getPoll(pollId: string): Promise<APIResponse<Poll>> {
    return this.request<Poll>(`/polls/${pollId}`);
  }

  async createPoll(pollData: PollCreateRequest): Promise<APIResponse<Poll>> {
    return this.request<Poll>('/polls', {
      method: 'POST',
      body: JSON.stringify(pollData),
    });
  }

  async vote(pollId: string, optionId: string): Promise<APIResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/polls/${pollId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ option_id: optionId }),
    });
  }

  async updatePoll(pollId: string, pollData: Partial<Poll>): Promise<APIResponse<Poll>> {
    return this.request<Poll>(`/polls/${pollId}`, {
      method: 'PUT',
      body: JSON.stringify(pollData),
    });
  }

  async deletePoll(pollId: string): Promise<APIResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/polls/${pollId}`, {
      method: 'DELETE',
    });
  }

  // 채팅 API
  async getChatMessages(limit = 50): Promise<APIResponse<ChatMessage[]>> {
    const response = await this.request<ChatMessageListResponse>(`/chat/messages?limit=${limit}`);
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data.messages || []
      };
    }
    return response as APIResponse<ChatMessage[]>;
  }

  async sendChatMessage(message: string): Promise<APIResponse<ChatMessage>> {
    return this.request<ChatMessage>('/chat/messages', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // 메모 API
  async getMemos(pollId?: string): Promise<APIResponse<UserMemo[]>> {
    const endpoint = pollId ? `/memos?poll_id=${pollId}` : '/memos';
    return this.request<UserMemo[]>(endpoint);
  }

  async createMemo(memoData: {
    content: string;
    poll_id?: string;
  }): Promise<APIResponse<UserMemo>> {
    return this.request<UserMemo>('/memos', {
      method: 'POST',
      body: JSON.stringify(memoData),
    });
  }

  async updateMemo(memoId: string, content: string): Promise<APIResponse<UserMemo>> {
    return this.request<UserMemo>(`/memos/${memoId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  async deleteMemo(memoId: string): Promise<APIResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/memos/${memoId}`, {
      method: 'DELETE',
    });
  }

  // 헬스 체크
  async healthCheck(): Promise<APIResponse<{ status: string }>> {
    return this.request<{ status: string }>('/health');
  }
}

// 싱글톤 인스턴스 export
export const apiService = new APIService();
export default apiService;
