const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // Deploy IssuerRegistry
  const IssuerRegistry = await hre.ethers.getContractFactory("IssuerRegistry");
  const registry = await IssuerRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("IssuerRegistry:", registryAddress);

  // Deploy CredentialAnchor with registry address
  const CredentialAnchor = await hre.ethers.getContractFactory("CredentialAnchor");
  const anchor = await CredentialAnchor.deploy(registryAddress);
  await anchor.waitForDeployment();
  const anchorAddress = await anchor.getAddress();
  console.log("CredentialAnchor:", anchorAddress);

  console.log("\nExport these to services/issuer-api/.env:");
  console.log("CREDENTIAL_ANCHOR_ADDRESS=", anchorAddress);
  console.log("RPC_URL=", hre.network.config.url || "http://localhost:8545");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
