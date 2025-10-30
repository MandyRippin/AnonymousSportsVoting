import { useState, useEffect, useCallback } from 'react';
import { Contract } from 'ethers';
import type { VotingEvent, VoterStatus, Candidate } from '@/types';

export function useVotingEvent(contract: Contract | null, address: string) {
  const [currentEvent, setCurrentEvent] = useState<VotingEvent | null>(null);
  const [voterStatus, setVoterStatus] = useState<VoterStatus | null>(null);
  const [eventCandidates, setEventCandidates] = useState<Candidate[]>([]);
  const [isVotingActive, setIsVotingActive] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadCurrentEvent = useCallback(async () => {
    if (!contract) return;

    try {
      setLoading(true);
      const currentEventId = await contract.currentEventId();

      if (currentEventId > 0) {
        const eventInfo = await contract.getEventInfo(currentEventId);

        const event: VotingEvent = {
          id: Number(currentEventId),
          name: eventInfo[0],
          description: eventInfo[1],
          startTime: eventInfo[2],
          endTime: eventInfo[3],
          revealStartTime: eventInfo[4],
          revealEndTime: eventInfo[5],
          isActive: eventInfo[6],
          resultsRevealed: eventInfo[7],
          candidateIds: eventInfo[8].map((id: bigint) => Number(id)),
          totalVotes: Number(eventInfo[9]),
          winnerId: Number(eventInfo[10]),
        };

        setCurrentEvent(event);

        // Load candidates for this event
        const candidates: Candidate[] = [];
        for (const candidateId of event.candidateIds) {
          const candidateInfo = await contract.getCandidateInfo(candidateId);
          candidates.push({
            id: candidateId,
            name: candidateInfo[0],
            category: candidateInfo[1],
            isActive: candidateInfo[2],
          });
        }
        setEventCandidates(candidates);

        // Check voting status
        const votingActive = await contract.isVotingActive(currentEventId);
        setIsVotingActive(votingActive);
      } else {
        setCurrentEvent(null);
        setEventCandidates([]);
      }
    } catch (err) {
      console.error('Error loading event:', err);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const loadVoterStatus = useCallback(async () => {
    if (!contract || !address || !currentEvent) return;

    try {
      const status = await contract.getVoterStatus(currentEvent.id, address);
      setVoterStatus({
        hasVoted: status[0],
        timestamp: status[1],
      });

      const authorized = await contract.authorizedVoters(address);
      setIsAuthorized(authorized);
    } catch (err) {
      console.error('Error loading voter status:', err);
    }
  }, [contract, address, currentEvent]);

  useEffect(() => {
    loadCurrentEvent();
  }, [loadCurrentEvent]);

  useEffect(() => {
    if (address) {
      loadVoterStatus();
    }
  }, [loadVoterStatus, address]);

  return {
    currentEvent,
    voterStatus,
    eventCandidates,
    isVotingActive,
    isAuthorized,
    loading,
    reloadEvent: loadCurrentEvent,
    reloadVoterStatus: loadVoterStatus,
  };
}
