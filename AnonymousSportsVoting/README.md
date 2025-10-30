# Anonymous Sports Voting - React Application

A decentralized application for privacy-preserving sports awards voting using Fully Homomorphic Encryption (FHE) technology on the blockchain, built with React and TypeScript.

## Overview

Anonymous Sports Voting is a revolutionary platform that enables secure, private, and transparent voting for sports events and awards. Built on Zama's fhEVM technology with React and the Universal FHEVM SDK, it ensures complete voter anonymity while maintaining verifiable results.

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Blockchain Library**: ethers.js v6
- **FHEVM Integration**: @fhevm/universal-sdk
- **Smart Contracts**: Solidity with FHE libraries
- **Development**: Hardhat framework
- **Styling**: CSS with modern gradients and animations

## Project Structure

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
│   ├── hooks/             # Custom React hooks
│   │   ├── useContract.ts
│   │   └── useVotingEvent.ts
│   ├── lib/               # Utilities and constants
│   │   ├── contract.ts
│   │   └── utils.ts
│   ├── types/             # TypeScript type definitions
│   │   ├── index.ts
│   │   └── vite-env.d.ts
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Entry point
│   └── styles.css         # Global styles
├── contracts/             # Solidity smart contracts
│   └── AnonymousSportsVoting.sol
├── scripts/               # Deployment scripts
├── index.html             # HTML entry point
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── README.md             # Documentation

```

## Features

### For Voters
- **Anonymous Voting**: Cast votes without revealing identity or choice
- **One Vote Per Event**: Fair democratic process
- **Real-time Status**: Track voting phases and participation
- **Transparent Results**: Verifiable outcomes after reveal period

### For Administrators
- **Event Management**: Create and configure voting events
- **Candidate Registration**: Add and manage nominees
- **Voter Authorization**: Control who can participate
- **Result Revelation**: Trigger decryption at appropriate time

### Technical Features
- **Encrypted On-Chain Storage**: All sensitive data protected by FHE
- **React Hooks**: Modern state management with custom hooks
- **TypeScript**: Type-safe development
- **FHEVM SDK Integration**: Proper encryption handling
- **Responsive Design**: Works on desktop and mobile devices

## Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment**:
Update the contract address in `src/lib/contract.ts` if needed.

3. **Start development server**:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build
- `npm run compile` - Compile smart contracts
- `npm run deploy` - Deploy contracts to network
- `npm run test` - Run contract tests

## Smart Contract Details

**Contract Address**: `0x3825C6a1BAf65d3fF39C3e0cEbbe4b76D2567488`

### Main Functions

**Voter Functions:**
- `castVote(eventId, candidateId)`: Submit encrypted vote
- `getVoterStatus(eventId, voter)`: Check voting status

**Admin Functions:**
- `createVotingEvent(name, description, candidateIds)`: Initialize new event
- `addCandidate(name, category)`: Register nominee
- `authorizeVoter(address)`: Grant voting permission
- `endVoting(eventId)`: Close voting period
- `requestVoteDecryption(eventId)`: Reveal results

**View Functions:**
- `getEventInfo(eventId)`: Retrieve event details
- `getCandidateInfo(candidateId)`: Get candidate information
- `isVotingActive(eventId)`: Check voting status

## How It Works

### Voting Process

1. **Event Creation**: Admin creates voting event with candidates
2. **Voter Authorization**: Eligible voters are authorized
3. **Anonymous Voting**: Voters cast encrypted votes
4. **Vote Tallying**: Homomorphic computation counts votes
5. **Result Reveal**: Admin triggers decryption after voting ends
6. **Winner Announcement**: Results published on-chain

### Privacy Guarantees

- **Vote Secrecy**: Individual votes never revealed
- **Encrypted Tally**: Vote counts computed on encrypted data
- **Delayed Decryption**: Results only revealed after voting closes
- **Immutable Record**: All actions recorded on blockchain

## React Components

### Core Components

- **App.tsx**: Main application with FhevmProvider wrapper
- **WalletSection**: Wallet connection and network info
- **AdminSection**: Admin controls for event and candidate management
- **VotingSection**: Voting interface with candidate selection
- **ResultsSection**: Display voting results and winners
- **CandidateCard**: Individual candidate display
- **StatusMessage**: Toast notifications with auto-dismiss

### Custom Hooks

- **useContract**: Manages contract connection, wallet, and admin status
- **useVotingEvent**: Loads and manages voting event state

### Utilities

- **contract.ts**: Contract ABI and address constants
- **utils.ts**: Helper functions for formatting and validation

## Fully Homomorphic Encryption (FHE)

This project leverages FHE technology to perform computations on encrypted data without decryption. Votes are encrypted on-chain and tallied homomorphically, ensuring:

- **Complete Privacy**: Individual votes remain encrypted and anonymous
- **Verifiable Results**: Final tallies are accurate and tamper-proof
- **Trustless System**: No central authority can access individual vote data

## Network Support

The application supports Ethereum-compatible networks with fhEVM capabilities:
- Zama Devnet
- Zama Testnet
- Other fhEVM-enabled networks

## Security Considerations

- All votes are encrypted using FHE before storage
- Smart contract follows best practices
- Time-locked phases prevent manipulation
- Access control restricts administrative functions
- Voter authorization prevents Sybil attacks

## Browser Requirements

- MetaMask or compatible Web3 wallet
- Modern browser with ES2020 support
- JavaScript enabled

## Development

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Type Checking

The project uses TypeScript for type safety. The build process includes type checking.

### Styling

The application uses vanilla CSS with:
- CSS Grid and Flexbox for layout
- CSS custom properties for theming
- Smooth transitions and animations
- Responsive design breakpoints

## Contributing

Contributions are welcome! This project demonstrates cutting-edge privacy technology in decentralized voting systems.

## Acknowledgments

Built with [Zama's fhEVM](https://www.zama.ai/fhevm) technology, enabling privacy-preserving smart contracts through Fully Homomorphic Encryption.

---

**Empowering Democratic Sports Awards with Privacy-Preserving Technology**
