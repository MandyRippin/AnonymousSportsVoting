const hre = require("hardhat");

/**
 * Script to simulate contract deployment and interactions
 * Usage: npx hardhat run scripts/simulate.js --network hardhat
 */

async function main() {
  console.log("=== Starting Contract Simulation ===\n");

  const [deployer, voter1, voter2, voter3] = await hre.ethers.getSigners();

  console.log("Accounts:");
  console.log("  Deployer:", deployer.address);
  console.log("  Voter 1:", voter1.address);
  console.log("  Voter 2:", voter2.address);
  console.log("  Voter 3:", voter3.address, "\n");

  // Deploy contract
  console.log("=== Deploying Contract ===");
  const Contract = await hre.ethers.getContractFactory("AnonymousSportsVoting");
  const contract = await Contract.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("Contract deployed to:", contractAddress, "\n");

  try {
    // Add candidates
    console.log("=== Adding Candidates ===");
    let tx = await contract.addCandidate("Outstanding Athlete", "Best Performance");
    await tx.wait();
    console.log("✓ Added Candidate 1: Outstanding Athlete");

    tx = await contract.addCandidate("Rising Star", "Newcomer Award");
    await tx.wait();
    console.log("✓ Added Candidate 2: Rising Star");

    tx = await contract.addCandidate("Team Player", "Team Spirit");
    await tx.wait();
    console.log("✓ Added Candidate 3: Team Player");

    tx = await contract.addCandidate("Coach Excellence", "Leadership Award");
    await tx.wait();
    console.log("✓ Added Candidate 4: Coach Excellence\n");

    // Create voting event
    console.log("=== Creating Voting Event ===");
    const candidateIds = [1, 2, 3, 4];
    tx = await contract.createVotingEvent(
      "Annual Awards 2024",
      "Vote for the best performers in various categories this year",
      candidateIds
    );
    await tx.wait();
    console.log("✓ Created voting event: Annual Awards 2024\n");

    // Authorize voters
    console.log("=== Authorizing Voters ===");
    tx = await contract.authorizeVoter(voter1.address);
    await tx.wait();
    console.log("✓ Authorized Voter 1");

    tx = await contract.authorizeVoter(voter2.address);
    await tx.wait();
    console.log("✓ Authorized Voter 2");

    tx = await contract.authorizeVoter(voter3.address);
    await tx.wait();
    console.log("✓ Authorized Voter 3\n");

    // Cast votes
    console.log("=== Casting Votes ===");
    const contractAsVoter1 = contract.connect(voter1);
    tx = await contractAsVoter1.castVote(1, 1);
    await tx.wait();
    console.log("✓ Voter 1 voted for Candidate 1");

    const contractAsVoter2 = contract.connect(voter2);
    tx = await contractAsVoter2.castVote(1, 2);
    await tx.wait();
    console.log("✓ Voter 2 voted for Candidate 2");

    const contractAsVoter3 = contract.connect(voter3);
    tx = await contractAsVoter3.castVote(1, 1);
    await tx.wait();
    console.log("✓ Voter 3 voted for Candidate 1\n");

    // Verify voting status
    console.log("=== Verifying Voting Status ===");
    const voter1Status = await contract.getVoterStatus(1, voter1.address);
    console.log("Voter 1 has voted:", voter1Status[0]);

    const voter2Status = await contract.getVoterStatus(1, voter2.address);
    console.log("Voter 2 has voted:", voter2Status[0]);

    const voter3Status = await contract.getVoterStatus(1, voter3.address);
    console.log("Voter 3 has voted:", voter3Status[0], "\n");

    // Get event information
    console.log("=== Event Information ===");
    const eventInfo = await contract.getEventInfo(1);
    console.log("Event Name:", eventInfo[0]);
    console.log("Description:", eventInfo[1]);
    console.log("Is Active:", eventInfo[6]);
    console.log("Results Revealed:", eventInfo[7]);
    console.log("Total Votes:", eventInfo[9].toString());
    console.log("Winner ID:", eventInfo[10].toString(), "\n");

    // Get all candidates information
    console.log("=== All Candidates ===");
    for (let i = 1; i <= 4; i++) {
      const candidateInfo = await contract.getCandidateInfo(i);
      console.log("Candidate", i + ":");
      console.log("  Name:", candidateInfo[0]);
      console.log("  Category:", candidateInfo[1]);
      console.log("  Is Active:", candidateInfo[2]);
    }

    console.log("\n=== Simulation Complete ===");
    console.log("Summary:");
    console.log("  - Contract deployed successfully");
    console.log("  - 4 candidates added");
    console.log("  - 1 voting event created");
    console.log("  - 3 voters authorized");
    console.log("  - 3 votes cast (encrypted)\n");

  } catch (error) {
    console.error("\nError during simulation:");
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
