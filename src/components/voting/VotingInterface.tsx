// src/components/voting/VotingInterface.tsx
// 상대 경로: /src/components/voting/VotingInterface.tsx
// 투표 인터페이스 컴포넌트 - 투표 내용 보기, 투표 참여, 비밀번호 검증 및 삭제 기능
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Users, Clock, CheckCircle, Circle, Lock, Trash2, Eye, EyeOff } from 'lucide-react';
import { POLL_COLORS } from '../../utils/constants';
import type { Poll } from '../../types';

interface VotingInterfaceProps {
  poll: Poll;
  onVote?: (pollId: string, optionId: string) => void;
  onBack: () => void;
  onPollDeleted?: (pollId: string) => void; // 새로 추가: 투표 삭제 콜백
}

export default function VotingInterface({ poll: initialPoll, onVote, onBack, onPollDeleted }: VotingInterfaceProps) {
  const [poll, setPoll] = useState<Poll>(initialPoll);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // 성공 모달 상태 추가
  const wsRef = useRef<WebSocket | null>(null);

  // 최초 로딩 시 서버에서 poll 상세 가져오기
  useEffect(() => {
    async function fetchPoll() {
      // 비공개 투표이고 비밀번호가 없으면 비밀번호 모달 표시
      if (initialPoll.isPublic === false && !password) {
        setShowPasswordModal(true);
        return;
      }

      const apiUrl = import.meta.env.VITE_SERVER_API_URL;
      
      // 백엔드에서 password 파라미터가 필수이므로 모든 경우에 전송
      // 공개 투표: 더미 값 전송 (백엔드에서 무시)
      // 비공개 투표: 실제 비밀번호 전송
      const queryParam = initialPoll.isPublic === false 
        ? `?password=${encodeURIComponent(password)}`
        : `?password=public_dummy`; // 공개 투표용 더미 값
      
      try {
        const res = await fetch(`${apiUrl}/${initialPoll.id}/options${queryParam}`, {
          headers: { "ngrok-skip-browser-warning": "true" }
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            setPasswordError('비밀번호가 틀렸습니다.');
            setShowPasswordModal(true);
            return;
          }
          throw new Error('투표 정보를 불러오지 못했습니다.');
        }

        const data = await res.json();
    
        const mappedOptions = data.options.map((opt: any) => ({
          id:   opt.option,   // opt.option === "라면" 등 원본 문자열
          text: opt.option,
          votes: opt.votes,
          percentage: data.total_votes > 0 ? (opt.votes / data.total_votes) * 100 : 0
        }));
    
        setPoll({
          ...initialPoll,
          totalVotes: data.total_votes,
          isActive: true, // 혹은 data.status === '진행중' 등으로 변경 가능
          options: mappedOptions
        });
        setShowPasswordModal(false);
        setPasswordError(null);
      } catch (error) {
        console.error('투표 정보 불러오기 실패:', error);
        setVoteError('투표 정보를 불러오지 못했습니다.');
      }
    }
    fetchPoll();
  }, [initialPoll.id, password]);

  useEffect(() => {
    const ws = new WebSocket(import.meta.env.VITE_WS_API_URL);
    wsRef.current = ws;

    ws.onopen = () => console.log("🔄 웹소켓 연결 성공");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // 투표 결과 업데이트 처리
      if (data.type === 'vote_update' && data.vote_id === poll.id) {
        const totalVotes = data.total_votes;
        const counts = data.counts;

        setPoll((prev) => {
          const updatedOptions = prev.options?.map((opt) => {
            const count = counts[opt.text] ?? 0;
            const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
            return { ...opt, votes: count, percentage };
          }) || [];

          return {
            ...prev,
            totalVotes,
            options: updatedOptions,
          };
        });
      }
      
      // 투표 삭제 처리
      if (data.type === 'vote_deleted' && data.vote_id === poll.id) {
        console.log('📢 투표가 삭제되었습니다:', data);
        
        // 상위 컴포넌트에 삭제 알림
        if (onPollDeleted) {
          onPollDeleted(poll.id);
        }
        
        setShowSuccessModal(true); // 성공 모달 표시
      }
    };

    ws.onerror = (err) => console.error("❌ 웹소켓 에러:", err);
    ws.onclose = () => console.log("🔌 웹소켓 연결 종료됨");

    return () => {
      ws.close();
    };
  }, [poll.id]);

  const handleVote = async () => {
    if (!selectedOptionId || hasVoted) return;
    setLoading(true);
    setVoteError(null);
    try {
      // WebSocket으로 투표 전송
      wsRef.current?.send(
        JSON.stringify({
          type: 'cast_vote',
          payload: {
            vote_id: poll.id,
            choice: selectedOptionId,
          },
        })
      );
      
      // 상위 컴포넌트에 투표 알림 (즉시 UI 업데이트용)
      if (onVote) {
        onVote(poll.id, selectedOptionId);
      }
      
      setHasVoted(true);
    } catch {
      setVoteError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim().length < 4) {
      setPasswordError('비밀번호를 4글자 이상 입력해 주세요.');
      return;
    }
    setPasswordError(null);
    // useEffect에서 password 변경을 감지하여 자동으로 fetchPoll 실행
  };

  const handleDeletePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deletePassword.trim().length < 4) {
      setDeleteError('비밀번호를 4글자 이상 입력해 주세요.');
      return;
    }
    
    setDeleteError(null);
    
    try {
      // 백엔드 API 명세에 따라 쿼리 스트링으로 password 전송
      // DELETE /votes/{vote_id}?password=xxxx
      const apiUrl = import.meta.env.VITE_SERVER_API_URL;
      const queryParam = `?password=${encodeURIComponent(deletePassword)}`;
      
      console.log(`🗑️ 투표 삭제 요청: ${apiUrl}/${poll.id}${queryParam}`);
      
      const res = await fetch(`${apiUrl}/${poll.id}${queryParam}`, {
        method: 'DELETE',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (res.ok) {
        const result = await res.json();
        console.log('✅ 투표 삭제 성공:', result);
        
        // 상위 컴포넌트에 삭제 알림
        if (onPollDeleted) {
          onPollDeleted(poll.id);
        }
        
        // 삭제 모달 닫고 성공 모달 표시
        setShowDeleteModal(false);
        setShowSuccessModal(true);
      } else if (res.status === 401) {
        setDeleteError('비밀번호가 틀렸습니다.');
      } else if (res.status === 404) {
        setDeleteError('존재하지 않는 투표입니다.');
      } else {
        const errorData = await res.text();
        console.error('❌ 투표 삭제 실패:', res.status, errorData);
        setDeleteError('삭제에 실패했습니다. 다시 시도해 주세요.');
      }
    } catch (error) {
      console.error('❌ 투표 삭제 요청 실패:', error);
      setDeleteError('네트워크 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  // 성공 모달에서 확인 버튼 클릭 시
  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    onBack(); // 투표 목록으로 이동
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return '방금 전';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    return `${Math.floor(diffInSeconds / 86400)}일 전`;
  };

  // 비밀번호 입력 모달이 표시되어야 하는 경우
  if (showPasswordModal) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card-gradient bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-sm">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-orange-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-100">비공개 투표</h2>
              <p className="text-slate-400 mt-2">이 투표를 보려면 비밀번호가 필요합니다.</p>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-300 mb-2">
                  비밀번호
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    className="w-full px-4 py-3 pr-12 bg-slate-800/80 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordError && (
                  <div className="mt-2 text-red-400 text-sm">{passwordError}</div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onBack}
                  className="flex-1 px-4 py-3 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-xl transition-all duration-300"
                >
                  돌아가기
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  확인
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold text-slate-100">{poll.title}</h2>
              {poll.isPublic === false && (
                <div className="flex items-center justify-center w-6 h-6 bg-orange-500/20 rounded-lg">
                  <Lock className="w-3 h-3 text-orange-400" />
                </div>
              )}
            </div>
            <p className="text-slate-400 mt-1">{poll.description}</p>
          </div>
        </div>
        {/* 삭제 버튼 */}
        <button
          onClick={() => setShowDeleteModal(true)}
          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          title="투표 삭제"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="card-gradient bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-slate-400">
              <Users className="w-4 h-4" />
              <span className="text-sm">{poll.totalVotes}명 참여</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{formatTimeAgo(poll.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${poll.isActive ? 'bg-emerald-500' : 'bg-green-500'}`}></div>
            <span className={`text-sm font-medium ${poll.isActive ? 'text-emerald-400' : 'text-green-400'}`}>진행중</span>
          </div>
        </div>

        <div className="space-y-4">
          {poll.options?.map((option, index) => {
            const isSelected = selectedOptionId === option.id;
            const color = POLL_COLORS[index % POLL_COLORS.length];

            return (
              <div
                key={option.id}
                onClick={() => !hasVoted && !loading && setSelectedOptionId(option.id)}
                className={`relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-600/50 bg-slate-700/30 hover:border-slate-500 hover:bg-slate-700/50'
                } ${hasVoted || loading ? 'cursor-default' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {hasVoted ? (
                      <CheckCircle className={`w-5 h-5 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                    ) : (
                      <Circle className={`w-5 h-5 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                    )}
                    <span className={`font-medium ${isSelected ? 'text-blue-300' : 'text-slate-200'}`}>
                      {option.text}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${isSelected ? 'text-blue-400' : 'text-slate-300'}`}>
                      {option.votes}표
                    </div>
                    <div className={`text-xs ${isSelected ? 'text-blue-400' : 'text-slate-500'}`}>
                      {option.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="w-full bg-slate-600/30 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full transition-all duration-700 ease-out rounded-full"
                    style={{
                      width: `${option.percentage}%`,
                      backgroundColor: color,
                    }}
                  ></div>
                </div>
                {isSelected && !hasVoted && (
                  <div className="absolute inset-0 bg-blue-500/5 rounded-xl pointer-events-none"></div>
                )}
              </div>
            );
          })}
        </div>

        {!hasVoted && (
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <button
              onClick={handleVote}
              disabled={!selectedOptionId || loading}
              className="w-full btn-primary bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading
                ? '투표 중...'
                : selectedOptionId
                ? '투표하기'
                : '선택지를 선택해주세요'}
            </button>
            {voteError && (
              <div className="mt-2 text-red-400 text-sm text-center">{voteError}</div>
            )}
          </div>
        )}

        {hasVoted && (
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">투표가 완료되었습니다!</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">
                실시간으로 업데이트되는 결과를 확인하세요
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 삭제 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card-gradient bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-sm">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-100">투표 삭제</h2>
                <p className="text-slate-400 mt-2">정말로 이 투표를 삭제하시겠습니까?</p>
                <p className="text-red-400 text-sm mt-1">삭제된 투표는 복구할 수 없습니다.</p>
              </div>

              <form onSubmit={handleDeletePoll}>
                <div className="mb-4">
                  <label htmlFor="deletePassword" className="block text-sm font-semibold text-slate-300 mb-2">
                    비밀번호 확인
                  </label>
                  <div className="relative">
                    <input
                      id="deletePassword"
                      type={showDeletePassword ? "text" : "password"}
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="투표 생성 시 설정한 비밀번호"
                      className="w-full px-4 py-3 pr-12 bg-slate-800/80 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowDeletePassword(!showDeletePassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showDeletePassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {deleteError && (
                    <div className="mt-2 text-red-400 text-sm">{deleteError}</div>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeletePassword('');
                      setDeleteError(null);
                    }}
                    className="flex-1 px-4 py-3 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-xl transition-all duration-300"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    삭제
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 성공 모달 */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card-gradient bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-sm">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-100">삭제 완료</h2>
                <p className="text-slate-400 mt-2">투표가 성공적으로 삭제되었습니다.</p>
                <p className="text-emerald-400 text-sm mt-2">실시간으로 모든 사용자에게 반영됩니다.</p>
              </div>

              <button
                onClick={handleSuccessConfirm}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 실시간 업데이트 표시 */}
      <div className="flex items-center justify-center space-x-2 text-slate-500">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        <span className="text-sm">실시간 업데이트 중</span>
      </div>
    </div>
  );
}
