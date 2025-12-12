# GradVault Demo: Step-by-Step Guide

This guide documents the full workflow for deploying, issuing, anchoring, verifying, and revoking credentials on your local Hardhat blockchain. You can copy and paste these commands during your demo.

---

## 1. Start the Local Hardhat Node
Open a terminal and run:
```
npx hardhat node
```
Leave this terminal open and running.

---

## 2. Deploy Contracts
Open a second terminal and run:
```
npx hardhat run scripts/deploy.js --network localhost
```
Note the output contract addresses (IssuerRegistry and CredentialAnchor).

---

## 3. Register an Issuer
Replace `<REGISTRY_ADDRESS>` with the IssuerRegistry address from the previous step:
```
$env:REGISTRY_ADDRESS='<REGISTRY_ADDRESS>'; npx hardhat run scripts/register-issuer.js --network localhost
```

---

## 4. Anchor a Credential
Replace `<CONTRACT_ADDRESS>` with the CredentialAnchor address from deployment:
```
$env:CONTRACT_ADDRESS='<CONTRACT_ADDRESS>'; $env:ANCHOR_INPUT='test-credential'; npx hardhat run scripts/anchor-example.js --network localhost
```

---

## 5. Verify the Credential Anchor
Replace `<CONTRACT_ADDRESS>` and `<ANCHOR_HASH>` with the correct values (the anchor hash is output from the previous step):
```
$env:CONTRACT_ADDRESS='<CONTRACT_ADDRESS>'; $env:ANCHOR_HASH='<ANCHOR_HASH>'; npx hardhat run scripts/verify-anchor.js --network localhost
```

---

## 6. Revoke the Credential
```
$env:CONTRACT_ADDRESS='<CONTRACT_ADDRESS>'; $env:ANCHOR_HASH='<ANCHOR_HASH>'; npx hardhat run scripts/revoke-anchor.js --network localhost
```

---

## 7. Verify Revocation
```
$env:CONTRACT_ADDRESS='<CONTRACT_ADDRESS>'; $env:ANCHOR_HASH='<ANCHOR_HASH>'; npx hardhat run scripts/verify-anchor.js --network localhost
```

---

## Notes
- Always keep the node terminal open while running commands in the second terminal.
- Replace placeholder values with your actual contract addresses and anchor hash.
- Ignore any "Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)" errors—they do not affect the workflow.

---

Demo ready! Copy and paste each command as needed during your presentation.
