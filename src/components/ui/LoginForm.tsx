// src/components/ui/LoginForm.tsx
import { useState } from 'react';
import { User, Vote } from 'lucide-react';

interface LoginFormProps {
  onLogin: (nickname: string, isSignUp?: boolean) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(true); // 기본값을 회원가입으로

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    
    setIsLoading(true);
    try {
      await onLogin(nickname.trim(), isSignUpMode);
    } catch (error) {
      console.error('로그인/회원가입 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/25">
            <Vote className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient mb-2">
            실시간 투표 플랫폼
          </h1>
          <p className="text-slate-400 text-lg">
            WebSocket 기반 실시간 상호작용
          </p>
        </div>

        {/* Login/SignUp Card */}
        <div className="card-gradient bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700/50 p-6 transition-all duration-300">
          {/* 모드 전환 탭 */}
          <div className="flex rounded-lg bg-slate-700/30 p-1 mb-6">
            <button
              type="button"
              onClick={() => setIsSignUpMode(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                isSignUpMode
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              회원가입
            </button>
            <button
              type="button"
              onClick={() => setIsSignUpMode(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                !isSignUpMode
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              로그인
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="nickname" className="block text-sm font-semibold text-slate-300 mb-2">
                닉네임
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={
                    isSignUpMode 
                      ? "사용할 닉네임을 입력하세요" 
                      : "등록된 닉네임을 입력하세요"
                  }
                  className="input-field-dark w-full px-4 py-3 pl-12 bg-slate-800/80 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  maxLength={20}
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {isSignUpMode 
                  ? "최대 20자까지 입력 가능합니다" 
                  : "기존에 등록한 닉네임을 입력하세요"}
              </p>
            </div>

            <button
              type="submit"
              disabled={!nickname.trim() || isLoading}
              className="w-full btn-primary bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  {isSignUpMode ? '가입 중...' : '로그인 중...'}
                </div>
              ) : (
                <>
                  {isSignUpMode ? '회원가입하고 입장' : '로그인하고 입장'}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-700"></div>
                </>
              )}
            </button>
          </form>

          {/* 모드 변경 안내 */}
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500">
              {isSignUpMode ? (
                <>
                  이미 계정이 있으신가요?{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUpMode(false)}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    로그인하기
                  </button>
                </>
              ) : (
                <>
                  처음 방문이신가요?{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUpMode(true)}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    회원가입하기
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">플랫폼 특징</h3>
            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                실시간 투표 및 결과 시각화
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                실시간 채팅 및 토론
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                개인 메모 기능
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-500">
            컴퓨터 네트워크 프로젝트 · 9팀
          </p>
        </div>
      </div>
    </div>
  );
}
