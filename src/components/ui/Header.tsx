// src/components/ui/Header.tsx
/**
 * 상대 파일 경로: src/components/ui/Header.tsx
 * 애플리케이션 헤더 컴포넌트 - 백엔드 API 스키마와 통합
 */

import { useState } from 'react';
import { Plus, Users, Wifi, WifiOff, Vote, Menu, X, LogOut } from 'lucide-react';
import type { User } from '../../types';
import { useAppStore } from '../../stores/useAppStore';
import { wsService } from '../../services/websocket';

interface HeaderProps {
  user: User;
  isConnected: boolean;
  onCreatePoll: () => void;
}

export default function Header({ user, isConnected, onCreatePoll }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { onlineUsers, actions } = useAppStore();

  // 로그아웃 처리
  const handleLogout = () => {
    // WebSocket 연결 해제
    wsService.disconnect();
    
    // 로컬 스토리지에서 토큰 제거
    localStorage.removeItem('auth_token');
    
    // 상태 초기화
    actions.resetState();
    
    // 페이지 새로고침
    window.location.reload();
  };

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
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                실시간 투표
              </h1>
              <p className="text-xs text-slate-400">Network Project</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* 사용자 정보 */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-600/30">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user.nickname.charAt(0).toUpperCase()}
                </div>
                <span className="text-slate-300 text-sm font-medium">{user.nickname}</span>
              </div>
            </div>

            {/* 온라인 사용자 수 */}
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800/30 rounded-lg border border-slate-600/20">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-300">
                {onlineUsers.length}명 접속
              </span>
            </div>

            {/* Connection Status */}
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border ${
              isConnected 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-red-500/10 text-red-400 border-red-500/20'
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

            {/* 투표 생성 버튼 */}
            <button
              onClick={onCreatePoll}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/25"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">투표 생성</span>
            </button>

            {/* 로그아웃 버튼 */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-slate-400 hover:text-red-400 px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-all duration-200"
              title="로그아웃"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-slate-300 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700/50 py-4 space-y-4">
            {/* 사용자 정보 */}
            <div className="flex items-center space-x-3 px-2">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {user.nickname.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-slate-300 font-medium">{user.nickname}</div>
                <div className="text-xs text-slate-500">
                  {onlineUsers.length}명 접속 중
                </div>
              </div>
            </div>

            {/* 연결 상태 */}
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg mx-2 ${
              isConnected 
                ? 'bg-emerald-500/10 text-emerald-400' 
                : 'bg-red-500/10 text-red-400'
            }`}>
              {isConnected ? (
                <Wifi className="w-4 h-4" />
              ) : (
                <WifiOff className="w-4 h-4" />
              )}
              <span className="text-sm">
                {isConnected ? '연결됨' : '연결 끊김'}
              </span>
            </div>

            {/* 모바일 메뉴 버튼들 */}
            <div className="space-y-2 px-2">
              <button
                onClick={() => {
                  onCreatePoll();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-3 rounded-lg transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">투표 생성</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 text-red-400 hover:bg-red-500/10 px-4 py-3 rounded-lg transition-all duration-200 border border-red-500/20"
              >
                <LogOut className="w-4 h-4" />
                <span>로그아웃</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
