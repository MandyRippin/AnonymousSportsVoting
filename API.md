# Anonymous Sports Voting - Smart Contract API Reference

## Contract: AnonymousSportsVoting

### State Variables

#### Public Variables
```solidity
address public admin;                          // Contract administrator address
uint32 public currentEventId;                  // Current highest event ID
uint256 public constant VOTING_DURATION = 7 days;
uint256 public constant REVEAL_DURATION = 1 days;
uint256 public constant DECRYPTION_TIMEOUT = 3 days;
uint256 public constant MIN_REFUND_UNLOCK_TIME = 1 days;
```

#### Mappings
```solidity
mapping(uint32 => VotingEvent) public events;                      // Event storage
mapping(uint32 => Candidate) public candidates;                    // Candidate storage
mapping(uint32 => mapping(address => EncryptedVote)) public voterRecords;
mapping(address => bool) public authorizedVoters;                  // Voter whitelist
mapping(uint256 => DecryptionRequest) public decryptionRequests;   // Decryption requests
mapping(uint32 => uint256) public eventDecryptionRequestId;        // Event -> Request mapping
```

---

## Admin Functions

### authorizeVoter

**Function Signature:**
```solidity
function authorizeVoter(address _voter) external onlyAdmin
```

**Description:**
Grants voting permission to an address.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `_voter` | address | Address to authorize |

**Events:**
- `VoterAuthorized(address indexed voter)`

**Gas:** ~40,000

**Example:**
```javascript
await contract.authorizeVoter("0x1234...");
```

---

### revokeVoter

**Function Signature:**
```solidity
function revokeVoter(address _voter) external onlyAdmin
```

**Description:**
Revokes voting permission from an address.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `_voter` | address | Address to revoke |

**Events:**
- `VoterRevoked(address indexed voter)`

**Gas:** ~25,000

---

### addCandidate

**Function Signature:**
```solidity
function addCandidate(
    string memory _name,
    string memory _category
) external onlyAdmin validString(_name) validString(_category) returns (uint32)
```

**Description:**
Registers a new candidate for voting events.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `_name` | string | Candidate name (1-256 bytes) |
| `_category` | string | Candidate category (1-256 bytes) |

**Returns:**
| Type | Description |
|------|-------------|
| uint32 | Assigned candidate ID |

**Events:**
- `CandidateAdded(uint32 indexed candidateId, string name, string category)`

**Validations:**
- Names cannot be empty
- Names cannot exceed 256 characters
- Categories cannot be empty
- Categories cannot exceed 256 characters

**Gas:** ~50,000

**Example:**
```javascript
const candidateId = await contract.addCandidate("John Doe", "Sports");
```

---

### createVotingEvent

**Function Signature:**
```solidity
function createVotingEvent(
    string memory _eventName,
    string memory _description,
    uint32[] memory _candidateIds
) external onlyAdmin validString(_eventName) validString(_description)
  validArrayLength(_candidateIds.length, 100) returns (uint32)
```

**Description:**
Creates a new voting event with specified parameters.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `_eventName` | string | Event name (1-256 bytes) |
| `_description` | string | Event description (1-256 bytes) |
| `_candidateIds` | uint32[] | Array of candidate IDs (2-100 items) |

**Returns:**
| Type | Description |
|------|-------------|
| uint32 | New event ID |

**Time Schedule:**
- Start: Current block timestamp
- Voting ends: Start + 7 days
- Reveal starts: Start + 7 days
- Reveal ends: Start + 8 days
- Decryption deadline: Start + 11 days

**Events:**
- `EventCreated(uint32 indexed eventId, string eventName, uint256 startTime, uint256 endTime)`

**Validations:**
- Event name must be non-empty (1-256 bytes)
- Description must be non-empty (1-256 bytes)
- Must have 2-100 candidates
- All candidates must exist and be active

**Gas:** ~150,000 + 10,000 per candidate

