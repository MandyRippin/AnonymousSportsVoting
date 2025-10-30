export const CONTRACT_ADDRESS = "0x3825C6a1BAf65d3fF39C3e0cEbbe4b76D2567488";

export const CONTRACT_ABI = [
  "function admin() view returns (address)",
  "function currentEventId() view returns (uint32)",
  "function authorizedVoters(address) view returns (bool)",
  "function candidates(uint32) view returns (string memory name, string memory category, bool isActive)",
  "function events(uint32) view returns (string memory eventName, string memory description, uint256 startTime, uint256 endTime, uint256 revealStartTime, uint256 revealEndTime, bool isActive, bool resultsRevealed)",
  "function getEventInfo(uint32) view returns (string memory eventName, string memory description, uint256 startTime, uint256 endTime, uint256 revealStartTime, uint256 revealEndTime, bool isActive, bool resultsRevealed, uint32[] memory candidateIds, uint32 totalVotes, uint32 winnerId)",
  "function getCandidateInfo(uint32) view returns (string memory name, string memory category, bool isActive)",
  "function getVoterStatus(uint32, address) view returns (bool hasVoted, uint256 timestamp)",
  "function isVotingActive(uint32) view returns (bool)",
  "function isRevealPeriodActive(uint32) view returns (bool)",
  "function getCurrentTime() view returns (uint256)",
  "function authorizeVoter(address) external",
  "function addCandidate(string memory, string memory) external returns (uint32)",
  "function createVotingEvent(string memory, string memory, uint32[] memory) external returns (uint32)",
  "function castVote(uint32, uint32) external",
  "function endVoting(uint32) external",
  "function requestVoteDecryption(uint32) external",
  "event EventCreated(uint32 indexed eventId, string eventName, uint256 startTime, uint256 endTime)",
  "event CandidateAdded(uint32 indexed candidateId, string name, string category)",
  "event VoteCast(address indexed voter, uint32 indexed eventId)",
  "event VotingEnded(uint32 indexed eventId, uint256 timestamp)",
  "event ResultsRevealed(uint32 indexed eventId, uint32 winnerId, uint32 totalVotes)",
  "event VoterAuthorized(address indexed voter)"
];
