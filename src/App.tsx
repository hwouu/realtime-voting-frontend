// src/App.tsx
/**
 * 메인 애플리케이션 컴포넌트
 * 백엔드 API와 WebSocket 통합
 */

import { useEffect, useState, useCallback } from 'react';
import { AppProvider } from './stores/useAppStore';
import { useAppStore } from './stores/useAppStore';
import { useWebSocket } from './hooks/useWebSocket';
import { useAPI } from './hooks/useAPI';
import { apiService } from './services/api';

// 컴포넌트 임포트
import LoginForm from './components/ui/LoginForm';
import Header from './components/ui/Header';
import PollList from './components/voting/PollList';
import VotingInterface from './components/voting/VotingInterface';
import ChatPanel from './components/chat/ChatPanel';
import MemoPanel from './components/memo/MemoPanel';
import CreatePollModal from './components/voting/CreatePollModal';
import type { PollCreateRequest } from './types';

// 로딩 스피너 컴포넌트
function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 flex items-center space-x-3">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-slate-300">로딩 중...</span>
      </div>
    </div>
  );
}

// 에러 경계 컴포넌트
function ErrorDisplay({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center max-w-md">
        <div className="text-red-400 text-lg mb-4 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
          {error}
        </div>
        <button
          onClick={onRetry}
          className="btn-primary bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}

// 메인 앱 컴포넌트
function AppContent() {
  const {
    currentUser,
    polls,
    activePoll,
    isConnected,
    isLoading,
    error,
    actions
  } = useAppStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const { connect: connectWebSocket } = useWebSocket();
  const { execute: executeLogin } = useAPI();
  const { execute: executeGetPolls } = useAPI();
  const { execute: executeCreatePoll } = useAPI();

  // 백엔드 서버 상태 확인 (임시 비활성화)
  useEffect(() => {
    // Health check 임시 비활성화 - 백엔드에 /api/health 엔드포인트가 없음
    console.log('Health check 건너뜀 - 백엔드 서버 실행 중');
    // const checkBackendHealth = async () => {
    //   try {
    //     console.log('Checking backend health...');
    //     const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/health`);
    //     console.log('Health check response:', response.status, response.statusText);
    //     if (response.ok) {
    //       const data = await response.json();
    //       console.log('Backend is healthy:', data);
    //     }
    //   } catch (error) {
    //     console.error('Backend health check failed:', error);
    //     // 백엔드 서버 연결 에러 시 경고만 표시과 UI는 정상 동작
    //     console.warn('백엔드 서버에 연결할 수 없습니다. 로그인 시 에러가 발생할 수 있습니다.');
    //   }
    // };
    // checkBackendHealth();
  }, [actions]);

  // 디버깅 정보 업데이트
  useEffect(() => {
    const info = {
      currentUser: currentUser ? currentUser.nickname : 'null',
      isConnected,
      isLoading,
      error: error || 'none',
      pollsCount: polls.length,
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
      wsUrl: import.meta.env.VITE_WS_URL
    };
    setDebugInfo(JSON.stringify(info, null, 2));
    console.log('App Debug Info:', info);
  }, [currentUser, isConnected, isLoading, error, polls]);

  // 투표 목록 로드
  const loadPolls = useCallback(async () => {
    console.log('Loading polls...');
    try {
      const response = await apiService.getPolls();
      if (response.success && response.data) {
        console.log('Polls loaded successfully:', response.data);
        actions.setPolls(response.data);
        actions.clearError(); // 오류 취소
      } else {
        console.log('Failed to load polls:', response.error);
        actions.setError(response.error || '투표 목록을 불러오는데 실패했습니다.');
        actions.setPolls([]);
      }
    } catch (error) {
      console.error('Error loading polls:', error);
      actions.setError('네트워크 오류: 서버에 연결할 수 없습니다.');
      actions.setPolls([]);
    }
  }, [actions]);

  // 로그인/회원가입 처리
  const handleLogin = useCallback(async (nickname: string, isSignUp: boolean = false) => {
    console.log(`Attempting ${isSignUp ? 'signup' : 'login'} for:`, nickname);
    try {
      let response;
      if (isSignUp) {
        // 회원가입
        console.log('Calling signUp API...');
        response = await apiService.signUp(nickname);
      } else {
        // 로그인
        console.log('Calling login API...');
        response = await apiService.login(nickname);
      }
      
      if (response.success && response.data) {
        console.log('Login/SignUp successful:', response);
        actions.setCurrentUser(response.data.user);
        actions.clearError();
        
        // WebSocket 연결 임시 비활성화 - 인증 문제로 인한 403 오류
        console.log('WebSocket 연결 건너뜀 - HTTP API만 사용');
        // await connectWebSocket(response.data.token);
        
        // 초기 데이터 로드
        console.log('Loading initial data...');
        await loadPolls();
      } else {
        console.log('Login/SignUp failed:', response.error);
        actions.setError(response.error || (isSignUp ? '회원가입에 실패했습니다.' : '로그인에 실패했습니다.'));
      }
    } catch (error) {
      console.error('로그인/회원가입 실패:', error);
      if (isSignUp) {
        actions.setError('회원가입에 실패했습니다. 닉네임이 이미 사용 중일 수 있습니다.');
      } else {
        actions.setError('로그인에 실패했습니다. 닉네임을 확인해주세요.');
      }
    }
  }, [loadPolls, actions]);

  // 앱 초기화
  useEffect(() => {
    // 저장된 토큰으로 자동 로그인 시도
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      console.log('Found saved token, attempting auto-login...');
      apiService.setToken(savedToken);
      
      // 현재 사용자 정보 가져오기
      apiService.getCurrentUser()
        .then((response) => {
          if (response.success && response.data) {
            console.log('Auto-login successful:', response.data);
            actions.setCurrentUser(response.data);
            // WebSocket 연결 임시 비활성화
            // connectWebSocket(savedToken);
            // 투표 목록 가져오기
            loadPolls();
          } else {
            console.log('Auto-login failed:', response.error);
            // 토큰이 만료된 경우 제거
            localStorage.removeItem('auth_token');
            apiService.setToken('');
          }
        })
        .catch((error) => {
          console.error('Auto-login error:', error);
          // 토큰이 만료된 경우 제거
          localStorage.removeItem('auth_token');
          apiService.setToken('');
        });
    }
  }, [actions, loadPolls]);

  // 투표 생성 처리
  const handleCreatePoll = async (pollData: {
    title: string;
    description: string;
    options: string[];
  }) => {
    const createRequest: PollCreateRequest = {
      title: pollData.title,
      description: pollData.description,
      options: pollData.options,
    };

    const newPoll = await executeCreatePoll(() => apiService.createPoll(createRequest));
    
    if (newPoll) {
      actions.addPoll(newPoll);
      actions.setActivePoll(newPoll);
      setShowCreateModal(false);
    }
  };

  // 투표 선택 처리
  const handleVote = async (pollId: string, optionId: string) => {
    try {
      const response = await apiService.vote(pollId, optionId);
      if (response.success) {
        // 투표 후 최신 투표 정보 가져오기
        const updatedPoll = await apiService.getPoll(pollId);
        if (updatedPoll.success && updatedPoll.data) {
          actions.updatePoll(updatedPoll.data);
        }
      }
    } catch (error) {
      console.error('투표 실패:', error);
      actions.setError('투표에 실패했습니다.');
    }
  };

  // 에러 재시도 처리
  const handleRetry = () => {
    actions.clearError();
    if (!currentUser) {
      window.location.reload();
    } else {
      loadPolls();
    }
  };

  // 에러 상태인 경우
  if (error) {
    return <ErrorDisplay error={error} onRetry={handleRetry} />;
  }

  // 로그인하지 않은 경우
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900">
        <LoginForm onLogin={handleLogin} />
        {isLoading && <LoadingSpinner />}
        
        {/* 디버깅 정보 - 개발 환경에서만 표시 */}
        {import.meta.env.DEV && import.meta.env.VITE_DEBUG && (
          <div className="fixed bottom-4 left-4 bg-slate-800 text-slate-300 p-4 rounded-lg max-w-md text-xs z-50">
            <h4 className="font-bold mb-2">디버깅 정보:</h4>
            <pre className="whitespace-pre-wrap">{debugInfo}</pre>
          </div>
        )}
      </div>
    );
  }

  // 메인 앱 UI
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* 헤더 */}
      <Header
        user={currentUser}
        isConnected={isConnected}
        onCreatePoll={() => setShowCreateModal(true)}
      />

      {/* 메인 컨텐츠 */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 투표 목록 */}
          <div className="lg:col-span-2">
            {activePoll ? (
              <VotingInterface
                poll={activePoll}
                onVote={handleVote}
                onBack={() => actions.setActivePoll(null)}
              />
            ) : (
              <PollList
                polls={polls}
                onSelectPoll={(poll) => actions.setActivePoll(poll)}
              />
            )}
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 채팅 패널 */}
            <ChatPanel />
            
            {/* 메모 패널 */}
            {activePoll && (
              <MemoPanel pollId={activePoll.id} />
            )}
          </div>
        </div>
      </div>

      {/* 투표 생성 모달 */}
      {showCreateModal && (
        <CreatePollModal
          onCreate={handleCreatePoll}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* 로딩 스피너 */}
      {isLoading && <LoadingSpinner />}
    </div>
  );
}

// 메인 App 컴포넌트 (Provider로 감싸기)
export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
