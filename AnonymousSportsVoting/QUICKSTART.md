# Quick Start Guide

This guide will help you get the Anonymous Sports Voting React application up and running quickly.

## Prerequisites

- Node.js 18+ installed
- MetaMask browser extension
- Access to an FHEVM-compatible network (Zama testnet/devnet)

## Installation

1. **Navigate to the project directory**:
```bash
cd examples/AnonymousSportsVoting
```

2. **Install dependencies**:
```bash
npm install
```

## Running the Application

### Development Mode

Start the development server with hot reload:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

Build the optimized production bundle:

```bash
npm run build
npm run preview
```

## First Time Setup

### 1. Connect Your Wallet

- Click "Connect MetaMask" button
- Approve the connection request in MetaMask
- Ensure you're connected to an FHEVM-compatible network

### 2. Admin Setup (Contract Owner)

If you're the contract administrator, you'll see the admin section with additional controls:

**Add Candidates:**
1. Enter candidate name (e.g., "Lionel Messi")
2. Enter category (e.g., "Football")
3. Click "Add Candidate"
4. Wait for transaction confirmation

**Authorize Voters:**
1. Enter voter's Ethereum address
2. Click "Authorize Voter"
3. Wait for transaction confirmation

**Create Voting Event:**
1. Enter event name (e.g., "Best Football Player 2024")
2. Enter description
3. Select at least 2 candidates by clicking them
4. Click "Create Voting Event"
5. Wait for transaction confirmation

### 3. Voting (Authorized Users)

Once a voting event is active:

1. View the event details and candidates
2. Click on your preferred candidate to select them
3. Click "Submit Vote"
4. Confirm the transaction in MetaMask
5. Wait for confirmation

### 4. Revealing Results (Admin)

After voting period ends:

1. Click "End Current Voting" button
2. Wait for the reveal period to begin
3. Click "Reveal Results" button
4. Results will be displayed after decryption

## Smart Contract Operations

### Deploy New Contract

If you need to deploy your own contract:

```bash
npm run compile
npm run deploy
```

Update the contract address in `src/lib/contract.ts` after deployment.

### Run Tests

```bash
npm run test
```

## Project Structure Overview

```
src/
├── components/      # React UI components
├── hooks/          # Custom React hooks for contract interaction
├── lib/            # Utilities and constants
├── types/          # TypeScript type definitions
├── App.tsx         # Main application component
├── main.tsx        # Application entry point
└── styles.css      # Global styles
```

## Common Issues

### MetaMask Not Detected

**Solution**: Install MetaMask extension and refresh the page

### Wrong Network

**Solution**: Switch to FHEVM-compatible network in MetaMask

### Transaction Failures

**Possible causes**:
- Insufficient gas
- Not authorized to perform action
- Voting period ended/not started
- Already voted in current event

**Solution**: Check error message and ensure you meet all requirements

### FHEVM Initialization Failed

**Solution**: Ensure you're connected to an FHEVM-compatible network

## Development Tips

### Hot Reload

The development server supports hot module replacement (HMR). Changes to components will update automatically without page reload.

### TypeScript

The project uses TypeScript for type safety. Check `src/types/index.ts` for all type definitions.

### Custom Hooks

- `useContract`: Manages wallet connection and contract instance
- `useVotingEvent`: Handles voting event state and operations

### Component Structure

Components are organized by functionality:
- **WalletSection**: Wallet connection UI
- **AdminSection**: Admin controls
- **VotingSection**: Voting interface
- **ResultsSection**: Results display
- **CandidateCard**: Individual candidate card
- **StatusMessage**: Toast notifications

## Environment Configuration

The contract address is configured in `src/lib/contract.ts`. Update this file if you deploy a new contract:

```typescript
export const CONTRACT_ADDRESS = "0xYourContractAddress";
```

## Additional Resources

- [Full Documentation](./README.md)
- [Zama FHEVM Docs](https://docs.zama.ai/fhevm)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [ethers.js Documentation](https://docs.ethers.org)

## Support

For issues or questions:
1. Check the console for error messages
2. Review the full README.md
3. Check that your wallet is properly configured
4. Ensure you're on the correct network

---

Happy Voting! 🗳️
