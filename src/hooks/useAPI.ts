// src/hooks/useAPI.ts
/**
 * API 호출을 위한 커스텀 훅
 * 로딩, 에러 처리, 캐싱 등의 기능 제공
 */

import { useState, useCallback } from 'react';
import { apiService } from '../services/api';
import { useAppStore } from '../stores/useAppStore';
import type { APIResponse } from '../types';

interface UseAPIOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  showGlobalError?: boolean;
}

export function useAPI<T = any>(options: UseAPIOptions<T> = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { actions } = useAppStore();

  const {
    onSuccess,
    onError,
    showGlobalError = true
  } = options;

  const execute = useCallback(async <R = T>(
    apiCall: () => Promise<APIResponse<R>>
  ): Promise<R | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall();

      if (response.success && response.data) {
        onSuccess?.(response.data as unknown as T);
        return response.data;
      } else {
        const errorMessage = response.error || 'API 호출 실패';
        setError(errorMessage);
        onError?.(errorMessage);
        
        if (showGlobalError) {
          actions.setError(errorMessage);
        }
        
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
      setError(errorMessage);
      onError?.(errorMessage);
      
      if (showGlobalError) {
        actions.setError(errorMessage);
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError, showGlobalError, actions]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    clearError,
  };
}

// 특정 API 호출을 위한 헬퍼 훅들
export function useLogin() {
  const { actions } = useAppStore();
  
  return useAPI({
    onSuccess: (data: { user: any; token: string }) => {
      actions.setCurrentUser(data.user);
      apiService.setToken(data.token);
      localStorage.setItem('auth_token', data.token);
    },
  });
}

export function usePolls() {
  const { actions } = useAppStore();
  
  return useAPI({
    onSuccess: (polls) => {
      actions.setPolls(polls);
    },
  });
}

export function useCreatePoll() {
  const { actions } = useAppStore();
  
  return useAPI({
    onSuccess: (poll) => {
      actions.addPoll(poll);
    },
  });
}

export function useVote() {
  const { actions } = useAppStore();
  
  return useAPI({
    onSuccess: (data: { poll: any }) => {
      actions.updatePoll(data.poll);
    },
  });
}

export function useChatMessages() {
  const { actions } = useAppStore();
  
  return useAPI({
    onSuccess: (messages) => {
      actions.setChatMessages(messages);
    },
  });
}

export function useMemos() {
  const { actions } = useAppStore();
  
  return useAPI({
    onSuccess: (memos) => {
      actions.setUserMemos(memos);
    },
  });
}
