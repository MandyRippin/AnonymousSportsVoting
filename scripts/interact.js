const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Script to interact with deployed contract
 * Usage: npx hardhat run scripts/interact.js --network sepolia
 */

async function main() {
  console.log("Starting contract interaction...\n");

  // Check if deployment info exists
  const deploymentPath = path.join(__dirname, "../deployment-info.json");
  
  if (!fs.existsSync(deploymentPath)) {
    console.error("Error: deployment-info.json not found!");
    console.log("Please deploy the contract first using: npm run deploy");
    process.exit(1);
  }

  // Read deployment info
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;

  console.log("Network:", hre.network.name);
  console.log("Contract Address:", contractAddress, "\n");

  // Get contract instance
  const [signer] = await hre.ethers.getSigners();
  console.log("Interacting with account:", signer.address);
  
  const balance = await signer.provider.getBalance(signer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  const Contract = await hre.ethers.getContractFactory("AnonymousSportsVoting");
  const contract = Contract.attach(contractAddress);

  try {
    // Get contract admin
    console.log("=== Contract Information ===");
    const admin = await contract.admin();
    console.log("Admin:", admin);

    const currentEventId = await contract.currentEventId();
    console.log("Current Event ID:", currentEventId.toString());

    const nextCandidateId = await contract.nextCandidateId();
    console.log("Next Candidate ID:", nextCandidateId.toString(), "\n");

    // Check authorization
    console.log("=== Voter Authorization ===");
    const isAuthorized = await contract.authorizedVoters(signer.address);
    console.log("Is", signer.address, "authorized:", isAuthorized, "\n");

    // Get event info if events exist
    if (currentEventId > 0) {
      console.log("=== Event Information ===");
      const eventInfo = await contract.getEventInfo(1);
      console.log("Event Name:", eventInfo[0]);
      console.log("Description:", eventInfo[1]);
      console.log("Start Time:", new Date(Number(eventInfo[2]) * 1000).toLocaleString());
      console.log("End Time:", new Date(Number(eventInfo[3]) * 1000).toLocaleString());
      console.log("Is Active:", eventInfo[6]);
      console.log("Results Revealed:", eventInfo[7]);
      console.log("Candidate IDs:", "[" + eventInfo[8].join(", ") + "]");
      console.log("Total Votes:", eventInfo[9].toString());
      console.log("Winner ID:", eventInfo[10].toString(), "\n");
    }

    // Get candidate info if candidates exist
    if (nextCandidateId > 1) {
      console.log("=== Candidate Information ===");
      for (let i = 1; i < Number(nextCandidateId); i++) {
        const candidateInfo = await contract.getCandidateInfo(i);
        console.log("Candidate", i + ":");
        console.log("  Name:", candidateInfo[0]);
        console.log("  Category:", candidateInfo[1]);
        console.log("  Is Active:", candidateInfo[2]);
      }
      console.log();
    }

    // Check voting status
    if (currentEventId > 0) {
      console.log("=== Voting Status ===");
      const isVotingActive = await contract.isVotingActive(1);
      console.log("Is voting active for Event 1:", isVotingActive);
      
      const isRevealActive = await contract.isRevealPeriodActive(1);
      console.log("Is reveal period active for Event 1:", isRevealActive);
      
      const voterStatus = await contract.getVoterStatus(1, signer.address);
      console.log("Has", signer.address, "voted:", voterStatus[0]);
      if (voterStatus[0]) {
        console.log("Vote timestamp:", new Date(Number(voterStatus[1]) * 1000).toLocaleString());
      }
    }

    console.log("\n=== Interaction Complete ===");

  } catch (error) {
    console.error("Error during interaction:");
    console.error(error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
