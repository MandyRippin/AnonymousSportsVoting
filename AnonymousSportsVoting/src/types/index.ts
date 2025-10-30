export interface Candidate {
  id: number;
  name: string;
  category: string;
  isActive: boolean;
}

export interface VotingEvent {
  id: number;
  name: string;
  description: string;
  startTime: bigint;
  endTime: bigint;
  revealStartTime: bigint;
  revealEndTime: bigint;
  isActive: boolean;
  resultsRevealed: boolean;
  candidateIds: number[];
  totalVotes: number;
  winnerId: number;
}

export interface VoterStatus {
  hasVoted: boolean;
  timestamp: bigint;
}

export interface StatusMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface ContractEventInfo {
  eventName: string;
  description: string;
  startTime: bigint;
  endTime: bigint;
  revealStartTime: bigint;
  revealEndTime: bigint;
  isActive: boolean;
  resultsRevealed: boolean;
  candidateIds: number[];
  totalVotes: number;
  winnerId: number;
}

export interface CandidateInfo {
  name: string;
  category: string;
  isActive: boolean;
}

export type NetworkInfo = {
  name: string;
  chainId: number;
};
