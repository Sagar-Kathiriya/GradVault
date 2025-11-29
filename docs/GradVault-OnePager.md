# GradVault: One‑Pager (Presentation Handout)

## Plain‑English Overview
- We use the blockchain like a public notice board.
- We never post the actual certificate; we post a fingerprint (hash) of it.
- Universities (issuers) must be allowed to post. Once allowed, they can anchor new certificate fingerprints and revoke them later if needed.
- Anyone can check if a fingerprint exists (anchored) and whether it’s revoked.

## Key Components
- Issuer Registry (permission list): Decides which university addresses can anchor.
- Credential Anchor (the board): Stores certificate fingerprints, who posted them, when, and revoked status.
- Scripts: Deploy, register an issuer, anchor a demo fingerprint, verify status, revoke.
- Issuer API (optional): Simple web service to issue a demo certificate JSON, anchor its fingerprint, and query status.

## Demo Workflow
1. Start local blockchain & deploy contracts.
2. Register the university as an authorized issuer.
3. Anchor a demo certificate fingerprint (hash).
4. Verify that the fingerprint exists and is not revoked.
5. Revoke the fingerprint and verify that status changes.

## Commands (Windows PowerShell)
```powershell
# Start local blockchain and deploy
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost

# Register issuer (optional if anchor script self-registers)
$env:REGISTRY_ADDRESS="0x<RegistryAddress>"
npx hardhat run scripts/register-issuer.js --network localhost

# Anchor a demo fingerprint
$env:CONTRACT_ADDRESS="0x<CredentialAnchorAddress>"
npx hardhat run scripts/anchor-example.js --network localhost

# Verify the fingerprint
$env:CONTRACT_ADDRESS="0x<CredentialAnchorAddress>"
$env:ANCHOR_HASH="0x<anchorHash>"
npx hardhat run scripts/verify-anchor.js --network localhost

# Revoke and verify again
npx hardhat run scripts/revoke-anchor.js --network localhost
npx hardhat run scripts/verify-anchor.js --network localhost
```

Tip: On Windows, a libuv assertion may appear after scripts finish. It’s benign; restart the terminal or use Docker (`make test`).

## Files Cheat‑Sheet
- `contracts/IssuerRegistry.sol`: Permission list of issuers; owner can add/remove.
- `contracts/CredentialAnchor.sol`: Stores certificate fingerprints (hashes), timestamp, issuer, revoked flag.
- `scripts/deploy.js`: Deploys both contracts and prints addresses.
- `scripts/register-issuer.js`: Registers an issuer address with a DID.
- `scripts/anchor-example.js`: Anchors a demo fingerprint; can self‑register issuer if registry address provided.
- `scripts/verify-anchor.js`: Checks if a fingerprint is anchored and whether it’s revoked.
- `scripts/revoke-anchor.js`: Revokes a fingerprint.
- `services/issuer-api/src/server.js`: Web API to issue demo credentials, optionally store to IPFS, anchor fingerprints, and query status.
- `Dockerfile`, `Makefile`: Optional Docker‑based testing helpers.

## Talking Points (Slides)
- Problem: Verifying degrees digitally without exposing private data.
- Approach: Store only hashes on‑chain; keep full credential off‑chain.
- Security: Only registered issuers can anchor; revocation supported.
- Demo: Anchor → Verify (valid) → Revoke → Verify (revoked).
- Future: Add DID management, VC signing, selective disclosure (BBS+), ZK proofs.
