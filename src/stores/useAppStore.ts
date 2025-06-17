// src/stores/useAppStore.ts
/**
 * 애플리케이션 전역 상태 관리
 * React Context + useReducer를 사용한 상태 관리
 */

import { createContext, useContext, useReducer, ReactNode } from 'react';
import type { 
  AppState, 
  User, 
  Poll, 
  ChatMessage, 
  UserMemo,
  LoadingState 
} from '../types';

// 액션 타입 정의
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONNECTION_STATUS'; payload: boolean }
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'SET_POLLS'; payload: Poll[] }
  | { type: 'ADD_POLL'; payload: Poll }
  | { type: 'UPDATE_POLL'; payload: Poll }
  | { type: 'REMOVE_POLL'; payload: string }
  | { type: 'SET_ACTIVE_POLL'; payload: Poll | null }
  | { type: 'SET_ONLINE_USERS'; payload: User[] }
  | { type: 'ADD_ONLINE_USER'; payload: User }
  | { type: 'REMOVE_ONLINE_USER'; payload: string }
  | { type: 'SET_CHAT_MESSAGES'; payload: ChatMessage[] }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'CLEAR_CHAT_MESSAGES' }
  | { type: 'SET_USER_MEMOS'; payload: UserMemo[] }
  | { type: 'ADD_USER_MEMO'; payload: UserMemo }
  | { type: 'UPDATE_USER_MEMO'; payload: UserMemo }
  | { type: 'REMOVE_USER_MEMO'; payload: string }
  | { type: 'RESET_STATE' };

// 초기 상태
const initialState: AppState = {
  currentUser: null,
  polls: [],
  activePoll: null,
  onlineUsers: [],
  chatMessages: [],
  userMemos: [],
  isConnected: false,
  isLoading: false,
  error: null,
};

// 리듀서 함수
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        isConnected: action.payload,
      };

    case 'SET_CURRENT_USER':
      return {
        ...state,
        currentUser: action.payload,
      };

    case 'SET_POLLS':
      return {
        ...state,
        polls: action.payload,
      };

    case 'ADD_POLL':
      return {
        ...state,
        polls: [action.payload, ...state.polls],
      };

    case 'UPDATE_POLL':
      return {
        ...state,
        polls: state.polls.map(poll =>
          poll.id === action.payload.id ? action.payload : poll
        ),
        activePoll: state.activePoll?.id === action.payload.id 
          ? action.payload 
          : state.activePoll,
      };

    case 'REMOVE_POLL':
      return {
        ...state,
        polls: state.polls.filter(poll => poll.id !== action.payload),
        activePoll: state.activePoll?.id === action.payload 
          ? null 
          : state.activePoll,
      };

    case 'SET_ACTIVE_POLL':
      return {
        ...state,
        activePoll: action.payload,
      };

    case 'SET_ONLINE_USERS':
      return {
        ...state,
        onlineUsers: action.payload,
      };

    case 'ADD_ONLINE_USER':
      return {
        ...state,
        onlineUsers: state.onlineUsers.some(user => user.id === action.payload.id)
          ? state.onlineUsers
          : [...state.onlineUsers, action.payload],
      };

    case 'REMOVE_ONLINE_USER':
      return {
        ...state,
        onlineUsers: state.onlineUsers.filter(user => user.id !== action.payload),
      };

    case 'SET_CHAT_MESSAGES':
      return {
        ...state,
        chatMessages: action.payload,
      };

    case 'ADD_CHAT_MESSAGE':
      return {
        ...state,
        chatMessages: [...state.chatMessages, action.payload],
      };

    case 'CLEAR_CHAT_MESSAGES':
      return {
        ...state,
        chatMessages: [],
      };

    case 'SET_USER_MEMOS':
      return {
        ...state,
        userMemos: action.payload,
      };

    case 'ADD_USER_MEMO':
      return {
        ...state,
        userMemos: [...state.userMemos, action.payload],
      };

    case 'UPDATE_USER_MEMO':
      return {
        ...state,
        userMemos: state.userMemos.map(memo =>
          memo.id === action.payload.id ? action.payload : memo
        ),
      };

    case 'REMOVE_USER_MEMO':
      return {
        ...state,
        userMemos: state.userMemos.filter(memo => memo.id !== action.payload),
      };

    case 'RESET_STATE':
      return {
        ...initialState,
        // 연결 상태는 유지
        isConnected: state.isConnected,
      };

    default:
      return state;
  }
}

