// src/App.tsx
import { useState } from 'react';
import type { User, Poll } from './types';
import LoginForm from './components/ui/LoginForm';
import Header from './components/ui/Header';
import PollListContainer from './components/voting/PollListContainer';
import VotingInterface from './components/voting/VotingInterface';
import ChatPanel from './components/chat/ChatPanel';
import MemoPanel from './components/memo/MemoPanel';
import CreatePollModal from './components/voting/CreatePollModal';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

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

  const handleSelectPoll = (poll: Poll) => {
    setActivePoll({
      ...poll,
      options: [],
    });
  };

  const handleVote = (pollId: string, optionId: string) => {
    console.log(`사용자 ${currentUser?.nickname}가 ${pollId}에서 ${optionId}에 투표함`);
  };

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
          <div className="lg:col-span-2 space-y-6">
            {!activePoll ? (
              <PollListContainer 
                onSelectPoll={handleSelectPoll}
              />
            ) : (
              <VotingInterface 
                poll={activePoll}
                onBack={() => setActivePoll(null)}
              />
            )}
          </div>
          <div className="space-y-6">
            <ChatPanel />
            <MemoPanel pollId={activePoll?.id} />
          </div>
        </div>
      </div>
      
      {showCreateModal && (
        <CreatePollModal 
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}

export default App;