**Example:**
```javascript
const eventId = await contract.createVotingEvent(
  "Best Sports Player 2024",
  "Vote for your favorite athlete",
  [1, 2, 3]
);
```

---

### endVoting

**Function Signature:**
```solidity
function endVoting(uint32 _eventId) external onlyAdmin eventExists(_eventId)
```

**Description:**
Closes voting period for an event (can be called before scheduled end).

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `_eventId` | uint32 | Event ID |

**Events:**
- `VotingEnded(uint32 indexed eventId, uint256 timestamp)`

**Validations:**
- Event must exist
- Event must be active

**Gas:** ~30,000

---

### requestVoteDecryption

**Function Signature:**
```solidity
function requestVoteDecryption(uint32 _eventId) external onlyAdmin eventExists(_eventId)
```

**Description:**
Initiates FHE decryption via Gateway oracle. Implements callback pattern.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `_eventId` | uint32 | Event ID to decrypt |

**Process:**
1. Creates DecryptionRequest record
2. Sends request to FHE oracle via Gateway
3. Sets decryption deadline
4. Oracle processes and calls processVoteResults()

**Events:**
- `DecryptionRequested(uint32 indexed eventId, uint256 requestId, uint256 deadline)`

**Validations:**
- Event must exist
- Voting must have ended
- Results not already revealed
- Reveal period must have started
- Only one decryption request per event

**Gas:** ~200,000

**Timeout Behavior:**
- If oracle doesn't respond within DECRYPTION_TIMEOUT (3 days)
- Admin must call handleDecryptionFailure()
- Triggers refund mechanism

**Example:**
```javascript
await contract.requestVoteDecryption(1);
// Oracle processes asynchronously
// Callback will trigger processVoteResults()
```

---

### handleDecryptionFailure

**Function Signature:**
```solidity
function handleDecryptionFailure(uint32 _eventId) external onlyAdmin eventExists(_eventId)
```

**Description:**
Handles oracle timeout or failure. Enables refund claiming.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `_eventId` | uint32 | Event ID |

**Events:**
- `DecryptionProcessed(uint32 indexed eventId, uint256 requestId, bool success)`

**Validations:**
- Event must exist
- Decryption request must be pending
- Decryption deadline must have passed
- Results not already revealed
- Request must not be processed

**Gas:** ~50,000

---

## Voter Functions

### castVote

**Function Signature:**
```solidity
function castVote(
    uint32 _eventId,
    uint32 _candidateId
) external onlyAuthorizedVoter eventExists(_eventId) duringVotingPeriod(_eventId)
```

**Description:**
Submits an encrypted vote for a candidate in an event.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `_eventId` | uint32 | Event ID to vote in |
| `_candidateId` | uint32 | Candidate to vote for |

**Process:**
1. Encrypts candidateId using FHE
2. Records vote with timestamp
3. Grants FHE access to vote data
4. Updates vote tallies

**Events:**
- `VoteCast(address indexed voter, uint32 indexed eventId)`

**Validations:**
- Voter must be authorized
- Event must exist
- Voting period must be active
- Voter can only vote once per event
- Candidate must be active
- Candidate must be in the event

**Gas:** ~150,000

**Privacy Guarantee:**
- Vote choice encrypted immediately
- Never stored in plaintext
- Only decrypted by oracle after voting ends

**Example:**
```javascript
await contract.castVote(1, 2);  // Vote for candidate 2 in event 1
```

---

### requestRefund

**Function Signature:**
```solidity
function requestRefund(uint32 _eventId) external eventExists(_eventId)
```

**Description:**
Claims refund when decryption fails. Can only be called after decryption failure.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `_eventId` | uint32 | Event ID |

**Process:**
1. Validates voter participated
2. Checks decryption failure flag
3. Transfers refund amount
4. Prevents re-claiming

**Events:**
- `RefundIssued(uint32 indexed eventId, address indexed voter, uint256 amount)`

