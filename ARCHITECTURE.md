# Privacy-Preserving Voting System - Architecture

## System Overview

The Anonymous Sports Voting system is a fully homomorphic encryption (FHE) enabled voting platform built on Ethereum. It ensures complete voter privacy while maintaining transparent and verifiable results through advanced cryptographic techniques.

## Architecture Components

### 1. Smart Contract Layer

#### Core Contract: AnonymousSportsVoting

The primary smart contract that manages the entire voting lifecycle.

**Key Responsibilities:**
- Event creation and management
- Candidate registration
- Voter authorization and access control
- Encrypted vote collection
- Decryption request handling (Gateway callback pattern)
- Refund mechanism for failed decryptions
- Timeout protection

### 2. Gateway Callback Pattern

The system implements an innovative asynchronous decryption architecture:

```
User Actions → Smart Contract → Gateway Request → Decryption Oracle → Callback → Results
```

#### Flow Details:

1. **Vote Submission Phase**
   - Users cast encrypted votes using FHE
   - Votes stored in encrypted form (euint32)
   - No information leakage about vote choices

2. **Decryption Request Phase**
   - Admin initiates decryption after voting period
   - Contract creates DecryptionRequest record
   - FHE.requestDecryption() sends request to oracle
   - Deadline set (reveal period + 3 days timeout)

3. **Oracle Processing Phase**
   - Gateway/Oracle network receives request
   - Decrypts vote tallies using ZAMA FHE protocol
   - Generates cryptographic proofs
   - Calls contract callback with decrypted values

4. **Callback Processing Phase**
   - processVoteResults() receives oracle response
   - FHE.checkSignatures() verifies proof validity
   - Updates contract state with tallies
   - Triggers result revelation

5. **Timeout Handling Phase**
   - If oracle fails to respond within deadline
   - Admin calls handleDecryptionFailure()
   - Initiates refund mechanism
   - Voters can claim refunds

### 3. Data Structures

#### VotingEvent
```solidity
struct VotingEvent {
    string eventName;              // Event identifier
    string description;            // Detailed description
    uint256 startTime;             // Voting start timestamp
    uint256 endTime;               // Voting end timestamp
    uint256 revealStartTime;       // Decryption request start
    uint256 revealEndTime;         // Decryption request end
    uint256 decryptionDeadline;    // Timeout threshold
    bool isActive;                 // Event status
    bool resultsRevealed;          // Results published
    bool decryptionFailed;         // Decryption failed flag
    uint32[] candidateIds;         // Participating candidates
    mapping(uint32 => uint32) candidateVotes;
    uint32 totalVotes;             // Total votes cast
    uint32 winnerId;               // Winner ID
    mapping(address => uint256) refundAmounts;
    uint256 totalRefundable;       // Refund pool
}
```

#### EncryptedVote
```solidity
struct EncryptedVote {
    euint32 candidateId;           // Encrypted choice
    bool hasVoted;                 // Vote status
    uint256 timestamp;             // Vote timestamp
    uint256 voteWeight;            // Vote weight (1 by default)
}
```

#### DecryptionRequest
```solidity
struct DecryptionRequest {
    uint32 eventId;                // Associated event
    bytes32[] ciphertexts;         // Encrypted data
    uint256 requestTime;           // Request timestamp
    bool isProcessed;              // Processing status
}
```

## Privacy Model

### Encryption Scheme

**FHE Operations Used:**
- `FHE.asEuint32()`: Encrypt plaintext values
- `FHE.toBytes32()`: Convert encrypted data for transmission
- `FHE.allowThis()`: Grant contract access to encrypted values
- `FHE.allow()`: Grant user access to encrypted values
- `FHE.requestDecryption()`: Request oracle decryption
- `FHE.checkSignatures()`: Verify decryption proofs

### Privacy Guarantees

1. **Vote Secrecy**
   - Individual vote choices never revealed on-chain
   - Encrypted immediately upon submission
   - Only decrypted result totals revealed

2. **Zero Information Leakage**
   - Vote counts computed homomorphically
   - No intermediate values exposed
   - Cryptographic proof verification

3. **Temporal Privacy**
   - Results hidden during voting period
   - Delayed decryption after voting closes
   - Time-locked reveal mechanism

4. **Immutable Audit Trail**
   - All actions recorded on blockchain
   - Transparent vote counting process
   - Verifiable result computation

## Security Features

### Access Control

1. **Admin Functions**
   - Only authorized admin can create events
   - Only admin can authorize voters
   - Only admin can request decryption
   - Only admin can handle timeout failures

