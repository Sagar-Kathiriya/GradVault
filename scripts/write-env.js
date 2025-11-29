const fs = require('fs');
const path = require('path');

/**
 * Writes issuer-api .env from provided args.
 * Usage: node scripts/write-env.js <rpcUrl> <anchorAddress> <issuerPrivateKey>
 */
function main() {
  const [rpcUrl, anchorAddress, issuerPk] = process.argv.slice(2);
  if (!rpcUrl || !anchorAddress || !issuerPk) {
    console.error('Usage: node scripts/write-env.js <rpcUrl> <anchorAddress> <issuerPrivateKey>');
    process.exit(1);
  }
  const envPath = path.resolve(__dirname, '..', 'services', 'issuer-api', '.env');
  const content = [
    `RPC_URL=${rpcUrl}`,
    `ISSUER_PRIVATE_KEY=${issuerPk}`,
    `CREDENTIAL_ANCHOR_ADDRESS=${anchorAddress}`,
    `ISSUER_DID=did:example:issuer`,
    `IPFS_URL=https://ipfs.infura.io:5001`,
    `PORT=3001`,
    '',
  ].join('\n');
  fs.writeFileSync(envPath, content, 'utf8');
  console.log('Wrote', envPath);
}

main();