**Validations:**
- Event must exist
- Voter must have voted
- Event must have failed decryption
- Reveal period must have ended
- Voter has not already claimed refund

**Gas:** ~50,000

**Refund Amount:**
- Full vote weight (typically 1 per vote)
- Multiple votes = proportional refunds

**Example:**
```javascript
await contract.requestRefund(1);
// Receives full vote weight back
```

---

## View Functions

### getEventInfo

**Function Signature:**
```solidity
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
)
```

**Description:**
Retrieves complete event information.

**Returns:**
| Name | Type | Description |
|------|------|-------------|
| eventName | string | Event name |
| description | string | Event description |
| startTime | uint256 | Voting start timestamp |
| endTime | uint256 | Voting end timestamp |
| revealStartTime | uint256 | Decryption request start |
| revealEndTime | uint256 | Decryption request end |
| isActive | bool | Current active status |
| resultsRevealed | bool | Results published |
| candidateIds | uint32[] | List of candidate IDs |
| totalVotes | uint32 | Total votes cast |
| winnerId | uint32 | ID of winning candidate |

**Gas:** ~5,000

---

### getEventStatus

**Function Signature:**
```solidity
function getEventStatus(uint32 _eventId) external view eventExists(_eventId) returns (
    bool isActive,
    bool resultsRevealed,
    bool decryptionFailed,
    uint256 decryptionDeadline,
    uint256 currentTime
)
```

**Description:**
Gets current event status including failure and timeout information.

**Returns:**
| Name | Type | Description |
|------|------|-------------|
| isActive | bool | Is voting active |
| resultsRevealed | bool | Results published |
| decryptionFailed | bool | Decryption failed |
| decryptionDeadline | uint256 | Oracle timeout deadline |
| currentTime | uint256 | Current block timestamp |

**Gas:** ~3,000

---

### getCandidateInfo

**Function Signature:**
```solidity
function getCandidateInfo(uint32 _candidateId) external view returns (
    string memory name,
    string memory category,
    bool isActive
)
```

**Description:**
Gets candidate information.

**Returns:**
| Name | Type | Description |
|------|------|-------------|
| name | string | Candidate name |
| category | string | Candidate category |
| isActive | bool | Is candidate active |

**Gas:** ~3,000

---

### getVoterStatus

**Function Signature:**
```solidity
function getVoterStatus(uint32 _eventId, address _voter) external view returns (
    bool hasVoted,
    uint256 timestamp
)
```

**Description:**
Checks if voter has participated and when.

**Returns:**
| Name | Type | Description |
|------|------|-------------|
| hasVoted | bool | Has voter voted |
| timestamp | uint256 | Vote timestamp |

**Gas:** ~3,000

---

### isVotingActive

**Function Signature:**
```solidity
function isVotingActive(uint32 _eventId) external view eventExists(_eventId) returns (bool)
```

**Description:**
Checks if voting period is currently open.

**Gas:** ~3,000

---

### isRevealPeriodActive

**Function Signature:**
```solidity
function isRevealPeriodActive(uint32 _eventId) external view eventExists(_eventId) returns (bool)
```

**Description:**
Checks if reveal/decryption period is currently open.

**Gas:** ~3,000

---

### getCurrentTime

**Function Signature:**
```solidity
function getCurrentTime() external view returns (uint256)
```

**Description:**
Gets current block timestamp for client-side time synchronization.

**Gas:** ~100

---

## Events

### VoteCast
```solidity
event VoteCast(address indexed voter, uint32 indexed eventId)
```

### EventCreated
```solidity
event EventCreated(uint32 indexed eventId, string eventName, uint256 startTime, uint256 endTime)
```

### DecryptionRequested
```solidity
event DecryptionRequested(uint32 indexed eventId, uint256 requestId, uint256 deadline)
```

### DecryptionProcessed
```solidity
event DecryptionProcessed(uint32 indexed eventId, uint256 requestId, bool success)
```

