const hre = require('hardhat');

async function main() {
  const ethers = hre.ethers;
  const [deployer] = await ethers.getSigners();

  const deployedAddr = process.env.CONTRACT_ADDRESS || process.argv[2];
  if (!deployedAddr) throw new Error('CONTRACT_ADDRESS required (env or arg)');

  console.log('Using contract:', deployedAddr);
  console.log('Deployer:', await deployer.getAddress());

  // attach using the factory to ensure a connected contract instance
  const factory = await ethers.getContractFactory('CredentialAnchor');
  const ca = factory.attach(deployedAddr).connect(deployer);
  // Try to add deployer as issuer (some ABIs/environments may not expose the mapping getter reliably)
  const deployerAddr = await deployer.getAddress();
  try {
    console.log('Attempting addIssuer for', deployerAddr);
    const txAdd = await ca.addIssuer(deployerAddr);
    await txAdd.wait();
    console.log('Issuer added');
  } catch (err) {
    console.log('addIssuer failed or already added (continuing):', err.message || err);
  }

  // compute anchor using ethers v6 helpers
  const anchor = ethers.keccak256(ethers.toUtf8Bytes('credential-example'));
  const credentialId = ethers.formatBytes32String('cred-example');

  console.log('Anchoring:', anchor);
  const tx2 = await ca.anchorCredential(anchor, credentialId);
  const receipt = await tx2.wait();
  console.log('Anchored in tx', receipt.transactionHash);

  const anchored = await ca.isAnchored(anchor);
  const revoked = await ca.isRevoked(anchor);
  console.log('anchored=', anchored, 'revoked=', revoked);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
