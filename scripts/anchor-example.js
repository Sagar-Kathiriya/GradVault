const hre = require('hardhat');

async function main() {
  const ethers = hre.ethers;
  const [deployer] = await ethers.getSigners();

  const deployedAddr = process.env.CONTRACT_ADDRESS || process.argv[2];
  if (!deployedAddr) throw new Error('CONTRACT_ADDRESS required (env or arg)');

  console.log('Using contract:', deployedAddr);
  console.log('Deployer:', await deployer.getAddress());

  // Attach using the factory to ensure a connected contract instance
  const factory = await ethers.getContractFactory('CredentialAnchor');
  const ca = factory.attach(deployedAddr).connect(deployer);

  // Optional: if REGISTRY_ADDRESS provided, register deployer as issuer
  const registryAddr = process.env.REGISTRY_ADDRESS || process.argv[4];
  if (registryAddr) {
    const RegFactory = await ethers.getContractFactory('IssuerRegistry');
    const registry = RegFactory.attach(registryAddr).connect(deployer);
    try {
      console.log('Registering issuer in registry:', await deployer.getAddress());
      const txr = await registry.registerIssuer(await deployer.getAddress(), 'did:example:issuer');
      await txr.wait();
      console.log('Issuer registered');
    } catch (e) {
      console.log('Issuer registration skipped/failed (maybe already registered):', e.message || e);
    }
  } else {
    console.log('No REGISTRY_ADDRESS provided; ensure issuer is registered before anchoring.');
  }

  // Compute anchor using ethers v6 helpers
  const input = process.env.ANCHOR_INPUT || process.argv[3] || 'credential-example';
  const anchor = ethers.keccak256(ethers.toUtf8Bytes(input));

  console.log('Anchoring anchor hash:', anchor, 'from input:', JSON.stringify(input));
  const tx = await ca.anchorCredential(anchor);
  const receipt = await tx.wait();
  console.log('Anchored in tx', receipt.hash || receipt.transactionHash);

  const anchored = await ca.isAnchored(anchor);
  const revoked = await ca.isRevoked(anchor);
  console.log('anchored=', anchored, 'revoked=', revoked);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
