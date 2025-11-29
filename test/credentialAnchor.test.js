const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CredentialAnchor", function () {
  let IssuerRegistry, CredentialAnchor;
  let registry, contract;
  let owner, issuer, other;

  beforeEach(async function () {
    [owner, issuer, other] = await ethers.getSigners();
    IssuerRegistry = await ethers.getContractFactory("IssuerRegistry");
    registry = await IssuerRegistry.connect(owner).deploy();
    await registry.waitForDeployment();

    // register issuer
    await registry.connect(owner).registerIssuer(issuer.address, "did:example:uni-issuer");

    CredentialAnchor = await ethers.getContractFactory("CredentialAnchor");
    contract = await CredentialAnchor.connect(owner).deploy(await registry.getAddress());
    await contract.waitForDeployment();
  });

  it("anchors a credential and prevents duplicates", async function () {
    const data = ethers.toUtf8Bytes("degree:alice");
    const hash = ethers.keccak256(data);

    // anchor from issuer
    await expect(contract.connect(issuer).anchorCredential(hash)).to.emit(contract, "Anchored");

    const anchor = await contract.getAnchor(hash);
    expect(anchor.issuer).to.equal(issuer.address);
    expect(anchor.revoked).to.equal(false);

    // cannot anchor same again
    await expect(contract.connect(issuer).anchorCredential(hash)).to.be.revertedWith("already anchored");

    // unauthorized address cannot anchor
    const data2 = ethers.toUtf8Bytes("degree:dave");
    const hash2 = ethers.keccak256(data2);
    await expect(contract.connect(other).anchorCredential(hash2)).to.be.revertedWith("issuer not authorized");
  });

  it("allows issuer or owner to revoke", async function () {
    const data = ethers.toUtf8Bytes("degree:bob");
    const hash = ethers.keccak256(data);

    await contract.connect(issuer).anchorCredential(hash);

    // unauthorized cannot revoke
    await expect(contract.connect(other).revokeCredential(hash)).to.be.revertedWith("not authorized");

    // issuer can revoke
    await expect(contract.connect(issuer).revokeCredential(hash)).to.emit(contract, "Revoked");

    expect(await contract.isRevoked(hash)).to.equal(true);
  });

  it("owner can revoke anchored credential", async function () {
    const data = ethers.toUtf8Bytes("degree:carol");
    const hash = ethers.keccak256(data);

    await contract.connect(issuer).anchorCredential(hash);
    await contract.connect(owner).revokeCredential(hash);
    expect(await contract.isRevoked(hash)).to.equal(true);
  });
});
