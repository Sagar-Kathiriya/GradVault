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

## Next Immediate Tasks
- Implement `CredentialAnchor` contract and its tests.
- Scaffold issuer backend and add tooling (`hardhat`, `ethers`).

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
