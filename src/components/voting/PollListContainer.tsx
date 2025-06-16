// src/components/voting/PollListContainer.tsx
import { useEffect, useState } from 'react';
import PollList from './PollList';
import type { Poll } from '../../types';

interface PollListContainerProps {
  onSelectPoll: (poll: Poll) => void;
}

export default function PollListContainer({ onSelectPoll }: PollListContainerProps) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolls = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = import.meta.env.VITE_SERVER_API_URL;
        console.log('📦 API URL:', apiUrl);
        const res = await fetch(apiUrl, {
            headers: { "ngrok-skip-browser-warning": "true" }
          });
        console.log('📡 Fetch 응답 상태코드:', res.status);
        console.log('✅ res.ok?', res.ok);
        if (!res.ok) throw new Error('투표 목록을 불러오지 못했습니다.');

        // const bodyText = await res.text();
        // console.log("📥 Response Text:", bodyText);

        const data = await res.json();
        console.log('📥 받은 데이터:', data);

        // API 데이터를 Poll 타입에 맞게 변환
        const mapped: Poll[] = data.map((item: any) => ({
          id: item.vote_id,
          title: item.title,
          description: item.description,
          totalVotes: item.total_votes,
          createdAt: new Date(item.created_at),
          optionCount: item.option_count,
          isActive: item.status === '진행중',
        }));

        setPolls(mapped);
      } catch (err: any) {
        console.error('❌ Fetch 에러:', err);
        setError(err.message || '에러가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, []);

  if (loading) return <div className="text-slate-400 text-center py-8">불러오는 중...</div>;
  if (error) return <div className="text-red-400 text-center py-8">{error}</div>;

  return <PollList polls={polls} onSelectPoll={onSelectPoll} />;
}   