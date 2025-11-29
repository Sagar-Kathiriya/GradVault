# GradVault

GradVault is a blockchain-based decentralized application to enable universities to issue verifiable digital degree certificates under Self-Sovereign Identity (SSI) principles. No private or sensitive data is stored on-chain — only cryptographic anchors (hashes) are recorded. Students hold credentials in their wallet and present selective disclosures or zero-knowledge proofs to verifiers.

## Plain-English Summary (Non‑technical)

- Think of the blockchain as a public notice board. We don’t post the actual certificate there, only a fingerprint (a hash) of it.
- A university (issuer) gets permission to post on this board (by being “registered”).
- When a certificate is created, we post its fingerprint to the board (“anchor”). Later, if needed, the university can mark it as “revoked”.
- Anyone can check the board to see if a certificate’s fingerprint exists (anchored) and whether it has been revoked.

## What Each Part Does

- `contracts/IssuerRegistry.sol`: The “permission list”. Keeps track of which university addresses are allowed to anchor certificates, and stores a simple DID (identifier) for them. Only the registry’s owner can add/remove issuers.
- `contracts/CredentialAnchor.sol`: The “board”. Stores fingerprints (hashes) of certificates along with who posted them, when, and whether they were revoked. Only registered issuers can anchor; issuers or the contract owner can revoke.
- `scripts/deploy.js`: Sets up the system. Deploys the permission list (IssuerRegistry) and the board (CredentialAnchor), then prints their addresses so other parts can connect to them.
- `scripts/register-issuer.js`: Gives a university address permission to anchor on the board.
- `scripts/anchor-example.js`: Anchors a demo certificate fingerprint on the board. It can also self-register the issuer if you provide the registry address.
- `scripts/verify-anchor.js`: Looks up a fingerprint on the board and tells you if it’s anchored and whether it’s revoked.
- `scripts/revoke-anchor.js`: Marks an anchored fingerprint as revoked on the board.
- `services/issuer-api/src/server.js`: A simple web API that issues a demo certificate JSON, optionally saves it to IPFS, anchors its fingerprint, and lets you query status. Useful for demos.
- `Dockerfile`, `Makefile`: Optional helpers to run tests inside Docker (handy on Windows).
- `hardhat.config.js`: Configuration for the developer tools that compile and run the contracts.

## End‑to‑End Workflow (Non‑technical)

1) Start the local blockchain and deploy the system.
   - We launch a local blockchain on your computer and deploy both the permission list and the board.
2) Give the university permission.
   - Register the university’s address in the permission list so it can post fingerprints.
3) Anchor a certificate.
   - Create the certificate data, compute its fingerprint (hash), and post that fingerprint to the board.
4) Verify a certificate.
   - Anyone can check the board using the fingerprint to see if it exists and whether it’s revoked.
5) Revoke if needed.
   - The university can mark the fingerprint as revoked, and future checks will show that status.

## Quick Demo Commands (Windows PowerShell)

```powershell
# 1) Start local blockchain and deploy contracts
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost

# 2) (Optional) Register issuer explicitly
$env:REGISTRY_ADDRESS="0x<RegistryAddress>"
npx hardhat run scripts/register-issuer.js --network localhost

# 3) Anchor a demo fingerprint (self-registers if REGISTRY_ADDRESS is set)
$env:CONTRACT_ADDRESS="0x<CredentialAnchorAddress>"
npx hardhat run scripts/anchor-example.js --network localhost

# 4) Verify the fingerprint
$env:CONTRACT_ADDRESS="0x<CredentialAnchorAddress>"
$env:ANCHOR_HASH="0x<anchorHash>"
npx hardhat run scripts/verify-anchor.js --network localhost

# 5) Revoke and verify again
npx hardhat run scripts/revoke-anchor.js --network localhost
npx hardhat run scripts/verify-anchor.js --network localhost
```

Tip: On Windows, if you see a libuv assertion after commands finish, it’s a known benign issue. Restart the terminal or use Docker (`make test`) for tests.

