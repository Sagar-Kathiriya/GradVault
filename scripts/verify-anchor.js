const hre = require('hardhat');

async function main() {
  const ethers = hre.ethers;
  const [signer] = await ethers.getSigners();

  const contractAddress = process.env.CONTRACT_ADDRESS || process.argv[2];
  const anchorHash = process.env.ANCHOR_HASH || process.argv[3];
  if (!contractAddress || !anchorHash) {
    console.error('Usage: CONTRACT_ADDRESS=0x... ANCHOR_HASH=0x... npx hardhat run scripts/verify-anchor.js --network localhost');
    console.error('   or: npx hardhat run scripts/verify-anchor.js --network localhost 0x<contract> 0x<anchor>');
    process.exit(1);
  }

  const factory = await ethers.getContractFactory('CredentialAnchor');
  const contract = factory.attach(contractAddress).connect(signer);

  const anchored = await contract.isAnchored(anchorHash);
  const revoked = anchored ? await contract.isRevoked(anchorHash) : false;

  console.log('Contract:', contractAddress);
  console.log('Anchor:', anchorHash);
  console.log('anchored=', anchored, 'revoked=', revoked);

  if (anchored && !revoked) {
    console.log('Result: VALID (anchored and not revoked)');
  } else if (anchored && revoked) {
    console.log('Result: REVOKED (anchored but revoked)');
  } else {
    console.log('Result: NOT FOUND (not anchored)');
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
