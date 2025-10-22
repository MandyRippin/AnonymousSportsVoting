const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Script to verify deployed contracts on Etherscan
 * Usage: npx hardhat run scripts/verify.js --network sepolia
 */

async function main() {
  console.log("Starting contract verification process...\n");

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
  const contractName = deploymentInfo.contractName;

  console.log(`Network: ${hre.network.name}`);
  console.log(`Contract: ${contractName}`);
  console.log(`Address: ${contractAddress}\n`);

  // Verify the contract on Etherscan
  try {
    console.log("Verifying contract on Etherscan...");
    
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
      contract: `contracts/${contractName}.sol:${contractName}`
    });

    console.log("\n✓ Contract verified successfully!");
    console.log(`View on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}#code`);

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("\n✓ Contract is already verified!");
      console.log(`View on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}#code`);
    } else {
      console.error("\n✗ Verification failed:");
      console.error(error.message);
      process.exit(1);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
