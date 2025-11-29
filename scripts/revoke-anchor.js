const hre = require('hardhat');

async function main() {
  const ethers = hre.ethers;
  const [signer] = await ethers.getSigners();

  const contractAddress = process.env.CONTRACT_ADDRESS || process.argv[2];
  const anchorHash = process.env.ANCHOR_HASH || process.argv[3];
  if (!contractAddress || !anchorHash) {
    console.error('Usage: CONTRACT_ADDRESS=0x... ANCHOR_HASH=0x... npx hardhat run scripts/revoke-anchor.js --network localhost');
    console.error('   or: npx hardhat run scripts/revoke-anchor.js --network localhost -- 0x<contract> 0x<anchor>');
    process.exit(1);
  }

  const factory = await ethers.getContractFactory('CredentialAnchor');
  const contract = factory.attach(contractAddress).connect(signer);

  // Check current status
  const anchored = await contract.isAnchored(anchorHash);
  if (!anchored) {
    console.error('Anchor not found; cannot revoke.');
    process.exit(1);
  }

  const revokedBefore = await contract.isRevoked(anchorHash);
  console.log('Revoked (before)=', revokedBefore);

  const tx = await contract.revokeCredential(anchorHash);
  const receipt = await tx.wait();
  console.log('Revoked in tx', receipt.hash || receipt.transactionHash);

  const revokedAfter = await contract.isRevoked(anchorHash);
  console.log('Revoked (after)=', revokedAfter);
  if (revokedAfter) {
    console.log('Result: REVOKED');
  } else {
    console.log('Result: STILL ACTIVE');
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
