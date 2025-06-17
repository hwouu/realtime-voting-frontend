// src/App.tsx
<<<<<<< Updated upstream
import { useState } from 'react';
import type { User, Poll } from './types';
import { DEMO_POLLS } from './utils/constants';
=======
/**
 * 메인 애플리케이션 컴포넌트
 * 백엔드 API와 WebSocket 통합
 */

import { useEffect, useState } from 'react';
import { AppProvider } from './stores/useAppStore';
import { useAppStore } from './stores/useAppStore';
import { useWebSocket } from './hooks/useWebSocket';
import { useAPI } from './hooks/useAPI';
import { apiService } from './services/api';

// 컴포넌트 임포트
>>>>>>> Stashed changes
import LoginForm from './components/ui/LoginForm';
import Header from './components/ui/Header';
import PollList from './components/voting/PollList';
import VotingInterface from './components/voting/VotingInterface';
import ChatPanel from './components/chat/ChatPanel';
import MemoPanel from './components/memo/MemoPanel';
import CreatePollModal from './components/voting/CreatePollModal';
import type { PollCreateRequest } from './types';

<<<<<<< Updated upstream
function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [polls, setPolls] = useState<Poll[]>(DEMO_POLLS);
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // 로그인 처리
  const handleLogin = (nickname: string) => {
    const user: User = {
      id: `user_${Date.now()}`,
      nickname,
      isOnline: true,
      joinedAt: new Date(),
    };
    setCurrentUser(user);
    setIsConnected(true);
  };

  // 투표 생성
  const handleCreatePoll = (pollData: {
    title: string;
    description: string;
    options: string[];
  }) => {
    const newPoll: Poll = {
      id: `poll_${Date.now()}`,
      title: pollData.title,
      description: pollData.description,
      options: pollData.options.map((text, index) => ({
        id: `opt_${index}`,
        text,
        votes: 0,
        percentage: 0,
      })),
      createdBy: currentUser?.id || 'unknown',
      createdAt: new Date(),
      isActive: true,
      totalVotes: 0,
    };
    
    setPolls(prev => [newPoll, ...prev]);
    setShowCreateModal(false);
  };

  // 투표 선택
  const handleVote = (pollId: string, optionId: string) => {
    setPolls(prev => prev.map(poll => {
      if (poll.id === pollId) {
        const updatedOptions = poll.options.map(option => {
          if (option.id === optionId) {
            return { ...option, votes: option.votes + 1 };
          }
          return option;
        });
        
        const totalVotes = updatedOptions.reduce((sum, opt) => sum + opt.votes, 0);
        const optionsWithPercentage = updatedOptions.map(option => ({
          ...option,
          percentage: totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0,
        }));
        
        const updatedPoll = {
          ...poll,
          options: optionsWithPercentage,
          totalVotes,
        };

        // 활성 투표도 업데이트
        if (activePoll?.id === pollId) {
          setActivePoll(updatedPoll);
        }

        return updatedPoll;
      }
      return poll;
    }));
  };

  // 활성 투표 선택 시 최신 데이터로 업데이트
  const handleSelectPoll = (poll: Poll) => {
    const latestPoll = polls.find(p => p.id === poll.id) || poll;
    setActivePoll(latestPoll);
  };

  // 로그인하지 않은 경우 로그인 폼 표시
  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header 
        user={currentUser} 
        isConnected={isConnected}
        onCreatePoll={() => setShowCreateModal(true)}
      />
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 투표 목록 및 인터페이스 */}
          <div className="lg:col-span-2 space-y-6">
            {!activePoll ? (
              <PollList 
                polls={polls}
                onSelectPoll={handleSelectPoll}
              />
            ) : (
              <VotingInterface 
                poll={activePoll}
                onVote={handleVote}
                onBack={() => setActivePoll(null)}
              />
            )}
          </div>
          
          {/* 사이드 패널 */}
          <div className="space-y-6">
            <ChatPanel />
            <MemoPanel pollId={activePoll?.id} />
          </div>
        </div>
      </div>
      
      {showCreateModal && (
        <CreatePollModal 
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreatePoll}
        />
      )}
=======
// 로딩 스피너 컴포넌트
function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 flex items-center space-x-3">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-slate-300">로딩 중...</span>
      </div>
>>>>>>> Stashed changes
    </div>
  );
}

<<<<<<< Updated upstream
export default App;
=======
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
  const { connect: connectWebSocket } = useWebSocket();
  const { execute: executeLogin } = useAPI();
  const { execute: executeGetPolls } = useAPI();
  const { execute: executeCreatePoll } = useAPI();

  // 앱 초기화
  useEffect(() => {
    // 저장된 토큰으로 자동 로그인 시도
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      apiService.setToken(savedToken);
      
      // 현재 사용자 정보 가져오기
      executeLogin(() => apiService.getCurrentUser())
        .then((user) => {
          if (user) {
            actions.setCurrentUser(user);
            // WebSocket 연결
            connectWebSocket(savedToken);
            // 투표 목록 가져오기
            loadPolls();
          }
        })
        .catch(() => {
          // 토큰이 만료된 경우 제거
          localStorage.removeItem('auth_token');
          apiService.setToken('');
        });
    }
  }, []);

  // 투표 목록 로드
  const loadPolls = async () => {
    const polls = await executeGetPolls(() => apiService.getPolls());
    if (polls) {
      actions.setPolls(polls);
    }
  };

  // 로그인 처리
  const handleLogin = async (nickname: string) => {
    const response = await executeLogin(() => apiService.login(nickname));
    
    if (response) {
      // WebSocket 연결
      await connectWebSocket(response.token);
      // 초기 데이터 로드
      await loadPolls();
    }
  };

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
                onCreatePoll={() => setShowCreateModal(true)}
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
          onCreatePoll={handleCreatePoll}
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
>>>>>>> Stashed changes
