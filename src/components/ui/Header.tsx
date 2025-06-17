// src/components/ui/Header.tsx
import { useState } from 'react';
import { Plus, Users, Wifi, WifiOff, Vote, Menu, X, LogOut } from 'lucide-react';
import type { User } from '../../types';

interface HeaderProps {
  user: User;
  isConnected: boolean;
  onCreatePoll: () => void;
  onLogout: () => void;
}

export default function Header({ user, isConnected, onCreatePoll, onLogout }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="relative bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Vote className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gradient">실시간 투표</h1>
              <p className="text-xs text-slate-400">Network Project</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg ${
                isConnected 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {isConnected ? (
                  <Wifi className="w-4 h-4" />
                ) : (
                  <WifiOff className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {isConnected ? '연결됨' : '연결 끊김'}
                </span>
              </div>
            </div>

            {/* Online Users */}
            <div className="flex items-center space-x-2 text-slate-400">
              <Users className="w-4 h-4" />
              <span className="text-sm">3명 온라인</span>
            </div>

            {/* Create Poll Button */}
            <button
              onClick={onCreatePoll}
              className="btn-primary bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>투표 생성</span>
            </button>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {user.nickname.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-200">{user.nickname}</p>
                <p className="text-xs text-slate-400">온라인</p>
              </div>
              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 group"
                title="로그아웃"
              >
                <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-slate-400" />
            ) : (
              <Menu className="w-6 h-6 text-slate-400" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-700/50">
            <div className="space-y-4">
              {/* User Info */}
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-700/50">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {user.nickname.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{user.nickname}</p>
                  <div className="flex items-center space-x-2">
                    {isConnected ? (
                      <div className="flex items-center space-x-1 text-emerald-400">
                        <Wifi className="w-3 h-3" />
                        <span className="text-xs">연결됨</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-red-400">
                        <WifiOff className="w-3 h-3" />
                        <span className="text-xs">연결 끊김</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    onCreatePoll();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full btn-primary bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>투표 생성</span>
                </button>

                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 border border-red-500/20 hover:border-red-500/30"
                >
                  <LogOut className="w-4 h-4" />
                  <span>로그아웃</span>
                </button>

                <div className="flex items-center justify-center space-x-2 text-slate-400">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">3명 온라인</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Animated Connection Indicator */}
      <div className={`absolute bottom-0 left-0 h-0.5 transition-all duration-1000 ${
        isConnected ? 'w-full bg-gradient-to-r from-emerald-400 to-blue-500' : 'w-0'
      }`}></div>
    </header>
  );
}