// Context 생성
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider 컴포넌트
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook: 상태와 액션 사용
export function useAppStore() {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider');
  }

  const { state, dispatch } = context;

  // 액션 헬퍼 함수들
  const actions = {
    // 로딩 관련
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error }),
    clearError: () => dispatch({ type: 'SET_ERROR', payload: null }),

    // 연결 상태
    setConnectionStatus: (connected: boolean) => 
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: connected }),

    // 사용자 관련
    setCurrentUser: (user: User | null) => 
      dispatch({ type: 'SET_CURRENT_USER', payload: user }),

    // 투표 관련
    setPolls: (polls: Poll[]) => dispatch({ type: 'SET_POLLS', payload: polls }),
    addPoll: (poll: Poll) => dispatch({ type: 'ADD_POLL', payload: poll }),
    updatePoll: (poll: Poll) => dispatch({ type: 'UPDATE_POLL', payload: poll }),
    removePoll: (pollId: string) => dispatch({ type: 'REMOVE_POLL', payload: pollId }),
    setActivePoll: (poll: Poll | null) => 
      dispatch({ type: 'SET_ACTIVE_POLL', payload: poll }),

    // 온라인 사용자 관련
    setOnlineUsers: (users: User[]) => 
      dispatch({ type: 'SET_ONLINE_USERS', payload: users }),
    addOnlineUser: (user: User) => 
      dispatch({ type: 'ADD_ONLINE_USER', payload: user }),
    removeOnlineUser: (userId: string) => 
      dispatch({ type: 'REMOVE_ONLINE_USER', payload: userId }),

    // 채팅 관련
    setChatMessages: (messages: ChatMessage[]) => 
      dispatch({ type: 'SET_CHAT_MESSAGES', payload: messages }),
    addChatMessage: (message: ChatMessage) => 
      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: message }),
    clearChatMessages: () => dispatch({ type: 'CLEAR_CHAT_MESSAGES' }),

    // 메모 관련
    setUserMemos: (memos: UserMemo[]) => 
      dispatch({ type: 'SET_USER_MEMOS', payload: memos }),
    addUserMemo: (memo: UserMemo) => 
      dispatch({ type: 'ADD_USER_MEMO', payload: memo }),
    updateUserMemo: (memo: UserMemo) => 
      dispatch({ type: 'UPDATE_USER_MEMO', payload: memo }),
    removeUserMemo: (memoId: string) => 
      dispatch({ type: 'REMOVE_USER_MEMO', payload: memoId }),

    // 전체 상태 리셋
    resetState: () => dispatch({ type: 'RESET_STATE' }),
  };

  return {
    ...state,
    actions,
  };
}

// 개별 상태 선택을 위한 헬퍼 hooks
export function useCurrentUser() {
  const { currentUser } = useAppStore();
  return currentUser;
}

export function usePolls() {
  const { polls, activePoll, actions } = useAppStore();
  return {
    polls,
    activePoll,
    setActivePoll: actions.setActivePoll,
    addPoll: actions.addPoll,
    updatePoll: actions.updatePoll,
  };
}

export function useChatMessages() {
  const { chatMessages, actions } = useAppStore();
  return {
    messages: chatMessages,
    addMessage: actions.addChatMessage,
    clearMessages: actions.clearChatMessages,
  };
}

export function useOnlineUsers() {
  const { onlineUsers } = useAppStore();
  return onlineUsers;
}

export function useUserMemos() {
  const { userMemos, actions } = useAppStore();
  return {
    memos: userMemos,
    addMemo: actions.addUserMemo,
    updateMemo: actions.updateUserMemo,
    removeMemo: actions.removeUserMemo,
  };
}

export function useConnectionStatus() {
  const { isConnected, actions } = useAppStore();
  return {
    isConnected,
    setConnectionStatus: actions.setConnectionStatus,
  };
}

export function useAppError() {
  const { error, isLoading, actions } = useAppStore();
  return {
    error,
    isLoading,
    setError: actions.setError,
    clearError: actions.clearError,
    setLoading: actions.setLoading,
  };
}
