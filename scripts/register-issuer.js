const hre = require("hardhat");

async function main() {
  const [owner, issuer] = await hre.ethers.getSigners();
  const registryAddr = process.env.REGISTRY_ADDRESS;
  if (!registryAddr) throw new Error("REGISTRY_ADDRESS env var required");

  const IssuerRegistry = await hre.ethers.getContractFactory("IssuerRegistry");
  const registry = IssuerRegistry.attach(registryAddr);

  console.log("Registering issuer:", issuer.address, "on", registryAddr);
  const tx = await registry.connect(owner).registerIssuer(issuer.address, "did:example:issuer");
  const rcpt = await tx.wait();
  console.log("Registered. tx:", rcpt.hash);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
