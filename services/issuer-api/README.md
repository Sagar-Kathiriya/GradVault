Issuer API

This is a minimal issuer backend used for local development. It demonstrates:
- issuing a simple credential JSON payload
- computing an anchor hash for the credential
- anchoring the hash on-chain using the `CredentialAnchor` contract

Quickstart

1) Start a local Hardhat node in the repo root:

```powershell
npx hardhat node
```

2) Deploy the contract to the local node (new terminal):

```powershell
npx hardhat run --network localhost scripts/deploy.js
```

Copy the printed contract address into `services/issuer-api/.env` as `CONTRACT_ADDRESS`.

3) Create `.env` (copy `.env.example`) and set `PRIVATE_KEY` to one of the accounts printed by `npx hardhat node` (the private key, without 0x).

4) Install dependencies and start the API:

```powershell
cd services/issuer-api
npm install
npm start
```

5) Issue and anchor a credential (example using curl):

```powershell
# create a credential and get anchor hash
curl -X POST http://localhost:3001/issue -H "Content-Type: application/json" -d '{"subject":"did:example:stu1","degree":"BSc"}'

# anchor the credential (replace anchorHash from response)
curl -X POST http://localhost:3001/anchor -H "Content-Type: application/json" -d '{"anchorHash":"0x...","credentialId":"cred-123"}'
```

Notes

- This is a demo scaffold. In production you must sign credentials (JWT or linked-data proofs), authenticate issuer actions, and securely manage keys.