2. **Voter Restrictions**
   - Only authorized addresses can vote
   - One vote per person per event
   - Voting only during active period

### Input Validation

**Function-Level Validation:**
- String length checks (1-256 bytes)
- Array length validation (1-100 items)
- Address authorization verification
- Candidate existence and activity checks
- Time-based constraint validation

**Parameter Constraints:**
- Voting duration: 7 days
- Reveal duration: 1 day
- Decryption timeout: 3 days
- Minimum reveal unlock time: 1 day

### Overflow Protection

- Uses `unchecked` block for vote counting
- Explicit overflow checks before critical operations
- Safe arithmetic in refund calculations

### Timeout Protection

**Three-Layer Timeout System:**

1. **Voting Deadline**
   - Prevents voting outside designated period
   - startTime to endTime enforcement

2. **Reveal Deadline**
   - Limits decryption request window
   - revealStartTime to revealEndTime

3. **Decryption Timeout**
   - Oracle must respond within deadline
   - Default: 3 days after reveal period
   - Automatic refund trigger if exceeded

### Refund Mechanism

**Failure Scenarios Covered:**
1. Decryption oracle fails to respond
2. Decryption timeout exceeded
3. Invalid decryption results

**Refund Process:**
1. Admin identifies timeout and calls handleDecryptionFailure()
2. Event marked as decryptionFailed
3. Voters can claim refunds via requestRefund()
4. Full vote weight returned to voter
5. One-time claim with state update

## Key Functions

### Event Management

**createVotingEvent()**
- Creates new voting event
- Sets time parameters
- Initializes candidate list
- Sets decryption deadline

**addCandidate()**
- Registers candidates
- Validates inputs
- Emits audit event

**authorizeVoter() / revokeVoter()**
- Controls voter access
- Maintains whitelist

### Voting

**castVote()**
- Accepts encrypted vote
- Validates voter status
- Updates vote tally
- Records vote weight
- Emits audit event

**endVoting()**
- Closes voting period
- Prevents new votes

### Decryption & Results

**requestVoteDecryption()**
- Initiates Gateway callback
- Creates DecryptionRequest
- Sets timeout deadline
- Emits request event

**processVoteResults()**
- Callback from oracle
- Verifies cryptographic proof
- Updates tallies
- Handles timeout cases
- Emits result event

### Refunds

**handleDecryptionFailure()**
- Marks event as failed
- Enables refund claiming
- Sets decryptionFailed flag

**requestRefund()**
- Claims refund for voter
- Validates eligibility
- Transfers funds
- Prevents double-claiming

## Gas Optimization

### Strategies Used

1. **Efficient State Management**
   - Minimal storage writes
   - Batch operations where possible
   - Use unchecked for safe arithmetic

2. **HCU (Homomorphic Compute Unit) Usage**
   - Minimal FHE operations in voting
   - Batch decryption in callback
   - Efficient proof verification

3. **Algorithm Optimization**
   - O(n) vote counting
   - Early loop termination where applicable
   - Avoid nested loops in state updates

## Audit Trail & Logging

### Audit Events Emitted

- **EventCreated**: Event initialization
- **CandidateAdded**: Candidate registration
- **VoteCast**: Vote submission
- **VotingEnded**: Voting period closure
- **DecryptionRequested**: Oracle request initiated
- **DecryptionProcessed**: Oracle response received
- **ResultsRevealed**: Final results published
- **RefundIssued**: Refund distribution
- **DecryptionTimeout**: Timeout triggered
- **VoterAuthorized/Revoked**: Access control changes

All events indexed for efficient querying and audit.

## Deployment Considerations

### Network Requirements
- Ethereum-compatible chain with FHE support
- Recommended: Zama FHEVM Sepolia testnet
- Sufficient gas for decryption operations

### Configuration
- Admin address setup
- Initial voter authorization
- Event creation and management

### Monitoring
- Watch for DecryptionTimeout events
- Monitor DecryptionProcessed status
- Track RefundIssued events

## Future Enhancements

1. **Weighted Voting**: Support variable vote weights
2. **Multi-Choice**: Extend beyond candidate voting
3. **Voting Pools**: Aggregate multiple events
4. **DAO Integration**: Direct governance integration
5. **Cross-Chain**: Multi-chain vote aggregation

## References

- [Zama FHE Documentation](https://docs.zama.ai/fhevm)
- [Solidity Security Best Practices](https://docs.soliditylang.org/en/v0.8.24/security-considerations.html)
- [Ethereum Smart Contract Architecture](https://ethereum.org/en/developers/)