### RefundIssued
```solidity
event RefundIssued(uint32 indexed eventId, address indexed voter, uint256 amount)
```

### DecryptionTimeout
```solidity
event DecryptionTimeout(uint32 indexed eventId, uint256 timestamp)
```

---

## Error Codes

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "Only admin" | Non-admin called admin function | Use admin wallet |
| "Not authorized" | Voter not whitelisted | Request admin authorization |
| "Already voted" | Voter already voted in event | Wait for next event |
| "Event does not exist" | Invalid event ID | Use valid event ID |
| "Voting not started" | Voting period hasn't begun | Wait for voting start |
| "Voting period ended" | Voting period has closed | Event is closed |
| "Candidate not active" | Candidate not registered | Register candidate first |
| "Candidate not in event" | Candidate not in this event | Choose from event candidates |
| "Results already revealed" | Results already published | Event is complete |
| "String cannot be empty" | Empty string parameter | Provide non-empty string |
| "String too long" | String exceeds 256 bytes | Shorten string |
| "Array cannot be empty" | Empty array parameter | Provide array items |
| "Array too long" | Array exceeds 100 items | Reduce array size |
| "No decryption request" | No pending decryption | Request decryption first |
| "Deadline not reached" | Timeout not yet reached | Wait for deadline |
| "Voter did not participate" | Voter didn't vote | Check voting status |
| "Decryption did not fail" | Refund not available | Decryption succeeded |
| "Reveal period not ended" | Still in reveal period | Wait for reveal end |
| "No refund available" | Already claimed refund | Can only claim once |

---

## Integration Example

```javascript
const Web3 = require('web3');
const web3 = new Web3('https://sepolia.infura.io/v3/YOUR_KEY');

// Contract ABI and address
const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

// 1. Admin: Add candidates
await contract.methods.addCandidate("Alice", "Sports").send({from: admin});
await contract.methods.addCandidate("Bob", "Sports").send({from: admin});

// 2. Admin: Create voting event
const eventId = await contract.methods.createVotingEvent(
  "Best Athlete 2024",
  "Annual voting",
  [1, 2]
).send({from: admin});

// 3. Admin: Authorize voters
await contract.methods.authorizeVoter(voter1).send({from: admin});
await contract.methods.authorizeVoter(voter2).send({from: admin});

// 4. Voter: Cast encrypted vote
await contract.methods.castVote(eventId, 1).send({from: voter1});

// 5. Admin: Request decryption
await contract.methods.requestVoteDecryption(eventId).send({from: admin});

// 6. Oracle: Automatically processes and calls callback

// 7. Frontend: Check results
const results = await contract.methods.getEventInfo(eventId).call();
console.log(`Winner: ${results.winnerId}`);
console.log(`Total votes: ${results.totalVotes}`);

// 8. If timeout: Handle refund
await contract.methods.handleDecryptionFailure(eventId).send({from: admin});
await contract.methods.requestRefund(eventId).send({from: voter1});
```

---

## Gas Estimation

| Function | Gas | Notes |
|----------|-----|-------|
| addCandidate | 50,000 | Minimal storage |
| createVotingEvent | 150,000 | +10,000 per candidate |
| castVote | 150,000 | FHE encryption cost |
| endVoting | 30,000 | State update |
| requestVoteDecryption | 200,000 | Oracle request |
| handleDecryptionFailure | 50,000 | Timeout handling |
| requestRefund | 50,000 | Refund transfer |
| authorizeVoter | 40,000 | Whitelist update |

Total estimated for full voting cycle: ~800,000 - 1,000,000 gas

---

## Security Considerations

1. **Always verify voter authorization before voting**
2. **Monitor DecryptionRequested events for timeout tracking**
3. **Check decryptionDeadline before assuming failure**
4. **Implement frontend timeout alerts**
5. **Store event IDs for audit trail**
6. **Verify results before publishing publicly**

