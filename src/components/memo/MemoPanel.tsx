// src/components/memo/MemoPanel.tsx
/**
 * 상대 파일 경로: src/components/memo/MemoPanel.tsx
 * 개인 메모 패널 컴포넌트 - 백엔드 API와 통합
 */

import { useState, useEffect, useCallback } from 'react';
import { Save, FileText, Clock, Trash2, Edit3 } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { useAPI } from '../../hooks/useAPI';
import { apiService } from '../../services/api';
import type { UserMemo } from '../../types';

interface MemoPanelProps {
  pollId: string;
}

export default function MemoPanel({ pollId }: MemoPanelProps) {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMemo, setCurrentMemo] = useState<UserMemo | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const { currentUser, userMemos, actions } = useAppStore();
  const { execute: executeGetMemos } = useAPI();
  const { execute: executeCreateMemo } = useAPI();
  const { execute: executeUpdateMemo } = useAPI();
  const { execute: executeDeleteMemo } = useAPI();

  // 컴포넌트 마운트 시 메모 로드
  useEffect(() => {
    if (currentUser && pollId) {
      loadMemos();
    }
  }, [currentUser, pollId, loadMemos]);

  // 현재 투표의 메모 찾기
  useEffect(() => {
    const memo = userMemos.find(m => m.poll_id === pollId);
    if (memo) {
      setCurrentMemo(memo);
      setContent(memo.content);
      setLastSaved(new Date(memo.updated_at));
    } else {
      setCurrentMemo(null);
      setContent('');
      setLastSaved(null);
    }
  }, [userMemos, pollId]);

  // 메모 목록 로드
  const loadMemos = useCallback(async () => {
    setIsLoading(true);
    try {
      await executeGetMemos(() => apiService.getMemos(pollId));
    } catch (error) {
      console.error('메모 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [executeGetMemos, pollId]);

  // 메모 저장/업데이트
  const handleSave = async () => {
    if (!content.trim() || !currentUser) return;

    setIsSaving(true);
    try {
      if (currentMemo) {
        // 기존 메모 업데이트
        const updatedMemo = await executeUpdateMemo(() => 
          apiService.updateMemo(currentMemo.id, content.trim())
        );
        if (updatedMemo) {
          actions.updateUserMemo(updatedMemo);
          setLastSaved(new Date(updatedMemo.updated_at));
        }
      } else {
        // 새 메모 생성
        const newMemo = await executeCreateMemo(() => 
          apiService.createMemo({
            content: content.trim(),
            poll_id: pollId,
          })
        );
        if (newMemo) {
          actions.addUserMemo(newMemo);
          setCurrentMemo(newMemo);
          setLastSaved(new Date(newMemo.created_at));
        }
      }
    } catch (error) {
      console.error('메모 저장 실패:', error);
      actions.setError('메모 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 메모 삭제
  const handleDelete = async () => {
    if (!currentMemo || !currentUser) return;

    if (!confirm('정말로 이 메모를 삭제하시겠습니까?')) return;

    try {
      const result = await executeDeleteMemo(() => 
        apiService.deleteMemo(currentMemo.id)
      );
      if (result) {
        actions.removeUserMemo(currentMemo.id);
        setCurrentMemo(null);
        setContent('');
        setLastSaved(null);
      }
    } catch (error) {
      console.error('메모 삭제 실패:', error);
      actions.setError('메모 삭제에 실패했습니다.');
    }
  };

  // 시간 포맷팅
  const formatLastSaved = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // 입력 변경 감지 (자동 저장을 위한 디바운싱 준비)
  const hasChanges = currentMemo ? content !== currentMemo.content : content.trim().length > 0;

  return (
    <div className="card-gradient bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700/50 p-0 h-80 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 bg-purple-500/20 rounded-lg">
            <FileText className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200">개인 메모</h3>
            <p className="text-xs text-slate-500">투표에 대한 생각을 기록하세요</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {lastSaved && (
            <div className="flex items-center space-x-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              <span>{formatLastSaved(lastSaved)}</span>
            </div>
          )}
          
          {currentMemo && (
            <button
              onClick={handleDelete}
              className="p-1.5 text-slate-400 hover:text-red-400 transition-colors rounded-md hover:bg-red-500/10"
              title="메모 삭제"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Memo Content */}
      <div className="flex-1 p-4 flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center space-x-2 text-slate-400">
              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">메모 불러오는 중...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="relative flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="이 투표에 대한 생각을 자유롭게 기록해보세요..."
                className="w-full h-full bg-slate-700/30 border border-slate-600/30 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 resize-none p-3 text-sm scrollbar-thin"
                maxLength={1000}
                disabled={!currentUser}
              />
              
              {/* 편집 표시 아이콘 */}
              {hasChanges && (
                <div className="absolute top-2 right-2 text-purple-400">
                  <Edit3 className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Character Count & Status */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500">
                  {content.length}/1000자
                </span>
                {hasChanges && (
                  <span className="text-xs text-purple-400 font-medium">
                    변경됨
                  </span>
                )}
              </div>
              
              {content.length > 900 && (
                <span className="text-xs text-yellow-400">
                  {1000 - content.length}자 남음
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-slate-700/50">
        {!currentUser ? (
          <div className="text-center text-slate-500 py-2">
            <p className="text-sm">로그인 후 메모를 작성할 수 있습니다</p>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none flex items-center justify-center space-x-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>저장 중...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{currentMemo ? '메모 업데이트' : '메모 저장'}</span>
                </>
              )}
            </button>
            
            {/* 메모 상태 표시 */}
            {currentMemo && !hasChanges && (
              <div className="text-center">
                <span className="text-xs text-emerald-400">✓ 저장완료</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tips */}
      {!isLoading && !currentMemo && !content && (
        <div className="p-4 bg-slate-700/20 rounded-b-2xl">
          <div className="text-center">
            <p className="text-xs text-slate-500">
              💡 투표에 대한 개인적인 의견이나 분석을<br />
              메모로 남겨서 나중에 참고할 수 있습니다
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