## Purpose of this repository
- Capture contracts, issuer/backend services, and front-end wallets/verifiers for a privacy-preserving degree verification platform.

## Action Plan (initial)

1. Specification & Data Model (1-2 days)
   - Define degree credential JSON schema and anchor format.
   - Define revocation model and selective disclosure requirements.

2. Prototype Smart Contracts (2-3 days)
   - `IssuerRegistry` contract: register/unregister issuers (universities).
   - `CredentialAnchor` contract: store credential anchor hashes and revocation status.

3. Issuer Backend (3-4 days)
   - Issue signed Verifiable Credentials (VCs) using a DID for each issuer.
   - Store credential payloads on IPFS and anchor the hash on-chain.

4. Student Wallet (3-4 days)
   - Web wallet (React) to receive/store VCs and create Verifiable Presentations.
   - Support selective disclosure/BBS+ proofs for attribute-level presentation.

5. Verifier Portal (2-3 days)
   - Create proof requests and verify presentations (signature, anchor, revocation, ZK proof).

6. Tests, Documentation & Demo (3-5 days)

Estimate for a minimal end-to-end MVP: 2–3 weeks (single developer).

## Repo layout (planned)
- `contracts/` — Solidity contracts and tests
- `services/issuer-api/` — Node.js backend for issuers
- `apps/wallet/` — React-based web wallet for students
- `apps/verifier/` — React-based verifier portal
- `docs/` — architecture diagrams and specs

## First Steps Done
- Added initial repository scaffold and a simple `IssuerRegistry` contract.
- Implemented `CredentialAnchor` Solidity contract (anchor, issuers, revoke) in `contracts/CredentialAnchor.sol`.
- Added Hardhat tooling and tests; `npm test` shows contract basic flows pass (anchor, revoke).
- Added `scripts/deploy.js` (v6-compatible) and `scripts/anchor-example.js` (attach + keccak) for local deploy/anchor.
- Scaffolded `services/issuer-api` (Express + ethers) with endpoints:
   - `POST /issue` — create a demo credential JSON and return its `anchorHash`.
   - `POST /anchor` — anchor the provided hash on-chain using the deployed `CredentialAnchor`.
   - `GET /status/:anchor` — query anchored/revoked state.

Local development has been validated end-to-end up to issuing credentials; anchoring works with a running Hardhat node and correctly configured `.env`.

## Next Immediate Tasks
- Ensure Hardhat local node is started reliably on Windows (libuv assertion workaround: restart terminal or reboot if needed).
- Stabilize `scripts/anchor-example.js` for ethers v6 (done: uses `anchorCredential(bytes32)` matching current contract ABI; no `addIssuer`).
- Confirm `services/issuer-api/.env` uses a valid Hardhat account `PRIVATE_KEY` (including `0x`) and the latest `CONTRACT_ADDRESS` from deploy.
- Run `POST /anchor` successfully and document the typical response (txHash, blockNumber). Add a `curl` example to README.
- Add revocation endpoint to issuer API: `POST /revoke { anchorHash }` using `revokeAnchor`.
- Add minimal persistence (optional): store issued credential payloads and their anchor hashes (e.g., a JSON file or lightweight DB for demo).
- Write a short architecture doc in `docs/` outlining VC issuance/signing, anchor process, and verifier checks.
- Future: integrate proper VC signing (JWT or Linked Data Proofs), DID management, and BBS+/ZK selective disclosure.

## Run tests with Docker (no local Node required)

If you don't want to install Node/npm locally, you can run the Hardhat tests inside Docker.

Build the test image:

```powershell
docker build -t gradvault-test .
```

Run the test container:

```powershell
docker run --rm gradvault-test
```

Or, if you have `make` available, use the helper:

```powershell
make test
```

This runs the test suite inside a Node 18 container and avoids Windows libuv issues.

---
If you'd like, I can now: (A) implement the `CredentialAnchor` contract and unit tests, (B) scaffold the issuer backend (Node + Veramo), or (C) scaffold the wallet app. Which should I start next?

## Issuer API (prototype)

