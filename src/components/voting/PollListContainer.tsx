// src/components/voting/PollListContainer.tsx
import PollList from './PollList';
import type { Poll } from '../../types';

interface PollListContainerProps {
  polls: Poll[];
  onSelectPoll: (poll: Poll) => void;
}

export default function PollListContainer({ polls, onSelectPoll }: PollListContainerProps) {
  // polls는 이제 App.tsx에서 관리되므로 여기서는 단순히 전달만 함
  return <PollList polls={polls} onSelectPoll={onSelectPoll} />;
}   