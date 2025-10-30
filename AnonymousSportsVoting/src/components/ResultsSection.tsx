import { useState, useEffect } from 'react';
import { Contract } from 'ethers';
import type { VotingEvent, Candidate } from '@/types';

interface ResultsSectionProps {
  contract: Contract | null;
  currentEvent: VotingEvent | null;
}

export function ResultsSection({ contract, currentEvent }: ResultsSectionProps) {
  const [winner, setWinner] = useState<Candidate | null>(null);

  useEffect(() => {
    if (contract && currentEvent?.resultsRevealed && currentEvent.winnerId > 0) {
      loadWinner();
    }
  }, [contract, currentEvent]);

  const loadWinner = async () => {
    if (!contract || !currentEvent || currentEvent.winnerId === 0) return;

    try {
      const candidateInfo = await contract.getCandidateInfo(currentEvent.winnerId);
      setWinner({
        id: currentEvent.winnerId,
        name: candidateInfo[0],
        category: candidateInfo[1],
        isActive: candidateInfo[2],
      });
    } catch (err) {
      console.error('Error loading winner:', err);
    }
  };

  if (!currentEvent?.resultsRevealed) {
    return null;
  }

  return (
    <div className="card">
      <h2 className="section-title">Voting Results</h2>
      {winner ? (
        <div className="winner-announcement">
          <h3>Winner: {winner.name}</h3>
          <p>
            <strong>Category:</strong> {winner.category}
          </p>
          <p>
            <strong>Total Votes:</strong> {currentEvent.totalVotes}
          </p>
        </div>
      ) : (
        <div className="status info">
          No winner determined yet or no votes were cast.
        </div>
      )}
    </div>
  );
}