Location: `services/issuer-api`

Configure environment (copy `.env.example` to `.env` and set values):

```env
RPC_URL=http://localhost:8545
ISSUER_PRIVATE_KEY=0x...
CREDENTIAL_ANCHOR_ADDRESS=0x...
ISSUER_DID=did:example:issuer
IPFS_URL=https://ipfs.infura.io:5001
PORT=3001
```

Install and run:

```powershell
cd "S:/5th Semester/Blockchain/GradVault/services/issuer-api"
npm install
npm run start
```

Issue a credential (anchors on-chain):

```powershell
curl -X POST http://localhost:3001/issue -H "Content-Type: application/json" -d '{
   "subjectDid": "did:example:alice",
   "degree": { "type": "BSc", "name": "Computer Science" },
   "university": "Example University"
}'
```

The response includes the VC payload, optional IPFS CID, computed `anchorHash`, and transaction hash.

## Anchor + Verify via Scripts

Quick local flow using Hardhat scripts:

```powershell
# 1) Start node and deploy
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost

# 2) Anchor an example input (uses keccak256 of the input string)
$env:CONTRACT_ADDRESS="0x<CredentialAnchorAddress>"
npx hardhat run scripts/anchor-example.js --network localhost
# Or pass explicit args
npx hardhat run scripts/anchor-example.js --network localhost 0x<CredentialAnchorAddress> "my-credential-payload"

# 3) Verify an anchor hash
npx hardhat run scripts/verify-anchor.js --network localhost
# Pass args on PowerShell using env vars (recommended)
$env:CONTRACT_ADDRESS="0x<CredentialAnchorAddress>"
$env:ANCHOR_HASH="0x<anchorHash>"
npx hardhat run scripts/verify-anchor.js --network localhost
# Or use PowerShell stop-parsing to pass args directly
npx hardhat run scripts/verify-anchor.js --network localhost --% 0x<CredentialAnchorAddress> 0x<anchorHash>
```

Notes:
- `scripts/anchor-example.js` now matches the current `CredentialAnchor.sol` ABI (`anchorCredential(bytes32)` only).
- Legacy `services/issuer-api/server.js` (CommonJS) was removed in favor of ESM `src/server.js`.

## Revoke an Anchor

Revoke an already-anchored credential hash:

```powershell
# Recommended: use env vars on PowerShell
$env:CONTRACT_ADDRESS="0x<CredentialAnchorAddress>"
$env:ANCHOR_HASH="0x<anchorHash>"
npx hardhat run scripts/revoke-anchor.js --network localhost

# Then verify it shows revoked=true
npx hardhat run scripts/verify-anchor.js --network localhost
```

On Windows, if you see a libuv assertion after scripts complete, it's a known benign issue. Restart the terminal or run via Docker (`make test`) to avoid it.

## Deploy contracts (local)

Use Hardhat to deploy `IssuerRegistry` and `CredentialAnchor` locally and capture addresses:

```powershell
cd "S:/5th Semester/Blockchain/GradVault"
npx hardhat node
# In another terminal:
npx hardhat run scripts/deploy.js --network localhost
```

Set `.env` values in `services/issuer-api` from the printed addresses and RPC URL, then start the API.

Optionally write `.env` automatically:

```powershell
node scripts/write-env.js http://localhost:8545 0x<anchorAddress> 0x<issuerPrivateKey>
```

Register an issuer in `IssuerRegistry` (set `REGISTRY_ADDRESS`):

```powershell
$env:REGISTRY_ADDRESS="0x<registryAddress>"
npx hardhat run scripts/register-issuer.js --network localhost
```

## Issuer API extra endpoints
- `POST /revoke` — body `{ "anchorHash": "0x..." }` revokes the anchor if called by issuer/owner.
- `GET /status/:anchor` — returns `{ anchored: boolean, revoked: boolean }`.
- `POST /register-issuer` — body `{ "issuerAddress": "0x...", "did": "did:example:issuer" }` registers an issuer; requires API wallet to be the registry owner.
