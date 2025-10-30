import { useState } from 'react';
import { Contract } from 'ethers';
import { formatDate } from '@/lib/utils';
import { CandidateCard } from './CandidateCard';
import type { VotingEvent, VoterStatus, Candidate } from '@/types';

interface VotingSectionProps {
  contract: Contract | null;
  currentEvent: VotingEvent | null;
  voterStatus: VoterStatus | null;
  candidates: Candidate[];
  isVotingActive: boolean;
  isAuthorized: boolean;
  onStatusUpdate: (message: string, type: 'success' | 'error' | 'info') => void;
  onVoteSubmitted: () => void;
}

export function VotingSection({
  contract,
  currentEvent,
  voterStatus,
  candidates,
  isVotingActive,
  isAuthorized,
  onStatusUpdate,
  onVoteSubmitted,
}: VotingSectionProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmitVote = async () => {
    if (!contract || !selectedCandidate || !currentEvent) return;

    try {
      setLoading(true);
      onStatusUpdate('Submitting vote...', 'info');
      const tx = await contract.castVote(currentEvent.id, selectedCandidate);
      await tx.wait();

      onStatusUpdate('Vote submitted successfully!', 'success');
      setSelectedCandidate(null);
      onVoteSubmitted();
    } catch (err: any) {
      onStatusUpdate(`Failed to submit vote: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!currentEvent) {
    return (
      <div className="card">
        <h2 className="section-title">Current Voting Event</h2>
        <div className="status info">No active voting event available.</div>
      </div>
    );
  }

  const canVote = isVotingActive && isAuthorized && !voterStatus?.hasVoted;

  return (
    <div className="card">
      <h2 className="section-title">Current Voting Event</h2>

      <div className="event-info">
        <h3>{currentEvent.name}</h3>
        <p>{currentEvent.description}</p>

        <div className="time-info">
          <div className="time-item">
            <strong>Voting Starts</strong>
            <span>{formatDate(currentEvent.startTime)}</span>
          </div>
          <div className="time-item">
            <strong>Voting Ends</strong>
            <span>{formatDate(currentEvent.endTime)}</span>
          </div>
          <div className="time-item">
            <strong>Results Reveal</strong>
            <span>{formatDate(currentEvent.revealStartTime)}</span>
          </div>
        </div>
      </div>

      {voterStatus?.hasVoted ? (
        <div className="status success">
          You have already voted in this event!
        </div>
      ) : !isVotingActive ? (
        <div className="status info">
          Voting period has ended. Waiting for results...
        </div>
      ) : !isAuthorized ? (
        <div className="status error">
          You are not authorized to vote in this event
        </div>
      ) : (
        <div>
          <h3>Select Your Candidate:</h3>
          <div className="grid">
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                selected={selectedCandidate === candidate.id}
                onSelect={() => setSelectedCandidate(candidate.id)}
              />
            ))}
          </div>
          <button
            className="btn"
            onClick={handleSubmitVote}
            disabled={!selectedCandidate || loading}
          >
            {loading ? 'Submitting...' : 'Submit Vote'}
          </button>
        </div>
      )}
    </div>
  );
}
