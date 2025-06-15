// src/components/voting/VotingInterface.tsx
import { useState } from 'react';
import { ArrowLeft, Users, Clock, CheckCircle, Circle } from 'lucide-react';
import type { Poll } from '../../types';
import { POLL_COLORS } from '../../utils/constants';

interface VotingInterfaceProps {
  poll: Poll;
  onVote: (pollId: string, optionId: string) => void;
  onBack: () => void;
}

export default function VotingInterface({ poll, onVote, onBack }: VotingInterfaceProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = () => {
    if (!selectedOptionId || hasVoted) return;
    
    onVote(poll.id, selectedOptionId);
    setHasVoted(true);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return '방금 전';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    return `${Math.floor(diffInSeconds / 86400)}일 전`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-100">{poll.title}</h2>
          <p className="text-slate-400 mt-1">{poll.description}</p>
        </div>
      </div>

      {/* Poll Info */}
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
            <div className={`w-2 h-2 rounded-full ${poll.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
            <span className={`text-sm font-medium ${poll.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
              {poll.isActive ? '진행중' : '종료됨'}
            </span>
          </div>
        </div>

        {/* Voting Options */}
        <div className="space-y-4">
          {poll.options.map((option, index) => {
            const isSelected = selectedOptionId === option.id;
            const color = POLL_COLORS[index % POLL_COLORS.length];
            
            return (
              <div
                key={option.id}
                onClick={() => !hasVoted && setSelectedOptionId(option.id)}
                className={`relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-600/50 bg-slate-700/30 hover:border-slate-500 hover:bg-slate-700/50'
                } ${hasVoted ? 'cursor-default' : ''}`}
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

                {/* Progress Bar */}
                <div className="w-full bg-slate-600/30 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full transition-all duration-700 ease-out rounded-full"
                    style={{
                      width: `${option.percentage}%`,
                      backgroundColor: color,
                    }}
                  ></div>
                </div>

                {/* Selection Indicator */}
                {isSelected && !hasVoted && (
                  <div className="absolute inset-0 bg-blue-500/5 rounded-xl pointer-events-none"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Vote Button */}
        {!hasVoted && (
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <button
              onClick={handleVote}
              disabled={!selectedOptionId}
              className="w-full btn-primary bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {selectedOptionId ? '투표하기' : '선택지를 선택해주세요'}
            </button>
          </div>
        )}

        {/* Voted State */}
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

      {/* Real-time Updates Indicator */}
      <div className="flex items-center justify-center space-x-2 text-slate-500">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        <span className="text-sm">실시간 업데이트 중</span>
      </div>
    </div>
  );
}
