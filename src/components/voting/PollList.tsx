// src/components/voting/PollList.tsx
import { Clock, Users, BarChart3, Play, Lock } from 'lucide-react';
import type { Poll } from '../../types';

interface PollListProps {
  polls: Poll[];
  onSelectPoll: (poll: Poll) => void;
}

export default function PollList({ polls, onSelectPoll }: PollListProps) {
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">진행 중인 투표</h2>
          <p className="text-slate-400 mt-1">참여하고 싶은 투표를 선택하세요</p>
        </div>
        <div className="text-sm text-slate-500">
          총 {polls.length}개의 투표
        </div>
      </div>

      {/* Poll Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {polls.map((poll) => (
          <div
            key={poll.id}
            onClick={() => onSelectPoll(poll)}
            className="card-gradient bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700/50 p-6 transition-all duration-300 hover:shadow-2xl hover:border-blue-500/30 cursor-pointer transform hover:scale-105 group"
          >
            {/* Poll Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
                    {poll.title}
                  </h3>
                  {poll.isPublic === false && (
                    <div className="flex items-center justify-center w-6 h-6 bg-orange-500/20 rounded-lg">
                      <Lock className="w-3 h-3 text-orange-400" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                  {poll.description}
                </p>
              </div>
              <div className="flex items-center justify-center w-10 h-10 bg-blue-500/20 rounded-xl ml-4">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
            </div>

            {/* Poll Stats */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-1 text-slate-400">
                <Users className="w-4 h-4" />
                <span className="text-sm">{poll.totalVotes}표</span>
              </div>
              <div className="flex items-center space-x-1 text-slate-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{formatTimeAgo(poll.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${poll.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                <span className={`text-sm ${poll.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {poll.isActive ? '진행중' : '종료됨'}
                </span>
              </div>
            </div>

            {/* Options Count */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {poll.optionCount}개의 선택지
              </span>
              <div className="flex items-center space-x-1 text-blue-400 group-hover:text-blue-300 transition-colors">
                <Play className="w-3 h-3" />
                <span className="text-xs font-medium">참여하기</span>
              </div>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {polls.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-400 mb-2">아직 진행 중인 투표가 없습니다</h3>
          <p className="text-slate-500">새로운 투표를 생성해서 시작해보세요!</p>
        </div>
      )}
    </div>
  );
}
