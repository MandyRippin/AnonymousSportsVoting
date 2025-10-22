const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=== Starting Deployment ===\n");

  // Get the ContractFactory and Signers
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
  console.log("Network:", hre.network.name, "\n");

  // Deploy the contract
  console.log("Deploying contract...");
  const Contract = await hre.ethers.getContractFactory("AnonymousSportsVoting");
  const contract = await Contract.deploy();

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("Contract deployed to:", contractAddress);

  // Save deployment information
  const deploymentInfo = {
    contractName: "AnonymousSportsVoting",
    contractAddress: contractAddress,
    deployer: deployer.address,
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deploymentTime: new Date().toISOString(),
    blockNumber: await deployer.provider.getBlockNumber(),
    constructorArgs: []
  };

  const deploymentPath = path.join(__dirname, "../deployment-info.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n✓ Deployment info saved to deployment-info.json");

  // Verify the contract on Etherscan if not on local network
  if (hre.network.name !== "hardhat" && hre.network.name !== "localfhenix") {
    console.log("\nWaiting for block confirmations...");
    await contract.deploymentTransaction().wait(6);

    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✓ Contract verified successfully");
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log("✓ Contract already verified");
      } else {
        console.log("✗ Verification failed:", error.message);
      }
    }
  }

  // Initialize with sample data
  console.log("\n=== Initializing Contract ===");

  try {
    // Add sample candidates
    console.log("Adding candidates...");
    let tx = await contract.addCandidate("Outstanding Athlete", "Best Performance");
    await tx.wait();
    console.log("✓ Added candidate 1: Outstanding Athlete");

    tx = await contract.addCandidate("Rising Star", "Newcomer Award");
    await tx.wait();
    console.log("✓ Added candidate 2: Rising Star");

    tx = await contract.addCandidate("Team Player", "Team Spirit");
    await tx.wait();
    console.log("✓ Added candidate 3: Team Player");

    tx = await contract.addCandidate("Coach Excellence", "Leadership Award");
    await tx.wait();
    console.log("✓ Added candidate 4: Coach Excellence");

    // Create a sample voting event
    console.log("\nCreating voting event...");
    const candidateIds = [1, 2, 3, 4];
    tx = await contract.createVotingEvent(
      "Annual Awards 2024",
      "Vote for the best performers in various categories this year",
      candidateIds
    );
    await tx.wait();
    console.log("✓ Created voting event: Annual Awards 2024");

    console.log("\n=== Deployment Complete ===");
    console.log("\nContract Information:");
    console.log("  Address:", contractAddress);
    console.log("  Network:", hre.network.name);
    console.log("  Admin:", deployer.address);
    
    if (hre.network.name === "sepolia") {
      console.log("\nEtherscan:");
      console.log("  Contract:", "https://sepolia.etherscan.io/address/" + contractAddress);
      console.log("  Deployer:", "https://sepolia.etherscan.io/address/" + deployer.address);
    }

    console.log("\nAvailable Functions:");
    console.log("  - authorizeVoter(address): Grant voting permission");
    console.log("  - castVote(eventId, candidateId): Submit encrypted vote");
    console.log("  - getEventInfo(eventId): Get event details");
    console.log("  - getCandidateInfo(candidateId): Get candidate information");
    console.log("\nNext Steps:");
    console.log("  1. Run 'npm run verify' to verify on Etherscan (if not already done)");
    console.log("  2. Run 'npm run interact' to interact with the contract");
    console.log("  3. Check DEPLOYMENT.md for detailed deployment documentation\n");

  } catch (error) {
    console.log("\n✗ Initialization failed:", error.message);
    console.log("Contract deployed but not initialized. You can initialize manually.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
