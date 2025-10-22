# Privacy-Preserving Voting System with FHE

A decentralized application for privacy-preserving voting using Fully Homomorphic Encryption (FHE) technology on the blockchain.

## Overview

This project leverages FHE technology to enable secure, private, and transparent voting. Built on Zama's fhEVM technology, it ensures complete voter anonymity while maintaining verifiable results.

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

## Technology Stack

- **Blockchain**: Ethereum-compatible networks (Sepolia)
- **Encryption**: Zama fhEVM (Fully Homomorphic Encryption)
- **Smart Contracts**: Solidity 0.8.24 with FHE libraries
- **Development Framework**: Hardhat
- **Frontend**: Vanilla JavaScript with ethers.js
- **Testing**: Hardhat Test Environment

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

- authorizeVoter(address voter): Grant voting permission to an address
- revokeVoter(address voter): Revoke voting permission
- addCandidate(string name, string category): Add a new candidate
- createVotingEvent(...): Create new voting event
- endVoting(uint32 eventId): End the voting period
- requestVoteDecryption(uint32 eventId): Trigger result revelation

#### Voter Functions

- castVote(uint32 eventId, uint32 candidateId): Submit an encrypted vote

#### View Functions

- getEventInfo(uint32 eventId): Retrieve event details
- getCandidateInfo(uint32 candidateId): Get candidate information
- getVoterStatus(uint32 eventId, address voter): Check if voter has voted
- isVotingActive(uint32 eventId): Check if voting is currently active
- isRevealPeriodActive(uint32 eventId): Check if reveal period is active

## Available Scripts

- npm run compile - Compile smart contracts
- npm test - Run test suite
- npm run deploy - Deploy to Sepolia testnet
- npm run deploy:local - Deploy to local network
- npm run verify - Verify contract on Etherscan
- npm run interact - Interact with deployed contract
- npm run simulate - Run simulation on local network
- npm run node - Start local Hardhat node
- npm run clean - Clean artifacts and cache
- npm run coverage - Generate test coverage report

## How It Works

### Voting Process

1. Event Creation: Admin creates a voting event with candidates
2. Voter Authorization: Eligible voters are authorized by admin
3. Anonymous Voting: Voters cast encrypted votes during voting period
4. Vote Tallying: Homomorphic computation counts votes on encrypted data
5. Result Reveal: Admin triggers decryption after voting ends
6. Winner Announcement: Results are published on-chain

### Privacy Guarantees

- Vote Secrecy: Individual votes are never revealed
- Encrypted Tally: Vote counts are computed on encrypted data
- Delayed Decryption: Results only revealed after voting closes
- Immutable Record: All actions are recorded on blockchain

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

## Security Considerations

- All votes are encrypted using FHE before storage
- Time-locked phases prevent manipulation
- Access control restricts administrative functions
- Voter authorization prevents Sybil attacks

## Deployment Guide

For detailed deployment instructions, see DEPLOYMENT.md

## Resources

- Hardhat Documentation: https://hardhat.org/docs
- Zama fhEVM Documentation: https://docs.zama.ai/fhevm
- Etherscan API: https://docs.etherscan.io/
- Sepolia Faucet: https://sepoliafaucet.com/

## License

This project is licensed under the MIT License.

## Acknowledgments

Built with Zama's fhEVM technology, enabling privacy-preserving smart contracts through Fully Homomorphic Encryption.
