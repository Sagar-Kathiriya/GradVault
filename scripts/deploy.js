const hre = require('hardhat');

async function main() {
  // Use the newer Hardhat/Ethers v6 deployment API when available
  if (hre.ethers && typeof hre.ethers.deployContract === 'function') {
    const ca = await hre.ethers.deployContract('CredentialAnchor');
    // wait for deployment
    if (typeof ca.waitForDeployment === 'function') {
      await ca.waitForDeployment();
    }
    // get address (ethers v6 contract API)
    const address = (typeof ca.getAddress === 'function') ? await ca.getAddress() : ca.target || ca.address;
    console.log('CredentialAnchor deployed to:', address);
    return;
  }

  // Fallback for older ethers API
  const CredentialAnchor = await hre.ethers.getContractFactory('CredentialAnchor');
  const ca = await CredentialAnchor.deploy();
  if (typeof ca.deployed === 'function') {
    await ca.deployed();
    console.log('CredentialAnchor deployed to:', ca.address);
    return;
  }

  // final fallback: wait for the deployment transaction
  if (ca.deployTransaction && typeof ca.deployTransaction.wait === 'function') {
    const receipt = await ca.deployTransaction.wait();
    console.log('CredentialAnchor deployed to:', receipt.contractAddress || ca.address || ca.target);
    return;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
