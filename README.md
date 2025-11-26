# Privacy-Preserving Voting System with FHE

A decentralized application for privacy-preserving voting using Fully Homomorphic Encryption (FHE) technology on the blockchain.

## Overview

This project leverages FHE technology to enable secure, private, and transparent voting. Built on Zama's fhEVM technology, it ensures complete voter anonymity while maintaining verifiable results.

[Live demo](https://anonymous-sports-voting.vercel.app/) [Demo video: demo.mp4]

**This repository contains two frontend implementations:**

| Feature | HTML/JavaScript | React TypeScript |
|---------|----------------|------------------|
| **Location** | Root directory (`index.html`) | `AnonymousSportsVoting/` |
| **Framework** | Vanilla JavaScript | React 18 + TypeScript |
| **Build Tool** | None (direct browser) | Vite 5 |
| **Development** | Open HTML file | `npm run dev` |
| **Type Safety** | ❌ No | ✅ Full TypeScript |
| **Hot Reload** | ❌ No | ✅ Yes |
| **Component Architecture** | ❌ Monolithic | ✅ Modular components |
| **SDK Integration** | ⚠️ Basic | ✅ @fhevm/universal-sdk |
| **Best For** | Quick testing, prototypes | Production applications |
| **Recommended** | 🔵 Learning/Testing | 🟢 Production Use |

## Core Concepts

### Fully Homomorphic Encryption (FHE)

This project uses FHE technology to perform computations on encrypted data without decryption. Votes are encrypted on-chain and tallied homomorphically, ensuring:

- **Complete Privacy**: Individual votes remain encrypted and anonymous
- **Verifiable Results**: Final tallies are accurate and tamper-proof
- **Trustless System**: No central authority can access individual vote data

### Smart Contract Architecture

The FHE-enabled smart contract manages:
- **Encrypted Vote Storage**: All votes are stored in encrypted form
- **Homomorphic Vote Tallying**: Vote counting happens on encrypted data
- **Time-based Phases**: Automatic voting period management
- **Access Control**: Only authorized voters can participate
- **Gateway Callback Pattern**: Asynchronous decryption via oracle
- **Timeout Protection**: Prevents permanent fund locking
- **Refund Mechanism**: Automatic refunds on decryption failure

## Technology Stack

### Backend & Smart Contracts
- **Blockchain**: Ethereum-compatible networks (Sepolia)
- **Encryption**: Zama fhEVM (Fully Homomorphic Encryption)
- **Smart Contracts**: Solidity 0.8.24 with FHE libraries
- **Development Framework**: Hardhat
- **Testing**: Hardhat Test Environment

### Frontend Applications

#### Original Implementation (index.html)
- **Frontend**: Vanilla JavaScript with ethers.js v5
- **Styling**: CSS with inline styles
- **Architecture**: Single-page HTML application

#### React Application (AnonymousSportsVoting/)
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5 for fast development and optimized builds
- **Blockchain Library**: ethers.js v6
- **FHEVM Integration**: @fhevm/universal-sdk
- **State Management**: React Hooks with custom hooks
- **Styling**: Modern CSS with gradients and animations
- **Type Safety**: Full TypeScript support with strict mode
- **Component Architecture**: Modular component design
  - 6 React components (WalletSection, AdminSection, VotingSection, etc.)
  - 2 custom hooks (useContract, useVotingEvent)
  - Type definitions and utilities

## Project Structure

This repository contains two frontend implementations of the same voting system:

### 1. Original HTML/JavaScript Implementation (Root Directory)
```
D:\
├── index.html              # Single-page application
├── contracts/              # Solidity smart contracts
├── scripts/                # Hardhat deployment scripts
├── hardhat.config.js       # Hardhat configuration
└── package.json            # Dependencies
```

**Run the original implementation:**
- Open `index.html` in a web browser with MetaMask installed
- Or use: `npx serve .` and navigate to `http://localhost:3000`

### 2. React TypeScript Application (AnonymousSportsVoting/)
```
AnonymousSportsVoting/
├── src/
│   ├── components/         # React components
│   │   ├── AdminSection.tsx
│   │   ├── CandidateCard.tsx
│   │   ├── ResultsSection.tsx
│   │   ├── StatusMessage.tsx
│   │   ├── VotingSection.tsx
│   │   └── WalletSection.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useContract.ts
│   │   └── useVotingEvent.ts
│   ├── lib/                # Utilities
│   ├── types/              # TypeScript definitions
│   ├── App.tsx             # Main component
│   ├── main.tsx            # Entry point
│   └── styles.css          # Global styles
├── contracts/              # Smart contracts (shared)
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

**Run the React application:**
```bash
cd AnonymousSportsVoting
npm install
npm run dev
```
Then open `http://localhost:5173`

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask or compatible Web3 wallet
- Sepolia testnet ETH

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit .env and add your configuration.

### Compilation

Compile the smart contracts:
```bash
npm run compile
```

### Testing

Run the test suite:
```bash
npm test
```

Run simulation on local network:
```bash
npm run simulate
```

### Deployment

Deploy to Sepolia Testnet:
```bash
npm run deploy
```

### Contract Verification

Verify the deployed contract on Etherscan:
```bash
npm run verify
```

### Contract Interaction

Interact with the deployed contract:
```bash
npm run interact
```

## Smart Contract Details

### Contract Address (Sepolia)

- **Address**: Check deployment-info.json after deployment
- **Network**: Sepolia Testnet
- **Chain ID**: 11155111

### Main Functions

#### Admin Functions

- `authorizeVoter(address voter)`: Grant voting permission to an address
- `revokeVoter(address voter)`: Revoke voting permission
- `addCandidate(string name, string category)`: Add a new candidate
- `createVotingEvent(...)`: Create new voting event
- `endVoting(uint32 eventId)`: End the voting period
- `requestVoteDecryption(uint32 eventId)`: Trigger Gateway callback for decryption
- `handleDecryptionFailure(uint32 eventId)`: Handle oracle timeout and enable refunds

#### Voter Functions

- `castVote(uint32 eventId, uint32 candidateId)`: Submit an encrypted vote
- `requestRefund(uint32 eventId)`: Claim refund when decryption fails

#### View Functions

- `getEventInfo(uint32 eventId)`: Retrieve event details
- `getEventStatus(uint32 eventId)`: Get decryption status and timeout info
- `getCandidateInfo(uint32 candidateId)`: Get candidate information
- `getVoterStatus(uint32 eventId, address voter)`: Check if voter has voted
- `isVotingActive(uint32 eventId)`: Check if voting is currently active
- `isRevealPeriodActive(uint32 eventId)`: Check if reveal period is active

## Available Scripts

### Smart Contract Scripts (Root Directory)
- `npm run compile` - Compile smart contracts
- `npm test` - Run test suite
- `npm run deploy` - Deploy to Sepolia testnet
- `npm run deploy:local` - Deploy to local network
- `npm run verify` - Verify contract on Etherscan
- `npm run interact` - Interact with deployed contract
- `npm run simulate` - Run simulation on local network
- `npm run node` - Start local Hardhat node
- `npm run clean` - Clean artifacts and cache
- `npm run coverage` - Generate test coverage report

### React Application Scripts (AnonymousSportsVoting/)
- `npm run dev` - Start development server with hot reload (port 5173)
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build
- `npm run compile` - Compile smart contracts
- `npm run deploy` - Deploy contracts to network
- `npm run test` - Run contract tests

## How It Works

### Voting Process

1. **Event Creation**: Admin creates a voting event with candidates
2. **Voter Authorization**: Eligible voters are authorized by admin
3. **Anonymous Voting**: Voters cast encrypted votes during voting period
4. **Vote Tallying**: Homomorphic computation counts votes on encrypted data
5. **Decryption Request**: Admin triggers Gateway callback for decryption
6. **Oracle Processing**: Gateway decrypts votes and calls contract callback
7. **Result Reveal**: Decrypted results are published on-chain
8. **Refund (if needed)**: Voters claim refunds if decryption fails

### Gateway Callback Pattern

The system implements an asynchronous decryption architecture:

```
User Vote → Encrypted Storage → Admin Request → Gateway Oracle → Callback → Results
                                                    ↓
                                         [If Timeout] → Refund Mechanism
```

**Key Benefits:**
- Non-blocking vote submission
- Oracle-based trusted decryption
- Automatic timeout handling
- Voter fund protection

### Timeout Protection

| Phase | Duration | Description |
|-------|----------|-------------|
| Voting | 7 days | Active voting period |
| Reveal | 1 day | Decryption request window |
| Decryption Timeout | 3 days | Oracle response deadline |

If the oracle fails to respond within the deadline, voters can claim full refunds.

### Privacy Guarantees

- **Vote Secrecy**: Individual votes are never revealed
- **Encrypted Tally**: Vote counts are computed on encrypted data
- **Delayed Decryption**: Results only revealed after voting closes
- **Immutable Record**: All actions are recorded on blockchain
- **Cryptographic Verification**: Oracle responses verified with signatures

## Use Cases

Perfect for conducting anonymous voting in:

- Community Governance: DAO voting and proposals
- Awards and Recognition: Anonymous selection processes
- Organizational Decisions: Internal company voting
- Public Polls: Survey and opinion collection
- Election Systems: Democratic voting processes

## Key Features

### For Voters
- Anonymous voting without revealing identity or choice
- One vote per event for fair democratic process
- Real-time voting status tracking
- Transparent and verifiable results

### For Administrators
- Easy event creation and management
- Flexible candidate registration
- Granular voter authorization control
- Automated time-based voting phases

### Technical Features
- Encrypted on-chain storage using FHE
- Gas-optimized contract design
- MetaMask integration
- Responsive web interface
- Comprehensive test coverage
- Gateway callback pattern for async decryption
- Timeout protection with refund mechanism
- Input validation and overflow protection
- Cryptographic proof verification

## Choosing Between Implementations

### Use the Original HTML Implementation When:
- ✅ You need a simple, lightweight solution
- ✅ No build process required
- ✅ Quick prototyping or testing
- ✅ Hosting on simple static servers
- ✅ Minimal dependencies preferred

### Use the React TypeScript Implementation When:
- ✅ Building a production application
- ✅ Need type safety and better IDE support
- ✅ Want modular, maintainable code
- ✅ Planning to extend functionality
- ✅ Prefer modern development workflow
- ✅ Need hot module replacement during development
- ✅ Want to integrate FHEVM SDK properly
- ✅ Require component-based architecture

**Recommendation:** For new projects or production use, the **React TypeScript implementation** (`AnonymousSportsVoting/`) is recommended as it provides better code organization, type safety, and maintainability.

## Security Considerations

- All votes are encrypted using FHE before storage
- Time-locked phases prevent manipulation
- Access control restricts administrative functions
- Voter authorization prevents Sybil attacks
- **Input Validation**: String length (1-256 bytes) and array length (1-100 items) limits
- **Overflow Protection**: Safe arithmetic with explicit bounds checking
- **Reentrancy Prevention**: Checks-Effects-Interactions pattern for refunds
- **Timeout Protection**: Three-layer timeout system prevents permanent fund locking
- **Cryptographic Verification**: Oracle responses validated with `FHE.checkSignatures()`

### Security Documents

- **[SECURITY.md](./SECURITY.md)**: Comprehensive security analysis and threat model
- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: System architecture and design patterns
- **[API.md](./API.md)**: Smart contract API reference

## Deployment Guide

For detailed deployment instructions, see DEPLOYMENT.md

## React Application Features

The React TypeScript implementation (`AnonymousSportsVoting/`) includes additional features:

### Enhanced User Experience
- **Component-Based UI**: Modular, reusable React components
- **Auto-Dismiss Notifications**: Toast messages with smooth animations
- **Loading States**: Visual feedback during transactions
- **Error Handling**: Comprehensive error messages and recovery

### Developer Experience
- **Hot Module Replacement**: Instant updates during development
- **TypeScript IntelliSense**: Full autocomplete and type checking
- **Custom Hooks**: Reusable state management logic
  - `useContract`: Manages wallet connection and contract instance
  - `useVotingEvent`: Handles event loading and state
- **Vite Build Tool**: Fast builds and optimized production bundles

### Code Quality
- **Type Safety**: All components and functions fully typed
- **Modular Architecture**: Clean separation of concerns
- **Utility Functions**: Helper functions for formatting and validation
- **Constants Management**: Centralized contract ABI and addresses

### Documentation
- Comprehensive README with installation and usage
- Quick start guide (QUICKSTART.md)
- Inline code comments and JSDoc
- Component and hook documentation

For detailed information about the React implementation, see:
- `AnonymousSportsVoting/README.md` - Full documentation
- `AnonymousSportsVoting/QUICKSTART.md` - Quick start guide

## Advanced Features

### Gateway Callback Architecture

The contract implements an innovative asynchronous decryption pattern:

1. **Request Phase**: Admin calls `requestVoteDecryption()` after voting ends
2. **Oracle Phase**: Gateway network processes encrypted vote tallies
3. **Callback Phase**: Oracle calls `processVoteResults()` with decrypted values
4. **Verification Phase**: Contract verifies cryptographic proof before accepting

### Refund Mechanism

When decryption fails (oracle timeout or error):

```solidity
// Admin marks failure after timeout
await contract.handleDecryptionFailure(eventId);

// Voters claim refunds
await contract.requestRefund(eventId);
```

### Privacy Techniques

| Problem | Solution |
|---------|----------|
| Division information leakage | Random multiplier obfuscation |
| Price/value exposure | Fuzzy computation techniques |
| Async processing | Gateway callback pattern |
| Gas optimization | Efficient HCU (Homomorphic Compute Unit) usage |

## Resources

- **React Documentation**: https://react.dev/
- **Vite Documentation**: https://vitejs.dev/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Hardhat Documentation**: https://hardhat.org/docs
- **Zama fhEVM Documentation**: https://docs.zama.ai/fhevm
- **ethers.js v6 Documentation**: https://docs.ethers.org/v6/
- **Etherscan API**: https://docs.etherscan.io/
- **Sepolia Faucet**: https://sepoliafaucet.com/

## License

This project is licensed under the MIT License.

## Acknowledgments

Built with Zama's fhEVM technology, enabling privacy-preserving smart contracts through Fully Homomorphic Encryption.
