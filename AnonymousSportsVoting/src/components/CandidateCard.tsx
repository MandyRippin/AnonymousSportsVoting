import type { Candidate } from '@/types';

interface CandidateCardProps {
  candidate: Candidate;
  selected: boolean;
  onSelect: () => void;
}

export function CandidateCard({ candidate, selected, onSelect }: CandidateCardProps) {
  return (
    <div
      className={`candidate-item ${selected ? 'selected' : ''}`}
      onClick={onSelect}
      style={{ cursor: 'pointer' }}
    >
      <h4>{candidate.name}</h4>
      <p>
        <strong>Category:</strong> {candidate.category}
      </p>
    </div>
  );
}
