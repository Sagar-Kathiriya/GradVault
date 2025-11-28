# GradVault

GradVault is a blockchain-based decentralized application to enable universities to issue verifiable digital degree certificates under Self-Sovereign Identity (SSI) principles. No private or sensitive data is stored on-chain — only cryptographic anchors (hashes) are recorded. Students hold credentials in their wallet and present selective disclosures or zero-knowledge proofs to verifiers.

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
- Stabilize `scripts/anchor-example.js` for ethers v6 (replace deprecated utils imports, ensure `addIssuer` call wiring).
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

## Current Local Dev Workflow (summary)

- Start Hardhat node (Terminal A):
   - `cd "s:\5th Semester\Blockchain\GradVault"`
   - `npx hardhat node`
- Deploy `CredentialAnchor` (Terminal B):
   - `npx hardhat run --network localhost scripts/deploy.js` → copy printed address
- Configure issuer API (Terminal C):
   - `cd services/issuer-api`
   - `copy .env.example .env` and set `PRIVATE_KEY` (include 0x) and `CONTRACT_ADDRESS`
   - `npm install`
   - `npm start`
- Issue credential:
   - `curl -s -X POST http://localhost:3001/issue -H "Content-Type: application/json" -d '{"subject":"did:example:stu1","degree":"BSc"}'`
- Anchor credential (replace `<anchorHash>` from issue response):
   - `curl -s -X POST http://localhost:3001/anchor -H "Content-Type: application/json" -d '{"anchorHash":"<anchorHash>","credentialId":"cred-001"}'`
- Check status:
   - `curl -s http://localhost:3001/status/<anchorHash>`

If the Hardhat node crashes with a libuv assertion on Windows, close all terminals and retry in a fresh PowerShell session; if it persists, reboot or use Docker/WSL2.

