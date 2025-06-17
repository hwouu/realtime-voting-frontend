// src/components/voting/CreatePollModal.tsx
import { useState } from 'react';
import { X, Plus, Trash2, Lock, Unlock } from 'lucide-react';
import { MAX_POLL_OPTIONS } from '../../utils/constants';

interface CreatePollModalProps {
  onClose: () => void;
}

export default function CreatePollModal({ onClose }: CreatePollModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isPublic, setIsPublic] = useState(true);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addOption = () => {
    if (options.length < MAX_POLL_OPTIONS) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validOptions = options.filter(opt => opt.trim() !== '');
    if (title.trim() === '' || validOptions.length < 2) {
      setError('투표 제목과 2개 이상의 선택지를 입력해 주세요.');
      return;
    }

    if (password.trim().length < 4) {
      setError('비밀번호를 4글자 이상 입력해 주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_SERVER_API_URL;
      console.log(apiUrl);
      const response = await fetch(`${apiUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          options: validOptions,
          is_public: isPublic,
          password: password.trim()
        }),
      });

      if (!response.ok) {
        console.log(response);
        setError('투표 생성에 실패했습니다.');
        return;
      }

      // 성공 시 모달 닫기
      onClose();
    } catch (error) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = 
    title.trim() !== '' && 
    options.filter(opt => opt.trim() !== '').length >= 2 &&
    password.trim().length >= 4;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="card-gradient bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-3xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h2 className="text-xl font-bold text-slate-100">새 투표 만들기</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-slate-300 mb-2">
                투표 제목 <span className="text-red-400">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="투표 제목을 입력하세요"
                className="input-field-dark w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                maxLength={100}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-slate-300 mb-2">
                설명 (선택사항)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="투표에 대한 자세한 설명을 입력하세요"
                className="input-field-dark w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 resize-none"
                rows={2}
                maxLength={500}
              />
            </div>

            {/* 공개/비공개 설정 */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                공개 설정
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                    isPublic
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-slate-600/50 bg-slate-800/80 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <Unlock className="w-4 h-4" />
                  <span className="font-medium">공개 투표</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                    !isPublic
                      ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                      : 'border-slate-600/50 bg-slate-800/80 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span className="font-medium">비공개 투표</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {isPublic
                  ? '모든 사람이 투표를 볼 수 있습니다.'
                  : '비밀번호를 아는 사람만 투표를 볼 수 있습니다.'}
              </p>
            </div>

            {/* 비밀번호 (항상 필수) */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-300 mb-2">
                투표 관리 비밀번호 <span className="text-red-400">*</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="4글자 이상의 비밀번호를 입력하세요"
                className="input-field-dark w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                minLength={4}
                maxLength={20}
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                투표 삭제{!isPublic ? ' 및 조회' : ''}에 필요한 비밀번호입니다.
              </p>
            </div>

            {/* Options */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-slate-300">
                  선택지 <span className="text-red-400">*</span>
                </label>
                <span className="text-xs text-slate-500">
                  {options.length}/{MAX_POLL_OPTIONS}개
                </span>
              </div>

              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`선택지 ${index + 1}`}
                        className="input-field-dark w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        maxLength={100}
                      />
                    </div>
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Option Button */}
              {options.length < MAX_POLL_OPTIONS && (
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-3 w-full border-2 border-dashed border-slate-600 hover:border-blue-500 text-slate-400 hover:text-blue-400 py-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>선택지 추가</span>
                </button>
              )}
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mt-4 text-red-400 text-sm">{error}</div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-slate-700/50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-xl transition-all duration-300"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="btn-primary bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? '생성 중...' : '투표 생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
