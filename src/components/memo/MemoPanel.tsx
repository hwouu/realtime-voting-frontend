// src/components/memo/MemoPanel.tsx
import { useState, useEffect } from 'react';
import { Save, FileText, Clock } from 'lucide-react';
// import type { UserMemo } from '../../types'; // 현재 사용하지 않음

interface MemoPanelProps {
  pollId?: string;
  onSaveMemo?: (content: string) => void;
}

export default function MemoPanel({ pollId, onSaveMemo }: MemoPanelProps) {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load memo content from localStorage (임시)
  useEffect(() => {
    if (pollId) {
      const savedMemo = localStorage.getItem(`memo_${pollId}`);
      if (savedMemo) {
        setContent(savedMemo);
      }
    }
  }, [pollId]);

  const handleSave = async () => {
    if (!content.trim()) return;

    setIsSaving(true);
    
    // Save to localStorage temporarily
    if (pollId) {
      localStorage.setItem(`memo_${pollId}`, content);
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    if (onSaveMemo) {
      onSaveMemo(content.trim());
    }

    setLastSaved(new Date());
    setIsSaving(false);
  };

  const formatLastSaved = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

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
            <p className="text-xs text-slate-500">생각을 자유롭게 기록하세요</p>
          </div>
        </div>
        {lastSaved && (
          <div className="flex items-center space-x-1 text-xs text-slate-500">
            <Clock className="w-3 h-3" />
            <span>{formatLastSaved(lastSaved)}</span>
          </div>
        )}
      </div>

      {/* Memo Content */}
      <div className="flex-1 p-4 flex flex-col">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            pollId 
              ? "이 투표에 대한 생각을 기록해보세요..."
              : "투표를 선택하면 메모를 작성할 수 있습니다."
          }
          className="flex-1 w-full bg-slate-700/30 border border-slate-600/30 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 resize-none p-3 text-sm scrollbar-thin"
          maxLength={1000}
          disabled={!pollId}
        />

        {/* Character Count */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-slate-500">
            {content.length}/1000자
          </span>
          {content.length > 900 && (
            <span className="text-xs text-yellow-400">
              {1000 - content.length}자 남음
            </span>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="p-4 border-t border-slate-700/50">
        <button
          onClick={handleSave}
          disabled={!content.trim() || isSaving || !pollId}
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
              <span>메모 저장</span>
            </>
          )}
        </button>
      </div>

      {/* Tips */}
      {!pollId && (
        <div className="p-4 bg-slate-700/20 rounded-b-2xl">
          <div className="text-center">
            <p className="text-xs text-slate-500">
              💡 투표를 선택하면 해당 투표에 대한<br />
              개인적인 생각을 메모로 남길 수 있습니다
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
