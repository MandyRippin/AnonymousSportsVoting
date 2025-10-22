# Deployment Documentation

This document provides comprehensive information about deploying and managing the Privacy Voting FHE smart contract.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Deployment Process](#deployment-process)
- [Contract Verification](#contract-verification)
- [Deployment Information](#deployment-information)
- [Post-Deployment Tasks](#post-deployment-tasks)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying the contract, ensure you have the following:

1. **Node.js**: Version 16.x or higher
2. **npm**: Version 7.x or higher
3. **Hardhat**: Installed as a dev dependency
4. **Wallet**: An Ethereum wallet with sufficient funds for deployment
5. **RPC Provider**: Access to Sepolia testnet RPC (e.g., Infura, Alchemy)
6. **Etherscan API Key**: For contract verification

## Environment Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Wallet Configuration
PRIVATE_KEY=your_private_key_here

# Network RPC URLs
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY

# Etherscan API Key
ETHERSCAN_API_KEY=your_etherscan_api_key

# Optional: Gas Reporting
REPORT_GAS=true
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
```

### 3. Security Considerations

- **Never commit `.env` file** to version control
- Use a dedicated deployment wallet with limited funds
- Store private keys securely (consider hardware wallets for production)
- Test on testnet before mainnet deployment

## Deployment Process

### 1. Compile Contracts

```bash
npm run compile
```

This will:
- Compile all Solidity contracts
- Generate artifacts and typechain files
- Display any compilation warnings or errors

### 2. Deploy to Local Network (Testing)

```bash
# Start local Hardhat node
npm run node

# In another terminal, deploy
npm run deploy:local
```

### 3. Deploy to Sepolia Testnet

```bash
npm run deploy
```

Expected output:
```
=== Starting Deployment ===

Deploying contracts with account: 0x...
Account balance: 1.234567890123456789 ETH
Network: sepolia

Deploying contract...
Contract deployed to: 0x3825C6a1BAf65d3fF39C3e0cEbbe4b76D2567488

✓ Deployment info saved to deployment-info.json

Waiting for block confirmations...
Verifying contract on Etherscan...
✓ Contract verified successfully

=== Initializing Contract ===
Adding candidates...
✓ Added candidate 1: Outstanding Athlete
✓ Added candidate 2: Rising Star
✓ Added candidate 3: Team Player
✓ Added candidate 4: Coach Excellence

Creating voting event...
✓ Created voting event: Annual Awards 2024

=== Deployment Complete ===
```

### 4. Verify Deployment Information

After deployment, a `deployment-info.json` file is created:

```json
{
  "contractName": "AnonymousSportsVoting",
  "contractAddress": "0x3825C6a1BAf65d3fF39C3e0cEbbe4b76D2567488",
  "deployer": "0x...",
  "network": "sepolia",
  "chainId": 11155111,
  "deploymentTime": "2024-01-15T10:30:00.000Z",
  "blockNumber": 1234567,
  "constructorArgs": []
}
```

## Contract Verification

### Automatic Verification

The deploy script automatically verifies the contract on Etherscan. If it fails, you can verify manually:

```bash
npm run verify
```

### Manual Verification via Hardhat

```bash
npx hardhat verify --network sepolia 0x3825C6a1BAf65d3fF39C3e0cEbbe4b76D2567488
```

### Verification Status

Check verification at:
- **Sepolia**: https://sepolia.etherscan.io/address/0x3825C6a1BAf65d3fF39C3e0cEbbe4b76D2567488#code

## Deployment Information

### Network: Sepolia Testnet

- **Contract Address**: `0x3825C6a1BAf65d3fF39C3e0cEbbe4b76D2567488`
- **Network**: Sepolia
- **Chain ID**: 11155111
- **Block Explorer**: [Etherscan](https://sepolia.etherscan.io/address/0x3825C6a1BAf65d3fF39C3e0cEbbe4b76D2567488)

### Constructor Arguments

The contract has no constructor arguments.

### Initial Configuration

After deployment, the contract is initialized with:
- **Admin**: Deployer address (automatically authorized)
- **Sample Candidates**: 4 demo candidates added
- **Sample Event**: 1 voting event created

## Post-Deployment Tasks

### 1. Interact with Contract

```bash
npm run interact
```

This script displays:
- Contract information (admin, event IDs, candidate IDs)
- Voter authorization status
- Event details
- Candidate information
- Voting status

### 2. Run Simulation (Local Testing)

```bash
npm run simulate
```

Simulates a complete workflow:
- Deploy contract
- Add candidates
- Create voting event
- Authorize voters
- Cast votes

### 3. Authorize Additional Voters

Using the interact script or directly via ethers.js:

```javascript
const tx = await contract.authorizeVoter("0xVoterAddress");
await tx.wait();
```

### 4. Monitor Events

Listen to contract events:

```javascript
contract.on("VoteCast", (voter, eventId) => {
  console.log(`Vote cast by ${voter} for event ${eventId}`);
});

contract.on("ResultsRevealed", (eventId, winnerId, totalVotes) => {
  console.log(`Results: Event ${eventId}, Winner: ${winnerId}, Votes: ${totalVotes}`);
});
```

## Contract Functions

### Admin Functions

- `authorizeVoter(address)`: Grant voting permission
- `revokeVoter(address)`: Revoke voting permission
- `addCandidate(name, category)`: Add new candidate
- `createVotingEvent(name, description, candidateIds)`: Create voting event
- `endVoting(eventId)`: End voting period
- `requestVoteDecryption(eventId)`: Trigger result revelation

### Voter Functions

- `castVote(eventId, candidateId)`: Submit encrypted vote

### View Functions

- `getEventInfo(eventId)`: Get event details
- `getCandidateInfo(candidateId)`: Get candidate information
- `getVoterStatus(eventId, voter)`: Check voting status
- `isVotingActive(eventId)`: Check if voting is active
- `isRevealPeriodActive(eventId)`: Check if reveal period is active

## Troubleshooting

### Deployment Fails

**Issue**: Insufficient funds
```
Error: insufficient funds for intrinsic transaction cost
```
**Solution**: Add more ETH to deployer wallet

**Issue**: Nonce too low
```
Error: nonce has already been used
```
**Solution**: Reset Hardhat or wait for pending transactions

### Verification Fails

**Issue**: Contract already verified
```
Error: Contract source code already verified
```
**Solution**: This is normal - verification was successful previously

**Issue**: Invalid API key
```
Error: Invalid API Key
```
**Solution**: Check ETHERSCAN_API_KEY in .env file

### Interaction Fails

**Issue**: deployment-info.json not found
```
Error: deployment-info.json not found!
```
**Solution**: Run deployment script first: `npm run deploy`

**Issue**: Network mismatch
```
Error: network does not match
```
**Solution**: Ensure you're using the same network as deployment

## Best Practices

1. **Test First**: Always test on local network before testnet
2. **Verify Immediately**: Verify contracts on Etherscan after deployment
3. **Document Changes**: Update deployment-info.json for any redeployments
4. **Monitor Gas**: Use gas reporter to optimize contract interactions
5. **Backup Keys**: Keep secure backups of deployment information
6. **Gradual Rollout**: Start with limited users before full launch

## Resources

- **Hardhat Documentation**: https://hardhat.org/docs
- **Etherscan API**: https://docs.etherscan.io/
- **Zama fhEVM**: https://docs.zama.ai/fhevm
- **Sepolia Faucet**: https://sepoliafaucet.com/

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Hardhat documentation
3. Consult the project README.md
4. Check deployment-info.json for contract details
