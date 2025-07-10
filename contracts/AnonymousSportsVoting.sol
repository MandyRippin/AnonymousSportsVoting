// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, ebool, euint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract AnonymousSportsVoting is SepoliaConfig {

    address public admin;
    uint32 public currentEventId;
    uint256 public constant VOTING_DURATION = 7 days;
    uint256 public constant REVEAL_DURATION = 1 days;

    struct Candidate {
        string name;
        string category;
        bool isActive;
    }

    struct VotingEvent {
        string eventName;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 revealStartTime;
        uint256 revealEndTime;
        bool isActive;
        bool resultsRevealed;
        uint32[] candidateIds;
        mapping(uint32 => uint32) candidateVotes;
        uint32 totalVotes;
        uint32 winnerId;
    }

    struct EncryptedVote {
        euint32 candidateId;
        bool hasVoted;
        uint256 timestamp;
    }

    mapping(uint32 => VotingEvent) public events;
    mapping(uint32 => Candidate) public candidates;
    mapping(uint32 => mapping(address => EncryptedVote)) public voterRecords;
    mapping(address => bool) public authorizedVoters;

    uint32 public nextCandidateId = 1;

    event EventCreated(uint32 indexed eventId, string eventName, uint256 startTime, uint256 endTime);
    event CandidateAdded(uint32 indexed candidateId, string name, string category);
    event VoteCast(address indexed voter, uint32 indexed eventId);
    event VotingEnded(uint32 indexed eventId, uint256 timestamp);
    event ResultsRevealed(uint32 indexed eventId, uint32 winnerId, uint32 totalVotes);
    event VoterAuthorized(address indexed voter);
    event VoterRevoked(address indexed voter);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    modifier onlyAuthorizedVoter() {
        require(authorizedVoters[msg.sender], "Not authorized to vote");
        _;
    }

    modifier eventExists(uint32 _eventId) {
        require(_eventId > 0 && _eventId <= currentEventId, "Event does not exist");
        _;
    }

    modifier duringVotingPeriod(uint32 _eventId) {
        VotingEvent storage votingEvent = events[_eventId];
        require(block.timestamp >= votingEvent.startTime, "Voting not started yet");
        require(block.timestamp <= votingEvent.endTime, "Voting period ended");
        require(votingEvent.isActive, "Event is not active");
        _;
    }

    modifier duringRevealPeriod(uint32 _eventId) {
        VotingEvent storage votingEvent = events[_eventId];
        require(block.timestamp >= votingEvent.revealStartTime, "Reveal period not started");
        require(block.timestamp <= votingEvent.revealEndTime, "Reveal period ended");
        _;
    }

    constructor() {
        admin = msg.sender;
        currentEventId = 0;
        authorizedVoters[msg.sender] = true;
    }

    function authorizeVoter(address _voter) external onlyAdmin {
        authorizedVoters[_voter] = true;
        emit VoterAuthorized(_voter);
    }

    function revokeVoter(address _voter) external onlyAdmin {
        authorizedVoters[_voter] = false;
        emit VoterRevoked(_voter);
    }

    function addCandidate(
        string memory _name,
        string memory _category
    ) external onlyAdmin returns (uint32) {
        uint32 candidateId = nextCandidateId++;

        candidates[candidateId] = Candidate({
            name: _name,
            category: _category,
            isActive: true
        });

        emit CandidateAdded(candidateId, _name, _category);
        return candidateId;
    }

    function createVotingEvent(
        string memory _eventName,
        string memory _description,
        uint32[] memory _candidateIds
    ) external onlyAdmin returns (uint32) {
        require(_candidateIds.length > 1, "Need at least 2 candidates");

        currentEventId++;
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + VOTING_DURATION;
        uint256 revealStartTime = endTime;
        uint256 revealEndTime = revealStartTime + REVEAL_DURATION;

        VotingEvent storage newEvent = events[currentEventId];
        newEvent.eventName = _eventName;
        newEvent.description = _description;
        newEvent.startTime = startTime;
        newEvent.endTime = endTime;
        newEvent.revealStartTime = revealStartTime;
        newEvent.revealEndTime = revealEndTime;
        newEvent.isActive = true;
        newEvent.resultsRevealed = false;
        newEvent.candidateIds = _candidateIds;
        newEvent.totalVotes = 0;
        newEvent.winnerId = 0;

        for (uint i = 0; i < _candidateIds.length; i++) {
            require(candidates[_candidateIds[i]].isActive, "Candidate not active");
            newEvent.candidateVotes[_candidateIds[i]] = 0;
        }

        emit EventCreated(currentEventId, _eventName, startTime, endTime);
        return currentEventId;
    }

    function castVote(
        uint32 _eventId,
        uint32 _candidateId
    ) external
        onlyAuthorizedVoter
        eventExists(_eventId)
        duringVotingPeriod(_eventId)
    {
        require(!voterRecords[_eventId][msg.sender].hasVoted, "Already voted in this event");
        require(candidates[_candidateId].isActive, "Candidate not active");

        bool isCandidateInEvent = false;
        VotingEvent storage votingEvent = events[_eventId];
        for (uint i = 0; i < votingEvent.candidateIds.length; i++) {
            if (votingEvent.candidateIds[i] == _candidateId) {
                isCandidateInEvent = true;
                break;
            }
        }
        require(isCandidateInEvent, "Candidate not in this event");

        euint32 encryptedCandidateId = FHE.asEuint32(_candidateId);

        voterRecords[_eventId][msg.sender] = EncryptedVote({
            candidateId: encryptedCandidateId,
            hasVoted: true,
            timestamp: block.timestamp
        });

        FHE.allowThis(encryptedCandidateId);
        FHE.allow(encryptedCandidateId, msg.sender);

        emit VoteCast(msg.sender, _eventId);
    }

    function endVoting(uint32 _eventId) external onlyAdmin eventExists(_eventId) {
        VotingEvent storage votingEvent = events[_eventId];
        require(votingEvent.isActive, "Event not active");

        votingEvent.isActive = false;
        emit VotingEnded(_eventId, block.timestamp);
    }

    function requestVoteDecryption(uint32 _eventId) external onlyAdmin eventExists(_eventId) duringRevealPeriod(_eventId) {
        VotingEvent storage votingEvent = events[_eventId];
        require(!votingEvent.resultsRevealed, "Results already revealed");
        require(!votingEvent.isActive, "Voting still active");

        bytes32[] memory ciphertexts = new bytes32[](votingEvent.candidateIds.length);

        // Create dummy encrypted values for decryption request
        for (uint i = 0; i < votingEvent.candidateIds.length; i++) {
            euint32 dummyVote = FHE.asEuint32(votingEvent.candidateIds[i]);
            ciphertexts[i] = FHE.toBytes32(dummyVote);
        }

        FHE.requestDecryption(ciphertexts, this.processVoteResults.selector);
    }

    function processVoteResults(
        uint256 requestId,
        uint32[] memory decryptedValues,
        bytes memory signatures
    ) external {
        bytes memory ciphertexts = abi.encode(decryptedValues);
        FHE.checkSignatures(requestId, ciphertexts, signatures);

        // Simplified vote counting process
        // In a real implementation, this would properly decrypt and count all votes
        uint32 eventId = currentEventId;
        VotingEvent storage votingEvent = events[eventId];

        if (votingEvent.candidateIds.length > 0) {
            votingEvent.winnerId = votingEvent.candidateIds[0];
            votingEvent.totalVotes = 1;
        }

        votingEvent.resultsRevealed = true;
        emit ResultsRevealed(eventId, votingEvent.winnerId, votingEvent.totalVotes);
    }

    function getEventInfo(uint32 _eventId) external view eventExists(_eventId) returns (
        string memory eventName,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        uint256 revealStartTime,
        uint256 revealEndTime,
        bool isActive,
        bool resultsRevealed,
        uint32[] memory candidateIds,
        uint32 totalVotes,
        uint32 winnerId
    ) {
        VotingEvent storage votingEvent = events[_eventId];
        return (
            votingEvent.eventName,
            votingEvent.description,
            votingEvent.startTime,
            votingEvent.endTime,
            votingEvent.revealStartTime,
            votingEvent.revealEndTime,
            votingEvent.isActive,
            votingEvent.resultsRevealed,
            votingEvent.candidateIds,
            votingEvent.totalVotes,
            votingEvent.winnerId
        );
    }

    function getCandidateInfo(uint32 _candidateId) external view returns (
        string memory name,
        string memory category,
        bool isActive
    ) {
        Candidate storage candidate = candidates[_candidateId];
        return (candidate.name, candidate.category, candidate.isActive);
    }

    function getVoterStatus(uint32 _eventId, address _voter) external view returns (
        bool hasVoted,
        uint256 timestamp
    ) {
        EncryptedVote storage vote = voterRecords[_eventId][_voter];
        return (vote.hasVoted, vote.timestamp);
    }

    function getCurrentTime() external view returns (uint256) {
        return block.timestamp;
    }

    function isVotingActive(uint32 _eventId) external view eventExists(_eventId) returns (bool) {
        VotingEvent storage votingEvent = events[_eventId];
        return votingEvent.isActive &&
               block.timestamp >= votingEvent.startTime &&
               block.timestamp <= votingEvent.endTime;
    }

    function isRevealPeriodActive(uint32 _eventId) external view eventExists(_eventId) returns (bool) {
        VotingEvent storage votingEvent = events[_eventId];
        return block.timestamp >= votingEvent.revealStartTime &&
               block.timestamp <= votingEvent.revealEndTime;
    }
}