# Anonymous Sports Voting

A decentralized application for privacy-preserving sports awards voting using Fully Homomorphic Encryption (FHE) technology on the blockchain.

## 🌟 Overview

Anonymous Sports Voting is a revolutionary platform that enables secure, private, and transparent voting for sports events and awards. Built on Zama's fhEVM technology, it ensures complete voter anonymity while maintaining verifiable results.

## 🔐 Core Concepts

### Fully Homomorphic Encryption (FHE)

This project leverages FHE technology to perform computations on encrypted data without decryption. Votes are encrypted on-chain and tallied homomorphically, ensuring:

- **Complete Privacy**: Individual votes remain encrypted and anonymous
- **Verifiable Results**: Final tallies are accurate and tamper-proof
- **Trustless System**: No central authority can access individual vote data

### Smart Contract Architecture

The FHE-enabled smart contract manages:
- **Encrypted Vote Storage**: All votes are stored in encrypted form
- **Homomorphic Vote Tallying**: Vote counting happens on encrypted data
- **Time-based Phases**: Automatic voting period management
- **Access Control**: Only authorized voters can participate

## 🏆 Use Cases

### Privacy-Preserving Sports Awards

Perfect for conducting anonymous voting in:

- **Player of the Year Awards**: Fans and committee members vote privately
- **Best Team/Performance**: Community voting without influence
- **Hall of Fame Selection**: Anonymous peer and fan voting
- **MVP Awards**: Unbiased player recognition
- **Sports Journalism Awards**: Industry professional voting

## ✨ Key Features

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
- **Gas-Optimized**: Efficient contract design for cost savings
- **MetaMask Integration**: Easy wallet connection
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Technology Stack

- **Blockchain**: Ethereum-compatible networks
- **Encryption**: Zama fhEVM (Fully Homomorphic Encryption)
- **Smart Contracts**: Solidity with FHE libraries
- **Frontend**: Vanilla JavaScript with ethers.js
- **Development**: Hardhat framework

## 📋 Smart Contract Details

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

## 🎯 How It Works

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

## 🎬 Demo

**Live Demo**: [https://anonymous-sports-voting.vercel.app/](https://anonymous-sports-voting.vercel.app/)

**Video Demonstration**: Available - showcasing the complete voting workflow from event creation to result revelation.

## 🔗 Resources

- **GitHub Repository**: [https://github.com/MandyRippin/AnonymousSportsVoting](https://github.com/MandyRippin/AnonymousSportsVoting)
- **Live Application**: [https://anonymous-sports-voting.vercel.app/](https://anonymous-sports-voting.vercel.app/)
- **Zama fhEVM Docs**: [https://docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)

## 🌐 Network Support

The application supports Ethereum-compatible networks with fhEVM capabilities:
- Zama Devnet
- Zama Testnet
- Other fhEVM-enabled networks

## 🔒 Security Considerations

- All votes are encrypted using FHE before storage
- Smart contract audited for common vulnerabilities
- Time-locked phases prevent manipulation
- Access control restricts administrative functions
- Voter authorization prevents Sybil attacks

## 🤝 Contributing

Contributions are welcome! This project demonstrates cutting-edge privacy technology in decentralized voting systems.

## 📞 Support

For questions, issues, or feature requests, please visit the GitHub repository.

## 🙏 Acknowledgments

Built with [Zama's fhEVM](https://www.zama.ai/fhevm) technology, enabling privacy-preserving smart contracts through Fully Homomorphic Encryption.

---

**Empowering Democratic Sports Awards with Privacy-Preserving Technology**
