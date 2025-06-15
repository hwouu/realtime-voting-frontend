// src/App.tsx
import { useState } from 'react';
import type { User, Poll } from './types';
import { DEMO_POLLS } from './utils/constants';
import LoginForm from './components/ui/LoginForm';
import Header from './components/ui/Header';
import PollList from './components/voting/PollList';
import VotingInterface from './components/voting/VotingInterface';
import ChatPanel from './components/chat/ChatPanel';
import MemoPanel from './components/memo/MemoPanel';
import CreatePollModal from './components/voting/CreatePollModal';

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
    </div>
  );
}

export default App;
