const hre = require("hardhat");

async function main() {
  console.log("Deploying Anonymous Sports Voting contract...");

  // Get the ContractFactory and Signers here.
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy the contract
  const AnonymousSportsVoting = await hre.ethers.getContractFactory("AnonymousSportsVoting");
  const votingContract = await AnonymousSportsVoting.deploy();

  await votingContract.waitForDeployment();

  const contractAddress = await votingContract.getAddress();
  console.log("Anonymous Sports Voting contract deployed to:", contractAddress);

  // Verify the contract on Etherscan if not on local network
  if (hre.network.name !== "hardhat" && hre.network.name !== "localfhenix") {
    console.log("Waiting for block confirmations...");
    await votingContract.deploymentTransaction().wait(6);

    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("Contract verified successfully");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }

  // Initialize with some sample data
  console.log("\nInitializing with sample sports categories and candidates...");

  try {
    // Add some sample candidates
    const tx1 = await votingContract.addCandidate("Outstanding Athlete", "Best Performance");
    await tx1.wait();
    console.log("Added candidate 1: Outstanding Athlete");

    const tx2 = await votingContract.addCandidate("Rising Star", "Newcomer Award");
    await tx2.wait();
    console.log("Added candidate 2: Rising Star");

    const tx3 = await votingContract.addCandidate("Team Player", "Team Spirit");
    await tx3.wait();
    console.log("Added candidate 3: Team Player");

    const tx4 = await votingContract.addCandidate("Coach Excellence", "Leadership Award");
    await tx4.wait();
    console.log("Added candidate 4: Coach Excellence");

    // Create a sample voting event
    const candidateIds = [1, 2, 3, 4];
    const tx5 = await votingContract.createVotingEvent(
      "Annual Sports Awards 2024",
      "Vote for the best performers in various sports categories this year",
      candidateIds
    );
    await tx5.wait();
    console.log("Created voting event: Annual Sports Awards 2024");

    console.log("\nDeployment and initialization completed successfully!");
    console.log("Contract functions available:");
    console.log("- authorizeVoter(address): Grant voting permission");
    console.log("- castVote(eventId, candidateId): Submit encrypted vote");
    console.log("- getEventInfo(eventId): Get event details");
    console.log("- getCandidateInfo(candidateId): Get candidate information");

  } catch (error) {
    console.log("Initialization failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });