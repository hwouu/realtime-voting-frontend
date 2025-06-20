// src/App.tsx
import { useState, useEffect } from 'react';
import type { User, Poll } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import LoginForm from './components/ui/LoginForm';
import Header from './components/ui/Header';
import PollListContainer from './components/voting/PollListContainer';
import VotingInterface from './components/voting/VotingInterface';
import ChatPanel from './components/chat/ChatPanel';
import MemoPanel from './components/memo/MemoPanel';
import CreatePollModal from './components/voting/CreatePollModal';

function App() {
  const [savedNickname, setSavedNickname] = useLocalStorage<string>('voting_user_nickname', '');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [polls, setPolls] = useState<Poll[]>([]);

  const handleLogin = (nickname: string) => {
    const user: User = {
      id: `user_${Date.now()}`,
      nickname,
      isOnline: true,
      joinedAt: new Date(),
    };
    setCurrentUser(user);
    setSavedNickname(nickname);
    setIsConnected(true);
    console.log('사용자 로그인:', nickname);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSavedNickname('');
    setIsConnected(false);
    setActivePoll(null);
    setPolls([]);
    console.log('사용자 로그아웃');
  };

  const handleSelectPoll = (poll: Poll) => {
    setActivePoll({
      ...poll,
      options: [],
    });
  };

  const handleVote = (pollId: string, optionId: string) => {
    console.log(`사용자 ${currentUser?.nickname}가 ${pollId}에서 ${optionId}에 투표함`);
    setPolls(prevPolls =>
      prevPolls.map(poll =>
        poll.id === pollId
          ? { ...poll, totalVotes: poll.totalVotes + 1 }
          : poll
      )
    );
    if (activePoll && activePoll.id === pollId) {
      setActivePoll(prev => prev ? { ...prev, totalVotes: prev.totalVotes + 1 } : null);
    }
  };

  const loadPolls = async () => {
    try {
      const apiUrl = import.meta.env.VITE_SERVER_API_URL;
      console.log('📦 API URL:', apiUrl);

      if (!apiUrl) {
        console.warn('API URL이 설정되지 않았습니다. .env 파일을 확인하세요.');
        return;
      }

      const res = await fetch(apiUrl, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });

      console.log('📡 Fetch 응답 상태코드:', res.status);

      if (!res.ok) {
        console.error('투표 목록 불러오기 실패:', res.status);
        return;
      }

      const data = await res.json();
      console.log('📥 받은 데이터:', data);

      const mapped: Poll[] = data.map((item: any) => ({
        id: item.vote_id,
        title: item.title,
        description: item.description,
        totalVotes: item.total_votes,
        createdAt: new Date(item.created_at),
        optionCount: item.option_count,
        isActive: item.status === '진행중',
        isPublic: item.is_public,
      }));

      setPolls(mapped);
    } catch (err: any) {
      console.error('❌ Fetch 에러:', err);
      setPolls([]);
    }
  };

  const handlePollDeleted = (pollId: string) => {
    console.log('투표 삭제됨:', pollId);
    setPolls(prevPolls => prevPolls.filter(poll => poll.id !== pollId));
    if (activePoll && activePoll.id === pollId) {
      setActivePoll(null);
    }
  };

  const handleCreatePoll = (newPoll: Poll) => {
    console.log('새 투표 생성됨:', newPoll);
    setPolls(prevPolls => [newPoll, ...prevPolls]);
    setShowCreateModal(false);
    setActivePoll({
      ...newPoll,
      options: [],
    });
  };

  useEffect(() => {
    if (currentUser) {
      loadPolls();
    }
  }, [currentUser]);

  useEffect(() => {
    if (savedNickname && !currentUser) {
      console.log('저장된 닉네임으로 자동 로그인:', savedNickname);
      const user: User = {
        id: `user_${Date.now()}`,
        nickname: savedNickname,
        isOnline: true,
        joinedAt: new Date(),
      };
      setCurrentUser(user);
      setIsConnected(true);
    }
  }, [savedNickname, currentUser]);

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header
        user={currentUser}
        isConnected={isConnected}
        onCreatePoll={() => setShowCreateModal(true)}
        onLogout={handleLogout}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {!activePoll ? (
              <PollListContainer
                polls={polls}
                onSelectPoll={handleSelectPoll}
              />
            ) : (
              <VotingInterface
                poll={activePoll}
                onVote={handleVote}
                onBack={() => setActivePoll(null)}
                onPollDeleted={handlePollDeleted}
              />
            )}
          </div>
          <div className="space-y-6">
            {/* ✅ ChatPanel에 nickname 전달 */}
            <ChatPanel nickname={currentUser.nickname} />
            <MemoPanel pollId={activePoll?.id} />
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreatePollModal
          onClose={() => setShowCreateModal(false)}
          onPollCreated={handleCreatePoll}
        />
      )}
    </div>
  );
}

export default App;