const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * Security Check Script
 * Performs comprehensive security auditing
 */

console.log("=== Security Audit Report ===\n");

const issues = {
  critical: [],
  high: [],
  medium: [],
  low: [],
  info: []
};

// Check 1: Hardcoded private keys or secrets
console.log("1/8 Checking for hardcoded secrets...");
try {
  const patterns = [
    /private.*key.*=.*["'`]0x[a-fA-F0-9]{64}["'`]/gi,
    /api.*key.*=.*["'`][a-zA-Z0-9]{20,}["'`]/gi,
    /secret.*=.*["'`][a-zA-Z0-9]{20,}["'`]/gi,
    /password.*=.*["'`].{8,}["'`]/gi
  ];

  const jsFiles = execSync("find . -name '*.js' -not -path '*/node_modules/*' 2>/dev/null || echo ''", {
    encoding: "utf-8"
  }).split("\n").filter(Boolean);

  for (const file of jsFiles) {
    if (!fs.existsSync(file)) {
      continue;
    }
    const content = fs.readFileSync(file, "utf-8");
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        issues.critical.push(`Potential hardcoded secret in ${file}`);
      }
    }
  }
  console.log(issues.critical.length > 0 ? "  ❌ Issues found" : "  ✓ No secrets detected");
} catch (e) {
  console.log("  ⚠️  Check skipped");
}

// Check 2: .env file security
console.log("2/8 Checking .env file security...");
if (fs.existsSync(".env")) {
  issues.high.push(".env file exists - ensure it's in .gitignore");
  console.log("  ⚠️  .env file found");
} else {
  console.log("  ✓ No .env file in repository");
}

// Check 3: Solidity version
console.log("3/8 Checking Solidity compiler version...");
try {
  const contractFiles = execSync("find ./contracts -name '*.sol' 2>/dev/null || echo ''", {
    encoding: "utf-8"
  }).split("\n").filter(Boolean);

  for (const file of contractFiles) {
    if (!fs.existsSync(file)) {
      continue;
    }
    const content = fs.readFileSync(file, "utf-8");
    if (!content.match(/pragma solidity \^0\.8\.\d+;/)) {
      issues.medium.push(`${file}: Consider using Solidity ^0.8.x`);
    }
    if (content.includes("pragma solidity ^0.8.24;") || content.includes("pragma solidity ^0.8.")) {
      console.log(`  ✓ ${path.basename(file)}: Using secure Solidity version`);
    }
  }
} catch (e) {
  console.log("  ⚠️  Check skipped");
}

// Check 4: ReentrancyGuard usage
console.log("4/8 Checking for reentrancy protection...");
try {
  const contractFiles = execSync("find ./contracts -name '*.sol' 2>/dev/null || echo ''", {
    encoding: "utf-8"
  }).split("\n").filter(Boolean);

  for (const file of contractFiles) {
    if (!fs.existsSync(file)) {
      continue;
    }
    const content = fs.readFileSync(file, "utf-8");
    const hasExternalCalls = content.includes(".call") || content.includes(".send") || 
                            content.includes(".transfer");
    const hasReentrancyGuard = content.includes("ReentrancyGuard") || 
                               content.includes("nonReentrant");
    
    if (hasExternalCalls && !hasReentrancyGuard) {
      issues.medium.push(`${file}: External calls without reentrancy protection`);
      console.log(`  ⚠️  ${path.basename(file)}: Consider adding ReentrancyGuard`);
    } else {
      console.log(`  ✓ ${path.basename(file)}: Reentrancy checks OK`);
    }
  }
} catch (e) {
  console.log("  ⚠️  Check skipped");
}

// Check 5: Access control
console.log("5/8 Checking access control patterns...");
try {
  const contractFiles = execSync("find ./contracts -name '*.sol' 2>/dev/null || echo ''", {
    encoding: "utf-8"
  }).split("\n").filter(Boolean);

  for (const file of contractFiles) {
    if (!fs.existsSync(file)) {
      continue;
    }
    const content = fs.readFileSync(file, "utf-8");
    const hasModifiers = content.includes("modifier only") || content.includes("modifier auth");
    const hasOwnable = content.includes("Ownable") || content.includes("AccessControl");
    
    if (!hasModifiers && !hasOwnable) {
      issues.low.push(`${file}: No access control modifiers detected`);
      console.log(`  ℹ️  ${path.basename(file)}: Consider adding access control`);
    } else {
      console.log(`  ✓ ${path.basename(file)}: Access control implemented`);
    }
  }
} catch (e) {
  console.log("  ⚠️  Check skipped");
}

// Check 6: Gas optimization
console.log("6/8 Checking for gas optimization opportunities...");
try {
  const contractFiles = execSync("find ./contracts -name '*.sol' 2>/dev/null || echo ''", {
    encoding: "utf-8"
  }).split("\n").filter(Boolean);

  for (const file of contractFiles) {
    if (!fs.existsSync(file)) {
      continue;
    }
    const content = fs.readFileSync(file, "utf-8");
    
    // Check for uint256 vs uint8/uint16 (packing opportunities)
    const uint256Count = (content.match(/uint256/g) || []).length;
    if (uint256Count > 10) {
      issues.info.push(`${file}: Consider using smaller uint types for gas optimization`);
    }
    
    console.log(`  ✓ ${path.basename(file)}: Gas optimization checks complete`);
  }
} catch (e) {
  console.log("  ⚠️  Check skipped");
}

// Check 7: Dependencies audit
console.log("7/8 Checking dependencies for vulnerabilities...");
try {
  console.log("  Running npm audit...");
  execSync("npm audit --audit-level=moderate", { stdio: "inherit" });
  console.log("  ✓ No critical vulnerabilities found");
} catch (e) {
  issues.high.push("npm audit found vulnerabilities");
  console.log("  ⚠️  Vulnerabilities detected - review npm audit output");
}

// Check 8: Configuration security
console.log("8/8 Checking configuration security...");
const securityConfigs = [
  { file: ".gitignore", check: (c) => c.includes(".env") && c.includes("node_modules") },
  { file: "hardhat.config.js", check: (c) => c.includes("process.env") },
  { file: ".env.example", check: (c) => !c.includes("0x") && !c.includes("sk-") }
];

for (const config of securityConfigs) {
  if (fs.existsSync(config.file)) {
    const content = fs.readFileSync(config.file, "utf-8");
    if (config.check(content)) {
      console.log(`  ✓ ${config.file}: Security configuration OK`);
    } else {
      issues.medium.push(`${config.file}: Security configuration needs review`);
      console.log(`  ⚠️  ${config.file}: Review security settings`);
    }
  }
}

// Summary
console.log("\n=== Security Audit Summary ===");
console.log(`Critical Issues: ${issues.critical.length}`);
console.log(`High Issues: ${issues.high.length}`);
console.log(`Medium Issues: ${issues.medium.length}`);
console.log(`Low Issues: ${issues.low.length}`);
console.log(`Info: ${issues.info.length}`);

if (issues.critical.length > 0) {
  console.log("\n❌ CRITICAL ISSUES:");
  issues.critical.forEach((issue) => console.log(`  - ${issue}`));
}

if (issues.high.length > 0) {
  console.log("\n⚠️  HIGH PRIORITY:");
  issues.high.forEach((issue) => console.log(`  - ${issue}`));
}

if (issues.medium.length > 0) {
  console.log("\n⚠️  MEDIUM PRIORITY:");
  issues.medium.forEach((issue) => console.log(`  - ${issue}`));
}

const totalIssues = issues.critical.length + issues.high.length + issues.medium.length;
if (totalIssues === 0) {
  console.log("\n✅ No significant security issues detected!");
  process.exit(0);
} else if (issues.critical.length > 0) {
  console.log("\n❌ Security audit failed - critical issues must be resolved");
  process.exit(1);
} else {
  console.log("\n⚠️  Security audit completed with warnings");
  process.exit(0);
}
