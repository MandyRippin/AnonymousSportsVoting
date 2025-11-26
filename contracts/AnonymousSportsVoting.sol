// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, ebool, euint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract AnonymousSportsVoting is SepoliaConfig {

    address public admin;
    uint32 public currentEventId;
    uint256 public constant VOTING_DURATION = 7 days;
    uint256 public constant REVEAL_DURATION = 1 days;
    uint256 public constant DECRYPTION_TIMEOUT = 3 days;
    uint256 public constant MIN_REFUND_UNLOCK_TIME = 1 days;

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
        uint256 decryptionDeadline;
        bool isActive;
        bool resultsRevealed;
        bool decryptionFailed;
        uint32[] candidateIds;
        mapping(uint32 => uint32) candidateVotes;
        uint32 totalVotes;
        uint32 winnerId;
        mapping(address => uint256) refundAmounts;
        uint256 totalRefundable;
    }

    struct EncryptedVote {
        euint32 candidateId;
        bool hasVoted;
        uint256 timestamp;
        uint256 voteWeight;
    }

    struct DecryptionRequest {
        uint32 eventId;
        bytes32[] ciphertexts;
        uint256 requestTime;
        bool isProcessed;
    }

    mapping(uint32 => VotingEvent) public events;
    mapping(uint32 => Candidate) public candidates;
    mapping(uint32 => mapping(address => EncryptedVote)) public voterRecords;
    mapping(address => bool) public authorizedVoters;
    mapping(uint256 => DecryptionRequest) public decryptionRequests;
    mapping(uint32 => uint256) public eventDecryptionRequestId;

    uint32 public nextCandidateId = 1;
    uint256 public nextDecryptionRequestId = 1;

    event EventCreated(uint32 indexed eventId, string eventName, uint256 startTime, uint256 endTime);
    event CandidateAdded(uint32 indexed candidateId, string name, string category);
    event VoteCast(address indexed voter, uint32 indexed eventId);
    event VotingEnded(uint32 indexed eventId, uint256 timestamp);
    event ResultsRevealed(uint32 indexed eventId, uint32 winnerId, uint32 totalVotes);
    event VoterAuthorized(address indexed voter);
    event VoterRevoked(address indexed voter);
    event DecryptionRequested(uint32 indexed eventId, uint256 requestId, uint256 deadline);
    event DecryptionProcessed(uint32 indexed eventId, uint256 requestId, bool success);
    event RefundIssued(uint32 indexed eventId, address indexed voter, uint256 amount);
    event DecryptionTimeout(uint32 indexed eventId, uint256 timestamp);

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

    modifier validString(string memory str) {
        require(bytes(str).length > 0, "String cannot be empty");
        require(bytes(str).length <= 256, "String too long");
        _;
    }

    modifier validArrayLength(uint256 length, uint256 maxLength) {
        require(length > 0, "Array cannot be empty");
        require(length <= maxLength, "Array too long");
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
    ) external onlyAdmin validString(_eventName) validString(_description) validArrayLength(_candidateIds.length, 100) returns (uint32) {
        require(_candidateIds.length > 1, "Need at least 2 candidates");

        currentEventId++;
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + VOTING_DURATION;
        uint256 revealStartTime = endTime;
        uint256 revealEndTime = revealStartTime + REVEAL_DURATION;
        uint256 decryptionDeadline = revealEndTime + DECRYPTION_TIMEOUT;

        VotingEvent storage newEvent = events[currentEventId];
        newEvent.eventName = _eventName;
        newEvent.description = _description;
        newEvent.startTime = startTime;
        newEvent.endTime = endTime;
        newEvent.revealStartTime = revealStartTime;
        newEvent.revealEndTime = revealEndTime;
        newEvent.decryptionDeadline = decryptionDeadline;
        newEvent.isActive = true;
        newEvent.resultsRevealed = false;
        newEvent.decryptionFailed = false;
        newEvent.candidateIds = _candidateIds;
        newEvent.totalVotes = 0;
        newEvent.winnerId = 0;
        newEvent.totalRefundable = 0;

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

        VotingEvent storage votingEvent = events[_eventId];

        bool isCandidateInEvent = false;
        for (uint i = 0; i < votingEvent.candidateIds.length; i++) {
            if (votingEvent.candidateIds[i] == _candidateId) {
                isCandidateInEvent = true;
                break;
            }
        }
        require(isCandidateInEvent, "Candidate not in this event");

        euint32 encryptedCandidateId = FHE.asEuint32(_candidateId);
        uint256 voteWeight = 1;

        voterRecords[_eventId][msg.sender] = EncryptedVote({
            candidateId: encryptedCandidateId,
            hasVoted: true,
            timestamp: block.timestamp,
            voteWeight: voteWeight
        });

        unchecked {
            votingEvent.totalVotes += 1;
            votingEvent.candidateVotes[_candidateId] += 1;
            votingEvent.totalRefundable += voteWeight;
        }

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

    function requestVoteDecryption(uint32 _eventId) external onlyAdmin eventExists(_eventId) {
        VotingEvent storage votingEvent = events[_eventId];
        require(!votingEvent.resultsRevealed, "Results already revealed");
        require(!votingEvent.isActive, "Voting period must have ended");
        require(block.timestamp >= votingEvent.revealStartTime, "Reveal period not started");
        require(eventDecryptionRequestId[_eventId] == 0, "Decryption already requested");

        bytes32[] memory ciphertexts = new bytes32[](votingEvent.candidateIds.length);

        for (uint i = 0; i < votingEvent.candidateIds.length; i++) {
            euint32 dummyVote = FHE.asEuint32(votingEvent.candidateIds[i]);
            ciphertexts[i] = FHE.toBytes32(dummyVote);
        }

        uint256 requestId = nextDecryptionRequestId++;
        decryptionRequests[requestId] = DecryptionRequest({
            eventId: _eventId,
            ciphertexts: ciphertexts,
            requestTime: block.timestamp,
            isProcessed: false
        });

        eventDecryptionRequestId[_eventId] = requestId;
        uint256 deadline = votingEvent.revealEndTime + DECRYPTION_TIMEOUT;

        FHE.requestDecryption(ciphertexts, this.processVoteResults.selector);
        emit DecryptionRequested(_eventId, requestId, deadline);
    }

    function processVoteResults(
        uint256 requestId,
        uint32[] memory decryptedValues,
        bytes memory signatures
    ) external {
        bytes memory ciphertexts = abi.encode(decryptedValues);
        FHE.checkSignatures(requestId, ciphertexts, signatures);

        DecryptionRequest storage decRequest = decryptionRequests[requestId];
        require(!decRequest.isProcessed, "Request already processed");
        require(decRequest.eventId > 0, "Invalid decryption request");

        uint32 eventId = decRequest.eventId;
        VotingEvent storage votingEvent = events[eventId];

        if (block.timestamp > votingEvent.decryptionDeadline) {
            votingEvent.decryptionFailed = true;
            decRequest.isProcessed = true;
            emit DecryptionTimeout(eventId, block.timestamp);
            return;
        }

        uint32 maxVotes = 0;
        uint32 winnerId = 0;
        uint32 maxVoteCount = 0;

        for (uint i = 0; i < decryptedValues.length && i < votingEvent.candidateIds.length; i++) {
            uint32 candidateId = votingEvent.candidateIds[i];
            uint32 voteCount = decryptedValues[i];
            votingEvent.candidateVotes[candidateId] = voteCount;

            if (voteCount > maxVotes) {
                maxVotes = voteCount;
                winnerId = candidateId;
                maxVoteCount = 1;
            } else if (voteCount == maxVotes && voteCount > 0) {
                maxVoteCount++;
            }
        }

        votingEvent.winnerId = winnerId;
        votingEvent.resultsRevealed = true;
        votingEvent.totalVotes = uint32(decryptedValues.length);
        decRequest.isProcessed = true;

        emit ResultsRevealed(eventId, winnerId, uint32(decryptedValues.length));
        emit DecryptionProcessed(eventId, requestId, true);
    }

    function handleDecryptionFailure(uint32 _eventId) external onlyAdmin eventExists(_eventId) {
        VotingEvent storage votingEvent = events[_eventId];
        uint256 requestId = eventDecryptionRequestId[_eventId];
        require(requestId > 0, "No decryption request");
        require(block.timestamp > votingEvent.decryptionDeadline, "Deadline not reached");
        require(!votingEvent.resultsRevealed, "Results already revealed");

        DecryptionRequest storage decRequest = decryptionRequests[requestId];
        require(!decRequest.isProcessed, "Request already processed");

        votingEvent.decryptionFailed = true;
        votingEvent.resultsRevealed = true;
        decRequest.isProcessed = true;

        emit DecryptionProcessed(_eventId, requestId, false);
    }

    function requestRefund(uint32 _eventId) external eventExists(_eventId) {
        VotingEvent storage votingEvent = events[_eventId];
        EncryptedVote storage vote = voterRecords[_eventId][msg.sender];

        require(vote.hasVoted, "Voter did not participate");
        require(votingEvent.decryptionFailed, "Decryption did not fail");
        require(block.timestamp >= votingEvent.revealEndTime, "Reveal period not ended");

        uint256 refundAmount = vote.voteWeight;
        require(refundAmount > 0, "No refund available");

        vote.voteWeight = 0;
        (bool sent, ) = payable(msg.sender).call{value: refundAmount}("");
        require(sent, "Refund failed");

        emit RefundIssued(_eventId, msg.sender, refundAmount);
    }

    function getEventStatus(uint32 _eventId) external view eventExists(_eventId) returns (
        bool isActive,
        bool resultsRevealed,
        bool decryptionFailed,
        uint256 decryptionDeadline,
        uint256 currentTime
    ) {
        VotingEvent storage votingEvent = events[_eventId];
        return (
            votingEvent.isActive,
            votingEvent.resultsRevealed,
            votingEvent.decryptionFailed,
            votingEvent.decryptionDeadline,
            block.timestamp
        );
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