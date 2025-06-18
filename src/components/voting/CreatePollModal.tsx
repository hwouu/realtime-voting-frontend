import { useState } from 'react';
import { X, Plus, Trash2, Lock, Unlock } from 'lucide-react';
import { MAX_POLL_OPTIONS } from '../../utils/constants';
import type { Poll } from '../../types';

interface Props {
  onClose: () => void;
  onPollCreated: (p: Poll) => void;
}

export default function CreatePollModal({ onClose, onPollCreated }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isPublic, setIsPublic] = useState(true);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addOption = () =>
    options.length < MAX_POLL_OPTIONS && setOptions([...options, '']);

  const removeOption = (i: number) =>
    options.length > 2 && setOptions(options.filter((_, idx) => idx !== i));

  const updateOption = (i: number, v: string) =>
    setOptions(opts => opts.map((o, idx) => (idx === i ? v : o)));

  /** 제출 */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedDesc  = description.trim();
    const validOpts    = options.map(o => o.trim()).filter(Boolean);
    const trimmedPass  = password.trim();

    if (!trimmedTitle || validOpts.length < 2) {
      setError('제목과 2개 이상의 선택지를 입력해 주세요.');
      return;
    }
    if (trimmedPass.length < 4) {
      setError('비밀번호를 4글자 이상 입력해 주세요.');
      return;
    }

    setLoading(true);
    try {
      const api = import.meta.env.VITE_SERVER_API_URL;
      const r = await fetch(api, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trimmedTitle,
          description: trimmedDesc || null,
          options: validOpts,
          is_public: isPublic,
          password: trimmedPass,
        }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);

      /** 서버에서 오는 건 vote_id 하나뿐 */
      const { vote_id } = await r.json();

      const newPoll: Poll = {
        id:          vote_id,
        title:       trimmedTitle,
        description: trimmedDesc,
        totalVotes:  0,
        createdAt:   new Date(),      // Date 객체 그대로
        optionCount: validOpts.length,
        isActive:    true,
        isPublic,
      };

      onPollCreated(newPoll);  // App의 setPolls([...])   ← 제목 정상!
      onClose();
    } catch (e) {
      console.error(e);
      setError('생성 실패, 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    title.trim() !== '' &&
    options.filter(o => o.trim()).length >= 2 &&
    password.trim().length >= 4;
  
  /** ───────────────────────── JSX ──────────────────────── */
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-6 w-full max-w-3xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-100">새 투표 만들기</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 제목 */}
          <div>
            <label className="text-sm font-semibold text-slate-300">
              제목 <span className="text-red-400">*</span>
            </label>
            <input
              className="w-full mt-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-slate-100"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="text-sm font-semibold text-slate-300">설명 (선택)</label>
            <textarea
              className="w-full mt-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-slate-100 resize-none"
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={500}
            />
          </div>

          {/* 공개 / 비공개 */}
          <div>
            <label className="text-sm font-semibold text-slate-300">공개 설정</label>
            <div className="flex space-x-3 mt-1">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex-1 px-4 py-3 rounded-xl border ${
                  isPublic
                    ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                    : 'border-slate-600 bg-slate-700 text-slate-400'
                }`}
              >
                <Unlock className="inline w-4 h-4 mr-1" />
                공개
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex-1 px-4 py-3 rounded-xl border ${
                  !isPublic
                    ? 'border-orange-500 bg-orange-500/10 text-orange-300'
                    : 'border-slate-600 bg-slate-700 text-slate-400'
                }`}
              >
                <Lock className="inline w-4 h-4 mr-1" />
                비공개
              </button>
            </div>
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="text-sm font-semibold text-slate-300">
              비밀번호 <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              className="w-full mt-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-slate-100"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={4}
              maxLength={20}
              required
            />
          </div>

          {/* 옵션들 */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-semibold text-slate-300">
                선택지 <span className="text-red-400">*</span>
              </span>
              <span className="text-xs text-slate-500">
                {options.length}/{MAX_POLL_OPTIONS}
              </span>
            </div>

            {/* 각 옵션 입력 */}
            <div className="space-y-3">
              {options.map((opt, idx) => (
                <div key={idx} className="flex space-x-2">
                  <input
                    className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-slate-100"
                    value={opt}
                    onChange={e => updateOption(idx, e.target.value)}
                    maxLength={100}
                    required
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* 옵션 추가 버튼 */}
            {options.length < MAX_POLL_OPTIONS && (
              <button
                type="button"
                onClick={addOption}
                className="w-full mt-2 py-2 border-2 border-dashed border-slate-600 text-slate-400 rounded-xl hover:border-blue-500 hover:text-blue-400"
              >
                <Plus className="inline w-4 h-4 mr-1" />
                옵션 추가
              </button>
            )}
          </div>

          {/* 에러 메시지 */}
          {error && <p className="text-red-400">{error}</p>}

          {/* 제출 / 취소 버튼 */}
          <footer className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-xl"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-xl disabled:opacity-50"
            >
              {loading ? '생성 중…' : '투표 생성'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}